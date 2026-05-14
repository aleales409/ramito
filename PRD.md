# PRD: Ramito Fut Show - Plataforma de Gestión de Canchas

## 1. Visión General del Producto
**Ramito Fut Show** es una aplicación móvil-first de alto rendimiento diseñada para la reserva y gestión de canchas de fútbol. El producto combina una estética futurista "Technical/Brutalist" con una funcionalidad robusta tanto para jugadores casuales como para administradores (Elite/VIP).

## 2. Identidad y Diseño (Look & Feel)
- **Mood:** Técnico, Profesional, Agresivo (Deportivo), Moderno.
- **Paleta de Colores:**
  - Fondo: `#121414` (Deep Black)
  - Primario: `#FF9100` (Orange Vibe)
  - Éxito/Registro: `#4be277` (Electric Green)
  - Texto/Detalles: `#bccbb9` (Slate Green)
- **Tipografía:** Uso intensivo de Uppercase (Mayúsculas), Italic (Cursiva), y fuentes "Black" (Peso extra negrita). Tracking (espaciado) ancho para labels técnicos.
- **Micro-interacciones:** Animaciones fluidas con `motion/react`, transiciones entre rutas y feedback visual inmediato en botones.

## 3. Arquitectura del Usuario y Administración

### 3.1 Roles de Usuario
1.  **Visitante (No registrado):** Puede ver la pantalla de inicio y explorar la disponibilidad de canchas, pero requiere login para confirmar reservas o ver perfiles.
2.  **Jugador Registrado:** Acceso completo a reservas, historial personal, carga de comprobantes de pago y configuración de perfil con PIN.
3.  **Administrador VIP:** Supervisión de reservas, validación de pagos y gestión de licencias.
4.  **Administrador Elite:** Acceso total incluyendo configuración de llaves maestras, estados del sistema y métricas avanzadas.

## 4. Flujos Principales y Funcionalidades

### 4.1 Pantalla de Inicio (Home)
- **Estado No Logueado:** Presenta dos opciones claras: "Nuevo Jugador" (Registro) y "Ya soy Jugador" (Login).
- **Estado Logueado:** Acceso directo mediante el botón "Reservar Cancha" (Botón VIP con gradiente y efecto de pulso).
- **Acceso Administrativo:** Sección oculta/discreta para ingreso de Administradores mediante Nombre y Llave Maestra (PIN o Patrón).

### 4.2 Proceso de Reserva (Booking Flow)
1.  **Selección de Cancha (`BookingView`):**
    - Visualización de mini-tarjetas de canchas (Sede Norte, Sede Sur, etc.).
    - **Imagen Dinámica:** Al seleccionar una cancha, aparece un banner con la fotografía real del terreno.
2.  **Selección de Horario:** Grilla de slots con estados (Disponible/Ocupado) y precios dinámicos.
3.  **Confirmación (`ConfirmationView`):** Resumen técnico del pedido y selección de método de pago (Transferencia o Efectivo).
4.  **Éxito (`SuccessView`):** Pantalla de celebración post-reserva con detalles del turno.

### 4.3 Gestión de Reservas (`MyBookingsView`)
- **Filtros por Estado:** Activas e Historial.
- **Carga de Comprobantes:** Los jugadores pueden subir fotos de sus transferencias directamente a la reserva.
- **Vista Administrador:**
    - Indicador visual (punto rojo) en la campana si hay pagos pendientes.
    - Modal de previsualización de comprobantes con opciones de "Aprobar" o "Rechazar".

### 4.4 Perfil y Seguridad (`ProfileView`)
- **Seguridad Personalizada:**
    - Los usuarios gestionan un **Pin de 6 dígitos** o un **Patrón de dibujo** para proteger su cuenta.
    - Se eliminó el uso de teléfono como identificador público por privacidad.
- **Zona Restringida:** Los usuarios no logueados ven una pantalla de "Bloqueo" con invitación al registro si intentan acceder al perfil.
- **Gestión de Licencias:** Solo para administradores, permite activar/desactivar licencias App y Web.

## 5. Componentes Globales
- **Campana de Notificaciones:** Ubicada exclusivamente dentro de las vistas de Perfil y Reservas (no en el Home). Centraliza alertas de aprobación de pagos y recordatorios.
- **AppBar Superior:** Branding minimalista con avatar del usuario y estado del complejo (Abierto/Cerrado).
- **Barra de Navegación Inferior:** Acceso rápido a Inicio, Reservas y Perfil.

## 6. Detalles Técnicos
- **Frontend Stack:** React 18, Vite, Tailwind CSS.
- **Estado Global:** AppContext para sincronización de notificaciones y reservas en tiempo real.
- **Persistencia:** LocalStorage para sesión de usuario, roles y preferencias de seguridad.
- **Seguridad:**
    - Llaves Maestras diferenciadas para Elite y VIP.
    - Validación de identidad antes de acciones críticas.

## 7. Reglas de Negocio Específicas
- Un usuario no puede reservar si no ha iniciado sesión.
- Las reservas por transferencia quedan en estado `pending_payment` hasta que el administrador verifique el comprobante.
- El sistema puede ser "Bloqueado" globalmente por un Administrador Elite en caso de mantenimiento.
