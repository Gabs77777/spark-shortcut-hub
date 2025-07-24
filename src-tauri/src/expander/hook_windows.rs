#[cfg(target_os = "windows")]
use winapi::um::winuser::{
    SetWindowsHookExW, UnhookWindowsHookEx, CallNextHookEx, GetMessageW, 
    HC_ACTION, WH_KEYBOARD_LL, WM_KEYDOWN, WM_CHAR, KBDLLHOOKSTRUCT
};
use winapi::um::winnt::LPCWSTR;
use winapi::shared::windef::HHOOK;
use winapi::shared::minwindef::{WPARAM, LPARAM, LRESULT, HINSTANCE};
use std::ptr;

static mut HOOK: HHOOK = ptr::null_mut();

pub fn start_hook() {
    unsafe {
        HOOK = SetWindowsHookExW(
            WH_KEYBOARD_LL,
            Some(low_level_keyboard_proc),
            ptr::null_mut(),
            0,
        );

        if HOOK.is_null() {
            eprintln!("Failed to install keyboard hook");
            return;
        }

        let mut msg = std::mem::zeroed();
        while GetMessageW(&mut msg, ptr::null_mut(), 0, 0) != 0 {
            if !crate::expander::is_active() {
                break;
            }
        }

        UnhookWindowsHookEx(HOOK);
    }
}

unsafe extern "system" fn low_level_keyboard_proc(
    n_code: i32,
    w_param: WPARAM,
    l_param: LPARAM,
) -> LRESULT {
    if n_code == HC_ACTION && w_param == WM_KEYDOWN as usize {
        let kb_struct = *(l_param as *const KBDLLHOOKSTRUCT);
        let vk_code = kb_struct.vkCode;
        
        // Convert virtual key code to character
        if let Some(character) = vk_to_char(vk_code) {
            crate::engine::on_key_typed(character);
        }
    }
    
    CallNextHookEx(HOOK, n_code, w_param, l_param)
}

fn vk_to_char(vk_code: u32) -> Option<char> {
    match vk_code {
        0x30..=0x39 => Some((vk_code - 0x30 + '0' as u32) as u8 as char), // 0-9
        0x41..=0x5A => Some((vk_code - 0x41 + 'a' as u32) as u8 as char), // A-Z -> a-z
        0xBF => Some('/'), // Forward slash
        0xBD => Some('-'), // Minus
        0xBE => Some('.'), // Period
        0xBC => Some(','), // Comma
        0x20 => Some(' '), // Space
        0x08 => Some('\x08'), // Backspace
        _ => None,
    }
}