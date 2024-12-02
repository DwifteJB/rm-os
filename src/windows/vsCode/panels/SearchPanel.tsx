import React, { useState, useMemo, useEffect } from "react";
import { ReplaceAll } from "lucide-react";
import { getIconForFile } from "../utils/languages";
import { FileSystemNode } from "../types";

interface SearchResult {
  fileId: string;
  fileName: string;
  line: string;
  lineNumber: number;
  matchIndex: number;
}

interface SearchPanelProps {
  fileSystem: FileSystemNode[];
  onResultClick: (result: SearchResult) => void;
  visible: boolean;
  onUpdateFile: (fileId: string, newContent: string) => void;
}

interface GroupedResults {
  [fileName: string]: SearchResult[];
}

const SearchPanel = ({
  fileSystem,
  onResultClick,
  visible,
  onUpdateFile,
}: SearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [replaceQuery, setReplaceQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const findFileById = (
    nodes: FileSystemNode[],
    id: string,
  ): FileSystemNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findFileById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const searchFiles = (
    nodes: FileSystemNode[],
    query: string,
  ): SearchResult[] => {
    let results: SearchResult[] = [];
    nodes.forEach((node) => {
      if (node.type === "file" && node.content) {
        const lines = node.content.split("\n");
        lines.forEach((line, lineNumber) => {
          if (line.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              fileId: node.id,
              fileName: node.name,
              line: line.trim(),
              lineNumber,
              matchIndex: line.toLowerCase().indexOf(query.toLowerCase()),
            });
          }
        });
      }
      if (node.children) {
        results = [...results, ...searchFiles(node.children, query)];
      }
    });
    return results;
  };

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setIsSearching(true);
      const results = searchFiles(fileSystem, query);
      setSearchResults(results);
      setIsSearching(false);
      setExpandedFiles(new Set(results.map((r) => r.fileName)));
    } else {
      setSearchResults([]);
      setExpandedFiles(new Set());
    }
  };

  const handleReplaceAll = () => {
    if (!searchQuery || !replaceQuery) return;

    const fileChanges = new Map<string, { content: string; changes: number }>();

    searchResults.forEach((result) => {
      const file = findFileById(fileSystem, result.fileId);
      if (!file || !file.content) return;

      if (!fileChanges.has(result.fileId)) {
        fileChanges.set(result.fileId, {
          content: file.content,
          changes: 0,
        });
      }

      const fileChange = fileChanges.get(result.fileId)!;
      fileChange.content = fileChange.content.replace(
        new RegExp(searchQuery, "gi"),
        replaceQuery,
      );
      fileChange.changes += 1;
    });

    fileChanges.forEach((changes, fileId) => {
      onUpdateFile(fileId, changes.content);
    });
  };

  const handleReplaceSingle = (result: SearchResult) => {
    const file = findFileById(fileSystem, result.fileId);
    if (!file || !file.content) return;

    const lines = file.content.split("\n");
    lines[result.lineNumber] = lines[result.lineNumber].replace(
      new RegExp(searchQuery, "gi"),
      replaceQuery,
    );

    const newContent = lines.join("\n");
    onUpdateFile(result.fileId, newContent);
  };

  const groupedResults = useMemo<GroupedResults>(() => {
    const grouped: GroupedResults = {};
    searchResults.forEach((result) => {
      if (!grouped[result.fileName]) {
        grouped[result.fileName] = [];
      }
      grouped[result.fileName].push(result);
    });
    return grouped;
  }, [searchResults]);

  const toggleFileExpansion = (fileName: string) => {
    setExpandedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileName)) {
        newSet.delete(fileName);
      } else {
        newSet.add(fileName);
      }
      return newSet;
    });
  };

  useEffect(() => {
    handleSearch(searchQuery);
  }, [fileSystem]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`p-2 inter min-w-[18rem] max-w-[18rem] ${!visible && "hidden"}`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm inter text-[#cccccc] pl-4">SEARCH</span>
      </div>
      <div className="mb-2 space-y-1">
        <div className="relative min-w-[18rem]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search"
            className="w-[95%] bg-[#313131] text-sm p-1 pl-2 border border-[#3c3c3c] focus:border-[#007acc] focus:outline-none"
          />
        </div>

        <div className="relative min-w-[18rem] flex-row flex">
          <input
            type="text"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            placeholder="Replace"
            className="w-[80%] bg-[#313131] text-sm p-1 pl-2 border border-[#3c3c3c] focus:border-[#007acc] focus:outline-none"
          />
          <ReplaceAll
            size={20}
            color={searchResults.length > 0 ? "#cccccc" : "gray"}
            className={`ml-3 mt-1.5 ${searchResults.length > 0 ? "cursor-pointer hover:text-white" : "cursor-not-allowed"}`}
            onClick={() => searchResults.length > 0 && handleReplaceAll()}
          />
        </div>
      </div>

      <div className="overflow-auto">
        {isSearching ? (
          <div className="p-4 text-sm">Searching...</div>
        ) : searchResults.length > 0 ? (
          <div className="text-sm">
            {Object.entries(groupedResults).map(([fileName, results]) => (
              <div key={fileName} className="mb-1">
                <div
                  className="flex items-center py-1 px-2 hover:bg-[#37373d] cursor-pointer"
                  onClick={() => toggleFileExpansion(fileName)}
                >
                  {expandedFiles.has(fileName) ? (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="w-0 h-0 border-l-4 border-l-[#CCCCCC] border-y-4 border-y-transparent transform rotate-90" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="w-0 h-0 border-l-4 border-l-[#CCCCCC] border-y-4 border-y-transparent" />
                    </div>
                  )}
                  {React.createElement(getIconForFile(fileName), {
                    size: 16,
                    className: "mr-2",
                  })}
                  <span className="mr-2">{fileName}</span>
                  <span className="text-xs text-[#858585]">
                    {results.length}{" "}
                    {results.length === 1 ? "match" : "matches"}
                  </span>
                </div>
                {expandedFiles.has(fileName) && (
                  <div className="ml-4">
                    {results.map((result, index) => (
                      <div
                        key={`${result.fileId}-${result.lineNumber}-${index}`}
                        className="group px-4 py-1 hover:bg-[#2d2d2d] cursor-pointer flex items-center justify-between"
                      >
                        <div
                          className="flex items-center flex-1"
                          onClick={() => onResultClick(result)}
                        >
                          <span className="w-12 text-[#858585] mr-2">
                            {result.lineNumber + 1}
                          </span>
                          <span className="truncate text-[#858585]">
                            {result.line}
                          </span>
                        </div>
                        <ReplaceAll
                          size={16}
                          className="opacity-0 group-hover:opacity-100 text-[#858585] hover:text-white ml-2 cursor-pointer"
                          onClick={() => handleReplaceSingle(result)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : searchQuery.length >= 2 ? (
          <div className="p-4 text-sm text-[#858585]">No results found</div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchPanel;
