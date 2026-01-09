UPDATE streams 
SET url = '/api/v1/frigate/proxy/' || c."serverId" || '/api/go2rtc/api/stream.mp4?src=' || c."frigateCameraName" || '_main'
FROM cameras c
WHERE streams."cameraId" = c.id 
AND streams.type = 'frigate_mse';
