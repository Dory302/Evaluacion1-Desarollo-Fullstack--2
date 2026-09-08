// Validación básica de RUN chileno
function validarRUN(run) {
  if (!/^[0-9]{6,8}[0-9kK]{1}$/.test(run)) return false;
  let cuerpo = run.slice(0, -1);
  let dv = run.slice(-1).toUpperCase();
  let suma = 0, mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += mul * parseInt(cuerpo.charAt(i));
    mul = mul < 7 ? mul + 1 : 2;
  }
  let dvEsperado = 11 - (suma % 11);
  if (dvEsperado === 11) dvEsperado = "0";
  else if (dvEsperado === 10) dvEsperado = "K";
  else dvEsperado = dvEsperado.toString();
  return dv === dvEsperado;
}

// Validación básica de correo según dominios requeridos
function validarCorreo(correo) {
  return correo.length <= 100 && /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/.test(correo);
}

// Cargar select dinámico de Región y Comuna
function cargarRegiones(idRegion, idComuna) {
  let selectReg = document.getElementById(idRegion);
  let selectCom = document.getElementById(idComuna);
  if (!selectReg || !selectCom) return;

  selectReg.innerHTML = '<option value="">-- Seleccionar Región --</option>';
  regionesData.forEach(r => {
    selectReg.innerHTML += `<option value="${r.region}">${r.region}</option>`;
  });

  selectReg.addEventListener("change", function() {
    selectCom.innerHTML = '<option value="">-- Seleccionar Comuna --</option>';
    let encontrada = regionesData.find(r => r.region === this.value);
    if (encontrada) {
      encontrada.comunas.forEach(c => {
        selectCom.innerHTML += `<option value="${c}">${c}</option>`;
      });
    }
  });
}
