export const art = (game: string, kind: 'cover' | 'scene' | 'detail' | 'logo') =>
  `./media/art/${game}-${kind}.webp`;

export const hardwareImage = (slug: string) =>
  `./media/hardware/${slug}-tv-gamepad.png`;

export interface GalleryShot {
  src: string;
  caption: string;
}

export interface GameFaq {
  q: string;
  a: string;
}

export interface GameFeaturePillar {
  title: string;
  text: string;
  image?: string;
}

export interface GameStory {
  name: string;
  shortTitle: string;
  genre: string;
  status: string;
  players: string;
  deck: string;
  heroTag: string;
  dualTitle: string;
  dualLead: string;
  tvBadge: string;
  gamepadBadge: string;
  pillars: GameFeaturePillar[];
  gallery: GalleryShot[];
  faq: GameFaq[];
  developerCredit: string;
}

export const stories: Record<string, GameStory> = {
  minecraft: {
    name: 'Minecraft: Wii U Edition',
    shortTitle: 'Minecraft',
    genre: 'Песочница · Кооператив 2P',
    status: 'Релиз .wuhb + WUP',
    players: '2 игрока · TV + GamePad',
    deck: 'C++-реконструкция v688 с двухэкранным кооперативом без split-screen, апскейлом 1080p AMD FidelityFX CAS и раздельным аудио на TV и GamePad.',
    heroTag: 'DualScreen Co-op · 1080p CAS · .wuhb + WUP',
    dualTitle: 'Два независимых экрана и два звуковых потока на одной Wii U',
    dualLead:
      'Вместо тесного split-screen каждый игрок получает полноценный рендер: Игрок 1 строит на телевизоре (720p→1080p AMD CAS), а Игрок 2 исследует шахты на GamePad (854×480) с увеличенным сенсорным интерфейсом и отдельным аудиопотоком.',
    tvBadge: 'Игрок 1 · TV 1080p AMD CAS + HDMI звук',
    gamepadBadge: 'Игрок 2 · GamePad DRC + тач-UI 1.35× + 3.5 мм звук',
    pillars: [
      {
        title: 'Чёткий 1080p TV через AMD CAS',
        text: 'Кастомный fused-шейдер GammaCASShader (sharpness 0.38) повышает резкость 720p→1080p без лишнего прохода и без перерасхода 32 МБ MEM1.',
        image: './media/art/cutouts/mc-steve.webp',
      },
      {
        title: 'Собственный экран и звук P2',
        text: 'Отдельная камера 854×480 с HiZ, масштабированные меню 1.14×–1.35× с тач-ремаппингом и второй 3D-слушатель Miles/AX прямо в динамики GamePad.',
        image: './media/art/cutouts/mc-alex.webp',
      },
      {
        title: 'Два формата: .wuhb и WUP',
        text: 'Запускайте напрямую с SD-карты под Aroma (.wuhb, 1.41 ГБ) или установите в системное меню NAND/USB через WUP Installer GX2 (1.44 ГБ).',
        image: './media/art/cutouts/mc-creeper.webp',
      },
    ],
    gallery: [
      { src: './media/art/minecraft-scene.webp', caption: 'Долина с водопадом — классический мир Wii U Edition' },
      { src: './media/art/minecraft-detail.webp', caption: 'Подземная заброшенная шахта — вид второго игрока' },
      { src: './media/art/gallery/minecraft-03.webp', caption: 'Фирменный мир Super Mario Mash-Up Pack на Wii U' },
      { src: './media/art/gallery/minecraft-02.webp', caption: 'Классическое стартовое меню Minecraft: Wii U Edition' },
      { src: './media/art/gallery/minecraft-05.webp', caption: 'Подводные биомы и коралловые рифы Update Aquatic' },
    ],
    faq: [
      {
        q: 'Чем отличаются версии .wuhb (Aroma) и WUP Installer (.zip)?',
        a: 'Файл Minecraft.WiiU.wuhb (1.41 ГБ) копируется в sd:/wiiu/apps/ и запускается сразу из меню Wii U под средой Aroma без установки. Архив Minecraft_WiiU-WUP.zip (1.44 ГБ, Title ID 00050000101D7500 v688) распаковывается в sd:/install/Minecraft_WiiU/ и устанавливается через WUP Installer GX2 в память NAND/USB для максимальной скорости загрузки и нативного nn::save.',
      },
      {
        q: 'Как включить режим двух экранов и раздельный звук?',
        a: 'Откройте настройки игры и включите пункт «Separate GamePad» (SeparateGamePadCheckbox). Игрок 1 играет за телевизором (Pro Controller / Classic / Wii Remote), Игрок 2 — с Wii U GamePad. Звук автоматически разделяется аппаратно через AX DSP на Core 2 (HDMI vs GamePad 3.5 мм).',
      },
      {
        q: 'Это модификация оригинала или сборка из исходников?',
        a: 'Это полноценная сборка из C++-декомпиляции (3 753 .cpp и 4 016 .hpp, RedHills Clang 19 + WUT): исполняемый файл Minecraft.Client.rpx (9.38 МБ) не содержит кода оригинального бинарника, но полностью совместим с форматом сохранений nn::save (до 99 миров).',
      },
    ],
    developerCredit: 'Оригинальная игра: Mojang / 4J Studios · C++ DualScreenUI & CAS: Parhelio / Nikita56792',
  },

  buckshot: {
    name: 'Buckshot Roulette',
    shortTitle: 'Buckshot Roulette',
    genre: 'Хоррор · Дуэль 1v1',
    status: 'Релиз .wuhb + WUP',
    players: '1–2 игрока · TV ↔ GamePad',
    deck: 'Нативный C++20/PowerPC порт Build 116 (v44) с 28 шейдерами GX2, апскейлом 720p→1080p AMD CAS, звуком AX IMA-ADPCM и локальной дуэлью 1v1 на двух экранах.',
    heroTag: 'Build 116 v44 · C++20 / GX2 · .wuhb + WUP',
    dualTitle: 'Две стороны стола. Скрытый экран GamePad.',
    dualLead:
      'В локальной дуэли на одной Wii U каждый игрок видит стол со своей стороны: Игрок 1 на 1080p-телевизоре (AMD CAS), Игрок 2 — на экране GamePad (854×480) со скрытой FP/TP-видимостью предметов, сенсорным выбором и персональным звуком.',
    tvBadge: 'Игрок 1 · TV 720p→1080p CAS + звук TVOnly',
    gamepadBadge: 'Игрок 2 · GamePad 480p + тачскрин + звук DRCOnly',
    pillars: [
      {
        title: 'Собственный C++20 рантайм',
        text: 'Без движка Godot на консоли: GDScript транслирован в C++20-корутины, 28 нативных шейдеров CafeGLSL и бинарные OBPK-пакеты (game.rpx 4.17 МБ).',
      },
      {
        title: 'Честная дуэль 1v1 + 4 типа ввода',
        text: 'Раздельные камеры, прицелы, паузы и звук TVOnly/DRCOnly. Поддержка GamePad, Pro Controller, Classic, Wii Remote IR и системной клавиатуры nn::swkbd.',
      },
      {
        title: 'AX DSP + IMA-ADPCM (303 МБ)',
        text: 'Перевод аудио на нативный AX DSP в 4-bit IMA-ADPCM сжал образ в 4 раза (с 1.28 ГБ до 303 МБ) с фоновым стримингом треков на Core 2 и 17 языками.',
      },
    ],
    gallery: [
      { src: './media/art/buckshot-scene.webp', caption: 'За игровым столом напротив Дилера' },
      { src: './media/art/gallery/buckshot-03.webp', caption: 'Патроны 12-го калибра, дробовик и предметы на столе' },
      { src: './media/art/gallery/buckshot-02.webp', caption: 'Многопользовательский стол подпольного клуба' },
      { src: './media/art/buckshot-detail.webp', caption: 'Уборная с зеркалом перед началом партии' },
      { src: './media/art/gallery/buckshot-05.webp', caption: 'Отказ от ответственности перед выходом к столу' },
    ],
    faq: [
      {
        q: 'Какой формат скачать — .wuhb или WUP Installer (.zip)?',
        a: 'Для быстрого запуска под Aroma скачайте BuckshotRoulette.wuhb (303 МБ) и положите в sd:/wiiu/apps/ (сохранения в SD:/save/openbr/). Для установки иконкой в Wii U Menu скачайте BuckshotRoulette_WiiU-WUP.zip (313 МБ, Title ID 000500001337B001, Region Free), распакуйте в sd:/install/BuckshotRoulette_WiiU/ и установите через WUP Installer GX2 или NUSspli.',
      },
      {
        q: 'Чем порт Build 116 отличается от ПК-версии?',
        a: 'Помимо полной одиночной кампании против Дилера и всех 17 языков добавлен эксклюзивный локальный PvP 1v1 на одной консоли (TV = P1, GamePad = P2 с раздельными ракурсами и звуком). Сетевой мультиплеер (Join Game) отключён; через SD:/openbr_render.cfg можно переключать рендер 720p+CAS / 1080p / auto.',
      },
      {
        q: 'Какие контроллеры поддерживаются?',
        a: 'Wii U GamePad (стики, кнопки и тачскрин с фильтрацией дрожания 2.5 px), Wii U Pro Controller, Classic Controller и Wii Remote (+ Nunchuk и IR-указатель с фильтрацией 3.0 px).',
      },
    ],
    developerCredit: 'Оригинальная игра: Mike Klubnika / CRITICAL REFLEX · Нативный C++20 порт Wii U: Parhelio / Nikita56792',
  },

  slime: {
    name: 'Slime Rancher',
    shortTitle: 'Slime Rancher',
    genre: 'Приключение · Ранчо',
    status: 'Релиз v42 (WUP)',
    players: '1 игрок · TV + карта на GamePad',
    deck: 'Порт PC Slime Rancher v1.2.2 на консольный Unity 5.6.5p4: 100% Full-AOT (50 719 методов), 3 786 GX2-шейдеров, Core 2 SIMD, WPVS-окклюзия и живая сенсорная карта на GamePad.',
    heroTag: 'Build v42 NoLog · Full-AOT RPX · WUP (902 МБ)',
    dualTitle: 'Ранчо на телевизоре, интерактивная карта на GamePad',
    dualLead:
      'Пока телевизор выводит Далёкое-Далёкое Запределье с динамическим разрешением и Luma-only AMD CAS, на Wii U GamePad работает независимая сенсорная карта MapUI без паузы геймплея — касания изолированы от вакпака.',
    tvBadge: 'TV · DRS 720p→576p + Luma AMD CAS @ 30 FPS',
    gamepadBadge: 'GamePad · Живая карта MapUI (тач 1:1) + аппаратный звук AX',
    pillars: [
      {
        title: '100% Full-AOT + Core 2 SIMD',
        text: 'Скомпилировано 50 719 / 50 719 методов C# в .rpl; нативный плагин slime_wiiu_nolog.rpl считает куллинг 512 акторов SIMD-инструкциями PowerPC на Core 2.',
        image: './media/art/cutouts/slime-pink.webp',
      },
      {
        title: 'Глубокая оптимизация GPU Latte',
        text: 'Мир сжат с 24 434 до 2 686 батчей, добавлен Dual-Volume WPVS (12 742 ячеек), Float16 VBO, восстановлен Early-Z и вырезаны тяжёлые GrabPass-сливы MEM1.',
        image: './media/art/cutouts/slime-tabby.webp',
      },
      {
        title: 'Аппаратный звук + живая карта',
        text: 'Все 583 аудиоклипа перекодированы в GCADPCM (120 МГц AX DSP, ~0% CPU) с патчем одновременного вывода на TV и GamePad. Релиз v42 NoLog без записи логов на SD.',
        image: './media/art/cutouts/slime-honey.webp',
      },
    ],
    gallery: [
      { src: './media/art/slime-scene.webp', caption: 'Розовые слаймы в загоне и работа вакпака' },
      { src: './media/art/gallery/slime-02.webp', caption: 'Дроны-помощники и медовые слаймы на ранчо' },
      { src: './media/art/slime-detail.webp', caption: 'Редкий золотой слайм в древних руинах' },
      { src: './media/art/gallery/slime-03.webp', caption: 'Кристальные и розовые ларго в пещере' },
      { src: './media/art/gallery/slime-05.webp', caption: 'Скоростной сбор слаймов в долине' },
    ],
    faq: [
      {
        q: 'Почему только WUP Installer и нет файла .wuhb?',
        a: 'Порт использует консольный движок Unity-master.rpx с 13 динамическими модулями .rpl и системным хранилищем сохранений /$SAVE, поэтому собирается только как полноценный WUP-тайтл (Title ID 0005000021000002, Region Free). Распакуйте архив в sd:/install/SlimeRancher_WiiU_NoLog/ и установите через WUP Installer GX2 или NUSspli (требуется CFW с sigpatches).',
      },
      {
        q: 'Как включить карту на втором экране Wii U GamePad?',
        a: 'Откройте меню настроек (Options) в игре и активируйте вывод карты на GamePad. Карта рендерится по требованию (3–15 Гц, ~0.05 мс GPU), не ставит игру на телевизоре на паузу, а касания по экрану изолированы от вакпака и камеры.',
      },
      {
        q: 'Какие графические компромиссы сделаны ради стабильных 30 FPS?',
        a: 'Отключены тени, SSAO, Bloom, MSAA и HDR; вода работает в режиме LOW, а динамическое разрешение при нагрузке снижается до 576p с резкостью Luma-only AMD CAS (меню всегда в нативных 720p). Из-за лимита ~849 МБ RAM на поздних сохранениях удалённые дикие слаймы отсеиваются при загрузке (100% ранчо, загонов и гордо сохраняется).',
      },
    ],
    developerCredit: 'Оригинальная игра: Monomi Park · Full-AOT Unity → Wii U GX2 порт: Parhelio / Nikita56792',
  },

  subnautica: {
    name: 'Subnautica',
    shortTitle: 'Subnautica',
    genre: 'Выживание · Океан 4546B',
    status: 'В разработке · R&D v18',
    players: '1 игрок · TV + КПК (PDA) на GamePad',
    deck: 'Экспериментальный Full-AOT порт-адаптер (v18): 45 582 метода, 5 600 GX2-шейдеров, Single-RT WBOIT и 432p→720p AMD CAS на архитектуре Wii U.',
    heroTag: 'R&D v18 · 5 600 GX2 Shaders · WBOIT + CAS',
    dualTitle: 'Океан на ТВ. Живой терминал Alterra PDA на GamePad.',
    dualLead:
      'Wii U GamePad идеально подходит на роль наручного КПК Alterra: чертежи, инвентарь, сканер и сонар проектируются для сенсорного экрана, не перекрывая обзор глубин планеты 4546B на телевизоре.',
    tvBadge: 'TV · 432p→720p AMD CAS + Single-RT WBOIT + 720p HUD',
    gamepadBadge: 'GamePad · Сенсорный Alterra PDA (в разработке)',
    pillars: [
      {
        title: '100% Full-AOT + 5 600 шейдеров',
        text: 'Скомпилированы все 45 582 метода Assembly-CSharp, стабильный профиль памяти 554–563 МБ и нативный fmodstudio.rpl (486 экспортов) на Core 2.',
        image: './media/art/cutouts/sub-peeper.webp',
      },
      {
        title: 'Single-RT WBOIT в 32 МБ MEM1',
        text: 'RenderTexture уложен в ~23–29 МБ MEM1; 768×432 апскейлится до 720p через AMD CAS (sharp=0.80) поверх чёткого нативного 720p интерфейса.',
        image: './media/art/cutouts/sub-seamoth.webp',
      },
      {
        title: 'Cemu 24–30 FPS · Wii U ~10 FPS',
        text: 'В Cemu подводный мир уже играбелен; на реальной консоли оптимизируется потоковая подгрузка чанков и прорабатывается формат чистого адаптера.',
      },
    ],
    gallery: [
      { src: './media/art/subnautica-scene.webp', caption: 'Батискаф «Мотылёк» и сканирование фауны над рифом' },
      { src: './media/art/gallery/subnautica-05.webp', caption: 'Кабина «Мотылька» у обломков корабля «Аврора»' },
      { src: './media/art/gallery/subnautica-04.webp', caption: 'Подводная модульная база и подлодка «Циклоп»' },
      { src: './media/art/gallery/subnautica-03.webp', caption: 'Встреча со Жнецом-левиафаном в грибном лесу' },
      { src: './media/art/subnautica-detail.webp', caption: 'Биолюминесцентные глубины и Краб-кальмар' },
    ],
    faq: [
      {
        q: 'Можно ли уже пройти игру на реальной Wii U?',
        a: 'Пока нет — это R&D-сборка v18 (Title ID 0005000021000003). В Cemu игра держит 24–30 FPS, а на реальной консоли при стабильной памяти 554–563 МБ открытый океан упирается примерно в 10 FPS — сейчас оптимизируется стриминг чанков.',
      },
      {
        q: 'Почему рассматривается формат адаптера?',
        a: 'Полный WUP-пакет занимает 9.2 ГБ, поэтому рассматривается выпуск в виде чистого инструмента-адаптера поверх легальной ПК-копии Subnautica.',
      },
    ],
    developerCredit: 'Оригинальная игра: Unknown Worlds Entertainment · R&D v18 порт: Parhelio / Nikita56792',
  },

  acnh: {
    name: 'Animal Crossing: New Horizons',
    shortTitle: 'Animal Crossing',
    genre: 'Симулятор жизни · Остров',
    status: 'Разработка · Wave 9',
    players: '1 игрок · TV + Off-TV GamePad',
    deck: 'Статическая рекомпиляция Switch v1.0.0 (AArch64 → PowerPC32) под Wii U Cafe OS: 149 716 функций, 4 299 шейдеров GX2, 62 нативных C HLE и живой 3D-остров.',
    heroTag: 'Static Recomp · Wave 9 · Активное тестирование',
    dualTitle: 'Остров на телевизоре и Off-TV Play с тачскрином на GamePad',
    dualLead:
      'В текущей сборке Wave 9 экран Wii U GamePad работает через аппаратный даунскейлер Latte (854×480 Off-TV Play) с калиброванной проекцией тачскрина в 1280×720 Switch, 6-осевым гироскопом, вибрацией и поддержкой Pro Controller.',
    tvBadge: 'TV · 5-ступенчатый DRS + Luma AMD CAS → 720p + 720p UI',
    gamepadBadge: 'GamePad · Аппаратный Off-TV Play + тачскрин + 6-осевой гироскоп',
    pillars: [
      {
        title: 'Статическая рекомпиляция ARM64 → PPC32',
        text: 'Оригинальный код Switch v1.0.0 переведён в 13 нативных модулей .rpx/.rpl (149 716 функций) без эмуляции — горячий модуль 1.22 МБ целиком живёт в L2 Core 1.',
        image: './media/art/cutouts/acnh-tomnook.webp',
      },
      {
        title: 'NVN → Latte GX2 и 4 299 шейдеров',
        text: 'Офлайн-конвертация Maxwell → R600 (0 ошибок), MEM1 теневая карта 768×768 D16+HiZ, 5-ступенчатый DRS с Luma AMD CAS и нативный 720p интерфейс.',
        image: './media/art/cutouts/acnh-nookphone.webp',
      },
      {
        title: 'Живой остров, звук и WUP 3.6 ГБ',
        text: 'Работают загрузка сохранений, 3D-титул, площадь с Томом Нуком, аэропорт и звук AX DSP 48 кГц. Идёт активная оптимизация CPU под 24–30 FPS и тест на железе.',
      },
    ],
    gallery: [
      { src: './media/art/gallery/acnh-port-title.webp', caption: 'Реальный запуск порта acnh-wiiu в Cemu 2.6 — 3D-титул Ver. 1.0.0 (TitleId 0005000021AC0001)' },
      { src: './media/art/gallery/acnh-port-plaza.webp', caption: 'Реальный кадр Wave 9d — вечерняя площадь с Томом Нуком, костром, тенями и диалогом' },
      { src: './media/art/acnh-scene.webp', caption: 'Островная площадь и жители (официальный кадр ACNH)' },
      { src: './media/art/acnh-detail.webp', caption: 'Интерфейс NookPhone и сенсорное управление' },
      { src: './media/art/gallery/acnh-02.webp', caption: 'Побережье острова и рыбалка' },
      { src: './media/art/gallery/acnh-03.webp', caption: 'Верстак DIY и крафт предметов' },
      { src: './media/art/gallery/acnh-04.webp', caption: 'Дом игрока и обустройство участка' },
    ],
    faq: [
      {
        q: 'Это эмулятор Switch на Wii U или нативный порт?',
        a: 'Это нативная статическая рекомпиляция (AArch64 → C → PowerPC32 Big-Endian): оригинальные 149 716 функций ACNH v1.0.0 скомпилированы в нативные бинарники Cafe OS (acnh.rpx + 12 .rpl), 4 299 шейдеров переведены из Maxwell в Latte R600 GX2, а 62 самые тяжёлые функции переписаны на нативный C + Espresso Paired Singles SIMD.',
      },
      {
        q: 'Что уже работает и почему сборка ещё не выложена в открытый доступ?',
        a: 'Уже запускается 3D-остров, аэропорт (14.5–20.7 FPS), вечерняя площадь с Томом Нуком, сохранения и живой звук AX DSP 48 кГц; собран и криптопроверен WUP-установщик 3.6 ГБ. Сейчас идёт Wave 9: ускорение однопоточного AcnhMain на тяжёлом острове (сейчас 10–14 FPS в Cemu) и калибровочный прогон на физической Wii U.',
      },
      {
        q: 'Есть ли отдельный экран NookPhone на Wii U GamePad?',
        a: 'На текущем этапе GamePad работает в режиме аппаратного зеркалирования Off-TV Play (854×480 через даунскейлер Latte) с калиброванным тачскрином, 6-осевым гироскопом и вибрацией. Отдельный второй экран NookPhone пока не реализован.',
      },
    ],
    developerCredit: 'Оригинальная игра: Nintendo EPD · Статическая рекомпиляция Switch → Wii U: Parhelio / Nikita56792',
  },
};

