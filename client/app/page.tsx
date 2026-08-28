"use client";

import { useState } from "react";
import axios from "axios";
import Container from "./components/Container";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/loginpage");
      return;
    }

    setIsLoading(true);
    setAnswer("");

    try {
      const res = await axios.post(
        "http://localhost:4000/ask",
        { question },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAnswer(res.data.reply);
    } catch (error) {
      console.error("Backend error:", error);
      setAnswer("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (

    
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <Container classname="w-full w-5xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-md flex flex-col max-h-[85vh]">
        
        {/* Header Section */}
        <div className="mb-6 text-center flex-shrink-0">
          <h1 className="text-xl font-semibold text-neutral-800">
            Chatbot application
          </h1>
          
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-shrink-0">
          <div className="flex flex-col gap-1.5">
            <label 
              htmlFor="question-input" 
              className="text-xs font-medium uppercase tracking-wider text-neutral-500"
            >
              Your Question
            </label>
            <input
              id="question-input"
              type="text"
              placeholder="Type your question here..."
              aria-label="Question input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-base text-neutral-800 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="w-full rounded-xl bg-neutral-800 py-2.5 font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Thinking..." : "Ask Question"}
          </button>
        </form>

        {/* Scrollable Output Section */}
        {answer && (
          <div className="mt-6 rounded-xl border border-neutral-100 bg-neutral-50 p-4 overflow-y-auto flex-grow max-h-[250px] scrollbar-thin">
            <h2 className="sticky top-0 bg-neutral-50 pb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Answer
            </h2>
            <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-line mt-1">
              {answer}
            </p>
          </div>
        )}

      </Container>

      
    </div>
  );
}
