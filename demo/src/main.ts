// demo/src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { Tracker, JsErrorPlugin, Rporter, performancePlugin, WhiteScreenDetectPlugin, vueErrorPlugin, loggerPlugin, LOGGER_LEVEL } from '../../src/index'

const app = createApp(App)

const tracker = Tracker.init({
  appId: 'appId-xxxxxxxx',
  sdkVersion: '1.0.0',
  debug: false,
  userId: 'userId',
  reporter: new Rporter({
    apiUrl: 'http://localhost:3000/api/report',
    reportType: 'fetch'
  }),
  plugins: [
    new JsErrorPlugin(),
    new performancePlugin(),
    new WhiteScreenDetectPlugin({ delay: 0, autoDetect: false }),
    new vueErrorPlugin(app),
    new loggerPlugin({ loggerLevel: LOGGER_LEVEL.INFO })
  ]
})

tracker?.logger.log('hello world')
tracker?.logger.table({ a: 1, b: 2 })

app.mount('#app');

