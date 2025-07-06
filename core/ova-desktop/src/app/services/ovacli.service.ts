// ovacli.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OvacliService {
  constructor() {}

  // Method to run the ovacli command with the --version argument
  runOvacliVersion(): Promise<any> {
    const args = ['version']; // Just the --version argument to check the version
    console.log('Running ovacli with args:', args);
    return window['IPCBridge']
      .runOvacli(args) // Pass the arguments to runOvacli in the main process
      .then((result) => {
        console.log('runOvacli version result:', result);
        return result; // Returning the result (either success or error)
      })
      .catch((err) => {
        console.error('runOvacli error:', err);
        throw err; // Propagate the error for further handling
      });
  }
}
