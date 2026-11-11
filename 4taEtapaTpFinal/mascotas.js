
"use strict";

const formulario = document.getElementById("formMascotas");
const tablaMascotas = document.getElementById("tablaMascotas");
const totalMascotas = document.getElementById("totalMascotas");
const mensajeVacio = document.getElementById("mensajeVacio");
const mensaje = document.getElementById("mensaje");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnCancelar = document.getElementById("btnCancelar");

let mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];
let idMascotaEditando = null;

function generarIdMascota(idsReservados) {
    const idsUsados = idsReservados || new Set(mascotas.map(function (mascota) {
        return String(mascota.idMascota);
    }));
    let nuevoId;
    do {
        nuevoId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `mascota-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    } while (idsUsados.has(nuevoId));
    return nuevoId;
}
function normalizarIds() {
    const idsUsados = new Set();
    let huboCambios = false;
    mascotas.forEach(function (mascota) {
        const id = mascota.idMascota == null ? "" : String(mascota.idMascota);
        if (!id || idsUsados.has(id)) {
            mascota.idMascota = generarIdMascota(idsUsados);
            huboCambios = true;
        } else if (mascota.idMascota !== id) {
            mascota.idMascota = id;
            huboCambios = true;
        }
        idsUsados.add(mascota.idMascota);
    });
    if (huboCambios) guardarMascotas();
}
function guardarMascotas() {
    localStorage.setItem("mascotas", JSON.stringify(mascotas));
}
function mostrarMascotas() {
    tablaMascotas.innerHTML = "";
    mascotas.forEach(function (mascota) {
        const fila = document.createElement("tr");
        const datos = [
            mascota.idMascota,
            mascota.nombreMascota,
            mascota.nombreDuenio,
            mascota.tipoAnimal || "Sin especificar",
            mascota.raza || "Desconocido",
            mascota.color,
            mascota.edad,
            mascota.peso
        ];
        datos.forEach(function (dato) {
            const celda = document.createElement("td");
            celda.textContent = dato ?? "";
            fila.appendChild(celda);
        });
        const celdaAcciones = document.createElement("td");
        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.className = "btn btn-warning btn-sm me-1";
        btnEditar.textContent = "Editar";
        btnEditar.dataset.accion = "editar";
        btnEditar.dataset.id = mascota.idMascota;
        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "btn btn-danger btn-sm";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.dataset.accion = "eliminar";
        btnEliminar.dataset.id = mascota.idMascota;
        celdaAcciones.appendChild(btnEditar);
        celdaAcciones.appendChild(btnEliminar);
        fila.appendChild(celdaAcciones);
        tablaMascotas.appendChild(fila);
    });
    totalMascotas.textContent = mascotas.length;
    mensajeVacio.classList.toggle("d-none", mascotas.length > 0);
}
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const nombreMascota =
        document.getElementById("nombreMascota").value.trim();
    const nombreDuenio =
        document.getElementById("nombreDuenio").value.trim();
    const tipoAnimal =
        document.getElementById("tipoAnimal").value;
    const raza =
        document.getElementById("raza").value.trim();
    const color =
        document.getElementById("color").value.trim();
    const edadTexto =
        document.getElementById("edad").value;
    const pesoTexto =
        document.getElementById("peso").value;
    const edad = Number(edadTexto);
    const peso = Number(pesoTexto);
    if (
        !nombreMascota ||
        !nombreDuenio ||
        !tipoAnimal ||
        !raza ||
        !color ||
        edadTexto === "" ||
        pesoTexto === "" ||
        !Number.isInteger(edad) ||
        edad < 0 ||
        !Number.isFinite(peso) ||
        peso <= 0
    ) {
        mensaje.textContent =
            'Completá todos los campos. Si no conocés la raza, escribí "Desconocido".';
        return;
    }
    const datosMascota = {
        nombreMascota: nombreMascota,
        nombreDuenio: nombreDuenio,
        tipoAnimal: tipoAnimal,
        raza: raza,
        color: color,
        edad: edad,
        peso: peso
    };
    if (idMascotaEditando !== null) {
        mascotas = mascotas.map(function (mascota) {
            if (mascota.idMascota === idMascotaEditando) {
                return {
                    ...mascota,
                    ...datosMascota
                };
            }
            return mascota;
        });
        mensaje.textContent = "Mascota modificada correctamente.";
    } else {
        const nuevaMascota = {
            idMascota: generarIdMascota(),
            ...datosMascota
        };
        mascotas.push(nuevaMascota);
        mensaje.textContent = "Mascota registrada correctamente.";
    }
    guardarMascotas();
    mostrarMascotas();
    limpiarFormulario();
});
tablaMascotas.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;
    const id = boton.dataset.id;
    const accion = boton.dataset.accion;
    if (accion === "editar") {
        const mascota = mascotas.find(function (item) {
            return item.idMascota === id;
        });
        if (!mascota) return;
        idMascotaEditando = id;
        document.getElementById("nombreMascota").value =
            mascota.nombreMascota;
        document.getElementById("nombreDuenio").value =
            mascota.nombreDuenio;
        document.getElementById("tipoAnimal").value =
            mascota.tipoAnimal || "";
        document.getElementById("raza").value =
            mascota.raza || "";
        document.getElementById("color").value =
            mascota.color;
        document.getElementById("edad").value =
            mascota.edad;
        document.getElementById("peso").value =
            mascota.peso;
        tituloFormulario.textContent = "Editar mascota";
        btnGuardar.textContent = "Guardar cambios";
        btnCancelar.classList.remove("d-none");
        mensaje.textContent =
            "Modificá los datos y pulsá Guardar cambios.";
        formulario.scrollIntoView({ behavior: "smooth" });
    }
    if (accion === "eliminar") {
        let turnosAsociados;
        try {
            const datos = JSON.parse(localStorage.getItem("turnos") || "[]");
            if (!Array.isArray(datos)) throw new Error("Turnos inválidos");
            turnosAsociados = datos.some(function (turno) {
                return String(turno.idMascota) === String(id);
            });
        } catch (error) {
            mensaje.textContent = "No se pudieron comprobar los turnos. No se eliminó la mascota.";
            return;
        }
        if (turnosAsociados) {
            mensaje.textContent = "Esta mascota tiene turnos asociados. Eliminá sus turnos primero.";
            return;
        }
        const confirmar = confirm(
            "¿Estás seguro de que querés eliminar esta mascota?"
        );
        if (!confirmar) return;
        mascotas = mascotas.filter(function (mascota) {
            return mascota.idMascota !== id;
        });
        guardarMascotas();
        mostrarMascotas();
        if (idMascotaEditando === id) {
            limpiarFormulario();
        }
        mensaje.textContent = "Mascota eliminada correctamente.";
    }
});
function limpiarFormulario() {
    formulario.reset();
    idMascotaEditando = null;
    tituloFormulario.textContent = "Registrar mascota";
    btnGuardar.textContent = "Registrar mascota";
    btnCancelar.classList.add("d-none");
}
btnLimpiar.addEventListener("click", function () {
    limpiarFormulario();
    mensaje.textContent = "";
});
btnCancelar.addEventListener("click", function () {
    limpiarFormulario();
    mensaje.textContent = "Edición cancelada.";
});
normalizarIds();
mostrarMascotas();