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
  }
};
