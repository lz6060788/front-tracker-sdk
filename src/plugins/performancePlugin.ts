import { TrackerPlugin } from "../types";
import { Tracker } from "../tracker";

// Type definitions for experimental performance APIs
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
  // 浏览器特定扩展属性
  element?: Element;       // 某些浏览器提供的关联元素
  renderTime?: number;     // 某些浏览器提供的额外时间信息
  [key: string]: unknown;
}

export interface performancePluginConfig {
  captureResourceTiming: boolean,
  captureLongTask: boolean,
  capturePaintMetrics: boolean,
  captureLayoutShift: boolean,
}

export const defaultPerformancePluginConfig = {
  captureResourceTiming: true,
  captureLongTask: true,
  capturePaintMetrics: true,
  captureLayoutShift: true,
}

export class performancePlugin implements TrackerPlugin {
  public tracker: Tracker | null = null;
  private metrics: {
    pageLoad: Record<string, number | string>;
    resources: Array<Record<string, unknown>>;
    layoutShiftEntries: Array<Record<string, unknown>>;
    FMP: Omit<ExtendPerformanceEntryType, 'toJSON'>;
    LCP: Omit<ExtendPerformanceEntryType, 'toJSON'>;
    FP: Omit<ExtendPerformanceEntryType, 'toJSON'>;
    FCP: Omit<ExtendPerformanceEntryType, 'toJSON'>;
    CLS: number;
  } = {
    pageLoad: {},
    resources: [],
    layoutShiftEntries: [],
    FMP: { entryType: '', name: '', startTime: 0, duration: 0 },
    LCP: { entryType: '', name: '', startTime: 0, duration: 0 },
    FP: { entryType: '', name: '', startTime: 0, duration: 0 },
    FCP: { entryType: '', name: '', startTime: 0, duration: 0 },
    CLS: 0
  }
  private longTaskObserver: PerformanceObserver | null = null;
  private layoutShiftObserver: PerformanceObserver | null = null;
  private config: performancePluginConfig;
  
  constructor(config: Partial<performancePluginConfig> = {}) {
    this.config = {
      ...defaultPerformancePluginConfig,
      ...config
    }
  }

