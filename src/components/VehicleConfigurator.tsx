import { useState, useEffect } from "react";
import { Vehicle, VehicleColor, VehicleWheel, VehicleFeatureOption } from "../types";
import { VEHICLES } from "../data/vehicles";
import { Compass, RotateCcw, ShieldCheck, Download, Check, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface ConfiguratorProps {
  selectedVehicleId: string;
}

export default function VehicleConfigurator({ selectedVehicleId }: ConfiguratorProps) {
  // Find initial vehicle or fallback to first
  const [vehicle, setVehicle] = useState<Vehicle>(
    VEHICLES.find((v) => v.id === selectedVehicleId) || VEHICLES[0]
  );

  const [activeColor, setActiveColor] = useState<VehicleColor>(vehicle.colors[0]);
  const [activeWheel, setActiveWheel] = useState<VehicleWheel>(vehicle.wheels[0]);
  const [selectedOptions, setSelectedOptions] = useState<VehicleFeatureOption[]>([]);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isCADMode, setIsCADMode] = useState(false);

  // If initial prop changes, reset state
  useEffect(() => {
    const v = VEHICLES.find((item) => item.id === selectedVehicleId) || VEHICLES[0];
    setVehicle(v);
    setActiveColor(v.colors[0]);
    setActiveWheel(v.wheels[0]);
    setSelectedOptions([]);
  }, [selectedVehicleId]);

  // Total price calculations
  const basePrice = vehicle.price;
  const colorPrice = activeColor.price;
  const wheelPrice = activeWheel.price;
  const optionsPrice = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
  const totalPrice = basePrice + colorPrice + wheelPrice + optionsPrice;

  const toggleOption = (opt: VehicleFeatureOption) => {
    if (selectedOptions.some((item) => item.id === opt.id)) {
      setSelectedOptions(selectedOptions.filter((item) => item.id !== opt.id));
    } else {
      setSelectedOptions([...selectedOptions, opt]);
    }
  };

  const handleReset = () => {
    setActiveColor(vehicle.colors[0]);
    setActiveWheel(vehicle.wheels[0]);
    setSelectedOptions([]);
  };

  const triggerDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  // Dedicated Render for Studio pedestal schematic
  const renderStudioPedestal = () => {
    const colorHex = activeColor.hex;
    return (
      <div className="relative w-full bg-zinc-950 border border-zinc-900 rounded-xl p-8 flex flex-col items-center justify-center min-h-[360px] overflow-hidden group">
        
        {/* Ambient reflection grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29371a_1px,transparent_1px),linear-gradient(to_bottom,#1f29371a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Studio Spotlight glow matching chosen paint */}
        <div
          className="absolute -top-32 w-[340px] h-[340px] rounded-full blur-[140px] opacity-25 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: colorHex }}
        />

        {/* Technical crosshairs */}
        <div className="absolute top-4 left-4 font-mono text-[9px] text-zinc-600">
          [ PEDESTAL_GRID: X_22:Y_90 ]
        </div>
        
        {/* Dual Switch Toggle inside the controller container */}
        <div className="absolute top-4 right-4 z-20 flex bg-zinc-90 w-full bg-zinc-900 border border-zinc-800 p-0.5 rounded text-[9px] font-mono tracking-wider">
          <button
            onClick={() => setIsCADMode(false)}
            className={`px-2 py-1 rounded uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              !isCADMode ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-500 hover:text-white"
            }`}
          >
            SHOWROOM
          </button>
          <button
            onClick={() => setIsCADMode(true)}
            className={`px-2 py-1 rounded uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              isCADMode ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-500 hover:text-white"
            }`}
          >
            CAD MODEL
          </button>
        </div>

        {/* Showroom View Layer (with dynamic lighting reflection matching chosen color) */}
        <div className={`w-full max-w-sm md:max-w-md z-10 transition-all duration-500 flex items-center justify-center ${
          !isCADMode ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute"
        }`}>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-950/40 border border-zinc-900 shadow-2xl">
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Ambient dynamic shade overlay emphasizing paint selection */}
            <div
              className="absolute inset-x-0 bottom-0 h-1.5 transition-all duration-700"
              style={{ backgroundColor: colorHex, boxShadow: `0 0 20px 4px ${colorHex}` }}
            />
          </div>
        </div>

        {/* CAD Schematic View Layer */}
        <div className={`w-full max-w-sm z-10 transition-all duration-500 ${
          isCADMode ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none absolute"
        }`}>
          {(() => {
            switch (vehicle.id) {
              case "aether-plaid":
                return (
                  <svg className="w-full h-44 drop-shadow-[0_10px_15px_rgba(0,0,0,0.65)]" viewBox="0 0 400 180" fill="none">
                    <line x1="20" y1="150" x2="380" y2="150" stroke="#333" strokeWidth="2" strokeDasharray="4 4" />
                    {/* Shadow reflecting vehicle paint */}
                    <ellipse cx="200" cy="150" rx="140" ry="12" fill={colorHex} opacity="0.12" />
                    
                    {/* Silhouette */}
                    <path d="M 40,140 Q 60,110 110,110 T 190,70 Q 240,70 290,105 Q 340,115 365,140" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M 40,140 H 365" stroke="#444" strokeWidth="2.5" />
                    
                    {/* Greenhouse Cabin */}
                    <path d="M 120,105 Q 185,68 250,71 C 275,73 295,95 305,107" stroke="#666" strokeWidth="1.8" fill="none" />
                    
                    {/* Dynamic customizable wheel items */}
                    <circle cx="100" cy="140" r="23" stroke="#F4F4F5" strokeWidth="2" fill="#111" />
                    <circle cx="100" cy="140" r="16" stroke={activeWheel.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.5" fill="none" strokeDasharray={activeWheel.price > 0 ? "3 1" : ""} />
                    
                    <circle cx="300" cy="140" r="23" stroke="#F4F4F5" strokeWidth="2" fill="#111" />
                    <circle cx="300" cy="140" r="16" stroke={activeWheel.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.5" fill="none" strokeDasharray={activeWheel.price > 0 ? "3 1" : ""} />
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
                    <circle cx="105" cy="138" r="15" stroke={activeWheel.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.5" fill="none" strokeDasharray={activeWheel.price > 0 ? "3 1" : ""} />
                    <circle cx="295" cy="138" r="24" stroke="#D1D5DB" strokeWidth="2" fill="#111" />
                    <circle cx="295" cy="138" r="15" stroke={activeWheel.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.5" fill="none" strokeDasharray={activeWheel.price > 0 ? "3 1" : ""} />
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
                    <circle cx="110" cy="140" r="13" stroke={activeWheel.price > 0 ? "#EF4444" : "#555"} strokeWidth="1.5" strokeDasharray={activeWheel.price > 0 ? "4 1" : ""} fill="none" />
                    <circle cx="290" cy="140" r="24" stroke="#FFF" strokeWidth="2.5" fill="#111" />
                    <circle cx="290" cy="140" r="15" stroke={activeWheel.price > 0 ? "#EF4444" : "#555"} strokeWidth="1.5" strokeDasharray={activeWheel.price > 0 ? "4 1" : ""} fill="none" />
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
                    <rect x="83" y="128" width="14" height="14" stroke={activeWheel.price > 0 ? "#D97706" : "#444"} strokeWidth="1" fill="none" />
                    <circle cx="290" cy="135" r="26" stroke="#999" strokeWidth="2.5" fill="#111" />
                    <rect x="283" y="128" width="14" height="14" stroke={activeWheel.price > 0 ? "#D97706" : "#444"} strokeWidth="1" fill="none" />
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
                    <circle cx="95" cy="138" r="15" stroke={activeWheel.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.2" strokeDasharray="5 2" fill="none" />
                    <circle cx="295" cy="138" r="23" stroke="#FFF" strokeWidth="2" fill="#111" />
                    <circle cx="295" cy="138" r="15" stroke={activeWheel.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.2" strokeDasharray="5 2" fill="none" />
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
                    <circle cx="100" cy="138" r="13" stroke={activeWheel.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
                    <circle cx="295" cy="138" r="24" stroke="#FFF" strokeWidth="2" fill="#111" />
                    <circle cx="295" cy="138" r="13" stroke={activeWheel.price > 0 ? "#F59E0B" : "#555"} strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
                  </svg>
                );
            }
          })()}
        </div>

        {/* Real-time configuration summary pill */}
        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between pointer-events-none z-10 bg-zinc-900/90 border border-zinc-800/80 px-4 py-2.5 rounded-lg text-[10px] font-mono text-zinc-400">
          <div className="uppercase tracking-widest text-zinc-300">
            Paint: <span className="text-white font-semibold">{activeColor.name}</span>
          </div>
          <div className="uppercase tracking-widest text-zinc-300">
            Rims: <span className="text-white font-semibold">{activeWheel.name.split(" ")[0]}</span>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="configurator-container">
      {/* Title block */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extralight tracking-widest text-white">
            STUDIO <span className="font-bold text-amber-500">CONFIGURATOR</span>
          </h1>
          <p className="text-zinc-400 font-sans text-sm mt-1 max-w-xl">
            Fine-tune high-performance trims, metallic and satin satin multi-coat formulas, magnesium forged wheel architectures, and bespoke interior lounge optionals.
          </p>
        </div>

        {/* Change Vehicle selection dropdown */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest whitespace-nowrap">SWITCH TRIM:</span>
          <select
            id="choose-config-vehicle"
            className="bg-zinc-90 w-full md:w-64 bg-zinc-900 text-zinc-200 border border-zinc-800 rounded px-3.5 py-2 text-xs font-display tracking-widest focus:outline-none focus:border-amber-500 font-medium"
            value={vehicle.id}
            onChange={(e) => {
              const selectedV = VEHICLES.find((v) => v.id === e.target.value);
              if (selectedV) {
                setVehicle(selectedV);
                setActiveColor(selectedV.colors[0]);
                setActiveWheel(selectedV.wheels[0]);
                setSelectedOptions([]);
              }
            }}
          >
            {VEHICLES.map((v) => (
              <option key={v.id} value={v.id} className="bg-zinc-950 text-zinc-200 text-xs">
                {v.brand.toUpperCase()} - {v.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Pedestal preview and performance matrix */}
        <div className="lg:col-span-7 space-y-6">
          {renderStudioPedestal()}

          {/* Real-time physical specs (with dynamic modifiers if options like carbon-brakes or solar accessories are selected!) */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
            <h3 className="font-display text-xs text-zinc-400 tracking-widest uppercase font-semibold mb-4 border-b border-zinc-900 pb-2">
              ENGINEERING CALIBRATION LAB (ACTIVE MODEL SPEC)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Motive Horsepower</span>
                <span className="text-zinc-200 block text-sm mt-0.5 font-medium">{vehicle.specs.horsepower} HP</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Zero to Sixty</span>
                <span className="text-zinc-200 block text-sm mt-0.5 font-medium">{vehicle.specs.zeroToSixty} SEC</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Top Velocity</span>
                <span className="text-zinc-200 block text-sm mt-0.5 font-medium">{vehicle.specs.topSpeed} MPH</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Energy reserves</span>
                <span className="text-emerald-500 block text-xs mt-1 leading-tight font-medium">{vehicle.specs.rangeOrMpg}</span>
              </div>
            </div>

            {/* Special dynamic indicator if Carbon brakes option is toggled */}
            {selectedOptions.some(o => o.id === "carbon-brakes") && (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded flex items-center space-x-2 text-[10px] font-mono text-amber-500">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="uppercase tracking-widest">PERFORMANCE NOTE: Carbon Ceramic brakes active. Stopping distance diminished by 14%.</span>
              </div>
            )}
            
            {/* Special solar active notification */}
            {selectedOptions.some(o => o.id === "solar-tonneau") && (
              <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded flex items-center space-x-2 text-[10px] font-mono text-emerald-500">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="uppercase tracking-widest">SOLAR MODE ACTIVE: Yielding up to 15 miles secure fuel absorption annually.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Configuration controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Customizing Paint Swatches */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
            <span className="font-mono text-[10px] text-zinc-500 tracking-widest block mb-2 font-medium uppercase">
              STUDIO STAGE 01: EXTERIOR AUTOMOTIVE COATING
            </span>
            <h3 className="font-display text-base text-white tracking-wide mb-4">
              Premium Paint Select
            </h3>
            
            <div className="flex flex-wrap gap-3" id="paint-swatches">
              {vehicle.colors.map((color) => {
                const isActive = activeColor.name === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => setActiveColor(color)}
                    id={`swatch-${color.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    className={`h-11 w-11 rounded-full border-2 transition-all duration-300 relative ${
                      isActive ? "border-amber-500 scale-110" : "border-zinc-800 hover:border-zinc-500"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={`${color.name} ($${color.price})`}
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
              <span className="uppercase">{activeColor.name}</span>
              <span className="text-amber-500">{activeColor.price === 0 ? "STANDARD INCLUDE" : `+$${activeColor.price.toLocaleString()}`}</span>
            </div>
          </div>

          {/* Customizing Wheels selection list */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
            <span className="font-mono text-[10px] text-zinc-500 tracking-widest block mb-2 font-medium uppercase">
              STUDIO STAGE 02: TRACK ALLOY CONFIGURATION
            </span>
            <h3 className="font-display text-base text-white tracking-wide mb-4">
              Wheel Dynamics Catalog
            </h3>
            
            <div className="space-y-2.5" id="wheel-list">
              {vehicle.wheels.map((wheel) => {
                const isActive = activeWheel.name === wheel.name;
                return (
                  <button
                    key={wheel.name}
                    onClick={() => setActiveWheel(wheel)}
                    id={`swatch-wheel-${wheel.name.replace(/[^a-zA-Z0-9]/g, "-")}`}
                    className={`w-full flex items-center justify-between p-3 border rounded text-left transition-all duration-300 font-sans text-xs ${
                      isActive
                        ? "border-amber-500 bg-amber-500/[0.04]"
                        : "border-zinc-900 hover:border-zinc-800 bg-zinc-950"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-zinc-100">{wheel.name}</p>
                      <p className="text-zinc-500 text-[10px] font-mono uppercase mt-0.5">Forged lightweight specs</p>
                    </div>
                    <div className="font-mono text-zinc-400 text-[10px] text-right">
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

          {/* Premium upgrades checkboxes */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
            <span className="font-mono text-[10px] text-zinc-500 tracking-widest block mb-2 font-medium uppercase">
              STUDIO STAGE 03: PROFESSIONAL OPTIONAL PACKAGES
            </span>
            <h3 className="font-display text-base text-white tracking-wide mb-4">
              Luxury Cabin & Track Gear
            </h3>
            
            <div className="space-y-3" id="options-checkboxes">
              {vehicle.options.map((opt) => {
                const isSelected = selectedOptions.some((item) => item.id === opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt)}
                    className={`p-4 border rounded cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/[0.04]"
                        : "border-zinc-900 hover:border-zinc-800 bg-zinc-950"
                    }`}
                  >
                    <div className="flex items-center justify-between select-none">
                      <div className="flex items-start space-x-3.5">
                        <div className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                          isSelected ? "bg-amber-500 border-amber-500" : "border-zinc-800 bg-zinc-900"
                        }`}>
                          {isSelected && <Check className="h-3.5 w-3.5 text-zinc-950 stroke-[3px]" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-100 leading-tight">{opt.name}</p>
                          <p className="text-zinc-500 text-[11px] font-light font-sans leading-normal mt-1 max-w-[280px]">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                      <div className="font-mono text-zinc-400 text-xs pl-2">
                        +${opt.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing breakdown summary and validation */}
          <div className="bg-zinc-955 border border-zinc-900 p-6 rounded-lg space-y-4">
            <div className="font-mono text-xs text-zinc-400 border-b border-zinc-900 pb-3 space-y-2">
              <div className="flex justify-between">
                <span>RETAIL BASE PRICE</span>
                <span>${basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>METALLIC PAINT COAT</span>
                <span>+${colorPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>MAGNESIUM WHEEL RIMS</span>
                <span>+${wheelPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>INDIVIDUAL ADD-ONS ({selectedOptions.length})</span>
                <span>+${optionsPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pb-2">
              <div>
                <span className="font-mono text-[10px] text-zinc-500 block uppercase">GUARANTEED OUT-THE-DOOR</span>
                <span className="text-white font-display text-2xl font-bold tracking-tight">${totalPrice.toLocaleString()}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded border border-zinc-900"
                  title="Reset to standards"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                
                <button
                  onClick={triggerDownload}
                  id="btn-download-config"
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-display font-semibold tracking-wider px-5 py-2.5 rounded text-xs transition duration-300 flex items-center space-x-2"
                >
                  {downloadSuccess ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>SPEC SECURED</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>SECURE SPECIFICATION</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>APEX CERTIFIED ENGINEERING WARRANTY INCLUDED</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
