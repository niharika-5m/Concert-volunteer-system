USE concert_deployment_db;
-- 1. USERS
INSERT INTO users (Username, Role) VALUES
('organizer1', 'Organizer'),
('rahul', 'Staff'),
('priya', 'Staff'),
('arjun', 'Staff');

-- 2. VENUE
INSERT INTO venue (Venue_Name, City)
VALUES ('Bangalore Music Arena', 'Bangalore');

-- 3. ZONES
INSERT INTO zone (Zone_Name, Zone_Type, Venue_ID) VALUES
('Main Gate', 'Entry', 1),
('VIP Area', 'Hospitality', 1),
('Backstage', 'Restricted', 1),
('Medical Point', 'Support', 1);

-- 4. EVENTS
INSERT INTO event (Event_Name, Event_Date, Status, Venue_ID) VALUES
('Rock Night 2027', '2027-01-15', 'Upcoming', 1),
('Summer Music Fest', '2027-02-20', 'Upcoming', 1);

-- 5. SKILLS
INSERT INTO skill (Skill_Name) VALUES
('Crowd Management'),
('First Aid'),
('Security'),
('Stage Management'),
('Guest Assistance');

-- 6. STAFF
INSERT INTO staff (Full_Name, Staff_Phone, User_ID) VALUES
('Rahul Sharma', '9876543210', 2),
('Priya Nair', '9876543211', 3),
('Arjun Rao', '9876543212', 4);

-- 7. AVAILABILITY
INSERT INTO availability (Available_Date, Status) VALUES
('2027-01-15', 'Available'),
('2027-01-15', 'Available'),
('2027-01-15', 'Unavailable'),
('2027-02-20', 'Available');

-- 8. STAFF AVAILABILITY
INSERT INTO staff_availability (Staff_ID, Availability_ID) VALUES
(1, 1),
(2, 2),
(3, 3);

-- 9. STAFF SKILLS
INSERT INTO staff_skill (Staff_ID, Skill_ID, Proficiency_Level) VALUES
(1, 1, 'Advanced'),
(1, 3, 'Expert'),
(2, 2, 'Advanced'),
(2, 5, 'Intermediate'),
(3, 4, 'Expert'),
(3, 1, 'Intermediate');

-- 10. SHIFTS
INSERT INTO shift
(Shift_Start, Shift_End, Event_ID, Zone_ID)
VALUES
('2027-01-15 08:00:00', '2027-01-15 14:00:00', 1, 1),
('2027-01-15 14:00:00', '2027-01-15 20:00:00', 1, 2),
('2027-01-15 08:00:00', '2027-01-15 14:00:00', 1, 4),
('2027-02-20 09:00:00', '2027-02-20 17:00:00', 2, 3);

-- 11. SHIFT REQUIREMENTS
INSERT INTO shift_requirement
(Shift_ID, Skill_ID, Required_Count)
VALUES
(1, 1, 2),
(1, 3, 1),
(2, 5, 2),
(3, 2, 1),
(4, 4, 2);

-- 12. ASSIGNMENTS
INSERT INTO assignment
(Assignment_Status, Staff_ID, Shift_ID)
VALUES
('Confirmed', 1, 1),
('Confirmed', 2, 3),
('Assigned', 3, 4);

-- 13. ATTENDANCE
INSERT INTO attendance
(Check_in_Time, Check_out_Time, Event_ID, Assignment_ID)
VALUES
('2027-01-15 08:05:00', '2027-01-15 14:00:00', 1, 4),
('2027-01-15 08:10:00', '2027-01-15 14:00:00', 1, 5);

-- 14. DEPLOYMENT HISTORY
INSERT INTO deployment_history
(Action_Type, Action_Timestamp, Assignment_ID)
VALUES
('Assignment Created', CURRENT_TIMESTAMP, 4),
('Assignment Confirmed', CURRENT_TIMESTAMP, 4),
('Assignment Created', CURRENT_TIMESTAMP, 5),
('Assignment Created', CURRENT_TIMESTAMP, 6);
-- =====================================================
-- PART 2: BASIC SELECT QUERIES
-- =====================================================

-- Display all staff
SELECT * FROM staff;

-- Display all events
SELECT * FROM event;

-- Display all venues
SELECT * FROM venue;

-- Display all shifts
SELECT * FROM shift;

-- Display all assignments
SELECT * FROM assignment;

