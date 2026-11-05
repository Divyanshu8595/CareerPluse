import {
  ApplicationStatus,
  DashboardStats,
  InterviewEvent,
  JobApplication,
} from '../types/job';

/**
 * Checks if a given date string (YYYY-MM-DD) is in the past, today, or in future.
 * Reference date defaults to today's local date.
 */
export function compareDates(dateStr: string, refDate = new Date()): {
  diffDays: number;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
} {
  const target = new Date(`${dateStr}T00:00:00`);
  const ref = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const diffTime = target.getTime() - ref.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return {
    diffDays,
    isPast: diffDays < 0,
    isToday: diffDays === 0,
    isFuture: diffDays > 0,
  };
}

/**
 * Calculates comprehensive dashboard metrics and action items.
 */
export function calculateDashboardStats(
  applications: JobApplication[],
  refDate = new Date()
): DashboardStats {
  const total = applications.length;

  const statusBreakdown: Record<ApplicationStatus, number> = {
    wishlist: 0,
    applied: 0,
    screening: 0,
    technical: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0,
  };

  applications.forEach((app) => {
    if (statusBreakdown[app.status] !== undefined) {
      statusBreakdown[app.status]++;
    }
  });

  const offersCount = statusBreakdown.offer;
  const rejectedCount = statusBreakdown.rejected;
  const withdrawnCount = statusBreakdown.withdrawn;

  // Active: not rejected, not withdrawn, not wishlist (meaning submitted and in flight)
  const activeCount =
    statusBreakdown.applied +
    statusBreakdown.screening +
    statusBreakdown.technical +
    statusBreakdown.interview +
    statusBreakdown.offer;

  // Total applied/submitted applications
  const submittedCount = total - statusBreakdown.wishlist;

  // Responded applications: moved beyond 'applied'
  const respondedCount =
    statusBreakdown.screening +
    statusBreakdown.technical +
    statusBreakdown.interview +
    statusBreakdown.offer +
    statusBreakdown.rejected;

  const responseRate =
    submittedCount > 0 ? Math.round((respondedCount / submittedCount) * 100) : 0;

  // Interviewed count: reached screening, technical, interview, or offer
  const interviewedCount =
    statusBreakdown.screening +
    statusBreakdown.technical +
    statusBreakdown.interview +
    statusBreakdown.offer;

  const interviewConversionRate =
    submittedCount > 0
      ? Math.round((interviewedCount / submittedCount) * 100)
      : 0;

  // Gather upcoming interviews
  const upcomingInterviews: {
    application: JobApplication;
    interview: InterviewEvent;
  }[] = [];

  applications.forEach((app) => {
    app.interviews.forEach((interview) => {
      if (!interview.completed) {
        const { diffDays } = compareDates(interview.date, refDate);
        if (diffDays >= 0) {
          upcomingInterviews.push({ application: app, interview });
        }
      }
    });
  });

  // Sort upcoming interviews by date and time
  upcomingInterviews.sort((a, b) => {
    const dtA = `${a.interview.date}T${a.interview.time || '00:00'}`;
    const dtB = `${b.interview.date}T${b.interview.time || '00:00'}`;
    return dtA.localeCompare(dtB);
  });

  // Gather upcoming deadlines (within next 14 days or today)
  const upcomingDeadlines = applications
    .filter((app) => {
      if (!app.deadline) return false;
      const { diffDays } = compareDates(app.deadline, refDate);
      return diffDays >= 0 && diffDays <= 14 && app.status === 'wishlist';
    })
    .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));

  // Gather pending follow-ups (uncompleted follow-up with a date)
  const pendingFollowUps = applications
    .filter((app) => app.followUp?.date && !app.followUp.completed)
    .map((app) => {
      const { diffDays, isPast, isToday } = compareDates(
        app.followUp.date,
        refDate
      );
      return {
        application: app,
        isOverdue: isPast,
        isToday,
        daysDelta: diffDays,
      };
    })
    .sort((a, b) => a.daysDelta - b.daysDelta);

  return {
    total,
    activeCount,
    offersCount,
    rejectedCount,
    interviewsScheduledCount: upcomingInterviews.length,
    responseRate,
    interviewConversionRate,
    statusBreakdown,
    upcomingDeadlines,
    upcomingInterviews,
    pendingFollowUps,
  };
}

/**
 * Builds a valid Google Calendar Web URL to schedule or export an interview.
 */
