// scripts/test-glossary.js
// Automated verification for CyberWise Cybersecurity Glossary
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('📖 Starting CyberWise Glossary Verification Tests...\n');

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

// 1. Files & Manifest Existence
console.log('--- Test Group 1: Files and Configuration ---');
const glossaryJsonPath = path.join(rootDir, 'glossary', 'glossary.json');
assert(fs.existsSync(glossaryJsonPath), 'glossary/glossary.json exists');

const glossaryDataJsPath = path.join(rootDir, 'src', 'glossary', 'glossaryData.js');
assert(fs.existsSync(glossaryDataJsPath), 'src/glossary/glossaryData.js exists');

const glossaryJsPath = path.join(rootDir, 'src', 'glossary', 'glossary.js');
assert(fs.existsSync(glossaryJsPath), 'src/glossary/glossary.js exists');

const glossaryCssPath = path.join(rootDir, 'src', 'styles', 'glossary.css');
assert(fs.existsSync(glossaryCssPath), 'src/styles/glossary.css exists');

// 2. Validate Glossary JSON Schema and Content
console.log('\n--- Test Group 2: Content Schema and Validity ---');
const rawJson = fs.readFileSync(glossaryJsonPath, 'utf8');
let glossaryData;
try {
  glossaryData = JSON.parse(rawJson);
  assert(true, 'glossary/glossary.json is valid JSON');
} catch (err) {
  assert(false, 'glossary/glossary.json is valid JSON: ' + err.message);
}

const terms = glossaryData?.terms || [];
assert(terms.length >= 25 && terms.length <= 35, `Term count is between 25 and 35 (found: ${terms.length})`);

// 3. Validate Lesson IDs
console.log('\n--- Test Group 3: Lesson ID Integrity ---');
const materiManifestPath = path.join(rootDir, 'materi', 'manifest.json');
const materiManifest = JSON.parse(fs.readFileSync(materiManifestPath, 'utf8'));
const validLessonIds = new Set(materiManifest.lessons.map(l => l.id));

const termIds = new Set();
let allLessonIdsValid = true;
let allRelatedTermsValid = true;
let allFieldsValid = true;
let invalidLessonRef = null;
let invalidTermRef = null;

// Collect all IDs first
terms.forEach(t => termIds.add(t.id));

terms.forEach(t => {
  if (!t.id || !t.term || !t.category || !t.definition || !t.example) {
    allFieldsValid = false;
  }

  // Check relatedLessons
  (t.relatedLessons || []).forEach(lId => {
    if (!validLessonIds.has(lId)) {
      allLessonIdsValid = false;
      invalidLessonRef = `Term "${t.id}" references non-existent lesson "${lId}"`;
    }
  });

  // Check relatedTerms
  (t.relatedTerms || []).forEach(rId => {
    if (!termIds.has(rId)) {
      allRelatedTermsValid = false;
      invalidTermRef = `Term "${t.id}" references non-existent related term "${rId}"`;
    }
  });
});

assert(allFieldsValid, 'All terms have id, term, category, definition, and example');
assert(allLessonIdsValid, invalidLessonRef || 'All relatedLessons references point to genuine existing lessons');
assert(allRelatedTermsValid, invalidTermRef || 'All relatedTerms references point to existing glossary terms');

// 4. Topic Coverage Checklist
console.log('\n--- Test Group 4: Required Topic Coverage ---');
const requiredTopics = [
  { topic: 'Keamanan data dan informasi', test: terms.some(t => t.id === 'keamanan-data-dan-informasi' || t.id === 'triad-cia') },
  { topic: 'Privasi dan identitas digital', test: terms.some(t => t.id === 'privasi-digital' || t.id === 'data-pribadi') },
  { topic: 'Kata sandi & 2FA', test: terms.some(t => t.id === 'kata-sandi-kuat') && terms.some(t => t.id === 'autentikasi-dua-faktor') },
  { topic: 'Phishing & social engineering', test: terms.some(t => t.id === 'phishing') && terms.some(t => t.id === 'rekayasa-sosial') },
  { topic: 'Malware taxonomy (virus, worm, trojan, ransomware, spyware, adware)', test: ['malware', 'virus-komputer', 'worm', 'trojan-horse', 'ransomware', 'spyware', 'adware'].every(id => terms.some(t => t.id === id)) },
  { topic: 'Antivirus & firewall', test: terms.some(t => t.id === 'antivirus') && terms.some(t => t.id === 'firewall') },
  { topic: 'Enkripsi & dekripsi', test: terms.some(t => t.id === 'enkripsi') && terms.some(t => t.id === 'dekripsi') },
  { topic: 'Backup & kebocoran data', test: terms.some(t => t.id === 'backup') && terms.some(t => t.id === 'kebocoran-data') },
  { topic: 'Jejak digital & jaringan Wi-Fi publik', test: terms.some(t => t.id === 'jejak-digital') && terms.some(t => t.id === 'jaringan-wi-fi-publik') }
];

requiredTopics.forEach(req => {
  assert(req.test, `Covers topic: ${req.topic}`);
});

// 5. Integration Verification
console.log('\n--- Test Group 5: UI & Architecture Integration ---');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
assert(indexHtml.includes('href="#/glossary"') && indexHtml.includes('data-tab="glossary"'), 'index.html contains Glossary nav tab link');

const mainJs = fs.readFileSync(path.join(rootDir, 'src', 'main.js'), 'utf8');
assert(mainJs.includes('renderGlossary'), 'src/main.js imports renderGlossary');
assert(mainJs.includes('route(/^\\/glossary$/'), 'src/main.js registers /glossary route');
assert(mainJs.includes('route(/^\\/glossary\\/(?<termId>'), 'src/main.js registers /glossary/:termId route');

const mainCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'main.css'), 'utf8');
assert(mainCss.includes("import './glossary.css'"), 'src/styles/main.css imports glossary.css');

const viteConfig = fs.readFileSync(path.join(rootDir, 'vite.config.js'), 'utf8');
assert(viteConfig.includes("src: 'glossary/*'"), 'vite.config.js copies glossary/* to dist');
assert(viteConfig.includes("relativeUrl.startsWith('/glossary/')"), 'vite.config.js serves /glossary/ in dev server');

const swJs = fs.readFileSync(path.join(rootDir, 'public', 'sw.js'), 'utf8');
assert(swJs.includes("path.includes('/glossary/')"), 'public/sw.js caches /glossary/ content for offline use');

console.log(`\n==================================================`);
console.log(`📊 Glossary Test Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
if (passedTests === totalTests) {
  console.log(`🎉 ALL GLOSSARY TESTS PASSED!`);
} else {
  process.exit(1);
}
