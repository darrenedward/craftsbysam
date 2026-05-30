const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runLighthouseAudit() {
  console.log('Starting baseline Lighthouse audit...');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = {};

  try {
    // Navigate to the homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Basic performance metrics
    console.log('Collecting metrics...');
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData?.domContentLoadedEventEnd || 0,
        loadComplete: perfData?.loadEventEnd || 0,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
      };
    });

    // Basic accessibility checks
    console.log('Running accessibility checks...');
    const accessibilityIssues = await page.evaluate(() => {
      const issues = [];

      // Check for images without alt text
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        issues.push(`Found ${imagesWithoutAlt.length} images without alt text`);
      }

      // Check for form labels
      const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([id])');
      if (inputsWithoutLabels.length > 0) {
        issues.push(`Found ${inputsWithoutLabels.length} inputs without labels or aria-labels`);
      }

      // Check heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) {
        issues.push('No headings found on page');
      }

      // Check for skip links
      const skipLinks = document.querySelectorAll('a[href^="#"], [role="navigation"]');
      if (skipLinks.length === 0) {
        issues.push('No navigation or skip links found');
      }

      return issues;
    });

    // SEO checks
    console.log('Running SEO checks...');
    const seoIssues = await page.evaluate(() => {
      const issues = [];

      // Check for title
      if (!document.title || document.title.length === 0) {
        issues.push('Missing page title');
      }

      // Check for meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        issues.push('Missing meta description');
      }

      // Check for heading hierarchy
      const h1Count = document.querySelectorAll('h1').length;
      if (h1Count === 0) {
        issues.push('Missing H1 heading');
      } else if (h1Count > 1) {
        issues.push('Multiple H1 headings found');
      }

      return issues;
    });

    // Best practices checks
    console.log('Running best practices checks...');
    const bestPracticeIssues = await page.evaluate(() => {
      const issues = [];

      // Check for responsive viewport
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        issues.push('Missing viewport meta tag');
      }

      // Check for HTTPS (in production)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        issues.push('Site not using HTTPS');
      }

      return issues;
    });

    results.performance = {
      domContentLoaded: metrics.domContentLoaded,
      loadComplete: metrics.loadComplete,
      firstPaint: metrics.firstPaint,
    };

    results.accessibility = {
      issues: accessibilityIssues,
      score: accessibilityIssues.length === 0 ? 100 : Math.max(0, 100 - (accessibilityIssues.length * 10)),
    };

    results.seo = {
      issues: seoIssues,
      score: seoIssues.length === 0 ? 100 : Math.max(0, 100 - (seoIssues.length * 15)),
    };

    results.bestPractices = {
      issues: bestPracticeIssues,
      score: bestPracticeIssues.length === 0 ? 100 : Math.max(0, 100 - (bestPracticeIssues.length * 10)),
    };

    // Save results
    const reportPath = path.join(__dirname, 'test-results', 'lighthouse-baseline.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    console.log('\n=== BASELINE LIGHTHOUSE AUDIT RESULTS ===\n');
    console.log(`Performance: Load time ${Math.round(results.performance.loadComplete)}ms`);
    console.log(`Accessibility Score: ${results.accessibility.score}/100`);
    console.log(`SEO Score: ${results.seo.score}/100`);
    console.log(`Best Practices Score: ${results.bestPractices.score}/100`);

    if (accessibilityIssues.length > 0) {
      console.log('\nAccessibility Issues:');
      accessibilityIssues.forEach(issue => console.log(`  - ${issue}`));
    }

    if (seoIssues.length > 0) {
      console.log('\nSEO Issues:');
      seoIssues.forEach(issue => console.log(`  - ${issue}`));
    }

    if (bestPracticeIssues.length > 0) {
      console.log('\nBest Practice Issues:');
      bestPracticeIssues.forEach(issue => console.log(`  - ${issue}`));
    }

    console.log('\n========================================\n');
    console.log(`Full report saved to: ${reportPath}`);

  } catch (error) {
    console.error('Error running Lighthouse audit:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

runLighthouseAudit().catch(console.error);
