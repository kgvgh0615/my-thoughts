const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Endpoint to handle thought creation
app.post('/api/thoughts', async (req, res) => {
    try {
        const { title, content, date, filename } = req.body;
        
        // Create a GitHub repository dispatch event
        const response = await fetch(`https://api.github.com/repos/kgvgh0615/my-thoughts/dispatches`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.THOUGHTS_TOKEN}`
            },
            body: JSON.stringify({
                event_type: 'new_thought',
                client_payload: {
                    thought: { title, content, date, filename }
                }
            })
        });

        if (response.ok || response.status === 204) {
            res.json({ success: true });
        } else {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            res.status(500).json({ error: error.message });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 