const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix: Metro 0.83 + Hermes ESM interop breaks bare require() of `export default` modules.
//
// Loading chain:
//   @expo/metro-runtime/src/index.ts
//     → effects.native.ts  (require('./messageSocket'))
//       → messageSocket.native.ts
//           const getDevServer = require('react-native/Libraries/Core/Devtools/getDevServer');
//           getDevServer()          // TypeError: not a function (it is Object)
//           new WebSocket(...)      // TypeError: constructor is not callable
//
// Fix: intercept require('./messageSocket') ONLY when coming from @expo/metro-runtime,
// and redirect to a shim that properly unwraps ESM default exports before calling.

// Packages that must be deduplicated to a single instance across the monorepo.
const REACT_PACKAGES = new Set(['react', 'react-dom', 'react-native', 'react/jsx-runtime', 'react/jsx-dev-runtime']);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Deduplicate React: always resolve to the copy inside apps/mobile to prevent
  // "older version of React" errors caused by multiple instances in a monorepo.
  if (REACT_PACKAGES.has(moduleName)) {
    return context.resolveRequest(
      { ...context, originModulePath: __filename },
      moduleName,
      platform,
    );
  }

  const origin = context.originModulePath ?? '';

  // Intercept messageSocket only from within @expo/metro-runtime
  if (
    (moduleName === './messageSocket' || moduleName === './messageSocket.native') &&
    origin.includes('@expo/metro-runtime')
  ) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'shims/messageSocket.native.js'),
    };
  }

  // ws: not needed in RN (native WebSocket is available globally)
  if (moduleName === 'ws') {
    return { type: 'empty' };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
