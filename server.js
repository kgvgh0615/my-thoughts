const express = require('express');
const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const app = express();

// GitHub configuration
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'kgvgh0615';
const GITHUB_REPO = process.env.GITHUB_REPO || 'my-thoughts';

// Initialize Octokit
const octokit = new Octokit({
    auth: process.env.THOUGHTS_TOKEN
});

app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Endpoint to handle thought creation
app.post('/api/thoughts', async (req, res) => {
    try {
        const { title, content, date, filename } = req.body;
        
        // Create the thought content
        const thoughtContent = `---
date: ${date}
title: ${title}
---

${content}
`;

        // Create or update the thought file
        await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            path: `thoughts/${filename}`,
            message: `Add new thought: ${title}`,
            content: Buffer.from(thoughtContent).toString('base64'),
            branch: 'main'
        });

        // Read the current index.json
        const { data: indexData } = await octokit.repos.getContent({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            path: 'thoughts/index.json',
            ref: 'main'
        });

        // Parse the current index
        let thoughts = [];
        if (indexData) {
            const content = Buffer.from(indexData.content, 'base64').toString();
            thoughts = JSON.parse(content);
        }

        // Add the new thought
        thoughts.push({
            title,
            date,
            filename,
            preview: content.substring(0, 150) + '...'
        });

        // Sort thoughts by date (newest first)
        thoughts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Update index.json
        await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            path: 'thoughts/index.json',
            message: 'Update thoughts index',
            content: Buffer.from(JSON.stringify(thoughts, null, 2)).toString('base64'),
            sha: indexData ? indexData.sha : undefined,
            branch: 'main'
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Using GitHub repository: ${GITHUB_OWNER}/${GITHUB_REPO}`);
}); 