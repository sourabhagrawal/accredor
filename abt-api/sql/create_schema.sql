DROP TABLE IF EXISTS `script_details`;
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
  `type` VARCHAR(32) NOT NULL, -- SPLITTER
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
  `script` TEXT NOT NULL,
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
  `url` varchar(1024) NOT NULL,
  `status` varchar(32) NOT NULL, -- CREATED, DISABLED
  `type` char(32) NOT NULL, -- VISIT, ENGAGEMENT, CLICK
  `prop` varchar(1024),
  `is_disabled` TINYINT NOT NULL DEFAULT 0,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_goals_users_user_id FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `script_details` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `data` TEXT DEFAULT NULL,
  `status` varchar(255) NOT NULL, -- NOT_SCRIPTED, PROCESSING, SCRIPTED
  `is_old` TINYINT NOT NULL DEFAULT 0,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_script_details_users_user_id FOREIGN KEY (user_id) REFERENCES users(id)
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

DROP TABLE IF EXISTS contact_leads;
CREATE TABLE `contact_leads` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` varchar(256),
  `email` varchar(256) NOT NULL,
  `message` TEXT DEFAULT NULL,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS variation_visits;
CREATE TABLE `variation_visits` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `variation_id` BIGINT NOT NULL,
  `goal_id` BIGINT NOT NULL DEFAULT 0,
  `visits` BIGINT NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS experiment_visits;
CREATE TABLE `experiment_visits` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `experiment_id` BIGINT NOT NULL,
  `variation_id` BIGINT NOT NULL DEFAULT 0,
  `visits` BIGINT NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS goal_visits;
CREATE TABLE `goal_visits` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `goal_id` BIGINT NOT NULL,
  `experiment_id` BIGINT NOT NULL DEFAULT 0,
  `variation_id` BIGINT NOT NULL DEFAULT 0,
  `hits` BIGINT NOT NULL,
  `visits` BIGINT NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;