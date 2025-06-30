import { TrackerPlugin } from "../types";
import { Tracker } from "../tracker";

export enum LOGGER_LEVEL {
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4
}

declare module '../tracker' {
  export interface Tracker {
    logger: Console
  }
}

export interface consolePluginConfig {
  loggerLevel: LOGGER_LEVEL
}

export class loggerPlugin implements TrackerPlugin {
  public tracker: Tracker | null = null;

  private loggerLevel: LOGGER_LEVEL;
  constructor(config: Partial<consolePluginConfig> = {}) {
    this.loggerLevel = config.loggerLevel || LOGGER_LEVEL.WARN;
  }

  get isDebug () {
    return this.tracker?.debug;
  }

  install(tracker: Tracker) {
    this.tracker = tracker;
    if (this.isDebug) {
      console.log('[vueErrorPlugin] 已加载：', this);
    }
    this.tracker.logger = this.createLogger(console);
  }

  createLogger(originalConsole: Console): Console {
    const consoleMthodsLevelMap = {
      debug: LOGGER_LEVEL.DEBUG,
      info: LOGGER_LEVEL.INFO,
      warn: LOGGER_LEVEL.WARN,
      error: LOGGER_LEVEL.ERROR,
      table: LOGGER_LEVEL.INFO,
      dir: LOGGER_LEVEL.INFO,
      log: LOGGER_LEVEL.INFO,
    }
    const self = this
    return new Proxy(originalConsole, {
      get(target, methodName) {
        if (Object.keys(consoleMthodsLevelMap).includes(methodName as keyof typeof target)) {
          return function (...args: any[]) {
            if (consoleMthodsLevelMap[methodName as keyof typeof consoleMthodsLevelMap] >= self.loggerLevel) {
              self.tracker?.submit('logger', {
                method: methodName,
                args: args
              })
            }
            target[methodName as keyof typeof target].apply(target, args);
          }
        }
        return target[methodName as keyof typeof target];
      }
    })
  }
}
