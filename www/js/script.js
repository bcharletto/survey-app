//import { Share } from '@capacitor/share';
//import { Geolocation } from '@capacitor/geolocation';



const baseUrl = "https://censo.develotion.com";

//let idDepartamento;
let mapLayers;
let tokenUsuario;
let idUsuario;
let usuarioLogueado = false;
let latitudOrigen;
let longitudOrigen;
let map;
let censadosInterior = 0;
let censadosTotales = 0;
let censadosMvd = 0;
const arregloOcupacionIdNombre = [];
let ciudadesTotales = [];
let personasCensadas = [];

navigator.geolocation.getCurrentPosition(GuardarPosicionDispositivo, mostrarError);

const $ = {};

iniciarApp();

function iniciarApp() {

  guardarelementos();
  agregarEventos();
  // setTimeout(() => mostrarMapa(), 5000);
  // setTimeout(() => mostrarCiudadesCensadas(), 2000);
  

  

}

function validarSesion(path) {
  if (path !== "/login" && path !== "/registro") {
    const sesionUsuario = obtenerSesionUsuario();
    if (sesionUsuario === null) {
      navegarPage("/login");
      return false;
    }
    return true;
  }
  return true;
}

function navegarPage(id) {
  $.ionRouter.push(id);
}

function guardarelementos() {
  $.ionRouter = document.querySelector("ion-router");
  $.ionMenu = document.querySelector("ion-menu");

  $.modalNuevaPersona = document.querySelector("ion-modal");

  $.formRegistroUsu = document.querySelector("#formRegistroUsu");
  $.formRegistroPersona = document.querySelector("#formRegistroPersona");

  $.formLogin = document.querySelector("#formLogin");

}

function agregarEventos() {
  $.ionRouter.addEventListener("ionRouteDidChange", manejarRuta);

  $.ionMenu
    .querySelectorAll("ion-item")
    .forEach(($item) => $item.addEventListener("click", cerrarMenu));

  $.ionMenu.querySelector("#logout").addEventListener("click", cerrarSesion);

  // document.querySelector("#btnAbrirModalPersona").addEventListener("click", abrirModalPersona);

  // $.modalNuevaPersona.querySelector("#btnCerrarModalPersona").addEventListener("click", cerrarModalPersona);

  $.formRegistroUsu.addEventListener("submit", manejarRegistroUsuario);

  $.formLogin.addEventListener("submit", manejarLoginUsuario);

  $.modalNuevaPersona.querySelector("#selDeptos").addEventListener("ionChange", obtenerCiudad);

  document.querySelector("#filtroOcupacion").addEventListener("ionChange", filtrarPorOcupacion);
  // $.modalNuevaPersona.querySelector("#selCiudades").addEventListener("click", obtenerCiudad);

  document.querySelector("#filtroOcupacion").addEventListener("ionCancel", obtenerPersonas);


}

function cerrarMenu() {
  $.ionMenu.close();
}

function cerrarSesion() {
  borrarLocalStorage();
  navegarPage("/login");
}

function manejarRuta(event) {
  const pathTo = event.detail.to;

  ocultarPaginas();
  const sesionValida = validarSesion(pathTo);

  if (sesionValida) {
    switch (pathTo) {
      case "/":
        activarPage("#page-home");
        iniciarPageHome(); // listado de personas?
        break;
      case "/login":
        activarPage("#page-login");
        iniciarPageLogin();
        break;
      case "/registro":
        activarPage("#page-registro");
        iniciarPageRegistro();
        break;
      case "/listado-personas":
        activarPage("#page-listado-personas");
        iniciarPageListarPersonas();
        break;
      case "/total-censados":
        activarPage("#page-total-censados");

        break;
      case "/mapa":
        activarPage("#page-mapa");
        iniciarPageMapa();
        break;
    }
  }
}

function iniciarPageHome() {
  console.log("iniciar page-home");
}

function iniciarPageLogin() {
  console.log("iniciar page-login");
}

function iniciarPageRegistro() {
  console.log("iniciar page-registro");
}

