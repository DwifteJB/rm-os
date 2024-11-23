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
    // Context.CreateWindow(
    //   <ComponentExample />,
    //   "Test Window",
    // )
    const abt = AboutWindow();
    Context.CreateWindow(
      abt.element,
      abt.name,
      abt.icon,
      abt.customBackgroundClasses,
      abt.minimumSize,
      abt.initialSize,
    );
   
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
