import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Certification, CertificationCategory } from '../types';
import {
  Award,
  Search,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Copy,
  Check,
  Sparkles,
  Filter,
  Eye,
  PlusCircle,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CertificationsSection: React.FC = () => {
  const { data, logProfileVisit, setIsCmsOpen } = usePortfolio();
  const { certifications } = data;

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModalCert, setActiveModalCert] = useState<Certification | null>(null);

  const categories: string[] = ['Semua', 'Cloud & DevOps', 'Software Engineering', 'Data & AI', 'Cybersecurity'];

  const filteredCertifications = useMemo(() => {
    return certifications.filter((cert) => {
      const matchCategory = selectedCategory === 'Semua' || cert.category === selectedCategory;
      const matchSearch =
        cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.credentialId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [certifications, selectedCategory, searchQuery]);

  const handleCopyCredential = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenCertDetail = (cert: Certification) => {
    setActiveModalCert(cert);
    logProfileVisit(`Pemeriksaan Detail Sertifikat: ${cert.title}`, false);
  };

  return (
    <section id="certifications" className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Kredensial Profesional Terakreditasi</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Blok Sertifikasi & Lisensi Resmi
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Bukti kompetensi rekayasa perangkat lunak dan arsitektur cloud bertaraf internasional dan terverifikasi secara publik.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCmsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-indigo-500" />
              <span>Kelola di CMS</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8">
          {/* Categories Tab Pill */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari sertifikasi, ID, keahlian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Certifications Grid */}
        {filteredCertifications.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tidak ada sertifikasi yang cocok dengan filter.
            </p>
            <p className="text-xs text-slate-500 mt-1">Coba kata kunci pencarian lain atau ubah kategori.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertifications.map((cert) => (
              <motion.div
                key={cert.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleOpenCertDetail(cert)}
                className="group relative rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 p-4 sm:p-5 shadow-xs hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Card Top */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {cert.issuerLogo ? (
                        <img
                          src={cert.issuerLogo}
                          alt={cert.issuer}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                          <Award className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block">
                          {cert.issuer}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{cert.category}</span>
                      </div>
                    </div>

                    {cert.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Unggulan
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3.5 font-heading text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                    {cert.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {cert.description}
                  </p>

                  {/* Skills tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cert.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {cert.skills.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                        +{cert.skills.length - 3} lagi
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Bottom / Verification Info */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Terbit: {cert.issueDate}
                    </span>
                    {cert.scoreOrGrade && (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                        {cert.scoreOrGrade}
                      </span>
                    )}
                  </div>

                  {/* Credential ID & Actions */}
                  <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <div className="min-w-0">
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        ID Kredensial
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {cert.credentialId}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleCopyCredential(cert.credentialId, e)}
                        title="Salin ID Kredensial"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        {copiedId === cert.credentialId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Verifikasi Kredensial Resmi"
                        className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-1 text-[11px] font-semibold px-2 cursor-pointer shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verifikasi</span>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Certificate Detail Modal */}
        <AnimatePresence>
          {activeModalCert && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveModalCert(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 z-10 max-h-[88vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveModalCert(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Certificate Badge Visual Preview */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white relative overflow-hidden border border-indigo-500/30 mb-6 shadow-inner">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Award className="w-48 h-48" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                        {activeModalCert.issuer}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Terakreditasi
                      </span>
                    </div>

                    <h4 className="font-heading text-xl font-bold mt-3 leading-snug">
                      {activeModalCert.title}
                    </h4>

                    <p className="text-xs text-slate-300 mt-2">
                      Diberikan kepada: <strong className="text-white">{data.profile.fullName}</strong>
                    </p>

                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 font-mono">
                      <span>ID: {activeModalCert.credentialId}</span>
                      <span>{activeModalCert.issueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Description & Competencies */}
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Deskripsi Kompetensi
                    </h5>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeModalCert.description}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Keahlian Teruji
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {activeModalCert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="text-slate-400 block">Tanggal Terbit</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {activeModalCert.issueDate}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="text-slate-400 block">Masa Berlaku</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {activeModalCert.expirationDate || 'Seumur Hidup (Lifetime)'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setActiveModalCert(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      Tutup
                    </button>

                    <a
                      href={activeModalCert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Verifikasi di Portal Resmi
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
