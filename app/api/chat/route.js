import { GoogleGenerativeAI } from "@google/generative-ai";
import { streamText } from "ai";
import axios from "axios";
import { google } from "@ai-sdk/google";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY
);

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
  `.trim();

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const intentResult = await model.generateContent(intentPrompt);
  console.log("Intent Result:", intentResult);

  const rawIntents = intentResult.response.text().trim();
  const intents = rawIntents
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);
  console.log("🤖 Intents:", intents);

 
  const apiMap = {
    user_bio: `https://api.github.com/users/${username}`,
    recent_repos: `https://api.github.com/users/${username}/repos?sort=updated`,
    recent_commits: `https://api.github.com/users/${username}/events`,
    open_pull_requests: `https://api.github.com/search/issues?q=author:${username}+type:pr+state:open`,
    repo_languages: `https://api.github.com/users/${username}/repos`,
    starred_repos: `https://api.github.com/users/${username}/starred`,
  };

  // fire all fetches in parallel
  const fetchPromises = intents.map((intent) => {
    return axios
      .get(apiMap[intent])
      .then((res) => {
        let data = res.data;

        
        if (intent === "recent_repos") {
          data = data.map((r) => ({
            name: r.name,
            description: r.description,
            language: r.language,
            stars: r.stargazers_count,
            forks: r.forks_count,
            updated_at: r.updated_at,
            html_url: r.html_url,
          }));
        } else if (intent === "recent_commits") {
          data = data.map((e) => ({
            type: e.type,
            repo: e.repo.name,
            created_at: e.created_at,
            actor: e.actor.login,
            commit_message: e.payload.commits?.[0]?.message || "",
            commit_url: e.payload.commits?.[0]?.url || "",
            action: e.payload.action || "",
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
          const langs = {};
          data.forEach((r) => {
            if (r.language) langs[r.language] = (langs[r.language] || 0) + 1;
          });
          data = Object.entries(langs).map(([language, count]) => ({
            language,
            count,
          }));
        } else if (intent === "starred_repos") {
          data = data.map((r) => ({
            name: r.name,
            owner: r.owner.login,
            description: r.description,
            stars: r.stargazers_count,
            language: r.language,
            html_url: r.html_url,
          }));
        }
        

        return [intent, data];
      })
      .catch((err) => {
        console.error(`Error fetching data for intent: ${intent}`, err);
        return [intent, { error: "Failed to fetch data." }];
      });
  });

  let results = {};
  try {
   // for parallel execution of api, earlier it was done using a for loop, which takes time for each call, but now the total time is close to the max time taken by any call
    const entries = await Promise.all(fetchPromises);
    results = Object.fromEntries(entries);

    
    const responsePrompt = `
The user asked: "${lastUserMessage}"

Below is the structured GitHub data for intents: ${intents.join(", ")}.

${JSON.stringify(results, null, 2)}

Based on this data, generate an insightful, human-friendly response that:
- Addresses each part of the user's query
- Uses bullet points or numbered lists where appropriate
- Leaves whitespace for readability
    `.trim();

    console.log("🔑 ENV TEST:", process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    
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
