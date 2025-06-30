import { ReportType, TrackerConfig } from './types';
export declare class Tracker {
    private appId;
    private userId;
    private sdkVersion;
    private reporter;
    debug: TrackerConfig['debug'];
    ssr: TrackerConfig['ssr'];
    private plugins;
    private provideMethods;
    private static _instance;
    constructor(options: TrackerConfig);
    static init(options: TrackerConfig): Tracker | null;
    private get baseInfo();
    submit(type: ReportType, data: Record<string, unknown>): void;
    registerMethod(methodName: string, method: (...args: any[]) => void): void;
    callMethods(methodName: string, ...args: any[]): void;
}
