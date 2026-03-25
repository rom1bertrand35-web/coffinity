const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Visible pour voir s'il y a un captcha
  const page = await browser.newPage();
  
  console.log("Navigation vers MaxiCoffee...");
  await page.goto('https://www.maxicoffee.com/cafe-en-grain-c-28_56.html');
  
  console.log("Attente de 5 secondes pour voir la page...");
  await page.waitForTimeout(5000);
  
  const title = await page.title();
  console.log("Titre de la page :", title);
  
  if (title.includes("Indisponible dans votre pays") || title.includes("Cloudflare") || title.includes("Captcha")) {
      console.log("❌ BLOCAGE DÉTECTÉ : MaxiCoffee bloque les robots !");
  } else {
      console.log("✅ Accès réussi !");
  }
  
  await browser.close();
})();
