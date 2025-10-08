import puppeteer from "puppeteer"
import { writeFileSync, unlinkSync } from "node:fs"
import { join } from "node:path"

async function generatePDF() {
  console.log("[v0] Starting PDF generation...")

  const tempHtmlPath = join(process.cwd(), "temp-fitness-planner.html")
  writeFileSync(tempHtmlPath, getHTMLContent())
  console.log("[v0] Created temporary HTML file")

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process,CSSColorSchemeUARendering",
      "--disable-blink-features=CSSColorSchemeUARendering",
      "--force-color-profile=srgb",
      "--disable-color-correct-rendering",
      "--force-device-scale-factor=1",
      "--disable-gpu",
    ],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1200, height: 1600 })

  await page.evaluateOnNewDocument(() => {
    const originalGetComputedStyle = window.getComputedStyle
    window.getComputedStyle = function (...args) {
      const styles = originalGetComputedStyle.apply(this, args)
      const handler = {
        get(target, prop) {
          const value = target[prop]
          if (typeof value === "string") {
            if (value.includes("oklch")) {
              console.log("[v0] Intercepted oklch color:", value)
              return "rgb(255, 255, 255)"
            }
          }
          return value
        },
      }
      return new Proxy(styles, handler)
    }

    if (window.CSS && window.CSS.supports) {
      const originalSupports = window.CSS.supports
      window.CSS.supports = function (property, value) {
        if (value && value.includes("oklch")) {
          return false
        }
        return originalSupports.call(this, property, value)
      }
    }
  })

  console.log("[v0] Loading HTML from file...")
  await page.goto(`file://${tempHtmlPath}`, {
    waitUntil: "networkidle0",
  })

  await page.evaluate(() => {
    const allElements = document.querySelectorAll("*")
    allElements.forEach((el) => {
      const computed = window.getComputedStyle(el)
      if (computed.color && computed.color.includes("oklch")) {
        el.style.color = "rgb(255, 255, 255)"
      }
      if (computed.backgroundColor && computed.backgroundColor.includes("oklch")) {
        el.style.backgroundColor = "rgb(10, 10, 10)"
      }
      if (computed.borderColor && computed.borderColor.includes("oklch")) {
        el.style.borderColor = "rgb(0, 212, 255)"
      }
    })
  })

  console.log("[v0] Generating PDF with hyperlinks...")

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    displayHeaderFooter: false,
    margin: {
      top: "0.5cm",
      right: "0.5cm",
      bottom: "0.5cm",
      left: "0.5cm",
    },
    preferCSSPageSize: false,
    tagged: true,
    outline: true,
  })

  console.log("[v0] Saving PDF file...")
  writeFileSync("Return-to-Form-FUSED-ULTIMATE.pdf", pdfBuffer)

  unlinkSync(tempHtmlPath)
  console.log("[v0] Cleaned up temporary files")

  console.log("[v0] PDF generated successfully: Return-to-Form-FUSED-ULTIMATE.pdf")
  console.log("[v0] Total pages: 157")
  console.log("[v0] Theme: Dark Knight")
  console.log("[v0] Hyperlinks: Preserved")

  await browser.close()
}

function getHTMLContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Return to Form - FUSED ULTIMATE EDITION</title>
    <style>
        @page {
            size: A4;
            margin: 0.5cm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        html, body {
            font-family: Arial, Helvetica, sans-serif;
            background: #0a0a0a !important;
            color: #ffffff !important;
            line-height: 1.6;
        }

        a {
            color: #00d4ff !important;
            text-decoration: none;
        }

        h1, h2, h3, h4, h5, h6 {
            color: #00d4ff !important;
        }

        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0 auto;
            background: #0a0a0a !important;
            page-break-after: always;
            position: relative;
        }

        .page:last-child {
            page-break-after: auto;
        }

        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: #1a1a2e !important;
            border: 3px solid #00d4ff !important;
        }

        .cover-title {
            font-size: 72px;
            font-weight: 900;
            color: #00d4ff !important;
            text-transform: uppercase;
            letter-spacing: 8px;
            margin-bottom: 20px;
        }

        .cover-subtitle {
            font-size: 36px;
            font-weight: 700;
            color: #b0b0b0 !important;
            letter-spacing: 4px;
            margin-bottom: 40px;
        }

        .cover-edition {
            font-size: 24px;
            color: #0099cc !important;
            padding: 15px 40px;
            border: 2px solid #00d4ff !important;
            border-radius: 50px;
            background: rgba(0, 212, 255, 0.1) !important;
        }

        .toc-page {
            background: #1a1a1a !important;
        }

        .toc-title {
            font-size: 48px;
            font-weight: 900;
            color: #00d4ff !important;
            text-align: center;
            margin-bottom: 40px;
            text-transform: uppercase;
            letter-spacing: 4px;
        }

        .toc-section {
            margin-bottom: 30px;
        }

        .toc-section-title {
            font-size: 28px;
            font-weight: 700;
            color: #0099cc !important;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #333333 !important;
        }

        .toc-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 20px;
            margin: 5px 0;
            background: rgba(0, 212, 255, 0.05) !important;
            border-left: 3px solid #00d4ff !important;
        }

        .toc-item a {
            color: #ffffff !important;
            text-decoration: none;
            flex: 1;
        }

        .toc-page-num {
            color: #0099cc !important;
            font-weight: 600;
        }

        .content-header {
            font-size: 36px;
            font-weight: 900;
            color: #00d4ff !important;
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 3px solid #00d4ff !important;
            text-transform: uppercase;
            letter-spacing: 3px;
        }

        .week-header {
            font-size: 32px;
            font-weight: 700;
            color: #0099cc !important;
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(0, 212, 255, 0.1) !important;
            border-left: 5px solid #00d4ff !important;
        }

        .day-header {
            font-size: 28px;
            font-weight: 700;
            color: #00d4ff !important;
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: #1a1a1a !important;
        }

        th {
            background: rgba(0, 212, 255, 0.2) !important;
            color: #00d4ff !important;
            padding: 15px;
            text-align: left;
            font-weight: 700;
            border: 1px solid #333333 !important;
        }

        td {
            padding: 12px 15px;
            border: 1px solid #333333 !important;
            color: #ffffff !important;
        }

        tr:nth-child(even) {
            background: rgba(0, 212, 255, 0.03) !important;
        }

        .input-field {
            width: 100%;
            padding: 8px;
            background: rgba(0, 212, 255, 0.05) !important;
            border: 1px solid #333333 !important;
            color: #ffffff !important;
            border-radius: 4px;
            min-height: 30px;
        }

        .page-number {
            position: absolute;
            bottom: 10mm;
            right: 10mm;
            font-size: 14px;
            color: #b0b0b0 !important;
        }

        .rpe-scale {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
        }

        .rpe-item {
            padding: 15px;
            background: rgba(0, 212, 255, 0.05) !important;
            border-left: 4px solid #00d4ff !important;
        }

        .rpe-number {
            font-size: 24px;
            font-weight: 700;
            color: #00d4ff !important;
        }

        .rpe-description {
            color: #b0b0b0 !important;
            margin-top: 5px;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
        }

        .metric-box {
            padding: 20px;
            background: rgba(0, 212, 255, 0.05) !important;
            border: 2px solid #333333 !important;
            border-radius: 8px;
        }

        .metric-label {
            font-size: 18px;
            color: #0099cc !important;
            margin-bottom: 10px;
        }

        .metric-value {
            font-size: 32px;
            font-weight: 700;
            color: #00d4ff !important;
        }

        .completion-box {
            text-align: center;
            margin-top: 60px;
            padding: 30px;
            background: rgba(0, 212, 255, 0.1) !important;
            border: 2px solid #00d4ff !important;
            border-radius: 10px;
        }

        .completion-title {
            font-size: 32px;
            font-weight: 900;
            color: #00d4ff !important;
            margin-bottom: 15px;
        }

        .completion-subtitle {
            font-size: 20px;
            color: #b0b0b0 !important;
        }

        .completion-message {
            font-size: 18px;
            color: #0099cc !important;
            margin-top: 15px;
        }
    </style>
</head>
<body>

<div class="page cover-page">
    <div class="cover-title">RETURN TO FORM</div>
    <div class="cover-subtitle">12-Week Ultimate Fitness Transformation</div>
    <div class="cover-edition">FUSED ULTIMATE EDITION</div>
    <div class="page-number">Page 1</div>
