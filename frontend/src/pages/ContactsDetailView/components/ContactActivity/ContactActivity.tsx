import { Button } from '../../../../components/Button';
import { AlertCircleIcon, ClockIcon } from '../../../../components/icons';
import { Skeleton } from '../../../../components/Skeleton';
import { DETAIL_VIEW_STATUS, DETAIL_VIEW_TEXT } from '../../contactsDetailView.constants.ts';
import { useContactActivity } from '../../hooks/useContactActivity.ts';
import { DetailCard } from '../DetailCard';
import { ActivityItem } from './ActivityItem.tsx';

const TEXT = DETAIL_VIEW_TEXT.ACTIVITY;
const SKELETON_WIDTHS = ['w-3/5', 'w-11/12', 'w-2/3', 'w-3/4'];

/** The "Recent activity" card: a timeline, newest first (mockups D1, D7, D9). */
export function ContactActivity({ contactId }: { contactId: number }) {
  const { feedData, handleRetry } = useContactActivity(contactId);

  return (
    <DetailCard title={DETAIL_VIEW_TEXT.SECTIONS.ACTIVITY}>
      {feedData.status === DETAIL_VIEW_STATUS.LOADING && (
        <div className="space-y-5" aria-busy="true">
          {SKELETON_WIDTHS.map((width) => (
            <div key={width} className="flex items-start gap-3">
              {/* Not <Skeleton>: its fixed h-3 would win over size-8 (cn doesn't merge classes). */}
              <div aria-hidden="true" className="size-8 shrink-0 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2 pt-1.5">
                <Skeleton className={width} />
                <Skeleton className="w-1/4" />
              </div>
            </div>
          ))}
          <p role="status" className="sr-only">
            {TEXT.LOADING}
          </p>
        </div>
      )}

      {feedData.status === DETAIL_VIEW_STATUS.ERROR && (
        <p role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-red-700">
          <span className="flex items-center gap-1.5">
            <AlertCircleIcon className="size-4 shrink-0" />
            {TEXT.LOAD_ERROR}
          </span>
          <Button variant="link" onClick={handleRetry}>
            {TEXT.RETRY}
          </Button>
        </p>
      )}

      {feedData.status === DETAIL_VIEW_STATUS.READY &&
        (feedData.activities.length > 0 ? (
          <ol>
            {feedData.activities.map((activity, index) => (
              <ActivityItem key={activity.id} activity={activity} isLast={index === feedData.activities.length - 1} />
            ))}
          </ol>
        ) : (
          // D9
          <div className="flex flex-col items-center gap-2 px-6 py-8 text-center text-sm text-gray-600">
            <ClockIcon className="size-6 text-gray-400" />
            <p className="max-w-64">{TEXT.EMPTY}</p>
          </div>
        ))}
    </DetailCard>
  );
}
