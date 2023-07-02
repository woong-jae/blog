"use client";

import React, { ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Breadcrumb({
  categories,
  currentCategory = "",
}: {
  categories: string[];
  currentCategory?: string;
}) {
  const router = useRouter();

  function handleChange({ target }: ChangeEvent<HTMLSelectElement>) {
    const { value: category } = target;
    router.push(`/category/${category}`);
  }

  return (
    <nav className="flex mt-2 py-2 text-lg font-medium">
      <Link href="/">home</Link>
      <span className="mx-2">/</span>
      <select
        onChange={handleChange}
        className="bg-transparent"
        name="category"
        value={currentCategory}
      >
        {!currentCategory && <option value="">none</option>}
        <option value="all">all</option>
        {categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
    </nav>
  );
}
