import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import postcss from 'rollup-plugin-postcss';
import { config } from 'dotenv';

export default {
  input: 'packages/widget/Chatbot.tsx',
  output: {
    file: 'dist/makerkit-chatbot.js',
    format: 'iife',
    sourcemap: false,
    inlineDynamicImports: true,
    globals: {
      'react/jsx-runtime': 'jsxRuntime',
      'react-dom/client': 'ReactDOM',
      'react': 'React'
    }
  },
  plugins: [
    tsConfigPaths({
      tsConfigPath: './tsconfig.json'
    }),
    replace({ preventAssignment: true }),
    typescript(),
    nodeResolve({ extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'] }),
    babel({
      babelHelpers: 'bundled',
      presets: [
        ['@babel/preset-react', {
          runtime: 'automatic',
          'targets': '>0.2%, not dead, not op_mini all'
        }]
      ],
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    postcss({
      config: {
        path: './postcss.config.js'
      },
      extensions: ['.css'],
      minimize: true,
      extract: true,
      inject: {
        insertAt: 'top'
      }
    }),
    commonjs(),
    injectProcessEnv(config({
      path: './packages/widget/.env.production'
    }).parsed),
    terser({
      ecma: 2020,
      mangle: { toplevel: true },
      compress: {
        module: true,
        toplevel: true,
        unsafe_arrows: true,
        drop_console: true,
        drop_debugger: true
      },
      output: { quote_style: 1 }
    })
  ]
};