function iniciarPageListarPersonas() {
  console.log("iniciar page-listado-personas");
}

function iniciarPageListarPersonas() {
  console.log("iniciar page-total-censados");
}

function iniciarPageMapa() {
  console.log("iniciar page-mapa");
  setTimeout(() => mostrarMapa(), 7000);
  
}

function activarPage(id) {
  document.querySelector(id).classList.add("page-active");
}

function ocultarPaginas() {
  document.querySelectorAll("ion-page").forEach(function (page) {
    page.classList.remove("page-active");
  });
}

function manejarRegistroUsuario(event) {
  event.preventDefault();

  const datos = leerFormRegistro();
  console.log("registro", datos);

  registrarUsuario(datos);
}

function leerFormRegistro() {
  return {
    usuario: $.formRegistroUsu.querySelector("#inpUsuRegistro").value,
    password: $.formRegistroUsu.querySelector("#inpPassRegistro").value,
  };
}
function registrarUsuario(usu) {
  const headers = {
    "Content-Type": "application/json",
  };

  const data = {
    usuario: usu.usuario,
    password: usu.password,

  };

  fetch(`${baseUrl}/usuarios.php`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  })
    .then(apiToJson)
    .then(function (jsonResponse) {
      console.log(jsonResponse);
      navegarPage("/login");
    })
    .catch(function (error) {
      console.warn(error);
    });
}

function manejarLoginUsuario(event) {
  event.preventDefault();

  const datos = leerFormLogin();

  loginUsuario(datos);
}

function leerFormLogin() {
  return {
    usuario: $.formLogin.querySelector("#inpUsuLogin").value,
    password: $.formLogin.querySelector("#inpPassLogin").value,
  };
}

function loginUsuario(usu) {
  const headers = {
    "Content-Type": "application/json",
  };

  const data = {
    usuario: usu.usuario,
    password: usu.password,
  };

  fetch(`${baseUrl}/login.php`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  })
    .then(jsonResponse => jsonResponse.json())
  
    .then(function (jsonResponse) {
      if(jsonResponse.codigo != 200) {
        mostrarError(jsonResponse.mensaje);
      } else {
        console.log(jsonResponse);
        tokenUsuario = jsonResponse.apiKey;
        guardarSesionUsuario();
        idUsuario = jsonResponse.id;
        guardarIdUsuario();
        navegarPage("/listado-personas");
        obtenerPersonas();
        obtenerCiudades();
        
        
  
        obtenerOcupaciones();
      }
      
      
      
    }
    )
    // .catch((mostrarError))
    


}

function obtenerDepartamentos() {
  const headers = {
    "Content-Type": "application/json",
    "apikey": obtenerSesionUsuario(),
    "iduser": obtenerIdUsuario(),
  };

  fetch(`${baseUrl}/departamentos.php`, {
    method: "GET",
    headers: headers,
  })
    .then(apiToJson)
    .then(escribirDepartamentos)
    .catch(function (error) {
      console.warn(error);
    });
}

function escribirDepartamentos(jsonResponse) {
  console.log("departamentos", jsonResponse);

  let departamentosHtml = "";

  for (let depto of jsonResponse.departamentos) {
    departamentosHtml += `<ion-select-option value="${depto.id}">${depto.nombre}</ion-select-option>`;
  }
  $.formRegistroPersona.querySelector("#selDeptos").innerHTML = departamentosHtml;
}

function obtenerCiudades() {
  const headers = {
    "Content-Type": "application/json",
    "apikey": obtenerSesionUsuario(),
    "iduser": obtenerIdUsuario(),
  };

  fetch(`${baseUrl}/ciudades.php`, {
    method: "GET",
    headers: headers,
  })
    .then(function (rawResponse) {
      return rawResponse.json();
    })
    .then(cargarCiudades)
    .catch(function (error) {
      console.warn(error);
    });
}

function cargarCiudades(jsonResponse) {
  ciudadesTotales = jsonResponse.ciudades;
}



