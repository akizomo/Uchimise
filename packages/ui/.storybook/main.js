const path = require('path');

/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: { autodocs: 'tag' },
  /** Alias react-native → react-native-web so RN components render in the browser */
  webpackFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      // Exact match only — prevents react-native/Libraries/... subpaths from being swallowed
      'react-native$': 'react-native-web',
      // react-native-svg Fabric components import this; null it out for web
      'react-native/Libraries/Utilities/codegenNativeComponent': path.resolve(__dirname, 'mocks/codegenNativeComponent.js'),
      // Use react-native-svg web build
      'react-native-svg': 'react-native-svg/lib/commonjs/ReactNativeSVG.web',
      // Use lucide-react (web SVG) instead of lucide-react-native in Storybook
      'lucide-react-native': 'lucide-react',
    };

    // Add babel-loader for TypeScript/TSX — required in this pnpm monorepo setup
    // (Storybook's built-in preset doesn't auto-configure in this environment)
    config.module = config.module ?? { rules: [] };
    config.module.rules = config.module.rules ?? [];
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              ['@babel/preset-env', { targets: { node: 'current' }, modules: false }],
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
            plugins: ['react-native-web'],
          },
        },
      ],
    });

    return config;
  },
};
export default config;
