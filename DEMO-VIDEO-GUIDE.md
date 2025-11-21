# Travel Quote AI - Demo Video Guide

## Overview
Create a 60-90 second demo video showcasing how TQA saves tour operators 2+ hours per quote using AI automation.

**Goal:** Show the transformation from manual quoting to AI-powered automation
**Target Audience:** Turkey tour operators currently using Excel or manual processes
**Tone:** Professional, confident, solution-focused

---

## Tools You Need

### Option 1: Loom (RECOMMENDED - Easiest)
- **Website:** https://www.loom.com
- **Cost:** FREE for up to 25 videos
- **Steps to setup:**
  1. Go to loom.com and sign up (free)
  2. Download Loom desktop app or Chrome extension
  3. Click "New Video" → "Screen + Webcam" (or just "Screen Only")
  4. Select your browser window (showing localhost:3003)
  5. Hit record!

### Option 2: OBS Studio (FREE - More Control)
- **Website:** https://obsproject.com
- **Cost:** 100% FREE
- **Use if:** You want more editing control, transitions, overlays

### Option 3: QuickTime (Mac) or Windows Game Bar (Windows)
- **Mac:** QuickTime Player → File → New Screen Recording
- **Windows:** Win + G (opens Game Bar) → Record button

---

## Video Script & Timing

### PART 1: The Hook (0:00-0:10) - 10 seconds
**What to Say:**
> "Creating Turkey tour quotes used to take me 2 hours. Now it takes 10 minutes. Here's how..."

**What to Show:**
- Your homepage (travelquotebot.com)
- Quickly hover over the "Start Free Trial" button

**PRO TIP:** Start with energy! This is your hook to keep viewers watching.

---

### PART 2: The Problem (0:10-0:20) - 10 seconds
**What to Say:**
> "Before TQA, I had to manually check hotel prices, calculate margins, build itineraries in Excel... it was exhausting."

**What to Show:**
- (Optional) Show a messy Excel spreadsheet OR
- Just describe verbally while on dashboard

**Why This Works:** Viewers relate to the pain point

---

### PART 3: The Solution - AI Quote Generation (0:20-0:50) - 30 seconds
**What to Say:**
> "Now I just input the customer's requirements, and Claude AI generates the entire itinerary in seconds. Watch this..."

**What to Show - STEP BY STEP:**

1. **Login to Dashboard** (already logged in) - 2 seconds
   - Show your operator dashboard at `/dashboard`

2. **Click "AI Generate Quote"** - 2 seconds
   - Navigate to `/dashboard/quotes/ai-generate`

3. **Fill out form** (speed this up in editing if >10 seconds) - 10 seconds
   - Destination: "Istanbul & Cappadocia"
   - Dates: Pick a date range (7 days)
   - Travelers: 2 adults
   - Hotel Category: 4 stars
   - Tour Type: Private
   - Special Requests: "Interested in history and photography"
   - Click "Generate AI Itinerary"

4. **Show AI generating** - 5 seconds
   - Loading spinner appears
   - "Generating your itinerary..."

5. **Reveal the magic** - 10 seconds
   - AI-generated itinerary appears with:
     - Day-by-day breakdown
     - Hotel recommendations
     - Tours included
     - Total pricing
   - **Zoom in slightly** on the itinerary so text is readable
   - Scroll down slowly to show full itinerary

**What to Say During Generation:**
> "In 30 seconds, AI creates a complete 7-day itinerary with hotels, tours, pricing - everything ready to send to my customer."

---

### PART 4: The Pricing Power (0:50-1:05) - 15 seconds
**What to Say:**
> "The best part? It uses MY pricing database, so margins are protected and seasonal pricing is always accurate."

**What to Show:**
- Navigate to `/dashboard/pricing`
- Quickly show the pricing dashboard with:
  - Hotels list
  - Tours list
  - Click on one item to show price details
- **Don't spend too long here** - just a quick glance

---

### PART 5: The Close & CTA (1:05-1:20) - 15 seconds
**What to Say:**
> "TQA has saved me 10+ hours per week. I create more quotes, win more customers, and actually have time to grow my business. Try it free for 14 days - no credit card needed."

**What to Show:**
- Navigate back to homepage or `/signup`
- Show "Start Free Trial" button
- **End screen text overlay:**
  ```
  Start Your Free Trial
  travelquotebot.com
  ```

---

## Recording Checklist

### Before You Record:

- [ ] **Close unnecessary tabs** (only keep TQA open)
- [ ] **Zoom browser to 100%** (check with Ctrl/Cmd + 0)
- [ ] **Clear your notifications** (turn on Do Not Disturb)
- [ ] **Check your audio** - speak clearly, no background noise
- [ ] **Prepare test data** - Have customer info ready to paste:
  - Customer Name: Sarah Johnson
  - Email: sarah@example.com
  - Phone: +1 555-123-4567
  - Destination: Istanbul & Cappadocia
  - Dates: June 15-22, 2025
  - Adults: 2, Children: 0
  - Hotel: 4-star
  - Type: Private Tour
  - Requests: "Interested in Ottoman history and photography spots"