-- Display available staff on a particular date
SELECT st.Full_Name, av.Available_Date, av.Status
FROM staff st
JOIN staff_availability sa ON st.Staff_ID = sa.Staff_ID
JOIN availability av ON sa.Availability_ID = av.Availability_ID
WHERE av.Available_Date = '2027-01-15'
AND av.Status = 'Available';

-- WHERE condition
SELECT * FROM staff
WHERE Full_Name = 'Rahul Sharma';

-- ORDER BY
SELECT * FROM staff
ORDER BY Full_Name ASC;
-- =====================================================
-- PART 3: UPDATE AND DELETE
-- =====================================================

-- UPDATE an existing staff phone number
UPDATE staff
SET Staff_Phone = '9999999999'
WHERE Staff_ID = 1;

-- Verify UPDATE
SELECT * FROM staff
WHERE Staff_ID = 1;

-- DELETE a specific availability record
-- This record is not linked to staff_availability.
DELETE FROM availability
WHERE Availability_ID = 4;

-- Verify DELETE
SELECT * FROM availability;

-- =====================================================
-- PART 4: JOINS
-- =====================================================

-- INNER JOIN: Staff and their assignments
SELECT
    st.Full_Name,
    a.Assignment_ID,
    a.Assignment_Status,
    s.Shift_Start,
    s.Shift_End
FROM staff st
INNER JOIN assignment a
    ON st.Staff_ID = a.Staff_ID
INNER JOIN shift s
    ON a.Shift_ID = s.Shift_ID;

-- Multiple JOINs: Event, Venue, Zone and Shift
SELECT
    e.Event_Name,
    v.Venue_Name,
    z.Zone_Name,
    s.Shift_Start,
    s.Shift_End
FROM event e
JOIN venue v ON e.Venue_ID = v.Venue_ID
JOIN shift s ON e.Event_ID = s.Event_ID
JOIN zone z ON s.Zone_ID = z.Zone_ID;

-- LEFT JOIN: Display all staff, including those without assignments
SELECT
    st.Full_Name,
    a.Assignment_ID,
    a.Assignment_Status
FROM staff st
LEFT JOIN assignment a
    ON st.Staff_ID = a.Staff_ID;


-- =====================================================
-- PART 5: AGGREGATE FUNCTIONS
-- =====================================================

-- COUNT: Total staff
SELECT COUNT(*) AS Total_Staff
FROM staff;

-- COUNT: Total events
SELECT COUNT(*) AS Total_Events
FROM event;

-- GROUP BY: Number of assignments per staff member
SELECT
    st.Full_Name,
    COUNT(a.Assignment_ID) AS Total_Assignments
FROM staff st
LEFT JOIN assignment a
    ON st.Staff_ID = a.Staff_ID
GROUP BY st.Staff_ID, st.Full_Name;

-- HAVING: Staff with more than one assignment
SELECT
    st.Full_Name,
    COUNT(a.Assignment_ID) AS Total_Assignments
FROM staff st
JOIN assignment a
    ON st.Staff_ID = a.Staff_ID
GROUP BY st.Staff_ID, st.Full_Name
HAVING COUNT(a.Assignment_ID) > 1;

-- MAX and MIN
SELECT
    MAX(Required_Count) AS Maximum_Required_Staff,
    MIN(Required_Count) AS Minimum_Required_Staff
FROM shift_requirement;
-- =====================================================
-- PART 6: SUBQUERIES
-- =====================================================

-- Staff who have at least one non-cancelled assignment
SELECT Full_Name
FROM staff
WHERE Staff_ID IN (
    SELECT Staff_ID
    FROM assignment
    WHERE Assignment_Status <> 'Cancelled'
);

-- Shifts with more assignments than the average
SELECT Shift_ID
FROM assignment
GROUP BY Shift_ID
HAVING COUNT(*) > (
    SELECT AVG(Assignment_Count)
    FROM (
        SELECT COUNT(*) AS Assignment_Count
        FROM assignment
        GROUP BY Shift_ID
    ) AS Shift_Counts
);


-- =====================================================
-- PART 7: TRANSACTIONS
-- =====================================================

-- Example of COMMIT
START TRANSACTION;
UPDATE assignment
SET Assignment_Status = 'Confirmed'
WHERE Assignment_ID = 3;
COMMIT;
SELECT * FROM assignment
WHERE Assignment_ID = 3;

