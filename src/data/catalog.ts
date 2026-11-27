export type SectionTab = 'games' | 'apps';

export interface ReleasePackage {
  id: string;
  formatLabel: string;
  shortTag: string;
  fileName: string;
  sizeLabel: string;
  installPath?: string;
  installLabel?: string;
  primary?: boolean;
}

export interface MirrorLinks {
  serverPath: string;
  serverFileName: string;
  cloudFileName?: string;
  sizeLabel: string;
  packages?: ReleasePackage[];
  releaseTag?: string;
  githubRepoUrl: string | null;
}

export interface TechSolution {
  tag: string;
  title: string;
  detail: string;
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
  secondaryInstallPath?: string;
  secondaryInstallLabel?: string;
  videoUrl: string;
  accentHex: string;
  summary: string;
  highlights: string[];
  techSolutions: TechSolution[];
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
  brand: 'Parhelio',
  domain: 'parhelio.ru',
  handle: 'Nikita56792',
  githubProfileUrl: 'https://github.com/Nikita56792',
  landingRepoUrl: 'https://github.com/Nikita56792/land',
  contactEmail: 'hello@parhelio.ru',
  locationNote: 'Parhelio · Независимые порты для Wii U и софт для Mac',
};

export const DONATE_METHODS = {
  ru: [
    {
      name: 'ЮMoney (YooMoney)',
      detail: 'Добровольная поддержка из России — на кофе, серверы и нейросети',
      actionLabel: 'Написать',
      href: 'mailto:hello@parhelio.ru?subject=Support%20Parhelio%20(YooMoney)',
      valueToCopy: '',
    },
    {
      name: 'СБП / Перевод по РФ',
      detail: 'Прямая ссылка на перевод — по запросу на почту',
      actionLabel: 'Связаться',
      href: 'mailto:hello@parhelio.ru?subject=Support%20Parhelio%20(SBP)',
      valueToCopy: '',
    },
  ],
  intl: [
    {
      name: 'GitHub / Direct Contact',
      detail: 'Международная поддержка и связь через GitHub или почту',
      actionLabel: 'GitHub @Nikita56792',
      href: 'https://github.com/Nikita56792',
      valueToCopy: 'hello@parhelio.ru',
    },
  ],
};

