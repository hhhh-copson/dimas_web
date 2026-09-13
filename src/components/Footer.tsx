import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Heart,
  Linkedin,
  Github,
  Mail,
  MessageSquare,
  ShieldCheck,
  Settings,
  ArrowUp,
  Instagram,
  Facebook,
  Youtube,
  Video,
} from 'lucide-react';
import { getWhatsAppUrl, formatSocialUrl } from '../utils/social';

export const Footer: React.FC = () => {
  const { data, setIsCmsOpen } = usePortfolio();
  const { profile, seo } = data;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 pt-12 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
          {/* Brand & Mission */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white font-heading font-bold flex items-center justify-center text-sm shadow-md">
                {profile.fullName.charAt(0)}
              </div>
              <span className="font-heading font-bold text-slate-900 dark:text-white text-base">
                {profile.fullName}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              {profile.headline}. Berkomitmen menghadirkan solusi teknologi mutakhir dengan arsitektur cloud teruji dan kode berstandar enterprise.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Sertifikasi Terverifikasi oleh Google Cloud, AWS & BNSP RI</span>
            </div>
          </div>

          {/* Recruiter & Social Media Access */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <span className="font-heading font-bold uppercase tracking-wider text-slate-900 dark:text-white block">
              Media Sosial & Kontak
            </span>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              {profile.socialLinks.whatsapp && (
                <li>
                  <a
                    href={getWhatsAppUrl(profile.socialLinks.whatsapp, `Halo ${profile.fullName}, saya ingin berdiskusi peluang karir.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 break-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 
                    <span>WhatsApp ({profile.socialLinks.whatsapp})</span>
                  </a>
                </li>
              )}
              {profile.socialLinks.linkedin && (
                <li>
                  <a
                    href={formatSocialUrl('linkedin', profile.socialLinks.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" /> LinkedIn Profile
                  </a>
                </li>
              )}
              {profile.socialLinks.github && (
                <li>
                  <a
                    href={formatSocialUrl('github', profile.socialLinks.github)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5"
                  >
                    <Github className="w-3.5 h-3.5" /> GitHub Repository
                  </a>
                </li>
              )}
              {profile.socialLinks.instagram && (
                <li>
                  <a
                    href={formatSocialUrl('instagram', profile.socialLinks.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-600 dark:hover:text-pink-400 flex items-center gap-1.5"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram
                  </a>
                </li>
              )}
              {profile.socialLinks.tiktok && (
                <li>
                  <a
                    href={formatSocialUrl('tiktok', profile.socialLinks.tiktok)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5 text-cyan-600" /> TikTok
                  </a>
                </li>
              )}
              {profile.socialLinks.facebook && (
                <li>
                  <a
                    href={formatSocialUrl('facebook', profile.socialLinks.facebook)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5"
                  >
                    <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
                  </a>
                </li>
              )}
              {profile.socialLinks.email && (
                <li>
                  <a
                    href={`mailto:${profile.socialLinks.email}`}
                    className="hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-rose-500" /> {profile.socialLinks.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Quick CMS & Meta */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <span className="font-heading font-bold uppercase tracking-wider text-slate-900 dark:text-white block">
              Manajemen Konten
            </span>
            <p className="text-slate-500">
              Perbarui seluruh konten portofolio, sertifikasi, dan SEO melalui panel terintegrasi.
            </p>
            <button
              onClick={() => setIsCmsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition font-semibold"
            >
              <Settings className="w-3.5 h-3.5" />
              Buka Panel CMS
            </button>
          </div>
        </div>

        {/* Bottom copyright & back to top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} {profile.fullName}. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              Dibuat dengan React & Tailwind CSS
            </span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Kembali ke atas"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
