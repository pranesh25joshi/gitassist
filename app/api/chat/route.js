import { GoogleGenerativeAI } from "@google/generative-ai";
import { streamText } from "ai";
import axios from "axios";
import { google } from "@ai-sdk/google";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(req) {
  console.log("💬 API route hit!");

  const body = await req.json();
  const messages = body.messages;

  const username = messages?.[0]?.data?.username;
  console.log("Messages:", messages);
  console.log("Username:", username);

  if (!username) {
    return Response.json({ error: "Username is missing" }, { status: 400 });
  }

  const lastUserMessage =
    messages[messages.length - 1]?.text ||
    messages[messages.length - 1]?.content ||
    "";
  console.log("Last User Message:", lastUserMessage);

  const intentPrompt = `
User asked: "${lastUserMessage}"
Username: ${username}

List all applicable intents from the following options:
- user_bio
- recent_repos
- recent_commits
- open_pull_requests
- repo_languages
- starred_repos

Only return intents as a comma-separated list, no explanation.
  `;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const intentResult = await model.generateContent(intentPrompt);
  console.log("Intent Result:", intentResult);
  const rawIntents = intentResult.response.text().trim();
  const intents = rawIntents
    .split(",")
    .map((intent) => intent.trim())
    .filter((intent) => intent.length > 0);

  console.log("🤖 Intents:", intents);

  const apiMap = {
    user_bio: `https://api.github.com/users/${username}`,
    recent_repos: `https://api.github.com/users/${username}/repos?sort=updated`,
    recent_commits: `https://api.github.com/users/${username}/events`,
    open_pull_requests: `https://api.github.com/search/issues?q=author:${username}+type:pr+state:open`,
    repo_languages: `https://api.github.com/users/${username}/repos`,
    starred_repos: `https://api.github.com/users/${username}/starred`,
  };

  const results = {};

  try {
    for (const intent of intents) {
      try {
        const res = await axios.get(apiMap[intent]);
        let data = res.data;

        if (intent === "recent_repos") {
          data = data.map((repo) => ({
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            updated_at: repo.updated_at,
            html_url: repo.html_url,
          }));
        } else if (intent === "recent_commits") {
          data = data.map((event) => ({
            type: event.type,
            repo: event.repo.name,
            created_at: event.created_at,
            actor: event.actor.login,
            commit_message: event.payload.commits?.[0]?.message || "",
            commit_url: event.payload.commits?.[0]?.url || "",
            action: event.payload.action || "",
          }));
        } else if (intent === "open_pull_requests") {
          data = data.items.map((pr) => ({
            title: pr.title,
            state: pr.state,
            created_at: pr.created_at,
            url: pr.html_url,
            repository_url: pr.repository_url,
          }));
        } else if (intent === "repo_languages") {
          const allLangs = {};
          data.forEach((repo) => {
            if (repo.language) {
              allLangs[repo.language] = (allLangs[repo.language] || 0) + 1;
            }
          });
          data = Object.entries(allLangs).map(([language, count]) => ({
            language,
            count,
          }));
        } else if (intent === "starred_repos") {
          data = data.map((repo) => ({
            name: repo.name,
            owner: repo.owner.login,
            description: repo.description,
            stars: repo.stargazers_count,
            language: repo.language,
            html_url: repo.html_url,
          }));
        } else if (intent === "followers" || intent === "following") {
          data = data.map((user) => ({
            username: user.login,
            avatar: user.avatar_url,
            url: user.html_url,
          }));
        } else if (intent === "gists") {
          data = data.map((gist) => ({
            id: gist.id,
            description: gist.description,
            files: Object.keys(gist.files),
            created_at: gist.created_at,
            url: gist.html_url,
          }));
        } else if (intent === "received_events") {
          data = data.map((event) => ({
            type: event.type,
            repo: event.repo.name,
            actor: event.actor.login,
            created_at: event.created_at,
          }));
        } else if (intent === "orgs") {
          data = data.map((org) => ({
            name: org.login,
            description: org.description,
            avatar: org.avatar_url,
            url: org.url,
          }));
        }

        results[intent] = data;
      } catch (err) {
        console.error(`Error fetching data for intent: ${intent}`, err);
        results[intent] = { error: "Failed to fetch data." };
      }
    }

    const responsePrompt = `
The user asked: "${lastUserMessage}"

Below is the structured GitHub data for intents: ${intents.join(", ")}.

${JSON.stringify(results, null, 2)}

Based on this data, generate an insightful, human-friendly response that addresses all relevant parts of the user's query. And also structure the result in nice formate , provide space when required and use bullet points or numbered lists where appropriate.
    `;

    console.log("🔑 ENV TEST:", process.env.GEMINI_API_KEY);

    const finalResponse = streamText({
      model: google("gemini-1.5-pro"),
      prompt: responsePrompt,
      onError: (err) => {
        console.error("Stream error:", err);
      },
      onFinish: ({ text }) => {
        console.log("Generation finished with text length:", text.length);
      },
    });

    return finalResponse.toDataStreamResponse();
  } catch (error) {
    console.error("🔥 Unexpected Error:", error);

    return new Response(
      `Sorry, I couldn't fetch GitHub data for ${username}. Please check if the username is correct and try again.`,
      { status: 500 }
    );
  }
}