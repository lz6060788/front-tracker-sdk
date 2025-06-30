import { Tracker } from "../tracker";

export interface TrackerConfig {
  appId: string;
  sdkVersion: string;
  debug?: boolean;
  userId?: string;
  plugins?: Array<TrackerPlugin>;
  ssr?: boolean;
  reporter: TrackerReporter
}

export interface ReportTypeExtension {}

export type ReportType =
  | 'jsError'
  | 'unhandledRejection'
  | 'resourceError'
  | 'xhrError'
  | 'whiteScreen'
  | 'performance'
  | 'longtask'
  | 'logger'
  | 'action'
  | keyof ReportTypeExtension;

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
  tracker: Tracker | null;
  install: (tracker: Tracker) => void;
}

export interface TrackerReporter {
  install(): void;
  add(data: ReporterDataType): void;
}

