export type ApplicationStatus =
  | 'wishlist'
  | 'applied'
  | 'screening'
  | 'technical'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type WorkType = 'Remote' | 'Hybrid' | 'On-site';

export type Priority = 'high' | 'medium' | 'low';

export type DocumentType = 'resume' | 'cover_letter' | 'portfolio' | 'offer' | 'other';

export type InterviewRound =
  | 'Recruiter Screen'
  | 'Technical Assessment'
  | 'System Design'
  | 'Hiring Manager'
  | 'Cultural & Values'
  | 'Executive / Final';

export interface CompanyContact {
  name: string;
  role: string;
  email: string;
  phone?: string;
  linkedin?: string;
  notes?: string;
}

export interface FollowUpInfo {
  date: string; // YYYY-MM-DD
  notes?: string;
  completed?: boolean;
  reminderSent?: boolean;
}

export interface InterviewEvent {
  id: string;
  title: string;
  round: InterviewRound;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  interviewers: string;
  locationOrLink: string;
  preparationNotes?: string;
  completed?: boolean;
  googleCalendarEventId?: string;
  googleCalendarHtmlLink?: string;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  type: DocumentType;
  fileType: string;
  size: number; // in bytes
  uploadDate: string; // ISO date
  dataUrl?: string; // base64 or text data
  textContent?: string; // for plain text or markdown previews
}

export interface ActivityLogItem {
  id: string;
  date: string; // ISO timestamp
  type:
    | 'applied'
    | 'status_changed'
    | 'interview_scheduled'
    | 'interview_completed'
    | 'follow_up_scheduled'
    | 'follow_up_completed'
    | 'document_uploaded'
    | 'note_added';
  title: string;
  details?: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  workType: WorkType;
  jobUrl?: string;
  salaryRange?: string;
  dateApplied: string; // YYYY-MM-DD
  deadline?: string; // YYYY-MM-DD
  status: ApplicationStatus;
  priority: Priority;
  contact: CompanyContact;
  followUp: FollowUpInfo;
  interviews: InterviewEvent[];
  documents: ApplicationDocument[];
  notes?: string;
  timeline: ActivityLogItem[];
  colorTag?: string;
}

export interface DashboardStats {
  total: number;
  activeCount: number;
  offersCount: number;
  rejectedCount: number;
  interviewsScheduledCount: number;
  responseRate: number; // percentage (0-100)
  interviewConversionRate: number; // percentage (0-100)
  statusBreakdown: Record<ApplicationStatus, number>;
  upcomingDeadlines: JobApplication[];
  upcomingInterviews: {
    application: JobApplication;
    interview: InterviewEvent;
  }[];
  pendingFollowUps: {
    application: JobApplication;
    isOverdue: boolean;
    isToday: boolean;
    daysDelta: number;
  }[];
}
