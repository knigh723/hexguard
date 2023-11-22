import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col space-y-4 items-center justify-center bg-slate-400 h-screen">
        <Link href="/login" className="w-48 btn btn-lg bg-neutral hover:bg-neutral-content text-neutral-content border-0 hover:scale-110 hover:text-neutral hover:shadow-2xl" >login</Link>
        <Link href="/register" className="w-48 btn btn-lg bg-neutral hover:bg-neutral-content text-neutral-content border-0 hover:scale-110 hover:text-neutral hover:shadow-2xl" >register</Link>
        <Link href="/dashboard" className="w-48 btn btn-lg bg-neutral hover:bg-neutral-content text-neutral-content border-0 hover:scale-110 hover:text-neutral hover:shadow-2xl" >dashboard</Link>

    </div>
  )
}
