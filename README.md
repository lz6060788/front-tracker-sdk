# front-tracker-sdk
一款插件化的前端埋点sdk



### 安装

```bash
npm install @irises/front-tracker-sdk
```



### 基本使用

```typescript
import { Tracker, JsErrorPlugin, Rporter, performancePlugin, WhiteScreenDetectPlugin, vueErrorPlugin, loggerPlugin, LOGGER_LEVEL } from '@irises/front-tracker-sdk'

// 初始化插件实例
const tracker = Tracker.init({
  appId: 'appId-xxxxxxxx',
  sdkVersion: '1.0.0',
  debug: false,
  userId: 'userId',
  // 传入上报实例，这是该sdk自带的上报模块，也可自行实现，符合接口标准即可
  reporter: new Rporter({
    apiUrl: 'http://localhost:3000/api/report',
  }),
  // 对于不同的埋点上报需求，分别做了不同的插件化，根据需要实例化传入，内置插件也具有一些参数，下文具体介绍
  plugins: [
    new JsErrorPlugin(),
    new performancePlugin(),
    new WhiteScreenDetectPlugin({ delay: 0, autoDetect: false }),
    new vueErrorPlugin(app),
    new loggerPlugin({ loggerLevel: LOGGER_LEVEL.INFO })
  ]
})
```



### Tracker

这是整个埋点`sdk`的骨架，其中需要一些基本配置如下

```typescript
export interface TrackerConfig {
  // 应用id
  appId: string;
  // debug模式会输出一些日志用于排查问题
  debug?: boolean;
  // 可能存在登录状态，对于无登录功能站点可以考虑传入浏览器指纹
  userId?: string;
  // 插件
  plugins?: Array<TrackerPlugin>;
  // 是否为服务端渲染（这一块目前还未完整完成与验证）
  ssr?: boolean;
  // 上报模块
  reporter: TrackerReporter
}
```

进行实例化时，会调用`reporter`和`plugin`的`install`函数进行注册



### reporter

上报模块

#### 基本功能

- 本地缓存
- 具有缓存队列，存在数据时定时上报数据
- 失败时进行重试
- 多种上报数据的方式

#### 基本配置

内置的默认上报模块配置如下：

```typescript
export type ReportorType = 'fetch' | 'image' | 'sendbeacon'

export interface ReporterConfig {
  // 上报方式，目前支持fetch请求、图片请求以及sendbeacon三种方式
  reportType: ReportorType;
  // 上报地址
  apiUrl: string;
  // 为fetch时生效
  apiMethod: 'POST' | 'GET';
  // 该模块上报具有缓存机制，该属性为缓存队列最大长度
  maxQueueLength: number;
  // 上报时间间隔
  timeinterval: number;
  // 当前批次数据失败最大重试次数
  maxRetry: number;
  // 重试时间间隔，重试时会暂停继续上报下一批次，知道成功或者超过最大重试次数
  retryInterval: number;
  // 每一批次上报数据长度
  abatchLength: number;
}
```

默认值如下：

```typescript
export const defaultReporterConfig: Omit<ReporterConfig, 'apiUrl'> = {
  reportType: 'image',
  apiMethod: 'POST',
  maxQueueLength: 200,
  timeinterval: 3000,
  maxRetry: 3,
  retryInterval: 3000,
  abatchLength: 10
}
```

#### 自定义`reporter`

需要满足以下接口条件：

```typescript
export interface TrackerReporter {
  // tracker注册reporter模块时调用，会传入tracker
  install(tracker: Tracker): void;
  // 暴露给tracker用于提交数据的方法
  add(data: ReporterDataType): void;
}

export interface ReporterDataType {
  type: ReportType;
  appId: string;
  sdkVersion: string;
  userId: string;
  data: Record<string, unknown>;
}
```





### plugins

数据采集插件，在`tracker`实例化时会调用其`install方法`，以此完成数据上报，或者通过向`tracker`注册方法、添加属性等方式向外暴露。

#### jsErrorPlugin

用于采集浏览器抛出的基本的报错，包含：常规`js`报错、静态资源加载失败以及未处理的`rejection`。

在实际场景中，由于`dom`加载与`js`执行顺序的问题，页面打开时的静态资源报错可能无法捕捉到，不过这一问题可以在下文的`performancePlugin`插件中解决。

这一插件没有配置参数。

#### performancePlugin

性能采集插件，主要依赖于浏览器的`Performance API`,不同浏览器采集到的数据可能略有差异。

