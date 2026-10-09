// Comprehensive test suite for lib/consultation.ts
// Run with: node scripts/test-consultation.mjs
import assert from "node:assert/strict";
import {
  runConsultationTurn,
  parseVariables,
  EMPTY_BRIEF,
  countFilled,
  OPENING_TURN,
  checkGeneralUncooperative,
  validateObjective,
  validateVariables,
  validateDataProfile,
  validateMethod,
} from "../lib/consultation.ts";

console.log("Starting Strict Academic Consultant Validation Tests...");

/* ------------------------------------------------------------------ */
/* Test 1: checkGeneralUncooperative Helper Unit Tests                 */
/* ------------------------------------------------------------------ */
const uncooperativeSamples = [
  "gamau",
  "ga mau",
  "nggak mau",
  "ogah",
  "males",
  "lah",
  "lah kok",
  "lah terus gimana",
  "kocak",
  "kocak lu",
  "gajelas",
  "ga jelas banget",
  "bodo amat",
  "terserah",
  "wkwkwk",
  "hahaha",
  "lol",
  "lawak",
  "asdfghjkl",
  "qwertyuiop",
  "zzzzz",
  "testing",
  "mau makan bakso",
  "siapa kamu",
  "cuaca hari ini",
  "rahasia",
  "ada deh",
  "kepo",
];

for (const sample of uncooperativeSamples) {
  const err = checkGeneralUncooperative(sample);
  assert.ok(
    err !== null,
    `Expected checkGeneralUncooperative to reject "${sample}", but returned null`
  );
}

// Legitimate academic words should NOT be rejected
assert.equal(checkGeneralUncooperative("Pengaruh kualitas pelayanan adalah objek utama penelitian"), null);
assert.equal(checkGeneralUncooperative("Data sekunder dari laporan tahunan di Bursa Efek Indonesia"), null);
assert.equal(checkGeneralUncooperative("Jumlah responden 100 mahasiswa di sekolah menengah"), null);

/* ------------------------------------------------------------------ */
/* Test 2: Stage 1 (Objective) Strict Academic Validation              */
/* ------------------------------------------------------------------ */
{
  let state = {
    brief: { ...EMPTY_BRIEF },
    awaiting: "objective",
  };

  const invalidInputs = [
    "gamau",
    "lah",
    "wkwk kocak",
    "asdfghjkl",
    "mau makan bakso",
    "skripsi saya susah",
    "apaan sih",
    "halo halo",
  ];

  for (const input of invalidInputs) {
    const turn = runConsultationTurn({
      message: input,
      brief: state.brief,
      awaiting: state.awaiting,
    });
    // Critical assertions: DO NOT transition state, DO NOT extract garbage
    assert.equal(
      turn.awaiting,
      "objective",
      `State must not advance on invalid input: "${input}"`
    );
    assert.equal(
      turn.brief.objective,
      null,
      `Brief objective must remain null, got: ${turn.brief.objective}`
    );
    assert.match(
      turn.reply,
      /(?:konsultan|akademik|tujuan penelitian|terstruktur|data penelitian)/i,
      `Reply must explain why input is invalid: ${turn.reply}`
    );
  }

  // Valid academic objective succeeds
  const validObjective = "Pengaruh motivasi kerja dan disiplin terhadap kinerja karyawan";
  const passTurn = runConsultationTurn({
    message: validObjective,
    brief: state.brief,
    awaiting: state.awaiting,
  });
  assert.equal(passTurn.awaiting, "variables");
  assert.equal(passTurn.brief.objective, validObjective);
}

