import React, { useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Bookmark, ExternalLink } from 'lucide-react-native';

import { colors, radius, spacing, textStyle } from '@uchimise/tokens';
import {
  BottomSheet,
  Button,
  Chip,
  Divider,
  Icon,
  IconButton,
  ListRow,
  PhaseBanner,
  SkeletonLoader,
  Tag,
  Toast,
  useTheme,
} from '@uchimise/ui';

import { useRecipe } from '../../src/hooks/useRecipe';
import { useAddToMeal } from '../../src/hooks/useAddToMeal';
import {
  getCurrentMealSlot,
  getMealSlotLabel,
  MEAL_SLOTS,
  toDateString,
  type MealSlot,
} from '../../src/hooks/useMealPlans';

// ─── Types ───────────────────────────────────────────────────────────────────

/** ingredientName → 選択した代替食材 (null = "省く") */
type Substitutions = Record<string, string | null>;

// ─── Utilities ───────────────────────────────────────────────────────────────

/** 正規表現の特殊文字をエスケープ */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 手順テキスト内の代替済み食材名を Ochre でハイライトする。
 * 元の食材名にマッチした箇所を着色 Text に置換して返す。
 */
function renderStepText(
  text: string,
  substitutions: Substitutions,
  defaultColor: string,
): React.ReactNode {
  const names = Object.keys(substitutions);
  if (names.length === 0) {
    return <Text style={[textStyle.body, { color: defaultColor, flex: 1 }]}>{text}</Text>;
  }

  const pattern = new RegExp(`(${names.map(escapeRegex).join('|')})`, 'g');
  const parts = text.split(pattern);

  return (
    <Text style={[textStyle.body, { color: defaultColor, flex: 1 }]}>
      {parts.map((part, i) =>
        names.includes(part) ? (
          <Text key={i} style={{ color: colors.ochre }}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        ),
      )}
    </Text>
  );
}

// ─── HeroImage ───────────────────────────────────────────────────────────────

interface HeroImageProps {
  thumbnailUrl: string | null;
  title: string;
  cookTimeMinutes: number | null;
  creatorName: string | null;
  isSaved: boolean;
  onBack: () => void;
  onBookmark: () => void;
}

function HeroImage({
  thumbnailUrl,
  title,
  cookTimeMinutes,
  creatorName,
  isSaved,
  onBack,
  onBookmark,
}: HeroImageProps) {
  return (
    <View style={heroStyles.container}>
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={heroStyles.image} resizeMode="cover" />
      ) : (
        <View style={[heroStyles.image, { backgroundColor: colors.ivory }]}>
          <Text style={{ fontSize: 48 }}>🍳</Text>
        </View>
      )}

      {/* 下部スクリム（グラデーション代わり） */}
      <View style={heroStyles.scrim} />

      {/* 上部ボタン行 */}
      <View style={heroStyles.topRow}>
        {/* 左上: 戻るボタン（26×26px・rgba(42,22,0,0.65)） */}
        <Pressable
          style={heroStyles.overlayButton}
          onPress={onBack}
          accessibilityLabel="戻る"
          accessibilityRole="button"
        >
          <Icon as={ArrowLeft} size={16} color={colors.cream} strokeWidth={2} />
        </Pressable>

        {/* 右上: ブックマークボタン（26×26px・アイコンのみ・テキストなし） */}
        <Pressable
          style={heroStyles.overlayButton}
          onPress={onBookmark}
          accessibilityLabel={isSaved ? '棚から取り出す' : '棚に保存する'}
          accessibilityRole="button"
        >
          <Icon
            as={Bookmark}
            size={16}
            color={colors.cream}
            strokeWidth={isSaved ? 2.5 : 1.5}
          />
        </Pressable>
      </View>

      {/* 下部メタ情報（スクリム上） */}
      <View style={heroStyles.meta}>
        <Text style={heroStyles.title} numberOfLines={2}>
          {title}
        </Text>
        {(cookTimeMinutes != null || creatorName) && (
          <Text style={heroStyles.sub}>
            {[cookTimeMinutes ? `${cookTimeMinutes}分` : null, creatorName]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        )}
      </View>
    </View>
  );
}

const HERO_HEIGHT = 160;
const OVERLAY_BUTTON_SIZE = 26;

