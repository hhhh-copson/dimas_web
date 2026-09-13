/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Navbar } from './components/Navbar';
import { HeroProfile } from './components/HeroProfile';
import { CertificationsSection } from './components/CertificationsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ExperienceAndSkillsSection } from './components/ExperienceAndSkillsSection';
import { Footer } from './components/Footer';
import { LiveNotificationToast } from './components/LiveNotificationToast';
import { NotificationCenterDrawer } from './components/NotificationCenterDrawer';
import { RecruiterContactModal } from './components/RecruiterContactModal';
import { CmsModal } from './components/CmsModal';
import { CmsPasswordModal } from './components/CmsPasswordModal';

function PortfolioLayout() {
  const { data } = usePortfolio();

  return (
    <div
      id="portfolio-root"
      className={`min-h-screen w-full overflow-x-hidden flex flex-col font-sans antialiased transition-colors duration-300 ${
        data.darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Halaman Profil Lengkap dengan Foto Profil & Akses Rekruter */}
        <HeroProfile />

        {/* 2. Blok Sertifikasi Kredensial Resmi Terverifikasi */}
        <CertificationsSection />

        {/* 3. Showcase Proyek Rekayasa Perangkat Lunak */}
        <ProjectsSection />

        {/* 4. Pengalaman Kerja & Peta Keahlian */}
        <ExperienceAndSkillsSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Real-time Notification System for Profile Visits */}
      <LiveNotificationToast />
      <NotificationCenterDrawer />

      {/* Recruiter Contact & Inquiry Portal */}
      <RecruiterContactModal />

      {/* Content Management System (CMS) Modal */}
      <CmsModal />

      {/* CMS Password Authentication Modal */}
      <CmsPasswordModal />
    </div>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <PortfolioLayout />
    </PortfolioProvider>
  );
}
