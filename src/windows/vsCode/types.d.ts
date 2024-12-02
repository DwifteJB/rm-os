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

export { FileSystemNode, LanguageSuggestion, OpenFile };
