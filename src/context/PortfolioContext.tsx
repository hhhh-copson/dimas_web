import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  PortfolioState,
  ProfileData,
  Certification,
  Project,
  Experience,
  SkillCategory,
  SeoSettings,
  VisitorEvent,
  RecruiterInquiry,
} from '../types';
import { initialPortfolioData } from '../data/defaultData';
import { playNotificationChime } from '../utils/audio';
import { cleanWhatsAppNumber } from '../utils/social';
import {
  getRealVisitorLocation,
  detectBrowser,
  detectDevice,
  detectReferrerSource,
  formatCurrentTime,
  registerSessionHeartbeat,
  countRealActiveSessions,
} from '../utils/realtimeVisitor';

interface PortfolioContextType {
  data: PortfolioState;
  activeOnlineVisitors: number;
  activeToast: VisitorEvent | null;
  dismissToast: () => void;
  isCmsOpen: boolean;
  setIsCmsOpen: (open: boolean) => void;
  isRecruiterModalOpen: boolean;
  setIsRecruiterModalOpen: (open: boolean) => void;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;

  // CMS Password & Security
  isCmsAuthenticated: boolean;
  isPinModalOpen: boolean;
  setIsPinModalOpen: (open: boolean) => void;
  authenticateCms: (pin: string) => boolean;
  logoutCms: () => void;
  changeCmsPin: (newPin: string) => void;
  openCms: () => void;
  
