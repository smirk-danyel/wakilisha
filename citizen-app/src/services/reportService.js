const API_BASE_URL = "http://192.168.253.1:4000";

// Convert Kenyan local mobile numbers to international format.
function normalizeKenyanPhone(phone) {
  const cleaned = String(phone || "").replace(/\s+/g, "");

  if (/^07\d{8}$/.test(cleaned)) {
    return `+254${cleaned.slice(1)}`;
  }

  if (/^01\d{8}$/.test(cleaned)) {
    return `+254${cleaned.slice(1)}`;
  }

  return cleaned;
}

// Resolve the database ID using the categories supplied by the API.
async function getEmergencyTypeId(emergencyTypeName) {
  const response = await fetch(`${API_BASE_URL}/api/emergency-types`);
  const result = await response.json();

  if (!response.ok || result.status !== "ok") {
    throw new Error("Unable to load emergency categories.");
  }

  const selected = result.data.find(
    (item) =>
      item.name.toLowerCase() === String(emergencyTypeName || "").toLowerCase(),
  );

  if (!selected) {
    throw new Error("The selected emergency category was not found.");
  }

  return selected.id;
}

// Build an Android-compatible multipart file object.
function getFileDetails(uri, kind) {
  const cleanUri = uri.split("?")[0];
  const extension = cleanUri.split(".").pop()?.toLowerCase();

  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    m4a: "audio/mp4",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    webm: "audio/webm",
  };

  const fallbackExtension = kind === "image" ? "jpg" : "m4a";
  const fallbackMime = kind === "image" ? "image/jpeg" : "audio/mp4";

  return {
    uri,
    name: `${kind}-${Date.now()}.${mimeTypes[extension] ? extension : fallbackExtension}`,
    type: mimeTypes[extension] || fallbackMime,
  };
}

export async function submitEmergencyReport(report) {
  const emergencyTypeId = await getEmergencyTypeId(report.emergencyType);

  const formData = new FormData();

  formData.append("emergency_type_id", String(emergencyTypeId));
  formData.append("reporter_phone", normalizeKenyanPhone(report.phone));
  formData.append("location_description", report.location || "");
  formData.append("description", report.description || "");

  if (report.latitude != null && report.longitude != null) {
    formData.append("latitude", String(report.latitude));
    formData.append("longitude", String(report.longitude));
  }

  if (report.imageUri) {
    formData.append("image", getFileDetails(report.imageUri, "image"));
  }

  if (report.audioUri) {
    formData.append("audio", getFileDetails(report.audioUri, "audio"));
  }

  const response = await fetch(`${API_BASE_URL}/api/reports`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || result.status !== "success") {
    throw new Error(
      result.message || "Unable to submit your emergency report.",
    );
  }

  return result.data;
}
