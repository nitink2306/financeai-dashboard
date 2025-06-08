"use client";

import { useSession } from "next-auth/react";

export default function TestPage() {
  const { data: session, status } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Test</h1>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold">Status:</h2>
        <p>{status}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold">Session Data:</h2>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold">Raw Session Check:</h2>
        <p>Has session: {session ? "YES" : "NO"}</p>
        <p>Has user: {session?.user ? "YES" : "NO"}</p>
        <p>User name: {session?.user?.name || "None"}</p>
      </div>
    </div>
  );
}