const heroStyles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42,22,0,0.45)',
  },
  topRow: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overlayButton: {
    width: OVERLAY_BUTTON_SIZE,
    height: OVERLAY_BUTTON_SIZE,
    borderRadius: OVERLAY_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(42,22,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  title: {
    ...textStyle.label,
    fontWeight: '500',
    fontSize: 13,
    color: colors.cream,
  },
  sub: {
    ...textStyle.micro,
    fontSize: 9,
    color: colors.honey,
    marginTop: 2,
  },
});

// ─── IngredientRow ───────────────────────────────────────────────────────────

interface IngredientRowProps {
  name: string;
  amount?: string;
  unit?: string;
  alternatives?: string[];
  isActive: boolean;
  selectedAlt?: string | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelectAlt: (alt: string | null) => void;
  onDeselectAlt: () => void;
  showDivider: boolean;
}

function IngredientRow({
  name,
  amount,
  unit,
  alternatives,
  isActive,
  selectedAlt,
  isExpanded,
  onToggleExpand,
  onSelectAlt,
  onDeselectAlt,
  showDivider,
}: IngredientRowProps) {
  const theme = useTheme();
  const hasAlternatives = alternatives && alternatives.length > 0;

  const displayName =
    isActive && selectedAlt != null
      ? selectedAlt
      : name;

  return (
    <View>
      {/* メイン行: 食材名（左）/ 分量（右）/ 「ない」ボタン（右端） */}
      <View style={ingStyles.row}>
        <Text
          style={[
            textStyle.body,
            ingStyles.name,
            { color: isActive ? colors.ochre : theme.label },
          ]}
          numberOfLines={1}
        >
          {displayName}
        </Text>

        <Text style={[textStyle.num, ingStyles.amount, { color: theme.labelSecondary }]}>
          {amount ?? ''}{unit ?? ''}
        </Text>

        {/* 「ない」ボタン */}
        {/* 通常: #888780文字・D3D1C7枠線・白背景 */}
        {/* アクティブ: Ochre文字・Ochre枠線・Cream背景 */}
        <Pressable
          onPress={onToggleExpand}
          style={[
            ingStyles.naiButton,
            isActive
              ? { borderColor: colors.ochre, backgroundColor: colors.cream }
              : { borderColor: '#D3D1C7', backgroundColor: '#FFFFFF' },
          ]}
          accessibilityLabel={`${name}がない場合の代替を見る`}
          accessibilityRole="button"
        >
          <Text
            style={[
              ingStyles.naiLabel,
              { color: isActive ? colors.ochre : '#888780' },
            ]}
          >
            ない
          </Text>
        </Pressable>
      </View>

      {/* 代替案ブロック: Cream背景・Honey枠線・border-radius 7px */}
      {isExpanded && (
        <View style={ingStyles.altBlock}>
          {hasAlternatives ? (
            <>
              <Text style={[textStyle.bodySm, { color: colors.walnut, marginBottom: spacing.xs }]}>
                代わりに使えるもの
              </Text>
              <View style={ingStyles.chipRow}>
                <Chip
                  label="省く"
                  selected={isActive && selectedAlt === null}
                  onPress={() => {
                    if (isActive && selectedAlt === null) {
                      onDeselectAlt();
                    } else {
                      onSelectAlt(null);
                    }
                  }}
                />
                {alternatives.map((alt) => (
                  <Chip
                    key={alt}
                    label={alt}
                    selected={selectedAlt === alt}
                    onPress={() => {
                      if (selectedAlt === alt) {
                        onDeselectAlt();
                      } else {
                        onSelectAlt(alt);
                      }
                    }}
                  />
                ))}
              </View>
            </>
          ) : (
            <Text style={[textStyle.bodySm, { color: colors.mist }]}>
              代替案を確認しています…
            </Text>
          )}
        </View>
      )}

      {showDivider && <Divider inset={spacing.md} />}
    </View>
  );
}

const ingStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  name: {
    flex: 1,
  },
  amount: {
    marginLeft: spacing.sm,
    marginRight: spacing.md,
  },
  naiButton: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 40,
    alignItems: 'center',
  },
  naiLabel: {
    ...textStyle.labelSm,
    fontWeight: '500',
  },
  altBlock: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.cream,
    borderWidth: 0.5,
    borderColor: colors.honey,
    borderRadius: 7,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});

