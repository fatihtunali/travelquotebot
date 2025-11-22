const pptxgen = require('pptxgenjs');
const html2pptx = require('C:/Users/fatih/.claude/plugins/marketplaces/anthropic-agent-skills/document-skills/pptx/scripts/html2pptx');
const fs = require('fs');
const path = require('path');

const workspaceDir = 'C:/Users/fatih/Desktop/Travel Quote Bot/workspace';

// Slide HTML templates
const slides = [
  // Slide 1: Title
  `<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; background: #277884; }
.container { display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; }
h1 { color: #ffffff; font-size: 42pt; margin: 0 0 15pt 0; text-align: center; }
.subtitle { color: #5EA8A7; font-size: 20pt; margin: 0; text-align: center; }
.tagline { color: #ffffff; font-size: 16pt; margin: 30pt 0 0 0; text-align: center; }
</style></head>
<body>
<div class="container">
  <h1>Travel Quote Bot</h1>
  <p class="subtitle">AI-Powered Travel Quotes in Minutes</p>
  <p class="tagline">From Request to Quote - Effortlessly</p>
</div>
</body></html>`,

  // Slide 2: The Problem
  `<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; background: #f8f9fa; }
.content { margin: 30pt 40pt; width: 100%; }
h2 { color: #277884; font-size: 28pt; margin: 0 0 20pt 0; }
.problem-box { background: #FE4447; padding: 20pt; border-radius: 8pt; margin-bottom: 15pt; }
.problem-box p { color: #ffffff; font-size: 14pt; margin: 0; }
.stats { display: flex; gap: 20pt; margin-top: 20pt; }
.stat { background: #ffffff; padding: 15pt; border-radius: 8pt; flex: 1; text-align: center; border-left: 4pt solid #277884; }
.stat h3 { color: #277884; font-size: 24pt; margin: 0 0 5pt 0; }
.stat p { color: #666666; font-size: 11pt; margin: 0; }
</style></head>
<body>
<div class="content">
  <h2>The Problem We Solve</h2>
  <div class="problem-box">
    <p>Tour operators spend 2-4 HOURS creating each travel quote manually using spreadsheets</p>
  </div>
  <div class="stats">
    <div class="stat">
      <h3>2-4 hrs</h3>
      <p>Per quote creation</p>
    </div>
    <div class="stat">
      <h3>100+</h3>
      <p>Pricing items to check</p>
    </div>
    <div class="stat">
      <h3>High</h3>
      <p>Error risk in calculations</p>
    </div>
  </div>
</div>
</body></html>`,

  // Slide 3: The Solution
  `<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; background: #ffffff; }
.content { margin: 30pt 40pt; width: 100%; }
h2 { color: #277884; font-size: 28pt; margin: 0 0 15pt 0; }
.solution-box { background: #5EA8A7; padding: 15pt; border-radius: 8pt; margin-bottom: 15pt; }
.solution-box p { color: #ffffff; font-size: 14pt; margin: 0; }
.features { display: flex; flex-wrap: wrap; gap: 12pt; }
.feature { background: #f8f9fa; padding: 12pt; border-radius: 6pt; width: calc(50% - 6pt); box-sizing: border-box; }
.feature h4 { color: #277884; font-size: 12pt; margin: 0 0 5pt 0; }
.feature p { color: #666666; font-size: 10pt; margin: 0; }
</style></head>
<body>
<div class="content">
  <h2>Our Solution</h2>
  <div class="solution-box">
    <p>AI generates complete itineraries with real-time pricing in MINUTES, not hours</p>
  </div>
  <div class="features">
    <div class="feature">
      <h4>AI-Powered Generation</h4>
      <p>Claude AI creates personalized day-by-day itineraries</p>
    </div>
    <div class="feature">
      <h4>Real-Time Pricing</h4>
      <p>Automatic pricing from your database</p>
    </div>
    <div class="feature">
      <h4>Beautiful PDFs</h4>
      <p>Professional proposals ready to send</p>
    </div>
    <div class="feature">
      <h4>White-Label Ready</h4>
      <p>Your brand, your platform</p>
    </div>
  </div>
</div>
</body></html>`,

  // Slide 4: Who Uses It
  `<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; background: #f8f9fa; }
.content { margin: 30pt 40pt; width: 100%; }
h2 { color: #277884; font-size: 28pt; margin: 0 0 20pt 0; }
.users { display: flex; gap: 15pt; }
.user { background: #ffffff; padding: 15pt; border-radius: 8pt; flex: 1; border-top: 4pt solid #5EA8A7; }
.user h3 { color: #277884; font-size: 14pt; margin: 0 0 8pt 0; }
.user p { color: #666666; font-size: 10pt; margin: 0 0 8pt 0; }
ul { margin: 0; padding-left: 15pt; }
li { color: #666666; font-size: 9pt; margin-bottom: 4pt; }
</style></head>
<body>
<div class="content">
  <h2>Who Uses Travel Quote Bot?</h2>
  <div class="users">
    <div class="user">
      <h3>Tour Operators</h3>
      <p>Primary users who manage pricing and generate quotes</p>
      <ul>
        <li>Create custom quotes</li>
        <li>Manage pricing data</li>
        <li>Track bookings</li>
      </ul>
    </div>
    <div class="user">
      <h3>Travel Agents</h3>
      <p>Partners who source bookings with commission tracking</p>
      <ul>
        <li>Request quotes</li>
        <li>Earn commissions</li>
        <li>Track performance</li>
      </ul>
    </div>
    <div class="user">
      <h3>Customers</h3>
      <p>End users who receive beautiful travel proposals</p>
      <ul>
        <li>Self-service quotes</li>
        <li>View itineraries</li>
        <li>Request bookings</li>
      </ul>
    </div>
  </div>
</div>
</body></html>`,

  // Slide 5: Customer Journey
  `<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; background: #277884; }
.content { margin: 25pt 35pt; width: 100%; }
h2 { color: #ffffff; font-size: 26pt; margin: 0 0 15pt 0; }
.flow { display: flex; gap: 8pt; }
.step { background: #ffffff; padding: 12pt; border-radius: 6pt; flex: 1; text-align: center; }
.step-num { background: #FE4447; width: 24pt; height: 24pt; border-radius: 50%; margin: 0 auto 8pt auto; display: flex; align-items: center; justify-content: center; }
.step-num p { color: #ffffff; font-size: 12pt; font-weight: bold; margin: 0; }
.step h4 { color: #277884; font-size: 10pt; margin: 0 0 5pt 0; }
.step p { color: #666666; font-size: 8pt; margin: 0; }
.arrow { display: flex; align-items: center; }
.arrow p { color: #ffffff; font-size: 20pt; margin: 0; }
</style></head>
<body>
<div class="content">
  <h2>Customer Journey</h2>
  <div class="flow">
    <div class="step">
      <div class="step-num"><p>1</p></div>
      <h4>Select Trip</h4>
      <p>Choose destinations, dates, preferences</p>
    </div>
    <div class="arrow"><p>→</p></div>
    <div class="step">
      <div class="step-num"><p>2</p></div>
      <h4>AI Generates</h4>
      <p>Complete itinerary created instantly</p>
    </div>
    <div class="arrow"><p>→</p></div>
    <div class="step">
      <div class="step-num"><p>3</p></div>
      <h4>Preview</h4>
      <p>Review day-by-day plan with pricing</p>
    </div>
    <div class="arrow"><p>→</p></div>
    <div class="step">
      <div class="step-num"><p>4</p></div>
      <h4>Book</h4>
      <p>Save or request booking</p>
    </div>
  </div>
</div>
</body></html>`,

  // Slide 6: What AI Does
  `<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; background: #ffffff; }
.content { margin: 25pt 35pt; width: 100%; }
h2 { color: #277884; font-size: 26pt; margin: 0 0 15pt 0; }
.ai-section { display: flex; gap: 15pt; }
.input-box { background: #f8f9fa; padding: 12pt; border-radius: 6pt; flex: 1; }
.output-box { background: #5EA8A7; padding: 12pt; border-radius: 6pt; flex: 1.5; }
h4 { font-size: 12pt; margin: 0 0 8pt 0; }
.input-box h4 { color: #277884; }
.output-box h4 { color: #ffffff; }
ul { margin: 0; padding-left: 15pt; }
.input-box li { color: #666666; font-size: 9pt; margin-bottom: 4pt; }
.output-box li { color: #ffffff; font-size: 9pt; margin-bottom: 4pt; }
.magic { text-align: center; padding: 20pt 10pt; }
.magic p { color: #FE4447; font-size: 24pt; margin: 0; }
</style></head>
<body>
<div class="content">
  <h2>How AI Creates Your Itinerary</h2>
  <div class="ai-section">
    <div class="input-box">
      <h4>AI Receives</h4>
      <ul>
        <li>Destination cities</li>
        <li>Travel dates</li>
        <li>Group size</li>
        <li>Hotel preference</li>
        <li>Tour type (Group/Private)</li>
        <li>Special requests</li>
      </ul>
    </div>
    <div class="magic">
      <p>→</p>
    </div>
    <div class="output-box">
      <h4>AI Creates</h4>
      <ul>
        <li>Day-by-day narrative descriptions</li>
        <li>Best hotels for your budget</li>
        <li>Recommended tours and activities</li>
        <li>Transportation between cities</li>
        <li>Meal recommendations</li>
        <li>Complete pricing breakdown</li>
        <li>Price per person calculation</li>
      </ul>
    </div>
  </div>
</div>
</body></html>`,

  // Slide 7: Pricing System
  `<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; background: #f8f9fa; }
.content { margin: 25pt 35pt; width: 100%; }
h2 { color: #277884; font-size: 26pt; margin: 0 0 15pt 0; }
.pricing { display: flex; flex-wrap: wrap; gap: 10pt; }
.price-item { background: #ffffff; padding: 10pt 15pt; border-radius: 6pt; width: calc(25% - 8pt); box-sizing: border-box; text-align: center; border-bottom: 3pt solid #5EA8A7; }
.price-item h4 { color: #277884; font-size: 11pt; margin: 0 0 4pt 0; }
.price-item p { color: #666666; font-size: 8pt; margin: 0; }
.note { background: #277884; padding: 10pt 15pt; border-radius: 6pt; margin-top: 10pt; }
.note p { color: #ffffff; font-size: 10pt; margin: 0; text-align: center; }
</style></head>
<body>
<div class="content">
  <h2>Smart Pricing System</h2>
  <div class="pricing">
    <div class="price-item">
      <h4>Hotels</h4>
      <p>By season, room type, meal plan</p>
    </div>
    <div class="price-item">
      <h4>Tours</h4>
      <p>Group or Private, by size</p>
    </div>
    <div class="price-item">
      <h4>Vehicles</h4>
      <p>By type and duration</p>
    </div>
    <div class="price-item">
      <h4>Transfers</h4>
      <p>Airport and intercity</p>
    </div>
    <div class="price-item">
      <h4>Guides</h4>
      <p>By city and language</p>
    </div>
    <div class="price-item">
      <h4>Entrance Fees</h4>
      <p>Museums and sites</p>
    </div>
    <div class="price-item">
      <h4>Meals</h4>
      <p>Restaurants by city</p>
    </div>
    <div class="price-item">
      <h4>Extras</h4>
      <p>Parking, tips, tolls</p>
    </div>
  </div>
  <div class="note">
    <p>All pricing is seasonal - AI automatically selects correct prices based on travel dates</p>
  </div>
</div>
</body></html>`,

  // Slide 8: Operator Dashboard
  `<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; background: #ffffff; }
.content { margin: 25pt 35pt; width: 100%; }
h2 { color: #277884; font-size: 26pt; margin: 0 0 15pt 0; }
.dashboard { display: flex; gap: 12pt; }
.dash-col { flex: 1; }
.dash-item { background: #f8f9fa; padding: 10pt; border-radius: 6pt; margin-bottom: 8pt; border-left: 3pt solid #5EA8A7; }
.dash-item h4 { color: #277884; font-size: 11pt; margin: 0 0 4pt 0; }
.dash-item p { color: #666666; font-size: 9pt; margin: 0; }
</style></head>
<body>
<div class="content">
  <h2>Operator Dashboard Features</h2>
  <div class="dashboard">
    <div class="dash-col">
      <div class="dash-item">
        <h4>Quote Management</h4>
        <p>Create, edit, and send quotes to customers</p>
      </div>
      <div class="dash-item">
        <h4>Booking Pipeline</h4>
        <p>Kanban view to track bookings from draft to completed</p>
      </div>
      <div class="dash-item">
        <h4>Customer Requests</h4>
        <p>Manage incoming quote requests from website</p>
      </div>
    </div>
    <div class="dash-col">
      <div class="dash-item">
        <h4>Pricing Data</h4>
        <p>Manage all 8 pricing categories with Excel import</p>
      </div>
      <div class="dash-item">
        <h4>Analytics</h4>
        <p>Revenue trends, popular destinations, conversion rates</p>
      </div>
      <div class="dash-item">
        <h4>Team and Agents</h4>
        <p>Manage staff and track agent commissions</p>
      </div>
    </div>
  </div>
</div>
</body></html>`,

  // Slide 9: Booking Flow
  `<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; background: #277884; }
.content { margin: 25pt 35pt; width: 100%; }
h2 { color: #ffffff; font-size: 26pt; margin: 0 0 15pt 0; }
.pipeline { display: flex; gap: 6pt; }
.stage { background: #ffffff; padding: 10pt; border-radius: 6pt; flex: 1; text-align: center; }
.stage h4 { color: #277884; font-size: 10pt; margin: 0 0 4pt 0; }
.stage p { color: #666666; font-size: 8pt; margin: 0; }
.arrow { color: #5EA8A7; font-size: 16pt; display: flex; align-items: center; }
</style></head>
<body>
<div class="content">
  <h2>Booking Pipeline</h2>
  <div class="pipeline">
    <div class="stage">
      <h4>Draft</h4>
      <p>Quote created</p>
    </div>
    <p class="arrow">→</p>
    <div class="stage">
      <h4>Confirmed</h4>
      <p>Customer agreed</p>
    </div>
    <p class="arrow">→</p>
    <div class="stage">
      <h4>Deposit</h4>
      <p>Partial payment</p>
    </div>
    <p class="arrow">→</p>
    <div class="stage">
      <h4>Paid</h4>
      <p>Full payment</p>
    </div>
    <p class="arrow">→</p>
    <div class="stage">
      <h4>Complete</h4>
      <p>Trip finished</p>
    </div>
  </div>
</div>
</body></html>`,

  // Slide 10: Benefits
  `<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; background: #f8f9fa; }
.content { margin: 25pt 35pt; width: 100%; }
h2 { color: #277884; font-size: 26pt; margin: 0 0 15pt 0; }
.benefits { display: flex; gap: 12pt; }
.benefit { background: #ffffff; padding: 15pt; border-radius: 8pt; flex: 1; text-align: center; border-top: 4pt solid #FE4447; }
.benefit h3 { color: #FE4447; font-size: 28pt; margin: 0 0 8pt 0; }
.benefit h4 { color: #277884; font-size: 12pt; margin: 0 0 6pt 0; }
.benefit p { color: #666666; font-size: 9pt; margin: 0; }
</style></head>
<body>
<div class="content">
  <h2>Why Choose Travel Quote Bot?</h2>
  <div class="benefits">
    <div class="benefit">
      <h3>90%</h3>
      <h4>Time Saved</h4>
      <p>Minutes instead of hours per quote</p>
    </div>
    <div class="benefit">
      <h3>0</h3>
      <h4>Pricing Errors</h4>
      <p>Automatic calculations from database</p>
    </div>
    <div class="benefit">
      <h3>100%</h3>
      <h4>Professional</h4>
      <p>Beautiful branded proposals every time</p>
    </div>
  </div>
</div>
</body></html>`,

  // Slide 11: Summary
  `<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; background: #277884; }
.content { display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; }
h2 { color: #ffffff; font-size: 32pt; margin: 0 0 20pt 0; text-align: center; }
.summary { background: #ffffff; padding: 20pt 40pt; border-radius: 8pt; text-align: center; }
.summary p { color: #277884; font-size: 16pt; margin: 0 0 15pt 0; }
.summary h4 { color: #FE4447; font-size: 14pt; margin: 0; }
</style></head>
<body>
<div class="content">
  <h2>Ready to Transform Your Business?</h2>
  <div class="summary">
    <p>AI-powered quotes in minutes, not hours</p>
    <p>Complete pricing automation</p>
    <p>Beautiful, professional proposals</p>
    <h4>Your brand. Your platform. Powered by AI.</h4>
  </div>
</div>
</body></html>`
];

async function createPresentation() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Travel Quote Bot';
  pptx.title = 'Travel Quote Bot - System Overview';
  pptx.subject = 'How Travel Quote Bot Works';

  // Create each slide
  for (let i = 0; i < slides.length; i++) {
    const htmlPath = path.join(workspaceDir, `slide${i + 1}.html`);
    fs.writeFileSync(htmlPath, slides[i]);

    try {
      await html2pptx(htmlPath, pptx);
      console.log(`Created slide ${i + 1}`);
    } catch (err) {
      console.error(`Error on slide ${i + 1}:`, err.message);
    }
  }

  // Save presentation
  const outputPath = path.join(workspaceDir, 'TravelQuoteBot-Overview.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`\nPresentation saved to: ${outputPath}`);
}

createPresentation().catch(console.error);
