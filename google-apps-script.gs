/**
 * Vivah Premium Wedding — Google Sheets Backend (Google Apps Script)
 *
 * Setup:
 * 1. Open your Google Sheet -> Extensions -> Apps Script.
 * 2. Paste this entire file into Code.gs (replace any starter code).
 * 3. Change STUDIO_PIN below to your private 4-8 digit studio PIN.
 * 4. Click Deploy -> New deployment -> Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL (ends with /exec) into sheets-config.js.
 */

const STUDIO_PIN = "1234"; // <-- CHANGE THIS TO YOUR PRIVATE STUDIO PIN
const SHEET_NAME = "Events";

const HEADERS = [
  "id",
  "customer_name",
  "booking_status",
  "phone_number",
  "event_type",
  "event_date",
  "event_location",
  "extra_functions",
  "bride_side_photographer",
  "bride_side_videographer",
  "groom_side_photographer",
  "groom_side_videographer",
  "side_mode",
  "single_side_photographer",
  "single_side_videographer",
  "team_lead_name",
  "other_crew_members",
  "work_status",
  "additional_requirements",
  "package_amount",
  "advance_amount",
  "due_amount",
  "created_at",
  "updated_at",
];

function jsonOutput(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function getOrInitSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    return sheet;
  }

  const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  HEADERS.forEach((header) => {
    if (!existingHeaders.includes(header)) {
      sheet.getRange(1, existingHeaders.length + 1).setValue(header).setFontWeight("bold");
      existingHeaders.push(header);
    }
  });

  return sheet;
}

function getHeaderMap(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = {};
  headers.forEach((name, idx) => {
    map[String(name).trim()] = idx;
  });
  return { headers, map };
}

function serializeCell(key, value) {
  if (key === "extra_functions") {
    return JSON.stringify(Array.isArray(value) ? value : []);
  }
  if (key === "phone_number" && value !== null && value !== undefined && String(value).trim() !== "") {
    return "'" + String(value).replace(/^'/, "");
  }
  if (value === null || value === undefined) {
    return "";
  }
  return value;
}

function parseRowObject(headers, rowValues) {
  const obj = {};
  headers.forEach((header, idx) => {
    let val = rowValues[idx];
    if (header === "extra_functions") {
      try {
        val = val ? JSON.parse(val) : [];
      } catch {
        val = [];
      }
    } else if (val instanceof Date) {
      if (header === "event_date") {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else {
        val = val.toISOString();
      }
    }
    obj[header] = val;
  });
  return obj;
}

function listRecords(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return [];
  }

  const { headers } = getHeaderMap(sheet);
  const rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return rows
    .map((row) => parseRowObject(headers, row))
    .filter((rec) => String(rec.id || "").trim() !== "")
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function createRecordInSheet(sheet, record) {
  const { headers, map } = getHeaderMap(sheet);
  const now = new Date().toISOString();
  const next = Object.assign({}, record, {
    id: Utilities.getUuid(),
    created_at: now,
    updated_at: now,
  });

  const rowValues = new Array(headers.length).fill("");
  headers.forEach((header) => {
    rowValues[map[header]] = serializeCell(header, next[header]);
  });

  sheet.appendRow(rowValues);
  return parseRowObject(headers, rowValues);
}

function updateRecordInSheet(sheet, id, updates) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return null;
  }

  const { headers, map } = getHeaderMap(sheet);
  const idCol = map.id + 1;
  const idValues = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
  const rowOffset = idValues.findIndex((cell) => String(cell[0]) === String(id));
  if (rowOffset < 0) {
    return null;
  }

  const rowNumber = rowOffset + 2;
  const currentValues = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
  const currentObj = parseRowObject(headers, currentValues);
  const merged = Object.assign({}, currentObj, updates, {
    id: currentObj.id,
    created_at: currentObj.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const nextValues = headers.map((header) => serializeCell(header, merged[header]));
  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([nextValues]);
  return parseRowObject(headers, nextValues);
}

function deleteRecordInSheet(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return false;
  }

  const { map } = getHeaderMap(sheet);
  const idCol = map.id + 1;
  const idValues = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
  const rowOffset = idValues.findIndex((cell) => String(cell[0]) === String(id));
  if (rowOffset < 0) {
    return false;
  }

  sheet.deleteRow(rowOffset + 2);
  return true;
}

function doGet() {
  return jsonOutput({
    ok: true,
    service: "Vivah Premium Wedding Register",
    message: "Web App is active. Use POST with Studio PIN.",
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const pin = String(body.pin || "").trim();

    if (!pin || pin !== String(STUDIO_PIN)) {
      return jsonOutput({ ok: false, error: "Invalid Studio PIN." });
    }

    const action = String(body.action || "list").toLowerCase();

    if (action === "list") {
      const sheet = getOrInitSheet();
      return jsonOutput({ ok: true, records: listRecords(sheet) });
    }

    lock.waitLock(10000);
    const sheet = getOrInitSheet();

    if (action === "create") {
      const created = createRecordInSheet(sheet, body.record || {});
      return jsonOutput({ ok: true, record: created });
    }

    if (action === "update") {
      const updated = updateRecordInSheet(sheet, body.id, body.record || {});
      if (!updated) {
        return jsonOutput({ ok: false, error: "Record not found." });
      }
      return jsonOutput({ ok: true, record: updated });
    }

    if (action === "delete") {
      const deleted = deleteRecordInSheet(sheet, body.id);
      if (!deleted) {
        return jsonOutput({ ok: false, error: "Record not found." });
      }
      return jsonOutput({ ok: true });
    }

    return jsonOutput({ ok: false, error: "Unsupported action." });
  } catch (err) {
    return jsonOutput({
      ok: false,
      error: err && err.message ? err.message : "Server error.",
    });
  } finally {
    try {
      lock.releaseLock();
    } catch {
      // Ignore if lock was not acquired.
    }
  }
}
