import React, { useCallback } from "react";
import { Upload } from "lucide-react";

interface FileSystemImportProps {
  onImport: (files: File[]) => void;
}

const FileSystemImport = ({ onImport }: FileSystemImportProps) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onImport(files);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const items = Array.from(e.dataTransfer.items);
      const files: File[] = [];

      const processEntry = async (entry: FileSystemEntry | null) => {
        if (!entry) return;

        if (entry.isFile) {
          const file = entry as FileSystemFileEntry;
          return new Promise<void>((resolve) => {
            file.file((file) => {
              files.push(file);
              resolve();
            });
          });
        } else if (entry.isDirectory) {
          const reader = (entry as FileSystemDirectoryEntry).createReader();
          const entries = await new Promise<FileSystemEntry[]>((resolve) => {
            reader.readEntries((entries) => resolve(entries));
          });
          await Promise.all(entries.map(processEntry));
        }
      };

      Promise.all(
        items.map((item) => processEntry(item.webkitGetAsEntry())),
      ).then(() => onImport(files));
    },
    [onImport],
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="relative"
    >
      <input
        type="file"
        className="hidden"
        id="file-import"
        multiple
        onChange={handleFileSelect}
      />
      <Upload
        color="#868686"
        className="cursor-pointer"
        size={24}
        onClick={() => document.getElementById("file-import")?.click()}
      />
    </div>
  );
};

export default FileSystemImport;
