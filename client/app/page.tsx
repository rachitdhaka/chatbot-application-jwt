"use client";

import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import Container from "./components/Container";
import { useRouter } from "next/navigation";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const renderInlineMarkdown = (text: string): ReactNode[] => {
  const pattern = /(\*\*.*?\*\*|\*.*?\*)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before) nodes.push(before);

    const value = match[0];
    const innerText = value.replace(/^\*\*|\*\*$|^\*|\*$/g, "");

    if (value.startsWith("**") && value.endsWith("**")) {
      nodes.push(<strong key={`${value}-${match.index}`}>{innerText}</strong>);
    } else if (value.startsWith("*") && value.endsWith("*")) {
      nodes.push(<em key={`${value}-${match.index}`}>{innerText}</em>);
    } else {
      nodes.push(value);
    }

    lastIndex = match.index + value.length;
  }

  const rest = text.slice(lastIndex);
  if (rest) nodes.push(rest);

  return nodes;
};

const renderMessageContent = (content: string): ReactNode => {
  const lines = content.split(/\n/);
  const output: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;

    output.push(
      <ul key={`list-${output.length}`} className="list-disc space-y-1 pl-5">
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      output.push(<div key={`space-${index}`} className="h-2" />);
      return;
    }

    if (/^[-*•]\s+/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-*•]\s+/, ""));
      return;
    }

    flushList();
    output.push(
      <p key={`line-${index}`} className="whitespace-pre-wrap break-words">
        {renderInlineMarkdown(trimmed)}
      </p>,
    );
  });

  flushList();

  return <>{output}</>;
};

export default function Home() {
  const router = useRouter();
  const [question, setQuestion] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadChatHistory = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/loginpage");
      return;
    }

    try {
      const res = await axios.get("http://localhost:4000/api/chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const history = (res.data || [])
        .flatMap((chat: any) => chat.messages || [])
        .map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }));

      setMessages(history);
    } catch (error) {
      console.error("Load chat history error:", error);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/loginpage");
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: question.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setQuestion("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/chat",
        { message: userMessage.content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: res.data.reply,
      };

      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error("Backend error:", error);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 p-4 text-neutral-800">
      <Container classname="w-full max-w-4xl flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm max-h-[88vh]">
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
              Assistant
            </p>
            <h1 className="mt-1 text-lg font-semibold text-neutral-900">
              Chatbot
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Online
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-neutral-50 px-4 py-4 sm:px-5">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[220px] items-center justify-center">
              <div className="max-w-sm text-center">
                <p className="text-sm font-medium text-neutral-700">
                  Start a conversation
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Ask a question and the assistant will respond here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={`${msg.role}-${index}`}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                      msg.role === "user"
                        ? "bg-neutral-900 text-white"
                        : "border border-neutral-200 bg-white text-neutral-700"
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <form
          onSubmit={handleSubmit}
          className="border-t border-neutral-200 bg-white p-4 sm:p-5"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-2">
            <input
              id="question-input"
              type="text"
              placeholder="Type your message..."
              aria-label="Question input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
              className="w-full border-0 bg-transparent px-2 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none disabled:cursor-not-allowed"
            />

            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Thinking..." : "Send"}
            </button>
          </div>
        </form>
      </Container>
    </div>
  );
}
