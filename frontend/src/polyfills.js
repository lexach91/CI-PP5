import * as process from 'process';

// (window as any).global = window;
// (window as any).process = process;
// (window as any).Buffer = [];
window.process = process;
window.Buffer = [];
window.global = window;
