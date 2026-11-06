# Miga — restaurante y caja

Prototipo de interfaz para el trabajo de Rediseño de Interfaz de Usuario. Incluye un flujo de cliente y un panel de caja/salón.

## Ejecutar en Visual Studio Code

1. Abrí esta carpeta en VS Code.
2. En la terminal, ejecutá `npm install` una vez.
3. Ejecutá `npm run dev` y abrí la dirección local que muestra Vite.

## Qué incluye

- Menú visual con categorías, búsqueda, ofertas y carrito.
- Creación de pedidos para mesa o para llevar.
- IVA configurable en `src/main.jsx` mediante `TAX` (la consigna pide 18%).
- Resumen diario: ventas, IVA calculado sobre ventas y total con impuesto.
- Panel de caja con seguimiento de pedidos, mesas y productos más vendidos.
- Cancelación de pedidos y registro de ventas/cancelaciones en el navegador con `localStorage`.
- Ventana de pago con QR ilustrativo para la presentación; no procesa pagos reales.

Los precios de ejemplo están expresados en pesos argentinos (ARS), con los montos mínimos indicados por el usuario y algunos productos y combos añadidos para el rediseño.
