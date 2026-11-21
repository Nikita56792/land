import React, { useState } from 'react';
import {
  Cpu,
  Terminal,
  ShieldAlert,
  Play,
  Check,
  Send,
  Copy,
  Tv,
  Gamepad2,
} from 'lucide-react';
import {
  WIIU_PORTS,
  PORTING_PIPELINE,
  STUDIO_INFO,
  GamePort,
} from '../data/catalog';
import { WiiUDualStage } from './WiiUDualStage';
import { DownloadButtons } from './DownloadButtons';

interface GamesViewProps {
  onOpenSupport: () => void;
}

export const GamesView: React.FC<GamesViewProps> = ({ onOpenSupport }) => {
  const [stageGameId, setStageGameId] = useState<string>(WIIU_PORTS[0].id);

  // Rightsholder notice form state
  const [claimProject, setClaimProject] = useState('Slime Rancher (Wii U Port)');
  const [claimOrg, setClaimOrg] = useState('');
  const [claimEmail, setClaimEmail] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [claimCopied, setClaimCopied] = useState(false);

  const formattedClaim = [
    `To: ${STUDIO_INFO.contactEmail}`,
    `Subject: Rightsholder Removal / DMCA Notice — ${claimProject}`,
    `Organization / Rightsholder: ${claimOrg || '(не указано)'}`,
    `Reply-To: ${claimEmail || '(не указано)'}`,
    '',
    claimMessage || 'Просьба удалить дистрибутив и/или исходный код указанного проекта из публичного доступа.',
  ].join('\n');

  const mailtoHref = `mailto:${STUDIO_INFO.contactEmail}?subject=${encodeURIComponent(
    `Rightsholder Notice: ${claimProject}`
  )}&body=${encodeURIComponent(formattedClaim)}`;

  const handleCopyClaim = () => {
    navigator.clipboard?.writeText(formattedClaim);
    setClaimCopied(true);
    setTimeout(() => setClaimCopied(false), 2000);
  };

  return (
    <div className="space-y-24 pb-24">
      {/* HERO + DUAL-SCREEN CENTERPIECE */}
      <section id="sec-wiiu-stage" className="relative pt-10 sm:pt-14">
        <div className="mx-auto max-w-[1260px] px-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/25 bg-[#38BDF8]/10 px-3 py-1 font-mono-tech text-[11px] tracking-wider text-[#38BDF8]">
              <span>NINTENDO WII U · AROMA .WUHB / CAFE OS RPX</span>
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.08]">
              Нативные порты на Wii U и кооператив на двух экранах
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#9CA3AF] sm:text-base">
              Игры без split-screen и костылей облачного стриминга: первый игрок на телевизоре, второй — на экране{' '}
              <span className="text-white">Wii U GamePad</span> с собственным интерфейсом и звуком.
            </p>
          </div>

          <div className="mt-10">
            <WiiUDualStage
              games={WIIU_PORTS}
              activeId={stageGameId}
              onSelect={setStageGameId}
            />
          </div>
        </div>
      </section>

      {/* INDIVIDUAL GAME SHOWCASE BANDS */}
      <section className="mx-auto max-w-[1260px] space-y-20 px-4 sm:px-8">
        {WIIU_PORTS.map((game, index) => (
          <GameShowcaseBand
            key={game.id}
            game={game}
            index={index}
            isActiveOnStage={game.id === stageGameId}
            onPreviewOnStage={() => {
              setStageGameId(game.id);
              document.getElementById('sec-wiiu-stage')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenSupport={onOpenSupport}
          />
        ))}
      </section>

      {/* TRANSLATOR ARCHITECTURE & PLANNED SD LAUNCHER */}
      <section id="sec-wiiu-pipeline" className="mx-auto max-w-[1260px] px-4 sm:px-8">
        <div className="border-t border-white/10 pt-14">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="font-mono-tech text-xs uppercase tracking-[0.16em] text-[#38BDF8]">
                Под капотом · R&D стек
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Инструментарий трансляции и будущий SD-лаунчер
              </h2>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-white/55 sm:text-sm">
              Собственные трансляторы собирают код под PowerPC и графический API GX2 с открытой архитектурой.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PORTING_PIPELINE.map((item) => (
              <div
                key={item.code}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20"
              >
                <div className="inline-flex items-center gap-2 rounded bg-white/[0.05] px-2.5 py-1 font-mono-tech text-[11px] text-[#38BDF8]">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>{item.code}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RIGHTSHOLDERS / TAKEDOWN SECTION */}
      <section id="sec-rightsholders" className="mx-auto max-w-[1260px] px-4 sm:px-8">
        <div className="rounded-2xl border border-white/10 bg-[#0B0D11] p-6 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 font-mono-tech text-xs uppercase tracking-wider text-amber-300">
                <ShieldAlert className="h-4 w-4" />
                <span>Правообладателям / Rightsholders Notice</span>
              </div>
              <h2 className="font-display text-2xl font-semibold text-white">
                Запрос на удаление дистрибутива или исходного кода
              </h2>
              <p className="text-sm leading-relaxed text-[#9CA3AF]">
                Все порты распространяются некоммерчески и бесплатно в образовательных и исследовательских целях.
                Если вы являетесь официальным представителем студии или правообладателя (Mojang / Microsoft,
                Mike Klubnika, Monomi Park, Unknown Worlds и др.) и требуете закрыть скачивание сборки или исходного кода,
                воспользуйтесь формой или напишите напрямую на{' '}
                <a
                  href={`mailto:${STUDIO_INFO.contactEmail}`}
                  className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
                >
                  {STUDIO_INFO.contactEmail}
                </a>
                .
              </p>
              <div className="rounded-lg border border-white/8 bg-white/[0.02] p-4 font-mono-tech text-xs text-white/60">
                Для проектов со строгими лицензионными ограничениями (например, Subnautica) финальный формат — чистый
                адаптер, требующий собственную легальную копию игры пользователя.
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = mailtoHref;
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-xs">
                  <span className="font-mono-tech text-white/60">Проект</span>
                  <select
                    value={claimProject}
                    onChange={(e) => setClaimProject(e.target.value)}
                    className="w-full rounded-lg border border-white/12 bg-[#07080A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]"
                  >
                    <option value="Minecraft: Wii U DualScreen">Minecraft: Wii U DualScreen</option>
                    <option value="Buckshot Roulette (Wii U Port)">Buckshot Roulette (Wii U Port)</option>
                    <option value="Slime Rancher (Wii U Port)">Slime Rancher (Wii U Port)</option>
                    <option value="Subnautica (Wii U Adapter)">Subnautica (Wii U Adapter)</option>
                  </select>
                </label>

                <label className="block space-y-1.5 text-xs">
                  <span className="font-mono-tech text-white/60">Организация / Студия</span>
                  <input
                    type="text"
                    value={claimOrg}
                    onChange={(e) => setClaimOrg(e.target.value)}
                    placeholder="Например: Monomi Park Legal"
                    className="w-full rounded-lg border border-white/12 bg-[#07080A] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-[#38BDF8]"
                  />
                </label>
              </div>

              <label className="block space-y-1.5 text-xs">
                <span className="font-mono-tech text-white/60">Контактный Email правообладателя</span>
                <input
                  type="email"
                  value={claimEmail}
                  onChange={(e) => setClaimEmail(e.target.value)}
                  placeholder="legal@studio.com"
                  className="w-full rounded-lg border border-white/12 bg-[#07080A] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-[#38BDF8]"
                />
              </label>

              <label className="block space-y-1.5 text-xs">
                <span className="font-mono-tech text-white/60">Суть запроса (бинарник / репозиторий)</span>
                <textarea
                  rows={3}
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  placeholder="Укажите URL релиза или репозитория для немедленного снятия с публикации."
                  className="w-full rounded-lg border border-white/12 bg-[#07080A] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-[#38BDF8]"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-[#07080A] transition hover:bg-white/90"
                >
                  <Send className="h-4 w-4" />
                  <span>Отправить уведомление (Mail)</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyClaim}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/12 px-4 py-2.5 text-sm text-white/80 transition hover:border-white/25 hover:text-white"
                >
                  {claimCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{claimCopied ? 'Текст скопирован' : 'Скопировать шаблон запроса'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

interface GameShowcaseBandProps {
  game: GamePort;
  index: number;
  isActiveOnStage: boolean;
  onPreviewOnStage: () => void;
  onOpenSupport: () => void;
}

const GameShowcaseBand: React.FC<GameShowcaseBandProps> = ({
  game,
  index,
  isActiveOnStage,
  onPreviewOnStage,
  onOpenSupport,
}) => {
  const reverse = index % 2 === 1;

  return (
    <article
      id={`game-${game.slug}`}
      className="relative rounded-2xl border border-white/10 bg-[#0A0C10]/90 p-5 sm:p-8 lg:p-10"
      style={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      <div className={`grid items-center gap-8 lg:grid-cols-12 lg:gap-12`}>
        {/* Media / Video Preview Column */}
        <div className={`lg:col-span-6 ${reverse ? 'lg:order-2' : ''}`}>
          <div className="group relative overflow-hidden rounded-xl border border-white/12 bg-black">
            <div className="relative aspect-video w-full">
              <video
                src={game.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="screen-scanlines pointer-events-none absolute inset-0 opacity-30" />

              {/* Top Overlay Strip */}
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                <span
                  className="rounded px-2.5 py-1 font-mono-tech text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md"
                  style={{
                    backgroundColor: `${game.accentHex}24`,
                    color: game.accentHex,
                    border: `1px solid ${game.accentHex}44`,
                  }}
                >
                  {game.badge}
                </span>

                <button
                  type="button"
                  onClick={onPreviewOnStage}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-white/20 bg-black/70 px-2.5 py-1 font-mono-tech text-[10px] text-white/90 backdrop-blur transition hover:border-white/40 hover:bg-black"
                >
                  <Play className="h-3 w-3" style={{ color: game.accentHex }} />
                  <span>{isActiveOnStage ? 'На TV + GamePad' : 'Вывести на TV + GamePad'}</span>
                </button>
              </div>
            </div>

            {/* Dual-Screen Role Footer inside media card */}
            <div className="grid divide-y divide-white/8 border-t border-white/10 bg-[#08090C] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="p-3">
                <div className="flex items-center gap-1.5 font-mono-tech text-[10px] text-white/45">
                  <Tv className="h-3 w-3" style={{ color: game.accentHex }} />
                  <span>TV ЭКРАН</span>
                </div>
                <p className="mt-1 text-xs leading-snug text-white/85">{game.tvRole}</p>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5 font-mono-tech text-[10px] text-white/45">
                  <Gamepad2 className="h-3 w-3" style={{ color: game.accentHex }} />
                  <span>WII U GAMEPAD</span>
                </div>
                <p className="mt-1 text-xs leading-snug text-white/85">{game.gamepadRole}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info & Specs Column */}
        <div className={`space-y-5 lg:col-span-6 ${reverse ? 'lg:order-1' : ''}`}>
          <div>
            <div className="font-mono-tech text-xs tracking-wider" style={{ color: game.accentHex }}>
              0{index + 1} // {game.engineStack}
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {game.title}
            </h2>
            <p className="mt-1 text-sm font-medium text-white/60">{game.subtitle}</p>
          </div>

          <p className="text-sm leading-relaxed text-[#9CA3AF] sm:text-base">{game.summary}</p>

          {/* Compact 2x2 Telemetry Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {game.telemetry.map((t) => (
              <div
                key={t.label}
                className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2"
              >
                <div className="font-mono-tech text-[10px] uppercase tracking-wider text-white/40">
                  {t.label}
                </div>
                <div className="mt-0.5 text-xs font-medium text-white sm:text-sm">{t.value}</div>
              </div>
            ))}
          </div>

          {/* Engineering Bullet List */}
          <ul className="space-y-1.5 text-sm text-[#D1D5DB]">
            {game.highlights.map((hl) => (
              <li key={hl} className="flex items-start gap-2.5">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: game.accentHex }}
                />
                <span>{hl}</span>
              </li>
            ))}
          </ul>

          {/* SD Card Path */}
          <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/50 px-3 py-2 font-mono-tech text-xs text-white/65">
            <Terminal className="h-3.5 w-3.5 shrink-0 text-white/40" />
            <span className="truncate">{game.installPath}</span>
          </div>

          {game.notice && (
            <div className="rounded-lg border border-sky-400/20 bg-sky-400/[0.06] px-3.5 py-2 text-xs text-sky-100/85">
              {game.notice}
            </div>
          )}

          <DownloadButtons
            mirrors={game.mirrors}
            accentHex={game.accentHex}
            onDonateClick={onOpenSupport}
          />
        </div>
      </div>
    </article>
  );
};
