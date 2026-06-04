import { Vehicle } from "../types";

import aetherPlaidImg from "../assets/images/aether_plaid_1780560564012.png";
import kallistoGtImg from "../assets/images/kallisto_gt_1780560578498.png";
import kestrelGtrImg from "../assets/images/kestrel_gtr_1780560597519.png";
import vanguardEvImg from "../assets/images/vanguard_ev_1780560612077.png";
import zephyrSovereignImg from "../assets/images/zephyr_sovereign_1780560631479.png";
import zephyrAscentImg from "../assets/images/zephyr_ascent_1780560658534.png";

export const VEHICLES: Vehicle[] = [
  {
    id: "aether-plaid",
    name: "Aether Model Plaid",
    brand: "Aether Motors",
    type: "Sedan",
    price: 89990,
    image: aetherPlaidImg,
    description: "The peak of electric luxury sedan performance. Delivering instant torque with a tri-motor configuration, custom active aerodynamic carbon-fiber spoiler, and industry-leading autopilot capabilities, all wrapped in a sleek, wind-tunnel-optimized executive silhouette.",
    specs: {
      horsepower: 1020,
      torque: 1050,
      zeroToSixty: 1.99,
      topSpeed: 200,
      rangeOrMpg: "396 miles (EPA)",
      batteryCapacity: "100 kWh",
      driveTrain: "AWD",
      fuelType: "Electric"
    },
    colors: [
      { name: "Stealth Pearl White", hex: "#F3F4F6", price: 0, previewColor: "white" },
      { name: "Apex Metallic Grey", hex: "#4B5563", price: 1500, previewColor: "grey" },
      { name: "Supernova Red Multi-Coat", hex: "#DC2626", price: 2500, previewColor: "red" },
      { name: "Deep Space Obsidian Black", hex: "#111827", price: 1500, previewColor: "black" },
      { name: "Chrono Blue Pearl", hex: "#1D4ED8", price: 2000, previewColor: "blue" }
    ],
    wheels: [
      { name: "19\" Tempest Aero Alloys", price: 0, previewUrl: "tempest" },
      { name: "21\" Arachnid Onyx Forged Wheels", price: 4500, previewUrl: "arachnid" }
    ],
    options: [
      { id: "fsd", name: "Full Self-Driving Autopilot suite", description: "Enables navigated highway driving, auto lane change, auto-park, summon, and traffic light response.", price: 8000 },
      { id: "carbon-brakes", name: "Carbon Ceramic Brake Performance Kit", description: "Ultra-high-temperature carbon ceramic rotors paired with forged 6-piston brake calipers.", price: 6500 },
      { id: "yoke", name: "Premium Executive Yoke Steering Cabin", description: "Supple vegan leather yoke steering controller with responsive touch haptics.", price: 1000 }
    ],
    highlights: [
      "0-60 mph in under 2 seconds",
      "Tri-Motor torque vectoring AWD",
      "Ultra-low 0.208 Cd drag coefficient",
      "Sophisticated 22-speaker, 960W ambient sound staging"
    ]
  },
  {
    id: "kallisto-gt",
    name: "Kallisto E-Tron GT",
    brand: "Kallisto Performance",
    type: "Sedan",
    price: 114500,
    image: kallistoGtImg,
    description: "An expressive masterpiece of visual engineering and electro-mobility. The Kallisto E-Tron GT features dual synchronous motors, full-width customizable reactive LED matrix beams, and an architectural low-slung, wider stance prioritizing grand touring dynamics.",
    specs: {
      horsepower: 637,
      torque: 612,
      zeroToSixty: 3.1,
      topSpeed: 155,
      rangeOrMpg: "249 miles (EPA)",
      batteryCapacity: "93.4 kWh",
      driveTrain: "AWD",
      fuelType: "Electric"
    },
    colors: [
      { name: "Ascari Blue Premium Met.", hex: "#1E3A8A", price: 0, previewColor: "blue" },
      { name: "Tactical Forest Green Mat.", hex: "#14532D", price: 3000, previewColor: "green" },
      { name: "Suzuka Absolute Silver Pearl", hex: "#E5E7EB", price: 1000, previewColor: "silver" },
      { name: "Mythos Nero Executive Black", hex: "#030712", price: 1500, previewColor: "black" }
    ],
    wheels: [
      { name: "20\" 5-Double-Spoke Sport Rims", price: 0, previewUrl: "sport-rims" },
      { name: "21\" Dynamic Aero-Blade Carbon Wheels", price: 3800, previewUrl: "carbon-blades" }
    ],
    options: [
      { id: "laser-lights", name: "Custom Matrix LED & Laser Beams", description: "State-of-the-art laser lights that double the range of high-beams with dynamic animated startup sequence.", price: 3500 },
      { id: "air-suspension", name: "Dynamic Adaptive Air Damper System", description: "Stiffness and level adjustable pneumatic suspension with active body control.", price: 4200 },
      { id: "leather-luxury", name: "Luxurious Nappa Leather & Alcantara Package", description: "Full interior wrapped in Alcantara and perforated, diamond-stitched fine Nappa leather seats.", price: 5000 }
    ],
    highlights: [
      "800V charging architecture: 5% to 80% in 22 minutes",
      "Dynamic all-wheel steering system for urban speed agility",
      "Custom carbon-fiber reinforced polymer (CFRP) structural roof",
      "Spatially optimized acoustic glass dampening cabin insulation"
    ]
  },
  {
    id: "kestrel-gtr",
    name: "Kestrel Hypercar GTR",
    brand: "Kestrel Labs",
    type: "Hypercar",
    price: 1850000,
    image: kestrelGtrImg,
    description: "The absolute pinnacle of extreme mechanical engineering. A pure-combustion, limited-edition hypercar designed exclusively for elite track performance and high-speed road dominance. Powered by a carbon-shielded 6.0L twin-turbocharged V12 with carbon titanium monocoque.",
    specs: {
      horsepower: 1100,
      torque: 950,
      zeroToSixty: 2.3,
      topSpeed: 265,
      rangeOrMpg: "12 / 18 MPG (Gas)",
      batteryCapacity: "N/A",
      driveTrain: "RWD",
      fuelType: "Gasoline"
    },
    colors: [
      { name: "Raw Exposed Satin Carbon", hex: "#27272A", price: 45000, previewColor: "carbon" },
      { name: "Liquid Mercury Chrome", hex: "#94A3B8", price: 0, previewColor: "chrome" },
      { name: "Monaco Gold Metallic Pearl", hex: "#D97706", price: 18000, previewColor: "gold" }
    ],
    wheels: [
      { name: "20\" Front / 21\" Rear Center-Lock Magnesium Alloys", price: 0, previewUrl: "magnesium" },
      { name: "21\" Forged Ultra-Light Titanium Track Series", price: 32000, previewUrl: "titanium" }
    ],
    options: [
      { id: "race-telemetry", name: "Formula-1 Advanced Track Telemetry", description: "Includes high-precision GPS positioning, multiple in-cabin cameras, and automated cloud-linked lap data logs.", price: 15000 },
      { id: "active-aero", name: "Dual-Stage Dynamic Rear Wing DRS", description: "Active DRS rear wing adjusts pitch hydraulically in 0.1s to optimize downforce or drag.", price: 25000 },
      { id: "race-interior", name: "Titanium Rollcage & Six-Point Harness", description: "Full track-spec titanium rollcage structure with colored Schroth racing harnesses.", price: 12000 }
    ],
    highlights: [
      "Full Carbon-Epoxy Monocoque weighing under 2,200 lbs",
      "Intoxicating 10,500 RPM V12 combustion scream",
      "Bespoke Pushrod adaptive suspension with Ohlins racing dampers",
      "Extreme track downforce exceeding 1,800 lbs at 150 mph"
    ]
  },
  {
    id: "vanguard-ev",
    name: "Vanguard EV-T HyperTruck",
    brand: "Vanguard Overland",
    type: "Truck",
    price: 79500,
    image: vanguardEvImg,
    description: "An indestructible, all-electric heavy-duty utility truck built for off-grid operations. Featuring bullet-resistant armor plating, class-leading ground clearance, standard quad-motor AWD, and comprehensive mobile power grid outlets capable of running high-draw machinery.",
    specs: {
      horsepower: 835,
      torque: 908,
      zeroToSixty: 3.0,
      topSpeed: 110,
      rangeOrMpg: "328 miles (EPA)",
      batteryCapacity: "135 kWh",
      driveTrain: "AWD",
      fuelType: "Electric"
    },
    colors: [
      { name: "Tactical Matte Sandstone", hex: "#D1B280", price: 0, previewColor: "sand" },
      { name: "Stealth Armor Black (Anti-Scratch)", hex: "#374151", price: 2000, previewColor: "dark-grey" },
      { name: "Glacier Peak Polar White", hex: "#FAFAFA", price: 1000, previewColor: "white" }
    ],
    wheels: [
      { name: "20\" Rough Terrain Rugged Alloys with 34\" Tires", price: 0, previewUrl: "rugged" },
      { name: "22\" Cyber-Blade Forged Alloy Road Set", price: 3500, previewUrl: "cyber-blade" }
    ],
    options: [
      { id: "solar-tonneau", name: "Solar Vault Power Tonneau Cover", description: "High-efficiency retractable solar tonneau cover capturing up to 15 miles of fuel per day.", price: 4500 },
      { id: "offgrid-pack", name: "Offgrid Wilderness Recovery Winch Suite", description: "12,000 lbs integrated Front Winch, high-volume air compressor, and chassis underbody lighting.", price: 3200 },
      { id: "camp-kitchen", name: "Slide-Out Electric Induction Kitchen", description: "Dual-burner silent induction stove, prep surface, and integrated silverware storage slides out from utility tunnel.", price: 5000 }
    ],
    highlights: [
      "Quad-Motor vectoring AWD driving each wheel independently",
      "Generous 14.9 inches of adjustable air suspension ground clearance",
      "Bi-directional charging power exporting 10.2 kW of server backup",
      "Armored underbody steel shield plates protecting electronics"
    ]
  },
  {
    id: "zephyr-sovereign",
    name: "Zephyr Sovereign Hybrid",
    brand: "Zephyr & Co.",
    type: "Sedan",
    price: 145000,
    image: zephyrSovereignImg,
    description: "An ultra-premium executive hybrid cruiser defined by uncompromising comfort and presidential presence. Merging a quiet turbocharged inline-6 generator with dual electric luxury motors for silk-smooth quietness and effortless range capability.",
    specs: {
      horsepower: 536,
      torque: 549,
      zeroToSixty: 4.4,
      topSpeed: 155,
      rangeOrMpg: "480 miles (Hybrid Combined)",
      batteryCapacity: "24.4 kWh",
      driveTrain: "RWD",
      fuelType: "Hybrid"
    },
    colors: [
      { name: "Sovereign Deep Burgundy Silk", hex: "#450A0A", price: 2500, previewColor: "dark-red" },
      { name: "Silver Chalice Platinum Metallic", hex: "#94A3B8", price: 0, previewColor: "silver" },
      { name: "Imperial Navy Blue Pearl", hex: "#0F172A", price: 2000, previewColor: "dark-blue" }
    ],
    wheels: [
      { name: "20\" Luxury Multi-Spoke Chrome Turbines", price: 0, previewUrl: "turbine" },
      { name: "21\" Silent-Comfort Liquid Silver Alloys", price: 4000, previewUrl: "silent-silver" }
    ],
    options: [
      { id: "executive-lounge", name: "Presidential Executive Lounge Seating", description: "Rear reclining heated massage seats, fold-away workspace desks, and integrated chilled modern minibar console.", price: 12000 },
      { id: "cinema-screen", name: "31\" 8K Rear Passenger Theater Display", description: "Stunning roof-mounted theater monitor with integrated Amazon Fire or streaming ecosystem services.", price: 5500 },
      { id: "sound-stage", name: "Bowers & Wilkins Diamond Surround Sound", description: "Elite 36-speaker standard audio, generating 4D physical haptic vibrations inside the headrests.", price: 6000 }
    ],
    highlights: [
      "Presidential-tier executive cabin layout comfort spacing",
      "Dynamic adaptive electromagnetic roll control dampening",
      "Silent EV city driving modes extending electric range",
      "Acoustic noise-cancelling active cabin sensor microphones"
    ]
  },
  {
    id: "kestrel-suv",
    name: "Zephyr Ascent Ultra SUV",
    brand: "Zephyr & Co.",
    type: "SUV",
    price: 92400,
    image: zephyrAscentImg,
    description: "The ideal hybrid of family safety, high-payload luxury space, and offroad adventure capabilities. A premium three-row intelligent SUV featuring panoramic stellar glass roofs and state-of-the-art variable engine torque output.",
    specs: {
      horsepower: 480,
      torque: 510,
      zeroToSixty: 4.8,
      topSpeed: 140,
      rangeOrMpg: "22/28 MPG (Hybrid)",
      batteryCapacity: "15.2 kWh",
      driveTrain: "AWD",
      fuelType: "Hybrid"
    },
    colors: [
      { name: "Alpine Glacier Pearl White", hex: "#F3F4F6", price: 0, previewColor: "white" },
      { name: "Yosemite Sierra Green Metallic", hex: "#064E3B", price: 1800, previewColor: "green" },
      { name: "Stardust Bronze Matte", hex: "#78350F", price: 3200, previewColor: "bronze" }
    ],
    wheels: [
      { name: "20\" Aero-Comfort Spoke Rims", price: 0, previewUrl: "aero-comfort" },
      { name: "22\" Star-Cut Multi-Segment Sport Wheels", price: 4200, previewUrl: "star-cut" }
    ],
    options: [
      { id: "panoramic-sky", name: "Dynamic Smart Tint Glass Horizon", description: "Electro-chromic smart glass roof segment lets you darken or lighten light transmission on custom app touch sliders.", price: 3000 },
      { id: "adv-safeguard", name: "Level-3 Autonomy Driving Safeguard Suite", description: "Lidar scanning, 12 camera 360 array, and predictive emergency swerve assist.", price: 7500 },
      { id: "offroad-gear", name: "Chassis Lift Off-Road Utility Package", description: "Adds heavy-duty dynamic front swaybars, integrated brush guard, and dynamic rock crawling drive software.", price: 4000 }
    ],
    highlights: [
      "Flexible luxury formatting: 3 rows with seats for 7",
      "Robust off-road water-fording up to 28 inches safely",
      "Premium heat-reducing high-durability modern fabric seats",
      "Integrated dual-wireless premium smart chargers with cooling fans"
    ]
  }
];
