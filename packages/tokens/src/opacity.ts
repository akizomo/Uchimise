/**
 * Opacity tokens
 * disabled / pressed / inactive 等の透明度を一元管理する。
 */
export const opacity = {
  disabled: 0.4,  // Button・TextInput・Switch 無効状態
  pressed:  0.5,  // アクションアイテムの押下フィードバック
  inactive: 0.4,  // ナビゲーション非アクティブ（opacity で表現する場合）
} as const;

export type OpacityToken = keyof typeof opacity;
