import { TrackerPlugin } from "src/plugins";

export interface TrackerConfig {
  appId: string;
  apiUrl: string;
  sdkVersion: string;
  debug?: boolean;
  loggerLevel?: LoggerLevelType;
  userId?: string;
  reporterConfig?: Partial<ReporterConfig>;
  plugins?: Array<TrackerPlugin>;
}

export type ReportType = 'jsError' | 'unhandledRejection' | 'resourceError' | 'xhrError' | 'whiteScreen' | 'performance' | 'logger' | 'action'

export const enum LoggerLevelType {
  DEBUG,
  INFO,
  WARN,
  ERROR
}

export interface ReporterConfig {
  maxQueueLength: number;
  timeinterval: number;
  maxRetry: number;
  retryInterval: number;
  abatchLength: number;
}

export interface ReporterDataType {
  type: ReportType;
  appId: string;
  sdkVersion: string;
  userId: string;
  data: Record<string, unknown>;
}
