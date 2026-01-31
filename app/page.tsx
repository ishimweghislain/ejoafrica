import Link from "next/link";

export default function Home() {
  return (
    <main className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Welcome to EJO Africa</h1>
      <Link href="/login" className="mt-4 text-blue-600 underline">
        Login
      </Link>
    </main>
  );
}
