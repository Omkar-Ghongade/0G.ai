// Stub so ZgFile.js can be parsed; we only use Blob in browser, never ZgFile.fromFilePath
export function open() {
  return Promise.reject(new Error('fs not available in browser'));
}
