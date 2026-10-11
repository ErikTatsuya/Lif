export let API_BASE_URL = import.meta.env.API_BASE_URL;

if (!API_BASE_URL || API_BASE_URL.trim() === "") {
    throw new Error("A variável de ambiente API_BASE_URL não foi definida.");
}

if (API_BASE_URL.endsWith("/")) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}

console.log("URL da API:", API_BASE_URL);