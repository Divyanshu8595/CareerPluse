import React, { useState } from 'react';
import { useJobContext } from '../context/JobContext';
import {
  X,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Linkedin,
  FileText,
  Upload,
  Video,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Send,
  Eye,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { ApplicationStatus, DocumentType, InterviewRound } from '../types/job';
import { generateGoogleCalendarUrl } from '../utils/pureLogic';
import { CompanyBadge } from './CompanyBadge';

export const ApplicationDetailModal: React.FC = () => {
  const {
    selectedApplication,
    setSelectedApplication,
    changeStatus,
    setEditingApplication,
    deleteApplication,
    addInterview,
    updateInterview,
    deleteInterview,
    addDocument,
    deleteDocument,
    setPreviewDocument,
    scheduleFollowUp,
    markFollowUpCompleted,
    setEmailModalApp,
    requestSyncInterviewToGoogle,
    requestDeleteGoogleCalendarEvent,
  } = useJobContext();

  const [activeTab, setActiveTab] = useState<'overview' | 'interviews' | 'documents' | 'followup' | 'timeline'>('overview');

  // Sub-form state: Add Interview
  const [isAddingInterview, setIsAddingInterview] = useState(false);
  const [newInterviewRound, setNewInterviewRound] = useState<InterviewRound>('Technical Assessment');
  const [newInterviewTitle, setNewInterviewTitle] = useState('');
  const [newInterviewDate, setNewInterviewDate] = useState('');
  const [newInterviewTime, setNewInterviewTime] = useState('10:00');
  const [newInterviewDuration, setNewInterviewDuration] = useState(45);
  const [newInterviewInterviewers, setNewInterviewInterviewers] = useState('');
  const [newInterviewLink, setNewInterviewLink] = useState('');
  const [newInterviewNotes, setNewInterviewNotes] = useState('');

  // Sub-form state: Add Document
  const [documentType, setDocumentType] = useState<DocumentType>('resume');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sub-form state: Follow-up schedule
  const [customFollowUpDate, setCustomFollowUpDate] = useState(
    selectedApplication?.followUp?.date || ''
  );
  const [customFollowUpNotes, setCustomFollowUpNotes] = useState(
    selectedApplication?.followUp?.notes || ''
  );

  if (!selectedApplication) return null;

  const app = selectedApplication;

  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterviewDate) return;

    addInterview(app.id, {
      round: newInterviewRound,
      title: newInterviewTitle || `${newInterviewRound}`,
      date: newInterviewDate,
      time: newInterviewTime,
      durationMinutes: Number(newInterviewDuration) || 45,
      interviewers: newInterviewInterviewers,
      locationOrLink: newInterviewLink,
      preparationNotes: newInterviewNotes,
      completed: false,
    });

    setIsAddingInterview(false);
    setNewInterviewTitle('');
    setNewInterviewDate('');
    setNewInterviewInterviewers('');
    setNewInterviewLink('');
    setNewInterviewNotes('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.onload = () => {
        addDocument(app.id, {
          name: file.name,
          type: documentType,
          fileType: file.type || 'text/plain',
          size: file.size,
          textContent: reader.result as string,
        });
      };
      reader.readAsText(file);
    } else {
      reader.onload = () => {
        addDocument(app.id, {
          name: file.name,
          type: documentType,
          fileType: file.type || 'application/octet-stream',
          size: file.size,
          dataUrl: reader.result as string,
          textContent: file.type.includes('pdf')
            ? `[PDF Document: ${file.name}]\nFile uploaded and stored locally in browser storage.\nClick Download above to open with your local PDF reader.`
            : undefined,
        });
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/60 backdrop-blur-2xs">
      <div className="w-full max-w-4xl bg-white dark:bg-[#111827] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* 4-Color Architectural Ribbon */}
        <div className="grid grid-cols-4 h-1.5 shrink-0">
          <div className="bg-[#2563EB]" />
          <div className="bg-[#DC2626]" />
          <div className="bg-[#EAB308]" />
          <div className="bg-[#16A34A]" />
        </div>
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0D1322] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <CompanyBadge name={app.company} size="lg" />
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  {app.company}
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <select
                  value={app.status}
                  onChange={(e) => changeStatus(app.id, e.target.value as ApplicationStatus)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md border border-stone-300 dark:border-stone-750 bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-200 shadow-2xs cursor-pointer capitalize"
                >
                  <option value="wishlist">Wishlist</option>
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="technical">Technical</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer Received</option>
                  <option value="rejected">Archived</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>

                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                    app.priority === 'high'
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                      : app.priority === 'medium'
                      ? 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      : 'bg-stone-100 text-stone-500 dark:bg-stone-850 dark:text-stone-400'
                  }`}
                >
                  {app.priority}
                </span>
              </div>
              <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
                {app.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setEditingApplication(app)}
              className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Edit application details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete application for ${app.company}?`)) {
                  deleteApplication(app.id);
                  setSelectedApplication(null);
                }
              }}
              className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedApplication(null)}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200/80 dark:border-stone-850 px-5 gap-2 bg-white dark:bg-[#181817] overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview & Contacts' },
            { id: 'interviews', label: `Interviews (${app.interviews.length})` },
            { id: 'documents', label: `Documents (${app.documents.length})` },
            { id: 'followup', label: 'Follow-Up' },
            { id: 'timeline', label: `Timeline (${app.timeline.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-stone-900 text-stone-950 dark:border-stone-100 dark:text-stone-50'
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW & CONTACTS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Core Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-stone-50 dark:bg-stone-850/50 border border-stone-200/80 dark:border-stone-800 text-xs">
                <div>
                  <span className="text-stone-400 font-medium">Location</span>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{app.location}</span>
                  </div>
                </div>

                <div>
                  <span className="text-stone-400 font-medium">Work Type</span>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                    {app.workType}
                  </div>
                </div>

                <div>
                  <span className="text-stone-400 font-medium">Compensation</span>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 font-mono mt-0.5">
                    {app.salaryRange || 'Not specified'}
                  </div>
                </div>

                <div>
                  <span className="text-stone-400 font-medium">Date Applied</span>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 font-mono mt-0.5">
                    {app.dateApplied}
                  </div>
                </div>
              </div>

              {/* Company Contact Information Section */}
              <div className="p-5 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-stone-500" />
                    <span>Company Contact Details</span>
                  </h3>
                </div>

                {app.contact?.name ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div>
                        <span className="text-stone-400">Recruiter / Contact Name</span>
                        <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                          {app.contact.name}
                        </div>
                        {app.contact.role && (
                          <div className="text-stone-500 font-medium">{app.contact.role}</div>
                        )}
                      </div>

                      {app.contact.email && (
                        <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <a
                            href={`mailto:${app.contact.email}`}
                            className="text-stone-800 dark:text-stone-200 hover:underline font-mono"
                          >
                            {app.contact.email}
                          </a>
                        </div>
                      )}

                      {app.contact.phone && (
                        <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span className="font-mono">{app.contact.phone}</span>
                        </div>
                      )}

                      {app.contact.linkedin && (
                        <div className="flex items-center gap-2">
                          <Linkedin className="w-3.5 h-3.5 text-stone-400" />
                          <a
                            href={app.contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-stone-700 dark:text-stone-300 hover:underline flex items-center gap-1"
                          >
                            <span>LinkedIn Profile</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    {app.contact.notes && (
                      <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-850 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                        <span className="font-bold text-stone-500 uppercase text-[10px]">
                          Recruiter Notes:
                        </span>
                        <p className="leading-relaxed">{app.contact.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-stone-400 py-3">
                    No contact details saved yet.{' '}
                    <button
                      onClick={() => setEditingApplication(app)}
                      className="text-stone-800 dark:text-stone-200 font-semibold hover:underline ml-1"
                    >
                      Add Contact Info
                    </button>
                  </div>
                )}
              </div>

              {/* General Application Notes */}
              {app.notes && (
                <div className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-1.5 text-xs">
                  <span className="font-bold text-stone-500 uppercase text-[10px]">
                    Strategy & Team Notes:
                  </span>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                    {app.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTERVIEWS SCHEDULE */}
          {activeTab === 'interviews' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Interview Rounds
                  </h3>
                  <p className="text-xs text-stone-500">
                    Calendar invites, video call links, and interviewer prep notes
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingInterview(!isAddingInterview)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1E2922] text-white hover:bg-[#2A3B31] dark:bg-stone-100 dark:text-stone-900 flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingInterview ? 'Cancel' : 'Add Round'}</span>
                </button>
              </div>

              {/* Subform */}
              {isAddingInterview && (
                <form
                  onSubmit={handleCreateInterview}
                  className="p-4 rounded-xl bg-stone-50 dark:bg-stone-850/70 border border-stone-200 dark:border-stone-800 space-y-3"
                >
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Schedule New Interview Round
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                        Round Type *
                      </label>
                      <select
                        value={newInterviewRound}
                        onChange={(e) => setNewInterviewRound(e.target.value as InterviewRound)}
                        className="w-full p-2 mt-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                      >
                        <option value="Recruiter Screen">Recruiter Screen</option>
                        <option value="Technical Assessment">Technical Assessment</option>
                        <option value="System Design">System Design</option>
                        <option value="Hiring Manager">Hiring Manager</option>
                        <option value="Cultural & Values">Cultural & Values</option>
                        <option value="Executive / Final">Executive / Final</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={newInterviewDate}
                        onChange={(e) => setNewInterviewDate(e.target.value)}
                        className="w-full p-2 mt-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                        Time & Duration
                      </label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="time"
                          value={newInterviewTime}
                          onChange={(e) => setNewInterviewTime(e.target.value)}
                          className="w-1/2 p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                        />
                        <input
                          type="number"
                          value={newInterviewDuration}
                          onChange={(e) => setNewInterviewDuration(Number(e.target.value))}
                          placeholder="mins"
                          className="w-1/2 p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                        Interviewers
                      </label>
                      <input
                        type="text"
                        value={newInterviewInterviewers}
                        onChange={(e) => setNewInterviewInterviewers(e.target.value)}
                        placeholder="e.g. Elena Rostova, Staff Architect"
                        className="w-full p-2 mt-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                        Meeting Link or Location
                      </label>
                      <input
                        type="text"
                        value={newInterviewLink}
                        onChange={(e) => setNewInterviewLink(e.target.value)}
                        placeholder="https://zoom.us/j/... or Google Meet"
                        className="w-full p-2 mt-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                      />
                    </div>

                    <div className="col-span-full">
                      <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                        Preparation Notes
                      </label>
                      <textarea
                        value={newInterviewNotes}
                        onChange={(e) => setNewInterviewNotes(e.target.value)}
                        rows={2}
                        placeholder="Topics, question outlines, projects to discuss..."
                        className="w-full p-2 mt-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingInterview(false)}
                      className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#1E2922] text-white hover:bg-[#2A3B31] dark:bg-stone-100 dark:text-stone-900"
                    >
                      Save Round
                    </button>
                  </div>
                </form>
              )}

              {/* List */}
              <div className="space-y-3">
                {app.interviews.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                    No interview rounds added yet. Click &ldquo;Add Round&rdquo; above.
                  </div>
                ) : (
                  app.interviews.map((int) => {
                    const gcalUrl = generateGoogleCalendarUrl(app.company, app.role, int);

                    return (
                      <div
                        key={int.id}
                        className={`p-4 rounded-xl border transition-all ${
                          int.completed
                            ? 'bg-stone-50/70 dark:bg-stone-850/30 border-stone-200 dark:border-stone-800 opacity-80'
                            : 'bg-white dark:bg-[#181817] border-stone-200/90 dark:border-stone-800 shadow-2xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateInterview(app.id, int.id, { completed: !int.completed })
                              }
                              className={`p-1 rounded ${
                                int.completed ? 'text-emerald-600' : 'text-stone-300 hover:text-stone-400'
                              }`}
                              title={int.completed ? 'Mark as upcoming' : 'Mark as completed'}
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <div>
                              <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                                {int.round}
                              </span>
                              {int.title && int.title !== int.round && (
                                <span className="text-stone-500 text-xs ml-2">· {int.title}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-stone-700 dark:text-stone-300">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span>
                              {int.date} at {int.time} ({int.durationMinutes} min)
                            </span>
                          </div>
                        </div>

                        {int.interviewers && (
                          <div className="text-xs text-stone-500 mt-2">
                            Interviewers: <span className="font-medium text-stone-800 dark:text-stone-200">{int.interviewers}</span>
                          </div>
                        )}

                        {int.preparationNotes && (
                          <div className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg mt-2">
                            <strong>Prep:</strong> {int.preparationNotes}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex flex-wrap items-center gap-2">
                            {int.locationOrLink && (
                              <a
                                href={
                                  int.locationOrLink.startsWith('http')
                                    ? int.locationOrLink
                                    : `https://${int.locationOrLink}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 hover:bg-blue-100 flex items-center gap-1.5"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Join Video</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}

                            {int.googleCalendarEventId ? (
                              <>
                                <a
                                  href={int.googleCalendarHtmlLink || gcalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-[#16A34A] dark:text-emerald-400 flex items-center gap-1.5"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Synced on Google Cal</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() =>
                                    requestDeleteGoogleCalendarEvent(
                                      int.googleCalendarEventId!,
                                      `${int.round}: ${app.company}`,
                                      app.id,
                                      int.id
                                    )
                                  }
                                  className="px-2 py-1 text-xs font-semibold rounded-md text-[#DC2626] hover:bg-red-50 dark:hover:bg-red-950/40"
                                >
                                  Unsync
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => requestSyncInterviewToGoogle(app, int)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 cursor-pointer"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Sync to Google Cal</span>
                              </button>
                            )}

                            <a
                              href={gcalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
                            >
                              <span>Template Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>

                          <button
                            onClick={() => deleteInterview(app.id, int.id)}
                            className="text-xs text-stone-400 hover:text-rose-600 p-1 rounded"
                            title="Delete interview round"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Application Documents
                </h3>
                <p className="text-xs text-stone-500">
                  Resumes, tailored cover letters, and project samples associated with this position
                </p>
              </div>

              {/* Upload Box */}
              <div className="p-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-750 bg-stone-50/60 dark:bg-stone-850/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Document Type:
                    </span>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                      className="text-xs p-1.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white capitalize font-medium"
                    >
                      <option value="resume">Resume / CV</option>
                      <option value="cover_letter">Cover Letter</option>
                      <option value="portfolio">Portfolio / Work Sample</option>
                      <option value="offer">Offer Letter</option>
                      <option value="other">Other Document</option>
                    </select>
                  </div>

                  <label className="cursor-pointer px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#1E2922] hover:bg-[#2A3B31] text-white dark:bg-stone-100 dark:text-stone-900 flex items-center gap-2 shadow-2xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.txt,.docx,.doc,.md,.png,.jpg"
                    />
                  </label>
                </div>

                {uploadError && (
                  <div className="text-xs text-rose-600 font-medium">
                    {uploadError}
                  </div>
                )}
              </div>

              {/* List */}
              <div className="space-y-2.5">
                {app.documents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                    <FileText className="w-6 h-6 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
                    No documents uploaded for this application yet.
                  </div>
                ) : (
                  app.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181817] flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                            {doc.name}
                          </div>
                          <div className="text-[11px] text-stone-500 capitalize flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-stone-700 dark:text-stone-300">
                              {doc.type.replace('_', ' ')}
                            </span>
                            <span>·</span>
                            <span>{(doc.size / 1024).toFixed(1)} KB</span>
                            <span>·</span>
                            <span>Uploaded {doc.uploadDate.split('T')[0]}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setPreviewDocument(doc)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 flex items-center gap-1"
                          title="Preview document in browser"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => {
                            if (doc.dataUrl) {
                              const a = document.createElement('a');
                              a.href = doc.dataUrl;
                              a.download = doc.name;
                              a.click();
                            } else if (doc.textContent) {
                              const blob = new Blob([doc.textContent], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = doc.name;
                              a.click();
                              URL.revokeObjectURL(url);
                            }
                          }}
                          className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded hover:bg-stone-100"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${doc.name}?`)) {
                              deleteDocument(app.id, doc.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-rose-50"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FOLLOW-UP */}
          {activeTab === 'followup' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Follow-Up Reminder Settings
                </h3>
                <p className="text-xs text-stone-500">
                  Set target reminder dates and draft tailored messages
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-850/40 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      Scheduled Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={customFollowUpDate}
                      onChange={(e) => setCustomFollowUpDate(e.target.value)}
                      className="w-full p-2 mt-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      Status
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      {app.followUp?.completed ? (
                        <span className="px-2.5 py-1.5 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markFollowUpCompleted(app.id)}
                          className="px-2.5 py-1.5 rounded border border-stone-300 dark:border-stone-700 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark as Done</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      Follow-up Context & Reminders
                    </label>
                    <textarea
                      value={customFollowUpNotes}
                      onChange={(e) => setCustomFollowUpNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g. Check status after 1-week silence; ask about roadmap..."
                      className="w-full p-2 mt-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (customFollowUpDate) {
                        scheduleFollowUp(app.id, customFollowUpDate, customFollowUpNotes);
                      }
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#1E2922] text-white hover:bg-[#2A3B31] dark:bg-stone-100 dark:text-stone-900"
                  >
                    Save Reminder Date
                  </button>
                </div>
              </div>

              {/* Ready-to-Send Email Launcher */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Draft Follow-up Note
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Opens email drafter pre-populated with recruiter details
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEmailModalApp({
                      application: app,
                      templateKey:
                        app.status === 'interview'
                          ? 'post_interview_thank_you'
                          : app.status === 'offer'
                          ? 'offer_negotiation'
                          : 'application_followup',
                    });
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#1E2922] hover:bg-[#2A3B31] text-white dark:bg-stone-100 dark:text-stone-900 flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Draft Message</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Activity History
              </h3>

              <div className="relative pl-6 space-y-4 border-l border-stone-300 dark:border-stone-800">
                {app.timeline.map((act) => (
                  <div key={act.id} className="relative group">
                    <span className="absolute -left-[29px] top-1.5 w-2 h-2 rounded-full bg-stone-900 dark:bg-stone-100" />
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {act.title}
                    </div>
                    {act.details && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                        {act.details}
                      </p>
                    )}
                    <span className="text-[10px] text-stone-400 font-mono mt-1 inline-block">
                      {act.date.split('T')[0]} at {act.date.split('T')[1]?.substring(0, 5) || ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