export const appNotes: Record<string, string> = {
  epidaurus: 'Нативный медиаплеер для Apple Silicon: VVC/H.266, HDR/Dolby Vision, объектный Dolby Atmos и торрент-стриминг.',
  kraken: 'Прозрачное сжатие файлов в фоне (~2.1×–4.0× экономии SSD) и наглядная Sunburst-карта диска на Mac.',
  real3d: 'Преобразует любой 2D-экран, игру или фильм в реальное стерео 3D (3840×1080 @ 60 FPS) для очков XREAL.',
  fovea: 'Нативный 3D eye tracking для Mac по обычной камере: 60–120 Гц ProMotion, Zero-Calibration и жесты веками.',
};

export interface PortUpdate {
  slug: string;
  game: string;
  kind: string;
  tag: string;
  date: string;
  title: string;
  summary: string;
  intro: string;
  heroImage: string;
  sections: { heading: string; body: string }[];
  changelog?: string[];
}

export const updates: PortUpdate[] = [
  {
    slug: 'acnh-static-recomp-wave9',
    game: 'acnh',
    kind: 'Разработка Wave 9',
    tag: 'R&D',
    date: '2026-11-27',
    title: 'Animal Crossing: New Horizons на Wii U — Wave 9: живой 3D-остров и 62 C HLE',
    summary: 'Статическая рекомпиляция Switch v1.0.0 (149 716 функций, 4 299 шейдеров GX2, 10 378 тестов Unicorn PASS) вышла на 3D-остров и криптопроверенный WUP 3.6 ГБ.',
    intro:
      'В активной разработке и тестировании порт Animal Crossing: New Horizons для Wii U на базе собственного статического рекомпилятора AArch64 → PowerPC32.',
    heroImage: './media/art/gallery/acnh-port-title.webp',
    sections: [
      {
        heading: '149 716 функций и 62 нативных C HLE (0 ULP)',
        body: 'Весь код ACNH v1.0.0 пересобран в 13 модулей Cafe OS с PGO-ядром acnh_hot_0.rpl (1.22 МБ в L2 кэше Core 1). 62 горячие функции (Tiers 1–5 с Paired Singles SIMD) прошли 10 378 / 10 378 дифференциальных тестов Unicorn (ARM64 vs C, 0 ULP).',
      },
      {
        heading: 'Текущие замеры и ближайший шаг',
        body: 'Загрузка острова держит 57–60 FPS, аэропорт — 14.5–20.7 FPS, 3D-остров с костром и тенями — 10–14 FPS (пик 24.3 FPS) с живым звуком AX DSP 48 кГц и нулевыми падениями. Сейчас идёт оптимизация AcnhMain (Wave 9) и подготовка прогона WUP (3.6 ГБ) на реальной Wii U.',
      },
    ],
    changelog: [
      '4 299 шейдеров Maxwell → Latte GX2 (0 ошибок), MEM1 теневая карта 768×768 D16+HiZ, 5-ступенчатый DRS + Luma AMD CAS',
      'Wave 9 Tier-5 SIMD HLE (g3d, окклюзия, BCSV, ветер/листва, LiSPSM, nn::vfx) + 7 перф-хуков движка',
      'RomFS 6.3 → 3.4 ГБ (61 597 архивов WLZ4 + линейные BC1–5) и криптопроверенный WUP 3.6 ГБ',
    ],
  },
  {
    slug: 'buckshot-build116-release',
    game: 'buckshot',
    kind: 'Релиз Build 116',
    tag: 'РЕЛИЗ',
    date: '2026-11-27',
    title: 'Buckshot Roulette Wii U Build 116 (v44): релиз .wuhb и WUP + локальный 1v1',
    summary: 'Нативный C++20/GX2 порт с 28 шейдерами, AMD CAS 720p→1080p, звуком AX IMA-ADPCM (303 МБ) и дуэлью на 2 экранах уже доступен на зеркалах Parhelio.',
    intro:
      'Опубликован релиз Build 116 / title_version 44 в двух форматах: Aroma .wuhb (303 МБ) и WUP Installer (313 МБ, криптопроверка AES/TMD/H0–H3 PASS).',
    heroImage: './media/art/buckshot-scene.webp',
    sections: [
      {
        heading: 'Собственный C++20 рантайм и 28 нативных шейдеров GX2',
        body: 'Порт работает без Godot на консоли: GDScript транслирован в C++20-корутины (co_task.h), а 28 шейдеров скомпилированы офлайн через CafeGLSL 1.0.0-rc1. По умолчанию 3D рендерится в 720p и апскейлится до 1080p на TV через AMD CAS.',
      },
      {
        heading: 'AX DSP + 4-bit IMA-ADPCM и локальный 1v1',
        body: 'Перевод аудио на аппаратный AX DSP с 4-bit IMA-ADPCM уменьшил размер сборки с 1.28 ГБ до 303 МБ. В локальной дуэли 1v1 (TV = P1, GamePad = P2) разделены камеры, видимость предметов от 1-го/3-го лица и звук (TVOnly/DRCOnly), добавлена системная клавиатура nn::swkbd и все 17 языков.',
      },
    ],
    changelog: [
      'Два готовых формата на зеркалах Parhelio: BuckshotRoulette.wuhb (303 МБ) и WUP Installer (313 МБ)',
      '28 нативных шейдеров GX2 + апскейл 720p→1080p AMD CAS + VHS/процедурное небо MP',
      'Нативный AX DSP + IMA-ADPCM со стримингом >512 КБ на Core 2 и разведением TVOnly/DRCOnly',
      'Поддержка GamePad, Pro Controller, Classic, Wii Remote IR (антидребезг 2.5–3.0 px) и nn::swkbd',
    ],
  },
  {
    slug: 'slime-rancher-v42-wup',
    game: 'slime',
    kind: 'Релиз v42 NoLog',
    tag: 'РЕЛИЗ',
    date: '2026-11-27',
    title: 'Slime Rancher Wii U v42 (NoLog): публикация WUP-сборки на 902 МБ',
    summary: '100% Full-AOT (50 719 методов), Core 2 SIMD плагин, Dual-Volume WPVS, Luma AMD CAS и интерактивная карта на GamePad.',
    intro:
      'Выложена релизная WUP-сборка SlimeRancher_WiiU_NoLog (902 МБ, Title ID 0005000021000002) с вырезанным логированием на SD, быстрой 3-этапной загрузкой v42 FastSyncLoad и исправленной регрессией HUD из v41.',
    heroImage: './media/art/slime-scene.webp',
    sections: [
      {
        heading: 'Инженерная оптимизация мира, GPU и Core 2 SIMD',
        body: 'Статический батчинг сократил число подмешей мира с 24 434 до 2 686 (-70 436 лишних объектов), WPVS на 12 742 ячеек отсекает более 32% батчей до GPU, а нативный плагин slime_wiiu_nolog.rpl выполняет пространственный куллинг 512 акторов SIMD-инструкциями PowerPC на Core 2.',
      },
      {
        heading: 'Живая карта на GamePad и аппаратное аудио GCADPCM',
        body: 'Все 583 аудиоклипа перекодированы в GCADPCM для 120 МГц AX DSP (~0% CPU) с патчем вывода одновременно на TV и GamePad. Сенсорная карта MapUI на GamePad обновляется по требованию (3–15 Гц, ~0.05 мс GPU) и не ставит игру на паузу.',
      },
    ],
    changelog: [
      'Публичный WUP Installer пакет SlimeRancher_WiiU_NoLog-WUP.zip (902 МБ, AES/TMD/FST PASS)',
      '100% Full-AOT (50 719 методов) + 3 786 нативных GX2-шейдеров + Luma-only AMD CAS (720p→576p)',
      'FastSyncLoad v42, Proxy-Vista farClipPlane и исправление HUD sub-canvas после v41',
      '100% аудио в аппаратном GCADPCM + независимая сенсорная карта на GamePad',
    ],
  },
  {
    slug: 'minecraft-dualscreen-1-0',
    game: 'minecraft',
    kind: 'Релиз v688',
    tag: 'РЕЛИЗ',
    date: '2026-11-27',
    title: 'Minecraft: Wii U Edition v688 — .wuhb + WUP Installer и 1080p AMD CAS',
    summary: 'C++-реконструкция RedHills с двумя независимыми экранами, раздельным аудио на Core 2 и апскейлом 720p→1080p CAS.',
    intro:
      'Обновлённая сборка Minecraft: Wii U Edition доступна на зеркалах Parhelio сразу в двух форматах — автономный .wuhb для Aroma (1.41 ГБ) и полноценный WUP Installer (1.44 ГБ).',
    heroImage: './media/art/minecraft-scene.webp',
    sections: [
      {
        heading: 'Полный 1080p TV + независимый 854×480 GamePad',
        body: 'Режим SeparateGamePad выделяет игроку 1 весь телевизор с fused-шейдером AMD FidelityFX CAS (sharpness 0.38) + Gamma, а игроку 2 — отдельный рендер на GamePad с масштабированными меню (1.14×–1.35×) и точным ремаппингом касаний.',
      },
      {
        heading: 'Раздельный звук на Core 2 и два формата установки',
        body: 'Реконструированный Miles Sound System + BinkA работает на Core 2 (128 голосов AX) с двумя 3D-слушателями и двумя музыкальными потоками. Выбирайте .wuhb для запуска с SD под Aroma или WUP Installer для установки в NAND/USB.',
      },
    ],
    changelog: [
      'Два формата: Minecraft.WiiU.wuhb (1.41 ГБ) и Minecraft_WiiU-WUP.zip (1.44 ГБ, v688)',
      'Fused-шейдер AMD FidelityFX CAS (0.38) + Gamma для 720p→1080p на TV в бюджете 22 МБ MEM1',
      'Масштабируемый DualScreenUI (1.14× / 1.35×) с точным тач-ремаппингом VPAD',
      'Два независимых 3D-слушателя и два потока музыки (HDMI vs GamePad 3.5 мм)',
    ],
  },
  {
    slug: 'subnautica-hardware',
    game: 'subnautica',
    kind: 'R&D отчёт v18',
    tag: 'R&D',
    date: '2026-11-24',
    title: 'Subnautica R&D v18: 45 582 AOT-методов, Single-RT WBOIT и 5 600 шейдеров GX2',
    summary: 'Стабильный профиль памяти 554–563 МБ, 432p→720p AMD CAS, 24–30 FPS в Cemu и план ускорения открытого океана на реальной Wii U.',
    intro:
      'Экспериментальная сборка v18 (Title ID 0005000021000003) достигла 100% Full-AOT компиляции, уложила RenderTexture в 23–29 МБ MEM1 и перенесла FMOD Studio на Core 2.',
    heroImage: './media/art/subnautica-scene.webp',
    sections: [
      {
        heading: 'Инженерная база v18',
        body: 'Провалидировано 5 600 GX2-шейдеров, реализован Single-RT WBOIT и апскейл 768×432→1280×720 AMD CAS (sharp=0.80) при чётком нативном 720p UI. Память стабильно держится в пределах 554–563 МБ.',
      },
      {
        heading: 'Производительность и следующий шаг',
        body: 'В Cemu подводный мир держит 24–30 FPS; на реальной Wii U меню и звук стабильны, а в 3D-океане пока ~10 FPS. В работе — оптимизация потоковой подгрузки чанков и проработка формата чистого адаптера поверх ПК-копии.',
      },
    ],
    changelog: [
      '100% Full-AOT (45 582 метода) и 5 600 GX2-шейдеров + Single-RT WBOIT',
      '432p→720p AMD FidelityFX CAS (0.80) + RT 23–29 МБ внутри 32 МБ MEM1',
      'Нативный fmodstudio.rpl (486 экспортов) на Core 2 + поддержка GamePad и Pro Controller',
    ],
  },
];

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}
