import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { spacing, textStyle } from '@uchimise/tokens';
import { AlertDialog, Icon, useTheme } from '@uchimise/ui';

interface CollectionCardProps {
  name: string;
  recipeCount: number;
  onPress?: () => void;
  onDelete?: () => void;
}

export function CollectionCard({ name, recipeCount, onPress, onDelete }: CollectionCardProps) {
  const theme = useTheme();
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleLongPress = () => {
    if (!onDelete) return;
    setDialogVisible(true);
  };

  return (
    <>
      <Pressable
        onPress={onPress}
        onLongPress={handleLongPress}
        style={[styles.container, { borderBottomColor: theme.border }]}
      >
        <View style={styles.left}>
          <Text style={[styles.name, { color: theme.label }]} numberOfLines={1}>
            {name}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.count, { color: theme.labelSecondary }]}>
            {recipeCount}品
          </Text>
          <Icon as={ChevronRight} size="sm" color="tertiary" />
        </View>
      </Pressable>

      <AlertDialog
        visible={dialogVisible}
        title={`コレクション「${name}」を削除しますか？`}
        description="保存されているレシピは残ります。"
        confirmLabel="削除する"
        destructive
        onConfirm={() => {
          setDialogVisible(false);
          onDelete?.();
        }}
        onCancel={() => setDialogVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
  },
  left: {
    flex: 1,
    paddingRight: spacing.md,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...textStyle.titleSm,
  },
  count: {
    ...textStyle.labelSm,
  },
});
