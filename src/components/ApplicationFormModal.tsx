import React, { useState, useEffect } from 'react';
import { useJobContext } from '../context/JobContext';
import {
  X,
  Building2,
} from 'lucide-react';
import { ApplicationStatus, Priority, WorkType } from '../types/job';

export const ApplicationFormModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingApplication,
    setEditingApplication,
    addApplication,
    updateApplication,
  } = useJobContext();

  const isOpen = isAddModalOpen || !!editingApplication;

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('Remote');
  const [workType, setWorkType] = useState<WorkType>('Remote');
  const [jobUrl, setJobUrl] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('applied');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dateApplied, setDateApplied] = useState('');
  const [deadline, setDeadline] = useState('');

  // Contact Info
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLinkedin, setContactLinkedin] = useState('');
  const [contactNotes, setContactNotes] = useState('');

  // Follow-up
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Notes
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingApplication) {
      setCompany(editingApplication.company);
      setRole(editingApplication.role);
      setLocation(editingApplication.location);
      setWorkType(editingApplication.workType);
      setJobUrl(editingApplication.jobUrl || '');
      setSalaryRange(editingApplication.salaryRange || '');
      setStatus(editingApplication.status);
      setPriority(editingApplication.priority);
      setDateApplied(editingApplication.dateApplied);
      setDeadline(editingApplication.deadline || '');

      setContactName(editingApplication.contact?.name || '');
      setContactRole(editingApplication.contact?.role || '');
      setContactEmail(editingApplication.contact?.email || '');
      setContactPhone(editingApplication.contact?.phone || '');
      setContactLinkedin(editingApplication.contact?.linkedin || '');
      setContactNotes(editingApplication.contact?.notes || '');

      setFollowUpDate(editingApplication.followUp?.date || '');
      setFollowUpNotes(editingApplication.followUp?.notes || '');
      setNotes(editingApplication.notes || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      setCompany('');
      setRole('');
      setLocation('San Francisco, CA or Remote');
      setWorkType('Hybrid');
      setJobUrl('');
      setSalaryRange('');
      setStatus('applied');
      setPriority('medium');
      setDateApplied(today);
      setDeadline('');

      setContactName('');
      setContactRole('');
      setContactEmail('');
      setContactPhone('');
      setContactLinkedin('');
      setContactNotes('');

      setFollowUpDate(nextWeek);
      setFollowUpNotes('Check in regarding application review status.');
      setNotes('');
    }
  }, [editingApplication, isAddModalOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    if (editingApplication) {
      updateApplication(editingApplication.id, {
        company: company.trim(),
        role: role.trim(),
        location,
        workType,
        jobUrl: jobUrl.trim() || undefined,
        salaryRange: salaryRange.trim() || undefined,
        status,
        priority,
        dateApplied,
        deadline: deadline || undefined,
        contact: {
          name: contactName.trim(),
          role: contactRole.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim() || undefined,
          linkedin: contactLinkedin.trim() || undefined,
          notes: contactNotes.trim() || undefined,
        },
        followUp: {
          date: followUpDate,
          notes: followUpNotes,
          completed: false,
        },
        notes: notes.trim() || undefined,
      });
      setEditingApplication(null);
    } else {
      addApplication({
        company: company.trim(),
        role: role.trim(),
        location,
        workType,
        jobUrl: jobUrl.trim() || undefined,
        salaryRange: salaryRange.trim() || undefined,
        status,
        priority,
        dateApplied: dateApplied || new Date().toISOString().split('T')[0],
        deadline: deadline || undefined,
        contact: {
          name: contactName.trim(),
          role: contactRole.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim() || undefined,
          linkedin: contactLinkedin.trim() || undefined,
          notes: contactNotes.trim() || undefined,
        },
        followUp: {
          date: followUpDate,
          notes: followUpNotes,
          completed: false,
        },
        interviews: [],
        documents: [],
        notes: notes.trim() || undefined,
      });
      setIsAddModalOpen(false);
    }
  };

  const handleClose = () => {
    setIsAddModalOpen(false);
    setEditingApplication(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-2xs">
      <div className="w-full max-w-2xl bg-white dark:bg-[#181817] rounded-2xl shadow-xl border border-stone-200/80 dark:border-stone-850 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200/80 dark:border-stone-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                {editingApplication ? 'Edit Application Details' : 'Add New Application'}
              </h2>
              <p className="text-xs text-stone-500">
                Log opportunity details, company contacts, and follow-up schedules
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Core Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wider text-stone-400">
              Role & Company
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, Airbnb, Linear"
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Stage
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white capitalize font-semibold"
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
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white capitalize"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Work Mode
                </label>
                <select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value as WorkType)}
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Compensation
                </label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g. $180,000 - $210,000 + Equity"
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Job Posting URL
                </label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Date Applied
                </label>
                <input
                  type="date"
                  value={dateApplied}
                  onChange={(e) => setDateApplied(e.target.value)}
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wider text-stone-400">
              Company Recruiter / Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Name
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Sarah Chen"
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Role / Title
                </label>
                <input
                  type="text"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  placeholder="e.g. Lead Technical Recruiter"
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Direct Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. recruiter@company.com"
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                />
              </div>

              <div className="col-span-full">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={contactLinkedin}
                  onChange={(e) => setContactLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Follow-up Reminder */}
          <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wider text-stone-400">
              Follow-up Reminder
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Context Note
                </label>
                <input
                  type="text"
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="e.g. Check status after 1-week silence"
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div className="col-span-full">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Internal Strategy Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Referral name, team focus, key requirements mentioned..."
                  className="w-full p-2 mt-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#1E2922] hover:bg-[#2A3B31] text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs transition-colors"
            >
              {editingApplication ? 'Save Changes' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
