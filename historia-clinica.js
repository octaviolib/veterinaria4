"use strict";

const CLAVE_HISTORIAS = "historiasClinicas";
const formularioClinica = document.getElementById("formHistoriaClinica");
const mascotaClinica = document.getElementById("mascotaClinica");
const veterinarioClinica = document.getElementById("veterinarioClinica");
const fechaClinica = document.getElementById("fechaClinica");
const motivoClinica = document.getElementById("motivoClinica");
const diagnosticoClinica = document.getElementById("diagnosticoClinica");
const tratamientoClinica = document.getElementById("tratamientoClinica");
const observacionesClinica = document.getElementById("observacionesClinica");
const pesoClinica = document.getElementById("pesoClinica");
const temperaturaClinica = document.getElementById("temperaturaClinica");
const proximoControlClinica = document.getElementById("proximoControlClinica");
const btnRegistrarClinica = document.getElementById("btnRegistrarClinica");
const mensajeClinica = document.getElementById("mensajeClinica");
const tablaClinica = document.getElementById("tablaClinica");
const totalClinica = document.getElementById("totalClinica");
const mensajeVacioClinica = document.getElementById("mensajeVacioClinica");
const filtroMascotaClinica = document.getElementById("filtroMascotaClinica");
const btnQuitarFiltroClinica = document.getElementById("btnQuitarFiltroClinica");
const panelHistorial = document.getElementById("panelHistorialClinica");
const tituloHistorial = document.getElementById("tituloHistorialClinica");
const contadorHistorial = document.getElementById("contadorHistorialClinica");
const datosMascotaHistorial = document.getElementById("datosMascotaHistorial");
const listaHistorial = document.getElementById("listaHistorialClinica");

function mensaje(texto, tipo = "danger") {
    mensajeClinica.textContent = texto;
    mensajeClinica.className = `alert alert-${tipo} mt-3 mb-0`;
}
function leerDatos(clave) {
    try {
        const texto = localStorage.getItem(clave);
        const datos = texto ? JSON.parse(texto) : [];
        if (!Array.isArray(datos)) throw new Error("Se esperaba una lista.");
        return datos;
    } catch (error) {
        console.error(`No se pudieron leer los datos de ${clave}:`, error);
        mensaje(`No se pudieron leer los registros de ${clave}.`);
        return null;
    }
}
function guardarHistorias(registros) {
    try {
        localStorage.setItem(CLAVE_HISTORIAS, JSON.stringify(registros));
        return true;
    } catch (error) {
        console.error("Error al guardar historia clinica:", error);
        mensaje("No se pudieron guardar los datos en el navegador.");
        return false;
    }
}
function opcion(valor, texto) {
    const elemento = document.createElement("option");
    elemento.value = String(valor);
    elemento.textContent = texto;
    return elemento;
}
function mostrarFecha(fecha) {
    if (!fecha) return "—";
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
    return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : String(fecha);
}
function esFechaValida(fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
    const [anio, mes, dia] = fecha.split("-").map(Number);
    const comprobacion = new Date(Date.UTC(anio, mes - 1, dia));
    return comprobacion.getUTCFullYear() === anio
        && comprobacion.getUTCMonth() === mes - 1
        && comprobacion.getUTCDate() === dia;
}
function cargarSelectores() {
    const mascotas = leerDatos("mascotas");
    const veterinarios = leerDatos("veterinarios");
    const historias = leerDatos(CLAVE_HISTORIAS);
    if (!mascotas || !veterinarios || !historias) {
        btnRegistrarClinica.disabled = true;
        return null;
    }

    const anteriorMascota = mascotaClinica.value;
    const anteriorVeterinario = veterinarioClinica.value;
    const anteriorFiltro = filtroMascotaClinica.value;
    mascotaClinica.replaceChildren(opcion("", "Seleccioná una mascota"));
    veterinarioClinica.replaceChildren(opcion("", "Seleccioná un veterinario"));
    filtroMascotaClinica.replaceChildren(opcion("", "Todas las mascotas"));

    mascotas.forEach(function (mascota) {
        const etiqueta = `${mascota.nombreMascota} (dueño/a: ${mascota.nombreDuenio})`;
        mascotaClinica.appendChild(opcion(mascota.idMascota, etiqueta));
        filtroMascotaClinica.appendChild(opcion(mascota.idMascota, etiqueta));
    });
    veterinarios.forEach(function (veterinario) {
        veterinarioClinica.appendChild(opcion(veterinario.idVeterinario,
            `${veterinario.nombre} (matrícula ${veterinario.matricula})`));
    });

    // Los historiales de mascotas eliminadas siguen siendo consultables.
    const idsActuales = new Set(mascotas.map(m => String(m.idMascota)));
    const mascotasArchivadas = new Set();
    historias.forEach(function (registro) {
        const id = String(registro.idMascota);
        if (!idsActuales.has(id) && !mascotasArchivadas.has(id)) {
            filtroMascotaClinica.appendChild(opcion(id,
                `${registro.nombreMascota || "Mascota eliminada"} (registro histórico)`));
            mascotasArchivadas.add(id);
        }
    });

    if (mascotas.some(m => String(m.idMascota) === anteriorMascota)) {
        mascotaClinica.value = anteriorMascota;
    }
    if (veterinarios.some(v => String(v.idVeterinario) === anteriorVeterinario)) {
        veterinarioClinica.value = anteriorVeterinario;
    }
    if (Array.from(filtroMascotaClinica.options).some(o => o.value === anteriorFiltro)) {
        filtroMascotaClinica.value = anteriorFiltro;
    }

    btnRegistrarClinica.disabled = mascotas.length === 0 || veterinarios.length === 0;
    if (btnRegistrarClinica.disabled) {
        mensaje("Antes de registrar una atención necesitás al menos una mascota y un veterinario.", "warning");
    }
    return { mascotas, veterinarios, historias };
}

