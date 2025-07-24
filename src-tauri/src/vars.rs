use regex::Regex;
use chrono::Local;
use copypasta::{ClipboardContext, ClipboardProvider};
use evalexpr::eval;

lazy_static::lazy_static! {
    static ref DATE_REGEX: Regex = Regex::new(r"\{\{date:([^}]+)\}\}").unwrap();
    static ref TIME_REGEX: Regex = Regex::new(r"\{\{time:([^}]+)\}\}").unwrap();
    static ref CLIPBOARD_REGEX: Regex = Regex::new(r"\{\{clipboard\}\}").unwrap();
    static ref CURSOR_REGEX: Regex = Regex::new(r"\{\{cursor\}\}").unwrap();
    static ref INPUT_REGEX: Regex = Regex::new(r"\{\{input:([^:}]+):([^}]*)\}\}").unwrap();
    static ref SELECT_REGEX: Regex = Regex::new(r"\{\{select:([^:}]+):([^}]+)\}\}").unwrap();
    static ref CALC_REGEX: Regex = Regex::new(r"\{\{calc:\s*([^}]+)\}\}").unwrap();
    static ref ENV_REGEX: Regex = Regex::new(r"\{\{env:([^}]+)\}\}").unwrap();
}

pub fn render_snippet(body: &str) -> String {
    let mut result = body.to_string();
    
    // Replace date variables
    result = DATE_REGEX.replace_all(&result, |caps: &regex::Captures| {
        let format = &caps[1];
        Local::now().format(format).to_string()
    }).to_string();
    
    // Replace time variables
    result = TIME_REGEX.replace_all(&result, |caps: &regex::Captures| {
        let format = &caps[1];
        Local::now().format(format).to_string()
    }).to_string();
    
    // Replace clipboard
    result = CLIPBOARD_REGEX.replace_all(&result, |_caps: &regex::Captures| {
        let mut ctx = ClipboardContext::new().unwrap();
        ctx.get_contents().unwrap_or_default()
    }).to_string();
    
    // Replace cursor (remove for now, handle placement separately)
    result = CURSOR_REGEX.replace_all(&result, "").to_string();
    
    // Replace calc expressions
    result = CALC_REGEX.replace_all(&result, |caps: &regex::Captures| {
        let expression = &caps[1];
        match eval(expression) {
            Ok(value) => value.to_string(),
            Err(_) => format!("{{{{calc: {}}}}}", expression), // Keep original if error
        }
    }).to_string();
    
    // Replace environment variables
    result = ENV_REGEX.replace_all(&result, |caps: &regex::Captures| {
        let env_var = &caps[1];
        std::env::var(env_var).unwrap_or_default()
    }).to_string();
    
    // TODO: Handle input and select variables with modal dialogs
    
    result
}

pub fn has_cursor_marker(body: &str) -> bool {
    CURSOR_REGEX.is_match(body)
}

pub fn get_cursor_position(body: &str) -> Option<usize> {
    if let Some(mat) = CURSOR_REGEX.find(body) {
        Some(mat.start())
    } else {
        None
    }
}