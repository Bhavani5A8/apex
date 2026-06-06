export interface VehicleSpecs {
  horsepower: number;
  torque: number; // lb-ft
  zeroToSixty: number; // seconds
  topSpeed: number; // mph
  rangeOrMpg: string; // e.g. "396 miles (EPA)" or "24/32 MPG"
  batteryCapacity?: string; // e.g. "100 kWh" or "N/A"
  driveTrain: "AWD" | "RWD" | "FWD";
  fuelType: "Electric" | "Hybrid" | "Gasoline";
}

export interface VehicleColor {
  name: string;
  hex: string;
  price: number;
  previewColor: string; // CSS color or hex for wheels/elements
}

export interface VehicleWheel {
  name: string;
  price: number;
  previewUrl: string; // Text representation or visual key
}

export interface VehicleFeatureOption {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  type: "Sedan" | "SUV" | "Hypercar" | "Truck";
  price: number;
  image: string; // Standard SVG or path representation
  description: string;
  specs: VehicleSpecs;
  colors: VehicleColor[];
  wheels: VehicleWheel[];
  options: VehicleFeatureOption[];
  highlights: string[];
  // Database-driven optional specifications
  category?: string;
  specifications?: VehicleSpecs;
  fuel_type?: string;
  horsepower?: number;
  torque?: number;
  zeroToSixty?: string | number;
  top_speed?: number;
  rangeOrMpg?: string;
  year?: number;
  engine_type?: string;
  transmission?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestedVehicles?: string[]; // IDs of vehicles matched
}
