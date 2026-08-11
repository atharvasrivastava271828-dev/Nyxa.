const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const filePath = 'file://' + path.resolve('NYXA_Business_Model_Canvas.html');
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    // Set viewport and generate PDF
    await page.setViewport({ width: 1240, height: 890 });
    await page.pdf({
        path: 'NYXA_Business_Model_Canvas.pdf',
        printBackground: true,
        width: '1240px',
        height: '890px',
        pageRanges: '1'
    });
    
    await browser.close();
    console.log("PDF successfully generated!");
})();
