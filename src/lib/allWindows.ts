import AboutWindow from "../windows/about";
import type { Size } from "../types";

export interface WindowConfig {
  Component: () => {
    element: JSX.Element;
    name: string;
    icon?: string;
    customBackgroundClasses?: string;
    minimumSize?: Size;
    initialSize?: Size;
  };
  showInLaunchpad?: boolean;
}

export const allWindows: WindowConfig[] = [
  {
    Component: AboutWindow,
    showInLaunchpad: true,
  },
];
