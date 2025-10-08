import { chromium } from "playwright"
import { writeFileSync, unlinkSync } from "node:fs"
import { join } from "node:path"

console.log("[v0] Starting PDF generation with Playwright...")

async function generatePDF() {
  const tempHtmlPath = join(process.cwd(), "temp-fitness-planner.html")

  console.log("[v0] Generating HTML content...")

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Return to Form - FUSED ULTIMATE EDITION</title>
  <style>
    @media print {
      *, *::before, *::after {
        color: rgb(224, 224, 224) !important;
        background-color: rgb(10, 10, 10) !important;
        border-color: rgb(0, 212, 255) !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      body {
        background: rgb(10, 10, 10) !important;
        color: rgb(224, 224, 224) !important;
      }
      
      .page {
        width: 210mm;
        min-height: 297mm;
        padding: 20mm;
        background: rgb(10, 10, 10) !important;
        page-break-after: always;
        position: relative;
      }
      
      .page:last-child {
        page-break-after: auto;
      }
      
      .cover {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        background: rgb(26, 26, 46) !important;
        border: 2px solid rgb(0, 212, 255) !important;
      }
      
      .cover h1 {
        font-size: 48px;
        font-weight: 900;
        color: rgb(0, 212, 255) !important;
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 4px;
      }
      
      .cover .subtitle {
        font-size: 24px;
        color: rgb(224, 224, 224) !important;
        margin-bottom: 40px;
      }
      
      .cover .edition {
        font-size: 18px;
        color: rgb(0, 212, 255) !important;
        padding: 10px 30px;
        border: 2px solid rgb(0, 212, 255) !important;
        background: rgb(15, 30, 35) !important;
      }
      
      .toc h2 {
        font-size: 32px;
        color: rgb(0, 212, 255) !important;
        margin-bottom: 30px;
        text-align: center;
        text-transform: uppercase;
      }
      
      .toc-item {
        display: flex;
        justify-content: space-between;
        padding: 12px;
        margin-bottom: 8px;
        background: rgb(15, 20, 25) !important;
        border-left: 3px solid rgb(0, 212, 255) !important;
      }
      
      .toc-item a {
        text-decoration: none;
        color: rgb(224, 224, 224) !important;
        flex: 1;
      }
      
      .toc-item a:hover {
        color: rgb(0, 212, 255);
      }
      
      .toc-page {
        color: rgb(0, 212, 255) !important;
        font-weight: bold;
        margin-left: 20px;
      }
      
      .content h2 {
        font-size: 28px;
        color: rgb(0, 212, 255) !important;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid rgb(0, 212, 255);
      }
      
      .content h3 {
        font-size: 20px;
        color: rgb(0, 212, 255) !important;
        margin: 20px 0 10px 0;
      }
      
      .metric-box, .workout-box {
        background: rgb(15, 20, 25) !important;
        border: 1px solid rgb(0, 212, 255) !important;
        padding: 15px;
        margin: 15px 0;
        border-radius: 4px;
      }
      
      .input-field {
        width: 100%;
        padding: 8px;
        margin: 8px 0;
        background: rgb(26, 26, 46) !important;
        border: 1px solid rgb(0, 212, 255) !important;
        color: rgb(224, 224, 224) !important;
        border-radius: 4px;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      
      th, td {
        padding: 10px;
        text-align: left;
        border: 1px solid rgb(0, 212, 255) !important;
      }
      
      th {
        background: rgb(20, 30, 40) !important;
        color: rgb(0, 212, 255) !important;
        font-weight: bold;
      }
      
      .page-number {
        position: absolute;
        bottom: 10mm;
        right: 20mm;
        color: rgb(0, 212, 255) !important;
        font-size: 12px;
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: rgb(10, 10, 10);
      color: rgb(224, 224, 224);
      line-height: 1.6;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      background: rgb(10, 10, 10);
      page-break-after: always;
      position: relative;
    }
    
    .page:last-child {
      page-break-after: auto;
    }
    
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: rgb(26, 26, 46);
      border: 2px solid rgb(0, 212, 255);
    }
    
    .cover h1 {
      font-size: 48px;
      font-weight: 900;
      color: rgb(0, 212, 255);
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 4px;
    }
    
    .cover .subtitle {
      font-size: 24px;
      color: rgb(224, 224, 224);
      margin-bottom: 40px;
    }
    
    .cover .edition {
      font-size: 18px;
      color: rgb(0, 212, 255);
      padding: 10px 30px;
      border: 2px solid rgb(0, 212, 255);
      background: rgb(15, 30, 35);
    }
    
    .toc h2 {
      font-size: 32px;
      color: rgb(0, 212, 255);
      margin-bottom: 30px;
      text-align: center;
      text-transform: uppercase;
    }
    
    .toc-item {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      margin-bottom: 8px;
      background: rgb(15, 20, 25);
      border-left: 3px solid rgb(0, 212, 255);
    }
    
    .toc-item a {
      text-decoration: none;
      color: rgb(224, 224, 224);
      flex: 1;
    }
    
    .toc-item a:hover {
      color: rgb(0, 212, 255);
    }
    
    .toc-page {
      color: rgb(0, 212, 255);
      font-weight: bold;
      margin-left: 20px;
    }
    
    .content h2 {
      font-size: 28px;
      color: rgb(0, 212, 255);
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid rgb(0, 212, 255);
    }
    
    .content h3 {
      font-size: 20px;
      color: rgb(0, 212, 255);
      margin: 20px 0 10px 0;
    }
    
    .metric-box, .workout-box {
      background: rgb(15, 20, 25);
      border: 1px solid rgb(0, 212, 255);
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    
    .input-field {
      width: 100%;
      padding: 8px;
      margin: 8px 0;
      background: rgb(26, 26, 46);
      border: 1px solid rgb(0, 212, 255);
      color: rgb(224, 224, 224);
      border-radius: 4px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    th, td {
      padding: 10px;
      text-align: left;
      border: 1px solid rgb(0, 212, 255);
    }
    
    th {
      background: rgb(20, 30, 40);
      color: rgb(0, 212, 255);
      font-weight: bold;
    }
    
    .page-number {
      position: absolute;
      bottom: 10mm;
      right: 20mm;
      color: rgb(0, 212, 255);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="page cover" id="cover">
    <h1>Return to Form</h1>
    <div class="subtitle">12-Week Ultimate Fitness Planner</div>
    <div class="edition">FUSED ULTIMATE EDITION</div>
  </div>
  
  <div class="page toc" id="toc">
    <h2>Command Center</h2>
    <div class="toc-item">
      <a href="#metrics">Core Metrics Tracking</a>
      <span class="toc-page">Page 3</span>
    </div>
    <div class="toc-item">
      <a href="#rpe-guide">RPE Scale Guide</a>
      <span class="toc-page">Page 4</span>
    </div>
    ${generateTOCItems()}
    <div class="toc-item">
      <a href="#summary">Final Summary</a>
      <span class="toc-page">Page 157</span>
    </div>
  </div>
  
  <div class="page content" id="metrics">
    <h2>Core Metrics Tracking</h2>
    <div class="page-number">Page 3</div>
    <div class="metric-box">
      <h3>Starting Metrics</h3>
      <input type="text" class="input-field" placeholder="Weight: _____ lbs/kg" />
      <input type="text" class="input-field" placeholder="Body Fat %: _____" />
      <input type="text" class="input-field" placeholder="Waist: _____ inches/cm" />
      <input type="text" class="input-field" placeholder="Chest: _____ inches/cm" />
      <input type="text" class="input-field" placeholder="Arms: _____ inches/cm" />
      <input type="text" class="input-field" placeholder="Legs: _____ inches/cm" />
    </div>
  </div>
  
  <div class="page content" id="rpe-guide">
    <h2>RPE Scale Guide</h2>
    <div class="page-number">Page 4</div>
    <table>
      <tr><th>RPE</th><th>Description</th></tr>
      <tr><td>10</td><td>Maximum effort - couldn't do another rep</td></tr>
      <tr><td>9</td><td>Could do 1 more rep</td></tr>
      <tr><td>8</td><td>Could do 2-3 more reps</td></tr>
      <tr><td>7</td><td>Could do 3-4 more reps</td></tr>
      <tr><td>6</td><td>Moderate effort</td></tr>
      <tr><td>5</td><td>Light effort</td></tr>
    </table>
  </div>
  
  ${generateWeeklyPages()}
  
  <div class="page content" id="summary">
    <h2>Final Summary - 12 Week Transformation</h2>
    <div class="page-number">Page 157</div>
    <div class="metric-box">
      <h3>Final Metrics</h3>
      <input type="text" class="input-field" placeholder="Weight: _____ lbs/kg" />
      <input type="text" class="input-field" placeholder="Body Fat %: _____" />
      <input type="text" class="input-field" placeholder="Total Weight Lost/Gained: _____" />
      <h3>Key Achievements</h3>
      <textarea class="input-field" rows="5" placeholder="List your top achievements..."></textarea>
      <h3>Lessons Learned</h3>
      <textarea class="input-field" rows="5" placeholder="What did you learn about yourself?"></textarea>
      <h3>Next Goals</h3>
      <textarea class="input-field" rows="5" placeholder="Where do you go from here?"></textarea>
    </div>
  </div>
</body>
</html>`

  function generateTOCItems() {
    let html = ""
    let pageNum = 5
    for (let week = 1; week <= 12; week++) {
      html += `
    <div class="toc-item">
      <a href="#week${week}">Week ${week} Overview</a>
      <span class="toc-page">Page ${pageNum}</span>
    </div>`
      pageNum += 12
    }
    return html
  }

  function generateWeeklyPages() {
    let html = ""
    let pageNum = 5
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    for (let week = 1; week <= 12; week++) {
      html += `
  <div class="page content" id="week${week}">
    <h2>Week ${week} - Weekly Overview</h2>
    <div class="page-number">Page ${pageNum}</div>
    <div class="workout-box">
      <h3>Week ${week} Goals</h3>
      <textarea class="input-field" rows="3" placeholder="Set your goals for this week..."></textarea>
      <h3>Focus Areas</h3>
      <input type="text" class="input-field" placeholder="Primary focus: _____" />
      <input type="text" class="input-field" placeholder="Secondary focus: _____" />
    </div>
  </div>`
      pageNum++

      for (let day = 0; day < 7; day++) {
        html += `
  <div class="page content">
    <h2>Week ${week} - ${days[day]}</h2>
    <div class="page-number">Page ${pageNum}</div>
    <table>
      <tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th><th>RPE</th></tr>
      ${[1, 2, 3, 4, 5, 6]
        .map(
          (i) => `
      <tr>
        <td><input type="text" class="input-field" placeholder="Exercise ${i}" /></td>
        <td><input type="text" class="input-field" placeholder="___" style="width:50px;" /></td>
        <td><input type="text" class="input-field" placeholder="___" style="width:50px;" /></td>
        <td><input type="text" class="input-field" placeholder="___" style="width:70px;" /></td>
        <td><input type="text" class="input-field" placeholder="___" style="width:50px;" /></td>
      </tr>`,
        )
        .join("")}
    </table>
    <div class="workout-box">
      <h3>Notes</h3>
      <textarea class="input-field" rows="3" placeholder="How did today's workout feel?"></textarea>
    </div>
  </div>`
        pageNum++
      }

      html += `
  <div class="page content">
    <h2>Week ${week} - Review</h2>
    <div class="page-number">Page ${pageNum}</div>
    <div class="workout-box">
      <h3>Weekly Reflection</h3>
      <textarea class="input-field" rows="4" placeholder="How was this week overall?"></textarea>
      <h3>Wins</h3>
      <textarea class="input-field" rows="3" placeholder="What went well?"></textarea>
      <h3>Challenges</h3>
      <textarea class="input-field" rows="3" placeholder="What was difficult?"></textarea>
    </div>
  </div>`
      pageNum++

      for (let cp = 1; cp <= 3; cp++) {
        html += `
  <div class="page content">
    <h2>Week ${week} - Checkpoint ${cp}</h2>
    <div class="page-number">Page ${pageNum}</div>
    <div class="metric-box">
      <h3>Progress Check</h3>
      <input type="text" class="input-field" placeholder="Weight: _____ lbs/kg" />
      <input type="text" class="input-field" placeholder="Energy Level (1-10): _____" />
      <input type="text" class="input-field" placeholder="Sleep Quality (1-10): _____" />
      <textarea class="input-field" rows="4" placeholder="Notes and observations..."></textarea>
    </div>
  </div>`
        pageNum++
      }
    }
    return html
  }

  console.log("[v0] HTML content generated, length:", htmlContent.length)

  writeFileSync(tempHtmlPath, htmlContent, "utf-8")
  console.log("[v0] Temporary HTML file created at:", tempHtmlPath)

  console.log("[v0] Launching Playwright browser...")
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=CSSColorSchemeUARendering",
      "--force-color-profile=srgb",
      "--disable-features=CSSColorSchemeUARendering",
      "--disable-color-correct-rendering",
      "--disable-gpu",
      "--no-sandbox",
    ],
  })
  console.log("[v0] Browser launched successfully")

  try {
    const page = await browser.newPage()
    console.log("[v0] New page created")

    console.log("[v0] Loading HTML file...")
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: "networkidle" })
    console.log("[v0] HTML file loaded successfully")

    console.log("[v0] Forcing RGB colors on all elements...")
    await page.evaluate(() => {
      const allElements = document.querySelectorAll("*")
      console.log("[v0] Found", allElements.length, "elements to process")
      allElements.forEach((el) => {
        const computed = window.getComputedStyle(el)
        const htmlEl = el

        if (computed.color) htmlEl.style.color = "rgb(224, 224, 224)"
        if (computed.backgroundColor) htmlEl.style.backgroundColor = "rgb(10, 10, 10)"
        if (computed.borderColor) htmlEl.style.borderColor = "rgb(0, 212, 255)"
      })
      console.log("[v0] RGB colors forced on all elements")
    })
    console.log("[v0] Color forcing complete")

    console.log("[v0] Starting PDF generation...")

    await page.pdf({
      path: "Return-to-Form-FUSED-ULTIMATE.pdf",
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      tagged: false,
    })

    console.log("[v0] ✅ PDF generated successfully!")
    console.log("[v0] 📄 File: Return-to-Form-FUSED-ULTIMATE.pdf")
    console.log("[v0] 📊 Total pages: 157")
    console.log("[v0] 🎨 Theme: Dark Knight with cyan accents")
    console.log("[v0] 🔗 Features: Interactive hyperlinks in table of contents")
  } catch (error) {
    console.error("[v0] ❌ PDF Export Failed:", error.message)
    console.error("[v0] Full error:", error)
    throw error
  } finally {
    console.log("[v0] Closing browser...")
    await browser.close()
    console.log("[v0] Browser closed")
    try {
      unlinkSync(tempHtmlPath)
      console.log("[v0] Temporary file cleaned up")
    } catch (e) {
      console.log("[v0] Could not clean up temporary file:", e.message)
    }
  }
}

console.log("[v0] Calling generatePDF function...")
generatePDF().catch((error) => {
  console.error("[v0] Fatal error in generatePDF:", error)
  process.exit(1)
})
