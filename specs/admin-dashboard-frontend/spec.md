# Spec Funcional: Dashboard de Administración Operacional de Rústica
**Slug**: admin-dashboard-frontend
**Fecha**: 2026-06-09
**Estado**: aprobado

## Problema
El personal del restaurante Rústica (meseros, cocina y gerencia) necesita una única aplicación de acceso para operar el servicio diario: tomar comandas, gestionar la cola de cocina y administrar reservaciones. Hoy estas herramientas viven embebidas en el sitio web y dependen del entorno público, lo que mezcla la operación interna con la experiencia del visitante y obliga al personal a transitar por el sitio para llegar a sus tareas. Se requiere un espacio de trabajo dedicado, con acceso controlado por credenciales, que muestre a cada persona solo lo que le corresponde según su función.

## Actores
- **Mesero**: toma y modifica comandas por mesa. Solo necesita acceso a la herramienta de comandas.
- **Cocina**: gestiona la cola de pedidos entrantes y actualiza el estado de preparación de los platos. Solo necesita la vista de cocina.
- **Gerente**: supervisa toda la operación. Accede a comandas, cocina y reservaciones, y a un panel general que reúne las tres funciones.
- **Administrador**: rol con los mismos privilegios operativos que el gerente (acceso total a las tres herramientas).
- **Sistema de autenticación**: valida las credenciales del personal y mantiene la sesión activa.

## Alcance
### In Scope
- Pantalla de inicio de sesión con usuario y contraseña del personal.
- Manejo de errores de autenticación (credenciales inválidas, sin conexión, servicio no disponible).
- Redirección automática tras el login según el rol de la persona.
- Estructura de navegación (barra superior) con nombre de la persona, su rol y un botón para cerrar sesión.
- Navegación entre las herramientas (comandas, cocina, reservaciones) según el rol.
- Integración de las herramientas operativas ya existentes (comandas, cocina, reservaciones) dentro del nuevo espacio de trabajo.
- Persistencia de la sesión al recargar la aplicación: si la sesión sigue siendo válida, no se vuelve a pedir el ingreso.
- Cierre de sesión que limpia la sesión y regresa a la pantalla de inicio.
- Expulsión automática a la pantalla de inicio cuando la sesión expira o deja de ser válida.
- Configuración del entorno de conexión al servicio del restaurante (entorno local o de producción).

### Out of Scope
- El mapa de zonas (herramienta de la página pública), que no forma parte de este espacio de trabajo.
- Creación, edición o eliminación de cuentas de personal y asignación de roles (se gestiona fuera de este espacio).
- Recuperación o restablecimiento de contraseña.
- Reportes, métricas históricas o analítica de operación.
- Cualquier funcionalidad orientada al cliente final o visitante del restaurante.

## Escenarios BDD

### Feature: Inicio de sesión

#### Scenario: Ingreso exitoso de un mesero
  Given que un mesero está en la pantalla de inicio de sesión
  When ingresa su usuario y contraseña correctos
  And confirma el ingreso
  Then la sesión queda iniciada y se conserva para futuras visitas
  And es llevado directamente a la herramienta de comandas

#### Scenario: Ingreso exitoso de personal de cocina
  Given que una persona de cocina está en la pantalla de inicio de sesión
  When ingresa su usuario y contraseña correctos
  And confirma el ingreso
  Then la sesión queda iniciada
  And es llevada directamente a la cola de cocina

#### Scenario: Ingreso exitoso de un gerente o administrador
  Given que un gerente o administrador está en la pantalla de inicio de sesión
  When ingresa su usuario y contraseña correctos
  And confirma el ingreso
  Then la sesión queda iniciada
  And es llevado al panel general con acceso a comandas, cocina y reservaciones

#### Scenario: Credenciales incorrectas
  Given que una persona está en la pantalla de inicio de sesión
  When ingresa un usuario o contraseña que no son válidos
  And confirma el ingreso
  Then permanece en la pantalla de inicio de sesión
  And ve un mensaje claro indicando que las credenciales no son correctas
  And no se inicia ninguna sesión

#### Scenario: Campos vacíos al intentar ingresar
  Given que una persona está en la pantalla de inicio de sesión
  When intenta confirmar el ingreso sin completar usuario o contraseña
  Then no se envía el intento de ingreso
  And ve un aviso indicando que ambos campos son obligatorios

#### Scenario: Servicio del restaurante no disponible
  Given que una persona está en la pantalla de inicio de sesión
  When confirma el ingreso pero el servicio del restaurante no responde o no hay conexión
  Then permanece en la pantalla de inicio de sesión
  And ve un mensaje indicando que no fue posible conectar e invitándola a reintentar
  And no se inicia ninguna sesión

### Feature: Estructura de navegación y roles

#### Scenario: Barra superior con datos de la persona
  Given que una persona ha iniciado sesión
  When se muestra cualquier herramienta del espacio de trabajo
  Then la barra superior presenta su nombre y su rol
  And ofrece siempre un botón para cerrar sesión

