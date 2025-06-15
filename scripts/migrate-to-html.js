const fs = require('fs');
const path = require('path');

// Function to create HTML files for all markdown files
async function migrateToHtml() {
    try {
        console.log('Starting migration to HTML...');
        
        // Read all markdown files from the thoughts directory
        const thoughtsDir = path.join(process.cwd(), 'thoughts');
        console.log('Looking for markdown files in:', thoughtsDir);
        
        const files = fs.readdirSync(thoughtsDir);
        const mdFiles = files.filter(file => file.endsWith('.md'));
        
        console.log(`Found ${mdFiles.length} markdown files to migrate:`, mdFiles);
        
        // Read the template
        const templatePath = path.join(process.cwd(), 'thought.html');
        console.log('Using template from:', templatePath);
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found at: ${templatePath}`);
        }
        
        const template = fs.readFileSync(templatePath, 'utf8');
        
        // Process each markdown file
        for (const mdFile of mdFiles) {
            const mdPath = path.join(thoughtsDir, mdFile);
            const htmlFile = mdFile.replace('.md', '.html');
            const htmlPath = path.join(thoughtsDir, htmlFile);
            
            console.log(`Processing ${mdFile}...`);
            console.log(`Creating HTML file at: ${htmlPath}`);
            
            // Copy the template to create the HTML file
            fs.copyFileSync(templatePath, htmlPath);
            console.log(`Created HTML file: ${htmlFile}`);
        }
        
        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

// Run the migration
migrateToHtml(); 