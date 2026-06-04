import { useState, useRef, useEffect } from "react";
import { ChatMessage, Vehicle } from "../types";
import { VEHICLES } from "../data/vehicles";
import { Bot, User, Send, Compass, Info, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface AICopilotProps {
  onDiscoverSpecs: (vehicle: Vehicle) => void;
  onBuildConfig: (id: string) => void;
}

export default function AICopilot({ onDiscoverSpecs, onBuildConfig }: AICopilotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome",
      role: "assistant",
      text: "Prestige greetings. I am Sovereign, your AI Automotive Sales Advisor. By compiling advanced data matrices on range efficiency, speed coefficients, torque vectoring, and active pneumatic suspensions, I am calibrated to curate your next vehicular vessel. Tell me about your travel demands, executive habits, or performance standards.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestionPills = [
    "Assemble a fast-charging electric grand tourer with laser illumination",
    "I need an armored quad-motor overlander truck with mobile grids",
    "Show me the absolute peak V12 performance track chassis in inventory",
    "Which executive hybrid Cruiser features rear panoramic cinema screens?",
  ];

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (rawText: string) => {
    if (!rawText.trim() || loading) return;

    setErrorStatus(null);
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      role: "user",
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error("Sovereign Advisor is offline. Error status: " + response.status);
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        text: data.text || "I apologize, our telemetry link suffered a structural variance.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedVehicles: data.suggestedVehicles || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || "Failed to contact Sales Advisor neural processor.");
      
      const errorResponse: ChatMessage = {
        id: `msg-ai-err-${Date.now()}`,
        role: "assistant",
        text: "The Sovereign AI Advisor experienced a telemetry connection shift. However, our local diagnostic fail-safe is active. Please let me know if you would like me to detail our standard electric grid or V12 track units manually.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handlePillClick = (pillText: string) => {
    handleSendMessage(pillText);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-140px)] flex flex-col" id="copilot-container">
      
      {/* Title Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extralight tracking-widest text-white">
            SOVEREIGN <span className="font-bold text-amber-500">AI LOUNGE</span>
          </h1>
          <p className="text-zinc-400 font-sans text-sm mt-1 max-w-xl">
            Direct telemetry with Sovereign, your premium expert automated engineer. Find trims mapping to your executive schedules, speed thresholds, or propulsion preferences.
          </p>
        </div>
        
        <div className="hidden sm:flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded text-[10px] font-mono text-amber-500">
          <Bot className="h-3.5 w-3.5" />
          <span className="tracking-widest uppercase">MODEL: GEMINI-3.5-FLASH</span>
        </div>
      </div>

      {/* Main chat layout */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 bg-zinc-950/40 border border-zinc-900 rounded-xl overflow-hidden p-4 lg:p-6 shadow-2xl">
        
        {/* Left pane: Messages logs */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-0">
          
          {/* Scrollable messages box */}
          <div className="flex-grow overflow-y-auto space-y-6 pr-2 mb-4 scrollbar-thin">
            {messages.map((msg) => {
              const isAss = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  id={`chat-msg-${msg.id}`}
                  className={`flex space-x-4 max-w-[85%] ${isAss ? "mr-auto" : "ml-auto flex-row-reverse space-x-reverse"}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isAss ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-zinc-800 text-zinc-300"}`}>
                    {isAss ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                  </div>

                  <div className="space-y-3">
                    <div className={`rounded-xl p-4 text-xs font-sans leading-relaxed ${isAss ? "bg-zinc-900/60 text-zinc-200 border border-zinc-900" : "bg-amber-500 text-zinc-950 font-medium font-sans"}`}>
                      {/* Formatted Text lines */}
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {/* Display suggested vehicle cards returned as metadata from Gemini API JSON output! */}
                      {isAss && msg.suggestedVehicles && msg.suggestedVehicles.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-3">
                          <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest font-semibold block">RECOMMENDED CHASSIS INVENTORY:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {msg.suggestedVehicles.map((carId) => {
                              const car = VEHICLES.find((v) => v.id === carId);
                              if (!car) return null;
                              return (
                                <div key={car.id} className="bg-zinc-950 border border-zinc-900 rounded p-3 flex flex-col justify-between">
                                  <div>
                                    <span className="font-mono text-[8px] text-zinc-500 uppercase block">{car.brand}</span>
                                    <span className="text-zinc-200 text-xs font-medium font-sans block mt-0.5">{car.name}</span>
                                    <span className="font-mono text-[10px] text-amber-500 font-semibold block mt-1">${car.price.toLocaleString()}</span>
                                  </div>
                                  <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-zinc-900/80">
                                    <button
                                      onClick={() => onDiscoverSpecs(car)}
                                      className="flex-grow bg-zinc-900 hover:bg-zinc-800 text-[9px] font-mono tracking-widest py-1.5 text-center text-zinc-300 rounded uppercase"
                                    >
                                      Specs
                                    </button>
                                    <button
                                      onClick={() => onBuildConfig(car.id)}
                                      className="bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[9px] font-mono tracking-widest font-bold px-2.5 py-1.5 text-center rounded uppercase"
                                    >
                                      Build
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-[9px] text-zinc-600 block text-right tracking-widest uppercase">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex space-x-4 max-w-[80%] mr-auto">
                <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 text-xs font-mono text-zinc-500 tracking-wider flex items-center space-x-3.5">
                  <RefreshCw className="h-4.5 w-4.5 animate-spin text-amber-500" />
                  <span>Sovereign advisor compiling telemetry grids...</span>
                </div>
              </div>
            )}

            {errorStatus && (
              <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded text-red-500 font-mono text-xs max-w-xl mx-auto">
                <AlertCircle className="h-5 w-5 font-bold shrink-0" />
                <span>DIAGNOSTIC EXCEPTION: {errorStatus}</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick choice suggestions pills */}
          {messages.length === 1 && (
            <div className="space-y-2 mb-4" id="copilot-suggested-pills">
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block font-medium">EXPLORATION INQUIRIES:</span>
              <div className="flex flex-wrap gap-2">
                {suggestionPills.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => handlePillClick(pill)}
                    className="bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 font-sans text-xs px-3.5 py-2 rounded-full border border-zinc-900 hover:border-zinc-700 text-left transition duration-200"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input field row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center gap-2 pt-2 border-t border-zinc-900"
          >
            <input
              type="text"
              id="copilot-message-input"
              placeholder="Ask Advisor about aerodynamic coefficients, V12 track items, range specs..."
              className="flex-grow bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-sans rounded px-4 py-3 focus:outline-none focus:border-amber-500 placeholder-zinc-500 tracking-wider"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              id="btn-copilot-send"
              disabled={loading || !input.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-900 disabled:text-zinc-600 text-zinc-950 font-display font-semibold tracking-wider px-5 py-3 rounded text-xs transition duration-300 flex items-center space-x-1.5 shrink-0"
            >
              <span>TRANSMIT</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>

        {/* Right pane: Inventory quick catalog list */}
        <div className="hidden lg:block lg:col-span-4 border-l border-zinc-900 pl-6 h-full min-h-0 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display text-xs text-zinc-400 tracking-widest uppercase font-semibold border-b border-zinc-900 pb-2">
              AVAILABLE TELEMETRY SPECS
            </h3>
            
            <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
              {VEHICLES.map((v) => (
                <div key={v.id} className="bg-zinc-900/30 border border-zinc-900 rounded p-3 text-xs leading-relaxed space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-zinc-200 font-sans">{v.name}</span>
                    <span className="font-mono text-[10px] text-amber-500 font-medium">${v.price.toLocaleString()}</span>
                  </div>
                  <div className="font-mono text-[9px] text-zinc-500 uppercase flex flex-wrap gap-x-2">
                    <span>{v.specs.horsepower} HP</span>
                    <span>•</span>
                    <span>{v.specs.fuelType}</span>
                    <span>•</span>
                    <span>{v.specs.driveTrain}</span>
                  </div>
                  <p className="text-zinc-400 text-[10px] font-sans font-light leading-snug line-clamp-2 mt-1">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/20 border border-zinc-900/60 p-4 rounded text-[10px] font-sans text-zinc-500 leading-relaxed font-light">
            <Info className="h-4 w-4 text-amber-500 shrink-0 inline mr-2 -mt-0.5" />
            <span>The Sovereign Advisor evaluates precise computational metrics based on real mechanical models in inventory. Your customized trims will propagate instantly on request.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
