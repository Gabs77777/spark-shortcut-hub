# Spark Shortcut Hub

A powerful desktop snippet manager built with Tauri, React, and Rust that provides system-wide text expansion functionality.

## Features

- **System-wide snippet expansion**: Works in any application (Gmail, Slack, VS Code, etc.)
- **Global keyboard hooks**: Captures keystrokes across all applications
- **Variable system**: Support for dynamic content like dates, clipboard, calculations
- **Import/Export**: Import snippets from Text Blaze and other formats
- **System tray**: Runs in background with pause/resume functionality
- **Cross-platform**: Works on macOS, Windows, and Linux
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Quick Start

### Prerequisites

- Rust (latest stable version)
- Node.js and npm
- Platform-specific requirements:
  - **macOS**: Xcode command line tools
  - **Windows**: Visual Studio Build Tools
  - **Linux**: Development packages (gcc, webkit2gtk)

### Development

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd spark-shortcut-hub
```

2. **Install dependencies**
```bash
npm install
```

3. **Run in development mode**
```bash
npm run tauri dev
```

### Building for Production

1. **Build the application**
```bash
npm run tauri build
```

2. **Find your built application**
- **macOS**: `src-tauri/target/release/bundle/macos/Spark Shortcut Hub.app`
- **Windows**: `src-tauri/target/release/bundle/msi/Spark Shortcut Hub_0.1.0_x64_en-US.msi`
- **Linux**: `src-tauri/target/release/bundle/deb/spark-shortcut-hub_0.1.0_amd64.deb`

## Platform-Specific Setup

### macOS

1. **Grant Accessibility Permissions**
   - Open System Preferences > Security & Privacy > Privacy
   - Select "Accessibility" from the left panel
   - Click the lock icon and enter your password
   - Add "Spark Shortcut Hub" to the list of allowed applications

2. **Enable Auto-start**
   - Add the app to Login Items in System Preferences > Users & Groups

### Windows

1. **Grant Low-level Keyboard Hook Permissions**
   - The app will request administrator privileges on first run
   - Allow the permission to enable system-wide keyboard monitoring

2. **Enable Auto-start**
   - The app will add itself to Windows startup programs automatically
   - You can manage this in Task Manager > Startup tab

### Linux

1. **Install X11 development packages** (if not already installed)
```bash
# Ubuntu/Debian
sudo apt-get install libx11-dev libxtst-dev libxkbcommon-dev

# Fedora
sudo dnf install libX11-devel libXtst-devel libxkbcommon-devel
```

2. **Grant Input Event Permissions**
   - Add your user to the `input` group:
```bash
sudo usermod -a -G input $USER
```
   - Log out and log back in for changes to take effect

## Usage

### Creating Snippets

1. Click "New snippet" in the interface
2. Enter a name, shortcut (starting with `/`), and body text
3. Use variables for dynamic content:
   - `{{date:YYYY-MM-DD}}` - Current date with custom format
   - `{{time:HH:mm}}` - Current time with custom format
   - `{{clipboard}}` - Current clipboard content
   - `{{cursor}}` - Cursor placement marker
   - `{{calc: 2 + 2}}` - Mathematical calculations
   - `{{env:USER}}` - Environment variables

### Using Snippets

1. **Automatic expansion**: Type your shortcut (e.g., `/email`) in any application
2. **Global hotkey**: Press `Ctrl+Alt+Space` (Windows/Linux) or `Cmd+Option+Space` (macOS) to open search palette

### Settings

- **Toggle expansion**: Enable/disable automatic expansion
- **Change global hotkey**: Customize the search palette shortcut
- **Exclude applications**: Prevent expansion in specific apps (password managers, terminals)

### Importing from Text Blaze

1. Export your snippets from Text Blaze as JSON
2. Click "Import" in the app header
3. Upload the JSON file or paste the data directly
4. Review and confirm the import

## Troubleshooting

### macOS Issues

- **Snippets not expanding**: Ensure Accessibility permissions are granted
- **App won't start**: Check Gatekeeper settings, you may need to allow the app in Security preferences

### Windows Issues

- **Permission errors**: Run as administrator on first launch
- **Antivirus blocking**: Add the app to your antivirus whitelist (keyboard hooks can trigger false positives)

### Linux Issues

- **Key events not captured**: Ensure you're in the `input` group and have proper X11 permissions
- **Wayland compatibility**: Some Wayland compositors may have limited support; X11 is recommended

### General Issues

- **High CPU usage**: Check Settings > Excluded Applications to prevent expansion in problematic apps
- **Clipboard issues**: Ensure no other clipboard managers are interfering
- **Database errors**: Delete `~/.config/spark-shortcuts/data.db` to reset (will lose all snippets)

## Development

### Project Structure

```
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── lib/               # Tauri API wrapper
│   └── pages/             # Application pages
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── expander/      # Platform-specific keyboard hooks
│   │   ├── engine.rs      # Core expansion engine
│   │   ├── vars.rs        # Variable resolvers
│   │   ├── database.rs    # SQLite operations
│   │   └── api.rs         # Tauri commands
│   └── Cargo.toml         # Rust dependencies
└── package.json           # Node.js dependencies
```

### Adding New Variable Types

1. Add regex pattern in `src-tauri/src/vars.rs`
2. Implement resolver function
3. Add to the main `render_snippet` function
4. Update documentation

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check this README for common solutions
2. Search existing GitHub issues
3. Create a new issue with detailed information about your problem

## Architecture Notes

- **Frontend**: React with TypeScript and Tailwind CSS
- **Backend**: Rust with Tauri framework
- **Database**: SQLite for local storage
- **IPC**: Tauri's invoke system for frontend-backend communication
- **Keyboard Hooks**: Platform-specific implementations (Core Graphics on macOS, Win32 API on Windows, rdev on Linux)
- **Text Expansion**: Ring buffer for keystroke tracking, regex matching, clipboard manipulation for text insertion