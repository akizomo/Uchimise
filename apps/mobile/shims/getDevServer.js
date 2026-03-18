'use strict';
// CJS shim for react-native/Libraries/Core/Devtools/getDevServer
//
// Root cause: @expo/metro-runtime@4.0.1 does:
//   const getDevServer = require('react-native/Libraries/Core/Devtools/getDevServer');
//   const devServer = getDevServer();   // <-- crashes if require() returns ESM module object
//
// Metro 0.83 + Hermes transform returns the whole module object {default:fn, __esModule:true}
// instead of the function itself. This CJS shim ensures require() always returns the function.

const FALLBACK = 'http://localhost:8081/';

let _resolved = false;
let _url = null;
let _fullBundleUrl = null;

function getDevServer() {
  if (!_resolved) {
    _resolved = true;
    try {
      // NativeSourceCode may itself be an ESM module — handle both forms
      const mod = require('react-native/Libraries/NativeModules/specs/NativeSourceCode');
      const NativeSourceCode = mod && mod.__esModule ? mod.default : mod;
      const scriptUrl = NativeSourceCode.getConstants().scriptURL;
      const match = scriptUrl.match(/^https?:\/\/.*?\//);
      _url = match ? match[0] : null;
      _fullBundleUrl = match ? scriptUrl : null;
    } catch (_) {
      // Running in embedded / non-dev environment — use fallback
    }
  }
  return {
    url: _url ?? FALLBACK,
    fullBundleUrl: _fullBundleUrl,
    bundleLoadedFromServer: _url !== null,
  };
}

// Dual export: direct function (for CJS require) + .default (for ESM interop)
module.exports = getDevServer;
module.exports.default = getDevServer;
module.exports.__esModule = false; // prevent Metro from wrapping in {default:...}
