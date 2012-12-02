INSERT INTO users VALUES(1, 'tata@bata.com', '89a5628c629f8e4e6a0b5b687a5d7817', 1, 0, 'SYSTEM', 'SYSTEM', NOW(), NOW());

-- Insert States for Experiments
INSERT INTO `states` values(1, 'experiment', 'created', 1, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `states` values(2, 'experiment', 'started', 0, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `states` values(3, 'experiment', 'stopped', 0, 'SYSTEM', 'SYSTEM', NOW(), NOW());

-- Insert Transitions for Experiments
INSERT INTO `transitions` values(NULL, 'experiment', 1, 2, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `transitions` values(NULL, 'experiment', 2, 3, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `transitions` values(NULL, 'experiment', 3, 2, 'SYSTEM', 'SYSTEM', NOW(), NOW());

-- Insert States for Emails
INSERT INTO `states` values(4, 'email', 'queued', 1, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `states` values(5, 'email', 'processing', 0, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `states` values(6, 'email', 'sent', 0, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `states` values(7, 'email', 'failed', 0, 'SYSTEM', 'SYSTEM', NOW(), NOW());

-- Insert Transitions for Emails
INSERT INTO `transitions` values(NULL, 'email', 4, 5, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `transitions` values(NULL, 'email', 5, 6, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `transitions` values(NULL, 'email', 5, 7, 'SYSTEM', 'SYSTEM', NOW(), NOW());
INSERT INTO `transitions` values(NULL, 'email', 5, 4, 'SYSTEM', 'SYSTEM', NOW(), NOW());
