# Miga — Restaurante

Rediseño de interfaz para **Miga**, un restaurante de barrio. La aplicación incluye una experiencia completa de cliente y un panel de administración separado por rol, con pedidos por usuario, sesiones de mesa, reclamos, pagos, propina, turnero en vivo y promociones.

> Proyecto académico de Rediseño de Interfaz de Usuario. Funciona sin backend: los datos se guardan en el navegador (`localStorage`) y la sesión en `sessionStorage`.

## Ejecutar

1. Abrí la carpeta en Visual Studio Code.
2. En la terminal, ejecutá `npm install` una vez.
3. Ejecutá `npm run dev` y abrí la dirección que muestra Vite.
4. Para generar la versión de producción: `npm run build` (se publica en `dist/`).

## Cuentas de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administración | `admin@miga.com` | `miga1998` |
| Cliente | `sofia@miga.com` | `demo123` |
| Cliente | `mateo@miga.com` | `demo123` |
| Cliente | `lucia@miga.com` | `demo123` |

También se puede crear una cuenta nueva desde la pestaña **Crear cuenta**. Los pedidos y el carrito quedan asociados a cada usuario: cada cliente ve solo sus pedidos, y la administración ve los de todos.

## Experiencia de cliente

- **Inicio editorial** con hero, promociones rotativas, anuncios del restaurante y ofertas destacadas.
- **Menú amplio** en seis categorías (burgers, entradas, ensaladas, bebidas, cafetería y postres), con múltiples variantes y precios por variante, búsqueda y filtros.
- **Carrito por usuario** persistente, con cantidades y edición.
- **Tres formas de pedido**:
  - **Mesa**: selección de mesa, sesión de mesa con los consumos acumulados y botón de reclamo con mensaje.
  - **Retiro**: se genera un turno y un comprobante digital.
  - **Delivery**: dirección y teléfono, con recargo de envío y porcentaje de servicio configurables.
- **Medios de pago**: efectivo, tarjeta, QR/MODO y transferencia. El efectivo queda pendiente; el resto se marca como pagado en la demo.
- **Propina opcional** para pedidos en mesa, editable al pagar la cuenta.
- **Comprobante digital** descargable e imprimible, con el mismo código que el turno.
- **Seguimiento del pedido** con estados *Recibido → Preparando → Listo → Entregado*. Pasa a *Preparando* automáticamente a los 2 minutos (configurable) y el cliente puede modificar o cancelar antes de cocina.
- **Reclamos** enviados directamente a administración, con respuesta y posibilidad de cancelar/reembolsar el pedido asociado.
- **Turnero de retiro** animado con nombre, código y estados; los pedidos entregados se retiran de la pantalla después del tiempo configurado.
- **Historial**, repetición de pedidos y acceso a comprobantes anteriores.

## Panel de administración

- **Acceso restringido por rol**: las cuentas de cliente no pueden entrar al panel.
- **Tablero** con ventas, pedidos activos, mesas ocupadas y alertas.
- **Todos los pedidos**: detalle, cambio de estado, edición de ítems, cancelación, reembolso y motivo.
- **Bandeja de reclamos** con respuesta, resolución y cancelación del pedido vinculado.
- **Mapa de salón** con 12 mesas, estado de ocupación y carga de pedidos asistida.
- **Gestor de menú**: disponibilidad, precios y creación de productos con variantes.
- **Anuncios y ofertas**: alta, edición, publicación y activación de promociones.
- **Turnero en vivo** a pantalla completa, con animaciones y enfoque rotativo.
- **Configuración**: IVA (18%), avance automático, tiempos de preparación y limpieza, envío, servicio, cantidad de mesas, aceptación de pedidos, popup de promos y datos del local.
- **Reiniciar demo** para volver a los datos iniciales.

## Estructura

```text
index.html
public/favicon.svg
src/
  App.jsx              Sesión y ruteo por rol
  store.jsx            Estado, persistencia, sincronización y acciones
  data.js              Productos, ofertas, usuarios y datos iniciales
  utils.js             Totales, formatos, estados y comprobante HTML
  ui.jsx               Componentes base (modales, toasts, campos, pills)
  icons.jsx            Set de íconos SVG propio
  DishArt.jsx          Ilustraciones SVG de platos y bebidas
  styles.css           Sistema de diseño y estilos responsive/print
  components/Receipt.jsx
  screens/Login.jsx
  screens/Client.jsx
  screens/Admin.jsx
  screens/TurnBoard.jsx
```

## Persistencia y demo

- Datos del restaurante: `localStorage` → `miga.store.v3`.
- Carrito: `localStorage` → `miga.cart.<id de usuario>`.
- Sesión: `sessionStorage` → `miga.session` (cada pestaña puede tener un rol distinto).
- Los cambios se sincronizan entre pestañas mediante el evento `storage`.
- Los pagos son simulados: no se procesa dinero real.

Para volver al estado inicial, usá **Configuración → Reiniciar demo** dentro del panel de administración.

## Diseño

Estética cálida de bistro editorial: paleta crema, tinta, arcilla, miel y verde bosque; tipografías **Fraunces** (títulos) y **Manrope** (interfaz); ilustraciones e íconos SVG hechos a medida. El panel de administración usa una barra lateral oscura fija, y el turnero una pantalla oscura de alto contraste. La interfaz es responsive y respeta `prefers-reduced-motion`.
