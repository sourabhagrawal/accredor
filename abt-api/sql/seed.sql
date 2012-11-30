INSERT INTO users VALUES(1, 'tata@bata.com', '89a5628c629f8e4e6a0b5b687a5d7817', 1, 0, 'SYSTEM', 'SYSTEM', NOW(), NOW());

-- Insert States for Experiments
INSERT INTO `states` values(1, 'experiment', 'created', 1, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `states` values(2, 'experiment', 'started', 0, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `states` values(3, 'experiment', 'stopped', 0, 'SYSTEM', 'SYSTEM', NOW(), NOW());

-- Insert Transitions for Experiments
INSERT INTO `transitions` values(NULL, 'experiment', 1, 2, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `transitions` values(NULL, 'experiment', 2, 3, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `transitions` values(NULL, 'experiment', 3, 2, 'SYSTEM', 'SYSTEM', NOW(), NOW());
