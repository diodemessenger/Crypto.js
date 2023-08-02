A wrapper around RodRod's code to allow functionality for:
- ED25519
- McElice KEM
- RSA KEM

Using built in web features, functionality for:
- AES CTR

This code requires HTTPS, along with the following headers to be present to the web browser

```
    Cross-Origin-Embedder-Policy: require-corp
    Cross-Origin-Opener-Policy: same-origin
```

## Examples

### McEliece

```javascript
DiodeCrypto.gen_mceliece460896f().then((keys) => {

    var public_key = keys.pub;
    var private_key = keys.priv;

    DiodeCrypto.encap_mceliece460896f(keys.pub).then((out) => {

        var cipher = out.cipher;
        var ss1 = out.shared_secret;

        DiodeCrypto.decap_mceliece460896f(keys.priv, cipher).then((out) => {

            var ss2 = out.shared_secret;

        });

    })
})
```

### RSA

```javascript
DiodeCrypto.gen_rsa().then((keys) => {

    var public_key = keys.pub;
    var private_key = keys.priv;

    DiodeCrypto.encap_rsa(keys.pub).then((out) => {

        var cipher = out.cipher
        var ss1 = out.shared_secret

        DiodeCrypto.decap_rsa(keys.priv, cipher).then((out) => {

            var ss2 = out.shared_secret;

        });
    })
});
```

### ED25519

```javascript
DiodeCrypto.gen_ed25519().then((keys) => {

    var public_key = keys.pub;
    var private_key = keys.priv;

    DiodeCrypto.sign_ed25519("Hello World!", keys.priv).then((out) => {

        var signature = out.sig

        DiodeCrypto.verify_ed25519(signature, keys.pub, "Hello World!").then((out) => {

            var isVerified = out.verified;

        })
    })
});
```

