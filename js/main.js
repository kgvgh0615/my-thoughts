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

// Function to create a thought card
function createThoughtCard(thought) {
    return `
        <article class="thought-card">
            <h2>${thought.title}</h2>
            <time datetime="${thought.date}">${formatDate(thought.date)}</time>
            <p>${thought.preview}</p>
            <a href="/thoughts/${thought.id}.html" class="read-more">Read more</a>
        </article>
    `;
}

// Function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to load thoughts
function loadThoughts() {
    const thoughtsGrid = document.querySelector('.thoughts-grid');
    if (thoughtsGrid) {
        thoughtsGrid.innerHTML = thoughts.map(thought => createThoughtCard(thought)).join('');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadThoughts();
}); 