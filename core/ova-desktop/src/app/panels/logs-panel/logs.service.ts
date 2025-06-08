import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LogsService {
  logs: string[] = [];

  addLog(log: string) {
    this.logs.push(log);
  }

  clearLogs() {
    this.logs = [];
  }

  getLogs(): string[] {
    return this.logs;
  }
}
