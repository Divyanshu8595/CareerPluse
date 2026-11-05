import React from 'react';
import { Calendar, AlertTriangle, X, Check } from 'lucide-react';

export interface PendingCalendarAction {
  type: 'create_single' | 'sync_all' | 'delete_event';
  title: string;
  description: string;
  items?: string[];
  onConfirm: () => Promise<void>;
}

interface CalendarSyncConfirmModalProps {
  action: PendingCalendarAction | null;
  isBusy: boolean;
  onClose: () => void;
}

export const CalendarSyncConfirmModal: React.FC<CalendarSyncConfirmModalProps> = ({
  action,
  isBusy,
  onClose,
}) => {
  if (!action) return null;

  const isDestructive = action.type === 'delete_event';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-confirm-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* 4-color architectural top bar */}
        <div className="grid grid-cols-4 h-1.5">
          <div className="bg-[#2563EB]" />
          <div className="bg-[#DC2626]" />
          <div className="bg-[#EAB308]" />
          <div className="bg-[#16A34A]" />
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border ${
                  isDestructive
                    ? 'bg-red-50 border-red-200 text-[#DC2626] dark:bg-red-950/40 dark:border-red-900/60'
                    : 'bg-blue-50 border-blue-200 text-[#2563EB] dark:bg-blue-950/40 dark:border-blue-900/60'
                }`}
              >
                {isDestructive ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Calendar className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3
                  id="calendar-confirm-title"
                  className="text-base font-serif font-bold text-slate-900 dark:text-slate-100"
                >
                  {action.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Google Calendar API Confirmation
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              aria-label="Close confirmation dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {action.description}
          </p>

          {action.items && action.items.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 max-h-40 overflow-y-auto space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Affected Calendar Entries ({action.items.length}):
              </div>
              <ul className="space-y-1 text-xs text-slate-800 dark:text-slate-200 font-medium">
                {action.items.map((item, idx) => (
                  <li key={idx} className="truncate">
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={async () => {
                await action.onConfirm();
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg text-white flex items-center gap-1.5 shadow-2xs transition-colors ${
                isDestructive
                  ? 'bg-[#DC2626] hover:bg-red-700'
                  : 'bg-[#2563EB] hover:bg-blue-700'
              } disabled:opacity-60`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>
                {isBusy
                  ? 'Updating Calendar...'
                  : isDestructive
                  ? 'Confirm Delete'
                  : 'Confirm & Sync'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