function crearCelda(valor) {
    const td = document.createElement("td");
    td.textContent = valor == null ? "" : String(valor);
    return td;
}
function ordenarRecientes(a, b) {
    return String(b.fecha).localeCompare(String(a.fecha))
        || String(b.idHistoriaClinica).localeCompare(String(a.idHistoriaClinica));
}
function agregarDetalle(contenedor, etiqueta, contenido) {
    if (contenido === "" || contenido == null) return;
    const parrafo = document.createElement("p");
    parrafo.className = "mb-2";
    const fuerte = document.createElement("strong");
    fuerte.textContent = `${etiqueta}: `;
    parrafo.append(fuerte, document.createTextNode(String(contenido)));
    contenedor.appendChild(parrafo);
}
function mostrarHistorial(idMascota, historias, mascotas, veterinarios) {
    if (!idMascota) {
        panelHistorial.classList.add("d-none");
        listaHistorial.replaceChildren();
        return;
    }
    const registros = historias.filter(h => String(h.idMascota) === idMascota).sort(ordenarRecientes);
    const mascota = mascotas.find(m => String(m.idMascota) === idMascota);
    const anterior = registros[0];
    const nombre = mascota ? mascota.nombreMascota : (anterior ? anterior.nombreMascota : "Mascota");
    const duenio = mascota ? mascota.nombreDuenio : (anterior ? anterior.nombreDuenio : "Sin datos");
    tituloHistorial.textContent = `Historial completo de ${nombre}`;
    datosMascotaHistorial.textContent = `Dueño/a: ${duenio} · Identificador: ${idMascota}`;
    contadorHistorial.textContent = `${registros.length} ${registros.length === 1 ? "atención" : "atenciones"}`;
    listaHistorial.replaceChildren();
    if (registros.length === 0) {
        const aviso = document.createElement("p");
        aviso.className = "text-body-secondary mb-0";
        aviso.textContent = "Esta mascota todavía no tiene atenciones registradas.";
        listaHistorial.appendChild(aviso);
    }
    const vetPorId = new Map(veterinarios.map(v => [String(v.idVeterinario), v]));
    registros.forEach(function (registro) {
        const articulo = document.createElement("article");
        articulo.className = "border rounded-3 p-3 bg-body";
        const fecha = document.createElement("h3");
        fecha.className = "h5 text-success";
        fecha.textContent = `Atención del ${mostrarFecha(registro.fecha)}`;
        articulo.appendChild(fecha);
        const veterinario = vetPorId.get(String(registro.idVeterinario));
        agregarDetalle(articulo, "Veterinario", veterinario ? veterinario.nombre : registro.nombreVeterinario || "No disponible");
        agregarDetalle(articulo, "Motivo", registro.motivo);
        agregarDetalle(articulo, "Diagnóstico", registro.diagnostico);
        agregarDetalle(articulo, "Tratamiento", registro.tratamiento);
        agregarDetalle(articulo, "Observaciones", registro.observaciones);
        if (registro.peso !== null && registro.peso !== undefined) agregarDetalle(articulo, "Peso", `${registro.peso} kg`);
        if (registro.temperatura !== null && registro.temperatura !== undefined) agregarDetalle(articulo, "Temperatura", `${registro.temperatura} °C`);
        if (registro.fechaProximoControl) agregarDetalle(articulo, "Próximo control", mostrarFecha(registro.fechaProximoControl));
        listaHistorial.appendChild(articulo);
    });
    panelHistorial.classList.remove("d-none");
}
function listarHistorias() {
    const mascotas = leerDatos("mascotas");
    const veterinarios = leerDatos("veterinarios");
    const historias = leerDatos(CLAVE_HISTORIAS);
    if (!mascotas || !veterinarios || !historias) return;

    const mascotaPorId = new Map(mascotas.map(m => [String(m.idMascota), m]));
    const veterinarioPorId = new Map(veterinarios.map(v => [String(v.idVeterinario), v]));
    const idFiltro = filtroMascotaClinica.value;
    const registros = historias.filter(h => !idFiltro || String(h.idMascota) === idFiltro).sort(ordenarRecientes);
    tablaClinica.replaceChildren();

    registros.forEach(function (registro) {
        const mascota = mascotaPorId.get(String(registro.idMascota));
        const veterinario = veterinarioPorId.get(String(registro.idVeterinario));
        const fila = document.createElement("tr");
        fila.append(
            crearCelda(mostrarFecha(registro.fecha)),
            crearCelda(mascota ? mascota.nombreMascota : registro.nombreMascota || "Mascota eliminada"),
            crearCelda(mascota ? mascota.nombreDuenio : registro.nombreDuenio || "—"),
            crearCelda(veterinario ? veterinario.nombre : registro.nombreVeterinario || "Veterinario no disponible"),
            crearCelda(registro.motivo),
            crearCelda(registro.diagnostico)
        );
        const celdaAccion = document.createElement("td");
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "btn btn-outline-success btn-sm text-nowrap";
        boton.textContent = "Ver historial";
        boton.dataset.mascota = String(registro.idMascota);
        celdaAccion.appendChild(boton);
        fila.appendChild(celdaAccion);
        tablaClinica.appendChild(fila);
    });
    totalClinica.textContent = historias.length;
    mensajeVacioClinica.textContent = historias.length === 0
        ? "Todavía no hay atenciones registradas."
        : "No se encontraron atenciones para la mascota seleccionada.";
    mensajeVacioClinica.classList.toggle("d-none", registros.length > 0);
    mostrarHistorial(idFiltro, historias, mascotas, veterinarios);
}
function generarId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function numeroOpcional(campo, etiqueta) {
    if (campo.value.trim() === "") return null;
    const valor = Number(campo.value);
    if (!Number.isFinite(valor) || valor <= 0) {
        mensaje(`${etiqueta}: ingresá un número mayor que cero.`);
        campo.focus();
        return NaN;
    }
    return valor;
}
function registrarAtencion(evento) {
    evento.preventDefault();
    if (!obtenerTokenVigente()) {
        window.location.replace("login.html?destino=historia-clinica.html");
        return;
    }
    if (!formularioClinica.reportValidity()) return;
    const datos = cargarSelectores();
    if (!datos) return;

    const idMascota = mascotaClinica.value;
    const idVeterinario = veterinarioClinica.value;
    const mascota = datos.mascotas.find(m => String(m.idMascota) === idMascota);
    const veterinario = datos.veterinarios.find(v => String(v.idVeterinario) === idVeterinario);
    if (!mascota || !veterinario) {
        mensaje("Seleccioná una mascota y un veterinario registrados.");
        return;
    }
    const fecha = fechaClinica.value;
    const proximoControl = proximoControlClinica.value;
    const motivo = motivoClinica.value.trim();
    const diagnostico = diagnosticoClinica.value.trim();
    const tratamiento = tratamientoClinica.value.trim();
    const observaciones = observacionesClinica.value.trim();
    if (!esFechaValida(fecha) || !motivo || !diagnostico || !tratamiento) {
        mensaje("Completá una fecha válida, motivo, diagnóstico y tratamiento.");
        return;
    }
    if (proximoControl && (!esFechaValida(proximoControl) || proximoControl < fecha)) {
        mensaje("La fecha del próximo control debe ser válida y no anterior a la atención.");
        return;
    }
    const peso = numeroOpcional(pesoClinica, "Peso");
    if (Number.isNaN(peso)) return;
    const temperatura = numeroOpcional(temperaturaClinica, "Temperatura");
    if (Number.isNaN(temperatura)) return;

    const historias = leerDatos(CLAVE_HISTORIAS);
    if (!historias) return;
    historias.push({
        idHistoriaClinica: generarId(),
        idMascota,
        idVeterinario,
        nombreMascota: mascota.nombreMascota,
        nombreDuenio: mascota.nombreDuenio,
        nombreVeterinario: veterinario.nombre,
        fecha,
        motivo,
        diagnostico,
        tratamiento,
        observaciones,
        peso,
        temperatura,
        fechaProximoControl: proximoControl || null
    });
    if (!guardarHistorias(historias)) return;
    formularioClinica.reset();
    cargarSelectores();
    filtroMascotaClinica.value = idMascota;
    listarHistorias();
    mensaje("Atención registrada correctamente. Se muestra el historial de la mascota.", "success");
}
if (obtenerTokenVigente()) {
    cargarSelectores();
    listarHistorias();
    formularioClinica.addEventListener("submit", registrarAtencion);
    filtroMascotaClinica.addEventListener("change", listarHistorias);
    btnQuitarFiltroClinica.addEventListener("click", function () {
        filtroMascotaClinica.value = "";
        listarHistorias();
    });
    tablaClinica.addEventListener("click", function (evento) {
        const boton = evento.target.closest("button[data-mascota]");
        if (!boton) return;
        filtroMascotaClinica.value = boton.dataset.mascota;
        listarHistorias();
        panelHistorial.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    window.addEventListener("storage", function (evento) {
        if (["mascotas", "veterinarios", CLAVE_HISTORIAS].includes(evento.key)) {
            cargarSelectores();
            listarHistorias();
        }
    });
}