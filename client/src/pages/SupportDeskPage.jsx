import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Shield,
} from 'lucide-react';
import api from '../services/api';

export const SupportDeskPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(1);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [ward, setWard] = useState(14);
  const [category, setCategory] = useState('SLA_INQUIRY');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await api.get('/support/faqs');
        if (res.success && res.data) {
          setFaqs(res.data);
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchFaqs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/support/inquiries', {
        fullName,
        email,
        ward: Number(ward),
        category,
        description,
      });

      if (res.success && res.data) {
        setSubmittedTicket(res.data.ticketId);
        setDescription('');
      }
    } catch (err) {
      alert('Failed to submit inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1">
          <span>Urban Scene &bull; Know what’s moving.</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Civic Support & Ward Nodal Helpdesk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Direct assistance for report escalations, municipal SLA grievances, and ward contact numbers.
        </p>
      </div>

      {/* Emergency Callout */}
      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-rose-600 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white">24x7 Control Room Emergency:</span>{' '}
            <span className="text-slate-600 dark:text-slate-300">1800-22-3450 (MBMC Desk) / 112 (National)</span>
          </div>
        </div>
        <a
          href="tel:112"
          className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
        >
          Call 112 Now
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Support Inquiry Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Submit Grievance / Inquiry
            </h3>
            <p className="text-xs text-slate-400">Response guaranteed within 24 operational hours</p>
          </div>

          {submittedTicket && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Inquiry submitted! Case Reference: <strong>{submittedTicket}</strong></span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold mb-1 block">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Aarav Sharma"
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@domain.com"
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Municipal Ward</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
                >
                  <option value={14}>Ward 14 (Kanakia)</option>
                  <option value={4}>Ward 4 (Bhayandar W)</option>
                  <option value={1}>Ward 1 (Bhayandar E)</option>
                  <option value={9}>Ward 9 (Penkarpada)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
              >
                <option value="SLA_INQUIRY">SLA Delay / Work Order Status</option>
                <option value="TECHNICAL_BUG">Platform Technical Glitch</option>
                <option value="ACCOUNT_ACCESS">DigiLocker / Account Verification</option>
                <option value="WARD_COMPLAINT">General Ward Sanitation Complaint</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Message / Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="State your ticket ID if following up on an existing report..."
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting...' : 'Log Inquiry with Nodal Desk'}</span>
            </button>
          </form>
        </div>

        {/* Ward Nodal Officers & FAQs */}
        <div className="space-y-6">
          {/* Ward Liaison Directory */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Ward Nodal Engineering Directory
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Ward 14 (Kanakia)</div>
                  <div className="text-[11px] text-slate-400">Er. R.K. Shinde &bull; Junior Engineer</div>
                </div>
                <a href="tel:02228114400" className="font-mono font-bold text-blue-600 hover:underline">
                  022-2811-4400
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Ward 4 (Bhayandar W)</div>
                  <div className="text-[11px] text-slate-400">Er. S. Patil &bull; Executive Engineer</div>
                </div>
                <a href="tel:02228114412" className="font-mono font-bold text-blue-600 hover:underline">
                  022-2811-4412
                </a>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
            <div className="space-y-2">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-xl border border-slate-200/60 dark:border-white/5 overflow-hidden text-xs"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full p-3 text-left font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between transition-colors"
                  >
                    <span>{faq.question}</span>
                    {openFaq === faq.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === faq.id && (
                    <div className="p-3 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs border-t border-slate-100 dark:border-white/5">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDeskPage;
