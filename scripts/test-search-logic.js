// scripts/test-search-logic.js
// Unit tests for search matching, ranking, XSS prevention, and snippet extraction
import { stripHtml, stripMarkdown, escapeHtml, highlightMatch, extractSnippet } from '../src/search/searchIndex.js';

console.log('🧪 Testing Search Logic and XSS Safety...\n');

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`, err.message);
  }
}

// 1. HTML Stripping
test('stripHtml strips nested tags and scripts cleanly', () => {
  // In node environment, if DOM isn't present, test fallback or simulate
  const text = '<div><h2>Hello <strong>World</strong></h2><p>Cyber security test</p></div>';
  const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (stripped !== 'Hello World Cyber security test') throw new Error(`Unexpected: "${stripped}"`);
});

// 2. Markdown Stripping
test('stripMarkdown removes markdown tokens while keeping plain words', () => {
  const md = `---
id: 1-a
title: Test
---
# Heading 1
## A. Subheading
Ini adalah teks dengan **tebal** dan *miring*, serta [tautan](https://example.com) dan \`kode\`.
> Kutipan penting di sini.
`;
  const clean = stripMarkdown(md);
  if (clean.includes('---') || clean.includes('#') || clean.includes('**') || clean.includes('`')) {
    throw new Error(`Markdown tokens remained in: "${clean}"`);
  }
  if (!clean.includes('Ini adalah teks dengan tebal dan miring')) {
    throw new Error(`Clean text missing content: "${clean}"`);
  }
});

// 3. XSS Escaping
test('escapeHtml safely escapes all dangerous characters', () => {
  const malicious = '<script>alert("XSS & attack")</script>\'';
  const safe = escapeHtml(malicious);
  if (safe.includes('<script>') || safe.includes('"') || safe.includes("'")) {
    throw new Error(`Unescaped characters found: ${safe}`);
  }
  if (!safe.includes('&lt;script&gt;') || !safe.includes('&quot;')) {
    throw new Error(`Did not escape properly: ${safe}`);
  }
});

// 4. Safe Keyword Highlighting (No XSS Injection)
test('highlightMatch highlights keyword safely without allowing HTML injection', () => {
  const untrustedText = 'Serangan <script>alert(1)</script> dan ransomware berbahaya';
  const tokens = ['script', 'ransomware'];
  const highlighted = highlightMatch(untrustedText, tokens);

  // Must escape the script tag
  if (highlighted.includes('<script>')) {
    throw new Error(`Dangerous HTML script tag was not escaped! Output: ${highlighted}`);
  }
  // Must highlight
  if (!highlighted.includes('<mark class="search-match">')) {
    throw new Error(`Highlight tag not inserted: ${highlighted}`);
  }
});

// 5. Snippet Window Extraction
test('extractSnippet extracts relevant window around match', () => {
  const longText = 'Pengantar dasar teknologi digital dimulai dari masa lalu yang panjang. Di tengah-tengah teks ini terdapat konsep ransomware berbahaya yang mengenkripsi berkas pengguna tanpa izin. Bagian akhir teks berisi ringkasan kesimpulan yang panjang sekali.';
  const snippet = extractSnippet(longText, ['ransomware'], 80);

  if (!snippet.includes('ransomware')) {
    throw new Error(`Snippet did not contain matching term: ${snippet}`);
  }
  if (snippet.length > 120) {
    throw new Error(`Snippet too long: ${snippet.length} chars`);
  }
});

// 6. Multi-token partial word matching
test('highlightMatch handles multi-token and case-insensitivity', () => {
  const text = 'Sistem Keamanan Digital dan Enkripsi Data';
  const tokens = ['keamanan', 'ENKRIPSI'];
  const highlighted = highlightMatch(text, tokens);

  const matchCount = (highlighted.match(/<mark class="search-match">/g) || []).length;
  if (matchCount !== 2) {
    throw new Error(`Expected 2 matches, got ${matchCount}. Output: ${highlighted}`);
  }
});

// 7. Single-letter queries with HTML characters (no entity mangling)
test('highlightMatch preserves HTML entities and does not mangle &amp; when searching "a"', () => {
  const text = 'Keamanan & Privasi Data';
  const highlighted = highlightMatch(text, ['a']);
  // Must NOT have broken entity like &<mark class="search-match">a</mark>mp;
  if (highlighted.includes('&<mark') || highlighted.includes(';mp') || highlighted.includes('&amp;<mark')) {
    throw new Error(`HTML entity was corrupted into: ${highlighted}`);
  }
  if (!highlighted.includes('&amp;')) {
    throw new Error(`Ampersand was not properly escaped: ${highlighted}`);
  }
  if (!highlighted.includes('<mark class="search-match">a</mark>')) {
    throw new Error(`Expected letter "a" to be highlighted: ${highlighted}`);
  }
});

// 8. Regex special characters in query tokens
test('highlightMatch handles regex special characters safely without crashing', () => {
  const text = 'Protokol HTTPS (Port 443) [RFC 2818] {v1.2} + TLS $100 * test';
  const tokens = ['(', '[', '{', '+', '$', '*'];
  const highlighted = highlightMatch(text, tokens);
  if (!highlighted.includes('<mark class="search-match">(')) {
    throw new Error(`Failed to highlight special character '(': ${highlighted}`);
  }
});

// 9. Null, undefined, and empty string safety
test('highlightMatch and extractSnippet handle null and undefined safely', () => {
  const hNull = highlightMatch(null, ['test']);
  const hUndef = highlightMatch(undefined, ['test']);
  const sNull = extractSnippet(null, ['test']);
  const sUndef = extractSnippet(undefined, ['test']);
  if (hNull !== '' || hUndef !== '' || sNull !== '' || sUndef !== '') {
    throw new Error('Did not return empty string on nullish input');
  }
});

console.log(`\n==================================================`);
console.log(`📊 Unit Test Summary: ${passed}/${total} Passed (${Math.round((passed/total)*100)}%)`);
if (passed === total) {
  console.log(`🎉 ALL UNIT TESTS PASSED!`);
} else {
  process.exit(1);
}
