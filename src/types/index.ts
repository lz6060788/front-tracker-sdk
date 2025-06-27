import { Tracker } from "src/tracker";

export interface TrackerConfig {
  appId: string;
  sdkVersion: string;
  debug?: boolean;
  userId?: string;
  plugins?: Array<TrackerPlugin>;
  reporter: TrackerReporter
}

export type ReportType = 'jsError' | 'unhandledRejection' | 'resourceError' | 'xhrError' | 'whiteScreen' | 'performance' | 'logger' | 'action'

export const enum LoggerLevelType {
  DEBUG,
  INFO,
  WARN,
  ERROR
}

export interface ReporterDataType {
  type: ReportType;
  appId: string;
  sdkVersion: string;
  userId: string;
  data: Record<string, unknown>;
}

export interface TrackerPlugin {
  tracker: Tracker;
  install: () => void;
}

export interface TrackerReporter {
  install(): void;
  add(data: ReporterDataType): void;
}

