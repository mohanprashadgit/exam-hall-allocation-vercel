-- Grace College Exam Seating ERP - Seating Tables Setup
-- Use this file in phpMyAdmin to create the seating plan tables on your live/production database.
-- Note: This does NOT create or modify the student table (which already exists).

-- Create seating_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS `seating_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hall_no` varchar(100) NOT NULL,
  `exam_date` date NOT NULL,
  `session` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_seating` (`hall_no`,`exam_date`,`session`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create seats table if it doesn't exist
CREATE TABLE IF NOT EXISTS `seats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_id` int(11) NOT NULL,
  `seat_label` varchar(10) NOT NULL,
  `reg_no` varchar(50) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `subject_code` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `seating_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
