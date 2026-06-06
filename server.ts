import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

dotenv.config();

// Load Firebase configuration safely via Node's file system, avoiding ES import assertion quirks
const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Cache container to preserve Firestore daily read queries limits
interface CacheContainer {
  data: any[] | null;
  timestamp: number;
}
const VEHICLES_CACHE: CacheContainer = {
  data: null,
  timestamp: 0
};
const CACHE_TTL_MS = 15000; // 15 seconds Cache TTL

// Standard premium vehicles catalog duplicated here for server-side AI evaluation context
const SYSTEM_VEHICLES = [
  {
    id: "aether-plaid",
    name: "Aether Model Plaid",
    brand: "Aether Motors",
    type: "Sedan",
    price: 89990,
    fuelType: "Electric",
    horsepower: 1020,
    zeroToSixty: 1.99,
    rangeOrMpg: "396 miles (EPA)",
    description: "Peak luxury sedan electric performance. Tri-motor 0-60 in 1.99s, ultra aerodynamic executive silhouette."
  },
  {
    id: "kallisto-gt",
    name: "Kallisto E-Tron GT",
    brand: "Kallisto Performance",
    type: "Sedan",
    price: 114500,
    fuelType: "Electric",
    horsepower: 637,
    zeroToSixty: 3.1,
    rangeOrMpg: "249 miles (EPA)",
    description: "Expressive grand tourer with 800V ultra-fast charging capabilities and active air dynamics."
  },
  {
    id: "kestrel-gtr",
    name: "Kestrel Hypercar GTR",
    brand: "Kestrel Labs",
    type: "Hypercar",
    price: 1850000,
    fuelType: "Gasoline",
    horsepower: 1100,
    zeroToSixty: 2.3,
    rangeOrMpg: "12 / 18 MPG V12 Twin-Turbo",
    description: "Extreme, limited V12 pure-combustion track and road titan. Titanium monocoque, carbon epoxy chassis."
  },
  {
    id: "vanguard-ev",
    name: "Vanguard EV-T HyperTruck",
    brand: "Vanguard Overland",
    type: "Truck",
    price: 79500,
    fuelType: "Electric",
    horsepower: 835,
    zeroToSixty: 3.0,
    rangeOrMpg: "328 miles (EPA)",
    description: "Indestructible quad-motor utility overland truck. Bullet resistant armored plating, mobile solar output, 15\" air clearance."
  },
  {
    id: "zephyr-sovereign",
    name: "Zephyr Sovereign Hybrid",
    brand: "Zephyr & Co.",
    type: "Sedan",
    price: 145000,
    fuelType: "Hybrid",
    horsepower: 536,
    zeroToSixty: 4.4,
    rangeOrMpg: "480 miles (Hybrid Combined)",
    description: "Silk-smooth turbocharged presidential level executive plug-in hybrid with massive rear cinema screens."
  },
  {
    id: "kestrel-suv",
    name: "Zephyr Ascent Ultra SUV",
    brand: "Zephyr & Co.",
    type: "SUV",
    price: 92400,
    fuelType: "Hybrid",
    horsepower: 480,
    zeroToSixty: 4.8,
    rangeOrMpg: "22/28 MPG (Hybrid)",
    description: "Intelligent three-row high-utility luxury SUV with panoramic smart glass roof and heavy-terrain capabilities."
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", port: PORT });
  });

  // Server-Side Gemini API Copilot Route
  app.post("/api/copilot", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid array of messages" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not defined. Please add your key in the Settings > Secrets panel."
        });
      }

      // Initialize GoogleGenAI SDK as instructed in guidelines
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      // Craft the prompt and history structure
      const formattedHistory = messages.map(msg => {
        return `${msg.role === "user" ? "Client" : "Advisor"}: ${msg.text}`;
      }).join("\n");

      const systemInstruction = `You are "Sovereign AI Elite Advisor", a prestige executive sales consultant and automotive engineer for an enterprise luxury automotive platform.
Your job is to assist the client in finding their perfect elite vehicle from our current inventory, answering specs-heavy questions, analyzing their commute or performance demands, and matching them with a specific vehicle selection.

Available Inventory:
${JSON.stringify(SYSTEM_VEHICLES, null, 2)}

Instructions:
1. Always maintain a professional, dignified, helpful, and luxury-centric consulting tone. Speak directly to client inputs.
2. Formulate your conversational, scannable response in the "text" property. You are welcome to use helpful markdown formats for tables or specs but output valid JSON as the final container.
3. Critically analyze the user's prompt. If they express preferences (e.g., speed, luxury, electric, range, high-load truck capabilities), match them to one or more vehicle IDs from our inventory and list them in the "suggestedVehicles" string array. Only return IDs from the list: ["aether-plaid", "kallisto-gt", "kestrel-gtr", "vanguard-ev", "zephyr-sovereign", "kestrel-suv"].
4. If no specific vehicles match or the topic is generic introduction, return an empty array for suggestedVehicles.
5. Provide precise, technical answers about zero-to-sixty times, range, battery size, and horsepower where applicable. Show off your deep engineering expertise.`;

      const finalPrompt = `Conversation History:\n${formattedHistory}\n\nPlease reply to the final message with tailored guidance and vehicle matches.`;

      // Define Model as gemini-3.5-flash for basic text tasks
      const geminiResult = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: finalPrompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "The rich, natural text response written by the Sales Advisor."
              },
              suggestedVehicles: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                },
                description: "Array of exact matching vehicle IDs from inventory appropriate for references, else empty array."
              }
            },
            required: ["text", "suggestedVehicles"]
          }
        }
      });

      const responseText = geminiResult.text;
      if (!responseText) {
        throw new Error("No response string received from Gemini API");
      }

      const structuredOutput = JSON.parse(responseText.trim());
      res.json(structuredOutput);

    } catch (error: any) {
      console.error("Gemini Copilot Error:", error);
      res.status(500).json({
        error: "Advisor Engine Error: " + (error.message || error),
        text: "The Sovereign AI Advisor experienced a momentary connection lapse. However, our local engineering diagnostics are active and we are ready to respond to manual controls.",
        suggestedVehicles: []
      });
    }
  });

  // Advanced search tolerance & matching engine
  function matchesSearch(vehicle: any, queryStr: string): boolean {
    if (!queryStr) return true;
    
    const normQueryStr = queryStr.toLowerCase().trim();
    if (!normQueryStr) return true;

    // Gather text values to match against
    const targetFields = [
      vehicle.name || "",
      vehicle.brand || "",
      vehicle.model || "",
      vehicle.category || "",
      vehicle.description || "",
      vehicle.fuel_type || vehicle.fuelType || (vehicle.specs?.fuelType) || "",
      vehicle.transmission || "",
      vehicle.engine_type || ""
    ].map(f => f.toLowerCase());

    // Spaced and collapsed representations of targets
    const targetSpaced = targetFields.map(f => f.replace(/[-_./,&+#]/g, " ").replace(/\s+/g, " ").trim()).join(" ");
    const targetCollapsed = targetFields.map(f => f.replace(/[-_./,&\s+#]/g, "")).join(" ");

    // Spaced and collapsed query states
    const querySpacedTokens = normQueryStr.replace(/[-_./,&+#]/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(t => t.length > 0);
    const queryCollapsed = normQueryStr.replace(/[-_./,&\s+#]/g, "");

    // Rule 1: Collapsed matching (resolves x 5 -> x5, model 3 -> model3, etc.)
    if (queryCollapsed && targetCollapsed.includes(queryCollapsed)) {
      return true;
    }

    // Rule 2: Multi-token prefix/substring matching
    if (querySpacedTokens.length > 0) {
      const allTokensMatch = querySpacedTokens.every(qToken => {
        return (
          targetFields.some(tf => tf.includes(qToken)) || 
          targetSpaced.split(" ").some(tWord => tWord.startsWith(qToken) || tWord.includes(qToken))
        );
      });
      if (allTokensMatch) return true;
    }

    return false;
  }

  // Retrieve matching vehicles using cache TTL layers
  async function getCachedVehicles(): Promise<any[]> {
    const now = Date.now();
    if (VEHICLES_CACHE.data && (now - VEHICLES_CACHE.timestamp < CACHE_TTL_MS)) {
      return VEHICLES_CACHE.data;
    }

    try {
      const snap = await getDocs(collection(db, "vehicles"));
      const data = snap.docs.map(doc => doc.data());
      VEHICLES_CACHE.data = data;
      VEHICLES_CACHE.timestamp = now;
      return data;
    } catch (dbErr) {
      console.error("Firestore loading failure. Reverting to static dataset:", dbErr);
      if (VEHICLES_CACHE.data) {
        return VEHICLES_CACHE.data; // Return staled elements safely
      }
      return SYSTEM_VEHICLES;
    }
  }

  // Unified Search API Endpoint supporting q=, limit, offset params
  const searchHandler = async (req: express.Request, res: express.Response) => {
    try {
      const q = (req.query.q as string || "").trim();
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const vehicles = await getCachedVehicles();
      let filtered = vehicles;

      if (q) {
        filtered = vehicles.filter(v => matchesSearch(v, q));
      }

      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + limit);

      res.json({
        success: true,
        query: q,
        total,
        limit,
        offset,
        results: paginated
      });
    } catch (err: any) {
      console.error("Search API Routing Error:", err);
      res.status(500).json({
        success: false,
        error: "Internal Search Diagnostics Error",
        results: []
      });
    }
  };

  app.get("/vehicles/search", searchHandler);
  app.get("/api/vehicles/search", searchHandler);

  // Setup Vite development middleware OR serve static built files for production
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite Middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode serving static bundle");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise Dev Server live at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical Server Boot Failure:", err);
  process.exit(1);
});
