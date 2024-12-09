/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
    <div className="text-green-400 h-full w-full flex flex-col overflow-hidden font-mono">
      <div className="flex-1 overflow-y-auto p-2" onScroll={handleScroll}>
        {loading && <div className="text-green-400">Loading...</div>}
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <div
              className={`flex items-start space-x-2 ${
                msg.username !== username ? "text-yellow-400" : "text-green-400"
              }`}
            >
              <span className="text-gray-500">$</span>
              <span className="font-bold">{msg.username}@os.rmfosho.me:</span>
              <span className="whitespace-pre-wrap break-all">
                {msg.message}
              </span>
            </div>
          </div>
        ))}
        

        <div className="flex items-center space-x-2">
          <span className="text-gray-500">$</span>
          <span className="text-green-400">{username}@os.rmfosho.me: </span>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            className="flex-1 bg-transparent text-green-400 focus:outline-none font-mono border-none"
            placeholder="Type your message..."
          />
        </div>

        <div ref={messagesEndRef} />

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
