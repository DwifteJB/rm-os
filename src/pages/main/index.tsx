import TaskBar from "../../components/TaskBar";
import Layout from "../layout";
import { useContext, useEffect } from "react";
import { AppContext } from "../../components/mainAppContext";
import BootSequence from "../boot";
import Shortcut from "../../components/Shortcut";
import TopBar from "../../components/TopBar";

import AboutWindow from "../../windows/about";

const MainPage = () => {
  const Context = useContext(AppContext);

  const windowMake = () => {
    const abt = AboutWindow();
    Context.CreateWindow(
      abt.element,
      abt.name,
      abt.icon,
      abt.customBackgroundClasses,
      abt.minimumSize,
      abt.initialSize,
    );
    // Context.CreateWindow(
    //   <div className="flex flex-col h-full w-full">
    //     <div className="text-center items-center justify-center h-full w-full">
    //       <h1 className="text-white source-code-pro">Welcome to my website!</h1>
    //       <h1 className="text-white source-code-pro">
    //         This is a test to see how text is scaled when the window is
    //         stretched and stuff :3
    //       </h1>
    //       <h1 className="text-white source-code-pro">Yuh Yuh Yuh</h1>
    //     </div>
    //   </div>,
    //   Math.random().toString(36).substring(7),
    //   "winxp/DVD.png",
    //   "bg-black",
    //   {
    //     height: 500,
    //     width: 500,
    //   },
    //   {
    //     height: 600,
    //     width: 600
    //   }
    // );
  };

  useEffect(() => {
    windowMake();
  }, []);

  if (Context.loading.loading) {
    return <BootSequence />;
  }

  return (
    <Layout>
      {import.meta.env.MODE === "development" && (
        <div
          className="absolute bottom-10 right-1 inter text-white"
          style={{
            zIndex: 50000,
          }}
        >
          DEVELOPMENT VERSION
        </div>
      )}
      <div className="h-full w-full p-1">
        <div
          className="grid auto-rows-[76px]"
          style={{
            gridTemplateColumns: "repeat(auto-fill, 76px)",
            gap: "0px",
            justifyContent: "start",
          }}
        >
          {[...Array(40)].map((_, index) => (
            <div key={index} className="p-1">
              <Shortcut
                id={Math.random().toString(36).substring(7)}
                icon="https://github.com/DwifteJB.png"
                text={`Shortcut ${index + 1}`}
                window={{
                  class: "bg-black",
                  element: <div></div>,
                  name: `Shortcut ${index + 1}`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <TaskBar />
      <TopBar />
    </Layout>
  );
};

export default MainPage;
