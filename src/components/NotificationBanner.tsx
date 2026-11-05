import React from 'react';
import { useJobContext } from '../context/JobContext';
import { Calendar, X, ArrowUpRight, AlertCircle, Clock } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const {
    stats,
    notificationBannerDismissed,
    setNotificationBannerDismissed,
    setSelectedApplication,
    setEmailModalApp,
    setActiveTab,
  } = useJobContext();

  if (notificationBannerDismissed) return null;

  const overdue = stats.pendingFollowUps.filter((f) => f.isOverdue);
  const dueToday = stats.pendingFollowUps.filter((f) => f.isToday);
  const nextInterview = stats.upcomingInterviews[0];

  const hasUrgentActions = overdue.length > 0 || dueToday.length > 0 || nextInterview;
  if (!hasUrgentActions) return null;

  return (
    <div className="w-full bg-white dark:bg-[#111827] border-b border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 flex-1 min-w-[280px]">
          <span className="font-serif font-bold text-slate-900 dark:text-white">
            Priority Queue:
          </span>

          {overdue.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('followups')}
              className="inline-flex items-center gap-1 font-semibold text-[#DC2626] dark:text-red-400 hover:underline cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {overdue.length} follow-up{overdue.length > 1 ? 's' : ''} past due
              </span>
            </button>
          )}

          {overdue.length > 0 && dueToday.length > 0 && (
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
              ·
            </span>
          )}

          {dueToday.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('followups')}
              className="inline-flex items-center gap-1 font-semibold text-[#CA8A04] dark:text-yellow-400 hover:underline cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{dueToday.length} due today</span>
            </button>
          )}

          {nextInterview && (
            <>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                ·
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400 shrink-0" />
                <span>
                  Next interview:{' '}
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    {nextInterview.application.company}
                  </strong>{' '}
                  <span className="font-mono tabular-nums text-[11px] text-slate-500">
                    ({nextInterview.interview.date} · {nextInterview.interview.time})
                  </span>
                </span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {overdue.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const target = overdue[0].application;
                setSelectedApplication(target);
                setEmailModalApp({
                  application: target,
                  templateKey: 'application_followup',
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#DC2626] hover:bg-red-700 text-white font-semibold text-[11px] shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Draft {overdue[0].application.company} Follow-up</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setNotificationBannerDismissed(true)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
