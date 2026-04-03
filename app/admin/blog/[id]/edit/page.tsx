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
      <div className="p-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-8 bg-slate-200 rounded-lg animate-pulse w-48" />
          <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 text-lg font-semibold">{error}</p>
        <a href="/admin/blog" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
          ← Back to posts
        </a>
      </div>
    );
  }

  return <BlogForm initial={blog!} isEdit />;
}
