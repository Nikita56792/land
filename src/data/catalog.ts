export type SectionTab = 'games' | 'apps';

export interface MirrorLinks {
  serverPath: string;
  serverFileName: string;
  sizeLabel: string;
  githubReleaseUrl: string | null;
  githubReleaseTag?: string;
  githubRepoUrl: string | null;
  itchUrl?: string | null;
}

export interface GamePort {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  statusTone: 'ready' | 'playable' | 'wip';
  engineStack: string;
  dualScreenMode: string;
  tvRole: string;
  gamepadRole: string;
  fpsTarget: string;
  installPath: string;
  videoUrl: string;
  accentHex: string;
  summary: string;
  highlights: string[];
  telemetry: { label: string; value: string }[];
  notice?: string;
  mirrors: MirrorLinks;
}

export interface PlatformPackage {
  arch: 'x64' | 'arm';
  label: string;
  sizeLabel: string;
  url: string | null;
  fileName?: string;
}

export interface PlatformDownloads {
  macosArm64?: PlatformPackage;
  macosX64?: PlatformPackage;
  windowsX64?: PlatformPackage;
  windowsArm64?: PlatformPackage;
  linuxX64?: PlatformPackage;
  linuxArm64?: PlatformPackage;
}

export interface MacApp {
  id: string;
  name: string;
  previousName?: string;
  version: string;
  releaseDate?: string;
  tagline: string;
  platform: string;
  license: string;
  iconUrl: string;
  accentHex: string;
  description: string;
  architectureNote: string;
  specs: { label: string; value: string }[];
  highlights: string[];
  screenshots?: { src: string; caption: string }[];
  mirrors: MirrorLinks;
  platforms?: PlatformDownloads;
}

export const STUDIO_INFO = {
  brand: 'REAL // LAB',
  handle: 'Nikita56792',
  githubProfileUrl: 'https://github.com/Nikita56792',
  landingRepoUrl: 'https://github.com/Nikita56792/land',
  contactEmail: 'hello@reallab.dev',
  locationNote: 'Независимые инженерные релизы · Открытый исходный код',
};

export const DONATE_METHODS = {
  ru: [
    {
      name: 'Альфа-Банк (СБП / Перевод)',
      detail: 'Реквизиты и прямая ссылка на перевод — по запросу на почту',
      actionLabel: 'Связаться',
      href: 'mailto:hello@reallab.dev?subject=Support%20(Alfa)',
      valueToCopy: '',
    },
    {
      name: 'ЮMoney (YooMoney)',
      detail: 'Перевод на кофе и оплату нейросетей',
      actionLabel: 'Написать',
      href: 'mailto:hello@reallab.dev?subject=Support%20(YooMoney)',
      valueToCopy: '',
    },
  ],
  intl: [
    {
      name: 'GitHub / Direct Contact',
      detail: 'Прямой контакт через профиль GitHub или почту',
      actionLabel: 'GitHub @Nikita56792',
      href: 'https://github.com/Nikita56792',
      valueToCopy: 'hello@reallab.dev',
    },
  ],
};

