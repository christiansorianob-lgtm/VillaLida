# Finca Villa Lida — Página Web Oficial
> Plántulas de Palma de Aceite · Calidad certificada con manejo nutricional de precisión

## 🏗 Estructura del Proyecto

```
PAGINA WEB/
├── FrontEnd/
│   ├── index.html                  ← Página principal (entrada Vercel)
│   ├── css/
│   │   └── styles.css              ← Estilos personalizados + Tailwind
│   ├── js/
│   │   └── main.js                 ← Lógica, formulario, animaciones
│   └── IMAGENES/
│       └── LOGO/
│           └── Logo de Finca Villa Lida.png
│
├── BackEnd/
│   ├── api/
│   │   └── contact.js              ← Serverless Function (Vercel)
│   ├── logs/
│   │   └── mensajes.json           ← Mensajes recibidos (auto-generado)
│   └── package.json
│
├── vercel.json                     ← Configuración de despliegue
├── .gitignore
└── README.md
```

## 🚀 Despliegue en Vercel

1. Vincula el repo `https://github.com/christiansorianob-lgtm/VillaLida.git` en [vercel.com](https://vercel.com)
2. Vercel detecta automáticamente el `vercel.json`
3. El **FrontEnd** se sirve como sitio estático desde `/FrontEnd`
4. La API `/api/contact` ejecuta `BackEnd/api/contact.js` como función serverless

### Variables de Entorno (Vercel Dashboard)

| Variable | Descripción |
|---|---|
| `EMAIL_TO` | Email donde recibir las notificaciones |
| `FROM_EMAIL` | Email remitente (dominio verificado) |
| `SENDGRID_API_KEY` | API key de SendGrid (opcional) |

## 📬 Formulario de Contacto

El formulario usa **Formspree** como proveedor primario (gratuito para 50 msgs/mes):

1. Ir a [formspree.io](https://formspree.io) y crear una cuenta
2. Crear un nuevo formulario → obtener el ID (ej: `xabcdefg`)
3. Reemplazar en `FrontEnd/js/main.js`:
   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORMSPREE_ID';
   // → cambiar por:
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xabcdefg';
   ```

### Alternativa: API Propia en Vercel
Si prefieres la API propia (`BackEnd/api/contact.js`), cambia en `main.js`:
```js
const FORMSPREE_ENDPOINT = '/api/contact';
```

## 🌱 Contenido

- **Producto**: Plántulas de Palma de Aceite (*Elaeis guineensis*)
- **Etapa 1 – Previvero**: Meses 1-4
- **Etapa 2 – Vivero**: Mes 4 en adelante
- **Mensaje**: "Calidad certificada con manejo nutricional de precisión"
- **Facebook**: Enlace a cotidianidad tecnificada de la finca

## 📱 Facebook

Actualizar los siguientes enlaces en `FrontEnd/index.html` con la URL real de Facebook:
- `id="fb-link"` (sección Nosotros)
- `id="fb-gallery-link"` (sección Galería)
- `id="fb-contact-link"` (sección Contacto)
- `id="fb-footer-link"` (Footer)

Buscar y reemplazar: `href="https://www.facebook.com"` → URL real de la página

## 🖥 Desarrollo Local

```bash
# Abrir directamente en el navegador
FrontEnd/index.html

# O con Live Server (VS Code extension recomendada)
# Click derecho en index.html → "Open with Live Server"
```

## 🔒 Seguridad

- Headers de seguridad configurados en `vercel.json`
- Validación client-side + server-side de todos los campos
- Sanitización de inputs antes del almacenamiento

---
© 2025 Finca Villa Lida · Colombia 🇨🇴
