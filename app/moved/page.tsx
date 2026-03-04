export const metadata = {
  title: "Portfolio Moved | Deepak Kumar",
  description:
    "Deepak Kumar's developer portfolio has moved from imdeepak.in to officialdeepak.in. Visit the new website for updated projects and professional information.",
};

export default function MovedPage() {
  return (
    <main className="h-screen bg-white flex items-center justify-center overflow-hidden">
      <div className="max-w-xl w-full border border-gray-200 rounded-lg p-10 text-center shadow-sm">

        <h1 className="text-3xl font-semibold text-gray-900 mb-4">
          Portfolio Moved
        </h1>

        <p className="text-gray-700 mb-4">
          The developer portfolio previously available at{" "}
          <span className="font-medium">imdeepak.in</span> has now moved to a
          new official domain.
        </p>

        <p className="text-gray-700 mb-6">
          Please visit the updated website to explore the latest projects,
          technical experience, and professional information.
        </p>

        <a
          href="https://officialdeepak.in"
          className="text-blue-600 font-medium hover:underline"
        >
          https://officialdeepak.in
        </a>

        <p className="text-gray-500 text-sm mt-6">
          If you previously visited <strong>imdeepak.in</strong>, please update
          your bookmarks to the new domain.
        </p>

        {/* Hidden SEO text */}
        <p className="sr-only">
          Deepak Kumar developer portfolio previously hosted on imdeepak.in
          has permanently moved to officialdeepak.in. Full stack developer with
          experience in JavaScript, React, Angular, Node.js and modern web
          technologies.
        </p>

      </div>
    </main>
  );
}