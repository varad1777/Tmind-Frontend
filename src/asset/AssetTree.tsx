import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Layers,
  Wrench,
  Plus,
  Edit,
  Trash2,
  Settings2,
  AlertTriangle,
} from "lucide-react";

import { type Asset } from "@/types/asset";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

import Addroot from "../AssetsHierarchy/Addroot";
import Addasset from "../AssetsHierarchy/Addasset";
import ConfigureAsset from "../AssetsHierarchy/ConfigureAsset";
import Editasset from "../AssetsHierarchy/Editasset";
import levelToType from "./mapBackendAsset";
import DeleteAsset from "@/AssetsHierarchy/DeleteAsset";

import { deleteAsset } from "@/api/assetApi";
import { toast } from "react-toastify";

interface AssetTreeProps {
  assets: Asset[];
  selectedId: string | null;
  onSelect: (asset: Asset) => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void; // refresh asset tree in parent
}

interface AssetTreeNodeProps {
  asset: Asset;
  selectedId: string | null;
  onSelect: (asset: Asset) => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
  searchTerm: string;

  setShowAddAssetModal: (v: boolean) => void;
  setAssetForAdd: (asset: Asset | null) => void;

  setShowConfigureModal: (v: boolean) => void;
  setAssetForConfig: (asset: Asset | null) => void;

  setShowEditModal: (v: boolean) => void;
  setAssetForEdit: (asset: Asset | null) => void;

  setOpenDeleteDialog: (v: boolean) => void;
  setAssetToDelete: (asset: Asset | null) => void;
}

const AssetTreeNode = ({
  asset,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  searchTerm,

  setShowAddAssetModal,
  setAssetForAdd,

  setShowConfigureModal,
  setAssetForConfig,

  setShowEditModal,
  setAssetForEdit,

  setOpenDeleteDialog,
  setAssetToDelete,
}: AssetTreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = asset.children?.length > 0;
  const isSelected = selectedId === asset.id;

  const matchesSearch =
    searchTerm === "" || asset.name.toLowerCase().includes(searchTerm.toLowerCase());
  if (!matchesSearch) return null;

  const assetType = levelToType(asset.level);

  const Icon = (() => {
    switch (assetType) {
      case "Department":
        return Building2;
      case "Line":
        return Layers;
      case "Machine":
      case "SubMachine":
        return Wrench;
      default:
        return Layers;
    }
  })();

  // actions based on level
  const actions =
    asset.level >= 5
      ? [
          {
            icon: <Settings2 className="h-4 w-4" />,
            name: "Config",
            onClick: () => {
              setAssetForConfig(asset);
              setShowConfigureModal(true);
            },
          },
          {
            icon: <Edit className="h-4 w-4" />,
            name: "Edit",
            onClick: () => {
              setAssetForEdit(asset);
              setShowEditModal(true);
            },
          },
          {
            icon: <Trash2 className="h-4 w-4" />,
            name: "Delete",
            onClick: () => {
              setAssetToDelete(asset);
              setOpenDeleteDialog(true);
            },
          },
        ]
      : [
          {
            icon: <Edit className="h-4 w-4" />,
            name: "Edit",
            onClick: () => {
              setAssetForEdit(asset);
              setShowEditModal(true);
            },
          },
          {
            icon: <Plus className="h-4 w-4" />,
            name: "Add Sub-Asset",
            onClick: () => {
              setAssetForAdd(asset);
              setShowAddAssetModal(true);
            },
          },
          {
            icon: <Trash2 className="h-4 w-4" />,
            name: "Delete",
            onClick: () => {
              setAssetToDelete(asset);
              setOpenDeleteDialog(true);
            },
          },
        ];

  return (
    <div>
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 cursor-pointer hover:bg-accent rounded-sm",
          isSelected && "bg-primary/10 text-primary font-medium",
          asset.isDeleted && "opacity-50"
        )}
      >
        <div className="flex items-center gap-2 flex-1" onClick={() => onSelect(asset)}>
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          <Icon className="h-4 w-4" />
          <span className="text-sm">{asset.name}</span>
        </div>

        <div className="flex gap-1">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className="relative p-1 rounded hover:bg-gray-200"
            >
              {action.icon}
              <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 pointer-events-none transition-opacity">
                {action.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-6">
          {asset.children.map((child) => (
            <AssetTreeNode
              key={child.id}
              asset={child}
              selectedId={selectedId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              searchTerm={searchTerm}
              setShowAddAssetModal={setShowAddAssetModal}
              setAssetForAdd={setAssetForAdd}
              setShowConfigureModal={setShowConfigureModal}
              setAssetForConfig={setAssetForConfig}
              setShowEditModal={setShowEditModal}
              setAssetForEdit={setAssetForEdit}
              setOpenDeleteDialog={setOpenDeleteDialog}
              setAssetToDelete={setAssetToDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AssetTree = ({ assets, selectedId, onSelect, onDelete }: AssetTreeProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddRootModal, setShowAddRootModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [assetForAdd, setAssetForAdd] = useState<Asset | null>(null);

  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [assetForConfig, setAssetForConfig] = useState<Asset | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [assetForEdit, setAssetForEdit] = useState<Asset | null>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  // ----------------------------------------
  // DELETE HANDLER
  // ----------------------------------------
  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;

    try {
      await deleteAsset(assetToDelete.id);
      toast.success("Asset deleted successfully!");

      if (onDelete) onDelete(assetToDelete); // refresh tree in parent
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete asset");
    }

    setOpenDeleteDialog(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Asset Tree</h2>
          <Button size="sm" className="h-8 gap-1" onClick={() => setShowAddRootModal(true)}>
            <Plus className="h-4 w-4" /> Add Root
          </Button>
        </div>

        <Input
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
        />
      </div>

      <div className="flex-1 overflow-auto p-2">
        {assets.map((asset) => (
          <AssetTreeNode
            key={asset.id}
            asset={asset}
            selectedId={selectedId}
            onSelect={onSelect}
            onDelete={onDelete}
            searchTerm={searchTerm}
            setShowAddAssetModal={setShowAddAssetModal}
            setAssetForAdd={setAssetForAdd}
            setShowConfigureModal={setShowConfigureModal}
            setAssetForConfig={setAssetForConfig}
            setShowEditModal={setShowEditModal}
            setAssetForEdit={setAssetForEdit}
            setOpenDeleteDialog={setOpenDeleteDialog}
            setAssetToDelete={setAssetToDelete}
          />
        ))}
      </div>

      {/* Add Root */}
      {showAddRootModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-[400px]">
            <Addroot onClose={() => setShowAddRootModal(false)} />
          </div>
        </div>
      )}

      {/* Add Sub-Asset */}
      {showAddAssetModal && assetForAdd && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[400px]">
            <Addasset parentAsset={assetForAdd} onClose={() => setShowAddAssetModal(false)} />
          </div>
        </div>
      )}

      {/* Configure */}
      {showConfigureModal && assetForConfig && (
        <ConfigureAsset asset={assetForConfig} onClose={() => setShowConfigureModal(false)} />
      )}

      {/* Edit */}
      {showEditModal && assetForEdit && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[400px]">
            <Editasset asset={assetForEdit} onClose={() => setShowEditModal(false)} />
          </div>
        </div>
      )}

      <DeleteAsset
        asset={assetToDelete}
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onDeleted={() => onDelete?.(assetToDelete!)}
      />

    </div>
  );
};
