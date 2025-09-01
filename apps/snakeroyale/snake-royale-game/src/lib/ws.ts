export type WSHandler = (data: any) => void;

function computeWsUrl() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('ws');
  const fromGlobal: any = (window as any).SNAKE_ROYALE_WS;
  const fromEnv: any = (import.meta as any)?.env?.VITE_WS_URL;
  return (
    fromQuery ||
    fromGlobal ||
    fromEnv ||
    `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.hostname}:8080`
  );
}

export class WSClient {
  private url: string;
  private ws: WebSocket | null = null;
  private listeners: Record<string, WSHandler[]> = {};
  private isConnected = false;
  private reconnectAttempts = 0;

  constructor(url?: string) {
    this.url = url || computeWsUrl();
  }

  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', {});
      const token = localStorage.getItem('sr_token') || '';
      this.send('connect', { token });
    };
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data);
      } catch {}
    };
    this.ws.onclose = () => {
      this.isConnected = false;
      this.emit('disconnected', {});
      this.reconnect();
    };
    this.ws.onerror = () => {
      this.emit('error', {});
    };
  }

  send(type: string, payload: any = {}) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({ type, ...payload }));
    }
  }

  on(type: string, handler: WSHandler) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(handler);
  }

  off(type: string, handler: WSHandler) {
    if (this.listeners[type]) this.listeners[type] = this.listeners[type].filter(h => h !== handler);
  }

  private emit(type: string, data: any) {
    if (this.listeners[type]) this.listeners[type].forEach(h => h(data));
  }

  private reconnect() {
    if (this.reconnectAttempts < 5) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 500 * this.reconnectAttempts);
    }
  }
}

export const ws = new WSClient();
