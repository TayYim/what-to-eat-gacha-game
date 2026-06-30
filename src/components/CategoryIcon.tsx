import {
  Beef,
  CircleDot,
  Coffee,
  Flame,
  Leaf,
  Pizza,
  Sandwich,
  Soup,
  Sparkles,
  Utensils,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  beef: Beef,
  bolt: Sparkles,
  card: CircleDot,
  coffee: Coffee,
  flame: Flame,
  fork: Utensils,
  grill: Beef,
  leaf: Leaf,
  noodle: Soup,
  rice: Utensils,
  spark: Sparkles,
  ticket: Sandwich,
};

interface CategoryIconProps {
  icon: string;
}

export function CategoryIcon({ icon }: CategoryIconProps) {
  const Icon = icons[icon] ?? Pizza;
  return <Icon aria-hidden="true" />;
}