  // Modifiers
  updateProfile: (profile: Partial<ProfileData>) => void;
  addCertification: (cert: Omit<Certification, 'id'>) => void;
  updateCertification: (id: string, cert: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;
  
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addExperience: (exp: Omit<Experience, 'id'>) => void;
  updateExperience: (id: string, exp: Partial<Experience>) => void;
  deleteExperience: (id: string) => void;

  updateSkills: (skills: SkillCategory[]) => void;
  updateSeo: (seo: Partial<SeoSettings>) => void;
  
  toggleDarkMode: () => void;
  toggleAudioNotification: () => void;
  
  logProfileVisit: (section?: string, isSimulated?: boolean, customLocation?: { city: string; country: string; source: VisitorEvent['source'] }) => void;
  submitRecruiterInquiry: (inquiry: Omit<RecruiterInquiry, 'id' | 'timestamp'>) => void;
  deleteInquiry: (id: string) => void;
  clearVisitorLogs: () => void;
  resetToDefault: () => void;
  importPortfolioData: (importedData: PortfolioState) => boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const STORAGE_KEY = 'dimas_portfolio_v2_data';

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedTheme = localStorage.getItem('theme');
      if (saved) {
        const parsed = JSON.parse(saved);
        const isDark = savedTheme ? savedTheme === 'dark' : (parsed.darkMode ?? false);
        const mergedSocial: any = {
          ...initialPortfolioData.profile.socialLinks,
          ...(parsed.profile?.socialLinks || {}),
        };
        // Remove twitter and telegram if present in legacy saved data
        delete mergedSocial.twitter;
        delete mergedSocial.telegram;

        // If whatsapp was saved as a wa.me link in previous versions, normalize to digits
        if (mergedSocial.whatsapp && (mergedSocial.whatsapp.includes('http') || mergedSocial.whatsapp.includes('wa.me'))) {
          mergedSocial.whatsapp = cleanWhatsAppNumber(mergedSocial.whatsapp) || '081234567890';
        }

        return {
          ...initialPortfolioData,
          ...parsed,
          darkMode: isDark,
          cmsPin: parsed.cmsPin || 'dimas123',
          profile: {
            ...initialPortfolioData.profile,
            ...(parsed.profile || {}),
            socialLinks: mergedSocial,
          },
          seo: { ...initialPortfolioData.seo, ...(parsed.seo || {}) },
        };
      } else if (savedTheme) {
        return {
          ...initialPortfolioData,
          darkMode: savedTheme === 'dark',
        };
      }
    } catch {
      // LocalStorage error or corrupted
    }
    return initialPortfolioData;
  });

  const [activeOnlineVisitors, setActiveOnlineVisitors] = useState<number>(1);
  const [activeToast, setActiveToast] = useState<VisitorEvent | null>(null);
  const [isCmsOpen, setIsCmsOpen] = useState<boolean>(false);
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState<boolean>(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);

  // CMS Password & Security states
  const [isCmsAuthenticated, setIsCmsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('dimas_cms_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoggedInitialVisit = useRef<boolean>(false);
  const realtimeChannelRef = useRef<BroadcastChannel | null>(null);

  // Authenticate CMS with master PIN
  const authenticateCms = useCallback(
    (pin: string): boolean => {
      const correctPin = data.cmsPin || 'dimas123';
      if (pin.trim() === correctPin.trim()) {
        setIsCmsAuthenticated(true);
        try {
          sessionStorage.setItem('dimas_cms_auth', 'true');
        } catch {}
        setIsPinModalOpen(false);
        setIsCmsOpen(true);
        return true;
      }
      return false;
    },
    [data.cmsPin]
  );

  // Logout / Lock CMS
  const logoutCms = useCallback(() => {
    setIsCmsAuthenticated(false);
    try {
      sessionStorage.removeItem('dimas_cms_auth');
    } catch {}
    setIsCmsOpen(false);
  }, []);

  // Change CMS Master PIN
  const changeCmsPin = useCallback((newPin: string) => {
    setData((prev) => ({
      ...prev,
      cmsPin: newPin,
    }));
  }, []);

  // Securely Open CMS (Prompts PIN if not authenticated)
  const openCms = useCallback(() => {
    if (isCmsAuthenticated) {
      setIsCmsOpen(true);
    } else {
      setIsPinModalOpen(true);
    }
  }, [isCmsAuthenticated]);

  const handleSetIsCmsOpen = useCallback(
    (open: boolean) => {
      if (open && !isCmsAuthenticated) {
        setIsPinModalOpen(true);
        return;
      }
      setIsCmsOpen(open);
    },
    [isCmsAuthenticated]
  );

  // Real-time BroadcastChannel listener for multi-tab updates
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('dimas_realtime_visitors');
        realtimeChannelRef.current = channel;
        channel.onmessage = (event) => {
          if (event.data?.type === 'REAL_VISIT' && event.data?.payload) {
            const newEvent: VisitorEvent = event.data.payload;
            setData((prev) => ({
              ...prev,
              visitorLogs: [newEvent, ...prev.visitorLogs.filter((v) => v.id !== newEvent.id).slice(0, 49)],
            }));
            setActiveToast(newEvent);
            if (data.audioNotificationEnabled) {
              playNotificationChime();
            }
          }
        };
        return () => {
          channel.close();
        };
      } catch {}
    }
  }, [data.audioNotificationEnabled]);

  // Real active online sessions tracking without fake numbers
  useEffect(() => {
    const unregister = registerSessionHeartbeat();
    const updateCount = () => {
      setActiveOnlineVisitors(countRealActiveSessions());
    };
    updateCount();
    const interval = setInterval(updateCount, 8000);
    return () => {
      unregister();
      clearInterval(interval);
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [data]);

  // Sync document title and SEO description dynamically
  useEffect(() => {
    if (data.seo?.metaTitle) {
      document.title = data.seo.metaTitle;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && data.seo?.metaDescription) {
      metaDesc.setAttribute('content', data.seo.metaDescription);
    }
  }, [data.seo?.metaTitle, data.seo?.metaDescription]);

  // Dark mode class toggle on HTML element, body, and data-theme
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (data.darkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      try {
        localStorage.setItem('theme', 'dark');
      } catch (_) {}
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      try {
        localStorage.setItem('theme', 'light');
      } catch (_) {}
    }
  }, [data.darkMode]);

  // Dismiss toast handler
  const dismissToast = useCallback(() => {
    setActiveToast(null);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, []);

  // Trigger new visit log & notification
  // Trigger real visitor log & notification
  const logProfileVisit = useCallback(
    (
      section = 'Halaman Profil Utama',
      isSimulated = false,
      customLocation?: { city: string; country: string; source: VisitorEvent['source'] }
    ) => {
      const isMobile = detectDevice() === 'Mobile';
      const browser = detectBrowser();
      const refInfo = detectReferrerSource();
      const source = customLocation?.source || refInfo.source;

      // Resolve real visitor location asynchronously
      getRealVisitorLocation().then((loc) => {
        const finalCity = customLocation?.city || loc.city;
        const finalCountry = customLocation?.country || loc.country;
        const finalCountryCode = loc.countryCode;

        const newEvent: VisitorEvent = {
          id: 'vis-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          timestamp: formatCurrentTime(),
          city: finalCity,
          country: finalCountry,
          countryCode: finalCountryCode,
          source,
          device: isMobile ? 'Mobile' : 'Desktop',
          browser,
          pageSection: section,
          isRecruiterSuspect: source === 'LinkedIn' || source === 'WhatsApp Recruiter' || source === 'Job Board',
        };

        setData((prev) => ({
          ...prev,
          visitorLogs: [newEvent, ...prev.visitorLogs.filter((v) => v.id !== newEvent.id).slice(0, 49)], // Keep last 50
        }));

        // Show real-time notification toast
        setActiveToast(newEvent);
        if (data.audioNotificationEnabled) {
          playNotificationChime();
        }

        // Broadcast to other open tabs
        try {
          realtimeChannelRef.current?.postMessage({
            type: 'REAL_VISIT',
            payload: newEvent,
          });
        } catch {}

        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setActiveToast(null);
        }, 7000);
      });
    },
    [data.audioNotificationEnabled]
  );

  // Real visitor entry trigger on page load (recorded once per browser session)
  useEffect(() => {
    if (!hasLoggedInitialVisit.current) {
      hasLoggedInitialVisit.current = true;
      try {
        const alreadyLogged = sessionStorage.getItem('dimas_session_visit_logged');
        if (!alreadyLogged) {
          sessionStorage.setItem('dimas_session_visit_logged', 'true');
          const timer = setTimeout(() => {
            logProfileVisit('Kunjungan Beranda Portofolio', false);
          }, 800);
          return () => clearTimeout(timer);
        }
      } catch {}
    }
  }, [logProfileVisit]);

  // Profile update
  const updateProfile = useCallback((profileUpdate: Partial<ProfileData>) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profileUpdate,
        socialLinks: {
          ...prev.profile.socialLinks,
          ...(profileUpdate.socialLinks || {}),
        },
      },
    }));
  }, []);

  // Certifications
  const addCertification = useCallback((cert: Omit<Certification, 'id'>) => {
    const newCert: Certification = {
      ...cert,
      id: 'cert-' + Date.now(),
    };
    setData((prev) => ({
      ...prev,
      certifications: [newCert, ...prev.certifications],
    }));
  }, []);

  const updateCertification = useCallback((id: string, certUpdate: Partial<Certification>) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) => (c.id === id ? { ...c, ...certUpdate } : c)),
    }));
  }, []);

  const deleteCertification = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));
  }, []);

  // Projects
  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    const newProj: Project = {
      ...project,
      id: 'proj-' + Date.now(),
    };
    setData((prev) => ({
      ...prev,
      projects: [newProj, ...prev.projects],
    }));
  }, []);

  const updateProject = useCallback((id: string, projectUpdate: Partial<Project>) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...projectUpdate } : p)),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  }, []);

  // Experiences
  const addExperience = useCallback((exp: Omit<Experience, 'id'>) => {
    const newExp: Experience = {
      ...exp,
      id: 'exp-' + Date.now(),
    };
    setData((prev) => ({
      ...prev,
      experiences: [newExp, ...prev.experiences],
    }));
  }, []);

  const updateExperience = useCallback((id: string, expUpdate: Partial<Experience>) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) => (e.id === id ? { ...e, ...expUpdate } : e)),
    }));
  }, []);

  const deleteExperience = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== id),
    }));
  }, []);

  // Skills
  const updateSkills = useCallback((skills: SkillCategory[]) => {
    setData((prev) => ({ ...prev, skills }));
  }, []);

  // SEO
  const updateSeo = useCallback((seoUpdate: Partial<SeoSettings>) => {
    setData((prev) => ({
      ...prev,
      seo: { ...prev.seo, ...seoUpdate },
    }));
  }, []);

  // Dark mode
  const toggleDarkMode = useCallback(() => {
    setData((prev) => {
      const nextMode = !prev.darkMode;
      const root = document.documentElement;
      const body = document.body;
      if (nextMode) {
        root.classList.add('dark');
        body.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        try {
          localStorage.setItem('theme', 'dark');
        } catch (_) {}
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        try {
          localStorage.setItem('theme', 'light');
        } catch (_) {}
      }
      return { ...prev, darkMode: nextMode };
    });
  }, []);

  const toggleAudioNotification = useCallback(() => {
    setData((prev) => {
      const nextVal = !prev.audioNotificationEnabled;
      if (nextVal) playNotificationChime();
      return { ...prev, audioNotificationEnabled: nextVal };
    });
  }, []);

  // Inquiries
  const submitRecruiterInquiry = useCallback(
    (inquiry: Omit<RecruiterInquiry, 'id' | 'timestamp'>) => {
      const newInq: RecruiterInquiry = {
        ...inquiry,
        id: 'inq-' + Date.now(),
        timestamp: 'Baru saja',
      };
      setData((prev) => ({
        ...prev,
        inquiries: [newInq, ...prev.inquiries],
      }));
      // Also log visit from recruiter
      logProfileVisit('Pengajuan Pesan / Tawaran Rekruter', false, {
        city: 'Tawaran Rekruter',
        country: inquiry.companyName,
        source: 'WhatsApp Recruiter',
      });
    },
    [logProfileVisit]
  );

  const deleteInquiry = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      inquiries: prev.inquiries.filter((inq) => inq.id !== id),
    }));
  }, []);

  const clearVisitorLogs = useCallback(() => {
    setData((prev) => ({ ...prev, visitorLogs: [] }));
  }, []);

  const resetToDefault = useCallback(() => {
    setData(initialPortfolioData);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const importPortfolioData = useCallback((imported: PortfolioState): boolean => {
    try {
      if (!imported.profile || !imported.certifications || !imported.projects) {
        return false;
      }
      setData(imported);
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        data,
        activeOnlineVisitors,
        activeToast,
        dismissToast,
        isCmsOpen,
        setIsCmsOpen: handleSetIsCmsOpen,
        isCmsAuthenticated,
        isPinModalOpen,
        setIsPinModalOpen,
        authenticateCms,
        logoutCms,
        changeCmsPin,
        openCms,
        isRecruiterModalOpen,
        setIsRecruiterModalOpen,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen,
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
        updateSkills,
        updateSeo,
        toggleDarkMode,
        toggleAudioNotification,
        logProfileVisit,
        submitRecruiterInquiry,
        deleteInquiry,
        clearVisitorLogs,
        resetToDefault,
        importPortfolioData,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return ctx;
};
