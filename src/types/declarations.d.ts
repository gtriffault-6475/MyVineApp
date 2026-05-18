// Type stubs for native packages not yet installed.
// Run `npm install && cd ios && pod install` to get full types.

declare module 'react-native-fs' {
  interface StatResult {
    path: string;
    ctime: Date;
    mtime: Date;
    size: number;
    mode: number;
    originalFilepath: string;
    isFile(): boolean;
    isDirectory(): boolean;
  }
  const RNFS: {
    DocumentDirectoryPath: string;
    exists(filepath: string): Promise<boolean>;
    mkdir(filepath: string, options?: { NSURLIsExcludedFromBackupKey?: boolean }): Promise<void>;
    copyFile(filepath: string, destPath: string): Promise<void>;
    readFile(filepath: string, encoding?: string): Promise<string>;
    unlink(filepath: string): Promise<void>;
    stat(filepath: string): Promise<StatResult>;
  };
  export default RNFS;
}

declare module 'react-native-image-picker' {
  export interface Asset {
    uri?: string;
    fileName?: string;
    type?: string;
    width?: number;
    height?: number;
    fileSize?: number;
  }
  export interface ImagePickerResponse {
    didCancel?: boolean;
    errorCode?: string;
    errorMessage?: string;
    assets?: Asset[];
  }
  export interface ImageLibraryOptions {
    mediaType: 'photo' | 'video' | 'mixed';
    quality?: number;
    selectionLimit?: number;
    includeBase64?: boolean;
  }
  export interface CameraOptions {
    mediaType: 'photo' | 'video' | 'mixed';
    quality?: number;
    cameraType?: 'back' | 'front';
    includeBase64?: boolean;
  }
  export function launchImageLibrary(options: ImageLibraryOptions): Promise<ImagePickerResponse>;
  export function launchCamera(options: CameraOptions): Promise<ImagePickerResponse>;
}

declare module 'react-native-keychain' {
  export interface Options {
    service?: string;
    accessGroup?: string;
  }
  export interface UserCredentials {
    username: string;
    password: string;
    service: string;
    storage: string;
  }
  export function setGenericPassword(username: string, password: string, options?: Options): Promise<false | { service: string; storage: string }>;
  export function getGenericPassword(options?: Options): Promise<false | UserCredentials>;
  export function resetGenericPassword(options?: Options): Promise<boolean>;
}

declare module 'react-native-sqlite-storage' {
  export interface ResultSet {
    insertId: number;
    rowsAffected: number;
    rows: {
      length: number;
      item(index: number): unknown;
    };
  }
  export interface SQLiteDatabase {
    executeSql(statement: string, params?: unknown[]): Promise<[ResultSet]>;
    close(): Promise<void>;
  }
  export interface DatabaseParams {
    name: string;
    location?: string;
    createFromLocation?: number | string;
  }
  function openDatabase(params: DatabaseParams): Promise<SQLiteDatabase>;
  function enablePromise(enable: boolean): void;
  const SQLite: {
    openDatabase: typeof openDatabase;
    enablePromise: typeof enablePromise;
    SQLiteDatabase: SQLiteDatabase;
  };
  export default SQLite;
}
