// scripts/fix-web-types.mjs
import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
const file = 'dist/web-types.json'

const webTypes = JSON.parse(fs.readFileSync(file, 'utf-8'))

function kebabCase(str) {
    return str.replace(/[A-Z]/g, (s) => '-' + s.toLowerCase())
}

const tags = webTypes?.contributions?.html?.tags || []

for (const tag of tags) {
    // 1. 修复 source，指向 npm 包导出，而不是 src 源码
    tag.source = {
        module: pkg.name,
        symbol: tag.name
    }

    // 2. 修复 props 名称，驼峰转 kebab-case
    if (Array.isArray(tag.attributes)) {
        for (const attr of tag.attributes) {
            if (attr.name !== 'v-model') {
                attr.name = kebabCase(attr.name)
            }
        }
    }

    // 3. 可选：补充 Vue2 v-model 常见事件
    if (Array.isArray(tag.events)) {
        const hasInput = tag.events.some((e) => e.name === 'input')
        if (!hasInput) {
            tag.events.push({ name: 'input' })
        }
    }
}

fs.writeFileSync(file, JSON.stringify(webTypes, null, 2), 'utf-8')
console.log('web-types fixed')