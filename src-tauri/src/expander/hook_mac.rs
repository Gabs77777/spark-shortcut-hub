#[cfg(target_os = "macos")]
use core_graphics::event::{
    CGEvent, CGEventFlags, CGEventTap, CGEventTapLocation, CGEventTapOptions, CGEventTapPlacement,
    CGEventType, EventField,
};
use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};
use std::os::raw::c_void;

pub fn start_hook() {
    let event_tap = CGEventTap::new(
        CGEventTapLocation::HID,
        CGEventTapPlacement::HeadInsertEventTap,
        CGEventTapOptions::Default,
        vec![CGEventType::KeyDown, CGEventType::KeyUp],
        |_proxy, _event_type, event| {
            // Handle key events here
            handle_key_event(event);
            event
        },
    );

    match event_tap {
        Ok(tap) => {
            let loop_source = tap
                .mach_port
                .create_runloop_source(0)
                .expect("Failed to create runloop source");
            
            unsafe {
                let run_loop = core_foundation::runloop::CFRunLoop::get_current();
                run_loop.add_source(&loop_source, core_foundation::runloop::kCFRunLoopCommonModes);
                
                tap.enable();
                core_foundation::runloop::CFRunLoop::run_current();
            }
        }
        Err(err) => {
            eprintln!("Failed to create event tap: {:?}", err);
        }
    }
}

fn handle_key_event(event: CGEvent) {
    if let Some(unicode_string) = event.get_string_value_field(EventField::KeyboardEventUnicodeString) {
        if let Some(character) = unicode_string.chars().next() {
            crate::engine::on_key_typed(character);
        }
    }
}