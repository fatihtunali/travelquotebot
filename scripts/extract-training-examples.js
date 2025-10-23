const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');

const TRAINING_DIR = path.join(__dirname, '..', 'training_itineraries');
const OUTPUT_FILE = path.join(__dirname, '..', 'lib', 'training-examples.json');

async function extractFromDocx(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error(`Error reading DOCX ${filePath}:`, error.message);
    return null;
  }
}

async function extractFromPdf(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error reading PDF ${filePath}:`, error.message);
    return null;
  }
}

async function extractAllExamples() {
  const examples = [];

  // Find all PDF and DOCX files in training_itineraries
  function findFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findFiles(filePath, fileList);
      } else if (file.endsWith('.pdf') || file.endsWith('.docx')) {
        fileList.push(filePath);
      }
    });
    return fileList;
  }

  const files = findFiles(TRAINING_DIR);
  console.log(`Found ${files.length} training files`);

  for (const filePath of files) {
    console.log(`Processing: ${path.basename(filePath)}`);

    let text = null;
    if (filePath.endsWith('.pdf')) {
      text = await extractFromPdf(filePath);
    } else if (filePath.endsWith('.docx')) {
      text = await extractFromDocx(filePath);
    }

    if (text) {
      examples.push({
        filename: path.basename(filePath),
        type: path.extname(filePath).slice(1),
        content: text.substring(0, 10000) // Limit to 10k chars per example
      });
    }
  }

  // Ensure lib directory exists
  const libDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  // Save to JSON file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(examples, null, 2));
  console.log(`\n✅ Extracted ${examples.length} training examples to ${OUTPUT_FILE}`);
}

extractAllExamples().catch(console.error);
