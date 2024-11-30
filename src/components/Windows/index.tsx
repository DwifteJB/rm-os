import React, {
  PropsWithChildren,
  useEffect,
  useState,
  useCallback,
  useContext,
  useRef,
  ReactElement,
} from "react";
import { AppContext } from "../mainAppContext";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface SavedWindowState {
  position: Position;
  size: Size;
}

export interface windowProps {
  windowName: string;
  customBackgroundClasses?: string;
  id: string;
  initialSize?: Size;
  minimumSize?: Size;
  icon?: string;
  topBarContent?: ReactElement;
  hideTopBar?: boolean;
  children: ReactElement;
}

const Window = ({
  children,
  windowName,
  customBackgroundClasses,
  id,
  icon,
  minimumSize,
  initialSize,
  topBarContent,
  hideTopBar,
}: PropsWithChildren<windowProps>) => {
  const Context = useContext(AppContext);
  const [windowPosition, setWindowPosition] = useState<Position>({
    x: Math.max(0, (Math.random() * window.innerWidth) / 1.4),
    y: (Math.random() * window.innerHeight) / 2,
  });
  const [windowSize, setWindowSize] = useState<Size>({
    width: initialSize?.width || 384,
    height: initialSize?.height || 384,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [savedWindowState, setSavedWindowState] =
    useState<SavedWindowState | null>(null);
  const [realMinimumSize, setRealMinimumSize] = useState<Size | null>(null);

  useEffect(() => {
    if (minimumSize) {
      setRealMinimumSize(minimumSize);
    } else {
      setRealMinimumSize({ width: 200, height: 150 });
    }
  }, [minimumSize]);

  const resizeStartRef = useRef<Position>({ x: 0, y: 0 });
  const currentSizeRef = useRef<Size>(windowSize);
  const currentPositionRef = useRef<Position>(windowPosition);

  const isHidden = Context.hiddenWindows.has(id);

  const [isAnimating, setIsAnimating] = useState(false);

  const maximize = useCallback(() => {
    setIsAnimating(true);

    if (!isMaximized) {
      setSavedWindowState({
        position: { ...currentPositionRef.current },
        size: { ...currentSizeRef.current },
      });

      setWindowPosition({ x: 0, y: 0 });
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setIsMaximized(true);
    } else {
      if (savedWindowState) {
        setWindowPosition(savedWindowState.position);
        setWindowSize(savedWindowState.size);
      }
      setIsMaximized(false);
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 150);
  }, [isMaximized, savedWindowState]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (Context.mainWindow !== id) {
      Context.setMainWindow(id);
    }

    const containerRect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    });
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;

      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        if (newX < 0 || newY < 0) return;
        if (newX > window.innerWidth - 100 || newY > window.innerHeight - 100)
          return;

        currentPositionRef.current = { x: newX, y: newY };
        setWindowPosition(currentPositionRef.current);

        if (isMaximized) {
          setIsMaximized(false);
          const newSize = savedWindowState?.size || { width: 384, height: 384 };
          currentSizeRef.current = newSize;
          setWindowSize(newSize);
        }
      }

      if (isResizing && !isMaximized) {
        const deltaWidth = e.clientX - resizeStartRef.current.x;
        const deltaHeight = e.clientY - resizeStartRef.current.y;

        const newWidth = currentSizeRef.current.width + deltaWidth;
        const newHeight = currentSizeRef.current.height + deltaHeight;

        const minWidth = realMinimumSize?.width || 200;
        const minHeight = realMinimumSize?.height || 150;
        const maxWidth = window.innerWidth - currentPositionRef.current.x;
        const maxHeight = window.innerHeight - currentPositionRef.current.y;

        const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
        const clampedHeight = Math.min(
          Math.max(newHeight, minHeight),
          maxHeight,
        );

        currentSizeRef.current = {
          width: clampedWidth,
          height: clampedHeight,
        };
        setWindowSize(currentSizeRef.current);

        resizeStartRef.current = {
          x: e.clientX,
          y: e.clientY,
        };
      }
    },
    [isDragging, isResizing, dragOffset, isMaximized, savedWindowState],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (isMaximized) return;
      e.stopPropagation();
      if (Context.mainWindow !== id) {
        Context.setMainWindow(id);
      }
      setIsResizing(true);
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    },
    [isMaximized],
  );

  const handleTitleBarDoubleClick = useCallback(() => {
    maximize();
  }, [maximize]);

  useEffect(() => {
    currentSizeRef.current = windowSize;
  }, [windowSize]);

  useEffect(() => {
    currentPositionRef.current = windowPosition;
  }, [windowPosition]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const windowControls = {
    maximize,
    minimize: () => Context.toggleWindowVisibility(id),
    close: () => Context.RemoveWindow(id),
  };

  return (
    <div
      className={`${customBackgroundClasses} ${Context.mainWindow === id ? "border-solid border-2" : "border-dotted border-2"} rounded-md border-[#474747] absolute
        ${isDragging ? "cursor-grabbing select-none" : ""}
        ${isResizing ? "cursor-se-resize select-none" : ""}
        ${isHidden ? "pointer-events-none opacity-0" : "opacity-100"}
        ${isMaximized ? "rounded-none" : ""}
        ${isAnimating ? "transition-all duration-150 ease-in-out" : ""}`}
      style={{
        top: windowPosition.y,
        left: windowPosition.x,
        width: windowSize.width,
        height: windowSize.height,
        transform: "translate3d(0, 0, 0)",
        userSelect: "none",
        zIndex: Context.mainWindow === id ? 1000 : 999,
        visibility: isHidden ? "hidden" : "visible",
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onMouseDown={() => {
        if (!isHidden) {
          Context.setMainWindow(id);
        }
      }}
    >
      {/* top bar background */}
      {!hideTopBar && (
        <div
          className={`h-10 w-full rounded-t-md cursor-grab relative bg-[#1f1e24]/50
            ${isDragging ? "cursor-grabbing" : ""}
            ${isMaximized ? "rounded-none" : ""}`}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleTitleBarDoubleClick}
          style={{
            zIndex: 1002,
          }}
        >
          {/* Title bar content */}
          <div className="flex flex-row items-center w-full h-full pr-2">
            <div className="flex flex-row items-center w-full ml-2">
              {icon && (
                <>
                  <img src={icon} className="w-4 h-4" alt={windowName} />
                  <div className="w-6 h-6 absolute" />
                </>
              )}
              <span className="text-white w-full inter pl-2">{windowName}</span>
            </div>
            {topBarContent &&
              React.cloneElement(topBarContent, { windowControls })}
            <div className="flex flex-row items-center">
              <div
                className="w-6 h-6 mr-1 flex justify-center items-center text-center cursor-pointer text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  Context.toggleWindowVisibility(id);
                }}
              >
                _
              </div>
              <div
                className="w-6 h-6 mr-1 flex justify-center items-center text-center cursor-pointer text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  maximize();
                }}
              >
                {isMaximized ? "❐" : "❏"}
              </div>
              <div
                className="w-6 h-6 mr-1 flex justify-center items-center text-center cursor-pointer text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  Context.RemoveWindow(id);
                }}
              >
                ✕
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Window content */}
      <div
        className={`${!hideTopBar && "p-2"} overflow-hidden relative`}
        style={{
          height: hideTopBar ? "100%" : "calc(100% - 2.5rem)",
          zIndex: 1001,
        }}
      >
        {React.isValidElement(children) &&
          React.cloneElement<any>(children, {
            ...children.props,
            windowControls,
            onMouseDown: handleMouseDown,
            onDoubleClick: handleTitleBarDoubleClick,
          })}
      </div>
      {/* Resize handle */}
      {!isMaximized && (
        <div
          className="w-4 h-4 absolute bottom-0 right-0 cursor-se-resize  rounded-bl"
          onMouseDown={handleResizeStart}
          style={{
            zIndex: 1002,
          }}
        />
      )}
    </div>
  );
};

export default Window;
