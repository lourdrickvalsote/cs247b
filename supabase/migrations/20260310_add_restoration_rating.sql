ALTER TABLE sessions ADD COLUMN restoration_rating smallint
  CHECK (restoration_rating IS NULL OR (restoration_rating >= 1 AND restoration_rating <= 5));
