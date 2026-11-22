import { useEffect, useState } from 'react';
import { Check, Copy, Download, ExternalLink, Github, HardDrive, Clock } from 'lucide-react';
import { MirrorLinks } from '../data/catalog';

interface DownloadButtonsProps {
  mirrors: MirrorLinks;
  variant?: 'default' | 'minecraft' | 'buckshot' | 'slime' | 'subnautica';
  compact?: boolean;
}

export function DownloadButtons({
  mirrors,
  variant = 'default',
  compact = false,
}: DownloadButtonsProps) {
  const [serverReady, setServerReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setServerReady(false);
    fetch(mirrors.serverPath, { method: 'HEAD', signal: controller.signal })
      .then((res) => {
        if (!controller.signal.aborted) {
          setServerReady(
            res.ok && !res.headers.get('content-type')?.includes('text/html')
          );
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [mirrors.serverPath]);

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

  const hasAnyDownload = serverReady || Boolean(mirrors.githubReleaseUrl);

  return (
    <div className={`dl-group ${compact ? 'dl-group-compact' : ''}`}>
      {serverReady && (
        <a
          className={primaryClass}
          href={mirrors.serverPath}
          download={mirrors.serverFileName}
        >
          <HardDrive size={17} />
          <span>Скачать с сервера</span>
          {!compact && <span className="btn-chip">{mirrors.sizeLabel}</span>}
        </a>
      )}

      {mirrors.githubReleaseUrl && (
        <a
          className={serverReady ? secondaryClass : primaryClass}
          href={mirrors.githubReleaseUrl}
          target="_blank"
          rel="noreferrer"
        >
          <Download size={17} />
          <span>{compact ? 'Скачать' : 'Скачать с GitHub'}</span>
          <span className="btn-chip">{mirrors.sizeLabel}</span>
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
              ? 'Страница релиза'
              : 'GitHub'}
          </span>
          {!compact && <ExternalLink size={14} className="opacity-65" />}
        </a>
      )}

      {!hasAnyDownload && (
        <div className={`dl-pending dl-pending-${variant}`}>
          <Clock size={16} />
          <span>
            Сборка готовится к загрузке ({mirrors.sizeLabel}). Ссылки на сервер и
            GitHub Releases появятся сразу после публикации.
          </span>
        </div>
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
