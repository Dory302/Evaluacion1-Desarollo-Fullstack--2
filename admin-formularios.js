function campoAdmin(nombre, etiqueta, valor = "", opciones = {}) {
  const id = "admin-" + nombre;
  const atributos = ' id="' + id + '" name="' + nombre + '" class="control" aria-describedby="error-' + id + '"' +
    (opciones.opcional ? '' : ' required') + (opciones.disabled ? ' disabled' : '') +
    (opciones.max ? ' maxlength="' + opciones.max + '"' : '') +
    (opciones.min !== undefined ? ' min="' + opciones.min + '"' : '') +
    (opciones.step ? ' step="' + opciones.step + '"' : '') +
    (opciones.placeholder ? ' placeholder="' + escaparAdmin(opciones.placeholder) + '"' : '');
  const control = opciones.tipo === "textarea" ? '<textarea' + atributos + ' rows="3">' + escaparAdmin(valor) + '</textarea>'
    : opciones.opciones ? '<select' + atributos + '>' + (opciones.sinVacio ? '' : '<option value="">Seleccionar</option>') +
      opciones.opciones.map((opcion) => '<option value="' + escaparAdmin(opcion) + '"' + (opcion === valor ? ' selected' : '') + '>' + escaparAdmin(opcion) + '</option>').join("") + '</select>'
    : '<input' + atributos + ' type="' + (opciones.tipo || "text") + '" value="' + escaparAdmin(valor) + '"' + (opciones.tipo === "password" ? ' autocomplete="new-password"' : '') + '>';
  return '<div class="campo-admin' + (opciones.ancho ? ' campo-admin--ancho' : '') + '"><label for="' + id + '">' + escaparAdmin(etiqueta) +
    (opciones.opcional ? '<small>Opcional</small>' : '') + '</label>' + control + '<p class="campo-error" id="error-' + id + '" hidden></p></div>';
}

function leerFormularioAdmin(formulario) {
  return Object.fromEntries([...formulario.elements].filter((campo) => campo.name && campo.type !== "file").map((campo) => [campo.name, campo.value]));
}

function erroresFormularioAdmin(formulario, errores, campoUnico = null) {
  [...formulario.elements].filter((campo) => campo.name && (!campoUnico || campo.name === campoUnico)).forEach((campo) => {
    const error = document.getElementById("error-admin-" + campo.name);
    if (!error) return;
    campo.setAttribute("aria-invalid", errores[campo.name] ? "true" : "false");
    error.textContent = errores[campo.name] || "";
    error.hidden = !errores[campo.name];
  });
}

function validarEnVivoAdmin(formulario, validar) {
  const revisar = (evento) => {
    const campo = evento.target;
    if (!campo.name || campo.type === "file") return;
    erroresFormularioAdmin(formulario, validar(), campo.name);
  };
  formulario.addEventListener("input", revisar);
  formulario.addEventListener("change", revisar);
  formulario.addEventListener("focusout", revisar);
}

function enfocarErrorAdmin(formulario, errores) {
  erroresFormularioAdmin(formulario, errores);
  formulario.querySelector('[aria-invalid="true"]')?.focus();
}

function finalizarGuardadoAdmin(url, mensaje) {
  sessionStorage.setItem("mudraAvisoAdmin", mensaje);
  window.location.href = url;
}

