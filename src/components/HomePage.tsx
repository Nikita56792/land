import { useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Download,
  FolderOutput,
  Gamepad2,
  Github,
  HardDrive,
  Laptop,
  Monitor,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MAC_APPS, MacApp, WIIU_PORTS } from '../data/catalog';
import { appNotes, art, formatDate, stories, updates } from '../data/editorial';
import { useSmartMirror } from '../lib/mirrors';
import { FoveaVectorMark, KrakenVectorMark } from './AppVisuals';
import { MirrorSelectorBar } from './DownloadButtons';

const LAUNCHER_DOWNLOADS = [
  {
    id: 'macos',
    os: 'macOS',
    arch: 'arm64',
    ext: '.dmg',
    fileName: 'Parhelio-Launcher-1.0.0-macos-arm64.dmg',
    primary: true,
  },
  {
    id: 'windows',
    os: 'Windows',
    arch: 'x64',
    ext: '.exe',
    fileName: 'Parhelio-Launcher-1.0.0-windows-x64.exe',
    primary: false,
  },
  {
    id: 'linux',
    os: 'Linux',
    arch: 'x64',
    ext: '.AppImage',
    fileName: 'Parhelio-Launcher-1.0.0-linux-x64.AppImage',
    primary: false,
  },
] as const;

function LauncherOsGlyph({ os }: { os: 'macos' | 'windows' | 'linux' }) {
  if (os === 'macos') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.78-.96 2.84 1.04.08 2.09-.52 2.72-1.3" />
      </svg>
    );
  }
  if (os === 'windows') {
    return (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
        <path d="M3 5.55 10.35 4.5v7.05H3V5.55Zm8.45-1.2L21 3v8.55h-9.55V4.35ZM3 12.45h7.35v7.05L3 18.45v-6Zm8.45 0H21V21l-9.55-1.35v-7.2Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="m8 10 3 2.5L8 15" />
      <path d="M13 15h3" />
    </svg>
  );
}

function LauncherUiMockup() {
  return (
    <div className="launcher-mockup" aria-hidden="true">
      <div className="launcher-mockup-chrome">
        <div className="launcher-mockup-dots">
          <i className="dot-r" />
          <i className="dot-y" />
          <i className="dot-g" />
        </div>
        <span className="launcher-mockup-title">Parhelio Launcher · v1.0.0</span>
        <span className="launcher-mockup-live">
          <Zap size={12} />
          <span>8 потоков · Авто-зеркало</span>
        </span>
      </div>

      {/* 3-Step balenaEtcher-inspired Pipeline */}
      <div className="launcher-steps">
        <div className="launcher-step is-done">
          <span className="launcher-step-num">1</span>
          <div className="launcher-step-copy">
            <strong>1. Игра</strong>
            <span>Minecraft v688</span>
          </div>
          <CheckCircle2 size={15} className="launcher-step-check" />
        </div>

        <span className="launcher-step-arrow" aria-hidden="true">
          <ArrowRight size={14} />
        </span>

        <div className="launcher-step is-done">
          <span className="launcher-step-num">2</span>
          <div className="launcher-step-copy">
            <strong>2. SD-карта</strong>
            <span>WIIU_SD · 64 ГБ</span>
          </div>
          <HardDrive size={15} className="launcher-step-icon" />
        </div>

        <span className="launcher-step-arrow" aria-hidden="true">
          <ArrowRight size={14} />
        </span>

        <div className="launcher-step is-active">
          <span className="launcher-step-num">3</span>
          <div className="launcher-step-copy">
            <strong>3. Установка</strong>
            <span>Раскладка на SD</span>
          </div>
          <Sparkles size={15} className="launcher-step-spark" />
        </div>
      </div>

      {/* Live Multi-Stream Transfer Preview */}
      <div className="launcher-transfer-card">
        <div className="launcher-transfer-head">
          <div>
            <span className="launcher-transfer-game">Minecraft: Wii U Edition</span>
            <span className="launcher-transfer-sub">
              Cloud.ru РФ ↔ Cloudflare R2 · 8 HTTP Range потоков
            </span>
          </div>
          <span className="launcher-speed-badge">48.6 МБ/с</span>
        </div>

        <div className="launcher-progress-track">
          <div className="launcher-progress-fill" />
        </div>

        <div className="launcher-transfer-foot">
          <span>Скачано 1.09 / 1.41 ГБ · SHA-256 проверка</span>
          <span>77%</span>
        </div>
      </div>

      {/* Auto-Detected SD Target Paths */}
      <div className="launcher-path-pills">
        <div className="launcher-path-pill">
          <span className="launcher-path-tag tag-wuhb">Aroma .wuhb</span>
          <code>sd:/wiiu/apps/</code>
        </div>
        <div className="launcher-path-pill">
          <span className="launcher-path-tag tag-wup">WUP Installer</span>
          <code>sd:/install/&lt;Игра&gt;/</code>
        </div>
      </div>

      <div className="launcher-mockup-footer">
        <span>
          <ShieldCheck size={14} />
          <span>Автоопределение SD и безопасное извлечение</span>
        </span>
        <span className="launcher-eject-chip">
          <FolderOutput size={13} />
          <span>Своя папка</span>
        </span>
      </div>
    </div>
  );
}

