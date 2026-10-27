import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'

// Keep the named entry when building only Element UI, so its files stay in dist/elementUi.
const input = process.env.BUILD_TARGET === 'elementUi'
    ? { elementUi: 'src/elementUi/index.ts' }
    : { index: 'src/index.ts', elementUi: 'src/elementUi/index.ts' }

const external = [
    'vue',
    'element-ui',
    /^element-ui\//,
    /@babel\/runtime/
]

export default {
    input,

    external,

    output: [
        {
            dir: 'dist',
            format: 'esm',
            entryFileNames: (chunkInfo) => {
                return chunkInfo.name === 'index'
                    ? 'index.mjs'
                    : '[name]/index.mjs'
            },
            chunkFileNames: 'chunks/[name]-[hash].mjs',
            sourcemap: false
        },
        {
            dir: 'dist',
            format: 'cjs',
            entryFileNames: (chunkInfo) => {
                return chunkInfo.name === 'index'
                    ? 'index.cjs'
                    : '[name]/index.cjs'
            },
            chunkFileNames: 'chunks/[name]-[hash].cjs',
            exports: 'named',
            sourcemap: false
        }
    ],

    plugins: [
        resolve({
            extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.vue']
        }),

        commonjs(),

        vue({
            css: true,
            compileTemplate: true
        }),

        postcss({
            extensions: ['.css', '.less'],
            extract: true,
            minimize: true,
            use: {
                less: {}
            }
        }),

        typescript({
            tsconfig: './tsconfig.build.json',
            useTsconfigDeclarationDir: true,
            clean: true,
            tsconfigOverride: {
                compilerOptions: {
                    jsx: 'preserve'
                }
            }
        }),

        babel({
            babelHelpers: 'runtime',
            babelrc: false,
            configFile: false,
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            ie: '11'
                        },
                        modules: false
                    }
                ],
                [
                    '@vue/babel-preset-jsx'
                ]
            ],
            plugins: [
                [
                    '@babel/plugin-transform-runtime',
                    {
                        helpers: true,
                        regenerator: false,
                        useESModules: false,
                        absoluteRuntime: false
                    }
                ]
            ],
            exclude: 'node_modules/**'
        }),

        terser()
    ]
}