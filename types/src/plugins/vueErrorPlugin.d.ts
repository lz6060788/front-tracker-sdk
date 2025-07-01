import { TrackerPlugin } from "../types";
import { Tracker } from "../tracker";
import { App, ComponentPublicInstance } from "vue";
export interface VueErrorContext {
    component?: string;
    lifecycleHook?: string;
    file?: string;
    [key: string]: any;
}
declare module 'src/types' {
    interface ReportTypeExtension {
        vueError: true;
    }
}
export declare class vueErrorPlugin implements TrackerPlugin {
    tracker: Tracker | null;
    private app;
    private originalErrorHandler;
    constructor(app: App);
    get isDebug(): boolean | undefined;
    install(tracker: Tracker): void;
    getVueContext: (vm: ComponentPublicInstance | null, info: string) => VueErrorContext;
    normalizeError(err: unknown): {
        message: string;
        stack?: string;
        name?: string;
        type?: string;
    };
}
