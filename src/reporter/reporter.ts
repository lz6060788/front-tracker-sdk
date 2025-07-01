import { Tracker } from "../tracker";
import { ReporterDataType, TrackerReporter } from "../types";

export type ReportorType = 'fetch' | 'image' | 'sendbeacon'

export interface ReporterConfig {
  reportType: ReportorType;
  apiUrl: string;
  apiMethod: 'POST' | 'GET';
  maxQueueLength: number;
  timeinterval: number;
  maxRetry: number;
  retryInterval: number;
  abatchLength: number;
}

export type ReporterConfigParams = Partial<Omit<ReporterConfig, 'apiUrl'>> & Required<Pick<ReporterConfig, 'apiUrl'>>

export const defaultReporterConfig: Omit<ReporterConfig, 'apiUrl'> = {
  reportType: 'image',
  apiMethod: 'POST',
  maxQueueLength: 200,
  timeinterval: 3000,
  maxRetry: 3,
  retryInterval: 3000,
  abatchLength: 10
}

export class Rporter implements TrackerReporter {
  private tracker: Tracker | null = null;
  private config: ReporterConfig;
  private queue: Array<ReporterDataType> = [];
  private timer: any = null;
  private retryCount: number = 0;
  private isSending: boolean = false;
  private currentBatch: Array<ReporterDataType> = [];

  private _imgDom: HTMLImageElement | null = null;
  constructor(config: ReporterConfigParams) {
    this.config = this._mergeConfig(config)
  }

  private _mergeConfig (config: ReporterConfigParams) {
    return {
      ...defaultReporterConfig,
      ...config
    }
  }

  private get isDebug () {
    return this.tracker?.debug;
  }

  public install(tracker: Tracker) {
    this.tracker = tracker;
    this.loadQueue();
    this.start();
  }

  public add(data: ReporterDataType) {
    this.queue.push(data);
    this.queue = this.queue.slice(-this.config.maxQueueLength);
  }

  public flush() {
    if (this.queue.length > 0 && !this.isSending) {
      this.saveQueue();
      this.isSending = true;
      this.currentBatch = this.queue.splice(0, this.config.abatchLength);
      this._send();
    }
  }

  private async _send() {
    try {
      if (this.config.reportType === 'fetch') {
        await this._sendByFetch(this.currentBatch);
      } else if (this.config.reportType === 'image') {
        this._sendByImage(this.currentBatch);
      } else if (this.config.reportType === 'sendbeacon') {
        this._sendByBeacon(this.currentBatch);
      }

      if (this.isDebug) {
        console.log('[reporter] 数据发送成功：', this.currentBatch);
      }
      // 成功发送后重置重试计数器和状态
      this.retryCount = 0;
      this.isSending = false;
      this.currentBatch = [];

      this.start();
    } catch (error) {
      if (this.isDebug) {
        console.error(`[reporter] 数据发送失败: ${(error as Error).message}`);
      }
      this.stop();

      // 如果未达到最大重试次数，则安排重试
      if (this.retryCount < this.config.maxRetry) {
        if (this.isDebug) {
          console.log(`[reporter] 重试发送... (${this.retryCount}/${this.config.maxRetry})`);
        }
        this.retryCount++;

        setTimeout(() => {
          this._send();
        }, this.config.retryInterval);
      } else {
        if (this.isDebug) {
          console.log('[reporter] 超过最大重试， 停止重试.');
        }
        // 达到最大重试次数后清理状态
        this.isSending = false;
        this.retryCount = 0;
        this.currentBatch = [];

        this.start();
      }
    }
  }

  // 启动定时任务，每3秒触发一次刷新操作
  public start() {
    this.stop();
    this.timer = setInterval(() => {
      this.flush();
    }, this.config.timeinterval);
  }

  public stop() {
    this.timer && clearInterval(this.timer);
  }

  private _sendByFetch (data: Array<ReporterDataType>) {
    if (this.config.apiMethod === 'GET') {
      const params = new URLSearchParams({
        data: JSON.stringify(data)
      });
      return fetch(`${this.config.apiUrl}?${params.toString()}}`)
    } else {
      return fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
    }
  }

  private _sendByImage (data: Array<ReporterDataType>) {
    if (this._imgDom) {
      this._imgDom.remove();
    }
    this._imgDom = new Image();
    this._imgDom.src = `${this.config.apiUrl}?data=${encodeURIComponent(JSON.stringify(data))}`;
  }

  private _sendByBeacon (data: Array<ReporterDataType>) {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.config.apiUrl, JSON.stringify(data));
    } else {
      console.warn('sendBeacon is not supported in this browser.');
    }
  }

  private _getLocalStorageKey () {
    return `trackerQueue-${this.config.apiUrl}`
  }

  private saveQueue() {
    localStorage.setItem(this._getLocalStorageKey(), JSON.stringify(this.queue));
    if (this.isDebug) {
      console.log('[reporter] 数据保存本地成功：', this.queue);
    }
  }

  private loadQueue() {
    const queue = JSON.parse(localStorage.getItem(this._getLocalStorageKey()) || '[]');
    if (queue && Array.isArray(queue)) {
      this.queue = queue;
      if (this.isDebug) {
        console.log('[reporter] 本地数据加载成功：', queue);
      }
    }
  }
}
