import { ReactElement } from "react";
import { windowProps } from "../components/Windows";

export interface Settings {
  backgroundImage?: string; // as base64 png
  username?: string;
  wallpaperPosition?: "center" | "stretch" | "tile";
}
export interface Size {
  width: number;
  height: number;
}

export interface WindowComponent {
  element: ReactElement;
  name: string;
  icon?: string;
  customBackgroundClasses?: string;
  minimumSize?: Size;
  initialSize?: Size;
  hideTopBar?: boolean;
}

export interface WindowConfig {
  Component: () => WindowComponent;
  showInLaunchpad?: boolean;
}

export interface WindowControls {
  maximize: () => void;
  minimize: () => void;
  close: () => void;
}

export interface WindowComponentProps {
  windowControls?: WindowControls;
  topBarContent?: ReactElement;
}

export interface AppContextType {
  mainWindow: string;
  setMainWindow: (name: string) => void;
  CreateWindow: (
    children: ReactElement<WindowComponentProps>,
    name: string,
    icon?: string,
    customBackgroundClasses?: string,
    minimumSize?: Size,
    initialSize?: Size,
    hideTopBar?: boolean,
  ) => void;
  RemoveWindow: (windowId: string) => void;
  windows: ReactElement<windowProps>[];
  hiddenWindows: Set<string>;
  toggleWindowVisibility: (windowId: string) => void;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  settings: Settings;
  loading: {
    loading: boolean;
    setLoading: (value: boolean) => void;
  };
}
