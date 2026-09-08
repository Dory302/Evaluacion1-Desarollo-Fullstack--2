function esAdministrador() {
  return obtenerSesionUsuario()?.rol === "Administrador";
}

function hayAdministrador() {
  return obtenerUsuariosRegistrados().some((usuario) => usuario.rol === "Administrador");
}

function exigirAdministrador() {
  if (!esAdministrador()) throw new Error("Tu cuenta no tiene permiso para realizar esta operación.");
}

function validarProductoAdmin(datos, idActual = null) {
  const errores = {};
  if (datos.id.trim().length < 3) errores.id = "Escribe un código de al menos 3 caracteres.";
  else if (obtenerProductos().some((p) => p.id.toUpperCase() === datos.id.trim().toUpperCase() && p.id !== idActual)) errores.id = "Este código ya está registrado.";
  if (!datos.nombre.trim() || datos.nombre.trim().length > 100) errores.nombre = "Ingresa un nombre de hasta 100 caracteres.";
  if (datos.descripcion.length > 500) errores.descripcion = "La descripción admite hasta 500 caracteres.";
  if (!categoriasProductos.includes(datos.categoria)) errores.categoria = "Selecciona una categoría.";
  if (datos.precio === "" || !Number.isFinite(Number(datos.precio)) || Number(datos.precio) < 0) errores.precio = "Ingresa un precio igual o mayor que 0.";
  if (datos.stock === "" || !Number.isSafeInteger(Number(datos.stock)) || Number(datos.stock) < 0) errores.stock = "El stock debe ser un número entero igual o mayor que 0.";
  if (datos.stockCritico !== "" && (!Number.isSafeInteger(Number(datos.stockCritico)) || Number(datos.stockCritico) < 0)) errores.stockCritico = "Ingresa un entero igual o mayor que 0, o deja el campo vacío.";
  if (datos.img && !imagenProductoSegura(datos.img)) errores.img = "Usa una dirección de imagen HTTP o HTTPS válida.";
  return errores;
}

function validarUsuarioAdmin(datos, runActual = null, inicial = false) {
  const errores = {};
  const usuarios = obtenerUsuariosRegistrados();
  if (!validarRUN(datos.run.trim().toUpperCase())) errores.run = "Ingresa un RUN válido de 7 a 9 caracteres, sin puntos ni guion.";
  else if (usuarios.some((u) => u.run === datos.run.trim().toUpperCase() && u.run !== runActual)) errores.run = "Este RUN ya está registrado.";
  if (!datos.nombre.trim() || datos.nombre.trim().length > 50) errores.nombre = "Ingresa un nombre de hasta 50 caracteres.";
  if (!datos.apellidos.trim() || datos.apellidos.trim().length > 100) errores.apellidos = "Ingresa apellidos de hasta 100 caracteres.";
  if (!validarCorreo(datos.correo.trim().toLowerCase())) errores.correo = "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com de hasta 100 caracteres.";
  else if (usuarios.some((u) => u.correo.toLowerCase() === datos.correo.trim().toLowerCase() && u.run !== runActual)) errores.correo = "Este correo ya está registrado.";
  if ((!runActual || datos.contrasena) && (datos.contrasena.length < 4 || datos.contrasena.length > 10)) errores.contrasena = "La contraseña debe tener entre 4 y 10 caracteres.";
  if (!validarFechaNacimiento(datos.fechaNacimiento)) errores.fechaNacimiento = "Ingresa una fecha válida que no sea futura.";
  if (!["Administrador", "Vendedor", "Cliente"].includes(datos.rol)) errores.rol = "Selecciona un tipo de usuario.";
  const region = regionesData.find((r) => r.region === datos.region);
  if (!region) errores.region = "Selecciona una región.";
  if (!region?.comunas.includes(datos.comuna)) errores.comuna = "Selecciona una comuna de la región.";
  if (!datos.direccion.trim() || datos.direccion.trim().length > 300) errores.direccion = "Ingresa una dirección de hasta 300 caracteres.";
  if (!inicial && runActual && obtenerSesionUsuario()?.run === runActual && datos.rol !== "Administrador") errores.rol = "Conserva el rol administrador de tu propia cuenta.";
  return errores;
}

function guardarProductoAdmin(datos, idActual = null) {
  exigirAdministrador();
  const errores = validarProductoAdmin(datos, idActual);
  if (Object.keys(errores).length) return { errores };
  const productos = obtenerProductos();
  const indice = productos.findIndex((p) => p.id === idActual);
  if (idActual && indice < 0) throw new Error("El producto ya no existe.");
  const producto = {
    id: idActual || datos.id.trim().toUpperCase(), nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(), categoria: datos.categoria,
    precio: Number(datos.precio), stock: Number(datos.stock),
    stockCritico: datos.stockCritico === "" ? null : Number(datos.stockCritico),
    material: datos.material.trim(), img: imagenProductoSegura(datos.img.trim())
  };
  if (indice < 0) productos.push(producto);
  else productos[indice] = producto;
  guardarProductos(productos);
  return { producto };
}

async function guardarUsuarioAdmin(datos, runActual = null, inicial = false) {
  if (inicial) {
    if (hayAdministrador()) throw new Error("La administración ya está configurada. Inicia sesión.");
    datos = { ...datos, rol: "Administrador" };
  } else exigirAdministrador();
  const errores = validarUsuarioAdmin(datos, runActual, inicial);
  if (Object.keys(errores).length) return { errores };
  const contrasenaHash = datos.contrasena ? await generarHashContrasena(datos.contrasena) : null;
  // Se vuelve a comprobar el permiso después del cálculo asíncrono.
  if (inicial ? hayAdministrador() : !esAdministrador()) throw new Error("El acceso cambió. Recarga la página para continuar.");
  const erroresActuales = validarUsuarioAdmin(datos, runActual, inicial);
  if (Object.keys(erroresActuales).length) return { errores: erroresActuales };
  const usuarios = obtenerUsuariosRegistrados();
  const indice = usuarios.findIndex((u) => u.run === runActual);
  if (runActual && indice < 0) throw new Error("El usuario ya no existe.");
  const usuario = {
    run: runActual || datos.run.trim().toUpperCase(), nombre: datos.nombre.trim(),
    apellidos: datos.apellidos.trim(), correo: datos.correo.trim().toLowerCase(),
    fechaNacimiento: datos.fechaNacimiento, rol: datos.rol,
    region: datos.region, comuna: datos.comuna, direccion: datos.direccion.trim()
  };
  if (indice < 0) usuarios.push(usuario);
  else usuarios[indice] = usuario;
  guardarUsuariosRegistrados(usuarios);
  if (inicial || obtenerSesionUsuario()?.run === usuario.run) guardarSesionUsuario(usuario);
  return { usuario };
}

function eliminarProductoAdmin(id) {
  exigirAdministrador();
  guardarProductos(obtenerProductos().filter((p) => p.id !== id));
}

function eliminarUsuarioAdmin(run) {
  exigirAdministrador();
  if (obtenerSesionUsuario()?.run === run) throw new Error("No puedes eliminar tu propia cuenta.");
  const usuarios = obtenerUsuariosRegistrados();
  const usuario = usuarios.find((u) => u.run === run);
  if (usuario?.rol === "Administrador" && usuarios.filter((u) => u.rol === "Administrador").length < 2) throw new Error("Debe existir al menos un administrador.");
  guardarUsuariosRegistrados(usuarios.filter((u) => u.run !== run));
}
