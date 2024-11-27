import {
  PropsWithChildren,
  useState,
  useCallback,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";
import { AppContext } from "../components/mainAppContext";

export const SelectionContext = createContext<{
  selectedShortcuts: Set<string>;
  setSelectedShortcuts: (shortcuts: Set<string>) => void;
}>({
  selectedShortcuts: new Set(),
  setSelectedShortcuts: () => {},
});

interface Position {
  x: number;
  y: number;
}

interface SelectionBox {
  start: Position;
  end: Position;
}

const Layout = ({ children }: PropsWithChildren<object>) => {
  const { settings } = useContext(AppContext);
  const Context = useContext(AppContext);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [selectedShortcuts, setSelectedShortcuts] = useState<Set<string>>(
    new Set(),
  );
  const layoutRef = useRef<HTMLDivElement>(null);

  const getRelativePosition = useCallback(
    (e: MouseEvent | React.MouseEvent): Position => {
      const rect = layoutRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [],
  );

  const checkIntersection = useCallback(
    (selectionRect: DOMRect, shortcutRect: DOMRect) => {
      return !(
        selectionRect.right < shortcutRect.left ||
        selectionRect.left > shortcutRect.right ||
        selectionRect.bottom < shortcutRect.top ||
        selectionRect.top > shortcutRect.bottom
      );
    },
    [],
  );

  const updateSelectedShortcuts = useCallback(() => {
    if (!selectionBox || !isDragging) return;

    const selectionRect = new DOMRect(
      Math.min(selectionBox.start.x, selectionBox.end.x),
      Math.min(selectionBox.start.y, selectionBox.end.y),
      Math.abs(selectionBox.end.x - selectionBox.start.x),
      Math.abs(selectionBox.end.y - selectionBox.start.y),
    );

    const shortcuts = Array.from(
      document.querySelectorAll("[data-shortcut-id]"),
    ).map((element) => ({
      id: element.getAttribute("data-shortcut-id") || "",
      rect: element.getBoundingClientRect(),
    }));

    const layoutRect = layoutRef.current?.getBoundingClientRect();
    if (!layoutRect) return;

    const intersectingShortcuts = shortcuts.filter(({ rect }) => {
      const relativeRect = new DOMRect(
        rect.left - layoutRect.left,
        rect.top - layoutRect.top,
        rect.width,
        rect.height,
      );
      return checkIntersection(selectionRect, relativeRect);
    });

    setSelectedShortcuts(new Set(intersectingShortcuts.map((s) => s.id)));
  }, [selectionBox, isDragging, checkIntersection]);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !layoutRef.current?.contains(target) ||
        target.closest(".taskbar") ||
        target.closest(".window")
      ) {
        return;
      }

      if (!e.shiftKey) {
        setSelectedShortcuts(new Set());
      }

      const startPos = getRelativePosition(e);
      setIsSelecting(true);
      setSelectionBox({
        start: startPos,
        end: startPos,
      });
    },
    [getRelativePosition],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isSelecting || !selectionBox) return;
      const currentPos = getRelativePosition(e);

      if (
        !isDragging &&
        (Math.abs(currentPos.x - selectionBox.start.x) > 5 ||
          Math.abs(currentPos.y - selectionBox.start.y) > 5)
      ) {
        setIsDragging(true);
      }

      setSelectionBox((prev) => (prev ? { ...prev, end: currentPos } : null));
    },
    [isSelecting, selectionBox, isDragging, getRelativePosition],
  );

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    setIsDragging(false);
    setSelectionBox(null);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (isDragging) {
      updateSelectedShortcuts();
    }
  }, [isDragging, selectionBox, updateSelectedShortcuts]);

  const getSelectionStyles = useCallback(() => {
    if (!selectionBox) return {};
    const left = Math.min(selectionBox.start.x, selectionBox.end.x);
    const top = Math.min(selectionBox.start.y, selectionBox.end.y);
    const width = Math.abs(selectionBox.end.x - selectionBox.start.x);
    const height = Math.abs(selectionBox.end.y - selectionBox.start.y);
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  }, [selectionBox]);

  const getBackgroundStyles = () => {
    if (!settings.backgroundImage)
      return {
        backgroundImage: `url(/wallpaper.jpg)`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      };

    return {
      backgroundImage: `url(${settings.backgroundImage})`,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    };
  };

  return (
    <SelectionContext.Provider
      value={{ selectedShortcuts, setSelectedShortcuts }}
    >
      <div
        ref={layoutRef}
        onClick={() => {
          setSelectedShortcuts(new Set());
          Context.setMainWindow("");
        }}
        style={{
          position: "relative",
          cursor: isDragging ? "crosshair" : "default",
          ...getBackgroundStyles(),
        }}
        className="flex w-screen h-screen min-w-screen min-h-screen relative select-none bg-[#0B0B0B]"
      >
        <div className="flex flex-col h-full w-full relative">{children}</div>
        {isSelecting && selectionBox && isDragging && (
          <div
            className="absolute border-2 border-gray-500 border-dotted bg-blue-200/10 pointer-events-none"
            style={{
              ...getSelectionStyles(),
              zIndex: 5,
            }}
          />
        )}
      </div>
    </SelectionContext.Provider>
  );
};

export default Layout;
