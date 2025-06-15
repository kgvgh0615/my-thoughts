const fs = require('fs');
const path = require('path');

// Read the event payload
const eventPath = process.env.GITHUB_EVENT_PATH;
const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));

// Get the thought data from the event
const thought = event.client_payload.thought;

// Create the thought file
const thoughtPath = path.join('thoughts', thought.filename);
const thoughtContent = `---
date: ${thought.date}
title: ${thought.title}
---

${thought.content}
`;

fs.writeFileSync(thoughtPath, thoughtContent);

// Update the index.json
const indexPath = path.join('thoughts', 'index.json');
let thoughts = [];
if (fs.existsSync(indexPath)) {
    thoughts = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
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
fs.writeFileSync(indexPath, JSON.stringify(thoughts, null, 2)); 