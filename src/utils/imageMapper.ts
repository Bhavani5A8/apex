import aetherPlaidImg from "../assets/images/aether_plaid_1780560564012.png";
import heroCarImg from "../assets/images/hero_car_1780560548671.png";
import kallistoGtImg from "../assets/images/kallisto_gt_1780560578498.png";
import kestrelGtrImg from "../assets/images/kestrel_gtr_1780560597519.png";
import vanguardEvImg from "../assets/images/vanguard_ev_1780560612077.png";
import zephyrSovereignImg from "../assets/images/zephyr_sovereign_1780560631479.png";
import zephyrAscentImg from "../assets/images/zephyr_ascent_1780560658534.png";

export function getVibrantCarImage(brand: string, name: string): string {
  const normBrand = (brand || "").trim().toLowerCase();
  const normName = (name || "").trim().toLowerCase();

  // Highlight multi-keyword matching
  if (normBrand.includes("ferrari") || normName.includes("ferrari")) {
    return "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"; // Red Ferrari SF90
  }
  if (normBrand.includes("rolls") || normBrand.includes("royce") || normName.includes("rolls-royce")) {
    return "https://images.unsplash.com/photo-1631214500115-598bf2cb1d22?auto=format&fit=crop&w=800&q=80"; // Luxurious Rolls-Royce Phantom
  }
  if (normBrand.includes("lamborghini") || normName.includes("lamborghini")) {
    return "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=800&q=80"; // Green Lamborghini Huracan
  }
  if (normBrand.includes("bugatti") || normName.includes("bugatti")) {
    return "https://images.unsplash.com/photo-1600706432502-75aa0e123997?auto=format&fit=crop&w=800&q=80"; // Bugatti Chiron
  }
  if (normBrand.includes("porsche") || normName.includes("porsche")) {
    return "https://images.unsplash.com/photo-1611245801484-9df91e28b731?auto=format&fit=crop&w=800&q=80"; // Silver Porsche 911
  }
  if (normBrand.includes("aston") || normBrand.includes("martin") || normName.includes("aston martin")) {
    return "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80"; // Aston Martin Vantage
  }
  if (normBrand.includes("bentley") || normName.includes("bentley")) {
    return "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"; // Deep Blue Bentley Continental
  }
  if (normBrand.includes("maserati") || normName.includes("maserati")) {
    return "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80"; // Maserati GranTurismo
  }
  if (normBrand.includes("mclaren") || normName.includes("mclaren")) {
    return "https://images.unsplash.com/photo-1562591176-a28efbc2ff5d?auto=format&fit=crop&w=800&q=80"; // Orange McLaren Sport
  }
  if (normBrand.includes("jaguar") || normName.includes("jaguar")) {
    return "https://images.unsplash.com/photo-1618245467362-e230f3408a0d?auto=format&fit=crop&w=800&q=80"; // British Racing Green Jaguar F-Type
  }
  if (normBrand.includes("audi") || normName.includes("audi")) {
    if (normName.includes("r8")) {
      return "https://images.unsplash.com/photo-1606893995163-143522182d91?auto=format&fit=crop&w=800&q=80"; // Audi R8
    }
    return "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"; // Blue Audi Sedan
  }
  if (normBrand.includes("bmw") || normName.includes("bmw")) {
    return "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80"; // Elegant Dark BMW M4
  }
  if (normBrand.includes("mercedes") || normBrand.includes("benz") || normName.includes("mercedes") || normName.includes("amg")) {
    return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80"; // Mercedes-AMG GT
  }
  if (normBrand.includes("tesla") || normName.includes("tesla")) {
    return "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80"; // Pearl Tesla Model S
  }
  if (normBrand.includes("ford") || normName.includes("ford")) {
    if (normName.includes("raptor") || normName.includes("f-150") || normName.includes("f150") || normName.includes("truck")) {
      return "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80"; // Heavy duty Ford layout
    }
    return "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80"; // Red Ford Mustang GT
  }
  if (normBrand.includes("chevrolet") || normBrand.includes("chevy") || normName.includes("corvette") || normName.includes("chevrolet")) {
    return "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80"; // Chevrolet Corvette Stingray
  }
  if (normBrand.includes("dodge") || normName.includes("challenger") || normName.includes("charger")) {
    return "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=800&q=80"; // Dodge Challenger Hellcat SRT
  }
  if (normBrand.includes("toyota") || normName.includes("toyota")) {
    if (normName.includes("supra")) {
      return "https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?auto=format&fit=crop&w=800&q=80"; // Supra GT
    }
    return "https://images.unsplash.com/photo-1581541224817-de747c340b08?auto=format&fit=crop&w=800&q=80"; // Toyota Rav4/Camry clean
  }
  if (normBrand.includes("nissan") || normName.includes("nissan")) {
    return "https://images.unsplash.com/photo-1612467384434-5c92960e3ee8?auto=format&fit=crop&w=800&q=80"; // Midnight Blue Nissan GT-R
  }
  if (normBrand.includes("honda") || normName.includes("honda")) {
    return "https://images.unsplash.com/photo-1627454817502-c9eff8a6ea23?auto=format&fit=crop&w=800&q=80"; // Red Honda Civic Type R
  }
  if (normBrand.includes("hyundai") || normName.includes("hyundai")) {
    return "https://images.unsplash.com/photo-1630136511108-7243cffa853d?auto=format&fit=crop&w=800&q=80"; // Hyundai Ioniq 5
  }
  if (normBrand.includes("kia") || normName.includes("kia")) {
    return "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80"; // KIA EV6 Electric
  }
  if (normBrand.includes("jeep") || normName.includes("wrangler") || normName.includes("jeep")) {
    return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"; // All-Overland Jeep Wrangler
  }
  if (normBrand.includes("land") || normBrand.includes("rover") || normBrand.includes("range") || normName.includes("range rover")) {
    return "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=800&q=80"; // Luxury Range Rover SUV
  }
  if (normBrand.includes("volvo") || normName.includes("volvo")) {
    return "https://images.unsplash.com/photo-1617251137884-f135eccf6942?auto=format&fit=crop&w=800&q=80"; // Volvo XC90 Premium SUV
  }
  if (normBrand.includes("lexus") || normName.includes("lexus")) {
    return "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80"; // Lexus LC Coupe
  }
  if (normBrand.includes("cadillac") || normName.includes("escalade") || normName.includes("cadillac")) {
    return "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=800&q=80"; // Cadillac Escalade
  }
  if (normBrand.includes("peugeot") || normName.includes("peugeot")) {
    return "https://images.unsplash.com/photo-1604085448373-305f2b87fcf3?auto=format&fit=crop&w=800&q=80"; // Peugeot 508 Fastback
  }
  if (normBrand.includes("renault") || normName.includes("renault")) {
    return "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"; // Renault Megane
  }
  if (normBrand.includes("tata") || normName.includes("harrier") || normName.includes("nexon") || normName.includes("safari")) {
    return "https://images.unsplash.com/photo-1626960810338-dbccbe2bf89e?auto=format&fit=crop&w=800&q=80"; // Tata Motors Luxury SUV
  }
  if (normBrand.includes("mahindra") || normName.includes("thar") || normName.includes("xuv")) {
    return "https://images.unsplash.com/photo-1615829386704-df35be48464a?auto=format&fit=crop&w=800&q=80"; // Mahindra Thar Overland
  }
  if (normBrand.includes("suzuki") || normBrand.includes("maruti") || normName.includes("jimny") || normName.includes("swift")) {
    return "https://images.unsplash.com/photo-1613149818817-de747c340b08?auto=format&fit=crop&w=800&q=80"; // Red Suzuki Swift / Maruti
  }
  if (normBrand.includes("volkswagen") || normBrand.includes("vw") || normName.includes("golf") || normName.includes("volkswagen")) {
    return "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80"; // Volkswagen Golf R White
  }
  if (normBrand.includes("acura") || normName.includes("nsx") || normName.includes("acura")) {
    return "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80"; // Acura NSX Sport
  }
  if (normBrand.includes("mitsubishi") || normName.includes("lancer") || normName.includes("evo")) {
    return "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"; // Mitsubishi Lancer Evo sport
  }
  if (normBrand.includes("mazda") || normName.includes("miata") || normName.includes("mx-5") || normName.includes("rx7") || normName.includes("rx-7")) {
    return "https://images.unsplash.com/photo-1601051515512-58e1c667e411?auto=format&fit=crop&w=800&q=80"; // Clean Mazda MX-5 Miata Roadster
  }

  // Fallback high-performance track-tuned sports car
  return "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80";
}

