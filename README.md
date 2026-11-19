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

## Sincronizar varios dispositivos (tienda + tu teléfono) en tiempo real
Usa Firebase (gratis para este uso). Se hace una sola vez:
1. Entra a https://console.firebase.google.com → Crear proyecto.
2. Build → Firestore Database → Crear base de datos (modo producción, región cercana).
3. Build → Authentication → Comenzar → Correo/contraseña → Habilitar. En la pestaña Usuarios agrega una cuenta (por ejemplo la tuya) y, si quieres, otra para la tienda. En Settings → User actions desactiva "Enable create (sign-up)".
4. Firestore → Reglas → pega esto, cambia los correos por los tuyos y Publicar:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /negocios/{code}/{document=**} {
      allow read, write: if request.auth != null
        && request.auth.token.email in ['tu@correo.com','tienda@correo.com'];
    }
  }
}
```
5. Configuración del proyecto (engranaje) → Tus apps → Web (</>) → registra la app y copia el bloque `firebaseConfig`.
6. En la app, en CADA dispositivo: Ajustes → Sincronización entre dispositivos. Ponle nombre al dispositivo (Tienda, Gregory) y una serie de facturas distinta (A, B…). Pega la configuración, deja el código del negocio igual en todos, escribe el correo y contraseña y toca Conectar.
7. En el primer dispositivo, si ya tenías ventas guardadas, toca "Subir los datos de este dispositivo" una sola vez.

- Cada venta, producto y reparación aparece en los demás dispositivos al instante, y el inventario se descuenta en todos.
- Cuando entra una venta de otro dispositivo, te llega aviso en la campana mientras tienes la app abierta.
- Sin internet todo sigue funcionando y se sincroniza al volver la conexión.
