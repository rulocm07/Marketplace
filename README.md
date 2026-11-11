# Marketplace — Proyecto web (frontend)

## 1. Abrir el proyecto

1. Descomprime el archivo `Marketplace_final.zip`.
2. Abre la carpeta `Marketplace` en Visual Studio Code.
3. Dentro de `frontend`, abre `index.html` con **Live Server** (clic derecho → *Open with Live Server*).
4. Navega a las secciones desde la barra superior. Todas las páginas forman parte del **mismo sitio web**, aunque haya varios archivos HTML.

## 2. Dónde colocar tus fotografías

Las imágenes que muestran las tarjetas son **archivos locales**. Las tarjetas de inicio, catálogo, favoritos, detalle y carrito usan el mismo dato del producto. Puedes cambiar la fotografía sin editar la tarjeta.

### Fotografías de productos

Reemplaza los siguientes JPG por imágenes tuyas, **conservando exactamente el nombre y la extensión**:

| Producto | Archivo que debes reemplazar |
|---|---|
| Tenis casuales blancos | `frontend/img/productos/tenis.jpg` |
| Smartwatch | `frontend/img/productos/reloj.jpg` |
| Bolso de mano | `frontend/img/productos/bolso.jpg` |
| Sudadera | `frontend/img/productos/sudadera.jpg` |
| Top de ropa | `frontend/img/productos/top.jpg` |
| Audífonos inalámbricos | `frontend/img/productos/audifonos.jpg` |
| Laptop | `frontend/img/productos/laptop.jpg` |
| Lámpara de mesa | `frontend/img/productos/lampara.jpg` |
| Kit de cuidado facial | `frontend/img/productos/crema.jpg` |
| Oso de peluche | `frontend/img/productos/peluche.jpg` |
| Kit de ejercicio | `frontend/img/productos/pesas.jpg` |
| Bocina portátil | `frontend/img/productos/audiospeaker.jpg` |

Las primeras cuatro fotografías se recortaron de la referencia de Figma que compartiste. Las demás son **marcadores de imagen** creados para que puedas sustituirlos. También puedes usar imágenes propias PNG o WebP: en ese caso, cambia la ruta del producto en `frontend/js/main.js` (o edítala desde el panel administrativo si ya existe en el almacenamiento local).

**Consejos:** usa imágenes propias o con licencia que permita su uso. Preferiblemente todas con proporciones similares (por ejemplo, 800 × 510 px). El CSS utiliza `object-fit: contain` para evitar deformaciones.

### Imagen del banner principal

Sustituye `frontend/img/banner.jpg` por tu foto preferida, manteniendo ese nombre. Inicialmente incluye un recorte de la imagen de referencia que compartiste. El fondo azul se configura en `.hero-banner` dentro de `frontend/css/styles.css`.

### Productos nuevos desde el panel administrador

En **Registrar elemento** se agregó el campo **Ruta de imagen**. Copia un archivo JPG/PNG/WebP dentro de `frontend/img/productos/` y escribe una ruta como:

```text
img/productos/mochila.jpg
```

Si dejas la ruta vacía o no existe el archivo, aparecerá un marcador neutro (`img/imagen-no-disponible.svg`). **Todavía no hay carga al servidor:** esta ruta debe existir físicamente en tu carpeta del proyecto. Cuando tengamos backend podremos integrar una subida real de archivos.

## 3. Archivos del proyecto

```text
Marketplace/
├── README.md                         Guía técnica del proyecto
├── frontend/
│   ├── index.html                    Página principal
│   ├── productos.html                Catálogo con filtros internos
│   ├── detalle.html                  Detalle de producto
│   ├── favoritos.html                Lista de favoritos
│   ├── carrito.html                  Carrito y resumen
│   ├── perfil.html                   Perfil de usuario
│   ├── admin.html                    Panel de administración
│   ├── preguntas.html                Preguntas frecuentes (FAQ)
│   ├── css/
│   │   └── styles.css                Estilos compartidos, formateados
│   ├── js/
│   │   ├── main.js                   Datos, imágenes, acceso, navegación
│   │   ├── productos.js              Inicio, catálogo, detalle, favoritos
│   │   ├── carrito.js                Carrito
│   │   ├── perfil.js                 Perfil de usuario
│   │   └── admin.js                  Administración
│   └── img/
│       ├── banner.jpg                Imagen del banner
│       ├── imagen-no-disponible.svg  Imagen de respaldo
│       └── productos/                Los 12 JPG reemplazables

```

