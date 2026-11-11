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
  fmtDateTime,
  fmtTime,
  money,
  orderSubtotal,
  orderTotals,
  timeAgo,
} from '../utils';

/* ─────────────────────────────────────────────────────────────
   Utilidades locales
   ───────────────────────────────────────────────────────────── */
function useTick(active = true) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

const lineFromProduct = (product, variant, qty = 1, note = '') => ({
  key: `p:${product.id}:${variant.id}`,
  kind: 'product',
  productId: product.id,
  name: product.name,
  variantLabel: variant.label,
  unitPrice: variant.price,
  qty,
  art: product.art,
  accent: product.accent,
  note,
});

const lineFromOffer = (offer, qty = 1) => ({
  key: `o:${offer.id}`,
  kind: 'offer',
  offerId: offer.id,
  name: offer.name,
  variantLabel: 'Combo especial',
  unitPrice: offer.price,
  qty,
  art: offer.art,
  accent: offer.accent,
  note: '',
});

/* ─────────────────────────────────────────────────────────────
   Tarjeta de producto
   ───────────────────────────────────────────────────────────── */
function ProductCard({ product, onOpen, onQuickAdd }) {
  const minPrice = Math.min(...product.variants.map((variant) => variant.price));
  return (
    <article className={cn('product-card', !product.available && 'is-sold')} style={{ '--card-accent': product.accent }}>
      <div
        className="product-visual"
        role="button"
        tabIndex={0}
        onClick={() => product.available && onOpen(product)}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && product.available) onOpen(product);
        }}
        aria-label={`Ver ${product.name}`}
      >
        <DishArt kind={product.art} accent={product.accent} />
        <div className="product-badges">
          {product.tag && <span className="badge badge-tag">{product.tag}</span>}
          {product.isNew && <span className="badge badge-new">Nuevo</span>}
        </div>
        {!product.available && <span className="soldout-flag">Agotado hoy</span>}
        <button
          type="button"
          className="product-quick"
          aria-label={`Agregar ${product.name}`}
          disabled={!product.available}
          onClick={(event) => {
            event.stopPropagation();
            onQuickAdd(product);
          }}
        >
          <Icon name="plus" size={17} />
        </button>
        <span className="product-variants">{product.variants.length} opciones</span>
      </div>
      <div className="product-info">
        <div className="product-title">
          <h3>{product.name}</h3>
        </div>
        <p>{product.desc}</p>
        <div className="product-foot">
          <div className="product-price">
            <small>Desde</small>
            <b>{money(minPrice)}</b>
          </div>
          <button type="button" className="product-choose" onClick={() => onOpen(product)} disabled={!product.available}>
            Elegir <Icon name="arrowRight" size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
   Ficha de producto / selector de variante
   ───────────────────────────────────────────────────────────── */
