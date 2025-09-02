import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

// Memory cache for responses and GitHub API data
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache for responses
const GITHUB_CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache for GitHub API data

export async function POST(req) {
  console.log("🚀 Generate Response API route hit!");

  try {
    const body = await req.json();
    const { message, username, intents } = body;

    if (!message || !username || !intents) {
      return Response.json(
        { error: "Message, username, and intents are required" },
        { status: 400 }
      );
    }

    // Check response cache first
    const responseKey = `response-${username}-${message.substring(0, 30)}`;
    if (cache.has(responseKey)) {
      const cachedData = cache.get(responseKey);
      if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
        console.log("💾 Using cached response for:", username);
        return Response.json(cachedData.data);
      }
    }

    // Limit to max 3 intents to reduce model load
    const limitedIntents = intents.slice(0, 3);
    console.log("🎯 Processing intents:", limitedIntents);

    const apiMap = {
      user_bio: `https://api.github.com/users/${username}`,
      recent_repos: `https://api.github.com/users/${username}/repos?sort=updated`,
      recent_commits: `https://api.github.com/users/${username}/events`,
      open_pull_requests: `https://api.github.com/search/issues?q=author:${username}+type:pr+state:open`,
      repo_languages: `https://api.github.com/users/${username}/repos`,
      starred_repos: `https://api.github.com/users/${username}/starred`,
      followers: `https://api.github.com/users/${username}/followers`,
      following: `https://api.github.com/users/${username}/following`,
      gists: `https://api.github.com/users/${username}/gists`,
      organizations: `https://api.github.com/users/${username}/orgs`,
      contribution_activity: `https://api.github.com/users/${username}/events`,
      public_events: `https://api.github.com/users/${username}/received_events`,
      top_repositories: `https://api.github.com/users/${username}/repos?sort=stars`,
      repository_stats: `https://api.github.com/users/${username}/repos`,
      coding_streak: `https://api.github.com/users/${username}/events`,
      profile_readme: `https://api.github.com/repos/${username}/${username}/readme`,
    };

    const results = {};

    // Fetch GitHub data for each intent
    await Promise.all(
      limitedIntents.map(async (intent) => {
        // Check GitHub API cache first
        const githubCacheKey = `github-${username}-${intent}`;
        if (cache.has(githubCacheKey)) {
          const cachedData = cache.get(githubCacheKey);
          if (Date.now() - cachedData.timestamp < GITHUB_CACHE_DURATION) {
            console.log(`💾 Using cached GitHub data for: ${username} - ${intent}`);
            results[intent] = cachedData.data;
            return;
          }
        }
        try {
          const res = await axios.get(apiMap[intent] , { timeout: 5000 });
          let data = res.data;

          // Process and filter data based on intent
          if (intent === "recent_repos") {
            data = data.slice(0, 10).map((repo) => ({
              name: repo.name,
              description: repo.description,
              language: repo.language,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              updated_at: repo.updated_at,
              html_url: repo.html_url,
            }));
          } else if (intent === "recent_commits") {
            data = data.slice(0, 10).map((event) => ({
              type: event.type,
              repo: event.repo?.name,
              created_at: event.created_at,
              actor: event.actor?.login,
              commit_message: event.payload?.commits?.[0]?.message || "",
              commit_url: event.payload?.commits?.[0]?.url || "",
              action: event.payload?.action || "",
            }));
          } else if (intent === "open_pull_requests") {
            data = data.items.slice(0, 10).map((pr) => ({
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
            data = Object.entries(allLangs)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([language, count]) => ({
                language,
                count,
              }));
          } else if (intent === "starred_repos") {
            data = data.slice(0, 10).map((repo) => ({
              name: repo.name,
              owner: repo.owner?.login,
              description: repo.description,
              stars: repo.stargazers_count,
              language: repo.language,
              html_url: repo.html_url,
            }));
          } else if (intent === "user_bio") {
            data = {
              login: data.login,
              name: data.name,
              bio: data.bio,
              location: data.location,
              company: data.company,
              blog: data.blog,
              public_repos: data.public_repos,
              followers: data.followers,
              following: data.following,
              created_at: data.created_at,
              avatar_url: data.avatar_url,
              html_url: data.html_url,
            };
          } else if (intent === "followers") {
            data = data.slice(0, 20).map((user) => ({
              username: user.login,
              avatar: user.avatar_url,
              url: user.html_url,
              type: user.type,
            }));
          } else if (intent === "following") {
            data = data.slice(0, 20).map((user) => ({
              username: user.login,
              avatar: user.avatar_url,
              url: user.html_url,
              type: user.type,
            }));
          } else if (intent === "gists") {
            data = data.slice(0, 10).map((gist) => ({
              id: gist.id,
              description: gist.description || "No description",
              files: Object.keys(gist.files || {}),
              created_at: gist.created_at,
              updated_at: gist.updated_at,
              url: gist.html_url,
              public: gist.public,
            }));
          } else if (intent === "organizations") {
            data = data.map((org) => ({
              name: org.login,
              description: org.description,
              avatar: org.avatar_url,
              url: org.url,
            }));
          } else if (
            intent === "contribution_activity" ||
            intent === "coding_streak"
          ) {
            // Process events for contribution analysis
            const last30Days = new Date();
            last30Days.setDate(last30Days.getDate() - 30);

            data = data
              .filter((event) => new Date(event.created_at) > last30Days)
              .slice(0, 50)
              .map((event) => ({
                type: event.type,
                repo: event.repo?.name,
                created_at: event.created_at,
                actor: event.actor?.login,
                public: event.public,
              }));
          } else if (intent === "public_events") {
            data = data.slice(0, 20).map((event) => ({
              type: event.type,
              repo: event.repo?.name,
              actor: event.actor?.login,
              created_at: event.created_at,
              public: event.public,
            }));
          } else if (intent === "top_repositories") {
            data = data
              .sort(
                (a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)
              )
              .slice(0, 10)
              .map((repo) => ({
                name: repo.name,
                description: repo.description,
                language: repo.language,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                watchers: repo.watchers_count,
                html_url: repo.html_url,
                created_at: repo.created_at,
                updated_at: repo.updated_at,
              }));
          } else if (intent === "repository_stats") {
            // Aggregate repository statistics
            const totalRepos = data.length;
            const totalStars = data.reduce(
              (sum, repo) => sum + (repo.stargazers_count || 0),
              0
            );
            const totalForks = data.reduce(
              (sum, repo) => sum + (repo.forks_count || 0),
              0
            );
            const languageStats = {};

            data.forEach((repo) => {
              if (repo.language) {
                languageStats[repo.language] =
                  (languageStats[repo.language] || 0) + 1;
              }
            });

            data = {
              total_repositories: totalRepos,
              total_stars: totalStars,
              total_forks: totalForks,
              primary_language:
                Object.keys(languageStats).sort(
                  (a, b) => languageStats[b] - languageStats[a]
                )[0] || "Unknown",
              language_distribution: Object.entries(languageStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([language, count]) => ({ language, count })),
              most_starred_repo:
                data.sort(
                  (a, b) =>
                    (b.stargazers_count || 0) - (a.stargazers_count || 0)
                )[0]?.name || "None",
            };
          } else if (intent === "profile_readme") {
            // Handle profile README (might not exist)
            if (data.content) {
              data = {
                content: Buffer.from(data.content, "base64").toString("utf-8"),
                size: data.size,
                name: data.name,
                download_url: data.download_url,
              };
            } else {
              data = { error: "No profile README found" };
            }
          }

          // Cache the GitHub API result
          cache.set(`github-${username}-${intent}`, {
            data: data,
            timestamp: Date.now()
          });
          
          results[intent] = data;
        } catch (err) {
          console.error(`Error fetching data for intent: ${intent}`, err.message);
          results[intent] = { error: `Failed to fetch ${intent} data.` };
        }
      })
    );

    // Generate AI response
    const responsePrompt = `
The user asked: "${message}"

Below is the structured GitHub data for intents: ${intents.join(", ")}.

${JSON.stringify(results, null, 2)}

Based on this data, generate an insightful, human-friendly response that addresses all relevant parts of the user's query. Structure the result nicely, provide space when required and use bullet points or numbered lists where appropriate. Keep it concise but informative.
    `;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const finalResult = await model.generateContent(responsePrompt);
      const finalText = finalResult.response.text();

      console.log("✅ Generation finished with text length:", finalText.length);

      const responseData = {
        message: finalText,
        success: true,
        data: results,
      };
      
      // Cache the final response
      cache.set(responseKey, {
        data: responseData,
        timestamp: Date.now()
      });
      
      // Clean up cache if it gets too large
      if (cache.size > 100) {
        const oldestKeys = [...cache.keys()]
          .sort((a, b) => {
            const aTime = cache.get(a)?.timestamp || 0;
            const bTime = cache.get(b)?.timestamp || 0;
            return aTime - bTime;
          })
          .slice(0, 20);
        oldestKeys.forEach(key => cache.delete(key));
      }
      
      return Response.json(responseData);
    } catch (aiError) {
      console.error("🤖 AI Generation Error:", aiError);

      // Fallback response without AI
      const fallbackResponse = `Here's what I found about ${username}:\n\n${Object.entries(
        results
      )
        .map(([intent, data]) => {
          if (data.error) return `❌ ${intent}: ${data.error}`;

          switch (intent) {
            case "user_bio":
              return `👤 **Profile**: ${data.name || data.login}\n${
                data.bio || "No bio available"
              }\n📍 ${data.location || "Location not specified"}\n📊 ${
                data.public_repos
              } repos, ${data.followers} followers`;

            case "recent_repos":
              return `📁 **Recent Repositories**:\n${data
                .slice(0, 5)
                .map(
                  (repo) =>
                    `• ${repo.name} (${repo.language || "Unknown"}) - ${
                      repo.stars
                    } ⭐`
                )
                .join("\n")}`;

            case "repo_languages":
              return `💻 **Languages Used**:\n${data
                .slice(0, 5)
                .map((lang) => `• ${lang.language}: ${lang.count} repos`)
                .join("\n")}`;

            case "top_repositories":
              return `🌟 **Top Repositories**:\n${data
                .slice(0, 3)
                .map(
                  (repo) =>
                    `• ${repo.name} - ${repo.stars} ⭐ (${
                      repo.language || "Unknown"
                    })`
                )
                .join("\n")}`;

            case "followers":
              return `👥 **Followers**: ${data.length} followers found\n${data
                .slice(0, 5)
                .map((user) => `• ${user.username}`)
                .join("\n")}`;

            case "following":
              return `👤 **Following**: ${
                data.length
              } users being followed\n${data
                .slice(0, 5)
                .map((user) => `• ${user.username}`)
                .join("\n")}`;

            case "gists":
              return `📝 **Gists**: ${data.length} public gists\n${data
                .slice(0, 3)
                .map(
                  (gist) => `• ${gist.description} (${gist.files.length} files)`
                )
                .join("\n")}`;

            case "organizations":
              return `🏢 **Organizations**: ${data.length} organizations\n${data
                .slice(0, 5)
                .map((org) => `• ${org.name}`)
                .join("\n")}`;

            case "repository_stats":
              return `📊 **Repository Statistics**:\n• Total repos: ${data.total_repositories}\n• Total stars: ${data.total_stars}\n• Total forks: ${data.total_forks}\n• Primary language: ${data.primary_language}`;

            case "contribution_activity":
            case "coding_streak":
              return `📈 **Recent Activity**: ${
                data.length
              } events in the last 30 days\n${data
                .slice(0, 3)
                .map((event) => `• ${event.type} in ${event.repo}`)
                .join("\n")}`;

            case "profile_readme":
              return data.error
                ? `📄 **Profile README**: ${data.error}`
                : `📄 **Profile README**: Found (${data.size} bytes)`;

            default:
              return `📋 **${intent}**: ${
                Array.isArray(data) ? data.length : 1
              } items found`;
          }
        })
        .join("\n\n")}`;

      return Response.json({
        message: fallbackResponse,
        success: false,
        error: "ai_fallback",
        data: results,
      });
    }
  } catch (error) {
    console.error("🔥 Generate Response Error:", error);

    return Response.json(
      {
        message: `Sorry, I couldn't fetch GitHub data for ${username}. Please check if the username is correct and try again.`,
        success: false,
        error: "general_error",
      },
      { status: 500 }
    );
  }
}
