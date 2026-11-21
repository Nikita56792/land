import React, { useEffect, useState } from 'react';
import { SectionTab } from '../data/catalog';

interface CoordinateRulerProps {
  activeTab: SectionTab;
}

const GAMES_ANCHORS = [
  { id: 'sec-wiiu-stage', label: 'DUAL STAGE' },
  { id: 'game-minecraft', label: 'MINECRAFT' },
  { id: 'game-buckshot', label: 'BUCKSHOT' },
  { id: 'game-slime', label: 'SLIME' },
  { id: 'game-subnautica', label: 'SUBNAUTICA' },
  { id: 'sec-wiiu-pipeline', label: 'PIPELINE' },
  { id: 'sec-rightsholders', label: 'DMCA' },
];

const APPS_ANCHORS = [
  { id: 'app-epidaurus', label: 'EPIDAURUS' },
  { id: 'app-kraken', label: 'KRAKEN' },
  { id: 'app-real3d', label: 'REAL3D' },
];

export const CoordinateRuler: React.FC<CoordinateRulerProps> = ({ activeTab }) => {
  const [scrollPct, setScrollPct] = useState(0);
  const anchors = activeTab === 'games' ? GAMES_ANCHORS : APPS_ANCHORS;
  const accent = activeTab === 'games' ? '#38BDF8' : '#E2A856';

  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)) : 0;
      setScrollPct(pct);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeTab]);

  return (
    <aside
      aria-label="Навигация по секциям"
      className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-4 xl:flex"
    >
      <div className="flex flex-col items-end gap-2.5 border-r border-white/12 pr-3">
        {anchors.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => document.getElementById(a.id)?.scrollIntoView({ behavior: 'smooth' })}
            className="cursor-pointer font-mono-tech text-[10px] tracking-[0.14em] text-white/35 transition hover:text-white"
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Optical scroll gauge */}
      <div className="flex items-center gap-2 pr-1">
        <span className="font-mono-tech text-[9px] text-white/35">
          {Math.round(scrollPct).toString().padStart(2, '0')}%
        </span>
        <div className="relative h-16 w-[2px] overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute left-0 top-0 w-full transition-all duration-150"
            style={{
              height: `${Math.max(12, scrollPct)}%`,
              backgroundColor: accent,
            }}
          />
        </div>
      </div>
    </aside>
  );
};
