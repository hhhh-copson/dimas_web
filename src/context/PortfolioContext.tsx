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
} from '../utils/realtimeVisitor';
import {
  db,
  doc,
  setDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from '../lib/firebase';

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

  // Real-time Database Status
  isCloudConnected: boolean;
  isSyncing: boolean;

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

  logProfileVisit: (
    section?: string,
    isSimulated?: boolean,
    customLocation?: { city: string; country: string; source: VisitorEvent['source'] }
  ) => void;
  submitRecruiterInquiry: (inquiry: Omit<RecruiterInquiry, 'id' | 'timestamp'>) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  clearVisitorLogs: () => void;
  resetToDefault: () => void;
  importPortfolioData: (importedData: PortfolioState) => boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const STORAGE_KEY = 'dimas_portfolio_v2_data';

// Helper to remove undefined fields recursively for Firestore compatibility
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        result[key] = sanitizeForFirestore(val);
      }
    }
    return result;
  }
  return obj;
}

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
        delete mergedSocial.twitter;
        delete mergedSocial.telegram;

        if (
          mergedSocial.whatsapp &&
          (mergedSocial.whatsapp.includes('http') || mergedSocial.whatsapp.includes('wa.me'))
        ) {
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

  // Real-time Cloud Connection State
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

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
  const sessionIdRef = useRef<string>(
    'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now()
  );
  const isInitialSnapshotRef = useRef<boolean>(true);

  // --- Real-Time Firestore Synchronization ---

  // 1. Listen to Primary Portfolio Document in Firestore
  useEffect(() => {
    const portfolioDocRef = doc(db, 'portfolio', 'dimas_data');

    const unsubscribePortfolio = onSnapshot(
      portfolioDocRef,
      async (docSnap) => {
        setIsCloudConnected(true);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          setData((prev) => {
            const mergedSocial = {
              ...prev.profile.socialLinks,
              ...(cloudData.profile?.socialLinks || {}),
            };
            return {
              ...prev,
              profile: {
                ...prev.profile,
                ...(cloudData.profile || {}),
                socialLinks: mergedSocial,
              },
              certifications: Array.isArray(cloudData.certifications)
                ? cloudData.certifications
                : prev.certifications,
              projects: Array.isArray(cloudData.projects) ? cloudData.projects : prev.projects,
              experiences: Array.isArray(cloudData.experiences)
                ? cloudData.experiences
                : prev.experiences,
              skills: Array.isArray(cloudData.skills) ? cloudData.skills : prev.skills,
              seo: {
                ...prev.seo,
                ...(cloudData.seo || {}),
              },
              cmsPin: cloudData.cmsPin || prev.cmsPin || 'dimas123',
            };
          });
        } else {
          // Document does not exist in Firestore yet -> seed with initial data
          try {
            const initialPayload = sanitizeForFirestore({
              profile: initialPortfolioData.profile,
              certifications: initialPortfolioData.certifications,
              projects: initialPortfolioData.projects,
              experiences: initialPortfolioData.experiences,
              skills: initialPortfolioData.skills,
              seo: initialPortfolioData.seo,
              cmsPin: 'dimas123',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            await setDoc(portfolioDocRef, initialPayload);
          } catch (err) {
            console.warn('Gagal melakukan seeding awal ke Firestore:', err);
          }
        }
      },
      (error) => {
        console.warn('Firestore portfolio listener error:', error);
        setIsCloudConnected(false);
      }
    );

    return () => {
      unsubscribePortfolio();
    };
  }, []);

  // 2. Real-Time Recruiter Inquiries Collection Listener
  useEffect(() => {
    try {
      const inquiriesQuery = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), limit(100));
      const unsubscribeInquiries = onSnapshot(
        inquiriesQuery,
        (snapshot) => {
          const loadedInquiries: RecruiterInquiry[] = snapshot.docs.map((d) => {
            const raw = d.data();
            return {
              id: d.id,
              recruiterName: raw.recruiterName || '',
              companyName: raw.companyName || '',
              email: raw.email || '',
              inquiryType: raw.inquiryType || 'Full-Time Offer',
              message: raw.message || '',
              budgetOrSalary: raw.budgetOrSalary || '',
              timestamp: raw.timestamp || 'Baru saja',
            };
          });
          setData((prev) => ({
            ...prev,
            inquiries: loadedInquiries,
          }));
        },
        (err) => {
          console.warn('Inquiries collection listener error:', err);
        }
      );

      return () => {
        unsubscribeInquiries();
      };
    } catch (err) {
      console.warn('Could not initialize inquiries listener:', err);
    }
  }, []);

  // 3. Real-Time Visitor Logs Collection Listener
  useEffect(() => {
    try {
      const logsQuery = query(collection(db, 'visitor_logs'), orderBy('createdAt', 'desc'), limit(50));
      const unsubscribeLogs = onSnapshot(
        logsQuery,
        (snapshot) => {
          const loadedLogs: VisitorEvent[] = snapshot.docs.map((d) => {
            const raw = d.data();
            return {
              id: d.id,
              timestamp: raw.timestamp || formatCurrentTime(),
              city: raw.city || 'Indonesia',
              country: raw.country || 'Indonesia',
              countryCode: raw.countryCode || 'ID',
              source: raw.source || 'Direct Access',
              device: raw.device || 'Desktop',
              browser: raw.browser || 'Browser',
              pageSection: raw.pageSection || 'Halaman Profil Utama',
              isRecruiterSuspect: raw.isRecruiterSuspect || false,
            };
          });

          // Show real-time notification toast for new entries created by other visitors/devices
          if (!isInitialSnapshotRef.current && loadedLogs.length > 0) {
            const newest = loadedLogs[0];
            setActiveToast(newest);
            if (data.audioNotificationEnabled) {
              playNotificationChime();
            }
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = setTimeout(() => {
              setActiveToast(null);
            }, 7000);
          }
          isInitialSnapshotRef.current = false;

          setData((prev) => ({
            ...prev,
            visitorLogs: loadedLogs,
          }));
        },
        (err) => {
          console.warn('Visitor logs listener error:', err);
        }
      );

      return () => {
        unsubscribeLogs();
      };
    } catch (err) {
      console.warn('Could not initialize visitor logs listener:', err);
    }
  }, [data.audioNotificationEnabled]);

  // 4. Multi-User Real-Time Online Presence via Firestore Heartbeats
  useEffect(() => {
    const sessionDocRef = doc(db, 'active_sessions', sessionIdRef.current);

    // Heartbeat function: write timestamp to Firestore
    const sendHeartbeat = async () => {
      try {
        await setDoc(
          sessionDocRef,
          {
            lastActive: Date.now(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch {}
    };

    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 10000);

    // Clean up session document on page unload
    const handleUnload = () => {
      try {
        deleteDoc(sessionDocRef).catch(() => {});
      } catch {}
    };
    window.addEventListener('beforeunload', handleUnload);

    // Real-time listener to count active sessions across the globe
    const activeSessionsQuery = collection(db, 'active_sessions');
    const unsubscribeSessions = onSnapshot(
      activeSessionsQuery,
      (snapshot) => {
        const threshold = Date.now() - 30000; // Active within the last 30 seconds
        let count = 0;
        snapshot.docs.forEach((docItem) => {
          const item = docItem.data();
          if (item.lastActive && item.lastActive > threshold) {
            count++;
          }
        });
        setActiveOnlineVisitors(Math.max(1, count));
      },
      () => {
        setActiveOnlineVisitors(1);
      }
    );

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
      unsubscribeSessions();
    };
  }, []);

  // Sync to local storage as instant offline cache fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [data]);

  // Save changes to Firestore with merging
  const syncToCloud = useCallback(async (partialData: Partial<PortfolioState>) => {
    setIsSyncing(true);
    try {
      const portfolioDocRef = doc(db, 'portfolio', 'dimas_data');
      const payload = sanitizeForFirestore({
        ...partialData,
        updatedAt: serverTimestamp(),
      });
      await setDoc(portfolioDocRef, payload, { merge: true });
    } catch (err) {
      console.warn('Gagal sinkronisasi data ke Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Dynamic SEO meta tags update
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
  const changeCmsPin = useCallback(
    (newPin: string) => {
      setData((prev) => ({
        ...prev,
        cmsPin: newPin,
      }));
      syncToCloud({ cmsPin: newPin });
    },
    [syncToCloud]
  );

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

  // Dismiss toast handler
  const dismissToast = useCallback(() => {
    setActiveToast(null);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, []);

  // Trigger real visitor log & notification and save to Firestore
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

      getRealVisitorLocation().then(async (loc) => {
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
          isRecruiterSuspect:
            source === 'LinkedIn' || source === 'WhatsApp Recruiter' || source === 'Job Board',
        };

        // Update local state
        setData((prev) => ({
          ...prev,
          visitorLogs: [newEvent, ...prev.visitorLogs.filter((v) => v.id !== newEvent.id).slice(0, 49)],
        }));

        setActiveToast(newEvent);
        if (data.audioNotificationEnabled) {
          playNotificationChime();
        }

        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setActiveToast(null);
        }, 7000);

        // Persist event in Firestore visitor_logs collection
        try {
          await addDoc(
            collection(db, 'visitor_logs'),
            sanitizeForFirestore({
              ...newEvent,
              createdAt: serverTimestamp(),
            })
          );
        } catch (err) {
          console.warn('Could not write visitor log to Firestore:', err);
        }
      });
    },
    [data.audioNotificationEnabled]
  );

  // Real visitor entry trigger on page load (recorded once per session)
  useEffect(() => {
    if (!hasLoggedInitialVisit.current) {
      hasLoggedInitialVisit.current = true;
      const timer = setTimeout(() => {
        logProfileVisit('Kunjungan Profil Awal (Landing)', false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [logProfileVisit]);

  // Profile Update
  const updateProfile = useCallback(
    (profileUpdate: Partial<ProfileData>) => {
      setData((prev) => {
        const updated = {
          ...prev.profile,
          ...profileUpdate,
          socialLinks: {
            ...prev.profile.socialLinks,
            ...(profileUpdate.socialLinks || {}),
          },
        };
        syncToCloud({ profile: updated });
        return {
          ...prev,
          profile: updated,
        };
      });
    },
    [syncToCloud]
  );

  // Certifications
  const addCertification = useCallback(
    (cert: Omit<Certification, 'id'>) => {
      const newCert: Certification = {
        ...cert,
        id: 'cert-' + Date.now(),
      };
      setData((prev) => {
        const nextCerts = [newCert, ...prev.certifications];
        syncToCloud({ certifications: nextCerts });
        return {
          ...prev,
          certifications: nextCerts,
        };
      });
    },
    [syncToCloud]
  );

  const updateCertification = useCallback(
    (id: string, certUpdate: Partial<Certification>) => {
      setData((prev) => {
        const nextCerts = prev.certifications.map((c) => (c.id === id ? { ...c, ...certUpdate } : c));
        syncToCloud({ certifications: nextCerts });
        return {
          ...prev,
          certifications: nextCerts,
        };
      });
    },
    [syncToCloud]
  );

  const deleteCertification = useCallback(
    (id: string) => {
      setData((prev) => {
        const nextCerts = prev.certifications.filter((c) => c.id !== id);
        syncToCloud({ certifications: nextCerts });
        return {
          ...prev,
          certifications: nextCerts,
        };
      });
    },
    [syncToCloud]
  );

  // Projects
  const addProject = useCallback(
    (project: Omit<Project, 'id'>) => {
      const newProj: Project = {
        ...project,
        id: 'proj-' + Date.now(),
      };
      setData((prev) => {
        const nextProjects = [newProj, ...prev.projects];
        syncToCloud({ projects: nextProjects });
        return {
          ...prev,
          projects: nextProjects,
        };
      });
    },
    [syncToCloud]
  );

  const updateProject = useCallback(
    (id: string, projectUpdate: Partial<Project>) => {
      setData((prev) => {
        const nextProjects = prev.projects.map((p) => (p.id === id ? { ...p, ...projectUpdate } : p));
        syncToCloud({ projects: nextProjects });
        return {
          ...prev,
          projects: nextProjects,
        };
      });
    },
    [syncToCloud]
  );

  const deleteProject = useCallback(
    (id: string) => {
      setData((prev) => {
        const nextProjects = prev.projects.filter((p) => p.id !== id);
        syncToCloud({ projects: nextProjects });
        return {
          ...prev,
          projects: nextProjects,
        };
      });
    },
    [syncToCloud]
  );

  // Experiences
  const addExperience = useCallback(
    (exp: Omit<Experience, 'id'>) => {
      const newExp: Experience = {
        ...exp,
        id: 'exp-' + Date.now(),
      };
      setData((prev) => {
        const nextExperiences = [newExp, ...prev.experiences];
        syncToCloud({ experiences: nextExperiences });
        return {
          ...prev,
          experiences: nextExperiences,
        };
      });
    },
    [syncToCloud]
  );

  const updateExperience = useCallback(
    (id: string, expUpdate: Partial<Experience>) => {
      setData((prev) => {
        const nextExperiences = prev.experiences.map((e) =>
          e.id === id ? { ...e, ...expUpdate } : e
        );
        syncToCloud({ experiences: nextExperiences });
        return {
          ...prev,
          experiences: nextExperiences,
        };
      });
    },
    [syncToCloud]
  );

  const deleteExperience = useCallback(
    (id: string) => {
      setData((prev) => {
        const nextExperiences = prev.experiences.filter((e) => e.id !== id);
        syncToCloud({ experiences: nextExperiences });
        return {
          ...prev,
          experiences: nextExperiences,
        };
      });
    },
    [syncToCloud]
  );

  // Skills
  const updateSkills = useCallback(
    (skills: SkillCategory[]) => {
      setData((prev) => {
        syncToCloud({ skills });
        return { ...prev, skills };
      });
    },
    [syncToCloud]
  );

  // SEO
  const updateSeo = useCallback(
    (seoUpdate: Partial<SeoSettings>) => {
      setData((prev) => {
        const nextSeo = { ...prev.seo, ...seoUpdate };
        syncToCloud({ seo: nextSeo });
        return {
          ...prev,
          seo: nextSeo,
        };
      });
    },
    [syncToCloud]
  );

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

  // Recruiter Inquiries (Persisted in Firestore collection 'inquiries')
  const submitRecruiterInquiry = useCallback(
    async (inquiry: Omit<RecruiterInquiry, 'id' | 'timestamp'>) => {
      const timestampStr = formatCurrentTime();
      try {
        const docRef = await addDoc(
          collection(db, 'inquiries'),
          sanitizeForFirestore({
            ...inquiry,
            timestamp: timestampStr,
            createdAt: serverTimestamp(),
          })
        );
        const newInq: RecruiterInquiry = {
          ...inquiry,
          id: docRef.id,
          timestamp: timestampStr,
        };
        setData((prev) => ({
          ...prev,
          inquiries: [newInq, ...prev.inquiries.filter((item) => item.id !== docRef.id)],
        }));
      } catch (err) {
        console.warn('Fallback to local inquiry creation:', err);
        const localInq: RecruiterInquiry = {
          ...inquiry,
          id: 'inq-' + Date.now(),
          timestamp: timestampStr,
        };
        setData((prev) => ({
          ...prev,
          inquiries: [localInq, ...prev.inquiries],
        }));
      }

      // Log recruiter visit event
      logProfileVisit('Pengajuan Pesan / Tawaran Rekruter', false, {
        city: 'Tawaran Rekruter',
        country: inquiry.companyName,
        source: 'WhatsApp Recruiter',
      });
    },
    [logProfileVisit]
  );

  const deleteInquiry = useCallback(async (id: string) => {
    setData((prev) => ({
      ...prev,
      inquiries: prev.inquiries.filter((inq) => inq.id !== id),
    }));
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (err) {
      console.warn('Could not delete inquiry from Firestore:', err);
    }
  }, []);

  const clearVisitorLogs = useCallback(() => {
    setData((prev) => ({ ...prev, visitorLogs: [] }));
  }, []);

  const resetToDefault = useCallback(async () => {
    setData(initialPortfolioData);
    try {
      localStorage.removeItem(STORAGE_KEY);
      await syncToCloud(initialPortfolioData);
    } catch {
      // ignore
    }
  }, [syncToCloud]);

  const importPortfolioData = useCallback(
    (imported: PortfolioState): boolean => {
      try {
        if (!imported.profile || !imported.certifications || !imported.projects) {
          return false;
        }
        setData(imported);
        syncToCloud(imported);
        return true;
      } catch {
        return false;
      }
    },
    [syncToCloud]
  );

  return (
    <PortfolioContext.Provider
      value={{
        data,
        activeOnlineVisitors,
        activeToast,
        dismissToast,
        isCmsOpen,
        setIsCmsOpen: handleSetIsCmsOpen,
        isCloudConnected,
        isSyncing,
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
