// Kid profiles (login). Everything is saved only on this device.
// Passwords are stored as salted SHA-256 hashes - enough to keep siblings out of each
// other's stars, not a real security system.
import { local, uid } from './kit.js';

export function profiles() {
  return local.get('profiles', []);
}

function saveProfiles(list) {
  local.set('profiles', list);
}

export function currentUserId() {
  const id = local.get('currentUser', null);
  return profiles().some((p) => p.id === id) ? id : null;
}

export function currentProfile() {
  const id = currentUserId();
  return profiles().find((p) => p.id === id) || null;
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(salt + ':' + password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function findByName(name) {
  const key = name.trim().toLowerCase();
  return profiles().find((p) => p.name.toLowerCase() === key) || null;
}

/** Creates a profile and signs it in. Throws an Error with a kid-friendly message on problems. */
export async function createProfile({ name, password, photo }) {
  const cleanName = name.trim();
  if (cleanName.length < 2) throw new Error('Your name needs at least 2 letters.');
  if (cleanName.length > 20) throw new Error('Your name is too long (20 letters max).');
  if (findByName(cleanName)) throw new Error('That name is taken. Try another one!');
  if (password.length < 4) throw new Error('Your password needs at least 4 letters or numbers.');
  const salt = uid();
  const profile = { id: uid(), name: cleanName, photo: photo || null, salt, hash: await hashPassword(password, salt), createdAt: new Date().toISOString() };
  saveProfiles([...profiles(), profile]);
  local.set('currentUser', profile.id);
  return profile;
}

export async function signIn(profileId, password) {
  const profile = profiles().find((p) => p.id === profileId);
  if (!profile) return false;
  if ((await hashPassword(password, profile.salt)) !== profile.hash) return false;
  local.set('currentUser', profile.id);
  return true;
}

export function signOut() {
  local.set('currentUser', null);
}

export async function resetPassword(profileId, newPassword) {
  if (newPassword.length < 4) throw new Error('The password needs at least 4 letters or numbers.');
  const salt = uid();
  const hash = await hashPassword(newPassword, salt);
  saveProfiles(profiles().map((p) => (p.id === profileId ? { ...p, salt, hash } : p)));
}

export function updatePhoto(profileId, photo) {
  saveProfiles(profiles().map((p) => (p.id === profileId ? { ...p, photo } : p)));
}

export function deleteProfile(profileId) {
  saveProfiles(profiles().filter((p) => p.id !== profileId));
  if (local.get('currentUser', null) === profileId) signOut();
}

/** App logo chosen by a grown-up (data URL) or null for the default mascot. */
export function appLogo() {
  return local.get('appLogo', null);
}

export function setAppLogo(dataUrl) {
  local.set('appLogo', dataUrl);
  window.dispatchEvent(new CustomEvent('jia:logo'));
}

/**
 * Read an image file and shrink it to fit `size` pixels.
 * mode 'cover' crops to a square (profile photos); 'contain' keeps the shape (logos).
 */
export function readImageFile(file, size = 256, mode = 'cover') {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please choose a picture.'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (mode === 'cover') {
        const side = Math.min(img.width, img.height);
        canvas.width = canvas.height = size;
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } else {
        const scale = Math.min(1, size / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That picture could not be opened.'));
    };
    img.src = url;
  });
}
