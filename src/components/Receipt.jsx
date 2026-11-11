import React from 'react';
import Icon from '../icons';
import { Modal } from '../ui';
import { fmtDateTime, money, orderTotals, PAYMENT_META, receiptHtml, TYPE_META, downloadFile } from '../utils';

export function ReceiptBody({ order, settings }) {
  if (!order) return null;
  const totals = orderTotals(order, settings);
  const paid = order.payment?.status === 'pagado';
  return (
    <div className="receipt-print-area">
      <div className="receipt-head">
        <div className="receipt-brand">
          <span className="brand-mark">m</span>
          <div>
            <b>miga</b>
            <small>bueno, rápido y con amor</small>
          </div>
        </div>
        <span className={`receipt-stamp ${paid ? 'is-paid' : 'is-pending'}`}>
          {paid ? 'Pagado' : order.payment?.status === 'reembolsado' ? 'Reembolsado' : 'Pendiente'}
        </span>
      </div>

      <div className="receipt-code">
        <span>Ticket</span>
        <strong>{order.code}</strong>
        <small>{fmtDateTime(order.created)}</small>
      </div>

      <div className="receipt-meta">
        <div>
          <span>Cliente</span>
          <b>{order.customerName}</b>
        </div>
        <div>
          <span>Modalidad</span>
          <b>
            {TYPE_META[order.type]?.label}
            {order.table ? ` · Mesa ${String(order.table).padStart(2, '0')}` : ''}
          </b>
        </div>
        <div>
          <span>Pago</span>
          <b>{PAYMENT_META[order.payment?.method]?.label || '—'}</b>
        </div>
        <div>
          <span>Estado</span>
          <b>{order.status === 'cancelado' ? 'Cancelado' : paid ? 'Acreditado' : 'A cobrar'}</b>
        </div>
      </div>

      <div className="receipt-lines">
        {order.items.map((item, index) => (
          <div className="receipt-line" key={`${item.productId || item.name}-${index}`}>
            <span className="receipt-qty">{item.qty}×</span>
            <span className="receipt-item">
              <b>{item.name}</b>
              {item.variantLabel && <small>{item.variantLabel}</small>}
            </span>
            <b>{money(item.unitPrice * item.qty)}</b>
          </div>
        ))}
      </div>

      <div className="receipt-totals">
        <div>
          <span>Subtotal</span>
          <b>{money(totals.subtotal)}</b>
        </div>
        <div>
          <span>IVA · 18%</span>
          <b>{money(totals.tax)}</b>
        </div>
        {totals.delivery > 0 && (
          <div>
            <span>Envío</span>
            <b>{money(totals.delivery)}</b>
          </div>
        )}
        {totals.service > 0 && (
          <div>
            <span>Servicio de envío</span>
            <b>{money(totals.service)}</b>
          </div>
        )}
        {totals.discount > 0 && (
          <div className="is-discount">
            <span>Descuento</span>
            <b>− {money(totals.discount)}</b>
          </div>
        )}
        {totals.tip > 0 && (
          <div className="is-tip">
            <span>Propina · equipo Miga</span>
            <b>{money(totals.tip)}</b>
          </div>
        )}
        <div className="receipt-total">
          <span>Total</span>
          <b>{money(totals.total)}</b>
        </div>
      </div>

      {order.note && (
        <div className="receipt-note">
          <span>Nota</span>
          <p>{order.note}</p>
        </div>
      )}

      <div className="receipt-foot">
        <div className="receipt-barcode" aria-hidden="true">
          {String(order.code)
            .split('')
            .concat(['|', '|', '·', '|'])
            .map((char, index) => (
              <i key={index} style={{ width: `${(char.charCodeAt(0) % 3) + 1.5}px` }} />
            ))}
        </div>
        <small>
          Comprobante digital de demostración · {settings?.restaurantName || 'Miga'}
          <br />
          Guardá este ticket para retirar tu pedido.
        </small>
      </div>
    </div>
  );
}

export default function ReceiptModal({ order, settings, open, onClose }) {
  if (!order) return null;
  return (
    <Modal open={open} onClose={onClose} size="sm" className="receipt-modal">
      <div className="receipt-modal-head">
        <div>
          <span className="eyebrow">Comprobante digital</span>
          <h2>Tu ticket, siempre a mano.</h2>
        </div>
      </div>
      <ReceiptBody order={order} settings={settings} />
      <div className="receipt-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => window.print()}
        >
          <Icon name="print" size={16} /> Imprimir
        </button>
        <button
          type="button"
          className="btn btn-ink"
          onClick={() =>
            downloadFile(`miga-${order.code}.html`, receiptHtml(order, settings), 'text/html;charset=utf-8')
          }
        >
          <Icon name="download" size={16} /> Descargar
        </button>
      </div>
    </Modal>
  );
}
