import React, { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, Share2 } from 'lucide-react-native';

import { colors, radius, spacing, textStyle } from '@uchimise/tokens';
import {
  ActivityIndicator,
  BottomSheet,
  Button,
  Chip,
  Divider,
  Icon,
  ListRow,
  Tag,
  Toast,
  useTheme,
} from '@uchimise/ui';

import { useDeleteRecipe, useRecipe, useRetryPhase2 } from '../../src/hooks/useRecipe';
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

const WEEK_DAYS_SHORT = ['日', '月', '火', '水', '木', '金', '土'];

function getUpcomingDates(count = 7) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      dateStr: toDateString(d),
      shortLabel: i === 0 ? '今日' : i === 1 ? '明日' : WEEK_DAYS_SHORT[d.getDay()],
      dayNum: d.getDate(),
    };
  });
}

/** 正規表現の特殊文字をエスケープ */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 手順テキスト内の代替済み食材名を Ochre でハイライトする。
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
  onBack: () => void;
}

function HeroImage({ thumbnailUrl, onBack }: HeroImageProps) {
  return (
    <View style={heroStyles.container}>
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={heroStyles.image} resizeMode="cover" />
      ) : (
        <View style={[heroStyles.image, { backgroundColor: colors.ivory, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ fontSize: 48 }}>🍳</Text>
        </View>
      )}

      {/* 戻るボタンのみ — ブックマークはタイトル下のアクション行へ */}
      <View style={heroStyles.topRow}>
        <Pressable
          style={heroStyles.overlayButton}
          onPress={onBack}
          accessibilityLabel="戻る"
          accessibilityRole="button"
        >
          <Icon as={ArrowLeft} size={16} color={colors.cream} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

const HERO_HEIGHT = 200;
const OVERLAY_BUTTON_SIZE = 32;
const STATUS_BAR_HEIGHT =
  Platform.OS === 'ios' ? (StatusBar.currentHeight ?? 44) : (StatusBar.currentHeight ?? 0);

const heroStyles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT + STATUS_BAR_HEIGHT,
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  topRow: {
    position: 'absolute',
    top: STATUS_BAR_HEIGHT + spacing.sm,
    left: spacing.md,
  },
  overlayButton: {
    width: OVERLAY_BUTTON_SIZE,
    height: OVERLAY_BUTTON_SIZE,
    borderRadius: OVERLAY_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(42,22,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── ActionItem ───────────────────────────────────────────────────────────────

interface ActionItemProps {
  iconNode: React.ReactNode;
  label: string;
  onPress: () => void;
}

function ActionItem({ iconNode, label, onPress }: ActionItemProps) {
  const theme = useTheme();
  return (
    <Pressable style={actionStyles.item} onPress={onPress} accessibilityRole="button">
      <View style={[actionStyles.iconWrap, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
        {iconNode}
      </View>
      <Text style={[actionStyles.label, { color: theme.labelSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const actionStyles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...textStyle.micro,
    textAlign: 'center',
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

  const displayName = isActive && selectedAlt != null ? selectedAlt : name;

  return (
    <View>
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

        <Pressable
          onPress={onToggleExpand}
          style={[
            ingStyles.naiButton,
            isActive
              ? { borderColor: colors.ochre, backgroundColor: colors.cream }
              : { borderColor: colors.linen, backgroundColor: colors.ivory },
          ]}
          accessibilityLabel={`${name}がない場合の代替を見る`}
          accessibilityRole="button"
        >
          <Text style={[ingStyles.naiLabel, { color: isActive ? colors.ochre : colors.mist }]}>
            ない
          </Text>
        </Pressable>
      </View>

      {isExpanded && (
        <View style={ingStyles.altBlock}>
          {/* alternatives === undefined: Phase 2 未取得（旧データ or pending） */}
          {alternatives === undefined ? (
            <Text style={[textStyle.bodySm, { color: colors.mist }]}>
              代替案を確認しています…
            </Text>
          ) : (
            <>
              {hasAlternatives && (
                <Text style={[textStyle.bodySm, { color: colors.walnut, marginBottom: spacing.xs }]}>
                  代わりに使えるもの
                </Text>
              )}
              <View style={ingStyles.chipRow}>
                {/* 省く（代替なしでも常に表示） */}
                <Chip
                  label="省く"
                  selected={isActive && selectedAlt === null}
                  onPress={() => {
                    if (isActive && selectedAlt === null) onDeselectAlt();
                    else onSelectAlt(null);
                  }}
                />
                {alternatives.map((alt) => (
                  <Chip
                    key={alt}
                    label={alt}
                    selected={selectedAlt === alt}
                    onPress={() => {
                      if (selectedAlt === alt) onDeselectAlt();
                      else onSelectAlt(alt);
                    }}
                  />
                ))}
              </View>
            </>
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
  name: { flex: 1 },
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
    borderRadius: radius.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});

// ─── DateSlotSheet ───────────────────────────────────────────────────────────

interface DateSlotSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: string, slot: MealSlot) => void;
  isPending: boolean;
}

function DateSlotSheet({ visible, onClose, onConfirm, isPending }: DateSlotSheetProps) {
  const theme = useTheme();
  const today = toDateString();
  const currentSlot = getCurrentMealSlot();

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>(currentSlot);

  // シートが開くたびに今日・現在の食事スロットにリセット
  useEffect(() => {
    if (visible) {
      setSelectedDate(today);
      setSelectedSlot(currentSlot);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const dates = getUpcomingDates(7);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="献立に入れる">
      <View style={dsStyles.content}>
        {/* 日付横スクロール */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={dsStyles.dateRow}
        >
          {dates.map(({ dateStr, shortLabel, dayNum }) => {
            const isSelected = selectedDate === dateStr;
            return (
              <Pressable
                key={dateStr}
                style={[
                  dsStyles.dateChip,
                  {
                    borderColor: isSelected ? colors.ochre : theme.border,
                    backgroundColor: isSelected ? colors.ochre : theme.bgSecondary,
                  },
                ]}
                onPress={() => setSelectedDate(dateStr)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={[dsStyles.dateChipLabel, { color: isSelected ? colors.cream : theme.labelSecondary }]}>
                  {shortLabel}
                </Text>
                <Text style={[dsStyles.dateChipNum, { color: isSelected ? colors.cream : theme.label }]}>
                  {dayNum}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 食事スロット */}
        <View style={dsStyles.slotRow}>
          {MEAL_SLOTS.map((slot) => {
            const isSelected = selectedSlot === slot;
            return (
              <Pressable
                key={slot}
                style={[
                  dsStyles.slotChip,
                  {
                    borderColor: isSelected ? colors.ochre : theme.border,
                    backgroundColor: isSelected ? colors.espresso : theme.bgSecondary,
                  },
                ]}
                onPress={() => setSelectedSlot(slot)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={[dsStyles.slotLabel, { color: isSelected ? colors.cream : theme.label }]}>
                  {getMealSlotLabel(slot)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* アクション */}
        <View style={dsStyles.actions}>
          <View style={dsStyles.actionsSecondary}>
            <Button label="そのままにする" variant="secondary" onPress={onClose} disabled={isPending} />
          </View>
          <View style={dsStyles.actionsPrimary}>
            <Button
              label="献立に入れる"
              onPress={() => onConfirm(selectedDate, selectedSlot)}
              isLoading={isPending}
              disabled={isPending}
            />
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}

const dsStyles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  dateRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dateChip: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 0.5,
    minWidth: 52,
    gap: 2,
  },
  dateChipLabel: {
    ...textStyle.micro,
  },
  dateChipNum: {
    ...textStyle.numSm,
    fontWeight: '600',
  },
  slotRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  slotChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 0.5,
  },
  slotLabel: {
    ...textStyle.label,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionsSecondary: { flex: 1 },
  actionsPrimary: { flex: 2 },
});

// ─── UnsaveSheet ─────────────────────────────────────────────────────────────

interface UnsaveSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

function UnsaveSheet({ visible, onClose, onConfirm, isPending }: UnsaveSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="棚から取り出しますか？">
      <View style={unsaveStyles.content}>
        <ListRow
          title="取り出す"
          trailing="none"
          onPress={onConfirm}
          destructive
          showDivider
        />
        <ListRow
          title="そのままにする"
          trailing="none"
          onPress={onClose}
        />
      </View>
    </BottomSheet>
  );
}

const unsaveStyles = StyleSheet.create({
  content: {
    paddingBottom: spacing.md,
  },
});

// ─── RecipeDetailScreen ──────────────────────────────────────────────────────

export default function RecipeDetailScreen() {
  const { id, toast: toastParam } = useLocalSearchParams<{ id: string; toast?: string }>();
  const router = useRouter();
  const theme = useTheme();

  // Data
  const { data: recipe, isLoading, isError } = useRecipe(id ?? '');
  const addToMeal = useAddToMeal();
  const deleteRecipe = useDeleteRecipe();
  const retryPhase2 = useRetryPhase2();

  // State: 代替食材
  const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(new Set());
  const [substitutions, setSubstitutions] = useState<Substitutions>({});

  // State: Sheets / Toast
  const [mealSheetVisible, setMealSheetVisible] = useState(false);
  const [unsaveSheetVisible, setUnsaveSheetVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'positive' | 'negative'>('positive');

  // already_saved パラメータ付きで遷移してきたとき、マウント後にトーストを表示
  useEffect(() => {
    if (toastParam === 'already_saved') {
      setToastMessage('このレシピはすでに棚に保存されています。');
      setToastVariant('positive');
      setToastVisible(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleToggleExpand(name: string) {
    setExpandedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
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

  function handleConfirmUnsave() {
    if (!recipe) return;
    deleteRecipe.mutate(recipe.id, {
      onSuccess: () => router.back(),
      onError: () => {
        setUnsaveSheetVisible(false);
        setToastMessage('うまく取り出せませんでした。もう一度試してみてください。');
        setToastVariant('negative');
        setToastVisible(true);
      },
    });
  }

  function handleAddToMeal(date: string, slot: MealSlot) {
    if (!recipe) return;
    addToMeal.mutate(
      { recipeId: recipe.id, plannedDate: date, mealSlot: slot },
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
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
  const isPending = recipe.extraction_status === 'pending';
  const isFailed = recipe.extraction_status === 'failed';
  const isDone = recipe.extraction_status === 'done';

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ヒーロー写真（戻るボタンのみ） */}
        <HeroImage thumbnailUrl={recipe.thumbnail_url} onBack={() => router.back()} />

        {/* タイトルエリア */}
        <View style={[styles.titleArea, { borderBottomColor: theme.border }]}>
          <Text style={[styles.recipeTitle, { color: theme.label }]}>{recipe.title}</Text>
          {(recipe.cook_time_minutes != null || recipe.creator_name) && (
            <Text style={[textStyle.bodySm, { color: theme.labelSecondary }]}>
              {[
                recipe.cook_time_minutes ? `${recipe.cook_time_minutes}分` : null,
                recipe.creator_name,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          )}

          {/* アクション行: 取り出す / 献立に追加 / シェア */}
          <View style={styles.actionRow}>
            <ActionItem
              iconNode={
                <Icon as={BookmarkCheck} size={20} color={colors.espresso} strokeWidth={1.5} />
              }
              label="取り出す"
              onPress={() => setUnsaveSheetVisible(true)}
            />
            <ActionItem
              iconNode={
                <Icon as={Calendar} size={20} color={colors.espresso} strokeWidth={1.5} />
              }
              label="献立に追加"
              onPress={() => setMealSheetVisible(true)}
            />
            <ActionItem
              iconNode={
                <Icon as={Share2} size={20} color={colors.espresso} strokeWidth={1.5} />
              }
              label="シェア"
              onPress={handleShare}
            />
          </View>
        </View>

        <View style={styles.body}>
          {/* タグ行 */}
          <View style={styles.tagsRow}>
            <Tag label={recipe.source_type === 'youtube' ? 'YouTube' : 'Instagram'} variant="source" />
            {isPending && <Tag label="未確認" variant="unconfirmed" />}
            {recipe.tags.map((tag) => (
              <Tag key={tag} label={tag} variant="time" />
            ))}
          </View>

          {/* Phase 2 処理中 → ローディング */}
          {isPending && (
            <View style={styles.phase2Loading}>
              <ActivityIndicator size="large" />
              <Text style={[textStyle.body, { color: theme.labelSecondary, textAlign: 'center' }]}>
                材料と手順を整理しています…
              </Text>
            </View>
          )}

          {/* Phase 2 失敗 → エラー + 再試行 + Phase 1 材料（あれば表示） */}
          {isFailed && (
            <>
              <View style={styles.phase2Error}>
                <Text style={[textStyle.bodySm, { color: theme.labelTertiary, textAlign: 'center' }]}>
                  材料と手順の整理に失敗しました。
                </Text>
                <Button
                  label="もう一度試す"
                  variant="secondary"
                  onPress={() => retryPhase2.mutate(recipe.id)}
                  isLoading={retryPhase2.isPending}
                  disabled={retryPhase2.isPending}
                />
              </View>
              {ingredients.length > 0 && (
                <>
                  <Text style={[textStyle.titleSm, { color: theme.label }]}>材料（確認中）</Text>
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
                </>
              )}
            </>
          )}

          {/* Phase 2 完了 → 材料・手順 */}
          {isDone && (
            <>
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

              <Text style={[textStyle.titleSm, { color: theme.label }]}>手順</Text>
              {steps.map((step) => (
                <View key={step.order} style={styles.stepRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{step.order}</Text>
                  </View>
                  {renderStepText(step.text, substitutions, theme.label)}
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* 下部固定エリア: [動画を見る] [調理する（done のみ）] */}
      <SafeAreaView style={[styles.footer, { backgroundColor: theme.bgNav, borderTopColor: theme.border }]}>
        <View style={styles.footerRow}>
          <View style={isDone ? styles.footerVideo : styles.footerVideoOnly}>
            <Button label="動画を見る" variant="secondary" onPress={handleOpenVideo} />
          </View>
          {isDone && (
            <View style={styles.footerCook}>
              <Button label="調理する" onPress={handleCook} />
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* 献立追加シート（日付＋食事スロット） */}
      <DateSlotSheet
        visible={mealSheetVisible}
        onClose={() => setMealSheetVisible(false)}
        onConfirm={handleAddToMeal}
        isPending={addToMeal.isPending}
      />

      {/* 棚から取り出す確認シート */}
      <UnsaveSheet
        visible={unsaveSheetVisible}
        onClose={() => setUnsaveSheetVisible(false)}
        onConfirm={handleConfirmUnsave}
        isPending={deleteRecipe.isPending}
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

  // タイトルエリア
  titleArea: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 0.5,
    gap: spacing.xs,
  },
  recipeTitle: {
    ...textStyle.title,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },

  // 本文
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

  // Phase 2 状態
  phase2Loading: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  phase2Error: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },

  // フッター
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
    gap: spacing.sm,
  },
  footerVideo: { flex: 1 },
  footerVideoOnly: { flex: 1 },
  footerCook: { flex: 2 },

  // ローディング・エラー全画面
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
  },
});
