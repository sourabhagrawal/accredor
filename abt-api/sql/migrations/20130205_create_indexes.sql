-- Indexes on Users
CREATE INDEX idx_users_is_disabled ON users (is_disabled);

-- Indexes on Experiments
CREATE INDEX idx_experiments_is_disabled ON experiments (is_disabled);
CREATE INDEX idx_experiments_user_id ON experiments (user_id);
CREATE INDEX idx_experiments_status ON experiments (status);

-- Indexes on Variations
CREATE INDEX idx_variations_is_disabled ON variations (is_disabled);

-- Indexes on Links
CREATE INDEX idx_links_is_disabled ON links (is_disabled);

-- Indexes on Goals
CREATE INDEX idx_goals_is_disabled ON goals (is_disabled);
CREATE INDEX idx_goals_user_id ON goals (user_id);
CREATE INDEX idx_goals_status ON goals (status);

-- Indexes on Script Details
CREATE INDEX idx_script_details_user_id ON script_details (user_id);
CREATE INDEX idx_script_details_status ON script_details (status);
CREATE INDEX idx_script_details_is_old ON script_details (is_old);

-- Indexes on states
CREATE INDEX idx_states_entity_name ON states (entity_name);

-- Indexes in transitions
CREATE INDEX idx_transitions_entity_name ON transitions (entity_name);
CREATE INDEX idx_transitions_from_state_id ON transitions (from_state_id);
CREATE INDEX idx_transitions_to_state_id ON transitions (to_state_id);

-- Indexes on variation_visits
CREATE INDEX idx_variation_visits_variation_id ON variation_visits (variation_id);
CREATE INDEX idx_variation_visits_goal_id ON variation_visits (goal_id);

-- Indexes on experiment_visits
CREATE INDEX idx_experiment_visits_variation_id ON experiment_visits (variation_id);
CREATE INDEX idx_experiment_visits_experiment_id ON experiment_visits (experiment_id);

-- Indexes on goal_visits
CREATE INDEX idx_goal_visits_goal_id ON goal_visits (goal_id);
CREATE INDEX idx_goal_visits_variation_id ON goal_visits (variation_id);
CREATE INDEX idx_goal_visits_experiment_id ON goal_visits (experiment_id);

