# NXvms Client

A modern, cross-platform Video Management System (VMS) desktop client built with Electron, React, and TypeScript.

## Overview

NXvms Client is the desktop application for the NXvms Video Management System. It provides a comprehensive interface for viewing, managing, and controlling IP cameras and video surveillance infrastructure.

## Features

### Implemented (Step 1)
- ✅ **Authentication**
  - Login with username/password
  - Multi-server directory
  - JWT token management with refresh
  - Session persistence

- ✅ **Resource Management**
  - Hierarchical resource tree (sites → servers → cameras → groups)
  - Expand/collapse functionality
  - Camera status indicators
  - Search and filter capabilities
  - Drag and drop support

- ✅ **Layout System**
  - 1x1, 2x2, 3x3, 4x4 grid layouts
  - Custom grid support
  - Camera drag and drop between cells
  - Fullscreen mode
  - Multi-monitor support

- ✅ **Live Viewing**
  - Multi-protocol video player (WebRTC, HLS, DASH, RTSP)
  - Play/pause controls
  - Volume control
  - Fullscreen support
  - Loading and error states
  - Camera name and recording indicators

- ✅ **Navigation**
  - Tab-based navigation (Live, Playback, Events, Bookmarks, Export, Health, Settings)
  - User menu with logout
  - Notification center with unread count

### Planned (Future Iterations)
- ⏳ **Playback Module**
  - Timeline visualization
  - Scrubbing control
  - Speed control (0.25x - 16x)
  - Frame-by-frame navigation

- ⏳ **Events Module**
  - Events panel with filtering
  - Smart search
  - Event acknowledgment

- ⏳ **Bookmarks Module**
  - Bookmark CRUD operations
  - Tags and notes
  - Bookmark management

- ⏳ **Export Module**
  - Time range selection
  - Watermark options
  - Export progress tracking
  - Hash generation

- ⏳ **Health Module**
  - System health dashboard
  - Camera status monitoring
  - Storage status
  - System metrics display
  - Alerts panel

- ⏳ **Notifications Module**
  - In-app notification center
  - Desktop notifications
  - Notification preferences

- ⏳ **Permissions Module**
  - User management UI
  - Role management
  - ACL editor
  - Permission display

- ⏳ **PTZ Controls**
  - Pan/Tilt/Zoom controls
  - Preset management
  - Digital zoom

- ⏳ **Snapshot**
  - Capture and save snapshots
  - Format selection

## Tech Stack

- **Framework**: Electron 28+
- **UI**: React 18+
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+
- **State Management**: Zustand 4+
- **Routing**: React Router 6+
- **Video**: HLS.js, Video.js
- **Build Tool**: Vite 5+
- **Package Manager**: npm

## Project Structure

```
client/
├── main/                    # Electron main process
├── preload/                  # Preload script
├── src/                      # React application
│   ├── auth/                # Authentication
│   ├── resources/            # Resource tree
│   ├── layout/              # Layout system
│   ├── live-view/           # Live viewing
│   ├── core/                # State management
│   └── shared/              # Shared utilities
├── mock-server/              # Development mock server
└── Configuration files
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional) Git for cloning

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd NXvms/client

# Install dependencies
npm install
```

### Development

```bash
# Start mock server (in one terminal)
node mock-server/mock-api.ts

# Start development server (in another terminal)
npm run dev
```

The application will open automatically with hot module replacement enabled.

### Building

```bash
# Build for production
npm run build

# Build for specific platform
npm run build -- --win    # Windows
npm run build -- --mac     # macOS
npm run build -- --linux   # Linux
```

### Testing

```bash
# Run unit tests
npm test

# Run tests with UI
npm run test:ui
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000/ws

# Application Settings
VITE_APP_NAME=NXvms
VITE_APP_VERSION=0.1.0
```

### Mock Server

The mock server provides:
- Authentication (admin/password)
- 4 mock cameras with different statuses
- Resource tree structure
- Timeline data
- Events and bookmarks
- Health metrics

**Mock Credentials:**
- Username: `admin`
- Password: `password`

## API Integration

