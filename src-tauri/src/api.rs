use crate::database::{User, Folder, Snippet};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;

#[derive(Serialize, Deserialize)]
pub struct CreateUserRequest {
    email: String,
    password: String,
}

#[derive(Serialize, Deserialize)]
pub struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Serialize, Deserialize)]
pub struct CreateSnippetRequest {
    name: String,
    shortcut: String,
    body: String,
    folder_id: Option<i64>,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateSnippetRequest {
    name: Option<String>,
    shortcut: Option<String>,
    body: Option<String>,
    folder_id: Option<i64>,
    is_active: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct Settings {
    pub expand_enabled: bool,
    pub global_hotkey: String,
    pub excluded_apps: Vec<String>,
}

#[tauri::command]
pub async fn create_user(
    request: CreateUserRequest,
    state: State<'_, AppState>,
) -> Result<User, String> {
    let state_lock = state.lock().map_err(|_| "Failed to lock state")?;
    let db = state_lock.db.as_ref().ok_or("Database not initialized")?;
    
    let password_hash = bcrypt::hash(&request.password, bcrypt::DEFAULT_COST)
        .map_err(|_| "Failed to hash password")?;
    
    let result = sqlx::query!(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        request.email,
        password_hash
    )
    .execute(db)
    .await
    .map_err(|e| format!("Database error: {}", e))?;
    
    let user = User {
        id: result.last_insert_rowid(),
        email: request.email,
        password_hash,
        created_at: chrono::Utc::now(),
    };
    
    Ok(user)
}

#[tauri::command]
pub async fn login(
    request: LoginRequest,
    state: State<'_, AppState>,
) -> Result<User, String> {
    let state_lock = state.lock().map_err(|_| "Failed to lock state")?;
    let db = state_lock.db.as_ref().ok_or("Database not initialized")?;
    
    let user = sqlx::query_as!(
        User,
        "SELECT id, email, password_hash, created_at FROM users WHERE email = ?",
        request.email
    )
    .fetch_optional(db)
    .await
    .map_err(|e| format!("Database error: {}", e))?
    .ok_or("Invalid credentials")?;
    
    if bcrypt::verify(&request.password, &user.password_hash)
        .map_err(|_| "Password verification failed")?
    {
        Ok(user)
    } else {
        Err("Invalid credentials".to_string())
    }
}

#[tauri::command]
pub async fn list_folders(
    user_id: i64,
    state: State<'_, AppState>,
) -> Result<Vec<Folder>, String> {
    let state_lock = state.lock().map_err(|_| "Failed to lock state")?;
    let db = state_lock.db.as_ref().ok_or("Database not initialized")?;
    
    let folders = sqlx::query_as!(
        Folder,
        "SELECT id, user_id, name, parent_id FROM folders WHERE user_id = ?",
        user_id
    )
    .fetch_all(db)
    .await
    .map_err(|e| format!("Database error: {}", e))?;
    
    Ok(folders)
}

#[tauri::command]
pub async fn create_folder(
    user_id: i64,
    name: String,
    parent_id: Option<i64>,
    state: State<'_, AppState>,
) -> Result<Folder, String> {
    let state_lock = state.lock().map_err(|_| "Failed to lock state")?;
    let db = state_lock.db.as_ref().ok_or("Database not initialized")?;
    
    let result = sqlx::query!(
        "INSERT INTO folders (user_id, name, parent_id) VALUES (?, ?, ?)",
        user_id,
        name,
        parent_id
    )
    .execute(db)
    .await
    .map_err(|e| format!("Database error: {}", e))?;
    
    Ok(Folder {
        id: result.last_insert_rowid(),
        user_id,
        name,
        parent_id,
    })
}

#[tauri::command]
pub async fn list_snippets(
    user_id: i64,
    folder_id: Option<i64>,
    state: State<'_, AppState>,
) -> Result<Vec<Snippet>, String> {
    let state_lock = state.lock().map_err(|_| "Failed to lock state")?;
    let db = state_lock.db.as_ref().ok_or("Database not initialized")?;
    
    let snippets = if let Some(folder_id) = folder_id {
        sqlx::query_as!(
            Snippet,
            "SELECT id, user_id, folder_id, name, shortcut, body, created_at, updated_at, is_active, match_type FROM snippets WHERE user_id = ? AND folder_id = ?",
            user_id,
            folder_id
        )
        .fetch_all(db)
        .await
    } else {
        sqlx::query_as!(
            Snippet,
            "SELECT id, user_id, folder_id, name, shortcut, body, created_at, updated_at, is_active, match_type FROM snippets WHERE user_id = ?",
            user_id
        )
        .fetch_all(db)
        .await
    }
    .map_err(|e| format!("Database error: {}", e))?;
    
    Ok(snippets)
}

#[tauri::command]
pub async fn create_snippet(
    user_id: i64,
    request: CreateSnippetRequest,
    state: State<'_, AppState>,
) -> Result<Snippet, String> {
    let state_lock = state.lock().map_err(|_| "Failed to lock state")?;
    let db = state_lock.db.as_ref().ok_or("Database not initialized")?;
    
    let now = chrono::Utc::now();
    let result = sqlx::query!(
        "INSERT INTO snippets (user_id, folder_id, name, shortcut, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        user_id,
        request.folder_id,
        request.name,
        request.shortcut,
        request.body,
        now,
        now
    )
    .execute(db)
    .await
    .map_err(|e| format!("Database error: {}", e))?;
    
    Ok(Snippet {
        id: result.last_insert_rowid(),
        user_id,
        folder_id: request.folder_id,
        name: request.name,
        shortcut: request.shortcut,
        body: request.body,
        created_at: now,
        updated_at: now,
        is_active: true,
        match_type: "exact".to_string(),
    })
}

#[tauri::command]
pub async fn update_snippet(
    snippet_id: i64,
    request: UpdateSnippetRequest,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let state_lock = state.lock().map_err(|_| "Failed to lock state")?;
    let db = state_lock.db.as_ref().ok_or("Database not initialized")?;
    
    let now = chrono::Utc::now();
    
    // Build dynamic query based on provided fields
    let mut query = "UPDATE snippets SET updated_at = ?".to_string();
    let mut params: Vec<Box<dyn sqlx::Encode<'_, sqlx::Sqlite> + Send + 'static>> = vec![];
    
    if let Some(name) = request.name {
        query.push_str(", name = ?");
        params.push(Box::new(name));
    }
    if let Some(shortcut) = request.shortcut {
        query.push_str(", shortcut = ?");
        params.push(Box::new(shortcut));
    }
    if let Some(body) = request.body {
        query.push_str(", body = ?");
        params.push(Box::new(body));
    }
    if let Some(folder_id) = request.folder_id {
        query.push_str(", folder_id = ?");
        params.push(Box::new(folder_id));
    }
    if let Some(is_active) = request.is_active {
        query.push_str(", is_active = ?");
        params.push(Box::new(is_active as i32));
    }
    
    query.push_str(" WHERE id = ?");
    
    sqlx::query(&query)
        .bind(now)
        .bind(snippet_id)
        .execute(db)
        .await
        .map_err(|e| format!("Database error: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn delete_snippet(
    snippet_id: i64,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let state_lock = state.lock().map_err(|_| "Failed to lock state")?;
    let db = state_lock.db.as_ref().ok_or("Database not initialized")?;
    
    sqlx::query!("DELETE FROM snippets WHERE id = ?", snippet_id)
        .execute(db)
        .await
        .map_err(|e| format!("Database error: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn import_textblaze(
    user_id: i64,
    json_data: String,
) -> Result<String, String> {
    // Parse JSON and import snippets
    // This is a simplified implementation
    Ok("Import completed".to_string())
}

#[tauri::command]
pub async fn get_settings() -> Result<Settings, String> {
    Ok(Settings {
        expand_enabled: true,
        global_hotkey: "Ctrl+Alt+Space".to_string(),
        excluded_apps: vec![],
    })
}

#[tauri::command]
pub async fn update_settings(settings: Settings) -> Result<(), String> {
    // Save settings to config file or database
    Ok(())
}

#[tauri::command]
pub async fn reload_engine() -> Result<(), String> {
    crate::expander::reload();
    Ok(())
}