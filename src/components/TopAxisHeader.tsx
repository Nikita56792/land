import React, { useState } from 'react';
import { Github, Heart, Copy, Check } from 'lucide-react';
import { STUDIO_INFO, SectionTab } from '../data/catalog';

interface TopAxisHeaderProps {
  activeTab: SectionTab;
  onSelectTab: (tab: SectionTab) => void;
  onOpenSupport: () => void;
}

export const TopAxisHeader: React.FC<TopAxisHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSupport,
}) => {
  const [copiedMail, setCopiedMail] = useState(false);

  const handleCopyMail = () => {
    navigator.clipboard?.writeText(STUDIO_INFO.contactEmail);
    setCopiedMail(true);
    setTimeout(() => setCopiedMail(false), 1800);
  };

  const isGames = activeTab === 'games';
  const accentColor = isGames ? '#38BDF8' : '#E2A856';

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#07080A]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
        {/* Left: Studio / Single-Author Identity */}
        <div className="flex items-center gap-3">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2.5"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded border border-white/15 bg-white/[0.03] transition-colors group-hover:border-white/30">
              <span
                className="h-2.5 w-2.5 rounded-[2px] transition-colors duration-300"
                style={{ backgroundColor: accentColor, boxShadow: `0 0 12px ${accentColor}` }}
              />
            </div>
            <div className="leading-none">
              <div className="font-display text-sm font-semibold tracking-tight text-white">
                {STUDIO_INFO.brand}
              </div>
              <div className="mt-1 font-mono-tech text-[10px] tracking-wider text-white/45">
                @{STUDIO_INFO.handle}
              </div>
            </div>
          </a>
        </div>

        {/* Center: Signature Horizontal Split-Axis Bar between GAMES and APPS */}
        <nav
          aria-label="Переключение разделов: игры Wii U и программы macOS"
          className="flex items-center gap-2 sm:gap-4"
        >
          <button
            type="button"
            onClick={() => onSelectTab('games')}
            className={`cursor-pointer rounded-md px-2.5 py-1.5 font-mono-tech text-xs font-medium tracking-[0.12em] uppercase transition-all sm:px-3.5 ${
              isGames
                ? 'text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/30'
                : 'text-white/45 hover:text-white/80 border border-transparent'
            }`}
          >
            Wii U Ports
          </button>

          {/* The Central Light-Rail Axis Bar connecting both domains */}
          <button
            type="button"
            onClick={() => onSelectTab(isGames ? 'apps' : 'games')}
            aria-label="Переключить ось между Wii U Ports и Mac Apps"
            className="group relative hidden h-5 w-20 cursor-pointer items-center sm:flex md:w-32"
          >
            {/* Outer hairlines */}
            <span className="absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 bg-white/15" />
            <span className="absolute left-0 top-1/2 h-2 w-[1px] -translate-y-1/2 bg-white/30" />
            <span className="absolute left-1/2 top-1/2 h-2.5 w-[1px] -translate-x-1/2 -translate-y-1/2 bg-white/20" />
            <span className="absolute right-0 top-1/2 h-2 w-[1px] -translate-y-1/2 bg-white/30" />

            {/* Active illuminated half-segment */}
            <span
              className="absolute top-1/2 h-[2px] w-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
              style={{
                left: isGames ? '0%' : '50%',
                background: isGames
                  ? 'linear-gradient(90deg, #38BDF8, rgba(56,189,248,0.2))'
                  : 'linear-gradient(270deg, #E2A856, rgba(226,168,86,0.2))',
              }}
            />

            {/* Sliding shuttle marker */}
            <span
              className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-white/80 transition-all duration-500 ease-out"
              style={{
                left: isGames ? 'calc(18% - 5px)' : 'calc(82% - 5px)',
                backgroundColor: accentColor,
                boxShadow: `0 0 12px ${accentColor}`,
              }}
            />
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('apps')}
            className={`cursor-pointer rounded-md px-2.5 py-1.5 font-mono-tech text-xs font-medium tracking-[0.12em] uppercase transition-all sm:px-3.5 ${
              !isGames
                ? 'text-[#E2A856] bg-[#E2A856]/10 border border-[#E2A856]/30'
                : 'text-white/45 hover:text-white/80 border border-transparent'
            }`}
          >
            Mac Apps
          </button>
        </nav>

        {/* Right: Single-Author GitHub + Landing Repo + Donate */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMail}
            title="Скопировать email для связи"
            className="hidden items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 font-mono-tech text-[11px] text-white/55 transition hover:border-white/25 hover:text-white lg:inline-flex"
          >
            {copiedMail ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copiedMail ? 'Скопировано' : STUDIO_INFO.contactEmail}</span>
          </button>

          <a
            href={STUDIO_INFO.githubProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/12 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/85 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden md:inline">GitHub автора</span>
          </a>

          <button
            type="button"
            onClick={onOpenSupport}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition hover:brightness-110"
            style={{
              borderColor: `${accentColor}44`,
              backgroundColor: `${accentColor}15`,
              color: '#F3F4F6',
            }}
          >
            <Heart className="h-3.5 w-3.5" style={{ color: accentColor }} />
            <span>Донат</span>
          </button>
        </div>
      </div>
    </header>
  );
};
