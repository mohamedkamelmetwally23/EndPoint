export default async function teardown() {
  const response = await fetch("http://127.0.0.1:4001/__test/cleanup", {
    method: "POST",
  });
  if (!response.ok) throw new Error("Browser test database cleanup failed");
}
