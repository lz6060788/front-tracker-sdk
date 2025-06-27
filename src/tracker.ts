import { LoggerLevelType, ReportType, TrackerConfig, TrackerReporter } from './types'


export class Tracker {
  private appId: TrackerConfig['appId'];
  private userId: TrackerConfig['userId'];
  private sdkVersion: TrackerConfig['sdkVersion'];
  private reporter: TrackerReporter;
  public debug: TrackerConfig['debug'];
  private plugins: TrackerConfig['plugins'];

  private static _instance: Tracker;
  constructor(options: TrackerConfig) {
    this.appId = options.appId;
    this.userId = options.userId;
    this.sdkVersion = options.sdkVersion;
    this.debug = options.debug || false;
    this.reporter = options.reporter;
    this.reporter.install();

    this.plugins = options.plugins || [];
    this.plugins.forEach(plugin => {
      plugin.tracker = this;
      plugin.install();
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
      console.error('初始化失败', error);
      return null;
    }
  }}

  private get baseInfo () {
    return {
      appId: this.appId,
      userId: this.userId || '',
      sdkVersion: this.sdkVersion,
    };
  };

  public submit(type: ReportType, data: Record<string, unknown>) {
    if (this.debug) {
      console.log(`[${type}]:`, data);
    }
    this.reporter.add({
      type,
      ...this.baseInfo,
      data
    });
  }

  // public report() {
  // }
}
