"use strict";

const CLAVE_VETERINARIOS = "veterinarios";

const formulario = document.getElementById("formVeterinarios");
const campoMatricula = document.getElementById("matricula");
const campoNombre = document.getElementById("nombre");
const campoEspecializacion = document.getElementById("especializacion");
const campoValorConsulta = document.getElementById("valorConsulta");

const tabla = document.getElementById("tablaVeterinarios");
const total = document.getElementById("totalVeterinarios");
const mensajeVacio = document.getElementById("mensajeVacio");
const mensaje = document.getElementById("mensaje");

const tituloFormulario = document.getElementById("tituloFormulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const btnLimpiar = document.getElementById("btnLimpiar");


let idEnEdicion = null;

function obtenerVeterinarios() {
    try {
        const datos = localStorage.getItem(CLAVE_VETERINARIOS);
        const veterinarios = datos ? JSON.parse(datos) : [];

        if (!Array.isArray(veterinarios)) {
            throw new Error("El formato de los datos no es válido.");
        }

        return veterinarios;
    } catch (error) {
        console.error("No se pudieron leer los veterinarios:", error);
        mostrarMensaje("No se pudieron leer los datos guardados.", "danger");
        return null;
    }
}
function guardarVeterinarios(veterinarios) {
    try {
        localStorage.setItem(
            CLAVE_VETERINARIOS,
            JSON.stringify(veterinarios)
        );

        return true;
    } catch (error) {
        console.error("No se pudieron guardar los veterinarios:", error);
        mostrarMensaje("No se pudieron guardar los datos en el navegador.", "danger");
        return false;
    }
}
function generarId() {
    if (typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function formatearMoneda(valor) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS"
    }).format(valor);
}
function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `alert alert-${tipo} mt-3 mb-0`;
}
function crearCelda(texto) {
    const celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
}
function listarVeterinarios() {
    const veterinarios = obtenerVeterinarios();
    if (veterinarios === null) {
        return;
    }
    tabla.replaceChildren();
    veterinarios.forEach(function (veterinario) {
        const fila = document.createElement("tr");

        fila.append(
            crearCelda(veterinario.matricula),
            crearCelda(veterinario.nombre),
            crearCelda(veterinario.especializacion),
            crearCelda(formatearMoneda(veterinario.valorConsulta))
        );
        const celdaAcciones = document.createElement("td");
        celdaAcciones.className = "text-nowrap";
        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.className = "btn btn-warning btn-sm me-2 mb-1";
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", function () {
            editarVeterinario(veterinario.idVeterinario);
        });
        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "btn btn-danger btn-sm mb-1";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener("click", function () {
            eliminarVeterinario(veterinario.idVeterinario);
        });
        celdaAcciones.append(btnEditar, btnEliminar);
        fila.append(celdaAcciones);
        tabla.append(fila);
    });
    total.textContent = veterinarios.length;
    mensajeVacio.classList.toggle("d-none", veterinarios.length > 0);
}
function obtenerDatosFormulario() {
    const matricula = Number(campoMatricula.value);
    const valorConsulta = Number(campoValorConsulta.value);
    if (!Number.isSafeInteger(matricula) || matricula <= 0) {
        mostrarMensaje("La matrícula debe ser un entero positivo.", "danger");
        campoMatricula.focus();
        return null;
    }
    if (!Number.isFinite(valorConsulta) || valorConsulta < 0) {
        mostrarMensaje("El valor de consulta debe ser un número válido y no negativo.", "danger");
        campoValorConsulta.focus();
        return null;
    }
    const nombre = campoNombre.value.trim();
    const especializacion = campoEspecializacion.value.trim();
    if (!nombre || !especializacion) {
        mostrarMensaje("Completá el nombre y la especialización.", "danger");
        return null;
    }
    return {
        matricula: matricula,
        nombre: nombre,
        especializacion: especializacion,
        valorConsulta: valorConsulta
    };
}
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (!formulario.reportValidity()) {
        return;
    }
    const datos = obtenerDatosFormulario();
    if (datos === null) {
        return;
    }
    const veterinarios = obtenerVeterinarios();
    if (veterinarios === null) {
        return;
    }
    if (idEnEdicion === null) {
               const nuevoVeterinario = {
            idVeterinario: generarId(),
            ...datos
        };
        veterinarios.push(nuevoVeterinario);
        if (!guardarVeterinarios(veterinarios)) {
            return;
        }
        mostrarMensaje("Veterinario registrado correctamente.", "success");
    } else {
        const indice = veterinarios.findIndex(function (veterinario) {
            return veterinario.idVeterinario === idEnEdicion;
        });
        if (indice === -1) {
            mostrarMensaje("No se encontró el veterinario que querés editar.", "danger");
            cancelarEdicion();
            listarVeterinarios();
            return;
        }
        veterinarios[indice] = {
            ...veterinarios[indice],
            ...datos
        };
        if (!guardarVeterinarios(veterinarios)) {
            return;
        }
        mostrarMensaje("Veterinario modificado correctamente.", "success");
    }
    cancelarEdicion();
    listarVeterinarios();
});
function editarVeterinario(id) {
    const veterinarios = obtenerVeterinarios();
    if (veterinarios === null) {
        return;
    }
    const veterinario = veterinarios.find(function (item) {
        return item.idVeterinario === id;
    });
    if (!veterinario) {
        mostrarMensaje("No se encontró el veterinario.", "danger");
        return;
    }
    idEnEdicion = id;
    campoMatricula.value = veterinario.matricula;
    campoNombre.value = veterinario.nombre;
    campoEspecializacion.value = veterinario.especializacion;
    campoValorConsulta.value = veterinario.valorConsulta;
    tituloFormulario.textContent = "Editar veterinario";
    btnGuardar.textContent = "Guardar cambios";
    btnCancelar.classList.remove("d-none");
    formulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
    campoNombre.focus();
}
function eliminarVeterinario(id) {
    const veterinarios = obtenerVeterinarios();
    if (veterinarios === null) {
        return;
    }
    const veterinario = veterinarios.find(function (item) {
        return item.idVeterinario === id;
    });
    if (!veterinario) {
        mostrarMensaje("No se encontró el veterinario.", "danger");
        return;
    }
    try {
        const turnos = JSON.parse(localStorage.getItem("turnos") || "[]");
        if (!Array.isArray(turnos)) throw new Error("Turnos inválidos");
        if (turnos.some(function (turno) {
            return String(turno.idVeterinario) === String(id);
        })) {
            mostrarMensaje("Este veterinario tiene turnos asociados. Eliminá sus turnos primero.", "warning");
            return;
        }
    } catch (error) {
        mostrarMensaje("No se pudieron comprobar los turnos. No se eliminó el veterinario.", "danger");
        return;
    }
    const confirmado = confirm(
        `¿Querés eliminar al veterinario ${veterinario.nombre}?`
    );
    if (!confirmado) {
        return;
    }
    const actualizados = veterinarios.filter(function (item) {
        return item.idVeterinario !== id;
    });
    if (!guardarVeterinarios(actualizados)) {
        return;
    }
    if (idEnEdicion === id) {
        cancelarEdicion();
    }
    listarVeterinarios();
    mostrarMensaje("Veterinario eliminado correctamente.", "success");
}

function cancelarEdicion() {
    idEnEdicion = null;
    formulario.reset();
    tituloFormulario.textContent = "Registrar veterinario";
    btnGuardar.textContent = "Registrar veterinario";
    btnCancelar.classList.add("d-none");
}

btnCancelar.addEventListener("click", function () {
    cancelarEdicion();
    mostrarMensaje("Edición cancelada.", "secondary");
});

btnLimpiar.addEventListener("click", function () {
    cancelarEdicion();
    mensaje.classList.add("d-none");
});

listarVeterinarios();