主要采集两类数据：1.性能（performance）指标 2.长任务（`longtask`）数据

1. performance

​	包含数据有：基本页面加载性能指标、资源加载性能指标（页面加载时静态资源获取失败可以从这里体现）、FMP、LCP、CLS、FP、FCP等

1. longtask

​	用于检测页面卡顿，个人认为长任务不一定等于卡顿，这一项数据可以先关闭采集

它的可配置参数及默认值如下：

```typescript
export const defaultPerformancePluginConfig = {
  // 采集静态资源数据
  captureResourceTiming: true,
  // 采集长任务数据
  captureLongTask: true,
  // 采集FP与FCP数据
  capturePaintMetrics: true,
  // 采集CLS数据
  captureLayoutShift: true,
}
```

#### whiteScreenDetectPlugin

白屏检测插件，使用的是简单的屏幕散点采样算法，按均匀的间隔，采集所需要的点的数量，判断屏幕中所在点对应的元素是否合理（如非`body`、`#app`）等

其可配置参数如下：

```typescript
export interface WhiteScreenDetectPluginConfig {
  // 框架dom节点id，被判定为无效元素，默认为["app"],插件中html标签与body标签也被认为是无效
  frameElementIds: string[];
  // 采样点数量
  numSamples: number;
  // 延迟，一个屏幕正常渲染完成的估计值，autoDetect为true时生效
  delay: number;
  // 是否自动检测，若为false，则需要手动触发，调用方式为 tracker.callMethods('handleDetectScreen')
  autoDetect: boolean;
}
```

该插件在完成注册时会向`tracker`注册方法`handleDetectScreen`，因此可以通过```tracker.callMethods('handleDetectScreen')```手动触发该方法

#### vueErrorPlugin

vue报错的插件，在初始化时需要传入`Vue`实例，它会绑定`Vue`实例的`errorHandler`方法，在`vue`抛出错误时对数据进行采集并上报。

需要注意的是，它在绑定`errorHandler`时如果原先以及绑定了一个方法，则上报的同时会调用原方法，避免在插件注册完成后意外的将原先对`vue`报错的处理给擦除了。若在插件注册后，程序又对`Vue`实例的`errorHandler`方法进行绑定，则会导致该插件失效。

#### loggerPlugin

日志采集插件，它的实现时通过返回一个`console`的代理对象实现的，目前支持的方法有：`debug、info、warn、error、table、dir、log`，当调用代理对象的这些方法时会对输出的内容进行采集并上报，其余表现和`console`一致。

可配置参数如下：

```typescript
// 采集的日志等级，高于或等于配置的等级才会被采集
export enum LOGGER_LEVEL {
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4
}

export interface consolePluginConfig {
  // 默认值为 LOGGER_LEVEL.WARN
  loggerLevel: LOGGER_LEVEL
}


// 当前不同方法对应的日志等级
const consoleMthodsLevelMap = {
  debug: LOGGER_LEVEL.DEBUG,
  info: LOGGER_LEVEL.INFO,
  warn: LOGGER_LEVEL.WARN,
  error: LOGGER_LEVEL.ERROR,
  table: LOGGER_LEVEL.INFO,
  dir: LOGGER_LEVEL.INFO,
  log: LOGGER_LEVEL.INFO,
}
```

使用方法：

```typescript
tracker?.logger.log('hello world')
tracker?.logger.table({ a: 1, b: 2 })
```

#### 自定义plugin

仅需完成以下接口的标准：

```typescript
export interface TrackerPlugin {
  tracker: Tracker | null;
  install: (tracker: Tracker) => void;
}

在`tracker`实例化时，会调用插件的`install`方法，需要在这里完成相关处理。

// 数据采集方法如:
declare module 'src/types' {
  export interface ReportTypeExtension {
    vueError: true;
  }
}
this.tracker?.submit('vueError', data);

// 内置的基本类型有：
type ReportType =
  | 'jsError'
  | 'unhandledRejection'
  | 'resourceError'
  | 'xhrError'
  | 'whiteScreen'
  | 'performance'
  | 'longtask'
  | 'logger'
  | 'action'

// 向tracker注册方法如：
this.tracker.registerMethod('handleDetectScreen', this.handleDetectScreen.bind(this));

// 也可以直接向tracker添加属性或方法，但这可能存在兼容问题，如
declare module '../tracker' {
  export interface Tracker {
    logger: Console
  }
}
this.tracker.logger = this.createLogger(console);

```

