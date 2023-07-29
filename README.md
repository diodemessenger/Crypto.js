A wrapper around RodRod's code to allow functionality for
- ED25519
- McElice KEM
- RSA KEM

This code requires HTTPS, along with the following headers to be present to the web browser
header("Cross-Origin-Embedder-Policy: require-corp");
header("Cross-Origin-Opener-Policy: same-origin");

TODO:
- Add implementation for AES CBC.