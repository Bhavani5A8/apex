import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { Vehicle } from "./types";
import { VEHICLES } from "./data/vehicles";
import { resolveVehicleImage } from "./utils/imageMapper";

// Standard brand interface for normalized structure
export interface BrandEntity {
  id: string;
  brand_name: string;
  country: string;
  founded_year: number;
  logo: string;
  website: string;
}

// Category interface
export interface CategoryEntity {
  id: string;
  category_name: string;
  description: string;
}

// Review interface
export interface ReviewEntity {
  id: string;
  vehicle_id: string;
  rating: number;
  review: string;
  author: string;
  author_id: string;
  created_at: any; // Timestamp or date ISO
}

// Reservation interface
export interface ReservationEntity {
  id: string;
  vehicleId: string;
  vehicleName: string;
  brand: string;
  userId: string;
  userEmail: string;
  userName: string;
  lounge: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: any;
}

// Default static catalog components for seeding
export const DEFAULT_BRANDS: BrandEntity[] = [
  { id: "aether", brand_name: "Aether Motors", country: "United States", founded_year: 2018, logo: "⚡", website: "https://aether.example.com" },
  { id: "kallisto", brand_name: "Kallisto Performance", country: "Germany", founded_year: 2012, logo: "🔵", website: "https://kallisto.example.com" },
  { id: "kestrel", brand_name: "Kestrel Labs", country: "Germany", founded_year: 2021, logo: "🦅", website: "https://kestrel.example.com" },
  { id: "vanguard", brand_name: "Vanguard Overland", country: "Canada", founded_year: 2015, logo: "⛰️", website: "https://vanguard.example.com" },
  { id: "zephyr", brand_name: "Zephyr & Co.", country: "United Kingdom", founded_year: 1948, logo: "👑", website: "https://zephyr.example.com" }
];

export const DEFAULT_CATEGORIES: CategoryEntity[] = [
  { id: "cars", category_name: "Cars", description: "Standard high-performance luxury sedans" },
  { id: "trucks", category_name: "Trucks", description: "Bespoke all-terrain high-clearance utility overlanders" },
  { id: "suvs", category_name: "SUVs", description: "Three-row adventure exploration utility cruisers" },
  { id: "vans", category_name: "Vans", description: "Premium executive multi-purpose passenger vans" },
  { id: "buses", category_name: "Buses", description: "Elite level commercial group transportation" },
  { id: "motorcycles", category_name: "Motorcycles", description: "Uncompromising sports and hyper dual-wheel options" },
  { id: "electric", category_name: "Electric Vehicles", description: "Next-gen zero-emission ultra aerodynamic cruisers" },
  { id: "commercial", category_name: "Commercial Vehicles", description: "Bespoke short and long-distance cargo transporters" },
  { id: "construction", category_name: "Construction Vehicles", description: "Bespoke heavy-duty urban structure vehicles" },
  { id: "agricultural", category_name: "Agricultural Vehicles", description: "Uncompromising autonomous ground cultivation machinery" },
  { id: "future", category_name: "Future Categories", description: "Concept vertical takeoff and lunar/orbital rovers" }
];