function obtenerCiudad() {

  const idDepto = $.modalNuevaPersona.querySelector("#selDeptos").value;

  const headers = {
    "Content-Type": "application/json",
    "apikey": obtenerSesionUsuario(),
    "iduser": obtenerIdUsuario(),
  };

  fetch(`${baseUrl}/ciudades.php?idDepartamento=${idDepto}`, {
    method: "GET",
    headers: headers,
  })
    .then(function (rawResponse) {
      return rawResponse.json();
    })
    .then(escribirCiudad)
    .catch(function (error) {
      console.warn(error);
    });
}

function escribirCiudad(jsonResponse) {
  console.log("ciudades", jsonResponse);

  let ciudadesHtml = "";

  for (let ciudad of jsonResponse.ciudades) {
    ciudadesHtml += `<ion-select-option value="${ciudad.id}">${ciudad.nombre}</ion-select-option>`;
  }
  $.modalNuevaPersona.querySelector("#selCiudades").innerHTML = ciudadesHtml;

}

function guardarSesionUsuario() {
  guardarLocalStorage("tokenUsuario", tokenUsuario);
}

function guardarIdUsuario() {
  guardarLocalStorage("idUsuario", idUsuario);
}

function obtenerSesionUsuario() {
  return leerLocalStorage("tokenUsuario", null);
}

function obtenerIdUsuario() {
  return leerLocalStorage("idUsuario", null);
}

function filtrarPorOcupacion() {
  let numId = obtenerIdUsuario();

  let ocupacionFiltrada = document.querySelector("#filtroOcupacion").value;
  let personasHtml = "";
  console.log("valor", ocupacionFiltrada);
  const headers = {
    "Content-Type": "application/json",
    "apikey": obtenerSesionUsuario(),
    "iduser": numId,
  };

  fetch(`${baseUrl}/personas.php?idUsuario=${numId}`, {
    method: "GET",
    headers: headers,
  })
    .then(apiToJson)
    .then(function (jsonResponse) {
      if (ocupacionFiltrada !== null) {
        console.log("Personas", jsonResponse);
        for (let per of jsonResponse.personas) {
          if (per.ocupacion == ocupacionFiltrada) {
            personasHtml += generarHtmlPersonas(per);
          };
        }
      } else {
        escribirPersonas(jsonResponse);
      };


      document.querySelector("#listadoPersonas").innerHTML = personasHtml;


      obtenerOcupaciones();
    })
    .catch(mostrarError);
}

function obtenerPersonas() {

  let numId = obtenerIdUsuario();
  const headers = {
    "Content-Type": "application/json",
    "apikey": obtenerSesionUsuario(),
    "iduser": numId,
  };

  fetch(`${baseUrl}/personas.php?idUsuario=${numId}`, {
    method: "GET",
    headers: headers,
  })
    .then(apiToJson)
    .then(escribirPersonas)
    .then(obtenerCensados)
    .catch(mostrarError);
}

function escribirPersonas(jsonResponse) {
  console.log("Personas", jsonResponse);
  let PersonasHtml = "";

  for (let per of jsonResponse.personas) {
    PersonasHtml += generarHtmlPersonas(per);
  }


  document.querySelector("#listadoPersonas").innerHTML = PersonasHtml;

  agregarEventosPersonas();
  obtenerOcupaciones();
}

function generarHtmlPersonas(per) {

  console.log(per);
  return `

    <ion-card>
      <ion-card-header>
        <ion-card-subtitle>${per.nombre}</ion-card-subtitle>
        <ion-card-title>${per.departamento}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <p>Ciudad: ${per.ciudad}</p>
        <p>Fecha de Nacimiento: ${per.fechaNacimiento}</p>
        <p>Ocupación: ${per.ocupacion}</p>
      </ion-card-content>
      <ion-button fill="clear" onClick="eliminarPersona('${per.id}', '${per.departamento}')">Eliminar</ion-button>
    </ion-card>`;
}

