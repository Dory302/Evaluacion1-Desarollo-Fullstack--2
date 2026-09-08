const CLAVE_USUARIOS_REGISTRADOS = "usuariosRegistrados";
const CLAVE_SESION_USUARIO = "sesionUsuario";
const CLAVE_CUENTAS_DEMOSTRACION = "mudraCuentasDemoV2";

const CUENTAS_DEMOSTRACION = [
  {
    run: "123456785", nombre: "Administrador", apellidos: "Demo", correo: "admin@duoc.cl",
    fechaNacimiento: "1990-01-01", rol: "Administrador", region: "Región Metropolitana",
    comuna: "Santiago", direccion: "Avenida Demo 123",
    contrasena: "Admin123"
  },
  {
    run: "111111111", nombre: "Cliente", apellidos: "Demo", correo: "cliente@duoc.cl",
    fechaNacimiento: "1995-01-01", rol: "Cliente", region: "Región Metropolitana",
    comuna: "Santiago", direccion: "Avenida Demo 456",
    contrasena: "Cliente1"
  }
];

function instalarCuentasDemostracion(usuarios) {
  if (localStorage.getItem(CLAVE_CUENTAS_DEMOSTRACION) === "1") return usuarios;

  const cuentasNuevas = CUENTAS_DEMOSTRACION.filter((cuenta) => !usuarios.some((usuario) =>
    usuario.run === cuenta.run || usuario.correo?.toLowerCase() === cuenta.correo
  ));
  const cuentas = [...usuarios, ...cuentasNuevas];

  try {
    localStorage.setItem(CLAVE_USUARIOS_REGISTRADOS, JSON.stringify(cuentas));
    localStorage.setItem(CLAVE_CUENTAS_DEMOSTRACION, "1");
  } catch {
    // Si el navegador bloquea el almacenamiento, las cuentas siguen disponibles en esta carga.
  }
  return cuentas;
}

function obtenerUsuariosRegistrados() {
  try {
    const guardado = localStorage.getItem(CLAVE_USUARIOS_REGISTRADOS);
    const usuarios = guardado === null ? [] : JSON.parse(guardado);
    return Array.isArray(usuarios) ? instalarCuentasDemostracion(usuarios) : [];
  } catch {
    return [];
  }
}

function guardarUsuariosRegistrados(usuarios) {
  localStorage.setItem(CLAVE_USUARIOS_REGISTRADOS, JSON.stringify(usuarios));
  localStorage.setItem(CLAVE_CUENTAS_DEMOSTRACION, "1");
  document.dispatchEvent(new Event("usuarios-actualizados"));
}

function obtenerSesionUsuario() {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION_USUARIO));
    if (!sesion || typeof sesion.correo !== "string") return null;
    const usuario = obtenerUsuariosRegistrados().find((item) => sesion.run ? item.run === sesion.run : item.correo === sesion.correo);
    if (!usuario) return null;
    const { contrasena, ...datos } = usuario;
    return { ...datos, rol: usuario.rol || "Cliente" };
  } catch {
    return null;
  }
}

function guardarSesionUsuario(usuario) {
  const sesion = {
    run: usuario.run,
    rol: usuario.rol || "Cliente",
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    correo: usuario.correo,
    region: usuario.region,
    comuna: usuario.comuna,
    direccion: usuario.direccion
  };

  localStorage.setItem(CLAVE_SESION_USUARIO, JSON.stringify(sesion));
  document.dispatchEvent(new Event("sesion-actualizada"));
}

function cerrarSesionUsuario() {
  localStorage.removeItem(CLAVE_SESION_USUARIO);
  document.dispatchEvent(new Event("sesion-actualizada"));
}

function actualizarCuentaHeader() {
  const sesion = obtenerSesionUsuario();
  const destino = window.location.pathname.endsWith("/carrito.html") ? "carrito" : obtenerDestinoSeguro();

  document.querySelectorAll("[data-cuenta-header]").forEach((contenedor) => {
    contenedor.replaceChildren();

    if (sesion) {
      const saludo = document.createElement("span");
      saludo.className = "header-cuenta__saludo";
      saludo.textContent = `Hola, ${sesion.nombre || "cliente"}`;

      const cerrar = document.createElement("button");
      cerrar.type = "button";
      cerrar.className = "header-cuenta__cerrar";
      cerrar.textContent = "Cerrar sesión";
      cerrar.addEventListener("click", () => {
        cerrarSesionUsuario();
        contenedor.querySelector("a")?.focus();
      });

      contenedor.append(saludo);
      if (["Administrador", "Vendedor"].includes(sesion.rol)) {
        const panel = document.createElement("a");
        panel.className = "header-cuenta__inicio";
        panel.href = sesion.rol === "Administrador" ? "admin.html" : "adminproductos.html";
        panel.textContent = "Administración";
        contenedor.append(panel);
      }
      contenedor.append(cerrar);
      return;
    }

    const iniciar = document.createElement("a");
    iniciar.className = "header-cuenta__inicio";
    iniciar.href = crearUrlConDestino("iniciosesion.html", destino);
    iniciar.textContent = "Iniciar sesión";

    const crear = document.createElement("a");
    crear.className = "header-cuenta__crear";
    crear.href = crearUrlConDestino("registrousuario.html", destino);
    crear.textContent = "Crear cuenta";

    contenedor.append(iniciar, crear);
  });
}

