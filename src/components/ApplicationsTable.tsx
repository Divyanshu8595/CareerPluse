import React, { useState } from 'react';
import { useJobContext } from '../context/JobContext';
import { CompanyBadge } from './CompanyBadge';
import { ApplicationStatus, JobApplication } from '../types/job';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Send,
  ArrowUpDown,
  FileSpreadsheet,
  FileCode,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const ApplicationsTable: React.FC = () => {
  const {
    applications,
    setSelectedApplication,
    setIsAddModalOpen,
    setEditingApplication,
    deleteApplication,
    setEmailModalApp,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterWorkType,
    setFilterWorkType,
  } = useJobContext();

  const [sortField, setSortField] = useState<'dateApplied' | 'company' | 'status'>('dateApplied');
  const [sortAsc, setSortAsc] = useState(false);

  const statusBadges: Record<ApplicationStatus, { label: string; class: string }> = {
    wishlist: { label: 'Wishlist', class: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200' },
    applied: { label: 'Applied', class: 'bg-blue-50 text-[#2563EB] dark:bg-blue-950/60 dark:text-blue-300 border-blue-200' },
    screening: { label: 'Screening', class: 'bg-yellow-50 text-[#CA8A04] dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-200' },
    technical: { label: 'Technical', class: 'bg-blue-50 text-[#1D4ED8] dark:bg-blue-950/60 dark:text-blue-300 border-blue-200' },
    interview: { label: 'Interview', class: 'bg-red-50 text-[#DC2626] dark:bg-red-950/60 dark:text-red-300 border-red-200' },
    offer: { label: 'Offer Received', class: 'bg-emerald-50 text-[#16A34A] dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200' },
    rejected: { label: 'Archived', class: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200' },
    withdrawn: { label: 'Withdrawn', class: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200' },
  };

  const filteredApps = applications.filter((app) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCompany = app.company.toLowerCase().includes(q);
      const matchRole = app.role.toLowerCase().includes(q);
      const matchLoc = app.location.toLowerCase().includes(q);
      const matchContact = app.contact?.name?.toLowerCase().includes(q);
      if (!matchCompany && !matchRole && !matchLoc && !matchContact) return false;
    }
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;
    if (filterWorkType !== 'all' && app.workType !== filterWorkType) return false;
    return true;
  });

  const sortedApps = [...filteredApps].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'dateApplied') {
      cmp = a.dateApplied.localeCompare(b.dateApplied);
    } else if (sortField === 'company') {
      cmp = a.company.localeCompare(b.company);
    } else if (sortField === 'status') {
      cmp = a.status.localeCompare(b.status);
    }
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (field: 'dateApplied' | 'company' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Company',
      'Role',
      'Status',
      'Location',
      'Work Type',
      'Salary Range',
      'Date Applied',
      'Deadline',
      'Recruiter Name',
      'Recruiter Email',
      'Recruiter Phone',
      'Interviews Count',
      'Documents Count',
    ];

    const rows = sortedApps.map((app) => [
      `"${app.company.replace(/"/g, '""')}"`,
      `"${app.role.replace(/"/g, '""')}"`,
      app.status,
      `"${app.location.replace(/"/g, '""')}"`,
      app.workType,
      `"${(app.salaryRange || '').replace(/"/g, '""')}"`,
      app.dateApplied,
      app.deadline || '',
      `"${(app.contact?.name || '').replace(/"/g, '""')}"`,
      `"${(app.contact?.email || '').replace(/"/g, '""')}"`,
      `"${(app.contact?.phone || '').replace(/"/g, '""')}"`,
      app.interviews.length,
      app.documents.length,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const jsonStr = JSON.stringify(applications, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applications_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Search, Filters, and Export Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-[#181817] rounded-xl border border-stone-200/80 dark:border-stone-850 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-750 bg-stone-50/70 dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300"
          >
            <option value="all">All Stages</option>
            <option value="wishlist">Wishlist</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="technical">Technical</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer Received</option>
            <option value="rejected">Archived</option>
          </select>

          {/* Work type filter */}
          <select
            value={filterWorkType}
            onChange={(e) => setFilterWorkType(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300"
          >
            <option value="all">All Work Types</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-1.5 transition-colors"
            title="Download CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-stone-500" />
            <span>CSV</span>
          </button>

          {/* Export JSON Backup */}
          <button
            onClick={exportJSON}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-1.5 transition-colors"
            title="Download JSON backup"
          >
            <FileCode className="w-3.5 h-3.5 text-stone-500" />
            <span>JSON</span>
          </button>

          {/* Add Application */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#181817] rounded-xl border border-stone-200/80 dark:border-stone-850 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200/80 dark:border-stone-850 bg-stone-100/60 dark:bg-stone-850/50 text-stone-600 dark:text-stone-400 font-semibold">
                <th
                  onClick={() => toggleSort('company')}
                  className="py-3 px-4 cursor-pointer hover:text-stone-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Company & Role</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('status')}
                  className="py-3 px-3 cursor-pointer hover:text-stone-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Stage</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Location & Mode</th>
                <th className="py-3 px-3">Compensation</th>
                <th className="py-3 px-3">Company Contact</th>
                <th
                  onClick={() => toggleSort('dateApplied')}
                  className="py-3 px-3 cursor-pointer hover:text-stone-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Applied / Deadline</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
              {sortedApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 text-xs">
                    No applications match your active filters.
                  </td>
                </tr>
              ) : (
                sortedApps.map((app) => {
                  const badge = statusBadges[app.status] || statusBadges.applied;

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-stone-850/40 transition-colors group"
                    >
                      {/* Company & Role */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2.5">
                          <CompanyBadge name={app.company} size="sm" className="mt-0.5" />
                          <div className="min-w-0">
                            <button
                              onClick={() => setSelectedApplication(app)}
                              className="font-serif font-bold text-stone-900 dark:text-stone-100 hover:underline text-left transition-colors truncate block"
                            >
                              {app.company}
                            </button>
                            <div className="text-[11px] font-medium text-stone-600 dark:text-stone-400 line-clamp-1">
                              {app.role}
                            </div>
                            {app.jobUrl && (
                              <a
                                href={app.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 mt-0.5"
                              >
                                <span>Posting link</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border whitespace-nowrap ${badge.class}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Location & Work Type */}
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-300">
                        <div className="flex items-center gap-1 text-[11px] truncate max-w-[160px]">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{app.location}</span>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {app.workType}
                        </div>
                      </td>

                      {/* Compensation */}
                      <td className="py-3 px-3 font-mono text-[11px] tabular-nums text-stone-700 dark:text-stone-300">
                        {app.salaryRange || '—'}
                      </td>

                      {/* Contact Information */}
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-300">
                        {app.contact?.name ? (
                          <div>
                            <div className="font-semibold text-stone-850 dark:text-stone-200 text-xs">
                              {app.contact.name}
                            </div>
                            <div className="text-[10px] text-stone-400 truncate max-w-[140px]">
                              {app.contact.email || app.contact.role}
                            </div>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Applied & Deadline Dates */}
                      <td className="py-3 px-3 font-mono text-[11px] tabular-nums text-stone-600 dark:text-stone-400">
                        <div>{app.dateApplied}</div>
                        {app.deadline && (
                          <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                            Due: {app.deadline}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
                            title="View application details & documents"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setEmailModalApp({
                                application: app,
                                templateKey:
                                  app.status === 'interview'
                                    ? 'post_interview_thank_you'
                                    : 'application_followup',
                              });
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
                            title="Draft follow-up email"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setEditingApplication(app)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
                            title="Edit details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete application for ${app.company}?`)) {
                                deleteApplication(app.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="py-2.5 px-4 bg-stone-50/70 dark:bg-stone-850/40 border-t border-stone-200/80 dark:border-stone-850 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>
            Showing <strong className="font-mono text-stone-700 dark:text-stone-300">{sortedApps.length}</strong> of{' '}
            <strong className="font-mono text-stone-700 dark:text-stone-300">{applications.length}</strong> applications
          </span>
          <div className="flex items-center gap-2">
            <span>Click any entry to view notes & resumes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
