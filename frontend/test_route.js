require('dotenv').config({ path: './.env.local' });
const { tmdbClient } = require('./.next/server/app/api/chat/route.js');
async function run() {
  const sim = await tmdbClient.searchMulti("Spider-Man: Across the Spider-Verse");
  console.log("SIM:", sim);
}
run();
