# Sistema Seguro de Validación de Suscripción - Autosol Plan de Ahorro

Este es un proyecto completo y altamente seguro diseñado para **Autosol (Concesionario Oficial Volkswagen)**, orientado a la validación de suscripciones de Planes de Ahorro mediante un sistema de scoring automático en tiempo real. 

El sistema utiliza una arquitectura modular de bajo costo y alta seguridad que mantiene la base de datos de Google Sheets de forma **100% privada** mediante capas intermedias seguras y encriptación de DNI mediante hashing con sal secreta.

---

## 🏗️ Estructura del Flujo de Datos

```text
Cliente (WhatsApp Link)
       ↓  (Abre link único: ?t=TOKEN_UNICO)
Frontend (Netlify - index.html / app.js / styles.css)
       ↓  (Petición POST local o remota segura)
Netlify Functions (validarCliente.js / enviarEncuesta.js)
       ↓  (Añade BACKEND_SECRET, oculta IPs e identidades)
Google Apps Script (Web App - Code.gs)
       ↓  (Valida secretos, compara DNI_HASH, calcula Scoring)
Google Sheets (Base_Clientes / Respuestas_Scoring / Log_Seguridad)
```

---

## 🛠️ Guía Paso a Paso de Instalación y Configuración

Siga detenidamente estos 15 pasos para poner en marcha el sistema real y seguro:

### Parte 1: Preparación de Google Sheets

1. **Crear una nueva hoja de cálculo** en su cuenta corporativa de Google Drive.
2. **Crear las 5 pestañas obligatorias** con los siguientes nombres exactos:
   - `Base_Clientes`
   - `Respuestas_Scoring`
   - `Preguntas`
   - `Log_Seguridad`
   - `Dashboard`
3. *(Opcional)* No se preocupe por escribir todos los encabezados manualmente. La función `setupInicial()` del script los creará de forma automatizada con los formatos y tipografías correctas.
4. **Obtener el ID del Sheet**: Copie el identificador de la URL de su hoja de cálculo. Se encuentra entre `/d/` y `/edit`:
   ```text
   https://docs.google.com/spreadsheets/d/ESTE_ID_DE_AQUI/edit#gid=0
   ```

### Parte 2: Configuración del Google Apps Script

5. En la hoja de Google Sheets, vaya al menú superior y seleccione **Extensiones** > **Apps Script**.
6. Elimine cualquier código existente en el editor de archivos y pegue el contenido completo del archivo `Code.gs` provisto en este proyecto. Guarde el archivo con el icono de disquete.
7. **Configurar las Script Properties (Claves de Seguridad)**:
   - En el menú lateral izquierdo de Apps Script, haga clic en el engranaje ⚙️ (**Configuración del proyecto**).
   - Desplácese hasta abajo hasta la sección **Propiedades del documento** (Script Properties).
   - Añada estas 4 propiedades obligatorias:
     - `SHEET_ID`: Pegue el ID obtenido en el **Paso 4**.
     - `BACKEND_SECRET`: Defina una contraseña alfanumérica fuerte de su elección (ej: `Autosol_Secret_2026_Key_789!`).
     - `DNI_SALT`: Defina una sal de encriptación aleatoria (ej: `sal_secreta_autosol_9911`). *Esta clave sirve para encriptar los DNI para que nadie pueda leerlos en texto plano*.
     - `NETLIFY_BASE_URL`: Ingrese la URL de su sitio en Netlify (ej: `https://autosol-validacion.netlify.app/`). *Puede actualizar esta propiedad más adelante cuando cree el sitio en Netlify*.
8. **Ejecutar Configuración Inicial**:
   - Vuelva al editor de código (`<> Editor`).
   - En la barra de herramientas superior, seleccione la función `setupInicial` en el desplegable y presione el botón **Ejecutar**.
   - Conceda los permisos requeridos por Google (haga clic en *Configuración Avanzada* > *Ir a Proyecto (no seguro)* y apruebe). Esto creará los encabezados necesarios en cada hoja de cálculo.
