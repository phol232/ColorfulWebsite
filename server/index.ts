// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ──────────  Middleware de logging ──────────
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const resp = JSON.stringify(capturedJsonResponse);
        line += ` :: ${resp}`.slice(0, 80 - line.length);
      }
      log(line.slice(0, 80));
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // ──────  Manejador de errores ──────
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error capturado:", err);
    res
      .status(err.status || err.statusCode || 500)
      .json({ message: err.message || "Internal Server Error" });
  });

  // ──────  Vite (dev) o estáticos (prod) ──────
  if (process.env.NODE_ENV === "development") {
    log("Setting up Vite middleware for development...");
    await setupVite(app);          // 👈  solo un argumento
  } else {
    log("Serving static files for production...");
    serveStatic(app);
  }

  // ──────  Arrancar el servidor HTTP ──────
  const port = 5000;
  server.listen({ port, host: "127.0.0.1" }, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });
})().catch((err) => {
  console.error("Error durante el inicio del servidor:", err);
  process.exit(1);
});
