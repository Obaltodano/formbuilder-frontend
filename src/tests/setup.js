import { vi } from 'vitest';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = vi.fn();

// Mock File and Blob constructors
global.File = class File {
  constructor(chunks, filename, options = {}) {
    this.chunks = chunks;
    this.name = filename;
    this.type = options.type || '';
    this.size = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  }
};

global.Blob = class Blob {
  constructor(chunks, options = {}) {
    this.chunks = chunks;
    this.type = options.type || '';
    this.size = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  }
};

// Mock MediaRecorder
global.MediaRecorder = class MediaRecorder {
  constructor(stream, options = {}) {
    this.stream = stream;
    this.options = options;
    this.state = 'inactive';
    this.ondataavailable = null;
    this.onstop = null;
    this.onerror = null;
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) {
      this.onstop();
    }
  }
};

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: vi.fn(() => [
      { 
        stop: vi.fn(),
        getSettings: vi.fn(() => ({}))
      }
    ])
  })
};

// Mock permissions API
global.navigator.permissions = {
  query: vi.fn().mockResolvedValue({ state: 'granted' })
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }

  observe(element) {
    // Simulate intersection immediately
    setTimeout(() => {
      this.callback([{ isIntersecting: true, target: element }]);
    }, 0);
  }

  unobserve(element) {
    // Mock implementation
  }

  disconnect() {
    // Mock implementation
  }
};

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  drawImage: vi.fn(),
  toBlob: vi.fn((callback) => {
    callback(new Blob(['mock image data'], { type: 'image/jpeg' }));
  })
}));

// Mock video element properties
Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', {
  value: 1280,
  writable: true
});

Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', {
  value: 720,
  writable: true
});

// Mock alert and confirm
global.alert = vi.fn();
global.confirm = vi.fn(() => true);

// Mock window.open
global.open = vi.fn();

// Add custom matchers if needed
expect.extend({
  toBeValidFile(received) {
    const pass = received instanceof File;
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a File instance`,
      pass,
    };
  },
});
