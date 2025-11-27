import { useEffect, useState } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { Building2, Cpu, Network, AlertTriangle } from "lucide-react";
import { getDevices, getDeletedDeviced } from "@/api/deviceApi";
import { getAssetHierarchy } from "@/api/assetApi";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext"; 

export default function Dashboard() {
  const [totalDevices, setTotalDevices] = useState(0);
  const [deletedDevices, setDeletedDevices] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [plantCount, setPlantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); 
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Active devices
        const deviceRes = await getDevices(1, 100);
        setTotalDevices(deviceRes.totalCount || deviceRes.items?.length || 0);

        // Deleted devices
        if(isAdmin){
        const deletedRes = await getDeletedDeviced();
        setDeletedDevices(deletedRes?.length || 0);
        }

        // Assets
        const assets = await getAssetHierarchy();

        // Recursive function to count all assets
        const countAssets = (nodes: any[]): number => {
          let count = 0;
          nodes.forEach((node) => {
            count += 1; // count current node
            if (node.childrens && node.childrens.length > 0) {
              count += countAssets(node.childrens);
            }
          });
          return count;
        };

        setTotalAssets(countAssets(assets || []));

        // Count departments (level 2 assets)
        const countDepartments = (nodes: any[]): number => {
          let count = 0;
          nodes.forEach((node) => {
            if (node.level === 2) count += 1;
            if (node.childrens && node.childrens.length > 0) {
              count += countDepartments(node.childrens);
            }
          });
          return count;
        };
        setDepartmentCount(countDepartments(assets || []));

        // Count plants (level 1 assets)
        const countPlants = (nodes: any[]): number => {
          let count = 0;
          nodes.forEach((node) => {
            if (node.level === 1) count += 1;
          });
          return count;
        };
        setPlantCount(countPlants(assets || []));
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        toast.error("Failed to fetch dashboard data!");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
   return (
  <div className="flex items-center justify-center min-h-[60vh] bg-blue-50 rounded-xl">
    <p className="text-blue-500 font-medium animate-pulse">
      Loading dashboard data...
    </p>
  </div>
);

  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // Alerts KPI
  const alertsToday = Math.floor(totalDevices * 0.05);

  return (
   <div className="relative h-screen">
  {/* Background Image */}
  <img
    src="https://www.purppledesigns.com/wp-content/uploads/2023/11/download-4.png"   // <-- change path
    alt="bg"
    className="absolute inset-0 mx-auto -top-12  w-[80%] h-full object-cover opacity-10 pointer-events-none"
  />

  {/* Content */}
  <div className="relative z-10 space-y-6">
    {/* Header */}
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
      <p className="text-muted-foreground">
        Real-time monitoring of manufacturing assets and devices
      </p>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <KPICard
        title="Plants"
        value={plantCount.toString()}
        icon={<Building2 className="h-8 w-8" />}
        trend="+0 this year"
        trendUp
      />
      <KPICard
        title="Departments"
        value={departmentCount.toString()}
        icon={<Building2 className="h-8 w-8" />}
        trend="+1 this month"
        trendUp
      />
      <KPICard
        title="Total Assets"
        value={totalAssets.toString()}
        icon={<Network className="h-8 w-8" />}
        trend="+12 this week"
        trendUp
      />

      {isAdmin ? (
        <KPICard
          title="Active Devices"
          value={totalDevices.toString()}
          icon={<Cpu className="h-8 w-8" />}
          trend={`${deletedDevices} deleted`}
          trendUp={deletedDevices === 0}
        />
      ) : (
        <KPICard
          title="Active Devices"
          value={totalDevices.toString()}
          icon={<Cpu className="h-8 w-8" />}
        />
      )}

      <KPICard
        title="Alerts Today"
        value={alertsToday.toString()}
        icon={<AlertTriangle className="h-8 w-8" />}
        trend="-3 from yesterday"
        trendUp={false}
      />
    </div>
  </div>
</div>

  );
}
