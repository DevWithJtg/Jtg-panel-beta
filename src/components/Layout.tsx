import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}
      
      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar onClose={() => setMobileOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
          <h1 className="text-xl font-bold tracking-tight text-white">JTG Panel</h1>
          <button onClick={() => setMobileOpen(true)} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg">
            <Menu size={24} />
          </button>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
