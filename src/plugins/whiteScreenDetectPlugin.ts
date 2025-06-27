import { TrackerPlugin } from "src/types";
import { Tracker } from "../tracker";

export interface WhiteScreenDetectPluginConfig {
  // 框架dom节点id，被判定为无效元素
  frameElementIds: string[];
  // 采样点数量
  numSamples: number;
  // 延迟
  delay: number;
  // 是否自动检测
  autoDetect: boolean;
}

export class WhiteScreenDetectPlugin implements TrackerPlugin {
  public tracker: Tracker | null = null;
  private frameElementIds: string[];
  private numSamples: number;
  private delay: number;
  private autoDetect: boolean = true;
  constructor(config: Partial<WhiteScreenDetectPluginConfig>) {
    this.numSamples = config?.numSamples || 9;
    this.frameElementIds = config?.frameElementIds || ['app'];
    this.delay = config?.delay ?? 3000;
    this.autoDetect = config?.autoDetect ?? true;
  }

  get isDebug () {
    return this.tracker?.debug;
  }

  install(tracker: Tracker) {
    this.tracker = tracker;
    if (this.isDebug) {
      console.log('[WhiteScreenDetectPlugin] 已加载：', this);
    }
    this.autoDetect && setTimeout(() => {
      this.handleDetectScreen();
    }, this.delay);
    this.tracker.registerPrivideMethod('handleDetectScreen', this.handleDetectScreen.bind(this));
  }

  getSamplePoints () {
    if (this.isDebug) {
      console.log('[WhiteScreenDetectPlugin] 散点数:', this.numSamples);
    }
    const numSamples = this.numSamples;
    const points = [];
    const centerIndex = Math.floor(numSamples / 2) + 1;
    const widthPart = window.innerWidth / (numSamples + 1);
    const heightPart = window.innerHeight / (numSamples + 1);
    for (let i = 1; i <= numSamples; i++) {
      if (i === centerIndex) {
        continue; // 跳过中心点
      }
      points.push([centerIndex * widthPart, i * heightPart]); // 垂直采样
      points.push([i * widthPart, centerIndex * heightPart]); // 水平采样
      points.push([i * widthPart, i * heightPart]); // 对角线采样
      points.push([(numSamples - i + 1) * widthPart, i * heightPart]); // 反对角线采样
    }
    points.push([centerIndex * widthPart, centerIndex * heightPart]);
    if (this.isDebug) {
      console.log('[WhiteScreenDetectPlugin] 散点采样值:', points);
    }
    return points;
  }

  checkInvalidElement (ele: Element) {
    // 自定义无效元素规则
    if (!["BODY", "HTML"].includes(ele.tagName) && !this.frameElementIds.includes(ele.id)) {
      return 0;
    }
    return 1;
  };

  handleDetectScreen () {
    // IE不兼容，直接返回
    if (!window.document.elementsFromPoint) {
      if (this.isDebug) {
        console.log('[WhiteScreenDetectPlugin] 当前浏览器不支持API elementsFromPoint');
      }
      return;
    }
    const points = this.getSamplePoints();

    // 无效元素计数
    let invalidCount = 0;

    for (let i = 0; i < points.length; i++) {
      const ele = window.document.elementsFromPoint(points[i][0], points[i][1]);
      invalidCount += this.checkInvalidElement(ele[0]);
    }

    // 采样点无效元素占比80%以上，判定为白屏
    const ratio = invalidCount / points.length
    if (ratio > 0.8) {
      this.tracker?.submit('whiteScreen', {
        ratio
      })
    } else {
      if (this.isDebug) {
        console.log('[WhiteScreenDetectPlugin] 白屏检测通过，无白屏');
      }
      return;
    }
  };
}
