import React, { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { type Asset } from "@/types/asset";
import { AssetTree } from "@/asset/AssetTree";
import { getAssetHierarchy } from "@/api/assetApi";
import { mapBackendAsset } from "@/asset/mapBackendAsset";

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
      const res = await getAssetHierarchy();
      setAssets(res.map(mapBackendAsset));
    } catch (e) {
      console.error("Failed to load assets", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Asset Hierarchy</h1>
          <p className="text-muted-foreground">
            Explore Departments → Lines → Machines → SubMachines
          </p>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* LEFT TREE */}
        <Card>
          <CardHeader>
            <CardTitle>Hierarchy Tree</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <p className="p-3 text-muted-foreground">Loading...</p>
            ) : (
              <AssetTree
                assets={assets}
                selectedId={selectedAsset?.id || null}
                onSelect={setSelectedAsset}
              />
            )}
          </CardContent>
        </Card>

        {/* RIGHT DETAILS */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
          </CardHeader>

          <CardContent>
            {!selectedAsset ? (
              <p className="text-muted-foreground">Select an asset</p>
            ) : (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">{selectedAsset.name}</h2>

                <p>
                  <strong>Type:</strong> {selectedAsset.type}
                </p>

                <p>
                  <strong>Level:</strong> {selectedAsset.depth}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {selectedAsset.isDeleted ? "Deleted" : "Active"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
