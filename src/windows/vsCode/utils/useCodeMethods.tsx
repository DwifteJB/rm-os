import React from "react";
import { FileSystemNode, OpenFile } from "../types";

import { addFilesToZip, updateNodes } from "./utils";

import { getIconForFile, getLanguageNameFromExtension } from "./languages";
import JSZip from "jszip";
import { X } from "lucide-react";

const useCodeMethods = ({
  fileSystem,
  openFiles,
  setOpenFiles,
  activeTab,
  setActiveTab,
  setActiveFile,
  fileErrors,
  setFileErrors,
  selectedFolder,
  setSelectedFolder,
  setFileSystem,
}: {
  fileSystem: FileSystemNode[];
  openFiles: OpenFile[];
  setOpenFiles: React.Dispatch<React.SetStateAction<OpenFile[]>>;
  activeTab: string | null;
  setActiveTab: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveFile: React.Dispatch<React.SetStateAction<OpenFile | null>>;
  fileErrors: { [key: string]: number };
  setFileErrors: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
  selectedFolder: string[];
  setSelectedFolder: React.Dispatch<React.SetStateAction<string[]>>;
  setFileSystem: React.Dispatch<React.SetStateAction<FileSystemNode[]>>;
}) => {
  const handleExport = async () => {
    try {
      const zip = new JSZip();
      addFilesToZip(zip, fileSystem);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "project.zip";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating ZIP:", error);
    }
  };

  const renderTabs = () => {
    return openFiles.map((file) => (
      <div
        key={file.id + file.name}
        className={`h-9 flex items-center px-3 border-r border-[#252526] min-w-[100px] max-w-[200px] cursor-pointer group
          ${activeTab === file.id ? "bg-[#181818]/50" : "bg-[#181818] hover:bg-[#2d2d2d]"}`}
        onClick={() => {
          setActiveTab(file.id);
          setActiveFile(file);
        }}
      >
        {React.createElement(getIconForFile(file.name), {
          size: 16,
          className: "mr-2 shrink-0",
        })}
        <div className="flex-1 flex items-center min-w-0">
          <span
            className={`inter truncate text-sm ${fileErrors[file.id] > 0 ? "text-red-500" : activeTab === file.id ? "text-white" : "text-gray-500"}`}
          >
            {file.name}
          </span>
          {fileErrors[file.id] > 0 && (
            <span className="ml-4 text-xs text-red-500 inter-bold">
              {fileErrors[file.id]}
            </span>
          )}
        </div>
        <div
          className={`ml-2 p-1 rounded-sm hover:bg-[#4c4c4c] opacity-0 group-hover:opacity-100 
            ${activeTab === file.id ? "bg-[#1e1e1e]" : ""}`}
          onClick={(e) => closeTab(file.id, e)}
        >
          <X size={14} />
        </div>
      </div>
    ));
  };

  const getFileLanguage = (filename: string): string | undefined => {
    const extension = filename.split(".").pop();
    if (!extension) return undefined;
    return getLanguageNameFromExtension(extension);
  };

  const toggleFolder = (path: string[], isSelected: boolean) => {
    if (isSelected) {
      setSelectedFolder(path);
    }

    setFileSystem(updateNodes(fileSystem, path));
  };

  const handleFileClick = (node: FileSystemNode) => {
    if (!openFiles.find((f) => f.id === node.id)) {
      setOpenFiles((prev) => [...prev, node]);
    }
    setActiveTab(node.id);
    setActiveFile(node);
  };

  const deleteFile = (id: string) => {
    const updatedFileSystem = (
      nodes: FileSystemNode[],
      currentPath: string[],
    ): FileSystemNode[] => {
      return nodes
        .filter((node) => node.id !== id)
        .map((node) => {
          if (node.children) {
            return {
              ...node,
              children: updatedFileSystem(node.children, currentPath),
            };
          }
          return node;
        });
    };

    if (selectedFolder.includes(id)) {
      setSelectedFolder([]);
    }

    const selectedFile = openFiles.find((f) => f.id === id);
    if (selectedFile) {
      if (activeTab === id) {
        const remainingFiles = openFiles.filter((f) => f.id !== id);
        if (remainingFiles.length > 0) {
          setActiveTab(remainingFiles[remainingFiles.length - 1].id);
          setActiveFile(remainingFiles[remainingFiles.length - 1]);
        } else {
          setActiveTab(null);
          setActiveFile(null);
        }
      }
    }

    setFileSystem(updatedFileSystem(fileSystem, selectedFolder));
    setOpenFiles((prev) => prev.filter((f) => f.id !== id));
    setFileErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenFiles((prev) => prev.filter((f) => f.id !== id));
    if (activeTab === id) {
      const remainingFiles = openFiles.filter((f) => f.id !== id);
      if (remainingFiles.length > 0) {
        setActiveTab(remainingFiles[remainingFiles.length - 1].id);
        setActiveFile(remainingFiles[remainingFiles.length - 1]);
      } else {
        setActiveTab(null);
        setActiveFile(null);
      }
    }
  };

  const updateFileContent = (
    nodes: FileSystemNode[],
    fileId: string,
    newContent: string,
  ): FileSystemNode[] => {
    return nodes.map((node) => {
      if (node.id === fileId) {
        return {
          ...node,
          content: newContent,
        };
      }

      if (node.type === "folder" && node.children) {
        return {
          ...node,
          children: updateFileContent(node.children, fileId, newContent),
        };
      }

      return node;
    });
  };

  const handleFileImport = async (files: File[]) => {
    const processFile = async (file: File, path: string[] = []) => {
      const content = await file.text();
      const pathParts = file.name.split("/");
      const fileName = pathParts.pop() || file.name;

      const newNode: FileSystemNode = {
        id: Math.random().toString(),
        name: fileName,
        type: "file",
        content,
        language: getFileLanguage(fileName) || "plaintext",
      };

      return { node: newNode, path: [...path, ...pathParts] };
    };

    const newFiles = await Promise.all(files.map((file) => processFile(file)));

    setFileSystem((prev) => {
      const updated = [...prev];
      newFiles.forEach(({ node, path }) => {
        if (path.length === 0) {
          updated.push(node);
        } else {
          let currentPath = updated;
          path.forEach((folderName) => {
            let folder = currentPath.find(
              (n) => n.type === "folder" && n.name === folderName,
            );
            if (!folder) {
              folder = {
                id: Math.random().toString(),
                name: folderName,
                type: "folder",
                children: [],
                isOpen: true,
              };
              currentPath.push(folder);
            }
            currentPath = folder.children || [];
          });
          currentPath.push(node);
        }
      });
      return updated;
    });
  };

  return {
    handleExport,
    renderTabs,
    toggleFolder,
    handleFileClick,
    deleteFile,
    updateFileContent,
    handleFileImport,
    getFileLanguage,
  };
};

export default useCodeMethods;
