#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// List of files to update
const filesToUpdate = [
  "src/screens/EventDetailsScreen.tsx",
  "src/screens/TopEventsScreen.tsx",
  "src/screens/ScanQRScreen.tsx",
  "src/screens/QRWristbandScreen.tsx",
  "src/screens/CreateEventScreen.tsx",
  "src/screens/ProfileScreen.tsx",
  // Add other files that import from ../services/api
];

const updateImports = (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, "utf8");

    // Check if file already has the new import
    if (content.includes('from "../services/apiProvider"')) {
      console.log(`✅ Already updated: ${filePath}`);
      return;
    }

    // Check if file has the old import
    if (!content.includes('from "../services/api"')) {
      console.log(`⏭️  No API import found: ${filePath}`);
      return;
    }

    // Replace the import
    const updatedContent = content.replace(
      /import\s*{\s*([^}]+)\s*}\s*from\s*["']\.\.\/services\/api["']/g,
      'import { $1 } from "../services/apiProvider"'
    );

    // Write back to file
    fs.writeFileSync(fullPath, updatedContent, "utf8");
    console.log(`✅ Updated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
};

console.log("🚀 Starting API import migration...\n");

filesToUpdate.forEach(updateImports);

console.log("\n✨ Migration complete!");
console.log("\n📝 Next steps:");
console.log("1. Update your API endpoint in src/config/api.ts");
console.log(
  "2. Set USE_MOCK_API = false in src/services/apiProvider.ts when ready"
);
console.log("3. Test your app with real API calls");
