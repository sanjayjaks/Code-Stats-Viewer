import cheerio from "cheerio";

/* ---------------- COMMON HEADERS ---------------- */
const browserHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/json",
};

/* ---------------- LEETCODE ---------------- */
async function fetchLeetCodeData(username) {
  if (!username) return null;

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": browserHeaders["User-Agent"],
      },
      body: JSON.stringify({
        query: `
          query ($username: String!) {
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
        `,
        variables: { username },
      }),
    });

    const data = await response.json();
    if (!data.data?.matchedUser) return null;

    const submissions =
      data.data.matchedUser.submitStats.acSubmissionNum;

    const result = {};
    submissions.forEach((sub) => {
      const difficulty = sub.difficulty.toLowerCase();
      if (difficulty === "all") result.total = sub.count;
      else result[difficulty] = sub.count;
    });

    return result;
  } catch (error) {
    console.error("LeetCode error:", error);
    return null;
  }
}

/* ---------------- CODEFORCES ---------------- */
async function fetchCodeforcesData(username) {
  if (!username) return null;

  try {
    const response = await fetch(
      `https://codeforces.com/api/user.info?handles=${username}`,
      { headers: browserHeaders }
    );

    const data = await response.json();

    if (data.status !== "OK" || !data.result?.length) return null;

    const user = data.result[0];

    return {
      rating: user.rating || 0,
      rank: user.rank || "unrated",
      maxRating: user.maxRating || 0,
    };
  } catch (error) {
    console.error("Codeforces error:", error);
    return null;
  }
}

/* ---------------- CODECHEF ---------------- */
async function fetchCodeChefData(username) {
  if (!username) return null;

  try {
    const response = await fetch(
      `https://www.codechef.com/users/${username}`,
      { headers: browserHeaders }
    );

    const html = await response.text();
    const $ = cheerio.load(html);

    const ratingText = $(".rating-number").text().trim();
    const rating = parseInt(ratingText) || 0;

    const starsElement =
      $(".rating-star").length > 0
        ? $(".rating-star").first().parent().text().trim()
        : "";

    let stars = "";
    if (starsElement.includes("star")) {
      stars = starsElement.split("star")[0].trim() + "star";
    }

    return { rating, stars };
  } catch (error) {
    console.error("CodeChef error:", error);
    return null;
  }
}

/* ---------------- GFG ---------------- */
async function fetchGFGData(username) {
  if (!username) return null;

  try {
    const response = await fetch(
      `https://auth.geeksforgeeks.org/user/${username}/`,
      { headers: browserHeaders }
    );

    const html = await response.text();
    const $ = cheerio.load(html);

    const text = $(".profile_head_content--small").text();

    const match = text.match(/(\d+)\s+problems\s+solved/i);
    if (match) {
      return { problemsSolved: parseInt(match[1]) };
    }

    const altMatch = text.match(/(\d+)/);
    if (altMatch) {
      return { problemsSolved: parseInt(altMatch[1]) };
    }

    return null;
  } catch (error) {
    console.error("GFG error:", error);
    return null;
  }
}

/* ---------------- API HANDLER ---------------- */
export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { leetcode, codeforces, codechef, gfg } = req.query;

  try {
    const results = await Promise.allSettled([
      fetchLeetCodeData(leetcode),
      fetchCodeforcesData(codeforces),
      fetchCodeChefData(codechef),
      fetchGFGData(gfg),
    ]);

    res.status(200).json({
      leetcode:
        results[0].status === "fulfilled" ? results[0].value : null,
      codeforces:
        results[1].status === "fulfilled" ? results[1].value : null,
      codechef:
        results[2].status === "fulfilled" ? results[2].value : null,
      gfg: results[3].status === "fulfilled" ? results[3].value : null,
    });
  } catch (error) {
    console.error("Profile API error:", error);
    res.status(500).json({ error: "Server error" });
  }
}