"use client";

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hi! How can I assist you today Sir?" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (userInput.trim()) {
      const userMessage = { role: "user", content: userInput };
      setMessages([...messages, userMessage]);
      setUserInput(""); // Clear input
      setLoading(true);

      try {
        const response = await fetch("../pages/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: userInput }),
        });

        const data = await response.json();
        const botMessage = { role: "bot", content: data.text };

        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error("Error fetching chat response:", error);
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: "Something went wrong. Please try again." },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-blue-600 dark:bg-gray-800 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">Freelancing AI Chat</h1>
      </header>

      {/* Main Chat Area */}
      <main className="flex-grow p-6 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === "bot"
                  ? "bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-200 self-start"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 self-end"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
        {loading && (
          <div className="text-center text-blue-600 dark:text-blue-400">
            Typing...
          </div>
        )}
      </main>

      {/* Input Box */}
      <footer className="bg-white dark:bg-gray-800 py-4 px-6 shadow">
        <div className="flex items-center gap-4">
          <textarea
            className="flex-grow p-3 border border-gray-300 dark:border-gray-700 rounded resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            rows={1}
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          ></textarea>
          <button
            onClick={handleSend}
            className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded shadow hover:bg-blue-700 dark:hover:bg-blue-800"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </footer>
    </div>
  );
}
