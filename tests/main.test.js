describe('Thought Management', () => {
    // Load the main.js file
    require('../js/main.js');

    describe('loadThoughts', () => {
        it('should display thoughts when index.json is available', async () => {
            const mockThoughts = [
                {
                    title: 'Test Thought',
                    date: '2024-03-21T12:00:00.000Z',
                    filename: 'test.md',
                    preview: 'Test preview'
                }
            ];

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockThoughts)
            });

            await loadThoughts();

            const thoughtsGrid = document.querySelector('.thoughts-grid');
            expect(thoughtsGrid.innerHTML).toContain('Test Thought');
            expect(thoughtsGrid.innerHTML).toContain('Test preview');
        });

        it('should show empty state when no thoughts exist', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([])
            });

            await loadThoughts();

            const thoughtsGrid = document.querySelector('.thoughts-grid');
            expect(thoughtsGrid.innerHTML).toContain('No thoughts yet');
        });

        it('should handle 404 errors with retry', async () => {
            global.fetch
                .mockRejectedValueOnce(new Error('Not Found'))
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve([])
                });

            await loadThoughts();

            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('saveThought', () => {
        it('should save a new thought successfully', async () => {
            const mockToken = 'test-token';
            localStorageMock.getItem.mockReturnValue(mockToken);

            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 204
            });

            const form = document.getElementById('thoughtForm');
            await saveThought({ preventDefault: jest.fn() });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/dispatches'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': `token ${mockToken}`
                    })
                })
            );
        });

        it('should prompt for token if not available', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            global.prompt = jest.fn().mockReturnValue('new-token');

            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 204
            });

            await saveThought({ preventDefault: jest.fn() });

            expect(global.prompt).toHaveBeenCalled();
            expect(localStorageMock.setItem).toHaveBeenCalledWith('github_token', 'new-token');
        });

        it('should handle API errors gracefully', async () => {
            localStorageMock.getItem.mockReturnValue('test-token');
            global.fetch.mockRejectedValueOnce(new Error('API Error'));

            await saveThought({ preventDefault: jest.fn() });

            expect(global.console.error).toHaveBeenCalled();
        });
    });

    describe('Date Formatting', () => {
        it('should format dates correctly for filenames', () => {
            const date = new Date('2024-03-21T12:00:00.000Z');
            const filename = formatDateTimeForFilename(date);
            expect(filename).toMatch(/^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/);
        });

        it('should format dates correctly for display', () => {
            const dateString = '2024-03-21T12:00:00.000Z';
            const formatted = formatDateForDisplay(dateString);
            expect(formatted).toContain('2024');
            expect(formatted).toContain('March');
        });
    });

    describe('Thought Card Creation', () => {
        it('should create thought cards with correct structure', () => {
            const thought = {
                title: 'Test Title',
                date: '2024-03-21T12:00:00.000Z',
                filename: 'test.md',
                preview: 'Test preview'
            };

            const card = createThoughtCard(thought);
            expect(card).toContain('Test Title');
            expect(card).toContain('Test preview');
            expect(card).toContain('test.md');
        });
    });
}); 