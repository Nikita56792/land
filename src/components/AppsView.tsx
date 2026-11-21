import React, { useState } from 'react';
import {
  Cpu,
  HardDrive,
  Volume2,
  Glasses,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MAC_APPS, MacApp } from '../data/catalog';
import { DownloadButtons } from './DownloadButtons';

interface AppsViewProps {
  onOpenSupport: () => void;
}

export const AppsView: React.FC<AppsViewProps> = ({ onOpenSupport }) => {
  return (
    <div className="space-y-24 pb-28">
      {/* INTRO BAND */}
      <section className="pt-12 sm:pt-16">
        <div className="mx-auto max-w-[1260px] px-4 sm:px-8">
          <div className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E2A856]/30 bg-[#E2A856]/10 px-3 py-1 font-mono-tech text-[11px] tracking-wider text-[#E2A856]">
                <span>APPLE SILICON · RUST · SWIFT · METAL · CORE ML</span>
              </div>
              <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.08]">
                Нативные приложения для macOS без лишних слоёв
              </h1>
            </div>
            <p className="text-sm leading-relaxed text-[#9CA3AF] sm:text-base">
              Самостоятельные утилиты с открытым исходным кодом: кинотеатральный плеер с VVC и Atmos,
              прозрачный сжимающий том для SSD и стерео 3D-рендер для XREAL в реальном времени.
            </p>
          </div>
        </div>
      </section>

      {/* INDIVIDUAL APP SHOWCASES */}
      <section className="mx-auto max-w-[1260px] space-y-24 px-4 sm:px-8">
        {MAC_APPS.map((app, index) => (
          <AppShowcaseBand
            key={app.id}
            app={app}
            index={index}
            onOpenSupport={onOpenSupport}
          />
        ))}
      </section>
    </div>
  );
};

interface AppShowcaseBandProps {
  app: MacApp;
  index: number;
  onOpenSupport: () => void;
}

