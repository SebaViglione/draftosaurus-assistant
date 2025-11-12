// System prompt - se cargará desde archivo externo
let systemPrompt = `Eres un asistente experto EXCLUSIVAMENTE en el juego de mesa Draftosaurus. SOLO podés responder preguntas relacionadas con Draftosaurus.

IMPORTANTE: Usá SIEMPRE formato Markdown en tus respuestas con títulos (##), listas (-, 1.), negritas (**texto**), tablas, blockquotes (>), emojis (🦖 🎲 ✅ ❌ 📝 ⚠️ 🏆) y separadores (---) para hacerlas visuales y fáciles de leer.

Si el usuario pregunta sobre cualquier otro tema, respondé educadamente que solo podés ayudar con consultas sobre Draftosaurus.`;

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const button = document.getElementById("send-btn");

// Historial de mensajes para contexto
let conversationHistory = [];

// Cargar system prompt desde archivo externo
async function loadSystemPrompt() {
    try {
        const response = await fetch('../docs/draftosaurus_system_prompt.md');
        const text = await response.text();

        // Extraer el contenido entre los marcadores
        const startMarker = '<!-- SYSTEM_PROMPT_START -->';
        const endMarker = '<!-- SYSTEM_PROMPT_END -->';
        const startIndex = text.indexOf(startMarker);
        const endIndex = text.indexOf(endMarker);

        if (startIndex !== -1 && endIndex !== -1) {
            // Extraer solo el contenido entre los marcadores
            systemPrompt = text.substring(startIndex + startMarker.length, endIndex).trim();
        } else {
            // Si no hay marcadores, usar todo el contenido
            systemPrompt = text;
        }
    } catch (error) {
        console.error('Error cargando system prompt:', error);
        // Mantener el prompt por defecto si falla la carga
    }
}

// Inicializar la aplicación
async function initializeApp() {
    await loadSystemPrompt();
    showWelcomeMessage();
}

// Mostrar mensaje de bienvenida al cargar
function showWelcomeMessage() {
    const welcome = document.createElement("div");
    welcome.className = "welcome-message";
    welcome.innerHTML = `
                <h2>¡Bienvenido al Asistente de Draftosaurus!</h2>
                <p>Estoy aquí para ayudarte con reglas, estrategias y dudas sobre el juego.<br>
                Podés preguntarme lo que necesites.</p>
                <div class="suggestions">
                    <span class="suggestion-chip" onclick="askSuggestion('¿Cómo se juega Draftosaurus?')">¿Cómo se juega?</span>
                    <span class="suggestion-chip" onclick="askSuggestion('Explicame los tipos de recintos')">Tipos de recintos</span>
                    <span class="suggestion-chip" onclick="askSuggestion('¿Qué estrategia me recomendás para principiantes?')">Estrategia inicial</span>
                    <span class="suggestion-chip" onclick="askSuggestion('¿Cómo funciona el dado de restricción?')">El dado</span>
                </div>
            `;
    chatBox.appendChild(welcome);
}

// Función para usar sugerencias
window.askSuggestion = function (question) {
    input.value = question;
    sendMessage();
};

async function sendMessage() {
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Agregar mensaje del usuario al historial y al chat
    conversationHistory.push({ role: "user", content: userMessage });
    appendMessage("user", userMessage);
    input.value = "";
    input.focus();

    // Construir payload con historial completo
    const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory
    ];

    // Mostrar spinner y mensaje de carga
    const assistantMsgId = appendLoadingMessage();

    try {
        // Usar la función serverless de Netlify
        // En producción (Netlify): usa /api/chat
        // En desarrollo local: usa la URL del backend directamente desde config.js
        const apiUrl = window.CONFIG?.API_URL || '/api/chat';

        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ messages })
        });

        const data = await res.json();
        const reply = data.reply || "Ups, no pude responder en este momento. Intentá de nuevo.";

        // Agregar respuesta al historial
        conversationHistory.push({ role: "assistant", content: reply });

        // Remover el spinner y preparar para escribir
        prepareMessageForTyping(assistantMsgId);

        // Animar el texto escribiéndose
        await typewriterEffect(assistantMsgId, reply);

    } catch (error) {
        removeLoadingAndShowError(assistantMsgId, "Error al conectar con el servidor. Por favor, intentá nuevamente.");
        console.error("Error:", error);
    }
}

