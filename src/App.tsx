import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MAC_APPS, WIIU_PORTS } from './data/catalog';
import { stories, updates } from './data/editorial';
import { SiteFooter, SiteHeader, SupportBand } from './components/Layout';
import { HomePage } from './components/HomePage';
import {
  AppDetailPage,
  AppsCatalogPage,
  GamesCatalogPage,
} from './components/AppPages';
import { GameDetailPage } from './components/GamePages';
import { UpdateArticlePage, UpdatesHubPage } from './components/UpdatesPages';
import { SupportModal } from './components/SupportModal';

const readPath = () =>
  window.location.hash.slice(1).replace(/^\/+|\/+$/g, '') || 'home';

const REVEAL_SELECTOR = [
  '.port-card',
  '.rpcs-app-card',
  '.mc-news-card',
  '.release-banner-card',
  '.hardware-showcase',
  '.mc-pillar-card',
  '.br-pillar-box',
  '.br-raw-shot',
  '.sr-pillar-card',
  '.ac-pillar-card',
  '.ac-panel',
  '.sn-pillar-card',
  '.sn-glass-panel',
  '.mc-download-card',
  '.sr-release-card',
  '.pipeline-card',
  '.apple-surface-card',
  '.apple-gallery-card',
  '.apple-bench-card',
  '.hub-update-card',
  '.strip-update-card',
  '.media-stage',
  '.latest-build-banner',
  '.os-card',
  '.prev-builds-card',
].join(',');

export default function App() {
  const [path, setPath] = useState(readPath);
  const [supportOpen, setSupportOpen] = useState(false);

  const lastPath = useRef(path);
  const mainRef = useRef<HTMLElement>(null);

  const [section, id, extra] = path.split('/');
  const game = WIIU_PORTS.find((item) => item.slug === id);
  const app = MAC_APPS.find((item) => item.id === id);
  const note = updates.find((item) => item.slug === id);

  useEffect(() => {
    const onHash = () => setPath(readPath());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useLayoutEffect(() => {
    if (lastPath.current !== path) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      mainRef.current?.focus({ preventScroll: true });
      lastPath.current = path;
    }

    if (section === 'home' && !id) {
      document.title = 'Parhelio — Порты для Wii U и приложения для Mac';
    } else if (section === 'games' && game) {
      document.title = `${stories[game.slug].name} на Wii U — Parhelio`;
    } else if (section === 'apps' && app) {
      document.title = `${app.name} для Mac — Parhelio`;
    } else if (section === 'updates' && note) {
      document.title = `${note.title} — Parhelio`;
    } else if (section === 'games') {
      document.title = 'Игры для Wii U — Parhelio';
    } else if (section === 'apps') {
      document.title = 'Приложения для Mac — Parhelio';
    } else if (section === 'updates') {
      document.title = 'Обновления портов — Parhelio';
    } else {
      document.title = 'Страница не найдена — Parhelio';
    }
  }, [path, section, id, game, app, note]);

  // Smooth staggered scroll-reveal on every route navigation
  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
    if (nodes.length === 0) return;

    const vh = window.innerHeight || 900;
    const toObserve: HTMLElement[] = [];

    nodes.forEach((el) => {
      const parent = el.parentElement;
      const siblings = parent
        ? Array.from(parent.children).filter((c) => c.matches(REVEAL_SELECTOR))
        : [el];
      const idx = Math.max(0, siblings.indexOf(el));
      el.style.setProperty('--reveal-delay', `${Math.min(idx * 65, 260)}ms`);
      el.classList.add('reveal-ready');

      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.96) {
        requestAnimationFrame(() => el.classList.add('is-revealed'));
      } else {
        toObserve.push(el);
      }
    });

    if (toObserve.length === 0 || typeof IntersectionObserver === 'undefined') {
      toObserve.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -36px 0px' }
    );

    toObserve.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [path]);

  const isHome = section === 'home' && !id;
  const isGameDetail = section === 'games' && Boolean(game) && !extra;
  const isDarkHeader =
    isHome ||
    (isGameDetail &&
      (game?.slug === 'minecraft' ||
        game?.slug === 'buckshot' ||
        game?.slug === 'subnautica' ||
        game?.slug === 'slime' ||
        game?.slug === 'acnh'));
  const isPersistentDark =
    isGameDetail && (game?.slug === 'buckshot' || game?.slug === 'subnautica');

  const pageTransitionClass = isGameDetail
    ? `page-enter-${game?.slug}`
    : 'page-enter-apple';

  let content;
  if (isHome) {
    content = <HomePage />;
  } else if (section === 'games' && !id) {
    content = <GamesCatalogPage />;
  } else if (section === 'games' && game && !extra) {
    content = <GameDetailPage game={game} />;
  } else if (section === 'apps' && !id) {
    content = <AppsCatalogPage />;
  } else if (section === 'apps' && app && !extra) {
    content = <AppDetailPage app={app} />;
  } else if (section === 'updates' && !id) {
    content = <UpdatesHubPage />;
  } else if (section === 'updates' && note && !extra) {
    content = <UpdateArticlePage note={note} />;
  } else {
    content = (
      <section className="not-found-page">
        <div className="container">
          <h1>Страница не найдена</h1>
          <p>Возможно, ссылка устарела или проект переехал в другой раздел.</p>
          <a className="btn-tactile btn-tactile-blue" href="#home">
            Вернуться на главную
          </a>
        </div>
      </section>
    );
  }

  return (
    <div className="site-root">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Перейти к содержимому
      </a>

      <SiteHeader
        section={section}
        transparentHero={isDarkHeader}
        darkSurface={isPersistentDark}
      />

      <main
        key={path}
        id="main"
        tabIndex={-1}
        ref={mainRef}
        className={`page-stage ${pageTransitionClass}`}
      >
        {content}
      </main>

      {isHome && <SupportBand onOpenSupport={() => setSupportOpen(true)} />}
      <SiteFooter
        onOpenSupport={() => setSupportOpen(true)}
        showSupportButton={!isHome}
      />

      {supportOpen && <SupportModal onClose={() => setSupportOpen(false)} />}
    </div>
  );
}
