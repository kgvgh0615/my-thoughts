const fs = require('fs');
const path = require('path');

try {
    // Read the event payload
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) {
        throw new Error('GITHUB_EVENT_PATH is not set');
    }

    console.log('Reading event payload from:', eventPath);
    const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    console.log('Event payload:', JSON.stringify(event, null, 2));

    // Get the thought data from the event
    const thought = event.client_payload.thought;
    if (!thought) {
        throw new Error('No thought data in event payload');
    }

    console.log('Processing thought:', JSON.stringify(thought, null, 2));

    // Create the thought file
    const thoughtPath = path.join('thoughts', thought.filename);
    const thoughtContent = `---
date: ${thought.date}
title: ${thought.title}
---

${thought.content}
`;

    console.log('Writing thought to:', thoughtPath);
    fs.writeFileSync(thoughtPath, thoughtContent);
    console.log('Thought file written successfully');

    // Update the index.json
    const indexPath = path.join('thoughts', 'index.json');
    console.log('Reading index from:', indexPath);
    
    let thoughts = [];
    if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        console.log('Existing index content:', indexContent);
        thoughts = JSON.parse(indexContent);
    } else {
        console.log('No existing index found, creating new one');
    }

    // Add the new thought
    thoughts.push({
        title: thought.title,
        date: thought.date,
        filename: thought.filename,
        preview: thought.content.substring(0, 150) + '...'
    });

    // Sort thoughts by date (newest first)
    thoughts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Write the updated index
    console.log('Writing updated index:', JSON.stringify(thoughts, null, 2));
    fs.writeFileSync(indexPath, JSON.stringify(thoughts, null, 2));
    console.log('Index updated successfully');

} catch (error) {
    console.error('Error processing thought:', error);
    process.exit(1);
} 