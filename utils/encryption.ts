export function getMessageEncoding(message: string) {
  const enc = new TextEncoder();
  return enc.encode(message);
}

export function _arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64: string) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptMessage(
  message: string,
  key: ArrayBuffer,
  iv: Uint8Array,

): Promise<string> {
  if (!message) return "";

  const encoded = getMessageEncoding(message);
  // iv will be needed for decryption
  const ekey = await crypto.subtle.importKey(
    "raw", // Format of the key data
    key, // The key data as an ArrayBuffer
    { name: "AES-GCM" }, // The algorithm you intend to use (adjust as needed)
    false, // Whether the key is extractable
    ["encrypt"] // Key usages (adjust as needed)
  );
  const encryptedmsg = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    ekey,
    encoded,
    
  );

  return _arrayBufferToBase64(encryptedmsg);
}

export async function decryptMessage(
  key: ArrayBuffer,
  ciphertext: any,
  iv: Uint8Array
) {
  if (!ciphertext) return "";
  const ekey = await crypto.subtle.importKey(
    "raw", // Format of the key data
    key, // The key data as an ArrayBuffer
    { name: "AES-GCM" }, // The algorithm you intend to use (adjust as needed)
    false, // Whether the key is extractable
    ["decrypt"] // Key usages (adjust as needed)
  );
  // The iv value is the same as that used for encryption
  ciphertext = base64ToArrayBuffer(ciphertext);
  const textDecoder = new TextDecoder("utf-8"); // You can specify the encoding, such as 'utf-8'

  ciphertext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    ekey,
    ciphertext
  );
  ciphertext = textDecoder.decode(ciphertext);
  return ciphertext;

}

// Convert a string to an ArrayBuffer
export function textToArrayBuffer(text: string) {
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

// Calculate SHA-256 hash using the Web Crypto API
export async function sha256Hash(buffer: ArrayBuffer) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
