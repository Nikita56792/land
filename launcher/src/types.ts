export type PackageFormat = 'wuhb' | 'wup';

export type GameStatus = 'ready' | 'playable' | 'wip';

export type TargetMode = 'sd_auto' | 'custom_apps' | 'custom_install';

export type MirrorPreference = 'auto' | 'ru' | 'global';

export type ThemeMode = 'light' | 'dark';

export interface MirrorDef {
  id: string;
  name: string;
  region: string;
  baseUrl: string;
  pingPath: string;
}

export interface MirrorStatus {
  id: string;
  name: string;
  region: string;
  baseUrl: string;
  reachable: boolean;
  latencyMs: number | null;
  speedMbps: number | null;
  recommended: boolean;
}

export interface GamePackage {
  id: string;
  format: PackageFormat;
  label: string;
  fileName: string;
  sizeBytes: number;
  sizeLabel: string;
  defaultSubdir: string;
  wupFolderName?: string | null;
  installHint: string;
}

export interface GameEntry {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  version: string;
  titleId: string;
  status: GameStatus;
  statusLabel: string;
  accentHex: string;
  coverUrl: string;
  summary: string;
  packages: GamePackage[];
}

export interface Catalog {
  schemaVersion: number;
  updatedAt: string;
  mirrors: MirrorDef[];
  games: GameEntry[];
}

export interface DriveInfo {
  id: string;
  name: string;
  mountPath: string;
  fsType: string;
  totalBytes: number;
  freeBytes: number;
  isRemovable: boolean;
  hasWiiuApps: boolean;
  hasInstallDir: boolean;
  isLikelyWiiuSd: boolean;
}

export interface InstallRequest {
  gameId: string;
  gameTitle: string;
  packageId: string;
  format: PackageFormat;
  fileName: string;
  sizeBytes: number;
  wupFolderName?: string | null;
  mirrorPreference: MirrorPreference;
  targetMode: TargetMode;
  targetPath: string;
}

export interface InstallResult {
  packageId: string;
  destinationPath: string;
  mirrorId: string;
  mirrorName: string;
  bytesWritten: number;
  filesExtracted: number;
  elapsedSeconds: number;
}

export type InstallPhase =
  | 'connecting'
  | 'downloading'
  | 'extracting'
  | 'copying'
  | 'verifying'
  | 'done'
  | 'cancelled'
  | 'error'
  | string;

export interface InstallProgress {
  packageId: string;
  phase: InstallPhase;
  mirrorId: string;
  mirrorName: string;
  downloadedBytes: number;
  totalBytes: number;
  speedBytesPerSec: number;
  etaSeconds: number | null;
  activeStreams: number;
  extractCurrent: number;
  extractTotal: number;
  currentFile: string;
  destinationPath: string;
  message: string;
}

export interface QueueItem {
  gameId: string;
  gameTitle: string;
  gameAccent: string;
  pkg: GamePackage;
  state: 'queued' | 'installing' | 'done' | 'error' | 'cancelled';
  destinationPath?: string;
  errorMessage?: string;
}

