/**
 * Z-Index tokens
 * 重なり順を一元管理する。コンポーネント内でのハードコードを禁止。
 */
export const zIndex = {
  base:    0,
  raised:  1,    // ドロップダウン・ポップオーバー
  overlay: 100,  // BottomSheet
  modal:   200,  // AlertDialog
  toast:   300,  // Toast（常に最前面）
} as const;

export type ZIndexToken = keyof typeof zIndex;
