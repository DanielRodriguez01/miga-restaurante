import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import Icon from '../icons';
import DishArt from '../DishArt';
import {
  ConfirmDialog,
  Empty,
  Field,
  Modal,
  PayPill,
  Qty,
  Segmented,
  StatusPill,
  Toggle,
  useToast,
} from '../ui';
import ReceiptModal from '../components/Receipt';
import TurnBoard from './TurnBoard';
import { CATEGORIES, CLAIM_REASONS } from '../data';
import {
  ACTIVE_STATUSES,
  FLOW,
  PAYMENT_META,
  STATUS,
  TYPE_META,
  cn,
  countdown,
  fmtDate,
  fmtDateTime,
  fmtTime,
  money,
  nextStatus,
  orderSubtotal,
  orderTotals,
  timeAgo,
  todayStart,
} from '../utils';

const ART_KINDS = [
  'burger',
  'doubleBurger',
  'chicken',
  'sandwich',
  'wrap',
  'salad',
  'fries',
  'rings',
  'nuggets',
  'drink',
  'lemonade',
  'beer',
  'water',
  'shake',
  'coffee',
  'cake',
  'cookie',
  'flan',
  'combo',
];

const ACCENTS = ['#d1502a', '#c4552e', '#d9893b', '#c79a4c', '#6f8a5b', '#365a42', '#8d6a4a', '#b85a3c', '#a7b45b', '#c9918a'];

function useTick(active = true) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

const navItems = [
  { id: 'dashboard', label: 'Resumen', icon: 'chart' },
  { id: 'orders', label: 'Pedidos', icon: 'receipt' },
  { id: 'claims', label: 'Reclamos', icon: 'alert' },
  { id: 'salon', label: 'Salón', icon: 'table' },
  { id: 'menu', label: 'Carta', icon: 'tag' },
  { id: 'announcements', label: 'Anuncios', icon: 'megaphone' },
  { id: 'turnero', label: 'Pantalla retiros', icon: 'ticket' },
  { id: 'settings', label: 'Ajustes', icon: 'settings' },
];

/* ─────────────────────────────────────────────────────────────
   Modal de pedido (detalle + edición para admin)
   ───────────────────────────────────────────────────────────── */
