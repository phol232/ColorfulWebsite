export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const MICROSERVICE_URL =
    import.meta.env.VITE_MICROSERVICE_URL ?? "http://localhost:3000";

console.log("⚡️ API_URL =", API_URL);


console.log("⚡️ MICROSERVICE_URL =", MICROSERVICE_URL);
