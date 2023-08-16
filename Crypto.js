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

