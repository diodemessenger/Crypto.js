// SOFTWARE LICENSE AGREEMENT FOR DIODE.JS, DIODE.WASM, AND ALL CODE ON DIODEMESSENGER.COM
// IMPORTANT: Each user should review this license before using the software components. 

// 1. DEFINITIONS
// The "Software" refers specifically to certain components and all associated code from a specific domain.
// This ensures clarity on what is being licensed.
// "Software" refers to the Diode.js, Diode.wasm components, and all code retrieved from the domain diodemessenger.com, intended for use solely as part of the chat messenger application developed by Diode Messenger.

// 2. LICENSE
// This section details the legal binding of the agreement and the requirement of agreement for software use.
// By accessing, installing, or using the Software, you acknowledge that this End User License Agreement (EULA) is a legally binding and valid contract and agree to be bound by its terms. If you do not agree to abide by the terms of this Agreement, you are not authorized to use or distribute the Software.

// 3. LICENSE GRANT
// This section specifies the conditions under which the software can be used. Restrictive licensing is often used to prevent unauthorized use or resale.
// Diode Messenger grants you a non-exclusive, non-transferable license to install and use the Software solely as part of the chat messenger application developed by Diode Messenger. Any other use, modification, copying, reproduction, distribution, or resale of the Software, separate from the chat messenger application, is strictly prohibited.

// 4. OWNERSHIP
// This section ensures that the licensor retains all ownership rights, even when granting a license to use the software.
// The Software is owned and copyrighted by Diode Messenger. Your license confers no title or ownership in the Software and is not a sale of any rights in the Software.

// 5. COPYRIGHT
// Explicitly points out that the software is protected by copyright and other intellectual property rights.
// The Software contains copyrighted material, trade secrets, and other proprietary material. You shall not violate any applicable copyright, trademark, or other intellectual property laws or regulations.

// 6. NO WARRANTIES
// A common clause that explicitly states there are no guarantees with the software, limiting potential liability.
// Diode Messenger expressly disclaims any warranty for the Software. The Software is provided 'As Is' without any express or implied warranty of any kind.

// 7. LIMITATION OF LIABILITY
// This clause is used to limit the amount and types of damages the licensor can be held responsible for.
// In no event shall Diode Messenger or its suppliers be liable for any damages whatsoever (including, without limitation, damages for loss of business profits, business interruption, loss of business information, or any other pecuniary loss) arising out of the use or inability to use the Software, even if Diode Messenger has been advised of the possibility of such damages.

// 8. SUBJECT TO CHANGE
// This clause indicates the software's evolving nature, potentially open-sourcing some components in the future.
// This license and the availability of parts of the Software are subject to change. Upon the full release of the chat messenger application, certain parts of the Software may be open-sourced to promote security and provability.

// 9. TERMINATION
// This clause details how the license can be terminated if terms are breached, ensuring control over misuse.
// This Agreement will terminate automatically if you fail to comply with the limitations described in this Agreement. On termination, you must destroy all copies of the Software.

// 10. GOVERNING LAW
// Indicates which country's laws will govern the agreement. It's vital for dispute resolution.
// This Agreement shall be governed by the laws of the United Kingdom.

// 11. ENTIRE AGREEMENT
// Specifies that this agreement is the complete understanding between the parties, which can prevent claims of additional implied terms.
// This is the entire agreement between you and Diode Messenger which supersedes any prior agreement or understanding, whether written or oral, relating to the subject matter of this license.

// By using the software, the user agrees to all these terms.
// By installing or using the Software, you agree to be bound by the terms of this Agreement.

// The official entity behind the software and the date this license is in effect.
// Diode Messenger

// 2023-08-16

// -- END OF SOFTWARE LICENSE AGREEMENT -- //

