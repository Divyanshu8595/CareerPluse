import React, { useState } from 'react';
import { useJobContext } from '../context/JobContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Video,
  Download,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { generateGoogleCalendarUrl, generateICalendar } from '../utils/pureLogic';
import { InterviewEvent, JobApplication } from '../types/job';
import { GoogleCalendarEventItem } from '../utils/googleAuth';
import { GoogleSignInButton } from './GoogleSignInButton';
import { CompanyBadge } from './CompanyBadge';

export const CalendarView: React.FC = () => {
  const {
    applications,
    setSelectedApplication,
    googleUser,
    googleEvents,
    isSyncingCalendar,
    requestSyncInterviewToGoogle,
    requestSyncAllInterviewsToGoogle,
    requestDeleteGoogleCalendarEvent,
  } = useJobContext();

  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 10, 1)); // November 2026
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    dateStr: string;
    interviews: { app: JobApplication; interview: InterviewEvent }[];
    deadlines: JobApplication[];
    followUps: JobApplication[];
    liveGoogleEvents: GoogleCalendarEventItem[];
  } | null>(null);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const allInterviewsList: { app: JobApplication; interview: InterviewEvent }[] = [];
  applications.forEach((app) => {
    app.interviews.forEach((interview) => {
      allInterviewsList.push({ app, interview });
    });
  });

  const exportAllToICS = () => {
    const formattedEvents = allInterviewsList.map(({ app, interview }) => ({
      company: app.company,
      role: app.role,
      interview,
    }));

    const icsContent = generateICalendar(formattedEvents);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interviews_${year}_${month + 1}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const calendarCells: {
    day: number;
    isCurrentMonth: boolean;
    dateStr: string;
  }[] = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarCells.push({
      day,
      isCurrentMonth: false,
      dateStr: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(
      2,
      '0'
    )}`;
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      dateStr,
    });
  }

  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(
      2,
      '0'
    )}`;
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      dateStr,
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const getGoogleEventDateStr = (ev: GoogleCalendarEventItem): string => {
    if (ev.start?.date) return ev.start.date;
    if (ev.start?.dateTime) return ev.start.dateTime.split('T')[0];
    return '';
  };

  const getGoogleEventTimeStr = (ev: GoogleCalendarEventItem): string => {
    if (ev.start?.dateTime) {
      const timePart = ev.start.dateTime.split('T')[1];
      return timePart ? timePart.substring(0, 5) : '';
    }
    return 'All day';
  };

  return (
    <div className="space-y-5">
      {/* Google Calendar Integration Banner */}
      <div className="p-4 sm:p-5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/90 dark:border-slate-800 border-t-3 border-t-[#2563EB] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#2563EB]" />
            <h1 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
              Google Calendar & Interview Schedule
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {googleUser
              ? `Signed in as ${googleUser.email}. View live Google Calendar events and push interview rounds directly.`
              : 'Connect your Google Calendar account to view live events and sync interview rounds with one click.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <GoogleSignInButton />

          {googleUser && (
            <button
              type="button"
              onClick={() => requestSyncAllInterviewsToGoogle()}
              disabled={isSyncingCalendar}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncingCalendar ? 'animate-spin' : ''}`}
              />
              <span>Sync All Interviews</span>
            </button>
          )}

          <button
            type="button"
            onClick={exportAllToICS}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Download .ics file"
          >
            <Download className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Export .ICS</span>
          </button>
        </div>
      </div>

      {/* Calendar Navigation & 4-Color Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            {monthNames[month]} {year}
          </h2>

          <button
            type="button"
            onClick={goToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* 4-Color Semantic Legend (Blue, Green, Red, Yellow) */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />
            <span>Interviews (Blue)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#16A34A]" />
            <span>Google Calendar (Green)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#DC2626]" />
            <span>Deadlines (Red)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#EAB308]" />
            <span>Follow-ups (Yellow)</span>
          </span>
        </div>
      </div>

      {/* Main Month Grid */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-center text-xs font-bold text-slate-600 dark:text-slate-300 py-2.5">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* 7-column Grid of Days */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
          {calendarCells.map((cell, idx) => {
            const dateInterviews = allInterviewsList.filter(
              (item) => item.interview.date === cell.dateStr
            );
            const dateDeadlines = applications.filter(
              (app) => app.deadline === cell.dateStr
            );
            const dateFollowUps = applications.filter(
              (app) => app.followUp?.date === cell.dateStr && !app.followUp.completed
            );
            const dateGoogleEvents = googleEvents.filter(
              (ev) => getGoogleEventDateStr(ev) === cell.dateStr
            );

            const totalEvents =
              dateInterviews.length +
              dateDeadlines.length +
              dateFollowUps.length +
              dateGoogleEvents.length;
            const isToday = cell.dateStr === todayStr;
            const hasEvents = totalEvents > 0;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (hasEvents) {
                    setSelectedDayEvents({
                      dateStr: cell.dateStr,
                      interviews: dateInterviews,
                      deadlines: dateDeadlines,
                      followUps: dateFollowUps,
                      liveGoogleEvents: dateGoogleEvents,
                    });
                  }
                }}
                className={`min-h-[112px] p-1.5 sm:p-2 transition-colors flex flex-col justify-between ${
                  cell.isCurrentMonth
                    ? 'bg-white dark:bg-[#111827]'
                    : 'bg-slate-50/60 dark:bg-[#0D1322] text-slate-400'
                } ${
                  hasEvents
                    ? 'cursor-pointer hover:bg-blue-50/30 dark:hover:bg-slate-800/60'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono tabular-nums text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      isToday
                        ? 'bg-[#2563EB] text-white font-bold'
                        : cell.isCurrentMonth
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {hasEvents && (
                    <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {totalEvents}
                    </span>
                  )}
                </div>

                {/* Event Entries */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {/* Blue: Tracked Interviews */}
                  {dateInterviews.slice(0, 2).map(({ app, interview }) => (
                    <div
                      key={interview.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApplication(app);
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 truncate hover:bg-blue-100 transition-colors"
                      title={`${interview.round} at ${app.company} (${interview.time || ''})`}
                    >
                      <span className="font-mono font-bold">{interview.time}</span>{' '}
                      {app.company}
                    </div>
                  ))}

                  {/* Green: Live Google Calendar Events */}
                  {dateGoogleEvents.slice(0, 1).map((ev) => (
                    <div
                      key={ev.id}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 truncate"
                      title={`Google Calendar: ${ev.summary}`}
                    >
                      <span className="font-mono font-bold">
                        {getGoogleEventTimeStr(ev)}
                      </span>{' '}
                      {ev.summary}
                    </div>
                  ))}

                  {/* Red: Deadlines */}
                  {dateDeadlines.slice(0, 1).map((app) => (
                    <div
                      key={app.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApplication(app);
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 dark:bg-red-950/60 text-[#DC2626] dark:text-red-300 border border-red-200/80 dark:border-red-800 truncate"
                      title={`Deadline: ${app.role} at ${app.company}`}
                    >
                      Due: {app.company}
                    </div>
                  ))}

                  {/* Yellow: Follow-ups */}
                  {dateFollowUps.slice(0, 1).map((app) => (
                    <div
                      key={app.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApplication(app);
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-50 dark:bg-yellow-950/60 text-[#CA8A04] dark:text-yellow-300 border border-yellow-200/80 dark:border-yellow-800 truncate"
                      title={`Follow-up with ${app.company}`}
                    >
                      Follow-up: {app.company}
                    </div>
                  ))}

                  {totalEvents > 2 && (
                    <div className="text-[9px] text-slate-400 font-medium pl-1">
                      +{totalEvents - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Modal */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* 4-color header bar */}
            <div className="grid grid-cols-4 h-1.5">
              <div className="bg-[#2563EB]" />
              <div className="bg-[#DC2626]" />
              <div className="bg-[#EAB308]" />
              <div className="bg-[#16A34A]" />
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-[#2563EB]" />
                    <span>Schedule for {selectedDayEvents.dateStr}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDayEvents.interviews.length} interviews ·{' '}
                    {selectedDayEvents.liveGoogleEvents.length} Google Cal ·{' '}
                    {selectedDayEvents.deadlines.length} deadlines ·{' '}
                    {selectedDayEvents.followUps.length} follow-ups
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDayEvents(null)}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {/* Tracked Interviews (Blue) */}
                {selectedDayEvents.interviews.map(({ app, interview }) => {
                  const gcal = generateGoogleCalendarUrl(app.company, app.role, interview);
                  const isSynced = Boolean(interview.googleCalendarEventId);

                  return (
                    <div
                      key={interview.id}
                      className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <CompanyBadge name={app.company} size="sm" />
                          <div>
                            <div className="font-serif font-bold text-xs text-slate-900 dark:text-white">
                              {interview.round} · {app.company}
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono tabular-nums">
                              {interview.time} ({interview.durationMinutes} min){' '}
                              {interview.interviewers ? `· ${interview.interviewers}` : ''}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#2563EB] dark:text-blue-400">
                          Interview
                        </span>
                      </div>

                      {interview.preparationNotes && (
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                          <strong>Prep:</strong> {interview.preparationNotes}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {interview.locationOrLink && (
                          <a
                            href={
                              interview.locationOrLink.startsWith('http')
                                ? interview.locationOrLink
                                : `https://${interview.locationOrLink}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#2563EB] text-white hover:bg-[#1D4ED8] flex items-center gap-1"
                          >
                            <Video className="w-3 h-3" />
                            <span>Join Call</span>
                          </a>
                        )}

                        {isSynced ? (
                          <>
                            <a
                              href={interview.googleCalendarHtmlLink || gcal}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-emerald-100 text-[#15803D] flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Synced on Google Cal</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                if (interview.googleCalendarEventId) {
                                  requestDeleteGoogleCalendarEvent(
                                    interview.googleCalendarEventId,
                                    `${interview.round}: ${app.company}`,
                                    app.id,
                                    interview.id
                                  );
                                  setSelectedDayEvents(null);
                                }
                              }}
                              className="px-2 py-1 text-[11px] font-semibold rounded-md text-[#DC2626] hover:bg-red-50 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Unsync</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              requestSyncInterviewToGoogle(app, interview);
                              setSelectedDayEvents(null);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#16A34A] text-white hover:bg-[#15803D] flex items-center gap-1 cursor-pointer"
                          >
                            <CalendarIcon className="w-3 h-3" />
                            <span>Sync to Google Cal</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDayEvents(null);
                            setSelectedApplication(app);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 ml-auto cursor-pointer"
                        >
                          Open Dossier
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Live Google Calendar Events (Green) */}
                {selectedDayEvents.liveGoogleEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-xs text-[#15803D] dark:text-emerald-300 truncate">
                        {ev.summary || '(Untitled Event)'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                        {getGoogleEventTimeStr(ev)} · Google Calendar
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {ev.htmlLink && (
                        <a
                          href={ev.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-[#15803D] dark:text-emerald-300 flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          requestDeleteGoogleCalendarEvent(
                            ev.id,
                            ev.summary || 'Calendar Event'
                          );
                          setSelectedDayEvents(null);
                        }}
                        className="p-1.5 text-slate-400 hover:text-[#DC2626] rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete event from Google Calendar"
                        aria-label={`Delete ${ev.summary || 'event'} from Google Calendar`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Deadlines (Red) */}
                {selectedDayEvents.deadlines.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-serif font-bold text-xs text-[#DC2626] dark:text-red-300">
                        Application Deadline: {app.company}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        Role: {app.role}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDayEvents(null);
                        setSelectedApplication(app);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#DC2626] text-white hover:bg-red-700 cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                ))}

                {/* Follow-ups (Yellow) */}
                {selectedDayEvents.followUps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl border border-yellow-200 dark:border-yellow-900/60 bg-yellow-50/50 dark:bg-yellow-950/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-serif font-bold text-xs text-[#CA8A04] dark:text-yellow-300">
                        Scheduled Follow-up: {app.company}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                        {app.followUp?.notes ||
                          `Contact: ${app.contact.name || 'Hiring Team'}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDayEvents(null);
                        setSelectedApplication(app);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#EAB308] text-slate-950 hover:bg-yellow-500 cursor-pointer"
                    >
                      Follow-up
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
