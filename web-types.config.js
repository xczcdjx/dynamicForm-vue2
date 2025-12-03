const pkg = require('./package.json')

/** @type {import('vue-docgen-web-types').WebTypesBuilderConfig} */
module.exports = {
    cwd: __dirname,

    // 组件所在根目录
    componentsRoot: 'src',

    // 只扫你真正要导出的组件文件
    components: [
        'origin/**/*.tsx',     // DynamicInput.tsx 在这里
        // 'components/**/*.vue'  // 如果还有别的 .vue 组件
    ],

    // 输出到 dist/web-types.json
    outFile: 'dist/web-types.json',

    packageName: pkg.name,
    packageVersion: pkg.version,
    descriptionMarkup: 'markdown',
    typesSyntax: 'typescript',

    apiOptions: {
        jsx: true,                // 你用 TSX 必须打开
        tsConfigPath: './tsconfig.json'
    }
}
