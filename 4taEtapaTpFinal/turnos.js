"use strict";

// Modulo Turnos: reutiliza las claves existentes de Mascotas y Veterinarios.
const CLAVE_TURNOS = "turnos";
const formularioTurnos = document.getElementById("formTurnos");
const campoMascota = document.getElementById("mascotaTurno");
const campoVeterinario = document.getElementById("veterinarioTurno");
const campoFecha = document.getElementById("fechaTurno");
const campoHora = document.getElementById("horaTurno");
const campoMotivo = document.getElementById("motivoTurno");
const botonRegistrar = document.getElementById("btnRegistrarTurno");
const tablaTurnos = document.getElementById("tablaTurnos");
const totalTurnos = document.getElementById("totalTurnos");
const mensajeVacio = document.getElementById("mensajeVacioTurnos");
const mensajeTurnos = document.getElementById("mensajeTurnos");
const filtroVeterinario = document.getElementById("filtroVeterinario");
const filtroFecha = document.getElementById("filtroFecha");
const botonLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

function mostrarMensajeTurnos(texto, tipo = "danger") {
    mensajeTurnos.textContent = texto;
    mensajeTurnos.className = `alert alert-${tipo} mt-3 mb-0`;
}
function leerColeccion(clave) {
    try {
        const texto = localStorage.getItem(clave);
        const datos = texto ? JSON.parse(texto) : [];
        if (!Array.isArray(datos)) throw new Error("La información no es una lista.");
        return datos;
    } catch (error) {
        console.error(`Error al leer ${clave}:`, error);
        mostrarMensajeTurnos(`No se pudieron leer los datos de ${clave}.`);
        return null;
    }
}
function guardarTurnos(turnos) {
    try {
        localStorage.setItem(CLAVE_TURNOS, JSON.stringify(turnos));
        return true;
    } catch (error) {
        console.error("No se pudieron guardar los turnos:", error);
        mostrarMensajeTurnos("No se pudieron guardar los turnos en el navegador.");
        return false;
    }
}
function crearOpcion(valor, etiqueta) {
    const opcion = document.createElement("option");
    opcion.value = String(valor);
    opcion.textContent = etiqueta;
    return opcion;
}
function refrescarOpciones() {
    const mascotas = leerColeccion("mascotas");
    const veterinarios = leerColeccion("veterinarios");
    if (!mascotas || !veterinarios) {
        botonRegistrar.disabled = true;
        return null;
    }
    const seleccionMascota = campoMascota.value;
    const seleccionVeterinario = campoVeterinario.value;
    const filtroAnterior = filtroVeterinario.value;
    campoMascota.replaceChildren(crearOpcion("", "Seleccioná una mascota"));
    campoVeterinario.replaceChildren(crearOpcion("", "Seleccioná un veterinario"));
    filtroVeterinario.replaceChildren(crearOpcion("", "Todos los veterinarios"));
    mascotas.forEach(function (mascota) {
        campoMascota.appendChild(crearOpcion(mascota.idMascota,
            `${mascota.nombreMascota} (dueño/a: ${mascota.nombreDuenio})`));
    });
    veterinarios.forEach(function (veterinario) {
        const etiqueta = `${veterinario.nombre} (matrícula ${veterinario.matricula})`;
        campoVeterinario.appendChild(crearOpcion(veterinario.idVeterinario, etiqueta));
        filtroVeterinario.appendChild(crearOpcion(veterinario.idVeterinario, etiqueta));
    });
    if (mascotas.some(m => String(m.idMascota) === seleccionMascota)) {
        campoMascota.value = seleccionMascota;
    }
    if (veterinarios.some(v => String(v.idVeterinario) === seleccionVeterinario)) {
        campoVeterinario.value = seleccionVeterinario;
    }
    if (veterinarios.some(v => String(v.idVeterinario) === filtroAnterior)) {
        filtroVeterinario.value = filtroAnterior;
    }

    botonRegistrar.disabled = mascotas.length === 0 || veterinarios.length === 0;
    if (botonRegistrar.disabled) {
        mostrarMensajeTurnos("Para registrar un turno, primero registrá una mascota y un veterinario.", "warning");
    }
    return { mascotas, veterinarios };
}

