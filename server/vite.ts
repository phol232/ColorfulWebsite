// server/vite.ts
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

/** Helper de log para mantener el mismo formato que index.ts */
export const log = (...args: any[]) => console.log("[vite]", ...args);

// ────────────────────────────────────────────────────────────
//  Rutas importantes
// ────────────────────────────────────────────────────────────
const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(__dirname, "../client");          
const viteConfig = path.resolve(__dirname, "../vite.config.ts");  
const distDir    = path.resolve(__dirname, "../dist/public");     

// ────────────────────────────────────────────────────────────
//  Desarrollo: Vite como middleware
// ────────────────────────────────────────────────────────────
export async function setupVite(app: Express) {
  const vite = await createViteServer({
    root: clientRoot,               // aquí vive el front
    configFile: viteConfig,         // carga tu config completa
    server: { middlewareMode: true },
    appType: "custom",              // dejamos a Express servir HTML
    customLogger: {
      ...viteLogger,
      error: (msg, opt) => {
        viteLogger.error(msg, opt);
        process.exit(1);            // corta si hay errores graves
      },
    },
  });

  // monta middlewares de Vite
  app.use(vite.middlewares);

  // fallback: devuelve index.html transformado por Vite
  app.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const rawHtml = await fs.promises.readFile(
        path.resolve(clientRoot, "index.html"),
        "utf-8"
      );

      // cache‑bust para main.tsx en cada request
      const htmlWithNonce = rawHtml.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      const html = await vite.transformIndexHtml(url, htmlWithNonce);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// ────────────────────────────────────────────────────────────
//  Producción: servir estáticos
// ────────────────────────────────────────────────────────────
export function serveStatic(app: Express) {
  if (!fs.existsSync(distDir)) {
    throw new Error(
      `No se encontró el directorio de build: ${distDir}. Ejecuta 'npm run build' primero.`
    );
  }

  app.use(express.static(distDir, { index: false }));

  // fallback a index.html para rutas SPA
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distDir, "index.html"));
  });
}