9. **Publicar el Apps Script como Web App**:
   - Presione el botón **Implementar** (Deploy) en la esquina superior derecha > **Nueva implementación** (New deployment).
   - Haga clic en el engranaje de tipo de implementación y seleccione **Aplicación web** (Web app).
   - Complete la configuración obligatoria:
     - *Descripción*: `Backend Autosol Encuestas`
     - *Ejecutar como*: **Yo (su cuenta de Google)**
     - *Quién tiene acceso*: **Cualquier persona** (Who has access: Anyone) - *Esto es obligatorio para que Netlify Functions pueda invocarlo de manera segura*.
   - Presione **Implementar** y guarde la **URL de la aplicación web** generada (ej: `https://script.google.com/macros/s/AKfycb.../exec`).

---

### Parte 3: Configuración de Netlify y Variables de Entorno

10. **Crear Sitio en Netlify**:
    - Suba los archivos `index.html`, `styles.css`, `app.js` y la carpeta `netlify/` a su repositorio de GitHub o arrastre la carpeta del proyecto a Netlify.
11. **Configurar las Variables de Entorno en Netlify**:
    - Vaya a **Site Configuration** > **Environment variables** > **Add a variable**.
    - Registre estas 2 variables clave:
      - `APPS_SCRIPT_URL`: Pegue la URL de la Web App de Google Apps Script obtenida en el **Paso 9**.
      - `BACKEND_SECRET`: Pegue la contraseña idéntica definida en el **Paso 7**.
12. **Actualizar el Apps Script**:
    - Una vez asignada la URL de Netlify, asegúrese de que la propiedad `NETLIFY_BASE_URL` en las Script Properties del Apps Script coincida exactamente con la URL asignada por Netlify.

---

## 📋 Carga de Datos, Generación de Tokens y WhatsApp

### 10. Cómo cargar clientes en `Base_Clientes`
Para registrar clientes para que reciban la encuesta, simplemente complete los datos del cliente en una nueva fila en la pestaña `Base_Clientes`. Los campos mínimos requeridos son:
- `ID_CLIENTE` (ej: `C-1001`)
- `Nombre y Apellido` (ej: `Juan Pérez`)
- `Celular` (ej: `3874123456` sin el 0 ni el 15)
- `Modelo suscripto` (ej: `Polo Trendline 1.6`)
- `Nombre del Asesor` (ej: `Abigail Wierna`)
- `Monto 2da cuota aprox` (ej: `145000`)
- `Medio de pago previsto` (ej: `Débito Automático`)
- **DNI_HASH**: Para encriptar el DNI de forma segura, use la función `=generarHashDniParaCarga("32456789")` en la celda correspondiente al DNI_HASH del cliente. Esto calculará el hash seguro en tiempo real sin guardar el documento original en texto plano.

### 11. Cómo generar los tokens y enlaces individuales
Una vez cargados los clientes en la planilla `Base_Clientes`:
1. Vaya a su editor de **Apps Script**.
2. Seleccione la función `generarLinks` en el desplegable superior y haga clic en **Ejecutar**.
3. El script recorrerá todas las filas sin token, generará tokens únicos, compilará los links individuales de Netlify y los guardará en la columna `LINK_ENCUESTA`. El estado cambiará a `"Link generado"`.

### 12. Cómo compilar los enlaces prearmados para enviar por WhatsApp
1. En **Apps Script**, seleccione la función `generarMensajeWhatsApp` y presione **Ejecutar**.
2. El script compilará un enlace web de WhatsApp personalizado para cada cliente que cuente con link de encuesta y número celular. El enlace aparecerá en la columna `ENVIAR WPP`.
3. El operador de Autosol solo debe hacer clic en la celda de la columna `ENVIAR WPP` para abrir WhatsApp Web con el mensaje corporativo pre-cargado y enviárselo directamente al cliente por chat móvil.

---

## 🩺 Guía de Testeo Local y Producción

