import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables FIRST
dotenv.config({ path: '.env.local' });

import puppeteer, { Browser, Page } from 'puppeteer';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { initializeApp, getApp } from 'firebase/app';
import { firebaseConfig } from '../lib/firebase-config';
import fetch from 'node-fetch';

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  app = getApp();
}
const db = getFirestore(app);

interface WakeUpSite {
  siteId: string;
  siteUrl: string;
  migrationStatus: string;
  csvData: any;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function triggerMigration(siteId: string): Promise<boolean> {
  try {
    console.log(`Triggering migration for site ${siteId}...`);

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/wake-up/migrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ siteId }),
    });

    const result = await response.json() as { success?: boolean; error?: string; message?: string };

    if (response.ok && result.success) {
      console.log(`Migration completed successfully for site ${siteId}`);
      return true;
    } else {
      console.error(`Migration failed for site ${siteId}:`, result.error || result.message);
      return false;
    }
  } catch (error) {
    console.error(`Error triggering migration for site ${siteId}:`, error);
    return false;
  }
}

async function loginToHDPhotoHub(page: Page): Promise<boolean> {
  try {
    console.log('Attempting to log in to HDPhotoHub...');

    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('https://homesellphotography.hd.pics/Login/login.asp', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Get page content for debugging
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);

    const pageUrl = page.url();
    console.log('Current URL:', pageUrl);

    // Check if already logged in
    const logoutButton = await page.$('a[href*="logout"]');
    if (logoutButton) {
      console.log('Already logged in to HDPhotoHub');
      return true;
    }

    // Look for login form with detailed logging
    console.log('Looking for login form elements...');

    const allInputs = await page.$$('input');
    console.log(`Found ${allInputs.length} input elements:`);
    for (const input of allInputs.slice(0, 10)) { // Log first 10
      const name = await input.evaluate(el => el.getAttribute('name'));
      const type = await input.evaluate(el => el.getAttribute('type'));
      const id = await input.evaluate(el => el.getAttribute('id'));
      console.log(`  Input: name="${name}", type="${type}", id="${id}"`);
    }

    const allButtons = await page.$$('button, input[type="submit"]');
    console.log(`Found ${allButtons.length} button/submit elements:`);
    for (const btn of allButtons.slice(0, 3)) { // Log first 3
      const text = await btn.evaluate(el => el.textContent?.trim() || el.getAttribute('value') || 'no text');
      console.log(`  Button: "${text}"`);
    }

    const emailField = await page.$('input[name="sEmail"], input[type="email"], input[name="username"]');
    const passwordField = await page.$('input[name="sPassword"], input[type="password"]');
    const loginButton = await page.$('input[value="Access My Account"], button[type="submit"]');

    console.log('Login form detection results:');
    console.log(`  Email field found: ${!!emailField}`);
    console.log(`  Password field found: ${!!passwordField}`);
    console.log(`  Login button found: ${!!loginButton}`);

    if (!emailField || !passwordField || !loginButton) {
      console.log('Login form not found - dumping page HTML for debugging...');
      const pageHtml = await page.content();
      console.log('Page HTML (first 1000 chars):', pageHtml.substring(0, 1000));
      return false;
    }

    // Fill in credentials (you'll need to provide these)
    const HD_EMAIL = process.env.HD_EMAIL || 'your-email@example.com';
    const HD_PASSWORD = process.env.HD_PASSWORD || 'your-password';

    if (HD_EMAIL === 'your-email@example.com' || HD_PASSWORD === 'your-password') {
      console.log('HDPhotoHub credentials not configured. Please set HD_EMAIL and HD_PASSWORD environment variables.');
      return false;
    }

    console.log('Filling in login credentials...');
    await emailField.type(HD_EMAIL);
    await passwordField.type(HD_PASSWORD);

    // Submit login form - try multiple approaches
    console.log('Attempting to submit login form...');

    // Check if button is visible and clickable
    const isVisible = await loginButton.evaluate((el: Element) => {
      const style = (window as any).getComputedStyle(el);
      const htmlEl = el as HTMLElement;
      return style.display !== 'none' && style.visibility !== 'hidden' && htmlEl.offsetWidth > 0 && htmlEl.offsetHeight > 0;
    });

    console.log(`Login button is visible: ${isVisible}`);

    if (isVisible) {
      try {
        // Try clicking the button
        await loginButton.click();
        console.log('Clicked login button successfully');
      } catch (clickError) {
        console.log('Button click failed, trying form submission...');
        // If click fails, try submitting the form directly
        await loginButton.evaluate(btn => {
          const form = btn.closest('form');
          if (form) form.submit();
        });
      }
    } else {
      console.log('Button not visible, trying form submission...');
      // Try submitting the form directly
      await page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        Array.from(forms).forEach(form => {
          const emailInput = form.querySelector('input[name="sEmail"]');
          const passwordInput = form.querySelector('input[name="sPassword"]');
          if (emailInput && passwordInput) {
            form.submit();
          }
        });
      });
    }

    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });

    // Check if login was successful
    const logoutButtonAfter = await page.$('a[href*="logout"]');
    if (logoutButtonAfter) {
      console.log('Successfully logged in to HDPhotoHub');
      return true;
    } else {
      console.log('Login may have failed - no logout button found');
      return false;
    }
  } catch (error) {
    console.error('Error during HDPhotoHub login:', error);
    return false;
  }
}

