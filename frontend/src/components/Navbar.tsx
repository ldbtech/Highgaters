import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Freelancing App</h1>
        <div>
        <Link href="/checkout" className="px-4 py-2 bg-indigo-500 rounded hover:bg-indigo-700">
        Checkout
        </Link>

        </div>
      </div>
    </nav>
  );
}
