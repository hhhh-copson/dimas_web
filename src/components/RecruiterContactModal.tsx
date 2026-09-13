import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  X,
  Send,
  Building,
  Mail,
  User,
  MessageSquare,
  DollarSign,
  CheckCircle2,
  Linkedin,
  ExternalLink,
  Sparkles,
  Instagram,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { openWhatsAppSafely, formatSocialUrl } from '../utils/social';

export const RecruiterContactModal: React.FC = () => {
  const { isRecruiterModalOpen, setIsRecruiterModalOpen, submitRecruiterInquiry, data } = usePortfolio();

  const [recruiterName, setRecruiterName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState<
    'Full-Time Offer' | 'Contract / Freelance' | 'Interview Invitation' | 'Informal Chat'
  >('Full-Time Offer');
  const [message, setMessage] = useState('');
  const [budgetOrSalary, setBudgetOrSalary] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isRecruiterModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recruiterName || !companyName || !email) return;

    submitRecruiterInquiry({
      recruiterName,
      companyName,
      email,
      inquiryType,
      message: message || `Halo Dimas, kami tertarik berdiskusi peluang kerja sama untuk tipe: ${inquiryType}.`,
      budgetOrSalary,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsRecruiterModalOpen(false);
      setRecruiterName('');
      setCompanyName('');
      setEmail('');
      setMessage('');
      setBudgetOrSalary('');
    }, 2500);
  };

  const handleDirectWhatsApp = () => {
    const text = `Halo ${data.profile.fullName},\nSaya ${recruiterName || 'Rekruter'} dari ${companyName || 'Perusahaan'}.\nSaya tertarik dengan portofolio & sertifikasi Anda dan ingin berdiskusi peluang karir.`;
    openWhatsAppSafely(data.profile.socialLinks.whatsapp, text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsRecruiterModalOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 my-8 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={() => setIsRecruiterModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
              Pesan Berhasil Terkirim!
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              Terima kasih telah menghubungi {data.profile.fullName}. Notifikasi real-time telah diteruskan ke dasbor.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 w-fit mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Portal Rekruter & Klien Terintegrasi</span>
            </div>

            <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
              Kirim Tawaran atau Jadwalkan Interview
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Isi formulir ringkas di bawah atau hubungi langsung melalui WhatsApp / LinkedIn.
            </p>

            {/* Direct Social Shortcuts */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Pilihan respon super cepat:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDirectWhatsApp}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Instan</span>
                </button>
                <a
                  href={data.profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Inquiry Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Anda / Rekruter *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Wijaya"
                      value={recruiterName}
                      onChange={(e) => setRecruiterName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Perusahaan / Startup *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. PT Tech Nusantara Global"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Kerja *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="sarah@perusahaan.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipe Keperluan / Peluang
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) =>
                      setInquiryType(
                        e.target.value as
                          | 'Full-Time Offer'
                          | 'Contract / Freelance'
                          | 'Interview Invitation'
                          | 'Informal Chat'
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Full-Time Offer">Peluang Full-Time</option>
                    <option value="Contract / Freelance">Proyek Kontrak / Freelance</option>
                    <option value="Interview Invitation">Undangan Wawancara</option>
                    <option value="Informal Chat">Diskusi / Networking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimasi Budget / Range Gaji (Opsional)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. IDR 35M - 50M / bulan atau negotiable"
                    value={budgetOrSalary}
                    onChange={(e) => setBudgetOrSalary(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pesan atau Detail Tawaran
                </label>
                <textarea
                  rows={3}
                  placeholder="Ceritakan gambaran peran, teknologi yang digunakan, atau waktu yang nyaman untuk interview..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecruiterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke Kandidat</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};
