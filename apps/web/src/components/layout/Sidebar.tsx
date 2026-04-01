import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/buildings", label: "Buildings", icon: "🏢" },
  { to: "/elevators", label: "Elevators", icon: "🛗" },
  { to: "/events", label: "Service Events", icon: "🔧" },
  { to: "/contracts", label: "Contracts", icon: "📋" },
  { to: "/invoices", label: "Invoices", icon: "💰" },
  { to: "/alerts", label: "Alerts", icon: "🔔" },
];

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/auth/login");
  }

  return (
    <aside className="w-64 bg-brand-800 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-brand-700">
        <h1 className="text-2xl font-bold">ELEVaiT</h1>
        <p className="text-brand-300 text-xs mt-1">Elevator Monitoring</p>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-brand-700 text-white border-r-2 border-brand-300"
                  : "text-brand-200 hover:bg-brand-700 hover:text-white"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-brand-700">
        <div className="text-sm mb-3">
          <p className="font-medium truncate">{profile?.full_name}</p>
          <p className="text-brand-300 text-xs truncate">{profile?.organization?.name}</p>
          <p className="text-brand-400 text-xs capitalize">{profile?.role}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-left text-sm text-brand-300 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
