import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, Github, Mail, Send } from 'lucide-react';
import { DEVELOPER_IDENTITY } from '../data/portfolioData';
import { audioEngine } from '../utils/audioEngine';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export const ContactSection: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (form.name.trim().length < 2) {
      nextErrors.name = 'Please enter your name (at least 2 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (form.subject.trim().length < 3) {
      nextErrors.subject = 'Please add a short subject.';
    }
    if (form.message.trim().length < 10) {
      nextErrors.message = 'Message must be at least 10 characters.';
    }
    return nextErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audioEngine.playClick();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitted(true);
  };

  const handleCopyEmail = async () => {
    audioEngine.playClick();
    try {
      await navigator.clipboard.writeText(DEVELOPER_IDENTITY.email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // Clipboard blocked in restricted context; user still sees visible email address
    }
  };

  const mailtoHref = `mailto:${DEVELOPER_IDENTITY.email}?subject=${encodeURIComponent(
    form.subject || 'Portfolio Inquiry',
  )}&body=${encodeURIComponent(
    `Hi Saipratap,\n\n${form.message}\n\nBest,\n${form.name} (${form.email})`,
  )}`;

  return (
    <section
      id="contact"
      className="relative z-10 mx-auto max-w-6xl px-6 py-20 border-t border-slate-200/80 dark:border-slate-800/70"
    >
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
          05. Contact Me
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
          Let&apos;s Connect &amp; Collaborate
        </h2>
        <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Open to collaborating on web, 3D interactive, and Android projects or connecting with fellow developers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Direct Channels */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1124]/92 p-7">
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Direct Channels
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Reach out directly via email or explore my repositories and code activity on GitHub.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070c1b] p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Email Address
                </p>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <a
                    href={`mailto:${DEVELOPER_IDENTITY.email}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 truncate"
                  >
                    <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate">{DEVELOPER_IDENTITY.email}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => void handleCopyEmail()}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors shrink-0"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <a
                href={DEVELOPER_IDENTITY.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => audioEngine.playClick()}
                className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070c1b] p-4 hover:border-blue-500/60 dark:hover:border-cyan-400/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5 text-slate-800 dark:text-white shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      GitHub Profile
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      github.com/{DEVELOPER_IDENTITY.githubUsername}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </div>

          <p className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            Based in {DEVELOPER_IDENTITY.location} · Available for learning collaborations &amp; open-source projects.
          </p>
        </div>

        {/* Validated Contact Form */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1124]/92 p-7">
          {submitted ? (
            <div className="h-full flex flex-col justify-center items-start py-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-4">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Message Prepared for Delivery
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                Thank you, <strong>{form.name}</strong>. Because this portfolio is hosted statically
                for GitHub Pages, click below to dispatch your validated message directly through
                your email client—or send another note.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={mailtoHref}
                  onClick={() => audioEngine.playClick()}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Open in Email Client</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playClick();
                    setSubmitted(false);
                    setForm({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Write Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Alex Rivera"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070c1b] px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="alex@example.com"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070c1b] px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Project collaboration or question"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070c1b] px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-rose-500">{errors.subject}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell me about your idea, project, or opportunity..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070c1b] px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none resize-y"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-rose-500">{errors.message}</p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  onMouseEnter={() => audioEngine.playHover()}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
