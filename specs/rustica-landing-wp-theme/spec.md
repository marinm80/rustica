# Spec Funcional: Landing Page Restaurante "Rústica" (base para tema WordPress)
**Slug**: rustica-landing-wp-theme
**Fecha**: 2026-06-03
**Estado**: aprobado

## Problema
El restaurante "Rústica" no cuenta con una presencia digital que transmita su identidad de cocina con alma campestre ni que permita a los comensales reservar mesa o consultar el menú de forma inmediata. Se necesita una página de aterrizaje emocional y persuasiva que convierta visitas en reservas y consultas de eventos. Adicionalmente, el negocio quiere reutilizar este activo como base para futuros sitios, por lo que la estructura debe poder evolucionar a un tema reutilizable sin reescribir el contenido.

## Actores
- **Comensal potencial (visitante)**: Persona que descubre el restaurante, explora la propuesta visual, consulta platos y desea reservar una mesa.
- **Organizador de eventos/catering**: Persona que busca contratar al restaurante para un evento privado o servicio de catering y envía una solicitud específica.
- **Equipo del restaurante (receptor)**: Personal que recibe las solicitudes de reserva y de eventos para gestionarlas (fuera de la pantalla; solo recibe los datos enviados).
- **Mantenedor del sitio (futuro)**: Persona que en el futuro adaptará la landing a un tema reutilizable y necesitará que los contenidos y bloques estén claramente separados.

## Alcance
### In Scope
- Página única (one-page) con navegación por anclas y desplazamiento suave entre secciones.
- Barra de navegación que cambia de transparente a sólida según el scroll.
- Sección Hero con imagen de fondo, mensaje emocional y llamada a la acción hacia reservas.
- Galería con pestañas (El Restaurante / Nuestros Platos) y visor ampliado tipo lightbox.
- Sección de platos destacados (4 platos) con foto, nombre, descripción breve, precio y etiqueta.
- Formulario de reserva de mesa con validación en el lado del cliente.
- Sección de contacto con datos del local, mapa embebido (placeholder) y formulario de catering/eventos.
- Pie de página con enlaces a redes sociales y aviso de copyright.
- Diseño mobile-first totalmente responsivo, estética "modern rustic" (tonos tierra, acentos verde oliva, combinación serif + sans-serif).
- Estructura de contenido y bloques pensada para portar a un tema reutilizable.

### Out of Scope
- Procesamiento real, persistencia o envío por correo de las reservas y solicitudes (no hay backend en esta entrega; el envío se simula/valida en cliente).
- Confirmación de disponibilidad real de mesas o gestión de cupos.
- Autenticación de usuarios o panel de administración.
- Pasarela de pagos o cobro de señas.
- Carta/menú completo gestionable; solo se muestran 4 platos destacados estáticos.
- Internacionalización/multidioma (el contenido inicial es en español).
- Integración real con un proveedor de mapas con clave de API (se usa placeholder).

## Escenarios BDD

### Feature: Navegación y barra superior

#### Scenario: La barra de navegación es transparente al inicio
  Given el visitante carga la página y se encuentra en la parte superior (sin haber hecho scroll)
  When observa la barra de navegación sobre la sección Hero
  Then la barra se muestra con fondo transparente
  And el logo es visible a la izquierda
  And los enlaces de navegación son legibles sobre la imagen del Hero

#### Scenario: La barra se vuelve sólida al desplazarse
  Given el visitante está en la parte superior con la barra transparente
  When desplaza la página hacia abajo más allá del Hero
  Then la barra adopta un fondo sólido en tonos tierra
  And permanece fija y visible en la parte superior de la pantalla

#### Scenario: Navegación con desplazamiento suave
  Given el visitante ve los enlaces de la barra de navegación
  When hace clic en un enlace de sección (por ejemplo "Reservas")
  Then la página se desplaza suavemente hasta la sección correspondiente
  And la sección de destino queda visible sin quedar oculta tras la barra fija

#### Scenario: Navegación accesible en móvil
  Given el visitante usa un dispositivo con pantalla estrecha
  When abre la página
  Then los enlaces se colapsan en un menú accesible mediante un control (botón hamburguesa)
  And al pulsarlo se despliegan los enlaces de navegación

### Feature: Hero principal

#### Scenario: Presentación del mensaje emocional
  Given el visitante carga la página
  When ve la primera pantalla
  Then se muestra una imagen de fondo impactante del restaurante
  And aparece un supertítulo emocional y un subtítulo persuasivo legibles sobre la imagen
  And se presenta un botón de llamada a la acción con el texto "Reserva una Mesa"

