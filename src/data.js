// ─────────────────────────────────────────────────────────────
// Miga · datos base del prototipo (menú, cuentas demo, pedidos)
// ─────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: 'hamburguesas', label: 'Hamburguesas', icon: 'flame' },
  { id: 'pollo', label: 'Pollo & más', icon: 'chef' },
  { id: 'acompanamientos', label: 'Papas & extras', icon: 'spark' },
  { id: 'bebidas', label: 'Bebidas', icon: 'cup' },
  { id: 'cafe', label: 'Café', icon: 'coffee' },
  { id: 'postres', label: 'Postres', icon: 'cake' },
];

const p = (
  id,
  name,
  category,
  desc,
  art,
  accent,
  variants,
  extra = {}
) => ({
  id,
  name,
  category,
  desc,
  art,
  accent,
  variants: variants.map((v, i) => ({
    id: `${id}-v${i + 1}`,
    label: v[0],
    price: v[1],
    note: v[2] || '',
  })),
  available: true,
  ...extra,
});

export const SEED_PRODUCTS = [
  p('clasica', 'La Clásica', 'hamburguesas', 'Medallón de carne a la plancha, cheddar, lechuga, tomate y salsa Miga.', 'burger', '#d9893b', [
    ['Simple', 10500],
    ['Doble', 14500, 'El doble de carne'],
    ['Triple', 17900, 'Para valientes'],
  ], { tag: 'La de siempre' }),
  p('cheddar', 'Cheddar Salvaje', 'hamburguesas', 'Doble cheddar fundido, cebolla caramelizada y mayo ahumada.', 'doubleBurger', '#cf6b2f', [
    ['Simple', 11900],
    ['Doble', 15900],
  ], { tag: 'Top ventas' }),
  p('bbq', 'Ahumada BBQ', 'hamburguesas', 'Bondiola desmenuzada, salsa BBQ de la casa y aros de cebolla crocantes.', 'burger', '#a8522f', [
    ['Simple', 12500],
    ['Doble', 16500],
  ]),
  p('veggie', 'Huerta Veggie', 'hamburguesas', 'Medallón de garbanzos y remolacha, palta, rúcula y alioli de limón.', 'burger', '#6f8a5b', [
    ['Simple', 11500],
    ['Doble', 15500],
  ], { tag: 'Veggie' }),
  p('crispy', 'Pollo Crispy', 'hamburguesas', 'Suprema crocante, coleslaw fresco y salsa de miel y mostaza.', 'chicken', '#d9a13f', [
    ['Simple', 11800],
    ['Doble', 15800],
  ]),
  p('smash', 'Smash de temporada', 'hamburguesas', 'Dos smash finitos, cebolla crocante, pepinillos y mayo de la casa.', 'doubleBurger', '#c4552e', [
    ['Edición limitada', 15200],
  ], { tag: 'Nueva', isNew: true }),

  p('alitas', 'Alitas glaseadas', 'pollo', 'Glaseado de miel, limón y ají. Con dip de queso azul.', 'chicken', '#c96a34', [
    ['6 unidades', 9900],
    ['12 unidades', 17900],
    ['18 unidades', 24900, 'Para compartir'],
  ], { tag: 'Para picar' }),
  p('nuggets', 'Nuggets de pecho', 'pollo', 'Pollo de pecho empanado a mano, con dip de mostaza miel.', 'nuggets', '#d69a45', [
    ['6 unidades', 7500],
    ['10 unidades', 10900],
  ]),
  p('wrap', 'Wrap de pollo', 'pollo', 'Tortilla de trigo, pollo grillado, palta, tomate y alioli.', 'wrap', '#7d9159', [
    ['Clásico', 9800],
    ['Doble proteína', 12400],
  ]),
  p('milanesa', 'Sándwich de milanesa', 'pollo', 'Milanesa de ternera, lechuga, tomate y mayo casera en pan de campo.', 'sandwich', '#b77b3c', [
    ['Simple', 11200],
    ['Completo', 13800, 'Con huevo y queso'],
  ]),

  p('papas', 'Papas rústicas', 'acompanamientos', 'Cortadas a mano, con sal de campo y alioli de la casa.', 'fries', '#d6a23e', [
    ['Chica', 4800],
    ['Mediana', 6400],
    ['Grande', 8200],
  ], { tag: 'Las de siempre' }),
  p('papascheddar', 'Papas con cheddar', 'acompanamientos', 'Papas rústicas bañadas en cheddar fundido y panceta crocante.', 'fries', '#cf7c2f', [
    ['Mediana', 7600],
    ['Grande', 9400],
  ]),
  p('rings', 'Aros de cebolla', 'acompanamientos', 'Rebozado crocante, cebolla dulce y dip de barbacoa.', 'rings', '#c79a4c', [
    ['6 unidades', 5600],
    ['12 unidades', 8900],
  ]),
  p('bastones', 'Bastones de muzzarella', 'acompanamientos', 'Muzzarella estirada, rebozado dorado y salsa de tomate.', 'nuggets', '#d3a24d', [
    ['6 unidades', 6900],
    ['12 unidades', 11800],
  ]),
  p('ensalada', 'Ensalada de estación', 'acompanamientos', 'Hojas frescas, tomate, pepino, semillas y vinagreta cítrica.', 'salad', '#6f8a5b', [
    ['Chica', 5200],
    ['Grande', 7800],
  ], { tag: 'Fresca' }),

  p('gaseosa', 'Gaseosa', 'bebidas', 'Bien fría. Elegí el tamaño que más te rinda.', 'drink', '#b85a3c', [
    ['Lata 354 ml', 3200],
    ['500 ml', 4200],
    ['1.5 L', 5600],
  ]),
  p('limonada', 'Limonada de la casa', 'bebidas', 'Limón exprimido, menta y un toque de jengibre.', 'lemonade', '#a7b45b', [
    ['Vaso', 3900],
    ['Jarra', 8900, 'Ideal para compartir'],
  ], { tag: 'Favorita' }),
  p('cerveza', 'Cerveza artesanal', 'bebidas', 'Lager de la casa, ligera y bien fría.', 'beer', '#c79a4c', [
    ['Media pinta', 3600],
    ['Pinta', 5200],
    ['Botella 500 ml', 6100],
  ]),
  p('agua', 'Agua mineral', 'bebidas', 'Sin gas o con gas. Consultá disponibilidad.', 'water', '#7aa0a8', [
    ['500 ml', 2400],
    ['1.5 L', 3400],
  ]),
  p('shake', 'Milkshake', 'bebidas', 'Vainilla, chocolate o frutilla con helado artesanal.', 'shake', '#c9918a', [
    ['Chico', 4800],
    ['Grande', 6200],
  ], { tag: 'Dulce' }),

  p('cafe', 'Café de especialidad', 'cafe', 'Grano de origen, tostado en el barrio.', 'coffee', '#a9794b', [
    ['Espresso', 2600],
    ['Flat white', 3400],
    ['Capuccino', 3800],
  ]),
  p('coldbrew', 'Cold brew', 'cafe', 'Extracción en frío por 18 horas. Suave y intenso.', 'coffee', '#8d6a4a', [
    ['Negro', 3900],
    ['Con leche', 4400],
  ], { tag: 'Nuevo', isNew: true }),

  p('torta', 'Torta de la casa', 'postres', 'La receta de la abuela: dulce, húmeda y con mucho chocolate.', 'cake', '#a86b4a', [
    ['Porción', 4600],
    ['Doble porción', 7900],
  ], { tag: 'Imperdible' }),
  p('cookie', 'Cookie tibia', 'postres', 'Recién salida del horno, con chips de chocolate y sal marina.', 'cookie', '#c08b45', [
    ['Sola', 2900],
    ['Con helado', 4900],
  ]),
  p('flan', 'Flan de la abuela', 'postres', 'Flan casero con dulce de leche y crema batida.', 'flan', '#c79a4b', [
    ['Clásico', 4200],
    ['Con crema', 4800],
  ]),
];

