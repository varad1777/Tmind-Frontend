import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Save, X, Edit2, Trash2, Database, Loader, Settings2, Cable } from "lucide-react";
import toast from "react-hot-toast";

export type RegisterPayload = {
  registerId?: string;
  registerAddress: number;
  registerLength: number;
  dataType: string;
  scale: number;
  unit?: string | null;
  isHealthy: boolean;
  byteOrder?: "Big" | "Little" | null;
  wordSwap?: boolean;
};

export type PortData = {
  devicePortId?: string;
  portIndex: number;
  registers: RegisterPayload[];
  isHealthy: boolean;
};

const defaultRegister: RegisterPayload = {
  registerAddress: 40001,
  registerLength: 2,
  dataType: "float32",
  scale: 1.0,
  unit: null,
  isHealthy: true,
  byteOrder: "Big",
  wordSwap: false,
};

export default function ModbusPortManager() {
  const [ports, setPorts] = useState<PortData[]>([]);
  const [selectedPortIndex, setSelectedPortIndex] = useState<number | null>(null);
  const [editingRegisterIdx, setEditingRegisterIdx] = useState<number | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterPayload>({ ...defaultRegister });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const params = useParams<{ id?: string }>();
  const deviceId = params.id;

  const selectedPort = ports.find(p => p.portIndex === selectedPortIndex) ?? null;

  const updateRegisterForm = <K extends keyof RegisterPayload>(key: K, value: RegisterPayload[K]) => {
    setRegisterForm(prev => ({ ...prev, [key]: value }));
    setError(null);
  };

  const loadPorts = useCallback(async () => {
    if (!deviceId) return;
    try {
      const res = await api.get(`/devices/${deviceId}/ports`);
      const arr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const mapped: PortData[] = (arr || []).map((p: any) => ({
        devicePortId: p.devicePortId ?? undefined,
        portIndex: p.portIndex,         
        isHealthy: p.isHealthy ?? true,
        registers: (p.registers || []).map((r: any) => ({
          registerId: r.registerId ?? undefined,
          registerAddress: r.registerAddress,
          registerLength: r.registerLength,
          dataType: r.dataType,
          scale: r.scale,
          unit: r.unit ?? null,
          isHealthy: r.isHealthy ?? true,
          byteOrder: r.byteOrder ?? null,
          wordSwap: !!r.wordSwap
        }))
      }));
      const sorted = [...mapped].sort((a, b) => b.portIndex - a.portIndex);
      setPorts(sorted);
      if (sorted.length > 0 && selectedPortIndex === null) {
        setSelectedPortIndex(sorted[0].portIndex);
      }
    } catch (err) {
      console.error("Failed to load ports", err);
    }
  }, [deviceId, selectedPortIndex]);

  useEffect(() => {
    loadPorts();
  }, [deviceId, loadPorts]);

  const validateRegister = (reg: RegisterPayload, currentRegisters: RegisterPayload[]) => {
    if (!Number.isInteger(reg.registerAddress) || reg.registerAddress < 0 || reg.registerAddress > 65535)
      return "Address must be between 0-65535";
    if (!Number.isInteger(reg.registerLength) || reg.registerLength < 1 || reg.registerLength > 10)
      return "Length must be between 1-10";
    if (!reg.dataType?.trim()) return "Data type is required";
    if (!(reg.scale > 0)) return "Scale must be greater than 0";

    const duplicate = currentRegisters.some((r, idx) =>
      idx !== editingRegisterIdx && r.registerAddress === reg.registerAddress
    );
    if (duplicate) return "Register address already exists in this port";

    return null;
  };

  const handleSaveRegister = () => {
    if (!selectedPort) return;
    const validationError = validateRegister(registerForm, selectedPort.registers);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setPorts(prev =>
      prev.map(port => {
        if (port.portIndex !== selectedPort.portIndex) return port;

        let updatedRegisters: RegisterPayload[];
        if (editingRegisterIdx !== null) {
          updatedRegisters = port.registers.map((r, idx) =>
            idx === editingRegisterIdx ? { ...registerForm } : r
          );
          toast.success("Register updated locally, please save to persist");
        } else {
          updatedRegisters = [...port.registers, { ...registerForm }];
          toast.success("Register added locally, please save to persist");
        }

        return { ...port, registers: updatedRegisters };
      })
    );

    setRegisterForm({ ...defaultRegister });
    setEditingRegisterIdx(null);
    setShowRegisterForm(false);
    setError(null);
  };

  const handleDeleteRegister = (idx: number) => {
    if (!selectedPort) return;
    const updated = ports.map(port =>
      port.portIndex === selectedPort.portIndex
        ? { ...port, registers: port.registers.filter((_, i) => i !== idx) }
        : port
    );
    setPorts(updated);
    toast.success("Register deleted locally, please save to persist");
  };

  const handleEditRegister = (idx: number) => {
    if (!selectedPort) return;
    setRegisterForm({ ...selectedPort.registers[idx] });
    setEditingRegisterIdx(idx);
    setShowRegisterForm(true);
  };

  const handleAddNewPort = () => {
    const newPortIndex = ports.length > 0 ? Math.max(...ports.map(p => p.portIndex)) + 1 : 0;
    const newPort: PortData = { portIndex: newPortIndex, registers: [], isHealthy: true };

    setPorts(prev => [...prev, newPort]);
    setSelectedPortIndex(newPortIndex);
    setShowRegisterForm(false);
    toast.success("New port created locally, please add registers now");
  };

  const buildPayload = (port: PortData) => {
    return {
      portIndex: port.portIndex,
      isHealthy: port.isHealthy,
      registers: port.registers.map(r => ({
        registerAddress: r.registerAddress,
        registerLength: r.registerLength,
        dataType: r.dataType,
        scale: r.scale,
        unit: r.unit,
        isHealthy: r.isHealthy,
        byteOrder: r.byteOrder,
        wordSwap: r.wordSwap
      }))
    };
  };

  const saveCurrentPort = async () => {
    if (!selectedPort || !deviceId) return;

    const payload = buildPayload(selectedPort);
    setIsSaving(true);

    try {
      if (selectedPort.devicePortId) {
        await api.put(`/devices/${deviceId}/ports/${selectedPort.portIndex}`, payload);
        toast.success("Port updated on server");
      } else {
        await api.post(`/devices/${deviceId}/ports`, payload);
        toast.success("Port created on server");
      }

      await loadPorts();
    } catch (err: any) {
      console.error("Failed to save port", err);
      toast.error(err?.response?.data?.error || err?.message || "Failed to save port");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelRegisterForm = () => {
    setRegisterForm({ ...defaultRegister });
    setEditingRegisterIdx(null);
    setShowRegisterForm(false);
    setError(null);
  };

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 2000);
    return () => clearTimeout(t);
  }, [success]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
              <Cable className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Port Manager</h1>
              <p className="text-xs text-slate-500">Modbus Configuration</p>
            </div>
          </div>
          <Button 
            onClick={handleAddNewPort} 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Port
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Ports Sidebar */}
         <div className="grid grid-cols-2 gap-3 p-3 max-h-96 overflow-y-auto">
  {ports.length === 0 ? (
    <div className="p-8 text-center col-span-2">
      <Database className="w-10 h-10 mx-auto text-slate-300 mb-2" />
      <p className="text-xs text-slate-500">No ports yet</p>
    </div>
  ) : (
    ports.map(port => (
      <button
        key={port.portIndex}
        onClick={() => {
          setSelectedPortIndex(port.portIndex);
          setShowRegisterForm(false);
          setEditingRegisterIdx(null);
          setRegisterForm({ ...defaultRegister });
          setError(null);
        }}
        className={`p-4 text-left rounded-xl border transition-all ${
          selectedPortIndex === port.portIndex
            ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-600"
            : "hover:bg-slate-50 border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm">
              Port {port.portIndex}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {port.registers.length} registers
            </p>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${
              port.isHealthy ? "bg-emerald-500" : "bg-red-500"
            }`}
          ></div>
        </div>
      </button>
    ))
  )}
