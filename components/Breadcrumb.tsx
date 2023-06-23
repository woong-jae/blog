"use client";

import React, { ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Breadcrumb({ currentCategory = "" }: { currentCategory?: string }) {
  const router = useRouter();

  function handleChange({ target }: ChangeEvent<HTMLSelectElement>) {
    const { value: category } = target;
    router.push(`/category/${category}`);
  }

  return (
    <div className="flex my-4 text-lg font-medium">
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
        <option value="essay">essay</option>
        <option value="frontend">frontend</option>
      </select>
    </div>
  );
}
