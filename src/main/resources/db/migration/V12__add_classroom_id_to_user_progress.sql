-- Add classroom_id column to user_progress table to support classroom-specific progress tracking
ALTER TABLE user_progress ADD COLUMN classroom_id BIGINT NULL;

-- Add index for faster queries
CREATE INDEX idx_user_progress_classroom ON user_progress(user_id, category, classroom_id);

-- Add comment
ALTER TABLE user_progress MODIFY COLUMN classroom_id BIGINT NULL COMMENT 'FK to classroom table - null for legacy/non-classroom progress';