export function generateGoogleCalendarUrl(
  company: string,
  role: string,
  interview: InterviewEvent
): string {
  const title = encodeURIComponent(`${interview.round}: ${company} (${role})`);
  
  // Format dates: YYYYMMDDTHHmm00Z
  const [year, month, day] = interview.date.split('-');
  const [hours, minutes] = (interview.time || '09:00').split(':');

  const startUtc = new Date(
    Date.UTC(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hours, 10),
      parseInt(minutes, 10)
    )
  );
  const endUtc = new Date(
    startUtc.getTime() + (interview.durationMinutes || 45) * 60 * 1000
  );

  const formatIsoUtc = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const datesParam = `${formatIsoUtc(startUtc)}/${formatIsoUtc(endUtc)}`;

  const detailsText = [
    `Interview Round: ${interview.round}`,
    `Company: ${company}`,
    `Role: ${role}`,
    interview.interviewers ? `Interviewers: ${interview.interviewers}` : '',
    interview.preparationNotes ? `\nPrep Notes:\n${interview.preparationNotes}` : '',
    interview.locationOrLink ? `\nLink/Meeting: ${interview.locationOrLink}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const details = encodeURIComponent(detailsText);
  const location = encodeURIComponent(interview.locationOrLink || 'Video Call');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
}

/**
 * Builds standard iCalendar (.ics) content for all interviews or a single interview.
 */
export function generateICalendar(
  events: { company: string; role: string; interview: InterviewEvent }[]
): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const formatUtc = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(
      d.getUTCDate()
    )}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  const now = formatUtc(new Date());

  const vevents = events.map(({ company, role, interview }) => {
    const [year, month, day] = interview.date.split('-');
    const [hours, minutes] = (interview.time || '10:00').split(':');

    const startDate = new Date(
      Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hours, 10),
        parseInt(minutes, 10)
      )
    );
    const endDate = new Date(
      startDate.getTime() + (interview.durationMinutes || 45) * 60 * 1000
    );

    const summary = `${interview.round} - ${company} (${role})`;
    const description = `Round: ${interview.round}\\nCompany: ${company}\\nRole: ${role}\\nInterviewers: ${interview.interviewers || 'TBD'}\\nNotes: ${interview.preparationNotes || 'N/A'}`;
    const location = interview.locationOrLink || 'Online Meeting';

    return [
      'BEGIN:VEVENT',
      `UID:${interview.id}@careerpulse.app`,
      `DTSTAMP:${now}`,
      `DTSTART:${formatUtc(startDate)}`,
      `DTEND:${formatUtc(endDate)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CareerPulse//Job Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n');
}

export type EmailTemplateKey =
  | 'application_followup'
  | 'post_interview_thank_you'
  | 'status_inquiry'
  | 'offer_negotiation';

export interface EmailTemplateResult {
  subject: string;
  body: string;
  mailtoUrl: string;
}

/**
 * Generates ready-to-send follow-up emails tailored to the job application and contact.
 */
export function generateFollowUpEmail(
  templateKey: EmailTemplateKey,
  app: JobApplication,
  candidateName = 'Applicant'
): EmailTemplateResult {
  const contactName = app.contact?.name || 'Hiring Team';
  const company = app.company;
  const role = app.role;
  const recipientEmail = app.contact?.email || '';

  let subject = '';
  let body = '';

  switch (templateKey) {
    case 'application_followup':
      subject = `Following up on Application - ${role} at ${company} - ${candidateName}`;
      body = `Hi ${contactName},

I hope this email finds you well.

I recently submitted my application for the ${role} position at ${company}. I am writing to reiterate my strong enthusiasm for this opportunity and the impactful work ${company} is leading.

With my background and skill set, I am confident I can contribute meaningfully to your team's upcoming initiatives. Please let me know if you need any additional materials, work samples, or references from my end.

Thank you very much for your time and consideration, and I look forward to hearing from you.

Warm regards,
${candidateName}`;
      break;

    case 'post_interview_thank_you':
      subject = `Thank you - Interview for ${role} position - ${candidateName}`;
      body = `Hi ${contactName},

Thank you very much for taking the time to speak with me today about the ${role} role at ${company}.

I truly enjoyed learning more about the team's roadmap and current challenges. Our conversation reinforced my excitement about joining ${company} and applying my experience to help deliver outstanding outcomes for your team.

Please let me know if there are any next steps or follow-up details you would like me to provide.

Thank you again for your time, and I look forward to staying in touch.

Best regards,
${candidateName}`;
      break;

    case 'status_inquiry':
      subject = `Status Update - ${role} Application - ${candidateName}`;
      body = `Hi ${contactName},

I hope you are having a productive week.

I am checking in regarding the status of the ${role} search at ${company}. I remains deeply excited about the role and wanted to see if there are any updates regarding next steps or timelines.

Looking forward to hearing from you when convenient.

Best regards,
${candidateName}`;
      break;

    case 'offer_negotiation':
      subject = `Re: Offer for ${role} - ${candidateName}`;
      body = `Hi ${contactName},

Thank you so much for extending the offer for the ${role} position at ${company}! I am thrilled about the opportunity to join the team and make an impact.

I have thoroughly reviewed the offer details. Before making a final decision, I would appreciate the opportunity to discuss a few aspects of the compensation package (including base salary and equity). Based on current market rates and the scope of responsibilities, I was hoping we could explore an adjustment to better align with the role.

Would you have a few minutes for a quick call this week to talk through these details?

Thank you again for your support throughout this process!

Warm regards,
${candidateName}`;
      break;
  }

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  const mailtoUrl = recipientEmail
    ? `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`
    : `mailto:?subject=${encodedSubject}&body=${encodedBody}`;

  return { subject, body, mailtoUrl };
}