// ─── MealSlotSheet ───────────────────────────────────────────────────────────

interface MealSlotSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectSlot: (slot: MealSlot) => void;
  isPending: boolean;
}

function MealSlotSheet({ visible, onClose, onSelectSlot, isPending }: MealSlotSheetProps) {
  const currentSlot = getCurrentMealSlot();
  const orderedSlots: MealSlot[] = [
    currentSlot,
    ...MEAL_SLOTS.filter((s) => s !== currentSlot),
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="今日のどの食事に入れますか。">
      <View style={slotSheetStyles.content}>
        {orderedSlots.map((slot, idx) => (
          <ListRow
            key={slot}
            title={getMealSlotLabel(slot)}
            trailing="chevron"
            onPress={() => onSelectSlot(slot)}
            showDivider={idx < orderedSlots.length - 1}
          />
        ))}
        <View style={slotSheetStyles.cancelRow}>
          <Button label="やめておく" variant="secondary" onPress={onClose} disabled={isPending} />
        </View>
      </View>
    </BottomSheet>
  );
}

const slotSheetStyles = StyleSheet.create({
  content: {
    paddingBottom: spacing.md,
  },
  cancelRow: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
});

// ─── RecipeDetailScreen ──────────────────────────────────────────────────────

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  // Data
  const { data: recipe, isLoading, isError } = useRecipe(id ?? '');
  const addToMeal = useAddToMeal();

  // State: 代替食材
  const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(new Set());
  const [substitutions, setSubstitutions] = useState<Substitutions>({});

  // State: BottomSheet / Toast
  const [mealSheetVisible, setMealSheetVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'positive' | 'negative'>('positive');

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleToggleExpand(name: string) {
    setExpandedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  function handleSelectAlt(ingredientName: string, alt: string | null) {
    setSubstitutions((prev) => ({ ...prev, [ingredientName]: alt }));
  }

  function handleDeselectAlt(ingredientName: string) {
    setSubstitutions((prev) => {
      const next = { ...prev };
      delete next[ingredientName];
      return next;
    });
  }

  function handleCook() {
    if (!recipe) return;
    router.push(`/cooking/${recipe.id}`);
  }

  function handleBookmark() {
    // TODO: 棚に保存 / 取り出し のトグル実装（useToggleSave hook）
    // 暫定: 献立シートを開く
    setMealSheetVisible(true);
  }

  function handleAddToSlot(slot: MealSlot) {
    if (!recipe) return;
    const today = toDateString();

    addToMeal.mutate(
      { recipeId: recipe.id, plannedDate: today, mealSlot: slot },
      {
        onSuccess: () => {
          setMealSheetVisible(false);
          setToastMessage(`「${getMealSlotLabel(slot)}」の献立に加えました。`);
          setToastVariant('positive');
          setToastVisible(true);
        },
        onError: (err: Error & { status?: number }) => {
          setMealSheetVisible(false);
          if (err.message?.includes('409') || err.status === 409) {
            setToastMessage('その食事にはすでにレシピが入っています。');
          } else {
            setToastMessage('うまく保存できませんでした。もう一度試してみてください。');
          }
          setToastVariant('negative');
          setToastVisible(true);
        },
      },
    );
  }

  async function handleShare() {
    if (!recipe) return;
    try {
      await Share.share({ url: recipe.source_url, message: recipe.title });
    } catch {
      // ユーザーがキャンセルした場合は何もしない
    }
  }

  function handleOpenVideo() {
    if (!recipe) return;
    Linking.openURL(recipe.source_url);
  }

  // ── Loading state ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
        <SkeletonLoader height={HERO_HEIGHT} width="100%" />
        <View style={styles.loadingBody}>
          <SkeletonLoader height={16} width="60%" />
          <SkeletonLoader height={14} width="40%" style={{ marginTop: spacing.sm }} />
          <SkeletonLoader height={120} width="100%" style={{ marginTop: spacing.lg }} />
          <SkeletonLoader height={14} width="50%" style={{ marginTop: spacing.lg }} />
          <SkeletonLoader height={60} width="100%" style={{ marginTop: spacing.sm }} />
          <SkeletonLoader height={60} width="100%" style={{ marginTop: spacing.sm }} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────

  if (isError || !recipe) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
        <View style={styles.errorContainer}>
          <Text style={[textStyle.body, { color: theme.labelTertiary, textAlign: 'center' }]}>
            うまく読み込めませんでした。もう一度試してみてください。
          </Text>
          <Button label="戻る" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────

  const ingredients = recipe.ingredients;
  const steps = recipe.steps;

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ヒーロー写真（160px・フルブリード） */}
        <HeroImage
          thumbnailUrl={recipe.thumbnail_url}
          title={recipe.title}
          cookTimeMinutes={recipe.cook_time_minutes}
          creatorName={recipe.creator_name}
          isSaved
          onBack={() => router.back()}
          onBookmark={handleBookmark}
        />

        {/* Phase 2 処理中バナー */}
        <PhaseBanner visible={recipe.extraction_status === 'pending'} />

        <View style={styles.body}>
          {/* タグ行 */}
          {(recipe.tags.length > 0 || recipe.extraction_status === 'pending') && (
            <View style={styles.tagsRow}>
              <Tag label={recipe.source_type === 'youtube' ? 'YouTube' : 'Instagram'} variant="source" />
              {recipe.extraction_status === 'pending' && (
                <Tag label="未確認" variant="unconfirmed" />
              )}
              {recipe.tags.map((tag) => (
                <Tag key={tag} label={tag} variant="time" />
              ))}
            </View>
          )}

          {/* 材料リスト */}
          <Text style={[textStyle.titleSm, { color: theme.label }]}>材料</Text>
          <View style={[styles.ingredientsCard, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            {ingredients.map((ing, idx) => (
              <IngredientRow
                key={`${ing.name}-${idx}`}
                name={ing.name}
                amount={ing.amount}
                unit={ing.unit}
                alternatives={ing.alternatives}
                isActive={ing.name in substitutions}
                selectedAlt={substitutions[ing.name]}
                isExpanded={expandedIngredients.has(ing.name)}
                onToggleExpand={() => handleToggleExpand(ing.name)}
                onSelectAlt={(alt) => handleSelectAlt(ing.name, alt)}
                onDeselectAlt={() => handleDeselectAlt(ing.name)}
                showDivider={idx < ingredients.length - 1}
              />
            ))}
          </View>

          {/* 手順リスト: 番号バッジ（Espresso丸・Cream数字）+ テキスト */}
          <Text style={[textStyle.titleSm, { color: theme.label }]}>手順</Text>
          {steps.map((step) => (
            <View key={step.order} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{step.order}</Text>
              </View>
              {renderStepText(step.text, substitutions, theme.label)}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 下部固定エリア: [🔗アイコン] [動画で見る] [調理する] */}
      <SafeAreaView style={[styles.footer, { backgroundColor: theme.bgNav, borderTopColor: theme.border }]}>
        <View style={styles.footerRow}>
          <IconButton
            icon={<Icon as={ExternalLink} size="sm" color="tint" />}
            onPress={handleShare}
            size="lg"
            variant="tinted"
            accessibilityLabel="レシピを共有する"
          />
          <View style={styles.footerBtnFlex1}>
            <Button label="動画で見る" variant="secondary" onPress={handleOpenVideo} />
          </View>
          <View style={styles.footerBtnFlex2}>
            <Button label="調理する" onPress={handleCook} />
          </View>
        </View>
      </SafeAreaView>

      {/* 献立スロット選択シート */}
      <MealSlotSheet
        visible={mealSheetVisible}
        onClose={() => setMealSheetVisible(false)}
        onSelectSlot={handleAddToSlot}
        isPending={addToMeal.isPending}
      />

      {/* フィードバック Toast */}
      <Toast
        message={toastMessage}
        variant={toastVariant}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  body: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  ingredientsCard: {
    borderRadius: radius.md,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.espresso,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  stepBadgeText: {
    ...textStyle.micro,
    color: colors.cream,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0.5,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerBtnFlex1: { flex: 1 },
  footerBtnFlex2: { flex: 2 },
  loadingBody: {
    padding: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
  },
});
