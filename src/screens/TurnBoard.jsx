import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import Icon from '../icons';
import DishArt from '../DishArt';
import { useToast } from '../ui';
import { countdown, fmtTime, money, orderTotals, STATUS, TYPE_META } from '../utils';

const isPickup = (order) => order.type === 'retiro' || order.type === 'delivery';

function useClock() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export default function TurnBoard({ role = 'client', user, onBack }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const now = useClock();
  const [focusIndex, setFocusIndex] = useState(0);

  const { settings } = state;
  const cleanupWindow = settings.cleanupMinutes * 60000;

  const pickupOrders = useMemo(
    () =>
      state.orders
        .filter(isPickup)
        .filter((order) => {
          if (['recibido', 'preparando', 'listo'].includes(order.status)) return true;
          if (order.status === 'entregado') {
            return now - (order.deliveredAt || order.updatedAt || order.created) < cleanupWindow;
          }
          return false;
        }),
    [state.orders, now, cleanupWindow]
  );

  const ready = pickupOrders
    .filter((order) => order.status === 'listo')
    .sort((a, b) => (a.readyAt || a.created) - (b.readyAt || b.created));
  const cooking = pickupOrders
    .filter((order) => ['recibido', 'preparando'].includes(order.status))
    .sort((a, b) => a.created - b.created);
  const handed = pickupOrders
    .filter((order) => order.status === 'entregado')
    .sort((a, b) => (b.deliveredAt || 0) - (a.deliveredAt || 0))
    .slice(0, 4);

  const focusable = useMemo(() => [...ready, ...cooking], [ready, cooking]);
  const ownOrder = user ? focusable.find((order) => order.userId === user.id) : null;
  const focus = focusable.length ? focusable[focusIndex % focusable.length] : ownOrder;

  useEffect(() => {
    if (!focusable.length) return undefined;
    const timer = setInterval(() => {
      setFocusIndex((index) => (index + 1) % focusable.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [focusable.length]);

  const clock = new Date(now).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleHanded = (order) => {
    actions.setOrderStatus(order.id, 'entregado');
    toast(`${order.code} entregado a ${order.customerName}`, { tone: 'success', icon: 'checkCircle' });
  };

  const total = focus ? orderTotals(focus, settings) : null;
  const step = focus ? STATUS[focus.status]?.step ?? 0 : 0;

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    } catch {
      /* el navegador puede bloquearlo */
    }
  };

  return (
    <section className="turnboard">
      <header className="turnboard-head">
        <div className="turnboard-brand">
          <span className="brand-mark">m</span>
          <div>
            <b>miga</b>
            <span>Pantalla de retiros</span>
          </div>
        </div>
        <div className="turnboard-live">
          <span className="live-dot" />
          En vivo · {clock}
        </div>
        <div className="turnboard-actions">
          {role === 'admin' && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={toggleFullscreen}>
              <Icon name="eye" size={15} /> Pantalla completa
            </button>
          )}
          {onBack && (
            <button type="button" className="btn btn-cream btn-sm" onClick={onBack}>
              <Icon name="arrowLeft" size={15} /> Volver
            </button>
          )}
        </div>
      </header>

      <div className="turnboard-body">
        <div className="turn-stage">
          <span className="turn-stage-label">
            {focus ? (focus.status === 'listo' ? 'Ya está listo' : 'Ahora en cocina') : 'Todo al día'}
          </span>
          {focus ? (
            <div className="turn-stage-card" key={`${focus.id}-${focus.status}`}>
              <div className="turn-stage-top">
                <div className="turn-ticket">
                  <small>Ticket</small>
                  <strong>{focus.code}</strong>
                </div>
                <span className={`turn-state tone-${STATUS[focus.status]?.tone}`}>
                  {STATUS[focus.status]?.label}
                </span>
              </div>
              <h2 className="turn-name">{focus.customerName}</h2>
              <div className="turn-focus-meta">
                <span>
                  <Icon name={TYPE_META[focus.type]?.icon || 'bag'} size={15} />
                  {TYPE_META[focus.type]?.short}
                </span>
                <span>
                  <Icon name="clock" size={15} />
                  {fmtTime(focus.created)}
                </span>
                {focus.status === 'preparando' && (
                  <span>
                    <Icon name="timer" size={15} />
                    listo aprox. {countdown((focus.preparingAt || focus.created) + 9 * 60000, now)}
                  </span>
                )}
                {focus.status === 'listo' && (
                  <span className="is-ready">
                    <Icon name="checkCircle" size={15} /> Retiralo en mostrador
                  </span>
                )}
              </div>
              <div className="turn-items">
                {focus.items.slice(0, 4).map((item, index) => (
                  <span key={`${item.name}-${index}`}>
                    {item.qty}× {item.name}
                  </span>
                ))}
                {focus.items.length > 4 && <span>+{focus.items.length - 4} más</span>}
              </div>
              <div className="turn-progress">
                {['Recibido', 'Cocina', 'Listo', 'Entregado'].map((label, index) => (
                  <div key={label} className={index <= step ? 'is-done' : ''}>
                    <i />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="turn-stage-art">
                <DishArt kind={focus.items[0]?.art || 'combo'} accent={focus.items[0]?.accent || '#d1502a'} />
              </div>
              {focus.status === 'listo' && (
                <div className="turn-ready-note">
                  <Icon name="megaphone" size={16} />
                  {role === 'admin'
                    ? 'Entregá el pedido y marcalo como retirado.'
                    : 'Mostrá tu ticket en mostrador y retirá tu pedido.'}
                </div>
              )}
              {role === 'admin' && focus.status === 'listo' && (
                <button type="button" className="btn btn-lime" onClick={() => handleHanded(focus)}>
                  <Icon name="check" size={16} /> Marcar entregado
                </button>
              )}
            </div>
          ) : (
            <div className="turn-stage-empty">
              <DishArt kind="combo" accent="#e0a13a" />
              <h2>No hay pedidos en camino.</h2>
              <p>Cuando entre un pedido para retirar, aparece acá con su ticket y su nombre.</p>
            </div>
          )}
          {ownOrder && (
            <div className="turn-own">
              <Icon name="star" size={14} /> Tu pedido es {ownOrder.code} · {STATUS[ownOrder.status]?.label}
            </div>
          )}
        </div>

        <aside className="turn-lists">
          <div className="turn-list">
            <header>
              <h3>
                Listos para retirar <span>{ready.length}</span>
              </h3>
              <small>Pasá por mostrador</small>
            </header>
            <div className="turn-list-scroll">
              {ready.length ? (
                ready.map((order) => (
                  <div className={`turn-row is-ready ${ownOrder?.id === order.id ? 'is-own' : ''}`} key={order.id}>
                    <div className="turn-row-code">{order.code}</div>
                    <div className="turn-row-name">
                      <b>{order.customerName}</b>
                      <small>
                        {TYPE_META[order.type]?.short} · {money(orderTotals(order, settings).total)}
                      </small>
                    </div>
                    {role === 'admin' ? (
                      <button
                        type="button"
                        className="turn-row-btn"
                        onClick={() => handleHanded(order)}
                        title="Marcar entregado"
                      >
                        <Icon name="check" size={15} />
                      </button>
                    ) : (
                      <span className="turn-row-chip">Listo</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="turn-list-empty">Nada por acá todavía.</p>
              )}
            </div>
          </div>

          <div className="turn-list">
            <header>
              <h3>
                En cocina <span>{cooking.length}</span>
              </h3>
              <small>Estamos en eso</small>
            </header>
            <div className="turn-list-scroll">
              {cooking.length ? (
                cooking.map((order) => (
                  <div className={`turn-row ${ownOrder?.id === order.id ? 'is-own' : ''}`} key={order.id}>
                    <div className="turn-row-code">{order.code}</div>
                    <div className="turn-row-name">
                      <b>{order.customerName}</b>
                      <small>{STATUS[order.status]?.label} · {fmtTime(order.created)}</small>
                    </div>
                    <span className={`turn-row-chip tone-${STATUS[order.status]?.tone}`}>
                      {STATUS[order.status]?.short}
                    </span>
                  </div>
                ))
              ) : (
                <p className="turn-list-empty">Cocina despejada.</p>
              )}
            </div>
          </div>

          {handed.length > 0 && (
            <div className="turn-handed">
              <span>Retirados hace instantes</span>
              <div>
                {handed.map((order) => (
                  <span key={order.id} className="turn-handed-chip">
                    {order.code} · {order.customerName.split(' ')[0]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <div className="turn-ticker">
        <div className="turn-ticker-track">
          {[...pickupOrders, ...pickupOrders].slice(0, 12).map((order, index) => (
            <span key={`${order.id}-${index}`}>
              <i className={`tone-${STATUS[order.status]?.tone}`} />
              {order.code} · {order.customerName}
              <b>{STATUS[order.status]?.short}</b>
              <em>✳</em>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
