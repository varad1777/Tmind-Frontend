import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { type Asset } from "@/types/asset";
import apiAsset from "@/api/axiosAsset";
import { toast } from "react-toastify";

interface ConfigureAssetProps {
  asset: Asset;
  onClose: () => void;
}

// Signals extracted from the table image you provided
const SIGNALS = [
  { id: "6b32d08c-f0ff-4d3a-b357-0ba8be47b939", name: "Temperature", unit: "°C", register: 40001 },
  { id: "0b1a070d-61d6-46b2-a2b0-480a28d7c3f9", name: "Pressure", unit: "kPa", register: 40003 },
  { id: "8a8aeeff-ccc1-4777-ab0a-b5bbad72431c", name: "Voltage", unit: "V", register: 40005 },
  { id: "916a0a0a-ebb2-424a-9905-bcff737c8c62", name: "Current", unit: "A", register: 40007 },
  { id: "808df995-8b31-48a9-9086-1f5d6691c4f9", name: "RPM", unit: "rpm", register: 40013 },
  { id: "835cbb32-9b02-4122-8533-05f6ace3a6d4", name: "Flow", unit: "L/min", register: 40009 },
  { id: "99bfe26d-1691-441f-aa8f-036aa415b0a8", name: "Vibration", unit: "mm/s", register: 40011 },
];


export default function ConfigureAsset({ asset, onClose }: ConfigureAssetProps) {
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSignal = (id: string) => {
    if (selectedSignals.includes(id)) {
      setSelectedSignals(selectedSignals.filter(s => s !== id));
      return;
    }
    if (selectedSignals.length >= 3) {
      alert("You can select up to 3 signals.");
      return;
    }
    setSelectedSignals(prev => [...prev, id]);
  };

  const handleSave = async () => {
    if (selectedSignals.length === 0) {
      toast.error("Please select at least one signal.");
      return;
    }

    console.log(asset.assetId);
    

    const payload = {
      assetId: asset.assetId,
      signals: selectedSignals,
    };

    try {
      setLoading(true);
      const res = await apiAsset.post("/AssetConfig", payload);

      // axios will throw for non-2xx, but still good to check:
      if (res.status < 200 || res.status >= 300) {
        throw new Error(`HTTP ${res.status}`);
      }

      toast.success("Signals configured successfully.");
      onClose();
    } catch (err: any) {
      console.error("Failed to save asset config:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        String(err);
      toast.error("Failed to configure signals: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[999] bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[720px] max-w-[95%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{asset.name} - Configure</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X />
          </Button>
        </div>

        {/* Show uploaded table image for quick reference */}
        <div className="mb-4">
          {/* local file path you provided (we kept it) */}
          <img
            src="/mnt/data/143cfb69-d657-412d-9494-e9d44d72b03b.png"
            alt="signals-table"
            className="w-full rounded-md border"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* left: signals table */}
          <div>
            <p className="mb-2 font-medium">Available signals (select up to 3):</p>
            <div className="space-y-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Unit</th>
                    <th className="pb-2">Register</th>
                    <th className="pb-2">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {SIGNALS.map(s => (
                    <tr key={s.id} className="border-t">
                      <td className="py-2">{s.name}</td>
                      <td className="py-2">{s.unit}</td>
                      <td className="py-2">{s.register}</td>
                      <td className="py-2">
                        <button
                          onClick={() => toggleSignal(s.id)}
                          className={`px-3 py-1 rounded-full text-sm border ${selectedSignals.includes(s.id) ? "bg-slate-800 text-white" : "bg-transparent"}`}
                        >
                          {selectedSignals.includes(s.id) ? "Selected" : "Add"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* right: selection preview */}
          <div>
            <p className="mb-2 font-medium">Selected signals ({selectedSignals.length}/3):</p>
            <div className="space-y-2">
              {selectedSignals.length === 0 && <div className="text-sm text-slate-500">No signals selected.</div>}

              {selectedSignals.map(id => {
                const s = SIGNALS.find(x => x.id === id)!;
                return (
                  <div key={id} className="flex items-center justify-between border rounded-md p-2">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.unit} — Register: {s.register}</div>
                    </div>
                    <div>
                      <button onClick={() => toggleSignal(id)} className="text-sm underline">Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
