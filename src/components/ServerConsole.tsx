import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "lucide-react";

export default function ServerConsole({ serverId }: { serverId: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We would connect to socket.io here or fetch logs
    // Mocking for now to avoid complexity of docker exec stream in this env
    setLogs(["[System] Connecting to console stream...", "[System] Connected."]);
  }, [serverId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const sendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    setLogs(prev => [...prev, `> ${command}`, "[System] Command execution mock."]);
    setCommand("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm CustomScrollbar">
        {logs.map((log, i) => (
          <div key={i} className={`${log.startsWith('>') ? 'text-blue-400' : 'text-gray-300'}`}>{log}</div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={sendCommand} className="border-t border-gray-800 p-4 bg-gray-950 flex space-x-4">
        <input 
          type="text" 
          value={command} 
          onChange={e => setCommand(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
          placeholder="Type a command... (e.g. op Steve)"
        />
        <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 font-medium text-white rounded-lg transition-colors text-sm">
          Send
        </button>
      </form>
    </div>
  );
}
