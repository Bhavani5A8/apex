import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Marketplace from "./components/Marketplace";
import VehicleConfigurator from "./components/VehicleConfigurator";
import VehicleComparison from "./components/VehicleComparison";
import AICopilot from "./components/AICopilot";
import UserHub from "./components/UserHub";
import AdminConsole from "./components/AdminConsole";

import { Vehicle } from "./types";
import { auth, googleProvider } from "./firebase";
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from "firebase/auth";
import { dbService, BrandEntity, CategoryEntity } from "./dbService";
import { X, Calculator, Calendar, Check, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("marketplace");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("aether-plaid");
  const [compareList, setCompareList] = useState<string[]>(["aether-plaid", "kallisto-gt"]);
  
  // Custom global search state passed to Marketplace
  const [marketSearchText, setMarketSearchText] = useState("");

  // Firebase auth & user state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Live database vehicles / brands / categories state
  const [dbVehicles, setDbVehicles] = useState<Vehicle[]>([]);
  const [dbBrands, setDbBrands] = useState<BrandEntity[]>([]);
  const [dbCategories, setDbCategories] = useState<CategoryEntity[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);

  // Global details specs sheet modal state (fallback for AI lounge interaction)
  const [globalSpecsVehicle, setGlobalSpecsVehicle] = useState<any | null>(null);

  // Global details sheets finance tools
  const [downPayment, setDownPayment] = useState<number>(15000);
  const [loanTerm, setLoanTerm] = useState<number>(60);
  const [interestRate, setInterestRate] = useState<number>(4.9);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("11:00");
  const [bookingLocation, setBookingLocation] = useState("San Francisco Signature Lounge");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Initialize and synchronizes database
  const refreshDatabaseCollections = async () => {
    try {
      setDbLoading(true);
      // Try to seed first if database is blank
      await dbService.seedCatalogIfEmpty();
      
      const v = await dbService.getVehicles();
      const b = await dbService.getBrands();
      const c = await dbService.getCategories();
      
      setDbVehicles(v as any);
      setDbBrands(b);
      setDbCategories(c);
    } catch (e) {
      console.error("Failed loading data layers:", e);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      refreshDatabaseCollections();
    }
  }, [authLoading]);

  // Sync auth profile context
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const profile = await dbService.syncUserProfile(
          firebaseUser.uid,
          firebaseUser.email || "",
          firebaseUser.displayName || "Client Guest"
        );
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Google authentication popup error:", e);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setActiveTab("marketplace");
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

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

  const handleDiscoverSpecs = (car: any) => {
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

  const handleTestDriveSubmitGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !globalSpecsVehicle) return;
    try {
      setBookingSuccess(true);
      if (user) {
        await dbService.addReservation({
          vehicleId: globalSpecsVehicle.id,
          vehicleName: globalSpecsVehicle.name,
          brand: globalSpecsVehicle.brand,
          userId: user.uid,
          userEmail: user.email || "",
          userName: user.displayName || "Client Guest",
          lounge: bookingLocation,
          date: bookingDate,
          time: bookingTime
        });
      }
      setTimeout(() => {
        setBookingSuccess(false);
        setGlobalSpecsVehicle(null);
      }, 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans flex flex-col justify-between" id="apex-platform-root">
      
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Corporate main header with Google profiles integration */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        userProfile={userProfile} 
        onSignIn={handleSignIn} 
        onSignOut={handleSignOut} 
      />

      {/* Main responsive routing */}
      <main className="flex-grow z-10">
        {dbLoading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center font-mono text-xs tracking-widest text-zinc-500 gap-4">
            <div className="h-6 w-6 border-2 border-t-amber-500 border-zinc-800 rounded-full animate-spin"></div>
            <span>ESTABLISHING SECURED FIRESTORE CONNECTION DATABASES...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "marketplace" && (
              <motion.div
                key="market"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <Marketplace
                  vehicles={dbVehicles}
                  brands={dbBrands}
                  categories={dbCategories}
                  compareList={compareList}
                  favorites={favorites}
                  user={user}
                  onCompareSelect={handleToggleCompare}
                  onConfiguratorSelect={handleBuildConfig}
                  onToggleFavorite={handleToggleFavorite}
                  initialSearch={marketSearchText}
                />
              </motion.div>
            )}

            {activeTab === "configurator" && (
              <motion.div
                key="config"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <VehicleConfigurator selectedVehicleId={selectedVehicleId} />
              </motion.div>
            )}

            {activeTab === "comparison" && (
              <motion.div
                key="compare"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <AICopilot
                  onDiscoverSpecs={handleDiscoverSpecs}
                  onBuildConfig={handleBuildConfig}
                />
              </motion.div>
            )}

            {activeTab === "userhub" && user && (
              <motion.div
                key="userhub"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <UserHub
                  user={user}
                  userProfile={userProfile}
                  vehicles={dbVehicles}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onDiscoverSpecs={handleDiscoverSpecs}
                  onBuildConfig={handleBuildConfig}
                />
              </motion.div>
            )}

            {activeTab === "admin" && userProfile?.role === "admin" && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <AdminConsole
                  vehicles={dbVehicles}
                  brands={dbBrands}
                  categories={dbCategories}
                  onRefreshData={refreshDatabaseCollections}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Global Fallback details modal used for AI Lounge specification queries */}
      <AnimatePresence>
        {globalSpecsVehicle && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-805 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
              id="global-details-modal"
            >
              <div className="sticky top-0 bg-zinc-950/95 backdrop-blur px-6 py-4 border-b border-zinc-900 flex items-center justify-between z-10">
                <div>
                  <span className="font-mono text-xs tracking-widest text-amber-500 block uppercase font-medium">{globalSpecsVehicle.brand} Specs</span>
                  <h2 className="font-display text-2xl font-light text-white tracking-wider">{globalSpecsVehicle.name}</h2>
                </div>
                <button
                  onClick={() => setGlobalSpecsVehicle(null)}
                  className="p-2 text-zinc-400 hover:text-white"
                  id="global-modal-close-btn"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 lg:p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="bg-zinc-900/40 border border-zinc-900 p-6 rounded-lg flex items-center justify-center">
                    <img 
                      src={globalSpecsVehicle.image} 
                      alt={globalSpecsVehicle.name} 
                      className="w-full max-h-44 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-display text-xs text-zinc-400 tracking-widest uppercase font-semibold">PREMIUM DESIGN FOCUS</h4>
                    <p className="text-zinc-300 font-sans text-xs leading-relaxed font-light">
                      {globalSpecsVehicle.description}
                    </p>
                    <div className="pt-2">
                      <span className="text-zinc-500 font-mono text-[10px] block uppercase font-semibold">VEHICLE HIGHLIGHTS</span>
                      <ul className="space-y-1.5 mt-2 text-xs text-zinc-400 font-sans">
                        {(globalSpecsVehicle.highlights || []).map((h: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-amber-500 mr-2">▪</span> {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-mono text-xs text-zinc-400 tracking-widest uppercase font-semibold border-b border-zinc-900 pb-1.5">
                    SPECIFICATION MATRIX
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px]">HORSEPOWER</span>
                      <span className="text-zinc-200 text-sm font-semibold mt-1 block">
                        {globalSpecsVehicle.specifications?.horsepower || globalSpecsVehicle.horsepower || 700} HP
                      </span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px]">TORQUE</span>
                      <span className="text-zinc-200 text-sm font-semibold mt-1 block">
                        {globalSpecsVehicle.specifications?.torque || globalSpecsVehicle.torque || 750} lb-ft
                      </span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px]">0-60 MPH Speed</span>
                      <span className="text-zinc-200 text-sm font-semibold mt-1 block">
                        {globalSpecsVehicle.specifications?.zeroToSixty || globalSpecsVehicle.zeroToSixty || "2.9"}s
                      </span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[10px]">PEAK VELOCITY</span>
                      <span className="text-zinc-200 text-sm font-semibold mt-1 block">
                        {globalSpecsVehicle.specifications?.topSpeed || globalSpecsVehicle.top_speed || 180} MPH
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                  
                  {/* Financing */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 space-y-4">
                    <span className="text-amber-500 font-mono text-[10px] block uppercase font-semibold">FINANCING SIMULATION</span>
                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>DOWN PAYMENT ($)</span>
                          <span className="text-amber-500 font-bold">${downPayment.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={Math.floor(globalSpecsVehicle.price * 0.7)}
                          step="1000"
                          className="w-full accent-amber-505 accent-amber-500 h-1 bg-zinc-900"
                          value={downPayment}
                          onChange={(e) => setDownPayment(Number(e.target.value))}
                        />
                      </div>
                      <div className="pt-2 border-t border-zinc-900 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-zinc-500 text-[10.5px]">EST. MONTHLY</span>
                          <span className="text-white text-lg font-bold block">${calculatePayment(globalSpecsVehicle.price)}</span>
                        </div>
                        <span className="text-zinc-400 font-bold">${globalSpecsVehicle.price?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reservation */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 relative">
                    {bookingSuccess && (
                      <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center text-center p-4 rounded-lg z-10">
                        <Check className="h-6 w-6 text-emerald-500 mb-2" />
                        <span className="text-white font-mono text-xs uppercase font-bold">RESERVATION SECURED</span>
                      </div>
                    )}
                    <span className="text-amber-500 font-mono text-[10px] block uppercase font-semibold mb-3">BOOK TEST SLOT</span>
                    <form onSubmit={handleTestDriveSubmitGlobal} className="space-y-3 font-mono text-xs text-zinc-300">
                      <div>
                        <label className="text-zinc-500 block mb-0.5">SELECT DATE</label>
                        <input
                          type="date"
                          required
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-2 rounded text-xs uppercase"
                      >
                        BOOK TEST EXPERIENCE
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Corporate elite footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-zinc-500 font-mono text-[9px] uppercase tracking-widest z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} APEX MOTORSPORTS PLATFORM. HOSTED ON SECURE FIRESTORE ENGINE.</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5"><ShieldCheck className="h-4 w-4 text-emerald-505 text-emerald-500" /> <span>DATABASE CODES SECURED</span></span>
          </div>
        </div>
      </footer>

    </div>
  );
}
