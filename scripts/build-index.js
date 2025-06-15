const fs = require('fs');
const path = require('path');

try {
    const thoughtsDir = path.join(process.cwd(), 'thoughts');
    const mdFiles = fs.readdirSync(thoughtsDir).filter(file => file.endsWith('.md'));

    const thoughts = [];

    for (const file of mdFiles) {
        const content = fs.readFileSync(path.join(thoughtsDir, file), 'utf-8');
        const frontMatterMatch = content.match(/---([\s\S]*?)---/);
        
        if (frontMatterMatch && frontMatterMatch[1]) {
            const frontMatter = frontMatterMatch[1];
            const body = content.substring(frontMatterMatch[0].length).trim();
            const metadata = {};
            frontMatter.trim().split('\n').forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length) {
                    let value = valueParts.join(':').trim();
                    // Remove quotes if they exist
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.substring(1, value.length - 1);
                    }
                    metadata[key.trim()] = value;
                }
            });
            
            thoughts.push({
                title: metadata.title,
                date: metadata.date,
                filename: file,
                preview: body.substring(0, 150) + '...'
            });
        }
    }

    thoughts.sort((a, b) => new Date(b.date) - new Date(a.date));

    fs.writeFileSync(path.join(thoughtsDir, 'index.json'), JSON.stringify(thoughts, null, 2));

    console.log('Successfully built thoughts/index.json');
} catch (error) {
    console.error("Error building index:", error);
    process.exit(1);
} 