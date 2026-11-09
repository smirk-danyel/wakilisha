
-- ============================================================
-- WAKILISHA DATABASE SCHEMA
-- Public emergency reporting; staff-only authenticated accounts
-- MySQL 8.4+
--
-- Fresh-install reference schema.
-- For an existing database created from the earlier schema, use
-- 001_public_emergency_reporting.sql instead of running this file.
-- CREATE TABLE IF NOT EXISTS does not modify existing table layouts.
-- ============================================================

CREATE DATABASE IF NOT EXISTS wakilisha
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE wakilisha;

-- ============================================================
-- 1. SERVICE AREAS
-- ============================================================

CREATE TABLE IF NOT EXISTS areas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_areas_name (name),
    UNIQUE KEY uq_areas_slug (slug)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 2. EMERGENCY TYPES
-- These populate the emergency choices shown in the citizen app.
-- ============================================================

CREATE TABLE IF NOT EXISTS emergency_types (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_emergency_types_name (name),
    UNIQUE KEY uq_emergency_types_slug (slug)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 3. USERS
-- Authenticated staff only: officers and administrators.
-- Each staff member receives a unique service number.
-- Citizens do not register or create user accounts.
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(120) NOT NULL,
    service_number VARCHAR(50) NOT NULL,
    phone VARCHAR(25) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('officer', 'admin') NOT NULL,
    primary_area_id BIGINT UNSIGNED NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    phone_verified_at DATETIME NULL,
    last_login_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_service_number (service_number),
    UNIQUE KEY uq_users_phone (phone),
    KEY idx_users_role (role),
    KEY idx_users_area (primary_area_id),
    CONSTRAINT fk_users_primary_area
        FOREIGN KEY (primary_area_id)
        REFERENCES areas (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 4. EMERGENCY REPORTS
-- Public submissions. No citizen account/user foreign key.
-- The API generates a 36-character tracking token, for example:
-- WAK- followed by 32 cryptographically random hexadecimal chars.
-- ============================================================

CREATE TABLE IF NOT EXISTS emergency_reports (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tracking_token CHAR(36) NOT NULL,
    reporter_phone VARCHAR(25) NOT NULL,
    emergency_type_id BIGINT UNSIGNED NOT NULL,
    area_id BIGINT UNSIGNED NULL,
    description TEXT NULL,
    location_description VARCHAR(255) NULL,
    landmark VARCHAR(255) NULL,
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    priority ENUM('low', 'medium', 'high', 'critical')
        NOT NULL DEFAULT 'medium',
    status ENUM(
        'submitted',
        'under_review',
        'assigned',
        'responding',
        'resolved',
        'reopened',
        'rejected',
        'cancelled'
    ) NOT NULL DEFAULT 'submitted',
    source ENUM('web', 'mobile', 'admin') NOT NULL DEFAULT 'mobile',
    occurred_at DATETIME NULL,
    resolved_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_emergency_reports_tracking_token (tracking_token),
    KEY idx_reports_phone_date (reporter_phone, created_at),
    KEY idx_reports_status_date (status, created_at),
    KEY idx_reports_area_status (area_id, status),
    KEY idx_reports_type (emergency_type_id),
    CONSTRAINT chk_report_coordinates
        CHECK (
            (latitude IS NULL AND longitude IS NULL)
            OR
            (
                latitude IS NOT NULL
                AND longitude IS NOT NULL
                AND latitude BETWEEN -90 AND 90
                AND longitude BETWEEN -180 AND 180
            )
        ),
    CONSTRAINT chk_report_location
        CHECK (
            location_description IS NOT NULL
            OR latitude IS NOT NULL
        ),
    CONSTRAINT fk_reports_emergency_type
        FOREIGN KEY (emergency_type_id)
        REFERENCES emergency_types (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_reports_area
        FOREIGN KEY (area_id)
        REFERENCES areas (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 5. EMERGENCY ASSIGNMENTS
-- An incident may have multiple assignment records over time.
-- The API must verify officer_id has role='officer' and
-- assigned_by has an authorised staff role before inserting.
-- ============================================================

CREATE TABLE IF NOT EXISTS emergency_assignments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    report_id BIGINT UNSIGNED NOT NULL,
    officer_id BIGINT UNSIGNED NOT NULL,
    assigned_by BIGINT UNSIGNED NULL,
    assignment_status ENUM(
        'assigned',
        'accepted',
        'declined',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'assigned',
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME NULL,
    completed_at DATETIME NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_assignments_report (report_id),
    KEY idx_assignments_officer (officer_id),
    KEY idx_assignments_officer_status (officer_id, assignment_status),
    KEY idx_assignments_assigned_by (assigned_by),
    CONSTRAINT fk_assignments_report
        FOREIGN KEY (report_id)
        REFERENCES emergency_reports (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_assignments_officer
        FOREIGN KEY (officer_id)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_assignments_assigned_by
        FOREIGN KEY (assigned_by)
        REFERENCES users (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 6. REPORT STATUS HISTORY
-- Initial public submission can have changed_by = NULL.
-- ============================================================

CREATE TABLE IF NOT EXISTS report_status_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    report_id BIGINT UNSIGNED NOT NULL,
    changed_by BIGINT UNSIGNED NULL,
    previous_status ENUM(
        'submitted',
        'under_review',
        'assigned',
        'responding',
        'resolved',
        'reopened',
        'rejected',
        'cancelled'
    ) NULL,
    new_status ENUM(
        'submitted',
        'under_review',
        'assigned',
        'responding',
        'resolved',
        'reopened',
        'rejected',
        'cancelled'
    ) NOT NULL,
    note TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_history_report_date (report_id, created_at),
    KEY idx_history_changed_by (changed_by),
    CONSTRAINT fk_history_report
        FOREIGN KEY (report_id)
        REFERENCES emergency_reports (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 7. REPORT EVIDENCE
-- Images and voice recordings are stored as files.
-- MySQL stores their metadata and private storage path only.
-- For citizen uploads, uploaded_by remains NULL (no account).
-- ============================================================

CREATE TABLE IF NOT EXISTS report_evidence (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    report_id BIGINT UNSIGNED NOT NULL,
    evidence_type ENUM('image', 'audio') NOT NULL,
    duration_seconds DECIMAL(8,2) NULL,
    uploaded_by BIGINT UNSIGNED NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT UNSIGNED NOT NULL,
    sha256 CHAR(64) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_evidence_stored_filename (stored_filename),
    KEY idx_evidence_report (report_id),
    KEY idx_evidence_uploaded_by (uploaded_by),
    CONSTRAINT chk_evidence_file_size
        CHECK (file_size_bytes > 0),
    CONSTRAINT chk_evidence_duration
        CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    CONSTRAINT chk_evidence_duration_type
        CHECK (evidence_type = 'audio' OR duration_seconds IS NULL),
    CONSTRAINT fk_evidence_report
        FOREIGN KEY (report_id)
        REFERENCES emergency_reports (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_evidence_user
        FOREIGN KEY (uploaded_by)
        REFERENCES users (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- INITIAL SERVICE AREAS
-- Safe to rerun without duplicating seeded rows.
-- ============================================================

INSERT INTO areas (name, slug) VALUES
    ('Kapsoya', 'kapsoya'),
    ('Annex', 'annex'),
    ('Huruma', 'huruma'),
    ('Langas', 'langas'),
    ('Kimumu', 'kimumu'),
    ('Munyaka', 'munyaka')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================
-- INITIAL EMERGENCY CATEGORIES
-- Safe to rerun without duplicating seeded rows.
-- ============================================================

INSERT INTO emergency_types (name, slug, description) VALUES
    (
        'Medical Emergency',
        'medical-emergency',
        'Medical incidents requiring urgent assistance'
    ),
    (
        'Fire',
        'fire',
        'Fire outbreaks and related emergencies'
    ),
    (
        'Road Traffic Accident',
        'road-traffic-accident',
        'Road accidents and traffic-related emergencies'
    ),
    (
        'Crime and Security',
        'crime-and-security',
        'Criminal incidents and immediate security threats'
    ),
    (
        'Rescue',
        'rescue',
        'People requiring urgent rescue assistance'
    ),
    (
        'Hazard and Infrastructure',
        'hazard-and-infrastructure',
        'Dangerous infrastructure, fallen objects and public hazards'
    ),
    (
        'Other Emergency',
        'other-emergency',
        'Emergency incidents not covered by other categories'
    )
ON DUPLICATE KEY UPDATE id = id;