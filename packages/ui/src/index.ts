// ── Primitives ────────────────────────────────────────────────────────────────
export { Tag } from './components/primitives/Tag';
export type { TagProps, TagVariant } from './components/primitives/Tag';

export { Button } from './components/primitives/Button';
export type { ButtonProps } from './components/primitives/Button';

export { Badge } from './components/primitives/Badge';
export type { BadgeProps } from './components/primitives/Badge';

export { Divider, DIVIDER_INSET_DEFAULT } from './components/primitives/Divider';
export type { DividerProps } from './components/primitives/Divider';

export { Icon, ICON_SIZE } from './components/primitives/Icon';
export type { IconProps, IconSize, IconColor } from './components/primitives/Icon';

export { IconButton } from './components/primitives/IconButton';
export type { IconButtonProps, IconButtonSize, IconButtonVariant } from './components/primitives/IconButton';

export { TextInput } from './components/primitives/TextInput';
export type { TextInputProps } from './components/primitives/TextInput';

export { Avatar } from './components/primitives/Avatar';
export type { AvatarProps, AvatarSize } from './components/primitives/Avatar';

export { Switch } from './components/primitives/Switch';
export type { SwitchProps } from './components/primitives/Switch';

export { SegmentedControl } from './components/primitives/SegmentedControl';
export type { SegmentedControlProps } from './components/primitives/SegmentedControl';

export { SearchBar } from './components/primitives/SearchBar';
export type { SearchBarProps } from './components/primitives/SearchBar';

export { Chip } from './components/primitives/Chip';
export type { ChipProps } from './components/primitives/Chip';

export { Checkbox } from './components/primitives/Checkbox';
export type { CheckboxProps } from './components/primitives/Checkbox';

export { RadioButton, RadioGroup } from './components/primitives/RadioButton';
export type { RadioButtonProps, RadioGroupProps, RadioOption } from './components/primitives/RadioButton';

export { Stepper } from './components/primitives/Stepper';
export type { StepperProps } from './components/primitives/Stepper';

export { ProgressBar } from './components/primitives/ProgressBar';
export type { ProgressBarProps, ProgressBarVariant } from './components/primitives/ProgressBar';

export { SkeletonLoader, SkeletonText, SkeletonCard } from './components/primitives/SkeletonLoader';
export type { SkeletonLoaderProps } from './components/primitives/SkeletonLoader';

export { ActivityIndicator } from './components/primitives/ActivityIndicator';
export type { ActivityIndicatorProps, ActivityIndicatorSize } from './components/primitives/ActivityIndicator';

export { Textarea } from './components/primitives/Textarea';
export type { TextareaProps } from './components/primitives/Textarea';

// ── Composed ─────────────────────────────────────────────────────────────────
export { RecipeCard } from './components/composed/RecipeCard';
export type { RecipeCardProps } from './components/composed/RecipeCard';

export { ShopkeeperMsg } from './components/composed/ShopkeeperMsg';
export type { ShopkeeperMsgProps } from './components/composed/ShopkeeperMsg';

export { PhaseBanner } from './components/composed/PhaseBanner';
export type { PhaseBannerProps } from './components/composed/PhaseBanner';

export { CollectionCard } from './components/composed/CollectionCard';
export type { CollectionCardProps } from './components/composed/CollectionCard';

export { BottomTabBar } from './components/composed/BottomTabBar';
export type { BottomTabBarProps, TabItem } from './components/composed/BottomTabBar';

export {
  AppBar,
  TOP_APP_BAR_HEIGHT,
  TOP_APP_BAR_MEDIUM_HEIGHT,
  TOP_APP_BAR_LARGE_HEIGHT,
  TOP_APP_BAR_MEDIUM_EXPANDED,
  TOP_APP_BAR_LARGE_EXPANDED,
  APP_BAR_COMPACT_HEIGHT,
  APP_BAR_LARGE_HEIGHT,
  APP_BAR_LARGE_TITLE_HEIGHT,
} from './components/composed/AppBar';
export type { AppBarProps, AppBarAction } from './components/composed/AppBar';

/** @deprecated NavigationBar は AppBar に統合されました。AppBar を使用してください。 */
export { NavigationBar } from './components/composed/NavigationBar';
export type { NavigationBarProps } from './components/composed/NavigationBar';

export { ListRow } from './components/composed/ListRow';
export type { ListRowProps, ListRowTrailing } from './components/composed/ListRow';

export { Toast } from './components/composed/Toast';
export type { ToastProps, ToastVariant } from './components/composed/Toast';

export { EmptyState } from './components/composed/EmptyState';
export type { EmptyStateProps } from './components/composed/EmptyState';

export { BottomSheet } from './components/composed/BottomSheet';
export type { BottomSheetProps } from './components/composed/BottomSheet';

export { AlertDialog } from './components/composed/AlertDialog';
export type { AlertDialogProps } from './components/composed/AlertDialog';

// ── Hooks ─────────────────────────────────────────────────────────────────────
export { useTheme } from './hooks/useTheme';
export type { Theme } from './hooks/useTheme';

export { useReducedMotion } from './hooks/useReducedMotion';

export { useScrollHeader } from './hooks/useScrollHeader';

// ── Motion ────────────────────────────────────────────────────────────────────
export { easing, makeTimingConfig } from './motion';

// ── Context ───────────────────────────────────────────────────────────────────
export { ThemeProvider } from './context/ThemeContext';
