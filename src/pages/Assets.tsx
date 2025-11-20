import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AssetTree } from "@/asset/AssetTree";
import { type Asset } from "@/types/asset";
import { Button } from "@/components/ui/button";
import AssetDetails from "@/asset/AssetDetails";
import { getAssetHierarchy } from "@/api/assetApi";
import { transformHierarchy } from "@/asset/mapBackendToFrontend";

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const backendData = await getAssetHierarchy();
      const mapped = transformHierarchy(backendData);

      setAssets(mapped);
    } catch (e) {
      console.error("Failed to load assets", e);
    } finally {
      setLoading(false);
    }
  };

  const onEdit = () => {
    if (!selectedAsset) return;
    navigate(`/assets/edit/${selectedAsset.id}`);
  };
  const onAddChild = () => {
    if (!selectedAsset) return;
    navigate(`/assets/add?parentId=${selectedAsset.id}`);
  };
  const onDelete = () => {
    if (!selectedAsset) return;
    alert("Soft delete triggered (dummy)");
  };
  const onRestore = () => {
    if (!selectedAsset) return;
    alert("Restore triggered (dummy)");
  };
  const onAssignDevice = () => {
    if (!selectedAsset) return;
    navigate(`/assets/assign-device/${selectedAsset.id}`);
  };

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Asset Hierarchy</h1>
          <p className="text-sm text-muted-foreground">
            Explore structure of plants, departments, machines & sub-machines.
          </p>
        </div>

        <Button
          onClick={() => navigate("/assets/add")}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          + Import Bulk
        </Button>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* LEFT: Asset Tree */}
        <div className="col-span-12 lg:col-span-5">
          <Card className="glass-card h-[600px] flex flex-col">
            <CardContent className="p-2 flex-1 overflow-auto">
              {loading ? (
                <p className="text-muted-foreground p-2">Loading...</p>
              ) : (
                <AssetTree
                  assets={assets}
                  selectedId={selectedAsset?.id || null}
                  onSelect={setSelectedAsset}
                  onAddRoot={() => navigate("/assets/add")}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Asset Details */}
        <div className="col-span-12 lg:col-span-7">
          <Card className="glass-card h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Asset Details</CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex-1 overflow-auto">
              <AssetDetails
                selectedAsset={selectedAsset}
                onEdit={onEdit}
                onAddChild={onAddChild}
                onDelete={onDelete}
                onRestore={onRestore}
                onAssignDevice={onAssignDevice}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
    </div>
  );
}