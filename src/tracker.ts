import { ReportType, TrackerConfig, TrackerReporter } from './types'


export class Tracker {
  private appId: TrackerConfig['appId'];
  private userId: TrackerConfig['userId'];
  private sdkVersion: TrackerConfig['sdkVersion'];
  private reporter: TrackerReporter;
  public debug: TrackerConfig['debug'];
  public ssr: TrackerConfig['ssr'];

  private plugins: TrackerConfig['plugins'];

  private provideMethods: Map<string, (...args: any[]) => void> = new Map();

  private static _instance: Tracker;
  constructor(options: TrackerConfig) {
    this.appId = options.appId;
    this.userId = options.userId;
    this.sdkVersion = options.sdkVersion;
    this.debug = options.debug || false;
    this.ssr = options.ssr || false;
    this.reporter = options.reporter;
    this.reporter.install(this);

    this.plugins = options.plugins || [];
    this.plugins.forEach(plugin => {
      plugin.tracker = this;
      plugin.install(this);
    });
  }

  static init(options: TrackerConfig) {{
    try {
      if (Tracker._instance) {
        return Tracker._instance;
      }
      Tracker._instance = new Tracker(options);
      return Tracker._instance;
    } catch (error) {
      console.error('[Tracker] 初始化失败', error);
      return null;
    }
  }}

  private get baseInfo () {
    return {
      appId: this.appId,
      userId: this.userId || '',
      sdkVersion: this.sdkVersion,
      url: !this.ssr ? window.location.href : '',
      userAgent: !this.ssr ? window.navigator.userAgent : '',
      timestamp: Date.now(),
      referrer: !this.ssr ? document.referrer : '',
      page: !this.ssr ? window.document.title : '',
    };
  };

  public submit(type: ReportType, data: Record<string, unknown>) {
    if (this.debug) {
      console.log(`[Tracker] 数据提交, 类型【${type}】 数据：`, data);
    }
    this.reporter.add({
      type,
      ...this.baseInfo,
      data
    });
  }

  public registerMethod(methodName: string, method: (...args: any[]) => void) {
    if (this.provideMethods.has(methodName)) {
      if (this.debug) {
        console.warn(`[Tracker] 方法[${methodName}]已被注册`);
      }
      return;
    }
    if (this.debug) {
      console.log(`[Tracker] 方法[${methodName}]注册成功`)
    }
    this.provideMethods.set(methodName, method);
  }

  public callMethods(methodName: string, ...args: any[]) {
    const method = this.provideMethods.get(methodName);
    if (!method) {
      if (this.debug) {
        console.warn(`[Tracker] 方法[${methodName}]不存在`);
      }
      return;
    }
    method(...args);
  }
  // public report() {
  // }
}
