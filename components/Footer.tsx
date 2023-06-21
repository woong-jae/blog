export default function Footer({ name }: { name: string }) {
  return (
    <footer className="py-8 text-neutral-500 text-center text-xs md:text-sm">
      © {new Date().getFullYear()} {name}, all rights reserved.
    </footer>
  );
}
