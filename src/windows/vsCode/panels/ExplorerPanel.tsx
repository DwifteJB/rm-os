import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, ChevronDown, Folder, File, Trash } from "lucide-react";
import { getIconForFile } from "../utils/languages";
import { FileSystemNode } from "../types";
import Languages from "../utils/languages";

interface LanguageSuggestion {
  name: string;
  extensions: string[];
}

interface ExplorerProps {
  fileSystem: FileSystemNode[];
  selectedFolder: string[];
  fileErrors: { [key: string]: number };
  activeFile: FileSystemNode | null;
  onFileClick: (node: FileSystemNode) => void;
  onDeleteFile: (id: string) => void;
  onCreateFile: (
    name: string,
    type: "file" | "folder",
    parentPath: string[],
  ) => void;
  onToggleFolder: (path: string[], isSelected: boolean) => void;
  open: boolean;
}

const Explorer = ({
  fileSystem,
  selectedFolder,
  fileErrors,
  activeFile,
  onFileClick,
  onDeleteFile,
  onCreateFile,
  onToggleFolder,
  open,
}: ExplorerProps) => {
  const [tempInput, setTempInput] = useState<{
    type: "file" | "folder";
    value: string;
    path: string[];
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [languageSuggestions, setLanguageSuggestions] = useState<
    LanguageSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

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
    if (tempInput?.type === "file" && tempInput.value.includes(".")) {
      const [, extension] = tempInput.value.split(".");
      if (!extension) {
        const allExtensions = Languages.flatMap((lang) =>
          lang.extensions.map((ext) => ({
            name: lang.name,
            extensions: [ext],
          })),
        );
        setLanguageSuggestions(allExtensions);
        setShowSuggestions(true);
      } else {
        const matchingExtensions = Languages.flatMap((lang) => {
          const matchingExts = lang.extensions.filter((ext) =>
            ext.toLowerCase().startsWith(extension.toLowerCase()),
          );
          return matchingExts.length > 0
            ? [{ name: lang.name, extensions: matchingExts }]
            : [];
        });
        setLanguageSuggestions(matchingExtensions);
        setShowSuggestions(matchingExtensions.length > 0);
      }
    } else {
      setLanguageSuggestions([]);
      setShowSuggestions(false);
    }
  }, [tempInput]);

  useEffect(() => {
    if (tempInput) {
      inputRef.current?.focus();
    }
  }, [tempInput]);

  const handleSuggestionClick = (suggestion: LanguageSuggestion) => {
    if (!tempInput) return;
    const extension = suggestion.extensions[0];
    const baseName = tempInput.value.split(".")[0];
    const finalName = `${baseName}.${extension}`;

    onCreateFile(finalName, tempInput.type, tempInput.path);
    setTempInput(null);
    setShowSuggestions(false);
  };

  const submitNewItem = () => {
    if (!tempInput || !tempInput.value) return;

    let finalName = tempInput.value;
    if (tempInput.type === "file" && !finalName.includes(".")) {
      finalName += ".txt";
    }

    onCreateFile(finalName, tempInput.type, tempInput.path);
    setTempInput(null);
    setShowSuggestions(false);
  };

  const renderInputWithSuggestions = () => (
    <div className="relative">
      <div className="flex items-center py-1 px-2 ml-4">
        <div className="w-4" />
        {React.createElement(tempInput?.type === "folder" ? Folder : File, {
          size: 16,
          className: "mr-2",
        })}
        <input
          ref={inputRef}
          value={tempInput?.value || ""}
          onChange={(e) =>
            setTempInput((prev) =>
              prev ? { ...prev, value: e.target.value } : null,
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (showSuggestions && languageSuggestions.length > 0) {
                handleSuggestionClick(languageSuggestions[0]);
              } else {
                submitNewItem();
              }
            }
            if (e.key === "Escape") {
              setTempInput(null);
              setShowSuggestions(false);
            }
            if (
              e.key === "Tab" &&
              showSuggestions &&
              languageSuggestions.length > 0
            ) {
              e.preventDefault();
              handleSuggestionClick(languageSuggestions[0]);
            }
          }}
          className="bg-[#3c3c3c] text-sm p-1 rounded text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] w-48"
          autoFocus
          placeholder={`New ${tempInput?.type}`}
        />
        {showSuggestions && tempInput?.type === "file" && (
          <div
            ref={suggestionRef}
            className="absolute left-12 top-full w-48 mt-1 bg-[#252526] border border-[#3c3c3c] rounded shadow-lg z-[100] max-h-48 overflow-y-auto"
          >
            {languageSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.name + index}
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
  );

  const renderFileTree = (nodes: FileSystemNode[], path: string[] = []) => {
    return nodes.map((node) => {
      const currentPath = [...path, node.id];
      const isSelected = selectedFolder.join(".") === currentPath.join(".");
      const hasError = fileErrors[node.id] > 0;
      const FileIcon =
        node.type === "folder" ? Folder : getIconForFile(node.name);
      const isCreatingHere =
        tempInput && tempInput.path.join(".") === currentPath.join(".");

      return (
        <div key={node.id} className="ml-4">
          <div
            className={`flex items-center py-1 px-2 hover:bg-[#37373d] cursor-pointer group ${
              activeFile?.id === node.id || isSelected ? "bg-[#fff]/5" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (node.type === "folder") {
                onToggleFolder(currentPath, true);
              } else {
                onFileClick(node);
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
            <FileIcon size={16} className="mr-2" />
            <div className="flex justify-between items-center w-full">
              <span className={`text-sm ${hasError ? "text-red-500" : ""}`}>
                {node.name}
              </span>
              {hasError && (
                <span className="text-xs text-red-500 ml-2">
                  {fileErrors[node.id]}
                </span>
              )}
              <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                {node.type === "folder" && (
                  <>
                    <File
                      size={16}
                      className="cursor-pointer text-[#cccccc] hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTempInput({
                          type: "file",
                          value: "",
                          path: currentPath,
                        });
                      }}
                    />
                    <Folder
                      size={16}
                      className="cursor-pointer text-[#cccccc] hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTempInput({
                          type: "folder",
                          value: "",
                          path: currentPath,
                        });
                      }}
                    />
                  </>
                )}
                <Trash
                  size={16}
                  className="cursor-pointer text-[#cccccc] hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(node.id);
                  }}
                />
              </div>
            </div>
          </div>
          {node.type === "folder" && node.isOpen && (
            <div>
              {node.children && renderFileTree(node.children, currentPath)}
              {isCreatingHere && renderInputWithSuggestions()}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={`p-2 min-w-[18rem] ${!open && "hidden"}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm inter text-[#cccccc] pl-4">EXPLORER</span>
        <div className="flex space-x-2">
          <File
            size={16}
            className="cursor-pointer hover:text-white text-[#cccccc]"
            onClick={() =>
              setTempInput({ type: "file", value: "", path: selectedFolder })
            }
          />
          <Folder
            size={16}
            className="cursor-pointer hover:text-white text-[#cccccc]"
            onClick={() =>
              setTempInput({ type: "folder", value: "", path: selectedFolder })
            }
          />
        </div>
      </div>
      {renderFileTree(fileSystem)}
      {tempInput && tempInput.path.length === 0 && renderInputWithSuggestions()}
    </div>
  );
};

export default Explorer;
