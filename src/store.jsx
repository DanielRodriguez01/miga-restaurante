import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  SEED_ANNOUNCEMENTS,
  SEED_CLAIMS,
  SEED_OFFERS,
  SEED_ORDERS,
  SEED_PRODUCTS,
  SEED_SETTINGS,
  SEED_USERS,
} from './data';
import { uid } from './utils';

const KEY = 'miga.store.v3';
const VERSION = 3;

const makeSeed = () => ({
  version: VERSION,
  rev: 1,
  users: SEED_USERS,
  products: SEED_PRODUCTS,
  offers: SEED_OFFERS,
  orders: SEED_ORDERS,
  claims: SEED_CLAIMS,
  announcements: SEED_ANNOUNCEMENTS,
  settings: SEED_SETTINGS,
});

const loadStore = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === VERSION && Array.isArray(parsed.orders) && Array.isArray(parsed.products)) {
        return { ...makeSeed(), ...parsed };
      }
    }
  } catch {
    /* almacenamiento no disponible: seguimos con datos demo */
  }
  return makeSeed();
};

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadStore);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Persistencia local + sincronización entre pestañas (cliente / admin).
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* modo demo sin storage */
    }
  }, [state]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== KEY || !event.newValue) return;
      try {
        const incoming = JSON.parse(event.newValue);
        if (!incoming || incoming.version !== VERSION) return;
        setState((current) => ((incoming.rev || 0) > (current.rev || 0) ? incoming : current));
      } catch {
        /* ignoramos payloads inválidos */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const bump = useCallback((updater) => {
    setState((previous) => {
      const next = typeof updater === 'function' ? updater(previous) : updater;
      if (!next || next === previous) return previous;
      return { ...next, rev: (previous.rev || 1) + 1 };
    });
  }, []);

  // Paso automático a cocina y limpieza visual del tablero de turnos.
  useEffect(() => {
    const timer = setInterval(() => {
      setState((previous) => {
        const { settings } = previous;
        if (!settings.autoAdvance) return previous;
        const now = Date.now();
        let changed = false;
        const orders = previous.orders.map((order) => {
          if (order.status === 'recibido') {
            const limit = order.created + settings.autoPrepMinutes * 60000;
            if (now >= limit) {
              changed = true;
              return { ...order, status: 'preparando', preparingAt: now, updatedAt: now, autoMoved: true };
            }
          }
          if (order.status === 'preparando' && settings.autoReadyMinutes > 0) {
            const from = order.preparingAt || order.created;
            if (now >= from + settings.autoReadyMinutes * 60000) {
              changed = true;
              return { ...order, status: 'listo', readyAt: now, updatedAt: now, autoMoved: true };
            }
          }
          return order;
        });
        if (!changed) return previous;
        return { ...previous, orders, rev: (previous.rev || 1) + 1 };
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const now = Date.now();

  const applyStatus = (order, status) => {
    const stamp = Date.now();
    const patch = { status, updatedAt: stamp };
    if (status === 'preparando') patch.preparingAt = stamp;
    if (status === 'listo') patch.readyAt = stamp;
    if (status === 'entregado') patch.deliveredAt = stamp;
    return { ...order, ...patch, autoMoved: false };
  };

  const cancelPatch = (order, reason, by) => {
    const stamp = Date.now();
    const paid = order.payment?.status === 'pagado';
    return {
      ...order,
      status: 'cancelado',
      cancelReason: reason || 'Cancelado sin motivo indicado',
      cancelledBy: by || 'admin',
      cancelledAt: stamp,
      updatedAt: stamp,
      payment: order.payment
        ? { ...order.payment, status: paid ? 'reembolsado' : 'cancelado' }
        : { method: '—', status: 'cancelado' },
    };
  };

  const actions = useMemo(
    () => ({
      addUser: ({ name, email, password, phone = '', role = 'client' }) => {
        const cleanEmail = String(email || '').trim().toLowerCase();
        const exists = stateRef.current.users.some((u) => u.email.toLowerCase() === cleanEmail);
        if (exists) throw new Error('Ese email ya tiene una cuenta. Probá iniciar sesión.');
        const user = {
          id: uid('u'),
          name: String(name || '').trim(),
          email: cleanEmail,
          password: String(password || ''),
          phone,
          role,
          createdAt: Date.now(),
        };
        bump((prev) => ({ ...prev, users: [...prev.users, user] }));
        return user;
      },

      updateSettings: (patch) =>
        bump((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } })),

      placeOrder: (input) => {
        const current = stateRef.current;
        const number = Math.max(0, ...current.orders.map((o) => o.number || 0)) + 1;
        const stamp = Date.now();
        const method = input.paymentMethod || 'efectivo';
        const order = {
          id: uid('ord'),
          number,
          code: `A-${number}`,
          userId: input.userId,
          customerName: input.customerName || 'Cliente',
          type: input.type || 'mesa',
          table: input.type === 'mesa' ? Number(input.table) || null : null,
          status: 'recibido',
          created: stamp,
          items: input.items,
          tip: Math.round(input.tip || 0),
          tipPct: input.tipPct || 0,
          discount: 0,
          note: input.note || '',
          deliveryFee: input.type === 'delivery' ? input.deliveryFee ?? current.settings.deliveryFee : 0,
          servicePct: input.type === 'delivery' ? input.servicePct ?? current.settings.deliveryService : 0,
          address: input.type === 'delivery' ? input.address || '' : '',
          phone: input.phone || '',
          payment: {
            method,
            status: method === 'efectivo' ? 'pendiente' : 'pagado',
            paidAt: method === 'efectivo' ? null : stamp,
          },
          createdBy: input.createdBy || 'client',
        };
        bump((prev) => ({ ...prev, orders: [order, ...prev.orders] }));
        return order;
      },

      setOrderStatus: (id, status) =>
        bump((prev) => ({
          ...prev,
          orders: prev.orders.map((order) => (order.id === id ? applyStatus(order, status) : order)),
        })),

      cancelOrder: (id, reason, by = 'admin') =>
        bump((prev) => ({
          ...prev,
          orders: prev.orders.map((order) =>
            order.id === id ? cancelPatch(order, reason, by) : order
          ),
          claims: prev.claims.map((claim) =>
            claim.orderId === id && claim.status === 'abierto'
              ? {
                  ...claim,
                  status: 'resuelto',
                  response: claim.response || 'Pedido cancelado por el local.',
                  resolvedAt: Date.now(),
                }
              : claim
          ),
        })),

      updateOrder: (id, patch) =>
        bump((prev) => ({
          ...prev,
          orders: prev.orders.map((order) =>
            order.id === id ? { ...order, ...patch, updatedAt: Date.now() } : order
          ),
        })),

      markPaid: (id, method) =>
        bump((prev) => ({
          ...prev,
          orders: prev.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  payment: {
                    method: method || order.payment?.method || 'efectivo',
                    status: 'pagado',
                    paidAt: Date.now(),
                  },
                  updatedAt: Date.now(),
                }
              : order
          ),
        })),

      addClaim: ({ orderId, reason, message }) => {
        const current = stateRef.current;
        const order = current.orders.find((o) => o.id === orderId);
        if (!order) return null;
        const claim = {
          id: uid('clm'),
          orderId,
          orderCode: order.code,
          userId: order.userId,
          customerName: order.customerName,
          reason: reason || 'Otro motivo',
          message: String(message || '').trim(),
          createdAt: Date.now(),
          status: 'abierto',
          response: '',
        };
        bump((prev) => ({
          ...prev,
          claims: [claim, ...prev.claims],
          orders: prev.orders.map((o) =>
            o.id === orderId ? { ...o, claimId: claim.id, updatedAt: Date.now() } : o
          ),
        }));
        return claim;
      },

      resolveClaim: (claimId, { action = 'resolve', response = '' }) =>
        bump((prev) => {
          const claim = prev.claims.find((c) => c.id === claimId);
          if (!claim) return prev;
          const resolved = action !== 'reopen';
          let claims = prev.claims.map((c) =>
            c.id === claimId
              ? {
                  ...c,
                  status: resolved ? 'resuelto' : 'abierto',
                  response,
                  resolvedAt: resolved ? Date.now() : null,
                }
              : c
          );
          let orders = prev.orders;
          if (action === 'cancel') {
            orders = orders.map((order) =>
              order.id === claim.orderId
                ? cancelPatch(order, `Reclamo: ${claim.reason}`, 'admin')
                : order
            );
            claims = claims.map((c) =>
              c.orderId === claim.orderId
                ? {
                    ...c,
                    status: 'resuelto',
                    response: c.response || response || 'Pedido cancelado por el local.',
                    resolvedAt: Date.now(),
                  }
                : c
            );
          }
          return { ...prev, claims, orders };
        }),

      toggleProduct: (productId) =>
        bump((prev) => ({
          ...prev,
          products: prev.products.map((product) =>
            product.id === productId ? { ...product, available: !product.available } : product
          ),
        })),

      updateVariantPrice: (productId, variantId, price) =>
        bump((prev) => ({
          ...prev,
          products: prev.products.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  variants: product.variants.map((variant) =>
                    variant.id === variantId
                      ? { ...variant, price: Math.max(0, Number(price) || 0) }
                      : variant
                  ),
                }
              : product
          ),
        })),

      addProduct: (product) => {
        const stamp = Date.now();
        const id = uid('prod');
        const clean = {
          ...product,
          id,
          available: true,
          variants: (product.variants || []).map((variant, index) => ({
            id: `${id}-v${index + 1}`,
            label: variant.label,
            price: Math.max(0, Number(variant.price) || 0),
            note: variant.note || '',
          })),
          createdAt: stamp,
        };
        bump((prev) => ({ ...prev, products: [clean, ...prev.products] }));
        return clean;
      },

      removeProduct: (productId) =>
        bump((prev) => ({
          ...prev,
          products: prev.products.filter((product) => product.id !== productId),
        })),

      addAnnouncement: (data) => {
        const announcement = {
          id: uid('ann'),
          kind: 'nuevo',
          title: '',
          body: '',
          art: 'combo',
          accent: '#d1502a',
          cta: '',
          active: true,
          createdAt: Date.now(),
          ...data,
        };
        bump((prev) => ({ ...prev, announcements: [announcement, ...prev.announcements] }));
        return announcement;
      },

      updateAnnouncement: (id, patch) =>
        bump((prev) => ({
          ...prev,
          announcements: prev.announcements.map((item) =>
            item.id === id ? { ...item, ...patch } : item
          ),
        })),

      removeAnnouncement: (id) =>
        bump((prev) => ({
          ...prev,
          announcements: prev.announcements.filter((item) => item.id !== id),
        })),

      toggleOffer: (id) =>
        bump((prev) => ({
          ...prev,
          offers: prev.offers.map((offer) =>
            offer.id === id ? { ...offer, active: !offer.active } : offer
          ),
        })),

      resetDemo: () => {
        const seed = makeSeed();
        setState({ ...seed, rev: Date.now() });
      },
    }),
    [bump]
  );

  const value = useMemo(() => ({ state, actions, now }), [state, actions, now]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore debe usarse dentro de StoreProvider');
  return context;
}
