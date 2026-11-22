import { useEffect, useRef, useState } from 'react';
import { Check, Coffee, Copy, ExternalLink, Mail, X } from 'lucide-react';
import { DONATE_METHODS, STUDIO_INFO } from '../data/catalog';

export function SupportModal({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [region, setRegion] = useState<'ru' | 'intl'>('ru');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

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
    <dialog
      className="support-modal"
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="support-modal-title"
    >
      <div className="support-modal-inner">
        <div className="support-modal-head">
          <span className="support-badge">
            <Coffee size={16} />
            <span>На кофе и нейронки</span>
          </span>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Закрыть окно"
          >
            <X size={18} />
          </button>
        </div>

        <h2 id="support-modal-title">На кофе и нейросети</h2>
        <p className="support-modal-lead">
          Способы перевода на кофе и оплату моделей.
        </p>

        <div className="segment-control" role="tablist" aria-label="Способ поддержки">
          <button
            type="button"
            role="tab"
            aria-selected={region === 'ru'}
            onClick={() => setRegion('ru')}
          >
            Из России
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={region === 'intl'}
            onClick={() => setRegion('intl')}
          >
            Международно
          </button>
        </div>

        <div key={region} className="support-methods tab-panel-in">
          {DONATE_METHODS[region].map((method) => (
            <a
              key={method.name}
              href={method.href}
              target={method.href.startsWith('http') ? '_blank' : undefined}
              rel={method.href.startsWith('http') ? 'noreferrer' : undefined}
              className="support-method-card"
            >
              <div>
                <strong>{method.name}</strong>
                <span>{method.detail}</span>
              </div>
              <span className="support-method-cta">
                {method.actionLabel}
                <ExternalLink size={14} />
              </span>
            </a>
          ))}
        </div>

        <div className="support-email-row">
          <div className="support-email-info">
            <Mail size={15} />
            <span>{STUDIO_INFO.contactEmail}</span>
          </div>
          <button type="button" className="support-copy-btn" onClick={copyEmail}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}