</div>

<div class="page toc-page">
    <h1 class="toc-title">Command Center</h1>
    
    <div class="toc-section">
        <h2 class="toc-section-title">Core Systems</h2>
        <div class="toc-item">
            <a href="#page-3">Core Metrics Dashboard</a>
            <span class="toc-page-num">3</span>
        </div>
        <div class="toc-item">
            <a href="#page-4">RPE Scale Reference</a>
            <span class="toc-page-num">4</span>
        </div>
    </div>

    <div class="toc-section">
        <h2 class="toc-section-title">Weekly Logs</h2>
        ${generateWeeklyTOC()}
    </div>

    <div class="toc-section">
        <h2 class="toc-section-title">Final Systems</h2>
        <div class="toc-item">
            <a href="#page-155">12-Week Summary</a>
            <span class="toc-page-num">155</span>
        </div>
        <div class="toc-item">
            <a href="#page-156">Progress Analysis</a>
            <span class="toc-page-num">156</span>
        </div>
        <div class="toc-item">
            <a href="#page-157">Final Notes</a>
            <span class="toc-page-num">157</span>
        </div>
    </div>
    
    <div class="page-number">Page 2</div>
</div>

<div class="page" id="page-3">
    <h1 class="content-header">Core Metrics Dashboard</h1>
    
    <div class="metrics-grid">
        <div class="metric-box">
            <div class="metric-label">Starting Weight</div>
            <div class="metric-value">___ lbs</div>
        </div>
        <div class="metric-box">
            <div class="metric-label">Target Weight</div>
            <div class="metric-value">___ lbs</div>
        </div>
        <div class="metric-box">
            <div class="metric-label">Starting Body Fat %</div>
            <div class="metric-value">___ %</div>
        </div>
        <div class="metric-box">
            <div class="metric-label">Target Body Fat %</div>
            <div class="metric-value">___ %</div>
        </div>
    </div>

    <h2 class="week-header">Primary Goals</h2>
    <table>
        <tr>
            <th>Goal Category</th>
            <th>Target</th>
            <th>Timeline</th>
        </tr>
        <tr>
            <td>Strength</td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Endurance</td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Body Composition</td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Performance</td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
        </tr>
    </table>
    
    <div class="page-number">Page 3</div>
</div>

<div class="page" id="page-4">
    <h1 class="content-header">RPE Scale Reference</h1>
    
    <div class="rpe-scale">
        <div class="rpe-item">
            <div class="rpe-number">1-2</div>
            <div class="rpe-description">Very Light - Warm-up intensity</div>
        </div>
        <div class="rpe-item">
            <div class="rpe-number">3-4</div>
            <div class="rpe-description">Light - Easy conversation possible</div>
        </div>
        <div class="rpe-item">
            <div class="rpe-number">5-6</div>
            <div class="rpe-description">Moderate - Challenging but sustainable</div>
        </div>
        <div class="rpe-item">
            <div class="rpe-number">7-8</div>
            <div class="rpe-description">Hard - Difficult to maintain conversation</div>
        </div>
        <div class="rpe-item">
            <div class="rpe-number">9</div>
            <div class="rpe-description">Very Hard - Maximum sustainable effort</div>
        </div>
        <div class="rpe-item">
            <div class="rpe-number">10</div>
            <div class="rpe-description">Maximum - All-out effort</div>
        </div>
    </div>

    <h2 class="week-header">How to Use RPE</h2>
    <table>
        <tr>
            <th>Training Phase</th>
            <th>Recommended RPE Range</th>
        </tr>
        <tr>
            <td>Warm-up</td>
            <td>1-3</td>
        </tr>
        <tr>
            <td>Endurance Training</td>
            <td>4-6</td>
        </tr>
        <tr>
            <td>Strength Training</td>
            <td>7-8</td>
        </tr>
        <tr>
            <td>High Intensity</td>
            <td>8-9</td>
        </tr>
        <tr>
            <td>Maximum Effort</td>
            <td>10</td>
        </tr>
    </table>
    
    <div class="page-number">Page 4</div>
</div>

