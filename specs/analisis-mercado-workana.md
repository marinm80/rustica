# Análisis: Rústica frente al mercado de Workana
*Generado: 2026-06-10*

## Veredicto

Rústica está **bien posicionado para Workana como producto de implementación personalizada**, no como SaaS. El flujo operativo núcleo (reservas → comanda → cocina → cobro) está completo y funcional, que es justo lo que piden los proyectos de "sistema para restaurante" en la plataforma. Las brechas críticas para LATAM son impresión térmica, facturación electrónica por país, pagos digitales e integraciones de delivery.

## Estado actual del producto

### Completo y operacional
- **Mesas y zonas**: 30 mesas, 3 zonas, estados en tiempo real, mesas VIP con consumo mínimo
- **Reservas**: flujo end-to-end con validación de solapamiento, depósito VIP (30% vía WooCommerce), expiración automática, conversión a comanda
- **Comandas**: ciclo completo con modificadores (término, acompañamiento, tamaño, hielo, gas), notas, edición, división de cuenta
- **Cocina/KDS**: alertas de urgencia (>15 min), polling 5s, marcar listo
- **Facturación**: numeración secuencial, IVA 19%, múltiples métodos de pago, propinas, split billing, impresión en navegador
- **Roles**: mesero/cocina/gerente con capacidades granulares, JWT + nonce
- **Admin Dashboard standalone**: React SPA con login, RBAC, 46 tests
- **Sitio público**: landing + carta + formulario de reservas con disponibilidad en vivo
- **33 endpoints REST** en namespace `rustica/v1`

### Parcial o esqueleto
- **Carta**: sin imágenes, descripciones ni alergénicos
- **Reportes**: existe endpoint `/reportes/cierre-dia` (ventas, propinas, top productos, desglose por método de pago) pero **sin UI ni gráficos**
- **Configuración hardcodeada**: zonas, IVA, horarios, límites — no editables desde UI

### Ausente
- Impresión térmica ESC/POS (solo `window.open`)
- Facturación electrónica por país (CFDI, DIAN, SUNAT, AFIP/ARCA, SII)
- Pasarelas de pago (Stripe, Mercado Pago) y pagos QR
- Integraciones delivery (Rappi, PedidosYa, Uber Eats)
- Inventario/stock y costos de recetas
- Multi-sucursal / white-label
- Notificaciones push/SMS, recordatorios de reserva
- WebSockets (solo polling), PWA/modo offline
- i18n, README, tests del plugin/backend

## El mercado de Workana

**Demanda**: se publican recurrentemente proyectos que piden casi exactamente lo que Rústica ya tiene — comandas en tablet, mapa de mesas, reservas, corte de caja, KDS. Patrón frecuente: clientes con sistemas a medio hacer buscando quien los complete. Stack dominante: PHP/MySQL/WordPress + fronts JS — encaja perfecto.

**Presupuestos**: proyectos de "sistema restaurante completo" se publican en USD 500–3.000. Ticket medio de tareas puntuales ~USD 250–300. Comisión de Workana: 20% inicial → 10% (>USD 300 acumulados con el cliente) → 5% (>USD 3.000); conviene estructurar relaciones recurrentes.

**Competencia que el cliente compara**:
- SaaS POS LATAM: Fudo (USD 39–130/mes/sucursal, KDS y delivery se cobran aparte), Soft Restaurant (~USD 28–50/mes, fuerte en CFDI), Poster (desde USD 19/mes), Loyverse (gratis + add-ons), Parrot
- Plugins WP: WPCafe USD 79–179/año; cartas QR comoditizadas a USD 0–80/año
- El cliente está anclado a USD 20–80/mes. La carta QR y la reserva simple **no se venden solas**.

**Diferenciador real de Rústica**: el conjunto integrado comandas + KDS + mapa de mesas + roles + facturación, con propiedad del código (sin cuota perpetua, sin comisiones, datos propios). Frente a Fudo Premium el cliente recupera la inversión en 12–18 meses.

## Funcionalidades faltantes priorizadas (manteniendo esencia de app de restaurante)

### Críticas (sin esto el cliente LATAM descarta)
1. **Impresión térmica ESC/POS** — tickets de cocina y caja; universal en LATAM
2. **Facturación electrónica** — integración con PAC/proveedor local, o venderse honestamente como "pre-factura + export"
3. **Pagos digitales/QR** — Mercado Pago como primera integración
4. **UI de reportes** — el endpoint ya existe; falta dashboard con gráficos y export CSV

### Importantes (suben el ticket de venta)
5. Integraciones delivery (Rappi/PedidosYa/Uber Eats)
6. Inventario básico con alertas de stock
7. Carta con imágenes y descripciones
8. Notificaciones/recordatorios de reserva (email/WhatsApp)

### Deseables (escala futura)
9. Configuración desde UI (zonas, IVA, horarios) → habilita white-label
10. Multi-sucursal
11. PWA/modo offline (ventaja vs SaaS cloud cuando se cae internet)
12. WebSockets en lugar de polling

## Estrategia de venta recomendada

1. **Corto plazo**: servicios WordPress/React genéricos en Workana usando Rústica como portfolio — acumular reseñas con tickets de USD 100–300
2. **En paralelo**: postular a todo proyecto "sistema restaurante" ofreciendo **demo en vivo el primer día** y cotizando solo personalización (USD 800–2.500) — descalifica a quien cotiza desde cero
3. **Cierre**: llave en mano + mantenimiento/hosting USD 30–60/mes (baja la comisión de Workana a 5% y genera recurrencia)
4. **Antes de vender "sistema completo"**: cerrar al menos impresión térmica
5. **Evitar**: competir como carta QR (comoditizada); prometer facturación electrónica país por país sin tenerla integrada