async function wakeUpMedia(page: Page, siteUrl: string, siteId: string): Promise<boolean> {
  try {
    console.log(`Visiting site ${siteId}: ${siteUrl}`);

    // Set a reasonable timeout and user agent
    await page.setDefaultTimeout(30000);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to the site
    console.log(`Navigating to site URL: ${siteUrl}`);
    const response = await page.goto(siteUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log(`Site ${siteId} response status: ${response?.status()}`);
    console.log(`Site ${siteId} current URL after navigation: ${page.url()}`);

    if (!response?.ok()) {
      console.log(`Site ${siteId} returned status ${response?.status()}, might be asleep`);
    }

    // Log page title and basic content
    const siteTitle = await page.title();
    console.log(`Site ${siteId} page title: "${siteTitle}"`);

    // Check if we need manual login
    const pageContent = await page.evaluate(() => document.body.textContent || '');
    const currentUrl = page.url();

    // More specific login page detection
    const hasLoginForm = await page.$('input[name="sEmail"], input[name="sPassword"], form[action*="login"]');
    const isOnLoginUrl = currentUrl.includes('/Login/login.asp') && !currentUrl.includes('?sReturnUrl');
    const hasSecureAccess = pageContent.toLowerCase().includes('secure access') && pageContent.toLowerCase().includes('email address') && pageContent.toLowerCase().includes('password');

    const needsLogin = (hasLoginForm && hasSecureAccess) || isOnLoginUrl;

    if (needsLogin) {
      console.log('🔐 Session expired - waiting for manual login...');
      console.log('⏳ Waiting 10 seconds for manual login...');
      await delay(10000);

      // Re-check after wait
      const newPageContent = await page.evaluate(() => document.body.textContent || '');
      const newUrl = page.url();
      const stillNeedsLogin = (await page.$('input[name="sEmail"]')) &&
                             newPageContent.toLowerCase().includes('secure access');

      if (stillNeedsLogin) {
        console.log(`❌ Site ${siteId} still shows login page after wait`);
        return false;
      }
    } else {
      console.log('✅ Using existing login session - no wait needed!');
    }

    console.log(`✅ Site ${siteId} login check complete - proceeding with wake-up detection!`);

    // Get some page content for debugging
    const previewText = pageContent.substring(0, 500);
    console.log(`Site ${siteId} page content preview: "${previewText}"`);

    // Wait for the page to load and images to appear
    await delay(3000);

    // Scroll down to trigger lazy loading of images
    console.log(`🔍 Scrolling to trigger image loading...`);
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await delay(2000);

    // Check for placeholder images - wait for them to load
    console.log(`🔍 Checking for placeholder images...`);

    // Debug: Show all images on the page
    const allImages = await page.$$('img');
    console.log(`📸 Found ${allImages.length} total images on page`);

    for (let i = 0; i < Math.min(allImages.length, 5); i++) {
      const imgSrc = await allImages[i].evaluate(el => el.getAttribute('src') || 'no-src');
      const imgAlt = await allImages[i].evaluate(el => el.getAttribute('alt') || 'no-alt');
      console.log(`  Image ${i + 1}: src="${imgSrc}" alt="${imgAlt}"`);
    }

    let placeholderImages = await page.$$('img[src="/art/z.jpg"]');

    // If no placeholders found initially, wait a bit more and check again
    if (placeholderImages.length === 0) {
      console.log(`🔍 Double-checking for placeholder images after additional wait...`);
      await delay(3000);
      placeholderImages = await page.$$('img[src="/art/z.jpg"]');
    }

    if (placeholderImages.length === 0) {
      console.log(`✅ Site ${siteId} is already awake! No placeholder images found.`);
      return true;
    } else {
      console.log(`⏰ Site ${siteId} is asleep - found ${placeholderImages.length} placeholder images`);
    }

    // Look for the "Wake Up Media" button more specifically
    const wakeUpButton = await page.$('button[onclick*="wakeupStart"]');

    if (!wakeUpButton) {
      // Try a broader search for any button
      const allButtons = await page.$$('button');
      console.log(`Found ${allButtons.length} buttons on site ${siteId}`);

      for (const btn of allButtons) {
        const buttonText = await btn.evaluate(el => {
          // Try multiple ways to get button text
          return el.textContent?.trim() ||
                 el.innerText?.trim() ||
                 el.getAttribute('value') ||
                 '';
        });

        const onclickAttr = await btn.evaluate(el => el.getAttribute('onclick') || '');

        console.log(`Button text: "${buttonText}", onclick: "${onclickAttr}"`);

        if (buttonText.toLowerCase().includes('wake up') ||
            buttonText.toLowerCase().includes('wake') ||
            onclickAttr.includes('wakeupStart')) {
          console.log(`Found wake up button with text: "${buttonText}"`);
          console.log(`🎯 Clicking wake-up button...`);
          await btn.click();

          // Initial delay after clicking wake-up button
          console.log(`⏰ Initial wake-up delay (15 seconds for process to start)...`);
          await delay(15000);

          console.log(`⏰ Waiting for media to wake up (checking for placeholder images every 10 seconds)...`);

          let wakeUpComplete = false;
          let attempts = 0;
          let consecutiveZeroPlaceholders = 0;
          const maxAttempts = 24; // Maximum 4 minutes
          const requiredConsecutiveZeros = 2; // Need 2 consecutive checks with 0 placeholders

          while (!wakeUpComplete && attempts < maxAttempts) {
            await delay(10000);
            attempts++;

            console.log(`Wake-up check ${attempts}/${maxAttempts}...`);

            // Check for HDPhotoHub placeholder images that indicate media is still asleep
            const placeholderImages = await page.$$('img[src="/art/z.jpg"]');

            if (placeholderImages.length === 0) {
              consecutiveZeroPlaceholders++;
              console.log(`✅ No placeholder images found (${consecutiveZeroPlaceholders}/${requiredConsecutiveZeros} consecutive)`);

              if (consecutiveZeroPlaceholders >= requiredConsecutiveZeros) {
                // Add final buffer to ensure images are fully loaded
                console.log(`⏰ Adding final buffer (10 seconds) to ensure all images are loaded...`);
                await delay(10000);
                wakeUpComplete = true;
              }
            } else {
              consecutiveZeroPlaceholders = 0; // Reset counter if placeholders found
              console.log(`⏳ Still waking up... Found ${placeholderImages.length} placeholder images`);
            }
          }

          if (!wakeUpComplete) {
            console.log(`⚠️ Wake-up may still be in progress after ${maxAttempts * 10} seconds, but proceeding anyway`);
          }

          return true;
        }
      }

      // Look for text content that might indicate the site is asleep (using existing pageContent)
      if (pageContent.toLowerCase().includes('wake up') || pageContent.toLowerCase().includes('asleep')) {
        console.log(`Site ${siteId} appears to be asleep but no wake up button found`);
        return false;
      }

      console.log(`Site ${siteId} appears to be awake (no wake up content found)`);
      return true;
    }

    // Check if the button contains "Wake Up" text or has wakeupStart onclick
    const buttonText = await wakeUpButton.evaluate(el => {
      return el.textContent?.toLowerCase().trim() ||
             el.innerText?.toLowerCase().trim() ||
             el.getAttribute('value')?.toLowerCase() ||
             '';
    });

    const onclickAttr = await wakeUpButton.evaluate(el => el.getAttribute('onclick') || '');

    if (buttonText.includes('wake up') || buttonText.includes('wake') || onclickAttr.includes('wakeupStart')) {
      console.log(`Found "Wake Up Media" button on site ${siteId} (text: "${buttonText}", onclick: "${onclickAttr}"), clicking it...`);

      // Click the button
      console.log(`🎯 Clicking wake-up button...`);
      await wakeUpButton.click();

      // Initial delay after clicking wake-up button
      console.log(`⏰ Initial wake-up delay (15 seconds for process to start)...`);
      await delay(15000);

      console.log(`⏰ Waiting for media to wake up (checking for placeholder images every 10 seconds)...`);

      let wakeUpComplete = false;
      let attempts = 0;
      let consecutiveZeroPlaceholders = 0;
      const maxAttempts = 24; // Maximum 4 minutes
      const requiredConsecutiveZeros = 2; // Need 2 consecutive checks with 0 placeholders

      while (!wakeUpComplete && attempts < maxAttempts) {
        await delay(10000);
        attempts++;

        console.log(`Wake-up check ${attempts}/${maxAttempts}...`);

        // Check for HDPhotoHub placeholder images that indicate media is still asleep
        const placeholderImages = await page.$$('img[src="/art/z.jpg"]');

        if (placeholderImages.length === 0) {
          consecutiveZeroPlaceholders++;
          console.log(`✅ No placeholder images found (${consecutiveZeroPlaceholders}/${requiredConsecutiveZeros} consecutive)`);

          if (consecutiveZeroPlaceholders >= requiredConsecutiveZeros) {
            // Add final buffer to ensure images are fully loaded
            console.log(`⏰ Adding final buffer (10 seconds) to ensure all images are loaded...`);
            await delay(10000);
            wakeUpComplete = true;
          }
        } else {
          consecutiveZeroPlaceholders = 0; // Reset counter if placeholders found
          console.log(`⏳ Still waking up... Found ${placeholderImages.length} placeholder images`);
        }
      }

      if (!wakeUpComplete) {
        console.log(`⚠️ Wake-up may still be in progress after ${maxAttempts * 10} seconds, but proceeding anyway`);
      }

      console.log(`Site ${siteId} appears to be awake after wake up`);
      return true;
    } else {
      console.log(`Found button on site ${siteId} but it doesn't match wake up criteria: text="${buttonText}", onclick="${onclickAttr}"`);
      return true; // Site might already be awake
    }

  } catch (error) {
    console.error(`Error waking up site ${siteId}:`, error);
    return false;
  }
}

async function processWakeUpSites() {
  let browser: Browser | null = null;

  try {
    console.log('Starting wake-up and migrate process...');

    // Create a temporary Chrome profile that copies cookies from existing session
    const tempProfileDir = `/tmp/chrome-wake-migrate-${Date.now()}`;
    console.log(`Creating temporary Chrome profile at: ${tempProfileDir}`);

    // Copy essential files from existing Chrome profile

    const sourceProfile = process.platform === 'darwin'
      ? `/Users/${process.env.USER}/Library/Application Support/Google/Chrome/Default`
      : process.platform === 'win32'
      ? `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Google\\Chrome\\User Data\\Default`
      : `/home/${process.env.USER}/.config/google-chrome/Default`;

    try {
      // Create temp directory
      fs.mkdirSync(tempProfileDir, { recursive: true });

      // Copy cookies and login data
      const filesToCopy = ['Cookies', 'Login Data', 'Local State'];
      for (const file of filesToCopy) {
        const sourcePath = path.join(sourceProfile, file);
        const destPath = path.join(tempProfileDir, file);
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Copied ${file} to temp profile`);
        }
      }
    } catch (error: any) {
      console.log('Could not copy Chrome profile files, using fresh profile:', error?.message || error);
    }

    browser = await puppeteer.launch({
      headless: false, // Set to false so you can see the browser and interact if needed
      userDataDir: tempProfileDir,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    console.log('Browser launched with copied Chrome profile data - it should have your login session!');

    // Get all wake-up sites
    const wakeUpSitesRef = collection(db, 'wake-up-sites');
    const snapshot = await getDocs(wakeUpSitesRef);

    const wakeUpSites: WakeUpSite[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if ((data.wakeUpUrl || data.siteUrl) && data.migrationStatus !== 'completed') {
        wakeUpSites.push({
          siteId: doc.id,
          siteUrl: data.wakeUpUrl || data.siteUrl,
          migrationStatus: data.migrationStatus || 'pending',
          csvData: data.csvData || {}
        });
      }
    });

    // Process all sites
    const limitedSites = wakeUpSites;
    console.log(`Found ${wakeUpSites.length} total sites, processing all sites`);

    // Process sites in batches to avoid overwhelming the system
    const BATCH_SIZE = 5; // Process 5 sites at a time
    const DELAY_BETWEEN_BATCHES = 10000; // 10 seconds between batches
    const DELAY_BETWEEN_SITES = 5000; // 5 seconds between individual sites

    for (let i = 0; i < limitedSites.length; i += BATCH_SIZE) {
      const batch = limitedSites.slice(i, i + BATCH_SIZE);
      console.log(`\n=== Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(limitedSites.length / BATCH_SIZE)} ===`);

      for (const site of batch) {
        console.log(`\n--- Processing site ${site.siteId} ---`);

        // Create a new page for each site
        const page = await browser.newPage();

        try {
          // Wake up the media
          const wakeUpSuccess = await wakeUpMedia(page, site.siteUrl, site.siteId);

          if (wakeUpSuccess) {
            // Update status to waking
            await updateDoc(doc(db, 'wake-up-sites', site.siteId), {
              migrationStatus: 'waking',
              updatedAt: new Date()
            });

            // Trigger migration
            const migrationSuccess = await triggerMigration(site.siteId);

            // Update final status
            const finalStatus = migrationSuccess ? 'completed' : 'failed';
            await updateDoc(doc(db, 'wake-up-sites', site.siteId), {
              migrationStatus: finalStatus,
              updatedAt: new Date()
            });

            console.log(`Site ${site.siteId} ${finalStatus}`);
          } else {
            console.log(`Skipping migration for site ${site.siteId} - wake up failed`);
            await updateDoc(doc(db, 'wake-up-sites', site.siteId), {
              migrationStatus: 'wake_failed',
              updatedAt: new Date()
            });
          }

        } catch (error) {
          console.error(`Error processing site ${site.siteId}:`, error);
          await updateDoc(doc(db, 'wake-up-sites', site.siteId), {
            migrationStatus: 'error',
            updatedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          });
        } finally {
          await page.close();
        }

        // Delay between sites
        if (i + batch.length < limitedSites.length) {
          console.log(`Waiting ${DELAY_BETWEEN_SITES / 1000} seconds before next site...`);
          await delay(DELAY_BETWEEN_SITES);
        }
      }

      // Delay between batches
      if (i + BATCH_SIZE < limitedSites.length) {
        console.log(`Moving to next batch immediately...`);
      }
    }

    console.log('\n=== Wake-up and migrate process completed ===');

  } catch (error) {
    console.error('Error in wake-up and migrate process:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the process
processWakeUpSites().catch(console.error);