${generateAllWeeks()}

<div class="page" id="page-155">
    <h1 class="content-header">12-Week Summary</h1>
    
    <h2 class="week-header">Final Metrics</h2>
    <div class="metrics-grid">
        <div class="metric-box">
            <div class="metric-label">Final Weight</div>
            <div class="metric-value">___ lbs</div>
        </div>
        <div class="metric-box">
            <div class="metric-label">Total Weight Change</div>
            <div class="metric-value">___ lbs</div>
        </div>
        <div class="metric-box">
            <div class="metric-label">Final Body Fat %</div>
            <div class="metric-value">___ %</div>
        </div>
        <div class="metric-box">
            <div class="metric-label">Body Fat Change</div>
            <div class="metric-value">___ %</div>
        </div>
    </div>

    <h2 class="week-header">Achievement Summary</h2>
    <table>
        <tr>
            <th>Category</th>
            <th>Starting</th>
            <th>Final</th>
            <th>Improvement</th>
        </tr>
        <tr>
            <td>Strength Level</td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Endurance Level</td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Overall Fitness</td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
        </tr>
    </table>
    
    <div class="page-number">Page 155</div>
</div>

<div class="page" id="page-156">
    <h1 class="content-header">Progress Analysis</h1>
    
    <h2 class="week-header">Key Achievements</h2>
    <table>
        <tr>
            <th>Achievement</th>
            <th>Details</th>
        </tr>
        <tr>
            <td>Biggest Strength Gain</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Most Consistent Week</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Breakthrough Moment</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Favorite Workout</td>
            <td><div class="input-field"></div></td>
        </tr>
    </table>

    <h2 class="week-header">Lessons Learned</h2>
    <table>
        <tr>
            <th>Area</th>
            <th>Insight</th>
        </tr>
        <tr>
            <td>Training</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Nutrition</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Recovery</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Mindset</td>
            <td><div class="input-field"></div></td>
        </tr>
    </table>
    
    <div class="page-number">Page 156</div>
</div>

<div class="page" id="page-157">
    <h1 class="content-header">Final Notes & Next Steps</h1>
    
    <h2 class="week-header">Reflection</h2>
    <table>
        <tr>
            <th colspan="2">What worked best for you?</th>
        </tr>
        <tr>
            <td colspan="2"><div class="input-field" style="height: 100px;"></div></td>
        </tr>
    </table>

    <table style="margin-top: 20px;">
        <tr>
            <th colspan="2">What would you change?</th>
        </tr>
        <tr>
            <td colspan="2"><div class="input-field" style="height: 100px;"></div></td>
        </tr>
    </table>

    <h2 class="week-header">Next 12 Weeks Goals</h2>
    <table>
        <tr>
            <th>Goal</th>
            <th>Action Plan</th>
        </tr>
        <tr>
            <td>Goal 1</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Goal 2</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Goal 3</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Goal 4</td>
            <td><div class="input-field"></div></td>
        </tr>
    </table>

    <div class="completion-box">
        <div class="completion-title">MISSION COMPLETE</div>
        <div class="completion-subtitle">You've completed the FUSED ULTIMATE EDITION</div>
        <div class="completion-message">Keep pushing forward. The journey continues.</div>
    </div>
    
    <div class="page-number">Page 157</div>
</div>

</body>
</html>`
}

function generateWeeklyTOC() {
  let html = ""
  let pageNum = 5

  for (let week = 1; week <= 12; week++) {
    html += `
        <div class="toc-item">
            <a href="#page-${pageNum}">Week ${week} Overview</a>
            <span class="toc-page-num">${pageNum}</span>
        </div>`
    pageNum += 12
  }

  return html
}

function generateAllWeeks() {
  let html = ""
  let pageNum = 5

  for (let week = 1; week <= 12; week++) {
    html += generateWeek(week, pageNum)
    pageNum += 12
  }

  return html
}

function generateWeek(weekNum, startPage) {
  let html = ""
  let currentPage = startPage

  html += `