export const WIIU_PORTS: GamePort[] = [
  {
    id: 'minecraft-dualscreen',
    slug: 'minecraft',
    title: 'Minecraft: Wii U Edition',
    subtitle: 'DualScreen Co-op · RedHills C++ · 1080p AMD CAS',
    badge: 'Релиз v688 · .wuhb + WUP',
    statusTone: 'ready',
    engineStack: 'C++ Decomp (RedHills Clang 19) · WUT · GX2 + AMD CAS',
    dualScreenMode: 'Игрок 1 (TV 1080p CAS) + Игрок 2 (GamePad DRC 854×480)',
    tvRole: 'Полноэкранный вид Игрока 1 (720p→1080p AMD FidelityFX CAS)',
    gamepadRole: 'Независимый вид Игрока 2 + масштабированный тач-UI + отдельный звук AX',
    fpsTarget: '60 FPS (vsync) · 20 TPS · .wuhb + WUP',
    installPath: 'sd:/wiiu/apps/Minecraft.WiiU.wuhb',
    secondaryInstallPath: 'sd:/install/Minecraft_WiiU/',
    secondaryInstallLabel: 'Путь для WUP Installer GX2',
    videoUrl: './media/games/minecraft-dualscreen.mp4',
    accentHex: '#34D399',
    summary:
      'Полная C++-реконструкция Minecraft: Wii U Edition (Update v688, 3 753 .cpp без исходного бинарника) с настоящим двухэкранным кооперативом без split-screen, апскейлом 720p→1080p AMD FidelityFX CAS, сенсорным DualScreenUI и аппаратно разделённым звуком.',
    highlights: [
      'Два независимых полных экрана (SeparateGamePad): TV 16:9 для P1 и GamePad 854×480 для P2 с собственными камерами и HUD',
      'Кастомный fused-шейдер AMD FidelityFX CAS (sharpness 0.38) + Gamma для вывода 1080p на TV и прямой сэмплинг 720p на DRC',
      'Аппаратно разделённый звук Miles/BinkA на Core 2 (AXInit, 128 голосов): два 3D-слушателя и два музыкальных потока (HDMI vs GamePad 3.5 мм)',
      'Два готовых формата на зеркалах Parhelio: автономный .wuhb для Aroma и полный WUP Installer (Title ID 00050000101D7500 v688)',
    ],
    techSolutions: [
      {
        tag: 'REDHILLS C++ DECOMP',
        title: '9.38 МБ чистый RPX без оригинального кода',
        detail:
          '3 753 .cpp и 4 016 .hpp скомпилированы RedHills (Clang 19 с Green Hills C++ ABI) + LLVM 22 + WUT. 3-ядерный аффинити Espresso (CPU 0/1/2) и кастомная арена dlmalloc в MEM2.',
      },
      {
        tag: 'GX2 + AMD CAS 1080P',
        title: 'Dual Framebuffer в 22 МБ MEM1 + FidelityFX CAS',
        detail:
          'Алиасинг последовательных рендер-пасов в 22 МБ MEM1 при раздельном DRC-буфере (D24_S8 + HiZ). Fused pixel-шейдер GammaCASShader апскейлит 720p→1080p на TV без лишнего прохода.',
      },
      {
        tag: 'DUALSCREEN UI & TOUCH',
        title: 'Масштабирование меню P2 и тач-ремаппинг',
        detail:
          'GetGamePadSceneTransform увеличивает сундуки/зельеварение в 1.14× и инвентарь/верстак/печь в 1.35× на экране GamePad с точным пересчётом координат касаний VPAD.',
      },
      {
        tag: 'AX DSP · CORE 2',
        title: 'Два 3D-слушателя и раздельный вывод аудио',
        detail:
          'Реконструированный Miles + BinkA прибит к Core 2 (32 кГц, 128 голосов): флаги outputToDRC/separateOutputs и два потока музыки разводят звук P1 на ТВ и P2 в GamePad.',
      },
    ],
    telemetry: [
      { label: 'Версия / Title ID', value: 'Update v688 · 00050000101D7500' },
      { label: 'Форматы', value: 'Aroma .wuhb (1.41 ГБ) · WUP .zip (1.44 ГБ)' },
      { label: 'Режим 2P', value: 'TV 1080p CAS + GamePad 480p' },
      { label: 'Сохранения', value: 'nn::save · квота 51 МБ · до 99 миров' },
    ],
    mirrors: {
      serverPath: './downloads/Minecraft.WiiU.wuhb',
      serverFileName: 'Minecraft.WiiU.wuhb',
      cloudFileName: 'Minecraft.WiiU.wuhb',
      sizeLabel: '1.41 ГБ',
      releaseTag: 'v688',
      packages: [
        {
          id: 'mc-wuhb',
          formatLabel: 'Скачать .wuhb (Aroma)',
          shortTag: 'Aroma .wuhb',
          fileName: 'Minecraft.WiiU.wuhb',
          sizeLabel: '1.41 ГБ',
          installPath: 'sd:/wiiu/apps/Minecraft.WiiU.wuhb',
          primary: true,
        },
        {
          id: 'mc-wup',
          formatLabel: 'Скачать WUP Installer (.zip)',
          shortTag: 'WUP GX2',
          fileName: 'Minecraft_WiiU-WUP.zip',
          sizeLabel: '1.44 ГБ',
          installPath: 'sd:/install/Minecraft_WiiU/',
        },
      ],
      githubRepoUrl: null,
    },
  },
  {
    id: 'buckshot-roulette',
    slug: 'buckshot',
    title: 'Buckshot Roulette',
    subtitle: 'Build 116 (v44) · Нативный C++20/GX2 + локальный 1v1',
    badge: 'Релиз Build 116 · .wuhb + WUP',
    statusTone: 'ready',
    engineStack: 'GDScript → C++20 Coroutines · WUT GX2 · AX DSP',
    dualScreenMode: 'Локальный 1v1: Игрок 1 (TV 1080p CAS) ↔ Игрок 2 (GamePad DRC)',
    tvRole: 'Камера Игрока 1 (720p→1080p AMD CAS) + отдельный звук TVOnly',
    gamepadRole: 'Свой ракурс Игрока 2 (854×480) + тачскрин + личный звук DRCOnly',
    fpsTarget: '30 FPS lock · 28 нативных GX2-шейдеров',
    installPath: 'sd:/wiiu/apps/BuckshotRoulette.wuhb',
    secondaryInstallPath: 'sd:/install/BuckshotRoulette_WiiU/',
    secondaryInstallLabel: 'Путь для WUP Installer GX2',
    videoUrl: './media/games/buckshot-roulette.mp4',
    accentHex: '#F87171',
    summary:
      'Собственный нативный C++20 / PowerPC / WUT рантайм (без движка Godot на консоли): трансляция GDScript в C++20-корутины, 28 нативных GX2-шейдеров с AMD CAS 720p→1080p, аппаратный звук AX DSP с IMA-ADPCM и локальный 1v1 на двух экранах.',
    highlights: [
      'Собственный транслятор GDScript → C++20 с корутинами (co_task.h) и бинарными сценами .blayout / OBPK (game.rpx 4.17 МБ)',
      'Асимметричная дуэль 1v1 на одной консоли: раздельные камеры, FP/TP-видимость предметов, личные паузы и разведённый звук TVOnly/DRCOnly',
      'Нативное аудио AX DSP + 4-bit IMA-ADPCM сжало сборку с ~1.28 ГБ до 303–313 МБ со стримингом длинных треков на Core 2',
      'GamePad (антидребезг тачскрина 2.5 px), Pro Controller, Classic Controller, Wii Remote + IR-указатель (3.0 px), nn::swkbd и все 17 языков',
    ],
    techSolutions: [
      {
        tag: 'GD → C++20 RUNTIME',
        title: 'Без Godot на консоли: корутины и OBPK-пакеты',
        detail:
          'Скрипты SP и MP транслированы в C++20 (co_task.h для await, timer_queue, сигналы). Сцены, анимации и скелеты собраны в .blayout и пакеты OBPK; единый game.rpx весит 4.17 МБ.',
      },
      {
        tag: '28 GX2 SHADERS + CAS',
        title: 'CafeGLSL 1.0.0-rc1 · 720p→1080p AMD CAS',
        detail:
          '26 специализированных GFD-шейдеров освещения, постобработки vignette/posterize, процедурного неба финала и VHS-эффектов лобби. Tiled BC-текстуры грузятся строго вне render pass на Core 2.',
      },
      {
        tag: 'AX DSP + IMA-ADPCM',
        title: 'Сжатие аудио в 4× и раздельная маршрутизация',
        detail:
          'Нативный AXAudioEngine без SDL-микшера: 4-bit IMA-ADPCM (O(1) seek) уменьшил образ с 1.28 ГБ до ~303 МБ; маршрутизация TVOnly / DRCOnly / Both и стриминг >512 КБ на Core 2.',
      },
      {
        tag: 'PROCUI & INPUT',
        title: 'Все контроллеры Wii U, nn::swkbd и чистый выход',
        detail:
          'GamePad, Pro Controller, Classic и Wii Remote IR с антидребезгом и гистерезисом наведения; системная клавиатура nn::swkbd для имён в лобби, 17 языков и проверенный выход ProcUI в Wii U Menu.',
      },
    ],
    telemetry: [
      { label: 'Сборка / Title ID', value: 'Build 116 v44 · 000500001337B001' },
      { label: 'Форматы', value: 'Aroma .wuhb (303 МБ) · WUP .zip (313 МБ)' },
      { label: 'Графика', value: '720p→1080p AMD CAS · 30 FPS · 28 .gsh' },
      { label: 'Языки / Режим', value: '17 языков · SP + локальный 2P (без онлайна)' },
    ],
    notice:
      'Сетевой мультиплеер (Join Game) отключён — доступны полная одиночная кампания против Дилера и локальный 1v1 (TV + GamePad). Сохранения .wuhb пишутся в SD:/save/openbr/.',
    mirrors: {
      serverPath: './downloads/BuckshotRoulette.wuhb',
      serverFileName: 'BuckshotRoulette.wuhb',
      cloudFileName: 'BuckshotRoulette.wuhb',
      sizeLabel: '303 МБ',
      releaseTag: 'Build 116',
      packages: [
        {
          id: 'br-wuhb',
          formatLabel: 'Скачать .wuhb (Aroma)',
          shortTag: 'Aroma .wuhb',
          fileName: 'BuckshotRoulette.wuhb',
          sizeLabel: '303 МБ',
          installPath: 'sd:/wiiu/apps/BuckshotRoulette.wuhb',
          primary: true,
        },
        {
          id: 'br-wup',
          formatLabel: 'Скачать WUP Installer (.zip)',
          shortTag: 'WUP GX2',
          fileName: 'BuckshotRoulette_WiiU-WUP.zip',
          sizeLabel: '313 МБ',
          installPath: 'sd:/install/BuckshotRoulette_WiiU/',
        },
      ],
      githubRepoUrl: null,
    },
  },
  {
    id: 'slime-rancher',
    slug: 'slime',
    title: 'Slime Rancher',
    subtitle: 'v42 NoLog · Full-AOT Unity 5.6.5p4 · WUP Installer',
    badge: 'Релиз v42 · WUP (902 МБ)',
    statusTone: 'playable',
    engineStack: 'Unity 5.6.5p4 RPX · 100% Full-AOT · Core 2 SIMD RPL',
    dualScreenMode: 'TV Далёкое Запределье (DRS + CAS) + GamePad живая карта',
    tvRole: 'Мир ранчо 720p→576p DRS + Luma-only AMD CAS @ 30 FPS',
    gamepadRole: 'Независимая интерактивная карта MapUI (тач 1:1 без паузы игры)',
    fpsTarget: '30 FPS lock · ~28–30 FPS на ранчо · только WUP',
    installPath: 'sd:/install/SlimeRancher_WiiU_NoLog/',
    videoUrl: './media/games/slime-rancher.mp4',
    accentHex: '#FB7185',
    summary:
      'Порт PC Slime Rancher v1.2.2 на консольный Unity 5.6.5p4 (Unity-master.rpx) со 100% Full-AOT компиляцией (50 719 методов), собственным SIMD-плагином slime_wiiu.rpl на Core 2, 3 786 нативными GX2-шейдерами, WPVS-окклюзией и живой сенсорной картой на GamePad.',
    highlights: [
      '100% Full-AOT компиляция (50 719 / 50 719 методов) в 12 .rpl + нативный C/PPC плагин slime_wiiu.rpl с Paired Singles SIMD куллингом на Core 2',
      'Офлайн-батчинг мира (24 434 → 2 686 батчей, -70 436 лишних объектов), Float16 VBO + Tom Forsyth и Dual-Volume WPVS (12 742 ячеек, отсечение >32% батчей)',
      '2 821 PS + 965 VS скомпилированы под GX2, вырезаны GrabPass-сливы MEM1, восстановлен Early-Z/Hi-Z + Single-RT Luma-only AMD CAS (720p→648p→576p)',
      '100% аудио (583/583) в аппаратном GCADPCM (AX DSP 120 МГц, ~0% CPU) + патч вывода звука одновременно на TV и GamePad',
    ],
    techSolutions: [
      {
        tag: 'FULL-AOT + SIMD RPL',
        title: '50 719 методов AOT + Core 2 Paired Singles',
        detail:
          'IL-перезапись API Unity 2017.1→5.6.5p4 и компиляция всех 50 719 методов в .rpl. Плагин slime_wiiu_nolog.rpl (-DWIIU_NO_LOG) выполняет пространственный куллинг 512 акторов инструкциями psq_l/ps_madd/frsqrte.',
      },
      {
        tag: 'GX2 + WPVS + CAS',
        title: '3 786 шейдеров, -21 748 draw calls и PVS v2',
        detail:
          'Убраны все GrabPass и while(true) fBM-циклы, восстановлен Early-Z (KILL_ENABLE=0), собран WPVS на 12 742 ячеек, Float16 VBO и Single-RT Luma-only AMD CAS (пол 576p; меню в нативных 720p).',
      },
      {
        tag: 'AX DSP GCADPCM',
        title: '583/583 звуков аппаратно + патч на GamePad',
        detail:
          'Все клипы перекодированы в GCADPCM (FMOD_HARDWARE, 0% CPU); патч 1 инструкции в Unity-master.rpx включает одновременный вывод аппаратных голосов на TV и GamePad.',
      },
      {
        tag: 'GAMEPAD MAPUI & RAM',
        title: 'Сенсорная карта без паузы + укладка в 849 МБ',
        detail:
          'Карта на GamePad (рендер по требованию 3–15 Гц, ~0.05 мс GPU, тач изолирован от вакпака). Zero-GC, FastSyncLoad v42, Proxy-Vista farClip и безопасные сохранения /$SAVE.',
      },
    ],
    telemetry: [
      { label: 'Версия / Title ID', value: 'v42 NoLog · 0005000021000002' },
      { label: 'Формат', value: 'Только WUP Installer .zip (902 МБ)' },
      { label: 'Графика', value: 'DRS 720p→576p + Luma CAS · 30 FPS' },
      { label: 'Верификация', value: '23 .app · AES/TMD/H0–H3/FST PASS' },
    ],
    notice:
      'Доступно только в формате WUP Installer (без .wuhb — Unity RPX + 13 .rpl устанавливаются как полноценный тайтл). Распакуйте в sd:/install/SlimeRancher_WiiU_NoLog/ и установите через WUP Installer GX2 или NUSspli (нужен CFW с sigpatches). Тени, SSAO, Bloom и MSAA отключены ради 30 FPS.',
    mirrors: {
      serverPath: './downloads/SlimeRancher_WiiU_NoLog-WUP.zip',
      serverFileName: 'SlimeRancher_WiiU_NoLog-WUP.zip',
      cloudFileName: 'SlimeRancher_WiiU_NoLog-WUP.zip',
      sizeLabel: '902 МБ',
      releaseTag: 'v42-nolog',
      packages: [
        {
          id: 'sr-wup',
          formatLabel: 'Скачать WUP Installer (.zip)',
          shortTag: 'WUP GX2 (NoLog)',
          fileName: 'SlimeRancher_WiiU_NoLog-WUP.zip',
          sizeLabel: '902 МБ',
          installPath: 'sd:/install/SlimeRancher_WiiU_NoLog/',
          primary: true,
        },
      ],
      githubRepoUrl: null,
    },
  },
  {
    id: 'animal-crossing-nh',
    slug: 'acnh',
    title: 'Animal Crossing: New Horizons',
    subtitle: 'Static Recomp (Switch AArch64 → Wii U PPC32) · Wave 9',
    badge: 'Активная разработка · Wave 9',
    statusTone: 'wip',
    engineStack: 'AArch64 → C → PowerPC32 Recomp · WUT · NVN → GX2',
    dualScreenMode: 'TV 720p (DRS + Luma CAS) + GamePad Off-TV Play & Touch',
    tvRole: '3D-остров v1.0.0: 5-ступенчатый DRS 75–100% + AMD CAS + 720p UI',
    gamepadRole: 'Аппаратное зеркало Off-TV (854×480) + тачскрин 1280×720 + гироскоп',
    fpsTarget: 'Загрузка 57–60 · Аэропорт 15–21 · Остров 10–14 FPS (Cemu)',
    installPath: 'sd:/install/ACNH_WiiU_WUP/ (тестирование)',
    videoUrl: '',
    accentHex: '#1BB59B',
    summary:
      'Нативная статическая рекомпиляция оригинального кода Animal Crossing: New Horizons v1.0.0 с Nintendo Switch (AArch64 / NVN) в нативный PowerPC32 Big-Endian для Wii U Cafe OS: 149 716 рекомпилированных функций в 13 модулях, 4 299 шейдеров Maxwell→Latte GX2, 62 нативных C HLE и полный звук AX DSP.',
    highlights: [
      'Собственный статический рекомпилятор AArch64 → C → PPC32: 149 716 функций (acnh.rpx + 12 .rpl) и PGO-модуль acnh_hot_0.rpl (1.22 МБ целиком в 2 МБ L2 кэше Core 1)',
      '62 нативных C HLE (Tiers 1–5 с Espresso Paired Singles SIMD) + 20 перехватов fontll и AES-128: 10 378 / 10 378 дифференциальных тестов Unicorn (0 ULP) PASS',
      'Транслятор NVN → Latte GX2 на Core 0: 4 299 шейдеров (0 ошибок), MEM1 теневая карта 768×768 D16+HiZ, 5-ступенчатый 3D-only DRS + Luma AMD CAS и нативный 720p UI',
      'Полный audren:u/audout:u на sndcore2 AX DSP 48 кГц (TV + DRC), 66 793 файла RomFS перепакованы в быстрый WLZ4/BC1–5 (6.3 → 3.4 ГБ) и WUP 3.6 ГБ (AES/TMD PASS)',
    ],
    techSolutions: [
      {
        tag: 'AARCH64 → PPC32 RECOMP',
        title: '149 716 функций в 13 .rpl + 1.22 МБ горячий L2-блок',
        detail:
          'Прямая статическая рекомпиляция Switch v1.0.0 без эмуляции: 10/18 регистров PPC32 (-68.3% spills), 51 357 байпасов и PGO-упорядоченный acnh_hot_0.rpl (1 403 функции), полностью помещающийся в 2 МБ L2 Core 1.',
      },
      {
        tag: '62 NATIVE C HLE · 0 ULP',
        title: 'Tiers 1–5 + Espresso Paired Singles SIMD',
        detail:
          'Критические циклы g3d-скелетов, окклюзии, BCSV, ветра/листвы, LiSPSM и nn::vfx переписаны на нативный C + SIMD PPC750CL. Верифицировано 10 378 / 10 378 тестами Unicorn ARM64 vs C с точностью 0 ULP.',
      },
      {
        tag: 'NVN → LATTE GX2 + CAS',
        title: '4 299 шейдеров Maxwell→R600, MEM1 тени и 3D DRS',
        detail:
          'Асинхронная очередь GX2 на Core 0 (-90% GX2Invalidate), zero-copy UBO, теневая карта 768×768 D16+HiZ в MEM1, 5-ступенчатый DRS (432p–576p) + Luma AMD CAS до 720p и нативный 720p UI.',
      },
      {
        tag: 'ROMFS WLZ4 + AX DSP',
        title: 'Сжатие 6.3 → 3.4 ГБ, BC1–5 без GOB и живой звук',
        detail:
          '61 597 архивов перепакованы из Zstd/Yaz0 в WLZ4 (3–5× быстрее на Espresso), ASTC/BC7 переведены в нативный BC1–5, OpeningMovie — в H.264 720p30. Аудио audren:u работает на AX DSP 48 кГц + Off-TV Play и тачскрин.',
      },
    ],
    telemetry: [
      { label: 'Стадия / Title ID', value: 'Wave 9 · 0005000021AC0001 (WUP-P-ACNH)' },
      { label: 'Загрузка / Аэропорт', value: '57–60 FPS (загрузка) · 14.5–20.7 FPS (аэропорт)' },
      { label: '3D-остров (Cemu)', value: '10–14 FPS (пик 24.3) · MEM1 free · fb=0' },
      { label: 'Пакет WUP / Статус', value: '3.6 ГБ (AES/TMD PASS) · тестирование' },
    ],
    notice:
      'Идёт активная разработка и тестирование (Wave 9): оптимизируется однопоточный бюджет AcnhMain на 3D-острове и готовится калибровочный прогон WUP-пакета (3.6 ГБ) на физической Wii U. GamePad сейчас работает в режиме аппаратного Off-TV Play с тачскрином и гироскопом.',
    mirrors: {
      serverPath: './downloads/ACNH_WiiU_WUP.zip',
      serverFileName: 'ACNH_WiiU_WUP.zip',
      sizeLabel: 'Wave 9 (тестирование)',
      releaseTag: 'wave-9',
      githubRepoUrl: null,
    },
  },
  {
    id: 'subnautica',
    slug: 'subnautica',
    title: 'Subnautica',
    subtitle: 'R&D v18 · Full-AOT Unity 5.6 + Single-RT WBOIT + CAS',
    badge: 'В разработке · R&D v18',
    statusTone: 'wip',
    engineStack: 'Unity 5.6.5p4 RPX · Full-AOT (45 582) · WBOIT + CAS',
    dualScreenMode: 'TV Подводный мир (432p→720p CAS) + GamePad Alterra PDA',
    tvRole: 'Океан 4546B с Single-RT WBOIT и нативным 720p HUD',
    gamepadRole: 'Планируемый вынос КПК Alterra (PDA), чертежей и сонара',
    fpsTarget: 'Cemu 24–30 FPS · Wii U консоль ~10 FPS',
    installPath: 'sd:/install/Subnautica_WiiU/ (R&D)',
    videoUrl: './media/games/subnautica.mp4',
    accentHex: '#38BDF8',
    summary:
      'Экспериментальный порт-адаптер Subnautica (сборка v18, Title ID 0005000021000003): 100% Full-AOT (45 582 метода), 5 600 GX2-шейдеров, Single-RT WBOIT и апскейл 432p→720p AMD CAS. В Cemu держит 24–30 FPS; на реальной Wii U работают меню, звук и океан (~10 FPS, идёт оптимизация потоковой подгрузки).',
    highlights: [
      '100% Full-AOT компиляция (45 582 / 45 582 методов Assembly-CSharp) и 5 600 провалидированных GX2-шейдеров',
      'Single-RT WBOIT + 768×432→1280×720 AMD FidelityFX CAS (sharp=0.80) с нативным 720p UI и бюджетом RT 23–29 МБ внутри 32 МБ MEM1',
      'Стабильное потребление памяти 554–563 МБ + нативный fmodstudio.rpl (486 экспортов) на Core 2 и AX DSP',
      'Рассматривается выпуск в формате чистого адаптера поверх легальной ПК-копии (полный образ WUP весит 9.2 ГБ)',
    ],
    techSolutions: [
      {
        tag: 'FULL-AOT · 45 582',
        title: 'Полная AOT-сборка Unity 5.6.2 → 5.6.5p4',
        detail:
          'Все 45 582 метода Assembly-CSharp скомпилированы под PowerPC; стабильный профиль памяти 554–563 МБ в рамках ограничений Wii U MEM2.',
      },
      {
        tag: 'SINGLE-RT WBOIT + CAS',
        title: '5 600 шейдеров GX2 в бюджете 32 МБ MEM1',
        detail:
          'Прозрачность воды и стекла через Single-RT WBOIT, 3D-рендер 768×432 с AMD FidelityFX CAS (0.80) до 1280×720 и нативный чёткий 720p интерфейс (RT ~23–29 МБ).',
      },
      {
        tag: 'FMOD STUDIO RPL',
        title: 'Нативный fmodstudio.rpl на Core 2',
        detail:
          '486 экспортов FMOD Studio вынесены на Core 2 + аппаратный AX DSP, управление адаптировано под GamePad и Wii U Pro Controller.',
      },
    ],
    telemetry: [
      { label: 'Сборка / Title ID', value: 'v18 R&D · 0005000021000003' },
      { label: 'Cemu / Wii U', value: 'Cemu 24–30 FPS · Wii U ~10 FPS' },
      { label: 'Шейдеры / Память', value: '5 600 GX2 · Alloc 554–563 МБ' },
      { label: 'Размер / Статус', value: '9.2 ГБ WUP · активная оптимизация' },
    ],
    notice:
      'Промежуточная R&D-сборка v18: публичная раздача ещё не открыта — идёт оптимизация стриминга чанков океана под железо Wii U и проработка формата чистого адаптера.',
    mirrors: {
      serverPath: './downloads/Subnautica-WiiU-Adapter.zip',
      serverFileName: 'Subnautica-WiiU-Adapter.zip',
      sizeLabel: 'R&D v18 (в работе)',
      releaseTag: 'v18-rd',
      githubRepoUrl: null,
    },
  },
];

