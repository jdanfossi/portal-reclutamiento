const { createClient } = require('@libsql/client');
const client = createClient({
  url: "libsql://antigravity-portal-jdanfossi.aws-us-east-2.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzM3NjcyMzQsImlkIjoiMDE5Y2ZjYzMtZjAwMS03OWMwLWI3OWYtZGZkMjYxMzc2YTlmIiwicmlkIjoiNmQ3NjIxZTMtN2VkNi00NGQzLWJhYjEtODU0NWFlYWJlMzI4In0.wjL60Mh4oHK_EduNDmuTpnroya96K3G1QKqrh0tATsJpNsJJwkBP5BBpiFdI3_JVFQFnHcQZsmTYWfpXgFW5AA"
});

async function run() {
  const res = await client.execute("SELECT id, titulo FROM vacantes");
  console.log(res.rows);
}
run();