export const SEED_OFFERS = [
  {
    id: 'duo',
    name: 'Dúo Miga',
    tagline: 'La combinación que nunca falla.',
    includes: ['Clásica doble', 'Papas medianas', 'Gaseosa lata'],
    price: 16900,
    oldPrice: 22100,
    art: 'combo',
    accent: '#d1502a',
    badge: 'Combo estrella',
    productId: 'clasica',
    active: true,
  },
  {
    id: 'alitas',
    name: 'Ronda de alitas',
    tagline: 'Para compartir (o no).',
    includes: ['12 alitas glaseadas', 'Papas grandes', '2 medias pintas'],
    price: 27900,
    oldPrice: 34400,
    art: 'chicken',
    accent: '#b4542f',
    badge: 'Solo esta noche',
    productId: 'alitas',
    active: true,
  },
  {
    id: 'pausa',
    name: 'Pausa dulce',
    tagline: 'Café + torta, el plan perfecto.',
    includes: ['Flat white', 'Porción de torta'],
    price: 8900,
    oldPrice: 11400,
    art: 'coffee',
    accent: '#8d6a4a',
    badge: 'Tarde Miga',
    productId: 'cafe',
    active: true,
  },
  {
    id: 'verde',
    name: 'Plan verde',
    tagline: 'Ligero, fresco y con onda.',
    includes: ['Huerta veggie', 'Ensalada chica', 'Limonada'],
    price: 18900,
    oldPrice: 23500,
    art: 'salad',
    accent: '#6f8a5b',
    badge: 'Veggie',
    productId: 'veggie',
    active: true,
  },
];

