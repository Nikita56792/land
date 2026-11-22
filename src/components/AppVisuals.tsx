import React, { useState } from 'react';
import {
  Cpu,
  Volume2,
  Sparkles,
  Layers,
  Eye,
  Compass,
  MousePointer2,
  Music,
} from 'lucide-react';

export const EpidaurusArchitectureWidget: React.FC<{ accentHex: string }> = ({
  accentHex,
}) => {
  const [stage, setStage] = useState<'vvc' | 'atmos' | 'upmix' | 'torrent'>('vvc');

  const stages = {
    vvc: {
      title: 'VVdeC NEON против FFmpeg vvc (M4 Max)',
      icon: Cpu,
      note: '4K 10-bit HDR10 (8 Мбит/с) декодируется со скоростью 302 fps; первый кадр за 68 мс; на 8K задействуется 5–9 ядер без единого пропуска.',
      bars: [
        { label: 'VVdeC NEON (4K 10-bit)', val: '302 FPS', pct: 100, active: true },
        { label: 'FFmpeg vvc (4K 10-bit)', val: '62 FPS', pct: 21, active: false },
        { label: 'VVdeC NEON (8K 6 Mbps)', val: '101 FPS', pct: 34, active: true },
      ],
    },
    atmos: {
      title: 'TrueHD 16-канальный объектный Dolby Atmos',
      icon: Volume2,
      note: 'Декодирование позиций объектов из OAMD с точностью до сэмпла. Для наушников — прямой точечный рендеринг через Apple HRTF без промежуточной сетки колонок.',
      bars: [
        { label: 'TrueHD OAMD Objects', val: '16 каналов', pct: 100, active: true },
        { label: 'Наушники', val: 'Apple HRTF + AutoEQ', pct: 88, active: true },
        { label: 'Акустика', val: '7.1.4 Direct Pan', pct: 76, active: false },
      ],
    },
    upmix: {
      title: 'Стерео → 3D пространственный апмикс',
      icon: Sparkles,
      note: 'STFT Direct/Diffuse разделение (3D DSP, <1% CPU) или нейросетевой HTDemucs на 6 стемов на Apple Silicon (~7× быстрее реального времени).',
      bars: [
        { label: 'HTDemucs 6-Stem ONNX', val: '7× Real-Time', pct: 95, active: true },
        { label: '3D DSP (ICC + Velvet)', val: '< 1% CPU / 40 ms', pct: 72, active: true },
        { label: 'Виртуальная сцена', val: '14 источников', pct: 85, active: false },
      ],
    },
    torrent: {
      title: 'Прямой стриминг торрентов в FFmpeg',
      icon: Layers,
      note: 'Собственный AVIOContext читает блоки из libtorrent-rasterbar 2.1 напрямую в демуксер — без локального HTTP-прокси и с мгновенной перемоткой.',
      bars: [
        { label: 'Движок qBittorrent', val: 'libtorrent 2.1.2', pct: 100, active: true },
        { label: 'Перемотка', val: 'Instant Abort', pct: 92, active: true },
        { label: 'Протоколы', val: 'TCP · uTP · WebTorrent', pct: 80, active: false },
      ],
    },
  };

  const current = stages[stage];
  const Icon = current.icon;

  return (
    <div className="apple-bench-card">
      <div className="apple-bench-tabs" role="tablist" aria-label="Модули ядра Epidaurus">
        {(
          [
            ['vvc', 'H.266 / VVC'],
            ['atmos', 'TrueHD Atmos'],
            ['upmix', 'AI 3D Upmix'],
            ['torrent', 'Torrent AVIO'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={stage === key}
            onClick={() => setStage(key)}
            className={`apple-bench-tab ${stage === key ? 'is-active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div key={stage} className="apple-bench-body tab-panel-in">
        <div className="apple-bench-title">
          <span
            className="apple-bench-icon"
            style={{ background: `${accentHex}1f`, color: '#b47218' }}
          >
            <Icon size={18} />
          </span>
          <h3>{current.title}</h3>
        </div>

        <p className="apple-bench-note">{current.note}</p>

        <div className="apple-bench-bars">
          {current.bars.map((bar) => (
            <div key={bar.label} className="apple-bench-row">
              <div className="apple-bench-row-meta">
                <span>{bar.label}</span>
                <strong>{bar.val}</strong>
              </div>
              <div className="apple-bench-track">
                <div
                  className="apple-bench-fill"
                  style={{
                    width: `${bar.pct}%`,
                    background: bar.active
                      ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                      : '#cbd5e1',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const KrakenVectorMark: React.FC = () => (
  <svg viewBox="0 0 64 64" className="kraken-svg-mark" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="krakenBg" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0f2933" />
        <stop offset="1" stopColor="#09151c" />
      </linearGradient>
      <linearGradient id="krakenStroke" x1="14" y1="16" x2="50" y2="54" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34d399" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="15" fill="url(#krakenBg)" />
    <rect x="3" y="3" width="58" height="58" rx="14" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1.5" />
    <circle cx="32" cy="27" r="11" stroke="#34D399" strokeWidth="2.5" />
    <path
      d="M22 36C20 42 16 46 14 48M27 38C26 44 25 48 23 51M37 38C38 44 39 48 41 51M42 36C44 42 48 46 50 48M32 39V52"
      stroke="url(#krakenStroke)"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <circle cx="28" cy="26" r="2.1" fill="#F8FAFC" />
    <circle cx="36" cy="26" r="2.1" fill="#F8FAFC" />
  </svg>
);

export const FoveaVectorMark: React.FC = () => (
  <svg viewBox="0 0 64 64" className="kraken-svg-mark" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="foveaBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#161436" />
        <stop offset="1" stopColor="#0a1226" />
      </linearGradient>
      <linearGradient id="foveaIris" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="1" stopColor="#818cf8" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="15" fill="url(#foveaBg)" />
    <rect x="3" y="3" width="58" height="58" rx="14" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1.5" />
    <path
      d="M11 32C16.5 22.5 23.6 18 32 18C40.4 18 47.5 22.5 53 32C47.5 41.5 40.4 46 32 46C23.6 46 16.5 41.5 11 32Z"
      stroke="url(#foveaIris)"
      strokeWidth="2.4"
    />
    <circle cx="32" cy="32" r="9.5" stroke="#38bdf8" strokeWidth="2.2" />
    <circle cx="32" cy="32" r="4" fill="#e0f2fe" />
    <path d="M32 12V16M32 48V52M12 32H16M48 32H52" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const FoveaArchitectureWidget: React.FC<{ accentHex: string }> = ({
  accentHex,
}) => {
  const [stage, setStage] = useState<'ane' | 'geom' | 'cursor' | 'gestures'>('ane');

  const stages = {
    ane: {
      title: 'Core ML ANE + Metal GPU (M4 Max)',
      icon: Eye,
      note: '100% локальный Swift 6 пайплайн без Python: детекция 478 точек лица, zero-copy нормализация на Metal и три модели взгляда на Neural Engine.',
      bars: [
        { label: 'Metal Normalizer / ROI Crop', val: '0.23 мс', pct: 96, active: true },
        { label: 'FaceLandmarker 478-pt (ANE)', val: '0.56 мс', pct: 90, active: true },
        { label: 'MobileOne-S0 Gaze (ANE)', val: '0.86 мс', pct: 84, active: true },
        { label: 'UniGaze-B16 Research (ANE)', val: '4.27 мс', pct: 52, active: false },
      ],
    },
    geom: {
      title: '3D-инвариантность к позе головы',
      icon: Compass,
      note: '6DoF EPnP+LM+ESKF, метрический масштаб по диаметру радужки (11.7 мм), нормализация Zhang 2018 и живой датчик угла крышки MacBook (LidAngleSensor).',
      bars: [
        { label: 'Медианная точность (3.1–3.2)', val: '0.31°', pct: 95, active: true },
        { label: 'Сдвиг при повороте yaw ±30°', val: '0.20°', pct: 92, active: true },
        { label: 'Частота вывода ProMotion', val: '60–120 Гц', pct: 100, active: true },
      ],
    },
    cursor: {
      title: 'Управление курсором и безопасный стоп',
      icon: MousePointer2,
      note: 'Режим MAGIC мгновенно подводит курсор при движении руки, Absolute привязывается к кнопкам через AXUIElement, а Precision Zoom ×4 помогает целиться в мелкие элементы.',
      bars: [
        { label: 'MAGIC Cursor Teleport', val: 'Zero-effort', pct: 94, active: true },
        { label: 'AXUIElement Magnetic Snap', val: 'Native macOS', pct: 88, active: true },
        { label: 'Глобальный аварийный стоп', val: '⌃⌥⌘G', pct: 100, active: false },
      ],
    },
    gestures: {
      title: '4-слойный движок жестов веками и музыка',
      icon: Music,
      note: 'Отличает осознанные подмигивания и двойные моргания от речи, улыбки и усталости (sleep-cap >1.2 с) и управляет системными медиа-клавишами в Music Control Mode.',
      bars: [
        { label: '1-часовой стресс-тест', val: '0.00 ложных/ч', pct: 100, active: true },
        { label: 'Подавление речи и улыбки', val: '52 Blendshapes', pct: 92, active: true },
        { label: 'Локальный IPC для скриптов', val: 'WebSocket + Unix', pct: 80, active: false },
      ],
    },
  };

  const current = stages[stage];
  const Icon = current.icon;

  return (
    <div className="apple-bench-card">
      <div className="apple-bench-tabs" role="tablist" aria-label="Модули Fovea">
        {(
          [
            ['ane', 'Core ML ANE'],
            ['geom', '3D Геометрия'],
            ['cursor', 'Курсор MAGIC'],
            ['gestures', 'Жесты и музыка'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={stage === key}
            onClick={() => setStage(key)}
            className={`apple-bench-tab ${stage === key ? 'is-active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div key={stage} className="apple-bench-body tab-panel-in">
        <div className="apple-bench-title">
          <span
            className="apple-bench-icon"
            style={{ background: `${accentHex}22`, color: '#4f46e5' }}
          >
            <Icon size={18} />
          </span>
          <h3>{current.title}</h3>
        </div>

        <p className="apple-bench-note">{current.note}</p>

        <div className="apple-bench-bars">
          {current.bars.map((bar) => (
            <div key={bar.label} className="apple-bench-row">
              <div className="apple-bench-row-meta">
                <span>{bar.label}</span>
                <strong>{bar.val}</strong>
              </div>
              <div className="apple-bench-track">
                <div
                  className="apple-bench-fill"
                  style={{
                    width: `${bar.pct}%`,
                    background: bar.active
                      ? 'linear-gradient(90deg, #38bdf8, #6366f1)'
                      : '#cbd5e1',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
