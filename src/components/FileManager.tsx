import { useEffect, useState } from "react";
import axios from "axios";
import { Folder, File, ArrowLeft, Upload, Trash2 } from "lucide-react";

export default function FileManager({ serverId }: { serverId: string }) {
  const [files, setFiles] = useState<any[]>([]);
  const [path, setPath] = useState("/");

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`/api/servers/${serverId}/files?path=${encodeURIComponent(path)}`);
      setFiles(res.data);
    } catch (e) {
      setFiles([]);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [path, serverId]);

  const goUp = () => {
    if (path === "/") return;
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    setPath("/" + parts.join("/"));
  };

  const traverse = (dirName: string) => {
    setPath(path.endsWith("/") ? path + dirName : path + "/" + dirName);
  };

  const deleteFile = async (name: string) => {
    if(confirm("Delete this?")) {
      await axios.delete(`/api/servers/${serverId}/files`, {
        data: { path: path.endsWith("/") ? path + name : path + "/" + name }
      });
      fetchFiles();
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950">
        <div className="flex items-center space-x-4">
          <button onClick={goUp} disabled={path === "/"} className="p-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-gray-400 disabled:opacity-50">
            <ArrowLeft size={18} />
          </button>
          <div className="font-mono text-sm text-gray-300 bg-gray-900 px-4 py-2 rounded-lg border border-gray-800">
            {path}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {files.length === 0 && <p className="text-gray-500 text-sm text-center py-10">Directory is empty.</p>}
        {files.map(f => (
          <div key={f.name} className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-xl group transition-colors">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => f.isDirectory ? traverse(f.name) : null}>
              {f.isDirectory ? <Folder className="text-blue-400" size={20} /> : <File className="text-gray-400" size={20} />}
              <span className="font-medium text-gray-300 text-sm">{f.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              {!f.isDirectory && <span className="text-xs text-gray-500">{(f.size/1024).toFixed(1)} KB</span>}
              <button onClick={() => deleteFile(f.name)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
