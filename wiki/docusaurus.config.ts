import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Parhelio — Техническая документация',
  tagline: 'Инженерная база знаний по портам Nintendo Wii U (Cafe OS / GX2) и нативному ПО для Apple Silicon',
  favicon: 'img/mark.svg',

  url: 'https://parhelio.ru',
  baseUrl: '/docs/',
  trailingSlash: true,

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['ru', 'en'],
        docsRouteBasePath: '/',
        indexBlog: false,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        searchBarShortcutHint: false,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    navbar: {
      title: 'PARHELIO',
      logo: {
        alt: 'Parhelio',
        src: 'img/mark.svg',
      },
      items: [
        {
          type: 'html',
          position: 'left',
          value: '<a class="navbar__link" href="/#home">Главная</a>',
        },
        {
          type: 'html',
          position: 'left',
          value: '<a class="navbar__link" href="/#games">Игры Wii U</a>',
        },
        {
          type: 'html',
          position: 'left',
          value: '<a class="navbar__link" href="/#apps">Приложения Mac</a>',
        },
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Документация',
        },
        {
          type: 'html',
          position: 'left',
          value: '<a class="navbar__link" href="/#updates">Обновления</a>',
        },
        {
          href: 'https://github.com/Nikita56792',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Платформа Wii U',
          items: [
            {label: 'Архитектура Wii U', to: '/wiiu/hardware-architecture/'},
            {label: 'Методы портирования', to: '/wiiu/porting-methodologies/'},
            {label: 'Minecraft: Wii U Edition', to: '/games/minecraft/'},
            {label: 'Buckshot Roulette', to: '/games/buckshot-roulette/'},
            {label: 'Slime Rancher', to: '/games/slime-rancher/'},
            {label: 'Animal Crossing: NH', to: '/games/animal-crossing/'},
            {label: 'Subnautica', to: '/games/subnautica/'},
          ],
        },
        {
          title: 'Приложения macOS',
          items: [
            {label: 'Epidaurus', to: '/mac/epidaurus/'},
            {label: 'Kraken', to: '/mac/kraken/'},
            {label: 'Real3D', to: '/mac/real3d/'},
            {label: 'Fovea', to: '/mac/fovea/'},
          ],
        },
        {
          title: 'Инфраструктура и сайт',
          items: [
            {label: 'Parhelio Launcher', to: '/infrastructure/parhelio-launcher/'},
            {label: 'Зеркала и деплой', to: '/infrastructure/mirrors-and-deploy/'},
            {label: 'Главная parhelio.ru', href: 'https://parhelio.ru/#home'},
            {label: 'GitHub @Nikita56792', href: 'https://github.com/Nikita56792'},
          ],
        },
      ],
      copyright: `Parhelio · Техническая документация на базе Docusaurus (MIT) · parhelio.ru`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ['bash', 'c', 'cpp', 'rust', 'swift', 'json', 'glsl', 'cmake', 'ini'],
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
