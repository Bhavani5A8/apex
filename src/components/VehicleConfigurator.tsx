import { useState, useEffect } from "react";
import { Vehicle } from "../types";
import { dbService } from "../dbService";
import { Compass, RotateCcw, ShieldCheck, Download, Check, Sparkles, Loader2, FileText, Image } from "lucide-react";
import { motion } from "motion/react";
import { User as FirebaseUser } from "firebase/auth";

interface ConfiguratorProps {
  selectedVehicleId: string;
  user: FirebaseUser | null;
}

export default function VehicleConfigurator({ selectedVehicleId, user }: ConfiguratorProps) {
  // Global Vehicles fleet to switch trims
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState<any | null>(null);

  // Dynamic Options lists fetched dynamically from Firestore database collections
  const [colors, setColors] = useState<any[]>([]);
  const [wheels, setWheels] = useState<any[]>([]);
  const [interiors, setInteriors] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [variantImages, setVariantImages] = useState<any[]>([]);

  // Selection states
  const [activeColor, setActiveColor] = useState<any | null>(null);
  const [activeWheel, setActiveWheel] = useState<any | null>(null);
  const [activeInterior, setActiveInterior] = useState<any | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<any[]>([]);

  // Utility states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "jpg" | "png">("pdf");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCADMode, setIsCADMode] = useState(false);

  // Initial load: Fetch the list of vehicles from the database first
  useEffect(() => {
    async function loadVehicles() {
      try {
        const list = await dbService.getVehicles();
        setVehicles(list);
      } catch (err) {
        console.error("Failed to load vehicle trims:", err);
      }
    }
    loadVehicles();
  }, []);

  // Whenever selected trim/vehicle ID changes, fetch its customization options from Firestore collections
  useEffect(() => {
    if (vehicles.length === 0) return;
    
    async function loadConfiguratorOptions() {
      setIsLoading(true);
      const activeCar = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
      setVehicle(activeCar);

      try {
        // Run concurrent DB fetches beautifully
        const [dbColors, dbWheels, dbInteriors, dbPackages, dbImages] = await Promise.all([
          dbService.getVehicleColors(activeCar.id),
          dbService.getVehicleWheels(activeCar.id),
          dbService.getVehicleInteriors(activeCar.id),
          dbService.getVehiclePackages(activeCar.id),
          dbService.getVehicleImages(activeCar.id)
        ]);

        setColors(dbColors);
        setWheels(dbWheels);
        setInteriors(dbInteriors);
        setPackages(dbPackages);
        setVariantImages(dbImages);

        // Check for previously saved configurations for this user & vehicle from DB or LocalStorage
        let savedConfig: any = null;
        if (user) {
          savedConfig = await dbService.getVehicleConfiguration(user.uid, activeCar.id);
        } else {
          try {
            const raw = localStorage.getItem(`apx_guest_cfg_${activeCar.id}`);
            if (raw) savedConfig = JSON.parse(raw);
          } catch (_) {}
        }

        if (savedConfig) {
          // Restore saved selections instantly from live DB
          const sCol = dbColors.find(c => c.id === savedConfig.colorId) || dbColors[0];
          const sWhl = dbWheels.find(w => w.id === savedConfig.wheelId) || dbWheels[0];
          const sInt = dbInteriors.find(i => i.id === savedConfig.interiorId) || dbInteriors[0];
          const sPkgs = dbPackages.filter(p => savedConfig.packageIds?.includes(p.id));

          setActiveColor(sCol);
          setActiveWheel(sWhl);
          setActiveInterior(sInt);
          setSelectedPackages(sPkgs);
        } else {
          // No configuration found, fall back to base defaults
          setActiveColor(dbColors[0] || null);
          setActiveWheel(dbWheels[0] || null);
          setActiveInterior(dbInteriors[0] || null);
          setSelectedPackages([]);
        }
      } catch (err) {
        console.error("Failure loading customization matrix from database collections:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadConfiguratorOptions();
  }, [selectedVehicleId, vehicles, user]);

  // Autosave configuration state on any customization event
  useEffect(() => {
    if (!vehicle || !activeColor || !activeWheel || !activeInterior || isLoading) return;

    const basePrice = vehicle.price || 90000;
    const colPrice = activeColor.price || 0;
    const whlPrice = activeWheel.price || 0;
    const intPrice = activeInterior.price || 0;
    const pkgsPrice = selectedPackages.reduce((acc, p) => acc + p.price, 0);
    const totalPrice = basePrice + colPrice + whlPrice + intPrice + pkgsPrice;

    const configDoc = {
      id: user ? `${user.uid}_${vehicle.id}` : `guest_${vehicle.id}`,
      userId: user ? user.uid : "guest_user",
      vehicleId: vehicle.id,
      colorId: activeColor.id,
      wheelId: activeWheel.id,
      interiorId: activeInterior.id,
      packageIds: selectedPackages.map(p => p.id),
      totalPrice
    };

    // Commits persistence to database if logged-in, otherwise keeps in safe guest localStorage
    async function commitSavedConfig() {
      setIsSaving(true);
      if (user) {
        await dbService.saveVehicleConfiguration(configDoc);
      } else {
        localStorage.setItem(`apx_guest_cfg_${vehicle.id}`, JSON.stringify(configDoc));
      }
      setIsSaving(false);
    }

    const timer = setTimeout(() => {
      commitSavedConfig();
    }, 600); // Debounced autosave matching professional engineering standards

    return () => clearTimeout(timer);
  }, [activeColor, activeWheel, activeInterior, selectedPackages, vehicle, user, isLoading]);

  // Pricing calculations
  const basePrice = vehicle?.price || 0;
  const colorPrice = activeColor?.price || 0;
  const wheelPrice = activeWheel?.price || 0;
  const interiorPrice = activeInterior?.price || 0;
  const optionsPrice = selectedPackages.reduce((acc, p) => acc + p.price, 0);
  const totalPrice = basePrice + colorPrice + wheelPrice + interiorPrice + optionsPrice;

  const togglePackage = (pkg: any) => {
    if (selectedPackages.some((p) => p.id === pkg.id)) {
      setSelectedPackages(selectedPackages.filter((p) => p.id !== pkg.id));
    } else {
      setSelectedPackages([...selectedPackages, pkg]);
    }
  };

  const handleReset = () => {
    if (colors.length > 0) setActiveColor(colors[0]);
    if (wheels.length > 0) setActiveWheel(wheels[0]);
    if (interiors.length > 0) setActiveInterior(interiors[0]);
    setSelectedPackages([]);
  };

  const triggerDownload = async () => {
    if (!vehicle || !activeColor || !activeWheel || !activeInterior) return;
    setIsDownloading(true);

    try {
      const packageNames = selectedPackages.map(p => p.name).join(",");
      const query = new URLSearchParams({
        format: downloadFormat,
        color: activeColor.name,
        wheel: activeWheel.name,
        interior: activeInterior.name,
        packages: packageNames,
        price: totalPrice.toString()
      });

      // Directly trigger dynamic native attachment download in user's browser
      const downloadUrl = `/api/vehicles/${vehicle.id}/download?${query.toString()}`;
      
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `${vehicle.brand}_${vehicle.name}_Spec.${downloadFormat}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Failed to fetch download receipt stream:", err);
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
      }, 1500);
    }
  };

  if (isLoading || !vehicle) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center font-mono text-xs tracking-widest text-zinc-500 gap-4">
        <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
        <span>RECONSTRUCTING HIGH-INTEGRITY CONFIGURATOR WORKSPACE...</span>
      </div>
    );
  }

  // Find the custom variant image corresponding to the selected paint
  const activeImage = variantImages.find(img => img.colorId === activeColor?.id)?.imageUrl || vehicle.image;

  // Custom Pedestal Preview
  const renderStudioPedestal = () => {
    const colorHex = activeColor?.hex || "#18181B";
    return (
      <div className="relative w-full bg-zinc-950 border border-zinc-900 rounded-xl p-8 flex flex-col items-center justify-center min-h-[360px] overflow-hidden group">
        
        {/* Background micro grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29371a_1px,transparent_1px),linear-gradient(to_bottom,#1f29371a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Studio spotlight mirroring the selected color */}
        <div
          className="absolute -top-32 w-[340px] h-[340px] rounded-full blur-[140px] opacity-25 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: colorHex }}
        />

        <div className="absolute top-4 left-4 font-mono text-[9px] text-zinc-650 text-zinc-650 flex items-center space-x-1.5 uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>DATABASE STREAM ONLINE [COL_ID: {activeColor?.id || "N/A"}]</span>
        </div>
        
        <div className="absolute top-4 right-4 z-20 flex bg-zinc-950/80 border border-zinc-900/90 p-0.5 rounded text-[9px] font-mono tracking-wider">
          <button
            onClick={() => setIsCADMode(false)}
            className={`px-2.5 py-1 rounded uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              !isCADMode ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-500 hover:text-white"
            }`}
          >
            SHOWROOM
          </button>
          <button
            onClick={() => setIsCADMode(true)}
            className={`px-2.5 py-1 rounded uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              isCADMode ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-500 hover:text-white"
            }`}
          >
            CAD MODEL
          </button>
        </div>

        {/* Showroom View (No refresh, updates images instantly from DB) */}
        <div className={`w-full max-w-sm md:max-w-md z-10 transition-all duration-500 flex items-center justify-center ${
          !isCADMode ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute"
        }`}>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-95/40 border border-zinc-900 shadow-2xl">
            <img
              src={activeImage}
              alt={vehicle.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            
            <div
              className="absolute inset-x-0 bottom-0 h-1 transition-all duration-700"
              style={{ backgroundColor: colorHex, boxShadow: `0 0 22px 5px ${colorHex}` }}
            />
          </div>
        </div>

        {/* CAD Schematic overlay rendering */}
        <div className={`w-full max-w-sm z-10 transition-all duration-500 ${
          isCADMode ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none absolute"
        }`}>
          {(() => {
            switch (vehicle.id) {
              case "aether-plaid":
                return (
                  <svg className="w-full h-44 drop-shadow-[0_10px_15px_rgba(0,0,0,0.65)]" viewBox="0 0 400 180" fill="none">
                    <line x1="20" y1="150" x2="380" y2="150" stroke="#333" strokeWidth="2" strokeDasharray="4 4" />
                    <ellipse cx="200" cy="150" rx="140" ry="12" fill={colorHex} opacity="0.12" />
                    <path d="M 40,140 Q 60,110 110,110 T 190,70 Q 240,70 290,105 Q 340,115 365,140" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M 40,140 H 365" stroke="#444" strokeWidth="2.5" />
                    <path d="M 120,105 Q 185,68 250,71 C 275,73 295,95 305,107" stroke="#666" strokeWidth="1.8" fill="none" />
                    <circle cx="100" cy="140" r="23" stroke="#F4F4F5" strokeWidth="2" fill="#111" />
                    <circle cx="100" cy="140" r="16" stroke={activeWheel?.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.5" fill="none" strokeDasharray={activeWheel?.price > 0 ? "3 1" : ""} />
                    <circle cx="300" cy="140" r="23" stroke="#F4F4F5" strokeWidth="2" fill="#111" />
                    <circle cx="300" cy="140" r="16" stroke={activeWheel?.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.5" fill="none" strokeDasharray={activeWheel?.price > 0 ? "3 1" : ""} />
                  </svg>
                );
              case "kallisto-gt":
                return (
                  <svg className="w-full h-44 drop-shadow-[0_10px_15px_rgba(0,0,0,0.65)]" viewBox="0 0 400 180" fill="none">
                    <line x1="20" y1="150" x2="380" y2="150" stroke="#333" strokeWidth="2" strokeDasharray="3 3" />
                    <ellipse cx="200" cy="150" rx="140" ry="12" fill={colorHex} opacity="0.14" />
                    <path d="M 35,138 C 55,108 95,102 125,102 C 170,102 215,62 270,62 C 320,62 345,105 370,138" stroke={colorHex} strokeWidth="3.2" fill="none" />
                    <path d="M 35,138 H 370" stroke="#444" strokeWidth="2" />
                    <path d="M 140,102 Q 220,68 285,102" stroke="#666" strokeWidth="2" />
                    <circle cx="105" cy="138" r="24" stroke="#D1D5DB" strokeWidth="2" fill="#111" />
                    <circle cx="105" cy="138" r="15" stroke={activeWheel?.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.5" fill="none" strokeDasharray={activeWheel?.price > 0 ? "3 1" : ""} />
                    <circle cx="295" cy="138" r="24" stroke="#D1D5DB" strokeWidth="2" fill="#111" />
                    <circle cx="295" cy="138" r="15" stroke={activeWheel?.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.5" fill="none" strokeDasharray={activeWheel?.price > 0 ? "3 1" : ""} />
                  </svg>
                );
              case "kestrel-gtr":
                return (
                  <svg className="w-full h-44 drop-shadow-[0_10px_15px_rgba(0,0,0,0.65)]" viewBox="0 0 400 180" fill="none">
                    <line x1="20" y1="150" x2="380" y2="150" stroke="#333" strokeWidth="2" />
                    <ellipse cx="200" cy="150" rx="140" ry="12" fill={colorHex} opacity="0.15" />
                    <path d="M 30,140 Q 50,95 90,95 C 130,95 180,50 250,55 C 300,58 330,122 375,123" stroke={colorHex} strokeWidth="3" fill="none" />
                    <path d="M 40,90 L 70,85 M 35,90 V 110" stroke="#EF4444" strokeWidth="2" />
                    <path d="M 30,140 H 375" stroke="#333" strokeWidth="3" />
                    <circle cx="110" cy="140" r="22" stroke="#FFF" strokeWidth="2" fill="#111" />
                    <circle cx="110" cy="140" r="13" stroke={activeWheel?.price > 0 ? "#EF4444" : "#555"} strokeWidth="1.5" strokeDasharray={activeWheel?.price > 0 ? "4 1" : ""} fill="none" />
                    <circle cx="290" cy="140" r="24" stroke="#FFF" strokeWidth="2.5" fill="#111" />
                    <circle cx="290" cy="140" r="15" stroke={activeWheel?.price > 0 ? "#EF4444" : "#555"} strokeWidth="1.5" strokeDasharray={activeWheel?.price > 0 ? "4 1" : ""} fill="none" />
                  </svg>
                );
              case "vanguard-ev":
                return (
                  <svg className="w-full h-44 drop-shadow-[0_10px_15px_rgba(0,0,0,0.65)]" viewBox="0 0 400 180" fill="none">
                    <line x1="20" y1="150" x2="380" y2="150" stroke="#333" strokeWidth="2" />
                    <ellipse cx="200" cy="150" rx="140" ry="12" fill={colorHex} opacity="0.12" />
                    <path d="M 40,140 V 120 L 50,110 H 120 L 150,75 H 250 L 300,105 H 360 V 140 Z" stroke={colorHex} strokeWidth="3" fill="none" />
                    <line x1="300" y1="105" x2="300" y2="140" stroke="#444" strokeWidth="2" />
                    <path d="M 160,82 H 235 L 255,105 H 175 Z" stroke="#666" strokeWidth="1.8" />
                    <circle cx="90" cy="135" r="26" stroke="#999" strokeWidth="2.5" fill="#111" />
                    <rect x="83" y="128" width="14" height="14" stroke={activeWheel?.price > 0 ? "#D97706" : "#444"} strokeWidth="1" fill="none" />
                    <circle cx="290" cy="135" r="26" stroke="#999" strokeWidth="2.5" fill="#111" />
                    <rect x="283" y="128" width="14" height="14" stroke={activeWheel?.price > 0 ? "#D97706" : "#444"} strokeWidth="1" fill="none" />
                  </svg>
                );
              case "zephyr-sovereign":
                return (
                  <svg className="w-full h-44 drop-shadow-[0_10px_15px_rgba(0,0,0,0.65)]" viewBox="0 0 400 180" fill="none">
                    <line x1="20" y1="150" x2="380" y2="150" stroke="#333" strokeWidth="2" strokeDasharray="3 3" />
                    <ellipse cx="200" cy="150" rx="140" ry="12" fill={colorHex} opacity="0.15" />
                    <path d="M 35,138 Q 60,118 100,115 H 150 Q 195,65 295,68 H 325 Q 355,95 375,138" stroke={colorHex} strokeWidth="3.2" fill="none" />
                    <path d="M 35,138 H 375" stroke="#444" strokeWidth="2" />
                    <path d="M 180,115 L 205,75 H 280 L 305,115 Z" stroke="#666" strokeWidth="2" />
                    <circle cx="95" cy="138" r="23" stroke="#FFF" strokeWidth="2" fill="#111" />
                    <circle cx="95" cy="138" r="15" stroke={activeWheel?.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.2" strokeDasharray="5 2" fill="none" />
                    <circle cx="295" cy="138" r="23" stroke="#FFF" strokeWidth="2" fill="#111" />
                    <circle cx="295" cy="138" r="15" stroke={activeWheel?.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.2" strokeDasharray="5 2" fill="none" />
                  </svg>
                );
              default:
                return (
                  <svg className="w-full h-44 drop-shadow-[0_10px_15px_rgba(0,0,0,0.65)]" viewBox="0 0 400 180" fill="none">
                    <line x1="20" y1="150" x2="380" y2="150" stroke="#333" strokeWidth="2" strokeDasharray="4 4" />
                    <ellipse cx="200" cy="150" rx="140" ry="12" fill={colorHex} opacity="0.14" />
                    <path d="M 40,140 Q 50,115 70,110 H 110 L 140,78 H 285 L 325,110 H 360 Q 365,125 365,140 Z" stroke={colorHex} strokeWidth="3" fill="none" />
                    <path d="M 148,85 H 220 V 110 H 148 Z M 228,85 H 275 L 295,110 H 228 Z" stroke="#666" strokeWidth="2" />
                    <circle cx="100" cy="138" r="24" stroke="#FFF" strokeWidth="2" fill="#111" />
                    <circle cx="100" cy="138" r="13" stroke={activeWheel?.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
                    <circle cx="295" cy="138" r="24" stroke="#FFF" strokeWidth="2" fill="#111" />
                    <circle cx="295" cy="138" r="13" stroke={activeWheel?.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
                  </svg>
                );
            }
          })()}
        </div>

        {/* Dynamic spec indicators */}
        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between pointer-events-none z-10 bg-zinc-900/90 border border-zinc-805 px-4 py-2.5 rounded-lg text-[9px] font-mono text-zinc-400">
          <div className="uppercase tracking-widest text-zinc-300">
            Paint: <span className="text-white font-semibold">{activeColor?.name || "Baseline"}</span>
          </div>
          <div className="uppercase tracking-widest text-zinc-300">
            Alloys: <span className="text-white font-semibold">{(activeWheel?.name || "Standard").split(" ")[0]}</span>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="configurator-container">
      {/* Dynamic Title controls */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extralight tracking-widest text-white">
            STUDIO <span className="font-bold text-amber-500">CONFIGURATOR</span>
          </h1>
          <p className="text-zinc-400 font-sans text-sm mt-1 max-w-xl">
            Deterministically configure high-fidelity spec variants. Real-time options and image assets streamed securely from our Firestore database.
          </p>
        </div>

        {/* switch trims manually from dynamic list */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest whitespace-nowrap">SWITCH TRIM:</span>
          <select
            id="choose-config-vehicle"
            className="bg-zinc-900 text-zinc-200 border border-zinc-800 rounded px-3.5 py-2 text-xs font-display tracking-widest focus:outline-none focus:border-amber-500 font-medium w-full md:w-64"
            value={vehicle.id}
            onChange={(e) => {
              const selectedV = vehicles.find((v) => v.id === e.target.value);
              if (selectedV) {
                setVehicle(selectedV);
                setActiveColor(null);
                setActiveWheel(null);
                setActiveInterior(null);
                setSelectedPackages([]);
              }
            }}
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id} className="bg-zinc-950 text-zinc-200 text-xs">
                {v.brand.toUpperCase()} - {v.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Pedestal configuration and database status */}
        <div className="lg:col-span-7 space-y-6">
          {renderStudioPedestal()}

          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-2">
              <h3 className="font-display text-xs text-zinc-400 tracking-widest uppercase font-semibold">
                ACTIVE MECHANICAL CALIBRATION MATRIX
              </h3>
              {isSaving ? (
                <span className="font-mono text-[9px] text-amber-500 animate-pulse uppercase tracking-widest">SAVING BUILD CONFIGURATION...</span>
              ) : (
                <span className="font-mono text-[9px] text-emerald-500 uppercase tracking-widest">CONFIGURATION SYNCED</span>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Motive Power</span>
                <span className="text-zinc-200 block text-sm mt-0.5 font-medium">{vehicle.horsepower || vehicle.specifications?.horsepower || 700} HP</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Zero to Sixty</span>
                <span className="text-zinc-200 block text-sm mt-0.5 font-medium">{vehicle.zeroToSixty || vehicle.specifications?.zeroToSixty || "2.9"} SEC</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Top Velocity</span>
                <span className="text-zinc-200 block text-sm mt-0.5 font-medium">{vehicle.top_speed || vehicle.specifications?.topSpeed || 180} MPH</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">FUEL / BATTERY CAPACITY</span>
                <span className="text-emerald-500 block text-xs mt-1 leading-tight font-medium uppercase font-semibold">
                  {vehicle.battery_capacity || vehicle.fuel_type || "N/A"}
                </span>
              </div>
            </div>

            {selectedPackages.some(pkg => pkg.id?.includes("apex")) && (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded flex items-center space-x-2 text-[10px] font-mono text-amber-500 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>ACTIVE SUSPENSION & ACTIVE COMPOSITE STABILIZERS ENGAGED. CORNERING FORCE CAPABILITIES ENHANCED.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: custom options */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Colors Swatches Option panel */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
            <span className="font-mono text-[10px] text-zinc-500 tracking-widest block mb-2 font-medium uppercase">
              STUDIO STAGE 01: EXTERIOR METALLIC COATING
            </span>
            <h3 className="font-display text-base text-white tracking-wide mb-4">
              Premium Paint Formula
            </h3>
            
            <div className="flex flex-wrap gap-3" id="paint-swatches">
              {colors.map((color) => {
                const isActive = activeColor?.id === color.id;
                return (
                  <button
                    key={color.id}
                    onClick={() => setActiveColor(color)}
                    id={`swatch-${color.id}`}
                    className={`h-11 w-11 rounded-full border-2 transition-all duration-300 relative ${
                      isActive ? "border-amber-500 scale-110" : "border-zinc-800 hover:border-zinc-500"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={`${color.name} (+$${color.price})`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className="h-4 w-4 text-zinc-900 stroke-[3px]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-zinc-400 bg-zinc-900/40 px-3 py-2 rounded">
              <span className="uppercase">{activeColor?.name || "Baseline Paint"}</span>
              <span className="text-amber-500">{activeColor?.price === 0 ? "STANDARD INCLUDE" : `+$${activeColor?.price.toLocaleString()}`}</span>
            </div>
          </div>

          {/* Wheels Option panel */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
            <span className="font-mono text-[10px] text-zinc-500 tracking-widest block mb-2 font-medium uppercase">
              STUDIO STAGE 02: TRACK ALLOY SYSTEMS
            </span>
            <h3 className="font-display text-base text-white tracking-wide mb-4">
              Forged Wheel Dynamics
            </h3>
            
            <div className="space-y-2.5" id="wheel-list">
              {wheels.map((wheel) => {
                const isActive = activeWheel?.id === wheel.id;
                return (
                  <button
                    key={wheel.id}
                    onClick={() => setActiveWheel(wheel)}
                    id={`swatch-wheel-${wheel.id}`}
                    className={`w-full flex items-center justify-between p-3 border rounded text-left transition-all duration-300 font-sans text-xs ${
                      isActive
                        ? "border-amber-500 bg-amber-500/[0.04]"
                        : "border-zinc-900 hover:border-zinc-850 bg-zinc-950"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-zinc-100">{wheel.name}</p>
                      <p className="text-zinc-500 text-[10px] font-mono uppercase mt-0.5">magnesium forged performance alloys</p>
                    </div>
                    <div className="font-mono text-zinc-400 text-[10px] text-right ml-2">
                      {wheel.price === 0 ? (
                        <span className="text-emerald-500 uppercase tracking-widest font-semibold">Included</span>
                      ) : (
                        `+$${wheel.price.toLocaleString()}`
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interiors Option panel */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
            <span className="font-mono text-[10px] text-zinc-500 tracking-widest block mb-2 font-medium uppercase">
              STUDIO STAGE 03: EXECUTIVE INTERIOR MATRICES
            </span>
            <h3 className="font-display text-base text-white tracking-wide mb-4">
              Cabin Space Lounge Trims
            </h3>
            
            <div className="space-y-2.5" id="interior-list">
              {interiors.map((interior) => {
                const isActive = activeInterior?.id === interior.id;
                return (
                  <button
                    key={interior.id}
                    onClick={() => setActiveInterior(interior)}
                    id={`swatch-interior-${interior.id}`}
                    className={`w-full flex items-center justify-between p-3 border rounded text-left transition-all duration-300 font-sans text-xs ${
                      isActive
                        ? "border-amber-500 bg-amber-500/[0.04]"
                        : "border-zinc-900 hover:border-zinc-850 bg-zinc-950"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-zinc-100">{interior.name}</p>
                      <p className="text-zinc-500 text-[10px] font-mono uppercase mt-0.5">Bespoke aniline upholstery</p>
                    </div>
                    <div className="font-mono text-zinc-400 text-[10px] text-right ml-2">
                      {interior.price === 0 ? (
                        <span className="text-emerald-500 uppercase tracking-widest font-semibold">Included</span>
                      ) : (
                        `+$${interior.price.toLocaleString()}`
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Packages option panels */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
            <span className="font-mono text-[10px] text-zinc-500 tracking-widest block mb-2 font-medium uppercase">
              STUDIO STAGE 04: PROFESSIONAL PACKAGE OPTIONALS
            </span>
            <h3 className="font-display text-base text-white tracking-wide mb-4">
              Aerodynamic Accessories & Tech Lines
            </h3>
            
            <div className="space-y-3" id="options-checkboxes">
              {packages.map((pkg) => {
                const isSelected = selectedPackages.some((p) => p.id === pkg.id);
                return (
                  <div
                    key={pkg.id}
                    onClick={() => togglePackage(pkg)}
                    className={`p-4 border rounded cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/[0.04]"
                        : "border-zinc-900 hover:border-zinc-800 bg-zinc-950"
                    }`}
                  >
                    <div className="flex items-center justify-between select-none">
                      <div className="flex items-start space-x-3.5">
                        <div className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                          isSelected ? "bg-amber-500 border-amber-500" : "border-zinc-850 bg-zinc-900"
                        }`}>
                          {isSelected && <Check className="h-3.5 w-3.5 text-zinc-950 stroke-[3px]" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-100 leading-tight">{pkg.name}</p>
                          <p className="text-zinc-500 text-[11px] font-light leading-normal mt-1 max-w-[280px]">
                            {pkg.description}
                          </p>
                        </div>
                      </div>
                      <div className="font-mono text-zinc-400 text-xs pl-2 whitespace-nowrap">
                        +${pkg.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final checkout breakdown */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-lg space-y-4">
            <div className="font-mono text-xs text-zinc-400 border-b border-zinc-900 pb-3 space-y-2">
              <div className="flex justify-between">
                <span>RETAIL BASE OUTLINE</span>
                <span>${basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>METALLIC PAINT DESIGN</span>
                <span>+${colorPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>MAGNESIUM SPEED RIM</span>
                <span>+${wheelPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>CABIN SPACIAL INDULGENCE</span>
                <span>+${interiorPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>INDIVIDUAL ADD-ONS ({selectedPackages.length})</span>
                <span>+${optionsPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
              <div>
                <span className="font-mono text-[10px] text-zinc-500 block uppercase">GUARANTEED TOTAL VALUATION</span>
                <span className="text-white font-display text-2xl font-bold tracking-tight">${totalPrice.toLocaleString()}</span>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={handleReset}
                  className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded border border-zinc-900 cursor-pointer"
                  title="Reset to specifications base"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                
                <div className="flex rounded border border-zinc-800 bg-zinc-900 p-0.5 text-[9px] font-mono tracking-wider">
                  <button
                    onClick={() => setDownloadFormat("pdf")}
                    className={`px-2 py-1 rounded cursor-pointer uppercase ${downloadFormat === "pdf" ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => setDownloadFormat("png")}
                    className={`px-2 py-1 rounded cursor-pointer uppercase ${downloadFormat === "png" ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => setDownloadFormat("jpg")}
                    className={`px-2 py-1 rounded cursor-pointer uppercase ${downloadFormat === "jpg" ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    JPG
                  </button>
                </div>

                <button
                  onClick={triggerDownload}
                  id="btn-download-config"
                  disabled={isDownloading}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-display font-semibold tracking-wider px-4 py-2 rounded text-xs transition duration-300 flex items-center space-x-1.5 cursor-pointer"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>DOWNLOADING...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>DOWNLOAD</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-550 text-zinc-500 uppercase tracking-widest pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>APEX CERTIFIED ENGINEERING WARRANTY INCLUDED</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