export function AppSquircle({
  app,
  size = 'md',
}: {
  app: MacApp;
  size?: 'md' | 'lg';
}) {
  return (
    <span className={`app-squircle app-squircle-${size} app-squircle-${app.id}`}>
      {app.iconUrl ? (
        <img src={app.iconUrl} alt="" />
      ) : app.id === 'fovea' ? (
        <FoveaVectorMark />
      ) : (
        <KrakenVectorMark />
      )}
    </span>
  );
}

function ParhelioHeroArt() {
  return (
    <div className="parhelio-hero-art" aria-hidden="true">
      <svg
        viewBox="0 0 540 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="parhelio-hero-svg"
      >
        <defs>
          <radialGradient id="ph-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.48" />
            <stop offset="48%" stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#312e81" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ph-sun" cx="42%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#818cf8" />
          </radialGradient>
          <linearGradient id="ph-ring-a" x1="90" y1="60" x2="450" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.92" />
            <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="ph-ring-b" x1="120" y1="360" x2="420" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="ph-beam" x1="36" y1="220" x2="504" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0" />
            <stop offset="22%" stopColor="#bae6fd" stopOpacity="0.72" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.92" />
            <stop offset="78%" stopColor="#bae6fd" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ph-card" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.07" />
          </linearGradient>
        </defs>

        {/* Soft luminous halo backdrop */}
        <circle cx="270" cy="220" r="205" fill="url(#ph-glow)" />

        {/* Subtle geometric coordinate arcs */}
        <circle
          cx="270"
          cy="220"
          r="172"
          stroke="#ffffff"
          strokeOpacity="0.14"
          strokeWidth="1.2"
          strokeDasharray="5 9"
          className="ph-orbit-slow"
        />
        <circle
          cx="270"
          cy="220"
          r="134"
          stroke="url(#ph-ring-a)"
          strokeWidth="2.2"
        />
        <ellipse
          cx="270"
          cy="220"
          rx="184"
          ry="68"
          transform="rotate(-16 270 220)"
          stroke="url(#ph-ring-b)"
          strokeWidth="1.6"
        />
        <ellipse
          cx="270"
          cy="220"
          rx="184"
          ry="68"
          transform="rotate(16 270 220)"
          stroke="#ffffff"
          strokeOpacity="0.2"
          strokeWidth="1.2"
        />

        {/* Parhelic horizon beam */}
        <line
          x1="36"
          y1="220"
          x2="504"
          y2="220"
          stroke="url(#ph-beam)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="270"
          y1="48"
          x2="270"
          y2="392"
          stroke="#ffffff"
          strokeOpacity="0.16"
          strokeWidth="1.2"
          strokeDasharray="4 7"
        />

        {/* Twin parhelia (sun dogs) on the 22° halo */}
        <g className="ph-flare-left">
          <circle cx="136" cy="220" r="22" fill="#38bdf8" fillOpacity="0.24" />
          <circle cx="136" cy="220" r="10.5" fill="#7dd3fc" />
          <circle cx="136" cy="220" r="5" fill="#ffffff" />
        </g>
        <g className="ph-flare-right">
          <circle cx="404" cy="220" r="22" fill="#34d399" fillOpacity="0.24" />
          <circle cx="404" cy="220" r="10.5" fill="#6ee7b7" />
          <circle cx="404" cy="220" r="5" fill="#ffffff" />
        </g>

        {/* Central Parhelio optical prism & sun core */}
        <g className="ph-core-float">
          <polygon
            points="270,152 329,220 270,288 211,220"
            fill="#ffffff"
            fillOpacity="0.09"
            stroke="#ffffff"
            strokeOpacity="0.52"
            strokeWidth="1.5"
          />
          <circle cx="270" cy="220" r="42" fill="#ffffff" fillOpacity="0.16" />
          <circle cx="270" cy="220" r="24" fill="url(#ph-sun)" />
        </g>

        {/* Floating vector badge: Dual-Screen Console (top-left) */}
        <g transform="translate(40 62)">
          <g className="ph-badge-a">
            <rect
              width="142"
              height="62"
              rx="16"
              fill="url(#ph-card)"
              stroke="#ffffff"
              strokeOpacity="0.34"
              strokeWidth="1.2"
            />
            <rect x="16" y="16" width="32" height="22" rx="4" stroke="#ffffff" strokeWidth="1.8" />
            <rect x="34" y="29" width="22" height="15" rx="3.5" fill="#312e81" stroke="#6ee7b7" strokeWidth="1.8" />
            <rect x="70" y="20" width="54" height="7" rx="3.5" fill="#ffffff" fillOpacity="0.88" />
            <rect x="70" y="34" width="38" height="6" rx="3" fill="#a7f3d0" fillOpacity="0.72" />
          </g>
        </g>

        {/* Floating vector badge: Apple Silicon / Native Apps (bottom-right) */}
        <g transform="translate(358 312)">
          <g className="ph-badge-b">
            <rect
              width="146"
              height="62"
              rx="16"
              fill="url(#ph-card)"
              stroke="#ffffff"
              strokeOpacity="0.34"
              strokeWidth="1.2"
            />
            <rect x="18" y="17" width="28" height="28" rx="7" stroke="#7dd3fc" strokeWidth="1.8" />
            <rect x="25" y="24" width="14" height="14" rx="3" fill="#ffffff" fillOpacity="0.9" />
            <path d="M24 12V17M32 12V17M40 12V17M24 45V50M32 45V50M40 45V50" stroke="#bae6fd" strokeWidth="1.4" strokeLinecap="round" />
            <rect x="60" y="20" width="66" height="7" rx="3.5" fill="#ffffff" fillOpacity="0.88" />
            <rect x="60" y="34" width="46" height="6" rx="3" fill="#7dd3fc" fillOpacity="0.78" />
          </g>
        </g>

        {/* Minimalist star nodes */}
        <circle cx="198" cy="116" r="3.2" fill="#ffffff" fillOpacity="0.78" />
        <circle cx="386" cy="134" r="2.6" fill="#bae6fd" fillOpacity="0.85" />
        <circle cx="152" cy="318" r="2.8" fill="#6ee7b7" fillOpacity="0.82" />
        <circle cx="332" cy="356" r="3.2" fill="#ffffff" fillOpacity="0.65" />
      </svg>
    </div>
  );
}

