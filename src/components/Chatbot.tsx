import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Салам! 🕋 Добро пожаловать в халяль кафе «Бишкек»! Я ваш моментальный виртуальный помощник. Чем могу помочь? Пишите любые вопросы или выберите подсказку ниже!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedQuestions = [
    "🍲 Какое у вас меню?",
    "🗺️ Где вы находитесь?",
    "📅 Как забронировать топчан?",
    "🚗 Условия доставки еды"
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsgId = "msg-" + Date.now();
    const currentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: textToSend,
      timestamp: currentTimestamp
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Gather simplified history for the backend
      const historyContext = messages
        .filter((msg) => msg.id !== "welcome")
        .map((msg) => ({
          role: msg.role,
          text: msg.text
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyContext
        })
      });

      if (!res.ok) {
        throw new Error("Chat api request failed");
      }

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        text: data.text || "Извините, возникли трудности при обработке запроса. Попробуйте еще раз.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: "msg-err-" + Date.now(),
        role: "assistant",
        text: "В данный момент сервер доставки ответов перегружен. Кафе 'Бишкек' находится по адресу: ул. Нариманова 49, работаем с 09:00 до 23:00 каждый день! Наш номер: 8-917-893-40-01.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div id="ai-chatbot-widget" className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Bot Launcher Button with animation */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="open-chat-button"
          className="relative group bg-gradient-to-r from-brand-emerald to-brand-emerald-light text-brand-cream border-2 border-brand-gold/60 p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
          title="Открыть чат-бот"
        >
          {/* Animated pulsing outer layer */}
          <span className="absolute inset-0 rounded-full bg-brand-gold/20 animate-ping opacity-70"></span>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <span className="text-sm font-semibold max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap">
              Чат-Помощник
            </span>
          </div>
        </button>
      )}

      {/* Chat window overlay */}
      {isOpen && (
        <div
          id="chatbot-window"
          className="bg-[#101915]/95 border-2 border-brand-gold/30 rounded-2xl w-[90vw] sm:w-[380px] h-[520px] shadow-2xl flex flex-col overflow-hidden backdrop-blur-md animate-fade-in"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-emerald to-[#0a3521] p-4 border-b border-brand-gold/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-950 border border-brand-gold flex items-center justify-center relative shadow-md">
                <span className="text-xl">🕌</span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#101915]"></span>
              </div>
              <div>
                <h4 className="font-serif text-brand-cream font-bold text-sm tracking-wide">Ассистент «Бишкек»</h4>
                <p className="text-[10px] text-brand-gold/90 font-mono font-medium">100% Халяль Помощник • Онлайн</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              id="close-chat-button"
              className="text-brand-cream/60 hover:text-brand-cream bg-white/5 hover:bg-white/10 rounded-lg p-1.5 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
            {messages.map((message) => {
              const isAssistant = message.role === "assistant";
              return (
                <div
                  key={message.id}
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-sm ${
                    isAssistant
                      ? "bg-[#1b2b23] text-brand-cream border border-brand-emerald-light/40 rounded-tl-none"
                      : "bg-brand-gold text-brand-dark font-medium rounded-tr-none"
                  }`}>
                    <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
                    <span className={`text-[9px] block text-right mt-1 opacity-60 ${
                      isAssistant ? "text-brand-cream/60" : "text-brand-dark/70"
                    }`}>
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#1b2b23] text-brand-cream/60 px-4 py-3 rounded-2xl rounded-tl-none border border-brand-emerald-light/30 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-1">Печатает ответ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion tags container */}
          <div className="px-4 py-2 border-t border-brand-gold/10 bg-black/20 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-thin select-none">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                id={`suggestion-chip-${idx}`}
                onClick={() => !isLoading && handleSendMessage(q.replace(/[^\s\wА-Яа-я?,.-]/g, "").trim())}
                className="text-[11px] bg-[#162520] hover:bg-brand-emerald text-brand-cream/90 border border-brand-gold/20 hover:border-brand-gold/50 px-2.5 py-1 rounded-full transition duration-150 shrink-0 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-brand-gold/20 bg-brand-dark/95 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Напишите вопрос о меню, резерве..."
              disabled={isLoading}
              id="chat-input-field"
              className="flex-1 bg-[#15231e] text-brand-cream text-xs placeholder-brand-cream/45 border border-brand-emerald-light rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-gold/60"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              id="send-chat-message-button"
              className="bg-brand-gold hover:bg-brand-gold-dark disabled:bg-neutral-800 disabled:text-neutral-500 text-brand-dark font-bold rounded-xl px-3 flex items-center justify-center transition duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
