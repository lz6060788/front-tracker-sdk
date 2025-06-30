import { TrackerPlugin } from "../types";
import { Tracker } from "../tracker";
import { App, ComponentPublicInstance } from "vue";

export interface VueErrorContext {
  component?: string
  lifecycleHook?: string
  file?: string
  [key: string]: any
}


declare module 'src/types' {
  export interface ReportTypeExtension {
    vueError: true;
  }
}

export class vueErrorPlugin implements TrackerPlugin {
  public tracker: Tracker | null = null;
  private app: App | null = null;
  private originalErrorHandler: ((err: unknown, vm: ComponentPublicInstance | null, info: string) => void) | undefined;
  constructor(app: App) {
    this.app = app;
    this.originalErrorHandler = app.config.errorHandler
  }

  get isDebug () {
    return this.tracker?.debug;
  }

  install(tracker: Tracker) {
    this.tracker = tracker;
    if (!this.app) {
      throw new Error('[vueErrorPlugin]: app不存在')
    }
    if (this.isDebug) {
      console.log('[vueErrorPlugin] 已加载：', this);
    }
    this.app.config.errorHandler = (
      err: unknown,
      vm: ComponentPublicInstance | null,
      info: string
    ) => {
      // 构建错误数据
      const errorData = {
        error: this.normalizeError(err),
        ...this.getVueContext(vm, info),
      }

      // 调试模式下打印错误
      if (this.isDebug) {
        console.groupCollapsed(`[vueErrorPlugin]: ${errorData.error.message}`)
        console.error('Error:', err)
        console.log('Context:', errorData)
        console.groupEnd()
      }

      // 发送错误报告
      this.tracker?.submit('vueError', errorData)

      // 调用原始错误处理器（如果存在）
      if (typeof this.originalErrorHandler === 'function') {
        this.originalErrorHandler.call(null, err, vm, info)
      }
    }
  }

  // 配置默认上下文收集器
  getVueContext = (vm: ComponentPublicInstance | null, info: string) => {
      const context: VueErrorContext = {
        lifecycleHook: info
      }
      if (vm) {
        context.component = vm.$options.name || 'Anonymous'
        context.file = (vm.$options as any).__file || 'unknown'
        context.props = vm.$props
      }

    return context
  }

  normalizeError(err: unknown): {
    message: string
    stack?: string
    name?: string
    type?: string
  } {
    if (err instanceof Error) {
      return {
        message: err.message,
        stack: err.stack,
        name: err.name
      }
    }

    if (typeof err === 'string') {
      return { message: err }
    }

    return { message: 'Unknown error', type: typeof err }
  }
}