- [ ] **Test record 5 seconds** - Make sure audio levels are good

### While Recording:

- [ ] **Speak slowly and clearly** - Imagine you're teaching a friend
- [ ] **Pause between sections** - Easier to edit later
- [ ] **Don't worry about mistakes** - You can do multiple takes
- [ ] **Show, don't just tell** - Let the UI do the talking
- [ ] **Use your mouse deliberately** - Slow, intentional movements (not frantic clicking)

### After Recording:

- [ ] **Watch it once** - Did you cover everything?
- [ ] **Check audio quality** - Can you hear yourself clearly?
- [ ] **Trim dead space** - Remove long pauses, mistakes
- [ ] **Add text overlays** (optional but recommended):
  - "10 minutes vs 2 hours"
  - "AI-Powered"
  - "Free 14-Day Trial"
  - "travelquotebot.com"

---

## Editing Tips (If Using Loom)

Loom makes editing super easy:

1. **Trim the video:**
   - Click "Trim" button
   - Drag start/end points to remove unwanted sections

2. **Add Call-to-Action:**
   - Click "Call to Action" button
   - Add button: "Start Free Trial"
   - Link: https://travelquotebot.com/signup

3. **Add captions** (optional):
   - Loom auto-generates captions
   - Click "Edit" to fix any mistakes

4. **Download:**
   - Click "Share" → "Download"
   - Save as MP4 (best quality)

---

## Where to Use This Video

Once you have your demo video, use it EVERYWHERE:

### 1. Homepage
- Embed right at the top (after hero text)
- Code to add to `app/page.tsx`:
  ```tsx
  <div className="mt-6 rounded-xl overflow-hidden shadow-2xl">
    <video
      controls
      poster="/video-thumbnail.jpg"
      className="w-full"
    >
      <source src="/demo-video.mp4" type="video/mp4" />
    </video>
  </div>
  ```

### 2. Features Page
- Add video in "How It Works" section

### 3. Email Signature
- Link to Loom URL in your email signature
- "See TQA in action (60 sec video)"

### 4. Social Media
- Post on LinkedIn with caption:
  "We reduced quote creation time from 2 hours to 10 minutes. Here's how 👇"
- Share on Facebook business page
- Tweet it with hashtags: #TravelTech #TourOperator #TurkeyTravel

### 5. Sales Emails
- Include Loom link in cold emails:
  "Quick 60-second demo: [Loom Link]"

### 6. LinkedIn Messages
- When reaching out to prospects:
  "I made a quick video showing how we help tour operators save 10 hours/week. Takes 60 seconds to watch: [link]"

---

## Sample Video Structures

### Structure A: Problem-Solution (Recommended)
1. Hook: "2 hours → 10 minutes"
2. Problem: Manual quoting sucks
3. Solution: AI automation demo
4. Results: More quotes, more revenue
5. CTA: Free trial

### Structure B: Before/After
1. Show manual process (Excel, email)
2. Show TQA process (AI magic)
3. Compare side-by-side
4. CTA: Free trial

### Structure C: Customer Story
1. "I'm Fatih, I run a Turkey DMC"
2. "Before TQA, I could only handle 20 quotes/month"
3. "Now I do 80+ quotes with same team size"
4. Demo the platform
5. CTA: Free trial

---

## Voice-Over Script (Full 90-Second Version)

If you prefer to record voice separately and overlay:

```
[0:00-0:10]
"Creating custom Turkey tour quotes used to take me 2 hours.
Now it takes 10 minutes. Let me show you how."

[0:10-0:20]
"Before Travel Quote AI, I spent hours checking hotel availability,
calculating margins, building itineraries in Excel.
It was exhausting and I was losing deals to faster competitors."

[0:20-0:50]
"Now, I just input my customer's requirements - destination, dates,
travelers, hotel category - and Claude AI generates the entire
itinerary in 30 seconds.

Watch this: 7-day Istanbul and Cappadocia tour, 4-star hotels,
private guide... Done.

A complete day-by-day itinerary with hotel recommendations,
tours, pricing - everything ready to send to my customer."

[0:50-1:05]
"The best part? It pulls from MY pricing database, so my margins
are protected and seasonal pricing is always accurate.
No more spreadsheet errors or outdated rates."

[1:05-1:20]
"Travel Quote AI has saved me over 10 hours every week.
I create 3x more quotes, win more customers, and actually have
time to grow my business instead of drowning in admin work.

Try it free for 14 days. No credit card needed.
Visit travelquotebot.com and see the difference."

[1:20-1:30 - END SCREEN]
Text on screen:
✓ Save 10+ Hours Per Week
✓ 3x More Quotes
✓ Free 14-Day Trial

travelquotebot.com
```

---

## Advanced: Adding Music

If you want background music (subtle, not overpowering):

