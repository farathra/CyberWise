#!/usr/bin/env node
// CyberWise Content Validator
// Usage: node scripts/validate-content.js          (Phase 1 mode)
//        node scripts/validate-content.js --full   (Full content check)

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FULL_MODE = process.argv.includes('--full');
const REQUIRED_TOTAL = 420;
const REQUIRED_PER_SUBCHAPTER = 30;
const SELECT_PER_SUBCHAPTER = 10;

let errors = 0;
let warnings = 0;

function pass(msg) { console.log('  ✅', msg); }
function warn(msg) { console.warn('  ⚠️ ', msg); warnings++; }
function fail(msg) { console.error('  ❌', msg); errors++; }
function section(title) { console.log(`\n📋 ${title}`); }

function readJson(filePath) {
  const abs = resolve(ROOT, filePath);
  if (!existsSync(abs)) { fail(`File not found: ${filePath}`); return null; }
  try { return JSON.parse(readFileSync(abs, 'utf8')); }
  catch (e) { fail(`Invalid JSON in ${filePath}: ${e.message}`); return null; }
}

function fileExists(filePath) {
  return existsSync(resolve(ROOT, filePath));
}

console.log('🔍 CyberWise Content Validator');
console.log(`   Mode: ${FULL_MODE ? 'Full Content' : 'Phase 1 (structural)'}`);
console.log('='.repeat(50));

// 1. Validate lesson manifest
section('Lesson Manifest (materi/manifest.json)');
const lessonManifest = readJson('materi/manifest.json');
if (lessonManifest) {
  const lessons = lessonManifest.lessons;
  if (!Array.isArray(lessons)) { fail('lessons must be an array'); }
  else {
    pass(`Found ${lessons.length} lesson entries`);
    const lessonIds = new Set();
    const required = ['id','chapterId','chapterTitle','title','file'];
    lessons.forEach(l => {
      required.forEach(f => { if (!l[f]) fail(`Lesson ${l.id || '?'}: missing field "${f}"`); });
      if (lessonIds.has(l.id)) fail(`Duplicate lesson ID: ${l.id}`);
      lessonIds.add(l.id);
      if (l.file && !fileExists(l.file)) fail(`Lesson file not found: ${l.file}`);
      else if (l.file) pass(`${l.id}: ${l.file} ✓`);
    });
  }
}

// 2. Validate quiz manifest
section('Quiz Manifest (quiz/manifest.json)');
const quizManifest = readJson('quiz/manifest.json');
let allQuestions = [];
let subchapterCounts = {};
if (quizManifest) {
  const subchapters = quizManifest.subchapters;
  if (!Array.isArray(subchapters)) { fail('subchapters must be an array'); }
  else {
    pass(`Found ${subchapters.length} subchapter entries`);
    const globalIds = new Set();

    for (const sub of subchapters) {
      section(`  Quiz: ${sub.id}`);
      const data = readJson(sub.file);
      if (!data) continue;

      const questions = data.questions;
      if (!Array.isArray(questions)) { fail(`${sub.id}: questions must be an array`); continue; }

      pass(`${sub.id}: ${questions.length} questions found`);
      subchapterCounts[sub.id] = questions.length;

      questions.forEach((q, i) => {
        const qRef = `${sub.id} Q#${i+1} (${q.id || 'no-id'})`;
        if (!q.id) fail(`${qRef}: missing id`);
        else if (globalIds.has(q.id)) fail(`${qRef}: duplicate ID "${q.id}"`);
        else globalIds.add(q.id);

        if (!q.question) fail(`${qRef}: missing question text`);
        if (!Array.isArray(q.options) || q.options.length !== 4) fail(`${qRef}: must have exactly 4 options`);
        if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) fail(`${qRef}: answer must be 0-3, got ${q.answer}`);
        if (q.chapterId !== sub.chapterId) fail(`${qRef}: chapterId mismatch (${q.chapterId} vs ${sub.chapterId})`);
        if (q.subchapterId !== sub.id) fail(`${qRef}: subchapterId mismatch (${q.subchapterId} vs ${sub.id})`);
        if (!q.explanation) warn(`${qRef}: missing explanation`);
      });

      allQuestions = allQuestions.concat(questions);

      if (FULL_MODE) {
        if (questions.length < REQUIRED_PER_SUBCHAPTER) fail(`${sub.id}: needs ${REQUIRED_PER_SUBCHAPTER} questions for Phase 2, has ${questions.length}`);
      } else {
        if (questions.length < SELECT_PER_SUBCHAPTER) warn(`${sub.id}: has ${questions.length} questions (min ${SELECT_PER_SUBCHAPTER} to run quiz; ${REQUIRED_PER_SUBCHAPTER} needed for Phase 2)`);
      }
    }

    pass(`Total unique question IDs: ${globalIds.size}`);
    if (FULL_MODE && allQuestions.length !== REQUIRED_TOTAL) {
      fail(`Total questions: ${allQuestions.length}. Expected ${REQUIRED_TOTAL} for full curriculum.`);
    } else if (!FULL_MODE) {
      if (allQuestions.length < REQUIRED_TOTAL) {
        warn(`Total questions: ${allQuestions.length} (Phase 1 sample). ${REQUIRED_TOTAL} required for Phase 2.`);
      } else {
        pass(`Total questions: ${allQuestions.length}. Complete ${REQUIRED_TOTAL} questions for Phase 2 ready!`);
      }
    }
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors === 0) {
  console.log(`✅ Validation passed with ${warnings} warning(s).`);
  process.exit(0);
} else {
  console.log(`❌ Validation failed: ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
}
