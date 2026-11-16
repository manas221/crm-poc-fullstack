import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button } from '../../../../components/Button';
import { EmptyValue } from '../../../../components/EmptyValue';
import type { Contact } from '../../../../types/api.ts';
import { formatDateTime } from '../../../../utils/format.ts';
import { CONTACT_FIELD_CONFIG, DETAIL_VIEW_TEXT } from '../../contactsDetailView.constants.ts';
import type { ConflictRow } from '../../contactsDetailView.types.ts';

const TEXT = DETAIL_VIEW_TEXT.CONFLICT;

interface ConflictDialogProps {
  /** The contact as someone else saved it (from the 409). The dialog is open while set. */
  current: Contact | null;
  rows: ConflictRow[];
  isApplying: boolean;
  /** Back to the form, edits kept. */
  onCancel: () => void;
  /** Discard my edits, show theirs. */
  onReload: () => void;
  /** Save my changed fields on top of theirs. */
  onApply: () => void;
}

/** Mockup D6: someone saved this contact while you were editing it (409 VERSION_CONFLICT). */
export function ConflictDialog({ current, rows, isApplying, onCancel, onReload, onApply }: ConflictDialogProps) {
  return (
    <Dialog open={current !== null} onClose={onCancel} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-gray-900/40" />
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
        {current && (
          <DialogPanel className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="space-y-4 p-6">
              <DialogTitle className="text-lg font-semibold text-gray-900">{TEXT.TITLE}</DialogTitle>
              <p className="text-sm text-gray-600">
                {TEXT.DESCRIPTION(formatDateTime(current.updatedAt))}{' '}
                {rows.length > 0 ? TEXT.FIELDS_DIFFER : TEXT.NO_DIFFERENCES}
              </p>

              {rows.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th scope="col" className="px-4 py-2.5 font-semibold">
                          {TEXT.FIELD}
                        </th>
                        <th scope="col" className="px-4 py-2.5 font-semibold">
                          {TEXT.YOUR_CHANGE}
                        </th>
                        <th scope="col" className="px-4 py-2.5 font-semibold">
                          {TEXT.CURRENT_VALUE}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.map(({ field, yours, current: theirs }) => (
                        <tr key={field}>
                          <th scope="row" className="px-4 py-3 font-normal text-gray-600">
                            {CONTACT_FIELD_CONFIG[field].label}
                          </th>
                          <td className="px-4 py-3 font-medium break-all text-gray-900">{yours ?? <EmptyValue />}</td>
                          <td className="px-4 py-3 break-all text-gray-900">{theirs ?? <EmptyValue />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-sm text-gray-600">{TEXT.EXPLANATION}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-xl border-t border-gray-200 px-6 py-4">
              <Button variant="ghost" onClick={onCancel} disabled={isApplying}>
                {TEXT.CANCEL}
              </Button>
              <div className="flex flex-wrap gap-3">
                <Button onClick={onReload} disabled={isApplying}>
                  {TEXT.RELOAD}
                </Button>
                <Button variant="primary" onClick={onApply} disabled={isApplying}>
                  {isApplying ? TEXT.APPLYING : TEXT.APPLY}
                </Button>
              </div>
            </div>
          </DialogPanel>
        )}
      </div>
    </Dialog>
  );
}
