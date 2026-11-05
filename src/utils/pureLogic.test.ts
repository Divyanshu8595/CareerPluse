import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compareDates,
  calculateDashboardStats,
  generateGoogleCalendarUrl,
  generateICalendar,
  generateFollowUpEmail,
} from './pureLogic';
import { JobApplication, InterviewEvent } from '../types/job';

const mockApp1: JobApplication = {
  id: 'app-1',
  company: 'Stripe',
  role: 'Frontend Engineer',
  location: 'San Francisco, CA',
  workType: 'Hybrid',
  dateApplied: '2026-10-15',
  status: 'interview',
  priority: 'high',
  contact: {
    name: 'Sarah Chen',
    role: 'Lead Technical Recruiter',
    email: 'sarah.chen@stripe.example.com',
  },
  followUp: {
    date: '2026-11-06',
    completed: false,
  },
  interviews: [
    {
      id: 'int-1',
      title: 'Technical Screen',
      round: 'Technical Assessment',
      date: '2026-11-07',
      time: '14:00',
      durationMinutes: 60,
      interviewers: 'Alex Rivera, Senior Staff Engineer',
      locationOrLink: 'https://meet.google.com/xyz-abc',
      completed: false,
    },
  ],
  documents: [],
  timeline: [],
};

const mockApp2: JobApplication = {
  id: 'app-2',
  company: 'Linear',
  role: 'Full Stack Engineer',
  location: 'Remote',
  workType: 'Remote',
  dateApplied: '2026-10-20',
  deadline: '2026-11-10',
  status: 'wishlist',
  priority: 'medium',
  contact: {
    name: 'Karri Saarinen',
    role: 'Head of Talent',
    email: 'karri@linear.example.com',
  },
  followUp: {
    date: '2026-11-04', // past / overdue relative to Nov 5
    completed: false,
  },
  interviews: [],
  documents: [],
  timeline: [],
};

const mockApp3: JobApplication = {
  id: 'app-3',
  company: 'Airbnb',
  role: 'Design Engineer',
  location: 'Remote',
  workType: 'Remote',
  dateApplied: '2026-09-10',
  status: 'offer',
  priority: 'high',
  contact: {
    name: 'Marcus Vance',
    role: 'Design Director',
    email: 'mvance@airbnb.example.com',
  },
  followUp: {
    date: '2026-11-05', // today relative to Nov 5
    completed: true,
  },
  interviews: [],
  documents: [],
  timeline: [],
};

test('compareDates detects past, today, and future dates accurately', () => {
  const ref = new Date(2026, 10, 5); // 2026-11-05
  const pastRes = compareDates('2026-11-04', ref);
  assert.equal(pastRes.isPast, true);
  assert.equal(pastRes.diffDays, -1);

  const todayRes = compareDates('2026-11-05', ref);
  assert.equal(todayRes.isToday, true);
  assert.equal(todayRes.diffDays, 0);

  const futureRes = compareDates('2026-11-07', ref);
  assert.equal(futureRes.isFuture, true);
  assert.equal(futureRes.diffDays, 2);
});

test('calculateDashboardStats correctly aggregates counts, rates, and follow-ups', () => {
  const ref = new Date(2026, 10, 5); // 2026-11-05
  const stats = calculateDashboardStats([mockApp1, mockApp2, mockApp3], ref);

  assert.equal(stats.total, 3);
  assert.equal(stats.offersCount, 1);
  assert.equal(stats.statusBreakdown.interview, 1);
  assert.equal(stats.statusBreakdown.wishlist, 1);
  assert.equal(stats.statusBreakdown.offer, 1);

  // Active applications: app-1 (interview) + app-3 (offer) = 2
  assert.equal(stats.activeCount, 2);

  // Submitted apps = 2 (Stripe, Airbnb). Wishlist (Linear) is not submitted.
  // Responded apps = 2. responseRate = 100%
  assert.equal(stats.responseRate, 100);

  // Upcoming interviews: Stripe int-1 is on Nov 7 (future)
  assert.equal(stats.upcomingInterviews.length, 1);
  assert.equal(stats.upcomingInterviews[0].interview.title, 'Technical Screen');

  // Pending follow ups: app-1 (Nov 6) is pending. app-2 (Nov 4) is overdue pending. app-3 is completed.
  assert.equal(stats.pendingFollowUps.length, 2);
  const overdueFollowUp = stats.pendingFollowUps.find((f) => f.isOverdue);
  assert.ok(overdueFollowUp);
  assert.equal(overdueFollowUp?.application.company, 'Linear');
});

test('generateGoogleCalendarUrl creates valid Google Calendar link', () => {
  const interview: InterviewEvent = {
    id: 'int-test',
    title: 'Final Round',
    round: 'Executive / Final',
    date: '2026-11-12',
    time: '15:30',
    durationMinutes: 45,
    interviewers: 'CTO Jane Doe',
    locationOrLink: 'https://zoom.us/j/12345678',
    completed: false,
  };

  const url = generateGoogleCalendarUrl('Vercel', 'Staff Engineer', interview);
  assert.ok(url.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE'));
  assert.ok(url.includes('Vercel'));
  assert.ok(url.includes('Executive'));
  assert.ok(url.includes('zoom.us'));
});

test('generateICalendar produces valid RFC 5545 iCalendar content', () => {
  const interview: InterviewEvent = {
    id: 'int-cal-1',
    title: 'Screening Call',
    round: 'Recruiter Screen',
    date: '2026-11-09',
    time: '11:00',
    durationMinutes: 30,
    interviewers: 'Recruiter Sam',
    locationOrLink: 'Phone',
  };

  const ics = generateICalendar([
    { company: 'Figma', role: 'Product Designer', interview },
  ]);

  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('VERSION:2.0'));
  assert.ok(ics.includes('BEGIN:VEVENT'));
  assert.ok(ics.includes('SUMMARY:Recruiter Screen - Figma (Product Designer)'));
  assert.ok(ics.includes('END:VEVENT'));
  assert.ok(ics.includes('END:VCALENDAR'));
});

test('generateFollowUpEmail generates tailored templates and mailto URL', () => {
  const result = generateFollowUpEmail('application_followup', mockApp1, 'Alex Dev');
  assert.ok(result.subject.includes('Frontend Engineer at Stripe'));
  assert.ok(result.body.includes('Hi Sarah Chen,'));
  assert.ok(result.body.includes('Alex Dev'));
  assert.ok(result.mailtoUrl.startsWith('mailto:sarah.chen@stripe.example.com?subject='));
});
