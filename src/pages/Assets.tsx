import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AssetTree } from "@/asset/AssetTree";
import { type Asset } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Trash2, RotateCcw, Link2 } from "lucide-react";

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: "c1",
      name: "ABC Industries Pvt Ltd",
      type: "Company",
      description: "Head manufacturing company",
      path: "ABC Industries Pvt Ltd",
      depth: 0,
      isDeleted: false,
      children: [
        {
          id: "p1",
          name: "Pune Plant",
          type: "Plant",
          description: "Automobile manufacturing plant",
          path: "ABC Industries Pvt Ltd / Pune Plant",
          depth: 1,
          isDeleted: false,
          children: [
            {
              id: "l1",
              name: "Assembly Line A",
              type: "Line",
              description: "Main car assembly line",
              path: "ABC Industries Pvt Ltd / Pune Plant / Assembly Line A",
              depth: 2,
              isDeleted: false,
              children: [
                {
                  id: "m1",
                  name: "Robot Arm A1",
                  type: "Machine",
                  description: "Welding robot",
                  path: "ABC Industries Pvt Ltd / Pune Plant / Assembly Line A / Robot Arm A1",
                  depth: 3,
                  isDeleted: false,
                  children: [],
                },
                {
                  id: "m2",
                  name: "Conveyor A2",
                  type: "Machine",
                  description: "Main conveyor system",
                  path: "ABC Industries Pvt Ltd / Pune Plant / Assembly Line A / Conveyor A2",
                  depth: 3,
                  isDeleted: false,
                  children: [],
                },
              ],
            },
            {
              id: "l2",
              name: "Paint Line B",
              type: "Line",
              description: "Car painting line",
              path: "ABC Industries Pvt Ltd / Pune Plant / Paint Line B",
              depth: 2,
              isDeleted: false,
              children: [
                {
                  id: "m3",
                  name: "Paint Robot B1",
                  type: "Machine",
                  description: "Automated painting machine",
                  path: "ABC Industries Pvt Ltd / Pune Plant / Paint Line B / Paint Robot B1",
                  depth: 3,
                  isDeleted: false,
                  children: [],
                },
              ],
            },
          ],
        },
        {
          id: "p2",
          name: "Mumbai Plant",
          type: "Plant",
          description: "Electronics manufacturing plant",
          path: "ABC Industries Pvt Ltd / Mumbai Plant",
          depth: 1,
          isDeleted: false,
          children: [
            {
              id: "l3",
              name: "PCB Line X",
              type: "Line",
              description: "PCB assembly line",
              path: "ABC Industries Pvt Ltd / Mumbai Plant / PCB Line X",
              depth: 2,
              isDeleted: false,
              children: [
                {
                  id: "m4",
                  name: "Soldering Machine X1",
                  type: "Machine",
                  description: "PCB soldering machine",
                  path: "ABC Industries Pvt Ltd / Mumbai Plant / PCB Line X / Soldering Machine X1",
                  depth: 3,
                  isDeleted: false,
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      // const data = await getAssetHierarchy();
      // setAssets(data);
    } catch (e) {
      console.error("Failed to load assets", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Added all missing functions so React stops crashing
  const onEdit = () => {
    if (!selectedAsset) return;
    console.log("Edit Asset:", selectedAsset);
    navigate(`/assets/edit/${selectedAsset.id}`);
  };

  const onAddChild = () => {
    if (!selectedAsset) return;
    console.log("Add child under:", selectedAsset);
    navigate(`/assets/add?parentId=${selectedAsset.id}`);
  };

  const onDelete = () => {
    if (!selectedAsset) return;
    console.log("Delete asset:", selectedAsset);
    alert("Soft delete triggered (dummy)");
  };

  const onRestore = () => {
    if (!selectedAsset) return;
    console.log("Restore asset:", selectedAsset);
    alert("Restore triggered (dummy)");
  };

  const onAssignDevice = () => {
    if (!selectedAsset) return;
    console.log("Assign device to:", selectedAsset);
    navigate(`/assets/assign-device/${selectedAsset.id}`);
  };

  return (
    <div className="p-3">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Asset Hierarchy</h1>
          <p className="text-sm text-muted-foreground">
            Explore structure of plants, departments, machines & sub-machines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3 mt-3">

        {/* LEFT TREE */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground text-sm">Hierarchy Tree</CardTitle>
          </CardHeader>

          <CardContent className="p-2">
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

        {/* RIGHT DETAILS */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {selectedAsset?.name}
</CardTitle>

                

                {selectedAsset && (
                  <div className="flex items-center mt-1">
                    {selectedAsset.isDeleted && (
                      <Badge variant="destructive" className="ml-2">Deleted</Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            {!selectedAsset ? (
              <div className="text-muted-foreground font-semibold text-lg py-6 text-center">
                Select an asset from the tree.
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">{selectedAsset.path}</p>

                <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t"></div>

                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Type</p>
                    <p className="font-medium">{selectedAsset.type}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Depth</p>
                    <p className="font-medium">{selectedAsset.depth}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs mb-1">Description</p>
                    <p className="font-medium">{selectedAsset.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t">
                  <Button onClick={onEdit} size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" /> Edit Asset
                  </Button>

                  <Button onClick={onAddChild} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" /> Add Sub-Asset
                  </Button>

                  {selectedAsset.isDeleted ? (
                    <Button onClick={onRestore} size="sm" variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" /> Restore
                    </Button>
                  ) : (
                    <Button onClick={onDelete} size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  )}

                  {selectedAsset.type === "Machine" && (
                    <Button onClick={onAssignDevice} size="sm" variant="outline">
                      <Link2 className="h-4 w-4 mr-2" /> Assign Device
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
