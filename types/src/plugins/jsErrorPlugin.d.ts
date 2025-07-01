import { TrackerPlugin } from "../types";
import { Tracker } from "../tracker";
export interface StackFrame {
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
    functionName?: string;
    source?: string;
}
export interface JsErrorInfo {
    errorType: string;
    message: string;
    stack?: string;
    parsedStack: StackFrame;
    [key: string]: unknown;
}
export interface ResourceErrorInfo {
    tagName: string;
    resourceUrl: string;
    outerHTML: string;
    [key: string]: unknown;
}
export interface PromiseRejectionInfo {
    errorType?: string;
    message: string;
    stack?: string;
    parsedStack?: StackFrame;
    value?: unknown;
    [key: string]: unknown;
}
export declare class JsErrorPlugin implements TrackerPlugin {
    tracker: Tracker | null;
    constructor();
    get isDebug(): boolean | undefined;
    install(tracker: Tracker): void;
    handleError: (event: ErrorEvent | Event) => void;
    private handleJsError;
    private handleResourceError;
    private handlePromiseRejection;
}
