import { useState, useEffect, useRef } from "react";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const AGENTS = [
  { id: 1, name: "Emeka Okafor", phone: "0801-234-5678", role: "pickup" },
  { id: 2, name: "Ngozi Adeyemi", phone: "0802-345-6789", role: "pickup" },
  { id: 3, name: "Chukwudi Eze", phone: "0803-456-7890", role: "pickup" },
  { id: 4, name: "Amina Bello", phone: "0804-567-8901", role: "pickup" },
  { id: 5, name: "Tunde Fashola", phone: "0805-678-9012", role: "pickup" },
];

const MOCK_BINS = [
  { id: 1, name: "BIN-001", type: "recyclable", level: 88, lat: 9.925, lng: 8.892, address: "Bingham University Main Gate, Karu", agent: AGENTS[0], lastEmptied: "2025-05-07", pickupRequest: true, status: "active" },
  { id: 2, name: "BIN-002", type: "perishable", level: 62, lat: 9.921, lng: 8.889, address: "Faculty of Computing, Bingham University", agent: AGENTS[1], lastEmptied: "2025-05-08", pickupRequest: false, status: "active" },
  { id: 3, name: "BIN-003", type: "recyclable", level: 95, lat: 9.928, lng: 8.895, address: "Student Hostel Block A, Bingham", agent: null, lastEmptied: "2025-05-06", pickupRequest: true, status: "active" },
  { id: 4, name: "BIN-004", type: "perishable", level: 34, lat: 9.919, lng: 8.886, address: "University Cafeteria, Bingham", agent: AGENTS[2], lastEmptied: "2025-05-08", pickupRequest: false, status: "active" },
  { id: 5, name: "BIN-005", type: "recyclable", level: 77, lat: 9.930, lng: 8.888, address: "Library Complex, Bingham University", agent: AGENTS[3], lastEmptied: "2025-05-07", pickupRequest: false, status: "active" },
  { id: 6, name: "BIN-006", type: "perishable", level: 91, lat: 9.923, lng: 8.898, address: "Sports Complex, Bingham University", agent: null, lastEmptied: "2025-05-05", pickupRequest: true, status: "active" },
  { id: 7, name: "BIN-007", type: "recyclable", level: 18, lat: 9.916, lng: 8.893, address: "Administration Block, Bingham", agent: AGENTS[4], lastEmptied: "2025-05-08", pickupRequest: false, status: "active" },
  { id: 8, name: "BIN-008", type: "perishable", level: 55, lat: 9.926, lng: 8.883, address: "Medical Centre, Bingham University", agent: AGENTS[0], lastEmptied: "2025-05-07", pickupRequest: false, status: "inactive" },
  { id: 9, name: "BIN-009", type: "recyclable", level: 82, lat: 9.912, lng: 8.901, address: "Engineering Lab, Bingham University", agent: null, lastEmptied: "2025-05-06", pickupRequest: true, status: "active" },
  { id: 10, name: "BIN-010", type: "perishable", level: 43, lat: 9.933, lng: 8.878, address: "Chapel Area, Bingham University", agent: AGENTS[2], lastEmptied: "2025-05-08", pickupRequest: false, status: "active" },
];

