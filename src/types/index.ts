import { ReactElement } from "react";
import { windowProps } from "../components/Windows";

export interface Settings {
  backgroundImage?: string; // as base64 png
  username?: string; // username for terminal if made
  wallpaperPosition?: "center" | "stretch" | "tile";
}
export interface Size {
  width: number;
  height: number;
}

export interface AppContextType {
  mainWindow: string;
  setMainWindow: (name: string) => void;
  CreateWindow: (
    children: ReactElement,
    name: string,
    icon?: string,
    customBackgroundClasses?: string,
    minimumSize?: Size,
    initialSize?: Size,
  ) => void;
  RemoveWindow: (windowId: string) => void;
  windows: ReactElement<windowProps>[];
  hiddenWindows: Set<string>;
  toggleWindowVisibility: (windowId: string) => void;
  setSettings: (settings: Settings) => void;
  settings: Settings;
  loading: {
    loading: boolean;
    setLoading: (value: boolean) => void;
  };
}
