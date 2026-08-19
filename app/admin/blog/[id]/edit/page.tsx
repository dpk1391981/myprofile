"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BlogForm from "@/components/admin/BlogForm";

export default function EditBlogPage() {
  const params = useParams();
  const id = params?.id as string;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/blogs/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setBlog(data.blog);
      })
      .catch(() => setError("Post not found or failed to load."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-8 bg-slate-200 rounded-lg animate-pulse w-48" />
          <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="font-semibold text-red-600">{error}</p>
          <a href="/admin/blog" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
            ← Back to posts
          </a>
        </div>
      </div>
    );
  }

  return <BlogForm initial={blog!} isEdit />;
}