export const WIIU_PORTS: GamePort[] = [
  {
    id: 'minecraft-dualscreen',
    slug: 'minecraft',
    title: 'Minecraft: Wii U Edition',
    subtitle: 'DualScreen Co-op Edition (TV + GamePad)',
    badge: 'Готовый .wuhb релиз',
    statusTone: 'ready',
    engineStack: 'C++ Decompilation · RedHills · Cafe OS GX2',
    dualScreenMode: 'Игрок 1 (TV 1080p) + Игрок 2 (GamePad DRC)',
    tvRole: 'Полноэкранный вид Игрока 1 без деления экрана (Full 16:9)',
    gamepadRole: 'Независимый вид Игрока 2 + сенсорный крафт/инвентарь + отдельный звук',
    fpsTarget: '60 FPS · Aroma .wuhb',
    installPath: 'sd:/wiiu/apps/Minecraft.WiiU-DualScreenUI.wuhb',
    videoUrl: './media/games/minecraft-dualscreen.mp4',
    accentHex: '#34D399',
    summary:
      'Локальный кооператив для двух игроков на одной Wii U без split-screen: первый игрок играет на полном экране телевизора, второй — на собственном экране Wii U GamePad с сенсорным интерфейсом DualScreenUI и раздельным выводом аудио.',
    highlights: [
      'Два независимых полных экрана вместо тесного деления картинки пополам',
      'Раздельное аудио: звук мира P1 на ТВ, звук P2 — в динамиках или наушниках GamePad',
      'Сборка скомпилирована под Cafe OS / Aroma в одном самодостаточном файле .wuhb',
      'Прямое скачивание готового .wuhb с GitHub Releases и локальной копии сервера',
    ],
    telemetry: [
      { label: 'Формат', value: '.wuhb (Aroma)' },
      { label: 'Размер', value: '1.41 ГБ' },
      { label: 'Режим 2P', value: 'TV + GamePad (без split-screen)' },
      { label: 'Рендер', value: 'GX2 Dual Framebuffer' },
    ],
    mirrors: {
      serverPath: './downloads/Minecraft.WiiU-DualScreenUI.wuhb',
      serverFileName: 'Minecraft.WiiU-DualScreenUI.wuhb',
      sizeLabel: '1.41 ГБ',
      githubReleaseUrl:
        'https://github.com/Nikita56792/land/releases/download/mcwiiu-dualscreen-v1.0/Minecraft.WiiU-DualScreenUI.wuhb',
      githubReleaseTag: 'mcwiiu-dualscreen-v1.0',
      githubRepoUrl: 'https://github.com/Nikita56792/land/releases/tag/mcwiiu-dualscreen-v1.0',
    },
  },
  {
    id: 'buckshot-roulette',
    slug: 'buckshot',
    title: 'Buckshot Roulette',
    subtitle: 'Wii U Native Port + Dual-Screen Local 1v1',
    badge: 'Высокое качество · 1v1 на 2 экранах',
    statusTone: 'ready',
    engineStack: 'Godot GDScript → PowerPC + Wii U GX2',
    dualScreenMode: 'Локальный 1v1: Игрок 1 (TV) ↔ Игрок 2 (GamePad)',
    tvRole: 'Камера Игрока 1 за столом · осмотр дробовика и патронов',
    gamepadRole: 'Закрытый экран Игрока 2 · предметы на тачскрине без подглядывания',
    fpsTarget: 'Стабильно 60 FPS на Wii U',
    installPath: 'sd:/wiiu/apps/BuckshotRoulette.wuhb',
    videoUrl: './media/games/buckshot-roulette.mp4',
    accentHex: '#F87171',
    summary:
      'Порт высокого качества с нативной производительностью и уникальным локальным мультиплеером на одной консоли: Игрок 1 играет на телевизоре, Игрок 2 — на Wii U GamePad с раздельными ракурсами и скрытой информацией.',
    highlights: [
      'Прямая трансляция логики GDScript в нативный код PowerPC с рендером через GX2',
      'Асимметричный локальный PvP на одной консоли без второго телевизора',
      'Адаптированное управление: стики/триггеры + сенсорный выбор предметов на GamePad',
    ],
    telemetry: [
      { label: 'Статус', value: 'Готовый порт' },
      { label: 'Пайплайн', value: 'GD → Wii U GX2 / PPC' },
      { label: 'Мультиплеер', value: 'TV (P1) + GamePad (P2)' },
      { label: 'Публикация', value: 'Релиз готовится к заливке' },
    ],
    mirrors: {
      serverPath: './downloads/BuckshotRoulette-WiiU.wuhb',
      serverFileName: 'BuckshotRoulette-WiiU.wuhb',
      sizeLabel: '.wuhb (скоро)',
      githubReleaseUrl: null,
      githubRepoUrl: null,
    },
  },
  {
    id: 'slime-rancher',
    slug: 'slime',
    title: 'Slime Rancher',
    subtitle: 'Wii U Cafe OS Port (Unity → RPX)',
    badge: 'Играбельный порт',
    statusTone: 'playable',
    engineStack: 'Unity → Cafe OS RPX / GX2 Translator',
    dualScreenMode: 'TV Основной мир + GamePad карта / Слаймапедия',
    tvRole: 'Игровой мир Far, Far Range + HUD вакпака',
    gamepadRole: 'Сенсорная карта ранчо, слаймапедия и режим Off-TV Play',
    fpsTarget: 'Играбельно (возможны отдельные баги)',
    installPath: 'sd:/wiiu/apps/SlimeRancher.wuhb',
    videoUrl: './media/games/slime-rancher.mp4',
    accentHex: '#FB7185',
    summary:
      'Играбельный порт Slime Rancher под архитектуру Wii U на базе транслятора Unity → RPX. Собраны основные локации ранчо, физика слаймов и вакпак; местами встречаются графические и физические шероховатости.',
    highlights: [
      'Трансляция Unity-сцены и ассетов в нативный исполняемый формат Cafe OS (.rpx)',
      'Вынесенный инвентарь и карта на экран Wii U GamePad + поддержка Off-TV',
      'Пост-релизная форма обратной связи для правообладателей и патчей',
    ],
    telemetry: [
      { label: 'Статус', value: 'Рабочий · возможны баги' },
      { label: 'Трансляция', value: 'Unity → Cafe OS RPX' },
      { label: 'Стек GPU', value: 'GX2 Shaders' },
      { label: 'Публикация', value: 'Релиз готовится к заливке' },
    ],
    mirrors: {
      serverPath: './downloads/SlimeRancher-WiiU.wuhb',
      serverFileName: 'SlimeRancher-WiiU.wuhb',
      sizeLabel: '.wuhb (скоро)',
      githubReleaseUrl: null,
      githubRepoUrl: null,
    },
  },
  {
    id: 'subnautica',
    slug: 'subnautica',
    title: 'Subnautica',
    subtitle: 'R&D Adapter Port (Cemu / Wii U Hardware)',
    badge: 'В разработке · R&D',
    statusTone: 'wip',
    engineStack: 'Unity → PowerPC / GX2 Adapter',
    dualScreenMode: 'TV Подводный мир + GamePad КПК (PDA) / Сонар',
    tvRole: 'Океан, капсула, глубиномер и биомы планеты 4546B',
    gamepadRole: 'Терминал PDA: чертежи, сканер и сонар в реальном времени',
    fpsTarget: 'Cemu 24–30 FPS · Wii U консоль ~10 FPS',
    installPath: 'sd:/wiiu/apps/Subnautica-Adapter/',
    videoUrl: './media/games/subnautica.mp4',
    accentHex: '#38BDF8',
    summary:
      'Экспериментальный порт-адаптер Subnautica: на эмуляторе Cemu проект стабильно держит 24–30 FPS; на реальной консоли Wii U работают меню и звук, но в открытом мире около ~10 FPS и часть шейдеров воды ещё переносится.',
    highlights: [
      'Cemu: 24–30 FPS с рабочим перемещением, базовым освещением и интерфейсом',
      'Реальная Wii U: загружаются меню и звук, в 3D-мире ~10 FPS (оптимизация памяти MEM2)',
      'Рассматривается выпуск в формате чистого адаптера под легальную копию ПК-игры',
    ],
    telemetry: [
      { label: 'Cemu', value: '24–30 FPS' },
      { label: 'Wii U железо', value: 'Меню/звук OK · мир ~10 FPS' },
      { label: 'Формат', value: 'Адаптер / Unity → RPX' },
      { label: 'Статус', value: 'Активная доработка' },
    ],
    notice: 'Промежуточная сборка R&D: требуется оптимизация потоковой подгрузки чанков под 2 ГБ RAM Wii U.',
    mirrors: {
      serverPath: './downloads/Subnautica-WiiU-Adapter.zip',
      serverFileName: 'Subnautica-WiiU-Adapter.zip',
      sizeLabel: 'Adapter (в работе)',
      githubReleaseUrl: null,
      githubRepoUrl: null,
    },
  },
];

