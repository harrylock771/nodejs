const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

/**
 * Screenshot endpoint
 * Usage: GET /screenshot?url=https://example.com
 */
app.get("/screenshot", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("❌ Missing ?url parameter");
  }

  try {
    console.log(`📸 Taking screenshot of: ${url}`);

    const browser = await puppeteer.launch({
      headless: "new", // modern headless mode
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000, // 60s max
    });

    const screenshot = await page.screenshot({ fullPage: true });
    await browser.close();

    res.set("Content-Type", "image/png");
    res.send(screenshot);

  } catch (err) {
    console.error("❌ Screenshot failed:", err.message);
    res.status(500).send("Screenshot failed: " + err.message);
  }
});

// Health check route
app.get("/", (req, res) => {
  res.send("✅ Screenshot service is running! Use /screenshot?url=https://example.com");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
