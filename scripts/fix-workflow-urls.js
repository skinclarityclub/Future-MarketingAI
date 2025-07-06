/**
 * N8N Workflow URL Generator - Fix for Placid API Issues
 *
 * This utility provides correct URL generation for Supabase storage
 * to prevent the errors seen in Placid API requests.
 */

// ✅ CORRECT URL GENERATION FUNCTIONS
// Copy these functions into your n8n workflow Code nodes

/**
 * Generate a clean, properly formatted Supabase storage URL
 * @param {string} executionId - N8N execution ID
 * @param {string} filename - The filename (e.g., 'generated-image.png')
 * @param {string} subfolder - Optional subfolder (e.g., 'enterprise')
 * @returns {string} - Clean public URL
 */
function generateCleanStorageURL(
  executionId,
  filename,
  subfolder = "enterprise"
) {
  const bucketName = "content-assets";
  const baseUrl = "https://nurdldgqxseunotmygzn.supabase.co";

  // Clean the filename to remove any quotes or invalid characters
  const cleanFilename = filename.replace(/['"]/g, "").trim();

  // Construct path without double slashes
  const filePath = `${subfolder}/${executionId}/${cleanFilename}`;

  // Generate the public URL
  const publicUrl = `${baseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;

  console.log("🔗 Generated clean URL:", publicUrl);
  return publicUrl;
}

/**
 * Generate unique filename with timestamp and random suffix
 * @param {string} baseFilename - Base name (e.g., 'generated-image')
 * @param {string} extension - File extension (e.g., 'png')
 * @param {number} slideIndex - Optional slide index for carousels
 * @returns {string} - Unique filename
 */
function generateUniqueFilename(
  baseFilename,
  extension = "png",
  slideIndex = null
) {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  if (slideIndex !== null) {
    return `${baseFilename}-${slideIndex}-${timestamp}-${randomSuffix}.${extension}`;
  }

  return `${baseFilename}-${timestamp}-${randomSuffix}.${extension}`;
}

/**
 * Validate that a URL is properly formatted for Placid API
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
function validatePlacidURL(url) {
  // Check for common issues
  const hasExtraQuotes = url.includes('"');
  const hasDoubleSlashes =
    url.includes("//storage") || url.includes("content-assets//");
  const hasProperDomain = url.startsWith(
    "https://nurdldgqxseunotmygzn.supabase.co"
  );
  const hasPublicPath = url.includes("/storage/v1/object/public/");

  if (hasExtraQuotes) {
    console.error("❌ URL contains quotes:", url);
    return false;
  }

  if (hasDoubleSlashes) {
    console.error("❌ URL has double slashes:", url);
    return false;
  }

  if (!hasProperDomain) {
    console.error("❌ URL missing proper domain:", url);
    return false;
  }

  if (!hasPublicPath) {
    console.error("❌ URL missing public path:", url);
    return false;
  }

  console.log("✅ URL is valid for Placid:", url);
  return true;
}

// 🔧 EXAMPLE USAGE FOR N8N WORKFLOWS

// For PostBuilder workflow (Replace the "Generate Enterprise URL" node code):
const postBuilderExample = `
const storeImageData = $input.first().json;
const enterpriseData = $('Enterprise Input Trigger').first().json;

console.log("🔗 === ENTERPRISE URL GENERATION ===");
console.log("🆔 Execution ID:", $execution.id);

// Generate clean filename and URL
const filename = 'generated-image.png';
const publicUrl = generateCleanStorageURL($execution.id, filename);

// Validate before returning
if (!validatePlacidURL(publicUrl)) {
  throw new Error('Generated URL failed validation');
}

const enterpriseMetadata = {
  file_url: publicUrl,
  storage_path: \`enterprise/\${$execution.id}/\${filename}\`,
  bucket_name: 'content-assets',
  execution_id: $execution.id,
  generated_at: new Date().toISOString(),
  content_strategy: enterpriseData.contentStrategy || 'premium',
  priority_level: enterpriseData.priority || 'high',
  workflow_version: '2.1_enterprise_fixed',
  enterprise_mode: true
};

console.log("🏢 Enterprise metadata prepared with clean URL");
return [{ json: enterpriseMetadata }];
`;

// For CarouselBuilder workflow:
const carouselBuilderExample = `
const storeImageData = $input.first().json;
const slideData = $('Split Prompts for Loop').item.json;

console.log("🎠 === CAROUSEL SLIDE URL GENERATION ===");

// Generate unique filename for this slide
const filename = generateUniqueFilename('generated-image', 'png', slideData.slideIndex);
const publicUrl = generateCleanStorageURL($execution.id, filename);

// Validate the URL
if (!validatePlacidURL(publicUrl)) {
  throw new Error(\`Slide \${slideData.slideIndex} URL failed validation\`);
}

// Return clean metadata
return [{
  json: {
    file_url: publicUrl,
    slide_index: slideData.slideIndex,
    filename: filename,
    execution_id: $execution.id,
    storage_path: \`enterprise/\${$execution.id}/\${filename}\`,
    generated_at: new Date().toISOString()
  }
}];
`;

// 📋 WORKFLOW UPDATE CHECKLIST
console.log(`
🔧 N8N WORKFLOW FIX CHECKLIST:

1. ✅ Copy the utility functions above into a new Code node
2. ✅ Update "Generate Enterprise URL" nodes to use generateCleanStorageURL()
3. ✅ Update "Store Enterprise Image" nodes URL to use clean paths
4. ✅ Add URL validation before sending to Placid API
5. ✅ Test with a single image first
6. ✅ Monitor Placid API responses for success

🎯 Key Changes:
- Remove extra quotes from URLs
- Fix double slashes in paths  
- Add proper validation
- Use consistent URL formatting
- Add better error handling

🚀 After applying these fixes, your Placid API should work correctly!
`);

module.exports = {
  generateCleanStorageURL,
  generateUniqueFilename,
  validatePlacidURL,
  postBuilderExample,
  carouselBuilderExample,
};
