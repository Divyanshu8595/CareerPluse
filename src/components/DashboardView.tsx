import React from 'react';
import { useJobContext } from '../context/JobContext';
import {
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle2,
  Mail,
  Video,
  ArrowRight,
  ExternalLink,
  Plus,
  Building2,
  Sun,
  Moon,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { generateGoogleCalendarUrl } from '../utils/pureLogic';
import { ApplicationStatus } from '../types/job';
import { CompanyBadge } from './CompanyBadge';
import { GoogleSignInButton } from './GoogleSignInButton';

export const DashboardView: React.FC = () => {
  const {
    stats,
    setActiveTab,
    setIsAddModalOpen,
    setSelectedApplication,
    setEmailModalApp,
    isDarkMode,
    toggleDarkMode,
    resetToDemoData,
    googleUser,
    googleEvents,
    isSyncingCalendar,
    requestSyncInterviewToGoogle,
    requestSyncAllInterviewsToGoogle,
  } = useJobContext();

  const statusThemes: Record<
    ApplicationStatus,
    { label: string; bg: string; text: string }
  > = {
    wishlist: {
      label: 'Wishlist',
      bg: 'bg-slate-400 dark:bg-slate-600',
      text: 'text-slate-600 dark:text-slate-400',
    },
    applied: {
      label: 'Applied',
      bg: 'bg-[#2563EB]',
      text: 'text-[#2563EB] dark:text-blue-400',
    },
    screening: {
      label: 'Screening',
      bg: 'bg-[#EAB308]',
      text: 'text-[#CA8A04] dark:text-yellow-400',
    },
    technical: {
      label: 'Technical',
      bg: 'bg-[#1D4ED8]',
      text: 'text-[#1D4ED8] dark:text-blue-300',
    },
    interview: {
      label: 'Interview',
      bg: 'bg-[#DC2626]',
      text: 'text-[#DC2626] dark:text-red-400',
    },
    offer: {
      label: 'Offer',
      bg: 'bg-[#16A34A]',
      text: 'text-[#16A34A] dark:text-emerald-400',
    },
    rejected: {
      label: 'Archived',
      bg: 'bg-slate-300 dark:bg-slate-700',
      text: 'text-slate-500',
    },
    withdrawn: {
      label: 'Withdrawn',
      bg: 'bg-slate-300 dark:bg-slate-700',
      text: 'text-slate-400',
    },
  };

  const funnelStages: ApplicationStatus[] = [
    'applied',
    'screening',
    'technical',
    'interview',
    'offer',
  ];

  const maxStageCount = Math.max(
    ...funnelStages.map((st) => stats.statusBreakdown[st]),
    1
  );

  return (
    <div className="space-y-7">
      {/* Editorial & Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Career Workspace</span>
            <span aria-hidden="true">·</span>
            <span>Google Calendar Sync Ready</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Application & Interview Overview
          </h1>
        </div>

        {/* Workspace Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => resetToDemoData()}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Restore sample applications"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo</span>
          </button>

          <button
            type="button"
            onClick={toggleDarkMode}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-500" />
                <span>Dark</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Open Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row with White Surfaces & Red, Blue, Green, Yellow Top Accents */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Roles - Blue */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 border-t-3 border-t-[#2563EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Total Roles</span>
            <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-serif font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.total}
            </span>
            <span className="text-[11px] text-slate-400">tracked</span>
          </div>
        </div>

        {/* Active In Flight - Green */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 border-t-3 border-t-[#16A34A] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>In Flight</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-serif font-bold text-[#16A34A] dark:text-emerald-400 font-mono tabular-nums">
              {stats.activeCount}
            </span>
            <span className="text-[11px] text-slate-400">active</span>
          </div>
        </div>

        {/* Response Rate - Yellow */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 border-t-3 border-t-[#EAB308] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Response</span>
            <span className="text-[10px] font-mono text-[#CA8A04] dark:text-yellow-400">
              ~20% avg
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-serif font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.responseRate}%
            </span>
            <span className="text-[11px] text-slate-400">rate</span>
          </div>
        </div>

        {/* Interview Conversion - Blue */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 border-t-3 border-t-[#2563EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Interview</span>
            <Video className="w-3.5 h-3.5 text-[#2563EB]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-serif font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.interviewConversionRate}%
            </span>
            <span className="text-[11px] text-slate-400">yield</span>
          </div>
        </div>

        {/* Scheduled Interviews - Red */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 border-t-3 border-t-[#DC2626] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Interviews</span>
            <Calendar className="w-3.5 h-3.5 text-[#DC2626]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-serif font-bold text-[#DC2626] dark:text-red-400 font-mono tabular-nums">
              {stats.interviewsScheduledCount}
            </span>
            <span className="text-[11px] text-slate-400">rounds</span>
          </div>
        </div>

        {/* Offers Received - Green */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 border-t-3 border-t-[#16A34A] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Offers</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-serif font-bold text-[#16A34A] dark:text-emerald-400 font-mono tabular-nums">
              {stats.offersCount}
            </span>
            <span className="text-[11px] text-[#16A34A] dark:text-emerald-400 font-medium">
              received
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pipeline Funnel & Google Calendar Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: Pipeline Progression */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif font-bold text-slate-900 dark:text-white">
                  Pipeline Progression
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Candidate conversion velocity from application through offer
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('board')}
                className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Pipeline Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Funnel Bars in Blue, Yellow, Red, Green */}
            <div className="space-y-3.5 pt-1">
              {funnelStages.map((stage) => {
                const count = stats.statusBreakdown[stage] || 0;
                const pctOfMax = Math.round((count / maxStageCount) * 100);
                const info = statusThemes[stage];

                return (
                  <div key={stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                        {info.label}
                      </span>
                      <div className="flex items-center gap-2 font-mono tabular-nums">
                        <span className="text-[11px] text-slate-400">
                          {stats.total > 0
                            ? `${Math.round((count / stats.total) * 100)}%`
                            : '0%'}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {count}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${info.bg} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(pctOfMax, count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Combined Status Distribution Ribbon */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Stage Distribution Spectrum
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
              {(Object.keys(statusThemes) as ApplicationStatus[]).map((st) => {
                const count = stats.statusBreakdown[st] || 0;
                if (count === 0 || stats.total === 0) return null;
                const widthPct = (count / stats.total) * 100;
                return (
                  <div
                    key={st}
                    className={`${statusThemes[st].bg} h-full transition-all`}
                    style={{ width: `${widthPct}%` }}
                    title={`${statusThemes[st].label}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[11px] text-slate-500 dark:text-slate-400">
              {(Object.keys(statusThemes) as ApplicationStatus[]).map((st) => {
                const count = stats.statusBreakdown[st];
                if (count === 0) return null;
                return (
                  <div key={st} className="flex items-center gap-1">
                    <span className="text-slate-600 dark:text-slate-400">
                      {statusThemes[st].label}:
                    </span>
                    <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Scheduled Interviews + Google Calendar API Sync */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-serif font-bold text-slate-900 dark:text-white">
                  Scheduled Interviews
                </h2>
                <p className="text-xs text-slate-500">
                  {googleUser
                    ? `Connected · ${googleEvents.length} Google Calendar event(s) loaded`
                    : 'Sign in with Google to sync directly to your calendar'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline cursor-pointer"
              >
                Full Calendar
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-1 max-h-[340px] overflow-y-auto">
              {stats.upcomingInterviews.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <Video className="w-5 h-5 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  No upcoming interview rounds scheduled.
                </div>
              ) : (
                stats.upcomingInterviews.slice(0, 4).map(({ application, interview }) => {
                  const gcalUrl = generateGoogleCalendarUrl(
                    application.company,
                    application.role,
                    interview
                  );
                  const isSynced = Boolean(interview.googleCalendarEventId);

                  return (
                    <div key={interview.id} className="py-3 space-y-2 group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <CompanyBadge name={application.company} size="sm" />
                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedApplication(application)}
                              className="text-left font-serif font-bold text-slate-900 dark:text-white hover:text-[#2563EB] hover:underline text-xs transition-colors cursor-pointer"
                            >
                              {application.company} · {interview.round}
                            </button>
                            <div className="text-[11px] text-slate-500">
                              {interview.title}{' '}
                              {interview.interviewers ? `· ${interview.interviewers}` : ''}
                            </div>
                          </div>
                        </div>

                        <span className="font-mono tabular-nums text-[11px] font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                          {interview.date} · {interview.time}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pl-8">
                        {interview.locationOrLink && (
                          <a
                            href={
                              interview.locationOrLink.startsWith('http')
                                ? interview.locationOrLink
                                : `https://${interview.locationOrLink}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 hover:bg-blue-100 transition-colors"
                          >
                            <Video className="w-3 h-3" />
                            <span>Join Call</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}

                        {isSynced ? (
                          <a
                            href={interview.googleCalendarHtmlLink || gcalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-[#16A34A] dark:text-emerald-400"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Synced on Google Cal</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => requestSyncInterviewToGoogle(application, interview)}
                            disabled={isSyncingCalendar}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                            title="Create event on your primary Google Calendar via API"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Sync to Google Cal</span>
                          </button>
                        )}

                        <a
                          href={gcalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                          title="Open template in Google Calendar web"
                        >
                          <span>Template Link</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            {googleUser ? (
              <button
                type="button"
                onClick={() => requestSyncAllInterviewsToGoogle()}
                disabled={isSyncingCalendar}
                className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCalendar ? 'animate-spin' : ''}`} />
                <span>Sync All to Google Calendar</span>
              </button>
            ) : (
              <GoogleSignInButton compact />
            )}

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer"
            >
              Manage Calendar →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Follow-Up Queue & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Follow-up Queue */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#EAB308]" />
                <span>Scheduled Follow-ups</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Timely check-ins with recruiters and hiring managers
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('followups')}
              className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline cursor-pointer"
            >
              All Letters
            </button>
          </div>

          <div className="space-y-2.5">
            {stats.pendingFollowUps.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-[#16A34A]" />
                All scheduled follow-ups are up to date!
              </div>
            ) : (
              stats.pendingFollowUps
                .slice(0, 4)
                .map(({ application, isOverdue, isToday, daysDelta }) => (
                  <div
                    key={application.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-start gap-3">
                      <CompanyBadge name={application.company} size="sm" className="mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedApplication(application)}
                            className="text-xs font-serif font-bold text-slate-900 dark:text-white hover:text-[#2563EB] hover:underline cursor-pointer"
                          >
                            {application.company}
                          </button>
                          <span className="text-slate-300 dark:text-slate-600">/</span>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {application.role}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          {isOverdue && (
                            <span className="text-[11px] font-mono font-bold text-[#DC2626] dark:text-red-400">
                              {Math.abs(daysDelta)}d past due
                            </span>
                          )}
                          {isToday && (
                            <span className="text-[11px] font-mono font-bold text-[#CA8A04] dark:text-yellow-400">
                              Due Today
                            </span>
                          )}
                          {!isOverdue && !isToday && (
                            <span className="text-[11px] font-mono text-[#16A34A] dark:text-emerald-400">
                              In {daysDelta}d
                            </span>
                          )}
                        </div>
                        {application.followUp.notes && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                            {application.followUp.notes}
                          </p>
                        )}
                        <div className="text-[11px] text-slate-400">
                          {application.contact.name || 'Hiring Team'} ·{' '}
                          {application.contact.email || 'No email saved'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApplication(application);
                          setEmailModalApp({
                            application,
                            templateKey:
                              application.status === 'interview'
                                ? 'post_interview_thank_you'
                                : 'application_followup',
                          });
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors shadow-2xs cursor-pointer"
                      >
                        <span>Draft Letter</span>
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Application Deadlines */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Clock className="w-4 h-4 text-[#DC2626]" />
            <h2 className="text-base font-serif font-bold text-slate-900 dark:text-white">
              Upcoming Deadlines
            </h2>
          </div>

          <div className="space-y-2">
            {stats.upcomingDeadlines.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No immediate deadlines in the next 14 days.
              </div>
            ) : (
              stats.upcomingDeadlines.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setSelectedApplication(app)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#DC2626]/40 hover:bg-red-50/30 dark:hover:bg-red-950/20 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <CompanyBadge name={app.company} size="sm" />
                    <div>
                      <span className="text-xs font-serif font-bold text-slate-900 dark:text-white block">
                        {app.company}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-[140px]">
                        {app.role}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-[#DC2626] dark:text-red-400 font-bold">
                    {app.deadline}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
