"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "../components/Container";

export default function Page() {
  const router = useRouter();
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");

  const callforsignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setReplyMessage("");

    try {
      const response = await axios.post("http://localhost:4000/signup", {
        email,
        password,
      });
      setReplyMessage(response.data.message);

      router.push("/loginpage");
    } catch (error) {
      console.error("Signup failed:", error);

      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : null;
      setErrorMessage(message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-10 text-neutral-800">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            Create account
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-neutral-900">
            Sign up
          </h1>
        </div>

        <form className="space-y-4" onSubmit={callforsignup}>
          {replyMessage && (
            <p
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              role="status"
            >
              {replyMessage}
            </p>
          )}

          {errorMessage && (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-neutral-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setemail(event.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-neutral-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Sign up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <a
            href="/loginpage"
            className="font-medium text-neutral-900 underline-offset-2 hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
