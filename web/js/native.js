// Talks to the Android app (JiaBridge.kt) when running inside it; falls back gracefully in a browser.

const bridge = window.JiaNative;

export const isAndroid = !!bridge;

export function nativeGameIds() {
  if (!bridge) return [];
  try {
    return JSON.parse(bridge.nativeGames());
  } catch {
    return [];
  }
}

export function launchNativeGame(id) {
  return bridge ? bridge.launchNativeGame(id) : false;
}

/** Save a PNG data URL to the phone gallery, or download it in a browser. */
export function saveImageToDevice(dataUrl, fileName) {
  if (bridge) return bridge.saveImageToGallery(dataUrl, fileName);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName + '.png';
  link.click();
  return true;
}

/** Save a text file (e.g. the Markdown progress report) to Download/JiaGames, or download it in a browser. */
export function saveTextToDevice(fileName, text, mimeType = 'text/markdown', { download = true } = {}) {
  if (bridge) return bridge.saveTextFile(fileName, text, mimeType);
  if (!download) return false;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([text], { type: mimeType }));
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  return true;
}
