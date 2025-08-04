import { invoke } from '@tauri-apps/api/core';

// Check if we're in a Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// Mock invoke function for browser development
const mockInvoke = async (cmd: string, args?: any): Promise<any> => {
  console.log(`Mock Tauri invoke: ${cmd}`, args);
  
  switch (cmd) {
    case 'create_user':
      return { id: 1, email: args.request.email, password_hash: '', created_at: new Date().toISOString() };
    case 'login':
      return { id: 1, email: args.request.email, password_hash: '', created_at: new Date().toISOString() };
    case 'list_folders':
      return [];
    case 'create_folder':
      return { id: Date.now(), user_id: args.userId, name: args.name, parent_id: args.parentId };
    case 'list_snippets':
      return [];
    case 'create_snippet':
      return {
        id: Date.now(),
        user_id: args.userId,
        folder_id: args.request.folder_id,
        name: args.request.name,
        shortcut: args.request.shortcut,
        body: args.request.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        match_type: 'exact'
      };
    case 'get_settings':
      return { expand_enabled: true, global_hotkey: 'Ctrl+Shift+Space', excluded_apps: [] };
    default:
      return null;
  }
};

// Use real invoke in Tauri, mock in browser
const safeInvoke = isTauri ? invoke : mockInvoke;

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Folder {
  id: number;
  user_id: number;
  name: string;
  parent_id?: number;
}

export interface Snippet {
  id: number;
  user_id: number;
  folder_id?: number;
  name: string;
  shortcut: string;
  body: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  match_type: string;
}

export interface Settings {
  expand_enabled: boolean;
  global_hotkey: string;
  excluded_apps: string[];
}

// User management
export const createUser = (email: string, password: string): Promise<User> =>
  safeInvoke('create_user', { request: { email, password } });

export const login = (email: string, password: string): Promise<User> =>
  safeInvoke('login', { request: { email, password } });

// Folder management  
export const listFolders = (userId: number): Promise<Folder[]> =>
  safeInvoke('list_folders', { userId });

export const createFolder = (userId: number, name: string, parentId?: number): Promise<Folder> =>
  safeInvoke('create_folder', { userId, name, parentId });

// Snippet management
export const listSnippets = (userId: number, folderId?: number): Promise<Snippet[]> =>
  safeInvoke('list_snippets', { userId, folderId });

export const createSnippet = (
  userId: number,
  request: { name: string; shortcut: string; body: string; folder_id?: number }
): Promise<Snippet> =>
  safeInvoke('create_snippet', { userId, request });

export const updateSnippet = (
  snippetId: number,
  request: Partial<{ name: string; shortcut: string; body: string; folder_id?: number; is_active: boolean }>
): Promise<void> =>
  safeInvoke('update_snippet', { snippetId, request });

export const deleteSnippet = (snippetId: number): Promise<void> =>
  safeInvoke('delete_snippet', { snippetId });

// Import/Export
export const importTextBlaze = (userId: number, jsonData: string): Promise<string> =>
  safeInvoke('import_textblaze', { userId, jsonData });

// Settings
export const getSettings = (): Promise<Settings> =>
  safeInvoke('get_settings');

export const updateSettings = (settings: Settings): Promise<void> =>
  safeInvoke('update_settings', { settings });

export const reloadEngine = (): Promise<void> =>
  safeInvoke('reload_engine');