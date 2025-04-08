import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const responseString = JSON.stringify(capturedJsonResponse);
        const responseLog = ` :: ${responseString}`;
        if ((logLine.length + responseLog.length) > 80) {
          const availableLength = 79 - responseLog.length;
          if (availableLength > 0) {
            logLine = logLine.slice(0, availableLength) + "…" + responseLog.slice(0, 80 - (availableLength + 1));
          } else {
            logLine = logLine.slice(0, 30) + "… Response too long";
          }
        } else {
          logLine += responseLog;
        }
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error capturado:", err); 
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message }); 
  });
  if (process.env.NODE_ENV === "development") { 
    log("Setting up Vite middleware for development...");
    await setupVite(app, server);
  } else {
    log("Serving static files for production...");
    serveStatic(app);
  }
  const port = 5000;
  server.listen({
    port,
    host: "127.0.0.1", 
  }, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });

})().catch(err => {
  console.error("Error durante el inicio del servidor:", err);
  process.exit(1); 
});