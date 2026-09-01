"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function TokenProcessor() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Stores token exactly where your layout checks it
      localStorage.setItem("token", token);
      router.push("/"); // Direct user back to index home view
    } else {
      router.push("/loginpage");
    }
  }, [searchParams, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-lg font-medium text-gray-600 animate-pulse">
          Completing sign-in authentication...
        </p>
      </div>
    </div>
  );
}

export default function LoginSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TokenProcessor />
    </Suspense>
  );
}
