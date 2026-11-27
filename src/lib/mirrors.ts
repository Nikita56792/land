import { useEffect, useState } from 'react';

export type MirrorRegion = 'ru' | 'global';
export type MirrorPreference = 'auto' | MirrorRegion;

export const MIRROR_BASES: Record<MirrorRegion, string> = {
  ru: 'https://parhelio-ru-storage.s3.cloud.ru',
  global: 'https://dl.parhelio.ru',
};

export const MIRROR_LABELS: Record<MirrorRegion, string> = {
  ru: 'РФ / СНГ (Cloud.ru)',
  global: 'Мир (Cloudflare R2)',
};

const STORAGE_KEY = 'parhelio_mirror_pref';

const RU_CIS_TIMEZONES = new Set([
  'Europe/Moscow',
  'Europe/Kaliningrad',
  'Europe/Samara',
  'Europe/Volgograd',
  'Europe/Saratov',
  'Europe/Astrakhan',
  'Europe/Ulyanovsk',
  'Europe/Kirov',
  'Asia/Yekaterinburg',
  'Asia/Omsk',
  'Asia/Novosibirsk',
  'Asia/Barnaul',
  'Asia/Tomsk',
  'Asia/Novokuznetsk',
  'Asia/Krasnoyarsk',
  'Asia/Irkutsk',
  'Asia/Chita',
  'Asia/Yakutsk',
  'Asia/Khandyga',
  'Asia/Vladivostok',
  'Asia/Ust-Nera',
  'Asia/Magadan',
  'Asia/Sakhalin',
  'Asia/Srednekolymsk',
  'Asia/Kamchatka',
  'Asia/Anadyr',
  'Europe/Minsk',
  'Asia/Almaty',
  'Asia/Qyzylorda',
  'Asia/Qostanay',
  'Asia/Aqtobe',
  'Asia/Aqtau',
  'Asia/Atyrau',
  'Asia/Oral',
  'Asia/Tashkent',
  'Asia/Samarkand',
  'Asia/Bishkek',
  'Asia/Dushanbe',
  'Asia/Ashgabat',
  'Asia/Baku',
  'Asia/Yerevan',
  'Asia/Tbilisi',
  'Europe/Chisinau',
]);

export interface MirrorProbeState {
  probed: boolean;
  detected: MirrorRegion;
  ruOk: boolean;
  globalOk: boolean;
  ruMs: number | null;
  globalMs: number | null;
}

const initialProbe: MirrorProbeState = {
  probed: false,
  detected:
    typeof window !== 'undefined' &&
    window.location.hostname === 'global.parhelio.ru'
      ? 'global'
      : 'global',
  ruOk: false,
  globalOk: true,
  ruMs: null,
  globalMs: null,
};

let cachedProbe: MirrorProbeState | null = null;
let probePromise: Promise<MirrorProbeState> | null = null;
const listeners = new Set<() => void>();

function getStoredPreference(): MirrorPreference {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'ru' || raw === 'global' || raw === 'auto') return raw;
  } catch {
    /* ignore */
  }
  return 'auto';
}

let currentPreference: MirrorPreference =
  typeof window !== 'undefined' ? getStoredPreference() : 'auto';

export function setMirrorPreference(pref: MirrorPreference) {
  currentPreference = pref;
  try {
    window.localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}

async function pingMirror(base: string, timeoutMs = 1900): Promise<number | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  try {
    const res = await fetch(`${base}/ping.txt`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const text = (await res.text()).trim();
    if (!text.startsWith('ok')) return null;
    return Math.round(performance.now() - started);
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

function isLikelyRuCisClient(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && RU_CIS_TIMEZONES.has(tz)) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function startMirrorProbe(): Promise<MirrorProbeState> {
  if (cachedProbe) return Promise.resolve(cachedProbe);
  if (probePromise) return probePromise;

  probePromise = Promise.all([
    pingMirror(MIRROR_BASES.ru),
    pingMirror(MIRROR_BASES.global),
  ]).then(([ruMs, globalMs]) => {
    const ruOk = ruMs !== null;
    const globalOk = globalMs !== null;
    const onGlobalHost =
      typeof window !== 'undefined' &&
      window.location.hostname === 'global.parhelio.ru';
    const ruCis = isLikelyRuCisClient();

    let detected: MirrorRegion = 'global';
    if (ruOk && !globalOk) {
      detected = 'ru';
    } else if (!ruOk && globalOk) {
      detected = 'global';
    } else if (ruOk && globalOk) {
      if (onGlobalHost) {
        detected = 'global';
      } else if (ruCis && (ruMs ?? 9999) <= (globalMs ?? 9999) + 120) {
        detected = 'ru';
      } else {
        detected = (ruMs ?? 9999) < (globalMs ?? 9999) ? 'ru' : 'global';
      }
    }

    cachedProbe = {
      probed: true,
      detected,
      ruOk,
      globalOk,
      ruMs,
      globalMs,
    };

    // Seamless auto-redirect outside RU/CIS from parhelio.ru -> global.parhelio.ru
    try {
      const host = window.location.hostname;
      const params = new URLSearchParams(window.location.search);
      const stay =
        params.get('stay') === '1' ||
        window.sessionStorage.getItem('parhelio_stay_host') === '1';
      if (params.get('stay') === '1') {
        window.sessionStorage.setItem('parhelio_stay_host', '1');
      }
      if (
        !stay &&
        currentPreference === 'auto' &&
        (host === 'parhelio.ru' || host === 'www.parhelio.ru') &&
        !ruCis &&
        globalOk &&
        (!ruOk || (globalMs ?? 9999) + 60 < (ruMs ?? 9999))
      ) {
        const target = `https://global.parhelio.ru${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.replace(target);
      }
    } catch {
      /* ignore */
    }

    listeners.forEach((fn) => fn());
    return cachedProbe;
  });

  return probePromise;
}

export function buildReleaseUrl(mirror: MirrorRegion, fileName: string): string {
  return `${MIRROR_BASES[mirror]}/releases/${encodeURIComponent(fileName)}`;
}

export function useSmartMirror() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((v) => v + 1);
    listeners.add(bump);
    startMirrorProbe();
    return () => {
      listeners.delete(bump);
    };
  }, []);

  const probe = cachedProbe ?? initialProbe;
  const activeMirror: MirrorRegion =
    currentPreference === 'auto' ? probe.detected : currentPreference;

  return {
    preference: currentPreference,
    setPreference: setMirrorPreference,
    activeMirror,
    probe,
    getReleaseUrl: (fileName: string) => buildReleaseUrl(activeMirror, fileName),
  };
}
