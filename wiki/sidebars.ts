import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Введение и карта знаний',
    },
    {
      type: 'category',
      label: 'Архитектура Wii U',
      collapsed: false,
      items: [
        'wiiu/hardware-architecture',
        'wiiu/porting-methodologies',
      ],
    },
    {
      type: 'category',
      label: 'Порты игр для Wii U',
      collapsed: false,
      items: [
        'games/minecraft',
        'games/buckshot-roulette',
        'games/slime-rancher',
        'games/animal-crossing',
        'games/subnautica',
      ],
    },
    {
      type: 'category',
      label: 'Приложения для macOS',
      collapsed: false,
      items: [
        'mac/epidaurus',
        'mac/kraken',
        'mac/real3d',
        'mac/fovea',
      ],
    },
    {
      type: 'category',
      label: 'Инфраструктура и лаунчер',
      collapsed: false,
      items: [
        'infrastructure/parhelio-launcher',
        'infrastructure/mirrors-and-deploy',
      ],
    },
  ],
};

export default sidebars;
