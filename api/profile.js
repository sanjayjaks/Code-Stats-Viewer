import cheerio from 'cheerio';

// LeetCode data fetcher
async function fetchLeetCodeData(username) {
  if (!username) return null;
  
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
      return null;
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

    return result;
  } catch (error) {
    console.error("LeetCode error:", error);
    return null;
  }
}

// Codeforces data fetcher
async function fetchCodeforcesData(username) {
  if (!username) return null;
  
  try {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.result || data.result.length === 0) {
      return null;
    }

    const user = data.result[0];
    return {
      rating: user.rating || 0,
      rank: user.rank || 'unrated',
      maxRating: user.maxRating || 0,
    };
  } catch (error) {
    console.error("Codeforces error:", error);
    return null;
  }
}

// CodeChef data fetcher
async function fetchCodeChefData(username) {
  if (!username) return null;
  
  try {
    const response = await fetch(`https://www.codechef.com/users/${username}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const ratingText = $('.rating-number').text().trim();
    const rating = parseInt(ratingText) || 0;
    
    const starsElement = $('.rating-star').length > 0 ? 
      $('.rating-star').first().parent().text().trim() : '';
    
    let stars = '';
    if (starsElement.includes('star')) {
      stars = starsElement.split('star')[0].trim() + 'star';
    }
    
    return { rating, stars };
  } catch (error) {
    console.error("CodeChef error:", error);
    return null;
  }
}

// GFG data fetcher
async function fetchGFGData(username) {
  if (!username) return null;
  
  try {
    const response = await fetch(`https://auth.geeksforgeeks.org/user/${username}/`);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const problemsSolvedText = $('.profile_head_content--small').text();
    const match = problemsSolvedText.match(/(\d+)\s+problems\s+solved/i);
    
    if (match) {
      return { problemsSolved: parseInt(match[1]) };
    }
    
    // Alternative parsing
    const altMatch = problemsSolvedText.match(/(\d+)/);
    if (altMatch) {
      return { problemsSolved: parseInt(altMatch[1]) };
    }
    
    return null;
  } catch (error) {
    console.error("GFG error:", error);
    return null;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { leetcode, codeforces, codechef, gfg } = req.query;

  try {
    // Fetch data from all platforms in parallel
    const [
      leetcodeData,
      codeforcesData,
      codechefData,
      gfgData
    ] = await Promise.allSettled([
      fetchLeetCodeData(leetcode),
      fetchCodeforcesData(codeforces),
      fetchCodeChefData(codechef),
      fetchGFGData(gfg)
    ]);

    const result = {
      leetcode: leetcodeData.status === 'fulfilled' ? leetcodeData.value : null,
      codeforces: codeforcesData.status === 'fulfilled' ? codeforcesData.value : null,
      codechef: codechefData.status === 'fulfilled' ? codechefData.value : null,
      gfg: gfgData.status === 'fulfilled' ? gfgData.value : null,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Profile API error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
