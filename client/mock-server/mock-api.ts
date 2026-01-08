// ============================================================================
// MOCK SERVER
// Development mock server for testing client without real backend
// ============================================================================

import http from 'http';
import { URL } from 'url';
import {
  CameraStatus,
  ServerStatus,
  StreamType,
} from '../src/shared/types';
import type {
  User,
  ServerInfo,
  Camera,
  Site,
  Stream,
  TimelineSegment,
  Event,
  Bookmark,
  ExportJob,
  SystemHealth,
  StoragePool,
  SystemMetrics,
  DirectoryServer,
} from '../src/shared/types';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    username: 'admin',
    displayName: 'Administrator',
    email: 'admin@nxvms.local',
    role: {
      id: 'role-admin',
      name: 'Administrator',
      description: 'Full system access',
      isSystem: true,
    },
    permissions: [
      { resource: '*', actions: ['*'] },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'user-2',
    username: 'operator',
    displayName: 'Operator',
    email: 'operator@nxvms.local',
    role: {
      id: 'role-operator',
      name: 'Operator',
      description: 'View and control cameras',
      isSystem: true,
    },
    permissions: [
      { resource: 'camera:*', actions: ['view', 'control'] },
      { resource: 'playback', actions: ['view'] },
    ],
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const MOCK_SERVERS: DirectoryServer[] = [
  {
    id: 'server-1',
    name: 'Main Server',
    url: 'http://localhost:3000/api/v1',
    status: ServerStatus.ONLINE,
    lastSeen: new Date().toISOString(),
    version: '0.1.0',
    location: 'Main Office',
  },
];

const MOCK_CAMERAS: Camera[] = [
  {
    id: 'cam-1',
    name: 'Front Door',
    description: 'Main entrance camera',
    serverId: 'server-1',
    status: CameraStatus.RECORDING,
    capabilities: {
      ptz: true,
      ptzPresets: true,
      digitalZoom: true,
      audio: true,
      motionDetection: true,
      analytics: false,
      onvif: true,
      supportedProfiles: [
        {
          name: 'Main',
          type: 'main',
          resolution: '1920x1080',
          fps: 30,
          bitrate: 4000,
          codec: 'H264',
          audioCodec: 'AAC',
        },
        {
          name: 'Sub',
          type: 'sub',
          resolution: '640x480',
          fps: 15,
          bitrate: 512,
          codec: 'H264',
          audioCodec: 'AAC',
        },
      ],
    },
    streams: [
      {
        id: 'stream-1-main',
        profileId: 'profile-1',
        url: 'rtsp://localhost:8554/cam1/main',
        type: StreamType.RTSP,
        isActive: true,
      },
      {
        id: 'stream-1-sub',
        profileId: 'profile-2',
        url: 'rtsp://localhost:8554/cam1/sub',
        type: StreamType.RTSP,
        isActive: false,
      },
    ],
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'New York, NY',
    },
    tags: ['entrance', 'main'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cam-2',
    name: 'Parking Lot',
    description: 'Parking area surveillance',
    serverId: 'server-1',
    status: CameraStatus.ONLINE,
    capabilities: {
      ptz: false,
      ptzPresets: false,
      digitalZoom: true,
      audio: false,
      motionDetection: true,
      analytics: true,
      onvif: true,
      supportedProfiles: [
        {
          name: 'Main',
          type: 'main',
          resolution: '1920x1080',
          fps: 25,
          bitrate: 3000,
          codec: 'H265',
        },
      ],
    },
    streams: [
      {
        id: 'stream-2-main',
        profileId: 'profile-3',
        url: 'rtsp://localhost:8554/cam2/main',
        type: StreamType.RTSP,
        isActive: false,
      },
    ],
    tags: ['parking', 'outdoor'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cam-3',
    name: 'Lobby',
    description: 'Reception area camera',
    serverId: 'server-1',
    status: CameraStatus.OFFLINE,
    capabilities: {
      ptz: true,
      ptzPresets: false,
      digitalZoom: true,
      audio: true,
      motionDetection: false,
      analytics: false,
      onvif: true,
      supportedProfiles: [
        {
          name: 'Main',
          type: 'main',
          resolution: '1280x720',
          fps: 30,
          bitrate: 2000,
          codec: 'H264',
          audioCodec: 'AAC',
        },
      ],
    },
    streams: [
      {
        id: 'stream-3-main',
        profileId: 'profile-4',
        url: 'rtsp://localhost:8554/cam3/main',
        type: StreamType.RTSP,
        isActive: false,
      },
    ],
    tags: ['indoor', 'lobby'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cam-4',
    name: 'Warehouse',
    description: 'Storage area camera',
    serverId: 'server-1',
    status: CameraStatus.ONLINE,
    capabilities: {
      ptz: true,
      ptzPresets: true,
      digitalZoom: true,
      audio: true,
      motionDetection: true,
      analytics: true,
      onvif: true,
      supportedProfiles: [
        {
          name: 'Main',
          type: 'main',
          resolution: '2560x1440',
          fps: 30,
          bitrate: 6000,
          codec: 'H265',
          audioCodec: 'AAC',
        },
        {
          name: 'Sub',
          type: 'sub',
          resolution: '1280x720',
          fps: 15,
          bitrate: 1000,
          codec: 'H265',
          audioCodec: 'AAC',
        },
      ],
    },
    streams: [
      {
        id: 'stream-4-main',
        profileId: 'profile-5',
        url: 'rtsp://localhost:8554/cam4/main',
        type: StreamType.RTSP,
        isActive: false,
      },
      {
        id: 'stream-4-sub',
        profileId: 'profile-6',
        url: 'rtsp://localhost:8554/cam4/sub',
        type: StreamType.RTSP,
        isActive: false,
      },
    ],
    tags: ['indoor', 'warehouse'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_SITES: Site[] = [
  {
    id: 'site-1',
    name: 'Main Office',
    description: 'Primary location',
    servers: [
      {
        id: 'server-1',
        name: 'Main Server',
        host: 'localhost',
        port: 3000,
        status: ServerStatus.ONLINE,
        capabilities: ['onvif', 'rtsp', 'hls', 'webrtc'],
        cameras: MOCK_CAMERAS,
      },
    ],
    groups: [
      {
        id: 'group-1',
        name: 'Entrances',
        type: 'camera',
        resourceIds: ['cam-1', 'cam-3'],
      },
      {
        id: 'group-2',
        name: 'Outdoor',
        type: 'camera',
        resourceIds: ['cam-2', 'cam-4'],
      },
    ],
  },
];

// ============================================================================
// SERVER
// ============================================================================

const PORT = 3000;

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Use a safe way to parse the URL
  const host = req.headers.host || 'localhost:3000';
  const url = new URL(req.url || '', `http://${host}`);
  const pathname = url.pathname;
  const method = req.method;

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  if (method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
    return;
  }

  // Set standard headers for all other responses
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.setHeader('Content-Type', 'application/json');

  // Routes
  try {
    if (pathname === '/api/v1/auth/login' && method === 'POST') {
      handleLogin(req, res);
    } else if (pathname === '/api/v1/auth/me' && method === 'GET') {
      handleMe(req, res);
    } else if (pathname === '/api/v1/resources/tree' && method === 'GET') {
      handleResourceTree(req, res);
    } else if (pathname.startsWith('/api/v1/resources/cameras/') && method === 'GET') {
      handleGetCamera(req, res);
    } else if (pathname === '/api/v1/streaming/live' && method === 'POST') {
      handleStartLiveStream(req, res);
    } else if (pathname.startsWith('/api/v1/streaming/live/') && method === 'DELETE') {
      handleStopLiveStream(req, res);
    } else if (pathname.startsWith('/api/v1/playback/timeline/') && method === 'GET') {
      handleGetTimeline(req, res);
    } else if (pathname === '/api/v1/events' && method === 'GET') {
      handleGetEvents(req, res);
    } else if (pathname === '/api/v1/bookmarks' && method === 'GET') {
      handleGetBookmarks(req, res);
    } else if (pathname === '/api/v1/export' && method === 'POST') {
      handleCreateExport(req, res);
    } else if (pathname === '/api/v1/health' && method === 'GET') {
      handleGetHealth(req, res);
    } else if (pathname === '/api/v1/directory/servers' && method === 'GET') {
      handleGetServers(req, res);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } }));
    }
  } catch (error: any) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }));
  }
});

