import { useEffect, useRef, useState } from 'react';
import {
  Clock,
  Download,
  ExternalLink,
  Github,
  HardDrive,
  History,
  Info,
  Package,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react';
import { MacApp, PlatformPackage } from '../data/catalog';
import { useSmartMirror } from '../lib/mirrors';
import { MirrorSelectorBar } from './DownloadButtons';
import { AppSquircle } from './HomePage';

/* ── Minimalist OS Brand Glyphs ─────────────────────────────────────────── */
function WindowsGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2.5" width="9" height="9" rx="1.6" fill="#0ea5e9" />
      <rect x="13" y="2.5" width="9" height="9" rx="1.6" fill="#38bdf8" />
      <rect x="2" y="13.5" width="9" height="9" rx="1.6" fill="#0284c7" />
      <rect x="13" y="13.5" width="9" height="9" rx="1.6" fill="#0ea5e9" />
    </svg>
  );
}

function LinuxGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="20" height="18" rx="4.5" fill="#18181b" />
      <path d="M7 9.5L10.5 12.5L7 15.5" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 15.5H17" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function MacGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#macFaceGrad)" />
      <path d="M12 2V22" stroke="#1d4ed8" strokeOpacity="0.22" strokeWidth="1.2" />
      <circle cx="8.6" cy="10" r="1.2" fill="#0f172a" />
      <circle cx="15.4" cy="10" r="1.2" fill="#0f172a" />
      <path d="M8.5 14.5C9.7 16 14.3 16 15.5 14.5" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
      <defs>
        <linearGradient id="macFaceGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Minimalist Hardware Monitor / MacBook Vector Peeks (RPCS3 Style) ──── */
