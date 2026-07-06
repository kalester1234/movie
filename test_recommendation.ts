import { recommendationEngine } from './frontend/src/services/recommendationEngine';
import dotenv from 'dotenv';
dotenv.config({ path: './frontend/.env.local' });

async function test() {
  const candidates = [
    { id: 1, title: 'Test 1', overview: 'A great movie', release_date: '2020-01-01', vote_average: 8.5 },
    { id: 2, title: 'Test 2', overview: 'Another great movie', release_date: '2021-01-01', vote_average: 7.5 },
  ];
  const res = await recommendationEngine.rankAndEnrichSimilar('Test Movie', 'An overview of test movie', candidates);
  console.log(JSON.stringify(res, null, 2));
}

test();