function obtenerDestinoSeguro() {
  const destino = new URLSearchParams(window.location.search).get("destino");
  return ["carrito", "admin"].includes(destino) ? destino : "";
}

function crearUrlConDestino(pagina, destino) {
  return destino ? `${pagina}?destino=${destino}` : pagina;
}



function mostrarErrorCampo(idCampo, mensaje) {
  const campo = document.getElementById(idCampo);
  const error = document.getElementById(`error-${idCampo}`);

  if (!campo || !error) return;

  campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
  error.textContent = mensaje;
  error.hidden = !mensaje;
}

function mostrarEstado(idElemento, mensaje, tipo) {
  const elemento = document.getElementById(idElemento);
  if (!elemento) return;

  elemento.textContent = mensaje;
  elemento.className = `estado-formulario estado-formulario--${tipo}`;
  elemento.hidden = !mensaje;
}

function validarTextoObligatorio(valor, maximo) {
  return valor.trim().length > 0 && valor.trim().length <= maximo;
}

function validarFechaNacimiento(fecha) {
  if (!fecha) return true;

  const fechaIngresada = new Date(`${fecha}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return !Number.isNaN(fechaIngresada.getTime()) && fechaIngresada <= hoy;
}

function inicializarRegistro() {
  const formulario = document.getElementById("formulario-registro");
  if (!formulario) return;

  const destino = obtenerDestinoSeguro();
  const enlaceInicio = document.getElementById("enlace-inicio-registro");

  if (enlaceInicio) {
    enlaceInicio.href = crearUrlConDestino("iniciosesion.html", destino);
  }

  if (typeof cargarRegiones === "function") {
    cargarRegiones("registro-region", "registro-comuna");
  }

  const leerDatosRegistro = () => ({
    run: document.getElementById("registro-run").value.trim().toUpperCase(),
    nombre: document.getElementById("registro-nombre").value.trim(),
    apellidos: document.getElementById("registro-apellidos").value.trim(),
    correo: document.getElementById("registro-correo").value.trim().toLowerCase(),
    contrasena: document.getElementById("registro-contrasena").value,
    fechaNacimiento: document.getElementById("registro-fecha-nacimiento").value,
    region: document.getElementById("registro-region").value,
    comuna: document.getElementById("registro-comuna").value,
    direccion: document.getElementById("registro-direccion").value.trim()
  });

  const validarDatosRegistro = (datos) => [
    ["registro-run", typeof validarRUN !== "function" || !validarRUN(datos.run), "Ingresa un RUN válido, sin puntos ni guión."],
    ["registro-nombre", !validarTextoObligatorio(datos.nombre, 50), "El nombre es obligatorio y admite hasta 50 caracteres."],
    ["registro-apellidos", !validarTextoObligatorio(datos.apellidos, 100), "Los apellidos son obligatorios y admiten hasta 100 caracteres."],
    ["registro-correo", typeof validarCorreo !== "function" || !validarCorreo(datos.correo), "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com."],
    ["registro-contrasena", datos.contrasena.length < 4 || datos.contrasena.length > 10, "La contraseña debe tener entre 4 y 10 caracteres."],
    ["registro-fecha-nacimiento", !validarFechaNacimiento(datos.fechaNacimiento), "La fecha de nacimiento no puede ser futura."],
    ["registro-region", !datos.region, "Selecciona una región."],
    ["registro-comuna", !datos.comuna, "Selecciona una comuna."],
    ["registro-direccion", !validarTextoObligatorio(datos.direccion, 300), "La dirección es obligatoria y admite hasta 300 caracteres."]
  ];

  const mostrarValidacionRegistro = (idCampo = "") => {
    const validaciones = validarDatosRegistro(leerDatosRegistro());
    return validaciones.reduce((estado, [id, tieneError, mensaje]) => {
      if (!idCampo || id === idCampo) mostrarErrorCampo(id, tieneError ? mensaje : "");
      return estado && !tieneError;
    }, true);
  };

  const validarCampoRegistro = (evento) => {
    const idCampo = evento.target?.id;
    if (idCampo?.startsWith("registro-")) mostrarValidacionRegistro(idCampo);
  };

  formulario.addEventListener("input", validarCampoRegistro);
  formulario.addEventListener("change", validarCampoRegistro);
  formulario.addEventListener("focusout", validarCampoRegistro);

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mostrarEstado("estado-registro", "", "exito");
    const datos = leerDatosRegistro();
    const esValido = mostrarValidacionRegistro();

    if (!esValido) return;

    const usuarios = obtenerUsuariosRegistrados();
    const correoRegistrado = usuarios.some((usuario) => usuario.correo === datos.correo);
    const runRegistrado = usuarios.some((usuario) => usuario.run === datos.run);

    if (correoRegistrado) {
      mostrarErrorCampo("registro-correo", "Ya existe una cuenta con este correo.");
      return;
    }

    if (runRegistrado) {
      mostrarErrorCampo("registro-run", "Ya existe una cuenta con este RUN.");
      return;
    }

    try {
      usuarios.push({
        ...datos,
        rol: "Cliente"
      });
      guardarUsuariosRegistrados(usuarios);
      const parametroRegistro = destino ? `registro=ok&destino=${destino}` : "registro=ok";
      window.location.href = `iniciosesion.html?${parametroRegistro}`;
    } catch {
      mostrarEstado("estado-registro", "No fue posible guardar tu cuenta. Inténtalo nuevamente.", "error");
    }
  });
}

function inicializarInicioSesion() {
  const formulario = document.getElementById("formulario-inicio-sesion");
  if (!formulario) return;

  const destino = formulario.dataset.acceso === "admin" ? "admin" : obtenerDestinoSeguro();
  if (destino === "admin" && formulario.dataset.acceso !== "admin") {
    window.location.replace("adminlogin.html");
    return;
  }
  const enlaceRegistro = document.getElementById("enlace-registro-login");
  const cuentaCreada = new URLSearchParams(window.location.search).get("registro") === "ok";

  if (enlaceRegistro) {
    enlaceRegistro.href = crearUrlConDestino("registrousuario.html", destino);
  }

  if (cuentaCreada) {
    mostrarEstado("estado-login", "Tu cuenta fue creada. Ingresa tus datos para continuar.", "exito");
  }

  const validarCampoLogin = (campo) => {
    if (campo.id === "login-correo") {
      mostrarErrorCampo(campo.id, validarCorreo(campo.value.trim().toLowerCase()) ? "" : "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.");
    } else if (campo.id === "login-contrasena") {
      mostrarErrorCampo(campo.id, campo.value.length >= 4 && campo.value.length <= 10 ? "" : "La contraseña debe tener entre 4 y 10 caracteres.");
    }
  };
  formulario.addEventListener("input", (evento) => validarCampoLogin(evento.target));
  formulario.addEventListener("focusout", (evento) => validarCampoLogin(evento.target));

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mostrarEstado("estado-login", "", "exito");

    const correo = document.getElementById("login-correo").value.trim().toLowerCase();
    const contrasena = document.getElementById("login-contrasena").value;
    const correoInvalido = typeof validarCorreo !== "function" || !validarCorreo(correo);
    const contrasenaInvalida = contrasena.length < 4 || contrasena.length > 10;

    mostrarErrorCampo("login-correo", correoInvalido ? "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com." : "");
    mostrarErrorCampo("login-contrasena", contrasenaInvalida ? "La contraseña debe tener entre 4 y 10 caracteres." : "");

    if (correoInvalido || contrasenaInvalida) return;

    const boton = formulario.querySelector('[type="submit"]');
    if (boton.disabled) return;
    boton.disabled = true;
    try {
      const resultado = await verificarCredencialesUsuario(correo, contrasena, destino === "admin");
      if (resultado.error) {
        mostrarEstado("estado-login", resultado.error, "error");
        return;
      }
      guardarSesionUsuario(resultado.usuario);
      window.location.href = destino === "carrito" ? "carrito.html#pagar"
        : resultado.usuario.rol === "Administrador" ? "admin.html"
        : resultado.usuario.rol === "Vendedor" ? "adminproductos.html" : "index.html";
    } catch {
      mostrarEstado("estado-login", "No fue posible iniciar sesión. Inténtalo nuevamente.", "error");
    } finally {
      boton.disabled = false;
    }
  });
}

async function verificarCredencialesUsuario(correo, contrasena, soloAdministracion = false) {
  // Compara directamente sin encriptar:
  const usuario = obtenerUsuariosRegistrados().find((item) => item.correo === correo.trim().toLowerCase());
  
  if (!usuario || usuario.contrasena !== contrasena) {
    return { error: "El correo o la contraseña no coinciden con una cuenta registrada." };
  }
  
  if (soloAdministracion && !["Administrador", "Vendedor"].includes(usuario.rol)) {
    return { error: "Esta cuenta no tiene acceso administrativo. Ingresa desde el inicio de sesión de la tienda." };
  }
  
  return { usuario };
}

document.addEventListener("DOMContentLoaded", () => {
  actualizarCuentaHeader();
  inicializarRegistro();
  inicializarInicioSesion();
});

document.addEventListener("sesion-actualizada", actualizarCuentaHeader);

window.addEventListener("storage", (evento) => {
  if (evento.key === CLAVE_SESION_USUARIO || evento.key === null) {
    document.dispatchEvent(new Event("sesion-actualizada"));
  }
});
