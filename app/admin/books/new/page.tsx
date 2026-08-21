"use client";

/** Create a book brief. Generation is a separate, deliberate step afterwards. */

import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import BookForm, { EMPTY_BRIEF, type BookBriefValues } from "@/components/books/BookForm";

export default function NewBookPage() {
  const router = useRouter();

  async function create(values: BookBriefValues) {
    const res = await fetch("/api/admin/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not create the book");
    router.push(`/admin/books/${data.book.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New book"
        description="Write the brief. The agent reads these fields and nothing else."
      />
      <BookForm initial={EMPTY_BRIEF} submitLabel="Create book" onSubmit={create} />
    </div>
  );
}
