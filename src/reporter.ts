import { Tracker } from "src/tracker";
import { ReporterConfig, ReporterDataType } from "./types";

export const defaultReporterConfig: ReporterConfig = {
  maxQueueLength: 200,
  timeinterval: 3000,
  maxRetry: 3,
  retryInterval: 3000,
  abatchLength: 10
}

// TODO上报模块存在定时器Bug
export class reporter {
  private config: ReporterConfig;
  private queue: Array<ReporterDataType> = [];
  private timer: any = null;
  private retryCount: number = 0;
  private tracker: Tracker;
  private isSending: boolean = false;
  private currentBatch: Array<ReporterDataType> = [];
  constructor(config: Partial<ReporterConfig>, tracker: Tracker) {
    this.config = this._mergeConfig(config)
    this.tracker = tracker
  }

  private _mergeConfig (config: Partial<ReporterConfig>) {
    return {
      ...defaultReporterConfig,
      ...config
    }
  }

  public add(data: ReporterDataType) {
    this.queue.push(data);
    this.queue = this.queue.slice(-this.config.maxQueueLength);
  }

  public flush() {
    console.log('flush');
    if (this.queue.length > 0 && !this.isSending) {
      this.isSending = true;
      this.currentBatch = this.queue.splice(0, this.config.abatchLength);
      this._send();
    }
  }

  private async _send() {
    try {
      // const response = await fetch('https://your-tracking-endpoint.com/track', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(this.currentBatch)
      // });

      // if (!response.ok) {
      //   throw new Error(`Request failed with status ${response.status}`);
      // }
      if (Math.random() < 0.5) {
        throw new Error('Network error');
      }

      console.log('Data sent successfully', this.currentBatch);
      // 成功发送后重置重试计数器和状态
      this.retryCount = 0;
      this.isSending = false;
      this.currentBatch = [];

      this.start();
    } catch (error) {
      console.error(`Failed to send data: ${(error as Error).message}`);
      this.stop();
      
      // 如果未达到最大重试次数，则安排重试
      if (this.retryCount < this.config.maxRetry) {
        console.log(`Retrying... (${this.retryCount}/${this.config.maxRetry})`);
        this.retryCount++;

        setTimeout(() => {
          this._send();
        }, this.config.retryInterval);
      } else {
        console.log('Max retries reached. Stopping retries.');
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
    console.log('start');
    this.timer = setInterval(() => {
      this.flush();
    }, this.config.timeinterval);
  }

  public stop() {
    console.log('stop');
    this.timer && clearInterval(this.timer);
  }
}
