import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const config = {
  input: 'src/index.ts',
  output: {
    esModule: true,
    dir: 'dist',
    format: 'es'
  },
  plugins: [
    typescript(),
    json(),
    nodeResolve({ preferBuiltins: true }),
    commonjs()
  ]
}

export default config
