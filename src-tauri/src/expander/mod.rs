use std::sync::{Arc, Mutex};
use std::thread;

#[cfg(target_os = "macos")]
mod hook_mac;
#[cfg(target_os = "windows")]
mod hook_windows;
#[cfg(target_os = "linux")]
mod hook_linux;

static EXPANDER_ACTIVE: Mutex<bool> = Mutex::new(false);

pub fn start() {
    let mut active = EXPANDER_ACTIVE.lock().unwrap();
    if *active {
        return; // Already running
    }
    *active = true;
    drop(active);

    thread::spawn(|| {
        #[cfg(target_os = "macos")]
        hook_mac::start_hook();
        
        #[cfg(target_os = "windows")]
        hook_windows::start_hook();
        
        #[cfg(target_os = "linux")]
        hook_linux::start_hook();
    });
}

pub fn stop() {
    let mut active = EXPANDER_ACTIVE.lock().unwrap();
    *active = false;
}

pub fn reload() {
    stop();
    start();
}

pub fn is_active() -> bool {
    *EXPANDER_ACTIVE.lock().unwrap()
}