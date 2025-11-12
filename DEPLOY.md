# 🚀 Guía de Despliegue en Netlify

Esta guía te ayudará a desplegar el chatbot en Netlify **sin exponer tu API key**.

## 📋 ¿Cómo Funciona?

El proyecto usa **Netlify Functions** (serverless functions) para proteger tus credenciales:

```
Usuario → Frontend (Netlify) → Netlify Function → Backend OpenAI
                                    ↑
                            Variables de entorno
                            (API key protegida)
```

✅ **Ventajas**:
- La API key NUNCA está en el código del cliente
- No se puede ver en el navegador
- Completamente seguro para producción

---

## 🔧 Paso 1: Preparar el Repositorio

### 1.1 Verificar archivos

Asegúrate de tener estos archivos en tu proyecto:

```
✓ netlify.toml
✓ netlify/functions/chat.js
✓ .env.example
✓ .gitignore
```

### 1.2 Subir a GitHub

```bash
# Verificar que config.js NO esté incluido
git status | grep config.js
# No debería aparecer

# Agregar todos los archivos
git add .

# Commit
git commit -m "feat: Add Netlify Functions support"

# Push a GitHub
git push origin main
```

---

## 🌐 Paso 2: Crear Sitio en Netlify

### 2.1 Conectar con GitHub

1. Ve a [https://app.netlify.com](https://app.netlify.com)
2. Click en **"Add new site"** → **"Import an existing project"**
3. Selecciona **GitHub**
4. Busca y selecciona tu repositorio `ChatBox-Draftosaurus`

### 2.2 Configurar Build Settings

En la pantalla de configuración:

- **Branch to deploy**: `main`
- **Build command**: (dejar vacío)
- **Publish directory**: `.` (punto)
- **Functions directory**: `netlify/functions`

Click en **"Deploy site"**

---

## 🔐 Paso 3: Configurar Variables de Entorno

**MUY IMPORTANTE**: Aquí es donde pones tu API key de forma segura.

### 3.1 Ir a Environment Variables

1. En tu sitio de Netlify, ve a **Site settings**
2. En el menú lateral, click en **Environment variables**
3. Click en **"Add a variable"**

### 3.2 Agregar Variables

**Variable 1 - REQUERIDA:**
- **Key**: `OPENAI_API_URL`
- **Value**: `https://backend-pasamanos-openai.onrender.com/chat`
- Scope: **All scopes** o **Production**

**Variable 2 - OPCIONAL (solo si tu API lo requiere):**
- **Key**: `OPENAI_API_KEY`
- **Value**: `tu-api-key-real-aqui`
- Scope: **All scopes** o **Production**

### 3.3 Guardar y Redesplegar

1. Click en **"Save"**
2. Ve a **Deploys**
3. Click en **"Trigger deploy"** → **"Deploy site"**

---

## ✅ Paso 4: Verificar que Funciona

### 4.1 Obtener URL

Netlify te dará una URL como:
```
https://tu-sitio-123abc.netlify.app
```

### 4.2 Probar el Chatbot

1. Abre la URL en tu navegador
2. Escribe una pregunta sobre Draftosaurus
3. Verifica que el bot responde correctamente

### 4.3 Verificar Seguridad

1. Abre **DevTools** (F12) → **Network**
2. Envía un mensaje
3. Verifica que los requests van a `/api/chat` (no a la URL externa)
4. Revisa que no haya API keys visibles en Headers

---

## 🐛 Solución de Problemas

### Error: "Failed to process chat request"

**Causa**: Variables de entorno no configuradas

**Solución**:
1. Ve a **Site settings** → **Environment variables**
2. Verifica que `OPENAI_API_URL` esté configurada
3. Redesplega el sitio

### Error: "Function not found"

**Causa**: Netlify no detectó la función

**Solución**:
1. Verifica que exista `netlify/functions/chat.js`
2. Verifica que `netlify.toml` tenga `functions = "netlify/functions"`
3. Redesplega desde GitHub

### Error: CORS

**Causa**: Problema de configuración de headers

**Solución**: Ya está configurado en `chat.js`, pero si persiste:
1. Agrega tu dominio específico en `Access-Control-Allow-Origin`
2. Redesplega

---

## 🔄 Desarrollo Local (Opcional)

Si quieres probar localmente con Netlify Functions:

### Instalar Netlify CLI

```bash
npm install -g netlify-cli
```

### Crear archivo .env local

```bash
# Crear archivo .env (NO lo subas a Git)
echo "OPENAI_API_URL=https://backend-pasamanos-openai.onrender.com/chat" > .env
```

### Ejecutar en local

```bash
netlify dev
```

Abre: http://localhost:8888

---

## 📊 Monitoreo

### Ver Logs de Functions

1. Ve a tu sitio en Netlify
2. Click en **Functions** en el menú
3. Click en **chat**
4. Verás los logs de ejecución

### Ver Métricas

1. **Functions** → **chat**
2. Verás:
   - Invocations (llamadas)
   - Errors
   - Run time

---

## 🎯 Checklist Final

Antes de considerar el despliegue completo:

- [ ] Sitio desplegado en Netlify
- [ ] Variables de entorno configuradas
- [ ] Chatbot responde correctamente
- [ ] API key NO visible en DevTools
- [ ] No hay errores en Console
- [ ] Animaciones funcionan
- [ ] Markdown se renderiza correctamente
- [ ] Domain personalizado configurado (opcional)

---

## 🔗 Recursos

- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)

---

## 💡 Tips Adicionales

### Dominio Personalizado

1. Ve a **Domain settings**
2. Click en **"Add custom domain"**
3. Sigue las instrucciones

### HTTPS

Netlify proporciona HTTPS automáticamente. No necesitas configurar nada.

### Límites de Netlify Functions

- **Free tier**: 125,000 requests/mes
- **Timeout**: 10 segundos por request
- **Memoria**: 1024 MB

---

**¡Listo!** Tu chatbot está desplegado de forma segura en Netlify 🎉
