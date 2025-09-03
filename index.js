const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/screenshot", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing ?url");

  try {
    const browser = await puppeteer.launch({
      headless: "new", // use latest headless mode
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process", // sometimes needed on small containers
        "--disable-gpu"
      ],
    });

    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000, // 60s timeout
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
`
