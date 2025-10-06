import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl, { transports: ['websocket'] });
  }

  emit(event: string, payload?: any) { this.socket.emit(event, payload); }
  on<T = any>(event: string, handler: (data: T) => void) { this.socket.on(event, handler); }
  off(event: string) { this.socket.off(event); }
}
