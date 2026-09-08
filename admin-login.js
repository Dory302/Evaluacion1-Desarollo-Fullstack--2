document.addEventListener("DOMContentLoaded", () => {
  const actualizarConfiguracion = () => {
    document.getElementById("configuracion-admin").hidden =
      obtenerUsuariosRegistrados().some((usuario) => usuario.rol === "Administrador");
  };
  actualizarConfiguracion();
  window.addEventListener("storage", (evento) => {
    if (evento.key === CLAVE_USUARIOS_REGISTRADOS || evento.key === null) actualizarConfiguracion();
  });
  document.getElementById("alternar-clave-admin").addEventListener("click", (evento) => {
    const boton = evento.currentTarget;
    const campo = document.getElementById("login-contrasena");
    const mostrar = campo.type === "password";
    campo.type = mostrar ? "text" : "password";
    const etiqueta = mostrar ? "Ocultar contraseña" : "Mostrar contraseña";
    boton.setAttribute("aria-label", etiqueta);
    boton.setAttribute("aria-pressed", String(mostrar));
    boton.dataset.tooltip = etiqueta;
    boton.innerHTML = '<i data-lucide="' + (mostrar ? "eye-off" : "eye") + '" aria-hidden="true"></i>';
    if (window.lucide) window.lucide.createIcons();
  });
  if (window.lucide) window.lucide.createIcons();
});
