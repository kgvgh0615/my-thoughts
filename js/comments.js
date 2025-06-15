// GitHub Issues API configuration
const GITHUB_REPO = 'kgvgh0615/my-thoughts'; // Replace with your GitHub repo
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/issues`;

// Function to load comments
async function loadComments() {
    const commentsContainer = document.getElementById('comments-container');
    if (!commentsContainer) return;

    try {
        const response = await fetch(GITHUB_API_URL);
        const issues = await response.json();
        
        // Filter issues that are comments for this thought
        const thoughtId = window.location.pathname.split('/').pop().replace('.html', '');
        const comments = issues.filter(issue => 
            issue.title.includes(`Comment on Thought #${thoughtId}`)
        );

        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
            return;
        }

        commentsContainer.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <img src="${comment.user.avatar_url}" alt="${comment.user.login}" class="avatar">
                    <div class="comment-meta">
                        <strong>${comment.user.login}</strong>
                        <time datetime="${comment.created_at}">${formatDate(comment.created_at)}</time>
                    </div>
                </div>
                <div class="comment-content">
                    ${comment.body}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsContainer.innerHTML = '<p>Error loading comments. Please try again later.</p>';
    }
}

// Function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to set up comment link
function setupCommentLink() {
    const commentLink = document.getElementById('comment-link');
    if (commentLink) {
        const thoughtId = window.location.pathname.split('/').pop().replace('.html', '');
        const issueTitle = `Comment on Thought #${thoughtId}`;
        const issueBody = `Comment on: ${document.title}\n\nYour comment here:`;
        const issueUrl = `https://github.com/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`;
        commentLink.href = issueUrl;
    }
}

// Initialize comments
document.addEventListener('DOMContentLoaded', () => {
    loadComments();
    setupCommentLink();
}); 