// Configuration
const config = {
    owner: 'kgvgh0615',
    repo: 'my-thoughts',
    baseUrl: 'https://kgvgh0615.github.io/my-thoughts'
};

// Function to format date and time for filename
function formatDateTimeForFilename(date) {
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

// Function to format date for display
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString(undefined, options);
}

// Function to create a thought card
function createThoughtCard(thought) {
    console.log('Creating card for thought:', thought);
    // Ensure the filename is properly formatted
    const filename = thought.filename || `${formatDateTimeForFilename(new Date(thought.date))}.md`;
    const htmlFilename = filename.replace('.md', '.html');
    return `
        <article class="thought-card">
            <h3>${thought.title}</h3>
            <time datetime="${thought.date}">${formatDateForDisplay(thought.date)}</time>
            <p>${thought.preview || thought.content.substring(0, 150)}...</p>
            <a href="${config.baseUrl}/thoughts/${htmlFilename}" class="read-more" target="_blank">Read more</a>
        </article>
    `;
}

// Function to load thoughts with retry
async function loadThoughts(retryCount = 0) {
    try {
        console.log('Loading thoughts...');
        const response = await fetch(`${config.baseUrl}/thoughts/index.json?t=${new Date().getTime()}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 404 && retryCount < 3) {
                console.log(`Index not found, retrying in 2 seconds... (attempt ${retryCount + 1})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return loadThoughts(retryCount + 1);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const thoughts = await response.json();
        console.log('Loaded thoughts:', thoughts);
        
        const thoughtsGrid = document.querySelector('.thoughts-grid');
        if (thoughtsGrid) {
            if (!Array.isArray(thoughts)) {
                console.error('Thoughts is not an array:', thoughts);
                thoughtsGrid.innerHTML = '<p class="error-message">Error: Invalid thoughts format</p>';
                return;
            }

            if (thoughts.length === 0) {
                console.log('No thoughts found');
                thoughtsGrid.innerHTML = '<p class="no-thoughts">No thoughts yet. Be the first to share your thoughts!</p>';
            } else {
                console.log('Rendering thoughts:', thoughts.length);
                // Sort thoughts by date (newest first)
                thoughts.sort((a, b) => new Date(b.date) - new Date(a.date));
                thoughtsGrid.innerHTML = thoughts.map(thought => createThoughtCard(thought)).join('');
            }
        } else {
            console.error('Thoughts grid element not found');
        }
    } catch (error) {
        console.error('Error loading thoughts:', error);
        const thoughtsGrid = document.querySelector('.thoughts-grid');
        if (thoughtsGrid) {
            if (retryCount < 3) {
                console.log(`Retrying in 2 seconds... (attempt ${retryCount + 1})`);
                thoughtsGrid.innerHTML = '<p class="loading-message">Loading thoughts...</p>';
                await new Promise(resolve => setTimeout(resolve, 2000));
                return loadThoughts(retryCount + 1);
            } else {
                thoughtsGrid.innerHTML = '<p class="error-message">Error loading thoughts. Please try again later.</p>';
            }
        }
    }
}

// Function to save a new thought
async function saveThought(event) {
    event.preventDefault();
    
    const title = document.getElementById('thoughtTitle').value;
    const content = document.getElementById('thoughtContent').value;
    const now = new Date();
    const filename = `${formatDateTimeForFilename(now)}.md`;
    
    const thoughtContent = `---
date: ${now.toISOString()}
title: ${title}
---

${content}
`;

    const newFileUrl = new URL(`https://github.com/${config.owner}/${config.repo}/new/main`);
    newFileUrl.searchParams.set('filename', `thoughts/${filename}`);
    newFileUrl.searchParams.set('value', thoughtContent);

    window.open(newFileUrl.toString(), '_blank');
    
    alert('Please complete saving your thought on GitHub. The page will refresh to show your new thought in a moment.');
    
    event.target.reset();

    // Reload thoughts after a short delay to allow GitHub to process the new file
    setTimeout(loadThoughts, 8000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadThoughts();
    
    // Add form submission handler
    const thoughtForm = document.getElementById('thoughtForm');
    if (thoughtForm) {
        thoughtForm.addEventListener('submit', saveThought);
    }
}); 