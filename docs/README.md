# Documentacion del Proyecto Rustica

Esta carpeta contiene la documentacion del sistema. 

El documento principal es la propuesta comercial y tecnica para clientes: **`propuesta_sistema_rustica.pdf`**.

## Generar el documento PDF

Para compilar o regenerar el archivo PDF, ejecuta los siguientes comandos en tu terminal desde el directorio raiz del proyecto:

```bash
# 1. Instalar dependencias (incluye pdfkit)
npm install

# 2. Generar el documento PDF
node scripts/generate-pdf.js
```

El script generara el archivo PDF en esta misma carpeta (`docs/propuesta_sistema_rustica.pdf`).

## Contenido de la Propuesta

El documento PDF abarca los siguientes puntos:

1. **Resumen Ejecutivo**: Planteamiento del problema operativo y propuesta de solucion digital integrada con tres modulos.
2. **Modulo Publico (Landing Page)**: Diseno, secciones y funciones clave para comensales (reserva de mesa, galeria dinamica, eventos).
3. **Vista de Diseno: Landing Page**: Mockup del sitio publico con notas de diseno.
4. **Modulo Operacional (Dashboard)**: Roles del personal (Meseros, Cocina, Gerente), paginas React, seguridad JWT.
5. **Vista de Diseno: Dashboard**: Mockup del panel del gerente con estado de mesas, cola de cocina y reservas.
6. **Arquitectura del Backend**: Plugin WordPress "Rustica System", estructura de clases PHP, funcionalidades principales.
7. **API REST - Endpoints**: 33 endpoints organizados por recurso (mesas, reservas, comandas, cocina, facturacion).
8. **Infraestructura y Despliegue**: Docker Compose, estructura de directorios, plugins de WordPress instalados.
9. **Testing y Calidad**: Tests unitarios (Vitest), tests del Dashboard (46+), tests E2E (Playwright).
10. **Especificacion Tecnica y Roadmap**: Ficha tecnica completa y fases de desarrollo (completadas y propuestas).
11. **Analisis de Mercado y Estrategia**: Posicionamiento competitivo vs SaaS LATAM, funcionalidades criticas pendientes, estrategia de venta.
