let productoActivoVistaRapida = null;
let elementoConFocoAnterior = null;

function obtenerProductoVistaRapida(idProducto) {
  return obtenerProducto(idProducto);
}

function abrirVistaRapida(idProducto) {
  const producto = obtenerProductoVistaRapida(idProducto);
  const modal = document.getElementById("producto-modal");

  if (!producto || !modal) return;

  productoActivoVistaRapida = producto;
  elementoConFocoAnterior = document.activeElement;

  const imagen = document.getElementById("producto-modal-imagen");
  if (imagenProductoSegura(producto.img)) imagen.src = imagenProductoSegura(producto.img);
  else imagen.removeAttribute("src");
  document.getElementById("producto-modal-imagen").alt = producto.nombre;
  document.getElementById("producto-modal-codigo").textContent = `Código: ${producto.id}`;
  document.getElementById("producto-modal-titulo").textContent = producto.nombre;
  document.getElementById("producto-modal-precio").textContent = `$${formatearPrecio(producto.precio)}`;
  document.getElementById("producto-modal-detalle").textContent = producto.descripcion || "Sin descripción.";
  document.getElementById("producto-modal-material").textContent = producto.material || "No especificado";
  document.getElementById("producto-modal-stock").textContent = `${producto.stock} unidades disponibles`;

  const campoCantidad = document.getElementById("producto-modal-cantidad");
  campoCantidad.value = 1;
  campoCantidad.max = producto.stock;
  campoCantidad.disabled = producto.stock < 1;
  modal.querySelector("[data-modal-agregar]").disabled = producto.stock < 1;
  modal.querySelector("[data-modal-agregar]").textContent = producto.stock < 1 ? "Agotado" : "Agregar al carrito";

  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-abierta");

  window.requestAnimationFrame(() => {
    modal.querySelector("button[data-cerrar-modal]").focus();
  });
}

function cerrarVistaRapida() {
  const modal = document.getElementById("producto-modal");

  if (!modal || modal.hidden) return;

  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-abierta");
  productoActivoVistaRapida = null;

  if (elementoConFocoAnterior && document.contains(elementoConFocoAnterior)) {
    elementoConFocoAnterior.focus();
  }
}

function agregarDesdeVistaRapida() {
  if (!productoActivoVistaRapida || typeof agregarAlCarrito !== "function") return;

  const campoCantidad = document.getElementById("producto-modal-cantidad");
  if (!campoCantidad.reportValidity() || !campoCantidad.value || !Number.isInteger(Number(campoCantidad.value))) return;
  const cantidad = Number(campoCantidad.value);

  const idProducto = productoActivoVistaRapida.id;
  cerrarVistaRapida();
  agregarAlCarrito(idProducto, cantidad);
}

function inicializarVistaRapida() {
  document.addEventListener("click", (evento) => {
    const botonVistaRapida = evento.target.closest("[data-vista-rapida]");
    const botonCerrar = evento.target.closest("[data-cerrar-modal]");
    const botonAgregar = evento.target.closest("[data-modal-agregar]");

    if (botonVistaRapida) {
      evento.preventDefault();
      abrirVistaRapida(botonVistaRapida.dataset.vistaRapida);
      return;
    }

    if (botonCerrar) {
      cerrarVistaRapida();
      return;
    }

    if (botonAgregar) {
      agregarDesdeVistaRapida();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") cerrarVistaRapida();
  });

  if (window.lucide) window.lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", inicializarVistaRapida);
