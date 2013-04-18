DROP TABLE IF EXISTS audits;
CREATE TABLE `audits` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `entity_name` varchar(256) NOT NULL,
  `action` varchar(32) NOT NULL,
  `entity_id` BIGINT NOT NULL,
  `field_name` varchar(512) NOT NULL,
  `from_value` varchar(1024),
  `to_value` varchar(1024),
  `comments` varchar(1024),
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;