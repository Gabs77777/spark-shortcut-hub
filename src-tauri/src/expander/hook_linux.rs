#[cfg(target_os = "linux")]
use rdev::{listen, Event, EventType, Key};

pub fn start_hook() {
    if let Err(error) = listen(callback) {
        eprintln!("Error listening to events: {:?}", error);
    }
}

fn callback(event: Event) {
    if !crate::expander::is_active() {
        return;
    }

    match event.event_type {
        EventType::KeyPress(key) => {
            if let Some(character) = key_to_char(key) {
                crate::engine::on_key_typed(character);
            }
        }
        _ => {}
    }
}

fn key_to_char(key: Key) -> Option<char> {
    match key {
        Key::KeyA => Some('a'),
        Key::KeyB => Some('b'),
        Key::KeyC => Some('c'),
        Key::KeyD => Some('d'),
        Key::KeyE => Some('e'),
        Key::KeyF => Some('f'),
        Key::KeyG => Some('g'),
        Key::KeyH => Some('h'),
        Key::KeyI => Some('i'),
        Key::KeyJ => Some('j'),
        Key::KeyK => Some('k'),
        Key::KeyL => Some('l'),
        Key::KeyM => Some('m'),
        Key::KeyN => Some('n'),
        Key::KeyO => Some('o'),
        Key::KeyP => Some('p'),
        Key::KeyQ => Some('q'),
        Key::KeyR => Some('r'),
        Key::KeyS => Some('s'),
        Key::KeyT => Some('t'),
        Key::KeyU => Some('u'),
        Key::KeyV => Some('v'),
        Key::KeyW => Some('w'),
        Key::KeyX => Some('x'),
        Key::KeyY => Some('y'),
        Key::KeyZ => Some('z'),
        Key::Num0 => Some('0'),
        Key::Num1 => Some('1'),
        Key::Num2 => Some('2'),
        Key::Num3 => Some('3'),
        Key::Num4 => Some('4'),
        Key::Num5 => Some('5'),
        Key::Num6 => Some('6'),
        Key::Num7 => Some('7'),
        Key::Num8 => Some('8'),
        Key::Num9 => Some('9'),
        Key::Space => Some(' '),
        Key::Slash => Some('/'),
        Key::Minus => Some('-'),
        Key::Dot => Some('.'),
        Key::Comma => Some(','),
        Key::Backspace => Some('\x08'),
        _ => None,
    }
}