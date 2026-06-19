import { Link, useLocation } from "react-router-dom";
import { Server, LayoutDashboard, Plus, LogOut, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { logout } = useAuth();
  
  const links = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Servers", path: "/servers", icon: <Server size={20} /> },
    { name: "Create Server", path: "/servers/create", icon: <Plus size={20} /> },
  ];

  return (
    <div className="w-64 h-full bg-gray-950 flex flex-col py-6 border-r border-gray-800 relative">
      {onClose && (
        <button onClick={onClose} className="md:hidden items-center justify-center absolute top-5 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
          <X size={20} />
        </button>
      )}
      <div className="px-6 mb-8 mt-2">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
          <Server className="w-6 h-6 mr-2 text-blue-500" />
          JTG Panel
        </h1>
      </div>
      <nav className="flex-1 w-full px-4 space-y-2">
        {links.map(link => {
          const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'}`}
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="w-full px-4 mt-auto">
        <button onClick={logout} className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-900 hover:text-red-400 transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
