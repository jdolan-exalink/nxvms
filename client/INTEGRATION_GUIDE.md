# Integration Guide for NXvms Features

## Quick Start Integration

### 1. Import Components in Views

#### Video Player (Live View)
```typescript
// src/live-view/index.tsx
import { VideoPlayer } from './video-player';
import { PTZControls } from './ptz-controls';
import { DigitalZoom } from './digital-zoom';

export const LiveView = ({ camera }: { camera: Camera }) => {
  return (
    <VideoPlayer
      camera={camera}
      streamUrl={camera.streamUrl}
      streamType={camera.streamType}
      showPTZ={camera.capabilities?.ptz}
      onPtzControl={async (action, params) => {
        await apiClient.ptzControl(camera.id, action, params);
      }}
      onTakeSnapshot={(blob) => {
        // Handle snapshot
      }}
    />
  );
};
```

#### Playback View
```typescript
// src/playback/playback-view.tsx
import { Timeline } from './timeline';
import { PlaybackControls } from './playback-controls';
import { FrameStepControl } from './frame-step-control';

export const PlaybackView = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  return (
    <div className="space-y-4">
      <Timeline
        duration={duration}
        currentTime={currentTime}
        segments={segments}
        onSeek={(time) => handleSeek(time)}
      />
      <PlaybackControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        playbackSpeed={playbackSpeed}
        onPlayPause={togglePlay}
        onSpeedChange={setPlaybackSpeed}
        {...otherProps}
      />
      <FrameStepControl
        currentFrame={Math.floor(currentTime * fps)}
        totalFrames={Math.floor(duration * fps)}
        fps={fps}
        onFrameStep={handleFrameStep}
      />
    </div>
  );
};
```

#### Events View
```typescript
// src/events/events-view.tsx
import { SmartSearch } from './smart-search';
import { EventFilter } from './event-filter';

export const EventsView = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<EventFilterOptions>({...});
  
  return (
    <div className="space-y-4">
      <SmartSearch
        onSearch={async (searchFilter) => {
          const results = await apiClient.searchEvents(searchFilter);
          setEvents(results);
        }}
        onClear={() => setEvents([])}
      />
      <EventFilter
        eventTypes={['motion', 'alarm', 'tamper']}
        cameras={cameras}
        onFilterChange={(filter) => {
          setFilter(filter);
          // Fetch filtered events
        }}
      />
      {/* Events list */}
    </div>
  );
};
```

#### Bookmarks View
```typescript
// src/bookmarks/bookmarks-view.tsx
import { BookmarkCard } from './bookmark-card';
import { TagsManager } from './tags-manager';
import { NotesEditor } from './notes-editor';

export const BookmarksView = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onEdit={(b) => handleEditBookmark(b)}
          onDelete={(id) => handleDeleteBookmark(id)}
          onTagClick={(tag) => filterByTag(tag)}
        />
      ))}
    </div>
  );
};
```

#### Export View
```typescript
// src/export/export-view.tsx
import { ExportProgress } from './export-progress';

export const ExportView = () => {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  
  return (
    <ExportProgress
      jobs={jobs}
      onPause={async (jobId) => {
        await apiClient.pauseExport(jobId);
      }}
      onResume={async (jobId) => {
        await apiClient.resumeExport(jobId);
      }}
      onDownload={(job) => {
        window.location.href = job.downloadUrl!;
      }}
    />
  );
};
```

#### Health View
```typescript
// src/health/health-view.tsx
import { HealthAlertsPanel } from './alerts-panel';

export const HealthView = () => {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  
  return (
    <HealthAlertsPanel
      alerts={alerts}
      onAcknowledge={async (alertId) => {
        await apiClient.acknowledgeAlert(alertId);
      }}
      onResolve={async (alertId) => {
        await apiClient.resolveAlert(alertId);
      }}
      onDismiss={(alertId) => {
        setAlerts(alerts.filter(a => a.id !== alertId));
      }}
    />
  );
};
```

### 2. Add Notification System

```typescript
// src/App.tsx or main layout component
import { NotificationCenter } from './notifications/notification-center';
import { NotificationToast } from './notifications/notification-toast';
import { useNotifications } from './hooks/useNotifications';

export const App = () => {
  const { notifications, toasts, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  return (
    <div>
      {/* App content */}
      
      {/* Notification center in header */}
      <NotificationCenter
        notifications={notifications}
        unreadCount={notifications.filter(n => !n.read).length}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
      />
      
      {/* Toast notifications in corner */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            {...toast}
            onClose={() => {/* handle close */}}
          />
        ))}
      </div>
    </div>
  );
};
```

### 3. Add Permissions Management

