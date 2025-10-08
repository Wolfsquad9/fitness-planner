import { chromium } from "playwright"

console.log("Starting simple PDF test...")

async function testPDF() {
  try {
    console.log("Launching browser...")
    const browser = await chromium.launch({ headless: true })

    console.log("Creating page...")
    const page = await browser.newPage()

    console.log("Setting content...")
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            background: #1a1a2e; 
            color: #00d4ff; 
            font-family: Arial; 
            padding: 40px;
          }
          h1 { font-size: 48px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Test PDF - Dark Knight Theme</h1>
        <p>If you can see this PDF, Playwright is working!</p>
      </body>
      </html>
    `)

    console.log("Generating PDF...")
    await page.pdf({
      path: "test-simple.pdf",
      format: "A4",
      printBackground: true,
    })

    console.log("✅ SUCCESS! PDF created: test-simple.pdf")

    await browser.close()
    console.log("Browser closed")
  } catch (error) {
    console.error("❌ ERROR:", error.message)
    console.error("Full error:", error)
  }
}

testPDF()