export function HomePage() {
  const newsTrackRef = useRef<HTMLDivElement>(null);
  const { getReleaseUrl } = useSmartMirror();

  const scrollNews = (dir: number) => {
    newsTrackRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      {/* RPCS3-inspired Luminous Cobalt-Indigo Hero */}
      <section className="rpcs-hero" aria-label="Главный экран Parhelio">
        <div className="rpcs-hero-particles" aria-hidden="true" />
        <div className="container rpcs-hero-grid">
          <div className="rpcs-hero-copy">
            <h1>
              Порты для Wii U
              <br />и приложения для Mac
            </h1>
            <p className="rpcs-hero-lead">
              Двухэкранный кооператив на одной консоли без split-screen и
              нативные утилиты под macOS — с открытым кодом и прямыми сборками.
            </p>
            <div className="rpcs-hero-ctas">
              <a className="btn-tactile btn-hero-glass" href="#games">
                <Gamepad2 size={18} />
                <span>Игры Wii U</span>
                <span className="btn-chip-emerald">5 портов</span>
              </a>
              <a className="btn-tactile btn-hero-subtle" href="#apps">
                <Laptop size={18} />
                <span>Приложения Mac</span>
                <span className="btn-chip-sky">Apple Silicon</span>
              </a>
            </div>
          </div>

          <div className="rpcs-hero-visual">
            <ParhelioHeroArt />
          </div>
        </div>

        <button
          type="button"
          className="rpcs-hero-chevron"
          aria-label="Перейти к проектам"
          onClick={() =>
            document
              .getElementById('home-ports')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          <ChevronDown size={28} />
        </button>

        <svg
          className="rpcs-hero-wave"
          viewBox="0 0 1440 84"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,26 C340,94 1080,-10 1440,56 L1440,84 L0,84 Z"
            fill="#ffffff"
          />
        </svg>
      </section>

      {/* Section 1: Wii U Ports Showcase */}
      <section className="home-section home-ports" id="home-ports">
        <div className="container">
          <div className="section-heading-row">
            <div>
              <span className="section-eyebrow">
                <Gamepad2 size={15} />
                <span>Nintendo Wii U</span>
              </span>
              <h2>Игровые порты</h2>
              <p className="section-sub">
                Каждая игра оформлена под собственный мир и раскрывает второй
                экран Wii U GamePad.
              </p>
            </div>
            <div className="section-heading-actions">
              <button
                type="button"
                className="section-launcher-jump"
                onClick={() =>
                  document
                    .getElementById('home-launcher')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <Download size={15} />
                <span>Parhelio Launcher</span>
              </button>
              <a className="section-more-link" href="#games">
                <span>Все порты и пайплайн</span>
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>

          <div className="ports-grid">
            {WIIU_PORTS.map((game) => {
              const story = stories[game.slug];
              return (
                <a
                  key={game.id}
                  href={`#games/${game.slug}`}
                  className={`port-card port-card-${game.slug}`}
                >
                  <div className="port-card-media">
                    <img
                      src={art(game.slug, 'cover')}
                      alt={game.title}
                      loading="lazy"
                    />
                    <div className="port-card-scrim" />
                    <img
                      className="port-card-logo"
                      src={art(game.slug, 'logo')}
                      alt=""
                      loading="lazy"
                    />
                    <span className={`status-badge status-${game.statusTone}`}>
                      {story.status}
                    </span>
                  </div>

                  <div className="port-card-body">
                    <div className="port-card-top">
                      <h3>{story.shortTitle}</h3>
                      <span className="port-card-arrow" aria-hidden="true">
                        <ArrowUpRight size={17} />
                      </span>
                    </div>
                    <p className="port-card-genre">{story.genre}</p>
                    <div className="port-card-dual">
                      <Monitor size={14} />
                      <span>{story.players}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 1.5: Parhelio Launcher (Apple + balenaEtcher + RPCS3 Hybrid Showcase) */}
      <section
        className="home-section home-launcher-band"
        id="home-launcher"
        aria-label="Parhelio Launcher — загрузка и установка игр Wii U"
      >
        <div className="container">
          <div className="launcher-showcase-card">
            <div className="launcher-showcase-copy">
              <span className="launcher-eyebrow">
                <Zap size={14} />
                <span>НАТИВНЫЙ ЛАУНЧЕР · RUST + TAURI · БЕЗ РЕГИСТРАЦИИ</span>
              </span>

              <h2>Parhelio Launcher</h2>

              <p className="launcher-lead">
                Скачивайте все порты Wii U без регистрации на максимальной
                скорости — 8 параллельных потоков с автовыбором и
                автопереключением между <strong>Cloud.ru РФ</strong> и{' '}
                <strong>Cloudflare R2 Мир</strong>.
              </p>

              <ul className="launcher-feature-list">
                <li>
                  <CheckCircle2 size={17} />
                  <span>
                    Автоопределение SD-карты Wii U и точная раскладка:{' '}
                    <code>.wuhb</code> → <code>sd:/wiiu/apps/</code>,{' '}
                    <strong>WUP Installer</strong> →{' '}
                    <code>sd:/install/&lt;Игра&gt;/</code>.
                  </span>
                </li>
                <li>
                  <HardDrive size={17} />
                  <span>
                    Можно выбрать любую папку вручную, а после записи —
                    безопасно извлечь SD-карту в один клик.
                  </span>
                </li>
              </ul>

              <div
                className="launcher-os-grid"
                role="group"
                aria-label="Скачать Parhelio Launcher"
              >
                {LAUNCHER_DOWNLOADS.map((dl) => (
                  <a
                    key={dl.id}
                    href={getReleaseUrl(dl.fileName)}
                    download={dl.fileName}
                    className={`launcher-os-btn ${
                      dl.primary ? 'launcher-os-btn-primary' : ''
                    }`}
                  >
                    <span className="launcher-os-icon">
                      <LauncherOsGlyph os={dl.id} />
                    </span>
                    <span className="launcher-os-meta">
                      <strong>{dl.os}</strong>
                      <small>
                        {dl.arch} · {dl.ext}
                      </small>
                    </span>
                    <Download size={15} className="launcher-os-dl" />
                  </a>
                ))}
              </div>

              <div className="launcher-mirror-wrap">
                <MirrorSelectorBar />
              </div>
            </div>

            <div className="launcher-showcase-visual">
              <LauncherUiMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Mac Apps (RPCS3 Downloads + Modern Apple Skeuomorphism Cards) */}
      <section className="home-section home-apps-band">
        <div className="container">
          <div className="section-heading-row">
            <div>
              <span className="section-eyebrow">
                <Laptop size={15} />
                <span>macOS · Apple Silicon</span>
              </span>
              <h2>Приложения для Mac</h2>
              <p className="section-sub">
                Нативные инструменты на Rust, SwiftUI, Metal и Core ML —
                готовые установщики .dmg и .pkg на облачных зеркалах Parhelio.
              </p>
            </div>
            <a className="section-more-link" href="#apps">
              <span>Все приложения</span>
              <ArrowUpRight size={17} />
            </a>
          </div>

          <div className="rpcs-apps-grid">
            {MAC_APPS.map((app) => {
              const previewImg =
                app.id === 'kraken'
                  ? './media/apps/kraken-disk-map.png'
                  : app.id === 'real3d'
                    ? './media/apps/real3d-compare-1.png'
                    : null;

              return (
                <article key={app.id} className={`rpcs-app-card rpcs-app-${app.id}`}>
                  <div className="rpcs-app-head">
                    <AppSquircle app={app} />
                    <div className="rpcs-app-badges">
                      <span className="version-chip">{app.version}</span>
                      <span className="platform-chip">Apple Silicon</span>
                    </div>
                  </div>

                  <a href={`#apps/${app.id}`} className="rpcs-app-title-link">
                    <h3>{app.name}</h3>
                    {app.previousName && (
                      <span className="prev-name">{app.previousName}</span>
                    )}
                  </a>

                  <p className="rpcs-app-desc">{appNotes[app.id]}</p>

                  <div className="rpcs-app-bottom">
                    <div className="rpcs-app-btns">
                      {app.mirrors.cloudFileName && (
                        <a
                          href={getReleaseUrl(app.mirrors.cloudFileName)}
                          download={app.mirrors.cloudFileName}
                          className={`btn-rpcs-pill btn-rpcs-${app.id}`}
                        >
                          <span className="pill-arch">ARM</span>
                          <span className="pill-label">
                            <strong>Скачать</strong>
                            <small>{app.mirrors.sizeLabel}</small>
                          </span>
                        </a>
                      )}
                      <div className="rpcs-app-sublinks">
                        <a href={`#apps/${app.id}`} className="text-link">
                          Подробнее
                          <ArrowRight size={14} />
                        </a>
                        {app.mirrors.githubRepoUrl && (
                          <a
                            href={app.mirrors.githubRepoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="icon-link"
                            aria-label={`GitHub репозиторий ${app.name}`}
                          >
                            <Github size={15} />
                            <span>Код</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {previewImg ? (
                      <a
                        href={`#apps/${app.id}`}
                        className="rpcs-app-peek"
                        aria-hidden="true"
                        tabIndex={-1}
                      >
                        <img src={previewImg} alt="" loading="lazy" />
                      </a>
                    ) : app.id === 'fovea' ? (
                      <a
                        href={`#apps/${app.id}`}
                        className="rpcs-app-peek rpcs-app-peek-fovea"
                        aria-hidden="true"
                        tabIndex={-1}
                      >
                        <div className="mini-player-ui">
                          <span className="mini-badge mini-badge-sky">0.86 мс ANE Gaze</span>
                          <span className="mini-badge mini-badge-sky">60–120 Гц ProMotion</span>
                          <span className="mini-badge mini-badge-sky">Zero-Calibration</span>
                        </div>
                      </a>
                    ) : (
                      <a
                        href={`#apps/${app.id}`}
                        className="rpcs-app-peek rpcs-app-peek-epidaurus"
                        aria-hidden="true"
                        tabIndex={-1}
                      >
                        <div className="mini-player-ui">
                          <span className="mini-badge">H.266 · 302 FPS</span>
                          <span className="mini-badge">Dolby Atmos HRTF</span>
                          <span className="mini-badge">HDR10+ · EDR</span>
                          <div className="mini-wave">
                            <i />
                            <i />
                            <i />
                            <i />
                            <i />
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Minecraft.net-inspired Updates Feed */}
      <section className="home-section mc-news-band" aria-label="Последние обновления портов">
        <div className="container mc-news-layout">
          <div className="mc-news-intro">
            <span className="section-eyebrow">
              <Newspaper size={15} />
              <span>Журнал портов</span>
            </span>
            <h2>Что нового в портах?</h2>
            <p>
              Свежие сборки, технические заметки по DualScreenUI, замеры FPS на
              реальной консоли и прогресс портирования.
            </p>
            <a className="mc-news-all-link" href="#updates">
              <span>Все обновления</span>
              <ArrowUpRight size={16} />
            </a>
            <div className="mc-news-arrows">
              <button
                type="button"
                aria-label="Прокрутить влево"
                onClick={() => scrollNews(-1)}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Прокрутить вправо"
                onClick={() => scrollNews(1)}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="mc-news-track" ref={newsTrackRef}>
            {updates.map((note) => (
              <a
                key={note.slug}
                href={`#updates/${note.slug}`}
                className="mc-news-card"
              >
                <div className="mc-news-thumb">
                  <img src={note.heroImage} alt={note.title} loading="lazy" />
                </div>
                <div className="mc-news-meta">
                  <span className="mc-news-tag">{note.tag}</span>
                  <time dateTime={note.date}>{formatDate(note.date)}</time>
                </div>
                <h3>{note.title}</h3>
                <p>{note.summary}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Compact Quick-Release Callout for Ready Build */}
      <section className="home-release-strip">
        <div className="container">
          <div className="release-banner-card">
            <div className="release-banner-left">
              <img
                src="./media/art/cutouts/mc-grass.webp"
                alt=""
                className="release-banner-block"
              />
              <div>
                <span className="release-pill-green">Зеркала Parhelio · 3 готовых порта</span>
                <h3>Minecraft v688 · Buckshot Build 116 · Slime Rancher v42</h3>
                <p>
                  Автоматический выбор зеркала РФ / Мир — готовые сборки Aroma
                  .wuhb и WUP Installer GX2 с проверенными контрольными суммами.
                </p>
              </div>
            </div>
            <div className="release-banner-right">
              <a
                href={getReleaseUrl('Minecraft.WiiU.wuhb')}
                download="Minecraft.WiiU.wuhb"
                className="btn-tactile btn-tactile-blue"
              >
                <Download size={17} />
                <span>Minecraft .wuhb</span>
                <span className="btn-chip">1.41 ГБ</span>
              </a>
              <a href="#games" className="btn-tactile btn-tactile-light">
                <span>Все 5 портов</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
