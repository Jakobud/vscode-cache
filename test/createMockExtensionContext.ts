'use strict';

import { ExtensionContext } from 'vscode';

/**
 * Visual Studio Code Extension Context Mock object
 */
const createMockExtensionContext = (): ExtensionContext => {
  return {
    globalState: {
      get<T>(key: string, defaultValue?: T): T | undefined {
        const value = this._storage[key];
        if (typeof value === 'undefined') {
          return defaultValue;
        }
        return value;
      },
      update(key: string, value: any): Thenable<void> {
        this._storage[key] = value;
        return Promise.resolve();
      },
      _storage: {} as { [key: string]: any }
    } as any,
    subscriptions: [],
    workspaceState: {
      get<T>(key: string, defaultValue?: T): T | undefined {
        return defaultValue;
      },
      update(key: string, value: any): Thenable<void> {
        return Promise.resolve();
      },
      keys(): readonly string[] {
        return [];
      }
    },
    secrets: {
      get(key: string): Thenable<string | undefined> {
        return Promise.resolve(undefined);
      },
      store(key: string, value: string): Thenable<void> {
        return Promise.resolve();
      },
      delete(key: string): Thenable<void> {
        return Promise.resolve();
      },
      onDidChange: (() => {
        const eventEmitter = {
          event: (listener: (e: any) => any, thisArgs?: any, disposables?: any[]) => {
            return {
              dispose: () => { }
            };
          },
          dispose: () => { }
        };
        return eventEmitter.event;
      })()
    },
    extensionUri: {} as any,
    extensionPath: '',
    environmentVariableCollection: {} as any,
    storagePath: '',
    logPath: '',
    extensionMode: 1,
    asAbsolutePath: (relativePath: string) => relativePath,
    storageUri: undefined,
    globalStoragePath: '',
    languageModelAccessInformation: {} as any,
    globalStorageUri: { scheme: 'file', authority: '', path: '/path/to/global/storage' } as any,
    logUri: { scheme: 'file', authority: '', path: '/path/to/log' } as any,
    extension: {} as any
  }
};

export default createMockExtensionContext;
