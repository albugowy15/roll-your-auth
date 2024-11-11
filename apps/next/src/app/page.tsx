import { buttonVariants } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { LogoutButton } from "./_components/LogoutButton";

export const metadata: Metadata = {
  title: "Homepage - Roll your auth",
};

export default async function Home() {
  const session = await auth();
  return (
    <main className="flex gap-4 flex-col items-center justify-center h-screen">
      <h1 className="font-bold text-xl text-center">Homepage</h1>
      {session.isAuthenticated ? (
        <LogoutButton />
      ) : (
        <Link className={buttonVariants({ variant: "default" })} href="/login">
          Log In
        </Link>
      )}
    </main>
  );
}
