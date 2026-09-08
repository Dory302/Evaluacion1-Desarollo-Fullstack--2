function renderizarCatalogo() {
  document.querySelectorAll("[data-productos-catalogo]").forEach((contenedor) => {
    const productos = obtenerProductos();
    const limite = Number(contenedor.dataset.limite) || productos.length;
    contenedor.replaceChildren();
    productos.slice(0, limite).forEach((producto) => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "producto-card";
      const imagenCaja = document.createElement("div");
      imagenCaja.className = "img-box";
      const imagen = document.createElement("img");
      const url = imagenProductoSegura(producto.img);
      if (url) imagen.src = url;
      imagen.alt = producto.nombre;
      const lupa = document.createElement("button");
      lupa.type = "button";
      lupa.className = "btn-vista-rapida";
      lupa.dataset.vistaRapida = producto.id;
      lupa.dataset.tooltip = "Vista rápida";
      lupa.setAttribute("aria-label", "Vista rápida de " + producto.nombre);
      lupa.innerHTML = '<i data-lucide="search" aria-hidden="true"></i>';
      imagenCaja.append(imagen, lupa);
      const titulo = document.createElement("h4");
      const enlace = document.createElement("a");
      enlace.href = "detalledelproducto.html?id=" + encodeURIComponent(producto.id);
      enlace.textContent = producto.nombre;
      titulo.append(enlace);
      const detalles = document.createElement("div");
      detalles.className = "detalles-card";
      const material = document.createElement("span");
      material.className = "attributes";
      material.textContent = producto.material || producto.categoria;
      const precio = document.createElement("span");
      precio.className = "precio";
      precio.textContent = "$" + formatearPrecio(producto.precio);
      detalles.append(material, precio);
      const agregar = document.createElement("button");
      agregar.className = "btn-agregar";
      agregar.type = "button";
      agregar.dataset.productoId = producto.id;
      agregar.disabled = producto.stock < 1;
      agregar.textContent = producto.stock < 1 ? "Agotado" : "Agregar al carrito";
      tarjeta.append(imagenCaja, titulo, detalles, agregar);
      contenedor.append(tarjeta);
    });
    if (!productos.length) {
      const vacio = document.createElement("p");
      vacio.textContent = "No hay productos disponibles.";
      contenedor.append(vacio);
    }
  });
  if (window.lucide) window.lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", renderizarCatalogo);
document.addEventListener("productos-actualizados", renderizarCatalogo);
window.addEventListener("storage", (evento) => {
  if (evento.key === CLAVE_PRODUCTOS || evento.key === null) renderizarCatalogo();
});
document.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-producto-id]");
  if (boton) agregarAlCarrito(boton.dataset.productoId);
});
