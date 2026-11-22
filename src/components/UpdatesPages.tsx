import { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Gamepad2,
  Newspaper,
} from 'lucide-react';
import { formatDate, PortUpdate, stories, updates } from '../data/editorial';

export function PortUpdatesStrip({
  gameSlug,
  theme = 'light',
}: {
  gameSlug?: string;
  theme?: 'light' | 'dark' | 'ocean';
}) {
  const items = gameSlug
    ? [
        ...updates.filter((u) => u.game === gameSlug),
        ...updates.filter((u) => u.game !== gameSlug).slice(0, 2),
      ]
    : updates;

  return (
    <section className={`game-updates-band theme-strip-${theme}`}>
      <div className="container">
        <div className="section-heading-row">
          <div>
            <span className="section-eyebrow">
              <Newspaper size={15} />
              <span>Журнал обновлений</span>
            </span>
            <h2>
              {gameSlug
                ? `Обновления и соседние порты`
                : 'Последние обновления портов'}
            </h2>
          </div>
          <a className="section-more-link" href="#updates">
            <span>Все записи</span>
            <ArrowUpRight size={17} />
          </a>
        </div>

        <div className="updates-strip-grid">
          {items.map((note) => (
            <a
              key={note.slug}
              href={`#updates/${note.slug}`}
              className={`strip-update-card ${
                note.game === gameSlug ? 'is-featured' : ''
              }`}
            >
              <div className="strip-update-thumb">
                <img src={note.heroImage} alt={note.title} loading="lazy" />
                <span className="mc-news-tag">{note.tag}</span>
              </div>
              <div className="strip-update-body">
                <span className="strip-update-game">
                  {stories[note.game].shortTitle} · {formatDate(note.date)}
                </span>
                <h3>{note.title}</h3>
                <p>{note.summary}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function UpdatesHubPage() {
  const [filter, setFilter] = useState<string>('all');

  const visible =
    filter === 'all' ? updates : updates.filter((u) => u.game === filter);

  return (
    <div className="catalog-page">
      <section className="catalog-hero">
        <div className="container">
          <span className="section-eyebrow">
            <Newspaper size={15} />
            <span>Журнал разработки портов</span>
          </span>
          <h1>Обновления портов Wii U</h1>
          <p className="catalog-lead">
            Заметки о релизах, локальном мультиплеере на двух экранах, замерах
            FPS на реальной Wii U и ходе портирования движков.
          </p>

          <div className="filter-pills" role="group" aria-label="Фильтр по игре">
            <button
              type="button"
              className={filter === 'all' ? 'is-active' : ''}
              onClick={() => setFilter('all')}
            >
              Все игры ({updates.length})
            </button>
            {Object.entries(stories).map(([slug, story]) => (
              <button
                key={slug}
                type="button"
                className={filter === slug ? 'is-active' : ''}
                onClick={() => setFilter(slug)}
              >
                {story.shortTitle}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="catalog-body">
        <div className="container">
          <div key={filter} className="updates-hub-grid filter-grid-in">
            {visible.map((note, idx) => (
              <a
                key={note.slug}
                href={`#updates/${note.slug}`}
                className="hub-update-card"
                style={{ animationDelay: `${idx * 55}ms` }}
              >
                <div className="hub-update-img">
                  <img src={note.heroImage} alt={note.title} loading="lazy" />
                  <span className="mc-news-tag">{note.tag}</span>
                </div>
                <div className="hub-update-content">
                  <div className="hub-update-meta">
                    <span>{stories[note.game].shortTitle}</span>
                    <span>·</span>
                    <time dateTime={note.date}>{formatDate(note.date)}</time>
                  </div>
                  <h2>{note.title}</h2>
                  <p>{note.summary}</p>
                  <span className="hub-read-more">
                    Читать запись <ArrowUpRight size={15} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function UpdateArticlePage({ note }: { note: PortUpdate }) {
  const story = stories[note.game];
  const others = updates.filter((u) => u.slug !== note.slug).slice(0, 3);

  return (
    <article className="article-page">
      <div className="container article-header-wrap">
        <a className="back-pill" href="#updates">
          <ArrowLeft size={16} />
          <span>Все обновления</span>
        </a>

        <div className="article-meta-row">
          <span className="mc-news-tag">{note.tag}</span>
          <span className="article-game-pill">{story.name}</span>
          <span className="article-date">
            <Calendar size={14} />
            <time dateTime={note.date}>{formatDate(note.date)}</time>
          </span>
        </div>

        <h1>{note.title}</h1>
        <p className="article-intro">{note.intro}</p>
      </div>

      <div className="container article-hero-frame">
        <img src={note.heroImage} alt={note.title} />
      </div>

      <div className="container article-body-grid">
        <div className="article-prose">
          {note.sections.map((sec) => (
            <section key={sec.heading}>
              <h2>{sec.heading}</h2>
              <p>{sec.body}</p>
            </section>
          ))}
        </div>

        <aside className="article-sidebar">
          {note.changelog && (
            <div className="article-box">
              <h3>Ключевые изменения</h3>
              <ul className="article-checklist">
                {note.changelog.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="article-box article-box-cta">
            <span className="section-eyebrow">
              <Gamepad2 size={14} />
              <span>{story.status}</span>
            </span>
            <h3>{story.name}</h3>
            <p>{story.deck}</p>
            <a
              className="btn-tactile btn-tactile-blue w-full"
              href={`#games/${note.game}`}
            >
              <span>Открыть страницу порта</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </aside>
      </div>

      <div className="container article-more">
        <h2>Другие записи журнала</h2>
        <div className="updates-strip-grid">
          {others.map((item) => (
            <a
              key={item.slug}
              href={`#updates/${item.slug}`}
              className="strip-update-card"
            >
              <div className="strip-update-thumb">
                <img src={item.heroImage} alt={item.title} loading="lazy" />
                <span className="mc-news-tag">{item.tag}</span>
              </div>
              <div className="strip-update-body">
                <span className="strip-update-game">
                  {stories[item.game].shortTitle} · {formatDate(item.date)}
                </span>
                <h3>{item.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
