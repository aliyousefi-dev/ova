import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private dbName = 'RepositoryDB';
  private storeName = 'repositories';

  constructor() {}

  // Open the IndexedDB
  private openDB(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 2); // Bumped version to trigger upgrade

      // Handle the database version upgrade
      request.onupgradeneeded = (event: Event) => {
        const db = (event.target as IDBRequest).result;
        console.log('Database upgrade needed');
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true,
          });
          console.log('Object store created: repositories');
        }
      };

      // Handle success
      request.onsuccess = (event: Event) => {
        console.log('IndexedDB opened successfully');
        resolve((event.target as IDBRequest).result);
      };

      // Handle error
      request.onerror = (event: Event) => {
        console.error(
          'Error opening IndexedDB:',
          (event.target as IDBRequest).error
        );
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // Check if repository already exists by its address
  checkRepositoryExists(repositoryAddress: string): Promise<boolean> {
    return this.openDB().then((db) => {
      return new Promise<boolean>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);

        const request = store.getAll();

        request.onsuccess = () => {
          const existingRepositories = request.result;

          // Check if any repository has the same address
          const exists = existingRepositories.some(
            (repo) => repo.repositoryAddress === repositoryAddress
          );
          resolve(exists);
        };

        request.onerror = (event: Event) => {
          console.error(
            'Error checking existing repositories:',
            (event.target as IDBRequest).error
          );
          reject((event.target as IDBRequest).error);
        };
      });
    });
  }

  // Save repository information
  saveRepositoryInfo(metadata: any): Promise<void> {
    return this.openDB().then((db) => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);

        // Add the new repository since it doesn't exist (checked elsewhere)
        const addRequest = store.add(metadata);

        addRequest.onsuccess = () => {
          console.log('Repository info saved successfully:', metadata);
          resolve();
        };

        addRequest.onerror = (event: Event) => {
          console.error(
            'Error saving repository info:',
            (event.target as IDBRequest).error
          );
          reject((event.target as IDBRequest).error);
        };
      });
    });
  }

  // Load repository information
  loadRepositoryInfo(): Promise<any[]> {
    return this.openDB().then((db) => {
      return new Promise<any[]>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);

        const request = store.getAll();

        // Handle success
        request.onsuccess = (event: Event) => {
          console.log('Loaded repository info:', request.result);
          resolve((event.target as IDBRequest).result);
        };

        // Handle error
        request.onerror = (event: Event) => {
          console.error(
            'Error loading repository info:',
            (event.target as IDBRequest).error
          );
          reject((event.target as IDBRequest).error);
        };
      });
    });
  }
}
