const fs = require('fs');
const path = require('path');

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

describe('Process Thought Script', () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Mock environment variable
        process.env.GITHUB_EVENT_PATH = '/path/to/event.json';
        
        // Mock path.join to return predictable paths
        path.join.mockImplementation((...args) => args.join('/'));
    });

    it('should create a new thought file', () => {
        // Mock event data
        const eventData = {
            client_payload: {
                title: 'Test Thought',
                content: 'Test Content',
                date: '2024-02-20T12:00:00Z'
            }
        };
        
        // Mock fs.readFileSync to return event data
        fs.readFileSync.mockReturnValueOnce(JSON.stringify(eventData));
        
        // Mock fs.existsSync to return false for new file
        fs.existsSync.mockReturnValueOnce(false);
        
        // Mock fs.writeFileSync
        fs.writeFileSync.mockImplementation(() => {});
        
        // Run the script
        require('../scripts/process-thought');
        
        // Verify file creation
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('2024-02-20-test-thought.md'),
            expect.stringContaining('# Test Thought')
        );
    });

    it('should update index.json with new thought', () => {
        // Mock event data
        const eventData = {
            client_payload: {
                title: 'Test Thought',
                content: 'Test Content',
                date: '2024-02-20T12:00:00Z'
            }
        };
        
        // Mock existing index.json
        const existingIndex = [
            {
                title: 'Old Thought',
                filename: '2024-02-19-old-thought.md',
                preview: 'Old Content'
            }
        ];
        
        // Mock fs.readFileSync to return event data and existing index
        fs.readFileSync
            .mockReturnValueOnce(JSON.stringify(eventData))
            .mockReturnValueOnce(JSON.stringify(existingIndex));
        
        // Mock fs.existsSync to return true for index.json
        fs.existsSync.mockReturnValueOnce(true);
        
        // Mock fs.writeFileSync
        fs.writeFileSync.mockImplementation(() => {});
        
        // Run the script
        require('../scripts/process-thought');
        
        // Verify index.json update
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('index.json'),
            expect.stringContaining('Test Thought')
        );
    });

    it('should handle missing event data', () => {
        // Mock empty event data
        fs.readFileSync.mockReturnValueOnce('{}');
        
        // Run the script
        require('../scripts/process-thought');
        
        // Verify error handling
        expect(process.exit).toHaveBeenCalledWith(1);
        expect(console.error).toHaveBeenCalled();
    });

    it('should handle file system errors', () => {
        // Mock fs.readFileSync to throw error
        fs.readFileSync.mockImplementation(() => {
            throw new Error('File system error');
        });
        
        // Run the script
        require('../scripts/process-thought');
        
        // Verify error handling
        expect(process.exit).toHaveBeenCalledWith(1);
        expect(console.error).toHaveBeenCalled();
    });
}); 