import { Code2 } from "lucide-react";

/*
    children: ReactElement,
    name: string,
    icon?: string,
    customBackgroundClasses?: string,
    minimumSize?: Size,
    initialSize?: Size,
*/

const AboutWindow = () => {
  const window = {
    element: (
      <>
        <div className="w-full h-40 flex flex-col items-center pt-8">
          <Code2 className="w-16 h-16 text-white mb-4" />
          <h1 className="inter text-2xl text-white">RM-OS</h1>
        </div>

        <div className="w-full h-20 text-center p-4">
          <p className="text-white">
            RM-OS is a project created by{" "}
            <a href="https://github.com/DwifteJB" className="text-blue-500">
              DwifteJB
            </a>{" "}
            for fun!
          </p>
        </div>
      </>
    ),
    name: "About",
    icon: "info.png",
    customBackgroundClasses: "bg-black",
    minimumSize: { width: 300, height: 400 },
    initialSize: { width: 300, height: 400 },
  };

  return window;
};

export default AboutWindow;
