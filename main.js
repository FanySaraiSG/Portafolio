if (sessionStorage.getItem('auth') !== 'true') {
    window.location.href = "login.html";
}

const USUARIO_GITHUB = "FanySaraiSG";

const misPracticas = {
    "p1": { repo: "Practica-Geocalizacion", video: "https://www.youtube.com/embed/5QDSwZ3MMvE", pdf: "docs/Documentacion_1.pdf", web: "https://fanysaraisg.github.io/Practica-Geocalizacion/" },
    "p2": { repo: "Practica-RedSocial", video: "https://www.youtube.com/embed/jqHey-IPYr0", pdf: "docs/Documentacion_2.pdf", web: "https://fanysaraisg.github.io/Practica-RedSocial/" },
    "p3": { repo: "Dulceeees", video: "https://www.youtube.com/embed/Ul9RmjgA0no", pdf: "docs/Documentacion_3.pdf", web: "https://fanysaraisg.github.io/Dulceeees/" },
    "p4": { repo: "Stremer-y-base", video: "https://www.youtube.com/embed/j1DUjXGfdlQ", pdf: "docs/Docuemntacion_4.pdf", web: "https://practica-sbd.infinityfreeapp.com/?i=1" },
    "p5": { repo: "render", video: "https://www.youtube.com/embed/-u5XCDwL0sA", pdf: "docs/Documentacion_5.pdf", web: "https://fanysaraisg.github.io/render/" },
    "p6": { repo: "tienda", video: "https://www.youtube.com/embed/GacMpZR0QnE", pdf: "docs/Documentacion_6.pdf", web: "https://fanysaraisg.github.io/tienda/" }
};

// Función para cambiar pestañas
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById('tab-' + tabId).classList.remove('hidden');
    
    // Buscar el botón correcto para ponerlo activo
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if(btn.getAttribute('onclick').includes(tabId)) btn.classList.add('active');
    });
}

async function cargarPractica(id) {
    const config = misPracticas[id];
    document.getElementById('titulo-practica').innerHTML = `${config.repo} <i class="fas fa-paw"></i>`;
    document.getElementById('video-contenedor').innerHTML = `<iframe src="${config.video}" allowfullscreen></iframe>`;
    document.getElementById('repo-link').href = `https://github.com/${USUARIO_GITHUB}/${config.repo}`;
    document.getElementById('web-link').href = config.web;
    document.getElementById('doc-content').innerHTML = `<embed src="${config.pdf}" type="application/pdf">`;

    listarArchivos(config.repo); 
    switchTab('video'); // Siempre mostrar video al cambiar de práctica
}

async function listarArchivos(repo, path = "") {
    const lista = document.getElementById('lista-archivos');
    lista.innerHTML = "Cargando...";
    try {
        const urlFetch = path === "" ? `https://api.github.com/repos/${USUARIO_GITHUB}/${repo}/contents` : `https://api.github.com/repos/${USUARIO_GITHUB}/${repo}/contents/${path}`;
        const res = await fetch(urlFetch);
        const files = await res.json();
        lista.innerHTML = "";
        
        if (path !== "") {
            const backDiv = document.createElement('div');
            backDiv.className = "file-item";
            backDiv.innerHTML = `<i class="fas fa-arrow-left"></i> .. (Regresar)`;
            backDiv.onclick = () => {
                const parts = path.split('/');
                parts.pop();
                listarArchivos(repo, parts.join('/'));
            };
            lista.appendChild(backDiv);
        }
        
        files.forEach(file => {
            const div = document.createElement('div');
            div.className = "file-item";
            const icono = file.type === "dir" ? "fas fa-folder" : "far fa-file";
            div.innerHTML = `<i class="${icono}"></i> ${file.name}`;
            div.onclick = () => file.type === "dir" ? listarArchivos(repo, file.path) : verCodigo(file.download_url, file.name, div);
            lista.appendChild(div);
        });

        const primerArchivo = files.find(f => f.type === "file");
        if (primerArchivo && path === "") verCodigo(primerArchivo.download_url, primerArchivo.name, null);
    } catch (e) { lista.innerHTML = "Error al conectar."; }
}

async function verCodigo(url, nombre, el) {
    if(el) {
        document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active-file'));
        el.classList.add('active-file');
    }
    document.getElementById('file-name-display').innerText = nombre;
    try {
        const res = await fetch(url);
        const text = await res.text();
        const codeTag = document.getElementById('codigo-real');
        codeTag.textContent = text;
        const ext = nombre.split('.').pop();
        const langMap = { 'html': 'markup', 'js': 'javascript', 'php': 'php', 'css': 'css', 'sql': 'sql' };
        codeTag.className = `language-${langMap[ext] || 'javascript'}`;
        Prism.highlightElement(codeTag);
    } catch (e) { console.error("Error al cargar código"); }
}

document.querySelectorAll('.btn-practica').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-practica').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        cargarPractica(btn.getAttribute('data-repo'));
    });
});

function cerrarSesion() { sessionStorage.removeItem('auth'); window.location.href = "login.html"; }
function toggleFull(id) { document.getElementById(id).classList.toggle('fullscreen'); }

cargarPractica('p1');

// --- SISTEMA DE CIERRE POR INACTIVIDAD (10 MINUTOS) ---

let temporizadorInactividad;
const TIEMPO_LIMITE_MS = 10 * 60 * 1000; // 10 minutos convertidos a milisegundos

function reiniciarTemporizador() {
    // Si el temporizador ya estaba corriendo, lo limpiamos para empezar de nuevo
    clearTimeout(temporizadorInactividad);
    
    // Iniciamos la cuenta regresiva
    temporizadorInactividad = setTimeout(() => {
        alert("Tu sesión ha expirado por inactividad (10 minutos).");
        cerrarSesion(); // Llama a la función que ya tienes creada
    }, TIEMPO_LIMITE_MS);
}

// Escuchamos cualquier actividad del usuario
window.onload = reiniciarTemporizador; // Iniciar al cargar la página
document.onmousemove = reiniciarTemporizador; // Al mover el mouse
document.onkeypress = reiniciarTemporizador; // Al presionar una tecla
document.onclick = reiniciarTemporizador;    // Al hacer clic
document.onscroll = reiniciarTemporizador;   // Al hacer scroll
