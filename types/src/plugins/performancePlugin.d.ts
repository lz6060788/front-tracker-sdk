import { TrackerPlugin } from "src/types";
import { Tracker } from "../tracker";
export interface TaskAttributionTiming extends PerformanceEntry {
    containerType: string;
    containerSrc: string;
    containerId: string;
    containerName: string;
}
export interface PerformanceLongTaskTiming extends PerformanceEntry {
    attribution: TaskAttributionTiming[];
}
export interface LayoutShiftAttribution {
    node: Node | null;
    previousRect: DOMRectReadOnly;
    currentRect: DOMRectReadOnly;
}
export interface LayoutShift extends PerformanceEntry {
    value: number;
    hadRecentInput: boolean;
    lastInputTime: DOMHighResTimeStamp;
    sources: LayoutShiftAttribution[];
}
export interface ExtendPerformanceEntryType extends PerformanceEntry {
    element?: Element;
    renderTime?: number;
    [key: string]: unknown;
}
export interface performancePluginConfig {
    captureResourceTiming: boolean;
    captureLongTask: boolean;
    capturePaintMetrics: boolean;
    captureLayoutShift: boolean;
}
export declare const defaultPerformancePluginConfig: {
    captureResourceTiming: boolean;
    captureLongTask: boolean;
    capturePaintMetrics: boolean;
    captureLayoutShift: boolean;
};
export declare class performancePlugin implements TrackerPlugin {
    tracker: Tracker | null;
    private metrics;
    private longTaskObserver;
    private layoutShiftObserver;
    private config;
    constructor(config: Partial<performancePluginConfig>);
    install(tracker: Tracker): void;
    get isDebug(): boolean | undefined;
    capturePageLoadMetrics(): void;
    captureResourceMetrics(): void;
    capturePaintMetrics(): void;
    captureLongTasks(): void;
    captureLayoutShift(): void;
}
