-- ============================================================
-- Grace College Exam Seating ERP
-- Single flat table: seat_allocations
-- Run this in phpMyAdmin on the `mark_allocation` database
-- ============================================================

-- Drop old two-table approach (optional – comment out if you want to keep history)
-- DROP TABLE IF EXISTS `seats`;
-- DROP TABLE IF EXISTS `seating_plans`;

-- Single flat table storing one row per allocated seat
CREATE TABLE IF NOT EXISTS `seat_allocations` (
  `id`           int(11)      NOT NULL AUTO_INCREMENT,
  `hall_no`      varchar(100) NOT NULL COMMENT 'Exam hall identifier, e.g. H-101',
  `exam_date`    date         NOT NULL COMMENT 'Date of the examination',
  `session`      varchar(10)  NOT NULL COMMENT 'FN or AN',
  `seat_label`   varchar(10)  NOT NULL COMMENT 'Grid position, e.g. A1, B2',
  `section`      varchar(10)  NOT NULL COMMENT 'LEFT (odd seats) or RIGHT (even seats)',
  `reg_no`       varchar(50)  DEFAULT NULL COMMENT 'Student register number',
  `student_name` varchar(255) DEFAULT NULL COMMENT 'Full student name',
  `department`   varchar(100) DEFAULT NULL COMMENT 'Department / branch',
  `subject_name` varchar(200) DEFAULT NULL COMMENT 'Subject name or code for this seat',
  `created_at`   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  -- Enforce one student per seat per exam slot
  UNIQUE KEY `unique_seat` (`hall_no`, `exam_date`, `session`, `seat_label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Flat seat allocation table – one row per seat';
