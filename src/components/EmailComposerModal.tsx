import React, { useState, useEffect } from 'react';
import { useJobContext } from '../context/JobContext';
import {
  X,
  Mail,
  Send,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import {
  EmailTemplateKey,
  generateFollowUpEmail,
} from '../utils/pureLogic';
import { CompanyBadge } from './CompanyBadge';

export const EmailComposerModal: React.FC = () => {
  const {
    emailModalApp,
    setEmailModalApp,
    markFollowUpCompleted,
    candidateName,
  } = useJobContext();

  const [templateKey, setTemplateKey] = useState<EmailTemplateKey>('application_followup');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (emailModalApp) {
      const initialKey = emailModalApp.templateKey || 'application_followup';
      setTemplateKey(initialKey);
      const generated = generateFollowUpEmail(initialKey, emailModalApp.application, candidateName);
      setSubject(generated.subject);
      setBody(generated.body);
    }
  }, [emailModalApp, candidateName]);

  if (!emailModalApp) return null;

  const app = emailModalApp.application;

  const handleTemplateChange = (key: EmailTemplateKey) => {
    setTemplateKey(key);
    const generated = generateFollowUpEmail(key, app, candidateName);
    setSubject(generated.subject);
    setBody(generated.body);
  };

  const mailtoUrl = app.contact?.email
    ? `mailto:${app.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-2xs">
      <div className="w-full max-w-2xl bg-white dark:bg-[#181817] rounded-2xl shadow-xl border border-stone-200/80 dark:border-stone-850 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-850 flex items-center justify-between bg-stone-50/50 dark:bg-stone-850/40">
          <div className="flex items-center gap-3">
            <CompanyBadge name={app.company} size="md" />
            <div>
              <h2 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                Draft Follow-Up Note · {app.company}
              </h2>
              <p className="text-[11px] text-stone-500">
                To: {app.contact?.name || 'Hiring Team'} ({app.contact?.email || 'No email specified'})
              </p>
            </div>
          </div>

          <button
            onClick={() => setEmailModalApp(null)}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Template Selectors */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'application_followup', label: 'Post-Application' },
              { key: 'post_interview_thank_you', label: 'Thank You Note' },
              { key: 'status_inquiry', label: 'Status Inquiry' },
              { key: 'offer_negotiation', label: 'Offer Discussion' },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => handleTemplateChange(t.key as EmailTemplateKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  templateKey === t.key
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Subject Field */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">
              Subject Line:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-medium text-xs font-mono"
            />
          </div>

          {/* Body Field */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">
              Message Body:
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-850 text-stone-900 dark:text-white font-sans text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-850/40 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              markFollowUpCompleted(app.id);
              setEmailModalApp(null);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark as Sent</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <a
              href={mailtoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#1E2922] hover:bg-[#2A3B31] text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 flex items-center gap-1.5 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open Mail Client</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
