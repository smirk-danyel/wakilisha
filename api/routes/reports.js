const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const db = require("../db");
const upload = require("../middleware/upload");

const router = express.Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedSignatures = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
  "audio/vnd.wave": "audio",
  "audio/ogg": "audio",
};

// Delete uploaded files when a submission fails.
async function deleteUploadedFiles(files) {
  for (const file of files) {
    try {
      await fs.promises.unlink(file.path);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error("Upload cleanup failed:", error.message);
      }
    }
  }
}

// Calculate SHA-256 for evidence integrity.
async function calculateSHA256(filePath) {
  const hash = crypto.createHash("sha256");
  const stream = fs.createReadStream(filePath);

  for await (const chunk of stream) {
    hash.update(chunk);
  }

  return hash.digest("hex");
}

// Validate uploaded file signatures.
async function validateFileSignatures(files) {
  const { fileTypeFromFile } = await import("file-type");

  for (const file of files) {
    const detected = await fileTypeFromFile(file.path);

    if (!detected || !allowedSignatures[detected.mime]) {
      throw new Error(
        "One of the uploaded files has an unsupported file signature.",
      );
    }

    const expectedType = file.fieldname === "image" ? "image" : "audio";

    if (allowedSignatures[detected.mime] !== expectedType) {
      throw new Error("The uploaded file does not match its expected type.");
    }

    file.detectedMime = detected.mime;
    file.evidenceType = expectedType;
  }
}

// Hash and prepare evidence metadata.
async function prepareEvidence(file) {
  const originalName =
    path
      .basename(file.originalname)
      .replace(/[\x00-\x1f\x7f]/g, "")
      .slice(0, 255) || "uploaded-file";

  return {
    evidenceType: file.evidenceType,
    originalFilename: originalName,
    storedFilename: file.filename,
    storagePath: `uploads/${file.filename}`,
    mimeType: file.detectedMime,
    fileSize: file.size,
    sha256: await calculateSHA256(file.path),
  };
}

