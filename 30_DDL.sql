CREATE DATABASE IF NOT EXISTS concert_deployment_db;
USE concert_deployment_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS shift_staffing_status;
DROP VIEW IF EXISTS staff_workload;

DROP TABLE IF EXISTS deployment_history;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS assignment;
DROP TABLE IF EXISTS shift_requirement;
DROP TABLE IF EXISTS staff_skill;
DROP TABLE IF EXISTS staff_availability;
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS shift;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS skill;
DROP TABLE IF EXISTS event;
DROP TABLE IF EXISTS zone;
DROP TABLE IF EXISTS venue;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    User_ID INT AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL,
    Role VARCHAR(30) NOT NULL,

    CONSTRAINT pk_users
        PRIMARY KEY (User_ID),

    CONSTRAINT uq_users_username
        UNIQUE (Username),

    CONSTRAINT chk_users_role
        CHECK (Role IN ('Organizer', 'Staff'))
);

-- ============================================================
-- 4. VENUE
-- ============================================================

CREATE TABLE venue (
    Venue_ID INT AUTO_INCREMENT,
    Venue_Name VARCHAR(100) NOT NULL,
    City VARCHAR(100) NOT NULL,

    CONSTRAINT pk_venue
        PRIMARY KEY (Venue_ID)
);

-- ============================================================
-- 5. ZONE
-- ============================================================

CREATE TABLE zone (
    Zone_ID INT AUTO_INCREMENT,
    Zone_Name VARCHAR(100) NOT NULL,
    Zone_Type VARCHAR(50) NOT NULL,
    Venue_ID INT NOT NULL,

    CONSTRAINT pk_zone
        PRIMARY KEY (Zone_ID),

    CONSTRAINT fk_zone_venue
        FOREIGN KEY (Venue_ID)
        REFERENCES venue(Venue_ID)
        ON DELETE CASCADE,

    CONSTRAINT uq_zone_name
        UNIQUE (Venue_ID, Zone_Name)
);

-- ============================================================
-- 6. EVENT
-- ============================================================

CREATE TABLE event (
    Event_ID INT AUTO_INCREMENT,
    Event_Name VARCHAR(150) NOT NULL,
    Event_Date DATE NOT NULL,
    Status VARCHAR(30) NOT NULL,
    Venue_ID INT NOT NULL,

    CONSTRAINT pk_event
        PRIMARY KEY (Event_ID),

    CONSTRAINT fk_event_venue
        FOREIGN KEY (Venue_ID)
        REFERENCES venue(Venue_ID)
        ON DELETE RESTRICT,

    CONSTRAINT chk_event_status
        CHECK (
            Status IN (
                'Upcoming',
                'Ongoing',
                'Completed',
                'Cancelled'
            )
        )
);

-- ============================================================
-- 7. SKILL
-- ============================================================

CREATE TABLE skill (
    Skill_ID INT AUTO_INCREMENT,
    Skill_Name VARCHAR(100) NOT NULL,

    CONSTRAINT pk_skill
        PRIMARY KEY (Skill_ID),

    CONSTRAINT uq_skill_name
        UNIQUE (Skill_Name)
);

-- ============================================================
-- 8. STAFF
-- ============================================================

CREATE TABLE staff (
    Staff_ID INT AUTO_INCREMENT,
    Full_Name VARCHAR(100) NOT NULL,
    Staff_Phone VARCHAR(20),
    User_ID INT NOT NULL,

    CONSTRAINT pk_staff
        PRIMARY KEY (Staff_ID),

    CONSTRAINT fk_staff_user
        FOREIGN KEY (User_ID)
        REFERENCES users(User_ID)
        ON DELETE CASCADE,

    CONSTRAINT uq_staff_user
        UNIQUE (User_ID)
);

-- ============================================================
-- 9. AVAILABILITY
-- ============================================================

CREATE TABLE availability (
    Availability_ID INT AUTO_INCREMENT,
    Available_Date DATE NOT NULL,
    Status VARCHAR(30) NOT NULL,

    CONSTRAINT pk_availability
        PRIMARY KEY (Availability_ID),

    CONSTRAINT chk_availability_status
        CHECK (Status IN ('Available', 'Unavailable'))
);

