// Sample thoughts data - In a real implementation, this would come from markdown files
const thoughts = [
    {
        id: 1,
        title: "First Thought",
        date: "2024-03-20",
        preview: "This is a preview of my first thought...",
        content: "This is the full content of my first thought..."
    },
    // More thoughts will be added here
];

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
    return `
        <article class="thought-card">
            <h3>${thought.title}</h3>
            <time datetime="${thought.date}">${formatDateForDisplay(thought.date)}</time>
            <p>${thought.preview}</p>
            <a href="./thoughts/${thought.filename}" class="read-more">Read more</a>
        </article>
    `;
}

// Function to load thoughts
async function loadThoughts() {
    try {
        const response = await fetch('./thoughts/index.json');
        const thoughts = await response.json();
        const thoughtsGrid = document.querySelector('.thoughts-grid');
        
        if (thoughtsGrid) {
            // Sort thoughts by date (newest first)
            thoughts.sort((a, b) => new Date(b.date) - new Date(a.date));
            thoughtsGrid.innerHTML = thoughts.map(thought => createThoughtCard(thought)).join('');
        }
    } catch (error) {
        console.error('Error loading thoughts:', error);
    }
}

// Function to save a new thought
async function saveThought(event) {
    event.preventDefault();
    
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
        // Create a GitHub repository dispatch event
        const response = await fetch('https://api.github.com/repos/kgvgh0615/my-thoughts/dispatches', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${process.env.THOUGHTS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_type: 'new_thought',
                client_payload: {
                    thought
                }
            })
        });

        if (response.ok) {
            // Clear the form
            event.target.reset();
            // Reload thoughts after a short delay to allow GitHub Actions to complete
            setTimeout(loadThoughts, 2000);
        } else {
            console.error('Error saving thought');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadThoughts();
    
    // Add form submission handler
    const thoughtForm = document.getElementById('thoughtForm');
    if (thoughtForm) {
        thoughtForm.addEventListener('submit', saveThought);
    }
}); 