import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Briefcase, Calendar, MapPin, CheckCircle2, Code2, Cpu, PlusCircle } from 'lucide-react';

export const ExperienceAndSkillsSection: React.FC = () => {
  const { data, setIsCmsOpen } = usePortfolio();
  const { experiences, skills } = data;

  return (
    <section id="experience" className="py-16 bg-slate-100/50 dark:bg-slate-900/30 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Career Timeline */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 mb-2">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Rekam Jejak Profesional</span>
                </div>
                <h2 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Pengalaman Kerja
                </h2>
              </div>
              <button
                onClick={() => setIsCmsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
                <span>Kelola di CMS</span>
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 mb-8">
              Riwayat kepemimpinan teknis dan kontribusi rekayasa pada produk berskala tinggi.
            </p>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative pl-9 group">
                  {/* Timeline dot */}
                  <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 group-hover:scale-125 transition"></div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 transition">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-2">
                      <div>
                        <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                          {exp.role}
                        </h3>
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          {exp.company}
                        </span>
                      </div>
                      <span className="self-start px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 shrink-0">
                        {exp.period}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {exp.location}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {exp.type}
                      </span>
                    </div>

                    <ul className="mt-3.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {exp.highlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Skills pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                      {exp.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 text-[11px] font-mono border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Categorized Technical Skills */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-2">
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              <span>Peta Keahlian & Teknologi</span>
            </div>
            <h2 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Tech Stack & Kompetensi
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 mb-8">
              Penguasaan stack teknologi modern yang teruji di industri.
            </p>

            <div className="space-y-4">
              {skills.map((category) => (
                <div
                  key={category.category}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-xs"
                >
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    {category.category}
                  </h3>

                  <div className="space-y-2.5">
                    {category.items.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {skill.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                            skill.level === 'Expert'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : skill.level === 'Advanced'
                              ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {skill.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
