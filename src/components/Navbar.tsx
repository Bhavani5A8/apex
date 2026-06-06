import { Car, Compass, BarChart3, Bot, ChevronRight, Menu, X, LogIn, LogOut, User, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { User as FirebaseUser } from "firebase/auth";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: FirebaseUser | null;
  userProfile: { role: string; name: string } | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function Navbar({ activeTab, setActiveTab, user, userProfile, onSignIn, onSignOut }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "marketplace", label: "MARKETPLACE", icon: Car },
    { id: "configurator", label: "STUDIO CONFIGURATOR", icon: Compass },
    { id: "comparison", label: "COMPARE ENGINE", icon: BarChart3 },
    { id: "ai-advisor", label: "SOVEREIGN AI LOUNGE", icon: Bot },
  ];

  if (userProfile?.role === "admin") {
    navItems.push({ id: "admin", label: "SYSTEM CONSOLE", icon: ShieldAlert });
  }

  // Always list user hub to access saved cars & test course reservations
  if (user) {
    navItems.push({ id: "userhub", label: "MY GARAGE", icon: User });
  }

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
              <span className="font-display font-light text-zinc-400 tracking-widest text-xs block -mt-1.5 font-bold uppercase">PLATFORM</span>
            </div>
          </div>

          {/* Nav Items Desktop */}
          <div className="hidden lg:flex space-x-1 items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-display tracking-widest transition-all duration-300 rounded ${
                    isActive
                      ? "text-amber-500 bg-zinc-900 border-b-2 border-amber-500 font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Auth Button Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 border-l border-zinc-805 pl-4">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 font-mono block tracking-wider leading-none">
                    {user.displayName || "Client Guest"}
                  </span>
                  <span className="text-[9px] text-amber-500 font-mono uppercase tracking-widest leading-none font-semibold">
                    {userProfile?.role === "admin" ? "AUTOMOTIVE ADMIN" : "PLATFORM USER"}
                  </span>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User Profile"
                    className="h-8 w-8 rounded-full border border-zinc-800"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[11px] font-mono text-zinc-300">
                    U
                  </div>
                )}
                <button
                  onClick={onSignOut}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900/50 rounded transition duration-200"
                  title="Sign Out"
                  id="btn-sign-out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                id="btn-sign-in"
                className="flex items-center space-x-2 bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 px-4 py-2 text-xs font-display font-semibold tracking-wider rounded transition duration-300"
              >
                <LogIn className="h-4 w-4" />
                <span>SIGN IN</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center space-x-2">
            {!user && (
              <button
                onClick={onSignIn}
                className="text-amber-500 hover:bg-zinc-900 p-2 rounded text-xs tracking-wider font-mono uppercase"
              >
                LOGIN
              </button>
            )}
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
                    ? "bg-zinc-900 text-amber-500 border-l-4 border-amber-500 font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          {user && (
            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between px-4">
              <div className="flex items-center space-x-2">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="User Profile"
                    className="h-6 w-6 rounded-full border border-zinc-850"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="text-[10px] text-zinc-400 font-mono">{user.displayName}</span>
              </div>
              <button
                onClick={() => { onSignOut(); setMobileMenuOpen(false); }}
                className="flex items-center space-x-1.5 text-xs text-red-400 font-mono"
              >
                <LogOut className="h-3 w-3" />
                <span>LOGOUT</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
