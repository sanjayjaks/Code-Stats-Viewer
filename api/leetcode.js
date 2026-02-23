export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    
    if (!data.data?.matchedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const submissions = data.data.matchedUser.submitStats.acSubmissionNum;
    const result = {};
    
    submissions.forEach(sub => {
      const difficulty = sub.difficulty.toLowerCase();
      if (difficulty === 'all') {
        result.total = sub.count;
      } else {
        result[difficulty] = sub.count;
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("LeetCode error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
