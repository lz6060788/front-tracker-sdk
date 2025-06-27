import { ReportType, TrackerConfig } from './types';
export declare class Tracker {
    private appId;
    private userId;
    private sdkVersion;
    private reporter;
    debug: TrackerConfig['debug'];
    private plugins;
    private static _instance;
    constructor(options: TrackerConfig);
    static init(options: TrackerConfig): Tracker | null;
    private get baseInfo();
    submit(type: ReportType, data: Record<string, unknown>): void;
}
