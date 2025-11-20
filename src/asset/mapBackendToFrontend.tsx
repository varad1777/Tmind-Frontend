// src/utils/mapBackendToFrontend.ts

import { type Asset } from "@/types/asset";
import levelToType from "@/asset/mapBackendAsset";

export function transformBackendAsset(
  backendAsset: any,
  parentPath: string = ""
): Asset {
  const path = parentPath ? `${parentPath} / ${backendAsset.name}` : backendAsset.name;

  return {
    id: backendAsset.assetId,
    name: backendAsset.name,
    type: levelToType(backendAsset.level),
    description: "", // backend has no description
    path,
    depth: backendAsset.level,
    isDeleted: backendAsset.isDeleted,
    children: (backendAsset.childrens || []).map((child: any) =>
      transformBackendAsset(child, path)
    ),
  };
}

export function transformHierarchy(list: any[]): Asset[] {
  return list.map((item) => transformBackendAsset(item));
}
