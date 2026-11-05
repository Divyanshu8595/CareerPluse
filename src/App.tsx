import React from 'react';
import { JobProvider, useJobContext } from './context/JobContext';
import { Header } from './components/Header';
import { NotificationBanner } from './components/NotificationBanner';
import { DashboardView } from './components/DashboardView';
import { ApplicationsKanban } from './components/ApplicationsKanban';
import { ApplicationsTable } from './components/ApplicationsTable';
import { CalendarView } from './components/CalendarView';
import { FollowUpCenter } from './components/FollowUpCenter';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { ApplicationFormModal } from './components/ApplicationFormModal';
import { EmailComposerModal } from './components/EmailComposerModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { CalendarSyncConfirmModal } from './components/CalendarSyncConfirmModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    pendingCalendarAction,
    setPendingCalendarAction,
    isSyncingCalendar,
    calendarNotice,
    setCalendarNotice,
  } = useJobContext();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Architectural 4-Color Spectrum Ribbon (Blue, Red, Yellow, Green) */}
      <div className="grid grid-cols-4 h-1.5 w-full shrink-0">
        <div className="bg-[#2563EB]" />
        <div className="bg-[#DC2626]" />
        <div className="bg-[#EAB308]" />
        <div className="bg-[#16A34A]" />
      </div>

      <Header />
      <NotificationBanner />

      {/* Google Calendar API Feedback Notice */}
      {calendarNotice && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs font-medium shadow-2xs ${
              calendarNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-[#15803D] dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
                : calendarNotice.type === 'error'
                ? 'bg-red-50 border-red-200 text-[#DC2626] dark:bg-red-950/40 dark:border-red-900 dark:text-red-300'
                : 'bg-blue-50 border-blue-200 text-[#2563EB] dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {calendarNotice.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {calendarNotice.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
              {calendarNotice.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
              <span>{calendarNotice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setCalendarNotice(null)}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Dismiss calendar notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'board' && <ApplicationsKanban />}
        {activeTab === 'table' && <ApplicationsTable />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'followups' && <FollowUpCenter />}
      </main>

      {/* Global Modals */}
      <ApplicationDetailModal />
      <ApplicationFormModal />
      <EmailComposerModal />
      <DocumentPreviewModal />
      <CalendarSyncConfirmModal
        action={pendingCalendarAction}
        isBusy={isSyncingCalendar}
        onClose={() => setPendingCalendarAction(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-5 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#111827] transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="inline-grid grid-cols-2 w-3.5 h-3.5 rounded-xs overflow-hidden shrink-0">
              <span className="bg-[#2563EB]" />
              <span className="bg-[#DC2626]" />
              <span className="bg-[#EAB308]" />
              <span className="bg-[#16A34A]" />
            </div>
            <span className="font-serif font-bold text-slate-800 dark:text-slate-200">
              CareerPulse
            </span>
            <span>· Job Application & Google Calendar Workspace</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Synced with Google Calendar API · Local encrypted storage
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <JobProvider>
      <MainContent />
    </JobProvider>
  );
}
