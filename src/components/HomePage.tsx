import { useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Download,
  Gamepad2,
  Github,
  Laptop,
  Monitor,
  Newspaper,
} from 'lucide-react';
import { MAC_APPS, MacApp, WIIU_PORTS } from '../data/catalog';
import { appNotes, art, formatDate, stories, updates } from '../data/editorial';
import { useSmartMirror } from '../lib/mirrors';
import { FoveaVectorMark, KrakenVectorMark } from './AppVisuals';

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
            <a className="section-more-link" href="#games">
              <span>Все порты и пайплайн</span>
              <ArrowUpRight size={17} />
            </a>
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
