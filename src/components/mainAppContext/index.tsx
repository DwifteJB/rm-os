import { createContext, ReactElement, useState } from "react";
import { AppContextType, Size } from "../../types";
import Window, { windowProps } from "../Windows";

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [mainWindow, setMainWindow] = useState<string>("");
  const [windows, setWindows] = useState<ReactElement<windowProps>[]>([]);
  const [hiddenWindows, setHiddenWindows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(
    import.meta.env.MODE === "development" ? false : true,
  );

  const CreateWindow = (
    children: ReactElement,

    name: string,
    icon?: string,
    customBackgroundClasses?: string,
    minimumSize?: Size,
    initialSize?: Size
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
      }}
    >
      {children}
      {!loading && windows}
    </AppContext.Provider>
  );
};
