import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUp, Check, Coffee, Copy, Github, Menu, X } from 'lucide-react';
import { MAC_APPS, STUDIO_INFO, WIIU_PORTS } from '../data/catalog';
import { stories } from '../data/editorial';

const NAV_ITEMS = [
  { key: 'home', label: 'Главная' },
  { key: 'games', label: 'Игры Wii U' },
  { key: 'apps', label: 'Приложения Mac' },
  { key: 'updates', label: 'Обновления' },
] as const;

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`brand-mark ${light ? 'is-light' : ''}`}
      href="#home"
      aria-label="REAL LAB — на главную"
    >
      <img src="./mark.svg" alt="" width={34} height={34} />
      <span>
        REAL <em>//</em> LAB
      </span>
    </a>
  );
}

interface SiteHeaderProps {
  section: string;
  transparentHero?: boolean;
  darkSurface?: boolean;
}

export function SiteHeader({
  section,
  transparentHero = false,
  darkSurface = false,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{
    x: number;
    w: number;
    ready: boolean;
  }>({ x: 0, w: 0, ready: false });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [section]);

  useLayoutEffect(() => {
    const updatePill = () => {
      const nav = navRef.current;
      const activeKey = NAV_ITEMS.some((i) => i.key === section)
        ? section
        : 'home';
      const el = linkRefs.current[activeKey];
      if (!nav || !el) return;
      const navRect = nav.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      if (elRect.width > 0) {
        setIndicator({
          x: elRect.left - navRect.left,
          w: elRect.width,
          ready: true,
        });
      }
    };
    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [section]);

  const overDark = (transparentHero && !scrolled) || darkSurface;

  return (
    <header
      className={`site-header ${overDark ? 'is-dark' : 'is-light'} ${
        scrolled ? 'is-scrolled' : ''
      }`}
    >
      <div className="container header-row">
        <BrandMark light={overDark} />

        <nav className="nav-desktop" ref={navRef} aria-label="Основные разделы">
          <span
            className="nav-glide-pill"
            aria-hidden="true"
            style={{
              opacity: indicator.ready ? 1 : 0,
              width: `${indicator.w}px`,
              transform: `translate3d(${indicator.x}px, 0, 0)`,
            }}
          />
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              ref={(node) => {
                linkRefs.current[item.key] = node;
              }}
              href={`#${item.key}`}
              className={section === item.key ? 'is-current' : ''}
              aria-current={section === item.key ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="mobile-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="mobile-drawer"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="mobile-drawer"
          id="mobile-drawer"
          aria-label="Мобильное меню"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={`#${item.key}`}
              className={section === item.key ? 'is-current' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="mobile-drawer-foot">
            <a
              href={STUDIO_INFO.githubProfileUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={16} /> GitHub @Nikita56792
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SupportBand({ onOpenSupport }: { onOpenSupport: () => void }) {
  return (
    <section className="support-band" aria-label="На кофе и модели">
      <div className="support-band-pattern" aria-hidden="true" />
      <div className="container support-band-inner">
        <div className="support-band-copy">
          <h2>На кофе и нейросети</h2>
          <p>Донат на кофе, токены и оплату моделей.</p>
        </div>
        <div className="support-band-actions">
          <button
            type="button"
            className="btn-tactile btn-tactile-coral"
            onClick={onOpenSupport}
          >
            <Coffee size={17} />
            <span>Поддержать</span>
          </button>
          <a
            className="btn-tactile btn-tactile-light"
            href={STUDIO_INFO.githubProfileUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Github size={17} />
            <span>GitHub @Nikita56792</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter({
  onOpenSupport,
  showSupportButton = false,
}: {
  onOpenSupport: () => void;
  showSupportButton?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(STUDIO_INFO.contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${STUDIO_INFO.contactEmail}`;
    }
  };

  return (
    <footer className="rpcs-footer">
      <div className="rpcs-footer-wave" aria-hidden="true" />
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <BrandMark light />
            <p>
              Нативные порты игр для Nintendo Wii U (Cafe OS / Aroma) и
              инженерный софт под Apple Silicon.
            </p>
            <div className="footer-email-pill">
              <a href={`mailto:${STUDIO_INFO.contactEmail}`}>
                {STUDIO_INFO.contactEmail}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                aria-label={copied ? 'Скопировано' : 'Копировать почту'}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="footer-col">
            <h4>Разделы</h4>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <a href={`#${item.key}`}>{item.label}</a>
                </li>
              ))}
              <li>
                <button type="button" onClick={onOpenSupport}>
                  Поддержать проект
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Порты Wii U</h4>
            <ul>
              {WIIU_PORTS.map((game) => (
                <li key={game.id}>
                  <a href={`#games/${game.slug}`}>
                    {stories[game.slug].shortTitle}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Приложения Mac</h4>
            <ul>
              {MAC_APPS.map((app) => (
                <li key={app.id}>
                  <a href={`#apps/${app.id}`}>
                    {app.name} ({app.version})
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>GitHub</h4>
            <ul>
              <li>
                <a
                  href={STUDIO_INFO.githubProfileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Профиль @Nikita56792
                </a>
              </li>
              <li>
                <a
                  href={STUDIO_INFO.landingRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Репозиторий сайта
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Nikita56792/epidaurus"
                  target="_blank"
                  rel="noreferrer"
                >
                  Epidaurus
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Nikita56792/kraken"
                  target="_blank"
                  rel="noreferrer"
                >
                  Kraken
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Nikita56792/real3d"
                  target="_blank"
                  rel="noreferrer"
                >
                  Real3D
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Nikita56792/fovea"
                  target="_blank"
                  rel="noreferrer"
                >
                  Fovea
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-signoff">
            <img src="./mark.svg" alt="" width={24} height={24} />
            <span className="footer-signoff-brand">
              REAL <em>//</em> LAB
            </span>
            <span className="footer-signoff-sep" aria-hidden="true">·</span>
            <a
              className="footer-signoff-handle"
              href={STUDIO_INFO.githubProfileUrl}
              target="_blank"
              rel="noreferrer"
            >
              Nikita56792
            </a>
          </div>

          <div className="footer-bottom-actions">
            {showSupportButton && (
              <button
                type="button"
                className="footer-support-btn"
                onClick={onOpenSupport}
              >
                <Coffee size={15} />
                <span>Поддержать</span>
              </button>
            )}
            <button
              type="button"
              className="scroll-top-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Наверх"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
