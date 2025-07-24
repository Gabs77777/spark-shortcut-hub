import { invoke } from '@tauri-apps/api/core';

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
  invoke('create_user', { request: { email, password } });

export const login = (email: string, password: string): Promise<User> =>
  invoke('login', { request: { email, password } });

// Folder management  
export const listFolders = (userId: number): Promise<Folder[]> =>
  invoke('list_folders', { userId });

export const createFolder = (userId: number, name: string, parentId?: number): Promise<Folder> =>
  invoke('create_folder', { userId, name, parentId });

// Snippet management
export const listSnippets = (userId: number, folderId?: number): Promise<Snippet[]> =>
  invoke('list_snippets', { userId, folderId });

export const createSnippet = (
  userId: number,
  request: { name: string; shortcut: string; body: string; folder_id?: number }
): Promise<Snippet> =>
  invoke('create_snippet', { userId, request });

export const updateSnippet = (
  snippetId: number,
  request: Partial<{ name: string; shortcut: string; body: string; folder_id?: number; is_active: boolean }>
): Promise<void> =>
  invoke('update_snippet', { snippetId, request });

export const deleteSnippet = (snippetId: number): Promise<void> =>
  invoke('delete_snippet', { snippetId });

// Import/Export
export const importTextBlaze = (userId: number, jsonData: string): Promise<string> =>
  invoke('import_textblaze', { userId, jsonData });

// Settings
export const getSettings = (): Promise<Settings> =>
  invoke('get_settings');

export const updateSettings = (settings: Settings): Promise<void> =>
  invoke('update_settings', { settings });

export const reloadEngine = (): Promise<void> =>
  invoke('reload_engine');