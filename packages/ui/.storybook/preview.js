import React from 'react';

import { ThemeProvider } from '../src/context/ThemeContext';
import UchimiseTheme from './theme';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    docs: {
      theme: UchimiseTheme,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FAEEDA' },
        { name: 'dark',  value: '#120A00' },
      ],
    },
  },
  decorators: [
    (Story, context) => {
      const bg = context.globals?.backgrounds?.value ?? context.parameters?.backgrounds?.default;
      const isDark = bg === '#120A00';
      return React.createElement(
        ThemeProvider,
        { isDark },
        React.createElement(Story),
      );
    },
  ],
};

export default preview;
