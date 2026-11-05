import React from 'react';
import { useJobContext, ViewTab } from '../context/JobContext';
import { Plus } from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, setIsAddModalOpen, stats } = useJobContext();

  const urgentCount = stats.pendingFollowUps.filter(
    (f) => f.isOverdue || f.isToday
  ).length;

  const navItems: {
    id: ViewTab;
    label: string;
    count?: number;
    accentColor: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      accentColor: 'border-[#2563EB] text-[#2563EB] dark:text-blue-400',
    },
    {
      id: 'board',
      label: 'Pipeline',
      count: stats.activeCount,
      accentColor: 'border-[#16A34A] text-[#16A34A] dark:text-emerald-400',
    },
    {
      id: 'table',
      label: 'Ledger',
      count: stats.total,
      accentColor: 'border-[#2563EB] text-[#2563EB] dark:text-blue-400',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      count: stats.interviewsScheduledCount,
      accentColor: 'border-[#DC2626] text-[#DC2626] dark:text-red-400',
    },
    {
      id: 'followups',
      label: 'Follow-ups',
      count: urgentCount > 0 ? urgentCount : undefined,
      accentColor: 'border-[#CA8A04] text-[#CA8A04] dark:text-yellow-400',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-left group cursor-pointer"
          >
            <div className="grid grid-cols-2 w-7 h-7 rounded-lg overflow-hidden shadow-2xs border border-slate-200/60 dark:border-slate-700 shrink-0">
              <div className="bg-[#2563EB]" />
              <div className="bg-[#DC2626]" />
              <div className="bg-[#EAB308]" />
              <div className="bg-[#16A34A]" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              CareerPulse
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? item.accentColor
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="font-mono text-[11px] tabular-nums opacity-75">
                      ({item.count})
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Google Calendar Auth & Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <GoogleSignInButton compact />

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-4 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-[#2563EB] dark:bg-blue-950/60 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-1 font-mono text-[10px] tabular-nums">
                    ({item.count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
