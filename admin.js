const vistaAdmin = document.body.dataset.adminVista;
const titulosAdmin = {
  inicio: "Resumen", productos: "Productos", "producto-nuevo": "Nuevo producto",
  "producto-editar": "Editar producto", "producto-detalle": "Detalle de producto",
  usuarios: "Usuarios", "usuario-nuevo": "Nuevo usuario", "usuario-editar": "Editar usuario",
  "usuario-detalle": "Detalle de usuario", ordenes: "Órdenes", "orden-detalle": "Detalle de orden"
};
let paginaListado = 1;
let eliminacionPendiente = null;
let focoDialogo = null;

function escaparAdmin(valor = "") {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[caracter]);
}

function iconoAdmin(nombre) {
  return '<i data-lucide="' + nombre + '" aria-hidden="true"></i>';
}

function actualizarIconosAdmin() {
  if (window.lucide) window.lucide.createIcons();
}

function precioAdmin(precio) {
  return "$" + Number(precio).toLocaleString("es-CL", { maximumFractionDigits: 2 });
}

function fechaAdmin(fecha) {
  return new Date(fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

function enlaceAdmin(url, texto, icono, primario = false) {
  return '<a class="boton-admin' + (primario ? ' boton-admin--primario' : '') + '" href="' + escaparAdmin(url) + '">' + (icono ? iconoAdmin(icono) : '') + escaparAdmin(texto) + '</a>';
}

function accionIcono(url, texto, icono) {
  return '<a class="boton-icono" href="' + escaparAdmin(url) + '" aria-label="' + escaparAdmin(texto) + '" data-tooltip="' + escaparAdmin(texto) + '">' + iconoAdmin(icono) + '</a>';
}

function cabeceraAdmin(titulo, subtitulo = "", acciones = "") {
  return '<div class="encabezado-pagina"><div><h1>' + escaparAdmin(titulo) + '</h1>' +
    (subtitulo ? '<p>' + escaparAdmin(subtitulo) + '</p>' : '') + '</div><div class="encabezado-acciones">' + acciones + '</div></div>';
}

function notificarAdmin(texto, tipo = "exito") {
  const aviso = document.getElementById("aviso-admin");
  if (!aviso) return;
  aviso.className = "aviso aviso--" + tipo;
  aviso.textContent = texto;
  aviso.hidden = false;
}

function imagenAdmin(producto, grande = false) {
  const url = imagenProductoSegura(producto.img);
  return url ? '<img src="' + escaparAdmin(url) + '" alt="' + escaparAdmin(producto.nombre) + '"' + (grande ? '' : ' loading="lazy"') + '>'
    : '<span class="imagen-vacia">' + iconoAdmin("image") + '</span>';
}

function marcaAdmin() {
  const destino = obtenerSesionUsuario()?.rol === "Vendedor" ? "adminproductos.html" : "admin.html";
  return '<a class="admin-marca" href="' + destino + '"><span class="admin-marca__simbolo">' + iconoAdmin("store") + '</span><span><strong>Mudra</strong><small>ADMINISTRACIÓN</small></span></a>';
}

function construirPanel(sesion) {
  const admin = sesion.rol === "Administrador";
  const seccion = vistaAdmin.startsWith("producto") ? "productos" : vistaAdmin.startsWith("usuario") ? "usuarios" : vistaAdmin.startsWith("orden") ? "ordenes" : "inicio";
  const entradas = [
    ...(admin ? [["inicio", "admin.html", "Resumen", "layout-dashboard"]] : []),
    ["productos", "adminproductos.html", "Productos", "package"],
    ["ordenes", "adminordenes.html", "Órdenes", "receipt-text"],
    ...(admin ? [["usuarios", "adminusuario.html", "Usuarios", "users"]] : [])
  ];
  document.getElementById("admin-root").innerHTML =
    '<button class="sidebar-fondo" tabindex="-1" aria-label="Cerrar menú" data-cerrar-sidebar></button>' +
    '<aside class="admin-sidebar" id="admin-sidebar" aria-label="Menú administrativo">' +
      marcaAdmin() + '<button class="boton-icono sidebar-cerrar" aria-label="Cerrar menú" data-cerrar-sidebar>' + iconoAdmin("x") + '</button>' +
      '<div class="sidebar-seccion">Gestión de tienda</div><nav class="admin-nav" aria-label="Administración">' +
      entradas.map(([id, url, texto, icono]) => '<a href="' + url + '"' + (seccion === id ? ' aria-current="page"' : '') + '>' + iconoAdmin(icono) + texto + '</a>').join("") +
      '</nav><div class="sidebar-pie"><a href="index.html">' + iconoAdmin("external-link") + 'Ver tienda</a>' +
      '<button type="button" data-cerrar-sesion>' + iconoAdmin("log-out") + 'Cerrar sesión</button></div></aside>' +
    '<div class="admin-area"><header class="admin-topbar"><div class="admin-topbar__titulo">' +
      '<button class="boton-icono menu-abrir" type="button" aria-controls="admin-sidebar" aria-expanded="false" aria-label="Abrir menú">' + iconoAdmin("menu") + '</button>' +
      '<span>Tienda Mudra / ' + escaparAdmin(titulosAdmin[vistaAdmin]) + '</span></div>' +
      '<div class="admin-identidad"><span class="avatar">' + escaparAdmin((sesion.nombre || "M").slice(0, 1).toUpperCase()) + '</span><div><strong>' + escaparAdmin(sesion.nombre) + '</strong><small>' + escaparAdmin(sesion.rol) + '</small></div></div></header>' +
      '<main class="admin-contenido" id="admin-contenido"><div id="aviso-admin" role="status" hidden></div><div id="admin-vista"></div></main></div>' +
    '<dialog id="confirmar-eliminacion" aria-labelledby="titulo-eliminacion"><h2 id="titulo-eliminacion">Eliminar registro</h2><p id="texto-eliminacion"></p>' +
      '<div class="formulario-pie"><button type="button" class="boton-admin" data-cancelar-eliminacion>Cancelar</button><button type="button" class="boton-admin boton-admin--peligro" data-confirmar-eliminacion>Eliminar</button></div></dialog>';
  document.querySelector(".menu-abrir").addEventListener("click", () => abrirSidebar(true));
  document.querySelectorAll("[data-cerrar-sidebar]").forEach((boton) => boton.addEventListener("click", () => abrirSidebar(false)));
  document.querySelector("[data-cerrar-sesion]").addEventListener("click", () => {
    cerrarSesionUsuario();
    window.location.href = "adminlogin.html";
  });
  document.querySelector("[data-cancelar-eliminacion]").addEventListener("click", () => document.getElementById("confirmar-eliminacion").close());
  document.getElementById("confirmar-eliminacion").addEventListener("close", () => {
    eliminacionPendiente = null;
    if (focoDialogo?.isConnected) focoDialogo.focus();
  });
  document.querySelector("[data-confirmar-eliminacion]").addEventListener("click", confirmarEliminacionAdmin);
}

function abrirSidebar(abierta) {
  document.body.classList.toggle("sidebar-abierta", abierta);
  document.querySelector(".menu-abrir")?.setAttribute("aria-expanded", String(abierta));
  document.querySelector(".admin-area").inert = abierta;
  if (abierta) document.querySelector(".sidebar-cerrar").focus();
  else document.querySelector(".menu-abrir").focus();
}

function estadoStock(producto) {
  if (producto.stock === 0) return '<span class="etiqueta etiqueta--rojo">Agotado</span>';
  if (producto.stockCritico !== null && producto.stockCritico !== undefined && producto.stock <= producto.stockCritico) return '<span class="etiqueta etiqueta--amarillo">Stock bajo</span>';
  return '<span class="etiqueta etiqueta--verde">Disponible</span>';
}

function filasProductosAdmin(productos) {
  return productos.map((p) => {
    const id = encodeURIComponent(p.id);
    const acciones = accionIcono("adminmostrarproducto.html?id=" + id, "Ver producto", "eye") +
      (esAdministrador() ? accionIcono("adminproductoeditar.html?id=" + id, "Editar producto", "pencil") +
      '<button type="button" class="boton-icono boton-icono--peligro" aria-label="Eliminar producto" data-tooltip="Eliminar producto" data-eliminar-producto="' + escaparAdmin(p.id) + '">' + iconoAdmin("trash-2") + '</button>' : '');
    return '<tr><td><div class="tabla-producto">' + imagenAdmin(p) + '<div><strong><a href="adminmostrarproducto.html?id=' + id + '">' + escaparAdmin(p.nombre) +
      '</a></strong><small>' + escaparAdmin(p.id) + '</small></div></div></td><td>' + escaparAdmin(p.categoria) + '</td><td class="numero">' +
      precioAdmin(p.precio) + '</td><td class="numero">' + p.stock + '</td><td>' + estadoStock(p) + '</td><td><div class="acciones-fila">' + acciones + '</div></td></tr>';
  }).join("");
}

function tablaProductosAdmin(productos) {
  return '<table><thead><tr><th>Producto</th><th>Categoría</th><th class="numero">Precio</th><th class="numero">Stock</th><th>Disponibilidad</th><th class="numero">Acciones</th></tr></thead><tbody>' + filasProductosAdmin(productos) + '</tbody></table>';
}

function estadoVacioAdmin(texto, icono = "search") {
  return '<div class="estado-vacio">' + iconoAdmin(icono) + '<p>' + escaparAdmin(texto) + '</p></div>';
}

function mostrarInicioAdmin() {
  const productos = obtenerProductos();
  const ordenes = obtenerOrdenes();
  const bajos = productos.filter((p) => p.stock === 0 || (p.stockCritico !== null && p.stock <= p.stockCritico));
  const metricas = [
    ["Productos", productos.length, "En el catálogo", "package"],
    ["Unidades", productos.reduce((total, p) => total + p.stock, 0), "En inventario", "boxes"],
    ["Stock bajo", bajos.length, "Productos por revisar", "triangle-alert"],
    ["Órdenes", ordenes.length, "Compras registradas", "receipt-text"]
  ];
  document.getElementById("admin-vista").innerHTML = cabeceraAdmin("Resumen de la tienda", "Inventario y actividad reciente", enlaceAdmin("adminproductonuevo.html", "Nuevo producto", "plus", true)) +
    '<section class="metricas" aria-label="Resumen de actividad">' + metricas.map(([texto, numero, descripcion, icono]) =>
      '<div class="metrica"><span>' + iconoAdmin(icono) + texto + '</span><strong>' + numero + '</strong><small>' + descripcion + '</small></div>').join("") + '</section>' +
    '<div class="seccion-titulo"><h2>Atención al inventario</h2><a href="adminproductos.html">Ver productos</a></div><div class="tabla-scroll">' +
    (bajos.length ? tablaProductosAdmin(bajos) : estadoVacioAdmin("El inventario está sobre los niveles críticos.", "circle-check")) + '</div>' +
    '<div class="seccion-titulo"><h2>Últimas órdenes</h2><a href="adminordenes.html">Ver órdenes</a></div><div class="tabla-scroll">' +
    (ordenes.length ? tablaOrdenesAdmin(ordenes.slice(0, 5)) : estadoVacioAdmin("Aún no hay órdenes registradas.", "receipt-text")) + '</div>';
}

function mostrarListadoAdmin(tipo) {
  paginaListado = 1;
  const acciones = esAdministrador() && tipo !== "ordenes" ? enlaceAdmin(tipo === "productos" ? "adminproductonuevo.html" : "adminusuarionuevo.html", tipo === "productos" ? "Nuevo producto" : "Nuevo usuario", "plus", true) : "";
  const filtro = tipo === "productos" ? '<select class="control" id="filtro-categoria" aria-label="Categoría"><option value="">Todas las categorías</option>' + categoriasProductos.map((c) => '<option>' + escaparAdmin(c) + '</option>').join("") + '</select><select class="control" id="filtro-stock" aria-label="Disponibilidad"><option value="">Todo el inventario</option><option value="bajo">Stock bajo</option><option value="agotado">Agotados</option></select>'
    : tipo === "usuarios" ? '<select class="control" id="filtro-rol" aria-label="Tipo de usuario"><option value="">Todos los perfiles</option><option>Administrador</option><option>Vendedor</option><option>Cliente</option></select>' : "";
  document.getElementById("admin-vista").innerHTML = cabeceraAdmin(titulosAdmin[tipo], tipo === "productos" ? "Catálogo e inventario" : tipo === "usuarios" ? "Cuentas y permisos" : "Compras de la tienda", acciones) +
    '<div class="filtros"><div class="busqueda">' + iconoAdmin("search") + '<label class="sr-only" for="buscar-admin">Buscar</label><input class="control" type="search" id="buscar-admin" placeholder="' +
    (tipo === "productos" ? "Buscar nombre o código..." : tipo === "usuarios" ? "Buscar nombre, RUN o correo..." : "Buscar orden o cliente...") + '"></div>' + filtro + '</div>' +
    '<div class="tabla-scroll" id="tabla-admin"></div><div class="paginacion"><span id="conteo-admin" role="status"></span><div><button type="button" class="boton-icono" id="pagina-anterior" aria-label="Página anterior">' + iconoAdmin("chevron-left") +
    '</button><span id="numero-pagina"></span><button type="button" class="boton-icono" id="pagina-siguiente" aria-label="Página siguiente">' + iconoAdmin("chevron-right") + '</button></div></div>';
  document.querySelectorAll(".filtros input, .filtros select").forEach((campo) => campo.addEventListener(campo.tagName === "SELECT" ? "change" : "input", () => {
    paginaListado = 1; actualizarListadoAdmin(tipo);
  }));
  document.getElementById("pagina-anterior").addEventListener("click", () => { paginaListado--; actualizarListadoAdmin(tipo); });
  document.getElementById("pagina-siguiente").addEventListener("click", () => { paginaListado++; actualizarListadoAdmin(tipo); });
  actualizarListadoAdmin(tipo);
}

function actualizarListadoAdmin(tipo) {
  const consulta = document.getElementById("buscar-admin").value.trim().toLocaleLowerCase("es");
  let registros;
  if (tipo === "productos") {
    const categoria = document.getElementById("filtro-categoria").value;
    const stock = document.getElementById("filtro-stock").value;
    registros = obtenerProductos().filter((p) =>
      (p.nombre + " " + p.id).toLocaleLowerCase("es").includes(consulta) && (!categoria || p.categoria === categoria) &&
      (!stock || (stock === "agotado" ? p.stock === 0 : p.stock === 0 || (p.stockCritico !== null && p.stock <= p.stockCritico))));
  } else if (tipo === "usuarios") {
    const rol = document.getElementById("filtro-rol").value;
    registros = obtenerUsuariosRegistrados().filter((u) => (u.nombre + " " + u.apellidos + " " + u.run + " " + u.correo).toLocaleLowerCase("es").includes(consulta) && (!rol || (u.rol || "Cliente") === rol));
  } else registros = obtenerOrdenes().filter((o) => (o.id + " " + o.cliente.nombre + " " + o.cliente.apellidos + " " + o.cliente.correo).toLocaleLowerCase("es").includes(consulta));
  const paginas = Math.max(1, Math.ceil(registros.length / 8));
  paginaListado = Math.max(1, Math.min(paginaListado, paginas));
  const inicio = (paginaListado - 1) * 8;
  const visibles = registros.slice(inicio, inicio + 8);
  document.getElementById("tabla-admin").innerHTML = !registros.length ? estadoVacioAdmin("No hay registros que coincidan con la búsqueda.") :
    tipo === "productos" ? tablaProductosAdmin(visibles) : tipo === "usuarios" ? tablaUsuariosAdmin(visibles) : tablaOrdenesAdmin(visibles);
  document.getElementById("conteo-admin").textContent = registros.length ? (inicio + 1) + "–" + Math.min(inicio + 8, registros.length) + " de " + registros.length + " registros" : "0 registros";
  document.getElementById("numero-pagina").textContent = paginaListado + " / " + paginas;
  document.getElementById("pagina-anterior").disabled = paginaListado <= 1;
  document.getElementById("pagina-siguiente").disabled = paginaListado >= paginas;
  actualizarIconosAdmin();
}

function tablaUsuariosAdmin(usuarios) {
  return '<table><thead><tr><th>Usuario</th><th>RUN</th><th>Correo</th><th>Perfil</th><th class="numero">Acciones</th></tr></thead><tbody>' + usuarios.map((u) => {
    const run = encodeURIComponent(u.run);
    return '<tr><td><div class="tabla-producto"><span class="avatar">' + escaparAdmin(u.nombre.slice(0, 1).toUpperCase()) + '</span><strong>' + escaparAdmin(u.nombre + " " + u.apellidos) +
      '</strong></div></td><td>' + escaparAdmin(u.run) + '</td><td>' + escaparAdmin(u.correo) + '</td><td><span class="etiqueta etiqueta--azul">' + escaparAdmin(u.rol || "Cliente") + '</span></td><td><div class="acciones-fila">' +
      accionIcono("adminusuariomostrar.html?run=" + run, "Ver usuario", "eye") + accionIcono("adminusuarioeditar.html?run=" + run, "Editar usuario", "pencil") +
      (obtenerSesionUsuario()?.run !== u.run ? '<button class="boton-icono boton-icono--peligro" type="button" aria-label="Eliminar usuario" data-tooltip="Eliminar usuario" data-eliminar-usuario="' + escaparAdmin(u.run) + '">' + iconoAdmin("trash-2") + '</button>' : '') + '</div></td></tr>';
  }).join("") + '</tbody></table>';
}

function tablaOrdenesAdmin(ordenes) {
  return '<table><thead><tr><th>Orden</th><th>Cliente</th><th>Fecha</th><th>Estado</th><th class="numero">Total</th><th class="numero">Detalle</th></tr></thead><tbody>' + ordenes.map((o) =>
    '<tr><td><a href="adminordendetalle.html?id=' + encodeURIComponent(o.id) + '">' + escaparAdmin(o.id) + '</a></td><td>' + escaparAdmin(o.cliente.nombre + " " + o.cliente.apellidos) +
    '</td><td>' + fechaAdmin(o.fecha) + '</td><td><span class="etiqueta etiqueta--verde">' + escaparAdmin(o.estado) + '</span></td><td class="numero">' + precioAdmin(o.total) +
    '</td><td class="numero">' + accionIcono("adminordendetalle.html?id=" + encodeURIComponent(o.id), "Ver orden", "eye") + '</td></tr>').join("") + '</tbody></table>';
}

function datosDetalleAdmin(pares) {
  return '<dl class="detalle-datos">' + pares.map(([etiqueta, valor]) => '<div><dt>' + escaparAdmin(etiqueta) + '</dt><dd>' + escaparAdmin(valor || "Sin información") + '</dd></div>').join("") + '</dl>';
}

function mostrarDetalleAdmin(tipo) {
  const parametros = new URLSearchParams(window.location.search);
  let html;
  if (tipo === "producto") {
    const p = obtenerProductos().find((item) => item.id === parametros.get("id"));
    if (!p) return mostrarNoEncontradoAdmin("producto", "adminproductos.html");
    html = cabeceraAdmin(p.nombre, p.id, enlaceAdmin("adminproductos.html", "Volver", "arrow-left") + (esAdministrador() ? enlaceAdmin("adminproductoeditar.html?id=" + encodeURIComponent(p.id), "Editar producto", "pencil", true) : "")) +
      '<div class="detalle-layout"><div class="imagen-preview">' + imagenAdmin(p, true) + '</div><section>' + estadoStock(p) + datosDetalleAdmin([
        ["Precio", precioAdmin(p.precio)], ["Categoría", p.categoria], ["Stock", String(p.stock)], ["Stock crítico", p.stockCritico == null ? "No definido" : String(p.stockCritico)], ["Material", p.material]
      ]) + '<p class="texto-detalle">' + escaparAdmin(p.descripcion || "Sin descripción.") + '</p></section></div>';
  } else if (tipo === "usuario") {
    const u = obtenerUsuariosRegistrados().find((item) => item.run === parametros.get("run"));
    if (!u) return mostrarNoEncontradoAdmin("usuario", "adminusuario.html");
    html = cabeceraAdmin(u.nombre + " " + u.apellidos, u.rol || "Cliente", enlaceAdmin("adminusuario.html", "Volver", "arrow-left") +
      enlaceAdmin("adminusuarioeditar.html?run=" + encodeURIComponent(u.run), "Editar usuario", "pencil", true)) + datosDetalleAdmin([
        ["RUN", u.run], ["Correo", u.correo], ["Fecha de nacimiento", u.fechaNacimiento || "No indicada"],
        ["Perfil", u.rol || "Cliente"], ["Región", u.region], ["Comuna", u.comuna], ["Dirección", u.direccion]
      ]);
  } else {
    const o = obtenerOrdenes().find((item) => item.id === parametros.get("id"));
    if (!o) return mostrarNoEncontradoAdmin("orden", "adminordenes.html");
    html = cabeceraAdmin(o.id, fechaAdmin(o.fecha), enlaceAdmin("adminordenes.html", "Volver", "arrow-left")) +
      datosDetalleAdmin([["Cliente", o.cliente.nombre + " " + o.cliente.apellidos], ["Correo", o.cliente.correo], ["Entrega", [o.cliente.direccion, o.cliente.comuna, o.cliente.region].join(", ")], ["Estado", o.estado]]) +
      '<div class="seccion-titulo"><h2>Productos</h2><strong>Total: ' + precioAdmin(o.total) + '</strong></div><div class="tabla-scroll"><table><thead><tr><th>Producto</th><th class="numero">Precio</th><th class="numero">Cantidad</th><th class="numero">Subtotal</th></tr></thead><tbody>' +
      o.items.map((item) => '<tr><td>' + escaparAdmin(item.nombre) + '</td><td class="numero">' + precioAdmin(item.precio) + '</td><td class="numero">' + item.cantidad + '</td><td class="numero">' + precioAdmin(item.precio * item.cantidad) + '</td></tr>').join("") + '</tbody></table></div>';
  }
  document.getElementById("admin-vista").innerHTML = html;
}

function mostrarNoEncontradoAdmin(tipo, enlace) {
  document.getElementById("admin-vista").innerHTML = cabeceraAdmin("Registro no encontrado", "Este " + tipo + " ya no está disponible.", enlaceAdmin(enlace, "Volver al listado", "arrow-left"));
}

function pedirEliminacionAdmin(tipo, id, boton) {
  exigirAdministrador();
  const registro = tipo === "producto" ? obtenerProductos().find((p) => p.id === id) : obtenerUsuariosRegistrados().find((u) => u.run === id);
  if (!registro) return;
  focoDialogo = boton;
  eliminacionPendiente = { tipo, id };
  document.getElementById("titulo-eliminacion").textContent = "Eliminar " + tipo;
  document.getElementById("texto-eliminacion").textContent = 'Se eliminará "' + registro.nombre + '". Esta acción no se puede deshacer. Las órdenes anteriores conservarán sus datos.';
  document.getElementById("confirmar-eliminacion").showModal();
  document.querySelector("[data-cancelar-eliminacion]").focus();
}

function confirmarEliminacionAdmin() {
  if (!eliminacionPendiente) return;
  try {
    const { tipo, id } = eliminacionPendiente;
    if (tipo === "producto") eliminarProductoAdmin(id);
    else eliminarUsuarioAdmin(id);
    document.getElementById("confirmar-eliminacion").close();
    if (vistaAdmin === "inicio") mostrarInicioAdmin();
    else actualizarListadoAdmin(vistaAdmin);
    notificarAdmin("El registro se eliminó correctamente.");
    document.getElementById("buscar-admin")?.focus();
    actualizarIconosAdmin();
  } catch (error) {
    document.getElementById("confirmar-eliminacion").close();
    notificarAdmin(error.message, "error");
  }
}

function accesoAdminPermitido(sesion) {
  return sesion?.rol === "Administrador" || (sesion?.rol === "Vendedor" && ["productos", "producto-detalle", "ordenes", "orden-detalle"].includes(vistaAdmin));
}

function inicializarAdmin() {
  const raiz = document.getElementById("admin-root");
  try {
    if (!hayAdministrador()) {
      const configurar = new URLSearchParams(window.location.search).get("configurar") === "1";
      if (vistaAdmin !== "inicio" || !configurar) { window.location.replace("adminlogin.html"); return; }
      raiz.innerHTML = '<main class="admin-inicial" id="admin-contenido">' + marcaAdmin() +
        cabeceraAdmin("Configurar administración", "Crea la primera cuenta administradora de Tienda Mudra.") +
        '<div id="aviso-admin" role="status" hidden></div><div id="admin-vista"></div></main>';
      mostrarFormularioUsuarioAdmin(null, true);
      actualizarIconosAdmin();
      return;
    }
    const sesion = obtenerSesionUsuario();
    if (!sesion) { window.location.replace("adminlogin.html"); return; }
    if (!accesoAdminPermitido(sesion)) {
      raiz.innerHTML = '<main class="admin-bloqueo" id="admin-contenido">' + iconoAdmin("shield-alert") + '<h1>Acceso restringido</h1><p>Tu perfil no tiene acceso a esta sección.</p>' +
        enlaceAdmin(sesion.rol === "Vendedor" ? "adminproductos.html" : "index.html", sesion.rol === "Vendedor" ? "Ver productos" : "Volver a la tienda", "arrow-left") +
        ' ' + enlaceAdmin("adminlogin.html", "Ingresar con otra cuenta", "log-in") + '</main>';
      actualizarIconosAdmin();
      return;
    }
    construirPanel(sesion);
    if (vistaAdmin === "inicio") mostrarInicioAdmin();
    else if (["productos", "usuarios", "ordenes"].includes(vistaAdmin)) mostrarListadoAdmin(vistaAdmin);
    else if (vistaAdmin.endsWith("-detalle")) mostrarDetalleAdmin(vistaAdmin.split("-")[0]);
    else if (vistaAdmin.startsWith("producto-")) {
      const id = new URLSearchParams(window.location.search).get("id");
      const producto = vistaAdmin === "producto-editar" ? obtenerProductos().find((p) => p.id === id) : null;
      if (vistaAdmin === "producto-editar" && !producto) mostrarNoEncontradoAdmin("producto", "adminproductos.html");
      else mostrarFormularioProductoAdmin(producto);
    } else {
      const run = new URLSearchParams(window.location.search).get("run");
      const usuario = vistaAdmin === "usuario-editar" ? obtenerUsuariosRegistrados().find((u) => u.run === run) : null;
      if (vistaAdmin === "usuario-editar" && !usuario) mostrarNoEncontradoAdmin("usuario", "adminusuario.html");
      else mostrarFormularioUsuarioAdmin(usuario);
    }
    const mensaje = sessionStorage.getItem("mudraAvisoAdmin");
    if (mensaje) { notificarAdmin(mensaje); sessionStorage.removeItem("mudraAvisoAdmin"); }
    actualizarIconosAdmin();
  } catch (error) {
    raiz.innerHTML = '<main class="admin-bloqueo"><h1>No se pudo abrir el panel</h1><p>' + escaparAdmin(error.message) + '</p>' + enlaceAdmin("index.html", "Volver a la tienda", "arrow-left") + '</main>';
  }
}

document.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-eliminar-producto], [data-eliminar-usuario]");
  if (!boton) return;
  try {
    pedirEliminacionAdmin(boton.dataset.eliminarProducto !== undefined ? "producto" : "usuario", boton.dataset.eliminarProducto ?? boton.dataset.eliminarUsuario, boton);
  } catch (error) { notificarAdmin(error.message, "error"); }
});

