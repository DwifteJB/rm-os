import AboutWindow from "../windows/about";
import Browser from "../windows/browser";
import type { Size } from "../types";
import Fishing from "../windows/fishGame";
import MeowCat from "../windows/cat";
import Settings from "../windows/settings";
import MusicPlayer from "../windows/musicPlayer";
import ChatWindow from "../windows/anonChat";

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
  {
    Component: Browser,
    showInLaunchpad: true,
  },
  {
    Component: Fishing,
    showInLaunchpad: true,
  },
  {
    Component: MeowCat,
    showInLaunchpad: true,
  },
  {
    Component: Settings,
    showInLaunchpad: true,
  },
  {
    Component: MusicPlayer,
    showInLaunchpad: true,
  },
  {
    Component: ChatWindow,
    showInLaunchpad: true,
  },
];
