import { fallbackCategoryColor } from '../../lib/categoryVisuals'

interface BadgeCategory {
  name: string
  icon?: string | null
  color?: string | null
}

export function CategoryBadge({ category, size = 32 }: { category: BadgeCategory; size?: number }) {
  const bg = category.color || fallbackCategoryColor(category.name)
  return (
    <span
      className="inline-flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.5 }}
    >
      {category.icon || category.name.charAt(0).toUpperCase()}
    </span>
  )
}
