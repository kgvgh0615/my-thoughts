// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock console methods
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Reset all mocks before each test
beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    global.fetch.mockClear();
    global.console.log.mockClear();
    global.console.error.mockClear();
    global.console.warn.mockClear();
    global.console.info.mockClear();
    
    // Reset DOM
    document.body.innerHTML = `
        <div class="thoughts-grid"></div>
        <form id="thoughtForm">
            <input type="text" id="thoughtTitle" value="Test Title">
            <textarea id="thoughtContent">Test Content</textarea>
        </form>
    `;
}); 