  install(tracker: Tracker) {
    this.tracker = tracker;

    // FMP
    new PerformanceObserver((entryList, observer) => {
      let perfEntriens = entryList.getEntries();
      const entry = perfEntriens[0] as ExtendPerformanceEntryType;
      this.metrics.FMP = !!entry.toJSON
        ? entry.toJSON()
        : {
          name: entry.name,
          entryType: entry.entryType,
          startTime: entry.startTime,
          duration: entry.duration,
          size: entry.size,
          renderTime: entry.renderTime,
          loadTime: entry.loadTime,
          element: entry.element?.tagName
        };
      observer.disconnect();
      
      if (this.isDebug) {
        console.log('[PerformancePlugin] FMP:', entry, '监听器已移除');
      }
    }).observe({ entryTypes: ['element']})

    // LCP
    new PerformanceObserver((entryList, observer) => {
      let perfEntriens = entryList.getEntries();
      const entry = perfEntriens[0] as ExtendPerformanceEntryType;
      this.metrics.LCP = !!entry.toJSON
        ? entry.toJSON()
        : {
          name: entry.name,
          entryType: entry.entryType,
          startTime: entry.startTime,
          duration: entry.duration,
          size: entry.size,
          renderTime: entry.renderTime,
          loadTime: entry.loadTime,
          element: entry.element?.tagName
        };
      observer.disconnect();

      if (this.isDebug) {
        console.log('[PerformancePlugin] LCP:', this.metrics.LCP, '监听器已移除');
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })
    

    // 捕获长任务
    if (this.config.captureLongTask && 'PerformanceObserver' in window) {
      this.captureLongTasks();
    }
    
    // 捕获布局偏移
    if (this.config.captureLayoutShift && 'PerformanceObserver' in window) {
      this.captureLayoutShift();
    }
    
    // 页面卸载前上报数据
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // 捕获页面加载性能指标
        this.capturePageLoadMetrics();

        // 捕获资源加载性能指标
        if (this.config.captureResourceTiming) {
          this.captureResourceMetrics();
        }

        // 捕获绘制指标
        if (this.config.capturePaintMetrics) {
          this.capturePaintMetrics();
        }
        this.tracker?.submit('performance', this.metrics);
        this.layoutShiftObserver?.disconnect();
        this.layoutShiftObserver = null;

        if (this.isDebug) {
          console.log('[PerformancePlugin] 数据上报:', this.metrics, 'layoutShift监听器已移除');
        }
      }
    }, { once: true });

    if (this.isDebug) {
      console.log('[PerformancePlugin] 已加载：', this);
    }
  }

  get isDebug () {
    return this.tracker?.debug
  }

  /**
   * 捕获页面加载性能指标
   */
  capturePageLoadMetrics() {
    const navigationEntries = performance.getEntriesByType('navigation');
    if (this.isDebug) {
      console.log('[PerformancePlugin] 页面加载性能指标:', navigationEntries);
    }
    if (navigationEntries.length === 0) return;
    
    const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming;
    
    // 计算关键性能指标
    this.metrics.pageLoad = {
      // 导航相关时间
      redirectCount: navigationEntry.redirectCount,
      navigationType: navigationEntry.type,
      
      // 关键时间点
      dnsTime: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
      tcpTime: navigationEntry.connectEnd - navigationEntry.connectStart,
      sslTime: navigationEntry.connectEnd - navigationEntry.secureConnectionStart || 0,
      ttfbTime: navigationEntry.responseStart - navigationEntry.requestStart,
      downloadTime: navigationEntry.responseEnd - navigationEntry.responseStart,
      domProcessingTime: navigationEntry.domComplete - navigationEntry.domInteractive,
      domContentLoadedTime: navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime,
      loadTime: navigationEntry.loadEventEnd - navigationEntry.startTime,
      
      // 资源大小
      transferSize: navigationEntry.transferSize,
      encodedBodySize: navigationEntry.encodedBodySize,
      decodedBodySize: navigationEntry.decodedBodySize,
    };
  }

  /**
   * 捕获资源加载性能指标
   */
  captureResourceMetrics() {
    if (!performance.getEntriesByType) return;
    
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    this.metrics.resources = resources.map(resource => ({
      name: resource.name,
      entryType: resource.entryType,
      initiatorType: resource.initiatorType,
      duration: resource.duration,
      transferSize: resource.transferSize,
      encodedBodySize: resource.encodedBodySize,
      decodedBodySize: resource.decodedBodySize,
      startTime: resource.startTime,
      nextHopProtocol: resource.nextHopProtocol,
      workerStart: resource.workerStart,
      redirectTime: resource.redirectEnd - resource.redirectStart,
      dnsTime: resource.domainLookupEnd - resource.domainLookupStart,
      tcpTime: resource.connectEnd - resource.connectStart,
      sslTime: resource.connectEnd - resource.secureConnectionStart || 0,
      ttfbTime: resource.responseStart - resource.requestStart,
      downloadTime: resource.responseEnd - resource.responseStart
    }));
    if (this.isDebug) {
      console.log('[PerformancePlugin] 资源加载数据:', resources);
    }
  }
  
  /**
   * 捕获绘制指标
   */
  capturePaintMetrics() {
    if (!performance.getEntriesByType) return;
    
    const fpEntry = performance.getEntriesByName('first-paint')[0] as ExtendPerformanceEntryType;
    this.metrics.FP = !!fpEntry.toJSON
      ? fpEntry.toJSON()
      : {
        name: fpEntry.name,
        entryType: fpEntry.entryType,
        startTime: fpEntry.startTime,
        duration: fpEntry.duration,
        size: fpEntry.size,
        renderTime: fpEntry.renderTime,
        loadTime: fpEntry.loadTime,
        element: fpEntry.element?.tagName
      };

    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as ExtendPerformanceEntryType;
    this.metrics.FCP = !!fcpEntry.toJSON
      ? fcpEntry.toJSON()
      : {
        name: fcpEntry.name,
        entryType: fcpEntry.entryType,
        startTime: fcpEntry.startTime,
        duration: fcpEntry.duration,
        size: fcpEntry.size,
        renderTime: fcpEntry.renderTime,
        loadTime: fcpEntry.loadTime,
        element: fcpEntry.element?.tagName
      };
    
    if (this.isDebug) {
      console.log('[PerformancePlugin] FP:', fpEntry);
      console.log('[PerformancePlugin] FCP:', fcpEntry);
    }
  }
  
  /**
   * 捕获长任务
   */
  captureLongTasks() {
    this.longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.map(entry => {
        this.tracker?.submit('longtask', {
          startTime: entry.startTime,
          duration: entry.duration,
          attribution: (entry as PerformanceLongTaskTiming).attribution && (entry as PerformanceLongTaskTiming).attribution.map((attr: TaskAttributionTiming) => ({
            name: attr.name,
            entryType: attr.entryType,
            startTime: attr.startTime,
            duration: attr.duration,
            containerType: attr.containerType,
            containerSrc: attr.containerSrc,
            containerId: attr.containerId,
            containerName: attr.containerName
          }))
        })
      })
    });
    
    this.longTaskObserver.observe({ type: 'longtask', buffered: true });
    if (this.isDebug) {
      console.log('[PerformancePlugin] 长任务监听已开启');
    }
  }
  
  /**
   * 捕获布局偏移
   */
  captureLayoutShift() {
    this.layoutShiftObserver = new PerformanceObserver((list) => {
      let cumulativeLayoutShift = 0;
      const entries = list.getEntries() as LayoutShift[];
      
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          cumulativeLayoutShift += entry.value;
        }
      });
      
      this.metrics.CLS = cumulativeLayoutShift;
      this.metrics.layoutShiftEntries = entries.map(entry => ({
        value: entry.value,
        hadRecentInput: entry.hadRecentInput,
        lastInputTime: entry.lastInputTime,
        sources: entry.sources && entry.sources.map(source => ({
          node: source.node?.nodeName,
          previousRect: source.previousRect,
          currentRect: source.currentRect
        }))
      }));
    });
    
    this.layoutShiftObserver.observe({ type: 'layout-shift', buffered: true });
    if (this.isDebug) {
      console.log('[PerformancePlugin] layoutshift监听已开启');
    }
  }
}
