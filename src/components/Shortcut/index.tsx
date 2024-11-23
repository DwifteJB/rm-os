import { ReactElement, useContext } from "react";
import { AppContext } from "../mainAppContext";
import { SelectionContext } from "../../pages/layout";
import { Size } from "../../types";

const Shortcut = ({
  icon,
  text,
  window,
  id,
}: {
  icon: string;
  text: string;
  window: {
    element: ReactElement;
    name: string;
    class: string;
    minimumSize?: Size;
    initialSize?: Size;
  };
  id: string;
}) => {
  const Context = useContext(AppContext);
  const { selectedShortcuts } = useContext(SelectionContext);
  const isSelected = selectedShortcuts.has(id);

  return (
    <div
      data-shortcut-id={id}
      onClick={() => {
        Context.CreateWindow(window.element, window.name, icon, window.class, window.minimumSize, window.initialSize);
      }}
      className={`flex flex-col items-center w-[74px] h-[74px] rounded hover:bg-blue-500/30 cursor-pointer ${
        isSelected ? "bg-[#C22DC2]/40" : ""
      }`}
    >
      <div className="w-8 h-8 mt-2 pointer-events-none">
        <img
          src={icon}
          alt={text}
          className="w-full h-full object-contain z-10 pointer-events-none"
          draggable="false"
          
        />
      </div>
      <span className="text-white text-xs text-center inter leading-tight px-1 mt-1 select-none break-words w-full line-clamp-2">
        {text}
      </span>
    </div>
  );
};

export default Shortcut;