#### Scenario: Mesero sin acceso a otras herramientas
  Given que un mesero ha iniciado sesión
  When intenta acceder a la cola de cocina o a las reservaciones
  Then el acceso es denegado o no se le ofrece esa opción de navegación
  And se mantiene dentro de la herramienta de comandas

#### Scenario: Cocina sin acceso a otras herramientas
  Given que una persona de cocina ha iniciado sesión
  When intenta acceder a comandas o a reservaciones
  Then el acceso es denegado o no se le ofrece esa opción de navegación
  And se mantiene dentro de la cola de cocina

#### Scenario: Gerente navega entre las tres herramientas
  Given que un gerente ha iniciado sesión y está en el panel general
  When selecciona una de las herramientas disponibles (comandas, cocina o reservaciones)
  Then se muestra la herramienta seleccionada
  And puede regresar al panel general o cambiar a otra herramienta en cualquier momento

### Feature: Persistencia de sesión

#### Scenario: Recarga con sesión vigente
  Given que una persona tiene una sesión iniciada y vigente
  When recarga o vuelve a abrir la aplicación
  Then no se le solicita ingresar de nuevo
  And es llevada a la vista que corresponde a su rol

#### Scenario: Apertura sin sesión previa
  Given que una persona abre la aplicación sin una sesión iniciada
  When carga la aplicación
  Then se le presenta la pantalla de inicio de sesión

### Feature: Cierre de sesión

#### Scenario: Cierre de sesión voluntario
  Given que una persona ha iniciado sesión
  When pulsa el botón de cerrar sesión
  Then su sesión se elimina por completo
  And es llevada a la pantalla de inicio de sesión
  And al volver a abrir la aplicación se le solicita ingresar de nuevo

### Feature: Sesión expirada o inválida

#### Scenario: Sesión expirada durante el uso
  Given que una persona está usando una herramienta del espacio de trabajo
  When su sesión deja de ser válida y una acción es rechazada por falta de autorización
  Then la sesión se elimina
  And es llevada a la pantalla de inicio de sesión
  And ve un aviso indicando que su sesión expiró y debe ingresar de nuevo

### Feature: Integración de las herramientas operativas

#### Scenario: Las herramientas operan con la sesión del espacio de trabajo
  Given que una persona con el rol adecuado ha iniciado sesión
  When utiliza una de las herramientas operativas (comandas, cocina o reservaciones)
  Then la herramienta consulta y modifica la información del restaurante usando la sesión iniciada
  And no depende de ningún mecanismo de acceso del sitio público

#### Scenario: Una herramienta detecta sesión inválida
  Given que una persona está dentro de una herramienta operativa
  When la herramienta realiza una acción y el servicio la rechaza por falta de autorización
  Then se aplica el comportamiento de sesión expirada (cierre de sesión y regreso al inicio)

## Criterios de Aceptación
- [ ] Un mesero que ingresa correctamente llega directamente a la herramienta de comandas sin pasos intermedios.
- [ ] Una persona de cocina que ingresa correctamente llega directamente a la cola de cocina.
- [ ] Un gerente o administrador que ingresa correctamente llega a un panel desde el cual puede acceder a las tres herramientas.
- [ ] Ningún rol puede acceder a herramientas que no le corresponden según las reglas definidas.
- [ ] Tras recargar la aplicación con una sesión vigente, no se solicita ingresar de nuevo.
- [ ] Al cerrar sesión, la información de la sesión se elimina y la siguiente apertura solicita ingreso.
- [ ] Cuando la sesión expira durante el uso, la persona es llevada a la pantalla de inicio con un aviso.
- [ ] Un intento de ingreso con credenciales inválidas muestra un mensaje claro y no inicia sesión.
- [ ] La aplicación puede apuntarse al entorno local o al de producción sin cambiar su comportamiento funcional.

## Restricciones de Negocio
- El acceso al espacio de trabajo está limitado al personal del restaurante con credenciales válidas.
- Cada rol ve únicamente las herramientas asociadas a su función.
- El espacio de trabajo es independiente del sitio público del restaurante y no comparte con él la experiencia ni el acceso.
- El mapa de zonas pertenece a la página pública y queda excluido de este espacio.

## Decisiones Tomadas (preguntas resueltas)
- **Roles**: Solo los cuatro definidos (mesero, cocina, gerente, administrator). No hay cajero ni anfitrión en esta versión.
- **Panel del gerente**: Muestra acceso directo a las tres herramientas; sin métricas ni resúmenes por ahora.
- **Vigencia de sesión**: El JWT de WP caduca en 1 hora (configuración por defecto del plugin JWT Auth). No se implementa refresh automático — al expirar se redirige al login.
- **Convertir reservación en comanda**: Sí disponible en ReservasApp (el endpoint ya existe en la API).
- **Rol sin permisos operativos**: Se muestra pantalla de "Acceso denegado — tu cuenta no tiene permisos operativos" con opción de cerrar sesión.
- **Última herramienta del gerente**: Se recuerda en `localStorage` para mejorar UX al regresar.
