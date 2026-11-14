/* =========================================================
   Ejercicios de JavaScript (1 a 4)
   Cada ejercicio tiene dos partes:
     - una función de LÓGICA, que recibe datos y devuelve un resultado;
     - una función que lee el formulario y MUESTRA el resultado en la página.
   ========================================================= */

const VOCALES = ["a", "e", "i", "o", "u"];

/* Utilidad: pasa a minúsculas y quita tildes y diéresis
   ("Árbol" -> "arbol", "pingüino" -> "pinguino").
   normalize("NFD") separa cada letra de su tilde y la expresión regular
   elimina esas tildes sueltas (rango Unicode \u0300-\u036f). */
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/* ---------- Ejercicio 1: palíndromo ---------- */
function esPalindromo(texto) {
  // Se ignoran espacios, signos de puntuación, mayúsculas y tildes
  const limpio = normalizar(texto).replace(/[^a-z0-9]/g, "");
  const invertido = limpio.split("").reverse().join("");
  return { limpio, invertido, resultado: limpio.length > 0 && limpio === invertido };
}

/* ---------- Ejercicio 2: número mayor ---------- */
function compararNumeros(a, b) {
  if (a > b) return { tipo: "mayor", mayor: a };
  if (b > a) return { tipo: "mayor", mayor: b };
  return { tipo: "iguales", mayor: a };
}

/* ---------- Ejercicio 3: vocales que aparecen ---------- */
function vocalesPresentes(frase) {
  const texto = normalizar(frase);
  // filter conserva solo las vocales que aparecen al menos una vez en el texto
  return VOCALES.filter(vocal => texto.includes(vocal));
}

/* ---------- Ejercicio 4: cuántas veces aparece cada vocal ---------- */
function contarVocales(frase) {
  const conteo = { a: 0, e: 0, i: 0, o: 0, u: 0 };
  for (const letra of normalizar(frase)) {
    if (letra in conteo) {
      conteo[letra]++;
    }
  }
  return conteo;
}


/* =========================================================
   Interacción con la página (DOM)
   Solo se ejecuta en el navegador; así las funciones de lógica
   también pueden probarse por separado.
   ========================================================= */
if (typeof document !== "undefined") {

  // Muestra un mensaje en la caja de resultado con un estilo (ok / error / info)
  function mostrar(idCaja, html, estilo) {
    const caja = document.getElementById(idCaja);
    caja.className = "resultado " + estilo;
    caja.innerHTML = html;
  }

  // Evita que un texto escrito por el usuario se interprete como HTML
  function escapar(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
  }

  /* Ejercicio 1 */
  document.getElementById("form-palindromo").addEventListener("submit", function (evento) {
    evento.preventDefault();                    // evita que el formulario recargue la página
    const texto = document.getElementById("texto-palindromo").value;

    if (texto.trim() === "") {
      mostrar("res-palindromo", "Escribe una palabra o frase.", "error");
      return;
    }
    const r = esPalindromo(texto);
    const detalle = `<p class="detalle">Texto limpio: <code>${escapar(r.limpio)}</code> · Al revés: <code>${escapar(r.invertido)}</code></p>`;
    if (r.resultado) {
      mostrar("res-palindromo", `✔ <strong>«${escapar(texto)}»</strong> es un palíndromo.${detalle}`, "ok");
    } else {
      mostrar("res-palindromo", `✘ <strong>«${escapar(texto)}»</strong> no es un palíndromo.${detalle}`, "error");
    }
  });

  /* Ejercicio 2 */
  document.getElementById("form-mayor").addEventListener("submit", function (evento) {
    evento.preventDefault();
    const valor1 = document.getElementById("numero1").value;
    const valor2 = document.getElementById("numero2").value;

    if (valor1 === "" || valor2 === "") {
      mostrar("res-mayor", "Debes escribir los dos números.", "error");
      return;
    }
    const n1 = Number(valor1);
    const n2 = Number(valor2);
    const r = compararNumeros(n1, n2);
    if (r.tipo === "iguales") {
      mostrar("res-mayor", `Los dos números son iguales (<strong>${n1}</strong>).`, "info");
    } else {
      mostrar("res-mayor", `El número mayor es <strong>${r.mayor}</strong>.`, "ok");
    }
  });

  /* Ejercicio 3 */
  document.getElementById("form-vocales").addEventListener("submit", function (evento) {
    evento.preventDefault();
    const frase = document.getElementById("frase-vocales").value;

    if (frase.trim() === "") {
      mostrar("res-vocales", "Escribe una frase.", "error");
      return;
    }
    const presentes = vocalesPresentes(frase);
    // Se dibujan las cinco vocales y se resaltan las que aparecen
    const fichas = VOCALES.map(v =>
      `<span class="vocal ${presentes.includes(v) ? "presente" : ""}">${v}</span>`
    ).join("");
    const texto = presentes.length > 0
      ? `Vocales que aparecen: <strong>${presentes.join(", ")}</strong>`
      : "La frase no contiene vocales.";
    mostrar("res-vocales", `${texto}<div class="vocales">${fichas}</div>`, presentes.length > 0 ? "ok" : "info");
  });

  /* Ejercicio 4 */
  document.getElementById("form-conteo").addEventListener("submit", function (evento) {
    evento.preventDefault();
    const frase = document.getElementById("frase-conteo").value;

    if (frase.trim() === "") {
      mostrar("res-conteo", "Escribe una frase.", "error");
      return;
    }
    const conteo = contarVocales(frase);
    const total = VOCALES.reduce((suma, v) => suma + conteo[v], 0);
    const maximo = Math.max(...VOCALES.map(v => conteo[v]), 1);
    // Una barra por vocal, con ancho proporcional a sus apariciones
    const barras = VOCALES.map(v => `
      <div class="barra-fila">
        <span>${v}</span>
        <div class="barra"><span style="width:${(conteo[v] / maximo) * 100}%"></span></div>
        <span>${conteo[v]}</span>
      </div>`).join("");
    mostrar("res-conteo", `Total de vocales: <strong>${total}</strong>${barras}`, "ok");
  });
}

/* Permite importar las funciones desde Node.js para probarlas */
if (typeof module !== "undefined") {
  module.exports = { normalizar, esPalindromo, compararNumeros, vocalesPresentes, contarVocales };
}
