import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  MapPin,
  Briefcase,
  Download,
  Send,
  Linkedin,
  Github,
  Mail,
  MessageSquare,
  Award,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Share2,
  Instagram,
  Facebook,
  Youtube,
  Video,
} from 'lucide-react';
import { motion } from 'motion/react';
import { getWhatsAppUrl, formatSocialUrl } from '../utils/social';

export const HeroProfile: React.FC = () => {
  const { data, setIsRecruiterModalOpen, logProfileVisit } = usePortfolio();
  const { profile, certifications, projects } = data;

  const handleDownloadCv = (e: React.MouseEvent) => {
    e.preventDefault();
    logProfileVisit('Unduh CV / Resume', false);

    if (profile.resumeUrl && profile.resumeUrl.startsWith('http')) {
      const a = document.createElement('a');
      a.href = profile.resumeUrl;
      a.target = '_blank';
      a.rel = 'noreferrer';
      a.click();
      return;
    }

    // Generate downloadable Resume HTML file safely without popup blocking in iframe
    const resumeHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <title>CV Resume - ${profile.fullName}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: auto; line-height: 1.6; }
    h1 { color: #0f172a; margin-bottom: 4px; font-size: 28px; }
    .headline { color: #4338ca; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
    .section-title { font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin-top: 24px; color: #0f172a; }
    .cert-item { margin-bottom: 12px; }
    .meta { color: #64748b; font-size: 13px; }
  </style>
</head>
<body>
  <h1>${profile.fullName}</h1>
  <div class="headline">${profile.headline}</div>
  <p><strong>Lokasi:</strong> ${profile.location} | <strong>Email:</strong> ${profile.socialLinks.email} | <strong>LinkedIn:</strong> ${profile.socialLinks.linkedin}</p>
  <p>${profile.bio}</p>
  
  <h2 class="section-title">Sertifikasi Profesional Terverifikasi</h2>
  ${certifications.map(c => `
    <div class="cert-item">
      <strong>${c.title}</strong> — ${c.issuer} (${c.issueDate})<br/>
      <span class="meta">ID Kredensial: ${c.credentialId}</span>
    </div>
  `).join('')}

  <h2 class="section-title">Portofolio Proyek Unggulan</h2>
  ${projects.map(p => `
    <div class="cert-item">
      <strong>${p.title}</strong> [${p.category}]<br/>
      <span>${p.summary}</span>
    </div>
  `).join('')}
</body>
</html>`;

    const blob = new Blob([resumeHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV-${profile.fullName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.fullName + ' - Portofolio Profesional',
          text: profile.headline,
          url: window.location.href,
        });
      } catch {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link portofolio berhasil disalin ke clipboard!');
    }
  };

  return (
    <section id="profile" className="pt-6 sm:pt-8 pb-14 sm:pb-16 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 dark:opacity-20 blur-3xl -z-10 overflow-hidden">
        <div className="w-96 h-96 bg-indigo-500/30 rounded-full absolute -top-10 left-1/4"></div>
        <div className="w-80 h-80 bg-purple-500/25 rounded-full absolute top-10 right-1/4"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Column: Avatar & Quick Status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-5 lg:col-span-4 flex flex-col items-center md:items-start"
          >
            <div className="relative group w-64 sm:w-72 md:w-full md:max-w-[270px] lg:max-w-none mx-auto md:mx-0">
              {/* Decorative outline glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 rounded-3xl opacity-60 blur-lg group-hover:opacity-90 transition duration-500"></div>

              <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800 shadow-xl">
                <img
                  src={profile.avatarUrl}
                  alt={`Foto Profil ${profile.fullName}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-72 xs:h-80 md:h-76 lg:h-88 object-cover object-center transform group-hover:scale-105 transition duration-500"
                />

                {/* Verified Tech Pro Badge Overlay */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Terverifikasi BNSP & Cloud</span>
                </div>

                {/* Availability status badge */}
                <div className="absolute bottom-3 inset-x-3 p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-white flex items-center gap-2.5 shadow-lg">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div className="text-xs leading-tight min-w-0">
                    <p className="font-semibold text-emerald-300">Siap Bekerja Segera</p>
                    <p className="text-[11px] text-slate-300 truncate">Full-time / Kontrak / Konsultan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Location & Experience Badge */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-center md:text-left">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                {profile.location}
              </span>
            </div>
          </motion.div>

          {/* Right Column: Hero Details & Recruiter Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-7 lg:col-span-8 flex flex-col items-center md:items-start text-center md:text-left"
          >
            {/* Greeting pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Rekruter & Klien Friendly Portfolio</span>
            </div>

            {/* Name */}
            <h1 className="font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
              {profile.fullName}
            </h1>

            {/* Headline */}
            <h2 className="mt-2 text-base sm:text-lg lg:text-xl font-semibold text-indigo-600 dark:text-indigo-400 max-w-2xl">
              {profile.headline}
            </h2>

            {/* Bio */}
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl px-1 sm:px-0">
              {profile.bio}
            </p>

            {/* Social Media Integration Bar for Recruiters & Visitors */}
            <div className="mt-5 sm:mt-6 w-full pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 w-full sm:w-auto text-center md:text-left mb-1 sm:mb-0">
                Media Sosial:
              </span>

              {/* WhatsApp Quick Chat (Hanya menggunakan nomor telepon) */}
              {profile.socialLinks.whatsapp && (
                <a
                  href={getWhatsAppUrl(
                    profile.socialLinks.whatsapp,
                    `Halo ${profile.fullName}, saya melihat portofolio Anda dan ingin berdiskusi peluang kerja sama.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Chat WhatsApp: ${profile.socialLinks.whatsapp}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white transition text-xs font-semibold border border-emerald-500/25"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {/* Instagram (IG) */}
              {profile.socialLinks.instagram && (
                <a
                  href={formatSocialUrl('instagram', profile.socialLinks.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram Profil"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-600 hover:to-rose-600 text-pink-700 dark:text-pink-400 hover:text-white transition text-xs font-semibold border border-pink-500/25"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {/* TikTok */}
              {profile.socialLinks.tiktok && (
                <a
                  href={formatSocialUrl('tiktok', profile.socialLinks.tiktok)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Akun TikTok"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/10 hover:bg-slate-900 dark:hover:bg-black text-cyan-800 dark:text-cyan-300 hover:text-white transition text-xs font-semibold border border-cyan-500/25"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>TikTok</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {/* Facebook (FB) */}
              {profile.socialLinks.facebook && (
                <a
                  href={formatSocialUrl('facebook', profile.socialLinks.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook Profil"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-700 dark:text-blue-400 hover:text-white transition text-xs font-semibold border border-blue-500/25"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {/* LinkedIn */}
              {profile.socialLinks.linkedin && (
                <a
                  href={formatSocialUrl('linkedin', profile.socialLinks.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn Profil"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white transition text-xs font-semibold border border-[#0A66C2]/20"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {/* GitHub */}
              {profile.socialLinks.github && (
                <a
                  href={formatSocialUrl('github', profile.socialLinks.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub Repository"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/10 dark:bg-white/10 hover:bg-slate-900 dark:hover:bg-white text-slate-800 dark:text-slate-200 dark:hover:text-slate-900 transition text-xs font-semibold border border-slate-300 dark:border-slate-700"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {/* YouTube */}
              {profile.socialLinks.youtube && (
                <a
                  href={formatSocialUrl('youtube', profile.socialLinks.youtube)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="YouTube Channel"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white transition text-xs font-semibold border border-red-500/25"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {/* Email Direct */}
              {profile.socialLinks.email && (
                <a
                  href={`mailto:${profile.socialLinks.email}?subject=Diskusi Peluang Karir untuk ${profile.fullName}`}
                  title={`Email: ${profile.socialLinks.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white transition text-xs font-semibold border border-rose-500/20"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              )}

              {/* Share button */}
              <button
                onClick={handleShareProfile}
                title="Bagikan Portofolio"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-xs font-medium cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan</span>
              </button>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center md:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsRecruiterModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>Kirim Penawaran / Kontak Rekruter</span>
              </button>

              <button
                onClick={handleDownloadCv}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100 font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Unduh CV / Resume</span>
              </button>

              <a
                href="#certifications"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold text-sm flex items-center justify-center gap-1.5 transition"
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>Verifikasi Sertifikasi ({certifications.length})</span>
              </a>
            </div>

            {/* Key Metrics Bento row */}
            <div className="mt-8 w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="block font-heading text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
                  {profile.yearsOfExperience}+ Tahun
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium block truncate">
                  Pengalaman Rekayasa
                </span>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="block font-heading text-lg sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 truncate">
                  {certifications.length} Lisensi
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium block truncate">
                  Sertifikasi Resmi
                </span>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="block font-heading text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
                  {projects.length}+ Produk
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium block truncate">
                  Proyek Dirilis
                </span>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="block font-heading text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
                  100%
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium block truncate">
                  Kepuasan Klien
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