// ============================================================================
// HANDLERS
// ============================================================================

function handleLogin(req: any, res: any) {
  let body = '';
  req.on('data', (chunk: any) => { body += chunk; });
  req.on('end', () => {
    try {
      if (!body) {
        throw new Error('Empty request body');
      }
      const { username, password } = JSON.parse(body);
      console.log(`Login attempt: ${username}`);
      const user = MOCK_USERS.find((u) => u.username === username && password === 'password');
      if (user) {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: {
            user,
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600,
            server: {
              id: 'server-1',
              name: 'Main Server',
              url: 'http://localhost:3000/api/v1',
              version: '0.1.0',
              capabilities: ['onvif', 'rtsp', 'hls', 'webrtc'],
            },
          },
        }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          error: { code: 'AUTH_001', message: 'Invalid credentials' },
        }));
      }
    } catch (error: any) {
      console.error('Login error:', error.message);
      res.writeHead(400);
      res.end(JSON.stringify({
        success: false,
        error: { code: 'BAD_REQUEST', message: error.message },
      }));
    }
  });
}

function handleMe(req: any, res: any) {
  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    data: {
      user: MOCK_USERS[0],
      server: MOCK_SERVERS[0],
    },
  }));
}

function handleResourceTree(req: any, res: any) {
  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    data: { sites: MOCK_SITES },
  }));
}

