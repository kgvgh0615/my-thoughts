// Configuration
const config = {
    owner: 'kgvgh0615',
    repo: 'my-thoughts',
    token: '', // This will be set by the user
    baseUrl: 'https://kgvgh0615.github.io/my-thoughts' // Add base URL for GitHub Pages
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
        const response = await fetch(`${config.baseUrl}/thoughts/index.json`);
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
    
    if (!config.token) {
        const token = prompt('Please enter your GitHub token:');
        if (!token) {
            alert('A GitHub token is required to save thoughts.');
            return;
        }
        config.token = token;
        localStorage.setItem('github_token', token);
    }
    
    const title = document.getElementById('thoughtTitle').value;
    const content = document.getElementById('thoughtContent').value;
    const now = new Date();
    const filename = formatDateTimeForFilename(now);
    
    const thought = {
        title,
        content,
        date: now.toISOString(),
        filename: `${filename}.md`
    };

    try {
        // Show loading state
        const thoughtsGrid = document.querySelector('.thoughts-grid');
        if (thoughtsGrid) {
            thoughtsGrid.innerHTML = '<p class="loading-message">Saving your thought...</p>';
        }

        // Create a GitHub repository dispatch event
        const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/dispatches`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${config.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_type: 'new_thought',
                client_payload: {
                    thought
                }
            })
        });

        // 204 No Content is a success response for this endpoint
        if (response.ok || response.status === 204) {
            // Clear the form
            event.target.reset();
            // Show success message
            alert('Thought saved successfully! It may take a few moments to appear.');
            // Reload thoughts after a short delay to allow GitHub Actions to complete
            setTimeout(loadThoughts, 2000);
        } else {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('Error saving thought:', error);
            alert(`Error saving thought: ${error.message || 'Please check the console for details.'}`);
            // Reset loading state
            if (thoughtsGrid) {
                loadThoughts();
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving thought. Please check the console for details.');
        // Reset loading state
        const thoughtsGrid = document.querySelector('.thoughts-grid');
        if (thoughtsGrid) {
            loadThoughts();
        }
    }
}

// Load token from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
        config.token = savedToken;
    }
    loadThoughts();
    
    // Add form submission handler
    const thoughtForm = document.getElementById('thoughtForm');
    if (thoughtForm) {
        thoughtForm.addEventListener('submit', saveThought);
    }
}); 