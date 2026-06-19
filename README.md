# Alejandro Vega

Sistema de ventas, stock, caja y reparaciones en Next.js App Router para Alejandro Vega.

## Incluye

- Login por cookie usando la tabla `usuarios`
- Dashboard con ventas, egresos, costo, ganancia y stock
- Registro de ventas con carrito y pago dividido
- Gestion de productos y stock
- Caja por medios de pago
- Egresos
- Reparaciones con orden, estados, comprobante y firma
- Mercaderia fallada
- Reportes de ultimas ventas, productos mas vendidos y productos por agotarse
- Exportacion a Excel

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/alejandro_vega
DB_SCHEMA=alejandro_vega
SESSION_SECRET=change-this-secret
NEXT_PUBLIC_APP_NAME=Alejandro Vega
```

## Base de datos

El archivo `db/schema.sql` contiene la estructura esperada.

## Desarrollo

```bash
npm install
npm run dev
```

## Produccion

```bash
npm run build
npm run start
```

## Deploy En Railway

1. Subir este repo a GitHub.
2. Crear un proyecto nuevo en Railway y conectar el repositorio.
3. Agregar un servicio PostgreSQL dentro del proyecto.
4. Configurar variables de entorno en el servicio web:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_SCHEMA=alejandro_vega
SESSION_SECRET=una-clave-larga-y-segura
NEXT_PUBLIC_APP_NAME=Alejandro Vega
```

5. Cargar la estructura de base usando el SQL del schema `alejandro_vega` o restaurar una base existente.
6. Deployar. Railway va a usar `railway.toml` para correr `npm run start`.

## Schema En La Misma Base

Este repo esta preparado para usar las tablas dentro del schema `alejandro_vega`.

En Railway usar:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_SCHEMA=alejandro_vega
NEXT_PUBLIC_APP_NAME=Alejandro Vega
SESSION_SECRET=otra-clave-larga-y-segura
```

El sistema consulta tablas sin prefijo, pero PostgreSQL usa `DB_SCHEMA` como `search_path`. Asi puede compartir la misma base con otros clientes sin mezclar ventas, stock, reparaciones ni caja.

## Control De Abono

El acceso se valida contra `public.sistemas_mensuales` usando `DB_SCHEMA=alejandro_vega`.
Cuando faltan 5 dias o menos para vencer se muestra un aviso. El dia del vencimiento, o si el sistema esta suspendido, se bloquea el acceso hasta registrar el pago desde el panel central.

## Logo

El logo principal esta en `public/logo.png`.
