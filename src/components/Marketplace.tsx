import React, { useState, useEffect } from "react";
import { Vehicle } from "../types";
import { BrandEntity, CategoryEntity, ReviewEntity, dbService } from "../dbService";
import { User as FirebaseUser } from "firebase/auth";
import { 
  Search, SlidersHorizontal, Calculator, Calendar, Heart, Star, Check, X, Cpu, 
  ChevronRight, Building, HelpCircle, MessageSquare, Plus, ArrowUpRight 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import heroCarImg from "../assets/images/hero_car_1780560548671.png";

interface MarketplaceProps {
  vehicles: Vehicle[];
  brands: BrandEntity[];
  categories: CategoryEntity[];
  compareList: string[];
  favorites: string[];
  user: FirebaseUser | null;
  onCompareSelect: (id: string) => void;
  onConfiguratorSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  initialSearch?: string;
}

export default function Marketplace({
  vehicles,
  brands,
  categories,
  compareList,
  favorites,
  user,
  onCompareSelect,
  onConfiguratorSelect,
  onToggleFavorite,
  initialSearch = ""
}: MarketplaceProps) {
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedFuel, setSelectedFuel] = useState<string>("ALL");
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [showCAD, setShowCAD] = useState<Record<string, boolean>>({});

  // Dynamic suggestion states
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Search input debouncer effect (350ms standard)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Retrieve advanced fuzzy indices from full-stack endpoint
  useEffect(() => {
    const term = debouncedSearch.trim();
    if (!term) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    fetch(`/api/vehicles/search?q=${encodeURIComponent(term)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Search API error response");
        return res.json();
      })
      .then((data) => {
        if (data && data.success && Array.isArray(data.results)) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]);
        }
      })
      .catch((err) => {
        console.warn("Express backend search failed, evaluating client-side:", err);
        // Direct local matching fallback
        const termLower = term.toLowerCase();
        const matches = vehicles.filter(
          (car) =>
            car.name.toLowerCase().includes(termLower) ||
            car.brand.toLowerCase().includes(termLower) ||
            car.category.toLowerCase().includes(termLower)
        );
        setSearchResults(matches);
      })
      .finally(() => {
        setIsSearching(false);
      });
  }, [debouncedSearch, vehicles]);

  // Color matching highlight parser for premium look
  const highlightMatch = (text: string, query: string) => {
    if (!text) return <span></span>;
    if (!query) return <span>{text}</span>;
    
    const parts = query.toLowerCase().split(/\s+/).filter(Boolean);
    const escapedParts = parts.map((part) => part.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
    if (escapedParts.length === 0) return <span>{text}</span>;

    try {
      const regex = new RegExp(`(${escapedParts.join("|")})`, "gi");
      const splitText = text.split(regex);
      return (
        <>
          {splitText.map((chunk, i) =>
            regex.test(chunk) ? (
              <mark key={i} className="bg-amber-500/35 text-amber-300 font-semibold rounded px-0.5">
                {chunk}
              </mark>
            ) : (
              <span key={i}>{chunk}</span>
            )
          )}
        </>
      );
    } catch (e) {
      return <span>{text}</span>;
    }
  };

  // Local helper utilizing same robust normalization specifications
  const isSearchMatchStr = (car: Vehicle, queryStr: string): boolean => {
    if (!queryStr) return true;
    const norm = queryStr.toLowerCase().trim();
    if (!norm) return true;

    // Collate attributes to query in
    const targets = [
      car.name || "",
      car.brand || "",
      car.category || "",
      car.description || "",
      car.fuel_type || car.specifications?.fuelType || ""
    ].map((f) => f.toLowerCase());

    const targetSpaced = targets.map((f) => f.replace(/[-_./,&+#]/g, " ").replace(/\s+/g, " ").trim()).join(" ");
    const targetCollapsed = targets.map((f) => f.replace(/[-_./,&\s+#]/g, "")).join(" ");

    const querySpacedTokens = norm.replace(/[-_./,&+#]/g, " ").replace(/\s+/g, " ").trim().split(" ").filter((t) => t.length > 0);
    const queryCollapsed = norm.replace(/[-_./,&\s+#]/g, "");

    if (queryCollapsed && targetCollapsed.includes(queryCollapsed)) {
      return true;
    }

    if (querySpacedTokens.length > 0) {
      return querySpacedTokens.every((qToken) => {
        return (
          targets.some((tf) => tf.includes(qToken)) ||
          targetSpaced.split(" ").some((tWord) => tWord.startsWith(qToken) || tWord.includes(qToken))
        );
      });
    }

    return false;
  };

  // Active reviews list
  const [reviews, setReviews] = useState<ReviewEntity[]>([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Booking & Financing states
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("11:00");
  const [bookingLocation, setBookingLocation] = useState("San Francisco Signature Lounge");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Loan calculator states
  const [downPayment, setDownPayment] = useState<number>(15000);
  const [loanTerm, setLoanTerm] = useState<number>(60);
  const [interestRate, setInterestRate] = useState<number>(4.9);

  // Trigger CAD schematic preview toggles
  const toggleCAD = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCAD(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch reviews for selected car
  const fetchReviewsForCar = async (carId: string) => {
    try {
      const match = await dbService.getReviews(carId);
      setReviews(match);
    } catch (e) {
      console.error("Failed fetching reviews:", e);
    }
  };

  useEffect(() => {
    if (selectedVehicle) {
      fetchReviewsForCar(selectedVehicle.id);
      // Reset reserve sheet states
      setBookingSuccess(false);
      setNewReviewText("");
      setNewReviewRating(5);
    }
  }, [selectedVehicle]);

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newReviewText.trim() || !selectedVehicle) return;
    try {
      setSubmittingReview(true);
      const post = {
        vehicle_id: selectedVehicle.id,
        rating: newReviewRating,
        review: newReviewText,
        author: user.displayName || "Verified Client",
        author_id: user.uid
      };
      await dbService.addReview(post);
      setNewReviewText("");
      await fetchReviewsForCar(selectedVehicle.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleTestDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !selectedVehicle) return;
    try {
      setBookingSuccess(true);
      
      // If user profile is authenticated, store booking to live Firestore DB!
      if (user) {
        const payload = {
          vehicleId: selectedVehicle.id,
          vehicleName: selectedVehicle.name,
          brand: selectedVehicle.brand,
          userId: user.uid,
          userEmail: user.email || "",
          userName: user.displayName || "Client Guest",
          lounge: bookingLocation,
          date: bookingDate,
          time: bookingTime
        };
        await dbService.addReservation(payload);
      }
      
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedVehicle(null);
      }, 4000);
    } catch (err) {
      console.error("Failed storing reservation:", err);
    }
  };

  // Render a custom elegant vector automotive schematic based on vehicle type
  const renderCarSchematic = (vehicleId: string, colorHex: string = "#F59E0B") => {
    switch (vehicleId) {
      case "aether-plaid":
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.85">
              <line x1="20" y1="150" x2="380" y2="150" stroke="#3F3F46" strokeWidth="2" strokeDasharray="4 4" />
              <ellipse cx="200" cy="150" rx="150" ry="10" fill="url(#shadow-grad)" opacity="0.3" />
              <path d="M 40,140 Q 60,110 110,110 T 190,70 Q 240,70 290,105 Q 340,115 365,140" stroke={colorHex} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 40,140 L 365,140 M 40,140 H 80 M 320,140 H 365" stroke="#71717A" strokeWidth="2" />
              <path d="M 120,105 Q 185,68 250,71 C 275,73 295,95 305,107" stroke="#52525B" strokeWidth="1.5" fill="none" />
              <circle cx="100" cy="140" r="22" stroke="#E4E4E7" strokeWidth="2" fill="#18181B" />
              <circle cx="100" cy="140" r="14" stroke={colorHex} strokeWidth="1.2" fill="none" />
              <circle cx="100" cy="140" r="5" fill="#52525B" />
              <circle cx="300" cy="140" r="22" stroke="#E4E4E7" strokeWidth="2" fill="#18181B" />
              <circle cx="300" cy="140" r="14" stroke={colorHex} strokeWidth="1.2" fill="none" />
              <circle cx="300" cy="140" r="5" fill="#52525B" />
              <path d="M 10,70 H 45 M 25,80 H 75 M 5,90 H 35" stroke="#3F3F46" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            </g>
          </svg>
        );
      case "kallisto-gt":
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.85">
              <line x1="20" y1="150" x2="380" y2="150" stroke="#3F3F46" strokeWidth="2" strokeDasharray="3 3" />
              <ellipse cx="200" cy="150" rx="140" ry="8" fill="#000" opacity="0.3" />
              <path d="M 35,138 C 55,108 95,102 125,102 C 170,102 215,62 270,62 C 320,62 345,105 370,138" stroke={colorHex} strokeWidth="2.5" fill="none" />
              <path d="M 35,138 L 370,138 M 35,138 H 85 M 315,138 H 370" stroke="#71717A" strokeWidth="2" />
              <path d="M 140,102 Q 220,68 285,102" stroke="#52525B" strokeWidth="1.5" />
              <circle cx="105" cy="138" r="23" stroke="#A1A1AA" strokeWidth="2" fill="#18181B" />
              <circle cx="105" cy="138" r="12" stroke={colorHex} strokeWidth="1" />
              <circle cx="295" cy="138" r="23" stroke="#A1A1AA" strokeWidth="2" fill="#18181B" />
              <circle cx="295" cy="138" r="12" stroke={colorHex} strokeWidth="1" />
            </g>
          </svg>
        );
      case "kestrel-gtr":
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.85">
              <line x1="20" y1="150" x2="380" y2="150" stroke="#4B5563" strokeWidth="1.5" />
              <path d="M 30,140 Q 50,95 90,95 C 130,95 180,50 250,55 C 300,58 330,122 375,123" stroke={colorHex} strokeWidth="2.5" fill="none" />
              <path d="M 40,90 L 70,85 M 35,90 V 110" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              <path d="M 30,140 L 375,140" stroke="#D1D5DB" strokeWidth="2" />
              <path d="M 155,90 Q 215,58 260,88" stroke="#52525B" strokeWidth="1.5" />
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
              <path d="M 40,140 V 120 L 50,110 H 120 L 150,75 H 250 L 300,105 H 360 V 140 Z" stroke={colorHex} strokeWidth="2.5" fill="none" />
              <line x1="300" y1="105" x2="300" y2="140" stroke="#52525B" strokeWidth="1.5" />
              <path d="M 160,82 H 235 L 255,105 H 175 Z" stroke="#3F3F46" strokeWidth="1.5" />
              <circle cx="90" cy="135" r="25" stroke="#E4E4E7" strokeWidth="3" fill="#18181B" />
              <circle cx="290" cy="135" r="25" stroke="#E4E4E7" strokeWidth="3" fill="#18181B" />
            </g>
          </svg>
        );
      default:
        return (
          <svg className="w-full h-44 text-zinc-700 bg-zinc-900/30 rounded-lg p-2" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.85">
              <line x1="20" y1="150" x2="380" y2="150" stroke="#52525B" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M 40,140 Q 50,115 70,110 H 110 L 140,78 H 285 L 325,110 H 360 Q 365,125 365,140 Z" stroke={colorHex} strokeWidth="2.5" fill="none" />
              <circle cx="100" cy="138" r="23" stroke="#D1D5DB" strokeWidth="2" fill="#18181B" />
              <circle cx="295" cy="138" r="23" stroke="#D1D5DB" strokeWidth="2" fill="#18181B" />
            </g>
          </svg>
        );
    }
  };

  // Performance calculations
  const calculatePayment = (carPrice: number) => {
    const principal = carPrice - downPayment;
    if (principal <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    if (monthlyRate === 0) return (principal / loanTerm).toFixed(2);
    const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm));
    return isNaN(payment) ? "0.00" : payment.toFixed(2);
  };

  // Perform debounced search and filtering logic on live database list
  const filteredVehicles = vehicles.filter((car) => {
    const query = debouncedSearch.trim();
    const matchesSearch = !query || isSearchMatchStr(car, query);
    
    const matchesCategory = selectedCategory === "ALL" || car.category === selectedCategory;
    const matchesBrand = selectedBrand === "ALL" || car.brand.toLowerCase().includes(selectedBrand.toLowerCase());
    const matchesFuel = selectedFuel === "ALL" || car.specifications?.fuelType === selectedFuel || car.fuel_type === selectedFuel;
    
    return matchesSearch && matchesCategory && matchesBrand && matchesFuel;
  });

  const activeCategoryData = categories.find(c => c.id === selectedCategory);
  const activeBrandData = brands.find(b => b.brand_name.toLowerCase() === selectedBrand.toLowerCase());

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="marketplace-container">
      
      {/* Cinematic Hero Spotlight */}
      <div className="relative w-full rounded-2xl overflow-hidden mb-12 border border-zinc-900 group shadow-2xl bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/30 to-transparent z-10" />
        <img
          src={heroCarImg}
          alt="Cinematic Aero Hypercar"
          className="w-full h-[384px] object-cover object-center transition-transform duration-1000 group-hover:scale-[1.02]"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute top-4 left-4 z-20 hidden md:flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-zinc-800 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>INTEGRATED SYSTEM SECURE</span>
        </div>

        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-20 max-w-xl">
          <span className="font-['Verdana'] text-[9px] md:text-xs tracking-widest text-amber-500 block uppercase font-normal not-italic no-underline mb-2">
            APEX AUTOMOTIVE LAUNCH
          </span>
          <h1 className="font-display text-2xl md:text-4xl font-extralight text-white tracking-widest leading-none">
            ENGINEERED <br />
            <span className="font-bold text-amber-500 font-display">PERFECTION</span>
          </h1>
          <p className="text-zinc-300 font-sans text-[11px] mt-3 leading-relaxed font-light">
            Step into the next assembly of bespoke hypercars, premium long-range electric cruisers, and indestructible tactical terrain vehicles. Fully back-ended by Firestore storage.
          </p>
        </div>
      </div>

      {/* Dynamic Classification Directory Grid landing helper */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 items-start">
        
        {/* Left Column: Filter Sidebar Directory */}
        <div className="md:col-span-4 spacing-y-6 space-y-6">
          
          {/* Brand Landing Nodes */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-3 font-semibold">Active Brand Teams</span>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedBrand("ALL")}
                className={`w-full flex items-center justify-between p-2.5 rounded text-left transition ${
                  selectedBrand === "ALL" ? "bg-amber-500 text-black font-semibold" : "bg-zinc-900/30 hover:bg-zinc-900/60 text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span>🏢</span>
                  <span>Show All Teams</span>
                </div>
                <span className="font-mono text-[10px] opacity-75">({vehicles.length})</span>
              </button>

              {brands.map(b => {
                const count = vehicles.filter(v => v.brand.toLowerCase() === b.brand_name.toLowerCase()).length;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.brand_name)}
                    className={`w-full flex items-center justify-between p-2.5 rounded text-left transition ${
                      selectedBrand === b.brand_name ? "bg-amber-500 text-black font-semibold" : "bg-zinc-900/30 hover:bg-zinc-900/60 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-[14px]">{b.logo}</span>
                      <span>{b.brand_name}</span>
                    </div>
                    <span className="font-mono text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Segment Landing Nodes */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-3 font-semibold">Vehicle Segments</span>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`w-full flex items-center justify-between p-2.5 rounded text-left transition ${
                  selectedCategory === "ALL" ? "bg-amber-500 text-black font-semibold" : "bg-zinc-900/30 hover:bg-zinc-900/60 text-zinc-300"
                }`}
              >
                <span className="font-mono text-xs">All Categories</span>
                <span className="font-mono text-[10px] opacity-75">({vehicles.length})</span>
              </button>

              {categories.map(c => {
                const count = vehicles.filter(v => v.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`key-${c.id} w-full flex items-center justify-between p-2.5 rounded text-left transition ${
                      selectedCategory === c.id ? "bg-amber-500 text-black font-semibold" : "bg-zinc-900/30 hover:bg-zinc-900/60 text-zinc-300"
                    }`}
                  >
                    <span className="font-mono text-xs">{c.category_name}</span>
                    <span className="font-mono text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Active Information Spotlights & Grid Output */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Dynamic Selection Landing banners */}
          {(selectedBrand !== "ALL" || selectedCategory !== "ALL") && (
            <div className="bg-zinc-900/30 p-6 rounded-lg border border-zinc-800 space-y-3">
              <span className="font-mono text-[9px] text-amber-500 tracking-widest block uppercase font-semibold">Active Filter Spotlight</span>
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl text-white font-medium">
                    {activeBrandData ? `${activeBrandData.logo} ${activeBrandData.brand_name}` : ""}
                    {activeBrandData && activeCategoryData ? " ✕ " : ""}
                    {activeCategoryData ? `${activeCategoryData.category_name} Segment` : ""}
                  </h3>
                  <p className="text-zinc-400 font-sans text-xs mt-1 leading-relaxed">
                    {activeBrandData ? `Established in ${activeBrandData.founded_year} in ${activeBrandData.country}. Dedicated developers of performance hypercars.` : ""}
                    {activeCategoryData ? ` ${activeCategoryData.description}` : ""}
                  </p>
                </div>

                <button
                  onClick={() => { setSelectedBrand("ALL"); setSelectedCategory("ALL"); }}
                  className="p-1 px-3 bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-900 rounded uppercase"
                >
                  Clear filter
                </button>
              </div>
            </div>
          )}

          {/* Search bar & filter tabs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search specs, names, custom details online..."
                className="w-full bg-zinc-950 border border-zinc-900 text-white rounded px-10 py-3.5 text-xs tracking-wider focus:outline-none focus:border-amber-500 font-sans"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />

              {/* Dynamic Real-Time Dropdown Suggestions */}
              {showDropdown && search.trim() && (
                <div 
                  className="absolute left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl z-50 overflow-hidden divide-y divide-zinc-900/60"
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="p-2.5 bg-zinc-900/60 flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                      {isSearching ? "Contacting Search Engine..." : `Dynamic Matches (${searchResults.length})`}
                    </span>
                    <button 
                      onClick={() => setShowDropdown(false)}
                      className="text-zinc-600 hover:text-white transition p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 hover:bg-zinc-900/50 cursor-pointer transition text-left"
                          onClick={() => {
                            setSelectedVehicle(item);
                            setShowDropdown(false);
                          }}
                        >
                          <div className="w-10 h-10 rounded bg-zinc-900 overflow-hidden flex-shrink-0 border border-zinc-850">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <h4 className="font-sans text-xs font-semibold text-white">
                                {highlightMatch(item.brand, search)}{" "}
                                <span className="font-normal text-zinc-300">
                                  {highlightMatch(item.name || "", search)}
                                </span>
                              </h4>
                              <span className="font-mono text-[10px] text-amber-500 font-semibold">
                                ${parseFloat(item.priceByStr || item.price || 0).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5 font-light">
                              {highlightMatch(item.description || "", search)}
                            </p>
                          </div>
                          <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                        </div>
                      ))
                    ) : (
                      !isSearching && (
                        <div className="p-4 text-center text-zinc-500 font-mono text-[11px] uppercase tracking-wider py-8">
                          No vehicles found
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <select
              className="bg-zinc-950 border border-zinc-900 text-zinc-400 text-xs px-4 rounded focus:outline-none focus:border-amber-500 font-mono"
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
            >
              <option value="ALL">All Powerplants</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Gasoline">Gasoline</option>
            </select>
          </div>

          {/* Active Grid Output */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="vehicles-grid">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((car) => {
                const isComparing = compareList.includes(car.id);
                const isFav = favorites.includes(car.id);
                const fuelLabel = car.specifications?.fuelType || car.fuel_type || "Hybrid";
                const hpValue = car.specifications?.horsepower || car.horsepower || 650;
                const zeroSecs = car.specifications?.zeroToSixty || car.zeroToSixty || "2.9";
                const topSpdValue = car.specifications?.topSpeed || car.top_speed || 155;
                const rangeVal = car.specifications?.rangeOrMpg || car.rangeOrMpg || "320 miles";

                return (
                  <div
                    key={car.id}
                    id={`vehicle-card-${car.id}`}
                    className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-white rounded-lg overflow-hidden transition-all duration-300 flex flex-col group hover:shadow-xl relative"
                  >
                    
                    {/* Toggle favorite icon directly */}
                    <button
                      onClick={() => onToggleFavorite(car.id)}
                      className="absolute top-3 left-3 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 border border-zinc-850/80 transition cursor-pointer"
                      title={isFav ? "Remove flavor showcase" : "Host in my Garage"}
                      id={`btn-fav-${car.id}`}
                    >
                      <Heart className={`h-4 w-4 transition duration-300 ${isFav ? "fill-red-500 text-red-500" : "text-zinc-400 group-hover:text-white"}`} />
                    </button>

                    {/* Visual rendering canvas */}
                    <div className="relative aspect-[16/10] w-full bg-zinc-950 overflow-hidden flex items-center justify-center border-b border-zinc-900/80 group/canvas">
                      {/* Photo Layer */}
                      <div className={`absolute inset-0 transition-all duration-705 ease-out ${
                        showCAD[car.id] ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
                      }`}>
                        <img
                          src={car.image}
                          alt={car.name}
                          className="w-full h-full object-cover transition-transform duration-705 ease-out group-hover/canvas:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent opacity-80" />
                      </div>

                      {/* Blueprint CAD Schematic Layer */}
                      <div className={`absolute inset-0 p-4 flex flex-col items-center justify-center bg-zinc-950 transition-all duration-705 ease-out ${
                        showCAD[car.id] ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                      }`}>
                        <div className="w-full h-full flex items-center justify-center">
                          {renderCarSchematic(car.id, "#F59E0B")}
                        </div>
                      </div>

                      <div className="absolute top-3 right-3 z-20 flex gap-1.5">
                        <button
                          onClick={(e) => toggleCAD(car.id, e)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded border font-mono text-[9px] tracking-widest uppercase transition ${
                            showCAD[car.id]
                              ? "bg-amber-500/20 border-amber-500 text-amber-500"
                              : "bg-zinc-950/90 border-zinc-800 text-zinc-450 hover:text-white"
                          }`}
                        >
                          <Cpu className="h-3 w-3" />
                          <span>{showCAD[car.id] ? "RENDER" : "CAD VIEW"}</span>
                        </button>
                      </div>

                      {/* Floating details banner */}
                      <div className="absolute bottom-3 right-3 z-10 pointer-events-none bg-black/60 backdrop-blur-sm border border-zinc-900 px-2.5 py-1 rounded">
                        <span className="text-[10px] font-mono tracking-wider text-amber-500 font-bold">
                          ${car.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Specs sheet */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div>
                        <span className="font-mono text-[9px] tracking-widest text-amber-500 block uppercase font-medium">
                          {car.brand} • {fuelLabel}
                        </span>
                        <h3 className="font-display text-lg font-medium tracking-wide text-zinc-100 group-hover:text-white mt-1">
                          {car.name}
                        </h3>
                        <p className="text-zinc-400 text-xs font-sans font-light leading-relaxed mt-2 line-clamp-2">
                          {car.description}
                        </p>
                      </div>

                      {/* Key highlights specs */}
                      <div className="grid grid-cols-3 gap-1 border-y border-zinc-900 py-3 font-mono text-center text-[10px]">
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">0-60 MPH</span>
                          <span className="font-medium text-zinc-200 block mt-0.5">{zeroSecs}s</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">TOP SPEED</span>
                          <span className="font-medium text-zinc-200 block mt-0.5">{topSpdValue} mph</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">HORSEPOWER</span>
                          <span className="font-medium text-zinc-200 block mt-0.5">{hpValue} HP</span>
                        </div>
                      </div>

                      {/* Operation Links */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedVehicle(car)}
                            id={`btn-details-${car.id}`}
                            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded text-center text-xs tracking-widest py-2.5 flex-grow font-display transition"
                          >
                            DISCOVER SPECIFICATIONS
                          </button>
                          <button
                            onClick={() => onConfiguratorSelect(car.id)}
                            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2.5 rounded text-xs font-display tracking-wider font-semibold transition"
                            title="Open configurator"
                          >
                            STUDIO
                          </button>
                        </div>

                        <button
                          onClick={() => onCompareSelect(car.id)}
                          id={`btn-compare-${car.id}`}
                          className={`w-full py-1.5 text-[9.5px] font-mono tracking-wider rounded border transition uppercase ${
                            isComparing
                              ? "bg-amber-500/15 border-amber-500 text-amber-500"
                              : "bg-zinc-950 border-zinc-900 text-zinc-550 hover:text-white"
                          }`}
                        >
                          {isComparing ? "✓ in Compare engine" : "＋ Side-by-side comparison"}
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center border border-dashed border-zinc-900 rounded-lg p-6 space-y-4">
                <div className="space-y-1">
                  <span className="block font-mono text-zinc-500 text-xs uppercase mb-2">No vehicles found</span>
                  <p className="text-zinc-450 font-sans text-xs max-w-sm mx-auto">Try clearing classifications or searching with different key labels to see other high-performance models.</p>
                </div>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("ALL");
                    setSelectedBrand("ALL");
                    setSelectedFuel("ALL");
                  }}
                  id="btn-clear-search-filters"
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-[10.5px] font-bold px-4 py-2 rounded transition uppercase mt-2"
                >
                  Clear all search & filters
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Upgraded Specs sheet and reviews Modal */}
      <AnimatePresence>
        {selectedVehicle && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-805 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
              id="vehicle-details-modal"
            >
              <div className="sticky top-0 bg-zinc-950/95 backdrop-blur px-6 py-4 border-b border-zinc-900 flex items-center justify-between z-10">
                <div>
                  <span className="font-mono text-xs tracking-widest text-amber-500 block uppercase font-medium">{selectedVehicle.brand} specs</span>
                  <h2 className="font-display text-xl font-light text-white tracking-wider">{selectedVehicle.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="p-2 text-zinc-405 hover:text-white hover:bg-zinc-900 rounded"
                  id="modal-close-btn"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 lg:p-8 space-y-8">
                
                {/* Visual side-by-side spec summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-lg flex flex-col items-center relative">
                    <div className="relative aspect-[16/10] w-full bg-zinc-950 rounded overflow-hidden flex items-center justify-center border border-zinc-900">
                      
                      <div className={`absolute inset-0 transition ${showCAD[selectedVehicle.id] ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                        <img
                          src={selectedVehicle.image}
                          alt={selectedVehicle.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className={`absolute inset-0 p-4 flex items-center justify-center bg-zinc-950 transition ${showCAD[selectedVehicle.id] ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                        {renderCarSchematic(selectedVehicle.id, "#F59E0B")}
                      </div>

                      <button
                        onClick={(e) => toggleCAD(selectedVehicle.id, e)}
                        className="absolute bottom-3 right-3 bg-zinc-950/90 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded font-mono text-[9.5px] uppercase transition flex items-center space-x-1"
                      >
                        <Cpu className="h-3.5 w-3.5 text-amber-500" />
                        <span>Toggle CAD view</span>
                      </button>

                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="text-zinc-500 font-mono text-[10px] block uppercase font-semibold">PREMIUM DESIGN FOCUS</span>
                    <p className="text-zinc-300 font-sans text-xs leading-relaxed font-light">
                      {selectedVehicle.description}
                    </p>

                    <div>
                      <span className="text-zinc-500 font-mono text-[10px] block uppercase font-semibold mb-2">VEHICLE HIGHLIGHTS</span>
                      <ul className="space-y-1.5 text-xs text-zinc-400 font-sans">
                        {(selectedVehicle.highlights || []).map((h: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-amber-500 mr-2 font-bold">▪</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Technical specification grid */}
                <div className="space-y-3 font-mono text-xs">
                  <span className="text-zinc-500 text-[10px] block uppercase font-semibold border-b border-zinc-900 pb-1.5">SPECIFICATION MATRIX</span>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[9.5px] uppercase">Powerplant output</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">
                        {selectedVehicle.specifications?.horsepower || selectedVehicle.horsepower || 700} HP
                      </span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[9.5px] uppercase">Torque profile</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">
                        {selectedVehicle.specifications?.torque || selectedVehicle.torque || 750} lb-ft
                      </span>
                    </div>
                    <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[9.5px] uppercase">0-60 MPH acceleration</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">
                        {selectedVehicle.specifications?.zeroToSixty || selectedVehicle.zeroToSixty || "2.9"}s
                      </span>
                    </div>
                    <span className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded">
                      <span className="text-zinc-500 block text-[9.5px] uppercase">Peak Velocity</span>
                      <span className="text-zinc-200 block text-sm font-medium mt-1">
                        {selectedVehicle.specifications?.topSpeed || selectedVehicle.top_speed || 180} MPH
                      </span>
                    </span>
                  </div>
                </div>

                {/* Booking Course & Financing Sim Split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Financing panel */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-lg space-y-4">
                    <div className="flex items-center space-x-2 text-amber-500 font-display text-xs uppercase tracking-widest font-semibold pb-2 border-b border-zinc-900">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>FINANCING CALCULATOR</span>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-zinc-500">DOWN PAYMENT ($)</span>
                          <span className="text-amber-550 font-bold">${downPayment.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={Math.floor(selectedVehicle.price * 0.7)}
                          step="1000"
                          className="w-full accent-amber-500 h-1 bg-zinc-900"
                          value={downPayment}
                          onChange={(e) => setDownPayment(Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-zinc-505">TERM LENGTH</span>
                          <span className="text-zinc-200 font-bold">{loanTerm} months</span>
                        </div>
                        <select
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300"
                          value={loanTerm}
                          onChange={(e) => setLoanTerm(Number(e.target.value))}
                        >
                          <option value="36">36 Months</option>
                          <option value="48">48 Months</option>
                          <option value="60">60 Months</option>
                          <option value="72">72 Months</option>
                        </select>
                      </div>

                      <div className="pt-3 border-t border-zinc-900 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-zinc-500 text-[10px] block uppercase font-semibold">Monthly payment</span>
                          <span className="text-white text-lg font-bold">${calculatePayment(selectedVehicle.price)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-500 text-[10px] block uppercase">Retail premium</span>
                          <span className="text-zinc-400 font-bold">${selectedVehicle.price?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking experience */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-lg relative">
                    {bookingSuccess && (
                      <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center text-center p-4 rounded-lg z-10">
                        <Check className="h-8 w-8 text-emerald-500 mb-2" />
                        <span className="font-display font-medium text-white text-sm uppercase">Course Reserved Successfully</span>
                        <p className="text-[11px] text-zinc-450 mt-1 font-sans">
                          {user ? "Your course slot is indexed in your virtual Garage. We have sent telemetry notifications." : "Your guest slot is pending. Join with Google for live persistence."}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-amber-500 font-display text-xs uppercase tracking-widest font-semibold pb-2 border-b border-zinc-900 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>SECURE TEST COURSE SLOT</span>
                    </div>

                    <form onSubmit={handleTestDriveSubmit} className="space-y-3 font-mono text-xs text-zinc-300">
                      <div>
                        <label className="text-zinc-550 block mb-1">SELECT LOUNGE CENTER</label>
                        <select
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5"
                          value={bookingLocation}
                          onChange={(e) => setBookingLocation(e.target.value)}
                        >
                          <option value="San Francisco Signature Lounge">San Francisco Signature Lounge</option>
                          <option value="Munich High Performance Circuit">Munich High Performance Circuit</option>
                          <option value="Tokyo Horizon Salon">Tokyo Horizon Salon</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-zinc-555 block mb-1">DATE</label>
                          <input
                            type="date"
                            required
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2 py-1"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-zinc-555 block mb-1">ACCURATE HOUR</label>
                          <select
                            className="w-full bg-zinc-900 border border-zinc-805 text-zinc-300 rounded px-2 py-1"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                          >
                            <option value="11:00">11:00 AM</option>
                            <option value="13:00">01:00 PM</option>
                            <option value="15:00">03:00 PM</option>
                            <option value="17:00">05:00 PM</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-display font-semibold py-2.5 rounded tracking-wider transition uppercase text-[11px] mt-3"
                      >
                        {user ? "BOOK COURSE WITH GOOGLE PROFILE" : "BOOK GUEST SLOT ONLINE"}
                      </button>
                    </form>
                  </div>

                </div>

                {/* Dynamic reviews testimonials */}
                <div className="space-y-4 font-mono text-xs">
                  <div className="border-b border-zinc-900 pb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-amber-500" />
                      <span className="text-zinc-400 font-bold uppercase tracking-wider">TESTIMONIAL FEEDBACK LOOPS ({reviews.length})</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {reviews.length > 0 ? (
                      reviews.map((r) => (
                        <div key={r.id} className="p-3 bg-zinc-900/30 border border-zinc-900 rounded space-y-1 font-sans">
                          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                            <span className="font-bold text-zinc-300">{r.author}</span>
                            <span>{"★".repeat(r.rating)}</span>
                          </div>
                          <p className="text-zinc-300 text-xs font-light">"{r.review}"</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-600 italic py-2">No pilot feedback registered for this chassis segment yet.</p>
                    )}

                    {/* Submit review if verified */}
                    {user ? (
                      <form onSubmit={handlePostReview} className="pt-4 space-y-3 border-t border-zinc-900">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-450 uppercase font-semibold">Write verified drive experience</span>
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[10px] text-zinc-500">Rating:</span>
                            {[1, 2, 3, 4, 5].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setNewReviewRating(n)}
                                className="p-0.5 text-zinc-500 hover:text-amber-500"
                              >
                                <Star className={`h-3.5 w-3.5 ${newReviewRating >= n ? "fill-amber-500 text-amber-500" : "text-zinc-650"}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Add your verified telemetry notes..."
                            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 flex-grow rounded focus:outline-none focus:border-amber-500"
                            value={newReviewText}
                            onChange={(e) => setNewReviewText(e.target.value)}
                          />
                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="bg-amber-505 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded text-xs tracking-wider uppercase font-semibold transition"
                          >
                            POST
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="border border-muted-grey border-dashed p-3 text-center text-zinc-550 border-zinc-900 text-[11px] rounded leading-relaxed">
                        Sign in for private Google pass validation to compose verified test testimonials.
                      </div>
                    )}
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
