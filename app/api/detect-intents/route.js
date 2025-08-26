import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function POST(req) {
  console.log("🔍 Detect Intents API route hit!");

  try {
    const body = await req.json();
    const { message, username } = body;

    if (!message || !username) {
      return Response.json(
        { error: "Message and username are required" },
        { status: 400 }
      );
    }

    const intentPrompt = `
User asked: "${message}"
Username: ${username}

List all applicable intents from the following options:
- user_bio
- recent_repos
- recent_commits
- open_pull_requests
- repo_languages
- starred_repos
- followers
- following
- gists
- organizations
- contribution_activity
- public_events
- top_repositories
- repository_stats
- coding_streak
- profile_readme

Only return intents as a comma-separated list, no explanation.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const intentResult = await model.generateContent(intentPrompt);
    const rawIntents = intentResult.response.text().trim();
    
    const intents = rawIntents
      .split(",")
      .map((intent) => intent.trim())
      .filter((intent) => intent.length > 0);

    console.log("🤖 Detected Intents:", intents);

    return Response.json({
      intents,
      success: true
    });

  } catch (error) {
    console.error("🔥 Intent Detection Error:", error);
    
    // Fallback intents if AI fails
    const fallbackIntents = ["user_bio", "recent_repos", "repo_languages"];
    
    return Response.json({
      intents: fallbackIntents,
      success: false,
      error: "fallback_used",
      message: "Using fallback intents due to AI service unavailability"
    });
  }
}