import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Server, Settings, Play, Square, RefreshCw, Trash2 } from "lucide-react";

export default function ServerList() {
  const [servers, setServers] = useState<any[]>([]);

  const fetchServers = async () => {
    try {
      const res = await axios.get("/api/servers");
      setServers(res.data);
    } catch(e) {}
  };

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, action: string) => {
    try {
       await axios.post(`/api/servers/${id}/${action}`);
       fetchServers();
    } catch(e) {}
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to delete this server?")) {
      try {
        await axios.delete(`/api/servers/${id}`);
        fetchServers();
      } catch(e) {}
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Servers</h1>
        <Link to="/servers/create" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-medium text-white rounded-lg transition-colors flex items-center shadow-sm">
          <span className="mr-2">New Server</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map(server => (
          <div key={server.id} className="bg-gray-950 rounded-2xl border border-gray-800 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-900 rounded-lg border border-gray-800/50">
                  <Server className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg leading-tight">{server.name}</h2>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`w-2 h-2 rounded-full ${server.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-500'}`}></span>
                    <span className="text-xs text-gray-400 capitalize">{server.status}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-800/50 my-4 text-sm mt-auto">
              <div>
                <p className="text-gray-500 text-xs mb-1">Port</p>
                <p className="font-mono text-gray-200">{server.port}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">RAM</p>
                <p className="font-mono text-gray-200">{server.ram} GB</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Version</p>
                <p className="text-gray-200">{server.version}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Link to={`/servers/${server.id}`} className="flex-1 text-center py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-lg text-sm transition-colors border border-gray-800/50">
                Manage
              </Link>
              {server.status !== 'online' ? (
                <button onClick={() => handleAction(server.id, 'start')} className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors border border-green-500/20">
                  <Play className="w-5 h-5 ml-0.5" />
                </button>
              ) : (
                <button onClick={() => handleAction(server.id, 'stop')} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20">
                  <Square className="w-5 h-5" />
                </button>
              )}
              <button onClick={() => handleAction(server.id, 'restart')} className="p-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg transition-colors border border-orange-500/20">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button onClick={() => handleDelete(server.id)} className="p-2 bg-gray-900 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/20 rounded-lg transition-colors text-gray-400 border border-gray-800/50">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {servers.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500 border border-dashed border-gray-800 rounded-2xl">
            <Server className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No servers found. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
