CREATE TABLE `filters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `experiment_id` BIGINT NOT NULL,
  `type` char(32) NOT NULL, -- IS_OR_IS_NOT, MATCH_TEXT
  `name` char(32) NOT NULL,
  `value` varchar(2048) NOT NULL,
  `is_disabled` TINYINT NOT NULL DEFAULT 0,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_filters_experiments_experiment_id FOREIGN KEY (experiment_id) REFERENCES experiments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;