import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "sites_data.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Ensure data file exists
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ sites: [] }));
  }

  // API Routes
  app.get("/api/sites/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = JSON.parse(await fs.readFile(DATA_FILE, "utf-8"));
      const site = data.sites.find((s: any) => s.id === id);
      if (site) {
        res.json(site);
      } else {
        res.status(404).json({ error: "Site not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to read site" });
    }
  });

  app.post("/api/sites", async (req, res) => {
    try {
      const site = req.body;
      if (!site || !site.id) {
        return res.status(400).json({ error: "Invalid site data" });
      }

      const data = JSON.parse(await fs.readFile(DATA_FILE, "utf-8"));
      const index = data.sites.findIndex((s: any) => s.id === site.id);

      if (index !== -1) {
        data.sites[index] = site;
      } else {
        data.sites.push(site);
      }

      await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save site" });
    }
  });

  app.get("/api/sites", async (req, res) => {
    try {
      const data = JSON.parse(await fs.readFile(DATA_FILE, "utf-8"));
      res.json(data.sites);
    } catch (error) {
      res.status(500).json({ error: "Failed to list sites" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