function mostrarFormularioProductoAdmin(producto = null) {
  const p = producto || { id: "", nombre: "", categoria: "", precio: "", stock: "", stockCritico: "", descripcion: "", material: "", img: "" };
  document.getElementById("admin-vista").innerHTML = cabeceraAdmin(producto ? "Editar producto" : "Nuevo producto", producto ? p.id : "", enlaceAdmin("adminproductos.html", "Volver", "arrow-left")) +
    '<form class="formulario-admin" id="form-admin-producto" novalidate><div class="formulario-layout"><div><fieldset><legend>Información del producto</legend><div class="form-grid">' +
    campoAdmin("id", "Código", p.id, { disabled: !!producto }) +
    campoAdmin("categoria", "Categoría", p.categoria, { opciones: categoriasProductos }) +
    campoAdmin("nombre", "Nombre", p.nombre, { max: 100, ancho: true }) +
    campoAdmin("descripcion", "Descripción", p.descripcion, { tipo: "textarea", max: 500, ancho: true, opcional: true }) +
    campoAdmin("material", "Material", p.material, { max: 100, ancho: true, opcional: true }) +
    '</div></fieldset><fieldset><legend>Precio e inventario</legend><div class="form-grid">' +
    campoAdmin("precio", "Precio (CLP)", p.precio, { tipo: "number", min: 0, step: "any" }) +
    campoAdmin("stock", "Stock disponible", p.stock, { tipo: "number", min: 0, step: "1" }) +
    campoAdmin("stockCritico", "Stock crítico", p.stockCritico ?? "", { tipo: "number", min: 0, step: "1", opcional: true }) +
    '</div></fieldset><p class="aviso aviso--alerta" id="alerta-stock" role="status" hidden></p></div>' +
    '<aside class="imagen-editor"><fieldset><legend>Imagen</legend><div class="imagen-preview" id="preview-producto">' + imagenAdmin(p, true) + '</div>' +
    campoAdmin("img", "URL de imagen", p.img?.startsWith("data:") ? "" : p.img, { opcional: true, tipo: "url", placeholder: "https://..." }) +
    '<div class="campo-admin"><label for="admin-archivo">Subir imagen <small>Opcional · PNG, JPG o WebP, hasta 750 KB</small></label><input class="control" type="file" id="admin-archivo" accept="image/png,image/jpeg,image/webp" aria-describedby="error-admin-archivo"><p id="error-admin-archivo" class="campo-error" hidden></p></div>' +
    '<button class="boton-admin" type="button" id="quitar-imagen">' + iconoAdmin("image-off") + 'Quitar imagen</button></fieldset></aside></div>' +
    '<div class="formulario-pie">' + enlaceAdmin("adminproductos.html", "Cancelar", "") + '<button type="submit" class="boton-admin boton-admin--primario">' + iconoAdmin("save") + 'Guardar producto</button></div></form>';
  const formulario = document.getElementById("form-admin-producto");
  let imagenCargada = p.img?.startsWith("data:") ? p.img : null;
  let imagenPendiente = false;
  let imagenInvalida = false;
  const datos = () => ({ ...leerFormularioAdmin(formulario), img: imagenCargada ?? formulario.elements.img.value });
  const actualizarPreview = () => {
    document.getElementById("preview-producto").innerHTML = imagenAdmin({ nombre: formulario.elements.nombre.value || "Imagen del producto", img: datos().img }, true);
    actualizarIconosAdmin();
  };
  const actualizarAlerta = () => {
    const stock = formulario.elements.stock.value, critico = formulario.elements.stockCritico.value;
    const alerta = document.getElementById("alerta-stock");
    alerta.hidden = stock === "" || critico === "" || !Number.isFinite(Number(stock)) || !Number.isFinite(Number(critico)) || Number(stock) > Number(critico) || Number(stock) < 0 || Number(critico) < 0;
    alerta.textContent = "Stock bajo: la cantidad disponible es igual o inferior al stock crítico.";
  };
  formulario.elements.stock.addEventListener("input", actualizarAlerta);
  formulario.elements.stockCritico.addEventListener("input", actualizarAlerta);
  formulario.elements.img.addEventListener("input", () => { imagenCargada = null; actualizarPreview(); });
  document.getElementById("quitar-imagen").addEventListener("click", () => {
    imagenCargada = null; formulario.elements.img.value = ""; document.getElementById("admin-archivo").value = "";
    imagenInvalida = false; document.getElementById("error-admin-archivo").hidden = true; actualizarPreview();
  });
  document.getElementById("admin-archivo").addEventListener("change", async (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    const error = document.getElementById("error-admin-archivo");
    imagenInvalida = !["image/png", "image/jpeg", "image/webp"].includes(archivo.type) || archivo.size > 750 * 1024;
    error.textContent = "Selecciona una imagen PNG, JPG o WebP de hasta 750 KB.";
    error.hidden = !imagenInvalida;
    if (imagenInvalida) return;
    imagenPendiente = true;
    try {
      imagenCargada = await new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onload = () => resolve(lector.result);
        lector.onerror = () => reject(new Error("No se pudo leer la imagen."));
        lector.readAsDataURL(archivo);
      });
      formulario.elements.img.value = "";
      actualizarPreview();
    } catch (excepcion) {
      imagenInvalida = true; error.textContent = excepcion.message; error.hidden = false;
    } finally { imagenPendiente = false; }
  });
  validarEnVivoAdmin(formulario, () => validarProductoAdmin(datos(), producto?.id));
  actualizarAlerta();
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (imagenPendiente || imagenInvalida) { notificarAdmin("Revisa la imagen antes de guardar.", "error"); return; }
    try {
      const resultado = guardarProductoAdmin(datos(), producto?.id);
      if (resultado.errores) { enfocarErrorAdmin(formulario, resultado.errores); return; }
      finalizarGuardadoAdmin("adminproductos.html", "Producto guardado correctamente.");
    } catch (error) {
      notificarAdmin(error.name === "QuotaExceededError" ? "No hay espacio para guardar. Prueba con una imagen más pequeña o una URL." : error.message, "error");
    }
  });
}

