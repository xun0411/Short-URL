/**
 * 10.5.22-MariaDB
 */

DELIMITER ;

CREATE DATABASE `Urldb` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci */;

USE `Urldb`;

SET GLOBAL event_scheduler = ON;

-- Urldb.`User` definition

CREATE TABLE `User` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `password` VARCHAR(128) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `name` VARCHAR(100) DEFAULT NULL,
  `user_permissions` INT UNSIGNED DEFAULT 0,
  `telephone` VARCHAR(50) DEFAULT NULL,
  `cellphone` VARCHAR(50) DEFAULT NULL,
  `address` VARCHAR(100) DEFAULT NULL,
  `registered` TINYINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


-- Urldb.UrlData definition

CREATE TABLE `UrlData` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `key` VARCHAR(10) NOT NULL,
  `long_url` VARCHAR(1000) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `expire_date` INT UNSIGNED NOT NULL,
  `require_password` BOOL NOT NULL,
  `password` VARCHAR(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UrlData_User_FK` (`user_id`),
  CONSTRAINT `UrlData_User_FK` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


-- Urldb.`Session` definition

CREATE TABLE `Session` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `session_id` VARCHAR(64) NOT NULL,
  `user_id` INT NOT NULL,
  `device` VARCHAR(300) DEFAULT NULL,
  `last_refresh` TIMESTAMP NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `Session_User_FK` (`user_id`),
  CONSTRAINT `Session_User_FK` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Auto delete expored sessions, every 10 minutes check, not used for over 6 hours

CREATE EVENT delete_expired_sessions
ON SCHEDULE EVERY 10 MINUTE
DO
  DELETE FROM Session WHERE TIMESTAMPDIFF(HOUR, last_refresh, NOW()) > 6;


-- Urldb.IPBlacklist definition

CREATE TABLE `IPBlacklist` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ip` VARCHAR(45) NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DELIMITER ;