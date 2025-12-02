// src/pages/MapDeviceToAsset.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import apiAsset from "@/api/axiosAsset";
import { match_by_regAddress } from "@/api/deviceApi";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ---------------------- Types ----------------------
interface AssetConfig {
  assetConfigID: string;
  signalTypeID: string;
  signalName: string;
  signalUnit: string;
  // backend has inconsistent names, allow either
  regsiterAdress?: number | string;
  registerAdress?: number | string;
  registerAddress?: number | string;
}

interface MatchedRegister {
  registerId: string;
  registerAddress: number;
  registerLength: number;
  dataType: string;
  isHealthy: boolean;
  scale: number;
  unit?: string | null;
}

interface MatchedSlave {
  deviceSlaveId: string;
  slaveIndex: number;
  isHealthy: boolean;
  matchedRegisters: MatchedRegister[];
}

interface MatchedDevice {
  deviceId: string;
  name?: string | null;
  description?: string | null;
  protocol?: string | null;
  matchedSlaves: MatchedSlave[];
}

interface MatchResponse {
  success: boolean;
  data: MatchedDevice[];
  error?: any;
}

interface MappingRequest {
  assetId: string;
  deviceId: string;
  devicePortId: string;
  registers: { registerAddress: number; signalTypeId: string }[];
}

interface ExistingMapping {
  mappingId: string;
  assetId: string;
  signalTypeId: string;
  deviceId: string;
  devicePortId: string;
  signalUnit?: string;
  signalName?: string;
  // backend inconsistent naming again
  registerAdress?: number;
  registerAddress?: number;
  createdAt?: string;
}

type Params = { assetid?: string };

interface ModalState {
  open: boolean;
  device?: MatchedDevice;
  slave?: MatchedSlave;
}

