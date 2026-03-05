export async function POST(req: Request) {
  try {
    return Response.json({
      response:  "API working ...",
    });
  } catch (error) {
    console.error("AI API Error:", error);

    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}