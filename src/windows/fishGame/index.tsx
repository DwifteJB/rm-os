import { useEffect, useRef } from "react";

declare const __uv$config: {
  prefix: string;
  encodeUrl: (url: string) => string;
};

declare const BareMux: {
  BareMuxConnection: new (worker: string) => any;
};

const BrowserComponent = () => {
  const urlInputRef = useRef<HTMLInputElement>(null);
  const iframeWindowRef = useRef<HTMLIFrameElement>(null);
  const connectionRef = useRef<any>(null);

  useEffect(() => {
    connectionRef.current = new BareMux.BareMuxConnection("/baremux/worker.js");
    const wispUrl = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/wisp/`;
    connectionRef.current.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("searchButton")?.click();
      }
    };

    const urlInput = urlInputRef.current;
    if (urlInput) {
      urlInput.addEventListener("keydown", handleKeyDown);
      return () => urlInput.removeEventListener("keydown", handleKeyDown);
    }
  }, []);

  useEffect(() => {
    if (iframeWindowRef.current) {
      iframeWindowRef.current.src =
        __uv$config.prefix + __uv$config.encodeUrl("https://rmfosho.me/fish");
    }
  }, [iframeWindowRef]);

  return (
    <div className="text-white bg-[#2B2A33] h-full w-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0">
        <iframe
          ref={iframeWindowRef}
          title="iframeWindow"
          className="w-full h-full border-none"
          security="sandbox"
        />
      </div>
    </div>
  );
};

export const Fishing = () => {
  const window = {
    element: <BrowserComponent />,
    name: "simple fishing",
    icon: "fish.png",
    minimumSize: { width: 500, height: 500 },
    initialSize: { width: 800, height: 500 },
  };

  return window;
};

export default Fishing;
