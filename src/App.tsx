import React, { useEffect, useState } from 'react';
import { Github, Heart, ArrowRightLeft } from 'lucide-react';
import { STUDIO_INFO, SectionTab } from './data/catalog';
import { TopAxisHeader } from './components/TopAxisHeader';
import { CoordinateRuler } from './components/CoordinateRuler';
import { GamesView } from './components/GamesView';
import { AppsView } from './components/AppsView';
import { SupportModal } from './components/SupportModal';

function parseTabFromHash(): SectionTab {
  if (typeof window === 'undefined') return 'games';
  return window.location.hash.startsWith('#apps') ? 'apps' : 'games';
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SectionTab>(parseTabFromHash);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      setActiveTab(parseTabFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleSelectTab = (tab: SectionTab) => {
    setActiveTab(tab);
    window.history.replaceState(null, '', `#${tab}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="top" className="min-h-screen bg-[#07080A] bg-architectural-grid text-[#F3F4F6]">
      <TopAxisHeader
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenSupport={() => setSupportOpen(true)}
      />

      <CoordinateRuler activeTab={activeTab} />

      <main className="relative">
        {activeTab === 'games' ? (
          <GamesView onOpenSupport={() => setSupportOpen(true)} />
        ) : (
          <AppsView onOpenSupport={() => setSupportOpen(true)} />
        )}
      </main>

      {/* Clean Minimal Footer with Cross-Tab Switch & GitHubs */}
      <footer className="border-t border-white/10 bg-[#050608]">
        <div className="mx-auto flex max-w-[1260px] flex-col justify-between gap-6 px-4 py-10 sm:px-8 md:flex-row md:items-center">
          <div className="space-y-1.5">
            <div className="font-display text-sm font-semibold text-white">
              {STUDIO_INFO.brand} · @{STUDIO_INFO.handle}
            </div>
            <p className="text-xs text-white/45">{STUDIO_INFO.locationNote}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleSelectTab(activeTab === 'games' ? 'apps' : 'games')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/12 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/85 transition hover:border-white/25 hover:text-white"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>
                {activeTab === 'games' ? 'Перейти в Mac Apps' : 'Перейти в Wii U Ports'}
              </span>
            </button>

            <a
              href={STUDIO_INFO.githubProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3.5 py-2 text-xs text-white/75 transition hover:border-white/25 hover:text-white"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub автора</span>
            </a>

            <a
              href={STUDIO_INFO.landingRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3.5 py-2 text-xs text-white/75 transition hover:border-white/25 hover:text-white"
            >
              <Github className="h-3.5 w-3.5" />
              <span>Репозиторий сайта</span>
            </a>

            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-3.5 py-2 text-xs text-white/75 transition hover:border-white/25 hover:text-white"
            >
              <Heart className="h-3.5 w-3.5 text-[#E2A856]" />
              <span>Донат</span>
            </button>
          </div>
        </div>
      </footer>

      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  );
};

export default App;