const MOCK_PICKUP_REQUESTS = [
  { id: 1, binId: 1, binName: "BIN-001", type: "recyclable", level: 88, address: "Bingham University Main Gate", agent: "Emeka Okafor", status: "pending", createdAt: "2025-05-09T06:30:00Z" },
  { id: 2, binId: 3, binName: "BIN-003", type: "recyclable", level: 95, address: "Student Hostel Block A", agent: "Unassigned", status: "pending", createdAt: "2025-05-09T07:15:00Z" },
  { id: 3, binId: 6, binName: "BIN-006", type: "perishable", level: 91, address: "Sports Complex", agent: "Unassigned", status: "pending", createdAt: "2025-05-09T05:50:00Z" },
  { id: 4, binId: 9, binName: "BIN-009", type: "recyclable", level: 82, address: "Engineering Lab", agent: "Unassigned", status: "pending", createdAt: "2025-05-08T22:00:00Z" },
  { id: 5, binId: 2, binName: "BIN-002", type: "perishable", level: 80, address: "Faculty of Computing", agent: "Ngozi Adeyemi", status: "approved", createdAt: "2025-05-08T14:00:00Z" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────
const getFillColor = (level) => {
  if (level >= 85) return "#ef4444";
  if (level >= 70) return "#f97316";
  return "#22c55e";
};

const getFillBg = (level) => {
  if (level >= 85) return "bg-red-100 text-red-700";
  if (level >= 70) return "bg-orange-100 text-orange-700";
  return "bg-green-100 text-green-700";
};

const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color = "blue", sub }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    orange: "from-orange-500 to-orange-600",
    gray: "from-slate-500 to-slate-600",
    teal: "from-teal-500 to-teal-600",
  };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white text-xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function BinMarker({ bin, onClick, isSelected }) {
  const isRecyclable = bin.type === "recyclable";
  const isFull = bin.level >= 80;
  const baseColor = isRecyclable ? "#3b82f6" : "#22c55e";
  const borderColor = isSelected ? "#f59e0b" : isFull ? "#ef4444" : baseColor;
  return (
    <div
      onClick={() => onClick(bin)}
      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
      style={{ left: `${bin._mapX}%`, top: `${bin._mapY}%` }}
      title={bin.name}
    >
      <div className="relative">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all"
          style={{
            backgroundColor: baseColor,
            border: `3px solid ${borderColor}`,
            boxShadow: isSelected ? `0 0 0 4px rgba(245,158,11,0.3)` : isFull ? `0 0 0 4px rgba(239,68,68,0.25)` : `0 0 6px rgba(0,0,0,0.15)`,
          }}
        >
          {isRecyclable ? "♻" : "🌿"}
        </div>
        {bin.pickupRequest && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white animate-pulse" />
        )}
        {isFull && !bin.pickupRequest && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="w-1 h-2 mx-auto" style={{ backgroundColor: borderColor, marginTop: "-1px" }} />
    </div>
  );
}

