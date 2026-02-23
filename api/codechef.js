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
    const response = await fetch(`https://www.codechef.com/users/${username}`);
    
    if (!response.ok) {
      return res.status(404).json({ error: "User not found" });
    }

    const html = await response.text();
    
    // Simple regex parsing instead of cheerio to avoid import issues
    let rating = '0';
    let stars = '';
    
    // Extract rating using regex
    const ratingMatch = html.match(/<div[^>]*class="rating-number"[^>]*>(\d+)<\/div>/);
    if (ratingMatch) {
      rating = ratingMatch[1];
    }
    
    // Extract stars using regex
    const starsMatch = html.match(/<div[^>]*class="rating"[^>]*>([^<]*star[^<]*)<\/div>/i);
    if (starsMatch) {
      stars = starsMatch[1].trim();
    }
    
    const result = { rating, stars };
    res.status(200).json(result);
  } catch (error) {
    console.error("CodeChef error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
