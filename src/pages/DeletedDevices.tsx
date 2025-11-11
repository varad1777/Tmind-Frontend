import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, Wrench, Search, HdmiPort } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {   getDeletedDeviced, retriveDeviceById } from "@/api/deviceApi";
import { toast } from "react-hot-toast";

interface Device {
  deviceId: string;
  name: string;
  description: string;
  protocol: string;
  deviceConfiguration?: {
    configurationId: string;
    name: string;
    pollIntervalMs: number;
    protocolSettingsJson: string;
  };
}

export default function DeletedDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch all devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const data = await getDeletedDeviced();
        setDevices(data);
      } catch (err: any) {
        console.error("Error fetching devices:", err);
        setError("Failed to fetch devices.");
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Delete device
  const retriveDevice = async (deviceId: string) => {
    // const confirmed = window.confirm("Are you sure you want to Retrive this device?");
    // if (!confirmed) return;

    try {
      await retriveDeviceById(deviceId);
      setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
      toast.success("Device Retrive successfully!");
    } catch (err) {
      console.error("Error retriving device:", err);
      toast.error("Failed to retrive device.");
    }
  };

  // Filter devices by search term
  const filteredDevices = devices.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deleted Devices</h1>
          <p className="text-muted-foreground">Manage all Deleted devices</p>
        </div>
       
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Loading / Error */}
      {loading && <div className="text-center text-muted-foreground">Loading devices...</div>}
      {error && <div className="text-center text-destructive">{error}</div>}

      {/* Device Table */}
      {!loading && !error && (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm text-foreground">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-4 font-semibold">Device Name</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((d) => (
                <tr key={d.deviceId} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-medium">{d.name}</td>
                  <td className="p-4">{d.description}</td>
                  <td className="p-4 flex justify-center gap-2 flex-wrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => retriveDevice(d.deviceId)} // ✅ View Details Modal
                      className="flex items-center gap-1"
                    >
                      <Settings className="h-4 w-4" /> Retrive
                    </Button>
                   
                  </td>
                </tr>
              ))}
              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center p-6 text-muted-foreground">
                    No devices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
