import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Marketplace from "./components/Marketplace";
import VehicleConfigurator from "./components/VehicleConfigurator";
import VehicleComparison from "./components/VehicleComparison";
import AICopilot from "./components/AICopilot";
import { Vehicle } from "./types";
import { VEHICLES } from "./data/vehicles";
import { X, Calculator, Calendar, Check, Info, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("marketplace");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("aether-plaid");
  const [compareList, setCompareList] = useState<string[]>(["aether-plaid", "kallisto-gt"]);
  
  // Custom global search state passed to Marketplace if matching search
  const [marketSearchText, setMarketSearchText] = useState("");

  // Global details spec sheet modal state
  const [globalSpecsVehicle, setGlobalSpecsVehicle] = useState<Vehicle | null>(null);

  // Global reservation states for details modal
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00");
  const [bookingLocation, setBookingLocation] = useState("San Francisco Signature Lounge");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Global financing calculator states for details modal
  const [downPayment, setDownPayment] = useState<number>(15000);
  const [loanTerm, setLoanTerm] = useState<number>(60);
  const [interestRate, setInterestRate] = useState<number>(4.9);

  const handleAddCompare = (id: string) => {
    if (!compareList.includes(id)) {
      setCompareList([...compareList, id]);
    }
  };

  const handleRemoveCompare = (id: string) => {
    setCompareList(compareList.filter((item) => item !== id));
  };

  const handleToggleCompare = (id: string) => {
    if (compareList.includes(id)) {
      handleRemoveCompare(id);
    } else {
      handleAddCompare(id);
    }
  };

  const handleDiscoverSpecs = (car: Vehicle) => {
    setGlobalSpecsVehicle(car);
  };

  const handleBuildConfig = (id: string) => {
    setSelectedVehicleId(id);
    setActiveTab("configurator");
  };

  // Monthly loan payment formula
  const calculatePayment = (carPrice: number) => {
    const principal = carPrice - downPayment;
    if (principal <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    if (monthlyRate === 0) return (principal / loanTerm).toFixed(2);
    const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm));
    return isNaN(payment) ? "0.00" : payment.toFixed(2);
  };

  const handleTestDriveSubmitGlobal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) return;
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setGlobalSpecsVehicle(null);
    }, 4500);
  };

  // Custom orthographic blueprint rendering
  const renderCarSchematicGlobal = (vehicleId: string, colorHex: string = "#F59E0B") => {
    switch (vehicleId) {
      case "aether-plaid":
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#3F3F46" strokeWidth="2" strokeDasharray="4 4" />
            <ellipse cx="200" cy="150" rx="150" ry="10" fill="#000" opacity="0.3" />
            <path d="M 40,140 Q 60,110 110,110 T 190,70 Q 240,70 290,105 Q 340,115 365,140" stroke={colorHex} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 40,140 L 365,140 M 40,140 H 80 M 320,140 H 365" stroke="#71717A" strokeWidth="2" />
            <path d="M 120,105 Q 185,68 250,71 C 275,73 295,95 305,107" stroke="#52525B" strokeWidth="1.5" fill="none" />
            <circle cx="100" cy="140" r="22" stroke="#E4E4E7" strokeWidth="2" fill="#18181B" />
            <circle cx="300" cy="140" r="22" stroke="#E4E4E7" strokeWidth="2" fill="#18181B" />
          </svg>
        );
      case "kallisto-gt":
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#3F3F46" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 35,138 C 55,108 95,102 125,102 C 170,102 215,62 270,62 C 320,62 345,105 370,138" stroke={colorHex} strokeWidth="2.5" fill="none" />
            <path d="M 35,138 L 370,138 M 35,138 H 85 M 315,138 H 370" stroke="#71717A" strokeWidth="2" />
            <path d="M 140,102 Q 220,68 285,102" stroke="#52525B" strokeWidth="1.5" />
            <circle cx="105" cy="138" r="23" stroke="#A1A1AA" strokeWidth="2" fill="#18181B" />
            <circle cx="295" cy="138" r="23" stroke="#A1A1AA" strokeWidth="2" fill="#18181B" />
          </svg>
        );
      case "kestrel-gtr":
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#4B5563" strokeWidth="1.5" />
            <path d="M 30,140 Q 50,95 90,95 C 130,95 180,50 250,55 C 300,58 330,122 375,123" stroke={colorHex} strokeWidth="2.5" fill="none" />
            <path d="M 40,90 L 70,85 M 35,90 V 110" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            <path d="M 30,140 L 375,140" stroke="#D1D5DB" strokeWidth="2" />
            <circle cx="110" cy="140" r="21" stroke="#F4F4F5" strokeWidth="2.5" fill="#09090B" />
            <circle cx="290" cy="140" r="23" stroke="#F4F4F5" strokeWidth="2.5" fill="#09090B" />
          </svg>
        );
      case "vanguard-ev":
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#52525B" strokeWidth="2" />
            <path d="M 40,140 V 120 L 50,110 H 120 L 150,75 H 250 L 300,105 H 360 V 140 Z" stroke={colorHex} strokeWidth="2.5" fill="none" />
            <line x1="300" y1="105" x2="300" y2="140" stroke="#52525B" strokeWidth="1.5" />
            <circle cx="90" cy="135" r="25" stroke="#E4E4E7" strokeWidth="3" fill="#18181B" />
            <circle cx="290" cy="135" r="25" stroke="#E4E4E7" strokeWidth="3" fill="#18181B" />
          </svg>
        );
      case "zephyr-sovereign":
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#3F3F46" strokeWidth="1.5" strokeDasharray="5 5" />
            <path d="M 35,138 Q 60,118 100,115 H 150 Q 195,65 295,68 H 325 Q 355,95 375,138" stroke={colorHex} strokeWidth="2.5" fill="none" />
            <circle cx="95" cy="138" r="22" stroke="#E2E8F0" strokeWidth="2.5" fill="#0F172A" />
            <circle cx="295" cy="138" r="22" stroke="#E2E8F0" strokeWidth="2.5" fill="#0F172A" />
          </svg>
        );
      default:
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#52525B" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 40,140 Q 50,115 70,110 H 110 L 140,78 H 285 L 325,110 H 360 Q 365,125 365,140 Z" stroke={colorHex} strokeWidth="2.5" fill="none" />
            <circle cx="100" cy="138" r="23" stroke="#D1D5DB" strokeWidth="2" fill="#18181B" />
            <circle cx="295" cy="138" r="23" stroke="#D1D5DB" strokeWidth="2" fill="#18181B" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans flex flex-col justify-between" id="apex-platform-root">
      
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Main Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Pages tab matching */}
      <main className="flex-grow z-10">
        <AnimatePresence mode="wait">
          {activeTab === "marketplace" && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <Marketplace
                onCompareSelect={handleToggleCompare}
                compareList={compareList}
                onConfiguratorSelect={handleBuildConfig}
                initialSearch={marketSearchText}
              />
            </motion.div>
          )}

          {activeTab === "configurator" && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <VehicleConfigurator selectedVehicleId={selectedVehicleId} />
            </motion.div>
          )}

          {activeTab === "comparison" && (
            <motion.div
              key="compare"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <VehicleComparison
                selectedVehicleIds={compareList}
                onRemoveVehicle={handleRemoveCompare}
                onAddVehicle={handleAddCompare}
              />
            </motion.div>
          )}

          {activeTab === "ai-advisor" && (
            <motion.div
              key="advisor"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="h-full"
            >
              <AICopilot
                onDiscoverSpecs={handleDiscoverSpecs}
                onBuildConfig={handleBuildConfig}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Specifications Modal triggered from AI Lounge links */}
      <AnimatePresence>
        {globalSpecsVehicle && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
              id="global-details-modal"
            >
              
              <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-md px-6 py-4 border-b border-zinc-900 flex items-center justify-between z-10">
                <div>
                  <span className="font-mono text-xs tracking-widest text-amber-500 block uppercase font-medium">{globalSpecsVehicle.brand} Secure Specs</span>
                  <h2 className="font-display text-2xl font-light text-white tracking-wider">{globalSpecsVehicle.name}</h2>
                </div>
                <button
                  onClick={() => setGlobalSpecsVehicle(null)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded"
                  id="global-modal-close-btn"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 lg:p-8 space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="bg-zinc-900/40 border border-zinc-900 p-6 rounded-lg flex flex-col items-center">
                    {renderCarSchematicGlobal(globalSpecsVehicle.id, "#F59E0B")}
                    <div className="mt-4 text-center font-mono text-[11px] text-zinc-500 uppercase tracking-widest">
                      Orthographic CAD Projection Scheme
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-display text-xs text-zinc-400 tracking-widest uppercase font-semibold">PREMIUM DESIGN FOCUS</h4>
                    <p className="text-zinc-300 font-sans text-sm leading-relaxed font-light">
                      {globalSpecsVehicle.description}
                    </p>
                    
                    <div className="pt-4">
                      <h4 className="font-display text-xs text-zinc-400 tracking-widest uppercase font-semibold mb-3">VEHICLE HIGHLIGHTS</h4>
                      <ul className="space-y-2">
                        {globalSpecsVehicle.highlights.map((h, idx) => (
                          <li key={idx} className="flex items-start text-xs text-zinc-400 font-sans">
                            <span className="text-amber-500 mr-2.5 mt-0.5 font-bold">▪</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-xs text-zinc-400 tracking-widest uppercase font-semibold mb-4 border-b border-zinc-900 pb-2">
                    TECHNICAL SPECIFICATION MATRIX
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px] uppercase">Power output</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">{globalSpecsVehicle.specs.horsepower} HP</span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px] uppercase">Max torque</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">{globalSpecsVehicle.specs.torque} lb-ft</span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px] uppercase">0-60 MPH Speed</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">{globalSpecsVehicle.specs.zeroToSixty}s</span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px] uppercase">Peak Velocity</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">{globalSpecsVehicle.specs.topSpeed} MPH</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                  {/* Financing Panel */}
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
                          max={Math.floor(globalSpecsVehicle.price * 0.7)}
                          step="1000"
                          className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          value={downPayment}
                          onChange={(e) => setDownPayment(Number(e.target.value))}
                        />
                      </div>
                      <div className="flex justify-between border-t border-zinc-900 pt-4 items-center">
                        <div>
                          <span className="text-zinc-500 font-mono text-[10px] block uppercase">Est. Monthly Payment</span>
                          <span className="text-white font-display text-2xl font-bold">${calculatePayment(globalSpecsVehicle.price)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-500 font-mono text-[10px] block uppercase">Retail Value</span>
                          <span className="text-zinc-300 font-mono text-sm">${globalSpecsVehicle.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Panel */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 relative">
                    {bookingSuccess && (
                      <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center text-center p-4 rounded-lg z-10">
                        <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                          <Check className="h-6 w-6 text-emerald-500" strokeWidth="2.5" />
                        </div>
                        <h4 className="font-display text-base text-zinc-100 tracking-wider">RESERVATION CONFIRMED</h4>
                        <p className="text-xs text-zinc-400 font-sans mt-2 max-w-xs block">
                          Your private circuit course reservation is secured. Your advisor will connect via telemetry.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-amber-500 font-display text-xs uppercase tracking-widest font-semibold mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>RESERVE EXCLUSIVE TEST COURSE</span>
                    </div>

                    <form onSubmit={handleTestDriveSubmitGlobal} className="space-y-3 font-mono text-xs">
                      <div>
                        <label className="text-zinc-500 block mb-1">SELECT LOUNGE/LOCATION</label>
                        <select
                          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-3 py-2"
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
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-3 py-2"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-zinc-500 block mb-1">SELECT HOUR</label>
                          <select
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-3 py-2"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                          >
                            <option value="09:00">09:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="13:00">01:00 PM</option>
                            <option value="15:00">03:00 PM</option>
                          </select>
                        </div>
                      </div>
                      <div className="pt-3">
                        <button
                          type="submit"
                          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-display font-semibold tracking-wider p-2.5 rounded text-xs uppercase"
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

      {/* Elegant minimalist footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-zinc-500 font-mono text-[9px] uppercase tracking-widest z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} APEX MOTORSPORTS INTERNATIONAL GROUP. ALL SPECIFICATIONS REGISTERED.</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> <span>SECURITY CODES SECURED</span></span>
          </div>
        </div>
      </footer>

    </div>
  );
}
