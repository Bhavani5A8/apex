import React, { useState } from "react";
import { Vehicle } from "../types";
import { VEHICLES } from "../data/vehicles";
import { Search, SlidersHorizontal, Calculator, Calendar, BookOpen, Check, HelpCircle, ArrowRight, X, Compass, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import heroCarImg from "../assets/images/hero_car_1780560548671.png";

interface MarketplaceProps {
  onCompareSelect: (id: string) => void;
  compareList: string[];
  onConfiguratorSelect: (id: string) => void;
  initialSearch?: string;
}

export default function Marketplace({
  onCompareSelect,
  compareList,
  onConfiguratorSelect,
  initialSearch = ""
}: MarketplaceProps) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedFuel, setSelectedFuel] = useState<string>("ALL");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showCAD, setShowCAD] = useState<Record<string, boolean>>({});

  const toggleCAD = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCAD(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Booking & Financing states
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00");
  const [bookingLocation, setBookingLocation] = useState("San Francisco Signature Lounge");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Loan calculator states
  const [downPayment, setDownPayment] = useState<number>(15000);
  const [loanTerm, setLoanTerm] = useState<number>(60); // months
  const [interestRate, setInterestRate] = useState<number>(4.9);

  // Render a custom elegant vector automotive schematic based on vehicle type
  const renderCarSchematic = (vehicleId: string, colorHex: string = "#F59E0B") => {
    switch (vehicleId) {
      case "aether-plaid":
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.85">
              {/* Ground & Shadow */}
              <line x1="20" y1="150" x2="380" y2="150" stroke="#3F3F46" strokeWidth="2" strokeDasharray="4 4" />
              <ellipse cx="200" cy="150" rx="150" ry="10" fill="url(#shadow-grad)" opacity="0.3" />
              {/* Chassis Flow Outline */}
              <path d="M 40,140 Q 60,110 110,110 T 190,70 Q 240,70 290,105 Q 340,115 365,140" stroke={colorHex} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Lower Body */}
              <path d="M 40,140 L 365,140 M 40,140 H 80 M 320,140 H 365" stroke="#71717A" strokeWidth="2" />
              {/* Cab / Windows */}
              <path d="M 120,105 Q 185,68 250,71 C 275,73 295,95 305,107" stroke="#52525B" strokeWidth="1.5" fill="none" />
              {/* Cabin interior light indicator */}
              <line x1="190" y1="75" x2="240" y2="80" stroke={colorHex} strokeWidth="1" opacity="0.4" />
              {/* Wheels */}
              <circle cx="100" cy="140" r="22" stroke="#E4E4E7" strokeWidth="2" fill="#18181B" />
              <circle cx="100" cy="140" r="14" stroke={colorHex} strokeWidth="1.2" fill="none" />
              <circle cx="100" cy="140" r="5" fill="#52525B" />
              
              <circle cx="300" cy="140" r="22" stroke="#E4E4E7" strokeWidth="2" fill="#18181B" />
              <circle cx="300" cy="140" r="14" stroke={colorHex} strokeWidth="1.2" fill="none" />
              <circle cx="300" cy="140" r="5" fill="#52525B" />
              {/* Aerodynamic wind streaks */}
              <path d="M 10,70 H 45 M 25,80 H 75 M 5,90 H 35" stroke="#3F3F46" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            </g>
            <defs>
              <radialGradient id="shadow-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        );
      case "kallisto-gt":
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.85">
              <line x1="20" y1="150" x2="380" y2="150" stroke="#3F3F46" strokeWidth="2" strokeDasharray="3 3" />
              <ellipse cx="200" cy="150" rx="140" ry="8" fill="#000" opacity="0.3" />
              {/* Audi-like Aggressive coupe structure */}
              <path d="M 35,138 C 55,108 95,102 125,102 C 170,102 215,62 270,62 C 320,62 345,105 370,138" stroke={colorHex} strokeWidth="2.5" fill="none" />
              <path d="M 35,138 L 370,138 M 35,138 H 85 M 315,138 H 370" stroke="#71717A" strokeWidth="2" />
              {/* Greenhouse */}
              <path d="M 140,102 Q 220,68 285,102" stroke="#52525B" strokeWidth="1.5" />
              <line x1="210" y1="102" x2="210" y2="80" stroke="#52525B" strokeWidth="1" />
              {/* Wheels */}
              <circle cx="105" cy="138" r="23" stroke="#A1A1AA" strokeWidth="2" fill="#18181B" />
              <circle cx="105" cy="138" r="12" stroke={colorHex} strokeWidth="1" />
              <circle cx="295" cy="138" r="23" stroke="#A1A1AA" strokeWidth="2" fill="#18181B" />
              <circle cx="295" cy="138" r="12" stroke={colorHex} strokeWidth="1" />
              {/* Aggressive nose lip */}
              <path d="M 350,118 L 375,130" stroke={colorHex} strokeWidth="1.5" />
            </g>
          </svg>
        );
      case "kestrel-gtr":
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.85">
              <line x1="20" y1="150" x2="380" y2="150" stroke="#4B5563" strokeWidth="1.5" />
              {/* Low-slung hypercar silhouette */}
              <path d="M 30,140 Q 50,95 90,95 C 130,95 180,50 250,55 C 300,58 330,122 375,123" stroke={colorHex} strokeWidth="2.5" fill="none" />
              {/* Giant rear active spoiler/wing */}
              <path d="M 40,90 L 70,85 M 35,90 V 110" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              {/* Under-body ground effect diffuser */}
              <path d="M 30,140 L 375,140" stroke="#D1D5DB" strokeWidth="2" />
              <path d="M 345,140 L 360,152 M 355,140 L 370,152" stroke="#EF4444" strokeWidth="2" />
              {/* Cabin arc */}
              <path d="M 155,90 Q 215,58 260,88" stroke="#52525B" strokeWidth="1.5" />
              {/* Track wheels */}
              <circle cx="110" cy="140" r="21" stroke="#F4F4F5" strokeWidth="2.5" fill="#09090B" />
              <circle cx="110" cy="140" r="7" fill={colorHex} />
              <circle cx="290" cy="140" r="23" stroke="#F4F4F5" strokeWidth="2.5" fill="#09090B" />
              <circle cx="290" cy="140" r="7" fill={colorHex} />
            </g>
          </svg>
        );
      case "vanguard-ev":
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.85">
              <line x1="20" y1="150" x2="380" y2="150" stroke="#52525B" strokeWidth="2" />
              {/* Heavy blocky Truck shape */}
              <path d="M 40,140 V 120 L 50,110 H 120 L 150,75 H 250 L 300,105 H 360 V 140 Z" stroke={colorHex} strokeWidth="2.5" fill="none" />
              {/* Bed dividing line */}
              <line x1="300" y1="105" x2="300" y2="140" stroke="#52525B" strokeWidth="1.5" />
              {/* Windows */}
              <path d="M 160,82 H 235 L 255,105 H 175 Z" stroke="#3F3F46" strokeWidth="1.5" />
              {/* High air clearance rugged suspension lines */}
              <line x1="90" y1="140" x2="90" y2="115" stroke="#27272A" strokeWidth="4" />
              <line x1="290" y1="140" x2="290" y2="115" stroke="#27272A" strokeWidth="4" />
              {/* Monster wheels */}
              <circle cx="90" cy="135" r="25" stroke="#E4E4E7" strokeWidth="3" fill="#18181B" />
              <rect x="80" y="125" width="20" height="20" stroke={colorHex} strokeWidth="1" fill="none" />
              <circle cx="290" cy="135" r="25" stroke="#E4E4E7" strokeWidth="3" fill="#18181B" />
              <rect x="280" y="125" width="20" height="20" stroke={colorHex} strokeWidth="1" fill="none" />
            </g>
          </svg>
        );
      case "zephyr-sovereign":
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.85">
              <line x1="20" y1="150" x2="380" y2="150" stroke="#3F3F46" strokeWidth="1.5" strokeDasharray="5 5" />
              {/* Ultra luxury executive long sedan wheel base */}
              <path d="M 35,138 Q 60,118 100,115 H 150 Q 195,65 295,68 H 325 Q 355,95 375,138" stroke={colorHex} strokeWidth="2.5" fill="none" />
              <path d="M 35,138 H 375" stroke="#52525B" strokeWidth="1.5" />
              {/* Executive Windows division */}
              <path d="M 180,115 L 205,75 H 280 L 305,115 Z" stroke="#3F3F46" strokeWidth="1.5" />
              {/* Classic turbine rims */}
              <circle cx="95" cy="138" r="22" stroke="#E2E8F0" strokeWidth="2.5" fill="#0F172A" />
              {/* Spokes indicator */}
              <circle cx="95" cy="138" r="16" stroke={colorHex} strokeWidth="1" strokeDasharray="3 1" />
              <circle cx="295" cy="138" r="22" stroke="#E2E8F0" strokeWidth="2.5" fill="#0F172A" />
              <circle cx="295" cy="138" r="16" stroke={colorHex} strokeWidth="1" strokeDasharray="3 1" />
            </g>
          </svg>
        );
      default: // SUV configuration (e.g., zephyr-ascent)
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.85">
              <line x1="20" y1="150" x2="380" y2="150" stroke="#52525B" strokeWidth="2" strokeDasharray="4 4" />
              {/* Tall premium family SUV footprint */}
              <path d="M 40,140 Q 50,115 70,110 H 110 L 140,78 H 285 L 325,110 H 360 Q 365,125 365,140 Z" stroke={colorHex} strokeWidth="2.5" fill="none" />
              {/* Wide window segment */}
              <path d="M 148,85 H 220 V 110 H 148 Z M 228,85 H 275 L 295,110 H 228 Z" stroke="#3F3F46" strokeWidth="1.5" />
              {/* High comfort wheels */}
              <circle cx="100" cy="138" r="23" stroke="#D1D5DB" strokeWidth="2" fill="#18181B" />
              <circle cx="100" cy="138" r="14" stroke={colorHex} strokeWidth="1.2" />
              <circle cx="295" cy="138" r="23" stroke="#D1D5DB" strokeWidth="2" fill="#18181B" />
              <circle cx="295" cy="138" r="14" stroke={colorHex} strokeWidth="1.2" />
            </g>
          </svg>
        );
    }
  };

  // Perform search and filtering logic
  const filteredVehicles = VEHICLES.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(search.toLowerCase()) ||
      car.brand.toLowerCase().includes(search.toLowerCase()) ||
      car.type.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "ALL" || car.type === selectedType;
    const matchesFuel = selectedFuel === "ALL" || car.specs.fuelType === selectedFuel;
    return matchesSearch && matchesType && matchesFuel;
  });

  // Calculate monthly loan payment
  const calculatePayment = (carPrice: number) => {
    const principal = carPrice - downPayment;
    if (principal <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    if (monthlyRate === 0) return (principal / loanTerm).toFixed(2);
    const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm));
    return isNaN(payment) ? "0.00" : payment.toFixed(2);
  };

  const handleTestDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) return;
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedVehicle(null);
    }, 4500);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="marketplace-container">
      {/* Cinematic Hero Spotlight */}
      <div className="relative w-full rounded-2xl overflow-hidden mb-12 border border-zinc-900 group shadow-2xl bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/30 to-transparent z-10" />
        <img
          src={heroCarImg}
          alt="Cinematic Aero Hypercar"
          className="w-full h-[280px] md:h-[400px] object-cover object-center transition-transform duration-1000 group-hover:scale-[1.02]"
          referrerPolicy="no-referrer"
        />
        
        {/* HUD active stream status marker */}
        <div className="absolute top-4 left-4 z-20 hidden md:flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-zinc-805/80 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Aether Digital Portal V5.8</span>
        </div>

        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-20 max-w-xl">
          <span className="font-mono text-[9px] md:text-xs tracking-widest text-amber-500 block uppercase font-semibold mb-2">
            APEX AUTOMOTIVE LAUNCH
          </span>
          <h1 className="font-display text-2xl md:text-4xl font-extralight text-white tracking-widest leading-none">
            ENGINEERED <br />
            <span className="font-bold text-amber-500">PERFECTION</span>
          </h1>
          <p className="text-zinc-300 font-sans text-xs md:text-sm mt-3 leading-relaxed font-light">
            Step into the next assembly of bespoke hypercars, premium long-range electric cruisers, and indestructible tactical terrain vehicles. Built for those who demand uncompromising performance.
          </p>
        </div>
      </div>

      {/* Search Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
        <div>
          <h1 className="font-display text-3xl font-extralight tracking-widest text-white">
            VEHICLE <span className="font-bold text-amber-500">MARKETPLACE</span>
          </h1>
          <p className="text-zinc-400 font-sans text-sm mt-1 max-w-xl">
            Sift through our hyper-engineered automotive catalog. Select a vessel to discover specifications, compute financing plans, or reserve test courses.
          </p>
        </div>

        {/* Search bar & simple details controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              id="vehicle-search"
              placeholder="Search make, model, type..."
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded px-10 py-3 text-xs tracking-wider focus:outline-none focus:border-amber-500 font-sans"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => { setSearch(""); setSelectedType("ALL"); setSelectedFuel("ALL"); }}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-3 text-xs tracking-wider font-display rounded border border-zinc-800"
            >
              RESET
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-900 pb-6 mb-8" id="catalog-filters">
        <div className="flex items-center space-x-2 text-zinc-500 font-mono text-[10px] uppercase tracking-wider mr-4">
          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
          <span>Body Segment:</span>
        </div>
        {["ALL", "Sedan", "SUV", "Hypercar", "Truck"].map((t) => (
          <button
            key={t}
            id={`filter-type-${t.toLowerCase()}`}
            onClick={() => setSelectedType(t)}
            className={`px-4 py-1.5 text-xs font-mono tracking-widest rounded transition-all duration-300 ${
              selectedType === t
                ? "bg-amber-500 text-black font-semibold"
                : "text-zinc-400 hover:text-white bg-zinc-900/40"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}

        <div className="w-full md:w-auto h-0 md:h-6 border-r border-zinc-800 mx-2 hidden md:block"></div>

        <div className="flex items-center space-x-2 text-zinc-500 font-mono text-[10px] uppercase tracking-wider mr-2 md:ml-2">
          <span>Propulsion:</span>
        </div>
        {["ALL", "Electric", "Hybrid", "Gasoline"].map((f) => (
          <button
            key={f}
            id={`filter-fuel-${f.toLowerCase()}`}
            onClick={() => setSelectedFuel(f)}
            className={`px-4 py-1.5 text-xs font-mono tracking-widest rounded transition-all duration-300 ${
              selectedFuel === f
                ? "bg-zinc-100 text-black font-semibold"
                : "text-zinc-400 hover:text-white bg-zinc-900/10"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="vehicles-grid">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((car) => {
            const isComparing = compareList.includes(car.id);
            return (
              <div
                key={car.id}
                id={`vehicle-card-${car.id}`}
                className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 text-white rounded-lg overflow-hidden transition-all duration-400 flex flex-col group hover:shadow-xl"
              >
                {/* Visual rendering canvas */}
                <div className="relative aspect-[16/10] w-full bg-zinc-950 overflow-hidden flex items-center justify-center border-b border-zinc-900/80 group/canvas">
                  {/* Photo Layer */}
                  <div className={`absolute inset-0 transition-all duration-700 ease-out ${
                    showCAD[car.id] ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
                  }`}>
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/canvas:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {/* Linear gradient wash */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent opacity-80" />
                  </div>

                  {/* Blueprint CAD Schematic Layer */}
                  <div className={`absolute inset-0 p-4 flex flex-col items-center justify-center bg-zinc-950 transition-all duration-700 ease-out ${
                    showCAD[car.id] ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                  }`}>
                    <div className="w-full h-full flex items-center justify-center">
                      {renderCarSchematic(car.id)}
                    </div>
                  </div>

                  {/* Specs & Info Overlays */}
                  <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
                    <span className="bg-zinc-950/90 backdrop-blur-md border border-zinc-900 px-2.5 py-1 rounded text-[9px] font-mono tracking-widest text-zinc-300 uppercase font-medium shadow">
                      {car.specs.fuelType}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 z-20 flex gap-1.5">
                    {/* Interactive CAD / Photo toggle */}
                    <button
                      onClick={(e) => toggleCAD(car.id, e)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border font-mono text-[9.5px] tracking-widest uppercase transition-all duration-300 shadow cursor-pointer ${
                        showCAD[car.id]
                          ? "bg-amber-500/15 border-amber-500 text-amber-500 hover:bg-amber-500/25"
                          : "bg-zinc-950/90 backdrop-blur-md border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                      }`}
                      title={showCAD[car.id] ? "Switch to Photorealistic Showroom" : "Activate Orthographic CAD Blueprint"}
                    >
                      <Cpu className="h-3 w-3" />
                      <span className="hidden sm:inline">{showCAD[car.id] ? "RENDER" : "CAD VIEW"}</span>
                    </button>
                  </div>
                  
                  {/* Floating pricing watermark */}
                  <div className="absolute bottom-3 right-3 z-10 pointer-events-none bg-black/60 backdrop-blur-sm border border-zinc-900 px-2.5 py-1 rounded">
                    <span className="text-[10.5px] font-mono tracking-wider text-amber-500 font-bold">
                      ${car.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 z-10 pointer-events-none opacity-80 font-mono text-[9px] text-zinc-400">
                    <span>{car.specs.horsepower} HP • {car.specs.driveTrain}</span>
                  </div>
                </div>

                {/* Info & Specs Segment */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[10px] tracking-widest text-amber-500 block uppercase font-medium">
                      {car.brand}
                    </span>
                    <h3 className="font-display text-xl font-medium tracking-wide text-zinc-100 group-hover:text-white mt-1">
                      {car.name}
                    </h3>
                    <p className="text-zinc-400 text-xs font-sans font-light leading-relaxed mt-3 line-clamp-2">
                      {car.description}
                    </p>
                  </div>

                  {/* Highlight core performance info */}
                  <div className="grid grid-cols-3 gap-2 border-y border-zinc-900 py-3.5 my-5 font-mono text-center">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">0-60 MPH</span>
                      <span className="text-xs font-medium text-zinc-200 mt-1 block">{car.specs.zeroToSixty}s</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">TOP SPEED</span>
                      <span className="text-xs font-medium text-zinc-200 mt-1 block">{car.specs.topSpeed} MPH</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">MOTIVE RANGE</span>
                      <span className="text-[10px] font-medium text-zinc-200 mt-1 block leading-tight">{car.specs.rangeOrMpg.split(" ")[0]} M</span>
                    </div>
                  </div>

                  {/* Controls Row */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedVehicle(car)}
                        id={`btn-details-${car.id}`}
                        className="flex-grow bg-zinc-90 w-full hover:bg-zinc-800 border border-zinc-800 text-white rounded py-2.5 text-xs text-center tracking-widest font-display transition duration-300"
                      >
                        SPECIFICATIONS
                      </button>
                      <button
                        onClick={() => onConfiguratorSelect(car.id)}
                        id={`btn-config-${car.id}`}
                        className="bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded px-4 py-2.5 text-xs tracking-widest font-display transition duration-300 font-semibold"
                        title="Configure custom colors & wheels"
                      >
                        BUILD
                      </button>
                    </div>

                    <button
                      onClick={() => onCompareSelect(car.id)}
                      id={`btn-compare-${car.id}`}
                      className={`w-full py-2 text-[10px] tracking-widest font-mono rounded border transition-all duration-300 uppercase ${
                        isComparing
                          ? "bg-amber-500/10 border-amber-500 text-amber-500"
                          : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {isComparing ? "✓ Added to Comparison Engine" : "＋ Add to Side-by-Side Comparison"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-lg">
            <p className="text-zinc-500 font-mono text-sm">NO MOTORIZED VESSELS MATCHED KEYWORD SEARCH INVENTORY</p>
          </div>
        )}
      </div>

      {/* Details Sheets / Specifications Modal */}
      <AnimatePresence>
        {selectedVehicle && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
              id="vehicle-details-modal"
            >
              
              {/* Header */}
              <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-md px-6 py-4 border-b border-zinc-900 flex items-center justify-between z-10">
                <div>
                  <span className="font-mono text-xs tracking-widest text-amber-500 block uppercase font-medium">{selectedVehicle.brand} Specs</span>
                  <h2 className="font-display text-2xl font-light text-white tracking-wider">{selectedVehicle.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded"
                  id="modal-close-btn"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 lg:p-8 space-y-8">
                
                {/* General Description Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* Schematic Representation */}
                  <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-lg flex flex-col items-center relative overflow-hidden">
                    <div className="relative aspect-[16/10] w-full bg-zinc-950 rounded overflow-hidden flex items-center justify-center">
                      {/* Photo View */}
                      <div className={`absolute inset-0 transition-opacity duration-500 ${showCAD[selectedVehicle.id] ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                        <img
                          src={selectedVehicle.image}
                          alt={selectedVehicle.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {/* Schematic View */}
                      <div className={`absolute inset-0 p-4 flex items-center justify-center bg-zinc-950 transition-opacity duration-500 ${showCAD[selectedVehicle.id] ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                        {renderCarSchematic(selectedVehicle.id, "#F59E0B")}
                      </div>

                      {/* Toggle button on details image */}
                      <button
                        onClick={(e) => toggleCAD(selectedVehicle.id, e)}
                        className="absolute bottom-3 right-3 bg-zinc-950/90 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 px-3 py-1.5 rounded font-mono text-[10px] tracking-wider uppercase transition-all duration-300 flex items-center space-x-1"
                      >
                        <Cpu className="h-3.5 w-3.5 text-amber-500" />
                        <span>{showCAD[selectedVehicle.id] ? "Show Photo" : "Show CAD Blueprint"}</span>
                      </button>
                    </div>

                    <div className="mt-3 text-center font-mono text-[10.5px] text-zinc-400 uppercase tracking-widest">
                      {showCAD[selectedVehicle.id] ? "Orthographic CAD Projection Scheme" : "Studio Showroom Cinematic Render"}
                    </div>
                  </div>

                  {/* Core details */}
                  <div className="space-y-4">
                    <h4 className="font-display text-xs text-zinc-400 tracking-widest uppercase font-semibold">PREMIUM DESIGN FOCUS</h4>
                    <p className="text-zinc-300 font-sans text-sm leading-relaxed font-light">
                      {selectedVehicle.description}
                    </p>
                    
                    <div className="pt-4">
                      <h4 className="font-display text-xs text-zinc-400 tracking-widest uppercase font-semibold mb-3">VEHICLE HIGHLIGHTS</h4>
                      <ul className="space-y-2">
                        {selectedVehicle.highlights.map((h, idx) => (
                          <li key={idx} className="flex items-start text-xs text-zinc-400 font-sans">
                            <span className="text-amber-500 mr-2.5 mt-0.5 font-bold">▪</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications Matrix */}
                <div>
                  <h3 className="font-display text-xs text-zinc-400 tracking-widest uppercase font-semibold mb-4 border-b border-zinc-900 pb-2">
                    TECHNICAL SPECIFICATION MATRIX
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px] uppercase">Power output</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">{selectedVehicle.specs.horsepower} HP</span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px] uppercase">Max torque</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">{selectedVehicle.specs.torque} lb-ft</span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px] uppercase">0-60 MPH Speed</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">{selectedVehicle.specs.zeroToSixty}s</span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px] uppercase">Peak Velocity</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">{selectedVehicle.specs.topSpeed} MPH</span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px] uppercase">Drivetrain setup</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">{selectedVehicle.specs.driveTrain}</span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px] uppercase">Fuel System</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">{selectedVehicle.specs.fuelType}</span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px] uppercase">Fuel economy / range</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1 leading-snug">{selectedVehicle.specs.rangeOrMpg}</span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px] uppercase">Energy Reservoir</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">{selectedVehicle.specs.batteryCapacity || "Gasoline Fluid Fuel"}</span>
                    </div>
                  </div>
                </div>

                {/* Booking & Financial Simulator Section Split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                  
                  {/* Monthly Loan Calculator */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
                    <div className="flex items-center space-x-2 text-amber-500 font-display text-xs uppercase tracking-widest font-semibold mb-4">
                      <Calculator className="h-4 w-4" />
                      <span>FINANCING CALCULATOR ENGINE</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-zinc-400">DOWN PAYMENT ($)</span>
                          <span className="text-amber-500 font-bold">${downPayment.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={Math.floor(selectedVehicle.price * 0.7)}
                          step="1000"
                          className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          value={downPayment}
                          onChange={(e) => setDownPayment(Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-zinc-400">AMORTIZATION TERM (MONTHS)</span>
                          <span className="text-amber-500 font-bold">{loanTerm} Mo.</span>
                        </div>
                        <select
                          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono"
                          value={loanTerm}
                          onChange={(e) => setLoanTerm(Number(e.target.value))}
                        >
                          <option value="36">36 Months (3 Years)</option>
                          <option value="48">48 Months (4 Years)</option>
                          <option value="60">60 Months (5 Years)</option>
                          <option value="72">72 Months (6 Years)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-zinc-400">ANNUAL PERCENTAGE INTEREST (APR)</span>
                          <span className="text-amber-500 font-bold">{interestRate}%</span>
                        </div>
                        <input
                          type="range"
                          min="1.9"
                          max="9.9"
                          step="0.1"
                          className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          value={interestRate}
                          onChange={(e) => setInterestRate(Number(e.target.value))}
                        />
                      </div>

                      <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] block uppercase">Est. Monthly Payment</span>
                          <span className="text-white font-display text-2xl font-bold tracking-tight">${calculatePayment(selectedVehicle.price)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-500 font-mono text-[10px] block uppercase">Retail Value</span>
                          <span className="text-zinc-300 font-mono text-sm">${selectedVehicle.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Private Test-Course Booking Form */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 relative">
                    {bookingSuccess ? (
                      <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center text-center p-4 rounded-lg z-10 transition-all">
                        <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                          <Check className="h-6 w-6 text-emerald-500" />
                        </div>
                        <h4 className="font-display text-base text-zinc-100 tracking-wider">RESERVATION CONFIRMED</h4>
                        <p className="text-xs text-zinc-400 font-sans mt-2 leading-relaxed max-w-xs">
                          Your private circuit course reservation is secured. Your executive automotive sales advisor will connect via telemetry/email.
                        </p>
                      </div>
                    ) : null}

                    <div className="flex items-center space-x-2 text-amber-500 font-display text-xs uppercase tracking-widest font-semibold mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>RESERVE EXCLUSIVE TEST COURSE</span>
                    </div>

                    <form onSubmit={handleTestDriveSubmit} className="space-y-3 font-mono text-xs">
                      <div>
                        <label className="text-zinc-500 block mb-1">SELECT LOUNGE/LOCATION</label>
                        <select
                          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                          value={bookingLocation}
                          onChange={(e) => setBookingLocation(e.target.value)}
                        >
                          <option value="San Francisco Signature Lounge">San Francisco Signature Lounge</option>
                          <option value="New York Executive Studio">New York Executive Studio</option>
                          <option value="Munich High Performance Circuit">Munich High Performance Circuit</option>
                          <option value="Tokyo Horizon Salon">Tokyo Horizon Salon</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-zinc-500 block mb-1">SELECT DATE</label>
                          <input
                            type="date"
                            required
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-zinc-500 block mb-1">SELECT HOUR</label>
                          <select
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                          >
                            <option value="09:00">09:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="13:00">01:00 PM</option>
                            <option value="15:00">03:00 PM</option>
                            <option value="17:00">05:00 PM</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="submit"
                          id="btn-confirm-booking"
                          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-display font-semibold tracking-wider p-2.5 rounded text-xs transition duration-300 uppercase"
                        >
                          CONFIRM PRIVATE COURSE BOOKING
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
