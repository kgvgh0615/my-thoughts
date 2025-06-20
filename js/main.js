// Configuration
const config = {
    owner: 'kgvgh0615',
    repo: 'my-thoughts',
    baseUrl: 'https://kgvgh0615.github.io/my-thoughts'
};

// Function to get GitHub token
function getGitHubToken() {
    let token = localStorage.getItem('github_token');
    if (!token) {
        token = prompt(
            'Please enter your GitHub Personal Access Token with "repo" scope.\n\n' +
            'You can create one here: https://github.com/settings/tokens/new?scopes=repo'
        );
        if (token) {
            localStorage.setItem('github_token', token);
        }
    }
    return token;
}

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
    
    const thought = { title, content, date: now.toISOString(), filename };

    const token = getGitHubToken();
    if (!token) {
        alert('GitHub token is required to save thoughts.');
        return;
    }

    try {
        const thoughtsGrid = document.querySelector('.thoughts-grid');
        if (thoughtsGrid) {
            thoughtsGrid.innerHTML = '<p class="loading-message">Saving your thought...</p>';
        }

        const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/dispatches`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                event_type: 'new_thought',
                client_payload: thought
            })
        });

        if (response.ok || response.status === 204) {
            event.target.reset();
            alert('Thought saved successfully! It may take a few moments to appear.');
            setTimeout(loadThoughts, 8000);
        } else {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || 'Failed to save thought.');
        }
    } catch (error) {
        console.error('Error saving thought:', error);
        alert(`Error saving thought: ${error.message}`);
        loadThoughts(); // Restore the thoughts list
    }
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