export const PORTING_PIPELINE = [
  {
    code: 'GD → PPC/GX2',
    title: 'Транслятор Godot → Wii U',
    detail: 'Статическая трансляция сцен и скриптов GDScript в C++ под PowerPC 750CL с прямым рендером на GX2.',
  },
  {
    code: 'UNITY → RPX',
    title: 'Транслятор Unity → Cafe OS',
    detail: 'Подмена графического бэкенда и перенос управляемой логики в нативные модули .rpx / .wuhb для Aroma.',
  },
  {
    code: 'SD LAUNCHER',
    title: 'Кроссплатформенный установщик (Win / Mac / Linux)',
    detail: 'В планах: единая утилита, которая скачивает актуальные сборки и раскладывает файлы сразу на SD-карту в sd:/wiiu/apps/.',
  },
];

export const MAC_APPS: MacApp[] = [
  {
    id: 'epidaurus',
    name: 'Epidaurus',
    previousName: 'ex-RealPlayer',
    version: 'v0.2.0',
    tagline: 'Нативный медиаплеер для Apple Silicon: VVC/H.266, HDR/Dolby Vision, объектный Dolby Atmos и прямой стриминг торрентов',
    platform: 'macOS 15+ · Apple Silicon',
    license: 'GPL-3.0-or-later',
    iconUrl: './media/apps/epidaurus-icon.png',
    accentHex: '#E2A856',
    description:
      'Медиаядро на Rust поверх FFmpeg 9 с нативным интерфейсом на SwiftUI/AppKit. Спроектирован для тяжёлых 4K/8K-ремуксов без задержек, с аппаратным VideoToolbox, многопоточным Fraunhofer VVdeC (H.266) и точной аудиосинхронизацией по часам вывода.',
    architectureNote:
      'Rust crates (demux · videodec · audiodec · truehd · libtorrent 2.1) → C ABI (ffi/realplayer.h) → AVSampleBufferDisplayLayer + AVAudioEngine',
    specs: [
      { label: 'VVC / H.266 4K10', value: '302 FPS (VVdeC NEON vs 62 FPS FFmpeg)' },
      { label: 'Dolby Atmos TrueHD', value: '16-канал. OAMD объекты → Apple HRTF / 7.1.4' },
      { label: 'AI 3D Upmix', value: 'HTDemucs 6 стемов (~7× RT) + 3D DSP без моделей' },
      { label: 'Торрент-стриминг', value: 'Прямой AVIOContext через libtorrent 2.1.2' },
    ],
    highlights: [
      'Аппаратное декодирование H.264, HEVC 10-bit, AV1, ProRes + ProMotion VRR (23.976 → 119.88 Гц)',
      'Вывод HDR10, HDR10+, HLG и Dolby Vision (профили 8.x/7) с полными метаданными в EDR',
      'Потоковый просмотр magnet-ссылок и .torrent с перемоткой без ожидания полной загрузки',
      'Оптимизированные профили АЧХ (AutoEQ Harman) для Sony WH-1000XM6 (Bluetooth и кабель)',
    ],
    mirrors: {
      serverPath: './downloads/Epidaurus-0.2.0.dmg',
      serverFileName: 'Epidaurus-0.2.0.dmg',
      sizeLabel: '31 МБ (.dmg)',
      githubReleaseUrl: 'https://github.com/Nikita56792/epidaurus/releases/download/v0.2.0/Epidaurus-0.2.0.dmg',
      githubReleaseTag: 'v0.2.0',
      githubRepoUrl: 'https://github.com/Nikita56792/epidaurus',
    },
  },
  {
    id: 'kraken',
    name: 'Kraken',
    previousName: 'KrakenFS / Kraken Disk',
    version: 'v0.4.0',
    tagline: 'Прозрачное сжатие и BLAKE3-дедупликация на Mac (~2.1×–4.0× экономии SSD) на скорости чтения до 14–20 ГБ/с',
    platform: 'macOS · Apple Silicon',
    license: 'Open Source',
    iconUrl: '',
    accentHex: '#34D399',
    description:
      'Виртуальный том «Kraken Disk» в Finder на базе NFSv3-loopback (без необходимости отключать SIP) и оптимизатор APFS (Tier 1) с побайтовой проверкой ядром. На больших сжимаемых файлах скорость чтения выше физического SSD благодаря распаковке в памяти.',
    architectureNote:
      'Горячий слой записи → фоновый sealer (CDC + LZ4/Zstd + BLAKE3) → read/write NFSv3 loopback или ускоренный режим с kext',
    specs: [
      { label: 'Экономия места', value: '2.1× – 4.09× (Office/IDE/игры)' },
      { label: 'Чтение (Tier 1/2)', value: '14 – 20 ГБ/с (при SSD 5.5 ГБ/с)' },
      { label: 'Монтирование', value: 'NFSv3 loopback (без kext) + опция kext при SIP off' },
      { label: 'Инструменты UI', value: 'Карта диска (Sunburst) + Free Up Space' },
    ],
    highlights: [
      'Обычный диск в Finder: перетаскивайте программы, ассеты и игры — сжатие происходит за 0.1–1 с в фоне',
      '«Free Up Space…» сканирует весь Mac, оценивает коэффициент сжатия и переносит папки с симлинками',
      'Проверенный rollback и целостность: mmap, exec и codesign --deep --strict проходят на томе без ошибок',
      'Отдельный режим Tier 3 с собственным kext (при снятом блоке SIP) для максимальной скорости мелких файлов',
    ],
    screenshots: [
      { src: './media/apps/kraken-disk-map.png', caption: 'Sunburst карта тома и экономии места' },
      { src: './media/apps/kraken-free-up-space.png', caption: 'Free Up Space — поиск кандидатов по всему Mac' },
      { src: './media/apps/kraken-statistics.png', caption: 'Статистика сжатия, дедупликации и проверки BLAKE3' },
      { src: './media/apps/kraken-menu.png', caption: 'Виджет в строке меню macOS' },
    ],
    mirrors: {
      serverPath: './downloads/Kraken-0.4.0.pkg',
      serverFileName: 'Kraken-0.4.0.pkg',
      sizeLabel: '8.8 МБ (.pkg)',
      githubReleaseUrl: 'https://github.com/Nikita56792/kraken/releases/download/v0.4.0/Kraken-0.4.0.pkg',
      githubReleaseTag: 'v0.4.0',
      githubRepoUrl: 'https://github.com/Nikita56792/kraken',
    },
  },
  {
    id: 'real3d',
    name: 'Real3D',
    version: 'v1.2.0',
    tagline: 'Преобразование любого 2D-экрана, игры или фильма в реальное стерео 3D (Full SBS 3840×1080 @ 60 FPS) для XREAL',
    platform: 'macOS 14+ · Apple Silicon',
    license: 'Open Source',
    iconUrl: './media/apps/real3d-icon.png',
    accentHex: '#22D3EE',
    description:
      'Захват дисплея или окна через ScreenCaptureKit без копий в памяти (IOSurface), предсказание глубины моделями Depth Anything V2 / V3 в Core ML и синтез стереопары на Metal (1.9 мс/кадр). В геометрии вроде Minecraft работает практически неотличимо от нативного 3D.',
    architectureNote:
      'ScreenCaptureKit (IOSurface) → MetalFX Crop → Core ML DAv2 Split (GPU enc ∥ ANE head @ 60 FPS) → Joint-Bilateral + Scanline DIBR → 3840×1080',
    specs: [
      { label: 'Частота кадров', value: '60.0 FPS (Split GPU ∥ ANE pipeline)' },
      { label: 'Metal DIBR', value: '~1.9 мс на кадр (Full SBS 3840×1080)' },
      { label: 'Real Scale режим', value: 'Ортостерео d = IPD/p · (D/Z − 1) + DA3 калибратор' },
      { label: 'Целевые очки', value: 'XREAL One / Air (Full SBS & Half SBS)' },
    ],
    highlights: [
      'Split-пайплайн DAv2 Quality (812×462): энкодер на GPU параллельно с головой DPT на Neural Engine',
      'Ортостерео «Real scale (metric)» с калибратором DA3-Metric-Large убирает эффект кукольного макета',
      'Свободный кроп любого соотношения сторон, анаглиф-превью без очков и выбор 16:9 letterbox на плоскости экрана',
      'Чистое воспроизведение геометрии в играх (особенно Minecraft), фильмах и 3D-приложениях',
    ],
    screenshots: [
      { src: './media/apps/real3d-compare-1.png', caption: 'Core ML DepthAnything V3 Small — карта глубины' },
      { src: './media/apps/real3d-compare-2.png', caption: 'Метрическая калибровка глубины помещения (Real Scale)' },
    ],
    mirrors: {
      serverPath: './downloads/Real3D-1.2.0.dmg',
      serverFileName: 'Real3D-1.2.0.dmg',
      sizeLabel: '857 МБ (.dmg)',
      githubReleaseUrl: 'https://github.com/Nikita56792/real3d/releases/download/v1.2.0/Real3D-1.2.0.dmg',
      githubReleaseTag: 'v1.2.0',
      githubRepoUrl: 'https://github.com/Nikita56792/real3d',
    },
  },
  {
    id: 'fovea',
    name: 'Fovea',
    previousName: 'Fovea Eye Tracker',
    version: 'v1.0.0',
    releaseDate: '2026-11-22',
    tagline:
      'Нативный 3D eye tracking для macOS на обычной камере: 60–120 Гц ProMotion, инвариантность к позе головы, жесты веками и управление музыкой',
    platform: 'macOS 14+ · Apple Silicon',
    license: 'Open Source',
    iconUrl: '',
    accentHex: '#818CF8',
    description:
      'Нативное приложение на Swift 6, Core ML (Apple Neural Engine) и Metal GPU без Python в рантайме, определяющее точку взгляда по обычной веб-камере без ИК-подсветки. Полноценная 3D-геометрия (6DoF EPnP+LM+ESKF, масштаб по радужке 11.7 мм, нормализация Zhang 2018) и живой датчик угла крышки MacBook (LidAngleSensor) позволяют работать из коробки в режиме Zero-Calibration на 100% локально.',
    architectureNote:
      'AVCapture (30–120 fps) → Core ML ANE (BlazeFace + 478-pt FaceLandmarker + 52 Blendshapes) → 6DoF EPnP/ESKF + Iris 11.7 мм → MetalNormalizer (0.23 мс) → GazeNet (MobileOne-S0 / UniGaze-B16 + 3D Iris) → Ray→Screen + Kalman/1€ (60–120 Гц) → Cursor / Gestures / IPC',
    specs: [
      { label: 'Core ML ANE (M4 Max)', value: 'Landmarker 0.56 мс · MobileOne-S0 0.86 мс · UniGaze 4.27 мс' },
      { label: 'Metal GPU варп', value: '0.23 мс нормализация / 0.20 мс ROI-кроп (zero-copy)' },
      { label: 'Частота вывода', value: '60–120 Гц ProMotion (HighRatePredictor + 30–120 fps камера)' },
      { label: '3D-инвариантность', value: '0.31° медиана · сдвиг 0.20° при yaw ±30°' },
    ],
    highlights: [
      'Zero-Calibration из коробки: автоопределение модели Mac (hw.model), высоты выреза и живой датчик угла крышки MacBook (LidAngleSensor, без sudo) + персональная калибровка 18 / 45 / 70 с',
      'Трёхдвижковая оценка взгляда на ANE: MobileOne-S0 Gaze (MIT, 90 бинов + σ), research-движок UniGaze-B16 и геометрический 3D-луч радужки (>300 FPS)',
      'Режимы курсора MAGIC (телепортация при движении руки), Absolute с привязкой к AXUIElement, Precision Zoom ×4, Dwell-клик и глобальный стоп ⌃⌥⌘G',
      '4-слойный анти-ложный движок жестов веками (0.00 ложных/ч в 1-ч стресс-тесте, sleep-cap >1.2 с) и Music Control Mode для системных медиа-клавиш macOS',
    ],
    mirrors: {
      serverPath: './downloads/Fovea-1.0.0.dmg',
      serverFileName: 'Fovea-1.0.0.dmg',
      sizeLabel: '164 МБ (.dmg)',
      githubReleaseUrl: 'https://github.com/Nikita56792/fovea/releases/download/v1.0.0/Fovea-1.0.0.dmg',
      githubReleaseTag: 'v1.0.0',
      githubRepoUrl: 'https://github.com/Nikita56792/fovea',
    },
  },
];
