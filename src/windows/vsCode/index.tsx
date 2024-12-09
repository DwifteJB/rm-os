/*
  todo?

  search: search for text in files (done!)
  saving: save projects in localStorage, might be too much data...? will explore this latah
  import: import .zip files or folders to work on (done kinda not zip!)
  run: allows running code in javascript context (done! and python!!)

*/

import React, { useState, useEffect, useContext, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { File as FileIcon, Search, Download, PlayCircle } from "lucide-react";

import { WindowComponentProps } from "../../types";
import { FileSystemNode, OpenFile } from "./types";

import { Tooltip } from "react-tooltip";

import SearchPanel from "./panels/SearchPanel";

import Explorer from "./panels/ExplorerPanel";
import FileSystemImport from "./panels/ImportFile";

import { findFileRecursively } from "./utils/utils";
import useCodeMethods from "./utils/useCodeMethods";

import { AppContext } from "../../components/mainAppContext";
import CodeRunner from "./Coderunner";

const VSCodeContent = ({
  windowControls,
  onMouseDown,
  onDoubleClick,
}: WindowComponentProps & {
  onMouseDown?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}) => {
  const [showSidebar, setShowSidebar] = useState("");
  const [activeFile, setActiveFile] = useState<FileSystemNode | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
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
      language: "plaintext",
      type: "file",
      content:
        "// Welcome to rmcode, you can create a new file with the + in the explorer, by adding a . it will automagically suggest a language for you\n\n// Press the download button to export the project as a .zip!",
    },
    {
      id: "4",
      name: "index.html",
      language: "html",
      type: "file",
      content:
        "<h1>Hello World</h1>\n\n<script>\n  console.log('hello world')\n</script> <script src='index.js'></script>",
      isOpen: false,
    },
    {
      id: "5",
      name: "index.js",
      language: "javascript",
      type: "file",
      content: "console.log('hello world but from index.js file')",
    },
    {
      id: "6",
      name: "main.py",
      language: "python",
      type: "file",
      content: `import math\ndef calculate_circle_area(radius):\n    return math.pi * radius ** 2\n\nradius = 5\narea = calculate_circle_area(radius)\nprint(f"The area of a circle with radius {radius} is {area:.2f}")`,
    },
  ]);

  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: number }>({});

  const context = useContext(AppContext);

  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "js") return "javascript";
    if (ext === "html") return "html";
    if (ext === "py") return "python";
    return "plaintext";
  };

  const isRunnableFile = (file: FileSystemNode | null) => {
    if (!file) return false;
    const ext = file.name.split(".").pop()?.toLowerCase();
    return (
      ext === "js" ||
      ext === "html" ||
      ext === "py" ||
      file.language === "javascript" ||
      file.language === "html" ||
      file.language === "python"
    );
  };

  const handleRunCode = useCallback(() => {
    if (!activeFile) return;

    const fileName = activeFile.name;
    const windowName = `Output: ${fileName}`;

    context.CreateWindow(
      <CodeRunner
        code={fileContent}
        language={activeFile.language || getLanguageFromFilename(fileName)}
        fileSystem={fileSystem}
        currentFileId={activeFile.id}
      />,
      windowName,
      "/code.png",
      "",
      { width: 400, height: 300 },
      { width: 500, height: 400 },
    );
  }, [activeFile, fileContent, fileSystem, context]);

  useEffect(() => {
    if (activeFile) {
      setFileContent(activeFile.content || "");
    }
  }, [activeFile]);

  const {
    deleteFile,
    handleExport,
    handleFileClick,
    handleFileImport,
    renderTabs,
    toggleFolder,
    updateFileContent,
    getFileLanguage,
  } = useCodeMethods({
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
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="absolute bg-[#222222] rounded-md border p-2 border-[#313131] w-[70%] z-[300] text-white text-center items-center justify-center"
        style={{
          top: "12%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "none",
        }}
      >
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
          <a data-tooltip-id="explorer">
            <FileIcon
              color={showSidebar === "explorer" ? "#fff" : "#868686"}
              className="cursor-pointer"
              size={24}
              onClick={() => {
                setShowSidebar((prev) =>
                  prev === "explorer" ? "" : "explorer",
                );
              }}
            />
            <Tooltip className="z-[99999] inter" id="explorer" place="right">
              Explorer
            </Tooltip>
          </a>
          <a data-tooltip-id="search">
            <Search
              color={showSidebar === "search" ? "#fff" : "#868686"}
              className="cursor-pointer"
              size={24}
              onClick={() => {
                setShowSidebar((prev) => (prev === "search" ? "" : "search"));
              }}
            />
            <Tooltip className="z-[99999] inter" id="search" place="right">
              Search
            </Tooltip>
          </a>

          {/*
          <GitBranch color="#868686" className="cursor-pointer" size={24} />
          <Debug color="#868686" className="cursor-pointer" size={24} />
          <Extensions color="#868686" className="cursor-pointer" size={24} /> */}
          <a data-tooltip-id="import">
            <FileSystemImport onImport={handleFileImport} />
            <Tooltip className="z-[99999] inter" id="import" place="right">
              Import
            </Tooltip>
          </a>
          <a data-tooltip-id="download">
            <Download
              color="#868686"
              className="cursor-pointer"
              size={24}
              onClick={handleExport}
            />

            <Tooltip className="z-[99999] inter" id="download" place="right">
              Export
            </Tooltip>
          </a>
        </div>

        <Explorer
          open={showSidebar === "explorer"}
          fileSystem={fileSystem}
          selectedFolder={selectedFolder}
          fileErrors={fileErrors}
          activeFile={activeFile}
          onFileClick={handleFileClick}
          onDeleteFile={deleteFile}
          onCreateFile={(name, type, parentPath) => {
            const newNode = {
              id: Math.random().toString(),
              name,
              type,
              content: type === "file" ? "" : undefined,
              children: type === "folder" ? [] : undefined,
              isOpen: false,
              language: type === "file" ? getFileLanguage(name) : undefined,
            };

            interface UpdateFileSystemWithNewNode {
              (nodes: FileSystemNode[], path: string[]): FileSystemNode[];
            }

            const updateFileSystemWithNewNode: UpdateFileSystemWithNewNode = (
              nodes,
              path,
            ) => {
              if (path.length === 0) {
                return [...nodes, newNode];
              }
              return nodes.map((node) => {
                if (node.id !== path[0]) {
                  return node;
                }
                return {
                  ...node,
                  children:
                    path.length === 1
                      ? [...(node.children || []), newNode]
                      : updateFileSystemWithNewNode(
                          node.children || [],
                          path.slice(1),
                        ),
                };
              });
            };

            setFileSystem(updateFileSystemWithNewNode(fileSystem, parentPath));
          }}
          onToggleFolder={toggleFolder}
        />

        <SearchPanel
          fileSystem={fileSystem}
          onResultClick={(result) => {
            console.log(result, fileSystem);
            const file = findFileRecursively(fileSystem, result.fileId);
            console.log(file);
            if (file) {
              handleFileClick(file);
              setActiveTab(file.id);
            }
          }}
          visible={showSidebar === "search"}
          onUpdateFile={(fileId, newContent) => {
            setFileSystem((prev) =>
              updateFileContent(prev, fileId, newContent),
            );
          }}
        />

        <div className="flex-1 bg-[#1e1e1e] flex flex-col min-h-0 overflow-hidden">
          <div
            className={`flex-none h-9 bg-[#252526] flex items-center overflow-x-auto ${openFiles.length == 0 && "hidden"}`}
          >
            {renderTabs()}
            {isRunnableFile(activeFile) && (
              <div className="flex-none px-2 border-l border-[#3c3c3c]">
                <div
                  className="p-1 hover:bg-[#3c3c3c] rounded cursor-pointer group"
                  onClick={handleRunCode}
                >
                  <PlayCircle
                    size={20}
                    className="text-gray-400 group-hover:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 relative min-h-0">
            {openFiles.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-[#cccccc] text-sm inter">
                  no files open :(
                </span>
              </div>
            )}
            <Editor
              className={`${openFiles.length === 0 ? "hidden" : ""}`}
              height="100%"
              defaultLanguage="typescript"
              language={activeFile?.language || "plaintext"}
              theme="vs-dark"
              value={fileContent}
              onChange={(value) => {
                setFileContent(value || "");
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
