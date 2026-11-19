# Taller Pro

App web instalable para taller de reparación de celulares y venta de accesorios: ventas con factura, inventario con descuento automático, reparaciones, vista previa e impresión de tickets térmicos, logo del negocio y avisos.

## Publicar con GitHub Pages
1. Sube TODOS los archivos de esta carpeta (sin el zip) a un repositorio nuevo: index.html, manifest.webmanifest, sw.js y los tres iconos .png.
2. Settings → Pages → Source: Deploy from a branch → rama main, carpeta / (root) → Save.
3. Abre `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/` (la dirección debe empezar con https).

## Instalar
- Android: Chrome → menú ⋮ → Instalar app.
- iPhone: Safari → Compartir → Añadir a pantalla de inicio.
- PC: Chrome o Edge → icono de instalar en la barra de direcciones.

## Imprimir
Vender o abrir una factura → vista previa → Imprimir. Se abre el diálogo de impresión del dispositivo: elige la impresora térmica (papel 58 o 80 mm en Ajustes).

## Importante
- Los datos se guardan en el navegador de cada dispositivo. No se sincronizan entre teléfono y PC. Usa Ajustes → Descargar respaldo con frecuencia.

## Sin internet
Después de abrirla una vez con internet, la app queda guardada en el dispositivo y funciona sin conexión: ventas, inventario, reparaciones e impresión se guardan en el mismo equipo. Instálala (Android/iPhone/PC) para que el sistema no borre sus datos. Para pasar datos a otro equipo: Ajustes → Descargar respaldo, y en el otro equipo Ajustes → Restaurar.

## Actualizaciones
Al abrir la app con internet, busca sola la versión nueva y la aplica (se recarga una vez, sin perder datos). Sin internet usa la copia guardada. Para actualizar el sitio: reemplaza los archivos en GitHub; en Ajustes también hay "Buscar actualización".

## Impresión directa en impresora térmica
Ajustes → Impresora térmica → Conectar por Bluetooth, elige tu impresora y toca Imprimir prueba. Después, en cada factura aparece "Imprimir directo". Opción "Imprimir solo al cobrar" para que salga el ticket al terminar cada venta.
- Android y PC: Chrome o Edge, impresoras Bluetooth LE. En PC también por USB/serie.
- iPhone: Safari no permite Bluetooth; usa el navegador Bluefy.
- Impresoras de Bluetooth clásico (muchas de 58 mm): en Android instala RawBT y elige RawBT en "Cómo imprimir directo".

## Sincronizar varios dispositivos con roles (administrador y empleados)
Usa Firebase (gratis para este uso). Se hace una sola vez:
1. https://console.firebase.google.com → Crear proyecto.
2. Build → Firestore Database → Crear base de datos (modo producción).
3. Build → Authentication → Comenzar → Correo/contraseña → Habilitar. Deja habilitada la creación de cuentas: la app la usa para crear empleados y las reglas del paso 4 impiden que alguien sin permiso entre.
4. Firestore → Reglas → borra todo, pega esto y Publicar:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /negocios/{code} {
      function staff() { return request.auth != null
        && exists(/databases/$(database)/documents/negocios/$(code)/usuarios/$(request.auth.uid))
        && get(/databases/$(database)/documents/negocios/$(code)/usuarios/$(request.auth.uid)).data.activo == true; }
      function admin() { return staff()
        && get(/databases/$(database)/documents/negocios/$(code)/usuarios/$(request.auth.uid)).data.rol == 'admin'; }
      match /meta/owner {
        allow read: if request.auth != null;
        allow create: if request.auth != null && request.resource.data.uid == request.auth.uid
          && existsAfter(/databases/$(database)/documents/negocios/$(code)/usuarios/$(request.auth.uid));
      }
      match /usuarios/{uid} {
        allow read: if request.auth != null && (request.auth.uid == uid || admin());
        allow write: if admin();
        allow create: if request.auth != null && request.auth.uid == uid
          && request.resource.data.rol == 'admin' && request.resource.data.activo == true
          && !exists(/databases/$(database)/documents/negocios/$(code)/meta/owner)
          && existsAfter(/databases/$(database)/documents/negocios/$(code)/meta/owner);
      }
      match /config/{d} { allow read: if staff(); allow write: if admin(); }
      match /products/{id} {
        allow read: if staff();
        allow create, delete: if admin();
        allow update: if admin() || (staff() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['stock']));
      }
      match /sales/{id} { allow read, create: if staff(); allow update, delete: if admin(); }
      match /repairs/{id} { allow read, create, update: if staff(); allow delete: if admin(); }
      match /clientes/{id} { allow read, create, update: if staff(); allow delete: if admin(); }
      match /moves/{id} { allow read, create: if staff(); allow update, delete: if admin(); }
    }
  }
}
```
5. Authentication → Usuarios → Agregar usuario: crea SOLO tu cuenta de administrador (tu correo y contraseña).
6. Configuración del proyecto (engranaje) → Tus apps → Web (</>) → registra la app y copia el bloque `firebaseConfig`.
7. En tu teléfono: Ajustes → Sincronización entre dispositivos → nombre del dispositivo y una serie de facturas (por ejemplo B) → pega la configuración, escribe tu correo y contraseña → Conectar. La app te pide tu nombre y te convierte en Administrador (solo se puede hacer una vez).
8. Menú Equipo → crea las cuentas de tus empleados (nombre, correo, contraseña inicial). En el dispositivo de la tienda: Ajustes → misma configuración y código del negocio, serie distinta (por ejemplo A) → inicia sesión con la cuenta del empleado.
9. Si ya tenías ventas guardadas en un dispositivo, en el primero (administrador) toca "Subir los datos de este dispositivo", una sola vez.

### Qué puede hacer cada rol
- Administrador: todo. Crea y desactiva empleados, ve ganancias, reportes y costos, administra inventario y ajustes.
- Empleado: registra ventas, reparaciones y clientes, consulta el inventario, descuenta repuestos e imprime facturas. No ve ganancias, ni costos, ni usuarios, ni ajustes del negocio, y no puede anular facturas.

### Importante
- Un empleado desactivado pierde el acceso de inmediato en la nube; la cuenta de correo sigue existiendo pero no puede leer ni escribir nada.
- Los empleados no ven los costos en pantalla; los costos viajan dentro de los datos de cada producto, así que alguien con conocimientos técnicos podría leerlos con las herramientas del navegador.
- Cada venta, producto y reparación aparece en todos los dispositivos al instante. Sin internet todo sigue funcionando y se sincroniza al volver la conexión. Los avisos llegan con la app abierta.
