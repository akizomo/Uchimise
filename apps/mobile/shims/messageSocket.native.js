'use strict';
// Shim for @expo/metro-runtime/src/messageSocket.native.ts
//
// This module is loaded very early (before TurboModules are initialized).
// DO NOT call any native module here — even inside try/catch, Invariant Violations
// from TurboModuleRegistry can corrupt the initialization chain in Hermes.
//
// The messageSocket is only used for RSC (React Server Components) hot-reload events.
// It is non-critical for normal HMR — RN's native bridge handles that separately.
// We skip the WebSocket connection entirely to avoid the PlatformConstants error.

// No-op: RSC reload listener setup is skipped in this environment.
// Normal fast-refresh/HMR continues to work via RN's native WebSocket channel.