### Probar localmente en el entorno de desarrollo (AI Studio)
El entorno de AI Studio incluye un **Servidor de Simulación Integrado**:
- Al cargar la página principal en el navegador integrado, el sistema detecta si no se ha configurado la clave real de Google Sheets e inicia el **Modo Simulación**.
- Se desplegará un banner azul arriba con tokens de prueba:
  - `t=TOKEN123` (con DNI: `12345678`)
  - `t=TOKEN456` (con DNI: `87654321`)
- Puede simular respuestas completas y observar cómo el motor calcula el **Scoring de Validación** y previene envíos duplicados de forma in-memory.

### Resetear a un cliente para que vuelva a responder
Si por algún motivo el cliente cometió un error o necesita volver a responder la encuesta:
1. Vaya a la hoja `Base_Clientes`.
2. Busque la fila del cliente.
3. Borre el contenido de las siguientes columnas:
   - `ESTADO_ENCUESTA` (puede dejarlo vacío o `"Link generado"`)
   - `FECHA_RESPUESTA_WEB` (dejar vacío)
   - `RESULTADO_SCORING`
   - `MOTIVO_RESULTADO`
   - `REQUIERE_RECONTACTO`
   - `AREA_A_REVISAR`
   - `OBSERVACION_INTERNA`
4. Guarde los cambios en la planilla. El cliente podrá volver a abrir su enlace único e ingresar su DNI normalmente.

---

## 🔒 Recomendaciones Críticas de Seguridad

- ❌ **NUNCA** comparta públicamente el archivo de Google Sheets. Mantenga los accesos de uso compartidos exclusivamente a directivos de Autosol con autenticación en 2 pasos de Google.
- ❌ **NUNCA** publique el `SHEET_ID` ni el `BACKEND_SECRET` en archivos JavaScript del frontend como `app.js`. Estos datos solo deben existir en las propiedades privadas del script de Google y en las variables de entorno cifradas de Netlify.
- ❌ **NUNCA** guarde los DNI de los clientes en texto plano en la hoja de cálculo. Use siempre la función `=generarHashDniParaCarga()` para registrar el `DNI_HASH` de forma irreversible.
- 🔒 **Logs de Auditoría**: Revise de forma semanal la pestaña `Log_Seguridad`. En ella se registrarán de forma transparente todos los intentos fallidos de validación, detecciones de intrusos con contraseñas incorrectas o intentos de accesos repetidos.
- 🔒 **Rotación de Claves**: Si sospecha que una clave ha sido expuesta, cambie el valor de `BACKEND_SECRET` en las Script Properties de Google y en las variables de entorno de Netlify de inmediato. La comunicación se reestablecerá de forma segura al instante sin modificar una sola línea de código del frontend.
---

## ?? C�mo Subirlo a GitHub Sin Filtrar Datos

1. Verifique que el archivo `.env` **no** se suba. Este proyecto ya tiene `.gitignore` para ignorarlo.
2. Suba al repo solo el c�digo, por ejemplo:
   ```bash
   git init
   git branch -M main
   git remote add origin https://github.com/nelsoncalidad15-ops/encuestas-scoring.git
   git add .
   git commit -m "Base segura de encuestas scoring"
   git push -u origin main
   ```
3. Cargue los secretos reales �nicamente en Netlify:
   - `APPS_SCRIPT_URL`
   - `BACKEND_SECRET`
   - `SITE_ORIGIN`
4. Cargue en Apps Script las Script Properties privadas:
   - `SHEET_ID`
   - `BACKEND_SECRET`
   - `DNI_SALT`
   - `NETLIFY_BASE_URL`

### Qu� queda oculto y qu� no

- El **Google Sheet queda privado** y no se expone en el frontend.
- El **Apps Script URL puede ser p�blica**, pero sin `BACKEND_SECRET` correcto no deber�a procesar datos.
- El secreto real debe existir solo en:
  - Script Properties de Google Apps Script
  - Variables de entorno de Netlify
- Si alguna vez el `.env` tuvo valores reales, rote `BACKEND_SECRET` y `DNI_SALT` antes de publicar.
