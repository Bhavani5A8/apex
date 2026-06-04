import { useState } from "react";
import { Vehicle } from "../types";
import { VEHICLES } from "../data/vehicles";
import { BarChart3, HelpCircle, X, Check, Award, ArrowUpRight } from "lucide-react";

interface ComparisonProps {
  selectedVehicleIds: string[];
  onRemoveVehicle: (id: string) => void;
  onAddVehicle: (id: string) => void;
}

export default function VehicleComparison({
  selectedVehicleIds,
  onRemoveVehicle,
  onAddVehicle
}: ComparisonProps) {
  // If user has no vehicles selected, we can offer to quick-compare standard suggestions
  const handleQuickLoad = () => {
    onAddVehicle("aether-plaid");
    onAddVehicle("kallisto-gt");
  };

  const selectedCars = VEHICLES.filter((v) => selectedVehicleIds.includes(v.id));

  // Determine the best in each class to award badges
  const getBestInClass = (metric: "price" | "0-60" | "hp" | "torque" | "speed") => {
    if (selectedCars.length < 2) return null;
    let bestCarId = "";
    let bestValue = metric === "price" || metric === "0-60" ? Infinity : -Infinity;

    selectedCars.forEach((car) => {
      let val = 0;
      switch (metric) {
        case "price":
          val = car.price;
          if (val < bestValue) {
            bestValue = val;
            bestCarId = car.id;
          }
          break;
        case "0-60":
          val = car.specs.zeroToSixty;
          if (val < bestValue) {
            bestValue = val;
            bestCarId = car.id;
          }
          break;
        case "hp":
          val = car.specs.horsepower;
          if (val > bestValue) {
            bestValue = val;
            bestCarId = car.id;
          }
          break;
        case "torque":
          val = car.specs.torque;
          if (val > bestValue) {
            bestValue = val;
            bestCarId = car.id;
          }
          break;
        case "speed":
          val = car.specs.topSpeed;
          if (val > bestValue) {
            bestValue = val;
            bestCarId = car.id;
          }
          break;
      }
    });
    return bestCarId;
  };

  const bestPriceId = getBestInClass("price");
  const bestSpeedId = getBestInClass("0-60");
  const bestHpId = getBestInClass("hp");
  const bestTorqueId = getBestInClass("torque");
  const bestVelocityId = getBestInClass("speed");

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="comparison-container">
      {/* Title */}
      <div className="mb-10">
        <h1 className="font-display text-3xl font-extralight tracking-widest text-white">
          COMPARE <span className="font-bold text-amber-500">ENGINE</span>
        </h1>
        <p className="text-zinc-400 font-sans text-sm mt-1 max-w-xl">
          Side-by-side engineering evaluation. Stack dual or tri-motor specifications, peak horsepower, and acceleration charts to find the superior chassis.
        </p>
      </div>

      {selectedCars.length < 1 ? (
        /* Unselected Empty State */
        <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-12 text-center max-w-2xl mx-auto my-12 relative" id="empty-comparison-state">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          <div className="h-14 w-14 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-5 text-amber-500">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg text-white font-medium tracking-wider">NO VEHICLES ENLISTED FOR EVALUATION</h3>
          <p className="text-zinc-500 text-xs font-sans mt-2.5 leading-relaxed max-w-md mx-auto">
            You must select two or more vessels from the Marketplace catalog to evaluate relative engineering performance. Alternatively, use our automatic hot-load system:
          </p>
          <div className="mt-8">
            <button
              onClick={handleQuickLoad}
              id="btn-quick-load-compare"
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-display font-semibold tracking-wider px-6 py-2.5 rounded text-xs transition duration-300 flex items-center space-x-2 mx-auto"
            >
              <span>EVALUATE CHASSIS COMPARISON STANDARD</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Comparison Active Interface */
        <div className="space-y-8">
          
          {/* Quick selection selector so they can add other cars instantly */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 border border-zinc-900 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              <span className="font-mono text-xs text-zinc-300 tracking-wider">CHASSIS COMPARATOR STACK ({selectedCars.length} ACTIVE)</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="font-mono text-[10px] text-zinc-500 flex items-center pr-2">Add other Vessel:</span>
              {VEHICLES.map((v) => {
                const isActive = selectedVehicleIds.includes(v.id);
                return (
                  <button
                    key={v.id}
                    disabled={isActive}
                    onClick={() => onAddVehicle(v.id)}
                    className={`px-3 py-1 text-[10px] font-mono rounded tracking-widest uppercase transition ${
                      isActive
                        ? "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                        : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    + {v.name.split(" ")[1] || v.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="comparison-chassis-grid">
            {selectedCars.map((car) => (
              <div
                key={car.id}
                id={`compare-card-${car.id}`}
                className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Remove from state button */}
                <button
                  onClick={() => onRemoveVehicle(car.id)}
                  className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded"
                  title="Remove from evaluation list"
                  id={`remove-compare-${car.id}`}
                >
                  <X className="h-4 w-4" />
                </button>

                <div>
                  <span className="font-mono text-[9px] tracking-widest text-amber-500 block uppercase font-medium">{car.brand}</span>
                  <h3 className="font-display text-lg text-white font-medium mt-1 tracking-wide">{car.name}</h3>
                  <div className="mt-3 text-zinc-300 font-mono text-sm border-b border-zinc-900 pb-4 font-bold">
                    ${car.price.toLocaleString()}
                    {bestPriceId === car.id && (
                      <span className="ml-2 bg-emerald-500/10 text-emerald-500 text-[9px] px-2 py-0.5 rounded border border-emerald-500/10 uppercase tracking-widest">Best Value</span>
                    )}
                  </div>

                  {/* Specification charts inside each card */}
                  <div className="space-y-4 py-5 font-mono text-xs">
                    
                    {/* Acceleration Bar (lower is better!) */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>STATIONARY TO 60 MPH</span>
                        <span className="text-zinc-300 font-semibold">{car.specs.zeroToSixty}s</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded transition-all duration-700"
                          style={{ width: `${(3.5 / car.specs.zeroToSixty) * 100}%` }} // Relative scaling
                        />
                      </div>
                      {bestSpeedId === car.id && (
                        <div className="flex items-center space-x-1 text-[9px] text-amber-500 uppercase mt-1 font-medium select-none">
                          <Check className="h-3 w-3" />
                          <span>Elite Launch Acceleration</span>
                        </div>
                      )}
                    </div>

                    {/* HP Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>HORSEPOWER YIELD</span>
                        <span className="text-zinc-300 font-semibold">{car.specs.horsepower} HP</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded overflow-hidden">
                        <div
                          className="bg-zinc-200 h-full rounded transition-all duration-700"
                          style={{ width: `${(car.specs.horsepower / 1100) * 100}%` }} 
                        />
                      </div>
                      {bestHpId === car.id && (
                        <div className="flex items-center space-x-1 text-[9px] text-zinc-100 uppercase mt-1 font-medium select-none">
                          <Award className="h-3 w-3" />
                          <span>Max Horsepower Output</span>
                        </div>
                      )}
                    </div>

                    {/* Torque Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>MAXIMUM ROTARY TORQUE</span>
                        <span className="text-zinc-300 font-semibold">{car.specs.torque} LB-FT</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded overflow-hidden">
                        <div
                          className="bg-amber-600 h-full rounded transition-all duration-700"
                          style={{ width: `${(car.specs.torque / 1050) * 100}%` }}
                        />
                      </div>
                      {bestTorqueId === car.id && (
                        <div className="flex items-center space-x-1 text-[9px] text-amber-500 uppercase mt-1 font-medium select-none">
                          <Check className="h-3 w-3" />
                          <span>Max Kinetic Torque</span>
                        </div>
                      )}
                    </div>

                    {/* Max Velocity */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>PEAK SPEED</span>
                        <span className="text-zinc-300 font-semibold">{car.specs.topSpeed} MPH</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded overflow-hidden">
                        <div
                          className="bg-zinc-500 h-full rounded transition-all duration-700"
                          style={{ width: `${(car.specs.topSpeed / 265) * 100}%` }}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Technical Indicators */}
                <div className="border-t border-zinc-900 pt-4 font-sans text-xs text-zinc-400 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-mono text-[9px] uppercase">Drivetrain Configuration</span>
                    <span className="font-mono text-zinc-200">{car.specs.driveTrain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-mono text-[9px] uppercase">Durable Energy Reserves</span>
                    <span className="font-mono text-zinc-200 leading-none">{car.specs.rangeOrMpg.split(" ")[0]}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Combined Comparison Matrix Grid Board for quick review */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6" id="comparison-board-pane">
            <h3 className="font-display text-xs text-zinc-400 tracking-widest uppercase font-semibold mb-4 border-b border-zinc-900 pb-2">
              APEX ENGINEERING HYBRID PROFILE SUMMARY MATRIX
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    <th className="py-3 px-4">Evaluation Attributes</th>
                    {selectedCars.map(c => (
                      <th key={c.id} className="py-3 px-4">{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  <tr>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-zinc-400 uppercase">Trim Manufacturer</td>
                    {selectedCars.map(c => (
                      <td key={c.id} className="py-3.5 px-4">{c.brand}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-zinc-400 uppercase">Body Class</td>
                    {selectedCars.map(c => (
                      <td key={c.id} className="py-3.5 px-4">{c.type}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-zinc-400 uppercase">Propulsion Fluid</td>
                    {selectedCars.map(c => (
                      <td key={c.id} className="py-3.5 px-4 font-mono text-[11px] text-zinc-250 font-semibold">{c.specs.fuelType}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-zinc-400 uppercase">Standard Equipment Highlights</td>
                    {selectedCars.map(c => (
                      <td key={c.id} className="py-3.5 px-4 pr-10">
                        <ul className="list-disc pl-4 space-y-1 font-sans text-[11px] font-light text-zinc-400">
                          {c.highlights.slice(0, 3).map((hl, i) => (
                            <li key={i}>{hl}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
