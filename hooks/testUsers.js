// Script to automatically create two test users and verify participants and prize pool
(async () => {
  const base = 'http://localhost:8080';
  const testUsers = [
    { name: 'TestUser1', telegramId: '1001' },
    { name: 'TestUser2', telegramId: '1002' }
  ];
  for (const user of testUsers) {
    try {
      const res = await fetch(`${base}/pending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      console.log(`Added ${user.name}:`, await res.json());
    } catch (err) {
      console.error(`Error adding ${user.name}:`, err.message);
    }
  }
  try {
    const participants = await (await fetch(`${base}/participants`)).json();
    console.log('Participants:', participants);
    const pool = await (await fetch(`${base}/prizepool`)).json();
    console.log('Prize Pool:', pool);
  } catch (err) {
    console.error('Error fetching data:', err.message);
  }
})();