export function resolveVehicleImage(vehicle: { id?: string; name?: string; brand?: string; image?: string; images?: string[] }): string {
  if (!vehicle) return "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80";

  const id = (vehicle.id || "").toLowerCase();
  const name = (vehicle.name || "").toLowerCase();
  const brand = (vehicle.brand || "").toLowerCase();

  // 1. Core premium system design models
  if (id === "aether-plaid" || name.includes("aether model plaid") || name.includes("aether plaid")) {
    return aetherPlaidImg;
  }
  if (id === "kallisto-gt" || name.includes("kallisto e-tron") || name.includes("kallisto gt")) {
    return kallistoGtImg;
  }
  if (id === "kestrel-gtr" || name.includes("kestrel hypercar") || name.includes("kestrel gtr")) {
    return kestrelGtrImg;
  }
  if (id === "vanguard-ev" || name.includes("vanguard ev") || name.includes("hypertruck") || name.includes("vanguard ev-t")) {
    return vanguardEvImg;
  }
  if (id === "zephyr-sovereign" || name.includes("zephyr sovereign")) {
    return zephyrSovereignImg;
  }
  if (id === "kestrel-suv" || id === "zephyr-ascent" || name.includes("zephyr ascent") || name.includes("ascent ultra")) {
    return zephyrAscentImg;
  }

  // 2. Fallbacks from the dynamic database (Unsplash links or base64s)
  if (vehicle.image && (vehicle.image.startsWith("http") || vehicle.image.startsWith("data:"))) {
    return vehicle.image;
  }
  if (vehicle.images && vehicle.images[0] && (vehicle.images[0].startsWith("http") || vehicle.images[0].startsWith("data:"))) {
    return vehicle.images[0];
  }

  // 3. Brand or name-based Unsplash search via getVibrantCarImage
  return getVibrantCarImage(vehicle.brand || "", vehicle.name || "");
}
