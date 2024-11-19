function crearUrl(url, params) {
    const urlObj = new URL(url);
    urlObj.search = new URLSearchParams(params).toString();
    return urlObj.href;
  }
  
  function paramsToObject(params) {
    const result = {};
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    return result;
  }
  
  function removeHash(str) {
    return str.replace("#", "");
  }
  
  function getUrlParams(url) {
    console.log(url)
    const decodedUrl = decodeURI(removeHash(url));
    const urlObj = new URL(decodedUrl);
    return paramsToObject(urlObj.searchParams);
  }
  
  function guardarLocalStorage(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
  }
  
  function leerLocalStorage(clave, valorPorDefecto) {
    const valorStorage = JSON.parse(localStorage.getItem(clave));
    if (valorStorage === null) {
      return valorPorDefecto;
    } else {
      return valorStorage;
    }
  }
  
  function apiToJson(rawResponse) {
    return rawResponse.json();
  }
  
  function borrarLocalStorage(){
    localStorage.clear();
  }