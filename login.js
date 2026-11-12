"use strict";

const formularioLogin = document.getElementById("formLogin");
const mensajeLogin = document.getElementById("mensajeLogin");
const botonIngresar = document.getElementById("btnIngresar");

function mostrarError(texto) {
    mensajeLogin.textContent = texto;
    mensajeLogin.className = "alert alert-danger mt-3";
}
function destinoPermitido() {
    const solicitado = new URLSearchParams(window.location.search).get("destino");
    return PAGINAS_ADMIN.includes(solicitado) ? solicitado : "mascotas.html";
}
formularioLogin.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    mensajeLogin.className = "d-none";
    mensajeLogin.textContent = "";
    const username = document.getElementById("usuario").value.trim();
    const password = document.getElementById("contrasenia").value;
    if (!username || !password) {
        mostrarError("Ingresá usuario y contraseña.");
        return;
    }
    botonIngresar.disabled = true;
    botonIngresar.textContent = "Verificando...";
    try {
        const respuesta = await fetch("https://dummyjson.com/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, password: password })
        });
        if (!respuesta.ok) {
            if (respuesta.status === 400 || respuesta.status === 401) {
                mostrarError("Usuario o contraseña incorrectos.");
            } else {
                mostrarError("No se pudo iniciar sesión. Intentá nuevamente.");
            }
            return;
        }
        const datos = await respuesta.json();
        const token = datos.accessToken || datos.token;
        if (typeof token !== "string" || !token) {
            mostrarError("El servidor no devolvió un token válido.");
            return;
        }
        sessionStorage.setItem(CLAVE_TOKEN, token);
        sessionStorage.setItem(CLAVE_USUARIO, datos.username || username);
        if (!obtenerTokenVigente()) {
            mostrarError("El servidor devolvió un token vencido o inválido.");
            return;
        }
        window.location.replace(destinoPermitido());
    } catch (error) {
        mostrarError("No se pudo conectar con DummyJSON. Revisá tu conexión a Internet.");
    } finally {
        botonIngresar.disabled = false;
        botonIngresar.textContent = "Iniciar sesión";
    }
});