</div>


          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedPort ? (
              <div className="space-y-6">
                {/* Port Header Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Settings2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Port {selectedPort.portIndex}</h2>
                        <p className="text-sm text-slate-500">Configuration</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                      selectedPort.isHealthy 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {selectedPort.isHealthy ? "Healthy" : "Unhealthy"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!showRegisterForm && (
                      <Button 
                        onClick={() => setShowRegisterForm(true)} 
                        variant="outline" 
                        className="border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Register
                      </Button>
                    )}
                    <Button 
                      onClick={saveCurrentPort} 
                      disabled={isSaving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Port
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Register Form */}
                {showRegisterForm && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-900">
                        {editingRegisterIdx !== null ? "Edit Register" : "Add Register"}
                      </h3>
                      <button onClick={cancelRegisterForm} className="p-1 hover:bg-slate-100 rounded-lg transition">
                        <X className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Register Address</Label>
                        <Input 
                          type="number" 
                          value={registerForm.registerAddress} 
                          min={0} 
                          max={65535}
                          onChange={(e) => updateRegisterForm("registerAddress", Number(e.target.value))}
                          className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Register Length</Label>
                        <Input 
                          type="number" 
                          value={registerForm.registerLength} 
                          min={1} 
                          max={10}
                          onChange={(e) => updateRegisterForm("registerLength", Number(e.target.value))}
                          className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Data Type</Label>
                        <Select value={registerForm.dataType} onValueChange={(v) => updateRegisterForm("dataType", v)}>
                          <SelectTrigger className="rounded-xl border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="int16">int16</SelectItem>
                            <SelectItem value="uint16">uint16</SelectItem>
                            <SelectItem value="int32">int32</SelectItem>
                            <SelectItem value="uint32">uint32</SelectItem>
                            <SelectItem value="float32">float32</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Scale Factor</Label>
                        <Input 
                          type="number" 
                          step={0.01} 
                          value={registerForm.scale} 
                          onChange={(e) => updateRegisterForm("scale", Number(e.target.value))}
                          className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Unit</Label>
                        <Select value={registerForm.unit ?? "__none"} onValueChange={(v) => updateRegisterForm("unit", v === "__none" ? null : v)}>
                          <SelectTrigger className="rounded-xl border-slate-200">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none">None</SelectItem>
                            <SelectItem value="V">V (Volts)</SelectItem>
                            <SelectItem value="A">A (Amperes)</SelectItem>
                            <SelectItem value="°C">°C (Celsius)</SelectItem>
                            <SelectItem value="Hz">Hz (Hertz)</SelectItem>
                            <SelectItem value="rpm">rpm (RPM)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Byte Order</Label>
                        <Select value={registerForm.byteOrder ?? "Big"} onValueChange={(v) => updateRegisterForm("byteOrder", v as any)}>
                          <SelectTrigger className="rounded-xl border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Big">Big Endian</SelectItem>
                            <SelectItem value="Little">Little Endian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id="wordSwap"
                          checked={!!registerForm.wordSwap} 
                          onCheckedChange={(c) => updateRegisterForm("wordSwap", !!c)}
                        />
                        <Label htmlFor="wordSwap" className="text-sm font-medium cursor-pointer">Word Swap</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id="isHealthy"
                          checked={registerForm.isHealthy} 
                          onCheckedChange={(c) => updateRegisterForm("isHealthy", !!c)}
                        />
                        <Label htmlFor="isHealthy" className="text-sm font-medium cursor-pointer">Healthy</Label>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={handleSaveRegister} 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {editingRegisterIdx !== null ? "Update Register" : "Add Register"}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={cancelRegisterForm}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Registers List */}
                {selectedPort.registers.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                    <Database className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 text-sm">No registers configured</p>
                    <p className="text-slate-400 text-xs mt-1">Add a register to get started</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Length</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Data Type</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Scale</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Byte Order</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Word Swap</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {selectedPort.registers.map((reg, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-mono font-medium text-slate-900">{reg.registerAddress}</td>
                              <td className="px-6 py-4 text-sm text-slate-700">{reg.registerLength}</td>
                              <td className="px-6 py-4 text-sm font-mono text-slate-700">{reg.dataType}</td>
                              <td className="px-6 py-4 text-sm text-slate-700">{reg.scale}</td>
                              <td className="px-6 py-4 text-sm text-slate-700">{reg.unit || "—"}</td>
                              <td className="px-6 py-4 text-sm text-slate-700">{reg.byteOrder || "—"}</td>
                              <td className="px-6 py-4 text-sm text-slate-700">{reg.wordSwap ? "Yes" : "No"}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  reg.isHealthy 
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                                    : "bg-red-100 text-red-700 border border-red-200"
                                }`}>
                                  {reg.isHealthy ? "Healthy" : "Unhealthy"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex gap-2 justify-end">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleEditRegister(idx)}
                                    className="hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleDeleteRegister(idx)}
                                    className="hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
                <Database className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600 text-lg font-semibold">Select a Port</p>
                <p className="text-slate-500 text-sm mt-2">Choose a port from the sidebar to manage its registers</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}