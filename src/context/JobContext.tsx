import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  JobApplication,
  ApplicationStatus,
  InterviewEvent,
  ApplicationDocument,
  DashboardStats,
  ActivityLogItem,
} from '../types/job';
import { INITIAL_APPLICATIONS } from '../data/initialApplications';
import { calculateDashboardStats, EmailTemplateKey } from '../utils/pureLogic';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  fetchGoogleCalendarEvents,
  createGoogleCalendarInterviewEvent,
  deleteGoogleCalendarEvent,
  GoogleCalendarEventItem,
} from '../utils/googleAuth';
import { PendingCalendarAction } from '../components/CalendarSyncConfirmModal';

export type ViewTab = 'dashboard' | 'board' | 'table' | 'calendar' | 'followups';

interface JobContextType {
  applications: JobApplication[];
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedApplication: JobApplication | null;
  setSelectedApplication: (app: JobApplication | null) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingApplication: JobApplication | null;
  setEditingApplication: (app: JobApplication | null) => void;
  previewDocument: ApplicationDocument | null;
  setPreviewDocument: (doc: ApplicationDocument | null) => void;
  emailModalApp: { application: JobApplication; templateKey?: EmailTemplateKey } | null;
  setEmailModalApp: (
    data: { application: JobApplication; templateKey?: EmailTemplateKey } | null
  ) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  candidateName: string;
  setCandidateName: (name: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  filterWorkType: string;
  setFilterWorkType: (wt: string) => void;
  filterPriority: string;
  setFilterPriority: (p: string) => void;
  notificationBannerDismissed: boolean;
  setNotificationBannerDismissed: (d: boolean) => void;
  stats: DashboardStats;

  // Google Calendar Integration State & Actions
  googleUser: User | null;
  needsGoogleAuth: boolean;
  isGoogleSigningIn: boolean;
  isSyncingCalendar: boolean;
  googleEvents: GoogleCalendarEventItem[];
  calendarNotice: { type: 'success' | 'error' | 'info'; message: string } | null;
  setCalendarNotice: (notice: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  pendingCalendarAction: PendingCalendarAction | null;
  setPendingCalendarAction: (action: PendingCalendarAction | null) => void;
  signInToGoogleCalendar: () => Promise<void>;
  signOutFromGoogleCalendar: () => Promise<void>;
  refreshGoogleCalendarEvents: () => Promise<void>;
  requestSyncInterviewToGoogle: (app: JobApplication, interview: InterviewEvent) => void;
  requestSyncAllInterviewsToGoogle: () => void;
  requestDeleteGoogleCalendarEvent: (
    eventId: string,
    summary: string,
    linkedAppId?: string,
    linkedInterviewId?: string
  ) => void;

  // CRUD Actions
  addApplication: (app: Omit<JobApplication, 'id' | 'timeline'> & { id?: string }) => void;
  updateApplication: (id: string, updates: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;
  changeStatus: (id: string, newStatus: ApplicationStatus) => void;
  addInterview: (appId: string, interview: Omit<InterviewEvent, 'id'>) => void;
  updateInterview: (
    appId: string,
    interviewId: string,
    updates: Partial<InterviewEvent>
  ) => void;
  deleteInterview: (appId: string, interviewId: string) => void;
  addDocument: (
    appId: string,
    doc: Omit<ApplicationDocument, 'id' | 'uploadDate'>
  ) => void;
  deleteDocument: (appId: string, docId: string) => void;
  markFollowUpCompleted: (appId: string) => void;
  scheduleFollowUp: (appId: string, date: string, notes?: string) => void;
  resetToDemoData: () => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const STORAGE_KEY = 'careerpulse_applications_v1';
const CANDIDATE_KEY = 'careerpulse_candidate_name';
const THEME_KEY = 'careerpulse_theme';

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore JSON parse error
    }
    return INITIAL_APPLICATIONS;
  });

  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(
    null
  );
  const [previewDocument, setPreviewDocument] = useState<ApplicationDocument | null>(
    null
  );
  const [emailModalApp, setEmailModalApp] = useState<{
    application: JobApplication;
    templateKey?: EmailTemplateKey;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterWorkType, setFilterWorkType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [notificationBannerDismissed, setNotificationBannerDismissed] = useState(false);

  // Google Calendar state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [needsGoogleAuth, setNeedsGoogleAuth] = useState<boolean>(true);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState<boolean>(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState<boolean>(false);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEventItem[]>([]);
  const [calendarNotice, setCalendarNotice] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [pendingCalendarAction, setPendingCalendarAction] =
    useState<PendingCalendarAction | null>(null);

  const [candidateName, setCandidateNameState] = useState<string>(() => {
    try {
      return localStorage.getItem(CANDIDATE_KEY) || 'Alex Dev';
    } catch {
      return 'Alex Dev';
    }
  });

  const setCandidateName = (name: string) => {
    setCandidateNameState(name);
    try {
      localStorage.setItem(CANDIDATE_KEY, name);
    } catch {
      // ignore
    }
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return false; // Default to crisp white theme
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch {
      // ignore
    }
  }, [applications]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (selectedApplication) {
      const updated = applications.find((a) => a.id === selectedApplication.id);
      if (updated) {
        setSelectedApplication(updated);
      }
    }
  }, [applications]);

  const refreshGoogleCalendarEvents = useCallback(async () => {
    setIsSyncingCalendar(true);
    try {
      const minDate = new Date(2026, 8, 1).toISOString();
      const maxDate = new Date(2027, 2, 1).toISOString();
      const items = await fetchGoogleCalendarEvents(minDate, maxDate);
      setGoogleEvents(items);
      setNeedsGoogleAuth(false);
    } catch (err: any) {
      if (err?.message === 'AUTH_REQUIRED') {
        setNeedsGoogleAuth(true);
        setGoogleUser(null);
      } else {
        setCalendarNotice({
          type: 'error',
          message: err?.message || 'Could not load Google Calendar events.',
        });
      }
    } finally {
      setIsSyncingCalendar(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
        setNeedsGoogleAuth(false);
        refreshGoogleCalendarEvents();
      },
      () => {
        setGoogleUser(null);
        setNeedsGoogleAuth(true);
        setGoogleEvents([]);
      }
    );
    return () => unsubscribe();
  }, [refreshGoogleCalendarEvents]);

  const signInToGoogleCalendar = async () => {
    setIsGoogleSigningIn(true);
    setCalendarNotice(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setNeedsGoogleAuth(false);
        await refreshGoogleCalendarEvents();
        setCalendarNotice({
          type: 'success',
          message: `Connected to Google Calendar (${result.user.email || 'Primary'})`,
        });
      }
    } catch (err: any) {
      setCalendarNotice({
        type: 'error',
        message: err?.message || 'Google Calendar sign-in was cancelled or failed.',
      });
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const signOutFromGoogleCalendar = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setNeedsGoogleAuth(true);
    setGoogleEvents([]);
    setCalendarNotice({
      type: 'info',
      message: 'Disconnected from Google Calendar.',
    });
  };

  const updateInterview = (
    appId: string,
    interviewId: string,
    updates: Partial<InterviewEvent>
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return {
          ...app,
          interviews: app.interviews.map((int) =>
            int.id === interviewId ? { ...int, ...updates } : int
          ),
        };
      })
    );
  };

  const requestSyncInterviewToGoogle = (
    app: JobApplication,
    interview: InterviewEvent
  ) => {
    if (needsGoogleAuth || !googleUser) {
      signInToGoogleCalendar();
      return;
    }

    setPendingCalendarAction({
      type: 'create_single',
      title: 'Add Interview to Google Calendar?',
      description: `This will create a new calendar event on your primary Google Calendar (${
        googleUser.email || 'connected account'
      }) with meeting links and preparation notes.`,
      items: [
        `${interview.round}: ${app.company} (${app.role}) on ${interview.date} at ${interview.time}`,
      ],
      onConfirm: async () => {
        setIsSyncingCalendar(true);
        try {
          const created = await createGoogleCalendarInterviewEvent(
            app.company,
            app.role,
            interview
          );
          updateInterview(app.id, interview.id, {
            googleCalendarEventId: created.id,
            googleCalendarHtmlLink: created.htmlLink,
          });
          await refreshGoogleCalendarEvents();
          setCalendarNotice({
            type: 'success',
            message: `Synced "${interview.round} · ${app.company}" to your Google Calendar.`,
          });
        } catch (err: any) {
          setCalendarNotice({
            type: 'error',
            message: err?.message || 'Failed to create Google Calendar event.',
          });
        } finally {
          setIsSyncingCalendar(false);
          setPendingCalendarAction(null);
        }
      },
    });
  };

  const requestSyncAllInterviewsToGoogle = () => {
    if (needsGoogleAuth || !googleUser) {
      signInToGoogleCalendar();
      return;
    }

    const unsynced: { app: JobApplication; interview: InterviewEvent }[] = [];
    applications.forEach((app) => {
      app.interviews.forEach((interview) => {
        if (!interview.completed && !interview.googleCalendarEventId) {
          unsynced.push({ app, interview });
        }
      });
    });

    if (unsynced.length === 0) {
      setCalendarNotice({
        type: 'info',
        message: 'All upcoming interviews are already synced to your Google Calendar.',
      });
      return;
    }

    setPendingCalendarAction({
      type: 'sync_all',
      title: `Sync ${unsynced.length} Interview(s) to Google Calendar?`,
      description: `This will create ${unsynced.length} upcoming interview event(s) on your primary Google Calendar (${
        googleUser.email || 'connected account'
      }).`,
      items: unsynced.map(
        ({ app, interview }) =>
          `${interview.round} · ${app.company} (${interview.date} at ${interview.time})`
      ),
      onConfirm: async () => {
        setIsSyncingCalendar(true);
        try {
          for (const { app, interview } of unsynced) {
            const created = await createGoogleCalendarInterviewEvent(
              app.company,
              app.role,
              interview
            );
            updateInterview(app.id, interview.id, {
              googleCalendarEventId: created.id,
              googleCalendarHtmlLink: created.htmlLink,
            });
          }
          await refreshGoogleCalendarEvents();
          setCalendarNotice({
            type: 'success',
            message: `Synced ${unsynced.length} interview(s) to your Google Calendar.`,
          });
        } catch (err: any) {
          setCalendarNotice({
            type: 'error',
            message: err?.message || 'Failed to sync all interviews to Google Calendar.',
          });
        } finally {
          setIsSyncingCalendar(false);
          setPendingCalendarAction(null);
        }
      },
    });
  };

  const requestDeleteGoogleCalendarEvent = (
    eventId: string,
    summary: string,
    linkedAppId?: string,
    linkedInterviewId?: string
  ) => {
    if (needsGoogleAuth || !googleUser) {
      signInToGoogleCalendar();
      return;
    }

    setPendingCalendarAction({
      type: 'delete_event',
      title: 'Delete Event from Google Calendar?',
      description:
        'Are you sure you want to permanently remove this event from your Google Calendar? This action cannot be undone.',
      items: [summary],
      onConfirm: async () => {
        setIsSyncingCalendar(true);
        try {
          await deleteGoogleCalendarEvent(eventId);
          if (linkedAppId && linkedInterviewId) {
            updateInterview(linkedAppId, linkedInterviewId, {
              googleCalendarEventId: undefined,
              googleCalendarHtmlLink: undefined,
            });
          }
          await refreshGoogleCalendarEvents();
          setCalendarNotice({
            type: 'info',
            message: `Removed "${summary}" from your Google Calendar.`,
          });
        } catch (err: any) {
          setCalendarNotice({
            type: 'error',
            message: err?.message || 'Failed to delete event from Google Calendar.',
          });
        } finally {
          setIsSyncingCalendar(false);
          setPendingCalendarAction(null);
        }
      },
    });
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const stats = useMemo(() => {
    return calculateDashboardStats(applications);
  }, [applications]);

  const addApplication = (
    newApp: Omit<JobApplication, 'id' | 'timeline'> & { id?: string }
  ) => {
    const id = newApp.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const initialActivity: ActivityLogItem = {
      id: `act-${Date.now()}`,
      date: nowIso,
      type: 'applied',
      title: 'Application Created',
      details: `Added ${newApp.role} at ${newApp.company} with status '${newApp.status}'.`,
    };

    const created: JobApplication = {
      ...newApp,
      id,
      timeline: [initialActivity],
    };

    setApplications((prev) => [created, ...prev]);
  };

  const updateApplication = (id: string, updates: Partial<JobApplication>) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        return { ...app, ...updates };
      })
    );
  };

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    if (selectedApplication?.id === id) {
      setSelectedApplication(null);
    }
  };

  const changeStatus = (id: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        if (app.status === newStatus) return app;

        const activity: ActivityLogItem = {
          id: `act-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'status_changed',
          title: `Status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          details: `Moved from ${app.status} to ${newStatus}.`,
        };

        return {
          ...app,
          status: newStatus,
          timeline: [activity, ...app.timeline],
        };
      })
    );
  };

  const addInterview = (appId: string, interview: Omit<InterviewEvent, 'id'>) => {
    const id = `int-${Date.now()}`;
    const newInterview: InterviewEvent = { ...interview, id };

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const activity: ActivityLogItem = {
          id: `act-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'interview_scheduled',
          title: `Scheduled: ${interview.round}`,
          details: `${interview.date} at ${interview.time} (${interview.durationMinutes} min)`,
        };

        return {
          ...app,
          interviews: [...app.interviews, newInterview],
          timeline: [activity, ...app.timeline],
        };
      })
    );
  };

  const deleteInterview = (appId: string, interviewId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return {
          ...app,
          interviews: app.interviews.filter((int) => int.id !== interviewId),
        };
      })
    );
  };

  const addDocument = (
    appId: string,
    doc: Omit<ApplicationDocument, 'id' | 'uploadDate'>
  ) => {
    const id = `doc-${Date.now()}`;
    const newDoc: ApplicationDocument = {
      ...doc,
      id,
      uploadDate: new Date().toISOString(),
    };

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const activity: ActivityLogItem = {
          id: `act-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'document_uploaded',
          title: `Uploaded document: ${doc.name}`,
          details: `Type: ${doc.type}, Size: ${(doc.size / 1024).toFixed(1)} KB`,
        };

        return {
          ...app,
          documents: [newDoc, ...app.documents],
          timeline: [activity, ...app.timeline],
        };
      })
    );
  };

  const deleteDocument = (appId: string, docId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return {
          ...app,
          documents: app.documents.filter((doc) => doc.id !== docId),
        };
      })
    );
  };

  const markFollowUpCompleted = (appId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const activity: ActivityLogItem = {
          id: `act-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'follow_up_completed',
          title: 'Follow-up marked as completed',
          details: app.followUp?.notes,
        };

        return {
          ...app,
          followUp: {
            ...app.followUp,
            completed: true,
          },
          timeline: [activity, ...app.timeline],
        };
      })
    );
  };

  const scheduleFollowUp = (appId: string, date: string, notes?: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const activity: ActivityLogItem = {
          id: `act-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'follow_up_scheduled',
          title: `Follow-up scheduled for ${date}`,
          details: notes,
        };

        return {
          ...app,
          followUp: {
            date,
            notes,
            completed: false,
          },
          timeline: [activity, ...app.timeline],
        };
      })
    );
  };

  const resetToDemoData = () => {
    setApplications(INITIAL_APPLICATIONS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPLICATIONS));
    } catch {
      // ignore
    }
  };

  return (
    <JobContext.Provider
      value={{
        applications,
        activeTab,
        setActiveTab,
        selectedApplication,
        setSelectedApplication,
        isAddModalOpen,
        setIsAddModalOpen,
        editingApplication,
        setEditingApplication,
        previewDocument,
        setPreviewDocument,
        emailModalApp,
        setEmailModalApp,
        isDarkMode,
        toggleDarkMode,
        candidateName,
        setCandidateName,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        filterWorkType,
        setFilterWorkType,
        filterPriority,
        setFilterPriority,
        notificationBannerDismissed,
        setNotificationBannerDismissed,
        stats,
        googleUser,
        needsGoogleAuth,
        isGoogleSigningIn,
        isSyncingCalendar,
        googleEvents,
        calendarNotice,
        setCalendarNotice,
        pendingCalendarAction,
        setPendingCalendarAction,
        signInToGoogleCalendar,
        signOutFromGoogleCalendar,
        refreshGoogleCalendarEvents,
        requestSyncInterviewToGoogle,
        requestSyncAllInterviewsToGoogle,
        requestDeleteGoogleCalendarEvent,
        addApplication,
        updateApplication,
        deleteApplication,
        changeStatus,
        addInterview,
        updateInterview,
        deleteInterview,
        addDocument,
        deleteDocument,
        markFollowUpCompleted,
        scheduleFollowUp,
        resetToDemoData,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
};