export const SEED_USERS = [
  {
    id: 'u-admin',
    name: 'Valentina Ríos',
    email: 'admin@miga.com',
    password: 'miga1998',
    role: 'admin',
    phone: '11 5555 0100',
    since: '2019',
  },
  {
    id: 'u-sofia',
    name: 'Sofía Duarte',
    email: 'sofia@miga.com',
    password: 'demo123',
    role: 'client',
    phone: '11 5555 0142',
  },
  {
    id: 'u-mateo',
    name: 'Mateo Ferrer',
    email: 'mateo@miga.com',
    password: 'demo123',
    role: 'client',
    phone: '11 5555 0188',
  },
  {
    id: 'u-lucia',
    name: 'Lucía Benítez',
    email: 'lucia@miga.com',
    password: 'demo123',
    role: 'client',
    phone: '11 5555 0199',
  },
];

export const SEED_SETTINGS = {
  tax: 0.18,
  autoPrepMinutes: 2,
  autoReadyMinutes: 0,
  cleanupMinutes: 20,
  deliveryFee: 2900,
  deliveryService: 0.08,
  tableCount: 12,
  acceptOrders: true,
  autoAdvance: true,
  promoPopup: true,
  restaurantName: 'Miga',
  address: 'Av. Siempreviva 742 · Buenos Aires',
  hours: 'Mar a dom · 12 a 23 h',
};

const seedProduct = (id) => SEED_PRODUCTS.find((item) => item.id === id);
const seedLine = (id, variantIndex, qty = 1) => {
  const product = seedProduct(id);
  const variant = product.variants[variantIndex];
  return {
    productId: product.id,
    name: product.name,
    variantLabel: variant.label,
    unitPrice: variant.price,
    qty,
    art: product.art,
    accent: product.accent,
  };
};

const now = Date.now();
const min = 60 * 1000;

