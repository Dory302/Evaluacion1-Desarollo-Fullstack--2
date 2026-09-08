const CLAVE_CARRITO = "carrito";

function getCarrito() {
  try {
    const carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO));

    if (!Array.isArray(carrito)) return [];

    return carrito
      .filter((item) => item && typeof item.id === "string" && Number(item.cant) > 0)
      .map((item) => ({ id: item.id, cant: Number.parseInt(item.cant, 10) }));
  } catch {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

function obtenerProducto(idProducto) {
  return obtenerProductos().find((producto) => producto.id === idProducto);
}

function formatearPrecio(valor) {
  return Number(valor).toLocaleString("es-CL");
}

function agregarAlCarrito(idProducto, cantidad = 1) {
  const producto = obtenerProducto(idProducto);
  const unidades = Number(cantidad);

  if (!producto || !Number.isSafeInteger(unidades) || unidades < 1) {
    mostrarMensajeCarrito("Selecciona un producto disponible y una cantidad entera mayor que cero.");
    return false;
  }

  const carrito = getCarrito();
  const existente = carrito.find((item) => item.id === idProducto);
  if (unidades + (existente?.cant || 0) > producto.stock) {
    mostrarMensajeCarrito("Stock disponible de " + producto.nombre + ": " + producto.stock + " unidades.");
    return false;
  }

  if (existente) {
    existente.cant += unidades;
  } else {
    carrito.push({ id: idProducto, cant: unidades });
  }

  guardarCarrito(carrito);
  actualizarInterfazCarrito();
  abrirCarrito();
  document.querySelectorAll(".carrito-mensaje").forEach((mensaje) => mensaje.hidden = true);
  return true;
}

function mostrarMensajeCarrito(texto) {
  document.querySelectorAll(".carrito-dropdown").forEach((panel) => {
    let mensaje = panel.querySelector(".carrito-mensaje");
    if (!mensaje) {
      mensaje = document.createElement("p");
      mensaje.className = "carrito-mensaje";
      mensaje.setAttribute("role", "status");
      panel.querySelector(".carrito-dropdown__items").before(mensaje);
    }
    mensaje.textContent = texto;
    mensaje.hidden = false;
  });
  abrirCarrito();
}

function quitarDelCarrito(idProducto) {
  guardarCarrito(getCarrito().filter((item) => item.id !== idProducto));
  actualizarInterfazCarrito();
}

function obtenerResumenCarrito() {
  return getCarrito()
    .map((item) => {
      const producto = obtenerProducto(item.id);
      return producto ? { ...item, producto } : null;
    })
    .filter(Boolean);
}

function actualizarContador() {
  const totalItems = getCarrito().reduce((total, item) => total + item.cant, 0);

  document.querySelectorAll(".cant-carrito, #cant-carrito, #cart-count").forEach((elemento) => {
    elemento.textContent = totalItems;
  });
}

function renderCarritoDropdown() {
  const escapar = (valor) => String(valor ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const resumen = obtenerResumenCarrito();
  const total = resumen.reduce((suma, item) => suma + item.producto.precio * item.cant, 0);
  const contenido = resumen.length === 0
    ? '<p class="carrito-vacio">Tu carrito está vacío.</p>'
    : `<ul class="carrito-dropdown__lista">${resumen.map((item) => `
        <li class="carrito-dropdown__item">
          <img class="carrito-dropdown__imagen" src="${escapar(imagenProductoSegura(item.producto.img))}" alt="">
          <div class="carrito-dropdown__detalle">
            <strong>${escapar(item.producto.nombre)}</strong>
            <span class="carrito-dropdown__precio">$${formatearPrecio(item.producto.precio)}</span>
            <span class="carrito-dropdown__cantidad">Cantidad: ${item.cant}</span>
          </div>
          <button type="button" class="carrito-dropdown__eliminar" data-quitar-producto="${escapar(item.producto.id)}" aria-label="Quitar ${escapar(item.producto.nombre)} del carrito">&times;</button>
        </li>`).join("")}</ul>`;

  document.querySelectorAll(".carrito-dropdown__items").forEach((contenedor) => {
    contenedor.innerHTML = contenido;
  });

  document.querySelectorAll(".carrito-dropdown__total-valor").forEach((elemento) => {
    elemento.textContent = `$${formatearPrecio(total)}`;
  });
}

function actualizarInterfazCarrito() {
  actualizarContador();
  renderCarritoDropdown();
}

function abrirCarrito() {
  document.querySelectorAll(".carrito-menu").forEach((menu) => {
    const boton = menu.querySelector(".carrito-toggle");
    const desplegable = menu.querySelector(".carrito-dropdown");

    if (!boton || !desplegable) return;

    desplegable.hidden = false;
    boton.setAttribute("aria-expanded", "true");
  });
}

function cerrarCarrito() {
  document.querySelectorAll(".carrito-menu").forEach((menu) => {
    const boton = menu.querySelector(".carrito-toggle");
    const desplegable = menu.querySelector(".carrito-dropdown");

    if (!boton || !desplegable) return;

    desplegable.hidden = true;
    boton.setAttribute("aria-expanded", "false");
  });
}

function inicializarCarrito() {
  document.addEventListener("click", (evento) => {
    const botonCarrito = evento.target.closest(".carrito-toggle");
    const botonCerrar = evento.target.closest("[data-cerrar-carrito]");
    const botonQuitar = evento.target.closest("[data-quitar-producto]");

    if (botonCarrito) {
      const menu = botonCarrito.closest(".carrito-menu");
      const desplegable = menu.querySelector(".carrito-dropdown");

      if (desplegable.hidden) {
        abrirCarrito();
      } else {
        cerrarCarrito();
      }
      return;
    }

    if (botonCerrar) {
      cerrarCarrito();
      return;
    }

    if (botonQuitar) {
      quitarDelCarrito(botonQuitar.dataset.quitarProducto);
      return;
    }

    if (!evento.target.closest(".carrito-menu, .btn-agregar")) cerrarCarrito();
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") cerrarCarrito();
  });

  actualizarInterfazCarrito();
}

document.addEventListener("DOMContentLoaded", inicializarCarrito);
window.addEventListener("storage", (evento) => {
  if (evento.key === CLAVE_PRODUCTOS || evento.key === CLAVE_CARRITO || evento.key === null) actualizarInterfazCarrito();
});
