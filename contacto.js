const CLAVE_MENSAJES_CONTACTO = "mudraMensajesContacto";

function obtenerMensajesContacto() {
  try {
    const mensajes = JSON.parse(localStorage.getItem(CLAVE_MENSAJES_CONTACTO));
    return Array.isArray(mensajes) ? mensajes : [];
  } catch {
    return [];
  }
}

function mostrarErrorContacto(idCampo, mensaje) {
  const campo = document.getElementById(idCampo);
  const error = document.getElementById(`error-${idCampo}`);
  if (!campo || !error) return;

  campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
  error.textContent = mensaje;
  error.hidden = !mensaje;
}

function mostrarEstadoContacto(mensaje, tipo) {
  const estado = document.getElementById("estado-contacto");
  if (!estado) return;

  estado.textContent = mensaje;
  estado.className = `estado-formulario estado-formulario--${tipo}`;
  estado.hidden = !mensaje;
}

function inicializarContacto() {
  const formulario = document.getElementById("formulario-contacto");
  if (!formulario) return;

  const leerDatos = () => ({
    nombre: document.getElementById("contacto-nombre").value.trim(),
    correo: document.getElementById("contacto-correo").value.trim().toLowerCase(),
    comentario: document.getElementById("contacto-comentario").value.trim()
  });

  const validaciones = (datos) => [
    ["contacto-nombre", !validarTextoObligatorio(datos.nombre, 100), "El nombre es obligatorio y admite hasta 100 caracteres."],
    ["contacto-correo", typeof validarCorreo !== "function" || !validarCorreo(datos.correo), "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com."],
    ["contacto-comentario", !validarTextoObligatorio(datos.comentario, 500), "El comentario es obligatorio y admite hasta 500 caracteres."]
  ];

  const validar = (idCampo = "") => validaciones(leerDatos()).reduce((estado, [id, tieneError, mensaje]) => {
    if (!idCampo || id === idCampo) mostrarErrorContacto(id, tieneError ? mensaje : "");
    return estado && !tieneError;
  }, true);

  formulario.addEventListener("input", (evento) => {
    if (evento.target.id?.startsWith("contacto-")) validar(evento.target.id);
  });
  formulario.addEventListener("focusout", (evento) => {
    if (evento.target.id?.startsWith("contacto-")) validar(evento.target.id);
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mostrarEstadoContacto("", "exito");
    if (!validar()) return;

    const datos = leerDatos();
    const mensaje = {
      id: `CONTACTO-${Date.now()}`,
      fecha: new Date().toISOString(),
      ...datos
    };

    try {
      localStorage.setItem(CLAVE_MENSAJES_CONTACTO, JSON.stringify([mensaje, ...obtenerMensajesContacto()]));
      formulario.reset();
      ["contacto-nombre", "contacto-correo", "contacto-comentario"].forEach((id) => mostrarErrorContacto(id, ""));
      mostrarEstadoContacto("Tu mensaje fue enviado correctamente. Te contactaremos pronto.", "exito");
      document.getElementById("contacto-nombre").focus();
    } catch {
      mostrarEstadoContacto("No fue posible guardar tu mensaje. Inténtalo nuevamente.", "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", inicializarContacto);