function appendMessage(role, text, isLoading = false) {
    const msgWrapper = document.createElement("div");
    msgWrapper.className = `message ${role}`;

    // Crear icono
    const icon = document.createElement("div");
    icon.className = "icon";
    if (role === "user") {
        icon.innerHTML = '<i class="fas fa-user"></i>';
    } else {
        icon.innerHTML = '<i class="fas fa-dragon"></i>';
    }

    // Crear contenido del mensaje
    const content = document.createElement("div");
    content.className = "message-content";

    // Para mensajes del asistente, renderizar Markdown
    // Para mensajes del usuario, mostrar texto plano
    if (role === "assistant") {
        content.innerHTML = marked.parse(text);
    } else {
        content.textContent = text;
    }

    // Agregar elementos al wrapper
    if (role === "user") {
        msgWrapper.appendChild(content);
        msgWrapper.appendChild(icon);
    } else {
        msgWrapper.appendChild(icon);
        msgWrapper.appendChild(content);
    }

    // Agregar ID único si es mensaje de carga
    if (isLoading) {
        const id = 'msg-' + Date.now();
        msgWrapper.id = id;
        chatBox.appendChild(msgWrapper);
        chatBox.scrollTop = chatBox.scrollHeight;
        return id;
    }

    chatBox.appendChild(msgWrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function updateMessage(messageId, newText) {
    const msgElement = document.getElementById(messageId);
    if (msgElement) {
        const contentDiv = msgElement.querySelector('.message-content');
        if (contentDiv) {
            // Renderizar el nuevo texto como Markdown
            contentDiv.innerHTML = marked.parse(newText);
        }
        msgElement.removeAttribute('id');
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Crear mensaje con spinner de carga
function appendLoadingMessage() {
    const msgWrapper = document.createElement("div");
    msgWrapper.className = "message assistant";
    const id = 'msg-' + Date.now();
    msgWrapper.id = id;

    // Crear icono
    const icon = document.createElement("div");
    icon.className = "icon";
    icon.innerHTML = '<i class="fas fa-dragon"></i>';

    // Crear contenedor de carga con spinner
    const content = document.createElement("div");
    content.className = "message-content";
    content.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <span class="loading-text loading-dots">Generando respuesta</span>
        </div>
    `;

    msgWrapper.appendChild(icon);
    msgWrapper.appendChild(content);
    chatBox.appendChild(msgWrapper);
    chatBox.scrollTop = chatBox.scrollHeight;

    return id;
}

// Preparar mensaje para el efecto de escritura
function prepareMessageForTyping(messageId) {
    const msgElement = document.getElementById(messageId);
    if (msgElement) {
        const contentDiv = msgElement.querySelector('.message-content');
        if (contentDiv) {
            // Limpiar el spinner y dejar vacío para empezar a escribir
            contentDiv.innerHTML = '';
        }
    }
}

// Remover spinner y mostrar error
function removeLoadingAndShowError(messageId, errorText) {
    const msgElement = document.getElementById(messageId);
    if (msgElement) {
        const contentDiv = msgElement.querySelector('.message-content');
        if (contentDiv) {
            contentDiv.innerHTML = marked.parse(errorText);
        }
        msgElement.removeAttribute('id');
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Efecto de escritura progresiva tipo ChatGPT
async function typewriterEffect(messageId, fullText) {
    const msgElement = document.getElementById(messageId);
    if (!msgElement) return;

    const contentDiv = msgElement.querySelector('.message-content');
    if (!contentDiv) return;

    // Agregar clase de cursor parpadeante
    contentDiv.classList.add('typing-cursor');

    // Velocidad de escritura (caracteres por intervalo)
    const charsPerStep = 3; // Escribir 3 caracteres a la vez para que sea más fluido
    const interval = 20; // Milisegundos entre cada actualización

    let currentIndex = 0;
    let displayText = '';

    return new Promise((resolve) => {
        const writeInterval = setInterval(() => {
            // Agregar los siguientes caracteres
            if (currentIndex < fullText.length) {
                const nextChars = fullText.slice(currentIndex, currentIndex + charsPerStep);
                displayText += nextChars;
                currentIndex += charsPerStep;

                // Renderizar el texto parcial como Markdown
                contentDiv.innerHTML = marked.parse(displayText);

                // Auto-scroll mientras se escribe
                chatBox.scrollTop = chatBox.scrollHeight;
            } else {
                // Terminó de escribir - remover cursor
                clearInterval(writeInterval);
                contentDiv.classList.remove('typing-cursor');

                // Renderizado final completo
                contentDiv.innerHTML = marked.parse(fullText);

                msgElement.removeAttribute('id');
                chatBox.scrollTop = chatBox.scrollHeight;
                resolve();
            }
        }, interval);
    });
}

// Event listeners
button.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

// ========================================
// ANIMACIONES DE NATURALEZA
// ========================================

// Crear hojas cayendo
function createLeaf() {
    const leaf = document.createElement('div');
    leaf.className = 'leaf';

    // Posición horizontal aleatoria
    leaf.style.left = Math.random() * 100 + 'vw';

    // Duración aleatoria entre 12 y 20 segundos
    const duration = 12 + Math.random() * 8;
    leaf.style.animationDuration = duration + 's';

    // Delay aleatorio
    leaf.style.animationDelay = Math.random() * 5 + 's';

    // Tamaño aleatorio
    const size = 15 + Math.random() * 15;
    leaf.style.width = size + 'px';
    leaf.style.height = size + 'px';

    // Opacidad aleatoria
    leaf.style.opacity = 0.3 + Math.random() * 0.5;

    document.body.appendChild(leaf);

    // Eliminar hoja después de la animación
    setTimeout(() => {
        leaf.remove();
    }, (duration + parseFloat(leaf.style.animationDelay)) * 1000);
}

// Crear partículas flotantes
function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Posición horizontal aleatoria
    particle.style.left = Math.random() * 100 + 'vw';

    // Duración aleatoria entre 10 y 15 segundos
    const duration = 10 + Math.random() * 5;
    particle.style.animationDuration = duration + 's';

    // Delay aleatorio
    particle.style.animationDelay = Math.random() * 3 + 's';

    document.body.appendChild(particle);

    // Eliminar partícula después de la animación
    setTimeout(() => {
        particle.remove();
    }, (duration + parseFloat(particle.style.animationDelay)) * 1000);
}

// Generar hojas continuamente
function generateLeaves() {
    // Crear 8-12 hojas iniciales
    const initialLeaves = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < initialLeaves; i++) {
        setTimeout(() => createLeaf(), i * 500);
    }

    // Crear nueva hoja cada 3-6 segundos
    setInterval(() => {
        createLeaf();
    }, 3000 + Math.random() * 3000);
}

// Generar partículas continuamente
function generateParticles() {
    // Crear 15-20 partículas iniciales
    const initialParticles = 15 + Math.floor(Math.random() * 6);
    for (let i = 0; i < initialParticles; i++) {
        setTimeout(() => createParticle(), i * 300);
    }

    // Crear nueva partícula cada 2-4 segundos
    setInterval(() => {
        createParticle();
    }, 2000 + Math.random() * 2000);
}

// Iniciar animaciones y cargar aplicación cuando carga la página
window.addEventListener('load', () => {
    initializeApp();
    generateLeaves();
    generateParticles();
});