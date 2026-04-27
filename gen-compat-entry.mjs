// scripts/gen-compat-entry.mjs
import fs from 'node:fs'

fs.writeFileSync(
    'elementUi.js',
    `module.exports = require('./dist/elementUi/index.cjs')\n`,
    'utf-8'
)

fs.writeFileSync(
    'elementUi.d.ts',
    `export * from './dist/elementUi/index'\n`,
    'utf-8'
)