// Public citizen endpoint: Submit an emergency report.
router.post("/reports", (req, res) => {
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ])(req, res, async (uploadError) => {
    const files = Object.values(req.files || {}).flat();

    if (uploadError) {
      await deleteUploadedFiles(files);

      const status = uploadError instanceof multer.MulterError ? 400 : 400;

      return res.status(status).json({
        status: "error",
        message: uploadError.message || "File upload failed.",
      });
    }

    let connection;
    let transactionStarted = false;

    try {
      // Read submitted fields.
      const {
        emergency_type_id,
        area_id,
        reporter_phone,
        location_description,
        landmark,
        latitude,
        longitude,
        description,
      } = req.body;

      // Validate emergency category.
      const typeId = Number(emergency_type_id);

      if (!Number.isSafeInteger(typeId) || typeId <= 0) {
        throw new Error("Please select a valid emergency category.");
      }

      const areaId =
        area_id === undefined || area_id === "" ? null : Number(area_id);

      if (areaId !== null && (!Number.isSafeInteger(areaId) || areaId <= 0)) {
        throw new Error("Please select a valid area.");
      }

      // Validate contact number.
      const phone = String(reporter_phone || "").trim();

      if (!/^\+?[1-9]\d{7,14}$/.test(phone)) {
        throw new Error("Please provide a valid mobile phone number.");
      }

      // Validate location.
      const location = String(location_description || "").trim();
      const locationLandmark = String(landmark || "").trim();

      const hasLatitude = latitude !== undefined && latitude !== "";
      const hasLongitude = longitude !== undefined && longitude !== "";

      if (hasLatitude !== hasLongitude) {
        throw new Error("Both GPS latitude and longitude are required.");
      }

      let lat = null;
      let lng = null;

      if (hasLatitude && hasLongitude) {
        lat = Number(latitude);
        lng = Number(longitude);

        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180
        ) {
          throw new Error("Please provide valid GPS coordinates.");
        }
      }

      if (!location && lat === null) {
        throw new Error(
          "Please provide an incident location or GPS coordinates.",
        );
      }

      // Validate description.
      const reportDescription = String(description || "").trim();

      const audioFiles = files.filter((file) => file.fieldname === "audio");

      if (!reportDescription && audioFiles.length === 0) {
        throw new Error("Please provide a written or recorded description.");
      }

      if (reportDescription.length > 10000) {
        throw new Error("The description is too long.");
      }

      if (location.length > 255 || locationLandmark.length > 255) {
        throw new Error("Location details are too long.");
      }

      // Verify actual file contents.
      await validateFileSignatures(files);

      // Prepare evidence metadata.
      const evidence = [];

      for (const file of files) {
        evidence.push(await prepareEvidence(file));
      }

      // Connect to MySQL.
      connection = await db.getConnection();

      await connection.beginTransaction();
      transactionStarted = true;

      // Ensure the emergency category exists and is active.
      const [types] = await connection.execute(
        `SELECT id
         FROM emergency_types
         WHERE id = ? AND is_active = 1
         LIMIT 1`,
        [typeId],
      );

      if (types.length === 0) {
        throw new Error("The selected emergency category is unavailable.");
      }

      if (areaId !== null) {
        const [areas] = await connection.execute(
          "SELECT id FROM areas WHERE id = ? LIMIT 1",
          [areaId],
        );

        if (areas.length === 0) {
          throw new Error("The selected area is unavailable.");
        }
      }

      // Generate unpredictable public tracking token.
      const trackingToken = "WAK-" + crypto.randomBytes(16).toString("hex");

      // Create emergency report.
      const [reportResult] = await connection.execute(
        `INSERT INTO emergency_reports (
    tracking_token,
    reporter_phone,
    emergency_type_id,
    area_id,
    description,
    location_description,
    landmark,
    latitude,
    longitude,
    source
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          trackingToken,
          phone,
          typeId,
          areaId,
          reportDescription || null,
          location || null,
          locationLandmark || null,
          lat,
          lng,
          "mobile",
        ],
      );
      const reportId = reportResult.insertId;

      // Save evidence metadata.
      for (const item of evidence) {
        await connection.execute(
          `INSERT INTO report_evidence (
            report_id,
            evidence_type,
            uploaded_by,
            original_filename,
            stored_filename,
            storage_path,
            mime_type,
            file_size_bytes,
            sha256
          ) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?)`,
          [
            reportId,
            item.evidenceType,
            item.originalFilename,
            item.storedFilename,
            item.storagePath,
            item.mimeType,
            item.fileSize,
            item.sha256,
          ],
        );
      }

      await connection.commit();
      transactionStarted = false;

      return res.status(201).json({
        status: "success",
        message: "Emergency report submitted successfully.",
        data: {
          tracking_token: trackingToken,
          status: "submitted",
          message: "Keep your tracking token safe to follow up on your report.",
        },
      });
    } catch (error) {
      if (transactionStarted && connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error("Transaction rollback failed:", rollbackError.message);
        }
      }

      await deleteUploadedFiles(files);

      console.error("Emergency report submission failed:", error.message);

      const clientErrors = [
        "Please select a valid emergency category.",
        "Please provide a valid mobile phone number.",
        "Both GPS latitude and longitude are required.",
        "Please provide valid GPS coordinates.",
        "Please provide an incident location or GPS coordinates.",
        "Please provide a written or recorded description.",
        "The description is too long.",
        "Location details are too long.",
        "One of the uploaded files has an unsupported file signature.",
        "The uploaded file does not match its expected type.",
        "The selected emergency category is unavailable.",
      ];

      const isClientError = clientErrors.includes(error.message);

      return res.status(isClientError ? 400 : 500).json({
        status: "error",
        message: isClientError
          ? error.message
          : "Unable to submit your emergency report. Please try again.",
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  });
});

module.exports = router;