// ---------------------- Component ----------------------
export default function MapDeviceToAsset() {
  const { assetid } = useParams<Params>();
  const navigate = useNavigate();

  const [assetConfigs, setAssetConfigs] = useState<AssetConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);

  // keep ALL mappings from the server (for "mapped to any asset" checks)
  const [allMappings, setAllMappings] = useState<ExistingMapping[]>([]);
  // keep mappings filtered to current asset (for "mapped to this asset" checks & rendering)
  const [assetMappings, setAssetMappings] = useState<ExistingMapping[]>([]);

  const [mappingLoading, setMappingLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [modalState, setModalState] = useState<ModalState>({ open: false });
  const [selectedRegisters, setSelectedRegisters] = useState<Set<number>>(new Set());

  // unlink flow
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletedMapId, setDeletedMapId] = useState<string | null>(null);

  // ---------------------- Load Data ----------------------
  const loadAll = useCallback(async (): Promise<void> => {
    if (!assetid) return;
    setLoading(true);
    try {
      const assetResp = await apiAsset.get<AssetConfig[]>(`/AssetConfig/${assetid}`);
      const assetData = Array.isArray(assetResp.data) ? assetResp.data : [];

      if (!assetData || assetData.length === 0) {
        toast.info("First assign the signals, then map the device");
        navigate(-1);
        return;
      }
      setAssetConfigs(assetData);

      // --- mappings: load ALL mappings, then filter to this asset separately ---
      const mappingsResp = await apiAsset.get<ExistingMapping[]>(`/Mapping`);
      const mappingsData = Array.isArray(mappingsResp.data) ? mappingsResp.data : [];
      setAllMappings(mappingsData);
      const mappingsForThisAsset = mappingsData.filter((m) => String(m.assetId) === String(assetid));
      setAssetMappings(mappingsForThisAsset);

      // Normalize reading register addresses from asset config (handle backend spelling differences)
      const registerAddresses = assetData
        .map((c) => {
          const raw = (c as any).regsiterAdress ?? (c as any).registerAdress ?? (c as any).registerAddress;
          return Number(raw);
        })
        .filter((v) => !Number.isNaN(v));

      if (registerAddresses.length === 0) {
        setMatchResult({ success: true, data: [] });
        return;
      }

      const matchResp = await match_by_regAddress({ registerAddresses });
      setMatchResult(matchResp.data ?? { success: true, data: [] });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [assetid, navigate]);

  useEffect(() => {
    if (!assetid) return;
    void loadAll();
  }, [assetid, loadAll]);

  // ---------------------- Helpers ----------------------
  // mappingsSet keyed by `${assetId}|${signalTypeId}` for THIS asset (normalize to strings)
  const mappingsSet = useMemo(() => {
    const s = new Set<string>();
    for (const m of assetMappings) {
      if (m.assetId && m.signalTypeId) {
        s.add(`${String(m.assetId)}|${String(m.signalTypeId)}`);
      }
    }
    return s;
  }, [assetMappings]);

  // mappedSignalTypes: set of all signalTypeIds that are already mapped to any asset
  const mappedSignalTypes = useMemo(() => {
    const s = new Set<string>();
    for (const m of allMappings) {
      if (m.signalTypeId) s.add(String(m.signalTypeId));
    }
    return s;
  }, [allMappings]);

  // Build register -> asset config map BEFORE devicesForRender (fixes reference error)
  const registerToAssetMap = useMemo(() => {
    const map = new Map<number, AssetConfig>();
    for (const a of assetConfigs || []) {
      const raw = (a as any).regsiterAdress ?? (a as any).registerAdress ?? (a as any).registerAddress;
      const key = Number(raw);
      if (!Number.isNaN(key)) map.set(key, a);
    }
    return map;
  }, [assetConfigs]);

  // devicesForRender: show devices that have at least one register whose signalType is not already mapped for this asset
  const devicesForRender = useMemo(() => {
    if (!matchResult?.data) return [];
    return matchResult.data.filter((device) =>
      device.matchedSlaves?.some((slave) =>
        slave.matchedRegisters?.some((r) => {
          const assetCfg = registerToAssetMap.get(Number(r.registerAddress));
          const signalTypeId = assetCfg?.signalTypeID;
          // available if there is a matching asset signal AND that asset+signal is not already mapped (for this asset)
          return !!signalTypeId && !mappingsSet.has(`${String(assetid)}|${String(signalTypeId)}`);
        })
      )
    );
  }, [matchResult, mappingsSet, registerToAssetMap, assetid]);

  // mapping lookup by signalTypeID for rendering asset configs -> connected devices/ports (for current asset)
  const mappingLookup = useMemo(() => {
    // build device name map from matchResult
    const deviceNameById = new Map<string, string | undefined>();
    (matchResult?.data ?? []).forEach((d) => deviceNameById.set(d.deviceId, d.name));

    const map = new Map<string, ExistingMapping[]>();
    for (const m of assetMappings) {
      if (!m.signalTypeId) continue;
      const key = String(m.signalTypeId);
      const arr = map.get(key) ?? [];
      arr.push(m);
      map.set(key, arr);
    }

    // attach deviceName for convenience
    const result = new Map<string, { mapping: ExistingMapping; deviceName?: string }[]>();
    for (const [sig, arr] of map.entries()) {
      result.set(
        sig,
        arr.map((m) => ({ mapping: m, deviceName: deviceNameById.get(m.deviceId) }))
      );
    }

    return result;
  }, [assetMappings, matchResult]);

  function prettyUnit(u?: string | null) {
    return u ? ` ${u}` : "";
  }

  // ---------------------- Delete mapping (unlink) ----------------------
  const handleUnlinkClick = (mappingId: string) => {
    setDeletedMapId(mappingId);
    setShowConfirm(true);
  };

  const confirmUnlink = async () => {
    setShowConfirm(false);
    if (!deletedMapId) return;
    setIsDeleting(true);
    try {
      await apiAsset.delete(`/deletemap/${deletedMapId}`);
      toast.success("Mapping deleted successfully");
      // refresh both mappings and matches
      await loadAll();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete mapping");
    } finally {
      setIsDeleting(false);
      setDeletedMapId(null);
    }
  };

  const cancelUnlink = () => {
    setShowConfirm(false);
    setDeletedMapId(null);
  };

  // ---------------------- Mapping create ----------------------
  async function createMappingForSelected(registers: MatchedRegister[], device: MatchedDevice, slave: MatchedSlave) {
    if (!assetid) return;

    const payload: MappingRequest = {
      assetId: assetid,
      deviceId: device.deviceId,
      devicePortId: slave.deviceSlaveId,
      registers: registers
        .map((r) => {
          const signal = registerToAssetMap.get(Number(r.registerAddress));
          if (!signal) return null;
          return { registerAddress: r.registerAddress, signalTypeId: signal.signalTypeID };
        })
        .filter((x): x is { registerAddress: number; signalTypeId: string } => x !== null),
    };

    if (payload.registers.length === 0) {
      toast.error("No valid registers selected (they must be linked to asset signals).");
      return;
    }

    setMappingLoading(true);
    try {
      await apiAsset.post("/Mapping", payload);
      toast.success("Mapping created successfully");
      await loadAll();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Mapping failed");
    } finally {
      setMappingLoading(false);
      closeModal();
    }
  }

  // ---------------------- Modal ----------------------
  const isModalOpen = Boolean(modalState.open && modalState.slave && modalState.device);

  // reset selectedRegisters when opening modal
  useEffect(() => {
    if (isModalOpen) setSelectedRegisters(new Set());
  }, [isModalOpen]);

  function toggleRegister(addr: number) {
    setSelectedRegisters((prev) => {
      const copy = new Set(prev);
      if (copy.has(addr)) copy.delete(addr);
      else copy.add(addr);
      return copy;
    });
  }

  function handleSubmitModal() {
    if (!modalState.device || !modalState.slave) return;
    const regsToMap = modalState.slave.matchedRegisters.filter((r) => selectedRegisters.has(r.registerAddress));
    createMappingForSelected(regsToMap, modalState.device, modalState.slave);
  }

  function closeModal() {
    setModalState({ open: false, device: undefined, slave: undefined });
    setSelectedRegisters(new Set());
  }

  // ---------------------- Render ----------------------
  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Asset Mapper</h1>
          <p className="text-sm text-slate-600 mt-1">Map assets to device slaves for asset</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadAll()}>
            Refresh
          </Button>
          <Button size="sm" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Asset Configs */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Asset Configs</CardTitle>
              <CardDescription>Registers defined for this asset.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Signal</TableHead>
                      <TableHead>connection</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assetConfigs.length ? (
                      assetConfigs.map((c) => {
                        const mappings = mappingLookup.get(c.signalTypeID) ?? [];
                        const isConnected = mappings.length > 0;

                        return (
                          <TableRow key={c.assetConfigID}>
                            <TableCell>
                              <div className={`p-2 rounded ${isConnected ? "bg-green-300 border  border-green-100" : "bg-transparent"}`}>
                                <div className="font-medium">{c.signalName}</div>
                                {/* <div className="text-xs text-slate-500">Addr: {c.regsiterAdress ?? c.registerAdress ?? c.registerAddress}</div> */}
                              </div>
                            </TableCell>

                            <TableCell>
                              {isConnected ? (
                                <div className="flex flex-col">
                                  <Badge className="w-fit" variant="outline">Connected</Badge>
                                  <div className="mt-1 text-xs">
                                    {mappings.map(({ mapping, deviceName }, idx) => (
                                      <div key={mapping.mappingId} className="mt-1 flex items-center justify-between gap-4">
                                        <div>
                                          <div className="font-mono text-sm">Device: {deviceName}</div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="border"
                                            onClick={() => handleUnlinkClick(mapping.mappingId)}
                                            disabled={isDeleting}
                                          >
                                            Un-Map
                                          </Button>
                                        </div>
                                      </div>
                                    ))}

                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-slate-500">Not connected</div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-slate-500">
                          No asset configs found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Matched Devices */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Matched Devices / Slaves</CardTitle>
              <CardDescription>Matches returned from the device matching service.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-4">
                {devicesForRender.length ? (
                  devicesForRender.map((device) => (
                    <div key={device.deviceId} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{device.name}</div>
                          <div className="text-xs text-slate-500">Protocol: {device.protocol}</div>
                        </div>
                        <div className="text-sm text-slate-600">Slaves: {device.matchedSlaves?.length ?? 0}</div>
                      </div>

                      <div className="mt-3 border-t pt-3 space-y-2">
                        {device.matchedSlaves?.map((slave) => {
                          // slaveFullyMapped = true when ALL registers' asset signal types are already mapped for this asset
                          const slaveFullyMapped = (slave.matchedRegisters ?? []).every((r) => {
                            const assetCfg = registerToAssetMap.get(Number(r.registerAddress));
                            const sigId = assetCfg?.signalTypeID;
                            return !sigId ? false : mappingsSet.has(`${String(assetid)}|${String(sigId)}`);
                          });

                          return (
                            <div key={slave.deviceSlaveId} className="p-2 rounded-md bg-slate-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="text-sm font-medium">Slave #{slave.slaveIndex}</div>
                                  <Badge variant={slave.isHealthy ? "outline" : "destructive"}>
                                    {slave.isHealthy ? "Healthy" : "Unhealthy"}
                                  </Badge>
                                  {slaveFullyMapped && <Badge variant="secondary">Already mapped</Badge>}
                                </div>

                                <div>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setModalState({ open: true, device, slave });
                                    }}
                                    disabled={mappingLoading || slaveFullyMapped}
                                  >
                                    Map
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500">No matches found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Modal */}
      {isModalOpen && modalState.slave && modalState.device && (
        <Dialog open={true} onOpenChange={closeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Registers to Map</DialogTitle>
            </DialogHeader>

            <div className="space-y-2 mt-2 max-h-80 overflow-y-auto">
              {modalState.slave.matchedRegisters.map((r) => {
                const matchingAsset = registerToAssetMap.get(Number(r.registerAddress));
                const signalTypeId = matchingAsset?.signalTypeID;
                const nothealthy = !r.isHealthy;

                // 1️⃣ Mapped for THIS asset
                const alreadyMapped =
                  !!signalTypeId &&
                  mappingsSet.has(`${String(assetid)}|${String(signalTypeId)}`);

                // 2️⃣ Mapped for ANY asset (including this one)
                const mappedToAnyAsset = !!signalTypeId && mappedSignalTypes.has(String(signalTypeId));

                // Final condition: disable if mapped to any asset OR no signal type OR unhealthy
                const disableCheckbox =
                  alreadyMapped || mappedToAnyAsset || !signalTypeId || nothealthy;

                return (
                  <div
                    key={r.registerId}
                    className={`flex items-center justify-between border p-2 rounded ${disableCheckbox ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div>
                      <div className="font-mono">{r.registerAddress}</div>

                      <div className="text-xs text-slate-500">
                        {matchingAsset?.signalName ?? "No asset signal"} {matchingAsset?.signalUnit ?? ""}
                      </div>
                      <div className={r.isHealthy ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
                        {r.isHealthy === true ? "Healthy" : "Un-Healthy"}</div>

                    </div>
                    <Checkbox
                      disabled={disableCheckbox}
                      checked={selectedRegisters.has(r.registerAddress)}
                      onCheckedChange={() => toggleRegister(r.registerAddress)}
                    />
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button onClick={handleSubmitModal} disabled={selectedRegisters.size === 0 || mappingLoading}>
                Map Selected
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={showConfirm}
        title="Unlink Device Port?"
        description="Are you sure you want to unlink this device port from the asset signal?"
        onCancel={cancelUnlink}
        onConfirm={confirmUnlink}
      />
    </div>
  );
}

// ConfirmDialog component (typed)
type ConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
};

function ConfirmDialog({ open, onConfirm, onCancel, title, description }: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(val) => { if (!val) onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