The client is designed to work with the NXvms Server API. See [`../plans/02-api-contract.md`](../plans/02-api-contract.md) for the complete API specification.

### Connecting to Real Server

```typescript
import { getApiClient } from './shared/api-client';

// Initialize with real server URL
const apiClient = getApiClient('https://your-vms-server.com/api/v1');

// All API methods are available
await apiClient.login({ username, password, serverUrl });
await apiClient.getResourceTree();
await apiClient.startLiveStream({ cameraId, profileId, transport });
```

## Architecture

### State Management

The application uses Zustand for global state management with the following stores:

- **Auth Store**: User authentication and session
- **Resources Store**: Sites, servers, cameras
- **Layout Store**: Layouts and current view
- **View Mode Store**: Current view mode
- **Notifications Store**: Notifications and unread count
- **Server Directory Store**: Saved servers
- **Theme Store**: Theme preference
- **Loading Store**: Loading state
- **Error Store**: Error messages

### Component Architecture

Components are organized by feature module with clear separation of concerns:

- **Container Components**: Handle state and business logic
- **Presentational Components**: Pure UI components
- **Shared Components**: Reusable UI elements

### IPC Communication

The Electron main process exposes the following APIs to the renderer:

- Window management (create, close, fullscreen)
- File system operations (select, read, write)
- Clipboard operations
- URL opening
- Notifications

## Performance

### Optimization Strategies

- State memoization with Zustand
- Component lazy loading
- Efficient re-render patterns
- Debounced search/filter operations
- Optimized video player initialization

### Target Performance

- Startup time: < 3 seconds
- Frame rate: 60 FPS for UI
- Memory usage: < 500 MB idle
- CPU usage: < 10% idle

## Security

### Implemented

- JWT token storage in localStorage (consider using Electron's safeStorage for production)
- Token refresh mechanism
- Secure API communication
- CORS handling
- Input validation

### Future Enhancements

- Electron safeStorage for sensitive data
- Certificate pinning
- Biometric authentication
- Encrypted local storage

## Browser Compatibility

The client is built with Electron, providing consistent behavior across:

- Windows 10+
- macOS 10.15+
- Linux (various distributions)

## Troubleshooting

### Common Issues

**Application won't start**
- Ensure Node.js 18+ is installed
- Delete `node_modules` and run `npm install`
- Check port 5173 is available

**Video won't play**
- Check camera stream URL is accessible
- Verify codec support (H264/H265)
- Check browser console for errors

**Can't connect to server**
- Verify server URL is correct
- Check network connectivity
- Ensure CORS is configured on server

**State not persisting**
- Check localStorage is enabled
- Verify browser privacy settings
- Clear application data and re-login

## Development

### Code Style

The project follows these conventions:

- TypeScript strict mode
- Functional components with hooks
- Consistent naming (PascalCase for components, camelCase for functions)
- Clear file organization by feature

### Commit Conventions

```
feat: Add new feature
fix: Fix bug
refactor: Refactor code
docs: Update documentation
test: Add tests
chore: Maintenance tasks
```

## Roadmap

### Phase 1: MVP (Current)
- ✅ Basic authentication
- ✅ Resource tree
- ✅ Layout system
- ✅ Live viewing
- ⏳ Basic playback
- ⏳ Basic events
- ⏳ Basic export

### Phase 2: Enhanced Features
- ⏳ Advanced playback with timeline
- ⏳ Smart search
- ⏳ PTZ controls
- ⏳ Digital zoom
- ⏳ Full bookmarks system
- ⏳ Complete export system
- ⏳ Health monitoring
- ⏳ Notification center
- ⏳ User management

### Phase 3: Enterprise
- ⏳ Multi-site management
- ⏳ Advanced analytics
- ⏳ Cloud storage
- ⏳ SSO integration
- ⏳ Audit logging
- ⏳ Advanced permissions

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions, please visit:

- GitHub Issues: [repository-url]/issues
- Documentation: [repository-url]/wiki
- Discussions: [repository-url]/discussions

## Acknowledgments

Built with:
- Electron
- React
- TypeScript
- Tailwind CSS
- And many other open-source projects
