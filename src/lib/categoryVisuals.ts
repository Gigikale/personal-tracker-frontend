export const CATEGORY_ICON_OPTIONS = [
  '🍔', '🏠', '🚗', '🛒', '💡', '🎬', '🏥', '✈️', '📚', '💰', '🎁', '📱', '🐾', '☕', '👕', '🔧',
]

export const CATEGORY_COLOR_OPTIONS = [
  '#4f46e5', // brand-from
  '#5b21b6', // brand-to
  '#f59e0b', // accent-amber
  '#fb7185', // accent-coral
  '#0ea5e9', // sky
  '#10b981', // emerald
  '#ec4899', // pink
  '#64748b', // slate
]

// Categories without a chosen color still get a consistent, distinct one based on their name,
// so the category list doesn't look flat before anyone customizes anything.
export function fallbackCategoryColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return CATEGORY_COLOR_OPTIONS[Math.abs(hash) % CATEGORY_COLOR_OPTIONS.length]
}