function agregarEventosPersonas() {
  document.querySelector("#btnAbrirModalPersona").
    addEventListener('click', abrirModalPersona)

  document.querySelector("#btnCerrarModalPersona").
    addEventListener('click', cerrarModalPersona)

  document.querySelector("#btnIngresarPersona").
    addEventListener('click', manejarRegistroPersona)
}

function eliminarPersona(idPersona, idDepartamento) {
  let numId = obtenerIdUsuario();
  const headers = {
    "Content-Type": "application/json",
    "apikey": obtenerSesionUsuario(),
    "iduser": numId,
  };




  fetch(`${baseUrl}/personas.php?idCenso=${idPersona}`, {
    method: "DELETE",
    headers: headers

  })
    .then(apiToJson)
    .then(() => {
      if (idDepartamento === 3218) {
        censadosMvd--;
        censadosTotales--;
      } else {
        censadosInterior--;
        censadosTotales--;
      }
      mostrarToastSuccess("Persona Eliminada")
      obtenerPersonas()
    })
    .catch(mostrarToastError);
}

function abrirModalPersona() {
  $.modalNuevaPersona.present();
  obtenerDepartamentos();
  obtenerOcupaciones();
}

function cerrarModalPersona() {
  $.modalNuevaPersona.dismiss();
}

function obtenerOcupaciones() {
  const headers = {
    "Content-Type": "application/json",
    "apikey": obtenerSesionUsuario(),
    "iduser": obtenerIdUsuario(),
  };

  fetch(`${baseUrl}/ocupaciones.php`, {
    method: "GET",
    headers: headers,
  })
    .then(apiToJson)
    .then(escribirOcupaciones)

    .catch(mostrarError);
}

function obtenerOcupacionPorId(id) {
  for (let Ocupacion of arregloOcupacionIdNombre) {
    if (Ocupacion.id == id) {
      return Ocupacion.nombre;
    }
  }
}

function escribirOcupaciones(jsonResponse) {
  console.log("Ocupaciones", jsonResponse);

  let OcupacionesHtml = "";

  for (let Ocupacion of jsonResponse.ocupaciones) {
    OcupacionesHtml += `<ion-select-option value="${Ocupacion.id}">${Ocupacion.ocupacion}</ion-select-option>`;
    arregloOcupacionIdNombre.push({
      id: Ocupacion.id,
      nombre: Ocupacion.ocupacion
    })
  }

  $.formRegistroPersona.querySelector("#selOcupacion").innerHTML = OcupacionesHtml;
  document.querySelector("#filtroOcupacion").innerHTML = OcupacionesHtml;
}

function manejarRegistroPersona(event) {
  event.preventDefault();

  const datos = guardarDatosPersona();
  console.log("registro", datos);

  registrarPersona(datos);
}

function guardarDatosPersona() {
  return {
    nombre: $.formRegistroPersona.querySelector("#inpNombrePersona").value,
    idDepartamento: parseInt($.formRegistroPersona.querySelector("#selDeptos").value),
    idCiudad: parseInt($.formRegistroPersona.querySelector("#selCiudades").value),
    fechaNacimiento: $.formRegistroPersona.querySelector("#inpFecha").value,
    idOcupacion: parseInt($.formRegistroPersona.querySelector("#selOcupacion").value)

  };
}

