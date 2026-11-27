import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Gamepad2,
  Github,
  Laptop,
  Layers,
  Monitor,
} from 'lucide-react';
import {
  MAC_APPS,
  MacApp,
  PORTING_PIPELINE,
  WIIU_PORTS,
} from '../data/catalog';
import { appNotes, art, stories } from '../data/editorial';
import { useSmartMirror } from '../lib/mirrors';
import { AppSquircle } from './HomePage';
import { AppDownloadsSection } from './AppDownloads';
import {
  EpidaurusArchitectureWidget,
  FoveaArchitectureWidget,
} from './AppVisuals';
import { PortUpdatesStrip } from './UpdatesPages';

export function GamesCatalogPage() {
  return (
    <div className="catalog-page">
      <section className="catalog-hero">
        <div className="container">
          <span className="section-eyebrow">
            <Gamepad2 size={15} />
            <span>Nintendo Wii U</span>
          </span>
          <h1>Игровые порты для Wii U</h1>
          <p className="catalog-lead">
            Четыре проекта с уникальным использованием второго экрана Wii U
            GamePad — от полноценного кооператива без split-screen до
            экспериментального переноса Unity-игр.
          </p>
        </div>
      </section>

      <section className="catalog-body">
        <div className="container">
          <div className="ports-grid ports-grid-large">
            {WIIU_PORTS.map((game) => {
              const story = stories[game.slug];
              return (
                <a
                  key={game.id}
                  href={`#games/${game.slug}`}
                  className={`port-card port-card-xl port-card-${game.slug}`}
                >
                  <div className="port-card-media">
                    <img src={art(game.slug, 'cover')} alt={game.title} />
                    <div className="port-card-scrim" />
                    <img
                      className="port-card-logo"
                      src={art(game.slug, 'logo')}
                      alt=""
                    />
                    <span className={`status-badge status-${game.statusTone}`}>
                      {story.status}
                    </span>
                  </div>
                  <div className="port-card-body">
                    <div className="port-card-top">
                      <h3>{story.name}</h3>
                      <span className="port-card-arrow">
                        <ArrowUpRight size={18} />
                      </span>
                    </div>
                    <p className="port-card-summary">{story.deck}</p>
                    <div className="port-card-meta-line">
                      <span>
                        <Monitor size={14} /> {story.players}
                      </span>
                      <span>{game.fpsTarget}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          <div className="pipeline-section">
            <div className="pipeline-head">
              <span className="section-eyebrow">
                <Cpu size={15} />
                <span>Инженерный стек</span>
              </span>
              <h2>Как устроен перенос игр на Wii U</h2>
            </div>
            <div className="pipeline-grid">
              {PORTING_PIPELINE.map((step) => (
                <div key={step.code} className="pipeline-card">
                  <span className="pipeline-code">{step.code}</span>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PortUpdatesStrip />
    </div>
  );
}

export function AppsCatalogPage() {
  const { getReleaseUrl } = useSmartMirror();
  return (
    <div className="catalog-page">
      <section className="catalog-hero">
        <div className="container">
          <span className="section-eyebrow">
            <Laptop size={15} />
            <span>macOS · Apple Silicon</span>
          </span>
          <h1>Приложения для Mac</h1>
          <p className="catalog-lead">
            Четыре нативных продукта с открытым кодом: кинотеатральный
            медиаплеер, прозрачное сжатие SSD, стерео 3D на Metal и нативный 3D
            eye tracking по обычной камере.
          </p>
        </div>
      </section>

      <section className="catalog-body">
        <div className="container">
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
                      <span className="platform-chip">{app.license}</span>
                    </div>
                  </div>

                  <a href={`#apps/${app.id}`} className="rpcs-app-title-link">
                    <h3>{app.name}</h3>
                    {app.previousName && (
                      <span className="prev-name">{app.previousName}</span>
                    )}
                  </a>

                  <p className="rpcs-app-desc">{appNotes[app.id]}</p>

                  <ul className="app-card-mini-specs">
                    {app.specs.slice(0, 2).map((s) => (
                      <li key={s.label}>
                        <span>{s.label}</span>
                        <strong>{s.value}</strong>
                      </li>
                    ))}
                  </ul>

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
                          Подробнее <ArrowRight size={14} />
                        </a>
                        {app.mirrors.githubRepoUrl && (
                          <a
                            href={app.mirrors.githubRepoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="icon-link"
                          >
                            <Github size={15} />
                            <span>GitHub</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {previewImg ? (
                      <a href={`#apps/${app.id}`} className="rpcs-app-peek" aria-hidden="true" tabIndex={-1}>
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
    </div>
  );
}

export function AppDetailPage({ app }: { app: MacApp }) {
  const [shotIndex, setShotIndex] = useState(0);
  const shots = app.screenshots ?? [];
  const otherApps = MAC_APPS.filter((a) => a.id !== app.id);

  return (
    <article className={`app-detail-page app-theme-${app.id}`}>
      <section className="app-detail-hero">
        <div className="container">
          <a className="back-pill" href="#apps">
            <ArrowLeft size={16} />
            <span>Приложения для Mac</span>
          </a>

          <div className="app-detail-header">
            <AppSquircle app={app} size="lg" />
            <div className="app-detail-intro">
              <div className="app-detail-badges">
                <span className="version-chip">{app.version}</span>
                <span className="platform-chip">{app.platform}</span>
                <span className="platform-chip">{app.license}</span>
              </div>
              <h1>
                {app.name}
                {app.previousName && <small> ({app.previousName})</small>}
              </h1>
              <p className="app-detail-tagline">{app.tagline}</p>
              <div className="dl-group">
                <button
                  type="button"
                  className="btn-tactile btn-tactile-blue"
                  onClick={() =>
                    document
                      .getElementById('app-downloads')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  <span>Скачать ({app.version})</span>
                  <span className="btn-chip">{app.mirrors.sizeLabel}</span>
                </button>
                {app.mirrors.githubRepoUrl && (
                  <a
                    className="btn-tactile btn-tactile-light"
                    href={app.mirrors.githubRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github size={17} />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AppDownloadsSection app={app} />

      <section className="app-detail-content">
        <div className="container app-detail-grid">
          <div className="app-detail-main">
            <div className="apple-surface-card">
              <span className="section-eyebrow">
                <Layers size={15} />
                <span>Возможности</span>
              </span>
              <h2>Как устроен {app.name}</h2>
              <p className="app-body-text">{app.description}</p>

              <ul className="app-highlights-list">
                {app.highlights.map((h) => (
                  <li key={h}>
                    <Check size={17} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="apple-surface-card">
              <span className="section-eyebrow">
                <Cpu size={15} />
                <span>Архитектура и замеры</span>
              </span>
              <h2>Спецификации</h2>
              <dl className="specs-dl">
                {app.specs.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="arch-note-box">
                <span>Пайплайн</span>
                <code>{app.architectureNote}</code>
              </div>
            </div>
          </div>

          <div className="app-detail-visual">
            {shots.length > 0 ? (
              <div className="apple-gallery-card">
                <div className="apple-gallery-stage">
                  <img
                    key={shots[shotIndex].src}
                    src={shots[shotIndex].src}
                    alt={shots[shotIndex].caption}
                  />
                </div>
                <div className="apple-gallery-bar">
                  <span>{shots[shotIndex].caption}</span>
                  <div className="apple-gallery-nav">
                    <button
                      type="button"
                      aria-label="Предыдущий скриншот"
                      onClick={() =>
                        setShotIndex((shotIndex + shots.length - 1) % shots.length)
                      }
                    >
                      <ChevronLeft size={17} />
                    </button>
                    <span>
                      {shotIndex + 1} / {shots.length}
                    </span>
                    <button
                      type="button"
                      aria-label="Следующий скриншот"
                      onClick={() => setShotIndex((shotIndex + 1) % shots.length)}
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
                {shots.length > 1 && (
                  <div className="apple-gallery-thumbs">
                    {shots.map((s, i) => (
                      <button
                        key={s.src}
                        type="button"
                        className={i === shotIndex ? 'is-active' : ''}
                        onClick={() => setShotIndex(i)}
                      >
                        <img src={s.src} alt={s.caption} loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : app.id === 'fovea' ? (
              <FoveaArchitectureWidget accentHex={app.accentHex} />
            ) : (
              <EpidaurusArchitectureWidget accentHex={app.accentHex} />
            )}
          </div>
        </div>
      </section>

      <section className="app-other-section">
        <div className="container">
          <h2>Другие приложения Parhelio</h2>
          <div className="app-other-grid">
            {otherApps.map((other) => (
              <a
                key={other.id}
                href={`#apps/${other.id}`}
                className="app-other-card"
              >
                <AppSquircle app={other} />
                <div>
                  <strong>
                    {other.name} <span>{other.version}</span>
                  </strong>
                  <p>{appNotes[other.id]}</p>
                </div>
                <ArrowUpRight size={18} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