#### Scenario: La CTA del Hero lleva a reservas
  Given el visitante lee el Hero
  When hace clic en "Reserva una Mesa"
  Then la página se desplaza suavemente hasta la sección de Sistema de Reservas

### Feature: Galería dinámica

#### Scenario: Cambio entre pestañas de galería
  Given el visitante está en la sección de galería con la pestaña "El Restaurante" activa
  When selecciona la pestaña "Nuestros Platos"
  Then se muestran las imágenes correspondientes a "Nuestros Platos"
  And se ocultan las imágenes de "El Restaurante"
  And la pestaña seleccionada queda marcada como activa

#### Scenario: Ampliar una imagen en visor (lightbox)
  Given el visitante ve la cuadrícula de imágenes de una pestaña
  When hace clic en una imagen
  Then la imagen se muestra ampliada en un visor modal superpuesto
  And el visor ofrece un control para cerrarse y volver a la galería

#### Scenario: Efecto visual al pasar el cursor
  Given el visitante apunta el cursor sobre una imagen de la galería en un dispositivo de escritorio
  When mantiene el cursor sobre la imagen
  Then la imagen aplica un zoom sutil como retroalimentación visual

### Feature: Platos destacados (Menú)

#### Scenario: Visualización de los 4 platos estrella
  Given el visitante llega a la sección de destacados
  When observa la cuadrícula
  Then ve 4 platos, cada uno con foto, nombre, descripción breve y precio
  And los platos que correspondan muestran una etiqueta "Recomendado" o "Especialidad"

#### Scenario: Adaptación responsiva de la cuadrícula
  Given el visitante usa un dispositivo móvil
  When ve la sección de destacados
  Then los platos se reorganizan en una o dos columnas para mantener la legibilidad
  And toda la información de cada plato sigue siendo visible sin recorte

### Feature: Sistema de reservas

#### Scenario: Envío de una reserva válida
  Given el visitante está en el formulario de reserva
  When completa Nombre, Correo, Teléfono, Fecha, Hora y Número de personas con datos válidos
  And confirma el envío
  Then el formulario valida todos los campos como correctos
  And se muestra una confirmación visual de que la solicitud fue enviada

#### Scenario: Campos obligatorios vacíos
  Given el visitante está en el formulario de reserva
  When intenta enviar dejando uno o más campos obligatorios vacíos
  Then el envío se bloquea
  And se resaltan los campos faltantes con un mensaje indicando que son obligatorios

#### Scenario: Formato de correo inválido
  Given el visitante completa el campo Correo con un valor que no es un correo válido
  When intenta enviar el formulario
  Then el envío se bloquea
  And se muestra un mensaje indicando que el correo no tiene un formato válido

#### Scenario: Fecha en el pasado
  Given el visitante abre el selector de Fecha
  When intenta elegir o enviar una fecha anterior al día actual
  Then el sistema impide tomar esa fecha como reserva válida
  And muestra una indicación de que la fecha debe ser hoy o posterior

#### Scenario: Número de personas fuera de rango
  Given el visitante completa el campo Número de personas
  When introduce un valor menor a 1 o superior al máximo permitido
  Then el envío se bloquea
  And se muestra un mensaje indicando el rango válido de comensales

### Feature: Contacto y eventos

#### Scenario: Visualización de datos de contacto en escritorio
  Given el visitante usa un dispositivo de escritorio
  When llega a la sección de contacto
  Then ve dos columnas
  And la columna izquierda muestra dirección, teléfono y horarios con sus iconos
  And se muestra un mapa embebido (placeholder) de la ubicación

#### Scenario: Envío de solicitud de catering/eventos válida
  Given el visitante está en el formulario de catering/eventos de la columna derecha
  When completa los campos requeridos con datos válidos y envía
  Then el formulario valida los datos en el cliente
  And se muestra una confirmación visual de que la solicitud fue enviada

#### Scenario: Solicitud de eventos incompleta
  Given el visitante está en el formulario de catering/eventos
  When intenta enviar con campos obligatorios vacíos o inválidos
  Then el envío se bloquea
  And se resaltan los campos con problemas y su mensaje correspondiente

#### Scenario: Apilado de columnas en móvil
  Given el visitante usa un dispositivo móvil
  When ve la sección de contacto
  Then las dos columnas se apilan verticalmente manteniendo el orden lógico de lectura

### Feature: Pie de página

#### Scenario: Acceso a redes sociales y copyright
  Given el visitante llega al final de la página
  When observa el pie de página
  Then ve los enlaces/iconos a las redes sociales del restaurante
  And ve el aviso de copyright con el nombre del restaurante

### Feature: Experiencia responsiva general

