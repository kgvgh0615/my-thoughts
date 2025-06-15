describe('Thought Management', () => {
    // Load the main.js file
    require('../js/main.js');

    describe('loadThoughts', () => {
        it('should display thoughts when index.json is available', async () => {
            const mockThoughts = [{
                title: 'Test Thought',
                preview: 'Test Content',
                filename: '2024-02-20-test-thought.md'
            }];
            
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockThoughts)
            });

            await loadThoughts();
            
            const thoughtsGrid = document.querySelector('.thoughts-grid');
            expect(thoughtsGrid.innerHTML).toContain('Test Thought');
            expect(thoughtsGrid.innerHTML).toContain('Test Content');
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
                .mockRejectedValueOnce(new Error('404'))
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve([])
                });

            await loadThoughts();
            
            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.console.warn).toHaveBeenCalledWith('Retrying load thoughts...');
        });
    });

    describe('saveThought', () => {
        it('should save a new thought successfully', async () => {
            const mockToken = 'test-token';
            localStorageMock.getItem.mockReturnValue(mockToken);
            
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ message: 'Success' })
            });

            await saveThought('Test Title', 'Test Content');
            
            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.github.com/repos/sagar-2007/my-thoughts/dispatches',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    })
                })
            );
        });

        it('should prompt for token if not available', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            global.prompt.mockReturnValue('new-token');
            
            await saveThought('Test Title', 'Test Content');
            
            expect(global.prompt).toHaveBeenCalled();
            expect(localStorageMock.setItem).toHaveBeenCalledWith('github_token', 'new-token');
        });

        it('should handle API errors gracefully', async () => {
            localStorageMock.getItem.mockReturnValue('test-token');
            global.fetch.mockRejectedValueOnce(new Error('API Error'));
            
            await saveThought('Test Title', 'Test Content');
            
            expect(global.console.error).toHaveBeenCalled();
        });
    });

    describe('Date Formatting', () => {
        it('should format date correctly for filename', () => {
            const date = new Date('2024-02-20T12:00:00Z');
            const formatted = formatDateForFilename(date);
            expect(formatted).toBe('2024-02-20');
        });

        it('should format date correctly for display', () => {
            const date = new Date('2024-02-20T12:00:00Z');
            const formatted = formatDateForDisplay(date);
            expect(formatted).toMatch(/February 20, 2024/);
        });
    });

    describe('Thought Card Creation', () => {
        it('should create thought card with correct structure', () => {
            const thought = {
                title: 'Test Thought',
                preview: 'Test Content',
                filename: '2024-02-20-test-thought.md'
            };
            
            const card = createThoughtCard(thought);
            
            expect(card.querySelector('h2').textContent).toBe('Test Thought');
            expect(card.querySelector('p').textContent).toBe('Test Content');
            expect(card.querySelector('small').textContent).toContain('February 20, 2024');
        });
    });
}); 