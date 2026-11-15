import { cn } from '../../utils/cn.ts';
import { getTagColor } from '../../utils/tagColors.ts';

export function TagPill({ name }: { name: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium',
        getTagColor(name).pill,
      )}
    >
      {name}
    </span>
  );
}
