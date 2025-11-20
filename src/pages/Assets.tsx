import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { type Asset } from "@/types/asset";
import { AssetTree } from "@/asset/AssetTree";

export default function Assets() {
const [assets, setAssets] = useState<Asset[]>([
  {
    id: "p1",
    name: "Tata Motors Mumbai Plant",
    type: "Plant",
    description: "Main manufacturing plant",
    path: "Tata Motors Mumbai Plant",
    depth: 0,
    isDeleted: false,
    children: [
      // ------------------------------
      // Department: Manufacturing
      // ------------------------------
      {
        id: "d1",
        name: "Manufacturing Department",
        type: "Department",
        description: "Handles automobile manufacturing operations",
        path: "Tata Motors Mumbai Plant / Manufacturing",
        depth: 1,
        isDeleted: false,
        children: [
          {
            id: "l1",
            name: "Assembly Line 1",
            type: "Line",
            description: "Primary assembly line",
            path: "Tata Motors Mumbai Plant / Manufacturing / Assembly Line 1",
            depth: 2,
            isDeleted: false,
            children: [
              {
                id: "m1",
                name: "Machine 1",
                type: "Machine",
                description: "Sample machine",
                path: "Tata Motors Mumbai Plant / Manufacturing / Assembly Line 1 / Machine 1",
                depth: 3,
                isDeleted: false,
                children: [
                  {
                    id: "sm1",
                    name: "Sub Machine 1",
                    type: "SubMachine",
                    description: "Sample sub machine",
                    path: "Tata Motors Mumbai Plant / Manufacturing / Assembly Line 1 / Machine 1 / Sub Machine 1",
                    depth: 4,
                    isDeleted: false,
                    children: [],
                  },
                ],
              },
            ],
          },

          {
            id: "l2",
            name: "Assembly Line 2",
            type: "Line",
            description: "Secondary assembly line",
            path: "Tata Motors Mumbai Plant / Manufacturing / Assembly Line 2",
            depth: 2,
            isDeleted: false,
            children: [],
          },

          {
            id: "l3",
            name: "Assembly Line 3",
            type: "Line",
            description: "Tertiary assembly line",
            path: "Tata Motors Mumbai Plant / Manufacturing / Assembly Line 3",
            depth: 2,
            isDeleted: false,
            children: [],
          },
        ],
      },

      // ------------------------------
      // Department: Painting
      // ------------------------------
      {
        id: "d2",
        name: "Painting Department",
        type: "Department",
        description: "Paint shop operations",
        path: "Tata Motors Mumbai Plant / Painting",
        depth: 1,
        isDeleted: false,
        children: [
          {
            id: "pl1",
            name: "Paint Line 1",
            type: "Line",
            description: "Base coat paint line",
            path: "Tata Motors Mumbai Plant / Painting / Paint Line 1",
            depth: 2,
            isDeleted: false,
            children: [
              {
                id: "pm1",
                name: "Paint Machine 1",
                type: "Machine",
                description: "Sample paint machine",
                path: "Tata Motors Mumbai Plant / Painting / Paint Line 1 / Paint Machine 1",
                depth: 3,
                isDeleted: false,
                children: [
                  {
                    id: "psm1",
                    name: "Paint Sub Machine 1",
                    type: "SubMachine",
                    description: "Sample paint sub machine",
                    path: "Tata Motors Mumbai Plant / Painting / Paint Line 1 / Paint Machine 1 / Paint Sub Machine 1",
                    depth: 4,
                    isDeleted: false,
                    children: [],
                  },
                ],
              },
            ],
          },

          {
            id: "pl2",
            name: "Paint Line 2",
            type: "Line",
            description: "Color coating line",
            path: "Tata Motors Mumbai Plant / Painting / Paint Line 2",
            depth: 2,
            isDeleted: false,
            children: [],
          },

          {
            id: "pl3",
            name: "Paint Line 3",
            type: "Line",
            description: "Finishing paint line",
            path: "Tata Motors Mumbai Plant / Painting / Paint Line 3",
            depth: 2,
            isDeleted: false,
            children: [],
          },
        ],
      },
    ],
  },
]);

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Asset Hierarchy
          </h1>
          <p className="text-muted-foreground">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* LEFT : Asset Tree */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground">
              Hierarchy Tree
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <p className="text-muted-foreground p-4">Loading...</p>
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

        {/* RIGHT : Asset Details */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground">Asset Details</CardTitle>
          </CardHeader>

          <CardContent>
            {!selectedAsset ? (
              <p className="text-muted-foreground">
                Select an asset from the tree.
              </p>
            ) : (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">{selectedAsset.name}</h2>
                <p>
                  <strong>Type:</strong> {selectedAsset.type}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedAsset.description || "No description"}
                </p>
                <p>
                  <strong>Path:</strong> {selectedAsset.path}
                </p>
                <p>
                  <strong>Depth:</strong> {selectedAsset.depth}
                </p>

                {selectedAsset.deviceId && (
                  <p>
                    <strong>Assigned Device:</strong>{" "}
                    {selectedAsset.deviceId}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