-- Example of ROLLBACK
START TRANSACTION;
UPDATE assignment
SET Assignment_Status = 'Cancelled'
WHERE Assignment_ID = 3;
ROLLBACK;
-- Verify rollback: status should remain Confirmed
SELECT * FROM assignment
WHERE Assignment_ID = 3;
-- =====================================================
-- PART 8: STORED PROCEDURE
-- =====================================================
DROP PROCEDURE IF EXISTS GetStaffAssignments;

DELIMITER //

CREATE PROCEDURE GetStaffAssignments(IN p_staff_id INT)
BEGIN
    SELECT
        st.Staff_ID,
        st.Full_Name,
        a.Assignment_ID,
        a.Assignment_Status,
        s.Shift_Start,
        s.Shift_End,
        e.Event_Name,
        z.Zone_Name
    FROM assignment a
    JOIN staff st
        ON a.Staff_ID = st.Staff_ID
    JOIN shift s
        ON a.Shift_ID = s.Shift_ID
    JOIN event e
        ON s.Event_ID = e.Event_ID
    JOIN zone z
        ON s.Zone_ID = z.Zone_ID
    WHERE st.Staff_ID = p_staff_id;
END //
DELIMITER ;

-- Execute stored procedure
CALL GetStaffAssignments(1);

-- =====================================================
-- PART 9: STORED FUNCTION
-- =====================================================

DROP FUNCTION IF EXISTS CountStaffAssignments;
DELIMITER //
CREATE FUNCTION CountStaffAssignments(p_staff_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total INT;

    SELECT COUNT(*)
    INTO total
    FROM assignment
    WHERE Staff_ID = p_staff_id
    AND Assignment_Status <> 'Cancelled';

    RETURN total;
END //

DELIMITER ;

-- Execute stored function
SELECT CountStaffAssignments(1) AS Total_Assignments;
-- =====================================================
-- PART 10: TRIGGER
-- =====================================================
DROP TRIGGER IF EXISTS after_assignment_insert;

DELIMITER //

CREATE TRIGGER after_assignment_insert
AFTER INSERT ON assignment
FOR EACH ROW
BEGIN
    INSERT INTO deployment_history
    (Action_Type, Action_Timestamp, Assignment_ID)
    VALUES
    ('Assignment Created', CURRENT_TIMESTAMP, NEW.Assignment_ID);
END //
DELIMITER ;

-- =====================================================
-- PART 11: TEST THE TRIGGER
-- =====================================================
-- Insert a new assignment to activate the trigger.
-- This example uses Rahul and Shift 2.
INSERT INTO assignment
(Assignment_Status, Staff_ID, Shift_ID)
VALUES
('Assigned', 1, 2);

-- Check whether the trigger logged the new assignment
SELECT *
FROM deployment_history
ORDER BY History_ID DESC;
-- view
DROP VIEW IF EXISTS shift_staffing_status;

CREATE VIEW shift_staffing_status AS
SELECT
    s.Shift_ID,
    e.Event_Name,
    z.Zone_Name,
    s.Shift_Start,
    s.Shift_End,
    (
        SELECT COUNT(*)
        FROM assignment a
        WHERE a.Shift_ID = s.Shift_ID
        AND a.Assignment_Status <> 'Cancelled'
    ) AS Assigned_Staff,
    (
        SELECT COALESCE(SUM(sr.Required_Count), 0)
        FROM shift_requirement sr
        WHERE sr.Shift_ID = s.Shift_ID
    ) AS Required_Staff
FROM shift s
JOIN event e
    ON s.Event_ID = e.Event_ID
JOIN zone z
    ON s.Zone_ID = z.Zone_ID;
    SELECT * FROM shift_staffing_status;
-- =====================================================
-- PART 12: VERIFY ADVANCED SQL OBJECTS
-- =====================================================
-- Check stored procedures
SHOW PROCEDURE STATUS
WHERE Db = 'concert_deployment_db';

-- Check stored functions
SHOW FUNCTION STATUS
WHERE Db = 'concert_deployment_db';

-- Check triggers
SHOW TRIGGERS;

-- Check tables
SHOW TABLES;

-- Final database verification
SELECT * FROM staff;
SELECT * FROM event;
SELECT * FROM assignment;
SELECT * FROM attendance;
SELECT * FROM deployment_history;
