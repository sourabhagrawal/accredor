ALTER TABLE links ADD COLUMN `type` char(32) NOT NULL; -- SIMPLE, REGEX
UPDATE links set type = 'simple';