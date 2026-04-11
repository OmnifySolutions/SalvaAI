"use client";
import { useClerk } from "@clerk/nextjs";

export default function SignOutButton() {
  const { signOut } = useClerk();
  return (
    <button
      onClick={() => signOut({ redirectUrl: "/" })}
      className="text-gray-400 hover:text-gray-600 text-sm"
    >
      Sign out
    </button>
  );
}
