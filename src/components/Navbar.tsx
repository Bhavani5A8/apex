import { Car, Compass, BarChart3, Bot, ChevronRight, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "marketplace", label: "MARKETPLACE", icon: Car },
    { id: "configurator", label: "STUDIO CONFIGURATOR", icon: Compass },
    { id: "comparison", label: "COMPARE ENGINE", icon: BarChart3 },
    { id: "ai-advisor", label: "SOVEREIGN AI LOUNGE", icon: Bot },
  ];

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("marketplace")} id="brand-logo">
            <div className="h-10 w-10 bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center rounded-lg shadow-lg">
              <span className="font-display font-bold text-lg text-black tracking-wider">Ω</span>
            </div>
            <div>
              <span className="font-display font-medium text-white tracking-widest text-lg">APEX</span>
              <span className="font-display font-light text-zinc-400 tracking-widest text-xs block -mt-1.5 font-bold uppercase">MOTORS</span>
            </div>
          </div>

          {/* Nav Items Desktop */}
          <div className="hidden md:flex space-x-1 items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-5 py-2.5 text-xs font-display tracking-widest transition-all duration-300 rounded ${
                    isActive
                      ? "text-amber-500 bg-zinc-900 border-b-2 border-amber-500 font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick status lines (Minimal & Elegant) */}
          <div className="hidden lg:flex items-center space-x-3 font-mono text-[10px] text-zinc-500">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="tracking-widest uppercase">CATALOG SYNC SECURE</span>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-zinc-400 hover:text-white p-2 rounded"
              id="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 py-4 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-tab-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-4 py-3 text-left font-display tracking-widest text-xs rounded transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 text-amber-500 border-l-4 border-amber-500 font-medium"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-4 border-t border-zinc-900 flex items-center justify-between font-mono text-[10px] text-zinc-500 px-4">
            <span className="tracking-widest uppercase">CATALOG SECURE</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
        </div>
      )}
    </nav>
  );
}
