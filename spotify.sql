-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.5.5-10.1.39-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             8.3.0.4694
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping database structure for spotify
DROP DATABASE IF EXISTS `spotify`;
CREATE DATABASE IF NOT EXISTS `spotify` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `spotify`;


-- Dumping structure for table spotify.comment
DROP TABLE IF EXISTS `comment`;
CREATE TABLE IF NOT EXISTS `comment` (
  `comment_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL DEFAULT '0',
  `comment_text` text NOT NULL,
  `playlist_id` varchar(50) NOT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `Index 2` (`user_id`),
  KEY `Index 3` (`playlist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table spotify.comment: ~0 rows (approximately)
DELETE FROM `comment`;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;


-- Dumping structure for table spotify.playlist
DROP TABLE IF EXISTS `playlist`;
CREATE TABLE IF NOT EXISTS `playlist` (
  `playlist_id` varchar(50) NOT NULL,
  `playlist_name` varchar(50) NOT NULL,
  `playlist_description` text NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`playlist_id`),
  KEY `Index 2` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table spotify.playlist: ~1 rows (approximately)
DELETE FROM `playlist`;
/*!40000 ALTER TABLE `playlist` DISABLE KEYS */;
INSERT INTO `playlist` (`playlist_id`, `playlist_name`, `playlist_description`, `user_id`) VALUES
	('4fd7qOlEPbKBy1LUhjopx0', 'playlist ke 2', '', 0);
/*!40000 ALTER TABLE `playlist` ENABLE KEYS */;


-- Dumping structure for table spotify.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(50) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_name` (`user_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Dumping data for table spotify.users: ~2 rows (approximately)
DELETE FROM `users`;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`user_id`, `user_name`, `user_password`) VALUES
	(1, 'brily1', '$2b$10$TuJb3GAe/b6zzsorpTqyGeb0PnvJ9HQLpoWWsvj3H7QP0dd.2QQOW'),
	(2, 'brily', '$2b$10$TpI0KQYRMh9rUJKiRBX6zOv1qMLI1j6MygVveJ2se1e.cd/zNQb6i');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
