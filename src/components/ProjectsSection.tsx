import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Project } from '../types';
import {
  Layers,
  ExternalLink,
  Github,
  TrendingUp,
  Sparkles,
  Search,
  PlusCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

export const ProjectsSection: React.FC = () => {
  const { data, logProfileVisit, setIsCmsOpen } = usePortfolio();
  const { projects } = data;

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['Semua', 'Full Stack', 'Cloud & Backend', 'AI / Machine Learning', 'Mobile'];

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  const handleProjectClick = (proj: Project) => {
    logProfileVisit(`Melihat Proyek: ${proj.title}`, false);
  };

  return (
    <section id="projects" className="py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 mb-2">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Rekayasa & Karya Nyata</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Portofolio Proyek Unggulan
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Aplikasi dan sistem skala produksi yang dibangun dengan fokus pada performa, skalabilitas, dan arsitektur kode bersih.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCmsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-indigo-500" />
              <span>Tambah Proyek via CMS</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8">
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

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama proyek, tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredProjects.map((proj) => (
            <motion.div
              key={proj.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between"
              onClick={() => handleProjectClick(proj)}
            >
              {/* Image Thumbnail Banner */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
                <img
                  src={proj.imageUrl}
                  alt={proj.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                {/* Category Pill */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                  {proj.category}
                </div>

                {proj.featured && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3" /> Unggulan
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {proj.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {proj.summary}
                  </p>

                  {/* Impact / Metric badge if available */}
                  {proj.metrics && (
                    <div className="mt-3.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                      <TrendingUp className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                      <span>
                        <strong>Dampak Kinerja:</strong> {proj.metrics}
                      </span>
                    </div>
                  )}

                  {/* Tech stack tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {proj.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition cursor-pointer"
                    >
                      <Github className="w-4 h-4" />
                      <span>Source Code</span>
                    </a>
                  )}

                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition active:scale-98 cursor-pointer"
                    >
                      <span>Lihat Demo Live</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