const AppShowcaseBand: React.FC<AppShowcaseBandProps> = ({
  app,
  index,
  onOpenSupport,
}) => {
  return (
    <article
      id={`app-${app.id}`}
      className="relative rounded-2xl border border-white/10 bg-[#0A0C10]/90 p-5 sm:p-8 lg:p-11"
      style={{
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Header Row with Real App Icon + Metadata */}
      <div className="flex flex-col justify-between gap-6 border-b border-white/8 pb-7 md:flex-row md:items-center">
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[#12151C] shadow-lg sm:h-20 sm:w-20"
            style={{ boxShadow: `0 10px 30px ${app.accentHex}1F` }}
          >
            {app.iconUrl ? (
              <img src={app.iconUrl} alt={`${app.name} icon`} className="h-full w-full object-cover" />
            ) : (
              <KrakenVectorMark />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono-tech text-xs" style={{ color: app.accentHex }}>
                0{index + 1}
              </span>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {app.name}
              </h2>
              <span className="rounded border border-white/15 bg-white/[0.04] px-2 py-0.5 font-mono-tech text-xs text-white/80">
                {app.version}
              </span>
              {app.previousName && (
                <span className="font-mono-tech text-xs text-white/40">({app.previousName})</span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-[#9CA3AF] sm:text-base">{app.tagline}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 font-mono-tech text-[11px] text-white/60">
          <span className="rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1">
            {app.platform}
          </span>
          <span className="rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1">
            {app.license}
          </span>
        </div>
      </div>

      {/* Main Asymmetric Body: Interactive App Showcase + Technical Breakdown */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-6">
          <p className="text-sm leading-relaxed text-[#C4C9D4] sm:text-base">{app.description}</p>

          {/* Benchmarks & Telemetry Grid */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {app.specs.map((spec) => (
              <div
                key={spec.label}
                className="rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-2.5"
              >
                <div className="font-mono-tech text-[10px] uppercase tracking-wider text-white/40">
                  {spec.label}
                </div>
                <div className="mt-1 text-xs font-medium text-white sm:text-sm">{spec.value}</div>
              </div>
            ))}
          </div>

          <ul className="space-y-2 text-sm text-[#D1D5DB]">
            {app.highlights.map((hl) => (
              <li key={hl} className="flex items-start gap-2.5">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: app.accentHex }}
                />
                <span>{hl}</span>
              </li>
            ))}
          </ul>

          {/* Architecture Line */}
          <div className="rounded-lg border border-white/8 bg-black/50 px-3.5 py-2.5 font-mono-tech text-[11px] leading-relaxed text-white/60">
            {app.architectureNote}
          </div>

          <DownloadButtons
            mirrors={app.mirrors}
            accentHex={app.accentHex}
            onDonateClick={onOpenSupport}
          />
        </div>

        {/* Visual Right Column customized per app */}
        <div className="lg:col-span-6">
          {app.id === 'epidaurus' && <EpidaurusArchitectureWidget accentHex={app.accentHex} />}
          {app.id === 'kraken' && app.screenshots && (
            <ScreenshotGallery screenshots={app.screenshots} accentHex={app.accentHex} />
          )}
          {app.id === 'real3d' && app.screenshots && (
            <Real3DInspector screenshots={app.screenshots} accentHex={app.accentHex} />
          )}
        </div>
      </div>
    </article>
  );
};

/* ---------- App-Specific Visualizers ---------- */

const EpidaurusArchitectureWidget: React.FC<{ accentHex: string }> = ({ accentHex }) => {
  const [stage, setStage] = useState<'vvc' | 'atmos' | 'upmix' | 'torrent'>('vvc');

  const stages = {
    vvc: {
      title: 'VVdeC NEON vs FFmpeg vvc (M4 Max)',
      icon: Cpu,
      note: '4K 10-bit HDR10 (8 Мбит/с) декодируется со скоростью 302 fps; первый кадр за 68 мс; на 8K занимает 5–9 ядер без единого пропуска.',
      bars: [
        { label: 'VVdeC NEON (4K 10-bit)', val: '302 FPS', pct: 100, active: true },
        { label: 'FFmpeg vvc (4K 10-bit)', val: '62 FPS', pct: 21, active: false },
        { label: 'VVdeC NEON (8K 6 Mbps)', val: '101 FPS', pct: 34, active: true },
      ],
    },
    atmos: {
      title: 'TrueHD 16-канальный объектный Atmos',
      icon: Volume2,
      note: 'Декодирование позиций объектов из OAMD с рампами до сэмпла. Для наушников — прямой точечный рендеринг через Apple HRTF без промежуточной сетки колонок.',
      bars: [
        { label: 'TrueHD OAMD Objects', val: '16 ch', pct: 100, active: true },
        { label: 'Headphones Output', val: 'Apple HRTF + AutoEQ', pct: 88, active: true },
        { label: 'Speaker Array', val: '7.1.4 Direct Pan', pct: 76, active: false },
      ],
    },
    upmix: {
      title: 'Стерео → 3D Пространственный апмикс',
      icon: Sparkles,
      note: 'STFT Direct/Diffuse разделение (3D DSP, <1% CPU) или нейросетевой HTDemucs 6 стемов на Apple Silicon (~7× быстрее реального времени).',
      bars: [
        { label: 'HTDemucs 6-Stem ONNX', val: '7× Real-Time', pct: 95, active: true },
        { label: '3D DSP (ICC + Velvet)', val: '< 1% CPU / 40 ms', pct: 72, active: true },
        { label: 'Virtual 3D Objects', val: '14 Sources', pct: 85, active: false },
      ],
    },
    torrent: {
      title: 'Прямой стриминг торрентов в FFmpeg',
      icon: Layers,
      note: 'Собственный AVIOContext читает блоки из libtorrent-rasterbar 2.1 напрямую в демуксер — без локального HTTP-прокси и мгновенной перемоткой.',
      bars: [
        { label: 'qBittorrent Engine', val: 'libtorrent 2.1.2', pct: 100, active: true },
        { label: 'Seek Interrupt', val: 'Instant Abort', pct: 92, active: true },
        { label: 'Protocols', val: 'TCP · uTP · WebTorrent', pct: 80, active: false },
      ],
    },
  };

  const current = stages[stage];
  const Icon = current.icon;

  return (
    <div className="rounded-xl border border-white/12 bg-[#07080B] p-5">
      <div className="flex flex-wrap gap-1.5 border-b border-white/8 pb-4">
        {(
          [
            ['vvc', 'H.266 / VVC'],
            ['atmos', 'TrueHD Atmos'],
            ['upmix', 'AI 3D Upmix'],
            ['torrent', 'Torrent AVIO'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setStage(key)}
            className={`cursor-pointer rounded-md px-3 py-1.5 font-mono-tech text-[11px] transition ${
              stage === key
                ? 'bg-white/12 text-white border border-white/25'
                : 'text-white/50 hover:text-white/85 border border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4" style={{ color: accentHex }} />
          <h3 className="font-display text-base font-semibold text-white">{current.title}</h3>
        </div>

        <p className="text-xs leading-relaxed text-[#9CA3AF] sm:text-sm">{current.note}</p>

        <div className="space-y-3 pt-1">
          {current.bars.map((bar) => (
            <div key={bar.label} className="space-y-1">
              <div className="flex justify-between font-mono-tech text-[11px]">
                <span className="text-white/75">{bar.label}</span>
                <span style={{ color: bar.active ? accentHex : '#9CA3AF' }}>{bar.val}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${bar.pct}%`,
                    backgroundColor: bar.active ? accentHex : 'rgba(255,255,255,0.22)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ScreenshotGallery: React.FC<{
  screenshots: { src: string; caption: string }[];
  accentHex: string;
}> = ({ screenshots, accentHex }) => {
  const [idx, setIdx] = useState(0);
  const current = screenshots[idx];

  return (
    <div className="rounded-xl border border-white/12 bg-[#07080B] p-3">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-white/8 bg-black">
        <img
          src={current.src}
          alt={current.caption}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs text-white/80">
          <HardDrive className="h-3.5 w-3.5 shrink-0" style={{ color: accentHex }} />
          <span>{current.caption}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Предыдущий скриншот"
            onClick={() => setIdx((idx - 1 + screenshots.length) % screenshots.length)}
            className="cursor-pointer rounded border border-white/12 p-1 text-white/70 hover:border-white/30 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-1.5 font-mono-tech text-[11px] text-white/50">
            {idx + 1}/{screenshots.length}
          </span>
          <button
            type="button"
            aria-label="Следующий скриншот"
            onClick={() => setIdx((idx + 1) % screenshots.length)}
            className="cursor-pointer rounded border border-white/12 p-1 text-white/70 hover:border-white/30 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-4 gap-2">
        {screenshots.map((shot, i) => (
          <button
            key={shot.src}
            type="button"
            onClick={() => setIdx(i)}
            className={`cursor-pointer overflow-hidden rounded border transition ${
              i === idx ? 'border-white/50 opacity-100' : 'border-white/10 opacity-45 hover:opacity-80'
            }`}
          >
            <img src={shot.src} alt={shot.caption} className="aspect-[16/10] w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

const Real3DInspector: React.FC<{
  screenshots: { src: string; caption: string }[];
  accentHex: string;
}> = ({ screenshots, accentHex }) => {
  const [selected, setSelected] = useState(0);
  const current = screenshots[selected];

  return (
    <div className="rounded-xl border border-white/12 bg-[#07080B] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono-tech text-xs text-white/80">
          <Glasses className="h-4 w-4" style={{ color: accentHex }} />
          <span>Core ML Depth Compare (Real3D Pipeline)</span>
        </div>
        <div className="flex gap-1.5">
          {screenshots.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={`cursor-pointer rounded px-2.5 py-1 font-mono-tech text-[11px] transition ${
                selected === i
                  ? 'bg-white/15 text-white border border-white/25'
                  : 'text-white/45 hover:text-white/80 border border-white/5'
              }`}
            >
              {i === 0 ? 'DA3 Small' : 'DAv2 Metric'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
        <img
          src={current.src}
          alt={current.caption}
          className="w-full object-cover"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-white/65">
        <span>{current.caption}</span>
        <span className="font-mono-tech text-[11px]" style={{ color: accentHex }}>
          3840×1080 Full SBS @ 60 FPS
        </span>
      </div>
    </div>
  );
};

const KrakenVectorMark: React.FC = () => (
  <svg viewBox="0 0 64 64" className="h-11 w-11" fill="none" aria-hidden="true">
    <rect x="4" y="4" width="56" height="56" rx="14" stroke="#34D399" strokeOpacity="0.45" strokeWidth="1.5" />
    <circle cx="32" cy="28" r="11" stroke="#34D399" strokeWidth="2.2" />
    <path
      d="M22 36C20 42 16 46 14 48M27 38C26 44 25 48 23 51M37 38C38 44 39 48 41 51M42 36C44 42 48 46 50 48M32 39V52"
      stroke="#38BDF8"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <circle cx="28" cy="27" r="2" fill="#F3F4F6" />
    <circle cx="36" cy="27" r="2" fill="#F3F4F6" />
  </svg>
);
