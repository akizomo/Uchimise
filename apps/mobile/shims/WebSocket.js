'use strict';
// CJS shim for react-native/Libraries/WebSocket/WebSocket
// Avoids circular require by using the global WebSocket that React Native exposes.
// The global is set up by RN's bootstrap before any user module runs.
module.exports = globalThis.WebSocket;
module.exports.default = globalThis.WebSocket;