function BinDetailPopup({ bin, onClose, onAssign, onMarkPickedUp }) {
  if (!bin) return null;
  const isRecyclable = bin.type === "recyclable";
  return (
    <div className="absolute top-4 right-4 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
      <div className={`px-4 py-3 flex items-center justify-between ${isRecyclable ? "bg-blue-500" : "bg-green-500"}`}>
        <div className="flex items-center gap-2">
          <span className="text-white text-lg">{isRecyclable ? "♻" : "🌿"}</span>
          <div>
            <p className="text-white font-bold text-sm">{bin.name}</p>
            <p className="text-white/80 text-xs capitalize">{bin.type}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white text-lg leading-none">×</button>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-slate-500 mb-1">Fill Level</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${bin.level}%`, backgroundColor: getFillColor(bin.level) }} />
            </div>
            <span className="text-sm font-bold" style={{ color: getFillColor(bin.level) }}>{bin.level}%</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 rounded-lg p-2">
            <p className="text-slate-400">Location</p>
            <p className="text-slate-700 font-medium mt-0.5 leading-tight">{bin.address}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <p className="text-slate-400">Agent</p>
            <p className="text-slate-700 font-medium mt-0.5">{bin.agent?.name || "Unassigned"}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <p className="text-slate-400">Pickup Request</p>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${bin.pickupRequest ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
              {bin.pickupRequest ? "Pending" : "None"}
            </span>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <p className="text-slate-400">Last Emptied</p>
            <p className="text-slate-700 font-medium mt-0.5">{bin.lastEmptied}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={() => onAssign(bin)} className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Assign</button>
          <button onClick={() => onMarkPickedUp(bin)} className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors">Mark Picked Up</button>
        </div>
      </div>
    </div>
  );
}

function CreateBinModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", type: "recyclable", address: "", lat: "", lng: "", capacity: "100", agent: "", status: "active" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Create New Bin</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Bin Name / ID</label>
              <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. BIN-011" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Type</label>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.type} onChange={e => set("type", e.target.value)}>
                <option value="recyclable">Recyclable (Blue)</option>
                <option value="perishable">Perishable (Green)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Address / Location</label>
            <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Building name or street address" value={form.address} onChange={e => set("address", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Latitude</label>
              <input type="number" step="0.001" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="9.925" value={form.lat} onChange={e => set("lat", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Longitude</label>
              <input type="number" step="0.001" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="8.892" value={form.lng} onChange={e => set("lng", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Capacity (L)</label>
              <input type="number" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.capacity} onChange={e => set("capacity", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Assigned Agent</label>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.agent} onChange={e => set("agent", e.target.value)}>
              <option value="">Unassigned</option>
              {AGENTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={() => { onCreate(form); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity">Create Bin</button>
        </div>
      </div>
    </div>
  );
}

function AssignBinModal({ bins, preselectedBin, onClose, onSave }) {
  const [form, setForm] = useState({ binId: preselectedBin?.id || "", agentId: "", date: new Date().toISOString().split("T")[0], notes: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Assign Bin to Agent</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Select Bin</label>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.binId} onChange={e => set("binId", e.target.value)}>
              <option value="">Choose bin...</option>
              {bins.map(b => <option key={b.id} value={b.id}>{b.name} — {b.address}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Collection Agent</label>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.agentId} onChange={e => set("agentId", e.target.value)}>
              <option value="">Choose agent...</option>
              {AGENTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Assignment Date</label>
            <input type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.date} onChange={e => set("date", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Notes</label>
            <textarea className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} placeholder="Optional instructions..." value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold text-sm hover:opacity-90">Save Assignment</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold z-[100] ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

// ─── Map Component ─────────────────────────────────────────────────────────
function MapView({ bins, onBinClick, selectedBin, onAssign, onMarkPickedUp }) {
  const lats = bins.map(b => b.lat);
  const lngs = bins.map(b => b.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const padLat = (maxLat - minLat) * 0.18 || 0.01;
  const padLng = (maxLng - minLng) * 0.18 || 0.01;

  const withPos = bins.map(b => ({
    ...b,
    _mapX: ((b.lng - (minLng - padLng)) / ((maxLng + padLng) - (minLng - padLng))) * 100,
    _mapY: (1 - (b.lat - (minLat - padLat)) / ((maxLat + padLat) - (minLat - padLat))) * 100,
  }));

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-100" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.4'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")` }}>
      {/* Map background strips */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(135deg, #dbeafe 0%, #dcfce7 50%, #f0fdf4 100%)",
        opacity: 0.7
      }} />
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* "Roads" */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20% 0% L 20% 100%" stroke="#e2e8f0" strokeWidth="6" fill="none"/>
        <path d="M 60% 0% L 60% 100%" stroke="#e2e8f0" strokeWidth="6" fill="none"/>
        <path d="M 0% 35% L 100% 35%" stroke="#e2e8f0" strokeWidth="6" fill="none"/>
        <path d="M 0% 70% L 100% 70%" stroke="#e2e8f0" strokeWidth="6" fill="none"/>
        <path d="M 0% 35% L 100% 35%" stroke="#f1f5f9" strokeWidth="2" fill="none"/>
        <path d="M 20% 0% L 20% 100%" stroke="#f1f5f9" strokeWidth="2" fill="none"/>
      </svg>
      {/* Bins */}
      {withPos.map(bin => (
        <BinMarker key={bin.id} bin={bin} onClick={onBinClick} isSelected={selectedBin?.id === bin.id} />
      ))}
      {/* Bingham label */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow text-xs">
        <p className="font-bold text-slate-700">Bingham University</p>
        <p className="text-slate-400">Karu, Nasarawa State</p>
      </div>
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2.5 shadow space-y-1.5 text-xs">
        <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-blue-500" /><span className="text-slate-600">Recyclable</span></div>
        <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-green-500" /><span className="text-slate-600">Perishable</span></div>
        <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-red-400" /><span className="text-slate-600">Full (≥80%)</span></div>
        <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-orange-400 animate-pulse" /><span className="text-slate-600">Pickup req.</span></div>
      </div>
      {/* Popup */}
      {selectedBin && <BinDetailPopup bin={selectedBin} onClose={() => onBinClick(null)} onAssign={onAssign} onMarkPickedUp={onMarkPickedUp} />}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [bins, setBins] = useState(MOCK_BINS);
  const [selectedBin, setSelectedBin] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [assignBin, setAssignBin] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pickupRequests, setPickupRequests] = useState(MOCK_PICKUP_REQUESTS);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBins = bins.filter(b => {
    const q = searchQuery.toLowerCase();
    if (q && !b.name.toLowerCase().includes(q) && !b.address.toLowerCase().includes(q)) return false;
    if (filter === "recyclable") return b.type === "recyclable";
    if (filter === "perishable") return b.type === "perishable";
    if (filter === "full") return b.level >= 80;
    if (filter === "full-recyclable") return b.type === "recyclable" && b.level >= 80;
    if (filter === "full-perishable") return b.type === "perishable" && b.level >= 80;
    if (filter === "pickup") return b.pickupRequest;
    if (filter === "unassigned") return !b.agent;
    return true;
  });

  const stats = {
    total: bins.length,
    recyclable: bins.filter(b => b.type === "recyclable").length,
    perishable: bins.filter(b => b.type === "perishable").length,
    full: bins.filter(b => b.level >= 80).length,
    pickup: bins.filter(b => b.pickupRequest).length,
    unassigned: bins.filter(b => !b.agent).length,
  };

  const attentionBins = bins.filter(b => b.level >= 70 || b.pickupRequest).sort((a, b) => b.level - a.level);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const navItems = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Map View", icon: "🗺" },
    { name: "Bins", icon: "🗑" },
    { name: "Pickup Requests", icon: "🚛" },
    { name: "Users / Agents", icon: "👥" },
    { name: "Reports", icon: "📊" },
    { name: "Alerts", icon: "🔔" },
    { name: "Settings", icon: "⚙️" },
  ];

  const handleBinClick = (bin) => setSelectedBin(bin?.id === selectedBin?.id ? null : bin);

  const handleCreate = (form) => {
    const newBin = {
      id: bins.length + 1,
      name: form.name || `BIN-0${bins.length + 1}`,
      type: form.type,
      level: 0,
      lat: parseFloat(form.lat) || 9.925,
      lng: parseFloat(form.lng) || 8.892,
      address: form.address || "Bingham University",
      agent: AGENTS.find(a => a.id === parseInt(form.agent)) || null,
      lastEmptied: new Date().toISOString().split("T")[0],
      pickupRequest: false,
      status: form.status,
    };
    setBins(prev => [...prev, newBin]);
    showToast(`${newBin.name} created successfully`);
  };

  const handleAssign = (form) => {
    const agent = AGENTS.find(a => a.id === parseInt(form.agentId));
    setBins(prev => prev.map(b => b.id === parseInt(form.binId) ? { ...b, agent } : b));
    showToast(`Bin assigned to ${agent?.name || "agent"}`);
  };

  const handleMarkPickedUp = (bin) => {
    setBins(prev => prev.map(b => b.id === bin.id ? { ...b, level: 0, pickupRequest: false, lastEmptied: new Date().toISOString().split("T")[0] } : b));
    setPickupRequests(prev => prev.map(r => r.binId === bin.id ? { ...r, status: "approved" } : r));
    setSelectedBin(null);
    showToast(`${bin.name} marked as picked up`);
  };

  const openAssign = (bin) => { setAssignBin(bin); setShowAssign(true); };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} transition-all duration-300 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col shadow-sm z-20`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-lg flex-shrink-0">♻</div>
          {sidebarOpen && <div><p className="font-extrabold text-slate-800 text-sm tracking-tight">CleanStreak</p><p className="text-xs text-slate-400">Admin Portal</p></div>}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.name}
              onClick={() => setActiveNav(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeNav === item.name ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.name}</span>}
              {sidebarOpen && item.name === "Alerts" && stats.full > 0 && (
                <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">{stats.full}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 ${!sidebarOpen && "justify-center"}`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
            {sidebarOpen && <div><p className="text-xs font-semibold text-slate-700">Admin User</p><p className="text-xs text-slate-400">admin@cleanstreak.ng</p></div>}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-5 gap-4 flex-shrink-0 z-10 shadow-sm">
          <button onClick={() => setSidebarOpen(s => !s)} className="text-slate-400 hover:text-slate-600 text-xl p-1 rounded-lg hover:bg-slate-50">☰</button>
          <div className="flex-1 max-w-sm relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search bins, locations..."
              className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-slate-50 text-slate-500 text-lg">
              🔔
              {stats.pickup > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">A</div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-700 leading-none">Admin</p>
                <p className="text-xs text-slate-400">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-5 space-y-5">
          {/* Page title + actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">{activeNav}</h1>
              <p className="text-sm text-slate-400 mt-0.5">CleanStreak Waste Management — Bingham University</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition shadow-sm">
                <span>+</span> Create Bin
              </button>
              <button onClick={() => { setAssignBin(null); setShowAssign(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-green-500 text-white text-sm font-semibold hover:opacity-90 transition shadow-sm">
                <span>👤</span> Assign Bin
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            <StatCard icon="🗑" label="Total Bins" value={stats.total} color="blue" />
            <StatCard icon="♻" label="Recyclable" value={stats.recyclable} color="blue" />
            <StatCard icon="🌿" label="Perishable" value={stats.perishable} color="green" />
            <StatCard icon="🔴" label="Full Bins" value={stats.full} color="red" sub="≥80% capacity" />
            <StatCard icon="🚛" label="Pickup Req." value={stats.pickup} color="orange" sub="pending" />
            <StatCard icon="⚠" label="Unassigned" value={stats.unassigned} color="gray" />
          </div>

          {/* Map + Side Panel */}
          <div className="flex gap-4 h-[480px]">
            {/* Map */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              {/* Filter bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-wrap">
                {[
                  ["all", "All Bins"],
                  ["recyclable", "♻ Recyclable"],
                  ["perishable", "🌿 Perishable"],
                  ["full", "🔴 Full"],
                  ["full-recyclable", "Full Blue"],
                  ["full-perishable", "Full Green"],
                  ["pickup", "🚛 Pickup Req."],
                  ["unassigned", "⚠ Unassigned"],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFilter(val)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filter === val ? "bg-slate-800 text-white shadow" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
                  >
                    {label}
                    {val !== "all" && (
                      <span className="ml-1.5 opacity-70">
                        ({val === "recyclable" ? stats.recyclable : val === "perishable" ? stats.perishable : val === "full" ? stats.full : val === "pickup" ? stats.pickup : val === "unassigned" ? stats.unassigned : bins.filter(b => (val === "full-recyclable" ? b.type === "recyclable" && b.level >= 80 : b.type === "perishable" && b.level >= 80)).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex-1 relative">
                <MapView bins={filteredBins} onBinClick={handleBinClick} selectedBin={selectedBin} onAssign={openAssign} onMarkPickedUp={handleMarkPickedUp} />
              </div>
            </div>

            {/* Right panel */}
            <div className="w-72 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
              {/* Recent Pickup Requests */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-slate-700 text-sm">Pickup Requests</p>
                  <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">{pickupRequests.filter(r => r.status === "pending").length} pending</span>
                </div>
                <div className="space-y-2">
                  {pickupRequests.slice(0, 5).map(req => (
                    <div key={req.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${req.type === "recyclable" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                        {req.type === "recyclable" ? "♻" : "🌿"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{req.binName}</p>
                        <p className="text-xs text-slate-400 truncate">{req.address}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${req.status === "pending" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>{req.status}</span>
                          <span className="text-xs text-slate-400">{req.level}%</span>
                          <span className="text-xs text-slate-400 ml-auto">{timeAgo(req.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <p className="font-bold text-slate-700 text-sm mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Create Bin", icon: "➕", action: () => setShowCreate(true), color: "blue" },
                    { label: "Assign Bin", icon: "👤", action: () => { setAssignBin(null); setShowAssign(true); }, color: "teal" },
                    { label: "Pickup Queue", icon: "🚛", action: () => setActiveNav("Pickup Requests"), color: "orange" },
                    { label: "Export Report", icon: "📊", action: () => showToast("Report export started"), color: "gray" },
                  ].map(a => (
                    <button key={a.label} onClick={a.action} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                      <span className="text-lg">{a.icon}</span>
                      <span className="text-xs font-semibold text-slate-600">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Attention Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Bins Needing Attention</p>
                <p className="text-xs text-slate-400 mt-0.5">Bins with ≥70% fill level or active pickup requests</p>
              </div>
              <span className="text-xs bg-red-100 text-red-600 font-bold px-2.5 py-1 rounded-full">{attentionBins.length} bins</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-50">
                    {["Bin ID", "Type", "Fill Level", "Location", "Assigned Agent", "Status", "Action"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attentionBins.map((bin, i) => (
                    <tr key={bin.id} className={`border-b border-slate-50 hover:bg-slate-50 transition ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                      <td className="px-5 py-3">
                        <button onClick={() => handleBinClick(bin)} className="font-bold text-blue-600 hover:text-blue-800 hover:underline">{bin.name}</button>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bin.type === "recyclable" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                          {bin.type === "recyclable" ? "♻ Recyclable" : "🌿 Perishable"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${bin.level}%`, backgroundColor: getFillColor(bin.level) }} />
                          </div>
                          <span className="font-bold text-xs" style={{ color: getFillColor(bin.level) }}>{bin.level}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 max-w-[180px] truncate">{bin.address}</td>
                      <td className="px-5 py-3">
                        {bin.agent ? (
                          <span className="text-slate-700 font-medium">{bin.agent.name}</span>
                        ) : (
                          <span className="text-orange-500 font-semibold text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {bin.pickupRequest ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                            🚛 Pickup Req.
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getFillBg(bin.level)}`}>
                            {bin.level >= 85 ? "🔴 Critical" : "⚠ High"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => handleBinClick(bin)} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition">View</button>
                          <button onClick={() => openAssign(bin)} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition">Assign</button>
                          {bin.pickupRequest && (
                            <button onClick={() => handleMarkPickedUp(bin)} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition">✓ Pickup</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {attentionBins.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-slate-400 text-sm">All bins are within normal levels ✓</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showCreate && <CreateBinModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {showAssign && <AssignBinModal bins={bins} preselectedBin={assignBin} onClose={() => { setShowAssign(false); setAssignBin(null); }} onSave={handleAssign} />}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
