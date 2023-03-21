const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.json());

app.post('/jsgenpdf', async (req, res) => {
    try {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-sandbox",
        ]
    });
    const { url,ref } = req.body;
    const page = await browser.newPage();
    await page.goto(url,{ waitUntil: 'networkidle2' });
    const pdfBuffer = await page.pdf({
        format: 'A4',
        displayHeaderFooter: true,
        headerTemplate: '<div></div>', // Empty header
        footerTemplate: `
          <div style="font-size: 10px; text-align: left; margin-left: 10px;">
            <span>Devis Réf: ${ref} </span>- Page <span class="pageNumber"></span> de <span class="totalPages"></span>
          </div>
        `
      });
    await browser.close();
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="example.pdf"',
        'Content-Length': pdfBuffer.length
      });
      res.send(pdfBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while generating the PDF file');
      }
});

app.listen(3000, () => {
  console.log('App listening on port 3000');
});