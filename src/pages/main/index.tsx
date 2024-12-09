import TaskBar from "../../components/TaskBar";
import Layout from "../layout";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../components/mainAppContext";
import BootSequence from "../boot";
import Shortcut from "../../components/Shortcut";
import TopBar from "../../components/TopBar";

//import AboutWindow from "../../windows/about";
import { allWindows } from "../../lib/allWindows";
import MeowCat from "../../windows/cat";
import VSCode from "../../windows/vsCode";
import ChatWindow from "../../windows/anonChat";

const MainPage = () => {
  const Context = useContext(AppContext);
  const [hasMadeFirstRender, setHasMadeFirstRender] = useState(false);
  const [hasMadeSecondRender, setHasMadeSecondRender] = useState(false);

  useEffect(() => {
    const abt = ChatWindow();
    Context.CreateWindow(
      abt.element,
      abt.name,
      abt.icon,
      abt.customBackgroundClasses,
      abt.minimumSize,
      abt.initialSize,
    );

    setHasMadeFirstRender(true);
  }, []);

  useEffect(() => {
    if (!hasMadeFirstRender) return;
    const code = VSCode();

    Context.CreateWindow(
      code.element,
      code.name,
      code.icon,
      code.customBackgroundClasses,
      code.minimumSize,
      code.initialSize,
      code.hideTopBar,
    );
    setHasMadeSecondRender(true);
  }, [hasMadeFirstRender]);

  useEffect(() => {
    if (!hasMadeSecondRender) return;

    const cat = MeowCat();

    Context.CreateWindow(
      cat.element,
      cat.name,
      cat.icon,
      cat.customBackgroundClasses,
      cat.minimumSize,
      cat.initialSize,
    );
  }, [hasMadeSecondRender]);

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
          {[...allWindows].map((windowConfig, index) => (
            <div key={index} className="p-1">
              <Shortcut
                id={Math.random().toString(36).substring(7)}
                icon={windowConfig.Component().icon as string}
                text={windowConfig.Component().name}
                window={{
                  element: windowConfig.Component().element,
                  customBackgroundClasses: windowConfig.Component()
                    .customBackgroundClasses as string,
                  name: windowConfig.Component().name,
                  minimumSize: windowConfig.Component().minimumSize,
                  initialSize: windowConfig.Component().initialSize,
                  hideTopBar: windowConfig.Component().hideTopBar,
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
