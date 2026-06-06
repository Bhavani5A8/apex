import React, { useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { dbService, ReservationEntity } from "../dbService";
import { Vehicle } from "../types";
import { Calendar, Trash2, Heart, Shield, Compass, Sparkles, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UserHubProps {
  user: FirebaseUser;
  userProfile: { id: string; name: string; email: string; role: string } | null;
  vehicles: Vehicle[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onDiscoverSpecs: (car: Vehicle) => void;
  onBuildConfig: (id: string) => void;
}

export default function UserHub({
  user,
  userProfile,
  vehicles,
  favorites,
  onToggleFavorite,
  onDiscoverSpecs,
  onBuildConfig
}: UserHubProps) {
  const [reservations, setReservations] = useState<ReservationEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const resList = await dbService.getReservations(user.uid);
      setReservations(resList);
    } catch (e) {
      console.error("Failed to fetch customer reservations: ", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user.uid]);

  const handleCancelReservation = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this exclusive test course reservation?")) return;
    try {
      await dbService.updateReservationStatus(id, "cancelled");
      await fetchReservations();
    } catch (e) {
      console.error("Failed to cancel: ", e);
    }
  };

  const favoriteCars = vehicles.filter(v => favorites.includes(v.id));

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12" id="userhub-panel">
      
      {/* Profile Overview Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-center gap-6 justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile avatar"
              className="h-16 w-16 rounded-full border-2 border-amber-500 shadow"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-zinc-900 border-2 border-amber-500 flex items-center justify-center text-xl font-mono text-zinc-300 font-bold">
              {user.displayName?.charAt(0) || "U"}
            </div>
          )}
          <div>
            <h2 className="font-display text-2xl font-light text-white tracking-wider">
              WELCOME BACK, <span className="font-bold text-amber-500">{user.displayName || "HONORED CLIENT"}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 font-mono text-[10.5px]">
              <span className="text-zinc-400">{user.email}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500">ID: {user.uid.slice(0, 8)}...</span>
              <span className="text-zinc-600">•</span>
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded uppercase font-semibold">
                {userProfile?.role === "admin" ? "AUTOMOTIVE ADMINISTRATOR" : "VERIFIED EXECUTIVE PASS"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="text-center bg-zinc-950/80 px-4 py-2.5 rounded border border-zinc-850">
            <span className="text-zinc-500 block text-[9px] uppercase">Saved Vessels</span>
            <span className="text-white text-lg font-bold font-display">{favorites.length}</span>
          </div>
          <div className="text-center bg-zinc-950/80 px-4 py-2.5 rounded border border-zinc-850">
            <span className="text-zinc-500 block text-[9px] uppercase">Active Courses</span>
            <span className="text-white text-lg font-bold font-display">
              {reservations.filter(r => r.status !== "cancelled").length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Booked Experiences Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              <h3 className="font-display text-lg tracking-wider text-white uppercase">RESERVED CIRCUIT COURSES</h3>
            </div>
            <button 
              onClick={fetchReservations}
              className="text-zinc-500 hover:text-amber-500 font-mono text-[10px] tracking-wider uppercase bg-zinc-950/50 px-2.5 py-1 rounded border border-zinc-900 transition"
            >
              Sync Live Status
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-zinc-500 font-mono text-xs tracking-widest animate-pulse">
              SYNCHRONIZING PRIVATE RESERVATION TELEMETRY...
            </div>
          ) : reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.map((res) => (
                <div 
                  key={res.id}
                  id={`reservation-card-${res.id}`}
                  className={`p-5 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 bg-zinc-950/50 ${
                    res.status === "cancelled" 
                      ? "border-zinc-900 opacity-60" 
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className={`h-2 w-2 rounded-full ${
                        res.status === "pending" ? "bg-amber-500 animate-pulse" :
                        res.status === "confirmed" ? "bg-emerald-500" : "bg-zinc-650"
                      }`} />
                      <span className="font-mono text-[10px] uppercase text-zinc-500">
                        {res.brand} • RESERVATION CODE: {res.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-display text-base font-medium text-zinc-100">{res.vehicleName}</h4>
                    <p className="font-mono text-xs text-zinc-400">
                      📅 {res.date} at {res.time}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-500 uppercase">
                      📍 {res.lounge}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <span className={`px-2.5 py-1 rounded text-[9.5px] font-mono tracking-widest uppercase font-semibold ${
                      res.status === "pending" ? "bg-amber-500/10 border border-amber-500/25 text-amber-500" :
                      res.status === "confirmed" ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-500" :
                      "bg-zinc-900 border border-zinc-800 text-zinc-500"
                    }`}>
                      {res.status}
                    </span>

                    {res.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancelReservation(res.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded border border-transparent hover:border-red-500/10 transition"
                        title="Cancel Course Booking"
                        id={`btn-cancel-res-${res.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-zinc-900 rounded-lg p-6 bg-zinc-950/20">
              <span className="block font-mono text-zinc-500 text-xs mb-3">YOUR RESERVATION TELEMETRY IS BLANK</span>
              <p className="text-zinc-600 font-sans text-xs max-w-sm mx-auto mb-4">
                You haven't booked any private circuit courses. Sift through the specifications of any car in the marketplace to reserve a course slot.
              </p>
            </div>
          )}
        </div>

        {/* Favorite Vehicles Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center space-x-2 border-b border-zinc-900 pb-3">
            <Heart className="h-5 w-5 text-amber-500 fill-amber-500/20" />
            <h3 className="font-display text-lg tracking-wider text-white uppercase">SAVED FOR SHOWCASE</h3>
          </div>

          {favoriteCars.length > 0 ? (
            <div className="space-y-4">
              {favoriteCars.map((car) => (
                <div 
                  key={car.id}
                  id={`fav-card-${car.id}`}
                  className="bg-zinc-955/40 border border-zinc-900 hover:border-zinc-800 p-4 rounded-lg flex items-center justify-between gap-4 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-20 bg-zinc-950 rounded overflow-hidden border border-zinc-900 flex-shrink-0">
                      <img 
                        src={car.image} 
                        alt={car.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500">{car.brand}</span>
                      <h4 className="font-display text-sm font-medium text-zinc-200 group-hover:text-white leading-tight">
                        {car.name}
                      </h4>
                      <p className="font-mono text-xs text-zinc-500 mt-0.5">${car.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => onDiscoverSpecs(car)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-mono tracking-wider px-3 py-1.5 rounded transition uppercase border border-zinc-800"
                    >
                      SPECS
                    </button>
                    <button
                      onClick={() => onBuildConfig(car.id)}
                      className="bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[10px] font-mono tracking-wider px-3 py-1.5 rounded transition font-bold uppercase"
                    >
                      STUDIO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-zinc-900 rounded-lg p-6 bg-zinc-950/20">
              <span className="block font-mono text-zinc-500 text-xs mb-1">NO VESSELS MARKED AS FAVORITES</span>
              <p className="text-zinc-600 font-sans text-xs max-w-xs mx-auto">
                Toggle the favorite/selection in the market and they'll compile here inside your premium virtual layout.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
