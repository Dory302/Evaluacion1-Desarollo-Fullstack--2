const CLAVE_PRODUCTOS = "mudraProductos";
const CLAVE_ORDENES = "mudraOrdenes";
const categoriasProductos = ["Polerones", "Pantalones", "Accesorios", "Poleras", "Calzado", "Chaquetas"];

function leerColeccion(clave, iniciales = []) {
  const contenido = localStorage.getItem(clave);
  if (contenido === null) return iniciales.map((item) => ({ ...item }));
  const datos = JSON.parse(contenido);
  if (!Array.isArray(datos)) throw new Error("Los datos guardados no tienen un formato válido.");
  return datos;
}

function obtenerProductos() {
  const categorias = ["Polerones", "Pantalones", "Accesorios", "Poleras", "Calzado", "Chaquetas", "Accesorios", "Polerones"];
  return leerColeccion(CLAVE_PRODUCTOS, productosIniciales.map((producto, indice) => ({
    ...producto, categoria: categorias[indice]
  })));
}

function guardarProductos(productos) {
  localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos));
  document.dispatchEvent(new Event("productos-actualizados"));
}

function obtenerOrdenes() {
  return leerColeccion(CLAVE_ORDENES);
}

function imagenProductoSegura(valor) {
  if (!valor) return "";
  if (/^data:image\/(png|jpeg|webp|gif);base64,/i.test(valor)) return valor;
  try {
    const url = new URL(valor, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function registrarOrden(cliente, carrito) {
  const productos = obtenerProductos();
  if (!carrito.length) throw new Error("El carrito está vacío.");
  const cantidades = new Map();
  carrito.forEach((item) => {
    if (!Number.isSafeInteger(item.cant) || item.cant < 1) throw new Error("Revisa las cantidades del carrito.");
    cantidades.set(item.id, (cantidades.get(item.id) || 0) + item.cant);
  });
  const items = [...cantidades].map(([id, cant]) => {
    const item = { id, cant };
    const producto = productos.find((actual) => actual.id === item.id);
    if (!producto || !Number.isSafeInteger(item.cant) || item.cant < 1 || item.cant > producto.stock) {
      throw new Error(`Revisa la disponibilidad de ${producto?.nombre || item.id}.`);
    }
    return { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: item.cant, img: producto.img };
  });
  const orden = {
    id: `MUD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    fecha: new Date().toISOString(),
    estado: "Registrada",
    cliente: { nombre: cliente.nombre, apellidos: cliente.apellidos, correo: cliente.correo, direccion: cliente.direccion, comuna: cliente.comuna, region: cliente.region },
    items,
    total: items.reduce((total, item) => total + item.precio * item.cantidad, 0)
  };
  if (!Number.isFinite(orden.total)) throw new Error("El total de la compra excede el límite numérico.");
  // Se conserva el inventario anterior para recuperar una escritura incompleta.
  const inventarioAnterior = localStorage.getItem(CLAVE_PRODUCTOS);
  productos.forEach((producto) => {
    producto.stock -= items.filter((item) => item.id === producto.id).reduce((total, item) => total + item.cantidad, 0);
  });
  localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos));
  try {
    localStorage.setItem(CLAVE_ORDENES, JSON.stringify([orden, ...obtenerOrdenes()]));
  } catch (error) {
    if (inventarioAnterior === null) localStorage.removeItem(CLAVE_PRODUCTOS);
    else localStorage.setItem(CLAVE_PRODUCTOS, inventarioAnterior);
    throw error;
  }
  document.dispatchEvent(new Event("productos-actualizados"));
  return orden;
}
