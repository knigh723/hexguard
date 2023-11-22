import { hash, Argon2BrowserHashResult, ArgonType } from "argon2-browser";
import { randomBytes,pbkdf2Sync} from "crypto";
import hkdf from "futoin-hkdf";

let id: string;

export async function genAccountUnlockKey(
  payload: string,
  salt: string
): Promise<Buffer | null> {
  try {
    let masterHash: Argon2BrowserHashResult = await hash({
      pass: payload,
      salt: salt,
      hashLen: 64,
      type: ArgonType.Argon2id,
      mem: 102400, // takes about 9s to compute the hash proportional to memory size
      time: 10,
    });
    return Buffer.from(masterHash.hash);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function genSecretKey(id=''): Promise<[string, string] | null> {
  try {
    if(!id){
      const res = await fetch("/api/gen", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const userid = await res.json();
      id = userid.accountid;
    }    
    const Key = randomBytes(32);
    const secretKey = Buffer.concat([
      Key,
      Buffer.from(id, "utf-8"),
    ]).toString("hex");
    return [secretKey, id];
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function deriveAesKeyWithHKDF(inputKeyingMaterial:string, keyLength = 32, info = ''):ArrayBuffer {
  // Generate a random salt

  // Derive the AES key using HKDF
  const derivedKey = pbkdf2Sync(
    inputKeyingMaterial,
    '',
    1, // Only 1 iteration, as HKDF is essentially a key expansion function
    keyLength, // Desired key length in bytes (e.g., 16 for AES-128, 32 for AES-256)
    'sha256' // You can adjust the hash algorithm as needed
  );

  return derivedKey;
}


