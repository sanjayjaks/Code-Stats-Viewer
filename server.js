import express from 'express';
import cors from 'cors';
import userHandler from './api/user.js';
import leetcodeHandler from './api/leetcode.js';
import codeforcesHandler from './api/codeforces.js';
import codechefHandler from './api/codechef.js';
import gfgHandler from './api/gfg.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/user', userHandler);
app.get('/api/leetcode', leetcodeHandler);
app.get('/api/codeforces', codeforcesHandler);
app.get('/api/codechef', codechefHandler);
app.get('/api/gfg', gfgHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - http://localhost:${PORT}/api/user?username=<username>`);
  console.log(`  - http://localhost:${PORT}/api/leetcode?username=<username>`);
  console.log(`  - http://localhost:${PORT}/api/codeforces?username=<username>`);
  console.log(`  - http://localhost:${PORT}/api/codechef?username=<username>`);
  console.log(`  - http://localhost:${PORT}/api/gfg?username=<username>`);
});
