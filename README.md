# Tulio Store

Aplicación React + Vite para registro de ventas COP, dashboard, historial y auditoría en Firebase. La interfaz usa Tailwind CSS, Framer Motion y Sonner con tema obsidiana, platino y azul cobalto.

## Desarrollo

```sh
npm install
npm run dev
```

## Configuración de Firebase

La aplicación se conecta al proyecto `tulio-store-contabilidad` desde [src/config/firebase.js](./src/config/firebase.js). La configuración web de Firebase identifica el proyecto; no sustituye las reglas de seguridad de Firestore.

1. Habilita **Email/Password** en Firebase Authentication y crea manualmente el único usuario `admin@tuliostore.local`.
2. No habilites registro de usuarios desde la aplicación. La clave se administra desde Firebase Authentication y no se almacena en React.
3. Publica [firestore.rules](./firestore.rules) en Firebase Console. Las reglas restringen los datos al usuario técnico, impiden el borrado de ventas y el cambio o borrado de auditoría.
4. Crea la base de datos Cloud Firestore antes de iniciar la app.

Las ventas se escriben como pesos enteros. Cada creación, edición o anulación hace una escritura atómica (`writeBatch`) del documento de venta y su evento de auditoría. Los registros de venta se anulan lógicamente y no se borran desde el cliente.

## Límites operativos de seguridad

Las reglas de Firestore bloquean la actualización y eliminación de auditorías, pero al permitir su creación desde el cliente no pueden demostrar por sí solas que el evento fue generado por un proceso privilegiado. Para auditoría inviolable ante un cliente autenticado comprometido, hay que mover esas escrituras a Cloud Functions/Cloud Run con Admin SDK y negar `create` en `/auditoria` desde las reglas; ese backend no está incluido en esta aplicación cliente.

También se debe configurar un respaldo periódico de Firestore desde la infraestructura del proyecto y probar el procedimiento de recuperación antes de producción. La disponibilidad de exportaciones programadas y Cloud Functions depende del plan y la configuración de facturación de Firebase.