/* ------------------------------------------------------------------ */
/* Test 3: Stage 2 (Variables) Strict Academic Validation              */
/* ------------------------------------------------------------------ */
{
  const baseBrief = {
    ...EMPTY_BRIEF,
    objective: "Pengaruh kualitas layanan terhadap kepuasan pelanggan",
  };

  const invalidVarInputs = [
    "gamau",
    "lah",
    "ogah jawab",
    "kocak",
    "terserah",
    "banyak",
    "asdfghjkl",
    "variabel bebas: gamau, variabel terikat: bodo",
    "mau makan bakso",
  ];

  for (const input of invalidVarInputs) {
    const turn = runConsultationTurn({
      message: input,
      brief: baseBrief,
      awaiting: "variables",
    });
    assert.equal(
      turn.awaiting,
      "variables",
      `State must not advance on invalid variable input: "${input}"`
    );
    assert.equal(
      turn.brief.variables,
      null,
      `Brief variables must remain null, got: ${JSON.stringify(turn.brief.variables)}`
    );
  }

  // Valid variables succeed
  const validVarInput = "Variabel bebas (X): kualitas layanan, harga. Variabel terikat (Y): kepuasan pelanggan.";
  const passTurn = runConsultationTurn({
    message: validVarInput,
    brief: baseBrief,
    awaiting: "variables",
  });
  assert.equal(passTurn.awaiting, "dataProfile");
  assert.deepEqual(passTurn.brief.variables.independent, ["kualitas layanan", "harga"]);
  assert.deepEqual(passTurn.brief.variables.dependent, ["kepuasan pelanggan"]);
}

/* ------------------------------------------------------------------ */
/* Test 4: Stage 3 (Data Profile) Strict Academic Validation           */
/* ------------------------------------------------------------------ */
{
  const baseBrief = {
    ...EMPTY_BRIEF,
    objective: "Pengaruh kualitas layanan terhadap kepuasan pelanggan",
    variables: {
      independent: ["kualitas layanan"],
      dependent: ["kepuasan pelanggan"],
      summary: "kualitas layanan -> kepuasan pelanggan",
    },
  };

  const invalidDataInputs = [
    "gamau",
    "lah",
    "kocak",
    "rahasia dong",
    "asdfghjkl",
    "makan bakso",
    "belum tahu",
    "data biasa",
  ];

  for (const input of invalidDataInputs) {
    const turn = runConsultationTurn({
      message: input,
      brief: baseBrief,
      awaiting: "dataProfile",
    });
    assert.equal(
      turn.awaiting,
      "dataProfile",
      `State must not advance on invalid dataProfile input: "${input}"`
    );
    assert.equal(
      turn.brief.dataProfile,
      null,
      `Brief dataProfile must remain null, got: ${turn.brief.dataProfile}`
    );
    assert.equal(
      turn.brief.method,
      null,
      `Brief method must remain null without valid data profile`
    );
  }

  // Valid data profile succeeds
  const validDataInput = "Data primer dari kuesioner skala Likert, 120 responden, data sudah terkumpul.";
  const passTurn = runConsultationTurn({
    message: validDataInput,
    brief: baseBrief,
    awaiting: "dataProfile",
  });
  assert.equal(passTurn.awaiting, "confirm");
  assert.equal(passTurn.brief.dataProfile, validDataInput);
  assert.ok(passTurn.brief.method !== null);
}

/* ------------------------------------------------------------------ */
/* Test 5: Stage 4 (Confirm) Strict Validation                         */
/* ------------------------------------------------------------------ */
{
  const baseBrief = {
    objective: "Pengaruh kualitas layanan terhadap kepuasan pelanggan",
    variables: {
      independent: ["kualitas layanan"],
      dependent: ["kepuasan pelanggan"],
      summary: "kualitas layanan -> kepuasan pelanggan",
    },
    dataProfile: "Data primer 100 responden",
    method: "Regresi linear sederhana",
  };

  const uncooperativeConfirms = [
    "gamau",
    "lah kok gitu",
    "kocak",
    "asdfghjkl",
    "males mikir",
  ];

  for (const input of uncooperativeConfirms) {
    const turn = runConsultationTurn({
      message: input,
      brief: baseBrief,
      awaiting: "confirm",
    });
    assert.equal(
      turn.awaiting,
      "confirm",
      `State must remain in confirm on uncooperative input: "${input}"`
    );
  }

  // User declining with "Dosen saya meminta metode lain." switches to method
  const declineTurn = runConsultationTurn({
    message: "Dosen saya meminta metode lain.",
    brief: baseBrief,
    awaiting: "confirm",
  });
  assert.equal(declineTurn.awaiting, "method");

  // User accepting moves to done
  const acceptTurn = runConsultationTurn({
    message: "Ya, sesuai.",
    brief: baseBrief,
    awaiting: "confirm",
  });
  assert.equal(acceptTurn.awaiting, "done");
}

