const fs = require('fs');
const path = require('path');

// Mock fs and path
jest.mock('fs');
jest.mock('path');

describe('Process Thought Script', () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Mock environment
        process.env.GITHUB_EVENT_PATH = '/tmp/event.json';
        
        // Mock path.join
        path.join.mockImplementation((...args) => args.join('/'));
    });

    it('should create a new thought file', () => {
        // Mock event data
        const eventData = {
            client_payload: {
                thought: {
                    title: 'Test Thought',
                    content: 'Test Content',
                    date: '2024-03-21T12:00:00.000Z',
                    filename: 'test.md'
                }
            }
        };

        // Mock fs.readFileSync
        fs.readFileSync.mockReturnValue(JSON.stringify(eventData));

        // Mock fs.existsSync
        fs.existsSync.mockReturnValue(false);

        // Run the script
        require('../scripts/process-thought.js');

        // Verify file creation
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            'thoughts/test.md',
            expect.stringContaining('Test Thought')
        );
    });

    it('should update index.json with new thought', () => {
        // Mock event data
        const eventData = {
            client_payload: {
                thought: {
                    title: 'Test Thought',
                    content: 'Test Content',
                    date: '2024-03-21T12:00:00.000Z',
                    filename: 'test.md'
                }
            }
        };

        // Mock existing index.json
        const existingIndex = [];
        fs.readFileSync.mockImplementation((path) => {
            if (path === '/tmp/event.json') {
                return JSON.stringify(eventData);
            }
            return JSON.stringify(existingIndex);
        });

        fs.existsSync.mockReturnValue(true);

        // Run the script
        require('../scripts/process-thought.js');

        // Verify index.json update
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            'thoughts/index.json',
            expect.stringContaining('Test Thought')
        );
    });

    it('should handle missing event data', () => {
        // Mock empty event data
        fs.readFileSync.mockReturnValue('{}');

        // Run the script
        require('../scripts/process-thought.js');

        // Verify error handling
        expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle file system errors', () => {
        // Mock event data
        const eventData = {
            client_payload: {
                thought: {
                    title: 'Test Thought',
                    content: 'Test Content',
                    date: '2024-03-21T12:00:00.000Z',
                    filename: 'test.md'
                }
            }
        };

        // Mock fs.readFileSync to throw error
        fs.readFileSync.mockImplementation(() => {
            throw new Error('File system error');
        });

        // Run the script
        require('../scripts/process-thought.js');

        // Verify error handling
        expect(process.exit).toHaveBeenCalledWith(1);
    });
}); 