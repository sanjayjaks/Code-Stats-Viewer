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
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.result || data.result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = data.result[0];
    const result = {
      rating: user.rating || 0,
      rank: user.rank || 'unrated',
      maxRating: user.maxRating || 0,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Codeforces error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
