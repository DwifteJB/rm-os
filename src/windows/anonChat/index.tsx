import { Send } from "lucide-react";
import { useEffect, useState, useRef } from "react";

import toast from "react-hot-toast";
const ChatPage = () => {
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [page, setPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`wss://${import.meta.env.VITE_WEB_URL}/chat`);
    ws.onopen = () => {
      console.log("Connected to chat server");
      toast.success("Connected to chat server", {
        style: {
          backgroundColor: "#101010",
          color: "#fff",
        },
      });
      handleGetMessages();
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("data", data);
      if (data.type === "username") {
        setUsername(data.username);
      } else if (data.type === "message") {
        setMessages((prevMessages) => [...prevMessages, data]);
      } else if (data.type === "messageSent") {
        setNewMessage("");
      } else if (data.type === "error") {
        setNewMessage("");
        toast.error(data.message, {
          style: {
            backgroundColor: "#101010",
            color: "#fff",
          },
        });
      }
    };
    ws.onclose = () => {
      console.log("Disconnected from chat server");
    };
    setWebsocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (page > 1) {
      handleGetMessages();
    }
  }, [page]);

  const handleGetMessages = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`/chat/getMessages?page=${page}`);
      const data = await response.json();
      console.log(data.reverse(), data);
      setMessages((prevMessages) => [
        ...data.reverse().map((msg: any) => ({
          type: "message",
          message: msg.content,
          username: msg.author,
        })),
        ...prevMessages,

      ]);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (websocket && newMessage.trim() !== "") {
      websocket.send(JSON.stringify({ type: "message", message: newMessage }));
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className="text-white h-full w-full flex flex-col overflow-hidden">
      <h1 className="">You are logged in as: {username}</h1>
      <div
        className="flex-1 overflow-y-auto scroll-m-1 scroll-smooth "
        onScroll={handleScroll}
      >
        <div className="min-h-full flex flex-col justify-end">
          <div className="h-4"></div>
          {loading && <div>Loading...</div>}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex inter ${
                msg.username === username ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2 inter m-2 rounded-lg ${
                  msg.username === username
                    ? "bg-[#C22DC2]/50"
                    : "bg-gray-500/50"
                }`}
              >
                <strong className="inter-bold">{msg.username}: </strong>
                <span className="inter">{msg.message}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          className="flex-1 p-2 bg-transparent inter border border-white rounded-xl"
        />
        <button onClick={handleSendMessage} className="p-2 pl-4">
          <Send />
        </button>
      </div>
    </div>
  );
};

export const ChatWindow = () => {
  const window = {
    element: <ChatPage />,
    name: "chat",
    icon: "message-circle.png",
    minimumSize: { width: 600, height: 600 },
    initialSize: { width: 700, height: 700 },
    customBackgroundClasses: "",
  };

  return window;
};

export default ChatWindow;
