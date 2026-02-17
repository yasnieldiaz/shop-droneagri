"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MessageSquare, X, Send, RotateCcw, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const quickReplies: Record<string, string[]> = {
  pl: ["Jakie drony oferujecie?", "Specyfikacja P150 Max", "Przepisy ULC drony rolnicze", "Kontakt"],
  en: ["What drones do you offer?", "P150 Max specifications", "EU drone regulations", "Contact info"],
  es: ["¿Qué drones ofrecen?", "Especificaciones P150 Max", "Regulaciones de drones UE", "Contacto"],
  de: ["Welche Drohnen bieten Sie an?", "P150 Max Spezifikationen", "EU-Drohnenvorschriften", "Kontakt"],
  cs: ["Jaké drony nabízíte?", "Specifikace P150 Max", "Předpisy EU pro drony", "Kontakt"],
  nl: ["Welke drones bieden jullie aan?", "P150 Max specificaties", "EU-droneregels", "Contact"],
};

const titles: Record<string, { title: string; subtitle: string; placeholder: string; welcome: string }> = {
  pl: {
    title: "AgriBot",
    subtitle: "Asystent dronów rolniczych XAG",
    placeholder: "Napisz wiadomość...",
    welcome: "Cześć! Jestem AgriBot, asystent DroneAgri.pl. Mogę pomóc z informacjami o dronach rolniczych XAG, specyfikacjach produktów, przepisach lotniczych i więcej. Jak mogę Ci pomóc?",
  },
  en: {
    title: "AgriBot",
    subtitle: "XAG Agricultural Drone Assistant",
    placeholder: "Type a message...",
    welcome: "Hello! I'm AgriBot, your DroneAgri.pl assistant. I can help with XAG agricultural drone information, product specs, drone regulations, and more. How can I help you?",
  },
  es: {
    title: "AgriBot",
    subtitle: "Asistente de drones agrícolas XAG",
    placeholder: "Escribe un mensaje...",
    welcome: "¡Hola! Soy AgriBot, asistente de DroneAgri.pl. Puedo ayudarte con información sobre drones agrícolas XAG, especificaciones, regulaciones y más. ¿En qué puedo ayudarte?",
  },
  de: {
    title: "AgriBot",
    subtitle: "XAG Landwirtschaftsdrohnen-Assistent",
    placeholder: "Nachricht schreiben...",
    welcome: "Hallo! Ich bin AgriBot, Ihr DroneAgri.pl-Assistent. Ich kann bei XAG-Landwirtschaftsdrohnen, Spezifikationen, Vorschriften und mehr helfen. Wie kann ich Ihnen helfen?",
  },
  cs: {
    title: "AgriBot",
    subtitle: "Asistent zemědělských dronů XAG",
    placeholder: "Napište zprávu...",
    welcome: "Ahoj! Jsem AgriBot, asistent DroneAgri.pl. Mohu pomoci s informacemi o zemědělských dronech XAG, specifikacích, předpisech a dalších. Jak vám mohu pomoci?",
  },
  nl: {
    title: "AgriBot",
    subtitle: "XAG Landbouwdrone Assistent",
    placeholder: "Typ een bericht...",
    welcome: "Hallo! Ik ben AgriBot, uw DroneAgri.pl assistent. Ik kan helpen met XAG landbouwdrones, specificaties, droneregels en meer. Hoe kan ik u helpen?",
  },
};

export function ChatWidget() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const t = titles[locale] || titles.en;
  const replies = quickReplies[locale] || quickReplies.en;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const trimmed = content.trim();
      setShowQuickReplies(false);

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            locale,
            history,
          }),
        });

        if (res.status === 429) {
          setMessages((prev) => [
            ...prev,
            {
              id: assistantId,
              role: "assistant",
              content:
                locale === "pl"
                  ? "Zbyt wiele wiadomości. Spróbuj ponownie za chwilę."
                  : locale === "es"
                    ? "Demasiados mensajes. Inténtalo de nuevo en un momento."
                    : locale === "de"
                      ? "Zu viele Nachrichten. Bitte versuchen Sie es gleich erneut."
                      : "Too many messages. Please try again in a moment.",
            },
          ]);
          return;
        }

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: data.response },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content:
              locale === "pl"
                ? "Przepraszamy, wystąpił błąd. Skontaktuj się z nami: Biuro@imegagroup.pl"
                : locale === "es"
                  ? "Lo sentimos, ocurrió un error. Contáctenos: Biuro@imegagroup.pl"
                  : "Sorry, an error occurred. Contact us: Biuro@imegagroup.pl",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, locale]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowQuickReplies(true);
  };

  // Format markdown-like text
  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br />");
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
          style={{ backgroundColor: "#df1b23" }}
          aria-label="Open chat"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full h-full sm:w-[400px] sm:h-[600px] sm:max-h-[80vh] flex flex-col rounded-none sm:rounded-2xl shadow-2xl overflow-hidden border border-white/10"
          style={{ backgroundColor: "#0b0e20" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ backgroundColor: "#df1b23" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{t.title}</h3>
                <p className="text-white/80 text-xs">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: "#0f1225" }}>
            {/* Welcome message */}
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs text-white" style={{ backgroundColor: "#df1b23" }}>
                A
              </div>
              <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tl-sm text-sm text-white/90" style={{ backgroundColor: "#1a1f3d" }}>
                {t.welcome}
              </div>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs text-white" style={{ backgroundColor: "#df1b23" }}>
                    A
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "rounded-tr-sm text-white"
                      : "rounded-tl-sm text-white/90"
                  }`}
                  style={{
                    backgroundColor: msg.role === "user" ? "#df1b23" : "#1a1f3d",
                  }}
                  dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                />
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs text-white" style={{ backgroundColor: "#df1b23" }}>
                  A
                </div>
                <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-sm" style={{ backgroundColor: "#1a1f3d" }}>
                  <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {showQuickReplies && messages.length === 0 && (
            <div className="px-4 py-2 flex flex-wrap gap-2 shrink-0 border-t border-white/5" style={{ backgroundColor: "#0f1225" }}>
              {replies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="px-3 py-1.5 text-xs rounded-full border border-white/20 text-white/70 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 shrink-0 border-t border-white/10" style={{ backgroundColor: "#0b0e20" }}>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                rows={1}
                className="flex-1 resize-none rounded-xl px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:ring-1 focus:ring-red-500/50 border border-white/10"
                style={{ backgroundColor: "#1a1f3d", maxHeight: "80px" }}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl text-white transition-colors disabled:opacity-30 cursor-pointer"
                style={{ backgroundColor: "#df1b23" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