function MinimalMonitor({
  variant,
}: {
  variant: 'windows' | 'linux' | 'macos' | 'history';
}) {
  const id = `mon-${variant}`;
  return (
    <div className={`min-monitor min-monitor-${variant}`} aria-hidden="true">
      {variant === 'macos' ? (
        <svg viewBox="0 0 210 132" fill="none">
          {/* Sleek minimalist MacBook silhouette */}
          <rect x="16" y="8" width="178" height="108" rx="9" fill="#181b26" />
          <rect x="22" y="14" width="166" height="96" rx="4.5" fill={`url(#${id})`} />
          <rect x="92" y="14" width="26" height="5" rx="2.5" fill="#181b26" />
          <path d="M22 108C55 72 102 68 188 30V110H22V108Z" fill="#ffffff" fillOpacity="0.16" />
          <path d="M22 62C74 44 134 94 188 74V110H22V62Z" fill="#f97316" fillOpacity="0.32" />
          <rect x="4" y="116" width="202" height="8" rx="4" fill="#cbd5e1" />
          <rect x="86" y="116" width="38" height="3" rx="1.5" fill="#94a3b8" />
          <defs>
            <linearGradient id={id} x1="22" y1="14" x2="188" y2="110" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="0.52" stopColor="#6366f1" />
              <stop offset="1" stopColor="#fb923c" />
            </linearGradient>
          </defs>
        </svg>
      ) : (
        <svg viewBox="0 0 210 132" fill="none">
          {/* Sleek minimalist frameless desktop OLED monitor */}
          <rect x="12" y="6" width="186" height="106" rx="8" fill="#181b26" />
          <rect x="18" y="12" width="174" height="94" rx="4" fill={`url(#${id})`} />
          {variant === 'windows' && (
            <>
              <ellipse cx="122" cy="58" rx="46" ry="30" fill="#60a5fa" fillOpacity="0.55" />
              <ellipse cx="96" cy="64" rx="34" ry="22" fill="#93c5fd" fillOpacity="0.5" />
              <path d="M62 82C86 42 132 36 164 62C142 90 92 98 62 82Z" fill="#1d4ed8" fillOpacity="0.48" />
            </>
          )}
          {variant === 'linux' && (
            <>
              <circle cx="144" cy="40" r="38" fill="#f97316" fillOpacity="0.48" />
              <path d="M18 82C66 56 124 94 192 52V106H18V82Z" fill="#7e22ce" fillOpacity="0.45" />
            </>
          )}
          {variant === 'history' && (
            <>
              <circle cx="105" cy="59" r="24" stroke="#ffffff" strokeOpacity="0.88" strokeWidth="4" strokeDasharray="116 32" />
              <path d="M84 44L81 55L92 53" stroke="#ffffff" strokeOpacity="0.92" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M105 46V59L114 65" stroke="#ffffff" strokeOpacity="0.92" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
          {/* Subtle glass sheen */}
          <path d="M18 12H112L52 106H18V12Z" fill="#ffffff" fillOpacity="0.09" />
          {/* Minimalist stand */}
          <rect x="92" y="112" width="26" height="12" fill="#272b3a" />
          <rect x="66" y="122" width="78" height="6" rx="3" fill="#1e2230" />
          <defs>
            {variant === 'windows' && (
              <linearGradient id={id} x1="18" y1="12" x2="192" y2="106" gradientUnits="userSpaceOnUse">
                <stop stopColor="#dbeafe" />
                <stop offset="0.55" stopColor="#60a5fa" />
                <stop offset="1" stopColor="#1e40af" />
              </linearGradient>
            )}
            {variant === 'linux' && (
              <linearGradient id={id} x1="18" y1="12" x2="192" y2="106" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ec4899" />
                <stop offset="0.52" stopColor="#9333ea" />
                <stop offset="1" stopColor="#f97316" />
              </linearGradient>
            )}
            {variant === 'history' && (
              <linearGradient id={id} x1="18" y1="12" x2="192" y2="106" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#1d4ed8" />
              </linearGradient>
            )}
          </defs>
        </svg>
      )}
    </div>
  );
}

/* ── Sleek "Coming Soon" Popup Modal ───────────────────────────────────── */
function ComingSoonModal({
  info,
  repoUrl,
  onClose,
}: {
  info: { appName: string; osLabel: string; archLabel: string };
  repoUrl: string | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      className="support-modal soon-modal"
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="soon-modal-title"
    >
      <div className="support-modal-inner">
        <div className="support-modal-head">
          <span className="soon-badge">
            <Clock size={15} />
            <span>Скоро добавим</span>
          </span>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Закрыть окно"
          >
            <X size={18} />
          </button>
        </div>

        <h2 id="soon-modal-title">
          {info.appName} для {info.osLabel} ({info.archLabel})
        </h2>
        <p className="support-modal-lead">
          Сборка под <strong>{info.osLabel} ({info.archLabel})</strong> пока не
          опубликована — скоро добавим её на зеркала Parhelio. Сейчас уже
          доступна актуальная версия для macOS (Apple Silicon).
        </p>

        <div className="soon-modal-actions">
          <button
            type="button"
            className="btn-tactile btn-tactile-blue"
            onClick={onClose}
          >
            Понятно
          </button>
          {repoUrl && (
            <a
              className="btn-tactile btn-tactile-light"
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={16} />
              <span>Исходный код на GitHub</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </dialog>
  );
}

/* ── Single OS Package Button (Real Download or "Soon" Popup) ───────────── */
function OsDownloadPill({
  pkg,
  tone,
  onSoon,
}: {
  pkg: PlatformPackage;
  tone: 'blue' | 'purple' | 'emerald';
  onSoon: () => void;
}) {
  const cls = `os-dl-pill os-dl-${tone} ${!pkg.url ? 'is-soon' : ''}`;
  const content = (
    <>
      <span className="os-dl-chip">{pkg.arch}</span>
      <span className="os-dl-text">
        <strong>{pkg.label}</strong>
        <small>{pkg.sizeLabel}</small>
      </span>
    </>
  );

  if (pkg.url) {
    return (
      <a
        href={pkg.url}
        target={pkg.url.startsWith('http') ? '_blank' : undefined}
        rel={pkg.url.startsWith('http') ? 'noreferrer' : undefined}
        download={pkg.fileName}
        className={cls}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={cls} onClick={onSoon}>
      {content}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RPCS3-STYLE MULTI-OS DOWNLOADS SECTION FOR EACH APP
   ═══════════════════════════════════════════════════════════════════════════ */
export function AppDownloadsSection({ app }: { app: MacApp }) {
  const { getReleaseUrl } = useSmartMirror();
  const [soonInfo, setSoonInfo] = useState<{
    appName: string;
    osLabel: string;
    archLabel: string;
  } | null>(null);

  const commitsUrl = app.mirrors.githubRepoUrl
    ? `${app.mirrors.githubRepoUrl}/commits`
    : null;

  const os = app.platforms;
  const cloudUrl = app.mirrors.cloudFileName
    ? getReleaseUrl(app.mirrors.cloudFileName)
    : null;
  const macArmUrl = os?.macosArm64?.url ?? cloudUrl;
  const macArmSize = os?.macosArm64?.sizeLabel ?? app.mirrors.sizeLabel;

  const macPackages: PlatformPackage[] = [
    {
      arch: 'arm',
      label: 'Скачать для arm64',
      sizeLabel: macArmSize,
      url: macArmUrl,
      fileName: app.mirrors.cloudFileName || app.mirrors.serverFileName,
    },
    os?.macosX64 ?? {
      arch: 'x64',
      label: 'Скачать для x64',
      sizeLabel: 'Скоро',
      url: null,
    },
  ];

  const winPackages: PlatformPackage[] = [
    os?.windowsX64 ?? {
      arch: 'x64',
      label: 'Скачать для x64',
      sizeLabel: 'Скоро',
      url: null,
    },
    os?.windowsArm64 ?? {
      arch: 'arm',
      label: 'Скачать для arm64',
      sizeLabel: 'Скоро',
      url: null,
    },
  ];

  const linuxPackages: PlatformPackage[] = [
    os?.linuxX64 ?? {
      arch: 'x64',
      label: 'Скачать для x64',
      sizeLabel: 'Скоро',
      url: null,
    },
    os?.linuxArm64 ?? {
      arch: 'arm',
      label: 'Скачать для arm64',
      sizeLabel: 'Скоро',
      url: null,
    },
  ];

  const hasWin = winPackages.some((p) => Boolean(p.url));
  const hasLinux = linuxPackages.some((p) => Boolean(p.url));

  return (
    <section className="rpcs-downloads-section" id="app-downloads">
      <div className="container">
        <div className="rpcs-dl-section-title">
          <span className="rpcs-dl-bar" aria-hidden="true" />
          <h2>Актуальные сборки</h2>
        </div>

        {/* Top Latest Build Summary Banner (RPCS3 Latest Builds Banner!) */}
        <div className="latest-build-banner">
          <div className="latest-build-left">
            <AppSquircle app={app} />
            <div className="latest-build-info">
              <div className="latest-build-head">
                <h3>
                  {app.name} {app.version}
                </h3>
                <span className="latest-build-sub">
                  {app.releaseDate
                    ? `Сборка опубликована ${app.releaseDate}`
                    : `Актуальный релиз · ${app.platform}`}
                </span>
              </div>
              <div className="latest-build-tags">
                <span className="meta-pill-purple">
                  <Tag size={13} />
                  <span>Тег</span>
                  <b>{app.mirrors.releaseTag || app.version}</b>
                </span>
                <span className="meta-pill-orange">
                  <Package size={13} />
                  <span>Пакет</span>
                  <b>{app.mirrors.sizeLabel}</b>
                </span>
                <span className="meta-pill-emerald">
                  <ShieldCheck size={13} />
                  <span>Лицензия</span>
                  <b>{app.license}</b>
                </span>
              </div>
            </div>
          </div>

          <div className="latest-build-right">
            {cloudUrl && (
              <a
                className="btn-tactile btn-tactile-blue"
                href={cloudUrl}
                download={app.mirrors.cloudFileName || app.mirrors.serverFileName}
              >
                <Download size={16} />
                <span>Скачать ({app.version})</span>
              </a>
            )}
            {app.mirrors.githubRepoUrl && (
              <a
                className="btn-tactile btn-tactile-light"
                href={app.mirrors.githubRepoUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Github size={16} />
                <span>Исходный код</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        <div className="app-mirror-strip">
          <MirrorSelectorBar />
        </div>

        {/* 3-Column OS Cards: Windows · Linux · macOS (RPCS3 style!) */}
        <div className="os-cards-grid">
          {/* macOS */}
          <div className="os-card">
            <div className="os-card-top">
              <MacGlyph />
              <div className="os-card-heading">
                <h3>macOS</h3>
                <span className="os-badge os-badge-ready">Рекомендуется</span>
              </div>
            </div>
            <p className="os-card-desc">
              Нативная сборка под Apple Silicon (M1–M4) на {app.platform.split('·')[0].trim()}.
            </p>
            <span className="os-pkg-label">Пакеты для загрузки</span>
            <div className="os-card-bottom">
              <div className="os-card-pills">
                <OsDownloadPill
                  pkg={macPackages[0]}
                  tone="blue"
                  onSoon={() =>
                    setSoonInfo({
                      appName: app.name,
                      osLabel: 'macOS',
                      archLabel: 'arm64',
                    })
                  }
                />
                <OsDownloadPill
                  pkg={macPackages[1]}
                  tone="purple"
                  onSoon={() =>
                    setSoonInfo({
                      appName: app.name,
                      osLabel: 'macOS',
                      archLabel: 'Intel x64',
                    })
                  }
                />
              </div>
              <MinimalMonitor variant="macos" />
            </div>
          </div>

          {/* Windows */}
          <div className="os-card">
            <div className="os-card-top">
              <WindowsGlyph />
              <div className="os-card-heading">
                <h3>Windows</h3>
                <span className={`os-badge ${hasWin ? 'os-badge-ready' : 'os-badge-soon'}`}>
                  {hasWin ? 'Доступно' : 'Скоро'}
                </span>
              </div>
            </div>
            <p className="os-card-desc">
              Для ноутбуков и настольных ПК с поддержкой Windows 10 и Windows 11.
            </p>
            <span className="os-pkg-label">Пакеты для загрузки</span>
            <div className="os-card-bottom">
              <div className="os-card-pills">
                <OsDownloadPill
                  pkg={winPackages[0]}
                  tone="blue"
                  onSoon={() =>
                    setSoonInfo({
                      appName: app.name,
                      osLabel: 'Windows',
                      archLabel: 'x64',
                    })
                  }
                />
                <OsDownloadPill
                  pkg={winPackages[1]}
                  tone="purple"
                  onSoon={() =>
                    setSoonInfo({
                      appName: app.name,
                      osLabel: 'Windows',
                      archLabel: 'arm64',
                    })
                  }
                />
              </div>
              <MinimalMonitor variant="windows" />
            </div>
          </div>

          {/* Linux */}
          <div className="os-card">
            <div className="os-card-top">
              <LinuxGlyph />
              <div className="os-card-heading">
                <h3>Linux</h3>
                <span className={`os-badge ${hasLinux ? 'os-badge-ready' : 'os-badge-soon'}`}>
                  {hasLinux ? 'Доступно' : 'Скоро'}
                </span>
              </div>
            </div>
            <p className="os-card-desc">
              Для современных дистрибутивов Linux на архитектурах x86_64 и ARM64.
            </p>
            <span className="os-pkg-label">Пакеты для загрузки</span>
            <div className="os-card-bottom">
              <div className="os-card-pills">
                <OsDownloadPill
                  pkg={linuxPackages[0]}
                  tone="blue"
                  onSoon={() =>
                    setSoonInfo({
                      appName: app.name,
                      osLabel: 'Linux',
                      archLabel: 'x64',
                    })
                  }
                />
                <OsDownloadPill
                  pkg={linuxPackages[1]}
                  tone="purple"
                  onSoon={() =>
                    setSoonInfo({
                      appName: app.name,
                      osLabel: 'Linux',
                      archLabel: 'arm64',
                    })
                  }
                />
              </div>
              <MinimalMonitor variant="linux" />
            </div>
          </div>
        </div>

        {/* Source Code & Build History Wide Card */}
        <div className="prev-builds-card">
          <div className="prev-builds-body">
            <div className="prev-builds-head">
              <span className="prev-builds-icon">
                <History size={22} />
              </span>
              <h3>Исходный код и история изменений</h3>
            </div>
            <p>
              Все установочные образы раздаются напрямую с облачных зеркал
              Parhelio (РФ / Мир). Исходные тексты, архитектуру и историю
              разработки можно изучить в{' '}
              {commitsUrl ? (
                <a href={commitsUrl} target="_blank" rel="noreferrer">
                  журнале коммитов на GitHub
                </a>
              ) : (
                'журнале коммитов на GitHub'
              )}
              .
            </p>
            <div className="prev-builds-actions">
              {app.mirrors.githubRepoUrl ? (
                <a
                  href={app.mirrors.githubRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="os-dl-pill os-dl-blue prev-builds-btn"
                >
                  <span className="os-dl-chip">
                    <Github size={14} />
                  </span>
                  <span className="os-dl-text">
                    <strong>Репозиторий кода</strong>
                    <small>GitHub · Open Source</small>
                  </span>
                </a>
              ) : (
                <button
                  type="button"
                  className="os-dl-pill os-dl-blue prev-builds-btn is-soon"
                  onClick={() =>
                    setSoonInfo({
                      appName: app.name,
                      osLabel: 'исходного кода',
                      archLabel: 'GitHub',
                    })
                  }
                >
                  <span className="os-dl-chip">
                    <Info size={14} />
                  </span>
                  <span className="os-dl-text">
                    <strong>Исходный код</strong>
                    <small>Скоро</small>
                  </span>
                </button>
              )}

              {cloudUrl && (
                <a
                  href={cloudUrl}
                  download={app.mirrors.cloudFileName || app.mirrors.serverFileName}
                  className="btn-tactile btn-tactile-light"
                >
                  <HardDrive size={16} />
                  <span>Скачать с Parhelio ({app.version})</span>
                </a>
              )}
            </div>
          </div>

          <MinimalMonitor variant="history" />
        </div>
      </div>

      {soonInfo && (
        <ComingSoonModal
          info={soonInfo}
          repoUrl={app.mirrors.githubRepoUrl}
          onClose={() => setSoonInfo(null)}
        />
      )}
    </section>
  );
}