export const PORTING_PIPELINE = [
  {
    code: 'REDHILLS C++',
    title: 'Реконструкция C++ под Cafe OS (Minecraft)',
    detail:
      'Сборка 3 753 .cpp файлов через RedHills (Clang 19 / Green Hills ABI) + WUT с кастомным GX2 Dual-Screen, AMD CAS 1080p и 2P-звуком Miles/AX.',
  },
  {
    code: 'GD → C++20 / GX2',
    title: 'Транслятор Godot → PowerPC (Buckshot Roulette)',
    detail:
      'Перевод GDScript в нативный C++20 с корутинами, офлайн-шейдерами CafeGLSL, AMD CAS 720p→1080p и аппаратным звуком AX DSP + IMA-ADPCM.',
  },
  {
    code: 'UNITY → FULL-AOT',
    title: 'Пайплайн Unity → RPX + SIMD (Slime / Subnautica)',
    detail:
      '100% Full-AOT компиляция C# под PowerPC, конвертация тысяч DX11-шейдеров в GX2, PVS-окклюзия, Luma AMD CAS и нативные C-плагины Core 2.',
  },
  {
    code: 'AARCH64 → PPC32',
    title: 'Статический рекомпилятор Switch → Wii U (ACNH)',
    detail:
      'Статическая рекомпиляция ARM64 в PowerPC32 (149 716 функций), трансляция NVN → Latte GX2 (4 299 шейдеров), 62 нативных C HLE (0 ULP) и WLZ4 RomFS.',
  },
];

