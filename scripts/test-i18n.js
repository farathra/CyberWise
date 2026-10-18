// scripts/test-i18n.js
// Automated verification tests for CyberWise Bilingual UI & Search Anti-Cheating
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🌐 Starting CyberWise Bilingual UI & Anti-Cheating Tests...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
  }
}

// 1. Check i18n file exists
console.log('--- Test Group 1: i18n Files and Configuration ---');
const i18nPath = path.join(rootDir, 'src', 'i18n.js');
assert(fs.existsSync(i18nPath), 'src/i18n.js exists');

// 2. Validate translation key parity between English and Indonesian
console.log('\n--- Test Group 2: Translation Key Parity ---');
const { translations, t, setLanguage, getLanguage, SUPPORTED_LANGUAGES } = await import('../src/i18n.js');

assert(Array.isArray(SUPPORTED_LANGUAGES) && SUPPORTED_LANGUAGES.includes('en') && SUPPORTED_LANGUAGES.includes('id'), 'Supported languages include en and id');

const enKeys = Object.keys(translations.en || {}).sort();
const idKeys = Object.keys(translations.id || {}).sort();

assert(enKeys.length > 50, `Substantial translation dictionary (found ${enKeys.length} EN keys)`);

const missingInId = enKeys.filter(k => !(k in translations.id));
const missingInEn = idKeys.filter(k => !(k in translations.en));

assert(missingInId.length === 0, `All EN keys exist in ID (missing: ${missingInId.join(', ') || 'none'})`);
assert(missingInEn.length === 0, `All ID keys exist in EN (missing: ${missingInEn.join(', ') || 'none'})`);

// Check interpolation
assert(t('dashboard.completedOf', { total: 14 }).includes('14'), 'Parameter interpolation works with total');
assert(t('nonexistent.key') === 'nonexistent.key', 'Fallback returns key for unknown translations');

// 3. Verify HTML Shell & Language Selector
console.log('\n--- Test Group 3: HTML Shell & Language Selector Integration ---');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
assert(indexHtml.includes('id="lang-selector"'), 'index.html contains #lang-selector');
assert(indexHtml.includes('data-lang="en"') && indexHtml.includes('data-lang="id"'), 'index.html contains EN and ID language buttons');
assert(indexHtml.includes('id="global-search-btn"'), 'index.html contains #global-search-btn');
assert(indexHtml.includes('id="theme-toggle"'), 'index.html contains #theme-toggle');

// 4. Verify CSS for Language Selector
console.log('\n--- Test Group 4: CSS Styles for Language Selector ---');
const componentsCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'components.css'), 'utf8');
assert(componentsCss.includes('.lang-selector'), 'components.css contains .lang-selector styling');
assert(componentsCss.includes('.lang-btn'), 'components.css contains .lang-btn styling');
assert(componentsCss.includes('.lang-divider'), 'components.css contains .lang-divider styling');

// 5. Anti-Cheating: Search Index MUST NOT index quiz questions
console.log('\n--- Test Group 5: Search Anti-Cheating Verification ---');
const searchIndexSrc = fs.readFileSync(path.join(rootDir, 'src', 'search', 'searchIndex.js'), 'utf8');

// Ensure quiz question iteration is removed from buildQuizIndex
assert(!searchIndexSrc.includes('qData.questions'), 'searchIndex.js does not load question bank arrays');
assert(!searchIndexSrc.includes('categoryLabel: \'Soal Kuis\'') && !searchIndexSrc.includes('quiz-q-'), 'searchIndex.js does not generate individual quiz question search items');
assert(!searchIndexSrc.includes('q.question'), 'searchIndex.js does not index q.question strings');

// 6. Educational Content Integrity: Confirm Markdown and JSON are strictly Indonesian
console.log('\n--- Test Group 6: Educational Content Indonesian Integrity ---');
const lesson1a = fs.readFileSync(path.join(rootDir, 'materi', '1-a.md'), 'utf8');
assert(lesson1a.includes('Pengertian Keamanan Digital') && lesson1a.includes('Kerahasiaan'), 'Lesson 1-a retains full original Indonesian content');

const quiz1a = JSON.parse(fs.readFileSync(path.join(rootDir, 'quiz', '1-a.json'), 'utf8'));
assert(quiz1a.questions[0].question.length > 10, 'Quiz 1-a questions are preserved');
assert(quiz1a.questions[0].explanation.length > 10, 'Quiz 1-a explanations are preserved');

const glossary = JSON.parse(fs.readFileSync(path.join(rootDir, 'glossary', 'glossary.json'), 'utf8'));
assert(glossary.terms.length === 35, 'Glossary terms count preserved at 35');
assert(glossary.terms.some(t => t.id === 'triad-cia' && t.definition.includes('Kerahasiaan')), 'Glossary definitions strictly preserved in Indonesian');

console.log(`\n==================================================`);
console.log(`📊 i18n Test Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
if (passedTests === totalTests) {
  console.log(`🎉 ALL BILINGUAL & ANTI-CHEATING TESTS PASSED!`);
} else {
  process.exit(1);
}
