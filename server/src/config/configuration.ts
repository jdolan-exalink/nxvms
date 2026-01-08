export const configuration = () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'nxvms',
    password: process.env.DB_PASSWORD || 'nxvms_dev',
    name: process.env.DB_NAME || 'nxvms_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '3600s',
  },
  storage: {
    path: process.env.STORAGE_PATH || '/mnt/nxvms/storage',
    chunksPath: process.env.STORAGE_PATH ? `${process.env.STORAGE_PATH}/chunks` : '/mnt/nxvms/storage/chunks',
  },
  ffmpeg: {
    path: process.env.FFMPEG_PATH || 'ffmpeg',
    hlsSegmentTime: parseInt(process.env.HLS_SEGMENT_TIME || '4', 10),
    hlsListSize: parseInt(process.env.HLS_LIST_SIZE || '10', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  onvif: {
    discoveryTimeout: parseInt(process.env.ONVIF_DISCOVERY_TIMEOUT || '5000', 10),
  },
});