function registrarPersona(datos) {
  let numId = obtenerIdUsuario();
  const headers = {
    "Content-Type": "application/json",
    "apikey": obtenerSesionUsuario(),
    "iduser": numId,
  };

  const fechaLimite = new Date();
  fechaLimite.setFullYear(fechaLimite.getFullYear() - 18);
  console.log(fechaLimite);


  if (Date.parse(datos.fechaNacimiento) < fechaLimite) {
    const data = {
      idUsuario: numId,
      nombre: datos.nombre,
      departamento: datos.idDepartamento,
      ciudad: datos.idCiudad,
      fechaNacimiento: datos.fechaNacimiento,
      ocupacion: datos.idOcupacion
    };
    console.log('nuevo Persona', data);
    fetch(`${baseUrl}/personas.php`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    })
      .then(apiToJson)
      .then(function (jsonResponse) {
        console.log("response:", jsonResponse);
        mostrarToastSuccess(jsonResponse.mensaje);
        obtenerPersonas();
        cerrarModalPersona();
      })
      .catch(mostrarError);
  } else {
    const data = {
      idUsuario: numId,
      nombre: datos.nombre,
      departamento: datos.idDepartamento,
      ciudad: datos.idCiudad,
      fechaNacimiento: datos.fechaNacimiento,
      ocupacion: 5
    };
    console.log('nuevo Persona', data);
    fetch(`${baseUrl}/personas.php`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    })
      .then(apiToJson)
      .then(function (jsonResponse) {
        console.log("response:", jsonResponse);
        mostrarToastSuccess(jsonResponse.mensaje);
        obtenerPersonas();
        cerrarModalPersona();
      })
      .catch(mostrarError);
  }





}

function mostrarToast(titulo, mensaje, color) {
  const $toast = document.createElement('ion-toast');
  $toast.header = titulo;
  $toast.message = mensaje;
  $toast.duration = 3000;
  $toast.color = color;

  document.body.appendChild($toast)
  $toast.present();
}

function mostrarToastSuccess(mensaje) {
  mostrarToast("Exito", mensaje, "success");
}

function mostrarToastError(mensaje) {
  mostrarToast("Error", mensaje, "danger");
}

function mostrarError(error) {
  console.warn(error);
  mostrarToastError(error);
}

function GuardarPosicionDispositivo(position) {
  console.log(position);
  latitudOrigen = position.coords.latitude;
  longitudOrigen = position.coords.longitude;
}

function mostrarMapa() {
  
  if (map) {
    map.setView([latitudOrigen, longitudOrigen], 13);
  } else {
    map = L.map('map').setView([latitudOrigen, longitudOrigen], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);
  }
  mapLayers = L.layerGroup().addTo(map);
  mapLayers.clearLayers();
  
}

function mostrarCiudadesCensadas() {

  mapLayers.clearLayers();

  const diametro = document.querySelector("#distanciaEnKm").value * 1000;

  var punto = L.circle([latitudOrigen, longitudOrigen], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.3,
    radius: diametro
  }).addTo(mapLayers);

  for (let i = 0; i < ciudadesTotales.length; i++) {
    for (let j = 0; j < personasCensadas.length; j++) {
      let distancia = map.distance([latitudOrigen, longitudOrigen], [ciudadesTotales[i].latitud, ciudadesTotales[i].longitud]);
      if (distancia < diametro && ciudadesTotales[i].id == personasCensadas[j].ciudad) {
        L.marker([ciudadesTotales[i].latitud, ciudadesTotales[i].longitud]).addTo(mapLayers);
      }
    }
  }
}


function obtenerCensados() {
  let numId = obtenerIdUsuario();
  const headers = {
    "Content-Type": "application/json",
    "apikey": obtenerSesionUsuario(),
    "iduser": numId,
  };

  fetch(`${baseUrl}/personas.php?idUsuario=${numId}`, {
    method: "GET",
    headers: headers
  })
    .then(apiToJson)
    .then(contarCensados)
    .catch(mostrarError);
}


function contarCensados(jsonResponse) {
  censadosMvd = 0;
  censadosInterior = 0;
  censadosTotales = 0;
  for (let censado of jsonResponse.personas) {
    if (censado.departamento === 3218) {
      censadosMvd++;
      personasCensadas.push(censado);
    } else {
      censadosInterior++;
      personasCensadas.push(censado);
    }
  };
  censadosTotales = censadosMvd + censadosInterior;
  escribirCensados();
}

function escribirCensados() {
  console.log(censadosTotales, censadosMvd, censadosInterior);
  document.querySelector("#totalCensados").innerHTML = censadosTotales;
  document.querySelector("#totalCensadosMvd").innerHTML = censadosMvd;
  document.querySelector("#totalCensadosInterior").innerHTML = censadosInterior;

}
