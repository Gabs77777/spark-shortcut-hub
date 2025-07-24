use regex::Regex;
use std::collections::VecDeque;
use std::sync::{Arc, Mutex};
use copypasta::{ClipboardContext, ClipboardProvider};

static BUFFER: Mutex<VecDeque<char>> = Mutex::new(VecDeque::new());
const BUFFER_SIZE: usize = 100;

lazy_static::lazy_static! {
    static ref SHORTCUT_REGEX: Regex = Regex::new(r"/([a-zA-Z0-9_\-.]+)$").unwrap();
}

pub fn on_key_typed(character: char) {
    let mut buffer = BUFFER.lock().unwrap();
    
    if character == '\x08' { // Backspace
        buffer.pop_back();
    } else {
        buffer.push_back(character);
        if buffer.len() > BUFFER_SIZE {
            buffer.pop_front();
        }
    }

    // Check for shortcut match
    let buffer_str: String = buffer.iter().collect();
    if let Some(captures) = SHORTCUT_REGEX.captures(&buffer_str) {
        if let Some(shortcut_match) = captures.get(0) {
            let shortcut = shortcut_match.as_str();
            
            // Check if this shortcut exists in our database
            if let Some(snippet_body) = get_snippet_by_shortcut(shortcut) {
                expand_snippet(shortcut, &snippet_body);
            }
        }
    }
}

fn get_snippet_by_shortcut(shortcut: &str) -> Option<String> {
    // This would query the database for the snippet
    // For now, return a placeholder
    match shortcut {
        "/green" => Some("🟢 Green Color: #22c55e".to_string()),
        "/json" => Some(r#"{"key": "value"}"#.to_string()),
        "/send" => Some("Best regards,\nJohn Doe".to_string()),
        "/drop" => Some("Let me know if you need anything else!".to_string()),
        _ => None,
    }
}

fn expand_snippet(shortcut: &str, body: &str) {
    // Send backspaces to delete the shortcut
    send_backspaces(shortcut.len());
    
    // Render the snippet with variables
    let rendered = crate::vars::render_snippet(body);
    
    // Paste the rendered text
    paste_text(&rendered);
}

fn send_backspaces(count: usize) {
    #[cfg(target_os = "macos")]
    {
        use core_graphics::event::{CGEvent, CGEventType, CGKeyCode};
        use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};
        
        for _ in 0..count {
            let source = CGEventSource::new(CGEventSourceStateID::HIDSystemState).unwrap();
            let key_down = CGEvent::new_keyboard_event(source.clone(), 51, true).unwrap(); // 51 is backspace
            let key_up = CGEvent::new_keyboard_event(source, 51, false).unwrap();
            
            key_down.post(CGEventTapLocation::HID);
            key_up.post(CGEventTapLocation::HID);
        }
    }
    
    #[cfg(target_os = "windows")]
    {
        use winapi::um::winuser::{SendInput, INPUT, INPUT_KEYBOARD, KEYEVENTF_KEYUP};
        use winapi::um::winuser::VK_BACK;
        
        for _ in 0..count {
            let mut inputs = [
                INPUT {
                    type_: INPUT_KEYBOARD,
                    u: std::mem::zeroed(),
                },
                INPUT {
                    type_: INPUT_KEYBOARD,
                    u: std::mem::zeroed(),
                }
            ];
            
            unsafe {
                inputs[0].u.ki_mut().wVk = VK_BACK as u16;
                inputs[1].u.ki_mut().wVk = VK_BACK as u16;
                inputs[1].u.ki_mut().dwFlags = KEYEVENTF_KEYUP;
                
                SendInput(2, inputs.as_mut_ptr(), std::mem::size_of::<INPUT>() as i32);
            }
        }
    }
}

fn paste_text(text: &str) {
    // Save current clipboard
    let mut ctx = ClipboardContext::new().unwrap();
    let original_clipboard = ctx.get_contents().unwrap_or_default();
    
    // Set our text to clipboard
    let _ = ctx.set_contents(text.to_string());
    
    // Send Ctrl+V (or Cmd+V on macOS)
    #[cfg(target_os = "macos")]
    {
        use core_graphics::event::{CGEvent, CGEventFlags, CGKeyCode};
        use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};
        
        let source = CGEventSource::new(CGEventSourceStateID::HIDSystemState).unwrap();
        let key_down = CGEvent::new_keyboard_event(source.clone(), 9, true).unwrap(); // 9 is 'v'
        let key_up = CGEvent::new_keyboard_event(source, 9, false).unwrap();
        
        key_down.set_flags(CGEventFlags::CGEventFlagCommand);
        key_up.set_flags(CGEventFlags::CGEventFlagCommand);
        
        key_down.post(CGEventTapLocation::HID);
        key_up.post(CGEventTapLocation::HID);
    }
    
    #[cfg(target_os = "windows")]
    {
        use winapi::um::winuser::{SendInput, INPUT, INPUT_KEYBOARD, KEYEVENTF_KEYUP};
        use winapi::um::winuser::{VK_CONTROL, VK_V};
        
        let mut inputs = [
            INPUT { type_: INPUT_KEYBOARD, u: std::mem::zeroed() },
            INPUT { type_: INPUT_KEYBOARD, u: std::mem::zeroed() },
            INPUT { type_: INPUT_KEYBOARD, u: std::mem::zeroed() },
            INPUT { type_: INPUT_KEYBOARD, u: std::mem::zeroed() },
        ];
        
        unsafe {
            // Ctrl down
            inputs[0].u.ki_mut().wVk = VK_CONTROL as u16;
            // V down
            inputs[1].u.ki_mut().wVk = VK_V as u16;
            // V up
            inputs[2].u.ki_mut().wVk = VK_V as u16;
            inputs[2].u.ki_mut().dwFlags = KEYEVENTF_KEYUP;
            // Ctrl up
            inputs[3].u.ki_mut().wVk = VK_CONTROL as u16;
            inputs[3].u.ki_mut().dwFlags = KEYEVENTF_KEYUP;
            
            SendInput(4, inputs.as_mut_ptr(), std::mem::size_of::<INPUT>() as i32);
        }
    }
    
    // Restore original clipboard after a short delay
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(100));
        let mut ctx = ClipboardContext::new().unwrap();
        let _ = ctx.set_contents(original_clipboard);
    });
}