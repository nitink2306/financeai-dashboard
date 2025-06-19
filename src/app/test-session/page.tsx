"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function TestSession() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Session Test</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Status:</h2>
          <p className="text-lg">{status}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Session Data:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Raw Check:</h2>
          <p>Has session: {session ? "YES" : "NO"}</p>
          <p>Has user: {session?.user ? "YES" : "NO"}</p>
          <p>User email: {session?.user?.email || "None"}</p>
          <p>User ID: {session?.user?.id || "None"}</p>
        </div>

        <Button onClick={() => (window.location.href = "/dashboard")}>
          Try Dashboard
        </Button>
      </div>
    </div>
  );
}
