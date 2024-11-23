import { useContext, useState } from "react";
import { AppContext } from "../mainAppContext";

import { LayoutGrid } from "lucide-react";

import { Popover } from "react-tiny-popover";
import LaunchPad from "../Launchpad";

const TaskBarItem = ({
  windowName,
  icon,
  id,
}: {
  windowName: string;
  id: string;
  icon?: string;
}) => {
  const Context = useContext(AppContext);
  const isHidden = Context.hiddenWindows.has(id);
  const [popoverOpen, setPopoverOpen] = useState(false);
  return (
    <div
      key={id}
      className={`w-8 h-8 backdrop-blur-sm rounded-xl ml-2 cursor-pointer`}
      onClick={() => Context.toggleWindowVisibility(id)}
    >
      <Popover
        isOpen={popoverOpen}
        positions={["top"]}
        content={
          <div className="bg-[#0e1111] rounded-lg border-2 border-[#0e1111] p-3">
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-md">{windowName}</span>
            </div>
          </div>
        }
      >
        <div
          className="flex items-center justify-center w-full h-full text-center align-middle"
          onMouseEnter={() => {
            setPopoverOpen(true);
          }}
          onMouseLeave={() => {
            setPopoverOpen(false);
          }}
        >
          {icon ? (
            <img
              src={icon}
              className={`w-6 h-6 ${isHidden ? "border-blue-950 border-b-2" : ""}`}
            />
          ) : (
            <span className="funny-font text-white text-center">
              {windowName.substring(0, 1).toUpperCase()}
            </span>
          )}
        </div>
      </Popover>
    </div>
  );
};
const TaskBar = () => {
  const Context = useContext(AppContext);
  const [isLaunchPadOpen, setLaunchPadOpen] = useState(false);

  return (
    <header
      className="w-screen h-10 absolute bottom-0"
      style={{
        zIndex: 6,
      }}
    >
      <LaunchPad isOpen={isLaunchPadOpen} setIsOpen={setLaunchPadOpen} />
      <div className="flex justify-between items-center h-full">
        <div className="flex flex-row items-center pl-2 pb-4">
          <div
            className="w-10 h-10 items-center align-middle justify-center text-center flex rounded bg-[#C22DC2] cursor-pointer"
            onClick={() => {
              setLaunchPadOpen(!isLaunchPadOpen);
            }}
          >
            <LayoutGrid color="white" />
          </div>
          {Context.windows.map((win) => {
            return (
              <TaskBarItem
                windowName={win.props.windowName}
                icon={win.props.icon}
                id={win.props.id}
              />
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default TaskBar;