/* ------------------------------------------------------------------ */
/* Test 6: Stage 5 (Method Override) Strict Validation                 */
/* ------------------------------------------------------------------ */
{
  const baseBrief = {
    objective: "Perbedaan nilai ujian",
    variables: {
      independent: ["model belajar"],
      dependent: ["nilai ujian"],
      summary: "model belajar -> nilai ujian",
    },
    dataProfile: "Data 50 siswa",
    method: null,
  };

  const invalidMethods = [
    "gamau",
    "lah",
    "metode sulap",
    "asdfghjkl",
    "terserah analis",
    "kocak",
  ];

  for (const input of invalidMethods) {
    const turn = runConsultationTurn({
      message: input,
      brief: baseBrief,
      awaiting: "method",
    });
    assert.equal(
      turn.awaiting,
      "method",
      `State must not advance on invalid method: "${input}"`
    );
    assert.equal(
      turn.brief.method,
      null,
      `Brief method must not be set to invalid method: "${input}"`
    );
  }

  // Valid statistical method succeeds
  const passTurn = runConsultationTurn({
    message: "Uji Mann-Whitney",
    brief: baseBrief,
    awaiting: "method",
  });
  assert.equal(passTurn.awaiting, "done");
  assert.equal(passTurn.brief.method, "Uji Mann-Whitney");
}

/* ------------------------------------------------------------------ */
/* Test 7: Full Valid Multi-turn Flow                                 */
/* ------------------------------------------------------------------ */
{
  let brief = { ...EMPTY_BRIEF };
  let awaiting = OPENING_TURN.awaiting;
  const say = (message) => {
    const turn = runConsultationTurn({ message, brief, awaiting });
    brief = turn.brief;
    awaiting = turn.awaiting;
    return turn;
  };

  // 1. Attempt uncooperative input
  let t = say("gamau");
  assert.equal(t.awaiting, "objective");
  assert.equal(brief.objective, null);

  // 2. Provide actual objective
  t = say("Pengaruh kualitas layanan dan harga terhadap kepuasan pelanggan");
  assert.equal(t.awaiting, "variables");
  assert.ok(brief.objective);

  // 3. Attempt joke on variables
  t = say("lah kocak banget");
  assert.equal(t.awaiting, "variables");
  assert.equal(brief.variables, null);

  // 4. Provide valid back-reference
  t = say("ikuti dari tujuan saja");
  assert.equal(t.awaiting, "dataProfile");
  assert.deepEqual(brief.variables.independent, ["kualitas layanan", "harga"]);

  // 5. Attempt nonsense on data profile
  t = say("mau makan bakso");
  assert.equal(t.awaiting, "dataProfile");
  assert.equal(brief.dataProfile, null);

  // 6. Provide valid data profile
  t = say("Data primer dari kuesioner skala Likert, 120 responden, sudah terkumpul.");
  assert.equal(t.awaiting, "confirm");
  assert.match(brief.method, /berganda/);

  // 7. Attempt slang on confirm
  t = say("bodo amat");
  assert.equal(t.awaiting, "confirm");

  // 8. Confirm properly
  t = say("Ya, sesuai.");
  assert.equal(t.awaiting, "done");
  assert.equal(countFilled(brief), 4);
}

console.log("All Strict Academic Consultant Validation Tests PASSED successfully! (100%)");
