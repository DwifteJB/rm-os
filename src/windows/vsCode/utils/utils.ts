import JSZip from "jszip";
import { FileSystemNode } from "../types";

export const findFileRecursively = (
  fileSystem: FileSystemNode[],
  id: string,
): FileSystemNode | null => {
  for (const node of fileSystem) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const child = findFileRecursively(node.children, id);
      if (child) {
        return child;
      }
    }
  }
  return null;
};

export const addFilesToZip = (
  zip: JSZip,
  nodes: FileSystemNode[],
  currentPath: string = "",
) => {
  nodes.forEach((node) => {
    if (node.type === "file") {
      zip.file(`${currentPath}${node.name}`, node.content || "");
    } else if (node.type === "folder" && node.children) {
      const folderPath = `${currentPath}${node.name}/`;
      addFilesToZip(zip, node.children, folderPath);
    }
  });
};

export const updateNodes = (
  nodes: FileSystemNode[],
  currentPath: string[],
): FileSystemNode[] => {
  if (currentPath.length === 0) return nodes;

  return nodes.map((node) => {
    if (node.id === currentPath[0]) {
      if (currentPath.length === 1) {
        return { ...node, isOpen: !node.isOpen };
      }
      return {
        ...node,
        children: node.children
          ? updateNodes(node.children, currentPath.slice(1))
          : [],
      };
    }
    return node;
  });
};
