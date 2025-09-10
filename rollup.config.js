import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";

// 配置选项数组 - 修复导出模式不匹配问题
const outputConfigs = [
  {
    // CommonJS 模块（供 Node.js 或 Webpack 等使用）
    file: "dist/index.common.js",
    format: "cjs",
    exports: "named" // 关键修改：使用 named 支持多命名导出
  },
  {
    // ESM 模块（供现代浏览器/打包工具使用）
    file: "dist/index.esm.js",
    format: "es",
    exports: "named" // 保持 named 与代码导出方式一致
  },
  {
    // UMD 模块（浏览器直接引入）
    file: "dist/index.js",
    format: "umd",
    name: "AdvancedDownloader", // 全局变量名，建议与包名关联
    exports: "named" // 关键修改：UMD 也使用 named 避免默认导出冲突
  }
];

export default outputConfigs.map(config => ({
  input: "src/index.ts",
  output: {
    ...config,
    sourcemap: false // 生产环境关闭 sourcemap，避免暴露源码结构
  },
  plugins: [
    // TypeScript 编译配置
    typescript({
      tsconfig: "tsconfig.json", // 显式指定配置文件
      clean: true, // 每次构建清理缓存，确保类型声明最新
      useTsconfigDeclarationDir: true // 尊重 tsconfig 中的 declarationDir 配置
    }),
    resolve({
      browser: true // 针对浏览器环境优化依赖解析
    }),
    commonjs(), // 转换第三方 CommonJS 模块为 ESM
    terser({
      compress: {
        drop_console: true // 移除 console 语句，减小包体积
      }
    })
  ]
}));
