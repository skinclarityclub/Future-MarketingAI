// Test Script voor Historical Content Scraper API (Taak 70.3)
// Tests de data scraping functionaliteit via API calls

const BASE_URL = "http://localhost:3000";

async function testHistoricalScraperAPI() {
  console.log("🧪 Starting Historical Content Scraper API Tests\n");

  try {
    // Test 1: API Status Check
    console.log("📊 Test 1: API Status Check");
    const statusResponse = await fetch(
      `${BASE_URL}/api/data-seeding/historical-scraper`
    );
    const statusData = await statusResponse.json();

    console.log("✅ Status Check Result:", {
      success: statusData.success,
      supportedPlatforms: statusData.supportedPlatforms,
      endpoints: statusData.endpoints,
    });
    console.log("");

    // Test 2: Test Mode Scraping (Safe)
    console.log("📊 Test 2: Test Mode Scraping");
    const testScrapingResponse = await fetch(
      `${BASE_URL}/api/data-seeding/historical-scraper`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platforms: ["instagram", "linkedin", "facebook"],
          daysBack: 30,
          testMode: true,
        }),
      }
    );

    const testScrapingData = await testScrapingResponse.json();

    console.log("✅ Test Mode Scraping Result:", {
      success: testScrapingData.success,
      testMode: testScrapingData.testMode,
      platforms: testScrapingData.config?.platforms,
      summary: testScrapingData.summary,
    });

    if (testScrapingData.results) {
      console.log("\n📈 Platform Results:");
      Object.entries(testScrapingData.results).forEach(([platform, result]) => {
        console.log(`  ${platform}:`, {
          success: result.success,
          itemsScraped: result.totalItemsScraped,
          dataQuality: result.dataQuality?.averageCompleteness,
          executionTime: result.executionTime + "ms",
        });
      });
    }
    console.log("");

    // Test 3: Single Platform Test
    console.log("📊 Test 3: Single Platform Test (Instagram)");
    const singlePlatformResponse = await fetch(
      `${BASE_URL}/api/data-seeding/historical-scraper`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platforms: ["instagram"],
          daysBack: 7,
          testMode: true,
        }),
      }
    );

    const singlePlatformData = await singlePlatformResponse.json();

    console.log("✅ Single Platform Test Result:", {
      success: singlePlatformData.success,
      platform: singlePlatformData.config?.platforms?.[0],
      itemsScraped: singlePlatformData.summary?.totalItemsScraped,
      dataQuality: singlePlatformData.summary?.averageDataQuality,
    });
    console.log("");

    // Test 4: Configuration Validation
    console.log("📊 Test 4: Configuration Validation");
    const configTestResponse = await fetch(
      `${BASE_URL}/api/data-seeding/historical-scraper`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platforms: ["instagram", "linkedin"],
          daysBack: 90,
          testMode: true,
        }),
      }
    );

    const configTestData = await configTestResponse.json();

    console.log("✅ Configuration Test Result:", {
      success: configTestData.success,
      timeRange: configTestData.config?.timeRange,
      daysBack: configTestData.config?.daysBack,
      platformCount: configTestData.config?.platforms?.length,
    });
    console.log("");

    // Summary
    const allTests = [
      statusData,
      testScrapingData,
      singlePlatformData,
      configTestData,
    ];
    const successfulTests = allTests.filter(test => test.success).length;

    console.log("🎯 Test Summary:");
    console.log(`✅ Successful Tests: ${successfulTests}/${allTests.length}`);
    console.log(
      `📊 Total Items Scraped (Mock): ${testScrapingData.summary?.totalItemsScraped || 0}`
    );
    console.log(
      `🌐 Platforms Tested: ${testScrapingData.config?.platforms?.join(", ") || "None"}`
    );
    console.log(
      `⏱️  Average Data Quality: ${testScrapingData.summary?.averageDataQuality?.toFixed(1)}%`
    );

    if (successfulTests === allTests.length) {
      console.log(
        "\n🎉 All tests passed! Historical Content Scraper is working correctly."
      );
      console.log(
        "📝 Ready for integration with self-learning content engine."
      );
    } else {
      console.log("\n⚠️  Some tests failed. Check the API implementation.");
    }
  } catch (error) {
    console.error("❌ Test execution failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log(
      "1. Make sure the Next.js development server is running (npm run dev)"
    );
    console.log(
      "2. Check that the API route exists at /api/data-seeding/historical-scraper"
    );
    console.log(
      "3. Verify the Historical Content Scraper module is properly implemented"
    );
  }
}

// Performance Test
async function performanceTest() {
  console.log("\n⚡ Performance Test");

  const startTime = Date.now();

  try {
    const response = await fetch(
      `${BASE_URL}/api/data-seeding/historical-scraper`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platforms: ["instagram", "linkedin", "facebook"],
          daysBack: 30,
          testMode: true,
        }),
      }
    );

    const data = await response.json();
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log("📈 Performance Metrics:", {
      apiResponseTime: totalTime + "ms",
      mockExecutionTime: data.summary?.totalItemsScraped
        ? Object.values(data.results || {}).reduce(
            (sum, result) => sum + (result.executionTime || 0),
            0
          ) + "ms"
        : "N/A",
      throughput: data.summary?.totalItemsScraped
        ? (data.summary.totalItemsScraped / (totalTime / 1000)).toFixed(2) +
          " items/sec"
        : "N/A",
    });

    if (totalTime < 2000) {
      console.log("✅ Performance: Excellent (< 2s)");
    } else if (totalTime < 5000) {
      console.log("⚠️  Performance: Good (< 5s)");
    } else {
      console.log("❌ Performance: Needs improvement (> 5s)");
    }
  } catch (error) {
    console.error("❌ Performance test failed:", error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testHistoricalScraperAPI();
  await performanceTest();

  console.log("\n🚀 Historical Content Scraper Testing Complete!");
  console.log(
    "📊 Data seeding infrastructure ready for self-learning content engine."
  );
}

// Execute tests
runAllTests();
