const { request } = require('@octokit/request');
require('dotenv').config({ path: '.dev.vars' });

async function run() {
  const token = process.env.ASH_LIST_TASKS_GITHUB_TOKEN;
  const owner = process.env.ASH_LIST_GITHUB_ORGANIZATION;
  console.log("Token:", token.substring(0, 15) + "...");
  console.log("Owner:", owner);

  try {
    const defaultHeaders = { authorization: `token ${token}` };
    const response = await request('GET /users/{owner}/repos', {
      owner,
      headers: defaultHeaders
    });
    console.log("Public Repos via /users: " + response.data.map(r => r.name).join(', '));
  } catch (e) { console.error(e.message); }

  try {
    const defaultHeaders = { authorization: `token ${token}` };
    const response = await request('GET /user/repos', {
      headers: defaultHeaders
    });
    console.log("All Repos via /user: " + response.data.map(r => r.name).join(', '));
  } catch (e) { console.error(e.message); }
}
run();
