/**
 * NXvms Client Components - Central Export File
 * 
 * This file provides a central export point for all newly implemented components.
 * Use these imports throughout the application.
 */

// ============================================================================
// LIVE VIEW COMPONENTS
// ============================================================================

export { PTZControls } from './live-view/ptz-controls';
export type { PTZControlsProps } from './live-view/ptz-controls';

export { DigitalZoom } from './live-view/digital-zoom';
export type { DigitalZoomProps } from './live-view/digital-zoom';

export { VideoPlayer } from './live-view/video-player';
export type { VideoPlayerProps } from './live-view/video-player';

// ============================================================================
// PLAYBACK COMPONENTS
// ============================================================================

export { Timeline } from './playback/timeline';
export type { TimelineProps, TimelineSegment } from './playback/timeline';

export { PlaybackControls } from './playback/playback-controls';
export type { PlaybackControlsProps } from './playback/playback-controls';

export { FrameStepControl } from './playback/frame-step-control';
export type { FrameStepControlProps } from './playback/frame-step-control';

// ============================================================================
// EVENTS COMPONENTS
// ============================================================================

export { SmartSearch } from './events/smart-search';
export type { SmartSearchProps, SearchFilter } from './events/smart-search';

export { EventFilter } from './events/event-filter';
export type { EventFilterProps, EventFilterOptions } from './events/event-filter';

// ============================================================================
// BOOKMARKS COMPONENTS
// ============================================================================

export { BookmarkCard } from './bookmarks/bookmark-card';
export type { BookmarkCardProps, BookmarkData } from './bookmarks/bookmark-card';

export { TagsManager } from './bookmarks/tags-manager';
export type { TagsManagerProps } from './bookmarks/tags-manager';

export { NotesEditor } from './bookmarks/notes-editor';
export type { NotesEditorProps } from './bookmarks/notes-editor';

// ============================================================================
// EXPORT COMPONENTS
// ============================================================================

export { ExportProgress } from './export/export-progress';
export type { ExportProgressProps, ExportJob } from './export/export-progress';

// ============================================================================
// HEALTH COMPONENTS
// ============================================================================

export { HealthAlertsPanel } from './health/alerts-panel';
export type { HealthAlertsPanelProps, HealthAlert } from './health/alerts-panel';

// ============================================================================
// NOTIFICATION COMPONENTS
// ============================================================================

export { NotificationToast } from './notifications/notification-toast';
export type { NotificationToastProps, NotificationType } from './notifications/notification-toast';

export { NotificationCenter } from './notifications/notification-center';
export type { NotificationCenterProps, Notification, NotificationCategory } from './notifications/notification-center';

// ============================================================================
// PERMISSIONS COMPONENTS
// ============================================================================

export { UserManagement } from './permissions/user-management';
export type { UserManagementProps, User } from './permissions/user-management';

export { RoleManagement } from './permissions/role-management';
export type { RoleManagementProps, Role } from './permissions/role-management';

// ============================================================================
// EXPORT GROUPS FOR CONVENIENCE
// ============================================================================

/**
 * All playback-related components
 */
export const PlaybackComponents = {
  Timeline: 'Timeline',
  PlaybackControls: 'PlaybackControls',
  FrameStepControl: 'FrameStepControl',
};

/**
 * All live view components
 */
export const LiveViewComponents = {
  VideoPlayer: 'VideoPlayer',
  PTZControls: 'PTZControls',
  DigitalZoom: 'DigitalZoom',
};

/**
 * All event management components
 */
export const EventComponents = {
  SmartSearch: 'SmartSearch',
  EventFilter: 'EventFilter',
};

/**
 * All bookmark management components
 */
export const BookmarkComponents = {
  BookmarkCard: 'BookmarkCard',
  TagsManager: 'TagsManager',
  NotesEditor: 'NotesEditor',
};

/**
 * All notification components
 */
export const NotificationComponents = {
  NotificationCenter: 'NotificationCenter',
  NotificationToast: 'NotificationToast',
};

/**
 * All permission/user management components
 */
export const PermissionComponents = {
  UserManagement: 'UserManagement',
  RoleManagement: 'RoleManagement',
};

/**
 * All system components
 */
export const SystemComponents = {
  HealthAlertsPanel: 'HealthAlertsPanel',
  ExportProgress: 'ExportProgress',
};
