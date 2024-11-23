import { useState } from "react";

const CatPage = () => {
  const [cat, setCat] = useState("https://cataas.com/cat");
  const [forceRender, setForceRender] = useState(false);

  const GetNewCat = () => {
    setCat("https://cataas.com/cat?cache=" + Math.random());
    setForceRender(!forceRender);
  };

  return (
    <div className="text-white h-full w-full flex flex-col overflow-hidden">
      <div className="h-[95%] w-[100%] p-3 flex items-center justify-center">
        <img
          src={cat}
          alt="meow"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <button className="inter" onClick={GetNewCat}>
        get new cat!
      </button>
    </div>
  );
};

export const MeowCat = () => {
  const window = {
    element: <CatPage />,
    name: "cat meow :3",
    icon: "cat.png",
    minimumSize: { width: 200, height: 400 },
    initialSize: { width: 500, height: 500 },
    customBackgroundClasses: "",
  };

  return window;
};

export default MeowCat;
