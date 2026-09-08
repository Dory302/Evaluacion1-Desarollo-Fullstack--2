function crearElemento(etiqueta, clase, contenido) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (contenido) elemento.textContent = contenido;
  return elemento;
}

function mostrarMensajeCompra(mensaje, tipo) {
  const elemento = document.getElementById("mensaje-compra");
  if (!elemento) return;

  elemento.textContent = mensaje;
  elemento.className = `mensaje-compra mensaje-compra--${tipo}`;
  elemento.hidden = !mensaje;
}

function renderizarDatosCliente() {
  const contenedor = document.getElementById("estado-compra");
  if (!contenedor) return;

  const sesion = typeof obtenerSesionUsuario === "function" ? obtenerSesionUsuario() : null;
  contenedor.replaceChildren();

  if (!sesion) {
    const titulo = crearElemento("h2", "estado-compra__titulo", "Identificación para la compra");
    const texto = crearElemento("p", "estado-compra__texto", "Inicia sesión o crea tu cuenta antes de finalizar la compra.");
    const acciones = crearElemento("div", "estado-compra__acciones");
    const iniciarSesion = crearElemento("a", "boton estado-compra__accion", "Iniciar sesión");
    const registrarse = crearElemento("a", "boton-secundario estado-compra__accion", "Crear cuenta");

    iniciarSesion.href = "iniciosesion.html?destino=carrito";
    registrarse.href = "registrousuario.html?destino=carrito";
    acciones.append(iniciarSesion, registrarse);
    contenedor.append(titulo, texto, acciones);
    return;
  }

  const titulo = crearElemento("h2", "estado-compra__titulo", "Datos para la compra");
  const cliente = crearElemento("p", "estado-compra__cliente", `${sesion.nombre} ${sesion.apellidos}`);
  const correo = crearElemento("p", "estado-compra__texto", sesion.correo);
  const entrega = crearElemento("p", "estado-compra__texto", `${sesion.direccion}, ${sesion.comuna}, ${sesion.region}`);
  const cerrar = crearElemento("button", "boton-secundario estado-compra__cerrar", "Cerrar sesión");

  cerrar.type = "button";
  cerrar.addEventListener("click", () => {
    cerrarSesionUsuario();
    mostrarMensajeCompra("La sesión se cerró. Inicia sesión para finalizar la compra.", "info");
  });

  contenedor.append(titulo, cliente, correo, entrega, cerrar);
}

function renderizarCarritoPagina() {
  const contenedor = document.getElementById("items-carrito");
  const totalElemento = document.getElementById("total-pagar");
  const botonPagar = document.getElementById("pagar");
  const resumen = typeof obtenerResumenCarrito === "function" ? obtenerResumenCarrito() : [];
  const total = resumen.reduce((suma, item) => suma + item.producto.precio * item.cant, 0);

  if (!contenedor || !totalElemento || !botonPagar) return;

  contenedor.replaceChildren();

  if (resumen.length === 0) {
    contenedor.append(crearElemento("p", "carrito-pagina__vacio", "Tu carrito está vacío."));
  } else {
    resumen.forEach((item) => {
      const fila = crearElemento("article", "carrito-pagina__item");
      const imagen = document.createElement("img");
      const detalle = crearElemento("div", "carrito-pagina__detalle");
      const nombre = crearElemento("h2", "carrito-pagina__nombre", item.producto.nombre);
      const cantidad = crearElemento("p", "carrito-pagina__cantidad", `Cantidad: ${item.cant}`);
      const precio = crearElemento("strong", "carrito-pagina__precio", `$${formatearPrecio(item.producto.precio * item.cant)}`);

      imagen.src = item.producto.img;
      imagen.alt = item.producto.nombre;
      imagen.className = "carrito-pagina__imagen";
      detalle.append(nombre, cantidad);
      fila.append(imagen, detalle, precio);
      contenedor.append(fila);
    });
  }

  totalElemento.textContent = `$${formatearPrecio(total)}`;
  botonPagar.disabled = resumen.length === 0;
  renderizarDatosCliente();
}

function inicializarPaginaCarrito() {
  const botonPagar = document.getElementById("pagar");
  if (!botonPagar) return;

  botonPagar.addEventListener("click", () => {
    const sesion = typeof obtenerSesionUsuario === "function" ? obtenerSesionUsuario() : null;
    const resumen = typeof obtenerResumenCarrito === "function" ? obtenerResumenCarrito() : [];

    if (!sesion) {
      window.location.href = "iniciosesion.html?destino=carrito";
      return;
    }

    if (resumen.length === 0) {
      mostrarMensajeCompra("Agrega productos al carrito antes de finalizar la compra.", "error");
      return;
    }

    botonPagar.disabled = true;
    try {
      const orden = registrarOrden(sesion, getCarrito());
      guardarCarrito([]);
      actualizarInterfazCarrito();
      renderizarCarritoPagina();
      mostrarMensajeCompra(`Compra ${orden.id} registrada para ${sesion.nombre}. Gracias por preferir Tienda Mudra.`, "exito");
    } catch (error) {
      botonPagar.disabled = false;
      mostrarMensajeCompra(error.name === "QuotaExceededError" ? "No hay espacio disponible para registrar la compra." : error.message, "error");
    }
  });

  renderizarCarritoPagina();
}

document.addEventListener("DOMContentLoaded", inicializarPaginaCarrito);
document.addEventListener("sesion-actualizada", renderizarDatosCliente);
window.addEventListener("storage", (evento) => {
  if (evento.key === CLAVE_PRODUCTOS || evento.key === CLAVE_CARRITO || evento.key === null) renderizarCarritoPagina();
});
