/* =========================================================
   Ejercicio AJAX
   Descarga el recurso indicado por el usuario con XMLHttpRequest y muestra:
     1. la URL de la propia página al cargar,
     2. el contenido de la respuesta,
     3. cada estado por el que pasa la petición,
     4. las cabeceras HTTP de la respuesta,
     5. el código y el texto de estado.
   ========================================================= */

/* Nombre de cada valor de readyState (0 a 4) */
const ESTADOS = [
  "No inicializada (0)",   // UNSENT: el objeto existe pero no se ha llamado a open()
  "Cargando (1)",          // OPENED: se llamó a open()
  "Cargada (2)",           // HEADERS_RECEIVED: llegaron las cabeceras y el código de estado
  "Interactiva (3)",       // LOADING: se está descargando el contenido
  "Completada (4)"         // DONE: la respuesta está completa
];

/* Referencias a los elementos de la página */
const campoUrl   = document.getElementById("recurso");
const listaEst   = document.getElementById("estados");
const codigo     = document.getElementById("codigo");
const codigoTxt  = document.getElementById("codigo-texto");
const cabeceras  = document.getElementById("cabeceras");
const contenidos = document.getElementById("contenidos");

let inicioPeticion = 0;   // momento en que empezó la petición (para medir tiempos)

/* ---------- Punto 1: al cargar la página, mostrar su propia URL ---------- */
window.addEventListener("load", function () {
  campoUrl.value = location.href;

  // Aviso si la página se abrió con doble clic: así AJAX no funciona
  if (location.protocol === "file:") {
    document.getElementById("aviso-local").hidden = false;
  }
});

/* Añade una línea a la zona "Estados de la petición" con los milisegundos transcurridos */
function registrarEstado(texto) {
  const li = document.createElement("li");
  const ms = Math.round(performance.now() - inicioPeticion);
  li.innerHTML = `${texto} <span class="tiempo">+${ms} ms</span>`;
  listaEst.appendChild(li);
}

/* Deja las zonas de resultados vacías antes de una nueva petición */
function limpiarZonas() {
  listaEst.innerHTML = "";
  codigo.textContent = "…";
  codigo.className = "codigo-estado";
  codigoTxt.textContent = "Esperando respuesta del servidor.";
  cabeceras.textContent = "…";
  contenidos.textContent = "…";
}

/* ---------- Puntos 2 a 5: descargar el recurso y mostrar la respuesta ---------- */
function descargarContenido(url) {
  limpiarZonas();
  inicioPeticion = performance.now();

  // 1) Crear el objeto que hace la petición
  const peticion = new XMLHttpRequest();
  registrarEstado(ESTADOS[peticion.readyState]);          // 0: No inicializada

  // 2) Función que el navegador ejecuta cada vez que cambia readyState
  peticion.onreadystatechange = function () {
    registrarEstado(ESTADOS[peticion.readyState]);        // Punto 3: estado en todo momento

    // A partir del estado 2 ya se conocen las cabeceras y el código de estado
    if (peticion.readyState === 2) {
      mostrarCodigo(peticion);
    }

    if (peticion.readyState === 4) {
      mostrarCodigo(peticion);

      if (peticion.status === 0) {
        // status 0 = la petición no llegó a completarse (sin red, CORS o file://)
        cabeceras.textContent = "(No se recibieron cabeceras)";
        contenidos.textContent =
          "No se pudo descargar el recurso.\n\n" +
          "Causas habituales:\n" +
          " · La URL pertenece a otro dominio que no permite peticiones AJAX (política CORS).\n" +
          " · La página se abrió con doble clic (file://) en lugar de con un servidor.\n" +
          " · No hay conexión o la dirección no existe.";
        return;
      }

      // Punto 4: todas las cabeceras de la respuesta
      cabeceras.textContent = peticion.getAllResponseHeaders() || "(Sin cabeceras)";

      // Punto 2: contenido recibido del servidor
      contenidos.textContent = peticion.responseText || "(La respuesta está vacía)";
    }
  };

  // 3) Configurar la petición: método GET, URL y modo asíncrono (true)
  peticion.open("GET", url, true);
  // 4) Enviarla. El código sigue ejecutándose y la respuesta llega después
  peticion.send(null);
}

/* Punto 5: código y texto de estado (200 OK, 404 Not Found, etc.) */
function mostrarCodigo(peticion) {
  if (peticion.status === 0) {
    codigo.textContent = "0";
    codigo.className = "codigo-estado error";
    codigoTxt.textContent = "Error de red: la petición no obtuvo respuesta del servidor.";
    return;
  }
  codigo.textContent = peticion.status;
  codigo.className = "codigo-estado " + (peticion.status >= 200 && peticion.status < 300 ? "ok" : "error");
  codigoTxt.textContent = peticion.statusText || "(El servidor no envió texto de estado)";
}

/* ---------- Eventos ---------- */
// Botón «Mostrar Contenidos» (el formulario también se envía con la tecla Intro)
document.getElementById("formulario").addEventListener("submit", function (evento) {
  evento.preventDefault();
  const url = campoUrl.value.trim();
  if (url === "") {
    campoUrl.focus();
    return;
  }
  descargarContenido(url);
});

// Botones de prueba: rellenan la URL y lanzan la petición
document.querySelectorAll("[data-url]").forEach(function (boton) {
  boton.addEventListener("click", function () {
    // data-url vacío = la propia página; si no, se convierte en URL absoluta
    const destino = boton.dataset.url === "" ? location.href : new URL(boton.dataset.url, location.href).href;
    campoUrl.value = destino;
    descargarContenido(destino);
  });
});
