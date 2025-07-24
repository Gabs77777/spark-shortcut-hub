mod database;
mod expander;
mod engine;
mod vars;
mod api;

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Manager, Runtime, SystemTray, Window,
};
use std::sync::{Arc, Mutex};

pub type AppState = Arc<Mutex<AppStateInner>>;

pub struct AppStateInner {
    pub expander_active: bool,
    pub db: Option<sqlx::SqlitePool>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state = Arc::new(Mutex::new(AppStateInner {
        expander_active: false,
        db: None,
    }));

    tauri::Builder::default()
        .manage(state.clone())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let handle = app.handle().clone();
            
            // Initialize database
            tauri::async_runtime::spawn(async move {
                if let Ok(db) = database::init_db().await {
                    if let Ok(mut state_lock) = state.lock() {
                        state_lock.db = Some(db);
                    }
                }
            });

            // Setup system tray
            let pause_item = MenuItem::new(app, "pause", "Pause", true, None::<&str>)?;
            let resume_item = MenuItem::new(app, "resume", "Resume", true, None::<&str>)?;
            let quit_item = MenuItem::new(app, "quit", "Quit", true, None::<&str>)?;
            let show_item = MenuItem::new(app, "show", "Show Window", true, None::<&str>)?;
            
            let menu = Menu::with_items(app, &[&show_item, &pause_item, &resume_item, &quit_item])?;
            
            TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "pause" => {
                        expander::stop();
                    }
                    "resume" => {
                        expander::start();
                    }
                    "quit" => {
                        expander::stop();
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            // Start the expander
            expander::start();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            api::create_user,
            api::login,
            api::list_folders,
            api::create_folder,
            api::list_snippets,
            api::create_snippet,
            api::update_snippet,
            api::delete_snippet,
            api::import_textblaze,
            api::get_settings,
            api::update_settings,
            api::reload_engine
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run();
}