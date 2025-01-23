const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const manifestTemplatePath = path.resolve(__dirname, './manifest_template.json');
const manifest = JSON.parse(fs.readFileSync(manifestTemplatePath, 'utf8'));

// Replace the placeholder
manifest.oauth2.client_id = process.env.CLIENT_ID;

// Write the updated manifest back to disk
const manifestOutPath = path.resolve(__dirname, '../manifest.json');
fs.writeFileSync(manifestOutPath, JSON.stringify(manifest, null, 2));
console.log('Updated manifest.json with CLIENT_ID');
