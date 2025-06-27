import { TrackerPlugin } from "src/types";
import { Tracker } from "../tracker";
import ErrorStackParser from 'error-stack-parser'

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

export class JsErrorPlugin implements TrackerPlugin {
  public tracker: Tracker;
  constructor(tracker: Tracker) {
    this.tracker = tracker;
  }

  get isDebug () {
    return this.tracker.debug;
  }

  install() {
    window.addEventListener('error', this.handleError.bind(this), true);
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    if (this.isDebug) {
      console.log('JsErrorPlugin installed');
    }
  }

  handleError = (event: ErrorEvent | Event) => {
    if ('error' in event && event.error) {
      this.handleJsError(event as ErrorEvent);
    } else if (
      'target' in event &&
      event.target
    ) {
      this.handleResourceError(event);
    }
  }

  private handleJsError(event: ErrorEvent): void {
    const error = event.error;
    
    try {
      const frame = ErrorStackParser.parse(error)[0];
      
      const errorInfo: JsErrorInfo = {
        errorType: error.name,
        message: error.message,
        stack: error.stack,
        parsedStack: {
          fileName: frame.fileName,
          lineNumber: frame.lineNumber,
          columnNumber: frame.columnNumber,
          functionName: frame.functionName,
          source: frame.source
        }
      };

      this.tracker.submit('jsError', errorInfo);
      
    } catch (parseError) {
      if (this.isDebug) {
        console.error('Failed to parse error stack:', parseError);
        console.error('Original error:', {
          type: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }
    // event.preventDefault();
  }

  private handleResourceError(event: Event): void {
    const target = event.target as HTMLElement;
    
    const resourceInfo: ResourceErrorInfo = {
      tagName: target.tagName,
      resourceUrl: (target as HTMLImageElement).src || 
                 (target as HTMLLinkElement).href || 
                 (target as HTMLScriptElement).src || '',
      outerHTML: target.outerHTML.slice(0, 200),
    };

    this.tracker.submit('resourceError', resourceInfo);
    
    // event.preventDefault();
  }

  private handlePromiseRejection(event: PromiseRejectionEvent): void {
      const error = event.reason;
      
      if (error instanceof Error) {
        try {
          const frame = ErrorStackParser.parse(error)[0];
          
          const errorInfo: PromiseRejectionInfo = {
            errorType: error.name,
            message: error.message,
            stack: error.stack,
            parsedStack: {
              fileName: frame.fileName,
              lineNumber: frame.lineNumber,
              columnNumber: frame.columnNumber,
              functionName: frame.functionName,
              source: frame.source
            },
          };
  
          this.tracker.submit('unhandledRejection', errorInfo)
          
        } catch (parseError) {
          if (this.isDebug) {
            console.error('Failed to parse promise rejection:', {
              type: 'unhandledrejection',
              message: String(error),
              stack: error.stack
            });
          }
        }
      } else {
        if (this.isDebug) {
          console.error('Unhandled Promise Rejection (non-Error):', {
            type: 'unhandledrejection',
            message: String(error),
            value: error
          });
        }
      }
      
      // event.preventDefault();
    }
}
