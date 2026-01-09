UPDATE cameras SET capabilities = capabilities || '{"audio": true, "digitalZoom": true}' WHERE provider = 'frigate';
