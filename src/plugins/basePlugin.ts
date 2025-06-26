import { Tracker } from "../tracker";

export interface TrackerPlugin {
  tracker: Tracker;
  install: () => void;
}
