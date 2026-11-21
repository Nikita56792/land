import React, { useState } from 'react';
import { Download, ExternalLink, Github, HardDrive, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MirrorLinks } from '../data/catalog';

interface DownloadButtonsProps {
  mirrors: MirrorLinks;
  accentHex: string;
  compact?: boolean;
  onDonateClick?: () => void;
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({
  mirrors,
  accentHex,
  compact = false,
  onDonateClick,
}) => {
  const [serverStatus, setServerStatus] = useState<'idle' | 'checking' | 'unavailable'>('idle');

  const handleServerDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (serverStatus === 'checking') return;
    setServerStatus('checking');

    try {
      const response = await fetch(mirrors.serverPath, { method: 'HEAD' });
      const contentType = response.headers.get('content-type') || '';
      const isHtmlFallback = contentType.includes('text/html');

      if (response.ok && !isHtmlFallback) {
        setServerStatus('idle');
        const a = document.createElement('a');
        a.href = mirrors.serverPath;
        a.download = mirrors.serverFileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
      setServerStatus('unavailable');
    } catch {
      setServerStatus('unavailable');
    }
  };

  return (
    <div className="space-y-3">
      <div className={`flex flex-wrap items-center gap-2.5 ${compact ? '' : 'pt-1'}`}>
        {/* Primary: Local Server Copy */}
        <a
          href={mirrors.serverPath}
          download={mirrors.serverFileName}
          onClick={handleServerDownload}
          style={{
            borderColor: `${accentHex}55`,
            backgroundColor: `${accentHex}16`,
          }}
          className="group inline-flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-125 active:scale-[0.99]"
        >
          <HardDrive className="h-4 w-4 shrink-0" style={{ color: accentHex }} />
          <span>{serverStatus === 'checking' ? 'Проверка сервера…' : 'Скачать с сервера'}</span>
          <span className="font-mono-tech text-[11px] text-white/60">{mirrors.sizeLabel}</span>
        </a>

        {/* Secondary: GitHub Release */}
        {mirrors.githubReleaseUrl ? (
          <a
            href={mirrors.githubReleaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-[#E5E7EB] transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
          >
            <Download className="h-4 w-4 text-white/70" />
            <span>GitHub Release</span>
            {mirrors.githubReleaseTag && (
              <span className="font-mono-tech text-[11px] text-white/45">{mirrors.githubReleaseTag}</span>
            )}
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5 text-sm text-white/40 cursor-not-allowed">
            <Download className="h-4 w-4 opacity-50" />
            <span>GitHub Release · скоро</span>
          </span>
        )}

        {/* Tertiary: GitHub Repo */}
        {mirrors.githubRepoUrl && (
          <a
            href={mirrors.githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3.5 py-2.5 text-sm text-[#9CA3AF] transition-colors hover:border-white/25 hover:text-white"
          >
            <Github className="h-4 w-4" />
            <span>Исходный код</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </a>
        )}

        {onDonateClick && (
          <button
            type="button"
            onClick={onDonateClick}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-mono-tech uppercase tracking-wider text-white/65 transition-colors hover:border-white/25 hover:text-white"
          >
            <span>Поддержать</span>
          </button>
        )}
      </div>

      {serverStatus === 'unavailable' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3.5 py-2.5 text-xs text-amber-100/90">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span>
              Сейчас сайт работает на статическом зеркале (GitHub Pages) — локальный том{' '}
              <code className="font-mono-tech text-amber-200">/downloads/{mirrors.serverFileName}</code> активен в Docker-развёртывании на основном сервере.
            </span>
          </div>
          {mirrors.githubReleaseUrl ? (
            <a
              href={mirrors.githubReleaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded bg-amber-400/20 px-2.5 py-1 font-medium text-amber-200 transition hover:bg-amber-400/30"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Скачать через GitHub Release</span>
            </a>
          ) : (
            <span className="font-mono-tech text-[11px] text-amber-200/70">Сборка готовится к публикации</span>
          )}
        </div>
      )}
    </div>
  );
};
