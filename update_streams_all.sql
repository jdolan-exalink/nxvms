UPDATE streams 
SET url = '/api/v1/frigate/proxy/' || c."serverId" || '/api/go2rtc/api/stream.m3u8?src=' || c."frigateCameraName" || '_main'
FROM cameras c
WHERE streams."cameraId" = c.id 
AND streams.type = 'hls';

UPDATE streams 
SET url = '/api/v1/frigate/proxy/' || c."serverId" || '/api/go2rtc/api/webrtc?src=' || c."frigateCameraName" || '_main'
FROM cameras c
WHERE streams."cameraId" = c.id 
AND streams.type = 'webrtc';
