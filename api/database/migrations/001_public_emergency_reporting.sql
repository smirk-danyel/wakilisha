
-- ============================================================
-- WAKILISHA MIGRATION 001
-- Convert the original citizen-account schema to public
-- emergency reporting with staff-only service-number accounts.
-- Target: MySQL 8.4+
--
-- Preconditions verified before preparing this migration:
--   * Existing seven-table Wakilisha schema is installed.
--   * users, emergency_reports, emergency_assignments,
--     report_status_history and report_evidence contain zero rows.
--   * areas and emergency_types contain seeded records to preserve.
--
-- Take a database backup before running this migration.
-- Run this migration ONCE, against the existing database.
-- Do not run the fresh-install schema.sql on top of the old schema.
-- ============================================================

USE wakilisha;

-- 1. Staff accounts only. There are no user rows, so service_number
--    can safely be made mandatory and role can lose the citizen value.
--    Email fields are removed and replaced by unique service numbers.
ALTER TABLE users
    DROP CHECK chk_users_contact,
    DROP INDEX email,
    DROP COLUMN email,
    DROP COLUMN email_verified_at,
    ADD COLUMN service_number VARCHAR(50) NOT NULL AFTER full_name,
    ADD UNIQUE KEY uq_users_service_number (service_number),
    MODIFY COLUMN role ENUM('officer', 'admin') NOT NULL;

-- Keep phone and its existing unique index. It remains optional for
-- staff contact details; service_number is their required identifier.

-- 2. Public reports do not belong to citizen user accounts.
--    Replace reference_code with a random 36-character tracking token
--    and store the reporter's mobile number directly on the report.
ALTER TABLE emergency_reports
    DROP FOREIGN KEY fk_reports_citizen,
    DROP INDEX idx_reports_citizen_date,
    DROP INDEX reference_code,
    DROP COLUMN citizen_id,
    DROP COLUMN title,
    CHANGE COLUMN reference_code tracking_token CHAR(36) NOT NULL,
    ADD COLUMN reporter_phone VARCHAR(25) NOT NULL AFTER tracking_token,
    MODIFY COLUMN description TEXT NULL,
    MODIFY COLUMN location_description VARCHAR(255) NULL,
    MODIFY COLUMN source ENUM('web', 'mobile', 'admin') NOT NULL DEFAULT 'mobile',
    ADD UNIQUE KEY uq_emergency_reports_tracking_token (tracking_token),
    ADD KEY idx_reports_phone_date (reporter_phone, created_at),
    ADD CONSTRAINT chk_report_location
        CHECK (location_description IS NOT NULL OR latitude IS NOT NULL);

-- The existing chk_report_coordinates constraint remains in place.
-- It requires latitude and longitude together and validates their ranges.
-- The API must require either a typed description or an audio attachment.
-- That cross-table rule is validated in the API within a transaction.

-- 3. Support image and voice evidence. Citizen uploads have
--    uploaded_by = NULL because citizens have no user account.
ALTER TABLE report_evidence
    ADD COLUMN evidence_type ENUM('image', 'audio') NOT NULL AFTER report_id,
    ADD COLUMN duration_seconds DECIMAL(8,2) NULL AFTER evidence_type,
    ADD CONSTRAINT chk_evidence_file_size
        CHECK (file_size_bytes > 0),
    ADD CONSTRAINT chk_evidence_duration
        CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    ADD CONSTRAINT chk_evidence_duration_type
        CHECK (evidence_type = 'audio' OR duration_seconds IS NULL);

-- 4. Verification. Expected operational row counts remain zero.
SELECT 'users' AS table_name, COUNT(*) AS records FROM users
UNION ALL
SELECT 'emergency_reports', COUNT(*) FROM emergency_reports
UNION ALL
SELECT 'emergency_assignments', COUNT(*) FROM emergency_assignments
UNION ALL
SELECT 'report_status_history', COUNT(*) FROM report_status_history
UNION ALL
SELECT 'report_evidence', COUNT(*) FROM report_evidence;

SELECT id, name, slug FROM areas ORDER BY id;
SELECT id, name, slug FROM emergency_types ORDER BY id;

SHOW CREATE TABLE users;
SHOW CREATE TABLE emergency_reports;
SHOW CREATE TABLE report_evidence;
