// Quick fix script to replace sync createClient() calls
const fs = require("fs");
const path = require("path");

const criticalFiles = [
  "src/app/api/customer-intelligence/route.ts",
  "src/app/api/ml/navigation/predict/route.ts",
  "src/app/api/ml/navigation/train/route.ts",
  "src/app/api/ws/navigation/route.ts",
];

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // Replace patterns that are likely causing runtime errors
    let fixedContent = content
      .replace(
        /const supabase = createClient\(\);/g,
        "const supabase = await createClient();"
      )
      .replace(
        /this\.supabase = createClient\(\);/g,
        "this.supabase = await createClient();"
      );

    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log("🔧 Quick-fixing critical async createClient() calls...\n");

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fixFile(file);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log("\n✅ Quick fix completed!");
console.log("🚀 Try starting your dev server now.");
