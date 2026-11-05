import React from 'react';
import { useJobContext } from '../context/JobContext';
import { CompanyBadge } from './CompanyBadge';
import { ApplicationStatus, JobApplication } from '../types/job';
import {
  Plus,
  MapPin,
  Calendar,
  FileText,
  Video,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  User,
  Search,
} from 'lucide-react';

const COLUMNS: { id: ApplicationStatus; title: string; topBorder: string }[] = [
  { id: 'wishlist', title: 'Wishlist', topBorder: 'border-t-slate-400 dark:border-t-slate-600' },
  { id: 'applied', title: 'Applied', topBorder: 'border-t-[#2563EB]' },
  { id: 'screening', title: 'Screening', topBorder: 'border-t-[#EAB308]' },
  { id: 'technical', title: 'Technical', topBorder: 'border-t-[#1D4ED8]' },
  { id: 'interview', title: 'Interviewing', topBorder: 'border-t-[#DC2626]' },
  { id: 'offer', title: 'Offer Received', topBorder: 'border-t-[#16A34A]' },
  { id: 'rejected', title: 'Archived', topBorder: 'border-t-slate-300 dark:border-t-slate-700' },
];

const STAGE_ORDER: ApplicationStatus[] = [
  'wishlist',
  'applied',
  'screening',
  'technical',
  'interview',
  'offer',
  'rejected',
];

export const ApplicationsKanban: React.FC = () => {
  const {
    applications,
    changeStatus,
    setSelectedApplication,
    setIsAddModalOpen,
    searchQuery,
    setSearchQuery,
    filterWorkType,
    setFilterWorkType,
    filterPriority,
    setFilterPriority,
  } = useJobContext();

  const filteredApps = applications.filter((app) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCompany = app.company.toLowerCase().includes(q);
      const matchRole = app.role.toLowerCase().includes(q);
      const matchLoc = app.location.toLowerCase().includes(q);
      const matchContact = app.contact?.name?.toLowerCase().includes(q);
      if (!matchCompany && !matchRole && !matchLoc && !matchContact) return false;
    }
    if (filterWorkType !== 'all' && app.workType !== filterWorkType) return false;
    if (filterPriority !== 'all' && app.priority !== filterPriority) return false;
    return true;
  });

  const getNextStage = (current: ApplicationStatus): ApplicationStatus | null => {
    const idx = STAGE_ORDER.indexOf(current);
    if (idx < STAGE_ORDER.length - 1 && current !== 'rejected' && current !== 'offer') {
      return STAGE_ORDER[idx + 1];
    }
    return null;
  };

  const getPrevStage = (current: ApplicationStatus): ApplicationStatus | null => {
    const idx = STAGE_ORDER.indexOf(current);
    if (idx > 0 && current !== 'rejected') {
      return STAGE_ORDER[idx - 1];
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-[#181817] rounded-xl border border-stone-200/80 dark:border-stone-850 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, role, location, recruiter..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-750 bg-stone-50/70 dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Work Type Filter */}
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

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Kanban Horizontal Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[600px]">
        {COLUMNS.map((col) => {
          const colApps = filteredApps.filter((app) => app.status === col.id);

          return (
            <div
              key={col.id}
              className={`w-72 shrink-0 flex flex-col rounded-xl bg-stone-100/70 dark:bg-[#161615] border-t-3 ${col.topBorder} border-stone-200/80 dark:border-stone-850 shadow-2xs max-h-[80vh]`}
            >
              {/* Column Header */}
              <div className="p-3 flex items-center justify-between border-b border-stone-200/60 dark:border-stone-850">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {col.title}
                  </span>
                  <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    {colApps.length}
                  </span>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded transition-colors"
                  title={`Add to ${col.title}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Column Cards */}
              <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                {colApps.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-lg text-stone-400 text-xs">
                    No entries in {col.title}
                  </div>
                ) : (
                  colApps.map((app) => {
                    const nextStage = getNextStage(app.status);
                    const prevStage = getPrevStage(app.status);

                    return (
                      <div
                        key={app.id}
                        className="p-3.5 rounded-lg bg-white dark:bg-[#1C1C1B] border border-stone-200/90 dark:border-stone-800 shadow-2xs hover:shadow-xs transition-all space-y-2.5 group cursor-pointer hover:border-stone-300 dark:hover:border-stone-700"
                        onClick={() => setSelectedApplication(app)}
                      >
                        {/* Company & Role Header with Monogram Badge */}
                        <div className="flex items-start gap-2.5">
                          <CompanyBadge name={app.company} size="sm" className="mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100 group-hover:underline transition-colors truncate">
                                {app.company}
                              </span>
                              <span
                                className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold shrink-0 ${
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
                            <div className="text-xs font-medium text-stone-700 dark:text-stone-300 line-clamp-1 mt-0.5">
                              {app.role}
                            </div>
                          </div>
                        </div>

                        {/* Location & Salary */}
                        <div className="space-y-1 text-[11px] text-stone-500 dark:text-stone-400">
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
                            <span className="truncate">{app.location}</span>
                            <span className="text-stone-400">·</span>
                            <span className="font-medium text-stone-600 dark:text-stone-300 shrink-0">
                              {app.workType}
                            </span>
                          </div>
                          {app.salaryRange && (
                            <div className="flex items-center gap-1.5 truncate font-mono text-[10px] text-stone-700 dark:text-stone-300">
                              <DollarSign className="w-3 h-3 shrink-0 text-stone-400" />
                              <span className="truncate">{app.salaryRange}</span>
                            </div>
                          )}
                        </div>

                        {/* Badges row: Interviews, Documents, Contact */}
                        <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                          <div className="flex items-center gap-2">
                            {app.interviews.length > 0 && (
                              <span
                                className="flex items-center gap-1 text-stone-700 dark:text-stone-300 font-medium"
                                title={`${app.interviews.length} interview sessions`}
                              >
                                <Video className="w-3 h-3 text-stone-500" />
                                <span>{app.interviews.length}</span>
                              </span>
                            )}
                            {app.documents.length > 0 && (
                              <span
                                className="flex items-center gap-1 text-stone-700 dark:text-stone-300 font-medium"
                                title={`${app.documents.length} attached documents`}
                              >
                                <FileText className="w-3 h-3 text-stone-500" />
                                <span>{app.documents.length}</span>
                              </span>
                            )}
                            {app.contact?.name && (
                              <span
                                className="flex items-center gap-1 text-stone-500"
                                title={`Contact: ${app.contact.name}`}
                              >
                                <User className="w-3 h-3 text-stone-400" />
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-stone-400 font-mono">
                            {app.dateApplied}
                          </div>
                        </div>

                        {/* Quick Stage Shifter buttons */}
                        <div
                          className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {prevStage ? (
                            <button
                              onClick={() => changeStatus(app.id, prevStage)}
                              className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 text-[10px] flex items-center gap-0.5"
                              title={`Move back to ${prevStage}`}
                            >
                              <ChevronLeft className="w-3 h-3" />
                              <span className="capitalize">{prevStage}</span>
                            </button>
                          ) : (
                            <div />
                          )}

                          {nextStage && (
                            <button
                              onClick={() => changeStatus(app.id, nextStage)}
                              className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-[10px] font-semibold flex items-center gap-0.5 ml-auto"
                              title={`Advance to ${nextStage}`}
                            >
                              <span className="capitalize">{nextStage}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
