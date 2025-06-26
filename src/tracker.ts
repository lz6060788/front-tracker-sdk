import { reporter } from './reporter';
import { LoggerLevelType, ReportType, TrackerConfig } from './types'


export class Tracker {
  private appId: TrackerConfig['appId'];
  private userId: TrackerConfig['userId'];
  private sdkVersion: TrackerConfig['sdkVersion'];
  private reporterConfig: TrackerConfig['reporterConfig'];
  private reporter: reporter;
  public apiUrl: TrackerConfig['apiUrl'];
  public debug: TrackerConfig['debug'];
  public loggerLevel: TrackerConfig['loggerLevel'];
  private plugins: TrackerConfig['plugins'];

  private static _instance: Tracker;
  constructor(options: TrackerConfig) {
    this.appId = options.appId;
    this.userId = options.userId;
    this.apiUrl = options.apiUrl;
    this.sdkVersion = options.sdkVersion;
    this.debug = options.debug || false;
    this.loggerLevel = options.loggerLevel || LoggerLevelType.ERROR;
    this.reporterConfig = options.reporterConfig || {};
    this.reporter = new reporter(this.reporterConfig, this);
    this.reporter.start();

    this.plugins = options.plugins || [];
    this.plugins.forEach(plugin => {
      plugin.tracker = this;
      plugin.install();
    });
  }

  static init(options: TrackerConfig) {{
    console.log('111')
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
