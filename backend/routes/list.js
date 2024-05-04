const express = require("express");
const puppeteer = require("puppeteer");
const { downloadImage } = require("../utils/downloadImage");

const router = express.Router();

router.get("/createMemeCoin", async (req, res) => {
  try {
    const imageUrl =
      "https://readwrite.com/wp-content/uploads/2023/12/DALL%C2%B7E-2023-12-22-15.18.06-An-illustrative-representation-of-various-meme-coins-in-the-cryptocurrency-world-including-the-Dogwifhat-Coin.-The-image-features-stylized-playful-719x719.png"; // Replace with actual URL
    const localImagePath = "images/image.png"; // Local path to save the image
    await downloadImage(imageUrl, localImagePath); // Local path to save the image

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to pump.fun/create
    await page.goto("https://pump.fun/create");

    // Fill out form fields
    await page.type("#name", "Your Token Name");
    await page.type("#ticker", "TOKEN");
    await page.type("#text", "Token description");

    // Upload image
    const inputFile = await page.$('input[type="file"]');
    await inputFile.uploadFile(localImagePath);

    // Click the "Create coin" button
    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")];
      const createCoinButton = buttons.find((button) =>
        button.textContent.includes("Create coin")
      );

      if (createCoinButton) {
        createCoinButton.click();
      } else {
        throw new Error("Create coin button not found");
      }
    });

    // Wait for the dialog box to appear
    await page.waitForSelector('[role="dialog"]');
    await page.waitForSelector('div[role="dialog"] button');
    // Click the second button within the dialog box

    await page.evaluate(() => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      let targetDialog = null;

      // Iterate through each dialog box
      dialogs.forEach((dialog) => {
        // Check if the dialog box contains the specific content or structure you're looking for
        const dialogContent = dialog.textContent;
        if (dialogContent.includes("Choose how many")) {
          // If the content matches, set the target dialog box
          targetDialog = dialog;
        }
      });
      if (targetDialog) {
        const buttons = targetDialog.querySelectorAll("button");
        let createCoinButton;
        buttons.forEach((button) => {
          if (button.textContent.trim() === "Create coin") {
            createCoinButton = button;
          }
        });
        if (createCoinButton) {
          createCoinButton.click();
        } else {
          throw new Error(
            `Create coin button not found in the dialog box ${targetDialog.innerHTML}`
          );
        }
      } else {
        throw new Error(`Dialog box not found${dialogs[0].textContent}`);
      }
    });
    // Wait for a bit to ensure the page has loaded after clicking the button
    await delay(6000); // Wait for 2 seconds

    // Close the browser
    await browser.close();

    res.send("Meme coin creation process completed successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while creating the meme coin");
  }
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = router;
