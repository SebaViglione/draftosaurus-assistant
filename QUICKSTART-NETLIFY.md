# ⚡ Despliegue Rápido en Netlify

## 🎯 En 5 Pasos

### 1️⃣ Sube a GitHub
```bash
git add .
git commit -m "feat: Add Netlify support"
git push origin main
```

### 2️⃣ Crea Sitio en Netlify
1. Ve a [netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import from Git"**
3. Selecciona tu repositorio

### 3️⃣ Configuración de Build
- **Branch**: `main`
- **Publish directory**: `.`
- **Functions directory**: `netlify/functions`

Click **"Deploy site"**

### 4️⃣ Variables de Entorno
En Netlify:
1. **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Agregar:
   - Key: `OPENAI_API_URL`
   - Value: `https://backend-pasamanos-openai.onrender.com/chat`

### 5️⃣ Redesplegar
1. **Deploys** → **"Trigger deploy"**
2. Espera ~30 segundos
3. ¡Abre tu URL y prueba!

---

## ✅ Verificar

```
✓ Abre tu-sitio.netlify.app
✓ Envía mensaje de prueba
✓ Debe responder normalmente
✓ F12 → Network → Ver que llama a /api/chat
✓ NO debe haber API keys visibles
```

---

## 🐛 Problemas Comunes

**Error: "Failed to process"**
→ Falta configurar `OPENAI_API_URL` en Environment variables

**Function not found**
→ Verifica que existe `netlify/functions/chat.js`

**CORS error**
→ Redesplegar el sitio

---

📖 **Guía completa**: [DEPLOY.md](DEPLOY.md)