-- ============================================================
-- 10. STAFF_AVAILABILITY
-- M:N relationship between STAFF and AVAILABILITY
-- ============================================================

CREATE TABLE staff_availability (
    Staff_ID INT NOT NULL,
    Availability_ID INT NOT NULL,

    CONSTRAINT pk_staff_availability
        PRIMARY KEY (Staff_ID, Availability_ID),

    CONSTRAINT fk_sa_staff
        FOREIGN KEY (Staff_ID)
        REFERENCES staff(Staff_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_sa_availability
        FOREIGN KEY (Availability_ID)
        REFERENCES availability(Availability_ID)
        ON DELETE CASCADE
);

-- ============================================================
-- 11. STAFF_SKILL
-- M:N relationship between STAFF and SKILL
-- ============================================================

CREATE TABLE staff_skill (
    Staff_ID INT NOT NULL,
    Skill_ID INT NOT NULL,
    Proficiency_Level VARCHAR(30) NOT NULL,

    CONSTRAINT pk_staff_skill
        PRIMARY KEY (Staff_ID, Skill_ID),

    CONSTRAINT fk_staff_skill_staff
        FOREIGN KEY (Staff_ID)
        REFERENCES staff(Staff_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_staff_skill_skill
        FOREIGN KEY (Skill_ID)
        REFERENCES skill(Skill_ID)
        ON DELETE CASCADE,

    CONSTRAINT chk_proficiency_level
        CHECK (
            Proficiency_Level IN (
                'Beginner',
                'Intermediate',
                'Advanced',
                'Expert'
            )
        )
);

-- ============================================================
-- 12. SHIFT
-- ============================================================

CREATE TABLE shift (
    Shift_ID INT AUTO_INCREMENT,
    Shift_Start DATETIME NOT NULL,
    Shift_End DATETIME NOT NULL,
    Event_ID INT NOT NULL,
    Zone_ID INT NOT NULL,

    CONSTRAINT pk_shift
        PRIMARY KEY (Shift_ID),

    CONSTRAINT fk_shift_event
        FOREIGN KEY (Event_ID)
        REFERENCES event(Event_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_shift_zone
        FOREIGN KEY (Zone_ID)
        REFERENCES zone(Zone_ID)
        ON DELETE RESTRICT,

    CONSTRAINT chk_shift_time
        CHECK (Shift_End > Shift_Start)
);

-- ============================================================
-- 13. SHIFT_REQUIREMENT
-- M:N relationship between SHIFT and SKILL.
-- Required_Count is an attribute of the "requires" relationship.
-- ============================================================

CREATE TABLE shift_requirement (
    Shift_ID INT NOT NULL,
    Skill_ID INT NOT NULL,
    Required_Count INT NOT NULL,

    CONSTRAINT pk_shift_requirement
        PRIMARY KEY (Shift_ID, Skill_ID),

    CONSTRAINT fk_sr_shift
        FOREIGN KEY (Shift_ID)
        REFERENCES shift(Shift_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_sr_skill
        FOREIGN KEY (Skill_ID)
        REFERENCES skill(Skill_ID)
        ON DELETE CASCADE,

    CONSTRAINT chk_required_count
        CHECK (Required_Count > 0)
);

-- ============================================================
-- 14. ASSIGNMENT
-- ============================================================

CREATE TABLE assignment (
    Assignment_ID INT AUTO_INCREMENT,
    Assignment_Status VARCHAR(30) NOT NULL,
    Staff_ID INT NOT NULL,
    Shift_ID INT NOT NULL,

    CONSTRAINT pk_assignment
        PRIMARY KEY (Assignment_ID),

    CONSTRAINT fk_assignment_staff
        FOREIGN KEY (Staff_ID)
        REFERENCES staff(Staff_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_assignment_shift
        FOREIGN KEY (Shift_ID)
        REFERENCES shift(Shift_ID)
        ON DELETE CASCADE,

    CONSTRAINT uq_staff_shift
        UNIQUE (Staff_ID, Shift_ID),

    CONSTRAINT chk_assignment_status
        CHECK (
            Assignment_Status IN (
                'Assigned',
                'Confirmed',
                'Completed',
                'Cancelled'
            )
        )
);

-- ============================================================
-- 15. ATTENDANCE
-- ============================================================

CREATE TABLE attendance (
    Attendance_ID INT AUTO_INCREMENT,
    Check_in_Time DATETIME,
    Check_out_Time DATETIME,
    Event_ID INT NOT NULL,
    Assignment_ID INT NOT NULL,

    CONSTRAINT pk_attendance
        PRIMARY KEY (Attendance_ID),

    CONSTRAINT fk_attendance_event
        FOREIGN KEY (Event_ID)
        REFERENCES event(Event_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_attendance_assignment
        FOREIGN KEY (Assignment_ID)
        REFERENCES assignment(Assignment_ID)
        ON DELETE CASCADE,

    CONSTRAINT uq_attendance_assignment
        UNIQUE (Assignment_ID),

    CONSTRAINT chk_attendance_time
        CHECK (
            Check_out_Time IS NULL
            OR Check_in_Time IS NULL
            OR Check_out_Time > Check_in_Time
        )
);

-- ============================================================
-- 16. DEPLOYMENT_HISTORY
-- ============================================================

CREATE TABLE deployment_history (
    History_ID INT AUTO_INCREMENT,
    Action_Type VARCHAR(50) NOT NULL,
    Action_Timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Assignment_ID INT NOT NULL,

    CONSTRAINT pk_deployment_history
        PRIMARY KEY (History_ID),

    CONSTRAINT fk_history_assignment
        FOREIGN KEY (Assignment_ID)
        REFERENCES assignment(Assignment_ID)
        ON DELETE CASCADE
);

-- ============================================================
-- 17. INDEXES
-- ============================================================

CREATE INDEX idx_zone_venue
ON zone(Venue_ID);

CREATE INDEX idx_event_venue
ON event(Venue_ID);

CREATE INDEX idx_event_date
ON event(Event_Date);

CREATE INDEX idx_shift_event
ON shift(Event_ID);

CREATE INDEX idx_shift_zone
ON shift(Zone_ID);

CREATE INDEX idx_shift_time
ON shift(Shift_Start, Shift_End);

CREATE INDEX idx_assignment_staff
ON assignment(Staff_ID);

CREATE INDEX idx_assignment_shift
ON assignment(Shift_ID);

CREATE INDEX idx_history_assignment
ON deployment_history(Assignment_ID);

-- ============================================================
-- 18. VIEW: SHIFT STAFFING STATUS
-- ============================================================

CREATE VIEW shift_staffing_status AS
SELECT
    s.Shift_ID,
    e.Event_Name,
    z.Zone_Name,
    s.Shift_Start,
    s.Shift_End,
    COUNT(
        CASE
            WHEN a.Assignment_Status <> 'Cancelled'
            THEN a.Assignment_ID
        END
    ) AS Assigned_Staff,
    COALESCE(SUM(sr.Required_Count), 0) AS Required_Staff
FROM shift s
JOIN event e
    ON s.Event_ID = e.Event_ID
JOIN zone z
    ON s.Zone_ID = z.Zone_ID
LEFT JOIN assignment a
    ON s.Shift_ID = a.Shift_ID
LEFT JOIN shift_requirement sr
    ON s.Shift_ID = sr.Shift_ID
GROUP BY
    s.Shift_ID,
    e.Event_Name,
    z.Zone_Name,
    s.Shift_Start,
    s.Shift_End;

-- ============================================================
-- 19. VIEW: STAFF WORKLOAD
-- ============================================================

CREATE VIEW staff_workload AS
SELECT
    st.Staff_ID,
    st.Full_Name,
    COUNT(a.Assignment_ID) AS Total_Assignments
FROM staff st
LEFT JOIN assignment a
    ON st.Staff_ID = a.Staff_ID
    AND a.Assignment_Status <> 'Cancelled'
GROUP BY
    st.Staff_ID,
    st.Full_Name;

-- ============================================================
-- 20. ALTER TABLE EXAMPLE
-- ============================================================
-- This demonstrates ALTER without changing the ER design.
-- Staff_Phone is expanded from VARCHAR(20) to VARCHAR(25).

ALTER TABLE staff
MODIFY Staff_Phone VARCHAR(25);

CREATE TABLE test_drop_table (
    Test_ID INT PRIMARY KEY,
    Test_Name VARCHAR(50)
);

DROP TABLE test_drop_table;

