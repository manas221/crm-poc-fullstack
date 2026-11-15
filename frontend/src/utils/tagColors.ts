// Tags have no color column: the six seeded tags get fixed colors (matching the mockups) and
// anything else falls back to grey. Full class names are written out so Tailwind finds them.

interface TagColor {
  pill: string;
  dot: string;
}

const TAG_COLORS: Record<string, TagColor> = {
  lead: { pill: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  customer: { pill: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  vip: { pill: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  prospect: { pill: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500' },
  partner: { pill: 'bg-teal-50 text-teal-700', dot: 'bg-teal-500' },
  churned: { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
};

const FALLBACK: TagColor = { pill: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };

export function getTagColor(name: string): TagColor {
  return TAG_COLORS[name.toLowerCase()] ?? FALLBACK;
}
