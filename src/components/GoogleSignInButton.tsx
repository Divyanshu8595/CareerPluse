import React from 'react';
import { useJobContext } from '../context/JobContext';
import { LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  compact?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ compact = false }) => {
  const {
    googleUser,
    isGoogleSigningIn,
    isSyncingCalendar,
    signInToGoogleCalendar,
    signOutFromGoogleCalendar,
    refreshGoogleCalendarEvents,
  } = useJobContext();

  if (googleUser) {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
          <span className="truncate">{googleUser.email || googleUser.displayName || 'Connected'}</span>
        </span>

        <button
          type="button"
          onClick={() => refreshGoogleCalendarEvents()}
          disabled={isSyncingCalendar}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[#2563EB] dark:text-blue-400 transition-colors"
          title="Refresh Google Calendar events"
          aria-label="Refresh Google Calendar events"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCalendar ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => signOutFromGoogleCalendar()}
          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-[#DC2626] transition-colors"
          title="Sign out of Google Calendar"
          aria-label="Sign out of Google Calendar"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signInToGoogleCalendar()}
      disabled={isGoogleSigningIn}
      className={`gsi-material-button inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0 ${
        compact ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs'
      }`}
    >
      <div className="gsi-material-button-icon w-4 h-4 shrink-0">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className="w-full h-full block"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
      </div>
      <span className="gsi-material-button-contents font-semibold">
        {isGoogleSigningIn ? 'Connecting...' : 'Sign in with Google'}
      </span>
    </button>
  );
};
