use sqlx::{SqlitePool, Row};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: i64,
    pub email: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Folder {
    pub id: i64,
    pub user_id: i64,
    pub name: String,
    pub parent_id: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Snippet {
    pub id: i64,
    pub user_id: i64,
    pub folder_id: Option<i64>,
    pub name: String,
    pub shortcut: String,
    pub body: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub is_active: bool,
    pub match_type: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Variable {
    pub id: i64,
    pub snippet_id: i64,
    pub key: String,
    pub var_type: String,
    pub default_value: Option<String>,
}

pub async fn init_db() -> Result<SqlitePool, sqlx::Error> {
    let db_path = get_db_path();
    std::fs::create_dir_all(std::path::Path::new(&db_path).parent().unwrap()).unwrap();
    
    let pool = SqlitePool::connect(&format!("sqlite://{}", db_path)).await?;
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(&pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            parent_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (parent_id) REFERENCES folders (id)
        )
        "#,
    )
    .execute(&pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS snippets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            folder_id INTEGER,
            name TEXT NOT NULL,
            shortcut TEXT UNIQUE NOT NULL,
            body TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1,
            match_type TEXT DEFAULT 'exact',
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (folder_id) REFERENCES folders (id)
        )
        "#,
    )
    .execute(&pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS variables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            snippet_id INTEGER NOT NULL,
            key TEXT NOT NULL,
            type TEXT NOT NULL,
            default_value TEXT,
            FOREIGN KEY (snippet_id) REFERENCES snippets (id)
        )
        "#,
    )
    .execute(&pool)
    .await?;

    Ok(pool)
}

fn get_db_path() -> String {
    let app_dir = dirs::config_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("spark-shortcuts");
    
    app_dir.join("data.db").to_string_lossy().to_string()
}