export function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export const FALLBACK_CATALOG: Catalog = {
  schemaVersion: 1,
  updatedAt: '2026-11-27T20:00:00Z',
  mirrors: [
    {
      id: 'ru',
      name: 'РФ / СНГ (Cloud.ru)',
      region: 'RU / CIS',
      baseUrl: 'https://parhelio-dl.s3.cloud.ru',
      pingPath: '/ping.txt',
    },
    {
      id: 'global',
      name: 'Мир (Cloudflare R2)',
      region: 'Global CDN',
      baseUrl: 'https://dl.parhelio.ru',
      pingPath: '/ping.txt',
    },
  ],
  games: [
    {
      id: 'minecraft-wiiu',
      slug: 'minecraft',
      title: 'Minecraft: Wii U Edition',
      subtitle: 'DualScreen Co-op · RedHills C++ · 1080p AMD CAS',
      version: 'Update v688',
      titleId: '00050000101D7500',
      status: 'ready',
      statusLabel: 'Готов к установке',
      accentHex: '#34D399',
      coverUrl: 'https://parhelio.ru/media/art/minecraft-cover.webp',
      summary:
        'Два независимых экрана (TV 1080p CAS + GamePad 480p), масштабированный тач-UI и раздельный звук AX на Core 2.',
      packages: [
        {
          id: 'mc-wuhb',
          format: 'wuhb',
          label: 'Aroma (.wuhb)',
          fileName: 'Minecraft.WiiU.wuhb',
          sizeBytes: 1510059508,
          sizeLabel: '1.41 ГБ',
          defaultSubdir: 'wiiu/apps',
          installHint: 'Копируется в sd:/wiiu/apps/Minecraft.WiiU.wuhb',
        },
        {
          id: 'mc-wup',
          format: 'wup',
          label: 'WUP Installer (.zip)',
          fileName: 'Minecraft_WiiU-WUP.zip',
          sizeBytes: 1541515992,
          sizeLabel: '1.44 ГБ',
          defaultSubdir: 'install',
          wupFolderName: 'Minecraft_WiiU',
          installHint: 'Распаковывается в sd:/install/Minecraft_WiiU/ для WUP Installer GX2',
        },
      ],
    },
    {
      id: 'buckshot-roulette',
      slug: 'buckshot',
      title: 'Buckshot Roulette',
      subtitle: 'Build 116 (v44) · Нативный C++20/GX2 + локальный 1v1',
      version: 'Build 116 v44',
      titleId: '000500001337B001',
      status: 'ready',
      statusLabel: 'Готов к установке',
      accentHex: '#F87171',
      coverUrl: 'https://parhelio.ru/media/art/buckshot-cover.webp',
      summary:
        'Собственный C++20/WUT рантайм, 28 шейдеров GX2, 720p→1080p AMD CAS, звук AX IMA-ADPCM и локальный 1v1 на 2 экранах.',
      packages: [
        {
          id: 'br-wuhb',
          format: 'wuhb',
          label: 'Aroma (.wuhb)',
          fileName: 'BuckshotRoulette.wuhb',
          sizeBytes: 318047300,
          sizeLabel: '303 МБ',
          defaultSubdir: 'wiiu/apps',
          installHint: 'Копируется в sd:/wiiu/apps/BuckshotRoulette.wuhb',
        },
        {
          id: 'br-wup',
          format: 'wup',
          label: 'WUP Installer (.zip)',
          fileName: 'BuckshotRoulette_WiiU-WUP.zip',
          sizeBytes: 328575016,
          sizeLabel: '313 МБ',
          defaultSubdir: 'install',
          wupFolderName: 'BuckshotRoulette_WiiU',
          installHint: 'Распаковывается в sd:/install/BuckshotRoulette_WiiU/ для WUP Installer GX2',
        },
      ],
    },
    {
      id: 'slime-rancher',
      slug: 'slime',
      title: 'Slime Rancher',
      subtitle: 'v42 NoLog · Full-AOT Unity 5.6.5p4 · Core 2 SIMD',
      version: 'v42 NoLog',
      titleId: '0005000021000002',
      status: 'playable',
      statusLabel: 'Релиз WUP',
      accentHex: '#FB7185',
      coverUrl: 'https://parhelio.ru/media/art/slime-cover.webp',
      summary:
        '100% Full-AOT (50 719 методов), 3 786 шейдеров GX2, WPVS-окклюзия, аппаратный GCADPCM и живая карта MapUI на GamePad.',
      packages: [
        {
          id: 'sr-wup',
          format: 'wup',
          label: 'WUP Installer (.zip)',
          fileName: 'SlimeRancher_WiiU_NoLog-WUP.zip',
          sizeBytes: 946189864,
          sizeLabel: '902 МБ',
          defaultSubdir: 'install',
          wupFolderName: 'SlimeRancher_WiiU_NoLog',
          installHint: 'Распаковывается в sd:/install/SlimeRancher_WiiU_NoLog/ (только WUP, нужен CFW с sigpatches)',
        },
      ],
    },
    {
      id: 'animal-crossing-nh',
      slug: 'acnh',
      title: 'Animal Crossing: New Horizons',
      subtitle: 'Static Recomp (Switch AArch64 → Wii U PPC32) · Wave 9',
      version: 'Wave 9',
      titleId: '0005000021AC0001',
      status: 'wip',
      statusLabel: 'В разработке',
      accentHex: '#1BB59B',
      coverUrl: 'https://parhelio.ru/media/art/acnh-cover.webp',
      summary:
        'Статическая рекомпиляция Switch v1.0.0 (149 716 функций, 4 299 шейдеров GX2, 62 C HLE). Идёт оптимизация и тестирование.',
      packages: [],
    },
    {
      id: 'subnautica',
      slug: 'subnautica',
      title: 'Subnautica',
      subtitle: 'R&D v18 · Full-AOT Unity 5.6 + Single-RT WBOIT + CAS',
      version: 'R&D v18',
      titleId: '0005000021000003',
      status: 'wip',
      statusLabel: 'R&D',
      accentHex: '#38BDF8',
      coverUrl: 'https://parhelio.ru/media/art/subnautica-cover.webp',
      summary:
        '100% Full-AOT (45 582 метода), 5 600 шейдеров GX2, Single-RT WBOIT, 432p→720p CAS. Активная оптимизация MEM2.',
      packages: [],
    },
  ],
};
