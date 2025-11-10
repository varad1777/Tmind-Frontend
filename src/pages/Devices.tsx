import { useState } from "react";
import { devices as deviceData } from "@/data/devices";
import { Button } from "@/components/ui/button";
import { Eye, Settings, Trash2, Wrench, Search,HdmiPort} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Devices() {
  const [searchTerm, setSearchTerm] = useState("");
   const navigate = useNavigate();

  // Filter devices by name (case-insensitive)
  const filteredDevices = deviceData.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Devices</h1>
          <p className="text-muted-foreground">
            Manage, monitor, and configure all connected devices
          </p>
        </div>
        <div className="flex flex-row gap-2">
        <Button
        onClick={() => navigate("/devices/add")}
         className="bg-primary text-primary-foreground hover:bg-primary/90">
          + Add Device
        </Button>
        {/* <Button
        onClick={() => navigate("/devices/upload")}
         className="bg-primary text-primary-foreground hover:bg-primary/90">
          + Upload CSV
        </Button> */}
        </div>
      </div>


      {/* Search Bar */}
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

      {/* Device Table */}
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
              <tr
                key={d.deviceId}
                className="border-t border-border hover:bg-muted/20 transition-colors"
              >
                <td className="p-4 font-medium">{d.name}</td>
                <td className="p-4">{d.description}</td>


                <td className="p-4 flex justify-center gap-2 flex-wrap">

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/devices/edit")}
                    className="flex items-center gap-1"
                  >
                    <Settings className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/devices/config")}
                    className="flex items-center gap-1"
                  >
                    <Wrench className="h-4 w-4" /> Config
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/devices/ports")}
                    className="flex items-center gap-1"
                  >
                    <HdmiPort className="h-4 w-4" /> Ports
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </td>
              </tr>
            ))}
            {filteredDevices.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center p-6 text-muted-foreground"
                >
                  No devices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
