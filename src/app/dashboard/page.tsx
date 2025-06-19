"use client";

import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-8">
        <h1>Not signed in</h1>
        <a href="/auth/signin">Sign In</a>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1>✅ SUCCESS! Dashboard Working!</h1>
      <p>Email: {session?.user?.email}</p>
      <p>Name: {session?.user?.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
