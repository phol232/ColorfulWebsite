import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCategorySchema, insertProductSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiPrefix = "/api";

  // Categories endpoints
  app.get(`${apiPrefix}/categories`, async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post(`${apiPrefix}/categories`, async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create category" });
      }
    }
  });

  // Products endpoints
  app.get(`${apiPrefix}/products`, async (req: Request, res: Response) => {
    try {
      const { tab = "popular", category = "all" } = req.query;
      
      // Filter products based on query parameters
      let products;
      if (tab === "popular") {
        products = await storage.getPopularProducts();
      } else if (tab === "recent") {
        products = await storage.getRecentProducts();
      } else {
        products = await storage.getAllProducts();
      }
      
      // Filter by category if specified and not 'all'
      if (category !== "all") {
        products = products.filter(product => product.categoryId === parseInt(category as string));
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post(`${apiPrefix}/products`, async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(productData);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create product" });
      }
    }
  });

  // Orders endpoints
  app.post(`${apiPrefix}/orders`, async (req: Request, res: Response) => {
    try {
      const orderData = req.body;
      const newOrder = await storage.createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
