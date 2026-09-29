// Talks to the Android app (android/.../ui/web/WebAppBridge.kt) when running inside it, and falls
// back gracefully in a browser. Every call returns a Promise.
//
// Android injects `window.JiaNative` via WebViewCompat.addWebMessageListener (only for our own
// origin). Requests are JSON {id, method, args}; replies are {id, ok, result | error}.

const bridge = window.JiaNative;

export const isAndroid = !!bridge;

let nextId = 0;
const pending = new Map();

if (bridge) {
  bridge.addEventListener('message', (event) => {
    let reply;
    try {
      reply = JSON.parse(event.data);
    } catch {
      return;
    }
    const resolve = pending.get(reply.id);
    pending.delete(reply.id);
    resolve?.(reply);
  });
}

/** Calls a native method. Resolves to the result, or `fallback` if it failed or we're in a browser. */
function call(method, args = {}, fallback = null) {
  if (!bridge) return Promise.resolve(fallback);
  return new Promise((resolve) => {
    const id = String(++nextId);
    pending.set(id, (reply) => resolve(reply.ok ? reply.result : fallback));
    bridge.postMessage(JSON.stringify({ id, method, args }));
  });
}

export function nativeGameIds() {
  return call('nativeGames', {}, []);
}

export function launchNativeGame(id) {
  return call('launchNativeGame', { id }, false);
}

/** Save a PNG data URL to the phone's Pictures/JiaGames, or download it in a browser. */
export function saveImageToDevice(dataUrl, fileName) {
  if (bridge) return call('saveImage', { dataUrl, name: fileName }, false);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName + '.png';
  link.click();
  return Promise.resolve(true);
}

/** Save a text file (e.g. the Markdown progress report) to Download/JiaGames, or download it in a browser. */
export function saveTextToDevice(fileName, text, mimeType = 'text/markdown', { download = true } = {}) {
  if (bridge) return call('saveText', { name: fileName, text, mimeType }, false);
  if (!download) return Promise.resolve(false);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([text], { type: mimeType }));
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  return Promise.resolve(true);
}
