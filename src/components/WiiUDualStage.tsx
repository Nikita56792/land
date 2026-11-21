import React, { useEffect, useRef, useState } from 'react';
import { Monitor, Gamepad2, Volume2, Layers } from 'lucide-react';
import { GamePort } from '../data/catalog';

interface WiiUDualStageProps {
  games: GamePort[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * Interactive dual-screen visualization:
 * 16:9 Living-Room TV on the upper optical plane + centered Wii U GamePad
 * overlapping the foreground with a live 854x480 DRC inset in the center.
 */
export const WiiUDualStage: React.FC<WiiUDualStageProps> = ({
  games,
  activeId,
  onSelect,
}) => {
  const activeGame = games.find((g) => g.id === activeId) ?? games[0];
  const tvVideoRef = useRef<HTMLVideoElement | null>(null);
  const padVideoRef = useRef<HTMLVideoElement | null>(null);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const syncPlay = (el: HTMLVideoElement | null) => {
      if (!el) return;
      el.currentTime = 0;
      el.play().catch(() => {});
    };
    syncPlay(tvVideoRef.current);
    syncPlay(padVideoRef.current);
  }, [activeGame.id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setPointerOffset({ x: nx * 10, y: ny * 6 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPointerOffset({ x: 0, y: 0 })}
      className="relative mx-auto max-w-[1160px] select-none pt-2"
    >
      {/* Ambient backlight reactive to active game */}
      <div
        className="pointer-events-none absolute left-1/2 top-14 -z-10 h-72 w-[78%] -translate-x-1/2 rounded-full blur-[110px] transition-colors duration-700"
        style={{ backgroundColor: `${activeGame.accentHex}24` }}
      />

      {/* Game selector pill rail above stage */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        {games.map((game) => {
          const selected = game.id === activeGame.id;
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => onSelect(game.id)}
              className={`group flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                selected
                  ? 'border-white/30 bg-white/[0.08] text-white shadow-sm'
                  : 'border-white/8 bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white/90'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full transition-transform group-hover:scale-125"
                style={{
                  backgroundColor: selected ? game.accentHex : 'rgba(255,255,255,0.25)',
                  boxShadow: selected ? `0 0 10px ${game.accentHex}` : 'none',
                }}
              />
              <span>{game.title.replace(': Wii U Edition', '')}</span>
              <span className="font-mono-tech text-[10px] opacity-55">
                {game.statusTone === 'ready'
                  ? 'READY'
                  : game.statusTone === 'playable'
                    ? 'BETA'
                    : 'R&D'}
              </span>
            </button>
          );
        })}
      </div>

      {/* UPPER PLANE: 16:9 TV Display */}
      <div
        className="relative mx-auto w-full max-w-[920px] transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${pointerOffset.x * 0.4}px, ${pointerOffset.y * 0.35}px, 0)`,
        }}
      >
        <div className="rounded-xl border border-white/15 bg-[#0C0E13] p-2 shadow-[0_32px_90px_rgba(0,0,0,0.78)] sm:p-3">
          {/* TV Top Telemetry Bar */}
          <div className="mb-2 flex items-center justify-between px-1.5 text-[11px] font-mono-tech text-white/50">
            <div className="flex items-center gap-2">
              <Monitor className="h-3.5 w-3.5" style={{ color: activeGame.accentHex }} />
              <span>TV · HDMI 1080P · PLAYER 1</span>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-white/70">{activeGame.tvRole}</span>
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                style={{
                  backgroundColor: `${activeGame.accentHex}1F`,
                  color: activeGame.accentHex,
                }}
              >
                {activeGame.fpsTarget}
              </span>
            </div>
          </div>

          {/* TV 16:9 Screen Viewport */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black">
            <video
              ref={tvVideoRef}
              key={`tv-${activeGame.id}`}
              src={activeGame.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover opacity-90"
            />
            <div className="screen-scanlines pointer-events-none absolute inset-0 opacity-35" />

            {/* Crisp Screen-Role Watermark HUD */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-6">
              <div className="rounded border border-white/15 bg-black/65 px-3 py-1.5 backdrop-blur-md">
                <div className="font-mono-tech text-[10px] uppercase tracking-widest text-white/55">
                  DISPLAY 01 // TV OUTPUT
                </div>
                <div className="mt-0.5 font-display text-sm font-semibold text-white sm:text-base">
                  {activeGame.title}
                </div>
              </div>
              <div className="hidden items-center gap-1.5 rounded border border-white/15 bg-black/65 px-2.5 py-1 font-mono-tech text-[10px] text-white/75 backdrop-blur-md sm:flex">
                <Volume2 className="h-3 w-3" style={{ color: activeGame.accentHex }} />
                <span>TV AUDIO STREAM</span>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-10 left-4 hidden rounded border border-white/10 bg-black/60 px-3 py-1.5 font-mono-tech text-[11px] text-white/75 backdrop-blur-md sm:block md:bottom-14">
              {activeGame.dualScreenMode}
            </div>
          </div>
        </div>

        {/* Minimal TV neck indicator */}
        <div className="mx-auto h-4 w-28 border-x border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent" />
      </div>

      {/* LOWER FOREGROUND PLANE: Wii U GamePad with Centered DRC Screen Inset */}
      <div
        className="relative z-10 mx-auto -mt-8 w-full max-w-[680px] transition-transform duration-300 ease-out sm:-mt-14"
        style={{
          transform: `translate3d(${pointerOffset.x * -0.65}px, ${pointerOffset.y * -0.5}px, 0)`,
        }}
      >
        <div className="relative rounded-[34px] border border-white/20 bg-gradient-to-b from-[#1A1D24] via-[#13151B] to-[#0D0F14] px-4 py-4 shadow-[0_28px_80px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.12)] sm:rounded-[46px] sm:px-7 sm:py-5">
          {/* Top bezel: camera + sensor bar */}
          <div className="mb-2 flex items-center justify-center gap-4">
            <span className="h-1.5 w-8 rounded-full bg-white/10" />
            <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full border border-white/20 bg-black">
              <span className="h-1 w-1 rounded-full bg-[#38BDF8]/70" />
            </span>
            <span className="h-1.5 w-8 rounded-full bg-white/10" />
          </div>

          <div className="grid grid-cols-[54px_1fr_54px] items-center gap-2.5 sm:grid-cols-[96px_1fr_96px] sm:gap-5">
            {/* LEFT GRIP CONTROLS: Left Stick + D-Pad + Minus */}
            <div className="flex flex-col items-center justify-between gap-4 py-1 sm:gap-6">
              {/* Left Analog Stick */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#0A0C10] shadow-inner sm:h-14 sm:w-14">
                <div className="h-6 w-6 rounded-full border border-white/20 bg-gradient-to-b from-[#2A2E39] to-[#171920] sm:h-9 sm:w-9" />
              </div>

              {/* D-Pad */}
              <div className="relative h-10 w-10 sm:h-12 sm:w-12">
                <div className="absolute left-1/2 top-0 h-full w-3.5 -translate-x-1/2 rounded-[3px] border border-white/10 bg-[#1F232C] sm:w-4" />
                <div className="absolute left-0 top-1/2 h-3.5 w-full -translate-y-1/2 rounded-[3px] border border-white/10 bg-[#1F232C] sm:h-4" />
              </div>

              {/* Speaker slit + Status LED */}
              <div className="hidden items-center gap-1.5 sm:flex">
                <span className="h-1 w-4 rounded-full bg-white/10" />
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38BDF8]" />
              </div>
            </div>

            {/* CENTER INSET: 16:9 (854x480) Wii U GamePad DRC Screen */}
            <div className="relative flex flex-col">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border-2 border-[#08090C] bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.12),inset_0_0_24px_rgba(0,0,0,0.85)]">
                <video
                  ref={padVideoRef}
                  key={`pad-${activeGame.id}`}
                  src={activeGame.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full scale-[1.06] object-cover brightness-95 contrast-110"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, transparent 45%, rgba(7,8,10,0.68) 100%)`,
                  }}
                />
                <div className="screen-scanlines pointer-events-none absolute inset-0 opacity-45" />

                {/* GamePad Second-Screen Live Overlay */}
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2.5 sm:p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded bg-black/75 px-2 py-0.5 font-mono-tech text-[9px] text-white/85 backdrop-blur sm:text-[10px]">
                      <Gamepad2 className="h-3 w-3" style={{ color: activeGame.accentHex }} />
                      <span>DRC 854×480 · PLAYER 2</span>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 font-mono-tech text-[9px] text-white/60 backdrop-blur">
                      <Layers className="h-2.5 w-2.5" style={{ color: activeGame.accentHex }} />
                      <span>TOUCH UI</span>
                    </div>
                  </div>

                  {/* Distinct P2 Role Readout */}
                  <div className="rounded border border-white/15 bg-black/75 px-2.5 py-1.5 backdrop-blur-md">
                    <div
                      className="font-mono-tech text-[9px] uppercase tracking-wider sm:text-[10px]"
                      style={{ color: activeGame.accentHex }}
                    >
                      Wii U GamePad · Независимый экран
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-white/90 sm:text-xs">
                      {activeGame.gamepadRole}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom GamePad Hardware Strip: TV / HOME / POWER */}
              <div className="mt-2.5 flex items-center justify-center gap-5 sm:gap-7">
                <span className="font-mono-tech text-[9px] tracking-widest text-white/35">TV</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-[#0A0C10] text-[8px] text-white/60">
                  ⌂
                </span>
                <span className="font-mono-tech text-[9px] tracking-widest text-white/35">PWR</span>
              </div>
            </div>

            {/* RIGHT GRIP CONTROLS: Right Stick + ABXY + Plus */}
            <div className="flex flex-col items-center justify-between gap-4 py-1 sm:gap-6">
              {/* Right Analog Stick */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#0A0C10] shadow-inner sm:h-14 sm:w-14">
                <div className="h-6 w-6 rounded-full border border-white/20 bg-gradient-to-b from-[#2A2E39] to-[#171920] sm:h-9 sm:w-9" />
              </div>

              {/* A / B / X / Y diamond */}
              <div className="relative h-11 w-11 text-[8px] font-mono-tech font-semibold text-white/75 sm:h-13 sm:w-13 sm:text-[9px]">
                <span className="absolute left-1/2 top-0 flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full border border-white/15 bg-[#1F232C] sm:h-4 sm:w-4">
                  X
                </span>
                <span className="absolute right-0 top-1/2 flex h-3.5 w-3.5 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#1F232C] sm:h-4 sm:w-4">
                  A
                </span>
                <span className="absolute left-0 top-1/2 flex h-3.5 w-3.5 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#1F232C] sm:h-4 sm:w-4">
                  Y
                </span>
                <span className="absolute bottom-0 left-1/2 flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full border border-white/15 bg-[#1F232C] sm:h-4 sm:w-4">
                  B
                </span>
              </div>

              <div className="hidden items-center gap-1.5 sm:flex">
                <span className="h-1 w-4 rounded-full bg-white/10" />
                <span className="h-1 w-1.5 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
