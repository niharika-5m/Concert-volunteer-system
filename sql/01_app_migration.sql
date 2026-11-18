-- Run ONCE after your DDL + DML. Safe to re-run except the ALTER (skip it if the column exists).
USE concert_deployment_db;

-- 1) Passwords: the app stores bcrypt hashes only (never plain text).
ALTER TABLE users ADD COLUMN Password_Hash VARCHAR(255) NULL;

-- 2) Corrected staffing view.
-- The DDL version joins assignment AND shift_requirement in one query, which multiplies
-- both counts (e.g. 2 requirement rows x 2 assignments = 4 "assigned").
-- This is the same subquery-based definition used in your DML file.
CREATE OR REPLACE VIEW shift_staffing_status AS
SELECT
    s.Shift_ID,
    e.Event_Name,
    z.Zone_Name,
    s.Shift_Start,
    s.Shift_End,
    (SELECT COUNT(*) FROM assignment a
      WHERE a.Shift_ID = s.Shift_ID AND a.Assignment_Status <> 'Cancelled') AS Assigned_Staff,
    (SELECT COALESCE(SUM(sr.Required_Count), 0) FROM shift_requirement sr
      WHERE sr.Shift_ID = s.Shift_ID) AS Required_Staff
FROM shift s
JOIN event e ON s.Event_ID = e.Event_ID
JOIN zone z ON s.Zone_ID = z.Zone_ID;

-- 3) Make sure the audit trigger exists (same as your DML). The app relies on it to
--    log every new assignment into deployment_history.
DROP TRIGGER IF EXISTS after_assignment_insert;
DELIMITER //
CREATE TRIGGER after_assignment_insert
AFTER INSERT ON assignment
FOR EACH ROW
BEGIN
    INSERT INTO deployment_history (Action_Type, Action_Timestamp, Assignment_ID)
    VALUES ('Assignment Created', CURRENT_TIMESTAMP, NEW.Assignment_ID);
END //
DELIMITER ;
