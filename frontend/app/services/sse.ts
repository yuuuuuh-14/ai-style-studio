type SSECallback = (data: any) => void;
type ErrorCallback = (error: any) => void;

interface SSEOptions {
  onMessage: SSECallback;
  onError?: ErrorCallback;
  maxRetries?: number;
  initialRetryDelay?: number;
}

export class SSEService {
  private eventSource: EventSource | null = null;
  private url: string;
  private options: SSEOptions;
  private retryCount = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string, options: SSEOptions) {
    this.url = url;
    this.options = options;
  }

  connect() {
    if (this.eventSource) {
      this.disconnect();
    }

    console.log(`[SSE] Connecting to ${this.url} (Attempt ${this.retryCount + 1})`);
    this.eventSource = new EventSource(this.url);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.options.onMessage(data);
        this.retryCount = 0; // Reset on successful message
      } catch (err) {
        console.error("[SSE] Failed to parse message:", err);
      }
    };

    this.eventSource.onerror = (err) => {
      console.error("[SSE] Connection error:", err);
      this.disconnect();

      const maxRetries = this.options.maxRetries ?? 5;
      if (this.retryCount < maxRetries) {
        const delay = (this.options.initialRetryDelay ?? 1000) * Math.pow(2, this.retryCount);
        console.log(`[SSE] Retrying in ${delay}ms...`);
        
        this.retryTimer = setTimeout(() => {
          this.retryCount++;
          this.connect();
        }, delay);
      } else {
        console.error("[SSE] Max retries reached.");
        if (this.options.onError) {
          this.options.onError(new Error("Max retries reached for live updates."));
        }
      }
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }
}
