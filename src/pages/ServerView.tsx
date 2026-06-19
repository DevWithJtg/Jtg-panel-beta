import { useEffect, useState } from "react";
import { useParams, Link, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import { Terminal, Folder, Archive, Settings } from "lucide-react";

import ServerConsole from "../components/ServerConsole";
import FileManager from "../components/FileManager";

export default function ServerView() {
  const { id } = useParams();
  const [server, setServer] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    axios.get(`/api/servers/${id}`).then(res => setServer(res.data));
  }, [id]);

  if (!server) return <div className="p-10">Loading...</div>;

  const tabs = [
    { name: "Console", path: "", icon: <Terminal size={18} /> },
    { name: "Files", path: "files", icon: <Folder size={18} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <div className="bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{server.name}</h1>
          <p className="text-sm text-gray-400 mt-1">Status: <span className={server.status==='online'?'text-green-400':'text-red-400'}>{server.status}</span> • Port: {server.port}</p>
        </div>
      </div>
      
      <div className="flex border-b border-gray-800 bg-gray-950 px-6">
        {tabs.map(tab => {
          const isActive = location.pathname.endsWith(tab.path) || (tab.path === "" && location.pathname.endsWith(id!));
          return (
            <Link 
              key={tab.name}
              to={tab.path}
              className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 ${isActive ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden p-6 custom-scrollbar">
        <Routes>
          <Route path="/" element={<ServerConsole serverId={id!} />} />
          <Route path="/files" element={<FileManager serverId={id!} />} />
        </Routes>
      </div>
    </div>
  );
}
