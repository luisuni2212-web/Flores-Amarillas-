// --- MANEJO CENTRALIZADO DE PANTALLAS ---
function irAPantalla(numero) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const proximaPantalla = document.getElementById(`pantalla-${numero}`);
    if (proximaPantalla) {
        proximaPantalla.classList.add('active');
        if (numero === 3) {
            // Inicializa la posición inicial segura del botón No al entrar a la pantalla 3
            setTimeout(inicializarBotonNo, 100);
        }
    }
}

// --- LÓGICA DE LA PANTALLA 2 (CONTRASEÑA CLAVE) ---
function verificarPin() {
    const input = document.getElementById('pin-input');
    const lockCard = document.querySelector('.lock-card');
    const errorMsg = document.getElementById('error-msg');
    
    // Filtramos espacios en blanco y pasamos a minúsculas para evitar errores de teclado
    const respuestaUsuario = input.value.trim().toLowerCase();
    const contraseniaCorrecta = "peque"; 

    if (respuestaUsuario === contraseniaCorrecta) {
        errorMsg.className = "error-hidden";
        // Intentar activar el play de la música en segundo plano
        try {
            document.getElementById('musica').contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        } catch(e){}
        irAPantalla(3);
    } else {
        // Animación de sacudida si falla
        lockCard.classList.add('shake');
        errorMsg.className = "error-visible";
        input.value = ""; // Limpia el input para otro intento
        setTimeout(() => lockCard.classList.remove('shake'), 400);
    }
}


// --- LOGICA PANTALLA 3 (MINIJUEGO BLINDADO MÓVIL) ---
const btnNo = document.getElementById('btn-no');
const btnSi = document.getElementById('btn-si');

function inicializarBotonNo() {
    const rectBtnSi = btnSi.getBoundingClientRect();
    // Colocar el botón "No" alineado horizontalmente al inicio de forma limpia
    btnNo.style.left = `${rectBtnSi.right + 20}px`;
    btnNo.style.top = `${rectBtnSi.top}px`;
}

function huirBotonNo(e) {
    if (e) e.preventDefault();

    const anchoBoton = btnNo.offsetWidth || 80;
    const altoBoton = btnNo.offsetHeight || 40;
    const margen = 20;

    // Calcular límites basados estrictamente en el viewport móvil visible
    const xMax = window.innerWidth - anchoBoton - margen;
    const yMax = window.innerHeight - altoBoton - margen;

    let nuevoX = Math.max(margen, Math.random() * xMax);
    let nuevoY = Math.max(margen, Math.random() * yMax);

    // Evitar matemáticamente que el botón aparezca justo debajo del dedo/cursor tras el salto
    let clienteX = e.touches ? e.touches[0].clientX : e.clientX;
    let clienteY = e.touches ? e.touches[0].clientY : e.clientY;

    if (clienteX && Math.abs(nuevoX - clienteX) < 60) {
        nuevoX = nuevoX + 80 > xMax ? nuevoX - 100 : nuevoX + 80;
    }
    if (clienteY && Math.abs(nuevoY - clienteY) < 60) {
        nuevoY = nuevoY + 80 > yMax ? nuevoY - 100 : nuevoY + 80;
    }

    btnNo.style.left = `${nuevoX}px`;
    btnNo.style.top = `${nuevoY}px`;
}

// Manejadores nativos para evitar retrasos de click en dispositivos móviles (Zero Latency)
btnNo.addEventListener('touchstart', huirBotonNo, { passive: false });
btnNo.addEventListener('mouseover', huirBotonNo);

btnSi.addEventListener('click', () => {
    btnNo.remove(); // Elimina el botón No para limpiar el árbol del DOM
    irAPantalla(4);
    
    // Play final seguro a la música
    const musica = document.getElementById('musica');
    musica.src += "&autoplay=1";
    
    initJardin();
    dispararConfeti();
});