function ProductSheet({ product, open, onClose, onAdd }) {
  const [variantId, setVariantId] = useState(null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!product) return;
    setVariantId(product.variants[0]?.id || null);
    setQty(1);
    setNote('');
    setError('');
  }, [product?.id]);

  if (!product) return null;
  const variant = product.variants.find((item) => item.id === variantId) || product.variants[0];

  return (
    <Modal open={open} onClose={onClose} size="lg" className="product-sheet">
      <div className="product-sheet-art" style={{ '--dish-accent': product.accent }}>
        <DishArt kind={product.art} accent={product.accent} />
        <div className="product-sheet-tags">
          {product.tag && <span className="badge badge-tag">{product.tag}</span>}
          {product.isNew && <span className="badge badge-new">Nuevo</span>}
        </div>
        <div className="product-sheet-note">
          <Icon name="leaf" size={14} />
          Hecho al momento
        </div>
      </div>
      <div className="product-sheet-body">
        <span className="eyebrow">{CATEGORIES.find((category) => category.id === product.category)?.label}</span>
        <h2>{product.name}</h2>
        <p className="product-sheet-desc">{product.desc}</p>

        <div className="variant-block">
          <div className="variant-head">
            <span>Elegí tu opción</span>
            <small>El precio cambia según la variante</small>
          </div>
          <div className="variant-list">
            {product.variants.map((item) => (
              <button
                type="button"
                key={item.id}
                className={cn('variant-option', item.id === variant?.id && 'is-active')}
                onClick={() => setVariantId(item.id)}
              >
                <span className="variant-radio">{item.id === variant?.id && <i />}</span>
                <span className="variant-text">
                  <b>{item.label}</b>
                  {item.note && <small>{item.note}</small>}
                </span>
                <b className="variant-price">{money(item.price)}</b>
              </button>
            ))}
          </div>
        </div>

        <Field label="Nota para la cocina" hint="opcional" className="product-note">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Sin cebolla, bien cocida, etc."
            maxLength={90}
          />
        </Field>

        <div className="product-sheet-foot">
          <Qty value={qty} onChange={setQty} min={1} max={20} label="cantidad del producto" />
          <button
            type="button"
            className="btn btn-ink product-add"
            onClick={() => {
              if (!product.available) {
                setError('Este plato está agotado por hoy.');
                return;
              }
              onAdd(product, variant, qty, note.trim());
              onClose();
            }}
          >
            Agregar · {money((variant?.price || 0) * qty)}
            <Icon name="bag" size={16} />
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Popup de ofertas / publicidad
   ───────────────────────────────────────────────────────────── */
function PromoModal({ open, offers, onClose, onAdd, onExplore }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!open) return undefined;
    setIndex(0);
    const timer = setInterval(() => setIndex((value) => (value + 1) % Math.max(1, offers.length)), 4200);
    return () => clearInterval(timer);
  }, [open, offers.length]);

  if (!offers.length) return null;
  const offer = offers[index % offers.length];
  const discount = Math.round((1 - offer.price / offer.oldPrice) * 100);

  return (
    <Modal open={open} onClose={onClose} size="lg" className="promo-modal">
      <div className="promo-ribbon">
        <Icon name="megaphone" size={15} /> Publicidad · oferta del día
      </div>
      <div className="promo-grid">
        <div className="promo-art" style={{ '--dish-accent': offer.accent }}>
          <DishArt kind={offer.art} accent={offer.accent} />
          <span className="promo-discount">−{discount}%</span>
          <span className="promo-sticker">Solo hoy</span>
        </div>
        <div className="promo-copy">
          <span className="badge badge-soft">{offer.badge}</span>
          <h2>{offer.name}</h2>
          <p>{offer.tagline}</p>
          <ul className="promo-includes">
            {offer.includes.map((item) => (
              <li key={item}>
                <Icon name="check" size={13} /> {item}
              </li>
            ))}
          </ul>
          <div className="promo-price">
            <b>{money(offer.price)}</b>
            <del>{money(offer.oldPrice)}</del>
          </div>
          <div className="promo-actions">
            <button
              type="button"
              className="btn btn-ink"
              onClick={() => {
                onAdd(offer);
              }}
            >
              Sumar al pedido <Icon name="plus" size={15} />
            </button>
            <button type="button" className="btn btn-ghost" onClick={onExplore}>
              Ver la carta
            </button>
          </div>
          <div className="promo-dots">
            {offers.map((item, dotIndex) => (
              <button
                type="button"
                key={item.id}
                className={dotIndex === index % offers.length ? 'is-active' : ''}
                onClick={() => setIndex(dotIndex)}
                aria-label={`Ver ${item.name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Checkout
   ───────────────────────────────────────────────────────────── */
function CheckoutModal({
  open,
  onClose,
  lines,
  user,
  settings,
  defaultTable,
  onPlaced,
}) {
  const { actions } = useStore();
  const toast = useToast();
  const [type, setType] = useState('mesa');
  const [table, setTable] = useState('04');
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  const [tipMode, setTipMode] = useState('0');
  const [customTip, setCustomTip] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setType('mesa');
    setTable(defaultTable || '04');
    setName(user.name);
    setPhone(user.phone || '');
    setAddress('');
    setPaymentMethod('tarjeta');
    setTipMode('0');
    setCustomTip('');
    setNote('');
    setError('');
  }, [open, defaultTable, user]);

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  const tax = Math.round(subtotal * settings.tax);
  const delivery = type === 'delivery' ? settings.deliveryFee : 0;
  const service = type === 'delivery' ? Math.round(subtotal * settings.deliveryService) : 0;
  const tip =
    type === 'mesa'
      ? tipMode === 'custom'
        ? Math.max(0, Number(customTip) || 0)
        : Math.round((subtotal * Number(tipMode)) / 100)
      : 0;
  const total = subtotal + tax + delivery + service + tip;

  const tables = Array.from({ length: settings.tableCount }, (_, index) => index + 1);

  const submit = () => {
    if (!lines.length) {
      setError('Tu pedido está vacío.');
      return;
    }
    if (!settings.acceptOrders) {
      setError('Estamos cerrados por el momento. Probá en un rato.');
      return;
    }
    if (type === 'delivery' && address.trim().length < 8) {
      setError('Necesitamos una dirección para enviar tu pedido.');
      return;
    }
    if (type === 'delivery' && phone.trim().length < 6) {
      setError('Dejanos un teléfono de contacto para el envío.');
      return;
    }
    if (!name.trim()) {
      setError('¿A nombre de quién preparamos el pedido?');
      return;
    }
    const order = actions.placeOrder({
      userId: user.id,
      customerName: name.trim(),
      type,
      table,
      phone: phone.trim(),
      address: address.trim(),
      items: lines.map((line) => ({
        productId: line.productId || line.offerId || line.key,
        name: line.name,
        variantLabel: line.variantLabel,
        unitPrice: line.unitPrice,
        qty: line.qty,
        art: line.art,
        accent: line.accent,
        kind: line.kind,
        note: line.note || '',
      })),
      tip,
      tipPct: type === 'mesa' && tipMode !== 'custom' ? Number(tipMode) : 0,
      note: note.trim(),
      paymentMethod,
      deliveryFee: delivery,
      servicePct: settings.deliveryService,
      createdBy: 'client',
    });
    toast(`Pedido ${order.code} confirmado`, { tone: 'success', icon: 'checkCircle' });
    onPlaced(order);
  };

  return (
    <Modal open={open} onClose={onClose} size="lg" className="checkout-modal">
      <div className="checkout-head">
        <span className="eyebrow">Cerrar pedido</span>
        <h2>¿Cómo lo querés?</h2>
        <p>Elegí modalidad, pago y si querés dejar propina. Todo en un paso.</p>
      </div>

      <div className="checkout-body">
        <div className="checkout-main">
          <section className="checkout-section">
            <div className="checkout-section-head">
              <span>01</span>
              <div>
                <h3>Modalidad</h3>
                <small>Salón, retiro o envío</small>
              </div>
            </div>
            <Segmented
              value={type}
              onChange={(id) => setType(id)}
              options={[
                { id: 'mesa', label: 'En el salón', icon: 'table', hint: 'Mesa' },
                { id: 'retiro', label: 'Retiro', icon: 'bag', hint: 'Turno' },
                { id: 'delivery', label: 'Delivery', icon: 'bike', hint: 'Con recargo' },
              ]}
            />

            {type === 'mesa' && (
              <div className="table-picker">
                <div className="table-picker-head">
                  <span>Elegí tu mesa</span>
                  <small>Las mesas marcadas ya tienen un pedido abierto</small>
                </div>
                <div className="table-picker-grid">
                  {tables.map((number) => {
                    const value = String(number).padStart(2, '0');
                    return (
                      <button
                        type="button"
                        key={number}
                        className={value === table ? 'is-active' : ''}
                        onClick={() => setTable(value)}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {type === 'retiro' && (
              <div className="checkout-note-card">
                <Icon name="bag" size={18} />
                <div>
                  <b>Retirás en el local</b>
                  <p>
                    {settings.address}. Al confirmar te damos un ticket con número de turno para mostrar
                    en mostrador.
                  </p>
                </div>
              </div>
            )}

            {type === 'delivery' && (
              <div className="delivery-fields">
                <Field label="Dirección de entrega">
                  <input
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Calle, número, piso y barrio"
                    autoComplete="street-address"
                  />
                </Field>
                <Field label="Teléfono de contacto">
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="11 5555 0000"
                    autoComplete="tel"
                  />
                </Field>
                <div className="checkout-note-card is-honey">
                  <Icon name="bike" size={18} />
                  <div>
                    <b>Envío con recargo</b>
                    <p>
                      {money(settings.deliveryFee)} de envío + {Math.round(settings.deliveryService * 100)}%
                      de servicio. Llega en 35 a 50 minutos.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="checkout-section">
            <div className="checkout-section-head">
              <span>02</span>
              <div>
                <h3>Forma de pago</h3>
                <small>Elegí la que te resulte más cómoda</small>
              </div>
            </div>
            <div className="payment-grid">
              {Object.entries(PAYMENT_META).map(([id, meta]) => (
                <button
                  type="button"
                  key={id}
                  className={cn('payment-card', paymentMethod === id && 'is-active')}
                  onClick={() => setPaymentMethod(id)}
                >
                  <span className="payment-icon">
                    <Icon name={meta.icon} size={18} />
                  </span>
                  <span>
                    <b>{meta.label}</b>
                    <small>{meta.note}</small>
                  </span>
                  <span className="variant-radio">{paymentMethod === id && <i />}</span>
                </button>
              ))}
            </div>
            {paymentMethod === 'qr' && (
              <div className="qr-box">
                <div className="fake-qr" aria-hidden="true">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <i key={index} className={(index * 7 + 3) % 5 < 2 ? 'on' : ''} />
                  ))}
                </div>
                <div>
                  <b>Escaneá y pagá</b>
                  <p>Compatible con MODO, banca online y billeteras. Confirmás al instante.</p>
                </div>
              </div>
            )}
            {paymentMethod === 'transferencia' && (
              <div className="transfer-box">
                <div>
                  <small>Alias</small>
                  <b>miga.resto.mp</b>
                </div>
                <div>
                  <small>CBU</small>
                  <b>0000 0001 0023 4567 8912</b>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    navigator.clipboard?.writeText('miga.resto.mp');
                    toast('Alias copiado', { icon: 'checkCircle' });
                  }}
                >
                  Copiar alias
                </button>
              </div>
            )}
            {paymentMethod === 'efectivo' && (
              <p className="checkout-inline-help">
                <Icon name="info" size={14} /> El pago queda pendiente hasta que retires o abones en la mesa.
              </p>
            )}
          </section>

          {type === 'mesa' && (
            <section className="checkout-section">
              <div className="checkout-section-head">
                <span>03</span>
                <div>
                  <h3>Propina <em>opcional</em></h3>
                  <small>Para el equipo, sólo si te nace dejarla</small>
                </div>
              </div>
              <div className="tip-options">
                {['0', '5', '10', '15'].map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={cn('tip-chip', tipMode === value && 'is-active')}
                    onClick={() => setTipMode(value)}
                  >
                    {value === '0' ? 'Sin propina' : `${value}%`}
                    {value !== '0' && <small>{money(Math.round((subtotal * Number(value)) / 100))}</small>}
                  </button>
                ))}
                <button
                  type="button"
                  className={cn('tip-chip', tipMode === 'custom' && 'is-active')}
                  onClick={() => setTipMode('custom')}
                >
                  Otra
                </button>
              </div>
              {tipMode === 'custom' && (
                <div className="custom-tip">
                  <span>$</span>
                  <input
                    type="number"
                    min="0"
                    value={customTip}
                    onChange={(event) => setCustomTip(event.target.value)}
                    placeholder="Monto a dejar"
                  />
                </div>
              )}
              <p className="checkout-inline-help">
                <Icon name="heart" size={14} /> La propina se suma al total del pedido y va directo al equipo.
              </p>
            </section>
          )}

          <section className="checkout-section">
            <div className="checkout-section-head">
              <span>{type === 'mesa' ? '04' : '03'}</span>
              <div>
                <h3>Detalles finales</h3>
                <small>Nombre, nota y listo</small>
              </div>
            </div>
            <div className="checkout-final-fields">
              <Field label="¿A nombre de quién?">
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" />
              </Field>
              <Field label="Nota general" hint="opcional">
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Indicaciones para el pedido"
                  maxLength={120}
                />
              </Field>
            </div>
          </section>
        </div>

        <aside className="checkout-summary">
          <div className="checkout-summary-head">
            <span className="eyebrow">Resumen</span>
            <h3>{lines.reduce((sum, line) => sum + line.qty, 0)} productos</h3>
          </div>
          <div className="checkout-lines">
            {lines.map((line) => (
              <div key={line.key}>
                <span>
                  {line.qty}× {line.name}
                  {line.variantLabel && <small>{line.variantLabel}</small>}
                </span>
                <b>{money(line.unitPrice * line.qty)}</b>
              </div>
            ))}
          </div>
          <div className="checkout-totals">
            <div>
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </div>
            <div>
              <span>IVA · {Math.round(settings.tax * 100)}%</span>
              <b>{money(tax)}</b>
            </div>
            {delivery > 0 && (
              <div>
                <span>Envío</span>
                <b>{money(delivery)}</b>
              </div>
            )}
            {service > 0 && (
              <div>
                <span>Servicio de envío</span>
                <b>{money(service)}</b>
              </div>
            )}
            {tip > 0 && (
              <div className="is-tip">
                <span>Propina</span>
                <b>{money(tip)}</b>
              </div>
            )}
            <div className="checkout-total">
              <span>Total</span>
              <b>{money(total)}</b>
            </div>
          </div>
          {error && (
            <p className="form-error">
              <Icon name="alert" size={15} /> {error}
            </p>
          )}
          <button type="button" className="btn btn-ink btn-block checkout-confirm" onClick={submit}>
            Confirmar pedido <Icon name="arrowRight" size={16} />
          </button>
          <p className="checkout-fineprint">
            <Icon name="lock" size={13} /> Pago de demostración. Podés modificar el pedido durante los
            primeros {settings.autoPrepMinutes} minutos.
          </p>
        </aside>
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Modal de éxito + ticket
   ───────────────────────────────────────────────────────────── */
function SuccessModal({ order, settings, open, onClose, onReceipt, onTrack }) {
  if (!order) return null;
  const totals = orderTotals(order, settings);
  return (
    <Modal open={open} onClose={onClose} size="sm" className="success-modal">
      <div className="success-burst" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="success-icon">
        <Icon name="check" size={26} />
      </div>
      <span className="eyebrow">Pedido confirmado</span>
      <h2>¡Ya está en marcha!</h2>
      <p>
        {order.type === 'mesa'
          ? `Estás en la mesa ${String(order.table).padStart(2, '0')}. Podés modificar el pedido antes de que pase a cocina.`
          : order.type === 'retiro'
            ? 'Mostrá este ticket en mostrador cuando esté listo.'
            : 'Te avisamos cuando salga para tu dirección.'}
      </p>
      <div className="success-ticket">
        <span>Tu ticket</span>
        <strong>{order.code}</strong>
        <small>{order.customerName}</small>
      </div>
      <div className="success-meta">
        <div>
          <span>Total</span>
          <b>{money(totals.total)}</b>
        </div>
        <div>
          <span>Pago</span>
          <b>{PAYMENT_META[order.payment?.method]?.label}</b>
        </div>
      </div>
      <div className="success-actions">
        <button type="button" className="btn btn-ink" onClick={() => onTrack(order)}>
          Seguir mi pedido <Icon name="arrowRight" size={15} />
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => onReceipt(order)}>
          <Icon name="receipt" size={15} /> Comprobante
        </button>
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Reclamos
   ───────────────────────────────────────────────────────────── */
function ClaimModal({ order, open, onClose }) {
  const { actions } = useStore();
  const toast = useToast();
  const [reason, setReason] = useState(CLAIM_REASONS[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setReason(CLAIM_REASONS[0]);
    setMessage('');
    setError('');
  }, [open, order?.id]);

  if (!order) return null;

  return (
    <Modal open={open} onClose={onClose} size="md" className="claim-modal">
      <span className="eyebrow">Atención al cliente</span>
      <h2>Contanos qué pasó.</h2>
      <p className="claim-lead">
        Tu reclamo va directo a administración y queda asociado al pedido <b>{order.code}</b>. El equipo
        puede responder, corregir o cancelar el pedido.
      </p>
      <div className="claim-order">
        <span>{order.code}</span>
        <div>
          {order.items.map((item) => `${item.qty}× ${item.name}`).join(' · ')}
        </div>
        <StatusPill status={order.status} />
      </div>
      <div className="claim-reasons">
        {CLAIM_REASONS.map((item) => (
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
      <Field label="Contanos un poco más" hint="obligatorio">
        <textarea
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ejemplo: pedí sin cebolla y llegó con cebolla. ¿Pueden revisarlo?"
        />
      </Field>
      {error && (
        <p className="form-error">
          <Icon name="alert" size={15} /> {error}
        </p>
      )}
      <div className="claim-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-ink"
          onClick={() => {
            if (message.trim().length < 6) {
              setError('Contanos brevemente qué pasó para poder ayudarte.');
              return;
            }
            const claim = actions.addClaim({ orderId: order.id, reason, message: message.trim() });
            if (claim) {
              toast('Reclamo enviado a administración', { tone: 'success', icon: 'bell' });
              onClose();
            }
          }}
        >
          Enviar reclamo <Icon name="arrowRight" size={15} />
        </button>
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Seguimiento de pedido
   ───────────────────────────────────────────────────────────── */
function TrackModal({
  order,
  settings,
  open,
  onClose,
  onClaim,
  onReceipt,
  onEdit,
  onCancel,
  onBill,
}) {
  const now = useTick(open);
  if (!order) return null;
  const totals = orderTotals(order, settings);
  const step = STATUS[order.status]?.step ?? 0;
  const autoTarget = order.created + settings.autoPrepMinutes * 60000;
  const cancellable = order.status === 'recibido';

  return (
    <Modal open={open} onClose={onClose} size="md" className="track-modal">
      <div className="track-head">
        <div>
          <span className="eyebrow">Seguimiento en vivo</span>
          <h2>{order.code}</h2>
          <small>
            {TYPE_META[order.type]?.label}
            {order.table ? ` · Mesa ${String(order.table).padStart(2, '0')}` : ''} · {fmtTime(order.created)}
          </small>
        </div>
        <StatusPill status={order.status} />
      </div>

      {order.status === 'listo' && order.type !== 'mesa' && (
        <div className="track-ready-banner">
          <Icon name="bell" size={20} />
          <div>
            <b>¡Tu pedido está listo!</b>
            <p>Mostrá el ticket {order.code} en mostrador y retiralo.</p>
          </div>
        </div>
      )}

      {order.status === 'recibido' && settings.autoAdvance && (
        <div className="track-countdown">
          <span className="track-countdown-icon">
            <Icon name="timer" size={18} />
          </span>
          <div>
            <b>Pasa a cocina en {countdown(autoTarget, now)}</b>
            <p>Hasta entonces podés modificarlo o cancelarlo sin costo.</p>
          </div>
        </div>
      )}

      {order.status === 'preparando' && (
        <div className="track-countdown is-cooking">
          <span className="track-countdown-icon">
            <Icon name="chef" size={18} />
          </span>
          <div>
            <b>Estamos preparando tu pedido</b>
            <p>Ya no se puede modificar. Te avisamos cuando esté listo.</p>
          </div>
        </div>
      )}

      <div className="track-steps">
        {FLOW.map((status, index) => (
          <div
            key={status}
            className={cn(
              'track-step',
              index <= step && 'is-done',
              order.status === 'cancelado' && 'is-cancelled'
            )}
          >
            <span className="track-step-dot">
              {index < step ? <Icon name="check" size={12} /> : index + 1}
            </span>
            <span>
              <b>{STATUS[status].label}</b>
              <small>
                {status === 'recibido' && fmtTime(order.created)}
                {status === 'preparando' && (order.preparingAt ? fmtTime(order.preparingAt) : 'A la brevedad')}
                {status === 'listo' && (order.readyAt ? fmtTime(order.readyAt) : 'En breve')}
                {status === 'entregado' && (order.deliveredAt ? fmtTime(order.deliveredAt) : 'Pendiente')}
              </small>
            </span>
          </div>
        ))}
      </div>

      <div className="track-items">
        {order.items.map((item, index) => (
          <div key={`${item.name}-${index}`}>
            <span className="track-item-qty">{item.qty}×</span>
            <span>
              <b>{item.name}</b>
              {item.variantLabel && <small>{item.variantLabel}</small>}
            </span>
            <b>{money(item.unitPrice * item.qty)}</b>
          </div>
        ))}
      </div>

      <div className="track-totals">
        <div>
          <span>Total</span>
          <b>{money(totals.total)}</b>
        </div>
        <PayPill payment={order.payment} />
      </div>

      {order.note && (
        <div className="track-note">
          <Icon name="edit" size={14} /> <span>{order.note}</span>
        </div>
      )}

      <div className="track-actions">
        {cancellable && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(order)}>
            <Icon name="edit" size={14} /> Modificar
          </button>
        )}
        {order.payment?.status === 'pendiente' && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onBill(order)}>
            <Icon name="wallet" size={14} /> Pagar cuenta
          </button>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onReceipt(order)}>
          <Icon name="receipt" size={14} /> Comprobante
        </button>
        {ACTIVE_STATUSES.includes(order.status) && (
          <button type="button" className="btn btn-soft btn-sm" onClick={() => onClaim(order)}>
            <Icon name="alert" size={14} /> Reclamar
          </button>
        )}
        {cancellable && (
          <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => onCancel(order)}>
            <Icon name="x" size={14} /> Cancelar
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Edición del pedido antes de cocina
   ───────────────────────────────────────────────────────────── */
function EditOrderModal({ order, open, onClose, settings }) {
  const { actions } = useStore();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open || !order) return;
    setItems(order.items.map((item) => ({ ...item })));
    setNote(order.note || '');
  }, [open, order?.id]);

  if (!order) return null;
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const tax = Math.round(subtotal * settings.tax);
  const totals = orderTotals({ ...order, items }, settings);

  return (
    <Modal open={open} onClose={onClose} size="md" className="edit-modal">
      <span className="eyebrow">Antes de cocina</span>
      <h2>Modificá tu pedido.</h2>
      <p className="muted-copy">
        Podés ajustar cantidades durante los primeros {settings.autoPrepMinutes} minutos. Después, el
        equipo ya lo está preparando.
      </p>
      <div className="edit-items">
        {items.map((item, index) => (
          <div className="edit-item" key={`${item.name}-${index}`}>
            <span className="edit-item-art">
              <DishArt kind={item.art || 'burger'} accent={item.accent || '#d1502a'} />
            </span>
            <div>
              <b>{item.name}</b>
              <small>{item.variantLabel}</small>
              <span>{money(item.unitPrice)} c/u</span>
            </div>
            <Qty
              value={item.qty}
              min={0}
              max={20}
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
            <b>{money(item.unitPrice * item.qty)}</b>
          </div>
        ))}
        {!items.length && <Empty icon="bag" title="No queda nada en el pedido" text="Sumá algo desde la carta para continuar." />}
      </div>
      <Field label="Nota del pedido">
        <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={120} />
      </Field>
      <div className="edit-totals">
        <div>
          <span>Subtotal</span>
          <b>{money(subtotal)}</b>
        </div>
        <div>
          <span>IVA</span>
          <b>{money(tax)}</b>
        </div>
        <div>
          <span>Total</span>
          <b>{money(totals.total)}</b>
        </div>
      </div>
      <div className="confirm-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Volver
        </button>
        <button
          type="button"
          className="btn btn-ink"
          disabled={!items.length}
          onClick={() => {
            actions.updateOrder(order.id, { items, note: note.trim() });
            toast('Pedido actualizado', { tone: 'success', icon: 'checkCircle' });
            onClose();
          }}
        >
          Guardar cambios
        </button>
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Pago de cuenta en mesa (con propina opcional)
   ───────────────────────────────────────────────────────────── */
function BillModal({ order, open, onClose, settings, onPaid }) {
  const { actions } = useStore();
  const toast = useToast();
  const [method, setMethod] = useState('tarjeta');
  const [tipMode, setTipMode] = useState('0');
  const [customTip, setCustomTip] = useState('');

  useEffect(() => {
    if (!open) return;
    setMethod(order?.payment?.method || 'tarjeta');
    setTipMode('0');
    setCustomTip('');
  }, [open, order?.id]);

  if (!order) return null;
  const base = orderTotals(order, settings);
  const currentTip = order.tip || 0;
  const tip =
    tipMode === 'custom'
      ? Math.max(0, Number(customTip) || 0)
      : tipMode === 'keep'
        ? currentTip
        : Math.round((base.subtotal * Number(tipMode)) / 100);
  const total = base.subtotal + base.tax + base.delivery + base.service - base.discount + tip;

  return (
    <Modal open={open} onClose={onClose} size="md" className="bill-modal">
      <span className="eyebrow">Cerrar la cuenta</span>
      <h2>Todo listo para pagar.</h2>
      <p className="muted-copy">
        Pedido {order.code} · {order.customerName}. La propina es opcional y va directo al equipo.
      </p>
      <div className="bill-summary">
        <div>
          <span>Subtotal</span>
          <b>{money(base.subtotal)}</b>
        </div>
        <div>
          <span>IVA</span>
          <b>{money(base.tax)}</b>
        </div>
        <div>
          <span>Propina</span>
          <b>{money(tip)}</b>
        </div>
        <div className="is-total">
          <span>Total a pagar</span>
          <b>{money(total)}</b>
        </div>
      </div>
      <div className="tip-options">
        {currentTip > 0 && (
          <button type="button" className={cn('tip-chip', tipMode === 'keep' && 'is-active')} onClick={() => setTipMode('keep')}>
            Mantener {money(currentTip)}
          </button>
        )}
        {['0', '5', '10', '15'].map((value) => (
          <button
            type="button"
            key={value}
            className={cn('tip-chip', tipMode === value && 'is-active')}
            onClick={() => setTipMode(value)}
          >
            {value === '0' ? 'Sin propina' : `${value}%`}
          </button>
        ))}
        <button type="button" className={cn('tip-chip', tipMode === 'custom' && 'is-active')} onClick={() => setTipMode('custom')}>
          Otra
        </button>
      </div>
      {tipMode === 'custom' && (
        <div className="custom-tip">
          <span>$</span>
          <input
            type="number"
            min="0"
            value={customTip}
            onChange={(event) => setCustomTip(event.target.value)}
            placeholder="Monto de propina"
          />
        </div>
      )}
      <div className="payment-grid is-compact">
        {Object.entries(PAYMENT_META).map(([id, meta]) => (
          <button
            type="button"
            key={id}
            className={cn('payment-card', method === id && 'is-active')}
            onClick={() => setMethod(id)}
          >
            <span className="payment-icon">
              <Icon name={meta.icon} size={17} />
            </span>
            <span>
              <b>{meta.label}</b>
            </span>
            <span className="variant-radio">{method === id && <i />}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-ink btn-block"
        onClick={() => {
          actions.updateOrder(order.id, { tip });
          actions.markPaid(order.id, method);
          toast('Cuenta pagada. ¡Gracias!', { tone: 'success', icon: 'checkCircle' });
          onPaid({ ...order, tip, payment: { method, status: 'pagado', paidAt: Date.now() } });
          onClose();
        }}
      >
        Pagar {money(total)} <Icon name="card" size={16} />
      </button>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Abrir mesa (cliente)
   ───────────────────────────────────────────────────────────── */
function TableModal({ open, onClose, user, onStartOrder, onTrack, onClaim, onBill }) {
  const { state } = useStore();
  const now = useTick(open);
  const myActive = state.orders.filter(
    (order) => order.userId === user.id && order.type === 'mesa' && ACTIVE_STATUSES.includes(order.status)
  );
  const [table, setTable] = useState(myActive[0]?.table ? String(myActive[0].table).padStart(2, '0') : '04');

  useEffect(() => {
    if (!open) return;
    const own = state.orders.find(
      (order) => order.userId === user.id && order.type === 'mesa' && ACTIVE_STATUSES.includes(order.status)
    );
    setTable(own?.table ? String(own.table).padStart(2, '0') : '04');
  }, [open, user.id]);

  const tables = Array.from({ length: state.settings.tableCount }, (_, index) => index + 1);
  const activeAll = state.orders.filter((order) => ACTIVE_STATUSES.includes(order.status));
  const tableNumber = Number(table);
  const tableOrders = myActive.filter((order) => order.table === tableNumber);
  const occupied = activeAll.filter((order) => order.table === tableNumber);

  return (
    <Modal open={open} onClose={onClose} size="lg" className="table-modal">
      <span className="eyebrow">Salón Miga</span>
      <h2>Abrí tu mesa.</h2>
      <p className="muted-copy">
        Elegí dónde estás sentado. Si ya pediste, vas a ver tu pedido, el estado y las opciones de reclamo.
      </p>

      <div className="salon-mini">
        <div className="salon-mini-grid">
          {tables.map((number) => {
            const value = String(number).padStart(2, '0');
            const isMine = myActive.some((order) => order.table === number);
            const isBusy = activeAll.some((order) => order.table === number);
            return (
              <button
                type="button"
                key={number}
                className={cn(
                  'salon-mini-table',
                  value === table && 'is-selected',
                  isMine && 'is-mine',
                  isBusy && !isMine && 'is-busy'
                )}
                onClick={() => setTable(value)}
              >
                <b>{value}</b>
                <small>{isMine ? 'Tu pedido' : isBusy ? 'Ocupada' : 'Libre'}</small>
              </button>
            );
          })}
        </div>
        <div className="salon-mini-legend">
          <span>
            <i className="dot dot-free" /> Libre
          </span>
          <span>
            <i className="dot dot-mine" /> Tu pedido
          </span>
          <span>
            <i className="dot dot-busy" /> Ocupada
          </span>
        </div>
      </div>

      <div className="table-detail">
        <div className="table-detail-head">
          <div>
            <span className="eyebrow">Mesa {table}</span>
            <h3>{tableOrders.length ? 'Tu pedido en esta mesa' : 'Todavía no pediste acá'}</h3>
          </div>
          <span className={`table-state ${tableOrders.length ? 'is-open' : occupied.length ? 'is-busy' : ''}`}>
            {tableOrders.length ? 'Abierta para vos' : occupied.length ? 'Ocupada' : 'Libre'}
          </span>
        </div>

        {tableOrders.length ? (
          <div className="table-orders">
            {tableOrders.map((order) => {
              const totals = orderTotals(order, state.settings);
              const eta = order.status === 'recibido' ? order.created + state.settings.autoPrepMinutes * 60000 : null;
              return (
                <div className="table-order-card" key={order.id}>
                  <div className="table-order-top">
                    <span className="table-order-code">{order.code}</span>
                    <StatusPill status={order.status} />
                    <span className="table-order-total">{money(totals.total)}</span>
                  </div>
                  <div className="table-order-items">
                    {order.items.map((item, index) => (
                      <span key={`${item.name}-${index}`}>
                        {item.qty}× {item.name}
                        {item.variantLabel ? ` · ${item.variantLabel}` : ''}
                      </span>
                    ))}
                  </div>
                  {order.status === 'recibido' && eta && (
                    <div className="table-order-eta">
                      <Icon name="timer" size={14} /> Pasa a cocina en {countdown(eta, now)}
                    </div>
                  )}
                  <div className="table-order-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onTrack(order)}>
                      <Icon name="clock" size={14} /> Seguir
                    </button>
                    {order.payment?.status === 'pendiente' && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onBill(order)}>
                        <Icon name="wallet" size={14} /> Pagar
                      </button>
                    )}
                    <button type="button" className="btn btn-soft btn-sm" onClick={() => onClaim(order)}>
                      <Icon name="alert" size={14} /> Reclamar
                    </button>
                  </div>
                </div>
              );
            })}
            <button type="button" className="btn btn-outline btn-block" onClick={() => onStartOrder(tableNumber)}>
              <Icon name="plus" size={15} /> Sumar más a la mesa
            </button>
          </div>
        ) : (
          <div className="table-empty">
            <DishArt kind="burger" accent="#d1502a" />
            <div>
              <p>Elegí tus platos y abrimos la mesa {table} con tu nombre.</p>
              <button type="button" className="btn btn-ink" onClick={() => onStartOrder(tableNumber)}>
                Pedir para la mesa {table} <Icon name="arrowRight" size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Órdenes del cliente
   ───────────────────────────────────────────────────────────── */
function OrderCard({
  order,
  settings,
  onTrack,
  onReceipt,
  onClaim,
  onEdit,
  onCancel,
  onBill,
  onReorder,
}) {
  const now = useTick(order.status === 'recibido');
  const totals = orderTotals(order, settings);
  const cancellable = order.status === 'recibido';
  const eta = order.created + settings.autoPrepMinutes * 60000;
  const isReady = order.status === 'listo';

  return (
    <article className={cn('order-card', isReady && 'is-ready', order.status === 'cancelado' && 'is-cancelled')}>
      <header className="order-card-head">
        <div className="order-card-id">
          <span className="order-card-code">{order.code}</span>
          <div>
            <b>
              {TYPE_META[order.type]?.label}
              {order.table ? ` · Mesa ${String(order.table).padStart(2, '0')}` : ''}
            </b>
            <small>
              {fmtDateTime(order.created)} · {timeAgo(order.created)}
            </small>
          </div>
        </div>
        <StatusPill status={order.status} />
      </header>

      {isReady && order.type !== 'mesa' && (
        <div className="order-ready-strip">
          <Icon name="bell" size={16} /> ¡Listo! Mostrá el ticket <b>{order.code}</b> en mostrador.
        </div>
      )}

      <div className="order-card-items">
        {order.items.slice(0, 3).map((item, index) => (
          <div key={`${item.name}-${index}`}>
            <span>{item.qty}×</span>
            <b>{item.name}</b>
            {item.variantLabel && <small>{item.variantLabel}</small>}
            <em>{money(item.unitPrice * item.qty)}</em>
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="order-more">+{order.items.length - 3} productos más</div>
        )}
      </div>

      {ACTIVE_STATUSES.includes(order.status) && (
        <div className="order-progress">
          {FLOW.slice(0, 4).map((status, index) => (
            <div key={status} className={index <= (STATUS[order.status]?.step ?? 0) ? 'is-done' : ''}>
              <i />
              <span>{STATUS[status].short}</span>
            </div>
          ))}
        </div>
      )}

      <div className="order-card-foot">
        <div className="order-card-total">
          <span>Total</span>
          <b>{money(totals.total)}</b>
          <PayPill payment={order.payment} />
        </div>
        <div className="order-card-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onTrack(order)}>
            <Icon name="eye" size={14} /> Seguir
          </button>
          {cancellable && (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(order)}>
                <Icon name="edit" size={14} /> Modificar
              </button>
              <span className="order-countdown">
                <Icon name="timer" size={13} /> {countdown(eta, now)}
              </span>
            </>
          )}
          {order.payment?.status === 'pendiente' && order.status !== 'cancelado' && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onBill(order)}>
              <Icon name="wallet" size={14} /> Pagar
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onReceipt(order)}>
            <Icon name="receipt" size={14} /> Ticket
          </button>
          {ACTIVE_STATUSES.includes(order.status) && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onClaim(order)}>
              <Icon name="alert" size={14} /> Reclamo
            </button>
          )}
          {cancellable && (
            <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => onCancel(order)}>
              <Icon name="x" size={14} /> Cancelar
            </button>
          )}
          {!ACTIVE_STATUSES.includes(order.status) && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onReorder(order)}>
              <Icon name="rotate" size={14} /> Repetir
            </button>
          )}
        </div>
      </div>
      {order.status === 'cancelado' && order.cancelReason && (
        <div className="order-cancel-note">
          <Icon name="info" size={14} /> {order.cancelReason}
        </div>
      )}
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
   Pantalla principal del cliente
   ───────────────────────────────────────────────────────────── */
export default function ClientApp({ user, onLogout }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const settings = state.settings;

  const cartKey = `miga.cart.${user.id}`;
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(cartKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch {
      /* storage bloqueado */
    }
  }, [cart, cartKey]);

  const [tab, setTab] = useState('menu');
  const [category, setCategory] = useState('todo');
  const [query, setQuery] = useState('');
  const [sheetId, setSheetId] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [preferredTable, setPreferredTable] = useState('04');
  const [tableOpen, setTableOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [offerFocus, setOfferFocus] = useState(0);
  const [accountOpen, setAccountOpen] = useState(false);
  const [trackId, setTrackId] = useState(null);
  const [claimId, setClaimId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [billId, setBillId] = useState(null);
  const [receiptId, setReceiptId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const [ordersView, setOrdersView] = useState('active');

  const lines = Object.values(cart).filter((line) => line.qty > 0);
  const cartCount = lines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  const orders = state.orders.filter((order) => order.userId === user.id);
  const activeOrders = orders.filter((order) => ACTIVE_STATUSES.includes(order.status));
  const historyOrders = orders.filter((order) => !ACTIVE_STATUSES.includes(order.status));
  const offers = state.offers.filter((offer) => offer.active);
  const announcements = state.announcements.filter((item) => item.active);
  const products = state.products;
  const sheetProduct = products.find((product) => product.id === sheetId) || null;
  const trackOrder = state.orders.find((order) => order.id === trackId) || null;
  const claimOrder = state.orders.find((order) => order.id === claimId) || null;
  const editOrder = state.orders.find((order) => order.id === editId) || null;
  const billOrder = state.orders.find((order) => order.id === billId) || null;
  const receiptOrder = state.orders.find((order) => order.id === receiptId) || null;
  const successOrder = state.orders.find((order) => order.id === successId) || null;
  const cancelOrder = state.orders.find((order) => order.id === cancelId) || null;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const inCategory = category === 'todo' || product.category === category;
      const matches =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.desc.toLowerCase().includes(term);
      return inCategory && matches;
    });
  }, [products, category, query]);

  useEffect(() => {
    if (!offers.length) return undefined;
    const timer = setInterval(() => {
      setOfferFocus((value) => (value + 1) % offers.length);
    }, 5400);
    return () => clearInterval(timer);
  }, [offers.length]);

  useEffect(() => {
    if (!settings.promoPopup || !offers.length) return undefined;
    if (sessionStorage.getItem('miga.promo.seen')) return undefined;
    const timer = setTimeout(() => {
      setPromoOpen(true);
      sessionStorage.setItem('miga.promo.seen', '1');
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  const scrollTo = (id) => {
    setTab('menu');
    setAccountOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const addLine = (line) => {
    setCart((current) => {
      const existing = current[line.key];
      return {
        ...current,
        [line.key]: {
          ...line,
          ...(existing ? { note: line.note || existing.note, qty: existing.qty + line.qty } : {}),
        },
      };
    });
  };

  const addProduct = (product, variant, qty, note) => {
    addLine(lineFromProduct(product, variant, qty, note));
    toast(`${product.name} · ${variant.label} agregado`, { icon: 'bag' });
  };

  const quickAdd = (product) => {
    if (!product.available) return;
    addProduct(product, product.variants[0], 1, '');
  };

  const addOffer = (offer) => {
    addLine(lineFromOffer(offer));
    toast(`${offer.name} sumado al pedido`, { tone: 'success', icon: 'tag' });
    setPromoOpen(false);
  };

  const changeQty = (key, value) =>
    setCart((current) => {
      if (value <= 0) {
        const next = { ...current };
        delete next[key];
        return next;
      }
      return { ...current, [key]: { ...current[key], qty: value } };
    });

  const removeLine = (key) =>
    setCart((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });

  const reorder = (order) => {
    setCart((current) => {
      const next = { ...current };
      order.items.forEach((item, index) => {
        const key = `p:${item.productId || item.name}:${item.variantLabel || index}`;
        next[key] = {
          key,
          kind: 'product',
          productId: item.productId,
          name: item.name,
          variantLabel: item.variantLabel,
          unitPrice: item.unitPrice,
          qty: (next[key]?.qty || 0) + item.qty,
          art: item.art,
          accent: item.accent,
          note: '',
        };
      });
      return next;
    });
    toast('Pedido repetido en tu bolsa', { tone: 'success', icon: 'rotate' });
    scrollTo('cart-panel');
  };

  const openCheckout = () => {
    if (!lines.length) {
      scrollTo('carta');
      return;
    }
    setCheckoutOpen(true);
  };

  const startTableOrder = (tableNumber) => {
    setPreferredTable(String(tableNumber).padStart(2, '0'));
    setTableOpen(false);
    setTab('menu');
    if (lines.length) {
      setCheckoutOpen(true);
    } else {
      toast(`Mesa ${String(tableNumber).padStart(2, '0')} seleccionada. Elegí tus platos.`, {
        icon: 'table',
      });
      setTimeout(() => {
        document.getElementById('carta')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  const requestBill = (order) => {
    setTrackId(null);
    setBillId(order.id);
  };

  const firstName = user.name.split(' ')[0];
  const activeOffer = offers[offerFocus % Math.max(1, offers.length)] || offers[0];

  return (
    <div className="client-app">
      <header className="site-head">
        <div className="site-head-inner">
          <button type="button" className="brand-lockup" onClick={() => setTab('menu')}>
            <span className="brand-mark">m</span>
            <span className="brand-text">
              <b>miga</b>
              <small>bueno, rápido y con amor</small>
            </span>
          </button>

          <nav className="site-nav">
            <button
              type="button"
              className={tab === 'menu' ? 'is-active' : ''}
              onClick={() => {
                setTab('menu');
                setAccountOpen(false);
              }}
            >
              La carta
            </button>
            <button
              type="button"
              className={tab === 'orders' ? 'is-active' : ''}
              onClick={() => {
                setTab('orders');
                setAccountOpen(false);
              }}
            >
              Mis pedidos
              {activeOrders.length > 0 && <span className="nav-badge">{activeOrders.length}</span>}
            </button>
            <button
              type="button"
              className={tab === 'turnos' ? 'is-active' : ''}
              onClick={() => {
                setTab('turnos');
                setAccountOpen(false);
              }}
            >
              Retiros
              <span className="nav-live" />
            </button>
          </nav>

          <div className="site-actions">
            <span className="open-pill">
              <i /> Abierto
            </span>
            <button type="button" className="cart-button" onClick={() => scrollTo('cart-panel')} aria-label="Ver pedido">
              <Icon name="bag" size={18} />
              <span>{cartCount}</span>
            </button>
            <div className="account-wrap">
              <button type="button" className="account-button" onClick={() => setAccountOpen((value) => !value)}>
                <span className="account-avatar">{firstName.charAt(0)}</span>
                <span className="account-name">{firstName}</span>
                <Icon name="chevronDown" size={14} />
              </button>
              {accountOpen && (
                <div className="account-menu">
                  <div className="account-menu-head">
                    <b>{user.name}</b>
                    <small>{user.email}</small>
                    <span>Cliente Miga</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('orders');
                      setAccountOpen(false);
                    }}
                  >
                    <Icon name="receipt" size={15} /> Mis pedidos y tickets
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('turnos');
                      setAccountOpen(false);
                    }}
                  >
                    <Icon name="ticket" size={15} /> Pantalla de retiros
                  </button>
                  <button type="button" onClick={() => { setAccountOpen(false); setTableOpen(true); }}>
                    <Icon name="table" size={15} /> Abrir mesa
                  </button>
                  <button type="button" className="is-danger" onClick={onLogout}>
                    <Icon name="logout" size={15} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {tab === 'menu' && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">Cocina de barrio · desde 1998</span>
              <h1>
                Comida con
                <br />
                <em>carácter.</em>
              </h1>
              <p>
                Ingredientes frescos, fuego real y ese gusto a barrio que no se inventa. Elegí tu
                hamburguesa, armá tu combo y seguí el pedido en vivo.
              </p>
              <div className="hero-actions">
                <button type="button" className="btn btn-ink" onClick={() => scrollTo('carta')}>
                  Armar mi pedido <Icon name="arrowRight" size={16} />
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setTableOpen(true)}>
                  <Icon name="table" size={16} /> Abrir mesa
                </button>
              </div>
              <div className="hero-points">
                <span>
                  <Icon name="clock" size={14} /> 2 min y a cocina
                </span>
                <span>
                  <Icon name="ticket" size={14} /> Retiro con turno
                </span>
                <span>
                  <Icon name="bike" size={14} /> Envío a domicilio
                </span>
              </div>
            </div>

            <div className="hero-art">
              <div className="hero-ring" />
              <div className="hero-plate">
                <DishArt kind="doubleBurger" accent="#d1502a" />
              </div>
              {activeOffer && (
                <div className="hero-float hero-float-offer">
                  <span className="hero-float-label">Hoy · {activeOffer.badge}</span>
                  <b>{activeOffer.name}</b>
                  <div>
                    <strong>{money(activeOffer.price)}</strong>
                    <del>{money(activeOffer.oldPrice)}</del>
                  </div>
                  <button type="button" onClick={() => addOffer(activeOffer)}>
                    Sumar <Icon name="plus" size={13} />
                  </button>
                </div>
              )}
              <div className="hero-float hero-float-ticket">
                <span className="hero-ticket-code">{activeOrders[0]?.code || 'A-105'}</span>
                <span>
                  <b>{activeOrders[0] ? STATUS[activeOrders[0].status]?.label : 'Listo para retirar'}</b>
                  <small>{activeOrders[0]?.customerName || 'Mateo Ferrer'}</small>
                </span>
              </div>
              <span className="hero-stamp">
                HECHO
                <br />
                CON AMOR
              </span>
            </div>
          </section>

          <div className="ticker-strip">
            <div className="ticker-track">
              {Array.from({ length: 2 }).map((_, group) => (
                <React.Fragment key={group}>
                  <span>Hamburguesas de verdad</span>
                  <i>✳</i>
                  <span>Papas cortadas a mano</span>
                  <i>✳</i>
                  <span>Retirá con tu turno</span>
                  <i>✳</i>
                  <span>Propina opcional</span>
                  <i>✳</i>
                  <span>Pago con QR, tarjeta o efectivo</span>
                  <i>✳</i>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="client-grid">
            <main className="client-main">
              {announcements.length > 0 && (
                <section className="announce-section">
                  <div className="announce-grid">
                    {announcements.slice(0, 3).map((item) => (
                      <article className={`announce-card announce-${item.kind}`} key={item.id}>
                        <div className="announce-art">
                          <DishArt kind={item.art} accent={item.accent} />
                        </div>
                        <div className="announce-body">
                          <span className="announce-kind">
                            {item.kind === 'nuevo' ? 'Nuevo en carta' : item.kind === 'promo' ? 'Promo' : 'Aviso'}
                          </span>
                          <h3>{item.title}</h3>
                          <p>{item.body}</p>
                          <button type="button" onClick={() => scrollTo('carta')}>
                            {item.cta || 'Ver más'} <Icon name="arrowRight" size={13} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              <section className="offers-section">
                <div className="section-head">
                  <div>
                    <span className="eyebrow">Promos de hoy</span>
                    <h2>
                      Ofertas con <em>onda.</em>
                    </h2>
                  </div>
                  <span className="section-note">
                    <Icon name="spark" size={14} /> Se renuevan todos los días
                  </span>
                </div>
                <div className="offer-rail">
                  {offers.map((offer, index) => {
                    const discount = Math.round((1 - offer.price / offer.oldPrice) * 100);
                    return (
                      <article
                        className={cn('offer-card', index === offerFocus % offers.length && 'is-focus')}
                        key={offer.id}
                        style={{ '--offer-accent': offer.accent }}
                      >
                        <div className="offer-visual">
                          <DishArt kind={offer.art} accent={offer.accent} />
                          <span className="offer-discount">−{discount}%</span>
                          <span className="offer-badge">{offer.badge}</span>
                        </div>
                        <div className="offer-body">
                          <h3>{offer.name}</h3>
                          <p>{offer.tagline}</p>
                          <ul>
                            {offer.includes.map((item) => (
                              <li key={item}>
                                <Icon name="check" size={12} /> {item}
                              </li>
                            ))}
                          </ul>
                          <div className="offer-foot">
                            <div className="offer-price">
                              <b>{money(offer.price)}</b>
                              <del>{money(offer.oldPrice)}</del>
                            </div>
                            <button type="button" className="offer-add" onClick={() => addOffer(offer)}>
                              <Icon name="plus" size={15} /> Sumar
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="menu-section" id="carta">
                <div className="section-head menu-head">
                  <div>
                    <span className="eyebrow">La carta completa</span>
                    <h2>
                      Elegí tu <em>antojo.</em>
                    </h2>
                  </div>
                  <div className="search-box">
                    <Icon name="search" size={16} />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Buscar hamburguesa, papas..."
                      aria-label="Buscar en la carta"
                    />
                    {query && (
                      <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
                        <Icon name="x" size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="category-bar">
                  <button
                    type="button"
                    className={category === 'todo' ? 'is-active' : ''}
                    onClick={() => setCategory('todo')}
                  >
                    <Icon name="grid" size={14} /> Todo
                  </button>
                  {CATEGORIES.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={category === item.id ? 'is-active' : ''}
                      onClick={() => setCategory(item.id)}
                    >
                      <Icon name={item.icon} size={14} /> {item.label}
                    </button>
                  ))}
                  <span className="category-count">{filtered.length} platos</span>
                </div>

                {filtered.length ? (
                  <div className="product-grid">
                    {filtered.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onOpen={(item) => setSheetId(item.id)}
                        onQuickAdd={quickAdd}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty
                    icon="search"
                    title="No encontramos ese antojo."
                    text="Probá con otra palabra o mirá todas las categorías."
                  >
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setQuery('');
                        setCategory('todo');
                      }}
                    >
                      Ver todo el menú
                    </button>
                  </Empty>
                )}
              </section>
            </main>

            <aside className="cart-panel" id="cart-panel">
              <div className="cart-head">
                <div>
                  <span className="eyebrow">Tu pedido</span>
                  <h2>
                    La bolsa <em>rica.</em>
                  </h2>
                </div>
                <span className="cart-count">{cartCount}</span>
              </div>

              {lines.length ? (
                <>
                  <div className="cart-lines">
                    {lines.map((line) => (
                      <div className="cart-line" key={line.key}>
                        <span className="cart-line-art">
                          <DishArt kind={line.art || 'burger'} accent={line.accent || '#d1502a'} />
                        </span>
                        <div className="cart-line-info">
                          <b>{line.name}</b>
                          <small>{line.variantLabel}</small>
                          {line.note && <em>{line.note}</em>}
                          <span>{money(line.unitPrice)} c/u</span>
                        </div>
                        <div className="cart-line-controls">
                          <Qty
                            value={line.qty}
                            min={0}
                            max={30}
                            size="sm"
                            onChange={(value) => changeQty(line.key, value)}
                          />
                          <b>{money(line.unitPrice * line.qty)}</b>
                          <button type="button" className="cart-remove" onClick={() => removeLine(line.key)} aria-label={`Quitar ${line.name}`}>
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-summary">
                    <div>
                      <span>Subtotal</span>
                      <b>{money(subtotal)}</b>
                    </div>
                    <div>
                      <span>IVA · {Math.round(settings.tax * 100)}%</span>
                      <b>{money(Math.round(subtotal * settings.tax))}</b>
                    </div>
                    <div className="cart-total">
                      <span>Total</span>
                      <b>{money(subtotal + Math.round(subtotal * settings.tax))}</b>
                    </div>
                  </div>
                  <div className="cart-tip">
                    <Icon name="heart" size={14} /> La propina es opcional y se elige al pagar.
                  </div>
                  <button type="button" className="btn btn-ink btn-block cart-checkout" onClick={openCheckout}>
                    Ir al pago <Icon name="arrowRight" size={16} />
                  </button>
                  <button
                    type="button"
                    className="cart-clear"
                    onClick={() => {
                      setCart({});
                      toast('Bolsa vacía', { icon: 'bag' });
                    }}
                  >
                    Vaciar la bolsa
                  </button>
                </>
              ) : (
                <Empty
                  icon="bag"
                  className="cart-empty"
                  title="Tu bolsa está esperando."
                  text="Sumá algo de la carta y armamos el pedido juntos."
                >
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => scrollTo('carta')}>
                    Ver la carta <Icon name="arrowRight" size={14} />
                  </button>
                </Empty>
              )}

              <div className="cart-extra">
                <button type="button" onClick={() => setTableOpen(true)}>
                  <span>
                    <Icon name="table" size={16} /> Abrir mesa
                  </span>
                  <Icon name="chevronRight" size={14} />
                </button>
                <button type="button" onClick={() => setTab('turnos')}>
                  <span>
                    <Icon name="ticket" size={16} /> Pantalla de retiros
                  </span>
                  <Icon name="chevronRight" size={14} />
                </button>
              </div>
            </aside>
          </div>
        </>
      )}

      {tab === 'orders' && (
        <main className="orders-page">
          <header className="orders-page-head">
            <div>
              <span className="eyebrow">Tu historial</span>
              <h1>
                Hola, {firstName}. <em>Tus pedidos.</em>
              </h1>
              <p>Sólo vos podés ver esta lista. Tickets, estados y reclamos, todo acá.</p>
            </div>
            <div className="orders-page-actions">
              <button type="button" className="btn btn-outline" onClick={() => setTableOpen(true)}>
                <Icon name="table" size={15} /> Abrir mesa
              </button>
              <button type="button" className="btn btn-ink" onClick={() => scrollTo('carta')}>
                Pedir algo <Icon name="arrowRight" size={15} />
              </button>
            </div>
          </header>

          <div className="orders-stats">
            <div>
              <span>Pedidos activos</span>
              <b>{String(activeOrders.length).padStart(2, '0')}</b>
            </div>
            <div>
              <span>En cocina</span>
              <b>{String(activeOrders.filter((order) => order.status === 'preparando').length).padStart(2, '0')}</b>
            </div>
            <div>
              <span>Listos</span>
              <b>{String(activeOrders.filter((order) => order.status === 'listo').length).padStart(2, '0')}</b>
            </div>
            <div>
              <span>Total histórico</span>
              <b>{money(orders.filter((order) => order.status !== 'cancelado').reduce((sum, order) => sum + orderTotals(order, settings).total, 0))}</b>
            </div>
          </div>

          <div className="orders-tabs">
            <Segmented
              value={ordersView}
              onChange={setOrdersView}
              options={[
                { id: 'active', label: 'En curso', icon: 'clock' },
                { id: 'history', label: 'Historial', icon: 'receipt' },
              ]}
            />
          </div>

          <div className="orders-list">
            {ordersView === 'active' ? (
              activeOrders.length ? (
                activeOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    settings={settings}
                    onTrack={(item) => setTrackId(item.id)}
                    onReceipt={(item) => setReceiptId(item.id)}
                    onClaim={(item) => setClaimId(item.id)}
                    onEdit={(item) => setEditId(item.id)}
                    onCancel={(item) => setCancelId(item.id)}
                    onBill={requestBill}
                    onReorder={reorder}
                  />
                ))
              ) : (
                <Empty
                  icon="clock"
                  title="No tenés pedidos en curso."
                  text="Cuando pidas algo, acá vas a poder seguirlo en vivo."
                >
                  <button type="button" className="btn btn-ink btn-sm" onClick={() => scrollTo('carta')}>
                    Armar un pedido
                  </button>
                </Empty>
              )
            ) : historyOrders.length ? (
              historyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  settings={settings}
                  onTrack={(item) => setTrackId(item.id)}
                  onReceipt={(item) => setReceiptId(item.id)}
                  onClaim={(item) => setClaimId(item.id)}
                  onEdit={(item) => setEditId(item.id)}
                  onCancel={(item) => setCancelId(item.id)}
                  onBill={requestBill}
                  onReorder={reorder}
                />
              ))
            ) : (
              <Empty
                icon="receipt"
                title="Tu historial está vacío."
                text="Los pedidos entregados o cancelados quedan guardados acá con su ticket."
              />
            )}
          </div>
        </main>
      )}

      {tab === 'turnos' && (
        <main className="turnos-page">
          <TurnBoard role="client" user={user} onBack={() => setTab('menu')} />
        </main>
      )}

      <footer className="site-foot">
        <div className="brand-lockup brand-lockup-light">
          <span className="brand-mark">m</span>
          <div>
            <b>miga</b>
            <small>bueno, rápido y con amor</small>
          </div>
        </div>
        <p>Una mordida y cambia el día.</p>
        <div className="foot-links">
          <span>{settings.address}</span>
          <span>{settings.hours}</span>
          <button type="button" onClick={() => setTab('turnos')}>
            Pantalla de retiros <Icon name="arrowUpRight" size={13} />
          </button>
        </div>
      </footer>

      {lines.length > 0 && tab === 'menu' && (
        <div className="mobile-cart">
          <button type="button" onClick={openCheckout}>
            <span className="mobile-cart-count">{cartCount}</span>
            <span>
              Ver mi pedido <small>{money(subtotal)}</small>
            </span>
            <Icon name="arrowRight" size={17} />
          </button>
        </div>
      )}

      <ProductSheet
        product={sheetProduct}
        open={Boolean(sheetProduct)}
        onClose={() => setSheetId(null)}
        onAdd={addProduct}
      />
      <PromoModal
        open={promoOpen}
        offers={offers}
        onClose={() => setPromoOpen(false)}
        onAdd={addOffer}
        onExplore={() => {
          setPromoOpen(false);
          scrollTo('carta');
        }}
      />
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        lines={lines}
        user={user}
        settings={settings}
        defaultTable={preferredTable}
        onPlaced={(order) => {
          setCart({});
          setCheckoutOpen(false);
          setSuccessId(order.id);
        }}
      />
      <SuccessModal
        order={successOrder}
        settings={settings}
        open={Boolean(successOrder)}
        onClose={() => setSuccessId(null)}
        onReceipt={(order) => {
          setSuccessId(null);
          setReceiptId(order.id);
        }}
        onTrack={(order) => {
          setSuccessId(null);
          setTrackId(order.id);
        }}
      />
      <TrackModal
        order={trackOrder}
        settings={settings}
        open={Boolean(trackOrder)}
        onClose={() => setTrackId(null)}
        onClaim={(order) => {
          setTrackId(null);
          setClaimId(order.id);
        }}
        onReceipt={(order) => {
          setTrackId(null);
          setReceiptId(order.id);
        }}
        onEdit={(order) => {
          setTrackId(null);
          setEditId(order.id);
        }}
        onCancel={(order) => {
          setTrackId(null);
          setCancelId(order.id);
        }}
        onBill={requestBill}
      />
      <ClaimModal order={claimOrder} open={Boolean(claimOrder)} onClose={() => setClaimId(null)} />
      <EditOrderModal
        order={editOrder}
        open={Boolean(editOrder)}
        onClose={() => setEditId(null)}
        settings={settings}
      />
      <BillModal
        order={billOrder}
        open={Boolean(billOrder)}
        onClose={() => setBillId(null)}
        settings={settings}
        onPaid={(paid) => setReceiptId(paid.id)}
      />
      <ReceiptModal order={receiptOrder} settings={settings} open={Boolean(receiptOrder)} onClose={() => setReceiptId(null)} />
      <TableModal
        open={tableOpen}
        onClose={() => setTableOpen(false)}
        user={user}
        onStartOrder={startTableOrder}
        onTrack={(order) => {
          setTableOpen(false);
          setTrackId(order.id);
        }}
        onClaim={(order) => {
          setTableOpen(false);
          setClaimId(order.id);
        }}
        onBill={requestBill}
      />
      <ConfirmDialog
        open={Boolean(cancelOrder)}
        onClose={() => setCancelId(null)}
        title="¿Cancelar este pedido?"
        text={`El pedido ${cancelOrder?.code || ''} se cancelará sin costo. Si ya estaba pagado, queda registrado como reembolsado.`}
        confirmLabel="Sí, cancelar"
        onConfirm={() => {
          if (cancelOrder) {
            actions.cancelOrder(cancelOrder.id, 'Cancelado por el cliente', 'client');
            toast('Pedido cancelado', { tone: 'success', icon: 'x' });
          }
        }}
      />
    </div>
  );
}