function DiodeCrypto(){
  var crypto = this;

  crypto.isReady = false;
  crypto.Module = null;
  crypto.onInit = []

  window.dcrypto = this;

  crypto.ready = (module) => {
      crypto.Module = module;
      crypto.isReady = true;
      //console.log("DiodeCrypto has been loaded")
  }

  crypto.registerInit = (callback) => {
    crypto.onInit.push(callback);
  }

  Module['onRuntimeInitialized'] = function() {
      window.DiodeCrypto.ready(Module);
      for (let i = 0; i < crypto.onInit.length; i++) {
        crypto.onInit[i]()
      }
  }

  const base64ToUInt8Array = b64 => Uint8Array.from(window.atob(b64), c => c.charCodeAt(0));
  const textToUInt8Array = s => new TextEncoder().encode(s);
  const UInt8ArrayToString = u8 => String.fromCharCode.apply(null, u8);
  const UInt8ArrayToBase64 = u8 => window.btoa(UInt8ArrayToString(u8));

  crypto.gen_mceliece460896f = () => {
      return new Promise(function (resolve, reject) {
          if(!crypto.isReady){
              reject('Crypto function called before library loaded.')
          }

          console.log("McElice gen finished")

          var public_key, private_key;

          var mc_pub_key_pt_pt = crypto.Module._malloc(4);
          var mc_prv_key_pt_pt = crypto.Module._malloc(4);

          var rc = crypto.Module.__diode_mceliece460896f_Keygen(mc_pub_key_pt_pt, null, mc_prv_key_pt_pt, null)

          public_key = `${crypto.Module.UTF8ToString(crypto.Module.getValue(mc_pub_key_pt_pt, "i32"))}`
          private_key = `${crypto.Module.UTF8ToString(crypto.Module.getValue(mc_prv_key_pt_pt, "i32"))}`

          crypto.Module._free(crypto.Module.getValue(mc_pub_key_pt_pt, "i32"));
          crypto.Module._free(crypto.Module.getValue(mc_prv_key_pt_pt, "i32"));

          crypto.Module._free(mc_pub_key_pt_pt);
          crypto.Module._free(mc_prv_key_pt_pt);

          if(rc != 0){
              throw("Returned non 0 value");
              return;
          }

          resolve({
              pub: public_key,
              priv: private_key
          })
      });
  }

  crypto.encap_mceliece460896f = (public_key) => {
      return new Promise(function (resolve, reject) {

          console.log("McElice encapsulate finished")

          if(!crypto.isReady){
              reject('Crypto function called before library loaded.')
          }

          var ciphertext, shared_secret;

          var mc_pub_key_pt_pt = allocateUTF8(public_key);

          var mc_shared_secret_pt_pt = Module._malloc(4);
          var mc_ciphertext_pt_pt = Module._malloc(4);

          var rc = Module.__diode_mceliece460896f_encapsulate(mc_pub_key_pt_pt, 0, mc_ciphertext_pt_pt, null, mc_shared_secret_pt_pt, null);

          ciphertext = `${crypto.Module.UTF8ToString(crypto.Module.getValue(mc_ciphertext_pt_pt, "i32"))}`
          shared_secret = `${crypto.Module.UTF8ToString(crypto.Module.getValue(mc_shared_secret_pt_pt, "i32"))}`

          Module._free(mc_pub_key_pt_pt, "i32");
          Module._free(Module.getValue(mc_shared_secret_pt_pt, "i32"));
          Module._free(Module.getValue(mc_ciphertext_pt_pt, "i32"));

          Module._free(mc_shared_secret_pt_pt);
          Module._free(mc_ciphertext_pt_pt);

          if(rc != 0){
              throw("Returned non 0 value");
              return;
          }

          resolve({
              cipher: ciphertext,
              secret: shared_secret
          })
      });
  }

  crypto.decap_mceliece460896f = (priv, cipher) => {
      return new Promise(function (resolve, reject) {

          console.log("McElice decap finished")

          if(!crypto.isReady){
              reject('Crypto function called before library loaded.')
          }

          var ss;

          var mc_priv_key_pt_pt = allocateUTF8(priv);
          var mc_cipher_key_pt_pt = allocateUTF8(cipher);

          var ss_pt_pt = crypto.Module._malloc(4);

          var rc = Module.__diode_mceliece460896f_decapsulate(mc_priv_key_pt_pt, 0, mc_cipher_key_pt_pt, null, ss_pt_pt, null);

          ss = `${crypto.Module.UTF8ToString(crypto.Module.getValue(ss_pt_pt, "i32"))}`

          Module._free(mc_priv_key_pt_pt, "i32");
          Module._free(mc_cipher_key_pt_pt, "i32");
          Module._free(Module.getValue(ss_pt_pt, "i32"));

          if(rc != 0){
              throw("Returned non 0 value");
              return;
          }

          resolve({
              shared_secret: ss
          })
      });
  }

  crypto.gen_RSA = () => {
      return new Promise(function (resolve, reject) {
          if(!crypto.isReady){
              reject('Crypto function called before library loaded.')
          }

          console.log("RSA gen finished")

          var n_pt_pt = crypto.Module._malloc(4);
          var e_pt_pt = crypto.Module._malloc(4);
          var d_pt_pt = crypto.Module._malloc(4);

          var rc = crypto.Module.__diode_RSA_Keygen(
              n_pt_pt,
              null, 
              e_pt_pt, 
              null,
              d_pt_pt, 
              null,

              null,
              null,
              1024,
              2,
              65537
          )

          rsa_n = `${crypto.Module.UTF8ToString(crypto.Module.getValue(n_pt_pt, "i32"))}`
          rsa_e = `${crypto.Module.UTF8ToString(crypto.Module.getValue(e_pt_pt, "i32"))}`
          rsa_d = `${crypto.Module.UTF8ToString(crypto.Module.getValue(d_pt_pt, "i32"))}`

          crypto.Module._free(crypto.Module.getValue(n_pt_pt, "i32"));
          crypto.Module._free(crypto.Module.getValue(e_pt_pt, "i32"));
          crypto.Module._free(crypto.Module.getValue(d_pt_pt, "i32"));

          if(rc != 0){
              throw("Returned non 0 value");
              return;
          }

          resolve({
             pub: {
              n: rsa_n,
              e: rsa_e
             },
             priv: {
              n: rsa_n,
              e: rsa_e,
              d: rsa_d
             }
          })
      });
  }

  crypto.encap_RSA = (pub_key) => {
      return new Promise(function (resolve, reject) {
          if(!crypto.isReady){
              reject('Crypto function called before library loaded.')
          }

          console.log("RSA encap finished")

          var n_pt_pt = allocateUTF8(pub_key.n);
          var e_pt_pt = allocateUTF8(pub_key.e);

          var rsa_ciphertext_pt_pt = Module._malloc(4);
          var rsa_shared_secret_pt_pt = Module._malloc(4);

          var rc = crypto.Module.__diode_RSA_encapsulate(
              n_pt_pt,
              null, 
              e_pt_pt, 
              null,
              rsa_ciphertext_pt_pt,
              null,
              rsa_shared_secret_pt_pt,
              null
          )

          ciphertext = `${crypto.Module.UTF8ToString(crypto.Module.getValue(rsa_ciphertext_pt_pt, "i32"))}`
          shared_secret = `${crypto.Module.UTF8ToString(crypto.Module.getValue(rsa_shared_secret_pt_pt, "i32"))}`

          crypto.Module._free(n_pt_pt);
          crypto.Module._free(e_pt_pt);
          crypto.Module._free(crypto.Module.getValue(rsa_ciphertext_pt_pt, "i32"));
          crypto.Module._free(crypto.Module.getValue(rsa_shared_secret_pt_pt, "i32"));

          if(rc != 0){
              throw("Returned non 0 value");
              return;
          }

          resolve({
              cipher: ciphertext,
              secret: shared_secret
          })
      });
  }

  crypto.decap_RSA = (priv, cipher) => {
      return new Promise(function (resolve, reject) {

          console.log("RSA decap finished")

          if(!crypto.isReady){
              reject('Crypto function called before library loaded.')
          }

          var ss;

          var n_pt_pt = allocateUTF8(priv.n);
          var e_pt_pt = allocateUTF8(priv.e);
          var d_pt_pt = allocateUTF8(priv.d);
          var rsa_cipher_key_pt_pt = allocateUTF8(cipher);

          var ss_pt_pt = crypto.Module._malloc(4);

          var rc = Module.__diode_RSA_decapsulate(
                  n_pt_pt,
                  null,
                  e_pt_pt,
                  null,
                  d_pt_pt,
                  null,
                  rsa_cipher_key_pt_pt,
                  null,
                  ss_pt_pt,
                  null
          );

          ss = `${crypto.Module.UTF8ToString(crypto.Module.getValue(ss_pt_pt, "i32"))}`

          Module._free(n_pt_pt, "i32");
          Module._free(e_pt_pt, "i32");
          Module._free(d_pt_pt, "i32");
          Module._free(rsa_cipher_key_pt_pt, "i32");
          Module._free(Module.getValue(ss_pt_pt, "i32"));

          if(rc != 0){
              throw("Returned non 0 value");
              return;
          }

          resolve({
              shared_secret: ss
          })
      });
  }

  crypto.gen_ed25519 = () => {
      return new Promise(function (resolve, reject) {
          if(!crypto.isReady){
              reject('Crypto function called before library loaded.')
          }

          console.log("ED25519 Signature gen finished")

          var public_key, private_key;

          var ed25519_pub_key_pt_pt = crypto.Module._malloc(4);
          var ed25519_prv_key_pt_pt = crypto.Module._malloc(4);

          var rc = crypto.Module.__diode_ED25519_Keygen(ed25519_pub_key_pt_pt, null, ed25519_prv_key_pt_pt, null)

          public_key = `${crypto.Module.UTF8ToString(crypto.Module.getValue(ed25519_pub_key_pt_pt, "i32"))}`
          private_key = `${crypto.Module.UTF8ToString(crypto.Module.getValue(ed25519_prv_key_pt_pt, "i32"))}`

          crypto.Module._free(crypto.Module.getValue(ed25519_pub_key_pt_pt, "i32"));
          crypto.Module._free(crypto.Module.getValue(ed25519_prv_key_pt_pt, "i32"));

          crypto.Module._free(ed25519_pub_key_pt_pt);
          crypto.Module._free(ed25519_prv_key_pt_pt);

          if(rc != 0){
              throw("Returned non 0 value");
              return;
          }

          resolve({
              pub: public_key,
              priv: private_key
          })
      });
  }

  crypto.sign_ed25519 = (message, priv_key) => {
      return new Promise(function (resolve, reject) {
          if(!crypto.isReady){
              reject('Crypto function called before library loaded.')
          }

          console.log("ED25519 Signature signing finished")

          var ed25519_sig;

          var message_pt_pt = allocateUTF8(message);
          var ed25519_priv_pt_pt = allocateUTF8(priv_key);

          var ed25519_sig_pt_pt = crypto.Module._malloc(4);

          var rc = crypto.Module.__diode_SignString_wED25519PrivateBase64Key(
              message_pt_pt,
              0,
              ed25519_priv_pt_pt,
              0,
              ed25519_sig_pt_pt
          )

          ed25519_sig = `${crypto.Module.UTF8ToString(crypto.Module.getValue(ed25519_sig_pt_pt, "i32"))}`

          crypto.Module._free(message_pt_pt);
          crypto.Module._free(ed25519_priv_pt_pt);
          crypto.Module._free(ed25519_sig_pt_pt);

          if(rc != 0){
              throw("Returned non 0 value");
              return;
          }

          resolve({
              sig: ed25519_sig
          })
      });
  }

  crypto.verify_ed25519 = (signature, pub_key, message) => {
      return new Promise(function (resolve, reject) {
          if(!crypto.isReady){
              reject('Crypto function called before library loaded.')
          }

          console.log("ED25519 Signature verify finished")

          var ed25519_sig_pt_pt = allocateUTF8(signature);
          var ed25519_pub_pt_pt = allocateUTF8(pub_key);
          var mesage_pt_pt = allocateUTF8(message);

          var rs = crypto.Module.__diode_VerifySig_wED25519PublicBase64Key(
              ed25519_sig_pt_pt,
              ed25519_pub_pt_pt,
              mesage_pt_pt
          )

          crypto.Module._free(ed25519_sig_pt_pt);
          crypto.Module._free(ed25519_pub_pt_pt);
          crypto.Module._free(mesage_pt_pt);

          resolve({
              verified: (rs == 1)
          })
      });
  }

  crypto.encrypt_aes_ctr = (message, key) => {
      return new Promise(function (resolve, reject) {
          if(!crypto.isReady){
              reject('Crypto function called before library loaded.')
          }

          (async function () {

              let iv = window.crypto.getRandomValues(new Uint8Array(16));

              const key_encoded = await window.crypto.subtle.importKey("raw", base64ToUInt8Array(key), { name: "AES-CTR" }, false, ["encrypt"]);

              const ciphertext = new Uint8Array(await window.crypto.subtle.encrypt(
                  { name: "AES-CTR", counter: iv, length: 128 },
                  key_encoded,
                  textToUInt8Array(JSON.stringify(message)),
              ));

              resolve({
                  n_ct: UInt8ArrayToBase64(iv) + "." + UInt8ArrayToBase64(ciphertext)
              })

          })();
      });
  }

  crypto.decrypt_aes_ctr = (n_ct, key) => {
      return new Promise(function (resolve, reject) {
          if(!crypto.isReady){
              reject('Crypto function called before library loaded.')
          }

          (async function () {

              const nonce = n_ct.split(".")[0]
              const ciphertext = n_ct.split(".")[1]

              const key_encoded = await window.crypto.subtle.importKey("raw", base64ToUInt8Array(key), { name: "AES-CTR" }, false, ["decrypt"]);

              const plaintext = UInt8ArrayToString(
                  new Uint8Array(
                    await window.crypto.subtle.decrypt(
                      {
                        name: "AES-CTR",
                        counter: base64ToUInt8Array(nonce),
                        length: 128
                      },
                      key_encoded,
                      base64ToUInt8Array(ciphertext)
                    )
                  )
              );

              resolve({
                  text: plaintext
              })

          })();
      });
  }
}

window.DiodeCrypto = new DiodeCrypto(Module);

