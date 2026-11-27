import { useState } from 'react';
import {
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Github,
  Globe,
  HardDrive,
  Package,
} from 'lucide-react';
import { MirrorLinks } from '../data/catalog';
import {
  MIRROR_LABELS,
  MirrorPreference,
  useSmartMirror,
} from '../lib/mirrors';

interface DownloadButtonsProps {
  mirrors: MirrorLinks;
  variant?: 'default' | 'minecraft' | 'buckshot' | 'slime' | 'subnautica';
  compact?: boolean;
}

export function MirrorSelectorBar({ dark = false }: { dark?: boolean }) {
  const { preference, setPreference, activeMirror, probe } = useSmartMirror();

  const latencyText =
    activeMirror === 'ru' && probe.ruMs !== null
      ? `${probe.ruMs} мс`
      : activeMirror === 'global' && probe.globalMs !== null
        ? `${probe.globalMs} мс`
        : null;

  const opts: { id: MirrorPreference; label: string }[] = [
    { id: 'auto', label: 'Авто' },
    { id: 'ru', label: 'РФ' },
    { id: 'global', label: 'Мир' },
  ];

  return (
    <div className={`mirror-bar ${dark ? 'mirror-bar-dark' : ''}`}>
      <span className="mirror-bar-status">
        <Globe size={14} />
        <span>
          Зеркало: <strong>{MIRROR_LABELS[activeMirror]}</strong>
          {latencyText ? ` · ${latencyText}` : ''}
        </span>
      </span>
      <div className="mirror-bar-pills" role="group" aria-label="Выбор зеркала скачивания">
        {opts.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={preference === opt.id ? 'is-active' : ''}
            onClick={() => setPreference(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DownloadButtons({
  mirrors,
  variant = 'default',
  compact = false,
}: DownloadButtonsProps) {
  const { getReleaseUrl } = useSmartMirror();

  const primaryClass =
    variant === 'minecraft'
      ? 'mc-btn mc-btn-green'
      : variant === 'buckshot'
        ? 'br-btn br-btn-primary'
        : variant === 'slime'
          ? 'sr-btn sr-btn-pink'
          : variant === 'subnautica'
            ? 'sn-btn sn-btn-cyan'
            : 'btn-tactile btn-tactile-blue';

  const secondaryClass =
    variant === 'minecraft'
      ? 'mc-btn mc-btn-dark'
      : variant === 'buckshot'
        ? 'br-btn'
        : variant === 'slime'
          ? 'sr-btn sr-btn-white'
          : variant === 'subnautica'
            ? 'sn-btn sn-btn-ghost'
            : 'btn-tactile btn-tactile-light';

  const isDarkTheme = variant === 'buckshot' || variant === 'subnautica';
  const packages = mirrors.packages ?? [];
  const hasPackages = packages.length > 0;
  const hasAnyDownload =
    hasPackages || Boolean(mirrors.cloudFileName) || Boolean(mirrors.githubReleaseUrl);

  return (
    <div className="dl-stack">
      <div className={`dl-group ${compact ? 'dl-group-compact' : ''}`}>
        {hasPackages
          ? packages.map((pkg, idx) => (
              <a
                key={pkg.id}
                className={pkg.primary ?? idx === 0 ? primaryClass : secondaryClass}
                href={getReleaseUrl(pkg.fileName)}
                download={pkg.fileName}
              >
                {idx === 0 ? <Download size={17} /> : <Package size={17} />}
                <span>{pkg.formatLabel}</span>
                {!compact && <span className="btn-chip">{pkg.sizeLabel}</span>}
              </a>
            ))
          : mirrors.cloudFileName && (
              <a
                className={primaryClass}
                href={getReleaseUrl(mirrors.cloudFileName)}
                download={mirrors.cloudFileName}
              >
                <HardDrive size={17} />
                <span>Скачать с Parhelio</span>
                {!compact && <span className="btn-chip">{mirrors.sizeLabel}</span>}
              </a>
            )}

        {mirrors.githubReleaseUrl && (
          <a
            className={hasPackages || mirrors.cloudFileName ? secondaryClass : primaryClass}
            href={mirrors.githubReleaseUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Download size={17} />
            <span>{compact ? 'GitHub' : 'Зеркало GitHub'}</span>
            {!hasPackages && !mirrors.cloudFileName && (
              <span className="btn-chip">{mirrors.sizeLabel}</span>
            )}
          </a>
        )}

        {mirrors.githubRepoUrl && (
          <a
            className={secondaryClass}
            href={mirrors.githubRepoUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Github size={17} />
            <span>
              {mirrors.githubRepoUrl.includes('/releases/')
                ? 'Релиз GitHub'
                : 'GitHub'}
            </span>
            {!compact && <ExternalLink size={14} className="opacity-65" />}
          </a>
        )}

        {!hasAnyDownload && (
          <div className={`dl-pending dl-pending-${variant}`}>
            <Clock size={16} />
            <span>
              Сборка в активной разработке ({mirrors.sizeLabel}). Ссылки на
              облачные зеркала Parhelio появятся сразу после публикации.
            </span>
          </div>
        )}
      </div>

      {hasAnyDownload && !compact && (
        <MirrorSelectorBar dark={isDarkTheme} />
      )}
    </div>
  );
}

export function CopyPathPill({
  value,
  label = 'Путь на SD-карте',
  dark = false,
}: {
  value: string;
  label?: string;
  dark?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore clipboard fallback */
    }
  };

  return (
    <div className={`path-pill ${dark ? 'path-pill-dark' : ''}`}>
      <div className="path-pill-meta">
        <span>{label}</span>
        <code>{value}</code>
      </div>
      <button
        type="button"
        className="path-copy-btn"
        onClick={handleCopy}
        aria-label={copied ? 'Скопировано' : 'Скопировать путь'}
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
        <span>{copied ? 'Скопировано' : 'Копировать'}</span>
      </button>
    </div>
  );
}
