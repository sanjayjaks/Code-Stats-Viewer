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
    const response = await fetch(`https://auth.geeksforgeeks.org/user/${username}/`);
    
    if (!response.ok) {
      return res.status(404).json({ error: "User not found" });
    }

    const html = await response.text();
    
    // Simple regex parsing instead of cheerio to avoid import issues
    let solved = 0;
    
    // Look for problems solved count using regex
    const problemsMatch = html.match(/(\d+)\s+problems\s+solved/i);
    if (problemsMatch) {
      solved = parseInt(problemsMatch[1]);
    } else {
      // Alternative: look for any number in profile section
      const altMatch = html.match(/profile[^>]*>(\d+)/i);
      if (altMatch) {
        solved = parseInt(altMatch[1]);
      }
    }
    
    const result = { solved };
    res.status(200).json(result);
  } catch (error) {
    console.error("GFG error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
