import { useEffect, useState } from "react";
import {
  Building2,
  Cpu,
  Network,
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { getDevices, getDeletedDeviced } from "@/api/deviceApi";
import { getAssetHierarchy } from "@/api/assetApi";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

// KPI Card Component
const KPICard = ({ title, value, icon, trend, trendUp, status, borderColor }: any) => (
  <div className={`group bg-white/5 backdrop-blur-xl border ${borderColor} rounded-xl p-4 hover:shadow transition-all duration-300`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold text-foreground mb-2">{value}</p>

        {trend && (
          <div className="flex items-center gap-1">
            <TrendingUp className={`w-3 h-3 ${trendUp ? "text-emerald-500" : "text-red-500"}`} />
            <p className={`text-xs ${trendUp ? "text-emerald-500" : "text-red-500"}`}>{trend}</p>
          </div>
        )}

        {status && <p className="text-xs text-muted-foreground mt-1">{status}</p>}
      </div>

      <div className="relative">
        <div className="relative w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/40">
          <div className="text-primary">{icon}</div>
        </div>
      </div>
    </div>
  </div>
);

// Stat Box Component
const StatBox = ({ label, value, icon, colorClass, borderColor }: any) => (
  <div className={`bg-white/5 border ${borderColor} rounded-xl p-3 flex items-center gap-3`}>
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClass}`}>{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const [totalDevices, setTotalDevices] = useState(0);
  const [deletedDevices, setDeletedDevices] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [plantCount, setPlantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const deviceRes = await getDevices(1, 100);
        setTotalDevices(deviceRes.totalCount || deviceRes.items?.length || 0);

        if (isAdmin) {
          const deletedRes = await getDeletedDeviced();
          setDeletedDevices(deletedRes?.length || 0);
        }

        const assets = await getAssetHierarchy();

        const countAssets = (nodes: any): number =>
          nodes.reduce((acc: number, n: any) => acc + 1 + (n.childrens ? countAssets(n.childrens) : 0), 0);

        const countDepartments = (nodes: any): number =>
          nodes.reduce((acc: number, n: any) => {
            if (n.level === 2) acc += 1;
            return acc + (n.childrens ? countDepartments(n.childrens) : 0);
          }, 0);

        const countPlants = (nodes: any): number =>
          nodes.filter((n: any) => n.level === 1).length;

        setTotalAssets(countAssets(assets || []));
        setDepartmentCount(countDepartments(assets || []));
        setPlantCount(countPlants(assets || []));
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-blue-50 border rounded-xl">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
        <p className="text-blue-600 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (error) return <div className="text-center text-red-600">{error}</div>;

  const activeDevices = totalDevices - deletedDevices;
  const uptime = 99.8;
  const alertsToday = Math.floor(totalDevices * 0.05);
  const efficiency = 94.2;

  return (
    <div className="w-full overflow-hidden p-2 space-y-2">
      {/* Header */}
      <div className="mb-3 border-b pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manufacturing Dashboard</h1>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500 rounded-md">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="text-sm text-emerald-600">Online</span>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard title="Plants" value={plantCount} icon={<Building2 className="w-6 h-6" />} trend="+0 this year" trendUp borderColor="border-blue-400" />
        <KPICard title="Departments" value={departmentCount} icon={<Building2 className="w-6 h-6" />} trend="+1 this month" trendUp borderColor="border-indigo-400" />
        <KPICard title="Total Assets" value={totalAssets} icon={<Network className="w-6 h-6" />} trend="+12 this week" trendUp borderColor="border-purple-400" />

        {isAdmin ? (
          <KPICard title="Active Devices" value={activeDevices} icon={<Cpu className="w-6 h-6" />} status={`${deletedDevices} offline`} borderColor="border-green-400" />
        ) : (
          <KPICard title="Active Devices" value={totalDevices} icon={<Cpu className="w-6 h-6" />} borderColor="border-green-400" />
        )}

        <KPICard title="Alerts Today" value={alertsToday} icon={<AlertTriangle className="w-6 h-6" />} trend="-3 from yesterday" trendUp={false} borderColor="border-red-400" />
      </div>

      {/* Stat Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
        <StatBox label="System Uptime" value={`${uptime}%`} icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} colorClass="bg-emerald-500/20" borderColor="border-emerald-500" />
        <StatBox label="Plant Efficiency" value={`${efficiency}%`} icon={<TrendingUp className="w-5 h-5 text-primary" />} colorClass="bg-primary/20" borderColor="border-primary" />
        <StatBox label="Avg Response Time" value="245ms" icon={<Clock className="w-5 h-5 text-amber-500" />} colorClass="bg-amber-500/20" borderColor="border-amber-500" />
        <StatBox label="Critical Issues" value="0" icon={<AlertTriangle className="w-5 h-5 text-red-500" />} colorClass="bg-red-500/20" borderColor="border-red-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Device Status Bar */}
        <div className="bg-white/5 border border-blue-400 rounded-xl p-4">
          <h3 className="font-semibold mb-3">Device Status</h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Active Devices</span>
                <span className="font-semibold text-emerald-500">{activeDevices}</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(activeDevices / totalDevices) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Offline Devices</span>
                <span className="font-semibold text-red-500">{deletedDevices}</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${(deletedDevices / totalDevices) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Bars */}
        <div className="bg-white/5 border border-purple-400 rounded-xl p-4">
          <h3 className="font-semibold mb-3">Performance Metrics</h3>

          <div className="flex items-end gap-2 h-28">
            {[75, 82, 88, 92, 95, 94, 89, 91].map((value, i) => (
              <div key={i} className="flex-1 bg-white/10 rounded-t-md overflow-hidden" style={{ height: `${value}%` }}>
                <div className="bg-primary w-full h-full"></div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-2">Last 8 Hours</p>
        </div>
      </div>
    </div>
  );
}
