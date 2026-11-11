"use strict";

const CLAVE_TOKEN = "campestre_access_token";
const CLAVE_USUARIO = "campestre_usuario";
const PAGINAS_ADMIN = ["mascotas.html", "veterinarios.html", "turnos.html", "historia-clinica.html"];

function obtenerTokenVigente() {
    const token = sessionStorage.getItem(CLAVE_TOKEN);
    if (!token) return null;
    try {
        const segmento = token.split(".")[1];
        const base64 = segmento.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        if (typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now()) {
            cerrarDatosSesion();
            return null;
        }
        return token;
    } catch (error) {
        cerrarDatosSesion();
        return null;
    }
}
function cerrarDatosSesion() {
    sessionStorage.removeItem(CLAVE_TOKEN);
    sessionStorage.removeItem(CLAVE_USUARIO);
}
function paginaActual() {
    return window.location.pathname.split("/").pop() || "index.html";
}

const pagina = paginaActual();
if (PAGINAS_ADMIN.includes(pagina) && !obtenerTokenVigente()) {
    window.location.replace("login.html?destino=" + encodeURIComponent(pagina));
}
window.addEventListener("DOMContentLoaded", function () {
    const autenticado = Boolean(obtenerTokenVigente());
    document.querySelectorAll("header nav a.nav-link[href]").forEach(function (enlace) {
        const activo = enlace.getAttribute("href") === paginaActual();
        enlace.classList.toggle("active", activo);
        if (activo) enlace.setAttribute("aria-current", "page");
        else enlace.removeAttribute("aria-current");
    });
    document.querySelectorAll("[data-admin-only]").forEach(function (elemento) {
        elemento.classList.toggle("d-none", !autenticado);
    });
    document.querySelectorAll("[data-visitante-only]").forEach(function (elemento) {
        elemento.classList.toggle("d-none", autenticado);
    });
    document.querySelectorAll("[data-cerrar-sesion]").forEach(function (boton) {
        boton.addEventListener("click", function () {
            cerrarDatosSesion();
            window.location.assign("index.html");
        });
    });
});