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
    status: 'Релиз .wuhb',
    players: '2 игрока · TV + GamePad',
    deck: 'Один мир на двоих без деления экрана. Первый игрок на телевизоре, второй — на Wii U GamePad со своим обзором и звуком.',
    heroTag: 'DualScreen Co-op · Aroma .wuhb',
    dualTitle: 'Два независимых экрана на одной Wii U',
    dualLead:
      'Вместо тесного split-screen каждый участник получает собственный полный рендер: Игрок 1 строит на 1080p-телевизоре, а Игрок 2 исследует шахты на экране GamePad с сенсорным крафтом и отдельным звуковым потоком.',
    tvBadge: 'Игрок 1 · Full 16:9 TV + звук ТВ',
    gamepadBadge: 'Игрок 2 · GamePad DRC + наушники/динамики',
    pillars: [
      {
        title: 'Один строит на поверхности',
        text: 'Полный 16:9 экран телевизора без обрезанного поля зрения и мелкого интерфейса.',
        image: './media/art/cutouts/mc-steve.webp',
      },
      {
        title: 'Второй уходит в шахту',
        text: 'Отдельная камера, сенсорный инвентарь DualScreenUI и независимый звук прямо в GamePad.',
        image: './media/art/cutouts/mc-alex.webp',
      },
      {
        title: 'Собрано в один .wuhb',
        text: 'Запускается нативно в среде Aroma с SD-карты на стабильных 60 FPS через GX2.',
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
        q: 'Нужен ли второй контроллер для игры вдвоём?',
        a: 'Да: второй игрок управляет персонажем с Wii U GamePad, а первый игрок за телевизором использует Wii U Pro Controller или другой подключённый геймпад.',
      },
      {
        q: 'Как работает звук для каждого игрока?',
        a: 'Аудиопотоки разделены аппаратно: телевизор выводит окружение первого игрока, а встроенные динамики или разъём 3.5 мм на GamePad — звук второго игрока.',
      },
      {
        q: 'Как установить сборку на консоль?',
        a: 'Поместите файл Minecraft.WiiU-DualScreenUI.wuhb в папку sd:/wiiu/apps/ на SD-карте и запустите через меню Wii U под средой Aroma.',
      },
    ],
    developerCredit: 'Оригинальная игра: Mojang / 4J Studios · Модификация DualScreenUI: Nikita56792',
  },

  buckshot: {
    name: 'Buckshot Roulette',
    shortTitle: 'Buckshot Roulette',
    genre: 'Хоррор · Дуэль 1v1',
    status: 'Готовый порт',
    players: '1–2 игрока · TV ↔ GamePad',
    deck: 'Настольная русская рулетка 12-го калибра на Wii U. Нативный порт PowerPC + GX2 и асимметричная дуэль 1v1 на двух экранах.',
    heroTag: 'GD → PowerPC / GX2 · 60 FPS',
    dualTitle: 'Две стороны стола. Скрытый экран GamePad.',
    dualLead:
      'В локальной дуэли на одной Wii U игрокам не нужно отворачиваться: первый участник следит за столом на телевизоре, второй держит в руках GamePad со своим ракурсом и сенсорным выбором предметов.',
    tvBadge: 'Игрок 1 · Стол и оппонент на ТВ',
    gamepadBadge: 'Игрок 2 · Личный ракурс + тачскрин предметов',
    pillars: [
      {
        title: 'Нативный код PowerPC',
        text: 'Логика GDScript транслирована напрямую в нативный C++ с рендером через Wii U GX2.',
      },
      {
        title: 'Честная дуэль 1v1',
        text: 'Каждый игрок видит стол со своей стороны. На GamePad удобно выбирать лупу, пилу или пиво касанием.',
      },
      {
        title: 'Атмосфера без потерь',
        text: 'Индустриальный звук подпольного клуба, освещение и диегетический интерфейс работают при 60 FPS.',
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
        q: 'Чем порт на Wii U отличается от ПК-версии?',
        a: 'Помимо полной одиночной кампании против Дилера добавлен локальный режим 1v1 на одной консоли: телевизор служит экраном первого игрока, а GamePad — экраном второго.',
      },
      {
        q: 'Когда появится ссылка на скачивание .wuhb?',
        a: 'Сборка порта уже стабильно держит 60 FPS и проходит финальную упаковку перед публикацией в GitHub Releases и на локальном зеркале.',
      },
    ],
    developerCredit: 'Оригинальная игра: Mike Klubnika / CRITICAL REFLEX · Порт для Wii U: Nikita56792',
  },

  slime: {
    name: 'Slime Rancher',
    shortTitle: 'Slime Rancher',
    genre: 'Приключение · Ранчо',
    status: 'Играбельная сборка',
    players: '1 игрок · TV + карта на GamePad',
    deck: 'Далёкое-Далёкое Запределье на Nintendo Wii U. Вакпак, физика слаймов и удобный компаньон-экран на Wii U GamePad.',
    heroTag: 'Unity → Cafe OS RPX · Играбельно',
    dualTitle: 'Ранчо на телевизоре, Слаймопедия под рукой',
    dualLead:
      'Пока вы ловите розовых и медовых слаймов вакпаком на большом экране, GamePad держит открытой карту ранчо, рецепты плортов и поддерживает режим Off-TV Play.',
    tvBadge: 'TV · Далёкое-Далёкое Запределье и вакпак',
    gamepadBadge: 'GamePad · Сенсорная карта, Слаймопедия и Off-TV',
    pillars: [
      {
        title: 'Основные локации ранчо',
        text: 'Перенесены ключевые зоны, загоны, физика прыгающих слаймов и сбор плортов вакпаком.',
        image: './media/art/cutouts/slime-pink.webp',
      },
      {
        title: 'Карта и Слаймопедия',
        text: 'Не нужно ставить игру на паузу — подсказки и карта мира вынесены прямо на экран контроллера.',
        image: './media/art/cutouts/slime-tabby.webp',
      },
      {
        title: 'Честный статус сборки',
        text: 'Порт играбелен, но местами ещё встречаются отдельные артефакты шейдеров и физики.',
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
        q: 'Как перенесён движок Unity на Wii U?',
        a: 'Сцены, ассеты и логика собираются через собственный пайплайн трансляции Unity → Cafe OS RPX с переносом шейдеров под GPU GX2.',
      },
      {
        q: 'Какие ограничения есть сейчас?',
        a: 'Основные локации и геймплей работают, но в сложных сценах с большим числом слаймов ещё исправляются просадки и отдельные ошибки столкновений.',
      },
    ],
    developerCredit: 'Оригинальная игра: Monomi Park · Порт Unity → RPX: Nikita56792',
  },

  subnautica: {
    name: 'Subnautica',
    shortTitle: 'Subnautica',
    genre: 'Выживание · Океан 4546B',
    status: 'В разработке · R&D',
    players: '1 игрок · TV + КПК (PDA) на GamePad',
    deck: 'Экспериментальный порт-адаптер океана планеты 4546B на архитектуру Wii U с выносом терминала Alterra PDA на экран GamePad.',
    heroTag: 'R&D Adapter · Cemu 24–30 FPS',
    dualTitle: 'Океан на ТВ. Живой терминал Alterra PDA на GamePad.',
    dualLead:
      'Wii U GamePad создан для роли наручного КПК Alterra: чертежи, инвентарь, сканер и сонар вынесены на сенсорный экран, не перекрывая обзор глубин на телевизоре.',
    tvBadge: 'TV · Подводный мир, батискаф и глубиномер',
    gamepadBadge: 'GamePad · Сенсорный Alterra PDA и чертежи',
    pillars: [
      {
        title: 'Эмулятор Cemu: 24–30 FPS',
        text: 'Уже работают перемещение под водой, базовое освещение, интерфейс и исследование рифов.',
        image: './media/art/cutouts/sub-peeper.webp',
      },
      {
        title: 'Консоль Wii U: ~10 FPS',
        text: 'Меню и звук работают стабильно; в открытом океане идёт оптимизация стриминга чанков под 2 ГБ RAM.',
        image: './media/art/cutouts/sub-seamoth.webp',
      },
      {
        title: 'Формат чистого адаптера',
        text: 'Планируется выпуск как инструмент-адаптер поверх легальной копии ПК-версии игры.',
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
        a: 'Нет, это R&D-сборка: на Cemu игра выдаёт 24–30 FPS, а на реальной консоли пока ~10 FPS в 3D-мире и переписываются шейдеры воды и подгрузка памяти MEM2.',
      },
      {
        q: 'Почему рассматривается формат адаптера?',
        a: 'Чтобы не распространять коммерческие ресурсы игры, утилита сможет преобразовывать ассеты из уже купленной копии Subnautica на ПК.',
      },
    ],
    developerCredit: 'Оригинальная игра: Unknown Worlds Entertainment · R&D адаптер: Nikita56792',
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
    slug: 'minecraft-dualscreen-1-0',
    game: 'minecraft',
    kind: 'Релиз 1.0',
    tag: 'РЕЛИЗ',
    date: '2026-11-22',
    title: 'Minecraft: Wii U Edition получил полноценный режим двух экранов 1.0',
    summary: 'Готовый файл .wuhb для Aroma уже доступен на GitHub Releases — кооператив вдвоём без split-screen.',
    intro:
      'Вышла первая публичная сборка Minecraft.WiiU-DualScreenUI.wuhb. Теперь двое игроков могут играть на одной консоли Wii U с полностью раздельными экранами и звуком.',
    heroImage: './media/art/minecraft-scene.webp',
    sections: [
      {
        heading: 'Полный 16:9 экран для каждого игрока',
        body: 'В оригинальной версии совместная игра делила телевизор пополам. В DualScreen Co-op первый игрок получает весь телевизор 1080p, а второй — собственный рендер на Wii U GamePad с сенсорным инвентарём и крафтом.',
      },
      {
        heading: 'Раздельный звук и стабильные 60 FPS',
        body: 'Звуковые сцены разведены по каналам вывода: звук мира первого игрока идёт на телевизор, второго — в динамики или наушники GamePad. Оба буфера отрисовываются нативно через GX2.',
      },
      {
        heading: 'Установка на SD-карту',
        body: 'Скачайте готовый архив Minecraft.WiiU-DualScreenUI.wuhb (1.41 ГБ) с GitHub Releases или локального сервера и скопируйте его в каталог sd:/wiiu/apps/ для запуска в среде Aroma.',
      },
    ],
    changelog: [
      'Два независимых буфера кадра GX2: TV (Player 1) + GamePad DRC (Player 2)',
      'Сенсорный интерфейс инвентаря и верстака DualScreenUI на GamePad',
      'Аппаратное разделение аудиопотоков между HDMI и GamePad',
      'Упаковка в один автономный пакет .wuhb для Aroma',
    ],
  },
  {
    slug: 'buckshot-local-duel',
    game: 'buckshot',
    kind: 'Мультиплеер 1v1',
    tag: 'ПОРТ',
    date: '2026-11-21',
    title: 'Локальная дуэль 1v1 на ТВ и GamePad в Buckshot Roulette',
    summary: 'Перенос GDScript → PowerPC/GX2 достиг стабильных 60 FPS и получил скрытый экран для второго игрока.',
    intro:
      'Порт Buckshot Roulette под Wii U полностью воспроизводит оригинальную кампанию против Дилера и добавляет уникальный локальный режим 1v1 на одной консоли.',
    heroImage: './media/art/buckshot-scene.webp',
    sections: [
      {
        heading: 'Собственный ракурс без подглядывания',
        body: 'Первый игрок сидит перед телевизором и видит стол со своей стороны. Второй держит Wii U GamePad — на нём отображается противоположный ракурс стола, а предметы можно активировать прямо касанием экрана.',
      },
      {
        heading: 'Трансляция Godot → PowerPC + GX2',
        body: 'Сцены и скрипты GDScript статически переведены в нативный код PowerPC 750CL с прямым рендером через Wii U GX2, благодаря чему партия идёт ровно в 60 кадров в секунду.',
      },
    ],
    changelog: [
      'Стабильные 60 FPS на реальной консоли Wii U',
      'Асимметричный локальный режим 1v1 (TV vs GamePad)',
      'Поддержка сенсорного выбора предметов на экране GamePad',
    ],
  },
  {
    slug: 'slime-rancher-ranch',
    game: 'slime',
    kind: 'Прогресс порта',
    tag: 'СБОРКА',
    date: '2026-11-19',
    title: 'Slime Rancher: работающее ранчо, вакпак и карта на GamePad',
    summary: 'Основные локации и физика слаймов перенесены через пайплайн Unity → Cafe OS RPX.',
    intro:
      'Играбельная версия Slime Rancher на Wii U уже позволяет исследовать ключевые зоны Далёкого-Далёкого Запределья, собирать слаймов вакпаком и пользоваться картой на экране контроллера.',
    heroImage: './media/art/slime-scene.webp',
    sections: [
      {
        heading: 'Второй экран как Слаймопедия',
        body: 'Пока телевизор показывает яркий мир ранчо и индикаторы вакпака, экран Wii U GamePad открывает карту загонов и справочник по слаймам, а также поддерживает Off-TV Play.',
      },
      {
        heading: 'Что полируется перед релизом',
        body: 'Сейчас устраняются отдельные графические неточности шейдеров и физические шероховатости при большом количестве слаймов в одном загоне.',
      },
    ],
    changelog: [
      'Перенос сцен Unity в нативный модуль Cafe OS (.rpx)',
      'Рабочий вакпак, загоны и базовая физика слаймов',
      'Вывод карты ранчо и Слаймопедии на Wii U GamePad',
    ],
  },
  {
    slug: 'subnautica-hardware',
    game: 'subnautica',
    kind: 'R&D отчёт',
    tag: 'R&D',
    date: '2026-11-17',
    title: 'Subnautica на Cemu и первом запуске на железе Wii U',
    summary: '24–30 FPS в эмуляторе Cemu, рабочий звук и меню на консоли и план оптимизации памяти MEM2.',
    intro:
      'Экспериментальный адаптер Subnautica добрался до загрузки подводного мира 4546B на реальной приставке и стабильного плавания в Cemu.',
    heroImage: './media/art/subnautica-scene.webp',
    sections: [
      {
        heading: 'Текущие замеры производительности',
        body: 'В Cemu подводный мир, базовое освещение и перемещение держат 24–30 кадров в секунду. На реальной Wii U меню и звук работают штатно, но открытый океан пока упирается примерно в 10 FPS.',
      },
      {
        heading: 'Следующие инженерные шаги',
        body: 'Основные задачи ближайших итераций — потоковая подгрузка чанков в рамках 2 ГБ памяти MEM2, перенос водных шейдеров под GX2 и вынос полноценного интерфейса Alterra PDA на экран GamePad.',
      },
    ],
    changelog: [
      'Cemu: 24–30 FPS с базовым освещением и навигацией',
      'Wii U Hardware: загрузка меню, звука и стартовой сцены (~10 FPS в 3D)',
      'Проектирование адаптера для легальных ПК-ассетов',
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
