DROP TABLE IF EXISTS `variations`;
DROP TABLE IF EXISTS `links`;
DROP TABLE IF EXISTS `experiments`;
DROP TABLE IF EXISTS `goals`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `email` varchar(1024) NOT NULL,
  `password` varchar(1024) NOT NULL,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `is_disabled` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `experiments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` varchar(32) NOT NULL,
  `is_disabled` TINYINT NOT NULL DEFAULT 0,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_experiments_users_user_id FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `variations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `experiment_id` BIGINT NOT NULL,
  `name` varchar(255) NOT NULL,
  `percent` FLOAT NOT NULL,
  `script` TEXT NOT NULL DEFAULT '',
  `type` VARCHAR(32) NOT NULL, -- URL
  `is_control` TINYINT NOT NULL DEFAULT 0,
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

CREATE TABLE `goals` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` char(32) NOT NULL,
  `is_disabled` TINYINT NOT NULL DEFAULT 0,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_goals_users_user_id FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS transitions;
DROP TABLE IF EXISTS states;

CREATE TABLE `states` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `entity_name` varchar(256) NOT NULL,
  `name` varchar(1024) NOT NULL,
  `is_start_state` TINYINT NOT NULL DEFAULT 0,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `transitions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `entity_name` varchar(256) NOT NULL,
  `from_state_id` BIGINT NOT NULL,
  `to_state_id` BIGINT NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_transitions_states_from_state_id FOREIGN KEY (from_state_id) REFERENCES states(id),
  CONSTRAINT fk_transitions_states_to_state_id FOREIGN KEY (to_state_id) REFERENCES states(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS emails;
CREATE TABLE `emails` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `from` varchar(256) NOT NULL,
  `to` varchar(2048) NOT NULL,
  `cc` varchar(2048) DEFAULT NULL,
  `bcc` varchar(2048) DEFAULT NULL,
  `subject` varchar(2048) NOT NULL,
  `body` TEXT DEFAULT NULL,
  `status` varchar(32) NOT NULL,
  `service` varchar(256) NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