export const MAC_APPS: MacApp[] = [
  {
    id: 'epidaurus',
    name: 'Epidaurus',
    previousName: 'ex-RealPlayer',
    version: 'v0.2.0',
    tagline:
      'Нативный медиаплеер для Apple Silicon: VVC/H.266, HDR/Dolby Vision, объектный Dolby Atmos и прямой стриминг торрентов',
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
      cloudFileName: 'Epidaurus-0.2.0.dmg',
      sizeLabel: '31 МБ (.dmg)',
      releaseTag: 'v0.2.0',
      githubRepoUrl: 'https://github.com/Nikita56792/epidaurus',
    },
  },
  {
    id: 'kraken',
    name: 'Kraken',
    previousName: 'KrakenFS / Kraken Disk',
    version: 'v0.4.0',
    tagline:
      'Прозрачное сжатие и BLAKE3-дедупликация на Mac (~2.1×–4.0× экономии SSD) на скорости чтения до 14–20 ГБ/с',
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
      cloudFileName: 'Kraken-0.4.0.pkg',
      sizeLabel: '9.9 МБ (.pkg)',
      releaseTag: 'v0.4.0',
      githubRepoUrl: 'https://github.com/Nikita56792/kraken',
    },
  },
  {
    id: 'real3d',
    name: 'Real3D',
    version: 'v1.2.0',
    tagline:
      'Преобразование любого 2D-экрана, игры или фильма в реальное стерео 3D (Full SBS 3840×1080 @ 60 FPS) для XREAL',
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
      cloudFileName: 'Real3D-1.2.0.dmg',
      sizeLabel: '857 МБ (.dmg)',
      releaseTag: 'v1.2.0',
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
      cloudFileName: 'Fovea-1.0.0.dmg',
      sizeLabel: '164 МБ (.dmg)',
      releaseTag: 'v1.0.0',
      githubRepoUrl: 'https://github.com/Nikita56792/fovea',
    },
  },
];