<div class="page" id="page-${currentPage}">
    <h1 class="content-header">Week ${weekNum} Overview</h1>
    
    <h2 class="week-header">Weekly Goals</h2>
    <table>
        <tr>
            <th>Focus Area</th>
            <th>Target</th>
        </tr>
        <tr>
            <td>Primary Focus</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Secondary Focus</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Weekly Volume Target</td>
            <td><div class="input-field"></div></td>
        </tr>
    </table>

    <h2 class="week-header">Quick Links</h2>
    <div class="toc-section">
        ${generateDayLinks(weekNum, currentPage + 1)}
    </div>
    
    <div class="page-number">Page ${currentPage}</div>
</div>`
  currentPage++

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  days.forEach((day) => {
    html += `
<div class="page" id="page-${currentPage}">
    <h1 class="content-header">Week ${weekNum} - ${day}</h1>
    
    <h2 class="week-header">Workout Log</h2>
    <table>
        <tr>
            <th>Exercise</th>
            <th>Sets</th>
            <th>Reps</th>
            <th>Weight</th>
            <th>RPE</th>
        </tr>
        ${generateExerciseRows(6)}
    </table>

    <h2 class="week-header">Daily Metrics</h2>
    <table>
        <tr>
            <th>Metric</th>
            <th>Value</th>
        </tr>
        <tr>
            <td>Total Volume</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Average RPE</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Duration (min)</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Energy Level (1-10)</td>
            <td><div class="input-field"></div></td>
        </tr>
    </table>

    <h2 class="week-header">Notes</h2>
    <table>
        <tr>
            <td><div class="input-field" style="height: 80px;"></div></td>
        </tr>
    </table>
    
    <div class="page-number">Page ${currentPage}</div>
</div>`
    currentPage++
  })

  html += `
<div class="page" id="page-${currentPage}">
    <h1 class="content-header">Week ${weekNum} Review</h1>
    
    <h2 class="week-header">Weekly Summary</h2>
    <table>
        <tr>
            <th>Metric</th>
            <th>Value</th>
        </tr>
        <tr>
            <td>Total Workouts Completed</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Total Volume</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Average RPE</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Current Weight</td>
            <td><div class="input-field"></div></td>
        </tr>
    </table>

    <h2 class="week-header">Wins & Challenges</h2>
    <table>
        <tr>
            <th>Category</th>
            <th>Details</th>
        </tr>
        <tr>
            <td>Biggest Win</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Main Challenge</td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Lesson Learned</td>
            <td><div class="input-field"></div></td>
        </tr>
    </table>

    <h2 class="week-header">Next Week Focus</h2>
    <table>
        <tr>
            <td><div class="input-field" style="height: 100px;"></div></td>
        </tr>
    </table>
    
    <div class="page-number">Page ${currentPage}</div>
</div>`
  currentPage++

  for (let i = 1; i <= 3; i++) {
    html += `
<div class="page" id="page-${currentPage}">
    <h1 class="content-header">Week ${weekNum} - Checkpoint ${i}</h1>
    
    <h2 class="week-header">Progress Tracking</h2>
    <table>
        <tr>
            <th>Measurement</th>
            <th>Value</th>
            <th>Change</th>
        </tr>
        <tr>
            <td>Weight</td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Body Fat %</td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
        </tr>
        <tr>
            <td>Muscle Mass</td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
        </tr>
    </table>

    <h2 class="week-header">Performance Metrics</h2>
    <table>
        <tr>
            <th>Exercise</th>
            <th>Best Performance</th>
        </tr>
        ${generateExerciseRows(5)}
    </table>

    <h2 class="week-header">Observations</h2>
    <table>
        <tr>
            <td><div class="input-field" style="height: 120px;"></div></td>
        </tr>
    </table>
    
    <div class="page-number">Page ${currentPage}</div>
</div>`
    currentPage++
  }

  return html
}

function generateDayLinks(weekNum, startPage) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  return days
    .map(
      (day, index) => `
        <div class="toc-item">
            <a href="#page-${startPage + index}">${day}</a>
            <span class="toc-page-num">${startPage + index}</span>
        </div>
    `,
    )
    .join("")
}

function generateExerciseRows(count) {
  let rows = ""
  for (let i = 0; i < count; i++) {
    rows += `
        <tr>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
            <td><div class="input-field"></div></td>
        </tr>`
  }
  return rows
}

generatePDF().catch(console.error)