function crearCelda(contenido) {
    const celda = document.createElement("td");
    celda.textContent = contenido == null ? "" : String(contenido);
    return celda;
}
function mostrarFecha(fecha) {
    const partes = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(fecha);
    return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : fecha;
}
function listarTurnos() {
    const turnos = leerColeccion(CLAVE_TURNOS);
    const mascotas = leerColeccion("mascotas");
    const veterinarios = leerColeccion("veterinarios");
    if (!turnos || !mascotas || !veterinarios) return;

    const nombresMascotas = new Map(mascotas.map(m => [String(m.idMascota), m]));
    const nombresVeterinarios = new Map(veterinarios.map(v => [String(v.idVeterinario), v]));
    const listaFiltrada = turnos
        .filter(t => (!filtroVeterinario.value || String(t.idVeterinario) === filtroVeterinario.value)
            && (!filtroFecha.value || t.fecha === filtroFecha.value))
        .sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`));
    tablaTurnos.replaceChildren();

    listaFiltrada.forEach(function (turno) {
        const mascota = nombresMascotas.get(String(turno.idMascota));
        const veterinario = nombresVeterinarios.get(String(turno.idVeterinario));
        const fila = document.createElement("tr");
        fila.append(
            crearCelda(mostrarFecha(turno.fecha)),
            crearCelda(turno.hora),
            crearCelda(mascota ? mascota.nombreMascota : "Mascota no disponible"),
            crearCelda(mascota ? mascota.nombreDuenio : "—"),
            crearCelda(veterinario ? veterinario.nombre : "Veterinario no disponible"),
            crearCelda(turno.motivo)
        );
        const acciones = document.createElement("td");
        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "btn btn-danger btn-sm";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.dataset.id = turno.idTurno;
        acciones.appendChild(botonEliminar);
        fila.appendChild(acciones);
        tablaTurnos.appendChild(fila);
    });
    totalTurnos.textContent = turnos.length;
    mensajeVacio.textContent = turnos.length === 0
        ? "Todavía no hay turnos registrados."
        : "No se encontraron turnos con los filtros seleccionados.";
    mensajeVacio.classList.toggle("d-none", listaFiltrada.length > 0);
}
function generarIdTurno() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function fechaValida(fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
    const [anio, mes, dia] = fecha.split("-").map(Number);
    const comprobacion = new Date(Date.UTC(anio, mes - 1, dia));
    return comprobacion.getUTCFullYear() === anio
        && comprobacion.getUTCMonth() === mes - 1
        && comprobacion.getUTCDate() === dia;
}
function registrarTurno(evento) {
    evento.preventDefault();
    if (!obtenerTokenVigente()) {
        window.location.replace("login.html?destino=turnos.html");
        return;
    }
    if (!formularioTurnos.reportValidity()) return;
    const datos = refrescarOpciones();
    if (!datos) return;

    const idMascota = campoMascota.value;
    const idVeterinario = campoVeterinario.value;
    const fecha = campoFecha.value;
    const hora = campoHora.value;
    const motivo = campoMotivo.value.trim();
    if (!datos.mascotas.some(m => String(m.idMascota) === idMascota)
        || !datos.veterinarios.some(v => String(v.idVeterinario) === idVeterinario)) {
        mostrarMensajeTurnos("Seleccioná una mascota y un veterinario registrados.");
        return;
    }
    if (!fechaValida(fecha) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora) || !motivo) {
        mostrarMensajeTurnos("Completá una fecha, hora y motivo válidos.");
        return;
    }
    const turnos = leerColeccion(CLAVE_TURNOS);
    if (!turnos) return;
    const ocupado = turnos.some(t => String(t.idVeterinario) === idVeterinario
        && t.fecha === fecha && t.hora === hora);
    if (ocupado) {
        mostrarMensajeTurnos("Ese veterinario ya tiene un turno en la fecha y hora indicadas.", "warning");
        return;
    }

    turnos.push({ idTurno: generarIdTurno(), idMascota, idVeterinario, fecha, hora, motivo });
    if (!guardarTurnos(turnos)) return;
    formularioTurnos.reset();
    mostrarMensajeTurnos("Turno registrado correctamente.", "success");
    listarTurnos();
}
function eliminarTurno(idTurno) {
    if (!obtenerTokenVigente()) {
        window.location.replace("login.html?destino=turnos.html");
        return;
    }
    const turnos = leerColeccion(CLAVE_TURNOS);
    if (!turnos) return;
    const turno = turnos.find(t => t.idTurno === idTurno);
    if (!turno) {
        mostrarMensajeTurnos("No se encontró el turno.");
        return;
    }
    if (!window.confirm(`¿Querés eliminar el turno del ${mostrarFecha(turno.fecha)} a las ${turno.hora}?`)) {
        return;
    }
    if (!guardarTurnos(turnos.filter(t => t.idTurno !== idTurno))) return;
    mostrarMensajeTurnos("Turno eliminado correctamente.", "success");
    listarTurnos();
}
if (obtenerTokenVigente()) {
    refrescarOpciones();
    listarTurnos();
    formularioTurnos.addEventListener("submit", registrarTurno);
    tablaTurnos.addEventListener("click", function (evento) {
        const boton = evento.target.closest("button[data-id]");
        if (boton) eliminarTurno(boton.dataset.id);
    });
    filtroVeterinario.addEventListener("change", listarTurnos);
    filtroFecha.addEventListener("change", listarTurnos);
    botonLimpiarFiltros.addEventListener("click", function () {
        filtroVeterinario.value = "";
        filtroFecha.value = "";
        listarTurnos();
    });
    window.addEventListener("storage", function (evento) {
        if (["mascotas", "veterinarios", CLAVE_TURNOS].includes(evento.key)) {
            refrescarOpciones();
            listarTurnos();
        }
    });
}