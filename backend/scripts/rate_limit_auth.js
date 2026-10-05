import axios from "axios";

const requests = Array.from({ length: 125 }, () =>
    axios.get("http://localhost:3000/auth/me", {
        validateStatus: () => true
    })
);

const responses = await Promise.all(requests);

for (const response of responses) {
    if (response.status === 429) continue;
    console.log(response.status, response.data);
}