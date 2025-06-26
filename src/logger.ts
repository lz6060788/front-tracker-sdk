import { Tracker } from "./tracker";

export class logger { 
  constructor(private options: unknown, private tracker: Tracker) {
    this.options = options
  }
}