## 4. Funcionalidades disponibles

- Navegación entre páginas del mismo sitio, incluida la sección independiente de preguntas frecuentes.
- Menú móvil (visible solo en pantallas estrechas).
- Login y registro emergentes; acceso usuario y administrador.
- Perfil de usuario y perfil administrativo editables.
- Panel de productos: alta, edición, eliminación y restauración del catálogo inicial.
- Búsqueda, categorías, filtro de precio y ordenación en el catálogo.
- Favoritos, detalle de producto y carrito con cantidades y subtotal.
- Visualización de fotografías y marcadores locales, con respaldo si faltan archivos.

## 5. Limitaciones actuales — importante antes de publicar

**Este es un frontend de prueba. No lo publiques como una tienda que acepta pagos o cuentas reales.** Por petición del equipo, los avisos técnicos no se muestran en las pantallas y están documentados aquí.

- **No hay base de datos ni servidor:** los datos del catálogo, carrito, favoritos y perfiles se guardan en `localStorage` del navegador; pueden desaparecer si borras sus datos.
- **No hay autenticación ni permisos reales:** el formulario de acceso acepta un correo válido y una contraseña de al menos 6 caracteres; **no verifica la contraseña**. El selector de administrador no protege ninguna información. **No uses credenciales reales ni datos personales sensibles.**
- **No se guarda la contraseña** del login ni del registro, aunque se pida para probar el flujo visual.
- **No hay procesamiento de pagos, creación de pedidos, cobros ni envíos reales.** Al intentar continuar la compra se indica que esa función no está disponible.
- **No hay subida de imágenes:** el administrador escribe la ruta local de una imagen ya colocada en `frontend/img/`.
- La comprobación de roles se realiza solo en JavaScript y no sirve como seguridad.

### Cómo probar el acceso y el panel

1. Abre **Mi cuenta → Iniciar sesión**. Escribe un correo de prueba y una contraseña cualquiera de 6 o más caracteres.
2. Para el panel, usa **Mi cuenta → Acceso administrador** y el mismo tipo de credenciales de prueba.
3. Usa **Registrar elemento** para agregar un producto y el catálogo para verificarlo.
4. Si quieres volver a los 12 artículos iniciales, usa **Gestionar productos → Restaurar catálogo inicial**.

### Cómo limpiar el almacenamiento de prueba

Desde DevTools del navegador → *Application* → *Local Storage*, puedes eliminar las claves que empiezan por `marketplace_demo_` para reiniciar sesión, carrito y preferencias. Se conservaron estos nombres de claves respecto de la versión anterior para no borrar automáticamente los datos que ya tenías.

## 6. Cambios de diseño solicitados

1. Eliminado el botón **Menú** en escritorio; se conserva en móvil.
2. Eliminado el enlace **Filtros** del encabezado (siguen los filtros internos útiles del catálogo).
3. Banner con **fondo azul** y una fotografía sustituible.
4. Eliminado el ícono decorativo a la izquierda de **Marketplace**.
5. Categorías destacadas como botones compactos de texto, sin emojis.
6. Fotografías locales en las tarjetas de productos, detalle y carrito.
7. Rutas de imágenes preparadas para cambiar los JPG sin modificar el código.
8. Retirados los avisos de demostración, producto de muestra, compra no real y notas de backend de las páginas.
9. Quitados los emojis en la tabla de administración y en **Gestionar productos**.
10. Archivos HTML, CSS y JavaScript reordenados, indentados y comentados.
11. Creada la página `frontend/preguntas.html` con 11 preguntas desplegables, agrupadas por tema y accesibles desde el menú superior.

## 7. Limpieza de la entrega

Se omitió la carpeta `backend/` porque solo tenía el archivo vacío `.gitkeep` y no ejecutaba ningún servicio. También se omitió `Marketplace-GitHub/` porque era una segunda copia con metadatos Git, no necesaria para ejecutar el sitio. Esto **no elimina ni modifica el repositorio remoto de GitHub**. Para continuar subiendo cambios, utiliza tu carpeta local que conserva `.git`, o copia estos archivos a tu repositorio clonado antes de hacer `git add`, `commit` y `push`.

## 8. Posible evolución futura

Crear API y base de datos para cuentas, roles, catálogo, pedidos y almacenamiento de archivos. Conectar el frontend con `fetch`, validar datos y permisos desde el servidor, guardar las contraseñas mediante un mecanismo de autenticación seguro y añadir un servicio de pago solo si el proyecto lo requiere.
