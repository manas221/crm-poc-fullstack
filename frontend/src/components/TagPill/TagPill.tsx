import type { ReactNode } from 'react';
import { cn } from '../../utils/cn.ts';
import { getTagColor } from '../../utils/tagColors.ts';

type TagPillSize = 'sm' | 'md';

const SIZES: Record<TagPillSize, string> = {
  sm: 'gap-1 px-2 py-0.5 text-xs', // table rows
  md: 'gap-1.5 px-3 py-1 text-sm', // the contact page
};

interface TagPillProps {
  name: string;
  size?: TagPillSize;
  className?: string;
  /** After the name, e.g. a remove button or a spinner. */
  children?: ReactNode;
}

export function TagPill({ name, size = 'sm', className, children }: TagPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        SIZES[size],
        getTagColor(name).pill,
        className,
      )}
    >
      {name}
      {children}
    </span>
  );
}
