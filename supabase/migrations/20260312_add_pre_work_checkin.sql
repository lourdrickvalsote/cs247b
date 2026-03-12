ALTER TABLE sessions ADD COLUMN pre_work_took_break boolean DEFAULT NULL;
ALTER TABLE sessions ADD COLUMN pre_work_tiredness smallint DEFAULT NULL
  CHECK (pre_work_tiredness IS NULL OR (pre_work_tiredness >= 1 AND pre_work_tiredness <= 5));