function mostrarFormularioUsuarioAdmin(usuario = null, inicial = false) {
  const u = usuario || { run: "", nombre: "", apellidos: "", correo: "", fechaNacimiento: "", rol: inicial ? "Administrador" : "Cliente", region: "", comuna: "", direccion: "" };
  const propia = usuario && obtenerSesionUsuario()?.run === usuario.run;
  document.getElementById("admin-vista").innerHTML = (inicial ? "" : cabeceraAdmin(usuario ? "Editar usuario" : "Nuevo usuario", "", enlaceAdmin("adminusuario.html", "Volver", "arrow-left"))) +
    '<form class="formulario-admin" id="form-admin-usuario" novalidate><fieldset><legend>Datos personales</legend><div class="form-grid">' +
    campoAdmin("run", "RUN", u.run, { max: 9, disabled: !!usuario, placeholder: "Sin puntos ni guion" }) +
    campoAdmin("fechaNacimiento", "Fecha de nacimiento", u.fechaNacimiento, { tipo: "date", opcional: true }) +
    campoAdmin("nombre", "Nombre", u.nombre, { max: 50 }) +
    campoAdmin("apellidos", "Apellidos", u.apellidos, { max: 100 }) +
    '</div></fieldset><fieldset><legend>Cuenta y permisos</legend><div class="form-grid">' +
    campoAdmin("correo", "Correo electrónico", u.correo, { tipo: "email", max: 100 }) +
    campoAdmin("rol", "Tipo de usuario", u.rol || "Cliente", { opciones: ["Administrador", "Vendedor", "Cliente"], disabled: inicial || propia, sinVacio: true }) +
    campoAdmin("contrasena", usuario ? "Nueva contraseña" : "Contraseña", "", { tipo: "password", max: 10, opcional: !!usuario, placeholder: usuario ? "Conservar contraseña actual" : "Entre 4 y 10 caracteres" }) +
    '</div></fieldset><fieldset><legend>Dirección</legend><div class="form-grid">' +
    campoAdmin("region", "Región", u.region, { opciones: regionesData.map((r) => r.region) }) +
    campoAdmin("comuna", "Comuna", u.comuna, { opciones: regionesData.find((r) => r.region === u.region)?.comunas || [] }) +
    campoAdmin("direccion", "Dirección", u.direccion, { tipo: "textarea", max: 300, ancho: true }) +
    '</div></fieldset><div class="formulario-pie">' + enlaceAdmin(inicial ? "index.html" : "adminusuario.html", inicial ? "Volver a la tienda" : "Cancelar", "") +
    '<button type="submit" class="boton-admin boton-admin--primario">' + iconoAdmin("save") + (inicial ? "Crear cuenta administradora" : "Guardar usuario") + '</button></div></form>';
  const formulario = document.getElementById("form-admin-usuario");
  formulario.elements.region.addEventListener("change", () => {
    const region = regionesData.find((r) => r.region === formulario.elements.region.value);
    formulario.elements.comuna.innerHTML = '<option value="">Seleccionar</option>' + (region?.comunas || []).map((c) => '<option>' + escaparAdmin(c) + '</option>').join("");
    formulario.elements.comuna.disabled = !region;
    erroresFormularioAdmin(formulario, {}, "comuna");
  });
  formulario.elements.comuna.disabled = !u.region;
  validarEnVivoAdmin(formulario, () => validarUsuarioAdmin(leerFormularioAdmin(formulario), usuario?.run, inicial));
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const boton = formulario.querySelector('[type="submit"]');
    if (boton.disabled) return;
    boton.disabled = true;
    try {
      const resultado = await guardarUsuarioAdmin(leerFormularioAdmin(formulario), usuario?.run, inicial);
      if (resultado.errores) { enfocarErrorAdmin(formulario, resultado.errores); return; }
      finalizarGuardadoAdmin(inicial ? "admin.html" : "adminusuario.html", inicial ? "Tu cuenta administradora está lista." : "Usuario guardado correctamente.");
    } catch (error) {
      notificarAdmin(error.name === "QuotaExceededError" ? "No hay espacio disponible para guardar el usuario." : error.message, "error");
    } finally { boton.disabled = false; }
  });
}
