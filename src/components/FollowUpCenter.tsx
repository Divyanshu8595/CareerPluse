import React, { useState } from 'react';
import { useJobContext } from '../context/JobContext';
import {
  Bell,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Send,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  EmailTemplateKey,
  generateFollowUpEmail,
} from '../utils/pureLogic';
import { JobApplication } from '../types/job';
import { CompanyBadge } from './CompanyBadge';

export const FollowUpCenter: React.FC = () => {
  const {
    applications,
    stats,
    markFollowUpCompleted,
    scheduleFollowUp,
    setSelectedApplication,
    candidateName,
    setCandidateName,
  } = useJobContext();

  const [activeTemplateApp, setActiveTemplateApp] = useState<JobApplication | null>(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<EmailTemplateKey>(
    'application_followup'
  );
  const [copied, setCopied] = useState(false);
  const [rescheduleAppId, setRescheduleAppId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const overdue = stats.pendingFollowUps.filter((f) => f.isOverdue);
  const dueToday = stats.pendingFollowUps.filter((f) => f.isToday);
  const upcoming = stats.pendingFollowUps.filter((f) => !f.isOverdue && !f.isToday);

  const completedFollowUps = applications.filter(
    (app) => app.followUp?.completed && app.followUp.date
  );

  const activeEmailData = activeTemplateApp
    ? generateFollowUpEmail(selectedTemplateKey, activeTemplateApp, candidateName)
    : null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Follow-up Center Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#181817] rounded-xl border border-stone-200/80 dark:border-stone-850 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Follow-Up Ledger & Letters
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Timely check-ins and tailored follow-up notes for hiring teams.
              </p>
            </div>
          </div>
        </div>

        {/* Candidate Signature Profile setting */}
        <div className="flex items-center gap-2 text-xs bg-stone-50 dark:bg-stone-850 p-2 rounded-lg border border-stone-200/80 dark:border-stone-800">
          <span className="text-stone-500 dark:text-stone-400 whitespace-nowrap">
            Signed As:
          </span>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            className="px-2 py-1 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-medium"
            placeholder="Your Name"
          />
        </div>
      </div>

      {/* Main Grid: Left is Follow-up Queues, Right is Email Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Action Queues */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section: Overdue Follow-ups */}
          {overdue.length > 0 && (
            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1814] border border-[#E8DEC4] dark:border-[#382D1E] shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#8C5E28] dark:text-[#DEC186]">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Action Needed ({overdue.length})</span>
                </span>
                <span>Past Due</span>
              </div>

              <div className="space-y-2">
                {overdue.map(({ application, daysDelta }) => (
                  <div
                    key={application.id}
                    className="p-3 rounded-lg bg-white dark:bg-[#181817] border border-stone-200/80 dark:border-stone-800 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <CompanyBadge name={application.company} size="sm" className="mt-0.5" />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => setSelectedApplication(application)}
                              className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 hover:underline"
                            >
                              {application.company}
                            </button>
                            <span className="text-xs text-stone-300 dark:text-stone-700">·</span>
                            <span className="text-xs text-stone-600 dark:text-stone-400">
                              {application.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            Recipient: {application.contact.name || 'Hiring Manager'} (
                            {application.contact.email || 'No email saved'})
                          </div>
                        </div>
                      </div>

                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-200/60 shrink-0">
                        {Math.abs(daysDelta)} days past due
                      </span>
                    </div>

                    {application.followUp.notes && (
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-850 p-2 rounded">
                        {application.followUp.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveTemplateApp(application);
                            setSelectedTemplateKey('application_followup');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#1E2922] text-white hover:bg-[#2A3B31] dark:bg-stone-100 dark:text-stone-900 flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Compose Note</span>
                        </button>
                        <button
                          onClick={() => markFollowUpCompleted(application.id)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Mark as Done</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setRescheduleAppId(application.id);
                          setRescheduleDate(new Date().toISOString().split('T')[0]);
                        }}
                        className="text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                      >
                        Reschedule
                      </button>
                    </div>

                    {/* Reschedule inline drawer */}
                    {rescheduleAppId === application.id && (
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                        <input
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="text-xs p-1 rounded border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200"
                        />
                        <button
                          onClick={() => {
                            if (rescheduleDate) {
                              scheduleFollowUp(application.id, rescheduleDate, application.followUp.notes);
                              setRescheduleAppId(null);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                        >
                          Save Date
                        </button>
                        <button
                          onClick={() => setRescheduleAppId(null)}
                          className="text-xs text-stone-400"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Due Today */}
          {dueToday.length > 0 && (
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-stone-500" />
                  <span>Scheduled for Today ({dueToday.length})</span>
                </span>
                <span>Today</span>
              </div>

              <div className="space-y-2">
                {dueToday.map(({ application }) => (
                  <div
                    key={application.id}
                    className="p-3 rounded-lg bg-white dark:bg-[#181817] border border-stone-200/80 dark:border-stone-800 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <CompanyBadge name={application.company} size="sm" className="mt-0.5" />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => setSelectedApplication(application)}
                              className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 hover:underline"
                            >
                              {application.company}
                            </button>
                            <span className="text-xs text-stone-300 dark:text-stone-700">·</span>
                            <span className="text-xs text-stone-600 dark:text-stone-400">
                              {application.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {application.contact.name || 'Hiring Manager'} (
                            {application.contact.email || 'No email'})
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200 shrink-0">
                        Due Today
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setActiveTemplateApp(application);
                          setSelectedTemplateKey('application_followup');
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#1E2922] text-white hover:bg-[#2A3B31] dark:bg-stone-100 dark:text-stone-900 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Compose Note</span>
                      </button>
                      <button
                        onClick={() => markFollowUpCompleted(application.id)}
                        className="px-2.5 py-1 text-[11px] font-medium rounded border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:bg-stone-100 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Mark as Done</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Upcoming Follow-ups */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#181817] border border-stone-200/80 dark:border-stone-850 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-stone-100">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-stone-500" />
                <span>Upcoming Follow-ups ({upcoming.length})</span>
              </span>
            </div>

            {upcoming.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400">
                No upcoming follow-ups scheduled.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-850">
                {upcoming.map(({ application, daysDelta }) => (
                  <div key={application.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <CompanyBadge name={application.company} size="sm" />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 hover:underline"
                          >
                            {application.company}
                          </button>
                          <span className="text-xs text-stone-300 dark:text-stone-700">·</span>
                          <span className="text-xs text-stone-600 dark:text-stone-400">
                            {application.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Scheduled for: {application.followUp.date} (in {daysDelta} days)
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTemplateApp(application);
                        setSelectedTemplateKey('application_followup');
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 shrink-0"
                    >
                      Draft Ahead
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed History */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#181817] border border-stone-200/80 dark:border-stone-850 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Completed Log ({completedFollowUps.length})</span>
            </h3>
            <div className="text-xs text-stone-500">
              {completedFollowUps.length === 0 ? (
                <span>No completed follow-ups yet.</span>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {completedFollowUps.map((app) => (
                    <span
                      key={app.id}
                      onClick={() => setSelectedApplication(app)}
                      className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[11px] cursor-pointer hover:bg-stone-200"
                    >
                      ✓ {app.company}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Note & Email Drafter */}
        <div className="lg:col-span-5 bg-white dark:bg-[#181817] rounded-xl p-5 border border-stone-200/80 dark:border-stone-850 shadow-2xs space-y-4 sticky top-20">
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              <span>Direct Dispatch & Notes</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Select an entry to tailor and review the letter before sending
            </p>
          </div>

          {/* Target Application Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Target Company:
            </label>
            <select
              value={activeTemplateApp?.id || ''}
              onChange={(e) => {
                const found = applications.find((a) => a.id === e.target.value);
                setActiveTemplateApp(found || null);
              }}
              className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-750 bg-stone-50/70 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            >
              <option value="">-- Choose an application --</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} · {app.role} ({app.status})
                </option>
              ))}
            </select>
          </div>

          {/* Template Type Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Letter Cadence:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: 'application_followup', label: 'Post-Application' },
                { key: 'post_interview_thank_you', label: 'Thank You Note' },
                { key: 'status_inquiry', label: 'Status Inquiry' },
                { key: 'offer_negotiation', label: 'Offer Negotiation' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setSelectedTemplateKey(t.key as EmailTemplateKey)}
                  className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg text-left transition-colors ${
                    selectedTemplateKey === t.key
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rendered Template Preview */}
          {activeEmailData ? (
            <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-850">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-stone-500">Subject:</span>
                <div className="p-2 rounded bg-stone-50 dark:bg-stone-850 text-xs font-medium text-stone-900 dark:text-stone-100 font-mono select-all">
                  {activeEmailData.subject}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-stone-500">Body:</span>
                <div className="p-3 rounded bg-stone-50/70 dark:bg-stone-850 text-xs text-stone-800 dark:text-stone-200 whitespace-pre-wrap font-sans max-h-56 overflow-y-auto leading-relaxed border border-stone-200/60 dark:border-stone-750">
                  {activeEmailData.body}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <a
                  href={activeEmailData.mailtoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-[#1E2922] hover:bg-[#2A3B31] text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 flex items-center justify-center gap-1.5 shadow-2xs transition-colors text-center"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Open in Mail Client</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => handleCopy(`${activeEmailData.subject}\n\n${activeEmailData.body}`)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-750 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-lg">
              Pick an application above to preview letter text.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
