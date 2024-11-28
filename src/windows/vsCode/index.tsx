import { WindowComponentProps } from "../../types";

import Editor from '@monaco-editor/react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars


const VSCodeContent = ({ windowControls, onMouseDown, onDoubleClick }: WindowComponentProps & { onMouseDown?: (e: React.MouseEvent) => void; onDoubleClick?: (e: React.MouseEvent) => void }) => {
  
  return (
    <div className="p-4 text-white h-full" onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
       <div className="flex flex-col h-full">
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            defaultValue="// some comment"
          />
         </div>
      </div>
    </div>
     
  );
};

export const VSCode = () => {
  const window = {
    element: <VSCodeContent />,
    name: "vscode",
    icon: "cat.png",
    minimumSize: { width: 500, height: 500 },
    initialSize: { width: 500, height: 650 },
    customBackgroundClasses: "",
    hideTopBar: true,
  };

  return window;
};

export default VSCode;
