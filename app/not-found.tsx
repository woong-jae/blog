import Link from "next/link";

export default function NotFound() {
  return (
    <div className="prose dark:prose-invert">
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <p>
        Return to <Link href="/">home</Link>
      </p>
    </div>
  );
}
