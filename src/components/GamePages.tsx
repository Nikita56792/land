import { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Download,
  Film,
  Gamepad2,
  Images,
  Monitor,
  Play,
  Radio,
  Sparkles,
  Waves,
} from 'lucide-react';
import { GamePort, TechSolution } from '../data/catalog';
import {
  art,
  GameFaq,
  GalleryShot,
  hardwareImage,
  stories,
} from '../data/editorial';
import { CopyPathPill, DownloadButtons } from './DownloadButtons';
import { PortUpdatesStrip } from './UpdatesPages';

/* ── Shared Interactive Media Showcase (Video + Authentic Screenshot Strip) ── */
function GameMediaStage({
  game,
  shots,
  theme,
}: {
  game: GamePort;
  shots: GalleryShot[];
  theme: 'minecraft' | 'buckshot' | 'slime' | 'subnautica' | 'acnh';
}) {
  const hasVideo = Boolean(game.videoUrl);
  // index 0..shots.length-1 are images; -1 is video mode (only if hasVideo)
  const [active, setActive] = useState<number>(hasVideo ? -1 : 0);
  const total = shots.length;

  const step = (dir: number) => {
    if (!hasVideo) {
      setActive((active + dir + total) % total);
      return;
    }
    if (active === -1) {
      setActive(dir > 0 ? 0 : total - 1);
    } else {
      const next = active + dir;
      if (next < 0 || next >= total) setActive(-1);
      else setActive(next);
    }
  };

  const caption =
    active === -1
      ? `Официальный видеоролик · ${stories[game.slug].shortTitle}`
      : shots[active].caption;

  return (
    <div className={`media-stage media-stage-${theme}`}>
      <div className="media-stage-toolbar">
        <div className="media-mode-pills">
          {hasVideo && (
            <button
              type="button"
              className={active === -1 ? 'is-active' : ''}
              onClick={() => setActive(-1)}
            >
              <Film size={15} />
              <span>Видео</span>
            </button>
          )}
          <button
            type="button"
            className={active >= 0 ? 'is-active' : ''}
            onClick={() => setActive(active >= 0 ? active : 0)}
          >
            <Images size={15} />
            <span>Скриншоты ({total})</span>
          </button>
        </div>

        <div className="media-stage-arrows">
          <button
            type="button"
            aria-label="Предыдущий слайд"
            onClick={() => step(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Следующий слайд"
            onClick={() => step(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="media-stage-viewport">
        {active === -1 && hasVideo ? (
          <video
            key={game.videoUrl}
            className="media-stage-video"
            controls
            playsInline
            preload="metadata"
            poster={art(game.slug, 'cover')}
            src={game.videoUrl}
            aria-label={`Видео ${game.title}`}
          />
        ) : (
          <img
            key={shots[Math.max(0, active)].src}
            src={shots[Math.max(0, active)].src}
            alt={shots[Math.max(0, active)].caption}
            className="media-stage-img"
          />
        )}
      </div>

      <p className="media-stage-caption" aria-live="polite">
        {caption}
      </p>

      <div className="media-thumbs" role="list" aria-label="Миниатюры медиа">
        {hasVideo && (
          <button
            type="button"
            className={`media-thumb media-thumb-video ${active === -1 ? 'is-active' : ''}`}
            onClick={() => setActive(-1)}
            aria-label="Показать видео"
          >
            <img src={art(game.slug, 'cover')} alt="" loading="lazy" />
            <span className="thumb-play-badge">
              <Play size={14} fill="currentColor" />
              <span>Видео</span>
            </span>
          </button>
        )}

        {shots.map((shot, idx) => (
          <button
            key={shot.src}
            type="button"
            className={`media-thumb ${active === idx ? 'is-active' : ''}`}
            onClick={() => setActive(idx)}
            aria-label={shot.caption}
          >
            <img src={shot.src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Shared Clean FAQ Accordion (Minecraft.net inspired) ── */
function FaqAccordion({
  items,
  dark = false,
}: {
  items: GameFaq[];
  dark?: boolean;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className={`faq-list ${dark ? 'faq-dark' : 'faq-light'}`}>
      {items.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={item.q} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="faq-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpenIdx(isOpen ? null : idx)}
            >
              <span>{item.q}</span>
              <ChevronDown size={18} />
            </button>
            {isOpen && <p className="faq-answer">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Shared Engineering / Implemented Technologies Grid ── */
function TechSolutionsBlock({
  items,
  theme,
}: {
  items: TechSolution[];
  theme: 'minecraft' | 'buckshot' | 'slime' | 'subnautica' | 'acnh';
}) {
  if (!items.length) return null;
  return (
    <div className={`tech-solutions-block tech-theme-${theme}`}>
      <div className="tech-solutions-head">
        <span className="tech-solutions-kicker">
          <Cpu size={14} />
          <span>Инженерные решения и технологии</span>
        </span>
        <h3>Что внедрено внутри порта</h3>
      </div>
      <div className="tech-solutions-grid">
        {items.map((sol) => (
          <article key={sol.title} className="tech-solution-card">
            <span className="tech-solution-tag">{sol.tag}</span>
            <h4>{sol.title}</h4>
            <p>{sol.detail}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ── Stepped Pixel Block Divider (Minecraft.net signature!) ── */
function PixelDivider({
  topColor,
  bottomColor,
}: {
  topColor: string;
  bottomColor: string;
}) {
  return (
    <div
      className="pixel-divider"
      style={{ background: bottomColor }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1440 48" preserveAspectRatio="none">
        <path
          fill={topColor}
          d="M0,0 H1440 V16 H1320 V32 H1200 V16 H1040 V48 H920 V16 H720 V32 H600 V16 H420 V48 H300 V16 H160 V32 H60 V48 H0 Z"
        />
      </svg>
    </div>
  );
}

/* ── Scalloped Cloud / Wave Divider (Slime Rancher signature!) ── */
function ScallopDivider({
  fill,
  bg,
  flip = false,
}: {
  fill: string;
  bg: string;
  flip?: boolean;
}) {
  return (
    <div
      className={`scallop-divider ${flip ? 'is-flipped' : ''}`}
      style={{ background: bg }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1200 56" preserveAspectRatio="none">
        <path
          fill={fill}
          d="M0,56 L0,28 Q40,-6 80,28 Q120,-8 160,28 Q200,-4 240,28 Q280,-10 320,28 Q360,-4 400,28 Q440,-8 480,28 Q520,-2 560,28 Q600,-10 640,28 Q680,-4 720,28 Q760,-8 800,28 Q840,-2 880,28 Q920,-10 960,28 Q1000,-4 1040,28 Q1080,-8 1120,28 Q1160,-4 1200,28 L1200,56 Z"
        />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. MINECRAFT: WII U EDITION — Faithful Minecraft.net Aesthetic
   ═══════════════════════════════════════════════════════════════ */
function MinecraftPage({ game }: { game: GamePort }) {
  const story = stories.minecraft;

  return (
    <div className="game-world world-minecraft">
      {/* Full-bleed Voxel Hero */}
      <section
        className="mc-hero"
        style={{ backgroundImage: `url(${art('minecraft', 'cover')})` }}
      >
        <div className="mc-hero-scrim" />
        <div className="container mc-hero-inner">
          <div className="game-top-bar">
            <a className="game-back-pill" href="#games">
              <ArrowLeft size={16} />
              <span>Все порты Wii U</span>
            </a>
            <nav className="game-subnav" aria-label="Навигация по странице">
              {(
                [
                  ['mc-dual', 'Два экрана'],
                  ['mc-gallery', 'Галерея'],
                  ['mc-download', 'Скачать'],
                  ['mc-faq', 'Вопросы'],
                ] as const
              ).map(([targetId, label]) => (
                <button
                  key={targetId}
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(targetId)
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mc-hero-lockup">
            <span className="mc-hero-tag">{story.heroTag}</span>
            <h1>
              <img
                src={art('minecraft', 'logo')}
                alt="Minecraft: Wii U Edition"
              />
            </h1>
            <p className="mc-hero-deck">{story.deck}</p>
            <div className="mc-hero-actions">
              <button
                type="button"
                className="mc-btn mc-btn-green"
                onClick={() =>
                  document
                    .getElementById('mc-download')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <Download size={18} />
                <span>СКАЧАТЬ (.WUHB / WUP)</span>
              </button>
              <button
                type="button"
                className="mc-btn mc-btn-purple"
                onClick={() =>
                  document
                    .getElementById('mc-gallery')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <Play size={17} />
                <span>СМОТРЕТЬ МИР</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <PixelDivider topColor="#171615" bottomColor="#ffffff" />

      {/* DualScreen Showcase + "HOW MINECRAFT WORKS" 3-character strip */}
      <section className="mc-dual-section" id="mc-dual">
        <div className="container">
          <div className="mc-section-center">
            <span className="mc-kicker">TV + WII U GAMEPAD</span>
            <h2 className="mc-pixel-heading">{story.dualTitle}</h2>
            <p className="mc-center-lead">{story.dualLead}</p>
          </div>

          <figure className="hardware-showcase hardware-showcase-light">
            <img
              src={hardwareImage('minecraft')}
              alt="Телевизор с видом первого игрока и Wii U GamePad с видом второго игрока в Minecraft"
            />
            <figcaption className="hardware-legend">
              <span>
                <Monitor size={15} /> {story.tvBadge}
              </span>
              <span>
                <Gamepad2 size={15} /> {story.gamepadBadge}
              </span>
            </figcaption>
          </figure>

          <div className="mc-works-block">
            <h3 className="mc-works-heading">КАК УСТРОЕН DUALSCREEN CO-OP</h3>
            <div className="mc-pillars-grid">
              {story.pillars.map((p) => (
                <div key={p.title} className="mc-pillar-card">
                  {p.image && (
                    <div className="mc-pillar-fig">
                      <img src={p.image} alt="" loading="lazy" />
                    </div>
                  )}
                  <h4>{p.title}</h4>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
          </div>

          <TechSolutionsBlock items={game.techSolutions} theme="minecraft" />
        </div>
      </section>

      <PixelDivider topColor="#ffffff" bottomColor="#0d0d0d" />

      {/* Pitch-Black Minecraft.net Gallery Stage */}
      <section className="mc-gallery-section" id="mc-gallery">
        <div className="container">
          <div className="mc-section-center">
            <span className="mc-kicker mc-kicker-green">
              ОФИЦИАЛЬНЫЕ КАДРЫ WII U EDITION
            </span>
            <h2 className="mc-pixel-heading mc-heading-white">
              ОТКРОЙТЕ МИР MINECRAFT
            </h2>
            <p className="mc-center-lead mc-lead-dark">
              Стройте на поверхности, спускайтесь в шахты и исследуйте миры
              Wii U Edition на двух независимых экранах.
            </p>
          </div>

          <GameMediaStage
            game={game}
            shots={story.gallery}
            theme="minecraft"
          />
        </div>
      </section>

      <PixelDivider topColor="#0d0d0d" bottomColor="#3c8527" />

      {/* Vibrant Minecraft Green Release & Install Band */}
      <section className="mc-download-band" id="mc-download">
        <div className="container">
          <div className="mc-download-card">
            <div className="mc-download-left">
              <span className="mc-release-badge">
                UPDATE v688 · AROMA .WUHB + WUP INSTALLER
              </span>
              <h2 className="mc-pixel-heading">СКАЧАТЬ СБОРКУ</h2>
              <p>
                Доступны оба формата: самодостаточный <code>.wuhb</code> для
                прямого запуска с SD под Aroma (1.41 ГБ) и полный пакет{' '}
                <strong>WUP Installer GX2</strong> (1.44 ГБ) для установки в
                NAND/USB.
              </p>
              <DownloadButtons mirrors={game.mirrors} variant="minecraft" />
              <div className="path-pills-stack">
                <CopyPathPill value={game.installPath} label="Путь для Aroma (.wuhb)" />
                {game.secondaryInstallPath && (
                  <CopyPathPill
                    value={game.secondaryInstallPath}
                    label={game.secondaryInstallLabel || 'Путь для WUP Installer GX2'}
                  />
                )}
              </div>
            </div>

            <div className="mc-download-right">
              <h3>Технические параметры</h3>
              <dl className="specs-dl">
                {game.telemetry.map((t) => (
                  <div key={t.label}>
                    <dt>{t.label}</dt>
                    <dd>{t.value}</dd>
                  </div>
                ))}
                <div>
                  <dt>Движок / стек</dt>
                  <dd>{game.engineStack}</dd>
                </div>
                <div>
                  <dt>Целевые кадры</dt>
                  <dd>{game.fpsTarget}</dd>
                </div>
              </dl>
              <p className="mc-credit">{story.developerCredit}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark FAQ Accordion (Minecraft.net style) */}
      <section className="mc-faq-section" id="mc-faq">
        <div className="container">
          <h2 className="mc-pixel-heading mc-heading-white">ЧАСТЫЕ ВОПРОСЫ</h2>
          <FaqAccordion items={story.faq} dark />
        </div>
      </section>

      <PortUpdatesStrip gameSlug="minecraft" theme="light" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. BUCKSHOT ROULETTE — Faithful Mike Klubnika Industrial Page
   ═══════════════════════════════════════════════════════════════ */
function BuckshotPage({ game }: { game: GamePort }) {
  const story = stories.buckshot;

  return (
    <div className="game-world world-buckshot">
      <div className="br-rail br-rail-left" aria-hidden="true" />
      <div className="br-rail br-rail-right" aria-hidden="true" />

      <div className="br-shell">
        {/* Atmospheric Underground Hero */}
        <section
          className="br-hero"
          style={{ backgroundImage: `url(${art('buckshot', 'cover')})` }}
        >
          <div className="br-hero-scrim" />
          <div className="container br-hero-inner">
            <div className="game-top-bar game-top-bar-end">
              <span className="br-stamp">BUILD 116 (v44) // C++20 + GX2 · 30 FPS</span>
            </div>

            <div className="br-hero-lockup">
              <h1 className="br-logo-wrap">
                <img
                  src={art('buckshot', 'logo')}
                  alt="Buckshot Roulette"
                />
              </h1>
              <p className="br-hero-deck">{story.deck}</p>
              <div className="br-hero-actions">
                <button
                  type="button"
                  className="br-btn br-btn-primary"
                  onClick={() =>
                    document
                      .getElementById('br-release')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  <Download size={16} />
                  <span>Скачать .wuhb / WUP</span>
                </button>
                <button
                  type="button"
                  className="br-btn"
                  onClick={() =>
                    document
                      .getElementById('br-dual')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  <Gamepad2 size={16} />
                  <span>Режим 1v1 (TV + GamePad)</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Authentic Mike Klubnika Dossier Split (monospace left + stacked screenshots right) */}
        <section className="br-dossier">
          <div className="container">
            <div className="br-dossier-head">
              <h2>Buckshot Roulette — Wii U Edition</h2>
              <span>GD → PPC / GX2</span>
            </div>
            <div className="br-dotted-rule" />

            <div className="br-dossier-grid">
              <div className="br-dossier-text">
                <p className="br-meta-lines">
                  Оригинал: Mike Klubnika / CRITICAL REFLEX
                  <br />
                  Порт Wii U: Nikita56792 (PowerPC 750CL + GX2)
                  <br />
                  Жанр: Tabletop Horror / Local 1v1
                  <br />
                  Частота кадров: {game.fpsTarget}
                </p>

                <p>
                  <strong>BUCKSHOT ROULETTE</strong> переносит русскую рулетку с
                  револьвера на помповый дробовик 12-го калибра под дрожащим
                  светом подпольного клуба.
                </p>
                <p>
                  На Nintendo Wii U игра работает на собственном C++20/WUT
                  рантайме без движка Godot (720p→1080p AMD CAS, 28 нативных
                  шейдеров GX2, звук AX IMA-ADPCM) и раскрывает главное
                  преимущество консоли —{' '}
                  <strong>честную локальную дуэль вдвоём</strong>, где у
                  второго игрока полностью отдельный экран и личный звук.
                </p>

                <h3 className="br-subhead">ОСОБЕННОСТИ ПОРТА:</h3>
                <ul className="br-feature-list">
                  {game.highlights.map((h) => (
                    <li key={h}>– {h}</li>
                  ))}
                  <li>– Одиночная кампания против Дилера и локальный PvP 1v1</li>
                  <li>– Полная адаптация под стики, триггеры и тачскрин DRC</li>
                </ul>

                <div className="br-dossier-cta">
                  <button
                    type="button"
                    className="br-btn br-btn-primary"
                    onClick={() =>
                      document
                        .getElementById('br-media')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }
                  >
                    <Play size={15} />
                    <span>Открыть видео и галерею</span>
                  </button>
                </div>
              </div>

              <div className="br-stacked-shots">
                {story.gallery.slice(0, 3).map((shot) => (
                  <figure key={shot.src} className="br-raw-shot">
                    <img src={shot.src} alt={shot.caption} loading="lazy" />
                    <figcaption>{shot.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Authentic TV + GamePad Local 1v1 Showcase (REAL official screenshots!) */}
        <section className="br-dual-section" id="br-dual">
          <div className="container">
            <div className="br-dotted-rule" />
            <div className="br-dual-head">
              <span className="br-tag-amber">LOCAL 1V1 // ASYMMETRIC DISPLAY</span>
              <h2>{story.dualTitle}</h2>
              <p>{story.dualLead}</p>
            </div>

            <figure className="hardware-showcase hardware-showcase-dark">
              <img
                src={hardwareImage('buckshot')}
                alt="Телевизор с видом Игрока 1 напротив Дилера и Wii U GamePad с личным ракурсом предметов и патронов"
              />
              <figcaption className="hardware-legend hardware-legend-dark">
                <span>
                  <Monitor size={15} /> {story.tvBadge}
                </span>
                <span>
                  <Gamepad2 size={15} /> {story.gamepadBadge}
                </span>
              </figcaption>
            </figure>

            <div className="br-pillars-grid">
              {story.pillars.map((p, i) => (
                <div key={p.title} className="br-pillar-box">
                  <span className="br-pillar-num">0{i + 1}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>

            <TechSolutionsBlock items={game.techSolutions} theme="buckshot" />
          </div>
        </section>

        {/* Video & Full Screenshot Stage */}
        <section className="br-media-section" id="br-media">
          <div className="container">
            <div className="br-dotted-rule" />
            <div className="br-dual-head">
              <span className="br-tag-amber">ARCHIVE // FOOTAGE & STILLS</span>
              <h2>Кадры из игры и трейлер</h2>
            </div>
            <GameMediaStage
              game={game}
              shots={story.gallery}
              theme="buckshot"
            />
          </div>
        </section>

        {/* Release Status & Telemetry Terminal */}
        <section className="br-release-section" id="br-release">
          <div className="container">
            <div className="br-dotted-rule" />
            <div className="br-release-grid">
              <div>
                <span className="br-tag-amber">BUILD 116 (v44) // .WUHB + WUP</span>
                <h2>Скачать сборку</h2>
                <DownloadButtons mirrors={game.mirrors} variant="buckshot" />
                <div className="path-pills-stack">
                  <CopyPathPill value={game.installPath} label="Путь для Aroma (.wuhb)" dark />
                  {game.secondaryInstallPath && (
                    <CopyPathPill
                      value={game.secondaryInstallPath}
                      label={game.secondaryInstallLabel || 'Путь для WUP Installer GX2'}
                      dark
                    />
                  )}
                </div>
                {game.notice && (
                  <p className="game-notice-box game-notice-dark">{game.notice}</p>
                )}
              </div>
              <div className="br-telemetry-box">
                <dl className="br-dl">
                  {game.telemetry.map((t) => (
                    <div key={t.label}>
                      <dt>{t.label}</dt>
                      <dd>{t.value}</dd>
                    </div>
                  ))}
                  <div>
                    <dt>Стек</dt>
                    <dd>{game.engineStack}</dd>
                  </div>
                </dl>
                <p className="br-credit">{story.developerCredit}</p>
              </div>
            </div>

            <div className="br-faq-wrap">
              <h3>FAQ</h3>
              <FaqAccordion items={story.faq} dark />
            </div>
          </div>
        </section>

        <PortUpdatesStrip gameSlug="buckshot" theme="dark" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. SLIME RANCHER — Faithful Monomi Park Joyful Aesthetic
   ═══════════════════════════════════════════════════════════════ */
function SlimeRancherPage({ game }: { game: GamePort }) {
  const story = stories.slime;

  return (
    <div className="game-world world-slime">
      {/* Lush Sunlit Hero with Floating White Story Card & Peeking Slimes */}
      <section
        className="sr-hero"
        style={{ backgroundImage: `url(${art('slime', 'cover')})` }}
      >
        <div className="sr-hero-tint" />
        <div className="container sr-hero-inner">
          <div className="game-top-bar">
            <a className="sr-back-pill" href="#games">
              <ArrowLeft size={16} />
              <span>Все порты Wii U</span>
            </a>
            <span className="sr-status-pill">{story.heroTag}</span>
          </div>

          <div className="sr-hero-grid">
            <div className="sr-hero-logo-col">
              <h1>
                <img src={art('slime', 'logo')} alt="Slime Rancher" />
              </h1>
              <div className="sr-floating-slimes" aria-hidden="true">
                <img
                  className="sr-slime-bob sr-slime-1"
                  src="./media/art/cutouts/slime-pink.webp"
                  alt=""
                />
                <img
                  className="sr-slime-bob sr-slime-2"
                  src="./media/art/cutouts/slime-tabby.webp"
                  alt=""
                />
                <img
                  className="sr-slime-bob sr-slime-3"
                  src="./media/art/cutouts/slime-phosphor.webp"
                  alt=""
                />
              </div>
            </div>

            <div className="sr-hero-card">
              <span className="sr-card-eyebrow">
                <Sparkles size={15} />
                <span>ПОРТ ДЛЯ NINTENDO WII U</span>
              </span>
              <h2>Приключения на Далёком-Далёком Запределье</h2>
              <p>{story.deck}</p>
              <div className="sr-hero-actions">
                <button
                  type="button"
                  className="sr-btn sr-btn-pink"
                  onClick={() =>
                    document
                      .getElementById('sr-release')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  <Download size={16} />
                  <span>Скачать WUP (902 МБ)</span>
                </button>
                <button
                  type="button"
                  className="sr-btn sr-btn-white"
                  onClick={() =>
                    document
                      .getElementById('sr-media')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  <Play size={16} />
                  <span>Смотреть геймплей</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScallopDivider fill="#fff7fb" bg="#7c3aed" />

      {/* TV + GamePad Ranch Companion Band */}
      <section className="sr-dual-section">
        <div className="container">
          <div className="sr-section-center">
            <span className="sr-kicker">TV + GAMEPAD КОМПАНЬОН</span>
            <h2>{story.dualTitle}</h2>
            <p>{story.dualLead}</p>
          </div>

          <figure className="hardware-showcase hardware-showcase-slime">
            <img
              src={hardwareImage('slime')}
              alt="Телевизор с загоном розовых слаймов и Wii U GamePad с ранчо и дронами Slime Rancher"
            />
            <figcaption className="hardware-legend">
              <span>
                <Monitor size={15} /> {story.tvBadge}
              </span>
              <span>
                <Gamepad2 size={15} /> {story.gamepadBadge}
              </span>
            </figcaption>
          </figure>

          <div className="sr-pillars-grid">
            {story.pillars.map((p) => (
              <div key={p.title} className="sr-pillar-card">
                {p.image && (
                  <img
                    className="sr-pillar-slime"
                    src={p.image}
                    alt=""
                    loading="lazy"
                  />
                )}
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>

          <TechSolutionsBlock items={game.techSolutions} theme="slime" />
        </div>
      </section>

      <ScallopDivider fill="#ecfeff" bg="#fff7fb" />

      {/* Sunny Aqua Media & Gallery Stage */}
      <section className="sr-media-section" id="sr-media">
        <div className="container">
          <div className="sr-section-center">
            <span className="sr-kicker sr-kicker-aqua">ГАЛЕРЕЯ И РОЛИК</span>
            <h2>Утро на слаймовом ранчо</h2>
          </div>

          <GameMediaStage game={game} shots={story.gallery} theme="slime" />
        </div>
      </section>

      <ScallopDivider fill="#ffffff" bg="#ecfeff" />

      {/* Release & Playable Build Notes */}
      <section className="sr-release-section" id="sr-release">
        <div className="container">
          <div className="sr-release-card">
            <div>
              <span className="sr-kicker">BUILD v42 NOLOG · ТОЛЬКО WUP INSTALLER</span>
              <h2>Скачать Slime Rancher</h2>
              <p className="sr-release-lead">{game.summary}</p>
              <DownloadButtons mirrors={game.mirrors} variant="slime" />
              <CopyPathPill value={game.installPath} label="Путь для WUP Installer GX2 / NUSspli" />
              {game.notice && (
                <p className="game-notice-box game-notice-light">{game.notice}</p>
              )}
            </div>

            <div className="sr-specs-box">
              <dl className="specs-dl">
                {game.telemetry.map((t) => (
                  <div key={t.label}>
                    <dt>{t.label}</dt>
                    <dd>{t.value}</dd>
                  </div>
                ))}
                <div>
                  <dt>Движок</dt>
                  <dd>{game.engineStack}</dd>
                </div>
              </dl>
              <p className="sr-credit">{story.developerCredit}</p>
            </div>
          </div>

          <div className="sr-faq-wrap">
            <h3>Вопросы о порте</h3>
            <FaqAccordion items={story.faq} />
          </div>
        </div>
      </section>

      <PortUpdatesStrip gameSlug="slime" theme="light" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. SUBNAUTICA — Nintendo Oceanic Deep-Dive + Alterra PDA
   ═══════════════════════════════════════════════════════════════ */
function SubnauticaPage({ game }: { game: GamePort }) {
  const story = stories.subnautica;

  return (
    <div className="game-world world-subnautica">
      {/* Subtle underwater bubble ambience */}
      <div className="sn-bubbles" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* Sunlit Shallows Hero */}
      <section
        className="sn-hero"
        style={{ backgroundImage: `url(${art('subnautica', 'cover')})` }}
      >
        <div className="sn-hero-scrim" />
        <div className="container sn-hero-inner">
          <div className="game-top-bar">
            <a className="game-back-pill" href="#games">
              <ArrowLeft size={16} />
              <span>Все порты Wii U</span>
            </a>
            <span className="sn-depth-badge">
              <Waves size={15} />
              <span>PLANET 4546B · DEPTH 0M</span>
            </span>
          </div>

          <div className="sn-hero-grid">
            <div className="sn-hero-lockup">
              <span className="sn-eyebrow">{story.heroTag}</span>
              <h1>
                <img src={art('subnautica', 'logo')} alt="Subnautica" />
              </h1>
              <p className="sn-hero-deck">{story.deck}</p>
              <div className="sn-hero-actions">
                <button
                  type="button"
                  className="sn-btn sn-btn-cyan"
                  onClick={() =>
                    document
                      .getElementById('sn-pda')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  <Radio size={17} />
                  <span>Alterra PDA на GamePad</span>
                </button>
                <button
                  type="button"
                  className="sn-btn sn-btn-ghost"
                  onClick={() =>
                    document
                      .getElementById('sn-telemetry')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  <Cpu size={17} />
                  <span>Замеры Cemu / Wii U</span>
                </button>
              </div>
            </div>

            <div className="sn-hero-peeper" aria-hidden="true">
              <img src="./media/art/cutouts/sub-peeper.webp" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* Nintendo-inspired Oceanic Sonar Divider */}
      <div className="sn-sonar-divider" aria-hidden="true">
        <span>DEPTH 120M · ALTERRA DUAL-SCREEN INTERFACE</span>
      </div>

      {/* TV + Real Alterra PDA on Wii U GamePad Spotlight */}
      <section className="sn-pda-section" id="sn-pda">
        <div className="container">
          <div className="sn-section-center">
            <span className="sn-eyebrow">TV + GAMEPAD PDA</span>
            <h2>{story.dualTitle}</h2>
            <p>{story.dualLead}</p>
          </div>

          <figure className="hardware-showcase hardware-showcase-ocean">
            <img
              src={hardwareImage('subnautica')}
              alt="Телевизор с батискафом Мотылёк над коралловым рифом и Wii U GamePad с оригинальным экраном чертежей Alterra PDA"
            />
            <figcaption className="hardware-legend hardware-legend-dark">
              <span>
                <Monitor size={15} /> {story.tvBadge}
              </span>
              <span>
                <Gamepad2 size={15} /> {story.gamepadBadge}
              </span>
            </figcaption>
          </figure>

          <div className="sn-pillars-grid">
            {story.pillars.map((p) => (
              <div key={p.title} className="sn-pillar-card">
                <div className="sn-pillar-top">
                  {p.image ? (
                    <img
                      className="sn-pillar-art"
                      src={p.image}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <span className="sn-pillar-icon" aria-hidden="true">
                      <Cpu size={28} />
                    </span>
                  )}
                </div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>

          <TechSolutionsBlock items={game.techSolutions} theme="subnautica" />
        </div>
      </section>

      <div className="sn-sonar-divider" aria-hidden="true">
        <span>DEPTH 280M · BIOME ARCHIVE</span>
      </div>

      {/* Deep-Sea Video & Gallery */}
      <section className="sn-media-section" id="sn-media">
        <div className="container">
          <div className="sn-section-center">
            <span className="sn-eyebrow">ОФИЦИАЛЬНЫЕ КАДРЫ 4546B</span>
            <h2>От отмелей до биолюминесцентных глубин</h2>
          </div>

          <GameMediaStage
            game={game}
            shots={story.gallery}
            theme="subnautica"
          />
        </div>
      </section>

      <div className="sn-sonar-divider" aria-hidden="true">
        <span>DEPTH 450M · R&amp;D TELEMETRY</span>
      </div>

      {/* Honest R&D Hardware Benchmark & Status */}
      <section className="sn-telemetry-section" id="sn-telemetry">
        <div className="container">
          <div className="sn-telemetry-grid">
            <div className="sn-glass-panel">
              <span className="sn-eyebrow">ЧЕСТНЫЙ R&amp;D СТАТУС</span>
              <h2>Производительность адаптера</h2>
              <p className="sn-panel-lead">{game.summary}</p>

              <div className="sn-perf-bars">
                <div className="sn-perf-row">
                  <div className="sn-perf-meta">
                    <span>Эмулятор Cemu (ПК)</span>
                    <strong>24–30 FPS · Играбельно</strong>
                  </div>
                  <div className="sn-perf-track">
                    <div className="sn-perf-fill sn-fill-cyan" style={{ width: '88%' }} />
                  </div>
                </div>
                <div className="sn-perf-row">
                  <div className="sn-perf-meta">
                    <span>Реальная Wii U (меню и звук)</span>
                    <strong>Стабильно</strong>
                  </div>
                  <div className="sn-perf-track">
                    <div className="sn-perf-fill sn-fill-teal" style={{ width: '92%' }} />
                  </div>
                </div>
                <div className="sn-perf-row">
                  <div className="sn-perf-meta">
                    <span>Реальная Wii U (открытый океан 3D)</span>
                    <strong>~10 FPS · Оптимизация MEM2</strong>
                  </div>
                  <div className="sn-perf-track">
                    <div className="sn-perf-fill sn-fill-amber" style={{ width: '34%' }} />
                  </div>
                </div>
              </div>

              {game.notice && <div className="sn-notice">{game.notice}</div>}
            </div>

            <div className="sn-glass-panel">
              <span className="sn-eyebrow">СБОРКА И АДАПТЕР</span>
              <h2>Публикация и спецификации</h2>
              <DownloadButtons mirrors={game.mirrors} variant="subnautica" />
              <CopyPathPill value={game.installPath} dark />

              <dl className="sn-dl">
                {game.telemetry.map((t) => (
                  <div key={t.label}>
                    <dt>{t.label}</dt>
                    <dd>{t.value}</dd>
                  </div>
                ))}
                <div>
                  <dt>Пайплайн</dt>
                  <dd>{game.engineStack}</dd>
                </div>
              </dl>
              <p className="sn-credit">{story.developerCredit}</p>
            </div>
          </div>

          <div className="sn-faq-wrap">
            <h3>Вопросы по R&amp;D порту</h3>
            <FaqAccordion items={story.faq} dark />
          </div>
        </div>
      </section>

      <PortUpdatesStrip gameSlug="subnautica" theme="ocean" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. ANIMAL CROSSING: NEW HORIZONS — Sunny Island & NookPhone Aesthetic
   ═══════════════════════════════════════════════════════════════ */
function AnimalCrossingPage({ game }: { game: GamePort }) {
  const story = stories.acnh;

  return (
    <div className="game-world world-acnh">
      {/* Sunlit Tropical Island Hero */}
      <section
        className="ac-hero"
        style={{ backgroundImage: `url(${art('acnh', 'cover')})` }}
      >
        <div className="ac-hero-scrim" />
        <div className="container ac-hero-inner">
          <div className="game-top-bar">
            <a className="ac-back-pill" href="#games">
              <ArrowLeft size={16} />
              <span>Все порты Wii U</span>
            </a>
            <span className="ac-status-pill">{story.heroTag}</span>
          </div>

          <div className="ac-hero-grid">
            <div className="ac-hero-logo-col">
              <h1>
                <img
                  src={art('acnh', 'logo')}
                  alt="Animal Crossing: New Horizons"
                />
              </h1>
              <div className="ac-floating-cutouts" aria-hidden="true">
                <img
                  className="ac-cutout-bob ac-cutout-1"
                  src="./media/art/cutouts/acnh-tomnook.webp"
                  alt=""
                />
                <img
                  className="ac-cutout-bob ac-cutout-2"
                  src="./media/art/cutouts/acnh-nookphone.webp"
                  alt=""
                />
              </div>
            </div>

            <div className="ac-hero-card">
              <span className="ac-card-eyebrow">
                <Sparkles size={15} />
                <span>STATIC RECOMPILATION · SWITCH → WII U</span>
              </span>
              <h2>Остров New Horizons на Nintendo Wii U</h2>
              <p>{story.deck}</p>
              <div className="ac-hero-actions">
                <button
                  type="button"
                  className="ac-btn ac-btn-mint"
                  onClick={() =>
                    document
                      .getElementById('ac-media')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  <Images size={16} />
                  <span>Кадры живого порта</span>
                </button>
                <button
                  type="button"
                  className="ac-btn ac-btn-sand"
                  onClick={() =>
                    document
                      .getElementById('ac-status')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  <Cpu size={16} />
                  <span>Телеметрия Wave 9</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScallopDivider fill="#fffdf4" bg="#129982" />

      {/* TV + Off-TV Play Hardware Spotlight + Real Tech Solutions */}
      <section className="ac-dual-section" id="ac-dual">
        <div className="container">
          <div className="ac-section-center">
            <span className="ac-kicker">TV + OFF-TV GAMEPAD &amp; TOUCH</span>
            <h2>{story.dualTitle}</h2>
            <p>{story.dualLead}</p>
          </div>

          <figure className="hardware-showcase hardware-showcase-acnh">
            <img
              src={hardwareImage('acnh')}
              alt="Телевизор с площадью Animal Crossing: New Horizons и Wii U GamePad в режиме Off-TV Play с тачскрином"
            />
            <figcaption className="hardware-legend">
              <span>
                <Monitor size={15} /> {story.tvBadge}
              </span>
              <span>
                <Gamepad2 size={15} /> {story.gamepadBadge}
              </span>
            </figcaption>
          </figure>

          <div className="ac-pillars-grid">
            {story.pillars.map((p) => (
              <div key={p.title} className="ac-pillar-card">
                {p.image ? (
                  <img
                    className="ac-pillar-art"
                    src={p.image}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <span className="ac-pillar-icon" aria-hidden="true">
                    <Cpu size={28} />
                  </span>
                )}
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>

          <TechSolutionsBlock items={game.techSolutions} theme="acnh" />
        </div>
      </section>

      <ScallopDivider fill="#eefcf7" bg="#fffdf4" />

      {/* Live Port & Official Screenshots Stage */}
      <section className="ac-media-section" id="ac-media">
        <div className="container">
          <div className="ac-section-center">
            <span className="ac-kicker ac-kicker-mint">
              ЖИВЫЕ ПРОГОНЫ CEMU 2.6 И КАДРЫ ОСТРОВА
            </span>
            <h2>Реальный запуск порта acnh-wiiu и мир острова</h2>
          </div>

          <GameMediaStage game={game} shots={story.gallery} theme="acnh" />
        </div>
      </section>

      <ScallopDivider fill="#fffdf4" bg="#eefcf7" />

      {/* Active Development Telemetry & Build Status */}
      <section className="ac-status-section" id="ac-status">
        <div className="container">
          <div className="ac-status-grid">
            <div className="ac-panel">
              <span className="ac-kicker">ТЕСТИРОВАНИЕ WAVE 9</span>
              <h2>Текущая производительность (Cemu 2.6)</h2>
              <p className="ac-panel-lead">{game.summary}</p>

              <div className="ac-perf-bars">
                <div className="ac-perf-row">
                  <div className="ac-perf-meta">
                    <span>Загрузка острова (LLoadIsland)</span>
                    <strong>57–60 FPS · CPU 1–2.3 мс</strong>
                  </div>
                  <div className="ac-perf-track">
                    <div className="ac-perf-fill ac-fill-mint" style={{ width: '96%' }} />
                  </div>
                </div>
                <div className="ac-perf-row">
                  <div className="ac-perf-meta">
                    <span>Аэропорт (cDeparture · Wave 8)</span>
                    <strong>14.5–20.7 FPS · чистый рендер</strong>
                  </div>
                  <div className="ac-perf-track">
                    <div className="ac-perf-fill ac-fill-teal" style={{ width: '66%' }} />
                  </div>
                </div>
                <div className="ac-perf-row">
                  <div className="ac-perf-meta">
                    <span>3D-остров / площадь (2 400+ draws)</span>
                    <strong>10–14 FPS (пик 24.3) · оптимизация AcnhMain</strong>
                  </div>
                  <div className="ac-perf-track">
                    <div className="ac-perf-fill ac-fill-amber" style={{ width: '44%' }} />
                  </div>
                </div>
                <div className="ac-perf-row">
                  <div className="ac-perf-meta">
                    <span>Дифференциальные тесты Unicorn (ARM64 vs C)</span>
                    <strong>10 378 / 10 378 PASS (0 ULP)</strong>
                  </div>
                  <div className="ac-perf-track">
                    <div className="ac-perf-fill ac-fill-mint" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              {game.notice && (
                <p className="game-notice-box game-notice-acnh">{game.notice}</p>
              )}
            </div>

            <div className="ac-panel">
              <span className="ac-kicker">СБОРКА И ВЕРИФИКАЦИЯ</span>
              <h2>Статус релиза и спецификации</h2>
              <DownloadButtons mirrors={game.mirrors} variant="acnh" />
              <CopyPathPill value={game.installPath} label="Целевой путь WUP Installer" />

              <dl className="specs-dl ac-dl">
                {game.telemetry.map((t) => (
                  <div key={t.label}>
                    <dt>{t.label}</dt>
                    <dd>{t.value}</dd>
                  </div>
                ))}
                <div>
                  <dt>Движок / стек</dt>
                  <dd>{game.engineStack}</dd>
                </div>
              </dl>
              <p className="sr-credit">{story.developerCredit}</p>
            </div>
          </div>

          <div className="ac-faq-wrap">
            <h3>Вопросы по рекомпиляции Animal Crossing</h3>
            <FaqAccordion items={story.faq} />
          </div>
        </div>
      </section>

      <PortUpdatesStrip gameSlug="acnh" theme="light" />
    </div>
  );
}

export function GameDetailPage({ game }: { game: GamePort }) {
  if (game.slug === 'minecraft') return <MinecraftPage game={game} />;
  if (game.slug === 'buckshot') return <BuckshotPage game={game} />;
  if (game.slug === 'slime') return <SlimeRancherPage game={game} />;
  if (game.slug === 'acnh') return <AnimalCrossingPage game={game} />;
  return <SubnauticaPage game={game} />;
}