export const SEED_ORDERS = [
  {
    id: 'ord-106',
    number: 106,
    code: 'A-106',
    userId: 'u-sofia',
    customerName: 'Sofía Duarte',
    type: 'mesa',
    table: 4,
    status: 'preparando',
    created: now - 6 * min,
    preparingAt: now - 4 * min,
    items: [seedLine('cheddar', 1, 1), seedLine('papas', 1, 1), seedLine('limonada', 0, 2)],
    tip: 1500,
    discount: 0,
    payment: { method: 'tarjeta', status: 'pagado', paidAt: now - 5 * min },
    note: 'Sin cebolla en la doble, por favor.',
  },
  {
    id: 'ord-105',
    number: 105,
    code: 'A-105',
    userId: 'u-mateo',
    customerName: 'Mateo Ferrer',
    type: 'retiro',
    table: null,
    status: 'listo',
    created: now - 17 * min,
    preparingAt: now - 15 * min,
    readyAt: now - 3 * min,
    items: [seedLine('alitas', 1, 1), seedLine('cerveza', 1, 1)],
    tip: 0,
    discount: 0,
    payment: { method: 'qr', status: 'pagado', paidAt: now - 16 * min },
    note: '',
  },
  {
    id: 'ord-104',
    number: 104,
    code: 'A-104',
    userId: 'u-lucia',
    customerName: 'Lucía Benítez',
    type: 'delivery',
    table: null,
    status: 'preparando',
    created: now - 9 * min,
    preparingAt: now - 7 * min,
    items: [seedLine('clasica', 0, 1), seedLine('papas', 2, 1), seedLine('gaseosa', 2, 1)],
    tip: 0,
    discount: 0,
    deliveryFee: 2900,
    servicePct: 0.08,
    address: 'Gorriti 1180, 3.º B · Palermo',
    phone: '11 5555 0199',
    payment: { method: 'efectivo', status: 'pendiente', paidAt: null },
    note: 'Tocar timbre, no golpear la puerta.',
    claimId: 'clm-1',
  },
  {
    id: 'ord-103',
    number: 103,
    code: 'A-103',
    userId: 'u-lucia',
    customerName: 'Lucía Benítez',
    type: 'mesa',
    table: 7,
    status: 'recibido',
    created: now - 1 * min,
    items: [seedLine('bbq', 0, 1), seedLine('agua', 0, 1)],
    tip: 0,
    discount: 0,
    payment: { method: 'efectivo', status: 'pendiente', paidAt: null },
    note: '',
  },
  {
    id: 'ord-102',
    number: 102,
    code: 'A-102',
    userId: 'u-sofia',
    customerName: 'Sofía Duarte',
    type: 'retiro',
    table: null,
    status: 'entregado',
    created: now - 52 * min,
    preparingAt: now - 50 * min,
    readyAt: now - 38 * min,
    deliveredAt: now - 34 * min,
    items: [seedLine('shake', 1, 1), seedLine('cookie', 1, 1)],
    tip: 700,
    discount: 0,
    payment: { method: 'qr', status: 'pagado', paidAt: now - 50 * min },
    note: '',
  },
  {
    id: 'ord-101',
    number: 101,
    code: 'A-101',
    userId: 'u-mateo',
    customerName: 'Mateo Ferrer',
    type: 'mesa',
    table: 2,
    status: 'entregado',
    created: now - 74 * min,
    preparingAt: now - 72 * min,
    readyAt: now - 61 * min,
    deliveredAt: now - 57 * min,
    items: [seedLine('milanesa', 1, 1), seedLine('papas', 1, 1), seedLine('cerveza', 1, 2)],
    tip: 2000,
    discount: 0,
    payment: { method: 'tarjeta', status: 'pagado', paidAt: now - 58 * min },
    note: '',
  },
];

export const SEED_CLAIMS = [
  {
    id: 'clm-1',
    orderId: 'ord-104',
    orderCode: 'A-104',
    userId: 'u-lucia',
    customerName: 'Lucía Benítez',
    reason: 'Demora en el pedido',
    message: 'Hace más de 20 minutos que el pedido figura en preparación. ¿Me pueden confirmar el estado?',
    createdAt: now - 5 * min,
    status: 'abierto',
    response: '',
  },
];

export const SEED_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    kind: 'nuevo',
    title: 'Llega el Smash de temporada',
    body: 'Dos smash finitos, cebolla crocante y mayo ahumada. Disponible desde esta semana hasta agotar stock.',
    createdAt: now - 2 * 60 * min,
    active: true,
    art: 'doubleBurger',
    accent: '#c4552e',
    cta: 'Ver en la carta',
  },
  {
    id: 'ann-2',
    kind: 'promo',
    title: 'Happy Miga · 2x1 en limonadas',
    body: 'De 18 a 20 h, pedí dos limonadas de la casa y pagá una. Válido para consumo en el local.',
    createdAt: now - 20 * 60 * min,
    active: true,
    art: 'lemonade',
    accent: '#a7b45b',
    cta: 'Sumar al pedido',
  },
  {
    id: 'ann-3',
    kind: 'aviso',
    title: 'Seguí tu turno en pantalla',
    body: 'Ya podés ver el estado de tu pedido en vivo desde la pantalla de retiros. Tu nombre y tu código te esperan.',
    createdAt: now - 45 * 60 * min,
    active: true,
    art: 'combo',
    accent: '#365a42',
    cta: 'Ver turneros',
  },
];

export const CLAIM_REASONS = [
  'Demora en el pedido',
  'Producto incorrecto',
  'Falta un producto',
  'La comida no estaba bien',
  'Problema con el pago',
  'Quiero cancelar el pedido',
  'Otro motivo',
];
