-- Create user
CREATE USER 'short_url_user'@'%' IDENTIFIED BY 'url_xun0411';

-- Set global permissions
GRANT ALL PRIVILEGES ON Urldb.* TO 'short_url_user'@'%';

-- Refresh permissions
FLUSH PRIVILEGES;
