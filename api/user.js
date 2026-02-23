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

  // ✅ check username exists
  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

    // ✅ handle invalid user
    if (!data.data || !data.data.matchedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(
      data.data.matchedUser.submitStats.acSubmissionNum
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}