// --- MOTOR DE DIBUJO DE LAS FLORES (CANVAS RESILIENTE) ---
function initJardin() {
    const canvas = document.getElementById('jardin-canvas');
    const ctx = canvas.getContext('2d');

    function reajustar() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    reajustar();

    const estrellas = [];
    const luciernagas = [];

    for (let i = 0; i < 30; i++) {
        estrellas.push({ x: Math.random() * canvas.width, y: Math.random() * (canvas.height * 0.4), size: Math.random() * 1.2 + 0.4, alpha: Math.random() });
    }
    for (let i = 0; i < 10; i++) {
        luciernagas.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 1.5 + 1, sX: (Math.random() - 0.5) * 0.8, sY: (Math.random() - 0.5) * 0.5, v: Math.random() * Math.PI });
    }

    // Proporciones verticales adaptadas a la proporción de pantallas de smartphones alargados
    const datosFlores = [
        { pctX: 0.20, pctAlt: 0.45, r: 22, delay: 0,   petalos: 5 },
        { pctX: 0.35, pctAlt: 0.54, r: 26, delay: 20,  petalos: 6 },
        { pctX: 0.50, pctAlt: 0.62, r: 32, delay: 10,  petalos: 5 }, // Centro
        { pctX: 0.65, pctAlt: 0.52, r: 25, delay: 30,  petalos: 6 },
        { pctX: 0.80, pctAlt: 0.42, r: 20, delay: 5,   petalos: 5 }
    ];

    const flores = datosFlores.map(f => ({ ...f, progresoTallo: 0, progresoFlor: 0 }));
    let runtime = 0;

    function renderLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        runtime++;

        // Luna
        const lX = canvas.width * 0.8;
        const lY = canvas.height * 0.12;
        let gLuna = ctx.createRadialGradient(lX, lY, 2, lX, lY, 35);
        gLuna.addColorStop(0, '#ffffff');
        gLuna.addColorStop(0.4, 'rgba(255, 255, 230, 0.7)');
        gLuna.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gLuna; ctx.beginPath(); ctx.arc(lX, lY, 35, 0, Math.PI * 2); ctx.fill();

        // Estrellas
        estrellas.forEach(e => {
            e.alpha += (Math.random() - 0.5) * 0.05;
            e.alpha = Math.max(0.1, Math.min(1, e.alpha));
            ctx.fillStyle = `rgba(255, 255, 255, ${e.alpha})`;
            ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2); ctx.fill();
        });

        // Tallos y Flores
        flores.forEach(f => {
            if (runtime < f.delay) return;

            const x = canvas.width * f.pctX;
            const yBase = canvas.height;
            const yTarget = canvas.height * (1 - f.pctAlt);

            if (f.progresoTallo < 1) f.progresoTallo += 0.015;
            else if (f.progresoFlor < 1) f.progresoFlor += 0.025;

            const yActual = yBase - (yBase - yTarget) * Math.min(1, f.progresoTallo);

            // Tallo
            ctx.strokeStyle = '#2e7d32';
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, yBase);
            ctx.quadraticCurveTo(x - 12 * f.progresoTallo, yBase - (yBase - yActual)/2, x, yActual);
            ctx.stroke();

            // Flor madura
            if (f.progresoTallo >= 1) {
                const radius = f.r * f.progresoFlor;
                ctx.fillStyle = '#fdd835';
                ctx.strokeStyle = '#f57f17';
                ctx.lineWidth = 1.2;

                for (let i = 0; i < f.petalos; i++) {
                    const angle = (Math.PI * 2 / f.petalos) * i;
                    ctx.save();
                    ctx.translate(x, yActual);
                    ctx.rotate(angle + (runtime * 0.003));
                    ctx.beginPath();
                    ctx.ellipse(0, -radius / 1.5, radius * 0.38, radius / 1.5, 0, 0, Math.PI * 2);
                    ctx.fill(); ctx.stroke();
                    ctx.restore();
                }

                // Centro del Girasol
                ctx.fillStyle = '#5d4037';
                ctx.beginPath(); ctx.arc(x, yActual, radius * 0.35, 0, Math.PI * 2); ctx.fill();
            }
        });

        // Luciérnagas
        luciernagas.forEach(l => {
            l.v += 0.02; l.x += l.sX + Math.sin(l.v) * 0.2; l.y += l.sY;
            if (l.x < 0) l.x = canvas.width; else if (l.x > canvas.width) l.x = 0;
            if (l.y < 0) l.y = canvas.height; else if (l.y > canvas.height) l.y = 0;

            const alpha = 0.3 + Math.abs(Math.sin(runtime * 0.04)) * 0.7;
            ctx.fillStyle = `rgba(255, 235, 59, ${alpha})`;
            ctx.shadowBlur = 6; ctx.shadowColor = '#ffeb3b';
            ctx.beginPath(); ctx.arc(l.x, l.y, l.size, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        });

        requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);
}

// Confeti
function dispararConfeti() {
    const fin = Date.now() + 3000;
    (function frame() {
        confetti({ particleCount: 2, angle: 60, spread: 45, origin: { x: 0, y: 0.85 }, colors: ['#ffeb3b', '#fff59d', '#ffffff'] });
        confetti({ particleCount: 2, angle: 120, spread: 45, origin: { x: 1, y: 0.85 }, colors: ['#ffeb3b', '#fff59d', '#ffffff'] });
        if (Date.now() < fin) requestAnimationFrame(frame);
    }());
}
