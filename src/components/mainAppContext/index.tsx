import { createContext, ReactElement, useEffect, useState } from "react";
import { AppContextType, Settings, Size } from "../../types";
import Window, { windowProps } from "../Windows";

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [mainWindow, setMainWindow] = useState<string>("");
  const [windows, setWindows] = useState<ReactElement<windowProps>[]>([]);
  const [hiddenWindows, setHiddenWindows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(
    import.meta.env.MODE === "development" ? false : true,
  );
  const [settings, setSettings] = useState<Settings>({});

  const CreateWindow = (
    children: ReactElement,
    name: string,
    icon?: string,
    customBackgroundClasses?: string,
    minimumSize?: Size,
    initialSize?: Size,
    hideTopBar?: boolean,
  ) => {
    const windowId = Math.random().toString(36).substring(7);
    const window = (
      <Window
        key={windowId}
        windowName={name}
        id={windowId}
        icon={icon}
        customBackgroundClasses={customBackgroundClasses}
        minimumSize={minimumSize}
        initialSize={initialSize}
        hideTopBar={hideTopBar}
      >
        {children}
      </Window>
    );
    setWindows([...windows, window]);
  };

  const RemoveWindow = (windowId: string) => {
    setWindows(windows.filter((w) => w.props.id !== windowId));
    setHiddenWindows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(windowId);
      return newSet;
    });
  };

  const toggleWindowVisibility = (windowId: string) => {
    setHiddenWindows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(windowId)) {
        newSet.delete(windowId);
        setMainWindow(
          windows.find((w) => w.props.id === windowId)?.props.windowName || "",
        );
      } else {
        newSet.add(windowId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (localStorage.getItem("settings")) {
      setSettings(JSON.parse(localStorage.getItem("settings") as string));
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        mainWindow,
        setMainWindow,
        CreateWindow,
        RemoveWindow,
        windows,
        hiddenWindows,
        toggleWindowVisibility,
        loading: {
          loading,
          setLoading,
        },
        settings,
        setSettings,
      }}
    >
      {children}
      {!loading && windows}
    </AppContext.Provider>
  );
};