function AdminOrderModal({ orderId, onClose, onReceipt, onCancel }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const order = state.orders.find((item) => item.id === orderId) || null;
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);
  const [note, setNote] = useState('');
  const [table, setTable] = useState('01');
  const [addProductId, setAddProductId] = useState('');
  const [addVariantId, setAddVariantId] = useState('');

  useEffect(() => {
    if (!order) return;
    setItems(order.items.map((item) => ({ ...item })));
    setDiscount(order.discount || 0);
    setTip(order.tip || 0);
    setNote(order.note || '');
    setTable(order.table ? String(order.table).padStart(2, '0') : '01');
    setAddProductId(state.products.find((product) => product.available)?.id || '');
    setAddVariantId('');
  }, [orderId]);

  if (!order) return null;

  const draft = { ...order, items, discount: Number(discount) || 0, tip: Number(tip) || 0 };
  const totals = orderTotals(draft, state.settings);
  const openClaim = state.claims.find((claim) => claim.orderId === order.id && claim.status === 'abierto');
  const addProduct = state.products.find((product) => product.id === addProductId);
  const addVariant = addProduct?.variants.find((variant) => variant.id === addVariantId) || addProduct?.variants[0];

  const save = () => {
    actions.updateOrder(order.id, {
      items,
      discount: Number(discount) || 0,
      tip: Number(tip) || 0,
      note: note.trim(),
      table: order.type === 'mesa' ? Number(table) || null : order.table,
    });
    toast('Pedido actualizado', { tone: 'success', icon: 'checkCircle' });
    onClose();
  };

  return (
    <Modal open={Boolean(order)} onClose={onClose} size="lg" className="admin-order-modal">
      <div className="admin-order-head">
        <div>
          <span className="eyebrow">Pedido {order.code}</span>
          <h2>{order.customerName}</h2>
          <small>
            {TYPE_META[order.type]?.label}
            {order.table ? ` · Mesa ${String(order.table).padStart(2, '0')}` : ''} · {fmtDateTime(order.created)}
          </small>
        </div>
        <div className="admin-order-badges">
          <StatusPill status={order.status} />
          <PayPill payment={order.payment} />
        </div>
      </div>

      {openClaim && (
        <div className="admin-claim-alert">
          <Icon name="alert" size={18} />
          <div>
            <b>Reclamo abierto · {openClaim.reason}</b>
            <p>{openClaim.message}</p>
          </div>
        </div>
      )}

      <div className="admin-order-grid">
        <div className="admin-order-main">
          <section className="admin-block">
            <div className="admin-block-head">
              <h3>Productos</h3>
              <span>{items.reduce((sum, item) => sum + item.qty, 0)} unidades</span>
            </div>
            <div className="admin-edit-items">
              {items.map((item, index) => (
                <div className="admin-edit-item" key={`${item.name}-${index}`}>
                  <span className="admin-edit-art">
                    <DishArt kind={item.art || 'burger'} accent={item.accent || '#d1502a'} />
                  </span>
                  <div className="admin-edit-info">
                    <b>{item.name}</b>
                    <small>{item.variantLabel}</small>
                    <span>{money(item.unitPrice)} c/u</span>
                  </div>
                  <Qty
                    value={item.qty}
                    min={0}
                    max={50}
                    size="sm"
                    onChange={(value) =>
                      setItems((current) =>
                        value === 0
                          ? current.filter((_, itemIndex) => itemIndex !== index)
                          : current.map((entry, itemIndex) =>
                              itemIndex === index ? { ...entry, qty: value } : entry
                            )
                      )
                    }
                  />
                  <b className="admin-edit-sub">{money(item.unitPrice * item.qty)}</b>
                </div>
              ))}
              {!items.length && <Empty icon="bag" title="Sin productos" text="Agregá algo para continuar." />}
            </div>
            <div className="admin-add-product">
              <select
                value={addProductId}
                onChange={(event) => {
                  setAddProductId(event.target.value);
                  setAddVariantId('');
                }}
                aria-label="Producto para agregar"
              >
                {state.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.available ? '' : '(agotado)'}
                  </option>
                ))}
              </select>
              <select
                value={addVariant?.id || ''}
                onChange={(event) => setAddVariantId(event.target.value)}
                aria-label="Variante"
              >
                {(addProduct?.variants || []).map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.label} · {money(variant.price)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  if (!addProduct || !addVariant) return;
                  setItems((current) => {
                    const existing = current.findIndex(
                      (item) => item.productId === addProduct.id && item.variantLabel === addVariant.label
                    );
                    if (existing >= 0) {
                      return current.map((item, index) =>
                        index === existing ? { ...item, qty: item.qty + 1 } : item
                      );
                    }
                    return [
                      ...current,
                      {
                        productId: addProduct.id,
                        name: addProduct.name,
                        variantLabel: addVariant.label,
                        unitPrice: addVariant.price,
                        qty: 1,
                        art: addProduct.art,
                        accent: addProduct.accent,
                      },
                    ];
                  });
                  toast(`${addProduct.name} agregado al pedido`, { icon: 'plus' });
                }}
              >
                <Icon name="plus" size={14} /> Agregar
              </button>
            </div>
          </section>

          <section className="admin-block">
            <div className="admin-block-head">
              <h3>Ajustes del pedido</h3>
              <span>Cambios internos</span>
            </div>
            <div className="admin-fields-row">
              {order.type === 'mesa' && (
                <Field label="Mesa">
                  <select value={table} onChange={(event) => setTable(event.target.value)}>
                    {Array.from({ length: state.settings.tableCount }, (_, index) => {
                      const value = String(index + 1).padStart(2, '0');
                      return (
                        <option key={value} value={value}>
                          Mesa {value}
                        </option>
                      );
                    })}
                  </select>
                </Field>
              )}
              <Field label="Descuento" hint="$">
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                />
              </Field>
              <Field label="Propina" hint="$">
                <input type="number" min="0" value={tip} onChange={(event) => setTip(event.target.value)} />
              </Field>
            </div>
            <Field label="Nota del pedido">
              <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={140} />
            </Field>
            {(order.address || order.phone) && (
              <div className="admin-delivery-info">
                <div>
                  <span>Dirección</span>
                  <b>{order.address || '—'}</b>
                </div>
                <div>
                  <span>Teléfono</span>
                  <b>{order.phone || '—'}</b>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="admin-order-side">
          <div className="admin-summary">
            <div>
              <span>Subtotal</span>
              <b>{money(totals.subtotal)}</b>
            </div>
            <div>
              <span>IVA</span>
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
                <span>Servicio</span>
                <b>{money(totals.service)}</b>
              </div>
            )}
            {totals.discount > 0 && (
              <div>
                <span>Descuento</span>
                <b>− {money(totals.discount)}</b>
              </div>
            )}
            {totals.tip > 0 && (
              <div>
                <span>Propina</span>
                <b>{money(totals.tip)}</b>
              </div>
            )}
            <div className="admin-summary-total">
              <span>Total</span>
              <b>{money(totals.total)}</b>
            </div>
          </div>

          <div className="admin-order-status">
            <span className="admin-side-label">Cambiar estado</span>
            <div className="status-buttons">
              {FLOW.map((status) => (
                <button
                  type="button"
                  key={status}
                  className={cn('status-btn', order.status === status && 'is-active')}
                  onClick={() => actions.setOrderStatus(order.id, status)}
                >
                  {STATUS[status].short}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-ink btn-block btn-sm"
              onClick={() => {
                const next = nextStatus(order.status);
                if (next) {
                  actions.setOrderStatus(order.id, next);
                  toast(`Pedido ${order.code} → ${STATUS[next].label}`, { icon: 'checkCircle' });
                }
              }}
              disabled={!nextStatus(order.status)}
            >
              Avanzar estado <Icon name="arrowRight" size={14} />
            </button>
          </div>

          <div className="admin-side-meta">
            <div>
              <span>Creado</span>
              <b>{fmtDateTime(order.created)}</b>
            </div>
            <div>
              <span>Pago</span>
              <b>
                {PAYMENT_META[order.payment?.method]?.label} ·{' '}
                {order.payment?.status === 'pagado' ? 'pagado' : order.payment?.status || 'pendiente'}
              </b>
            </div>
            {order.cancelledAt && (
              <div>
                <span>Cancelado</span>
                <b>{fmtDateTime(order.cancelledAt)}</b>
              </div>
            )}
          </div>

          <div className="admin-side-actions">
            <button type="button" className="btn btn-ink btn-block" onClick={save}>
              Guardar cambios
            </button>
            {order.payment?.status === 'pendiente' && (
              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => {
                  actions.markPaid(order.id, order.payment?.method || 'efectivo');
                  toast('Pago registrado', { tone: 'success', icon: 'checkCircle' });
                }}
              >
                <Icon name="wallet" size={15} /> Registrar pago
              </button>
            )}
            <div className="admin-side-duo">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onReceipt(order)}>
                <Icon name="receipt" size={14} /> Comprobante
              </button>
              {!['entregado', 'cancelado'].includes(order.status) && (
                <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => onCancel(order)}>
                  <Icon name="x" size={14} /> Cancelar
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Cancelar pedido (con motivo)
   ───────────────────────────────────────────────────────────── */
function CancelOrderModal({ order, onClose }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [reason, setReason] = useState('');

  useEffect(() => {
    setReason('');
  }, [order?.id]);

  if (!order) return null;
  const totals = orderTotals(order, state.settings);
  const paid = order.payment?.status === 'pagado';

  return (
    <Modal open={Boolean(order)} onClose={onClose} size="sm" className="cancel-modal">
      <span className="eyebrow">Cancelar pedido {order.code}</span>
      <h2>¿Seguro que lo cancelamos?</h2>
      <p className="muted-copy">
        {paid
          ? 'El pago figure como reembolsado y el equipo verá el registro de la cancelación.'
          : 'El pedido no se cobrará. Queda guardado en el historial con el motivo.'}
      </p>
      <div className="cancel-quick">
        {['Cliente desistió', 'Demora en cocina', 'Falta de stock', 'Reclamo resuelto'].map((item) => (
          <button
            type="button"
            key={item}
            className={reason === item ? 'is-active' : ''}
            onClick={() => setReason(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <Field label="Motivo de cancelación">
        <textarea
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Contá brevemente por qué se cancela"
        />
      </Field>
      <div className="cancel-total">
        <span>Total del pedido</span>
        <b>{money(totals.total)}</b>
      </div>
      <div className="confirm-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Volver
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            actions.cancelOrder(order.id, reason.trim() || 'Cancelado por administración', 'admin');
            toast(`Pedido ${order.code} cancelado`, { tone: 'success', icon: 'x' });
            onClose();
          }}
        >
          Cancelar pedido
        </button>
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Nuevo pedido de mesa (admin)
   ───────────────────────────────────────────────────────────── */
function NewTableOrderModal({ initialTable, open, onClose, onCreated }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [name, setName] = useState('');
  const [table, setTable] = useState(String(initialTable || 1).padStart(2, '0'));
  const [method, setMethod] = useState('efectivo');
  const [category, setCategory] = useState('hamburguesas');
  const [productId, setProductId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [qty, setQty] = useState(1);
  const [lines, setLines] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setTable(String(initialTable || 1).padStart(2, '0'));
    setMethod('efectivo');
    setCategory('hamburguesas');
    setLines([]);
    setError('');
  }, [open, initialTable]);

  const products = state.products.filter((product) => product.category === category);
  const product = state.products.find((item) => item.id === productId) || products[0];
  const variant = product?.variants.find((item) => item.id === variantId) || product?.variants[0];

  useEffect(() => {
    if (product) {
      setProductId(product.id);
      setVariantId(product.variants[0]?.id || '');
    }
  }, [category]);

  useEffect(() => {
    if (productId && !product?.variants.some((item) => item.id === variantId)) {
      setVariantId(product?.variants[0]?.id || '');
    }
  }, [productId]);

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  const tax = Math.round(subtotal * state.settings.tax);

  const addLine = () => {
    if (!product || !variant) return;
    setLines((current) => {
      const index = current.findIndex(
        (line) => line.productId === product.id && line.variantLabel === variant.label
      );
      if (index >= 0) {
        return current.map((line, lineIndex) =>
          lineIndex === index ? { ...line, qty: line.qty + qty } : line
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          variantLabel: variant.label,
          unitPrice: variant.price,
          qty,
          art: product.art,
          accent: product.accent,
        },
      ];
    });
    setQty(1);
  };

  return (
    <Modal open={open} onClose={onClose} size="lg" className="new-order-modal">
      <span className="eyebrow">Pedido asistido</span>
      <h2>Abrir mesa y tomar el pedido.</h2>
      <p className="muted-copy">
        Para clientes que piden en el local. El pedido entra directo a cocina y podés cobrarlo desde el salón.
      </p>

      <div className="new-order-grid">
        <div className="new-order-main">
          <div className="admin-fields-row">
            <Field label="Cliente">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre del cliente" />
            </Field>
            <Field label="Mesa">
              <select value={table} onChange={(event) => setTable(event.target.value)}>
                {Array.from({ length: state.settings.tableCount }, (_, index) => {
                  const value = String(index + 1).padStart(2, '0');
                  return (
                    <option key={value} value={value}>
                      Mesa {value}
                    </option>
                  );
                })}
              </select>
            </Field>
            <Field label="Pago">
              <select value={method} onChange={(event) => setMethod(event.target.value)}>
                {Object.entries(PAYMENT_META).map(([id, meta]) => (
                  <option key={id} value={id}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="order-picker">
            <div className="order-picker-cats">
              {CATEGORIES.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={category === item.id ? 'is-active' : ''}
                  onClick={() => setCategory(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="order-picker-row">
              <select value={product?.id || ''} onChange={(event) => setProductId(event.target.value)} aria-label="Producto">
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} {item.available ? '' : '· agotado'}
                  </option>
                ))}
              </select>
              <select value={variant?.id || ''} onChange={(event) => setVariantId(event.target.value)} aria-label="Variante">
                {(product?.variants || []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} · {money(item.price)}
                  </option>
                ))}
              </select>
              <Qty value={qty} onChange={setQty} min={1} max={20} />
              <button type="button" className="btn btn-ink btn-sm" onClick={addLine} disabled={!product || !product.available}>
                <Icon name="plus" size={14} /> Agregar
              </button>
            </div>
            {product && !product.available && (
              <p className="form-error">
                <Icon name="alert" size={14} /> Ese plato está agotado hoy.
              </p>
            )}
          </div>

          <div className="new-order-lines">
            {lines.map((line, index) => (
              <div className="new-order-line" key={`${line.name}-${index}`}>
                <span className="new-order-line-art">
                  <DishArt kind={line.art} accent={line.accent} />
                </span>
                <div>
                  <b>{line.name}</b>
                  <small>{line.variantLabel}</small>
                  <span>{money(line.unitPrice)} c/u</span>
                </div>
                <Qty
                  value={line.qty}
                  min={0}
                  max={30}
                  size="sm"
                  onChange={(value) =>
                    setLines((current) =>
                      value === 0
                        ? current.filter((_, lineIndex) => lineIndex !== index)
                        : current.map((entry, lineIndex) =>
                            lineIndex === index ? { ...entry, qty: value } : entry
                          )
                    )
                  }
                />
                <b>{money(line.unitPrice * line.qty)}</b>
              </div>
            ))}
            {!lines.length && <Empty icon="bag" title="Todavía no hay productos" text="Elegí de la carta para armar el pedido." />}
          </div>
        </div>

        <aside className="new-order-side">
          <span className="eyebrow">Resumen</span>
          <div className="new-order-summary">
            <div>
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </div>
            <div>
              <span>IVA</span>
              <b>{money(tax)}</b>
            </div>
            <div className="is-total">
              <span>Total</span>
              <b>{money(subtotal + tax)}</b>
            </div>
          </div>
          {error && (
            <p className="form-error">
              <Icon name="alert" size={14} /> {error}
            </p>
          )}
          <button
            type="button"
            className="btn btn-ink btn-block"
            disabled={!lines.length}
            onClick={() => {
              if (!name.trim()) {
                setError('Ingresá el nombre del cliente.');
                return;
              }
              const order = actions.placeOrder({
                userId: 'walk-in',
                customerName: name.trim(),
                type: 'mesa',
                table,
                items: lines,
                paymentMethod: method,
                createdBy: 'admin',
              });
              toast(`Pedido ${order.code} enviado a cocina`, { tone: 'success', icon: 'checkCircle' });
              onCreated(order);
              onClose();
            }}
          >
            Enviar a cocina <Icon name="arrowRight" size={15} />
          </button>
          <p className="checkout-fineprint">
            <Icon name="info" size={13} /> El pedido pasa a cocina automáticamente en{' '}
            {state.settings.autoPrepMinutes} minutos si nadie lo mueve.
          </p>
        </aside>
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Modal de mesa (salón)
   ───────────────────────────────────────────────────────────── */
function SalonTableModal({ table, onClose, onNewOrder, onOpenOrder, onReceipt, onCancel }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const orders = state.orders.filter(
    (order) => order.type === 'mesa' && order.table === table && ACTIVE_STATUSES.includes(order.status)
  );
  const now = useTick(true);

  return (
    <Modal open={Boolean(table)} onClose={onClose} size="md" className="salon-table-modal">
      <span className="eyebrow">Salón Miga</span>
      <h2>Mesa {String(table).padStart(2, '0')}</h2>
      <p className="muted-copy">
        {orders.length
          ? `${orders.length} pedido${orders.length > 1 ? 's' : ''} activo${orders.length > 1 ? 's' : ''} en esta mesa.`
          : 'La mesa está libre. Podés abrir un pedido nuevo.'}
      </p>

      <div className="salon-table-orders">
        {orders.map((order) => {
          const totals = orderTotals(order, state.settings);
          return (
            <div className="salon-order" key={order.id}>
              <div className="salon-order-head">
                <span>{order.code}</span>
                <StatusPill status={order.status} />
                <b>{money(totals.total)}</b>
              </div>
              <div className="salon-order-client">
                <Icon name="user" size={13} /> {order.customerName}
                <span>· {fmtTime(order.created)}</span>
              </div>
              <div className="salon-order-items">
                {order.items.map((item, index) => (
                  <span key={`${item.name}-${index}`}>
                    {item.qty}× {item.name}
                  </span>
                ))}
              </div>
              {order.status === 'recibido' && (
                <div className="table-order-eta">
                  <Icon name="timer" size={13} /> auto a cocina en{' '}
                  {countdown(order.created + state.settings.autoPrepMinutes * 60000, now)}
                </div>
              )}
              <div className="salon-order-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => onOpenOrder(order)}>
                  <Icon name="eye" size={14} /> Detalle
                </button>
                {nextStatus(order.status) && (
                  <button
                    type="button"
                    className="btn btn-soft btn-sm"
                    onClick={() => actions.setOrderStatus(order.id, nextStatus(order.status))}
                  >
                    <Icon name="arrowRight" size={14} /> {STATUS[nextStatus(order.status)].short}
                  </button>
                )}
                {order.payment?.status === 'pendiente' && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      actions.markPaid(order.id, order.payment?.method || 'efectivo');
                      toast('Cuenta cobrada', { tone: 'success', icon: 'checkCircle' });
                    }}
                  >
                    <Icon name="wallet" size={14} /> Cobrar
                  </button>
                )}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => onReceipt(order)}>
                  <Icon name="receipt" size={14} /> Ticket
                </button>
                <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => onCancel(order)}>
                  <Icon name="x" size={14} /> Cancelar
                </button>
              </div>
            </div>
          );
        })}
        {!orders.length && (
          <Empty icon="table" title="Mesa libre" text="Nadie está pidiendo en esta mesa todavía." />
        )}
      </div>

      <button type="button" className="btn btn-ink btn-block" onClick={() => onNewOrder(table)}>
        <Icon name="plus" size={15} /> Nuevo pedido en mesa {String(table).padStart(2, '0')}
      </button>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Dashboard
   ───────────────────────────────────────────────────────────── */
function Dashboard({ go, openOrder, openNewOrder, onReceipt }) {
  const { state, actions } = useStore();
  const now = useTick(true);
  const today = todayStart();

  const todays = state.orders.filter((order) => order.created >= today);
  const validToday = todays.filter((order) => order.status !== 'cancelado');
  const sales = validToday.reduce((sum, order) => sum + orderTotals(order, state.settings).total, 0);
  const net = validToday.reduce((sum, order) => sum + orderTotals(order, state.settings).subtotal, 0);
  const tips = validToday.reduce((sum, order) => sum + (order.tip || 0), 0);
  const active = state.orders.filter((order) => ACTIVE_STATUSES.includes(order.status));
  const ready = active.filter((order) => order.status === 'listo');
  const openClaims = state.claims.filter((claim) => claim.status === 'abierto');
  const avgTicket = validToday.length ? Math.round(sales / validToday.length) : 0;
  const busyTables = state.orders.filter(
    (order) => order.type === 'mesa' && ACTIVE_STATUSES.includes(order.status)
  );

  return (
    <div className="admin-view">
      <header className="admin-view-head">
        <div>
          <span className="eyebrow">
            {fmtDate(now)} · {state.settings.hours}
          </span>
          <h1>
            Buen día, <em>equipo.</em>
          </h1>
          <p>Así se mueve Miga hoy. Todo en orden, todo rico.</p>
        </div>
        <div className="admin-view-actions">
          <span className="live-label">
            <i /> EN VIVO
          </span>
          <button type="button" className="btn btn-ink" onClick={openNewOrder}>
            <Icon name="plus" size={16} /> Nuevo pedido
          </button>
        </div>
      </header>

      {openClaims.length > 0 && (
        <button type="button" className="admin-alert-banner" onClick={() => go('claims')}>
          <span className="admin-alert-icon">
            <Icon name="alert" size={20} />
          </span>
          <span>
            <b>
              {openClaims.length} reclamo{openClaims.length > 1 ? 's' : ''} esperando respuesta
            </b>
            <small>{openClaims[0].customerName} · {openClaims[0].reason}</small>
          </span>
          <Icon name="arrowRight" size={18} />
        </button>
      )}

      <div className="admin-stats">
        <article className="admin-stat is-primary">
          <span>Ventas de hoy <Icon name="arrowUpRight" size={14} /></span>
          <b>{money(sales)}</b>
          <small>Neto {money(net)} · IVA {money(Math.round(net * state.settings.tax))}</small>
          <div className="admin-sparkline">
            {[42, 64, 38, 72, 55, 86, 61, 94, 78, 100, 70, 92].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </article>
        <article className="admin-stat">
          <span>Pedidos hoy</span>
          <b>{String(todays.length).padStart(2, '0')}</b>
          <small>{active.length} activos · {ready.length} listos</small>
          <span className="admin-stat-icon">
            <Icon name="receipt" size={18} />
          </span>
        </article>
        <article className="admin-stat">
          <span>Ticket promedio</span>
          <b>{money(avgTicket)}</b>
          <small>Propinas hoy: {money(tips)}</small>
          <span className="admin-stat-icon">
            <Icon name="chart" size={18} />
          </span>
        </article>
        <article className="admin-stat">
          <span>Mesas ocupadas</span>
          <b>
            {busyTables.length}/{state.settings.tableCount}
          </b>
          <small>{ready.length ? `${ready.length} pedidos esperando entrega` : 'Salón al día'}</small>
          <span className="admin-stat-icon">
            <Icon name="table" size={18} />
          </span>
        </article>
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-orders-panel">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">Seguimiento en vivo</span>
              <h2>
                Pedidos <em>activos.</em>
              </h2>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => go('orders')}>
              Ver todos <Icon name="arrowRight" size={14} />
            </button>
          </div>
          <div className="admin-order-list">
            {active.length ? (
              active.slice(0, 6).map((order) => {
                const totals = orderTotals(order, state.settings);
                return (
                  <div className="admin-order-row" key={order.id}>
                    <div className="admin-order-row-id">
                      <b>{order.code}</b>
                      <small>{order.customerName}</small>
                    </div>
                    <div className="admin-order-row-type">
                      <Icon name={TYPE_META[order.type]?.icon} size={14} />
                      <span>
                        {order.type === 'mesa' ? `Mesa ${String(order.table).padStart(2, '0')}` : TYPE_META[order.type]?.short}
                      </span>
                      <small>{fmtTime(order.created)}</small>
                    </div>
                    <div className="admin-order-row-items">
                      {order.items.map((item) => `${item.qty}× ${item.name}`).join(' · ')}
                    </div>
                    <div className="admin-order-row-status">
                      <StatusPill status={order.status} />
                      <b>{money(totals.total)}</b>
                    </div>
                    <div className="admin-order-row-actions">
                      {nextStatus(order.status) && (
                        <button
                          type="button"
                          className="admin-mini-btn"
                          title={`Pasar a ${STATUS[nextStatus(order.status)].label}`}
                          onClick={() => actions.setOrderStatus(order.id, nextStatus(order.status))}
                        >
                          <Icon name={order.status === 'listo' ? 'check' : 'arrowRight'} size={14} />
                        </button>
                      )}
                      <button type="button" className="admin-mini-btn" title="Ver detalle" onClick={() => openOrder(order)}>
                        <Icon name="eye" size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <Empty icon="checkCircle" title="Todo entregado." text="No hay pedidos activos en este momento." />
            )}
          </div>
        </section>

        <section className="admin-panel admin-salon-panel">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">Vista del salón</span>
              <h2>
                Las mesas <em>hoy.</em>
              </h2>
            </div>
            <button type="button" className="admin-mini-btn" onClick={() => go('salon')} title="Ver salón">
              <Icon name="arrowUpRight" size={15} />
            </button>
          </div>
          <div className="admin-floor">
            {Array.from({ length: state.settings.tableCount }, (_, index) => {
              const number = index + 1;
              const order = busyTables.find((item) => item.table === number);
              return (
                <button
                  type="button"
                  key={number}
                  className={cn(
                    'admin-floor-table',
                    order?.status === 'listo' && 'is-ready',
                    order && order.status !== 'listo' && 'is-busy'
                  )}
                  onClick={() => go('salon')}
                >
                  <b>{String(number).padStart(2, '0')}</b>
                  <small>{order ? STATUS[order.status].short : 'Libre'}</small>
                </button>
              );
            })}
          </div>
          <div className="admin-floor-foot">
            <span>
              <i className="dot dot-busy" /> {busyTables.length} ocupadas
            </span>
            <span>
              <i className="dot dot-free" /> {state.settings.tableCount - busyTables.length} libres
            </span>
          </div>
        </section>

        <section className="admin-panel admin-claims-panel">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">Atención al cliente</span>
              <h2>
                Últimos <em>reclamos.</em>
              </h2>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => go('claims')}>
              Ver todos <Icon name="arrowRight" size={14} />
            </button>
          </div>
          <div className="admin-claim-list">
            {state.claims.slice(0, 3).map((claim) => (
              <button type="button" key={claim.id} className="admin-claim-row" onClick={() => go('claims')}>
                <span className={`admin-claim-dot ${claim.status === 'abierto' ? 'is-open' : ''}`} />
                <span className="admin-claim-info">
                  <b>{claim.customerName}</b>
                  <small>{claim.reason} · {claim.orderCode}</small>
                </span>
                <span>{timeAgo(claim.createdAt)}</span>
                <Icon name="chevronRight" size={14} />
              </button>
            ))}
            {!state.claims.length && <Empty icon="checkCircle" title="Sin reclamos" text="Todo tranquilo por acá." />}
          </div>
          <button type="button" className="admin-panel-foot" onClick={onReceipt && (() => {})}>
            <span>
              <Icon name="megaphone" size={15} /> Publicar novedad en la carta
            </span>
            <Icon name="arrowRight" size={15} />
          </button>
        </section>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Pedidos
   ───────────────────────────────────────────────────────────── */
function AdminOrders({ openOrder, onReceipt, onCancel }) {
  const { state } = useStore();
  const [status, setStatus] = useState('todos');
  const [type, setType] = useState('todos');
  const [query, setQuery] = useState('');

  const orders = state.orders.filter((order) => {
    const statusOk = status === 'todos' || order.status === status;
    const typeOk = type === 'todos' || order.type === type;
    const text = `${order.code} ${order.customerName} ${order.items.map((item) => item.name).join(' ')}`.toLowerCase();
    return statusOk && typeOk && (!query || text.includes(query.toLowerCase()));
  });

  const counts = state.orders.reduce(
    (accumulator, order) => ({ ...accumulator, [order.status]: (accumulator[order.status] || 0) + 1 }),
    {}
  );

  return (
    <div className="admin-view">
      <header className="admin-view-head">
        <div>
          <span className="eyebrow">Todos los pedidos</span>
          <h1>
            La operación, <em>en vivo.</em>
          </h1>
          <p>Salón, retiro y delivery. Podés modificar, cobrar o cancelar cualquier pedido.</p>
        </div>
        <div className="admin-view-actions">
          <span className="count-chip">{orders.length} resultados</span>
        </div>
      </header>

      <div className="admin-filters">
        <div className="admin-filter-chips">
          <button type="button" className={status === 'todos' ? 'is-active' : ''} onClick={() => setStatus('todos')}>
            Todos <span>{state.orders.length}</span>
          </button>
          {Object.entries(STATUS).map(([id, meta]) => (
            <button type="button" key={id} className={status === id ? 'is-active' : ''} onClick={() => setStatus(id)}>
              {meta.label} <span>{counts[id] || 0}</span>
            </button>
          ))}
        </div>
        <div className="admin-filters-right">
          <Segmented
            size="sm"
            value={type}
            onChange={setType}
            options={[
              { id: 'todos', label: 'Todas' },
              { id: 'mesa', label: 'Mesa' },
              { id: 'retiro', label: 'Retiro' },
              { id: 'delivery', label: 'Delivery' },
            ]}
          />
          <div className="admin-search">
            <Icon name="search" size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar ticket o cliente"
            />
          </div>
        </div>
      </div>

      <div className="admin-table admin-orders-table">
        <div className="admin-table-head">
          <span>Pedido</span>
          <span>Cliente</span>
          <span>Modalidad</span>
          <span>Detalle</span>
          <span>Estado</span>
          <span>Pago</span>
          <span>Total</span>
          <span>Acciones</span>
        </div>
        {orders.map((order) => {
          const totals = orderTotals(order, state.settings);
          return (
            <div className={cn('admin-table-row', order.status === 'cancelado' && 'is-cancelled')} key={order.id}>
              <div className="admin-cell-code">
                <b>{order.code}</b>
                <small>{fmtTime(order.created)}</small>
              </div>
              <div className="admin-cell-client">
                <b>{order.customerName}</b>
                <small>{order.phone || 'Sin teléfono'}</small>
              </div>
              <div className="admin-cell-type">
                <Icon name={TYPE_META[order.type]?.icon} size={14} />
                <span>{order.type === 'mesa' ? `Mesa ${String(order.table).padStart(2, '0')}` : TYPE_META[order.type]?.short}</span>
              </div>
              <div className="admin-cell-detail">{order.items.map((item) => `${item.qty}× ${item.name}`).join(', ')}</div>
              <div>
                <StatusPill status={order.status} />
              </div>
              <div>
                <PayPill payment={order.payment} />
              </div>
              <b className="admin-cell-total">{money(totals.total)}</b>
              <div className="admin-cell-actions">
                <button type="button" className="admin-mini-btn" onClick={() => openOrder(order)} title="Abrir detalle">
                  <Icon name="eye" size={14} />
                </button>
                {nextStatus(order.status) && (
                  <button
                    type="button"
                    className="admin-mini-btn is-accent"
                    onClick={() => openOrder(order)}
                    title={`Pasar a ${STATUS[nextStatus(order.status)].label}`}
                  >
                    <Icon name="arrowRight" size={14} />
                  </button>
                )}
                <button type="button" className="admin-mini-btn" onClick={() => onReceipt(order)} title="Comprobante">
                  <Icon name="receipt" size={14} />
                </button>
                {!['entregado', 'cancelado'].includes(order.status) && (
                  <button type="button" className="admin-mini-btn is-danger" onClick={() => onCancel(order)} title="Cancelar">
                    <Icon name="x" size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {!orders.length && <Empty icon="search" title="Sin resultados" text="Probá con otro estado, modalidad o búsqueda." />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Reclamos
   ───────────────────────────────────────────────────────────── */
function AdminClaims({ openOrder }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState('abierto');
  const [responses, setResponses] = useState({});
  const [cancelClaim, setCancelClaim] = useState(null);

  const claims = state.claims.filter((claim) => (filter === 'todos' ? true : claim.status === filter));

  return (
    <div className="admin-view">
      <header className="admin-view-head">
        <div>
          <span className="eyebrow">Atención al cliente</span>
          <h1>
            Reclamos, <em>sin vueltas.</em>
          </h1>
          <p>Cada reclamo va directo acá. Podés responder, resolver o cancelar el pedido afectado.</p>
        </div>
        <div className="admin-view-actions">
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { id: 'abierto', label: 'Abiertos' },
              { id: 'resuelto', label: 'Resueltos' },
              { id: 'todos', label: 'Todos' },
            ]}
          />
        </div>
      </header>

      <div className="claims-grid">
        {claims.map((claim) => {
          const order = state.orders.find((item) => item.id === claim.orderId);
          const totals = order ? orderTotals(order, state.settings) : null;
          const isOpen = claim.status === 'abierto';
          return (
            <article className={cn('admin-claim-card', isOpen && 'is-open')} key={claim.id}>
              <header>
                <div>
                  <span className="admin-claim-tag">{claim.reason}</span>
                  <h3>{claim.customerName}</h3>
                  <small>
                    Pedido {claim.orderCode} · {timeAgo(claim.createdAt)} · {fmtTime(claim.createdAt)}
                  </small>
                </div>
                <span className={`admin-claim-state ${isOpen ? 'is-open' : ''}`}>
                  {isOpen ? 'Abierto' : 'Resuelto'}
                </span>
              </header>
              <p className="admin-claim-message">{claim.message}</p>
              {order && (
                <div className="admin-claim-order">
                  <div>
                    <StatusPill status={order.status} />
                    <span>{TYPE_META[order.type]?.label}{order.table ? ` · Mesa ${order.table}` : ''}</span>
                  </div>
                  <div className="admin-claim-order-items">
                    {order.items.map((item) => `${item.qty}× ${item.name}`).join(' · ')}
                  </div>
                  <b>{money(totals.total)}</b>
                </div>
              )}
              {claim.response && (
                <div className="admin-claim-response">
                  <Icon name="checkCircle" size={14} /> <span>{claim.response}</span>
                </div>
              )}
              {isOpen ? (
                <>
                  <Field label="Respuesta al cliente">
                    <textarea
                      rows={2}
                      value={responses[claim.id] || ''}
                      onChange={(event) =>
                        setResponses((current) => ({ ...current, [claim.id]: event.target.value }))
                      }
                      placeholder="Ejemplo: ya lo revisamos con cocina y te enviamos una compensación."
                    />
                  </Field>
                  <div className="admin-claim-actions">
                    {order && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openOrder(order)}>
                        <Icon name="eye" size={14} /> Ver pedido
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-ink btn-sm"
                      onClick={() => {
                        actions.resolveClaim(claim.id, {
                          action: 'resolve',
                          response: responses[claim.id]?.trim() || 'Reclamo revisado por el equipo de Miga.',
                        });
                        toast('Reclamo resuelto', { tone: 'success', icon: 'checkCircle' });
                      }}
                    >
                      <Icon name="check" size={14} /> Resolver
                    </button>
                    {order && order.status !== 'cancelado' && (
                      <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => setCancelClaim(claim)}>
                        <Icon name="x" size={14} /> Cancelar pedido
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="admin-claim-resolved">
                  <span>
                    <Icon name="checkCircle" size={14} /> Resuelto {claim.resolvedAt ? timeAgo(claim.resolvedAt) : ''}
                  </span>
                  {order && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => openOrder(order)}>
                      Ver pedido
                    </button>
                  )}
                </div>
              )}
            </article>
          );
        })}
        {!claims.length && (
          <Empty
            icon="checkCircle"
            title="No hay reclamos por acá."
            text="Cuando un cliente envíe uno desde su pedido, aparece acá con todos los datos."
          />
        )}
      </div>

      <ConfirmDialog
        open={Boolean(cancelClaim)}
        onClose={() => setCancelClaim(null)}
        title="Cancelar el pedido del reclamo"
        text={`Se cancelará ${cancelClaim?.orderCode || ''} y, si estaba pagado, quedará reembolsado. El cliente verá la cancelación en su historial.`}
        confirmLabel="Cancelar y resolver"
        onConfirm={() => {
          if (cancelClaim) {
            actions.resolveClaim(cancelClaim.id, {
              action: 'cancel',
              response:
                responses[cancelClaim.id]?.trim() ||
                'Cancelamos el pedido a partir de tu reclamo. Si abonaste, el reembolso ya quedó registrado.',
            });
            toast('Pedido cancelado y reclamo resuelto', { tone: 'success', icon: 'checkCircle' });
          }
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Salón
   ───────────────────────────────────────────────────────────── */
function AdminSalon({ openOrder, onReceipt, onCancel, openNewOrder }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [selectedTable, setSelectedTable] = useState(null);
  const now = useTick(true);

  const activeMesa = state.orders.filter(
    (order) => order.type === 'mesa' && ACTIVE_STATUSES.includes(order.status)
  );
  const readyOrders = state.orders.filter((order) => order.status === 'listo');

  return (
    <div className="admin-view">
      <header className="admin-view-head">
        <div>
          <span className="eyebrow">Vista del salón</span>
          <h1>
            Las mesas <em>de hoy.</em>
          </h1>
          <p>Ocupación en vivo, pedidos por mesa y cobro de cuentas.</p>
        </div>
        <div className="admin-view-actions">
          <span className="live-label">
            <i /> ACTUALIZADO {fmtTime(now)}
          </span>
          <button type="button" className="btn btn-ink" onClick={() => openNewOrder(1)}>
            <Icon name="plus" size={16} /> Abrir mesa
          </button>
        </div>
      </header>

      <div className="salon-layout">
        <section className="admin-panel salon-floor-panel">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">Plano del salón</span>
              <h2>
                {state.settings.tableCount} mesas <em>disponibles.</em>
              </h2>
            </div>
            <div className="salon-legend">
              <span><i className="dot dot-free" /> Libre</span>
              <span><i className="dot dot-busy" /> Ocupada</span>
              <span><i className="dot dot-ready" /> Lista</span>
            </div>
          </div>
          <div className="salon-grid">
            {Array.from({ length: state.settings.tableCount }, (_, index) => {
              const number = index + 1;
              const orders = activeMesa.filter((order) => order.table === number);
              const total = orders.reduce((sum, order) => sum + orderTotals(order, state.settings).total, 0);
              const ready = orders.some((order) => order.status === 'listo');
              return (
                <button
                  type="button"
                  key={number}
                  className={cn('salon-card', orders.length && 'is-busy', ready && 'is-ready')}
                  onClick={() => setSelectedTable(number)}
                >
                  <div className="salon-card-top">
                    <span className="salon-card-number">{String(number).padStart(2, '0')}</span>
                    <span className={`salon-card-state ${orders.length ? 'is-busy' : ''}`}>
                      {ready ? 'Lista' : orders.length ? 'Ocupada' : 'Libre'}
                    </span>
                  </div>
                  {orders.length ? (
                    <>
                      <div className="salon-card-orders">
                        {orders.map((order) => (
                          <span key={order.id}>
                            {order.code} · {STATUS[order.status].short}
                          </span>
                        ))}
                      </div>
                      <div className="salon-card-total">
                        <span>{orders.length} pedido{orders.length > 1 ? 's' : ''}</span>
                        <b>{money(total)}</b>
                      </div>
                    </>
                  ) : (
                    <div className="salon-card-empty">
                      <Icon name="table" size={22} />
                      <span>Tocar para abrir</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="admin-panel salon-ready-panel">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">Para entregar</span>
              <h2>
                Listos <em>ahora.</em>
              </h2>
            </div>
            <span className="count-chip">{readyOrders.length}</span>
          </div>
          <div className="salon-ready-list">
            {readyOrders.length ? (
              readyOrders.map((order) => (
                <div className="salon-ready-row" key={order.id}>
                  <span className="salon-ready-code">{order.code}</span>
                  <div>
                    <b>{order.customerName}</b>
                    <small>
                      {order.type === 'mesa' ? `Mesa ${String(order.table).padStart(2, '0')}` : TYPE_META[order.type]?.short}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="admin-mini-btn is-accent"
                    title="Marcar entregado"
                    onClick={() => {
                      actions.setOrderStatus(order.id, 'entregado');
                      toast(`${order.code} entregado`, { tone: 'success', icon: 'checkCircle' });
                    }}
                  >
                    <Icon name="check" size={15} />
                  </button>
                </div>
              ))
            ) : (
              <Empty icon="clock" title="Nada listo por ahora" text="Los pedidos aparecen acá al salir de cocina." />
            )}
          </div>
        </aside>
      </div>

      <SalonTableModal
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
        onNewOrder={(table) => {
          setSelectedTable(null);
          openNewOrder(table);
        }}
        onOpenOrder={(order) => {
          setSelectedTable(null);
          openOrder(order);
        }}
        onReceipt={onReceipt}
        onCancel={onCancel}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Carta / menú
   ───────────────────────────────────────────────────────────── */
function NewProductModal({ open, onClose }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('hamburguesas');
  const [desc, setDesc] = useState('');
  const [art, setArt] = useState('burger');
  const [accent, setAccent] = useState('#d1502a');
  const [tag, setTag] = useState('');
  const [variants, setVariants] = useState([{ label: 'Simple', price: '' }]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setCategory('hamburguesas');
    setDesc('');
    setArt('burger');
    setAccent('#d1502a');
    setTag('');
    setVariants([{ label: 'Simple', price: '' }]);
    setError('');
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} size="lg" className="new-product-modal">
      <span className="eyebrow">Nueva incorporación</span>
      <h2>Sumá un plato a la carta.</h2>
      <p className="muted-copy">Definí variantes y precios distintos. Se publica al instante para los clientes.</p>
      <div className="new-product-grid">
        <div className="new-product-visual">
          <DishArt kind={art} accent={accent} />
          <div className="art-picker">
            <span>Ilustración</span>
            <div className="art-picker-grid">
              {ART_KINDS.map((kind) => (
                <button
                  type="button"
                  key={kind}
                  className={art === kind ? 'is-active' : ''}
                  onClick={() => setArt(kind)}
                  title={kind}
                >
                  <DishArt kind={kind} accent={accent} />
                </button>
              ))}
            </div>
          </div>
          <div className="accent-picker">
            <span>Color</span>
            <div>
              {ACCENTS.map((color) => (
                <button
                  type="button"
                  key={color}
                  style={{ background: color }}
                  className={accent === color ? 'is-active' : ''}
                  onClick={() => setAccent(color)}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="new-product-fields">
          <Field label="Nombre del plato">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Smash de la casa" />
          </Field>
          <div className="admin-fields-row">
            <Field label="Categoría">
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Etiqueta" hint="opcional">
              <input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Ej: Nueva" />
            </Field>
          </div>
          <Field label="Descripción">
            <textarea
              rows={3}
              value={desc}
              onChange={(event) => setDesc(event.target.value)}
              placeholder="Ingredientes y onda del plato"
            />
          </Field>
          <div className="variant-editor">
            <div className="variant-editor-head">
              <span>Variantes y precios</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setVariants((current) => [...current, { label: '', price: '' }])}
              >
                <Icon name="plus" size={13} /> Agregar variante
              </button>
            </div>
            {variants.map((variant, index) => (
              <div className="variant-editor-row" key={index}>
                <input
                  value={variant.label}
                  onChange={(event) =>
                    setVariants((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, label: event.target.value } : entry
                      )
                    )
                  }
                  placeholder="Ej: Doble"
                />
                <div className="variant-editor-price">
                  <span>$</span>
                  <input
                    type="number"
                    min="0"
                    value={variant.price}
                    onChange={(event) =>
                      setVariants((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, price: event.target.value } : entry
                        )
                      )
                    }
                    placeholder="Precio"
                  />
                </div>
                <button
                  type="button"
                  className="admin-mini-btn is-danger"
                  onClick={() => setVariants((current) => current.filter((_, entryIndex) => entryIndex !== index))}
                  disabled={variants.length === 1}
                  aria-label="Quitar variante"
                >
                  <Icon name="trash" size={13} />
                </button>
              </div>
            ))}
          </div>
          {error && (
            <p className="form-error">
              <Icon name="alert" size={14} /> {error}
            </p>
          )}
        </div>
      </div>
      <div className="confirm-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-ink"
          onClick={() => {
            if (name.trim().length < 2) {
              setError('El plato necesita un nombre.');
              return;
            }
            const cleanVariants = variants
              .filter((variant) => variant.label.trim() && Number(variant.price) > 0)
              .map((variant) => ({ label: variant.label.trim(), price: Number(variant.price) }));
            if (!cleanVariants.length) {
              setError('Agregá al menos una variante con precio.');
              return;
            }
            actions.addProduct({
              name: name.trim(),
              category,
              desc: desc.trim() || 'Nuevo plato de la casa, hecho al momento.',
              art,
              accent,
              tag: tag.trim(),
              variants: cleanVariants,
            });
            toast(`${name.trim()} ya está en la carta`, { tone: 'success', icon: 'spark' });
            onClose();
          }}
        >
          Publicar plato <Icon name="arrowRight" size={15} />
        </button>
      </div>
    </Modal>
  );
}

function MenuManager() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [removeProduct, setRemoveProduct] = useState(null);

  const products = state.products.filter(
    (product) =>
      !query ||
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="admin-view">
      <header className="admin-view-head">
        <div>
          <span className="eyebrow">Carta y precios</span>
          <h1>
            La carta, <em>al día.</em>
          </h1>
          <p>Activá o pausá platos, ajustá precios y publicá nuevas incorporaciones.</p>
        </div>
        <div className="admin-view-actions">
          <button type="button" className="btn btn-ink" onClick={() => setNewOpen(true)}>
            <Icon name="plus" size={16} /> Nuevo plato
          </button>
        </div>
      </header>

      <div className="admin-filters">
        <div className="admin-search">
          <Icon name="search" size={15} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar plato o categoría" />
        </div>
        <span className="count-chip">{products.length} platos</span>
      </div>

      <div className="menu-manager-grid">
        {products.map((product) => (
          <article className={cn('menu-manager-card', !product.available && 'is-off')} key={product.id}>
            <div className="menu-manager-visual">
              <DishArt kind={product.art} accent={product.accent} />
              <button
                type="button"
                className={cn('menu-availability', product.available ? 'is-on' : '')}
                onClick={() => actions.toggleProduct(product.id)}
              >
                <i /> {product.available ? 'Disponible' : 'Agotado'}
              </button>
            </div>
            <div className="menu-manager-body">
              <div className="menu-manager-title">
                <div>
                  <span>{CATEGORIES.find((item) => item.id === product.category)?.label}</span>
                  <h3>{product.name}</h3>
                </div>
                <button
                  type="button"
                  className="admin-mini-btn is-danger"
                  onClick={() => setRemoveProduct(product)}
                  aria-label={`Eliminar ${product.name}`}
                >
                  <Icon name="trash" size={13} />
                </button>
              </div>
              <div className="menu-variant-list">
                {product.variants.map((variant) => (
                  <label key={variant.id}>
                    <span>{variant.label}</span>
                    <div>
                      <span>$</span>
                      <input
                        key={`${variant.id}-${variant.price}`}
                        type="number"
                        min="0"
                        defaultValue={variant.price}
                        onBlur={(event) =>
                          actions.updateVariantPrice(product.id, variant.id, event.target.value)
                        }
                      />
                    </div>
                  </label>
                ))}
              </div>
              <span className="menu-manager-note">
                <Icon name="info" size={12} /> Los cambios de precio se aplican al instante.
              </span>
            </div>
          </article>
        ))}
      </div>

      <section className="admin-panel admin-offers-panel">
        <div className="admin-panel-head">
          <div>
            <span className="eyebrow">Publicidad y combos</span>
            <h2>
              Promos <em>activas.</em>
            </h2>
          </div>
          <span className="count-chip">{state.offers.filter((offer) => offer.active).length} encendidas</span>
        </div>
        <div className="admin-offer-list">
          {state.offers.map((offer) => (
            <div className={cn('admin-offer-row', !offer.active && 'is-off')} key={offer.id}>
              <span className="admin-offer-art">
                <DishArt kind={offer.art} accent={offer.accent} />
              </span>
              <div>
                <b>{offer.name}</b>
                <small>{offer.includes.join(' · ')}</small>
              </div>
              <span className="admin-offer-price">
                {money(offer.price)} <del>{money(offer.oldPrice)}</del>
              </span>
              <Toggle checked={offer.active} onChange={() => actions.toggleOffer(offer.id)} label={offer.active ? 'Activa' : 'Pausada'} />
            </div>
          ))}
        </div>
      </section>

      <NewProductModal open={newOpen} onClose={() => setNewOpen(false)} />
      <ConfirmDialog
        open={Boolean(removeProduct)}
        onClose={() => setRemoveProduct(null)}
        title={`Eliminar ${removeProduct?.name || 'plato'}`}
        text="Se quita de la carta y de la vista de los clientes. Los pedidos históricos conservan su detalle."
        confirmLabel="Eliminar plato"
        onConfirm={() => {
          if (removeProduct) {
            actions.removeProduct(removeProduct.id);
            toast('Plato eliminado de la carta', { icon: 'trash' });
          }
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Anuncios
   ───────────────────────────────────────────────────────────── */
function Announcements() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState('nuevo');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [cta, setCta] = useState('');
  const [art, setArt] = useState('combo');
  const [accent, setAccent] = useState('#d1502a');
  const [error, setError] = useState('');

  const reset = () => {
    setKind('nuevo');
    setTitle('');
    setBody('');
    setCta('');
    setArt('combo');
    setAccent('#d1502a');
    setError('');
  };

  return (
    <div className="admin-view">
      <header className="admin-view-head">
        <div>
          <span className="eyebrow">Comunicación</span>
          <h1>
            Anuncios que <em>se ven.</em>
          </h1>
          <p>Publicá novedades, avisos y promos. Aparecen en la home del cliente al instante.</p>
        </div>
        <div className="admin-view-actions">
          <button type="button" className="btn btn-ink" onClick={() => setOpen(true)}>
            <Icon name="plus" size={16} /> Nuevo anuncio
          </button>
        </div>
      </header>

      <div className="announcements-admin-grid">
        {state.announcements.map((item) => (
          <article className={cn('announcement-admin-card', !item.active && 'is-off')} key={item.id}>
            <div className="announcement-admin-art">
              <DishArt kind={item.art} accent={item.accent} />
              <span>{item.kind === 'nuevo' ? 'Nuevo' : item.kind === 'promo' ? 'Promo' : 'Aviso'}</span>
            </div>
            <div className="announcement-admin-body">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <div className="announcement-admin-foot">
                <small>{timeAgo(item.createdAt)}</small>
                <div>
                  <Toggle
                    checked={item.active}
                    onChange={() => actions.updateAnnouncement(item.id, { active: !item.active })}
                    label={item.active ? 'Visible' : 'Oculto'}
                  />
                  <button
                    type="button"
                    className="admin-mini-btn is-danger"
                    onClick={() => {
                      actions.removeAnnouncement(item.id);
                      toast('Anuncio eliminado', { icon: 'trash' });
                    }}
                    aria-label="Eliminar anuncio"
                  >
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
        {!state.announcements.length && (
          <Empty icon="megaphone" title="Sin anuncios" text="Publicá la primera novedad para tus clientes." />
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} size="lg" className="new-announcement-modal">
        <span className="eyebrow">Nueva comunicación</span>
        <h2>Publicá algo rico.</h2>
        <p className="muted-copy">Se muestra en la home del cliente y en la sección de novedades.</p>
        <div className="announcement-form-grid">
          <div className="announcement-form-preview">
            <DishArt kind={art} accent={accent} />
            <span>{kind === 'nuevo' ? 'Nuevo en carta' : kind === 'promo' ? 'Promo' : 'Aviso'}</span>
          </div>
          <div className="announcement-form">
            <div className="kind-chips">
              {[
                { id: 'nuevo', label: 'Nuevo plato' },
                { id: 'promo', label: 'Promo' },
                { id: 'aviso', label: 'Aviso' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={kind === item.id ? 'is-active' : ''}
                  onClick={() => setKind(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Field label="Título">
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej: Llega la burger de otoño" />
            </Field>
            <Field label="Texto">
              <textarea rows={3} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Contá qué trae de nuevo" />
            </Field>
            <div className="admin-fields-row">
              <Field label="Botón" hint="opcional">
                <input value={cta} onChange={(event) => setCta(event.target.value)} placeholder="Ver en la carta" />
              </Field>
              <Field label="Ilustración">
                <select value={art} onChange={(event) => setArt(event.target.value)}>
                  {ART_KINDS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="accent-picker is-inline">
              <span>Color</span>
              <div>
                {ACCENTS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    style={{ background: color }}
                    className={accent === color ? 'is-active' : ''}
                    onClick={() => setAccent(color)}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
            </div>
            {error && (
              <p className="form-error">
                <Icon name="alert" size={14} /> {error}
              </p>
            )}
          </div>
        </div>
        <div className="confirm-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-ink"
            onClick={() => {
              if (title.trim().length < 3 || body.trim().length < 8) {
                setError('Completá un título y un texto breve.');
                return;
              }
              actions.addAnnouncement({
                kind,
                title: title.trim(),
                body: body.trim(),
                cta: cta.trim(),
                art,
                accent,
              });
              toast('Anuncio publicado', { tone: 'success', icon: 'megaphone' });
              setOpen(false);
              reset();
            }}
          >
            Publicar anuncio <Icon name="arrowRight" size={15} />
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Ajustes
   ───────────────────────────────────────────────────────────── */
function Settings({ user }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [draft, setDraft] = useState(state.settings);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setDraft(state.settings);
  }, [state.settings]);

  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));

  return (
    <div className="admin-view">
      <header className="admin-view-head">
        <div>
          <span className="eyebrow">Configuración</span>
          <h1>
            Todo <em>a tu manera.</em>
          </h1>
          <p>Automatización de cocina, cobros, salón y datos del local.</p>
        </div>
        <div className="admin-view-actions">
          <button
            type="button"
            className="btn btn-ink"
            onClick={() => {
              actions.updateSettings(draft);
              toast('Configuración guardada', { tone: 'success', icon: 'checkCircle' });
            }}
          >
            <Icon name="check" size={16} /> Guardar cambios
          </button>
        </div>
      </header>

      <div className="settings-grid">
        <section className="admin-panel settings-card">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">Cocina</span>
              <h2>
                Automatización <em>de pedidos.</em>
              </h2>
            </div>
            <span className="admin-stat-icon">
              <Icon name="timer" size={18} />
            </span>
          </div>
          <Toggle
            checked={draft.autoAdvance}
            onChange={(value) => update({ autoAdvance: value })}
            label="Pasar pedidos a cocina automáticamente"
          />
          <div className="settings-fields">
            <Field label="Minutos antes de pasar a preparación" hint="por defecto 2">
              <input
                type="number"
                min="1"
                max="30"
                value={draft.autoPrepMinutes}
                onChange={(event) => update({ autoPrepMinutes: Number(event.target.value) || 1 })}
              />
            </Field>
            <Field label="Minutos para marcar listo automáticamente" hint="0 = manual">
              <input
                type="number"
                min="0"
                max="60"
                value={draft.autoReadyMinutes}
                onChange={(event) => update({ autoReadyMinutes: Number(event.target.value) || 0 })}
              />
            </Field>
            <Field label="Minutos que un entregado sigue en pantalla" hint="turnero">
              <input
                type="number"
                min="1"
                max="120"
                value={draft.cleanupMinutes}
                onChange={(event) => update({ cleanupMinutes: Number(event.target.value) || 1 })}
              />
            </Field>
          </div>
          <p className="settings-help">
            <Icon name="info" size={13} /> Con la automatización activa, el cliente puede modificar o cancelar
            hasta que el pedido entra a cocina. Después queda bloqueado.
          </p>
        </section>

        <section className="admin-panel settings-card">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">Cobros</span>
              <h2>
                Precios e <em>impuestos.</em>
              </h2>
            </div>
            <span className="admin-stat-icon">
              <Icon name="wallet" size={18} />
            </span>
          </div>
          <div className="settings-fields">
            <Field label="IVA" hint="%">
              <input
                type="number"
                min="0"
                max="50"
                value={Math.round(draft.tax * 100)}
                onChange={(event) => update({ tax: (Number(event.target.value) || 0) / 100 })}
              />
            </Field>
            <Field label="Costo de envío" hint="$">
              <input
                type="number"
                min="0"
                value={draft.deliveryFee}
                onChange={(event) => update({ deliveryFee: Number(event.target.value) || 0 })}
              />
            </Field>
            <Field label="Servicio de envío" hint="%">
              <input
                type="number"
                min="0"
                max="50"
                value={Math.round(draft.deliveryService * 100)}
                onChange={(event) => update({ deliveryService: (Number(event.target.value) || 0) / 100 })}
              />
            </Field>
            <Field label="Cantidad de mesas">
              <input
                type="number"
                min="4"
                max="40"
                value={draft.tableCount}
                onChange={(event) => update({ tableCount: Number(event.target.value) || 4 })}
              />
            </Field>
          </div>
          <p className="settings-help">
            <Icon name="info" size={13} /> El envío se cobra con recargo sobre el subtotal. La propina siempre es
            opcional y se suma en el checkout o al cerrar la cuenta.
          </p>
        </section>

        <section className="admin-panel settings-card">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">Experiencia</span>
              <h2>
                Cliente y <em>salón.</em>
              </h2>
            </div>
            <span className="admin-stat-icon">
              <Icon name="spark" size={18} />
            </span>
          </div>
          <Toggle
            checked={draft.acceptOrders}
            onChange={(value) => update({ acceptOrders: value })}
            label="Aceptar pedidos online"
          />
          <Toggle
            checked={draft.promoPopup}
            onChange={(value) => update({ promoPopup: value })}
            label="Mostrar popup de ofertas al entrar"
          />
          <div className="settings-fields">
            <Field label="Nombre del local">
              <input value={draft.restaurantName} onChange={(event) => update({ restaurantName: event.target.value })} />
            </Field>
            <Field label="Horarios">
              <input value={draft.hours} onChange={(event) => update({ hours: event.target.value })} />
            </Field>
          </div>
          <Field label="Dirección">
            <input value={draft.address} onChange={(event) => update({ address: event.target.value })} />
          </Field>
        </section>

        <section className="admin-panel settings-card">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">Cuenta del equipo</span>
              <h2>
                Sesión <em>activa.</em>
              </h2>
            </div>
          </div>
          <div className="settings-account">
            <span className="settings-avatar">{user.name.charAt(0)}</span>
            <div>
              <b>{user.name}</b>
              <small>{user.email}</small>
              <span>Administración · acceso total</span>
            </div>
          </div>
          <div className="settings-help-block">
            <b>Datos de demostración</b>
            <p>
              Toda la información se guarda en este navegador. Podés abrir una pestaña como cliente y otra como
              administrador para ver la sincronización en vivo.
            </p>
          </div>
          <button type="button" className="btn btn-danger-ghost btn-block" onClick={() => setConfirmReset(true)}>
            <Icon name="rotate" size={15} /> Restablecer datos demo
          </button>
        </section>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restablecer el prototipo"
        text="Se vuelven a cargar los pedidos, cuentas y configuración iniciales. Perdés los cambios de esta demo."
        confirmLabel="Sí, restablecer"
        onConfirm={() => {
          actions.resetDemo();
          toast('Datos demo restablecidos', { tone: 'success', icon: 'rotate' });
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Admin shell
   ───────────────────────────────────────────────────────────── */
export default function AdminApp({ user, onLogout }) {
  const { state } = useStore();
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [receiptId, setReceiptId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [newOrder, setNewOrder] = useState({ open: false, table: 1 });

  const openClaims = state.claims.filter((claim) => claim.status === 'abierto').length;
  const activeOrders = state.orders.filter((order) => ACTIVE_STATUSES.includes(order.status));
  const receiptOrder = state.orders.find((order) => order.id === receiptId) || null;

  const go = (id) => {
    setTab(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openOrder = (order) => setDetailId(order.id);
  const openNewOrder = (table = 1) => setNewOrder({ open: true, table });

  return (
    <div className="admin-app">
      <aside className={cn('admin-sidebar', sidebarOpen && 'is-open')}>
        <div className="admin-brand">
          <span className="brand-mark">m</span>
          <div>
            <b>miga</b>
            <small>administración</small>
          </div>
          <button type="button" className="admin-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="admin-sidebar-status">
          <span className="live-dot" />
          <div>
            <b>Servicio activo</b>
            <small>{activeOrders.length} pedidos en curso</small>
          </div>
        </div>

        <nav className="admin-nav">
          <span className="admin-nav-label">Operación</span>
          {navItems.slice(0, 5).map((item) => (
            <button
              type="button"
              key={item.id}
              className={tab === item.id ? 'is-active' : ''}
              onClick={() => go(item.id)}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
              {item.id === 'orders' && activeOrders.length > 0 && <em>{activeOrders.length}</em>}
              {item.id === 'claims' && openClaims > 0 && <em className="is-alert">{openClaims}</em>}
              {item.id === 'salon' && (
                <em>{state.orders.filter((order) => order.type === 'mesa' && ACTIVE_STATUSES.includes(order.status)).length}</em>
              )}
            </button>
          ))}
          <span className="admin-nav-label">Contenido</span>
          {navItems.slice(5).map((item) => (
            <button
              type="button"
              key={item.id}
              className={tab === item.id ? 'is-active' : ''}
              onClick={() => go(item.id)}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <div className="admin-user">
            <span className="account-avatar">{user.name.charAt(0)}</span>
            <div>
              <b>{user.name}</b>
              <small>{user.email}</small>
            </div>
            <button type="button" onClick={onLogout} title="Cerrar sesión" aria-label="Cerrar sesión">
              <Icon name="logout" size={17} />
            </button>
          </div>
          <span className="admin-version">Miga · prototipo v3</span>
        </div>
      </aside>

      {sidebarOpen && <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="admin-menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
            <Icon name="grid" size={19} />
          </button>
          <div className="admin-topbar-crumb">
            <span>Miga</span>
            <Icon name="chevronRight" size={13} />
            <b>{navItems.find((item) => item.id === tab)?.label}</b>
          </div>
          <div className="admin-topbar-actions">
            <span className="open-pill">
              <i /> Abierto ahora
            </span>
            <button
              type="button"
              className="admin-topbar-alert"
              onClick={() => go('claims')}
              title="Reclamos abiertos"
            >
              <Icon name="bell" size={17} />
              {openClaims > 0 && <i>{openClaims}</i>}
            </button>
            <button type="button" className="btn btn-cream btn-sm" onClick={() => openNewOrder(1)}>
              <Icon name="plus" size={14} /> Pedido
            </button>
            <span className="admin-topbar-avatar">{user.name.charAt(0)}</span>
          </div>
        </header>

        <div className="admin-content">
          {tab === 'dashboard' && (
            <Dashboard go={go} openOrder={openOrder} openNewOrder={() => openNewOrder(1)} />
          )}
          {tab === 'orders' && (
            <AdminOrders
              openOrder={openOrder}
              onReceipt={(order) => setReceiptId(order.id)}
              onCancel={(order) => setCancelTarget(order)}
            />
          )}
          {tab === 'claims' && <AdminClaims openOrder={openOrder} />}
          {tab === 'salon' && (
            <AdminSalon
              openOrder={openOrder}
              onReceipt={(order) => setReceiptId(order.id)}
              onCancel={(order) => setCancelTarget(order)}
              openNewOrder={openNewOrder}
            />
          )}
          {tab === 'menu' && <MenuManager />}
          {tab === 'announcements' && <Announcements />}
          {tab === 'turnero' && (
            <TurnBoard role="admin" onBack={() => go('dashboard')} />
          )}
          {tab === 'settings' && <Settings user={user} />}
        </div>
      </div>

      <AdminOrderModal
        orderId={detailId}
        onClose={() => setDetailId(null)}
        onReceipt={(order) => {
          setDetailId(null);
          setReceiptId(order.id);
        }}
        onCancel={(order) => {
          setDetailId(null);
          setCancelTarget(order);
        }}
      />
      <CancelOrderModal order={cancelTarget} onClose={() => setCancelTarget(null)} />
      <NewTableOrderModal
        open={newOrder.open}
        initialTable={newOrder.table}
        onClose={() => setNewOrder({ ...newOrder, open: false })}
        onCreated={(order) => setDetailId(order.id)}
      />
      <ReceiptModal order={receiptOrder} settings={state.settings} open={Boolean(receiptOrder)} onClose={() => setReceiptId(null)} />
    </div>
  );
}