#### Scenario: Diseño mobile-first coherente
  Given el visitante accede desde cualquier tamaño de pantalla (móvil, tablet, escritorio)
  When recorre todas las secciones
  Then el contenido se adapta sin desbordes horizontales
  And los textos, imágenes y controles permanecen legibles y utilizables
  And se conserva la estética "modern rustic" (tonos tierra, acentos verde oliva, serif + sans-serif)

## Criterios de Aceptación
- [ ] La página funciona como one-page con navegación por anclas y desplazamiento suave a las 6 secciones.
- [ ] La barra de navegación pasa de transparente a sólida al hacer scroll y permanece fija.
- [ ] El Hero muestra imagen de fondo, supertítulo, subtítulo y CTA "Reserva una Mesa" que enlaza a la sección de reservas.
- [ ] La galería alterna entre pestañas "El Restaurante" y "Nuestros Platos" y abre cualquier imagen en un visor ampliado con opción de cierre.
- [ ] Las imágenes de la galería muestran un efecto de zoom sutil al pasar el cursor en escritorio.
- [ ] La sección de destacados presenta exactamente 4 platos con foto, nombre, descripción, precio y etiqueta "Recomendado"/"Especialidad" donde aplique.
- [ ] El formulario de reserva valida en cliente: campos obligatorios, formato de correo, fecha no pasada y número de personas dentro de rango; bloquea el envío inválido y muestra mensajes claros.
- [ ] Una reserva válida produce una confirmación visual para el visitante.
- [ ] La sección de contacto muestra dos columnas en escritorio (datos + mapa placeholder a la izquierda, formulario de eventos a la derecha) y se apila en móvil.
- [ ] El formulario de catering/eventos valida en cliente y confirma visualmente el envío válido.
- [ ] El pie de página incluye iconos de redes sociales y aviso de copyright.
- [ ] Todo el diseño es responsivo y mobile-first, sin desbordes horizontales en móvil, tablet y escritorio.
- [ ] El contenido y los bloques están separados semánticamente, con clases reutilizables y sin estilos en línea, de modo que la estructura sea portable a un tema reutilizable.

## Restricciones de Negocio
- El mensaje y la estética deben transmitir la identidad "modern rustic": cercanía, calidez y producto de calidad; nada minimalista frío ni corporativo genérico.
- La acción prioritaria de la página es la reserva de mesa; debe ser la llamada a la acción más visible y accesible.
- El contenido inicial se presenta en español.
- En esta entrega no se garantiza disponibilidad real de mesas: las reservas son solicitudes, no confirmaciones en firme.
- No se solicita ni almacena información sensible más allá de los datos de contacto necesarios para gestionar reserva o evento.

## Restricciones Técnicas (heredadas de la solicitud del usuario)
> Estas decisiones fueron fijadas explícitamente por el solicitante como condiciones del proyecto. Su validación/profundización corresponde a @tech-advisor.
- Maquetación basada en un framework CSS responsivo cargado por CDN (Bootstrap 5), aprovechando sus componentes nativos (pestañas, modal, validación de formularios).
- Interactividad implementada con TypeScript.
- Iconografía mediante FontAwesome.
- Selector de fecha nativo del navegador, estilizado acorde al diseño.
- Sin estilos en línea; uso de clases reutilizables y separación semántica de bloques.
- Estructura (HTML5, CSS3, TypeScript) preparada para convertirse en un tema WordPress reutilizable (contenido separado de presentación, bloques identificables, marcado semántico).
- Sin backend en esta entrega: el envío de formularios se valida y confirma en el cliente.

## Preguntas Abiertas
- ¿La confirmación de reserva/evento debe ser solo un mensaje en pantalla, o se espera además un correo de confirmación (lo que implicaría backend en una fase posterior)?
- ¿Cuál es el rango válido de "Número de personas" para la reserva (mínimo y máximo)? ¿Existe un límite de tamaño de grupo que requiera otro canal?
- ¿Qué horarios de servicio y qué franjas horarias deben ofrecerse en el campo Hora (lista fija de turnos o entrada libre)?
- ¿Cuáles son los datos reales de contacto (dirección, teléfono, horarios) y las redes sociales a enlazar?
- ¿Cuáles son los 4 platos destacados, sus descripciones, precios y qué etiqueta lleva cada uno?
- ¿Hay textos definitivos para el supertítulo/subtítulo del Hero o se redactan como propuesta?
- ¿El mapa placeholder debe corresponder a una ubicación concreta o es genérico hasta tener la dirección final?
- ¿Qué campos exactos requiere el formulario de catering/eventos (por ejemplo tipo de evento, fecha, número de invitados, mensaje)?
