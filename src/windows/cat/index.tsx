import { useContext, useState } from "react";
import { AppContext } from "../../components/mainAppContext";

const CatPage = () => {
  const Context = useContext(AppContext);
  const [cat, setCat] = useState("https://cataas.com/cat");
  const [forceRender, setForceRender] = useState(false);

  const FetchCat = async () => {
    const res = await fetch("https://cataas.com/cat?cache=" + Math.random());
    const blob = await res.blob();
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    const data = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
    });
    return data;
  };

  const GetNewCat = () => {
    FetchCat().then((data) => {
      // convert to url
      setCat(data);
    });
    setForceRender(!forceRender);
  };

  const SetAsWallpaper = () => {
    Context.setSettings((prev) => {
      localStorage.setItem(
        "settings",
        JSON.stringify({
          ...prev,
          backgroundImage: cat,
          wallpaperPosition: "center",
        }),
      );

      return {
        ...prev,
        backgroundImage: cat,
        wallpaperPosition: "center",
      };
    });
  };

  return (
    <div className="text-white h-full w-full flex flex-col overflow-hidden">
      <div className="h-[90%] w-[100%] p-3 flex items-center justify-center">
        <img
          src={cat}
          alt="meow"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <button className="inter" onClick={GetNewCat}>
        get new cat!
      </button>

      <button className="inter" onClick={SetAsWallpaper}>
        set as wallpaper :3
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
