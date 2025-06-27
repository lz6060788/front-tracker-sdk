import { TrackerPlugin } from "src/types";
import { Tracker } from "../tracker";
import ErrorStackParser from 'error-stack-parser'

export class performancePlugin implements TrackerPlugin {
  public tracker: Tracker;
  constructor(tracker: Tracker) {
    this.tracker = tracker;
  }

  install() {
    this.tracker.submit('performance', {
      performance: performance.timing
    })
  }
}
