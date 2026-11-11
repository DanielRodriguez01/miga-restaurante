// Utilidades compartidas por toda la app.

export const money = (value) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const fmtTime = (ts) =>
  ts
    ? new Date(ts).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : '—';

export const fmtDate = (ts) =>
  ts
    ? new Date(ts).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export const fmtDateTime = (ts) => `${fmtDate(ts)} · ${fmtTime(ts)}`;

export const timeAgo = (ts) => {
  if (!ts) return '';
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
};

export const countdown = (target, now = Date.now()) => {
  const diff = Math.max(0, target - now);
  const total = Math.ceil(diff / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const uid = (prefix = 'id') =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const cn = (...args) => args.filter(Boolean).join(' ');

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const hexToRgba = (hex, alpha = 1) => {
  const clean = (hex || '#d1502a').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const orderSubtotal = (order) =>
  (order?.items || []).reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

export const orderTotals = (order, settings) => {
  const subtotal = orderSubtotal(order);
  const tax = Math.round(subtotal * (settings?.tax ?? 0.18));
  const delivery = order?.type === 'delivery' ? order.deliveryFee ?? settings?.deliveryFee ?? 0 : 0;
  const service =
    order?.type === 'delivery'
      ? Math.round(subtotal * (order.servicePct ?? settings?.deliveryService ?? 0))
      : 0;
  const discount = Math.round(order?.discount || 0);
  const tip = Math.round(order?.tip || 0);
  const total = Math.max(0, subtotal + tax + delivery + service - discount + tip);
  return { subtotal, tax, delivery, service, discount, tip, total };
};

export const STATUS = {
  recibido: { label: 'Recibido', short: 'Recibido', tone: 'blue', step: 0 },
  preparando: { label: 'En preparación', short: 'En cocina', tone: 'amber', step: 1 },
  listo: { label: 'Listo', short: 'Listo', tone: 'green', step: 2 },
  entregado: { label: 'Entregado', short: 'Entregado', tone: 'slate', step: 3 },
  cancelado: { label: 'Cancelado', short: 'Cancelado', tone: 'red', step: -1 },
};

export const ACTIVE_STATUSES = ['recibido', 'preparando', 'listo'];
export const FLOW = ['recibido', 'preparando', 'listo', 'entregado'];

export const TYPE_META = {
  mesa: { label: 'En el salón', short: 'Mesa', icon: 'table' },
  retiro: { label: 'Retiro en el local', short: 'Retiro', icon: 'bag' },
  delivery: { label: 'Envío a domicilio', short: 'Delivery', icon: 'bike' },
};

export const PAYMENT_META = {
  efectivo: { label: 'Efectivo', icon: 'cash', note: 'Pagás al retirar o en la mesa' },
  tarjeta: { label: 'Tarjeta', icon: 'card', note: 'Débito o crédito en el local' },
  qr: { label: 'QR / MODO', icon: 'qr', note: 'Escaneás y listo' },
  transferencia: { label: 'Transferencia', icon: 'transfer', note: 'Te mostramos el alias' },
};

export const nextStatus = (status) => {
  const index = FLOW.indexOf(status);
  return index >= 0 && index < FLOW.length - 1 ? FLOW[index + 1] : null;
};

export const matchesSearch = (order, query) => {
  if (!query) return true;
  const text = `${order.code} ${order.customerName} ${order.items
    .map((i) => i.name)
    .join(' ')}`.toLowerCase();
  return text.includes(query.toLowerCase());
};

export const downloadFile = (filename, content, type = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

export const receiptHtml = (order, settings) => {
  const totals = orderTotals(order, settings);
  const items = order.items
    .map(
      (item) =>
        `<tr><td>${item.qty}× ${item.name}${
          item.variantLabel ? ` · ${item.variantLabel}` : ''
        }</td><td style="text-align:right">${money(item.unitPrice * item.qty)}</td></tr>`
    )
    .join('');
  const payment = PAYMENT_META[order.payment?.method]?.label || '—';
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Comprobante ${order.code}</title>
  <style>
    body{font-family:system-ui,-apple-system,sans-serif;max-width:420px;margin:40px auto;padding:28px;color:#1c1914;background:#fffdf8;border:1px solid #e7ddca;border-radius:18px}
    h1{font-family:Georgia,serif;font-size:38px;margin:0;letter-spacing:-2px}
    .muted{color:#7a7466;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
    .code{font-size:32px;font-weight:800;letter-spacing:.06em;margin:18px 0 4px}
    table{width:100%;border-collapse:collapse;font-size:13px;margin:16px 0}
    td{padding:7px 0;border-bottom:1px dashed #e7ddca}
    .total{font-size:22px;font-weight:800;display:flex;justify-content:space-between;margin-top:14px}
    .foot{margin-top:24px;font-size:11px;color:#7a7466;text-align:center;line-height:1.6}
    .paid{display:inline-block;padding:4px 10px;border:1px solid #365a42;color:#365a42;border-radius:99px;font-size:11px;font-weight:700;margin-top:8px}
  </style></head><body>
  <h1>miga</h1><div class="muted">Bueno, rápido y con amor</div>
  <div class="code">${order.code}</div>
  <div class="muted">${fmtDateTime(order.created)} · ${TYPE_META[order.type]?.label || order.type}</div>
  <div style="margin-top:10px"><b>${order.customerName}</b>${
    order.table ? ` · Mesa ${String(order.table).padStart(2, '0')}` : ''
  }</div>
  <table>${items}</table>
  <table>
    <tr><td>Subtotal</td><td style="text-align:right">${money(totals.subtotal)}</td></tr>
    <tr><td>IVA 18%</td><td style="text-align:right">${money(totals.tax)}</td></tr>
    ${totals.delivery ? `<tr><td>Envío</td><td style="text-align:right">${money(totals.delivery)}</td></tr>` : ''}
    ${totals.service ? `<tr><td>Servicio de envío</td><td style="text-align:right">${money(totals.service)}</td></tr>` : ''}
    ${totals.discount ? `<tr><td>Descuento</td><td style="text-align:right">− ${money(totals.discount)}</td></tr>` : ''}
    ${totals.tip ? `<tr><td>Propina</td><td style="text-align:right">${money(totals.tip)}</td></tr>` : ''}
  </table>
  <div class="total"><span>Total</span><span>${money(totals.total)}</span></div>
  <div class="paid">${order.payment?.status === 'pagado' ? 'PAGADO' : 'PAGO PENDIENTE'} · ${payment}</div>
  <div class="foot">Comprobante digital de demostración.<br/>Gracias por elegir Miga ✳</div>
  </body></html>`;
};

export const todayStart = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};
