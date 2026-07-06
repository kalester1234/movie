require('dotenv').config({ path: './.env.local' });
const { recommendationEngine } = require('./.next/server/app/api/chat/route.js');

async function test() {
  const result = await recommendationEngine.rankAndEnrichSimilar("Man of Steel", "Overview", [{id: 1, title: "Superman"}]);
  console.log(result);
}
test();
