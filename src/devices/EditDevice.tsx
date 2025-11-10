import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings2, Cpu, Save, ArrowLeft } from "lucide-react";
import { getDeviceById, updateDevice } from "@/api/deviceApi";

export default function EditDeviceForm() {
  const navigate = useNavigate();
  const { deviceId } = useParams<{ deviceId: string }>(); // ✅ Use correct param name

  const [deviceDetails, setDeviceDetails] = useState({
    name: "",
    description: "",
    protocol: "ModbusTCP",
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

  const [loading, setLoading] = useState(false);

  // Fetch device by ID
  useEffect(() => {
    if (!deviceId) return;
    const fetchDevice = async () => {
      try {
        const res = await getDeviceById(deviceId);
        if (res) {
          setDeviceDetails({
            name: res.name || "",
            description: res.description || "",
            protocol: res.protocol || "ModbusTCP",
          });
          setFormData({
            configName: res.configuration?.name || `${res.name}_config`,
            pollInterval: res.configuration?.pollIntervalMs || 1000,
            protocolSettings: JSON.parse(res.configuration?.protocolSettingsJson || "{}"),
          });
        }
      } catch (error) {
        console.error("❌ Failed to fetch device:", error);
        alert("Error fetching device details. Please try again.");
      }
    };
    fetchDevice();
  }, [deviceId]);

  // Handle config name / poll interval changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle protocol settings changes
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

  // Handle Endian dropdown
  const handleEndianChange = (value: string) => {
    setFormData({
      ...formData,
      protocolSettings: { ...formData.protocolSettings, Endian: value },
    });
  };

  // Submit updated device
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId) return alert("Missing Device ID!"); // ✅ Now correctly checks deviceId

    setLoading(true);

    const payload = {
      device: {
        ...deviceDetails,
      },
      configuration: {
        name: formData.configName,
        pollIntervalMs: Number(formData.pollInterval),
        protocolSettingsJson: JSON.stringify(formData.protocolSettings),
      },
    };

    console.log("📤 Sending payload:", payload);

    try {
      await updateDevice(deviceId, payload); // ✅ Use deviceId
      alert("Device updated successfully!");
      navigate("/devices");
    } catch (error) {
      console.error("❌ Error updating device:", error);
      alert("Failed to update device. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] bg-gradient-to-b from-background to-muted/30 text-foreground p-4">
      <Card className="w-full max-w-2xl shadow-lg border border-border/60 bg-card/90 backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center space-y-2 pb-2">
          <Settings2 className="h-7 w-7 text-primary" />
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Edit Device & Configuration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update device details and configuration parameters
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* DEVICE DETAILS */}
            <div className="rounded-xl border border-border/70 bg-muted/30 p-5 shadow-inner">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Device Details</h2>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Device Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={deviceDetails.name}
                    onChange={(e) => setDeviceDetails({ ...deviceDetails, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={deviceDetails.description}
                    onChange={(e) => setDeviceDetails({ ...deviceDetails, description: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Protocol</Label>
                  <Select
                    value={deviceDetails.protocol}
                    onValueChange={(value) => setDeviceDetails({ ...deviceDetails, protocol: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ModbusTCP">ModbusTCP</SelectItem>
                      <SelectItem value="ModbusRTU">ModbusRTU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* CONFIGURATION */}
            <div className="rounded-xl border border-border/70 bg-muted/30 p-5 shadow-inner">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Configuration Details</h2>
              </div>

              <div className="grid gap-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>IP Address</Label>
                    <Input
                      name="IpAddress"
                      value={formData.protocolSettings.IpAddress}
                      onChange={handleProtocolChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Port</Label>
                    <Input
                      name="Port"
                      type="number"
                      value={formData.protocolSettings.Port}
                      onChange={handleProtocolChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Slave ID</Label>
                    <Input
                      name="SlaveId"
                      type="number"
                      value={formData.protocolSettings.SlaveId}
                      onChange={handleProtocolChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Endian</Label>
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
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-between items-center pt-4 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/devices")}
              >
                <ArrowLeft className="h-4 w-4" /> Back to Devices
              </Button>

              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4" /> {loading ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
