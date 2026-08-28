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
    <div className="flex h-screen mx-auto ">
      <div className="flex flex-col max-w-lg justify-center items-center mx-auto">
        <p className="mb-6 text-2xl font-semibold text-gray-800">
          This is the signup page
        </p>
        <div>
          <form className="space-y-4" onSubmit={callforsignup}>
            {replyMessage && (
              <p
                className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-700"
                role="status"
              >
                {replyMessage}
              </p>
            )}

            {errorMessage && (
              <p
                className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {errorMessage}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setemail(event.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-neutral-800 py-2.5 font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              signup
            </button>
          </form>
        </div>
        <div className="mt-40">
          Already have an account -{" "}
          <a href="/loginpage" className="text-blue-300">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
