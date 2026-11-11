import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import Icon from './icons';
import { STATUS, PAYMENT_META } from './utils';

/* ── Modal base ─────────────────────────────────────────────── */
export function Modal({ open, onClose, children, className = '', size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className={`modal modal-${size} ${className}`} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar" type="button">
          <Icon name="x" size={18} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ── Toasts ─────────────────────────────────────────────────── */
const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const push = useCallback((message, options = {}) => {
    const id = `${Date.now()}-${Math.random()}`;
    setItems((current) => [
      ...current.slice(-2),
      { id, message, tone: options.tone || 'default', icon: options.icon || 'spark' },
    ]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 3800);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className={`toast toast-${item.tone}`}>
            <span className="toast-icon">
              <Icon name={item.icon} size={16} />
            </span>
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ── Controles ──────────────────────────────────────────────── */
export function Qty({ value, onChange, min = 0, max = 99, size = 'md', label = 'cantidad' }) {
  return (
    <div className={`qty qty-${size}`} role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Restar"
      >
        <Icon name="minus" size={size === 'sm' ? 13 : 15} />
      </button>
      <span>{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Sumar"
      >
        <Icon name="plus" size={size === 'sm' ? 13 : 15} />
      </button>
    </div>
  );
}

export function StatusPill({ status, dot = true }) {
  const meta = STATUS[status] || STATUS.recibido;
  return (
    <span className={`status-pill tone-${meta.tone}`}>
      {dot && <i />}
      {meta.label}
    </span>
  );
}

export function PayPill({ payment }) {
  const status = payment?.status || 'pendiente';
  const label =
    status === 'pagado' ? 'Pagado' : status === 'reembolsado' ? 'Reembolsado' : status === 'cancelado' ? 'Anulado' : 'Pago pendiente';
  return (
    <span className={`pay-pill pay-${status}`}>
      <Icon name={PAYMENT_META[payment?.method]?.icon || 'wallet'} size={13} />
      {label}
    </span>
  );
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">
        {label}
        {hint && <small>{hint}</small>}
      </span>
      {children}
    </label>
  );
}

export function Segmented({ options, value, onChange, className = '', size = 'md' }) {
  return (
    <div className={`segmented segmented-${size} ${className}`} role="tablist">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={value === option.id}
          className={value === option.id ? 'is-active' : ''}
          onClick={() => onChange(option.id)}
        >
          {option.icon && <Icon name={option.icon} size={15} />}
          <span>{option.label}</span>
          {option.hint && <small>{option.hint}</small>}
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon = 'spark', title, text, children, className = '' }) {
  return (
    <div className={`empty-state ${className}`}>
      <span className="empty-icon">
        <Icon name={icon} size={26} />
      </span>
      <b>{title}</b>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

export function ConfirmDialog({ open, onClose, title, text, confirmLabel = 'Confirmar', tone = 'danger', onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="confirm-dialog">
        <span className={`confirm-icon tone-${tone}`}>
          <Icon name={tone === 'danger' ? 'alert' : 'checkCircle'} size={24} />
        </span>
        <h3>{title}</h3>
        <p>{text}</p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Volver
          </button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-ink'}`}
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`toggle ${checked ? 'is-on' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <i />
      <span>{label}</span>
    </button>
  );
}

export function Stat({ label, value, hint, icon, tone = 'plain', children }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-top">
        <span>{label}</span>
        {icon && (
          <span className="stat-glyph">
            <Icon name={icon} size={17} />
          </span>
        )}
      </div>
      <b className="stat-value">{value}</b>
      {hint && <small>{hint}</small>}
      {children}
    </article>
  );
}
