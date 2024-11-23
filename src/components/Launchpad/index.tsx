import { useContext } from "react";
import { allWindows } from "../../lib/allWindows";
import { AppContext } from "../mainAppContext";

const LaunchPad = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { CreateWindow } = useContext(AppContext);

  const handleLaunchApp = (windowConfig: (typeof allWindows)[0]) => {
    const windowData = windowConfig.Component();
    CreateWindow(
      windowData.element,
      windowData.name,
      windowData.icon,
      windowData.customBackgroundClasses,
      windowData.minimumSize,
      windowData.initialSize,
    );
    setIsOpen(false);
  };

  return (
    <div
      className="h-screen w-screen absolute bg-black/80"
      onClick={() => setIsOpen(!isOpen)}
      style={{
        zIndex: 5000,
        display: isOpen ? "block" : "none",
        top: "100%",
        left: "50%",
        transform: "translate(-50%, -100%)",
      }}
    >
      <div
        className="bg-black border-white border-dotted rounded-md w-[80%] h-[80%] border-4 absolute"
        style={{
          zIndex: 34534534,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-full p-8 overflow-y-auto">
          <div className="grid grid-cols-4 gap-4 auto-rows-max">
            {allWindows
              .filter((window) => window.showInLaunchpad)
              .map((window, index) => {
                const windowData = window.Component();
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center p-4 hover:bg-white/10 rounded-lg cursor-pointer"
                    onClick={() => handleLaunchApp(window)}
                  >
                    {windowData.icon ? (
                      <img
                        src={windowData.icon}
                        alt={windowData.name}
                        className="w-16 h-16 mb-2"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-white/10 rounded-lg mb-2" />
                    )}
                    <span className="text-white text-sm">
                      {windowData.name}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchPad;