```typescript
// src/settings/permissions-settings.tsx
import { UserManagement } from './permissions/user-management';
import { RoleManagement } from './permissions/role-management';

export const PermissionsSettings = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  
  return (
    <div className="space-y-8">
      <UserManagement
        users={users}
        roles={roles.map(r => r.name)}
        onAddUser={async (user) => {
          const result = await apiClient.createUser(user);
          setUsers([...users, result]);
        }}
        onEditUser={async (id, updates) => {
          const result = await apiClient.updateUser(id, updates);
          setUsers(users.map(u => u.id === id ? result : u));
        }}
        onDeleteUser={async (id) => {
          await apiClient.deleteUser(id);
          setUsers(users.filter(u => u.id !== id));
        }}
      />
      
      <RoleManagement
        roles={roles}
        availablePermissions={['view_cameras', 'control_ptz', ...]}
        onAddRole={async (role) => {
          const result = await apiClient.createRole(role);
          setRoles([...roles, result]);
        }}
        onEditRole={async (id, updates) => {
          const result = await apiClient.updateRole(id, updates);
          setRoles(roles.map(r => r.id === id ? result : r));
        }}
      />
    </div>
  );
};
```

---

## API Method Integration

### PTZ Control
```typescript
// In src/shared/api-client.ts - already defined, just call it
const response = await this.apiClient.post(`/cameras/${cameraId}/ptz`, {
  action: 'pan',
  direction: 'left',
  speed: 50,
});
```

### Snapshot
```typescript
// Take snapshot via API or canvas
const snapshot = await this.apiClient.post(`/cameras/${cameraId}/snapshot`);
// Or use canvas in video-player component (already implemented)
```

### Playback
```typescript
// Get timeline segments
const timeline = await this.apiClient.get(`/playback/${cameraId}/timeline`, {
  startTime,
  endTime,
});

// Control playback
await this.apiClient.post(`/playback/${cameraId}/control`, {
  action: 'seek',
  timestamp,
});
```

### Events Search
```typescript
// Smart search
const results = await this.apiClient.post(`/events/search`, {
  query: searchTerm,
  eventTypes: selectedTypes,
  severity: selectedSeverity,
  dateRange: { start, end },
});
```

### Bookmarks
```typescript
// Create bookmark
const bookmark = await this.apiClient.post(`/bookmarks`, {
  cameraId,
  timestamp,
  notes,
  tags,
});

// Update bookmark
await this.apiClient.put(`/bookmarks/${bookmarkId}`, {
  notes,
  tags,
});

// Delete bookmark
await this.apiClient.delete(`/bookmarks/${bookmarkId}`);
```

### Export
```typescript
// Start export
const job = await this.apiClient.post(`/export`, {
  cameraIds,
  startTime,
  endTime,
  format,
});

// Monitor progress via polling or WebSocket
setInterval(async () => {
  const job = await this.apiClient.get(`/export/${jobId}`);
  setJobs(prev => prev.map(j => j.id === jobId ? job : j));
}, 1000);
```

### Health Alerts
```typescript
// Get alerts
const alerts = await this.apiClient.get(`/health/alerts`);

// Acknowledge alert
await this.apiClient.post(`/health/alerts/${alertId}/acknowledge`);

// Resolve alert
await this.apiClient.post(`/health/alerts/${alertId}/resolve`);
```

### User Management
```typescript
// Get users
const users = await this.apiClient.get(`/users`);

// Create user
const user = await this.apiClient.post(`/users`, userData);

// Update user
await this.apiClient.put(`/users/${userId}`, updates);

// Delete user
await this.apiClient.delete(`/users/${userId}`);
```

### Role Management
```typescript
// Get roles
const roles = await this.apiClient.get(`/roles`);

// Create role
const role = await this.apiClient.post(`/roles`, roleData);

// Update role
await this.apiClient.put(`/roles/${roleId}`, updates);

// Delete role
await this.apiClient.delete(`/roles/${roleId}`);
```

---

## State Management Setup (Zustand)

### Create notification store
```typescript
// src/core/stores/notification-store.ts
import { create } from 'zustand';

interface NotificationState {
  notifications: Notification[];
  toasts: Toast[];
  addNotification: (notification: Notification) => void;
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  toasts: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  addToast: (toast) =>
    set((state) => ({
      toasts: [toast, ...state.toasts],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
}));
```

---

## Testing Components

All components are ready to use immediately. Test with:

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { PTZControls } from './ptz-controls';

describe('PTZControls', () => {
  it('renders control buttons', () => {
    render(
      <PTZControls
        cameraId="cam1"
        isEnabled={true}
        onPtzControl={jest.fn()}
        presets={[]}
        onPresetSelect={jest.fn()}
      />
    );
    
    expect(screen.getByTitle('Pan up')).toBeInTheDocument();
  });
});
```

---

## Performance Optimization Tips

1. **Use useMemo for expensive calculations**
   ```typescript
   const filteredResults = useMemo(() => 
     events.filter(e => matchesFilter(e, filter)), 
     [events, filter]
   );
   ```

2. **Virtual scrolling for large lists**
   ```typescript
   import { FixedSizeList } from 'react-window';
   ```

3. **Lazy load components**
   ```typescript
   const LazyComponent = lazy(() => import('./component'));
   ```

4. **Debounce search input**
   ```typescript
   const debouncedSearch = useDebouncedCallback(
     (query) => handleSearch(query),
     500
   );
   ```

---

## Summary

✅ All 15 components created and ready for integration
✅ Full TypeScript support
✅ Tailwind CSS styling
✅ Error handling included
✅ Props properly typed
✅ Component patterns consistent

**Next Phase**: Wire components to API and Zustand stores for production deployment.
