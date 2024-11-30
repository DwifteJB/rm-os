import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  File as FileIcon,
  // Search,
  // GitBranch,
  // Bug as Debug,
  // Expand as Extensions,
  ChevronRight,
  ChevronDown,
  Plus,
  Folder,
  FileText,
  X,
  Download,
  Trash,
} from "lucide-react";
import Languages, { getLanguageNameFromExtension } from "./languages";
import { WindowComponentProps } from "../../types";
import JSZip from "jszip";

interface FileSystemNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileSystemNode[];
  isOpen?: boolean;
  language?: string;
}

interface LanguageSuggestion {
  name: string;
  extensions: string[];
}

interface OpenFile extends FileSystemNode {
  isDirty?: boolean;
  errors?: number;
}

const addFilesToZip = (
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

const VSCodeContent = ({
  windowControls,
  onMouseDown,
  onDoubleClick,
}: WindowComponentProps & {
  onMouseDown?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}) => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeFile, setActiveFile] = useState<FileSystemNode | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string[]>([]);
  const [fileSystem, setFileSystem] = useState<FileSystemNode[]>([
    {
      id: "1",
      name: "src",
      type: "folder",
      isOpen: false,
      children: [
        {
          id: "2",
          name: "index.tsx",
          type: "file",
          content: "// welcome to rm code",
          language: "typescript",
        },
      ],
    },
    {
      id: "3",
      name: "info.txt",
      type: "file",
      isOpen: true,
      content: "// Welcome to rmcode, you can create a new file with the + in the explorer, by adding a . it will automagically suggest a language for you\n\n// Press the download button to export the project as a .zip!",
    }
  ]);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [createType, setCreateType] = useState<"file" | "folder">("file");
  const [languageSuggestions, setLanguageSuggestions] = useState<
    LanguageSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: number }>({});



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
        key={file.id+file.name}
        className={`h-9 flex items-center px-3 border-r border-[#252526] min-w-[100px] max-w-[200px] cursor-pointer group
          ${activeTab === file.id ? "bg-[#181818]/50" : "bg-[#181818] hover:bg-[#2d2d2d]"}`}
        onClick={() => {
          setActiveTab(file.id);
          setActiveFile(file);
        }}
      >
        <FileText size={16} className="mr-2 shrink-0" />
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (createType === "file" && newItemName.includes(".")) {
      const [, extension] = newItemName.split(".");
      if (!extension) {
        const allExtensions = Languages.flatMap((lang) =>
          lang.extensions.map((ext) => ({
            extension: ext,
            language: lang.name,
          })),
        );
        setLanguageSuggestions(
          allExtensions.map(({ extension, language }) => ({
            name: language,
            extensions: [extension],
          })),
        );
        setShowSuggestions(true);
      } else {
        const matchingExtensions = Languages.flatMap((lang) =>
          lang.extensions
            .filter((ext) => ext.startsWith(extension))
            .map((ext) => ({
              name: lang.name,
              extensions: [ext],
            })),
        );
        setLanguageSuggestions(matchingExtensions);
        setShowSuggestions(matchingExtensions.length > 0);
      }
    } else {
      setLanguageSuggestions([]);
      setShowSuggestions(false);
    }
  }, [newItemName, createType]);

  const handleSuggestionClick = (suggestion: LanguageSuggestion) => {
    const extension = suggestion.extensions[0];
    setNewItemName((prev) => {
      const baseName = prev.split(".")[0];
      return `${baseName}.${extension}`;
    });
    setShowSuggestions(false);
  };

  const getFileLanguage = (filename: string): string | undefined => {
    const extension = filename.split(".").pop();
    if (!extension) return undefined;
    return getLanguageNameFromExtension(extension);
  };
  const submitNewItem = () => {
    if (!newItemName) return;
  
    let finalName = newItemName;
    if (createType === "file" && !finalName.includes(".")) {
      finalName += ".txt";
    }
  
    const language = createType === "file" ? getFileLanguage(finalName) : undefined;
  
    const newNode: FileSystemNode = {
      id: Math.random().toString(),
      name: finalName,
      type: createType,
      content: createType === "file" ? "" : undefined,
      children: createType === "folder" ? [] : undefined,
      isOpen: false,
      language,
    };
  
    const updateFileSystemWithNewNode = (
      nodes: FileSystemNode[], 
      path: string[]
    ): FileSystemNode[] => {
      if (path.length === 0) {
        return [...nodes, newNode];
      }
  
      return nodes.map(node => {
        if (node.id !== path[0]) {
          return node;
        }
  
        return {
          ...node,

          children: path.length === 1 
            ? [...(node.children || []), newNode]
            : updateFileSystemWithNewNode(node.children || [], path.slice(1))
        };
      });
    };
  
    setFileSystem(updateFileSystemWithNewNode(fileSystem, selectedFolder));
    setShowCreateInput(false);
    setNewItemName("");
  };

  const toggleFolder = (path: string[], isSelected: boolean) => {
    if (isSelected) {
      setSelectedFolder(path);
    }

    const updateNodes = (
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
      return nodes.filter((node) => node.id !== id).map((node) => {
        if (node.children) {
          return {
            ...node,
            children: updatedFileSystem(node.children, currentPath),
          };
        }
        return node;
      });
    };

    setFileSystem(updatedFileSystem(fileSystem, selectedFolder));
    setOpenFiles((prev) => prev.filter((f) => f.id !== id));
    setFileErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  }

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


  const renderFileTree = (nodes: FileSystemNode[], path: string[] = []) => {
    return nodes.map((node) => {
      const currentPath = [...path, node.id];
      const isSelected = selectedFolder.join(".") === currentPath.join(".");
      const hasError = fileErrors[node.id] > 0;

      return (
        <div key={node.id+node.name} className="ml-4">
          <div
            className={`flex items-center py-1 px-2 hover:bg-[#37373d] cursor-pointer ${
              activeFile?.id === node.id || isSelected ? "bg-[#fff]/5" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (node.type === "folder") {
                toggleFolder(currentPath, true);
              } else {
                handleFileClick(node);
                setSelectedFolder(path);
              }
            }}
          >
            {node.type === "folder" ? (
              node.isOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )
            ) : (
              <div className="w-4" />
            )}
            {node.type === "folder" ? (
              <Folder size={16} className="mr-2" />
            ) : (
              <FileText size={16} className="mr-2" />
            )}
            <div className="flex justify-between items-center w-full">
              <span className={`text-sm ${hasError ? "text-red-500" : ""}`}>
                {node.name}
              </span>
              {hasError && (
                <span className="text-xs text-red-500 ml-2">
                  {fileErrors[node.id]}
                </span>
              )}
              <Trash
                size={16}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFile(node.id);
                }}
              />
            </div>
          </div>
          {node.type === "folder" &&
            node.isOpen &&
            node.children &&
            renderFileTree(node.children, currentPath)}
        </div>
      );
    });
  };

  useEffect(() => {
    const infoFile = fileSystem.find(node => node.name === 'info.txt');
    if (infoFile) {
      handleFileClick(infoFile);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // only want it to run once to open info.txt 

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="absolute bg-[#222222] rounded-md border p-2 border-[#313131] w-[70%] z-[300] text-white text-center items-center justify-center" style={{
        top: "12%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display:"none"
        
      }}>
        <input className="w-full placeholder-white rounded-md bg-[#313131] inter text-white p-1 focus:outline-none focus:ring-1" />
      </div>
      {/* title bar */}
      <div
        className="flex-none h-10 w-full rounded-t-md cursor-grab relative bg-[#1f1e24]/50"
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        style={{ zIndex: 1002 }}
      >
        <div className="flex flex-row items-center w-full h-full pr-2">
          <div className="flex flex-row items-center w-full ml-2">
            <span className="text-white w-full inter pl-2">RM Code</span>
          </div>
          <div className="flex flex-row items-center">
            <div
              className="w-6 h-6 mr-1 flex justify-center items-center text-center cursor-pointer text-white"
              onClick={() => windowControls?.minimize()}
            >
              _
            </div>
            <div
              className="w-6 h-6 mr-1 flex justify-center items-center text-center cursor-pointer text-white"
              onClick={() => windowControls?.maximize()}
            >
              ❐
            </div>
            <div
              className="w-6 h-6 mr-1 flex justify-center items-center text-center cursor-pointer text-white"
              onClick={() => windowControls?.close()}
            >
              ✕
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 min-h-0 text-white inter">
        <div className="w-14 flex-none bg-[#181818] flex flex-col items-center space-y-4 py-4 border-r border-[#252526]">
          <FileIcon
            color={showSidebar ? "#fff" : "#868686"}
            className="cursor-pointer"
            size={24}
            onClick={() => setShowSidebar(!showSidebar)}
          />
          {/* <Search color="#868686" className="cursor-pointer" size={24} />
          <GitBranch color="#868686" className="cursor-pointer" size={24} />
          <Debug color="#868686" className="cursor-pointer" size={24} />
          <Extensions color="#868686" className="cursor-pointer" size={24} /> */}
          <Download
            color="#868686"
            className="cursor-pointer"
            size={24}
            onClick={handleExport}
          />
        </div>

        <div
          className={`bg-[#181818] border-r border-[#252526] transition-all duration-200 ease-in-out overflow-y-auto ${
            showSidebar ? "w-72 opacity-100" : "w-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="p-2 min-w-[18rem]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm inter text-[#cccccc] pl-4">
                EXPLORER
              </span>
              <div className="flex space-x-2">
                <Plus
                  size={16}
                  className="cursor-pointer hover:text-white text-[#cccccc]"
                  onClick={() => {
                    setShowCreateInput(true);
                    setNewItemName("");
                  }}
                />
              </div>
            </div>
            {showCreateInput && (
              <div className="mb-2 flex flex-col relative">
                <div className="flex space-x-2">
                  <select
                    className="bg-[#3c3c3c] text-sm p-1 rounded text-[#cccccc]"
                    value={createType}
                    onChange={(e) =>
                      setCreateType(e.target.value as "file" | "folder")
                    }
                  >
                    <option value="file">File</option>
                    <option value="folder">Folder</option>
                  </select>
                  <div className="relative flex-1">
                    <input
                      autoFocus
                      className="w-full bg-[#3c3c3c] text-sm p-1 rounded text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc]"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (
                            showSuggestions &&
                            languageSuggestions.length > 0
                          ) {
                            handleSuggestionClick(languageSuggestions[0]);
                          } else {
                            submitNewItem();
                          }
                        }
                        if (e.key === "Escape") {
                          setShowCreateInput(false);
                          setShowSuggestions(false);
                        }
                      }}
                      placeholder={`New ${createType} name`}
                    />
                    {showSuggestions && createType === "file" && (
                      <div
                        ref={suggestionRef}
                        className="absolute top-full left-0 w-full mt-1 bg-[#252526] border border-[#3c3c3c] rounded shadow-lg z-50 max-h-48 overflow-y-auto"
                      >
                        {languageSuggestions.map((suggestion) => (
                          <div
                            key={suggestion.name}
                            className="px-2 py-1 hover:bg-[#37373d] cursor-pointer text-[#cccccc] text-sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            .{suggestion.extensions[0]} ({suggestion.name})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {renderFileTree(fileSystem)}
          </div>
        </div>

        <div className="flex-1 bg-[#1e1e1e] flex flex-col min-h-0 overflow-hidden">
          <div
            className={`flex-none h-9 bg-[#252526] flex items-center overflow-x-auto ${openFiles.length == 0 && "hidden"}`}
          >
            {renderTabs()}
          </div>

          <div className="flex-1 relative min-h-0">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              language={activeFile?.language || "plaintext"}
              theme="vs-dark"
              value={activeFile?.content || ""}
              onChange={(value) => {
                if (activeFile) {
                  const updatedFileSystem = (
                    nodes: FileSystemNode[],
                  ): FileSystemNode[] => {
                    return nodes.map((node) => {
                      if (node.id === activeFile.id) {
                        return { ...node, content: value || "" };
                      }
                      if (node.children) {
                        return {
                          ...node,
                          children: updatedFileSystem(node.children),
                        };
                      }
                      return node;
                    });
                  };

                  setFileSystem(updatedFileSystem(fileSystem));
                  setOpenFiles((prev) =>
                    prev.map((f) =>
                      f.id === activeFile.id
                        ? { ...f, content: value || "", isDirty: true }
                        : f,
                    ),
                  );
                }
              }}
              onValidate={(markers) => {
                if (activeFile) {
                  setFileErrors((prev) => ({
                    ...prev,
                    [activeFile.id]: markers.filter(
                      (marker) => marker.severity === 8,
                    ).length,
                  }));
                }
              }}
              options={{
                minimap: { enabled: true },
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible",
                },
                fontSize: 14,
                lineNumbers: "on",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const VSCode = () => {
  const window = {
    element: <VSCodeContent />,
    name: "RM Code",
    icon: "/code.png",
    minimumSize: { width: 800, height: 600 },
    initialSize: { width: 1000, height: 700 },
    customBackgroundClasses: "",
    hideTopBar: true,
  };
  return window;
};

export default VSCode;
