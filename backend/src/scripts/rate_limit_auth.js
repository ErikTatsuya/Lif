import axios from "axios";

const requests = Array.from({ length: 125 }, () =>
    axios.get("http://localhost:3000/auth/me", {
        validateStatus: () => true
    })
);

const responses = await Promise.all(requests);
let response;

let sucessfulRequests = 0;
let totalRequests = responses.length;
let blockedRequests = 0;

for (let i = 0;i<responses.length;i++) {
    response = responses[i];
    if (response.status === 429) {
        blockedRequests++;
        continue;
    };
    // if (response.status != 200 || response.status != 201) continue;
    sucessfulRequests++;
    console.log(`Requisição ${i}: status ${response.status}`);
}
console.log(`Requisições com sucesso: ${sucessfulRequests}`)
console.log(`Requisições bloqueadas: ${blockedRequests}`)
console.log(`Requisições totais: ${totalRequests}`)