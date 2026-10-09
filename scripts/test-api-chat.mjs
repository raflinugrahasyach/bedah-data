// scripts/test-api-chat.mjs
async function sendChat(message, brief, awaiting) {
  const res = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, brief, awaiting }),
  });
  return await res.json();
}

async function run() {
  let brief = { objective: null, variables: null, dataProfile: null, method: null };
  let awaiting = "objective";

  const garbageInputs = [
    "gamau",
    "lah",
    "kocak banget lu wkwk",
    "asdfghjkl",
    "mau makan bakso",
    "ogah",
    "skripsi doang susah amat",
  ];

  console.log("--- Testing uncooperative inputs on Stage 1 (objective) ---");
  for (const input of garbageInputs) {
    const data = await sendChat(input, brief, awaiting);
    if (data.awaiting !== "objective" || data.brief.objective !== null) {
      throw new Error(`Failed for input "${input}": state transitioned or brief corrupted!`);
    }
    console.log(`[PASS] "${input}" -> Refused properly. Reply: "${data.reply.slice(0, 60)}..."`);
  }

  console.log("\n--- Testing valid academic input on Stage 1 (objective) ---");
  const validObjective = "Pengaruh kompensasi dan beban kerja terhadap turnover intention karyawan";
  const validData = await sendChat(validObjective, brief, awaiting);
  if (validData.awaiting !== "variables" || validData.brief.objective !== validObjective) {
    throw new Error("Valid academic input was rejected!");
  }
  console.log(`[PASS] Valid objective accepted. Next stage: ${validData.awaiting}`);
  brief = validData.brief;
  awaiting = validData.awaiting;

  console.log("\n--- Testing uncooperative input on Stage 2 (variables) ---");
  const garbageVar = await sendChat("variabel bebas: gamau, variabel terikat: bodo", brief, awaiting);
  if (garbageVar.awaiting !== "variables" || garbageVar.brief.variables !== null) {
    throw new Error("Failed for garbage variables!");
  }
  console.log(`[PASS] Garbage variables refused properly. Next stage remains: ${garbageVar.awaiting}`);

  console.log("\n--- All live API tests passed! ---");
}

run().catch((e) => {
  console.error("TEST FAILED:", e);
  process.exit(1);
});
