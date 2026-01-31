// Stub for browser build; SDK utils use it but we only use Blob (no ZgFile).
export default {
  existsSync: () => false,
  lstatSync: () => ({ isDirectory: () => false }),
};
