import { PencilIcon, TagIcon } from '../../../../components/icons';
import type { Activity } from '../../../../types/api.ts';
import { cn } from '../../../../utils/cn.ts';
import { formatDateTime } from '../../../../utils/format.ts';
import { describeActivity } from '../../contactsDetailView.helpers.ts';
import type { ActivityTone } from '../../contactsDetailView.types.ts';

// A blue tag when one was added, grey when removed, a grey pencil for an edit (mockup D1).
const TONES: Record<ActivityTone, { Icon: typeof TagIcon; className: string }> = {
  tagAdded: { Icon: TagIcon, className: 'bg-blue-50 text-blue-600' },
  tagRemoved: { Icon: TagIcon, className: 'bg-gray-100 text-gray-500' },
  updated: { Icon: PencilIcon, className: 'bg-gray-100 text-gray-500' },
};

interface ActivityItemProps {
  activity: Activity;
  /** No line down to a next entry. */
  isLast: boolean;
}

export function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const { title, detail, tone } = describeActivity(activity);
  const { Icon, className } = TONES[tone];

  return (
    <li className={cn('relative flex gap-3', !isLast && 'pb-5')}>
      {/* The timeline: a line from under this icon to the next one. */}
      {!isLast && <span aria-hidden="true" className="absolute top-9 bottom-1 left-4 w-px -translate-x-1/2 bg-gray-200" />}
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', className)}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 pt-1">
        <p className="text-sm break-words text-gray-900">
          <span className="font-semibold">{detail ? `${title}:` : title}</span>
          {detail && ` ${detail}`}
        </p>
        <time dateTime={activity.createdAt} className="text-xs text-gray-500">
          {formatDateTime(activity.createdAt)}
        </time>
      </div>
    </li>
  );
}
