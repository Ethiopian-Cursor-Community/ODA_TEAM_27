/**
 * Generates Ethiopian curriculum definitions via Groq API and updates lib/learn-data.ts
 *
 * Prerequisites:
 *   1. Dev server running: npm run dev
 *   2. GROQ_API_KEY in .env.local
 *
 * Usage:
 *   npm run generate-definitions
 *   npm run generate-definitions -- --dry-run
 *   npm run generate-definitions -- --limit=5
 *   npm run generate-definitions -- --skip-existing
 *   BASE_URL=http://localhost:3000 DELAY_MS=2000 npm run generate-definitions
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LEARN_DATA_PATH = path.join(ROOT, 'lib', 'learn-data.ts');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DELAY_MS = Number(process.env.DELAY_MS || 2000);
const API_PATH = '/api/ai/generate-definition';

const SUBJECT_NAMES = {
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  english: 'English',
};

function loadEnvLocal() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function escapeTsSingleQuotedString(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n+/g, ' ')
    .trim();
}

function unescapeTsSingleQuotedString(value) {
  return value.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}

/**
 * Parse topic tuples inside topicsFor(...) blocks from learn-data.ts source
 */
function parseTopicsFromSource(content) {
  const topics = [];
  const blockRegex = /topicsFor\((\d+),\s*'([^']+)',\s*\[([\s\S]*?)\]\s*\)/g;
  let blockMatch;

  while ((blockMatch = blockRegex.exec(content)) !== null) {
    const grade = Number(blockMatch[1]);
    const subjectId = blockMatch[2];
    const subjectName = SUBJECT_NAMES[subjectId] || subjectId;
    const blockContent = blockMatch[3];
    const blockStart = blockMatch.index;
    const blockFull = blockMatch[0];

    const tupleRegex =
      /\[\s*'((?:\\.|[^'\\])*)'\s*,\s*'((?:\\.|[^'\\])*)'\s*(?:,\s*'((?:\\.|[^'\\])*)')?\s*\]/g;
    let tupleMatch;

    while ((tupleMatch = tupleRegex.exec(blockContent)) !== null) {
      const title = unescapeTsSingleQuotedString(tupleMatch[1]);
      const definition = unescapeTsSingleQuotedString(tupleMatch[2]);
      const wikipediaSlug = tupleMatch[3]
        ? unescapeTsSingleQuotedString(tupleMatch[3])
        : undefined;

      const tupleStartInFile = blockStart + blockMatch[0].indexOf(tupleMatch[0]);
      const tupleEndInFile = tupleStartInFile + tupleMatch[0].length;

      topics.push({
        grade,
        subjectId,
        subjectName,
        unit: subjectName,
        title,
        definition,
        wikipediaSlug,
        tupleStartInFile,
        tupleEndInFile,
        fullMatch: tupleMatch[0],
      });
    }
  }

  return topics;
}

function buildTupleSource(title, definition, wikipediaSlug) {
  const lines = [
    '    [',
    `      '${escapeTsSingleQuotedString(title)}',`,
    `      '${escapeTsSingleQuotedString(definition)}',`,
  ];
  if (wikipediaSlug) {
    lines.push(`      '${escapeTsSingleQuotedString(wikipediaSlug)}',`);
  }
  lines.push('    ],');
  return lines.join('\n');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateDefinition(topic) {
  const res = await fetch(`${BASE_URL}${API_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grade: topic.grade,
      subject: topic.subjectName,
      unit: topic.unit,
      topic: topic.title,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`API ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  if (!data.definition) {
    throw new Error('API response missing definition field');
  }
  return data.definition.trim();
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const parseOnly = args.includes('--parse-only');
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;
  const skipExisting = args.includes('--skip-existing');

  loadEnvLocal();

  if (!fs.existsSync(LEARN_DATA_PATH)) {
    console.error(`File not found: ${LEARN_DATA_PATH}`);
    process.exit(1);
  }

  let content = fs.readFileSync(LEARN_DATA_PATH, 'utf8');
  let topics = parseTopicsFromSource(content);

  if (topics.length === 0) {
    console.error('No topics parsed from lib/learn-data.ts. Check file format.');
    process.exit(1);
  }

  if (limit < topics.length) {
    topics = topics.slice(0, limit);
  }

  const total = topics.length;
  console.log(`Found ${total} topics to process.`);
  if (parseOnly) {
    topics.forEach((t, i) => {
      console.log(
        `${i + 1}. Grade ${t.grade} ${t.subjectName} — ${t.title}`
      );
    });
    return;
  }
  console.log(`API: ${BASE_URL}${API_PATH}`);
  console.log(`Delay between requests: ${DELAY_MS}ms`);
  if (dryRun) console.log('DRY RUN — definitions will not be saved.\n');

  if (!dryRun) {
    const serverUp = await fetch(`${BASE_URL}`, { method: 'HEAD' }).catch(() => null);
    if (!serverUp) {
      console.warn(
        `Warning: Could not reach ${BASE_URL}. Start the dev server first: npm run dev\n`
      );
    }
  }

  const updates = [];

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const label = `Generating ${i + 1}/${total}...`;
    process.stdout.write(
      `${label} Grade ${topic.grade} ${topic.subjectName} — ${topic.title}`
    );

    if (skipExisting && topic.definition.length > 120) {
      console.log(' (skipped, existing definition)');
      continue;
    }

    try {
      const definition = await generateDefinition(topic);
      updates.push({ topic, definition });
      console.log(` ✓ (${definition.length} chars)`);
    } catch (err) {
      console.log(` ✗ ${err.message}`);
    }

    if (i < topics.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  if (dryRun || updates.length === 0) {
    console.log(`\nDone. ${updates.length} definitions generated (not saved).`);
    return;
  }

  // Apply replacements from end to start so indices stay valid
  updates.sort((a, b) => b.topic.tupleStartInFile - a.topic.tupleStartInFile);

  for (const { topic, definition } of updates) {
    const newTuple = buildTupleSource(topic.title, definition, topic.wikipediaSlug);
    content =
      content.slice(0, topic.tupleStartInFile) +
      newTuple +
      content.slice(topic.tupleEndInFile);
  }

  fs.writeFileSync(LEARN_DATA_PATH, content, 'utf8');
  console.log(`\nSaved ${updates.length} definitions to lib/learn-data.ts`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