export const dbService = {
  // SEED live firestore database collections
  async seedCatalogIfEmpty(): Promise<boolean> {
    const checkPath = "vehicles";
    try {
      let vSnap;
      try {
        vSnap = await getDocs(collection(db, "vehicles"));
      } catch (e) {
        console.error("Failed on getDocs elements of vehicles:", e);
        handleFirestoreError(e, OperationType.GET, checkPath);
        return false;
      }

      if (vSnap.empty) {
        console.log("Seeding Firestore databases with high-integrity presets...");
        
        // Seed Brands
        for (const brand of DEFAULT_BRANDS) {
          try {
            await setDoc(doc(db, "brands", brand.id), brand);
          } catch (e) {
            console.error(`Failed seeding brand ${brand.id}:`, e);
            handleFirestoreError(e, OperationType.WRITE, `brands/${brand.id}`);
          }
        }

        // Seed Categories
        for (const cat of DEFAULT_CATEGORIES) {
          try {
            await setDoc(doc(db, "categories", cat.id), cat);
          } catch (e) {
            console.error(`Failed seeding category ${cat.id}:`, e);
            handleFirestoreError(e, OperationType.WRITE, `categories/${cat.id}`);
          }
        }

        // Mapping standard vehicles categories to new normalized layout
        for (const vehicle of VEHICLES) {
          let firestoreCat = "cars";
          if (vehicle.type === "Truck") firestoreCat = "trucks";
          if (vehicle.type === "SUV") firestoreCat = "suvs";
          if (vehicle.id === "kestrel-gtr") firestoreCat = "electric"; // categorized under dynamic performance
          
          const seedItem = {
            id: vehicle.id,
            name: vehicle.name,
            brand: vehicle.brand,
            model: vehicle.name.split(" ").slice(1).join(" "),
            year: 2026,
            category: firestoreCat,
            price: vehicle.price,
            description: vehicle.description,
            engine_type: vehicle.specs.fuelType === "Electric" ? "Tri-Motor Electric Drive" : "V12 Twin Turbocharged Engine",
            fuel_type: vehicle.specs.fuelType,
            transmission: vehicle.specs.fuelType === "Electric" ? "Single-Speed Direct" : "8-Speed Race Pneumatic Dual-Clutch",
            horsepower: vehicle.specs.horsepower,
            torque: vehicle.specs.torque,
            mileage: 0,
            battery_capacity: vehicle.specs.batteryCapacity || "N/A",
            seating_capacity: vehicle.type === "SUV" ? 7 : (vehicle.type === "Truck" ? 5 : 4),
            dimensions: vehicle.type === "Truck" ? "231 x 80 x 78 inches" : "196 x 77 x 56 inches",
            weight: vehicle.type === "Truck" ? 6900 : 4400,
            top_speed: vehicle.specs.topSpeed,
            specifications: vehicle.specs,
            image: vehicle.image,
            images: [vehicle.image],
            videos: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          try {
            await setDoc(doc(db, "vehicles", seedItem.id), seedItem);
          } catch (e) {
            console.error(`Failed seeding vehicle ${seedItem.id}:`, e);
            handleFirestoreError(e, OperationType.WRITE, `vehicles/${seedItem.id}`);
          }

          // Dynamic Configurator Options Seeding: Colors
          for (const color of vehicle.colors) {
            const colorSlug = `${vehicle.id}-${color.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
            const colorDoc = {
              id: colorSlug,
              vehicleId: vehicle.id,
              name: color.name,
              hex: color.hex,
              price: color.price,
              previewColor: color.previewColor
            };
            try {
              await setDoc(doc(db, "vehicle_colors", colorSlug), colorDoc);
            } catch (e) {
              console.error(`Failed seeding color ${colorSlug}:`, e);
            }

            // Map beautiful variant images for each color of each car
            let variantUrl = vehicle.image;
            const normCol = color.name.toLowerCase();
            if (vehicle.id === "aether-plaid") {
              if (normCol.includes("grey")) variantUrl = "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=80";
              else if (normCol.includes("red")) variantUrl = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80";
              else if (normCol.includes("black")) variantUrl = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80";
              else if (normCol.includes("blue")) variantUrl = "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80";
            } else if (vehicle.id === "kallisto-gt") {
              if (normCol.includes("green")) variantUrl = "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80";
              else if (normCol.includes("silver")) variantUrl = "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80";
              else if (normCol.includes("black")) variantUrl = "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80";
            } else if (vehicle.id === "kestrel-gtr") {
              if (normCol.includes("chrome") || normCol.includes("silver")) variantUrl = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80";
              else if (normCol.includes("gold") || normCol.includes("yellow")) variantUrl = "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80";
            } else if (vehicle.id === "vanguard-ev") {
              if (normCol.includes("black")) variantUrl = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80";
              else if (normCol.includes("white")) variantUrl = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80";
            } else if (vehicle.id === "zephyr-sovereign") {
              if (normCol.includes("silver") || normCol.includes("platinum")) variantUrl = "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1200&q=80";
              else if (normCol.includes("blue") || normCol.includes("navy")) variantUrl = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80";
            } else if (vehicle.id === "kestrel-suv" || vehicle.id === "zephyr-ascent") {
              if (normCol.includes("green")) variantUrl = "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80";
              else if (normCol.includes("bronze") || normCol.includes("brown")) variantUrl = "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80";
            }

            const imgId = `${vehicle.id}-${colorSlug}-img`;
            const imageDoc = {
              id: imgId,
              vehicleId: vehicle.id,
              colorId: colorSlug,
              imageUrl: variantUrl,
              thumbnailUrl: variantUrl
            };
            try {
              await setDoc(doc(db, "vehicle_images", imgId), imageDoc);
            } catch (e) {
              console.error(`Failed seeding color image variant:`, e);
            }
          }

          // Seeding Wheels option lists
          for (const wheel of vehicle.wheels) {
            const wheelSlug = `${vehicle.id}-${wheel.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
            const wheelDoc = {
              id: wheelSlug,
              vehicleId: vehicle.id,
              name: wheel.name,
              price: wheel.price,
              previewUrl: wheel.previewUrl
            };
            try {
              await setDoc(doc(db, "vehicle_wheels", wheelSlug), wheelDoc);
            } catch (e) {
              console.error(`Failed seeding wheel option:`, e);
            }
          }

          // Seeding Interiors option lists (Black, Beige, Brown Leather per vehicle)
          const interiors = [
            { name: "Executive Charcoal Black Leather", price: 0 },
            { name: "Premium Off-White Beige Leather Lounge", price: 1500 },
            { name: "Bespoke Warm Saddle Brown Leather", price: 2500 }
          ];
          for (const int of interiors) {
            const intSlug = `${vehicle.id}-${int.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
            const intDoc = {
              id: intSlug,
              vehicleId: vehicle.id,
              name: int.name,
              price: int.price
            };
            try {
              await setDoc(doc(db, "vehicle_interiors", intSlug), intDoc);
            } catch (e) {
              console.error(`Failed seeding interior option:`, e);
            }
          }

          // Seeding Packages option lists (Standard, Luxury, Performance, Custom add-ons per vehicle)
          const basePackages = [
            { name: "Standard Equipment Line", description: "Bespoke aerodynamic composites and standard engineering calibrations.", price: 0 },
            { name: "Elite Luxury Package", description: "Integrated active climate lounge spacing, Alcantara roof trims, and dual haptic command panels.", price: 5000 },
            { name: "Apex Track Dynamics Package", description: "Custom dynamic chassis lifting dampers, track telemetry analytics, and active carbon stabilizers.", price: 8500 }
          ];
          const mergedPackages = [...basePackages];
          for (const opt of vehicle.options) {
            mergedPackages.push({
              name: opt.name,
              description: opt.description,
              price: opt.price
            });
          }

          for (const p of mergedPackages) {
            const pSlug = `${vehicle.id}-${p.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
            const pDoc = {
              id: pSlug,
              vehicleId: vehicle.id,
              name: p.name,
              description: p.description,
              price: p.price
            };
            try {
              await setDoc(doc(db, "vehicle_packages", pSlug), pDoc);
            } catch (e) {
              console.error(`Failed seeding package option:`, e);
            }
          }
        }
        
        // Seed pre-filled review indicators
        const seedReviews = [
          {
            id: "rev1", 
            vehicle_id: "aether-plaid", 
            rating: 5, 
            review: "Absolutely mind-bending acceleration! The tri-motor setup throws you to the back of your seat instantly.", 
            author: "Marcus Vance", 
            author_id: "seed_guy", 
            created_at: new Date().toISOString() 
          },
          {
            id: "rev2", 
            vehicle_id: "vanguard-ev", 
            rating: 5, 
            review: "Indestructible beast. Drove it through 12-inch water logs without a squeak. Built like an armored tank.", 
            author: "Sarah Sterling", 
            author_id: "seed_lady", 
            created_at: new Date().toISOString() 
          },
          {
            id: "rev3", 
            vehicle_id: "kestrel-gtr", 
            rating: 4, 
            review: "Pure combustion gold! The raw V12 is loud enough to rattle your skull on track days.", 
            author: "Aiden Chase", 
            author_id: "seed_guy2", 
            created_at: new Date().toISOString() 
          }
        ];
        
        for (const r of seedReviews) {
          try {
            await setDoc(doc(db, "reviews", r.id), r);
          } catch (e) {
            console.error(`Failed seeding review ${r.id}:`, e);
            handleFirestoreError(e, OperationType.WRITE, `reviews/${r.id}`);
          }
        }

        console.log("Seeding complete!");
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to check/seed database collections: ", e);
      throw e;
    }
  },

  // VEHICLE CRUD
  async getVehicles(): Promise<any[]> {
    const listPath = "vehicles";
    try {
      const snap = await getDocs(collection(db, listPath));
      return snap.docs.map(d => {
        const data = d.data();
        return {
          ...data,
          image: resolveVehicleImage({
            id: data.id,
            name: data.name,
            brand: data.brand,
            image: data.image,
            images: data.images
          })
        };
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, listPath);
      return [];
    }
  },

  async addVehicle(vehicle: any): Promise<void> {
    const path = `vehicles/${vehicle.id}`;
    try {
      await setDoc(doc(db, "vehicles", vehicle.id), {
        ...vehicle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateVehicle(id: string, updates: any): Promise<void> {
    const path = `vehicles/${id}`;
    try {
      await updateDoc(doc(db, "vehicles", id), {
        ...updates,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteVehicle(id: string): Promise<void> {
    const path = `vehicles/${id}`;
    try {
      await deleteDoc(doc(db, "vehicles", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // BRANDS CRUD
  async getBrands(): Promise<BrandEntity[]> {
    const listPath = "brands";
    try {
      const snap = await getDocs(collection(db, listPath));
      return snap.docs.map(d => d.data() as BrandEntity);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, listPath);
      return [];
    }
  },

  async addBrand(brand: BrandEntity): Promise<void> {
    const path = `brands/${brand.id}`;
    try {
      await setDoc(doc(db, "brands", brand.id), brand);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteBrand(id: string): Promise<void> {
    const path = `brands/${id}`;
    try {
      await deleteDoc(doc(db, "brands", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // CATEGORIES CRUD
  async getCategories(): Promise<CategoryEntity[]> {
    const listPath = "categories";
    try {
      const snap = await getDocs(collection(db, listPath));
      return snap.docs.map(d => d.data() as CategoryEntity);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, listPath);
      return [];
    }
  },

  async addCategory(category: CategoryEntity): Promise<void> {
    const path = `categories/${category.id}`;
    try {
      await setDoc(doc(db, "categories", category.id), category);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const path = `categories/${id}`;
    try {
      await deleteDoc(doc(db, "categories", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // REVIEWS CRUD
  async getReviews(vehicleId?: string): Promise<ReviewEntity[]> {
    const listPath = "reviews";
    try {
      if (vehicleId) {
        const q = query(collection(db, listPath), where("vehicle_id", "==", vehicleId));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as ReviewEntity);
      } else {
        const snap = await getDocs(collection(db, listPath));
        return snap.docs.map(d => d.data() as ReviewEntity);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, listPath);
      return [];
    }
  },

  async addReview(review: Omit<ReviewEntity, "id" | "created_at">): Promise<void> {
    const path = "reviews";
    try {
      const newDocRef = doc(collection(db, path));
      await setDoc(newDocRef, {
        ...review,
        id: newDocRef.id,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteReview(id: string): Promise<void> {
    const path = `reviews/${id}`;
    try {
      await deleteDoc(doc(db, "reviews", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // RESERVATIONS CRUD
  async getReservations(userId?: string): Promise<ReservationEntity[]> {
    const listPath = "reservations";
    try {
      if (userId) {
        const q = query(collection(db, listPath), where("userId", "==", userId));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as ReservationEntity);
      } else {
        const snap = await getDocs(collection(db, listPath));
        return snap.docs.map(d => d.data() as ReservationEntity);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, listPath);
      return [];
    }
  },

  async addReservation(res: Omit<ReservationEntity, "id" | "status" | "created_at">): Promise<void> {
    const path = "reservations";
    try {
      const newDocRef = doc(collection(db, path));
      await setDoc(newDocRef, {
        ...res,
        id: newDocRef.id,
        status: "pending",
        created_at: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateReservationStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<void> {
    const path = `reservations/${id}`;
    try {
      await updateDoc(doc(db, "reservations", id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteReservation(id: string): Promise<void> {
    const path = `reservations/${id}`;
    try {
      await deleteDoc(doc(db, "reservations", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // USER PROFILE
  async syncUserProfile(uid: string, email: string, name: string): Promise<any> {
    const path = `users/${uid}`;
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const role = email === "abhavanishankar989@gmail.com" ? "admin" : "user";
        const newUser = { id: uid, name, email, role };
        await setDoc(userRef, newUser);
        return newUser;
      }
      return userSnap.data();
    } catch (error) {
      // Gracefully handle if profile lookup fails
      console.error("User profile sync error:", error);
      return { id: uid, name, email, role: email === "abhavanishankar989@gmail.com" ? "admin" : "user" };
    }
  },

  async getAllUsers(): Promise<any[]> {
    const path = "users";
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(d => d.data());
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  // CONFIGURATOR CORE GETTERS
  async getVehicleColors(vehicleId: string): Promise<any[]> {
    try {
      const q = query(collection(db, "vehicle_colors"), where("vehicleId", "==", vehicleId));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => d.data());
      // Fallback sorting if seeded colors exist
      return items.sort((a, b) => a.price - b.price);
    } catch (e) {
      console.error("Error fetching vehicle_colors:", e);
      return [];
    }
  },

  async getVehicleWheels(vehicleId: string): Promise<any[]> {
    try {
      const q = query(collection(db, "vehicle_wheels"), where("vehicleId", "==", vehicleId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.error("Error fetching vehicle_wheels:", e);
      return [];
    }
  },

  async getVehicleInteriors(vehicleId: string): Promise<any[]> {
    try {
      const q = query(collection(db, "vehicle_interiors"), where("vehicleId", "==", vehicleId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.error("Error fetching vehicle_interiors:", e);
      return [];
    }
  },

  async getVehiclePackages(vehicleId: string): Promise<any[]> {
    try {
      const q = query(collection(db, "vehicle_packages"), where("vehicleId", "==", vehicleId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.error("Error fetching vehicle_packages:", e);
      return [];
    }
  },

  async getVehicleImages(vehicleId: string): Promise<any[]> {
    try {
      const q = query(collection(db, "vehicle_images"), where("vehicleId", "==", vehicleId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.error("Error fetching vehicle_images:", e);
      return [];
    }
  },

  // USER VEHICLE CONFIGURATIONS (PERSISTENCE)
  async saveVehicleConfiguration(config: { id: string; userId: string; vehicleId: string; colorId: string; wheelId: string; interiorId: string; packageIds: string[]; totalPrice: number }): Promise<void> {
    try {
      const ref = doc(db, "vehicle_configurations", config.id);
      await setDoc(ref, {
        ...config,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Error saving vehicle configuration:", e);
    }
  },

  async getVehicleConfiguration(userId: string, vehicleId: string): Promise<any | null> {
    try {
      const q = query(collection(db, "vehicle_configurations"), where("userId", "==", userId), where("vehicleId", "==", vehicleId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data();
      }
    } catch (e) {
      console.error("Error getting configuration:", e);
    }
    return null;
  },

  async getConfigurationsByUser(userId: string): Promise<any[]> {
    try {
      const q = query(collection(db, "vehicle_configurations"), where("userId", "==", userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.error("Error getting user configurations:", e);
      return [];
    }
  },

  // MANUAL COMPARISON ENGINE AUDIT RECORD TRACE
  async saveComparisonHistory(userId: string, comparedVehicleIds: string[]): Promise<void> {
    try {
      const id = `${userId}_${Date.now()}`;
      await setDoc(doc(db, "comparison_history", id), {
        id,
        userId,
        comparedVehicleIds,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error saving comparison history:", e);
    }
  },

  async getComparisonHistory(userId: string): Promise<any[]> {
    try {
      const q = query(collection(db, "comparison_history"), where("userId", "==", userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.error("Error fetching comparison history:", e);
      return [];
    }
  },

  // SHORTLIST FAVORITES WITH PERSISTENCE
  async toggleFavorite(userId: string, vehicleId: string): Promise<boolean> {
    try {
      const id = `${userId}_${vehicleId}`;
      const ref = doc(db, "favorites", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await deleteDoc(ref);
        return false; // Removed
      } else {
        await setDoc(ref, {
          id,
          userId,
          vehicleId
        });
        return true; // Added
      }
    } catch (e) {
      console.error("Error toggling favorite in db:", e);
      return false;
    }
  },

  async getFavorites(userId: string): Promise<string[]> {
    try {
      const q = query(collection(db, "favorites"), where("userId", "==", userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data().vehicleId as string);
    } catch (e) {
      console.error("Error getting favorites:", e);
      return [];
    }
  }
};
