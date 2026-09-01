"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "../components/Container";

export default function Page() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();

  const GITHUB_CLIENT_ID = "Ov23liA3hhVHMs2rEZRr";
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    "http://localhost:4000/api/auth/github/callback",
  )}&scope=user:email`;


  
  const callforlogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg("");

    try {
      const response = await axios.post("http://localhost:4000/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      router.push("/");
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong";
      setErrorMsg(message);
    }

    console.log(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-10 text-neutral-800">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            Welcome back
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-neutral-900">
            Sign in
          </h1>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        <form className="space-y-4" onSubmit={callforlogin}>
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
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Login
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200"></div>
          </div>
          <span className="relative bg-white px-3 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
            Or continue with
          </span>
        </div>

        <a
          href={githubAuthUrl}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.0.069-.608.01 1.005.974 1.53 1.005 1.53.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
            />
          </svg>
          Sign in with GitHub
        </a>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="font-medium text-neutral-900 underline-offset-2 hover:underline"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
