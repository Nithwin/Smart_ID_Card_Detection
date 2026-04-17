"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import Image from "next/image";

interface AlertData {
  id: string;
  identified_name?: string;
  timestamp: string;
  face_image?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  data?: AlertData[];
  sql?: string;
}

export function GuardAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "welcome",
    role: "assistant",
    text: "Hello! I am your AI Guard Assistant. Ask me anything about the violation database. For example: 'Show me all violations by Kavin yesterday' or 'How many people were caught today?'",
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    
    const newMsg: ChatMessage = { id: Date.now().toString(), role: "user", text: userMsg };
    setMessages(prev => [...prev, newMsg]);
    setIsLoading(true);

    try {
      // In production, ensure this points to the correct backend host
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      
      const result = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: result.response,
        data: result.data,
        sql: result.sql
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Error: Could not connect to the backend API. Is the server running and GROQ_API_KEY set?"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-[400px] h-[600px] max-h-[80vh] mb-4 glass-panel rounded-2xl border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-blue-950/50 border-b border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">AI Guard Assistant</h3>
                  <p className="text-[10px] text-blue-400">Powered by Llama-3 (Groq)</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-muted hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-sm"}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  
                  {/* Results Display */}
                  {msg.data && msg.data.length > 0 && (
                    <div className="mt-2 w-full flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {msg.data.map((alert: AlertData) => (
                        <div key={alert.id} className="shrink-0 w-[120px] bg-slate-900 border border-red-500/30 rounded-xl overflow-hidden shadow-lg">
                          {alert.face_image ? (
                            <Image src={`data:image/jpeg;base64,${alert.face_image}`} alt="Face" width={120} height={120} className="w-full h-24 object-cover" />
                          ) : (
                            <div className="w-full h-24 bg-slate-800 flex items-center justify-center"><User className="w-8 h-8 opacity-20" /></div>
                          )}
                          <div className="p-2 text-center bg-red-950/40">
                            <p className="text-xs font-bold text-red-400 truncate">{alert.identified_name || "Unknown"}</p>
                            <p className="text-[9px] text-muted">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.sql && (
                    <div className="mt-1">
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        SQL: {msg.sql}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-slate-800/80 border border-slate-700 text-slate-200 p-3 rounded-2xl rounded-tl-sm text-sm flex gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-foreground/10">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask the database..." 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)] border-2 border-blue-400/50 hover:bg-blue-500 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