function handleGetCamera(req: any, res: any) {
  const cameraId = req.url?.split('/').pop();
  const camera = MOCK_CAMERAS.find((c) => c.id === cameraId);
  if (camera) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: { camera },
    }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      error: { code: 'RES_001', message: 'Camera not found' },
    }));
  }
}

function handleStartLiveStream(req: any, res: any) {
  let body = '';
  req.on('data', (chunk: any) => { body += chunk; });
  req.on('end', () => {
    try {
      const { cameraId, profileId, transport } = JSON.parse(body);
      const camera = MOCK_CAMERAS.find((c) => c.id === cameraId);
      if (camera) {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: {
            streamId: `stream-${Date.now()}`,
            url: `http://localhost:8080/${cameraId}`,
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
          },
        }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          error: { code: 'RES_001', message: 'Camera not found' },
        }));
      }
    } catch (e: any) {
      res.writeHead(400);
      res.end(JSON.stringify({ success: false, error: { message: e.message } }));
    }
  });
}

function handleStopLiveStream(req: any, res: any) {
  res.writeHead(200);
  res.end(JSON.stringify({ success: true }));
}

function handleGetTimeline(req: any, res: any) {
  const cameraId = req.url?.split('/').pop();
  const camera = MOCK_CAMERAS.find((c) => c.id === cameraId);
  if (camera) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: {
        segments: [
          {
            startTime: oneHourAgo.toISOString(),
            endTime: now.toISOString(),
            profileId: 'profile-1',
            hasMotion: true,
            sizeBytes: 100000000,
          },
        ],
        events: [
          {
            id: 'event-1',
            type: 'motion',
            startTime: new Date(now.getTime() - 1800000).toISOString(),
            endTime: new Date(now.getTime() - 1200000).toISOString(),
            confidence: 0.85,
            metadata: {},
          },
        ],
      },
    }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      error: { code: 'RES_001', message: 'Camera not found' },
    }));
  }
}

function handleGetEvents(req: any, res: any) {
  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    data: {
      events: [
        {
          id: 'event-1',
          type: 'motion',
          cameraId: 'cam-1',
          serverId: 'server-1',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() - 3000000).toISOString(),
          confidence: 0.92,
          thumbnailUrl: 'http://localhost:8080/thumb1.jpg',
          metadata: {},
          acknowledged: false,
        },
        {
          id: 'event-2',
          type: 'motion',
          cameraId: 'cam-2',
          serverId: 'server-1',
          startTime: new Date(Date.now() - 7200000).toISOString(),
          endTime: new Date(Date.now() - 6000000).toISOString(),
          confidence: 0.78,
          thumbnailUrl: 'http://localhost:8080/thumb2.jpg',
          metadata: {},
          acknowledged: true,
          acknowledgedBy: 'admin',
          acknowledgedAt: new Date(Date.now() - 6000000).toISOString(),
        },
      ],
      total: 2,
      limit: 50,
      offset: 0,
    },
  }));
}

function handleGetBookmarks(req: any, res: any) {
  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    data: {
      bookmarks: [
        {
          id: 'bookmark-1',
          cameraId: 'cam-1',
          name: 'Incident 1',
          description: 'Suspicious activity at front door',
          startTime: new Date(Date.now() - 86400000).toISOString(),
          endTime: new Date(Date.now() - 82800000).toISOString(),
          thumbnailUrl: 'http://localhost:8080/bookmark1.jpg',
          tags: ['incident', 'review'],
          createdBy: 'admin',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    },
  }));
}

function handleCreateExport(req: any, res: any) {
  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    data: {
      exportId: `export-${Date.now()}`,
      status: 'pending',
    },
  }));
}

function handleGetHealth(req: any, res: any) {
  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      components: [
        {
          name: 'server',
          status: 'healthy',
          metrics: { uptime: 99.9, cpu: 45.2, memory: 62.3 },
        },
        {
          name: 'storage',
          status: 'healthy',
          metrics: { used: 45, free: 55 },
        },
        {
          name: 'recording',
          status: 'healthy',
          metrics: { active: 4, total: 4 },
        },
      ],
    },
  }));
}

function handleGetServers(req: any, res: any) {
  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    data: { servers: MOCK_SERVERS },
  }));
}

// ============================================================================
// START SERVER
// ============================================================================

server.listen(PORT, () => {
  console.log(`Mock VMS server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST   /api/v1/auth/login');
  console.log('  GET    /api/v1/auth/me');
  console.log('  GET    /api/v1/resources/tree');
  console.log('  GET    /api/v1/resources/cameras/:id');
  console.log('  POST   /api/v1/streaming/live');
  console.log('  DELETE /api/v1/streaming/live/:id');
  console.log('  GET    /api/v1/playback/timeline/:cameraId');
  console.log('  GET    /api/v1/events');
  console.log('  GET    /api/v1/bookmarks');
  console.log('  POST   /api/v1/export');
  console.log('  GET    /api/v1/health');
  console.log('  GET    /api/v1/directory/servers');
  console.log('\nTest credentials:');
  console.log('  Username: admin');
  console.log('  Password: password');
});

export { server };
