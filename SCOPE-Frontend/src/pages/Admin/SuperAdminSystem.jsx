import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Server, Activity, CheckCircle, Cpu, Zap, LogOut, 
  Code2, Database, Search, Terminal, Wifi, AlertTriangle, Users
} from 'lucide-react';

export default function SuperAdminSystem() {
  const navigate = useNavigate();

  // --- MOCK DATA: MISSION CONTROL TELEMETRY ---
  const [clusterMetrics, setClusterMetrics] = useState({
    queueLength: 14,
    avgLatency: 112,
    successRate: 94.2,
    totalProcessed: 14059
  });

  const hardwareNodes = [
    { id: "Master-LB", role: "Nginx + Redis", ip: "172.10.8.19", cpu: 12, ram: 4, maxRam: 8, network: "1.2 MB/s", status: "Online" },
    { id: "Child-01", role: "Judge0 Worker", ip: "192.168.1.101", cpu: 88, ram: 28, maxRam: 32, network: "4.5 MB/s", status: "Online" },
    { id: "Child-02", role: "Judge0 Worker", ip: "192.168.1.102", cpu: 45, ram: 14, maxRam: 32, network: "2.1 MB/s", status: "Online" },
    { id: "Child-03", role: "Judge0 Worker", ip: "192.168.1.103", cpu: 92, ram: 30, maxRam: 32, network: "5.8 MB/s", status: "Warning" }
  ];

  const [searchQueue, setSearchQueue] = useState('');
  const liveQueue = [
    { id: "REQ-9050", roll: "21BCE10243", lang: "Java 17", node: "Child-03", status: "Compiling", time: "0.8s" },
    { id: "REQ-9051", roll: "21BCE10505", lang: "C++ 20", node: "-", status: "Queued", time: "-" },
    { id: "REQ-9052", roll: "21BCE10112", lang: "Python 3", node: "Child-01", status: "Compiling", time: "1.2s" },
    { id: "REQ-9053", roll: "21BCE10088", lang: "Java 17", node: "-", status: "Queued", time: "-" },
    { id: "REQ-9054", roll: "21BCE10301", lang: "C++ 20", node: "Child-02", status: "Accepted", time: "0.04s" },
    { id: "REQ-9055", roll: "21BCE10444", lang: "Python 3", node: "Child-03", status: "TLE", time: "2.01s" },
  ];

  // Simulating Live Telemetry Data
  useEffect(() => {
    const interval = setInterval(() => {
      setClusterMetrics(prev => ({
        queueLength: Math.max(0, prev.queueLength + (Math.floor(Math.random() * 5) - 2)),
        avgLatency: Math.floor(Math.random() * 40) + 90,
        successRate: 94.2,
        totalProcessed: prev.totalProcessed + Math.floor(Math.random() * 3)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredQueue = useMemo(
    () => liveQueue.filter(q => q.id.includes(searchQueue) || q.roll.includes(searchQueue)),
    [searchQueue]
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0b1121] font-sans">
      
      {/* --- LEFT SIDEBAR NAV (Dark Mode) --- */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col z-20 shadow-lg">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center border border-slate-800">
            <Terminal size={18} className="text-emerald-400 font-bold" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white leading-none">S.C.O.P.E.</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Super Admin</p>
          </div>
        </div>

        <div className="p-4 flex-1 space-y-2">
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          >
            <Activity size={18} /> System Analysis
          </button>

          <button 
            onClick={() => navigate('/admin/staff')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Users size={18} /> Staff Access Control
          </button>
        </div>

        <div className="p-6 border-t border-slate-800">
          <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 text-sm font-bold py-2.5 rounded-lg transition-colors w-full">
            <LogOut size={16} /> Terminate Session
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA (Mission Control) --- */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 text-slate-300">
        
        <div className="space-y-6 animate-in fade-in duration-300 min-h-full">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Server size={24} className="text-emerald-500"/> Distributed Cluster Telemetry
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-mono">LIVE // 172.10.8.19:9090 // GRAFANA SIMULATION</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-400 text-xs font-mono font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              SYSTEM HEALTHY
            </div>
          </div>
          
          {/* Top Level KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex justify-between">Queue Length <Database size={12}/></div>
              <div className="text-3xl font-black text-white font-mono">{clusterMetrics.queueLength}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex justify-between">Avg Latency <Zap size={12}/></div>
              <div className="text-3xl font-black text-white font-mono">{clusterMetrics.avgLatency}<span className="text-sm text-slate-600 ml-1">ms</span></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex justify-between">Success Rate <CheckCircle size={12}/></div>
              <div className="text-3xl font-black text-emerald-400 font-mono">{clusterMetrics.successRate}<span className="text-sm text-emerald-700 ml-1">%</span></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex justify-between">Total Jobs <Activity size={12}/></div>
              <div className="text-3xl font-black text-blue-400 font-mono">{clusterMetrics.totalProcessed}</div>
            </div>
          </div>

          {/* Hardware Telemetry Grid */}
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-8 border-b border-slate-800 pb-2">Hardware Nodes Overview</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {hardwareNodes.map((node, index) => (
              <div key={index} className={`bg-slate-900 border p-5 rounded-xl flex flex-col gap-4 ${node.status === 'Warning' ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-800'}`}>
                
                {/* Node Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-black flex items-center gap-2">
                      {node.id} 
                      {node.status === 'Warning' ? <AlertTriangle size={14} className="text-amber-500"/> : <CheckCircle size={14} className="text-emerald-500"/>}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{node.role} · {node.ip}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1"><Wifi size={12}/> {node.network}</span>
                </div>

                {/* CPU Bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-1 font-mono">
                    <span className="text-slate-400">CPU Usage</span>
                    <span className={node.cpu > 85 ? 'text-red-400' : 'text-emerald-400'}>{node.cpu}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${node.cpu > 85 ? 'bg-red-500' : node.cpu > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${node.cpu}%` }}></div>
                  </div>
                </div>

                {/* RAM Bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-1 font-mono">
                    <span className="text-slate-400">Memory (RAM)</span>
                    <span className={(node.ram / node.maxRam) > 0.85 ? 'text-amber-400' : 'text-blue-400'}>{node.ram}GB / {node.maxRam}GB</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${(node.ram / node.maxRam) > 0.85 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${(node.ram / node.maxRam) * 100}%` }}></div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Live Redis Queue Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-6">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-white text-sm flex items-center gap-2"><Database size={16} className="text-blue-500"/> Live Redis Execution Queue</h3>
              
              <div className="relative w-48 hidden sm:block">
                <Search size={14} className="absolute left-3 top-2 text-slate-500" />
                <input 
                  type="text" placeholder="Search Request ID..." value={searchQueue} onChange={(e) => setSearchQueue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded text-xs pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono">
                <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Req ID</th>
                    <th className="px-4 py-3">Student Roll</th>
                    <th className="px-4 py-3">Language</th>
                    <th className="px-4 py-3">Worker Node</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Exec Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {filteredQueue.map((job, index) => (
                    <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-slate-300">{job.id}</td>
                      <td className="px-4 py-3 text-slate-400">{job.roll}</td>
                      <td className="px-4 py-3 text-slate-500"><span className="flex items-center gap-1"><Code2 size={12}/> {job.lang}</span></td>
                      <td className="px-4 py-3 text-blue-400">{job.node}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          job.status === 'Queued' ? 'bg-slate-800 text-slate-400' :
                          job.status === 'Compiling' ? 'bg-blue-900/50 text-blue-400' :
                          job.status === 'Accepted' ? 'bg-emerald-900/50 text-emerald-400' :
                          'bg-red-900/50 text-red-400'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">{job.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}