### Free Royalty-Free Music Sources:
1. **YouTube Audio Library** - https://studio.youtube.com/channel/UC.../music
2. **Pixabay** - https://pixabay.com/music/
3. **Free Music Archive** - https://freemusicarchive.org/

### Recommended Tracks (search these terms):
- "Corporate Background Music"
- "Tech Upbeat"
- "Professional Presentation"

### Music Tips:
- Volume: 10-20% (very quiet, just filling silence)
- Style: Upbeat but not distracting
- No lyrics (instrumental only)

---

## Thumbnail Design

Create a custom thumbnail (viewers see this before playing):

### Option 1: Canva (Easiest)
1. Go to canva.com
2. Search "YouTube Thumbnail"
3. Use template, add text:
   - Big text: "2 Hours → 10 Minutes"
   - Subtitle: "AI Tour Quotes"
   - Include screenshot of itinerary

### Option 2: Screenshot + Text
1. Take screenshot of AI-generated itinerary
2. Add text overlay in Paint/Preview:
   - "See AI Create This in 30 Seconds"

### Thumbnail Best Practices:
- ✅ High contrast colors
- ✅ Large, readable text
- ✅ Shows the platform UI
- ✅ Human face (optional but increases clicks)
- ❌ Don't use clickbait
- ❌ Don't make text too small

---

## Testing Your Video

Before going live, test with 3 people:

1. **Show to a colleague** - Do they understand the value?
2. **Show to a friend (not in travel)** - Can they follow along?
3. **Show to a customer** - Does it make them want to try it?

Ask them:
- "What was unclear?"
- "What stood out most?"
- "Would you try it after watching?"

Adjust based on feedback!

---

## FAQ

**Q: Do I need to show my face?**
A: No! Screen recording only is fine. But showing your face builds trust (optional).

**Q: What if I make a mistake while recording?**
A: Just pause, start the sentence again. You can edit out mistakes later.

**Q: Should I use my real business or a demo account?**
A: Use a demo account with fake customer data to avoid exposing real info.

**Q: How do I make AI generation faster for the video?**
A: You can't speed up AI, but you can add a "15 seconds later..." text overlay during editing.

**Q: Can I hire someone to make this?**
A: Yes! Fiverr has video editors for $50-150. But DIY is free and more authentic.

**Q: What resolution should I record at?**
A: 1080p (1920x1080) is perfect. 4K is overkill for a demo.

---

## Next Steps After Video Is Done

1. ✅ Upload to YouTube (public or unlisted)
2. ✅ Embed on homepage
3. ✅ Add to signup page
4. ✅ Share on LinkedIn with post
5. ✅ Include in cold emails
6. ✅ Post to Facebook/Twitter
7. ✅ Add to email signature
8. ✅ Use in sales presentations
9. ✅ Create 30-second "teaser" version for social media

---

## Example Timeline (What It Looks Like)

```
0:00-0:03  [TQA Homepage]             "Creating Turkey tour quotes..."
0:03-0:06  [Dashboard]                "...used to take 2 hours..."
0:06-0:10  [Zoom to AI button]        "...now takes 10 minutes."

0:10-0:15  [Excel screenshot]         "Before TQA, manual process..."
0:15-0:20  [Back to TQA]              "...exhausting and slow."

0:20-0:25  [AI Generate Page]         "Now I input requirements..."
0:25-0:30  [Fill form]                [SHOW FORM FILLING SPED UP 2X]
0:30-0:35  [Click Generate]           "...and AI does the rest."
0:35-0:45  [Loading → Itinerary]      "30 seconds later..."
0:45-0:50  [Scroll itinerary]         [SHOW FULL ITINERARY]

0:50-0:55  [Pricing Dashboard]        "Uses MY pricing database..."
0:55-1:00  [Quick tour of pricing]    "...margins protected."

1:00-1:05  [Back to dashboard]        "Saved me 10+ hours/week..."
1:05-1:10  [Signup page]              "...3x more quotes..."
1:10-1:15  [CTA button zoom]          "Try free for 14 days."
1:15-1:20  [End screen with logo]     "travelquotebot.com"
```

---

## Final Checklist Before Publishing

- [ ] Video is 60-90 seconds (not longer!)
- [ ] Audio is clear (no background noise)
- [ ] Text is readable (not too small)
- [ ] Demonstrates actual value (not just features)
- [ ] Has clear call-to-action at end
- [ ] No typos in on-screen text
- [ ] Colors/branding matches website
- [ ] Exported in HD (1080p minimum)
- [ ] Thumbnail is eye-catching
- [ ] Tested with 2-3 people first

---

## Need Help?

If you get stuck or want feedback:

1. Record a draft version
2. Share Loom link with me
3. I'll provide specific feedback on:
   - Pacing
   - Script clarity
   - Visual flow
   - Technical quality

Let's make this video convert! 🚀

---

**Remember:** Done is better than perfect. Your first video doesn't need to be a Hollywood production. Just show the value clearly and you'll see results.

Good luck! 🎬
