import { Tracker } from "../tracker";
export interface TrackerConfig {
    appId: string;
    sdkVersion: string;
    debug?: boolean;
    userId?: string;
    plugins?: Array<TrackerPlugin>;
    ssr?: boolean;
    reporter: TrackerReporter;
}
export interface ReportTypeExtension {
}
export type ReportType = 'jsError' | 'unhandledRejection' | 'resourceError' | 'xhrError' | 'whiteScreen' | 'performance' | 'longtask' | 'logger' | 'action' | keyof ReportTypeExtension;
export declare const enum LoggerLevelType {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
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
    install(tracker: Tracker): void;
    add(data: ReporterDataType): void;
}
