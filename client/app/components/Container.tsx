"use client";

import { Children } from "react";

export default function Container({ children, classname }: { children: React.ReactNode, classname?: string }) {
  return (
    
    <div className={`flex h-screen mx-auto justify-center max-w-5xl ${classname ?? ""}`}>
      {children}
    </div>
  );
}
