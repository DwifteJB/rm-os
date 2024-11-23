import { useEffect, useState, useRef, useContext } from "react";
import { AppContext } from "../../components/mainAppContext";

interface TextContinue {
  text: string;
  color: string;
  time: number;
}

const textToContinue: TextContinue[] = [
  {
    text: "[rm-os]: Loading kernel...",
    color: "text-green-400",
    time: 200,
  },
  {
    text: "[rm-os]: Loading modules...",
    color: "text-green-400",
    time: 300,
  },
  {
    text: "[rm-os]: Loading drivers...",
    color: "text-green-400",
    time: 40,
  },
  {
    text: "[rm-os]: Loading desktop...",
    color: "text-blue-400",
    time: 500,
  },
  {
    text: "[rm-os]: Welcome!",
    color: "text-red-400",
    time: 200,
  },
];

const BootSequence = () => {
  const Context = useContext(AppContext);
  const [addedText, setText] = useState<TextContinue[]>([]);
  const userAgent = navigator.userAgent;
  const mountedRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const showNextText = async () => {
      for (let i = 0; i < textToContinue.length; i++) {
        const text = textToContinue[i];
        const timeout = new Promise((resolve) => {
          const timeoutId = setTimeout(() => {
            setText((prevText) => [...prevText, text]);
            resolve(void 0);
          }, text.time);
          timeoutsRef.current.push(timeoutId);
        });
        await timeout;
      }

      setTimeout(() => {
        Context.loading.setLoading(false);
      }, 300);
    };

    showNextText();

    return () => {
      mountedRef.current = false;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      setText([]);
    };
  }, []);

  return (
    <div className="bg-[#0B0910] w-screen h-screen select-none cursor-pointer text-white p-2 source-code-pro">
      <p className="source-code-pro text-md text-blue-400">
        -----------------------------------
      </p>
      <p className="source-code-pro text-md text-blue-400">
        &nbsp;&nbsp;&nbsp;&nbsp;RM-OS version 0.0.1 web
      </p>
      <p className="source-code-pro text-md text-blue-400">
        -----------------------------------
      </p>
      <div className="w-full h-4" />
      <p className="source-code-pro text-md text-red-400">
        User-Agent: {userAgent}
      </p>
      {addedText.map((text, index) => (
        <p key={index} className={`source-code-pro text-md ${text.color}`}>
          {text.text}
        </p>
      ))}
    </div>
  );
};

export default BootSequence;
