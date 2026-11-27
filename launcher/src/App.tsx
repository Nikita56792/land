import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { openUrl } from '@tauri-apps/plugin-opener';
import {
  AlertTriangle,
  ArrowDownToLine,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Folder,
  FolderOpen,
  Gamepad2,
  Gauge,
  Globe,
  HardDrive,
  Heart,
  Layers,
  Loader2,
  Moon,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Unplug,
  X,
  Zap,
} from 'lucide-react';
import {
  FALLBACK_CATALOG,
  isTauriRuntime,
  type Catalog,
  type DriveInfo,
  type GameEntry,
  type GamePackage,
  type InstallProgress,
  type InstallRequest,
  type InstallResult,
  type MirrorPreference,
  type MirrorStatus,
  type PackageFormat,
  type QueueItem,
  type TargetMode,
  type ThemeMode,
} from './types';

type CatalogFilter = 'all' | 'ready' | 'wip';

interface ToastMessage {
  id: number;
  tone: 'info' | 'success' | 'warning' | 'error';
  text: string;
}

const APP_VERSION = '1.0.0';
const YOOMONEY_URL = 'https://yoomoney.ru/to/4100119696403242';
const BOOSTY_URL = 'https://boosty.to/parhelios/donate';

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 Б';
  const units = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  const digits = value >= 100 || idx === 0 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[idx]}`;
}

function formatSpeed(bytesPerSec: number): string {
  if (!Number.isFinite(bytesPerSec) || bytesPerSec <= 0) return '0.0 МБ/с';
  const mbps = bytesPerSec / (1024 * 1024);
  if (mbps >= 100) return `${mbps.toFixed(0)} МБ/с`;
  if (mbps >= 1) return `${mbps.toFixed(1)} МБ/с`;
  const kbps = bytesPerSec / 1024;
  return `${kbps.toFixed(0)} КБ/с`;
}

function formatEta(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) return '—';
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}ч ${String(remMins).padStart(2, '0')}м`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function joinDisplayPath(base: string, suffix: string): string {
  const cleanBase = base.replace(/[\\/]+$/, '');
  const sep = cleanBase.includes('\\') && !cleanBase.includes('/') ? '\\' : '/';
  const normalizedSuffix = suffix.replace(/\//g, sep).replace(/^[\\/]+/, '');
  return `${cleanBase}${sep}${normalizedSuffix}`;
}

function phaseLabel(progress: InstallProgress): string {
  switch (progress.phase) {
    case 'connecting':
      return 'Подключение к зеркалу…';
    case 'downloading':
      return progress.activeStreams > 1
        ? `Загрузка · ${progress.activeStreams} потоков`
        : 'Загрузка файла';
    case 'extracting':
      return 'Распаковка WUP на SD';
    case 'copying':
      return 'Копирование .wuhb на SD';
    case 'verifying':
      return 'Проверка целостности';
    case 'done':
      return 'Готово!';
    case 'cancelled':
      return 'Отменено';
    case 'error':
      return 'Ошибка установки';
    default:
      return progress.message || 'Обработка…';
  }
}

function progressPercent(progress: InstallProgress): number {
  if (progress.phase === 'done') return 100;
  if (progress.phase === 'extracting' && progress.extractTotal > 0) {
    return Math.min(100, Math.round((progress.extractCurrent / progress.extractTotal) * 100));
  }
  if (progress.totalBytes > 0) {
    return Math.min(100, Math.round((progress.downloadedBytes / progress.totalBytes) * 100));
  }
  return 0;
}

function getInitialTheme(): ThemeMode {
  try {
    const saved = window.localStorage.getItem('parhelio-launcher-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore storage errors
  }
  return 'light';
}

export default function App() {
  const inTauri = useMemo(() => isTauriRuntime(), []);

  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [catalog, setCatalog] = useState<Catalog>(FALLBACK_CATALOG);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(true);
  const [mirrors, setMirrors] = useState<MirrorStatus[]>([]);
  const [probingMirrors, setProbingMirrors] = useState<boolean>(false);
  const [mirrorPreference, setMirrorPreference] = useState<MirrorPreference>('auto');

  const [drives, setDrives] = useState<DriveInfo[]>([]);
  const [loadingDrives, setLoadingDrives] = useState<boolean>(false);
  const [targetMode, setTargetMode] = useState<TargetMode>('sd_auto');
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');
  const [customAppsPath, setCustomAppsPath] = useState<string>('');
  const [customInstallPath, setCustomInstallPath] = useState<string>('');

  const [filter, setFilter] = useState<CatalogFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFormatByGame, setSelectedFormatByGame] = useState<Record<string, PackageFormat>>({});
  const [failedCovers, setFailedCovers] = useState<Record<string, boolean>>({});
  const [copiedTitleId, setCopiedTitleId] = useState<string | null>(null);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [installedPkgIds, setInstalledPkgIds] = useState<Record<string, string>>({});

  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [activeProgress, setActiveProgress] = useState<InstallProgress | null>(null);
  const [lastCompletedPath, setLastCompletedPath] = useState<string | null>(null);
  const [lastRunSummary, setLastRunSummary] = useState<{
    tone: 'done' | 'cancelled' | 'error';
    text: string;
  } | null>(null);

  const [ejectingDrive, setEjectingDrive] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const cancelRequestedRef = useRef<boolean>(false);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((text: string, tone: ToastMessage['tone'] = 'info') => {
    const id = Date.now();
    setToast({ id, tone, text });
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast((prev) => (prev && prev.id === id ? null : prev));
    }, 4200);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem('parhelio-launcher-theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Helper to get active package for a game
  const getSelectedPackage = useCallback(
    (game: GameEntry): GamePackage | null => {
      if (game.packages.length === 0) return null;
      const chosenFmt = selectedFormatByGame[game.id];
      if (chosenFmt) {
        const match = game.packages.find((p) => p.format === chosenFmt);
        if (match) return match;
      }
      return game.packages[0];
    },
    [selectedFormatByGame]
  );

  // Load catalog
  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      if (inTauri) {
        const data = await invoke<Catalog>('get_catalog');
        if (data && Array.isArray(data.games) && data.games.length > 0) {
          setCatalog(data);
        }
      } else {
        try {
          const resp = await fetch('/launcher-catalog.json');
          if (resp.ok) {
            const data = (await resp.json()) as Catalog;
            if (data && Array.isArray(data.games) && data.games.length > 0) {
              setCatalog(data);
            }
          }
        } catch {
          setCatalog(FALLBACK_CATALOG);
        }
      }
    } catch (err) {
      console.error('Failed to load catalog:', err);
      setCatalog(FALLBACK_CATALOG);
    } finally {
      setCatalogLoading(false);
    }
  }, [inTauri]);

  // Probe mirrors
  const refreshMirrors = useCallback(async () => {
    setProbingMirrors(true);
    try {
      if (inTauri) {
        const results = await invoke<MirrorStatus[]>('probe_mirrors');
        setMirrors(results);
      } else {
        // Browser preview: show honest catalog mirror list without faking benchmarks
        setMirrors(
          catalog.mirrors.map((m, idx) => ({
            id: m.id,
            name: m.name,
            region: m.region,
            baseUrl: m.baseUrl,
            reachable: true,
            latencyMs: null,
            speedMbps: null,
            recommended: idx === 0,
          }))
        );
      }
    } catch (err) {
      console.error('Mirror probe failed:', err);
      showToast('Не удалось проверить скорость зеркал', 'warning');
    } finally {
      setProbingMirrors(false);
    }
  }, [inTauri, catalog.mirrors, showToast]);

  // Refresh drives
  const refreshDrives = useCallback(
    async (silent = false) => {
      setLoadingDrives(true);
      try {
        if (inTauri) {
          const list = await invoke<DriveInfo[]>('list_drives');
          setDrives(list);
          setSelectedDriveId((prev) => {
            if (prev && list.some((d) => d.id === prev)) return prev;
            const likely = list.find((d) => d.isLikelyWiiuSd);
            if (likely) return likely.id;
            const removable = list.find((d) => d.isRemovable);
            if (removable) return removable.id;
            return list[0]?.id ?? '';
          });
        } else {
          setDrives([]);
        }
      } catch (err) {
        console.error('list_drives failed:', err);
        if (!silent) {
          showToast('Не удалось получить список дисков', 'warning');
        }
      } finally {
        setLoadingDrives(false);
      }
    },
    [inTauri, showToast]
  );

  // Boot effects
  useEffect(() => {
    void loadCatalog();
    void refreshDrives(true);
  }, [loadCatalog, refreshDrives]);

  useEffect(() => {
    void refreshMirrors();
  }, [refreshMirrors]);

  // Listen to Tauri live install-progress events
  useEffect(() => {
    if (!inTauri) return;
    let unlisten: UnlistenFn | null = null;
    let active = true;

    listen<InstallProgress>('install-progress', (event) => {
      if (!active) return;
      const payload = event.payload;
      setActiveProgress(payload);
      if (payload.destinationPath && payload.phase === 'done') {
        setLastCompletedPath(payload.destinationPath);
      }
    })
      .then((fn) => {
        if (active) {
          unlisten = fn;
        } else {
          fn();
        }
      })
      .catch((err) => {
        console.error('Failed to attach install-progress listener:', err);
      });

    return () => {
      active = false;
      if (unlisten) unlisten();
    };
  }, [inTauri]);

  // Derived selections
  const selectedDrive = useMemo(
    () => drives.find((d) => d.id === selectedDriveId) ?? null,
    [drives, selectedDriveId]
  );

  const resolvedTargetPath = useMemo(() => {
    if (targetMode === 'sd_auto') return selectedDrive?.mountPath ?? '';
    if (targetMode === 'custom_apps') return customAppsPath;
    return customInstallPath;
  }, [targetMode, selectedDrive, customAppsPath, customInstallPath]);

  const hasTarget = resolvedTargetPath.trim().length > 0;

  const pendingQueueItems = useMemo(
    () => queue.filter((item) => item.state === 'queued' || item.state === 'installing'),
    [queue]
  );

  const totalQueueBytes = useMemo(
    () => pendingQueueItems.reduce((sum, item) => sum + item.pkg.sizeBytes, 0),
    [pendingQueueItems]
  );

  const hasWupInQueue = useMemo(
    () => pendingQueueItems.some((item) => item.pkg.format === 'wup'),
    [pendingQueueItems]
  );

  const hasWuhbInQueue = useMemo(
    () => pendingQueueItems.some((item) => item.pkg.format === 'wuhb'),
    [pendingQueueItems]
  );

  const freeSpaceStatus = useMemo<'ok' | 'tight' | 'insufficient' | 'unknown'>(() => {
    if (targetMode !== 'sd_auto' || !selectedDrive) return 'unknown';
    if (totalQueueBytes === 0) return 'ok';
    if (totalQueueBytes > selectedDrive.freeBytes) return 'insufficient';
    if (hasWupInQueue && totalQueueBytes * 1.15 > selectedDrive.freeBytes) return 'tight';
    return 'ok';
  }, [targetMode, selectedDrive, totalQueueBytes, hasWupInQueue]);

  // Format mismatch warning for custom folder modes
  const folderModeWarning = useMemo(() => {
    if (targetMode === 'custom_apps' && hasWupInQueue) {
      return 'В очереди есть WUP-пакет: для него обычно нужна папка install/';
    }
    if (targetMode === 'custom_install' && hasWuhbInQueue) {
      return 'В очереди есть .wuhb: для Aroma он обычно кладётся в wiiu/apps/';
    }
    return null;
  }, [targetMode, hasWupInQueue, hasWuhbInQueue]);

  // 3-step balenaEtcher workflow state
  const currentStep = useMemo<1 | 2 | 3>(() => {
    if (isInstalling || lastRunSummary?.tone === 'done') return 3;
    if (pendingQueueItems.length === 0) return 1;
    if (!hasTarget) return 2;
    return 3;
  }, [isInstalling, lastRunSummary, pendingQueueItems.length, hasTarget]);

  // Mirrors helpers
  const ruMirror = useMemo(() => mirrors.find((m) => m.id === 'ru') ?? null, [mirrors]);
  const globalMirror = useMemo(() => mirrors.find((m) => m.id === 'global') ?? null, [mirrors]);
  const recommendedMirror = useMemo(
    () => mirrors.find((m) => m.recommended) ?? mirrors.find((m) => m.reachable) ?? null,
    [mirrors]
  );

  // Filtered games
  const catalogCounts = useMemo(() => {
    const ready = catalog.games.filter((g) => g.status !== 'wip').length;
    const wip = catalog.games.filter((g) => g.status === 'wip').length;
    return { all: catalog.games.length, ready, wip };
  }, [catalog.games]);

  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return catalog.games.filter((game) => {
      if (filter === 'ready' && game.status === 'wip') return false;
      if (filter === 'wip' && game.status !== 'wip') return false;
      if (!q) return true;
      return (
        game.title.toLowerCase().includes(q) ||
        game.subtitle.toLowerCase().includes(q) ||
        game.titleId.toLowerCase().includes(q) ||
        game.summary.toLowerCase().includes(q) ||
        game.version.toLowerCase().includes(q)
      );
    });
  }, [catalog.games, filter, searchQuery]);

  // Actions
  const handleOpenExternal = useCallback(
    async (url: string) => {
      try {
        if (inTauri) {
          await openUrl(url);
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      } catch (err) {
        console.error('openUrl failed:', err);
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    [inTauri]
  );

  const handleOpenFolder = useCallback(
    async (path: string) => {
      if (!path) return;
      if (!inTauri) {
        showToast(`Открытие папки «${path}» доступно в десктоп-версии`, 'info');
        return;
      }
      try {
        await invoke('open_folder', { path });
      } catch (err) {
        showToast(`Не удалось открыть папку: ${String(err)}`, 'error');
      }
    },
    [inTauri, showToast]
  );

  const handlePickFolder = useCallback(
    async (mode: 'custom_apps' | 'custom_install') => {
      if (!inTauri) {
        showToast('Системный выбор папки доступен в приложении Parhelio Launcher', 'info');
        return;
      }
      try {
        const title =
          mode === 'custom_apps'
            ? 'Выберите папку wiiu/apps для .wuhb (Aroma)'
            : 'Выберите папку install для WUP Installer GX2';
        const picked = await openDialog({
          directory: true,
          multiple: false,
          title,
        });
        if (typeof picked === 'string' && picked.trim()) {
          if (mode === 'custom_apps') {
            setCustomAppsPath(picked);
          } else {
            setCustomInstallPath(picked);
          }
          showToast('Папка назначения выбрана', 'success');
        }
      } catch (err) {
        showToast(`Ошибка выбора папки: ${String(err)}`, 'error');
      }
    },
    [inTauri, showToast]
  );

  const handleEjectDrive = useCallback(
    async (drive: DriveInfo | null) => {
      if (!drive) return;
      if (!inTauri) {
        showToast('Безопасное извлечение SD доступно в десктоп-приложении', 'info');
        return;
      }
      if (isInstalling) {
        showToast('Сначала завершите или отмените установку', 'warning');
        return;
      }
      setEjectingDrive(true);
      try {
        const message = await invoke<string>('eject_drive', { mountPath: drive.mountPath });
        showToast(message || `SD-карта «${drive.name}» безопасно извлечена`, 'success');
        await refreshDrives(true);
      } catch (err) {
        showToast(`Не удалось извлечь SD: ${String(err)}`, 'error');
      } finally {
        setEjectingDrive(false);
      }
    },
    [inTauri, isInstalling, refreshDrives, showToast]
  );

  const toggleQueueItem = useCallback(
    (game: GameEntry, pkg: GamePackage) => {
      setQueue((prev) => {
        const exists = prev.some((item) => item.pkg.id === pkg.id && item.state !== 'done');
        if (exists) {
          return prev.filter((item) => item.pkg.id !== pkg.id || item.state === 'installing');
        }
        // Replace any other pending package of the same game or allow both? Keeping distinct by pkg.id is super flexible.
        return [
          ...prev.filter((item) => item.pkg.id !== pkg.id),
          {
            gameId: game.id,
            gameTitle: game.title,
            gameAccent: game.accentHex,
            pkg,
            state: 'queued',
          },
        ];
      });
      setLastRunSummary(null);
    },
    []
  );

  const removeQueueItem = useCallback((packageId: string) => {
    setQueue((prev) => prev.filter((item) => item.pkg.id !== packageId || item.state === 'installing'));
  }, []);

  const clearQueue = useCallback(() => {
    if (isInstalling) return;
    setQueue([]);
    setActiveProgress(null);
    setLastRunSummary(null);
  }, [isInstalling]);

  // Execute installation for an explicit list of QueueItems
  const runInstallBatch = useCallback(
    async (itemsToInstall: QueueItem[]) => {
      if (itemsToInstall.length === 0) return;

      if (!inTauri) {
        showToast(
          'Многопоточная загрузка и запись на SD выполняются в десктоп-версии Parhelio Launcher',
          'info'
        );
        return;
      }

      if (!hasTarget) {
        showToast('Сначала выберите SD-карту или папку назначения слева', 'warning');
        return;
      }

      if (freeSpaceStatus === 'insufficient') {
        showToast('Недостаточно свободного места на выбранной SD-карте', 'error');
        return;
      }

      cancelRequestedRef.current = false;
      setIsInstalling(true);
      setLastRunSummary(null);
      setLastCompletedPath(null);

      let completedCount = 0;
      let lastPath: string | null = null;
      let encounteredError: string | null = null;

      for (const item of itemsToInstall) {
        if (cancelRequestedRef.current) {
          setQueue((prev) =>
            prev.map((q) => (q.pkg.id === item.pkg.id ? { ...q, state: 'cancelled' } : q))
          );
          continue;
        }

        setQueue((prev) =>
          prev.map((q) => (q.pkg.id === item.pkg.id ? { ...q, state: 'installing', errorMessage: undefined } : q))
        );

        setActiveProgress({
          packageId: item.pkg.id,
          phase: 'connecting',
          mirrorId: mirrorPreference,
          mirrorName:
            mirrorPreference === 'ru'
              ? 'РФ / СНГ (Cloud.ru)'
              : mirrorPreference === 'global'
                ? 'Мир (Cloudflare R2)'
                : recommendedMirror?.name ?? 'Автовыбор зеркала',
          downloadedBytes: 0,
          totalBytes: item.pkg.sizeBytes,
          speedBytesPerSec: 0,
          etaSeconds: null,
          activeStreams: 0,
          extractCurrent: 0,
          extractTotal: 0,
          currentFile: item.pkg.fileName,
          destinationPath: resolvedTargetPath,
          message: `Подготовка ${item.gameTitle}…`,
        });

        const request: InstallRequest = {
          gameId: item.gameId,
          gameTitle: item.gameTitle,
          packageId: item.pkg.id,
          format: item.pkg.format,
          fileName: item.pkg.fileName,
          sizeBytes: item.pkg.sizeBytes,
          wupFolderName: item.pkg.wupFolderName ?? null,
          mirrorPreference,
          targetMode,
          targetPath: resolvedTargetPath,
        };

        try {
          const result = await invoke<InstallResult>('install_package', { request });
          completedCount += 1;
          lastPath = result.destinationPath;
          setLastCompletedPath(result.destinationPath);
          setInstalledPkgIds((prev) => ({ ...prev, [item.pkg.id]: result.destinationPath }));
          setQueue((prev) =>
            prev.map((q) =>
              q.pkg.id === item.pkg.id
                ? { ...q, state: 'done', destinationPath: result.destinationPath }
                : q
            )
          );
          setActiveProgress({
            packageId: item.pkg.id,
            phase: 'done',
            mirrorId: result.mirrorId,
            mirrorName: result.mirrorName,
            downloadedBytes: result.bytesWritten || item.pkg.sizeBytes,
            totalBytes: result.bytesWritten || item.pkg.sizeBytes,
            speedBytesPerSec: 0,
            etaSeconds: 0,
            activeStreams: 0,
            extractCurrent: result.filesExtracted,
            extractTotal: result.filesExtracted,
            currentFile: item.pkg.fileName,
            destinationPath: result.destinationPath,
            message: `Установлено: ${item.gameTitle}`,
          });
        } catch (err) {
          const msg = String(err);
          const wasCancelled =
            cancelRequestedRef.current || msg.toLowerCase().includes('cancel');

          if (wasCancelled) {
            cancelRequestedRef.current = true;
            setQueue((prev) =>
              prev.map((q) =>
                q.pkg.id === item.pkg.id ? { ...q, state: 'cancelled' } : q
              )
            );
            setActiveProgress((prev) =>
              prev
                ? { ...prev, phase: 'cancelled', message: 'Установка отменена пользователем' }
                : null
            );
            break;
          } else {
            encounteredError = msg;
            setQueue((prev) =>
              prev.map((q) =>
                q.pkg.id === item.pkg.id ? { ...q, state: 'error', errorMessage: msg } : q
              )
            );
            setActiveProgress((prev) =>
              prev ? { ...prev, phase: 'error', message: msg } : null
            );
            break;
          }
        }
      }

      setIsInstalling(false);
      await refreshDrives(true);

      if (cancelRequestedRef.current) {
        setLastRunSummary({ tone: 'cancelled', text: 'Загрузка отменена' });
        showToast('Установка отменена', 'warning');
      } else if (encounteredError) {
        setLastRunSummary({ tone: 'error', text: encounteredError });
        showToast('Ошибка при установке пакета', 'error');
      } else if (completedCount > 0) {
        const label =
          completedCount === 1
            ? 'Игра установлена и готова к запуску на Wii U'
            : `Установлено пакетов: ${completedCount} — готово к запуску на Wii U`;
        setLastRunSummary({ tone: 'done', text: label });
        if (lastPath) setLastCompletedPath(lastPath);
        showToast(label, 'success');
      }
    },
    [
      inTauri,
      hasTarget,
      freeSpaceStatus,
      mirrorPreference,
      recommendedMirror,
      resolvedTargetPath,
      targetMode,
      refreshDrives,
      showToast,
    ]
  );

  const handleStartQueueInstall = useCallback(() => {
    const items = queue.filter((q) => q.state === 'queued' || q.state === 'error' || q.state === 'cancelled');
    if (items.length === 0) return;
    // Reset errored/cancelled items to queued before running
    setQueue((prev) =>
      prev.map((q) =>
        q.state === 'error' || q.state === 'cancelled' ? { ...q, state: 'queued', errorMessage: undefined } : q
      )
    );
    void runInstallBatch(items.map((q) => ({ ...q, state: 'queued' })));
  }, [queue, runInstallBatch]);

  const handleQuickInstall = useCallback(
    (game: GameEntry, pkg: GamePackage) => {
      if (isInstalling) {
        toggleQueueItem(game, pkg);
        return;
      }

      const item: QueueItem = {
        gameId: game.id,
        gameTitle: game.title,
        gameAccent: game.accentHex,
        pkg,
        state: 'queued',
      };

      setQueue((prev) => {
        const without = prev.filter((q) => q.pkg.id !== pkg.id);
        return [...without, item];
      });

      if (!inTauri) {
        showToast(
          'Пакет добавлен в очередь. Реальная загрузка и запись на SD работают в десктоп-приложении.',
          'info'
        );
        return;
      }

      if (!hasTarget) {
        showToast('Пакет добавлен в очередь — выберите SD-карту или папку слева (Шаг 2)', 'warning');
        return;
      }

      void runInstallBatch([item]);
    },
    [isInstalling, toggleQueueItem, inTauri, hasTarget, runInstallBatch, showToast]
  );

  const handleCancelInstall = useCallback(async () => {
    if (!isInstalling) return;
    cancelRequestedRef.current = true;
    try {
      if (inTauri) {
        await invoke('cancel_install');
      }
    } catch (err) {
      console.error('cancel_install failed:', err);
    }
  }, [inTauri, isInstalling]);

  const handleCopyTitleId = useCallback(
    (titleId: string) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(titleId).catch(() => {});
      }
      setCopiedTitleId(titleId);
      window.setTimeout(() => {
        setCopiedTitleId((prev) => (prev === titleId ? null : prev));
      }, 1500);
    },
    []
  );

  // Format mirror badge telemetry
  const renderMirrorTelemetry = (status: MirrorStatus | null) => {
    if (probingMirrors && !status) return <span className="mirror-meta">…</span>;
    if (!status) return null;
    if (!status.reachable) return <span className="mirror-meta is-down">офлайн</span>;
    const parts: string[] = [];
    if (status.latencyMs !== null) parts.push(`${Math.round(status.latencyMs)} мс`);
    if (status.speedMbps !== null) parts.push(`${Math.round(status.speedMbps)} Мбит/с`);
    if (parts.length === 0) return null;
    return <span className="mirror-meta">{parts.join(' · ')}</span>;
  };

  const canStartInstall =
    !isInstalling &&
    queue.some((q) => q.state === 'queued' || q.state === 'error' || q.state === 'cancelled') &&
    hasTarget &&
    freeSpaceStatus !== 'insufficient';

  const activePercent = activeProgress ? progressPercent(activeProgress) : 0;

  return (
    <div className="app-shell">
      {/* Top Toolbar */}
      <header className="topbar">
        <div className="topbar-brand">
          <img src="./mark.svg" alt="Parhelio" className="brand-mark" width={30} height={30} />
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-name">Parhelio Launcher</span>
              <span className="version-pill">v{APP_VERSION}</span>
              {!inTauri && <span className="preview-pill">Web Preview</span>}
            </div>
            <span className="brand-sub">Менеджер портов Wii U · без аккаунтов и паролей</span>
          </div>
        </div>

        <div className="topbar-controls">
          <div className="mirror-bar" role="group" aria-label="Выбор зеркала загрузки">
            <div className="mirror-segmented">
              <button
                type="button"
                className={`mirror-btn ${mirrorPreference === 'auto' ? 'is-active' : ''}`}
                onClick={() => setMirrorPreference('auto')}
                disabled={isInstalling}
                title="Автоматически выбрать самое быстрое зеркало"
              >
                <Zap size={13} />
                <span>Авто</span>
                {recommendedMirror && recommendedMirror.latencyMs !== null && (
                  <span className="mirror-meta">
                    {recommendedMirror.id === 'ru' ? 'РФ' : 'Мир'} · {Math.round(recommendedMirror.latencyMs)} мс
                  </span>
                )}
              </button>

              <button
                type="button"
                className={`mirror-btn ${mirrorPreference === 'ru' ? 'is-active' : ''}`}
                onClick={() => setMirrorPreference('ru')}
                disabled={isInstalling}
                title={ruMirror?.baseUrl ?? 'https://parhelio-dl.s3.cloud.ru'}
              >
                <span
                  className={`status-dot ${
                    probingMirrors
                      ? 'is-probing'
                      : ruMirror?.reachable === false
                        ? 'is-down'
                        : 'is-up'
                  }`}
                />
                <span>РФ (Cloud.ru)</span>
                {renderMirrorTelemetry(ruMirror)}
              </button>

              <button
                type="button"
                className={`mirror-btn ${mirrorPreference === 'global' ? 'is-active' : ''}`}
                onClick={() => setMirrorPreference('global')}
                disabled={isInstalling}
                title={globalMirror?.baseUrl ?? 'https://dl.parhelio.ru'}
              >
                <span
                  className={`status-dot ${
                    probingMirrors
                      ? 'is-probing'
                      : globalMirror?.reachable === false
                        ? 'is-down'
                        : 'is-up'
                  }`}
                />
                <span>Мир (R2)</span>
                {renderMirrorTelemetry(globalMirror)}
              </button>
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={() => void refreshMirrors()}
              disabled={probingMirrors || isInstalling}
              title="Повторить замер пинга и скорости зеркал"
              aria-label="Обновить статус зеркал"
            >
              <RefreshCw size={14} className={probingMirrors ? 'spin' : ''} />
            </button>
          </div>

          <button
            type="button"
            className="icon-btn theme-btn"
            onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
            title={theme === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'}
            aria-label="Переключить тему"
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </header>

      {/* balenaEtcher 3-Step Workflow Strip */}
      <section className="stepper-strip" aria-label="Этапы установки">
        <div
          className={`step-node ${
            currentStep === 1 ? 'is-current' : pendingQueueItems.length > 0 || lastRunSummary?.tone === 'done' ? 'is-done' : ''
          }`}
        >
          <div className="step-badge">
            {currentStep > 1 ? <Check size={13} strokeWidth={2.6} /> : '1'}
          </div>
          <div className="step-copy">
            <div className="step-title">Выбор игры и формата</div>
            <div className="step-desc">
              {pendingQueueItems.length > 0
                ? `В очереди: ${pendingQueueItems.length} · ${formatBytes(totalQueueBytes)}`
                : '.wuhb (Aroma) или WUP Installer'}
            </div>
          </div>
        </div>

        <ChevronRight size={16} className="step-chevron" />

        <div
          className={`step-node ${
            currentStep === 2 ? 'is-current' : hasTarget && currentStep === 3 ? 'is-done' : ''
          }`}
        >
          <div className="step-badge">
            {hasTarget && currentStep === 3 ? <Check size={13} strokeWidth={2.6} /> : '2'}
          </div>
          <div className="step-copy">
            <div className="step-title">Выбор SD-карты или папки</div>
            <div className="step-desc">
              {targetMode === 'sd_auto' && selectedDrive
                ? `${selectedDrive.name} · свободно ${formatBytes(selectedDrive.freeBytes)}`
                : hasTarget
                  ? resolvedTargetPath
                  : 'sd:/wiiu/apps/ · sd:/install/ или папка'}
            </div>
          </div>
        </div>

        <ChevronRight size={16} className="step-chevron" />

        <div
          className={`step-node ${
            lastRunSummary?.tone === 'done'
              ? 'is-done'
              : currentStep === 3
                ? 'is-current'
                : ''
          }`}
        >
          <div className="step-badge">
            {lastRunSummary?.tone === 'done' ? <Check size={13} strokeWidth={2.6} /> : '3'}
          </div>
          <div className="step-copy">
            <div className="step-title">Загрузка и перенос на SD</div>
            <div className="step-desc">
              {isInstalling && activeProgress
                ? `${phaseLabel(activeProgress)} · ${activePercent}%`
                : lastRunSummary?.tone === 'done'
                  ? 'Готово — можно безопасно извлечь SD'
                  : 'Многопоточная загрузка и распаковка'}
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Workspace */}
      <main className="workspace">
        {/* LEFT COLUMN: Target + Queue/Transfer + Support */}
        <aside className="sidebar">
          {/* Card 1: Target SD / Folder */}
          <section className="panel target-panel">
            <div className="panel-header">
              <div className="panel-title">
                <HardDrive size={15} />
                <span>Куда установить</span>
              </div>
              {targetMode === 'sd_auto' && (
                <button
                  type="button"
                  className="ghost-mini-btn"
                  onClick={() => void refreshDrives()}
                  disabled={loadingDrives || isInstalling}
                  title="Обновить список подключённых SD-карт"
                >
                  <RefreshCw size={12} className={loadingDrives ? 'spin' : ''} />
                  <span>Обновить</span>
                </button>
              )}
            </div>

            {/* Segmented Mode Tabs */}
            <div className="segmented-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={targetMode === 'sd_auto'}
                className={`seg-tab ${targetMode === 'sd_auto' ? 'is-active' : ''}`}
                onClick={() => setTargetMode('sd_auto')}
                disabled={isInstalling}
              >
                SD-карта (Авто)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={targetMode === 'custom_apps'}
                className={`seg-tab ${targetMode === 'custom_apps' ? 'is-active' : ''}`}
                onClick={() => setTargetMode('custom_apps')}
                disabled={isInstalling}
              >
                wiiu/apps
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={targetMode === 'custom_install'}
                className={`seg-tab ${targetMode === 'custom_install' ? 'is-active' : ''}`}
                onClick={() => setTargetMode('custom_install')}
                disabled={isInstalling}
              >
                install
              </button>
            </div>

            {targetMode === 'sd_auto' ? (
              <div className="sd-section">
                {drives.length === 0 ? (
                  <div className="empty-drives">
                    <div className="empty-drives-icon">
                      <HardDrive size={18} />
                    </div>
                    <div className="empty-drives-text">
                      <div className="empty-drives-title">
                        {inTauri
                          ? 'SD-карта не обнаружена'
                          : 'Автопоиск SD работает в приложении'}
                      </div>
                      <div className="empty-drives-sub">
                        {inTauri
                          ? 'Вставьте SD-карту Wii U (FAT32) и нажмите «Обновить», или выберите папку вручную.'
                          : 'В десктоп-версии Parhelio Launcher подключённые SD-карты (FAT32 / Wii U SD) определяются автоматически.'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="drive-list">
                    {drives.map((drive) => {
                      const isSelected = drive.id === selectedDriveId;
                      const usedBytes = Math.max(0, drive.totalBytes - drive.freeBytes);
                      const usedPct =
                        drive.totalBytes > 0 ? Math.min(100, Math.round((usedBytes / drive.totalBytes) * 100)) : 0;

                      return (
                        <button
                          key={drive.id}
                          type="button"
                          className={`drive-card ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => setSelectedDriveId(drive.id)}
                          disabled={isInstalling}
                        >
                          <div className="drive-row-top">
                            <div className="drive-name-wrap">
                              <span className={`drive-radio ${isSelected ? 'is-checked' : ''}`} />
                              <span className="drive-name" title={drive.name}>
                                {drive.name}
                              </span>
                            </div>
                            <div className="drive-badges">
                              {drive.isLikelyWiiuSd && (
                                <span className="badge-wiiu-sd">
                                  <ShieldCheck size={11} />
                                  Wii U SD
                                </span>
                              )}
                              {drive.fsType && <span className="badge-fs">{drive.fsType}</span>}
                            </div>
                          </div>

                          <div className="drive-mount mono" title={drive.mountPath}>
                            {drive.mountPath}
                          </div>

                          <div className="drive-bar-track">
                            <div
                              className={`drive-bar-fill ${usedPct > 88 ? 'is-high' : ''}`}
                              style={{ width: `${usedPct}%` }}
                            />
                          </div>

                          <div className="drive-space-row">
                            <span className="mono">Свободно {formatBytes(drive.freeBytes)}</span>
                            <span className="mono muted">из {formatBytes(drive.totalBytes)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedDrive && (
                  <>
                    <div className="resolved-paths">
                      <div className="resolved-path-row">
                        <span className="path-tag is-wuhb">.wuhb</span>
                        <span className="mono path-val" title={joinDisplayPath(selectedDrive.mountPath, 'wiiu/apps/')}>
                          {joinDisplayPath(selectedDrive.mountPath, 'wiiu/apps/')}
                        </span>
                      </div>
                      <div className="resolved-path-row">
                        <span className="path-tag is-wup">WUP</span>
                        <span
                          className="mono path-val"
                          title={joinDisplayPath(selectedDrive.mountPath, 'install/<Игра>/')}
                        >
                          {joinDisplayPath(selectedDrive.mountPath, 'install/<Игра>/')}
                        </span>
                      </div>
                    </div>

                    <div className="drive-actions-row">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => void handleOpenFolder(selectedDrive.mountPath)}
                        disabled={isInstalling}
                      >
                        <FolderOpen size={13} />
                        <span>Открыть SD</span>
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => void handleEjectDrive(selectedDrive)}
                        disabled={isInstalling || ejectingDrive || !selectedDrive.isRemovable}
                        title={
                          selectedDrive.isRemovable
                            ? 'Безопасно размонтировать и извлечь SD-карту'
                            : 'Этот том не является съёмным накопителем'
                        }
                      >
                        {ejectingDrive ? (
                          <Loader2 size={13} className="spin" />
                        ) : (
                          <Unplug size={13} />
                        )}
                        <span>Извлечь SD</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="folder-section">
                <p className="folder-explain">
                  {targetMode === 'custom_apps'
                    ? 'Файлы Aroma (.wuhb) будут скопированы напрямую в выбранную папку (обычно sd:/wiiu/apps/).'
                    : 'Архивы WUP Installer (.zip) будут распакованы в подпапку игры внутри выбранной папки (обычно sd:/install/).'}
                </p>

                <button
                  type="button"
                  className="folder-picker-btn"
                  onClick={() => void handlePickFolder(targetMode)}
                  disabled={isInstalling}
                >
                  <Folder size={15} />
                  <span>
                    {resolvedTargetPath ? 'Изменить папку…' : 'Выбрать папку…'}
                  </span>
                </button>

                {resolvedTargetPath ? (
                  <div className="selected-folder-box">
                    <span className="mono selected-folder-path" title={resolvedTargetPath}>
                      {resolvedTargetPath}
                    </span>
                    <button
                      type="button"
                      className="icon-mini-btn"
                      onClick={() => void handleOpenFolder(resolvedTargetPath)}
                      title="Открыть в проводнике / Finder"
                    >
                      <FolderOpen size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="folder-empty-hint">Папка пока не выбрана</div>
                )}
              </div>
            )}
          </section>

          {/* Card 2: Download Queue & Active Transfer */}
          <section className="panel queue-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Layers size={15} />
                <span>Очередь установки</span>
                {queue.length > 0 && <span className="count-pill">{queue.length}</span>}
              </div>
              {queue.length > 0 && !isInstalling && (
                <button type="button" className="ghost-mini-btn" onClick={clearQueue}>
                  <Trash2 size={12} />
                  <span>Очистить</span>
                </button>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="empty-queue">
                <span>Выберите игру справа и нажмите </span>
                <strong>«+ В очередь»</strong>
                <span> или </span>
                <strong>«Установить»</strong>
              </div>
            ) : (
              <div className="queue-list">
                {queue.map((item) => (
                  <div key={item.pkg.id} className={`queue-item is-${item.state}`}>
                    <span
                      className="queue-dot"
                      style={{ backgroundColor: item.gameAccent }}
                    />
                    <div className="queue-item-body">
                      <div className="queue-item-title" title={item.gameTitle}>
                        {item.gameTitle}
                      </div>
                      <div className="queue-item-meta">
                        <span className={`fmt-chip is-${item.pkg.format}`}>
                          {item.pkg.format === 'wuhb' ? '.wuhb Aroma' : 'WUP GX2'}
                        </span>
                        <span className="mono">{item.pkg.sizeLabel}</span>
                      </div>
                      {item.errorMessage && (
                        <div className="queue-item-err" title={item.errorMessage}>
                          {item.errorMessage}
                        </div>
                      )}
                    </div>

                    <div className="queue-item-right">
                      {item.state === 'installing' && <Loader2 size={14} className="spin accent-icon" />}
                      {item.state === 'done' && <CheckCircle2 size={15} className="ok-icon" />}
                      {item.state === 'error' && <AlertTriangle size={15} className="err-icon" />}
                      {item.state !== 'installing' && (
                        <button
                          type="button"
                          className="icon-mini-btn"
                          onClick={() => removeQueueItem(item.pkg.id)}
                          aria-label={`Удалить ${item.gameTitle} из очереди`}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Space summary & warnings */}
            {pendingQueueItems.length > 0 && (
              <div className="queue-summary">
                <div className="summary-row">
                  <span>Общий размер</span>
                  <strong className="mono">{formatBytes(totalQueueBytes)}</strong>
                </div>
                {targetMode === 'sd_auto' && selectedDrive && (
                  <div className={`summary-row is-${freeSpaceStatus}`}>
                    <span>Свободно на SD</span>
                    <strong className="mono">{formatBytes(selectedDrive.freeBytes)}</strong>
                  </div>
                )}
              </div>
            )}

            {freeSpaceStatus === 'insufficient' && (
              <div className="inline-alert is-error">
                <AlertTriangle size={14} />
                <span>На SD-карте недостаточно места для выбранных игр.</span>
              </div>
            )}

            {freeSpaceStatus === 'tight' && (
              <div className="inline-alert is-warn">
                <AlertTriangle size={14} />
                <span>Места впритык: распаковка WUP требует небольшой запас на SD.</span>
              </div>
            )}

            {folderModeWarning && (
              <div className="inline-alert is-warn">
                <AlertTriangle size={14} />
                <span>{folderModeWarning}</span>
              </div>
            )}

            {/* Active / Completed Transfer Telemetry */}
            {activeProgress && (
              <div className={`transfer-box is-${activeProgress.phase}`}>
                <div className="transfer-top">
                  <span className={`phase-pill is-${activeProgress.phase}`}>
                    {isInstalling && <Loader2 size={11} className="spin" />}
                    {activeProgress.phase === 'done' && <CheckCircle2 size={11} />}
                    {activeProgress.phase === 'error' && <AlertTriangle size={11} />}
                    <span>{phaseLabel(activeProgress)}</span>
                  </span>
                  <span className="transfer-pct mono">{activePercent}%</span>
                </div>

                <div className="progress-track">
                  <div
                    className={`progress-fill is-${activeProgress.phase}`}
                    style={{ width: `${activePercent}%` }}
                  />
                </div>

                <div className="transfer-stats">
                  <div className="stat-chip">
                    <Gauge size={12} />
                    <span className="mono">
                      {activeProgress.phase === 'downloading'
                        ? formatSpeed(activeProgress.speedBytesPerSec)
                        : activeProgress.phase === 'extracting' && activeProgress.extractTotal > 0
                          ? `${activeProgress.extractCurrent}/${activeProgress.extractTotal} ф.`
                          : formatBytes(activeProgress.downloadedBytes)}
                    </span>
                  </div>
                  <div className="stat-chip">
                    <Clock size={12} />
                    <span className="mono">
                      {activeProgress.phase === 'done'
                        ? 'Готово'
                        : `ETA ${formatEta(activeProgress.etaSeconds)}`}
                    </span>
                  </div>
                  {activeProgress.mirrorName && (
                    <div className="stat-chip stat-mirror" title={activeProgress.mirrorName}>
                      <Server size={12} />
                      <span>{activeProgress.mirrorId === 'ru' ? 'Cloud.ru' : activeProgress.mirrorId === 'global' ? 'R2' : activeProgress.mirrorName}</span>
                    </div>
                  )}
                </div>

                <div className="transfer-file-line">
                  <span className="mono truncate" title={activeProgress.currentFile || activeProgress.message}>
                    {activeProgress.message || activeProgress.currentFile}
                  </span>
                  {activeProgress.totalBytes > 0 && activeProgress.phase === 'downloading' && (
                    <span className="mono muted nowrap">
                      {formatBytes(activeProgress.downloadedBytes)} / {formatBytes(activeProgress.totalBytes)}
                    </span>
                  )}
                </div>

                {!isInstalling && (lastCompletedPath || activeProgress.phase === 'done') && (
                  <div className="post-install-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => void handleOpenFolder(lastCompletedPath || resolvedTargetPath)}
                    >
                      <FolderOpen size={13} />
                      <span>Открыть папку</span>
                    </button>
                    {targetMode === 'sd_auto' && selectedDrive && (
                      <button
                        type="button"
                        className="secondary-btn is-emerald"
                        onClick={() => void handleEjectDrive(selectedDrive)}
                        disabled={ejectingDrive || !selectedDrive.isRemovable}
                      >
                        <Unplug size={13} />
                        <span>Безопасно извлечь SD</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Main Primary Action Button */}
            {isInstalling ? (
              <button
                type="button"
                className="primary-action-btn is-danger"
                onClick={() => void handleCancelInstall()}
              >
                <X size={16} />
                <span>Отменить установку</span>
              </button>
            ) : (
              <button
                type="button"
                className="primary-action-btn"
                onClick={handleStartQueueInstall}
                disabled={!canStartInstall}
              >
                <ArrowDownToLine size={16} />
                <span>
                  {targetMode === 'sd_auto'
                    ? 'Скачать и установить на SD'
                    : 'Скачать в выбранную папку'}
                </span>
              </button>
            )}
          </section>

          {/* Card 3: Subtle WiiUDownloader-inspired Support Strip */}
          <section className="support-strip">
            <div className="support-left">
              <Heart size={13} className="support-heart" />
              <span>Поддержать Parhelio</span>
            </div>
            <div className="support-links">
              <button
                type="button"
                className="support-pill"
                onClick={() => void handleOpenExternal(YOOMONEY_URL)}
              >
                <span>ЮMoney</span>
                <ExternalLink size={11} />
              </button>
              <button
                type="button"
                className="support-pill"
                onClick={() => void handleOpenExternal(BOOSTY_URL)}
              >
                <span>Boosty</span>
                <ExternalLink size={11} />
              </button>
            </div>
          </section>
        </aside>

        {/* RIGHT COLUMN: Game Catalog */}
        <section className="catalog-pane">
          <div className="catalog-toolbar">
            <div className="filter-pills" role="tablist" aria-label="Фильтр каталога">
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'all'}
                className={`filter-pill ${filter === 'all' ? 'is-active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <span>Все</span>
                <span className="pill-num">{catalogCounts.all}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'ready'}
                className={`filter-pill ${filter === 'ready' ? 'is-active' : ''}`}
                onClick={() => setFilter('ready')}
              >
                <span>Готовые</span>
                <span className="pill-num">{catalogCounts.ready}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'wip'}
                className={`filter-pill ${filter === 'wip' ? 'is-active' : ''}`}
                onClick={() => setFilter('wip')}
              >
                <span>В разработке</span>
                <span className="pill-num">{catalogCounts.wip}</span>
              </button>
            </div>

            <div className="search-wrap">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Поиск по названию или Title ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Очистить поиск"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="catalog-scroll">
            {catalogLoading ? (
              <div className="catalog-empty">
                <Loader2 size={20} className="spin" />
                <span>Загрузка каталога Parhelio…</span>
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="catalog-empty">
                <Gamepad2 size={22} />
                <span>Ничего не найдено по запросу «{searchQuery}»</span>
              </div>
            ) : (
              <div className="game-list">
                {filteredGames.map((game) => {
                  const activePkg = getSelectedPackage(game);
                  const isWip = game.status === 'wip' || game.packages.length === 0;
                  const inQueue = activePkg
                    ? queue.some((q) => q.pkg.id === activePkg.id && q.state !== 'done')
                    : false;
                  const isInstalled = activePkg ? Boolean(installedPkgIds[activePkg.id]) : false;
                  const coverBroken = Boolean(failedCovers[game.id]);

                  return (
                    <article
                      key={game.id}
                      className={`game-card ${isWip ? 'is-wip' : ''} ${inQueue ? 'is-queued' : ''}`}
                      style={{ '--game-accent': game.accentHex } as React.CSSProperties}
                    >
                      {/* Cover Art */}
                      <div className="game-cover-wrap">
                        {!coverBroken ? (
                          <img
                            src={game.coverUrl}
                            alt={game.title}
                            className="game-cover-img"
                            loading="lazy"
                            onError={() =>
                              setFailedCovers((prev) => ({ ...prev, [game.id]: true }))
                            }
                          />
                        ) : (
                          <div className="game-cover-fallback">
                            <Gamepad2 size={28} />
                            <span>{game.title}</span>
                          </div>
                        )}
                        <span className={`cover-status-badge is-${game.status}`}>
                          {game.status === 'ready' && <Sparkles size={11} />}
                          {game.status === 'playable' && <PackageCheck size={11} />}
                          <span>{game.statusLabel}</span>
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="game-body">
                        <div className="game-header-row">
                          <div className="game-title-group">
                            <h2 className="game-title">{game.title}</h2>
                            <span className="game-version-pill">{game.version}</span>
                          </div>

                          <button
                            type="button"
                            className="title-id-pill mono"
                            onClick={() => handleCopyTitleId(game.titleId)}
                            title="Нажмите, чтобы скопировать Title ID"
                          >
                            <span>{game.titleId}</span>
                            {copiedTitleId === game.titleId ? (
                              <Check size={11} className="ok-icon" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>

                        <div className="game-subtitle">{game.subtitle}</div>
                        <p className="game-summary">{game.summary}</p>

                        {!isWip && activePkg ? (
                          <div className="game-footer">
                            <div className="format-col">
                              {game.packages.length > 1 ? (
                                <div className="format-switcher" role="group" aria-label="Формат пакета">
                                  {game.packages.map((pkg) => {
                                    const active = pkg.id === activePkg.id;
                                    return (
                                      <button
                                        key={pkg.id}
                                        type="button"
                                        className={`fmt-btn ${active ? 'is-active' : ''}`}
                                        onClick={() =>
                                          setSelectedFormatByGame((prev) => ({
                                            ...prev,
                                            [game.id]: pkg.format,
                                          }))
                                        }
                                      >
                                        <span>
                                          {pkg.format === 'wuhb' ? '.wuhb (Aroma)' : 'WUP GX2 (.zip)'}
                                        </span>
                                        <span className="fmt-size mono">{pkg.sizeLabel}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="single-format-row">
                                  <span className="single-fmt-pill">
                                    <span>{activePkg.label}</span>
                                    <span className="fmt-size mono">{activePkg.sizeLabel}</span>
                                  </span>
                                  <span className="cfw-note">Только WUP · нужен CFW с sigpatches</span>
                                </div>
                              )}

                              <div className="install-hint mono" title={activePkg.installHint}>
                                {activePkg.installHint}
                              </div>
                            </div>

                            <div className="game-actions">
                              <button
                                type="button"
                                className={`queue-toggle-btn ${inQueue ? 'is-in-queue' : ''} ${
                                  isInstalled && !inQueue ? 'is-installed' : ''
                                }`}
                                onClick={() => toggleQueueItem(game, activePkg)}
                              >
                                {inQueue ? (
                                  <>
                                    <Check size={14} />
                                    <span>В очереди</span>
                                  </>
                                ) : isInstalled ? (
                                  <>
                                    <CheckCircle2 size={14} />
                                    <span>Установлено</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus size={14} />
                                    <span>В очередь</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                className="install-now-btn"
                                onClick={() => handleQuickInstall(game, activePkg)}
                                disabled={isInstalling}
                                title="Скачать и установить этот пакет сразу"
                              >
                                <Download size={14} />
                                <span>Установить</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="wip-footer">
                            <span className="wip-badge">
                              <Globe size={12} />
                              <span>В разработке · скоро</span>
                            </span>
                            <span className="wip-note">
                              Пакет появится в каталоге автоматически после публикации релиза
                            </span>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Toast */}
      {toast && (
        <div className={`toast is-${toast.tone}`} role="status" aria-live="polite">
          <span>{toast.text}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToast(null)}
            aria-label="Закрыть уведомление"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
