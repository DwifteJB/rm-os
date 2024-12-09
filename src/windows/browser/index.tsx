/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";

declare const __uv$config: {
  prefix: string;
  encodeUrl: (url: string) => string;
};

declare const BareMux: {
  BareMuxConnection: new (worker: string) => any;
};

const BrowserComponent = () => {
  const [url, setUrl] = useState("https://google.com");
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

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    let inputUrl = url;

    if (!inputUrl.includes(".")) {
      inputUrl =
        "https://www.google.com/search?q=" + encodeURIComponent(inputUrl);
    } else if (
      !inputUrl.startsWith("http://") &&
      !inputUrl.startsWith("https://")
    ) {
      inputUrl = "https://" + inputUrl;
    }

    if (!(await connectionRef.current?.getTransport())) {
      const wispUrl = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/wisp/`;
      await connectionRef.current?.setTransport("/epoxy/index.mjs", [
        { wisp: wispUrl },
      ]);
    }

    if (iframeWindowRef.current) {
      iframeWindowRef.current.src =
        __uv$config.prefix + __uv$config.encodeUrl(inputUrl);
    }
  };

  useEffect(() => {
    if (iframeWindowRef.current) {
      iframeWindowRef.current.src =
        __uv$config.prefix + __uv$config.encodeUrl("https://google.com");
    }
  }, [iframeWindowRef]);

  return (
    <div className="text-white bg-[#2B2A33] h-full w-full flex flex-col overflow-hidden">
      <div className="w-full p-2 flex items-center gap-2 bg-[#42414D] shrink-0">
        <div className="flex-1 flex items-center bg-[#1C1B22] rounded-lg overflow-hidden border border-[#52525E] focus-within:border-[#00ddff]">
          <input
            id="urlInput"
            ref={urlInputRef}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Search with Google or enter address"
            className="flex-1 bg-transparent px-4 py-2 outline-none text-sm"
          />
          <button
            id="searchButton"
            onClick={handleSearch}
            className="px-4 py-2 hover:bg-[#52525E] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </div>
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

export const Browser = () => {
  const window = {
    element: <BrowserComponent />,
    name: "Browser",
    icon: "earth.png",
    minimumSize: { width: 500, height: 500 },
    initialSize: { width: 800, height: 500 },
  };

  return window;
};

export default Browser;
