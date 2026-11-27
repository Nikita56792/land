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
                <span className="btn-chip-emerald">4 порта</span>
              </a>
              <a className="btn-tactile btn-hero-subtle" href="#apps">
                <Laptop size={18} />
                <span>Приложения Mac</span>
                <span className="btn-chip-sky">Apple Silicon</span>
              </a>
            </div>
          </div>

          <div className="rpcs-hero-visual">
            <div className="hero-gamepad-float">
              <img
                src="./media/hardware/hero-gamepad.png"
                alt="Nintendo Wii U GamePad с запущенным Minecraft: Wii U Edition"
                fetchPriority="high"
              />
            </div>
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
                готовые установщики .dmg и .pkg на GitHub и локальном зеркале.
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
                      {(app.mirrors.cloudFileName || app.mirrors.githubReleaseUrl) && (
                        <a
                          href={
                            app.mirrors.cloudFileName
                              ? getReleaseUrl(app.mirrors.cloudFileName)
                              : app.mirrors.githubReleaseUrl!
                          }
                          download={app.mirrors.cloudFileName || undefined}
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
                <span>Все 4 порта</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
