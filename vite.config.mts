import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
// import { terser } from 'vite-plugin-terser'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FrontTrackerSdk',
      fileName: (format) => {
        const formatsMap = {
          es: `esm/front-tracker-sdk.js`,
          umd: `umd/front-tracker-sdk.js`,
        }
        return formatsMap[format]
      },
    },
    rollupOptions: {
      external: [],
      output: [
        // ES 模块（未压缩）
        {
          format: 'es',
          entryFileNames: `esm/front-tracker-sdk.js`,
          preserveModules: false,
        },
        // // ES 模块（压缩）
        // {
        //   format: 'es',
        //   entryFileNames: `esm/front-tracker-sdk.v${version}.min.js`,
        //   plugins: [terser()],
        // },
        // UMD 格式（未压缩）
        {
          format: 'umd',
          name: 'MyLib',
          entryFileNames: `umd/front-tracker-sdk.js`,
        },
        // // UMD 格式（压缩）
        // {
        //   format: 'umd',
        //   name: 'MyLib',
        //   entryFileNames: `umd/front-tracker-sdk.v${version}.min.js`,
        //   plugins: [terser()],
        // },
      ],
    },
  },
  // 添加 server 配置项
  server: {
    open: true
  },
})

