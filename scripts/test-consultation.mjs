// Smoke test for lib/consultation.ts (run: node scripts/test-consultation.mjs)
import assert from "node:assert/strict";
import { runConsultationTurn, parseVariables, EMPTY_BRIEF, countFilled, OPENING_TURN } from "../lib/consultation.ts";

let brief = { ...EMPTY_BRIEF };
let awaiting = OPENING_TURN.awaiting;
const say = (message) => {
  const turn = runConsultationTurn({ message, brief, awaiting });
  brief = turn.brief;
  awaiting = turn.awaiting;
  return turn;
};

// variable parsing
const v1 = parseVariables("Variabel bebas (X): kualitas layanan, harga. Variabel terikat (Y): kepuasan pelanggan.", null);
assert.deepEqual(v1.independent, ["kualitas layanan", "harga"]);
assert.deepEqual(v1.dependent, ["kepuasan pelanggan"]);
const v2 = parseVariables("X: motivasi belajar dan disiplin; Y: prestasi akademik", null);
assert.deepEqual(v2.independent, ["motivasi belajar", "disiplin"]);
assert.deepEqual(v2.dependent, ["prestasi akademik"]);

// full flow (regression)
assert.equal(say("tes").awaiting, "objective"); // too short -> stays
let t = say("Pengaruh kualitas layanan dan harga terhadap kepuasan pelanggan");
assert.equal(t.awaiting, "variables");
t = say("ikuti dari tujuan saja");
assert.equal(t.awaiting, "dataProfile");
assert.deepEqual(brief.variables.independent, ["kualitas layanan", "harga"]);
t = say("Data primer dari kuesioner skala Likert, 120 responden, sudah terkumpul.");
assert.equal(t.awaiting, "confirm");
assert.match(brief.method, /berganda/);
assert.match(t.reply, /validitas dan reliabilitas/);
t = say("Ya, sesuai.");
assert.equal(t.awaiting, "done");
assert.equal(countFilled(brief), 4);

// alternate: user overrides method
brief = { ...EMPTY_BRIEF }; awaiting = "objective";
say("Perbedaan nilai ujian antara siswa daring dan tatap muka");
say("Variabel bebas: model belajar; variabel terikat: nilai ujian");
t = say("Data sekunder nilai 20 siswa, sudah ada");
assert.match(brief.method, /Uji t sampel independen/);
assert.match(t.reply, /n = 20/);
t = say("Dosen saya meminta metode lain.");
assert.equal(t.awaiting, "method");
t = say("Uji Mann-Whitney");
assert.equal(t.awaiting, "done");
assert.equal(brief.method, "Uji Mann-Whitney");

// panel + mediation
brief = { ...EMPTY_BRIEF }; awaiting = "objective";
say("Pengaruh leverage terhadap nilai perusahaan dengan mediasi profitabilitas");
say("X: leverage; Y: nilai perusahaan");
say("Data sekunder laporan keuangan 30 perusahaan selama 5 tahun (panel)");
assert.match(brief.method, /PLS-SEM/);

console.log("consultation smoke test: OK");
