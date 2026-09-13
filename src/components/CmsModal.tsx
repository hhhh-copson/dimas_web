import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  ProfileData,
  Certification,
  Project,
  Experience,
  CertificationCategory,
  PortfolioState,
  RecruiterInquiry,
} from '../types';
import {
  X,
  User,
  Award,
  Layers,
  Briefcase,
  Globe,
  Inbox,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Trash2,
  Edit2,
  Save,
  Plus,
  AlertTriangle,
  MapPin,
  Calendar,
  Building,
  Check,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  Shield,
  ShieldCheck,
  Phone,
  Mail,
  Linkedin,
  Github,
  Instagram,
  Facebook,
  Youtube,
  Video,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cleanWhatsAppNumber, getWhatsAppUrl, openWhatsAppSafely, formatSocialUrl } from '../utils/social';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export const CmsModal: React.FC = () => {
  const {
    isCmsOpen,
    setIsCmsOpen,
    data,
    updateProfile,
    addCertification,
    updateCertification,
    deleteCertification,
    addProject,
    updateProject,
    deleteProject,
    addExperience,
    updateExperience,
    deleteExperience,
    deleteInquiry,
    resetToDefault,
    importPortfolioData,
    changeCmsPin,
    logoutCms,
    isCloudConnected,
    isSyncing,
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'certifications' | 'projects' | 'experience' | 'security' | 'inquiries' | 'backup'
  >('profile');

  // Form states
  const [profileForm, setProfileForm] = useState(data.profile);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // Security / PIN change states
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showSecurityPins, setShowSecurityPins] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // In-app Confirmation Modal State (replaces blocked window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    const masterPin = data.cmsPin || 'dimas123';
    if (currentPinInput.trim() !== masterPin.trim()) {
      setSecurityError('Kata sandi saat ini yang Anda masukkan salah!');
      return;
    }
    if (newPinInput.trim().length < 4) {
      setSecurityError('Kata sandi baru minimal harus 4 karakter!');
      return;
    }
    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setSecurityError('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }
    changeCmsPin(newPinInput.trim());
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    showSaveSuccess('Kata sandi CMS berhasil diperbarui!');
  };

  // Keep forms synchronized with latest data when CMS opens or data updates
  useEffect(() => {
    if (isCmsOpen) {
      setProfileForm(data.profile);
    }
  }, [isCmsOpen, data.profile]);

  // Certifications state
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certForm, setCertForm] = useState<Omit<Certification, 'id'>>({
    title: '',
    issuer: '',
    issuerLogo: '',
    issueDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
    category: 'Cloud & DevOps',
    description: '',
    skills: [],
    isFeatured: true,
    scoreOrGrade: '',
  });
  const [certSkillInput, setCertSkillInput] = useState('');

  // Projects state
  const [isAddingProj, setIsAddingProj] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [projForm, setProjForm] = useState<Omit<Project, 'id'>>({
    title: '',
    summary: '',
    description: '',
    category: 'Full Stack',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
    tags: ['React', 'TypeScript'],
    liveUrl: '',
    githubUrl: '',
    featured: false,
    metrics: '',
  });
  const [projTagInput, setProjTagInput] = useState('');

  // Experience state
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expForm, setExpForm] = useState<Omit<Experience, 'id'>>({
    role: '',
    company: '',
    location: '',
    period: '',
    type: 'Full-time',
    highlights: [],
    skills: [],
  });
  const [expHighlightInput, setExpHighlightInput] = useState('');
  const [expSkillInput, setExpSkillInput] = useState('');

  // Notification for save
  const showSaveSuccess = (msg: string) => {
    setSavedSuccessMessage(msg);
    setTimeout(() => setSavedSuccessMessage(null), 3500);
  };

  if (!isCmsOpen) return null;

  // Profile save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const rawWa = profileForm.socialLinks.whatsapp || '';
    const cleanedWa = cleanWhatsAppNumber(rawWa);
    const updatedData: ProfileData = {
      ...profileForm,
      socialLinks: {
        ...profileForm.socialLinks,
        whatsapp: cleanedWa || rawWa,
      },
    };
    updateProfile(updatedData);
    setProfileForm(updatedData);
    showSaveSuccess('Data profil & media sosial (WhatsApp, Instagram, TikTok, dll) berhasil disimpan!');
  };

  // Cert handlers
  const handleSaveCertification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.title.trim() || !certForm.issuer.trim()) return;

    if (editingCertId) {
      updateCertification(editingCertId, certForm);
      showSaveSuccess(`Sertifikasi "${certForm.title}" berhasil diperbarui!`);
    } else {
      addCertification(certForm);
      showSaveSuccess(`Sertifikasi baru "${certForm.title}" berhasil ditambahkan!`);
    }
    setIsAddingCert(false);
    setEditingCertId(null);
  };

  const handleStartEditCert = (cert: Certification) => {
    setEditingCertId(cert.id);
    setCertForm({
      title: cert.title,
      issuer: cert.issuer,
      issuerLogo: cert.issuerLogo || '',
      issueDate: cert.issueDate,
      expirationDate: cert.expirationDate || '',
      credentialId: cert.credentialId,
      credentialUrl: cert.credentialUrl,
      category: cert.category,
      description: cert.description,
      skills: [...(cert.skills || [])],
      isFeatured: cert.isFeatured,
      scoreOrGrade: cert.scoreOrGrade || '',
    });
    setIsAddingCert(true);
  };

  const handlePromptDeleteCert = (cert: Certification) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Sertifikasi?',
      message: `Apakah Anda yakin ingin menghapus sertifikasi "${cert.title}" dari penerbit ${cert.issuer}? Tindakan ini akan segera memperbarui portofolio Anda.`,
      confirmLabel: 'Ya, Hapus Sertifikasi',
      onConfirm: () => {
        deleteCertification(cert.id);
        setConfirmDialog(null);
        showSaveSuccess(`Sertifikasi "${cert.title}" berhasil dihapus.`);
      },
    });
  };

  // Project handlers
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projForm.title.trim() || !projForm.summary.trim()) return;

    if (editingProjId) {
      updateProject(editingProjId, projForm);
      showSaveSuccess(`Proyek "${projForm.title}" berhasil diperbarui!`);
    } else {
      addProject(projForm);
      showSaveSuccess(`Proyek baru "${projForm.title}" berhasil ditambahkan!`);
    }
    setIsAddingProj(false);
    setEditingProjId(null);
  };

  const handleStartEditProj = (proj: Project) => {
    setEditingProjId(proj.id);
    setProjForm({
      title: proj.title,
      summary: proj.summary,
      description: proj.description,
      category: proj.category,
      imageUrl: proj.imageUrl,
      tags: [...(proj.tags || [])],
      liveUrl: proj.liveUrl || '',
      githubUrl: proj.githubUrl || '',
      featured: proj.featured,
      metrics: proj.metrics || '',
    });
    setIsAddingProj(true);
  };

  const handlePromptDeleteProj = (proj: Project) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Proyek?',
      message: `Apakah Anda yakin ingin menghapus proyek "${proj.title}"? Karya ini tidak akan lagi tampil di halaman portofolio.`,
      confirmLabel: 'Ya, Hapus Proyek',
      onConfirm: () => {
        deleteProject(proj.id);
        setConfirmDialog(null);
        showSaveSuccess(`Proyek "${proj.title}" berhasil dihapus.`);
      },
    });
  };

  // Experience handlers
  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.role.trim() || !expForm.company.trim()) return;

    if (editingExpId) {
      updateExperience(editingExpId, expForm);
      showSaveSuccess(`Pengalaman kerja "${expForm.role}" di ${expForm.company} berhasil diperbarui!`);
    } else {
      addExperience(expForm);
      showSaveSuccess(`Pengalaman kerja baru "${expForm.role}" di ${expForm.company} berhasil ditambahkan!`);
    }
    setIsAddingExp(false);
    setEditingExpId(null);
  };

  const handleStartEditExp = (exp: Experience) => {
    setEditingExpId(exp.id);
    setExpForm({
      role: exp.role,
      company: exp.company,
      location: exp.location,
      period: exp.period,
      type: exp.type,
      highlights: [...(exp.highlights || [])],
      skills: [...(exp.skills || [])],
    });
    setIsAddingExp(true);
  };

  const handlePromptDeleteExp = (exp: Experience) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Pengalaman Kerja?',
      message: `Apakah Anda yakin ingin menghapus posisi "${exp.role}" di ${exp.company}?`,
      confirmLabel: 'Ya, Hapus Pengalaman',
      onConfirm: () => {
        deleteExperience(exp.id);
        setConfirmDialog(null);
        showSaveSuccess(`Pengalaman kerja "${exp.role}" di ${exp.company} berhasil dihapus.`);
      },
    });
  };

  // Inquiry handlers
  const handlePromptDeleteInquiry = (inq: RecruiterInquiry) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Pesan Rekruter?',
      message: `Hapus pesan tawaran dari ${inq.recruiterName} (${inq.companyName})?`,
      confirmLabel: 'Ya, Hapus Pesan',
      onConfirm: () => {
        deleteInquiry(inq.id);
        setConfirmDialog(null);
        showSaveSuccess('Pesan rekruter berhasil dihapus.');
      },
    });
  };

  // Reset handler
  const handlePromptReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Seluruh Data Portofolio?',
      message: 'PERINGATAN: Tindakan ini akan mengembalikan semua data profil, sertifikasi, proyek, pengalaman kerja, dan pengaturan SEO ke data awal semula. Lanjutkan?',
      confirmLabel: 'Ya, Reset ke Data Awal',
      onConfirm: () => {
        resetToDefault();
        setConfirmDialog(null);
        showSaveSuccess('Portofolio telah berhasil direset ke data awal bawaan.');
      },
    });
  };

  // JSON Export & Import
  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `portofolio-${data.profile.fullName.toLowerCase().replace(/\s+/g, '-')}-backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showSaveSuccess('Backup data JSON berhasil diunduh ke perangkat Anda!');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const ok = importPortfolioData(parsed as PortfolioState);
        if (ok) {
          setProfileForm(parsed.profile);
          showSaveSuccess('Data portofolio berhasil diimpor dan disimpan!');
        } else {
          showSaveSuccess('Format file JSON tidak sesuai dengan skema portofolio.');
        }
      } catch {
        showSaveSuccess('Gagal membaca file JSON. Pastikan format file valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsCmsOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Main CMS Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[92vh] z-10 overflow-hidden"
      >
        {/* CMS Top Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Sistem Manajemen Konten (CMS)
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  AUTO-SAVE
                </span>
                {isCloudConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    FIRESTORE LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    SYNCING...
                  </span>
                )}
                {isSyncing && (
                  <span className="text-[10px] text-indigo-500 font-mono animate-pulse">
                    Menyimpan...
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Kelola profil, sertifikasi, proyek, pengalaman kerja, dan SEO secara real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedSuccessMessage && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-xs animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {savedSuccessMessage}
              </span>
            )}
            <button
              onClick={() => {
                logoutCms();
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Kunci CMS & Keluar"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kunci CMS</span>
            </button>
            <button
              onClick={() => setIsCmsOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Tutup CMS"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-3 sm:px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil & Medsos</span>
          </button>

          <button
            onClick={() => setActiveTab('certifications')}
            className={`px-3.5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'certifications'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Sertifikasi ({data.certifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3.5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'projects'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Proyek ({data.projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('experience')}
            className={`px-3.5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'experience'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Pengalaman Kerja ({data.experiences.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>Keamanan Sandi CMS</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-3.5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'inquiries'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Pesan Rekruter ({data.inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'backup'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Backup & Reset</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60 dark:bg-slate-950/40">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="max-w-4xl space-y-6">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" />
                  Informasi Profil Pokok
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap & Gelar *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Headline Profesional *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.headline}
                      onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ringkasan Bio Profil Singkat
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Lokasi Domisili & Kesediaan Kerja
                    </label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Status Ketersediaan Rekrutmen
                    </label>
                    <select
                      value={profileForm.availabilityStatus}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          availabilityStatus: e.target.value as ProfileData['availabilityStatus'],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="open_for_hire">Terbuka Untuk Bekerja (Open for Hire)</option>
                      <option value="open_for_contract">Kontrak & Freelance (Open for Contract)</option>
                      <option value="exploring">Menjelajahi Peluang Menarik (Exploring)</option>
                      <option value="busy">Sedang Sibuk (Not Available)</option>
                    </select>
                  </div>
                </div>

                {/* Photo Avatar URL & Preview */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Foto Profil
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={profileForm.avatarUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <input
                      type="text"
                      value={profileForm.avatarUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {/* Quick Presets for Photo */}
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Pilih foto sampel:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setProfileForm({
                          ...profileForm,
                          avatarUrl:
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                        })
                      }
                      className="hover:underline text-indigo-600 dark:text-indigo-400 cursor-pointer"
                    >
                      Foto 1 (Formal)
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setProfileForm({
                          ...profileForm,
                          avatarUrl:
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
                        })
                      }
                      className="hover:underline text-indigo-600 dark:text-indigo-400 cursor-pointer"
                    >
                      Foto 2 (Modern)
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setProfileForm({
                          ...profileForm,
                          avatarUrl:
                            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
                        })
                      }
                      className="hover:underline text-indigo-600 dark:text-indigo-400 cursor-pointer"
                    >
                      Foto 3 (Engineer)
                    </button>
                  </div>
                </div>

                {/* Stats Counters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pengalaman (Tahun)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={profileForm.yearsOfExperience}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          yearsOfExperience: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Proyek Selesai
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={profileForm.completedProjectsCount}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          completedProjectsCount: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Klien / Rekruter Puas
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={profileForm.happyClientsCount}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          happyClientsCount: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media & Contact Links */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    Integrasi Media Sosial & Kontak Rekruter
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Cukup masukkan nomor telepon untuk WhatsApp & username/link untuk medsos
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* WhatsApp - Nomor Saja */}
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <label className="block font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Nomor WhatsApp (Hanya Nomor, Bukan Link) *
                      </label>
                      {profileForm.socialLinks.whatsapp && (
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                          {getWhatsAppUrl(profileForm.socialLinks.whatsapp)}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={profileForm.socialLinks.whatsapp || ''}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            socialLinks: { ...profileForm.socialLinks, whatsapp: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Contoh: 081234567890 atau 6281234567890 (cukup nomor)"
                      />
                      {profileForm.socialLinks.whatsapp && (
                        <button
                          type="button"
                          onClick={() =>
                            openWhatsAppSafely(
                              profileForm.socialLinks.whatsapp,
                              'Halo, ini pesan uji coba WhatsApp dari CMS Portofolio Dimas Maulana.'
                            )
                          }
                          title="Coba Tes Tautan WhatsApp"
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs whitespace-nowrap flex items-center gap-1 transition shrink-0 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Tes WA</span>
                        </button>
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                      💡 <strong>Catatan:</strong> Tidak perlu mengetik <code>https://wa.me/</code>. Masukkan langsung nomor HP Anda (misal <code>081234567890</code>). Sistem secara otomatis mengonversinya ke tautan WhatsApp yang valid.
                    </p>
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-500" />
                      Instagram (IG)
                    </label>
                    <input
                      type="text"
                      value={profileForm.socialLinks.instagram || ''}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: { ...profileForm.socialLinks, instagram: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="@username atau https://instagram.com/..."
                    />
                    <p className="mt-0.5 text-[10px] text-slate-400">Contoh: @dimasmaulana atau dimas.dev</p>
                  </div>

                  {/* TikTok */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-cyan-600" />
                      TikTok
                    </label>
                    <input
                      type="text"
                      value={profileForm.socialLinks.tiktok || ''}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: { ...profileForm.socialLinks, tiktok: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="@username atau https://tiktok.com/@..."
                    />
                    <p className="mt-0.5 text-[10px] text-slate-400">Contoh: @dimas.tech atau https://tiktok.com/@dimas.tech</p>
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Facebook className="w-3.5 h-3.5 text-blue-600" />
                      Facebook (FB)
                    </label>
                    <input
                      type="text"
                      value={profileForm.socialLinks.facebook || ''}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: { ...profileForm.socialLinks, facebook: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="username atau https://facebook.com/..."
                    />
                    <p className="mt-0.5 text-[10px] text-slate-400">Nama profil Facebook atau tautan lengkap</p>
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                      Profil LinkedIn
                    </label>
                    <input
                      type="text"
                      value={profileForm.socialLinks.linkedin || ''}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: { ...profileForm.socialLinks, linkedin: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://linkedin.com/in/username atau username"
                    />
                    <p className="mt-0.5 text-[10px] text-slate-400">Tautan profil LinkedIn untuk akses rekruter</p>
                  </div>

                  {/* GitHub */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" />
                      GitHub Repository / Profil
                    </label>
                    <input
                      type="text"
                      value={profileForm.socialLinks.github || ''}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: { ...profileForm.socialLinks, github: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://github.com/username atau username"
                    />
                    <p className="mt-0.5 text-[10px] text-slate-400">Contoh: dimas-cloud atau https://github.com/dimas-cloud</p>
                  </div>

                  {/* YouTube */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Youtube className="w-3.5 h-3.5 text-red-600" />
                      YouTube Channel (Opsional)
                    </label>
                    <input
                      type="text"
                      value={profileForm.socialLinks.youtube || ''}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: { ...profileForm.socialLinks, youtube: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="@channel atau https://youtube.com/@..."
                    />
                    <p className="mt-0.5 text-[10px] text-slate-400">Channel video teknologi atau tutorial</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-rose-500" />
                      Email Kontak Utama *
                    </label>
                    <input
                      type="email"
                      value={profileForm.socialLinks.email || ''}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: { ...profileForm.socialLinks, email: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="email@domain.com"
                    />
                    <p className="mt-0.5 text-[10px] text-slate-400">Email untuk penerimaan notifikasi & inquiry</p>
                  </div>

                  {/* Resume / CV */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-indigo-500" />
                      Tautan Unduh CV / Resume
                    </label>
                    <input
                      type="text"
                      value={profileForm.resumeUrl || ''}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          resumeUrl: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="#download-cv atau URL Google Drive"
                    />
                    <p className="mt-0.5 text-[10px] text-slate-400">Tautan berkas PDF CV di Google Drive / Cloud</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan Profil
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" />
                    Daftar Sertifikasi ({data.certifications.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tambah kredensial baru, edit lisensi resmi, atau hapus data sertifikat
                  </p>
                </div>
                {!isAddingCert && (
                  <button
                    onClick={() => {
                      setEditingCertId(null);
                      setCertForm({
                        title: '',
                        issuer: '',
                        issuerLogo: '',
                        issueDate: new Date().toISOString().split('T')[0],
                        expirationDate: '',
                        credentialId: '',
                        credentialUrl: '',
                        category: 'Cloud & DevOps',
                        description: '',
                        skills: ['Cloud', 'Kubernetes'],
                        isFeatured: true,
                        scoreOrGrade: '',
                      });
                      setIsAddingCert(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Sertifikasi Baru
                  </button>
                )}
              </div>

              {/* Add / Edit Certification Form */}
              {isAddingCert && (
                <form
                  onSubmit={handleSaveCertification}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/50 shadow-lg space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h4 className="font-heading text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {editingCertId ? 'Edit Data Sertifikasi' : 'Form Tambah Sertifikasi Baru'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingCert(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Judul Sertifikasi *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Google Cloud Certified Professional Cloud Architect"
                        value={certForm.title}
                        onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Penerbit / Institusi *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Google Cloud / AWS / BNSP"
                        value={certForm.issuer}
                        onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Kategori</label>
                      <select
                        value={certForm.category}
                        onChange={(e) =>
                          setCertForm({
                            ...certForm,
                            category: e.target.value as CertificationCategory,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Cloud & DevOps">Cloud & DevOps</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Data & AI">Data & AI</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Professional & Soft Skills">Professional & Soft Skills</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Nomor / ID Kredensial *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. GCP-PCA-98214"
                        value={certForm.credentialId}
                        onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Nilai / Predikat (Opsional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Skor: 94% / Sangat Kompeten"
                        value={certForm.scoreOrGrade || ''}
                        onChange={(e) => setCertForm({ ...certForm, scoreOrGrade: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Tanggal Terbit</label>
                      <input
                        type="date"
                        value={certForm.issueDate}
                        onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Masa Berlaku / Kedaluwarsa</label>
                      <input
                        type="date"
                        value={certForm.expirationDate || ''}
                        onChange={(e) =>
                          setCertForm({ ...certForm, expirationDate: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">URL Verifikasi Resmi</label>
                    <input
                      type="url"
                      placeholder="https://credential.net/..."
                      value={certForm.credentialUrl}
                      onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Deskripsi Kompetensi</label>
                    <textarea
                      rows={2}
                      value={certForm.description}
                      onChange={(e) => setCertForm({ ...certForm, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Skills tags */}
                  <div>
                    <label className="block font-semibold mb-1">Keahlian Teruji (Tags)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ketik keahlian lalu tekan Enter atau klik Tambah..."
                        value={certSkillInput}
                        onChange={(e) => setCertSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (certSkillInput.trim()) {
                              setCertForm({
                                ...certForm,
                                skills: [...certForm.skills, certSkillInput.trim()],
                              });
                              setCertSkillInput('');
                            }
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (certSkillInput.trim()) {
                            setCertForm({
                              ...certForm,
                              skills: [...certForm.skills, certSkillInput.trim()],
                            });
                            setCertSkillInput('');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold cursor-pointer"
                      >
                        Tambah
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {certForm.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 font-medium"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() =>
                              setCertForm({
                                ...certForm,
                                skills: certForm.skills.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="cert-featured"
                      checked={certForm.isFeatured}
                      onChange={(e) => setCertForm({ ...certForm, isFeatured: e.target.checked })}
                      className="rounded text-indigo-600 cursor-pointer"
                    />
                    <label htmlFor="cert-featured" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Tandai sebagai Sertifikasi Unggulan di Halaman Depan
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddingCert(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Simpan Sertifikasi
                    </button>
                  </div>
                </form>
              )}

              {/* Existing Certifications List */}
              <div className="space-y-3">
                {data.certifications.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                    Belum ada sertifikasi. Klik tombol "Tambah Sertifikasi Baru" di atas.
                  </div>
                ) : (
                  data.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-white truncate">
                              {cert.title}
                            </h4>
                            {cert.isFeatured && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                Unggulan
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {cert.issuer} • <span className="font-mono">{cert.credentialId}</span> • <span className="text-indigo-600 dark:text-indigo-400">{cert.category}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleStartEditCert(cert)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handlePromptDeleteCert(cert)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    Portofolio Proyek ({data.projects.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perbarui showcase karya, link demo live, repositori, dan metrik hasil
                  </p>
                </div>
                {!isAddingProj && (
                  <button
                    onClick={() => {
                      setEditingProjId(null);
                      setProjForm({
                        title: '',
                        summary: '',
                        description: '',
                        category: 'Full Stack',
                        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
                        tags: ['React', 'Node.js'],
                        liveUrl: '',
                        githubUrl: '',
                        featured: false,
                        metrics: '',
                      });
                      setIsAddingProj(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Proyek Baru
                  </button>
                )}
              </div>

              {/* Form Add / Edit Project */}
              {isAddingProj && (
                <form
                  onSubmit={handleSaveProject}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/50 shadow-lg space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h4 className="font-heading text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {editingProjId ? 'Edit Data Proyek' : 'Form Tambah Proyek Baru'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingProj(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Judul Proyek *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CloudScale Microservices Platform"
                        value={projForm.title}
                        onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Kategori Proyek</label>
                      <select
                        value={projForm.category}
                        onChange={(e) =>
                          setProjForm({
                            ...projForm,
                            category: e.target.value as Project['category'],
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Full Stack">Full Stack</option>
                        <option value="Frontend">Frontend</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Cloud & Backend">Cloud & Backend</option>
                        <option value="AI / Machine Learning">AI / Machine Learning</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Ringkasan Singkat (1-2 Kalimat) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Platform orkestrasi microservices multi-cloud dengan skalabilitas hingga 100k req/detik."
                      value={projForm.summary}
                      onChange={(e) => setProjForm({ ...projForm, summary: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Deskripsi Lengkap Arsitektur & Solusi</label>
                    <textarea
                      rows={3}
                      value={projForm.description}
                      onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">URL Gambar Thumbnail</label>
                    <div className="flex items-center gap-3">
                      <img
                        src={projForm.imageUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <input
                        type="text"
                        value={projForm.imageUrl}
                        onChange={(e) => setProjForm({ ...projForm, imageUrl: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Link Live Demo Website</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={projForm.liveUrl || ''}
                        onChange={(e) => setProjForm({ ...projForm, liveUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Link GitHub Repository</label>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={projForm.githubUrl || ''}
                        onChange={(e) => setProjForm({ ...projForm, githubUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Metrik / Dampak Kinerja</label>
                    <input
                      type="text"
                      placeholder="e.g. Meningkatkan efisiensi hingga 40% & 100k+ pengguna aktif"
                      value={projForm.metrics || ''}
                      onChange={(e) => setProjForm({ ...projForm, metrics: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block font-semibold mb-1">Tech Stack Tags</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="React, Docker, AWS..."
                        value={projTagInput}
                        onChange={(e) => setProjTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (projTagInput.trim()) {
                              setProjForm({
                                ...projForm,
                                tags: [...projForm.tags, projTagInput.trim()],
                              });
                              setProjTagInput('');
                            }
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (projTagInput.trim()) {
                            setProjForm({
                              ...projForm,
                              tags: [...projForm.tags, projTagInput.trim()],
                            });
                            setProjTagInput('');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold cursor-pointer"
                      >
                        Tambah Tag
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {projForm.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() =>
                              setProjForm({
                                ...projForm,
                                tags: projForm.tags.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="proj-featured"
                      checked={projForm.featured}
                      onChange={(e) => setProjForm({ ...projForm, featured: e.target.checked })}
                      className="rounded text-indigo-600 cursor-pointer"
                    />
                    <label htmlFor="proj-featured" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Tandai sebagai Proyek Unggulan
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddingProj(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Simpan Proyek
                    </button>
                  </div>
                </form>
              )}

              {/* Projects List */}
              <div className="space-y-3">
                {data.projects.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                    Belum ada proyek. Klik tombol "Tambah Proyek Baru" di atas.
                  </div>
                ) : (
                  data.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={proj.imageUrl}
                          alt={proj.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-white truncate">
                              {proj.title}
                            </h4>
                            {proj.featured && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                Unggulan
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{proj.summary}</p>
                          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                            {proj.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleStartEditProj(proj)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handlePromptDeleteProj(proj)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-500" />
                    Pengalaman Kerja & Riwayat Karir ({data.experiences.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kelola riwayat posisi jabatan, perusahaan, masa kerja, dan pencapaian profesional
                  </p>
                </div>
                {!isAddingExp && (
                  <button
                    onClick={() => {
                      setEditingExpId(null);
                      setExpForm({
                        role: '',
                        company: '',
                        location: 'Jakarta, Indonesia',
                        period: '2023 - Sekarang',
                        type: 'Full-time',
                        highlights: [
                          'Memimpin pengembangan arsitektur scalable cloud.',
                          'Mengurangi latency sistem hingga 35%.',
                        ],
                        skills: ['TypeScript', 'Kubernetes', 'GCP'],
                      });
                      setIsAddingExp(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Pengalaman Baru
                  </button>
                )}
              </div>

              {/* Form Add / Edit Experience */}
              {isAddingExp && (
                <form
                  onSubmit={handleSaveExperience}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/50 shadow-lg space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h4 className="font-heading text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {editingExpId ? 'Edit Riwayat Pengalaman' : 'Form Tambah Pengalaman Kerja'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingExp(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Jabatan / Role *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lead Solutions Architect"
                        value={expForm.role}
                        onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Perusahaan / Institusi *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. PT Cloud Nusantara Global"
                        value={expForm.company}
                        onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Periode Waktu *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jan 2022 - Sekarang"
                        value={expForm.period}
                        onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Tipe Pekerjaan</label>
                      <select
                        value={expForm.type}
                        onChange={(e) =>
                          setExpForm({
                            ...expForm,
                            type: e.target.value as Experience['type'],
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Lokasi Kerja</label>
                      <input
                        type="text"
                        placeholder="e.g. Jakarta (Hybrid)"
                        value={expForm.location}
                        onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Highlights Bullet Points */}
                  <div>
                    <label className="block font-semibold mb-1">Poin Tanggung Jawab & Pencapaian Utama</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ketik pencapaian lalu tekan Enter atau klik Tambah Poin..."
                        value={expHighlightInput}
                        onChange={(e) => setExpHighlightInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (expHighlightInput.trim()) {
                              setExpForm({
                                ...expForm,
                                highlights: [...expForm.highlights, expHighlightInput.trim()],
                              });
                              setExpHighlightInput('');
                            }
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (expHighlightInput.trim()) {
                            setExpForm({
                              ...expForm,
                              highlights: [...expForm.highlights, expHighlightInput.trim()],
                            });
                            setExpHighlightInput('');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold cursor-pointer"
                      >
                        Tambah Poin
                      </button>
                    </div>
                    <ul className="mt-2.5 space-y-1.5">
                      {expForm.highlights.map((hl, idx) => (
                        <li
                          key={idx}
                          className="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        >
                          <span className="flex-1 leading-relaxed">• {hl}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setExpForm({
                                ...expForm,
                                highlights: expForm.highlights.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-rose-500 hover:text-rose-700 font-bold px-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skills tags */}
                  <div>
                    <label className="block font-semibold mb-1">Tech Stack Terkait (Skills)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ketik teknologi lalu tekan Enter..."
                        value={expSkillInput}
                        onChange={(e) => setExpSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (expSkillInput.trim()) {
                              setExpForm({
                                ...expForm,
                                skills: [...expForm.skills, expSkillInput.trim()],
                              });
                              setExpSkillInput('');
                            }
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (expSkillInput.trim()) {
                            setExpForm({
                              ...expForm,
                              skills: [...expForm.skills, expSkillInput.trim()],
                            });
                            setExpSkillInput('');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold cursor-pointer"
                      >
                        Tambah
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {expForm.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 font-medium"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() =>
                              setExpForm({
                                ...expForm,
                                skills: expForm.skills.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddingExp(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Simpan Pengalaman
                    </button>
                  </div>
                </form>
              )}

              {/* Experiences List */}
              <div className="space-y-3">
                {data.experiences.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                    Belum ada pengalaman kerja. Klik tombol "Tambah Pengalaman Baru" di atas.
                  </div>
                ) : (
                  data.experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                            {exp.role}
                          </h4>
                          <span className="text-slate-400">•</span>
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {exp.company}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {exp.period} • {exp.location} • <span className="font-medium text-emerald-600 dark:text-emerald-400">{exp.type}</span>
                        </p>
                        {exp.highlights && exp.highlights.length > 0 && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-1">
                            {exp.highlights[0]}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleStartEditExp(exp)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handlePromptDeleteExp(exp)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & PASSWORD MANAGEMENT */}
          {activeTab === 'security' && (
            <div className="max-w-3xl space-y-6">
              {/* Security Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/10 via-emerald-900/10 to-slate-900/10 dark:from-indigo-950/60 dark:via-emerald-950/60 dark:to-slate-950/60 border border-emerald-200/80 dark:border-emerald-800/60">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Proteksi Sandi CMS & Hak Akses Pribadi
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          TERLINDUNGI
                        </span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        Sistem kata sandi memastikan hanya Anda (Dimas Maulana) yang dapat menambah, mengubah, atau menghapus data sertifikasi dan proyek.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-slate-600 dark:text-slate-400">Sandi CMS Saat Ini:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                      {showSecurityPins ? (data.cmsPin || 'dimas123') : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSecurityPins(!showSecurityPins)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
                      title={showSecurityPins ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showSecurityPins ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      logoutCms();
                    }}
                    className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Kunci & Keluar CMS Sekarang
                  </button>
                </div>
              </div>

              {/* Change Password Form */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-indigo-500" />
                    Ganti Kata Sandi CMS
                  </h4>
                  <p className="text-xs text-slate-500">
                    Perbarui kata sandi Anda secara berkala untuk menjaga keamanan data portofolio.
                  </p>
                </div>

                {securityError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{securityError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePin} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Kata Sandi Saat Ini *
                    </label>
                    <input
                      type={showSecurityPins ? 'text' : 'password'}
                      required
                      value={currentPinInput}
                      onChange={(e) => {
                        setCurrentPinInput(e.target.value);
                        if (securityError) setSecurityError(null);
                      }}
                      placeholder="Masukkan sandi saat ini (bawaan: dimas123)..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Kata Sandi Baru * (Minimal 4 karakter)
                      </label>
                      <input
                        type={showSecurityPins ? 'text' : 'password'}
                        required
                        value={newPinInput}
                        onChange={(e) => {
                          setNewPinInput(e.target.value);
                          if (securityError) setSecurityError(null);
                        }}
                        placeholder="Ketik kata sandi baru..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Konfirmasi Kata Sandi Baru *
                      </label>
                      <input
                        type={showSecurityPins ? 'text' : 'password'}
                        required
                        value={confirmPinInput}
                        onChange={(e) => {
                          setConfirmPinInput(e.target.value);
                          if (securityError) setSecurityError(null);
                        }}
                        placeholder="Ulangi kata sandi baru..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSecurityPins(!showSecurityPins)}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      {showSecurityPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSecurityPins ? 'Sembunyikan Karakter' : 'Lihat Karakter Sandi'}</span>
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition cursor-pointer active:scale-98"
                    >
                      <Save className="w-4 h-4" />
                      Perbarui Kata Sandi
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Tips */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  Bagaimana CMS ini diamankan?
                </div>
                <p>
                  • Pengunjung biasa yang membuka portofolio Anda tidak dapat mengedit konten apa pun karena dialog kunci sandi akan otomatis muncul saat tombol CMS ditekan.
                </p>
                <p>
                  • Sandi disimpan secara aman pada perangkat dan sesi Anda, sehingga Anda dapat mengelola profil tanpa khawatir terjadi perubahan dari pihak luar.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: INQUIRIES & RECRUITER MESSAGES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    Pesan & Penawaran dari Rekruter ({data.inquiries.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Semua tawaran pekerjaan dan undangan wawancara yang masuk melalui formulir
                  </p>
                </div>
              </div>

              {data.inquiries.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Belum ada tawaran masuk.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Saat rekruter mengirim pesan melalui tombol "Hubungi Rekruter", pesan akan langsung muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {inq.recruiterName}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {inq.companyName}
                            </span>
                          </div>
                          <p className="text-slate-500 mt-0.5">{inq.email}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {inq.inquiryType}
                          </span>
                          <button
                            onClick={() => handlePromptDeleteInquiry(inq)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="Hapus Pesan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {inq.budgetOrSalary && (
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium">
                          Gaji / Budget: {inq.budgetOrSalary}
                        </div>
                      )}

                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                        {inq.message}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Diterima: {inq.timestamp}</span>
                        <a
                          href={`mailto:${inq.email}?subject=Re: Tawaran Karir untuk ${data.profile.fullName}`}
                          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          Balas via Email <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="max-w-xl space-y-5">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-500" />
                  Ekspor Backup Portofolio (JSON)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Unduh seluruh profil, sertifikasi, proyek, pengalaman kerja, dan pengaturan SEO dalam satu file JSON untuk cadangan offline Anda.
                </p>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  Unduh Backup JSON
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-500" />
                  Impor Data Portofolio (JSON)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pulihkan seluruh isi portofolio dari file JSON yang pernah Anda cadangkan sebelumnya.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer transition shadow-xs">
                  <Upload className="w-4 h-4" />
                  Pilih File JSON untuk Impor
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 shadow-xs space-y-3">
                <h4 className="font-heading text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset ke Data Bawaan Awal
                </h4>
                <p className="text-xs text-rose-600 dark:text-rose-300">
                  Kembalikan semua profil, sertifikasi sampel, proyek, dan pengalaman kerja ke template bawaan semula.
                </p>
                <button
                  type="button"
                  onClick={handlePromptReset}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Seluruh Portofolio
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* In-App Confirmation Modal (Guaranteed to work in iframe) */}
      <AnimatePresence>
        {confirmDialog && confirmDialog.isOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDialog(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    {confirmDialog.title}
                  </h3>
                  <span className="text-[11px] text-rose-500 font-semibold">Konfirmasi Tindakan</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {confirmDialog.message}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {confirmDialog.confirmLabel || 'Ya, Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
