import React, { useState } from 'react';
import { X, Heart, ExternalLink, Copy, Check } from 'lucide-react';
import { DONATE_METHODS } from '../data/catalog';

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ open, onClose }) => {
  const [region, setRegion] = useState<'ru' | 'intl'>('ru');
  const [copiedVal, setCopiedVal] = useState<string | null>(null);

  if (!open) return null;

  const methods = region === 'ru' ? DONATE_METHODS.ru : DONATE_METHODS.intl;

  const copyValue = (val: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedVal(val);
    setTimeout(() => setCopiedVal(null), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0C0E13] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Heart className="h-5 w-5 text-[#E2A856]" />
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Поддержать разработку
              </h2>
              <p className="text-xs text-white/55">
                Все порты и программы бесплатны и открыты для сообщества
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-white/10 p-1.5 text-white/60 hover:border-white/25 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Region Tabs */}
        <div className="mt-4 flex gap-2 rounded-lg border border-white/10 bg-black/40 p-1">
          <button
            type="button"
            onClick={() => setRegion('ru')}
            className={`flex-1 cursor-pointer rounded-md py-2 text-xs font-medium transition ${
              region === 'ru' ? 'bg-white/12 text-white' : 'text-white/55 hover:text-white'
            }`}
          >
            РФ (Альфа-Банк / ЮMoney)
          </button>
          <button
            type="button"
            onClick={() => setRegion('intl')}
            className={`flex-1 cursor-pointer rounded-md py-2 text-xs font-medium transition ${
              region === 'intl' ? 'bg-white/12 text-white' : 'text-white/55 hover:text-white'
            }`}
          >
            International
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {methods.map((m) => (
            <div
              key={m.name}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="font-display text-sm font-semibold text-white">{m.name}</div>
              <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">{m.detail}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={m.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white hover:bg-white/[0.12]"
                >
                  <span>{m.actionLabel}</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>

                {m.valueToCopy && (
                  <button
                    type="button"
                    onClick={() => copyValue(m.valueToCopy)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-mono-tech text-xs text-white/75 hover:border-white/25 hover:text-white"
                  >
                    {copiedVal === m.valueToCopy ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copiedVal === m.valueToCopy ? 'Скопировано' : m.valueToCopy}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
