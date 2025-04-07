# Sistema de Gestión de Inventario y Ventas

## Descripción
Sistema completo de gestión de inventario y ventas para restaurantes y negocios de alimentos, con módulos para inventario, clientes, proveedores, ventas, punto de venta (POS), y reportes.

## Características
- Dashboard con métricas clave y análisis de ventas
- Gestión completa de inventario con seguimiento de stock
- Punto de Venta (POS) para transacciones en tienda física
- Gestión de clientes (CRM)
- Gestión de proveedores
- Informes y análisis de ventas
- Gestión de categorías para productos, proveedores y clientes

## Tecnologías
- React.js con TypeScript
- Shadcn/UI para componentes
- Tailwind CSS para estilos
- Express.js para el backend
- Drizzle ORM para manejo de datos

## Despliegue en Netlify

Para desplegar en Netlify, sigue estos pasos:

1. Crea una cuenta en Netlify si aún no tienes una.
2. Sube tu proyecto a un repositorio de GitHub.
3. En Netlify, haz clic en "New site from Git" y selecciona tu repositorio.
4. Configura las opciones de construcción de la siguiente manera:
   - Build command: `npm run build`
   - Publish directory: `dist/public`
5. Haz clic en "Deploy site".

Los ajustes necesarios ya están configurados en el archivo `netlify.toml`.
