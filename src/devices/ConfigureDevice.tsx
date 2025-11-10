import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings2, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getDeviceById, updateDevice } from "@/api/deviceApi";

export default function ConfigureDevice() {
  const navigate = useNavigate();
  const { deviceId } = useParams<{ deviceId: string }>();
  const [loading, setLoading] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState({
    name: "",
    description: "",
    protocol: "",
  });

  const [formData, setFormData] = useState({
    configName: "",
    pollInterval: 1000,
    protocolSettings: {
      IpAddress: "127.0.0.1",
      Port: 5020,
      SlaveId: 1,
      Endian: "Little",
    },
  });

  // 🔹 Fetch device details by ID
  useEffect(() => {
    if (!deviceId) return;
    const fetchDevice = async () => {
      try {
        const res = await getDeviceById(deviceId);
        if (res) {
          setDeviceDetails({
            name: res.name || "Unknown",
            description: res.description || "",
            protocol: res.protocol || "ModbusTCP",
          });
          setFormData((prev) => ({
            ...prev,
            configName: `${res.name}_config`,
          }));
        }
      } catch (error) {
        console.error("❌ Failed to fetch device:", error);
        alert("Error fetching device details. Please try again.");
      }
    };
    fetchDevice();
  }, [deviceId]);

  // 🔹 Handle config name + poll interval
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Handle protocol settings change
  const handleProtocolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      protocolSettings: {
        ...formData.protocolSettings,
        [name]: name === "Port" || name === "SlaveId" ? Number(value) : value,
      },
    });
  };

  // 🔹 Handle Endian dropdown
  const handleEndianChange = (value: string) => {
    setFormData({
      ...formData,
      protocolSettings: { ...formData.protocolSettings, Endian: value },
    });
  };

  // 🔹 Submit configuration update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId) return alert("Missing Device ID!");
    setLoading(true);

    // ✅ Use fetched device info, not manual ones
    const payload = {
      device: {
        name: deviceDetails.name,
        description: deviceDetails.description,
        protocol: deviceDetails.protocol || "ModbusTCP",
      },
      configuration: {
        name: formData.configName,
        pollIntervalMs: Number(formData.pollInterval),
        protocolSettingsJson: JSON.stringify(formData.protocolSettings),
      },
    };

    console.log("📤 Sending payload to backend:", payload);

    try {
      await updateDevice(deviceId, payload);
      alert("Configuration updated successfully!");
      navigate("/devices");
    } catch (error) {
      console.error("❌ Error updating configuration:", error);
      alert("Failed to update configuration. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-background text-foreground">
      <Card className="w-full max-w-2xl shadow-lg border border-border bg-card">
        <CardHeader className="flex flex-row items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-semibold">Configure Device</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Config Name */}
            <div className="grid gap-2">
              <Label htmlFor="configName">Configuration Name *</Label>
              <Input
                id="configName"
                name="configName"
                type="text"
                value={formData.configName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Poll Interval */}
            <div className="grid gap-2">
              <Label htmlFor="pollInterval">Poll Interval (ms)</Label>
              <Input
                id="pollInterval"
                name="pollInterval"
                type="number"
                value={formData.pollInterval}
                onChange={handleChange}
                required
              />
            </div>

            <hr className="border-border" />
            <p className="text-sm font-semibold text-muted-foreground">
              Protocol Settings
            </p>

            {/* Protocol Settings */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="IpAddress">IP Address</Label>
                <Input
                  id="IpAddress"
                  name="IpAddress"
                  value={formData.protocolSettings.IpAddress}
                  onChange={handleProtocolChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="Port">Port</Label>
                <Input
                  id="Port"
                  name="Port"
                  type="number"
                  value={formData.protocolSettings.Port}
                  onChange={handleProtocolChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="SlaveId">Slave ID</Label>
                <Input
                  id="SlaveId"
                  name="SlaveId"
                  type="number"
                  value={formData.protocolSettings.SlaveId}
                  onChange={handleProtocolChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="Endian">Endian</Label>
                <Select
                  value={formData.protocolSettings.Endian}
                  onValueChange={handleEndianChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Endian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Little">Little</SelectItem>
                    <SelectItem value="Big">Big</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-6">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate("/devices")}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
