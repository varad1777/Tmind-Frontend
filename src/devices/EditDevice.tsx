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

export default function EditDeviceForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [device, setDevice] = useState({
    name: "",
    description: "",
    protocol: "ModbusRTU",
  });

  const [configuration, setConfiguration] = useState({
    name: "",
    pollIntervalMs: "",
    IpAddress: "127.0.0.1",
    Port: 5020,
    SlaveId: 1,
    Endian: "Little",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock data for demo purpose
    const mockData = {
      device: {
        name: "dev",
        description: "This is dev",
        protocol: "ModbusTCP",
      },
      configuration: {
        name: "line 1 modbus",
        pollIntervalMs: 1500,
        protocolSettingsJson:
          '{"IpAddress":"127.0.0.1","Port":5020,"SlaveId":1,"Endian":"Little"}',
      },
    };

    const parsed = JSON.parse(mockData.configuration.protocolSettingsJson);

    setDevice(mockData.device);
    setConfiguration({
      name: mockData.configuration.name,
      pollIntervalMs: mockData.configuration.pollIntervalMs,
      IpAddress: parsed.IpAddress,
      Port: parsed.Port,
      SlaveId: parsed.SlaveId,
      Endian: parsed.Endian,
    });
  }, [id]);

  const handleDeviceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDevice({ ...device, [e.target.name]: e.target.value });
  };

  const handleConfigurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfiguration({ ...configuration, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setDevice({ ...device, protocol: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Convert protocol fields to JSON string
    const protocolSettingsJson = JSON.stringify(
      {
        IpAddress: configuration.IpAddress,
        Port: Number(configuration.Port),
        SlaveId: Number(configuration.SlaveId),
        Endian: configuration.Endian,
      },
      null,
      2
    );

    const finalPayload = {
      device,
      configuration: {
        name: configuration.name,
        pollIntervalMs: Number(configuration.pollIntervalMs),
        protocolSettingsJson,
      },
    };

    console.log("Final JSON for backend:", finalPayload);

    setTimeout(() => {
      setLoading(false);
      navigate("/devices");
    }, 800);
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] bg-gradient-to-b from-background to-muted/30 text-foreground transition-colors duration-300 p-4">
      <Card className="w-full max-w-2xl shadow-lg border border-border/60 bg-card/90 backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center space-y-2 pb-2">
          <Settings2 className="h-7 w-7 text-primary" />
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Edit Device & Configuration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update device details and related configuration parameters
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* DEVICE SECTION */}
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
                    value={device.name}
                    onChange={handleDeviceChange}
                    placeholder="Enter device name"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={device.description}
                    onChange={handleDeviceChange}
                    placeholder="Enter short description"
                  />
                </div>

                <div className="grid gap-2">
                <Label>Protocol</Label>
                <Select
                  value={device.protocol}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select protocol" />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-foreground">
                    <SelectItem value="ModbusRTU">ModbusRTU</SelectItem>
                    {/* <SelectItem value="ModbusTCP">ModbusTCP</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
              </div>
            </div>

            {/* CONFIGURATION SECTION */}
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
                    name="name"
                    type="text"
                    value={configuration.name}
                    onChange={handleConfigurationChange}
                    placeholder="e.g. Line 1 Config"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pollIntervalMs">Poll Interval (ms)</Label>
                  <Input
                    id="pollIntervalMs"
                    name="pollIntervalMs"
                    type="number"
                    value={configuration.pollIntervalMs}
                    onChange={handleConfigurationChange}
                    placeholder="e.g. 1500"
                  />
                </div>

                {/* Protocol Structured Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>IP Address</Label>
                    <Input
                      name="IpAddress"
                      value={configuration.IpAddress}
                      onChange={handleConfigurationChange}
                      placeholder="127.0.0.1"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Port</Label>
                    <Input
                      name="Port"
                      type="number"
                      value={configuration.Port}
                      onChange={handleConfigurationChange}
                      placeholder="5020"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Slave ID</Label>
                    <Input
                      name="SlaveId"
                      type="number"
                      value={configuration.SlaveId}
                      onChange={handleConfigurationChange}
                      placeholder="1"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Endian</Label>
                    <Input
                      name="Endian"
                      value={configuration.Endian}
                      onChange={handleConfigurationChange}
                      placeholder="Little / Big"
                    />
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
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Devices
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
