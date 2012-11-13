DROP TABLE IF EXISTS `variations`;
DROP TABLE IF EXISTS `links`;
DROP TABLE IF EXISTS `experiments`;
CREATE TABLE `experiments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_disabled` TINYINT NOT NULL DEFAULT 0,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `variations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `experiment_id` BIGINT NOT NULL,
  `name` varchar(255) NOT NULL,
  `percent` FLOAT NOT NULL,
  `script` TEXT NOT NULL DEFAULT '',
  `is_disabled` TINYINT NOT NULL DEFAULT 0,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_variations_experiments_experiment_id FOREIGN KEY (experiment_id) REFERENCES experiments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `links` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `experiment_id` BIGINT NOT NULL,
  `url` varchar(1024) NOT NULL,
  `is_disabled` TINYINT NOT NULL DEFAULT 0,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_links_experiments_experiment_id FOREIGN KEY (experiment_id) REFERENCES experiments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

