import { ReportType, TrackerConfig } from './types';
export declare class Tracker {
    private appId;
    private userId;
    private sdkVersion;
    private reporterConfig;
    private reporter;
    apiUrl: TrackerConfig['apiUrl'];
    debug: TrackerConfig['debug'];
    loggerLevel: TrackerConfig['loggerLevel'];
    private plugins;
    private static _instance;
    constructor(options: TrackerConfig);
    static init(options: TrackerConfig): Tracker | null;
    private get baseInfo();
    submit(type: ReportType, data: Record<string, unknown>): void;
}
