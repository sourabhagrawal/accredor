ALTER TABLE `experiments` DROP FOREIGN KEY fk_experiments_users_user_id;
ALTER TABLE `experiments` DROP KEY fk_experiments_users_user_id;

ALTER TABLE `variations` DROP FOREIGN KEY fk_variations_experiments_experiment_id;
ALTER TABLE `variations` DROP KEY fk_variations_experiments_experiment_id;

ALTER TABLE `links` DROP FOREIGN KEY fk_links_experiments_experiment_id;
ALTER TABLE `links` DROP KEY fk_links_experiments_experiment_id;

ALTER TABLE `goals` DROP FOREIGN KEY fk_goals_users_user_id;
ALTER TABLE `goals` DROP KEY fk_goals_users_user_id;

ALTER TABLE `script_details` DROP FOREIGN KEY fk_script_details_users_user_id;
ALTER TABLE `script_details` DROP KEY fk_script_details_users_user_id;

ALTER TABLE `transitions` DROP FOREIGN KEY fk_transitions_states_from_state_id;
ALTER TABLE `transitions` DROP KEY fk_transitions_states_from_state_id;

ALTER TABLE `transitions` DROP FOREIGN KEY fk_transitions_states_to_state_id;
ALTER TABLE `transitions` DROP KEY fk_transitions_states_to_state_id;


