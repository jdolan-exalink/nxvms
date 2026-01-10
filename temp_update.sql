UPDATE cameras SET "recordingMode" = 'objects' WHERE name = 'Portones';
UPDATE cameras SET "recordingMode" = 'motion_only' WHERE name = 'Cochera';
SELECT id, name, "recordingMode", status FROM cameras WHERE name IN ('Portones', 'Cochera');
