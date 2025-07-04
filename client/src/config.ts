export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const MICROSERVICE_URL =
    import.meta.env.VITE_MICROSERVICE_URL ?? "http://localhost:3000";

export const ML_SERVICE_URL =
    import.meta.env.VITE_ML_SERVICE_URL ?? "http://localhost:6020";

console.log("⚡️ API_URL =", API_URL);
console.log("⚡️ MICROSERVICE_URL =", MICROSERVICE_URL);
console.log("⚡️ ML_SERVICE_URL =", ML_SERVICE_URL);