document.addEventListener("keydown", (evento) => {
  if (!document.body.classList.contains("sidebar-abierta")) return;
  if (evento.key === "Escape") abrirSidebar(false);
  if (evento.key === "Tab") {
    const elementos = [...document.querySelectorAll(".admin-sidebar a, .admin-sidebar button")].filter((el) => el.getClientRects().length);
    const primero = elementos[0], ultimo = elementos[elementos.length - 1];
    if (evento.shiftKey && document.activeElement === primero) { evento.preventDefault(); ultimo.focus(); }
    else if (!evento.shiftKey && document.activeElement === ultimo) { evento.preventDefault(); primero.focus(); }
  }
});

window.matchMedia("(min-width: 901px)").addEventListener("change", (evento) => {
  if (evento.matches && document.body.classList.contains("sidebar-abierta")) abrirSidebar(false);
});

window.addEventListener("storage", (evento) => {
  if (evento.key === CLAVE_SESION_USUARIO || evento.key === CLAVE_USUARIOS_REGISTRADOS || evento.key === null) {
    const sesion = obtenerSesionUsuario();
    if (!accesoAdminPermitido(sesion)) window.location.replace("adminlogin.html");
  }
  if ([CLAVE_PRODUCTOS, CLAVE_ORDENES, CLAVE_USUARIOS_REGISTRADOS].includes(evento.key) && document.getElementById("tabla-admin")) actualizarListadoAdmin(vistaAdmin);
});

document.addEventListener("DOMContentLoaded", inicializarAdmin);
