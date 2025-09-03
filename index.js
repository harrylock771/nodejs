import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/screenshot", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing ?url parameter");

  try {
    const browser = await puppeteer.launch({
      headless: "new", // Railway-friendly
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const screenshotBuffer = await page.screenshot({ type: "png" });
    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.send(screenshotBuffer);
  } catch (err) {
    console.error("Screenshot error:", err);
    res.status(500).send("Error capturing screenshot");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Screenshot service running on port ${PORT}`);
});
