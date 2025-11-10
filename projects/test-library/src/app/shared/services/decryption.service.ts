import { Injectable } from "@angular/core";
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class DecryptionService {

  constructor() { }

   generateKeyFromToken(token: string): CryptoJS.lib.WordArray {
    const truncatedToken = token.substring(0, 32);
    return CryptoJS.enc.Utf8.parse(truncatedToken);
  }

  decrypt(encryptedData: string, token: string): string {
    try {
    const encryptedBytes = CryptoJS.enc.Base64.parse(encryptedData);
    const key = this.generateKeyFromToken(token);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: encryptedBytes,
    });
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error al desencriptar los datos:', error);
      return 'Error al desencriptar los datos';
    }
  }
}