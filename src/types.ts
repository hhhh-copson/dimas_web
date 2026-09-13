export interface SocialLinks {
  linkedin: string;
  github: string;
  email: string;
  whatsapp: string; // nomor telepon/WA saja tanpa https://wa.me/ (misal: 081234567890 atau 6281234567890)
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  youtube?: string;
  portfolioUrl?: string;
}

export interface ProfileData {
  fullName: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  location: string;
  availabilityStatus: 'open_for_hire' | 'open_for_contract' | 'busy' | 'exploring';
  availabilityText: string;
  yearsOfExperience: number;
  completedProjectsCount: number;
  happyClientsCount: number;
  resumeUrl: string;
  socialLinks: SocialLinks;
}

export type CertificationCategory = 'Cloud & DevOps' | 'Software Engineering' | 'Data & AI' | 'Cybersecurity' | 'Professional & Soft Skills';

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issuerLogo?: string;
  issueDate: string;
  expirationDate?: string;
  credentialId: string;
  credentialUrl: string;
  category: CertificationCategory;
  description: string;
  skills: string[];
  isFeatured: boolean;
  scoreOrGrade?: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: 'Full Stack' | 'Frontend' | 'Mobile' | 'Cloud & Backend' | 'AI / Machine Learning';
  imageUrl: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  metrics?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  type: 'Full-time' | 'Contract' | 'Part-time' | 'Remote';
  highlights: string[];
  skills: string[];
}

export interface SkillCategory {
  category: string;
  items: {
    name: string;
    level: 'Expert' | 'Advanced' | 'Intermediate';
    iconName?: string;
  }[];
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  authorName: string;
  canonicalUrl: string;
  ogImageUrl: string;
  jobTitle: string;
  enableJsonLd: boolean;
}

export interface VisitorEvent {
  id: string;
  timestamp: string;
  city: string;
  country: string;
  countryCode: string;
  source: 'LinkedIn' | 'Google Search' | 'GitHub' | 'Direct Access' | 'WhatsApp Recruiter' | 'Job Board';
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  pageSection: string;
  isRecruiterSuspect: boolean;
}

export interface RecruiterInquiry {
  id: string;
  recruiterName: string;
  companyName: string;
  email: string;
  inquiryType: 'Full-Time Offer' | 'Contract / Freelance' | 'Interview Invitation' | 'Informal Chat';
  message: string;
  budgetOrSalary?: string;
  timestamp: string;
}

export interface PortfolioState {
  profile: ProfileData;
  certifications: Certification[];
  projects: Project[];
  experiences: Experience[];
  skills: SkillCategory[];
  seo: SeoSettings;
  visitorLogs: VisitorEvent[];
  inquiries: RecruiterInquiry[];
  darkMode: boolean;
  audioNotificationEnabled: boolean;
  cmsPin?: string;
}
