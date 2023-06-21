import Link from "next/link";

export default function Header({ title }: { title: string }) {
  return (
    <header className="py-3 md:py-5 w-full flex justify-between">
      <div className="text-3xl md:text-4xl font-bold mx-auto">
        <Link href="/">{title}</Link>
      </div>
    </header>
  );
}
