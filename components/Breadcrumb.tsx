"use client";

import React, { ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";

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
    <nav className="flex items-center mt-2 py-2 text-lg font-medium">
      <Link href="/">home</Link>
      <span className="mx-2">/</span>
      <div className="relative flex items-center rounded-md ring-1 ring-neutral-500">
        <select
          id="category"
          onChange={handleChange}
          className="pl-2 pr-6 bg-transparent appearance-none selection:appearance-none z-10"
          name="category"
          value={currentCategory}
        >
          {!currentCategory && <option value="">none</option>}
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <FiChevronDown className="absolute right-1" />
      </div>
    </nav>
  );
}
