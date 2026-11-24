const STORAGE_KEY = "weddingStudioCustomers.v1";
const PIN_SESSION_KEY = "vivahStudioPin.session.v1";
const PIN_LOCAL_KEY = "vivahStudioPin.device.v1";

const customerForm = document.getElementById("customerForm");
const functionsContainer = document.getElementById("functionsContainer");
const functionRowTemplate = document.getElementById("functionRowTemplate");
const addFunctionBtn = document.getElementById("addFunctionBtn");
const resetBtn = document.getElementById("resetBtn");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const eventButtonsContainer = document.getElementById("eventButtonsContainer");
const eventsListView = document.getElementById("eventsListView");

const eventDetailPane = document.getElementById("eventDetailPane");
const eventDetailForm = document.getElementById("eventDetailForm");
const backToEventsListBtn = document.getElementById("backToEventsListBtn");
const detailFunctionsContainer = document.getElementById("detailFunctionsContainer");
const detailFunctionsPanel = detailFunctionsContainer.closest(".nested-panel");
const detailAddFunctionBtn = document.getElementById("detailAddFunctionBtn");
const detailDeleteBtn = document.getElementById("detailDeleteBtn");
const detailEditBtn = document.getElementById("detailEditBtn");
const detailSaveBtn = document.getElementById("detailSaveBtn");
const detailCancelBtn = document.getElementById("detailCancelBtn");
const detailViewHint = document.getElementById("detailViewHint");
const detailEventTitle = document.getElementById("detailEventTitle");

const detailCustomerNameInput = document.getElementById("detailCustomerName");
const detailBookingStatusInput = document.getElementById("detailBookingStatus");
const detailPhoneNumberInput = document.getElementById("detailPhoneNumber");
const detailEventTypeInput = document.getElementById("detailEventType");
const detailEventDateInput = document.getElementById("detailEventDate");
const detailEventLocationInput = document.getElementById("detailEventLocation");
const detailBrideSidePhotographerInput = document.getElementById("detailBrideSidePhotographer");
const detailBrideSideVideographerInput = document.getElementById("detailBrideSideVideographer");
const detailGroomSidePhotographerInput = document.getElementById("detailGroomSidePhotographer");
const detailGroomSideVideographerInput = document.getElementById("detailGroomSideVideographer");
const detailTeamLeadNameInput = document.getElementById("detailTeamLeadName");
const detailOtherCrewMembersInput = document.getElementById("detailOtherCrewMembers");
const detailWorkStatusInput = document.getElementById("detailWorkStatus");
const detailAdditionalRequirementsInput = document.getElementById("detailAdditionalRequirements");
const detailSideModeInput = document.getElementById("detailSideMode");
const detailSingleSidePhotographerInput = document.getElementById("detailSingleSidePhotographer");
const detailSingleSideVideographerInput = document.getElementById("detailSingleSideVideographer");
const detailCombinedTeamFields = document.getElementById("detailCombinedTeamFields");
const detailSingleTeamFields = document.getElementById("detailSingleTeamFields");

const sideModeInput = document.getElementById("sideMode");
const singleSidePhotographerInput = document.getElementById("singleSidePhotographer");
const singleSideVideographerInput = document.getElementById("singleSideVideographer");
const combinedTeamFields = document.getElementById("combinedTeamFields");
const singleTeamFields = document.getElementById("singleTeamFields");

const detailPackageAmountInput = document.getElementById("detailPackageAmount");
const detailAdvanceAmountInput = document.getElementById("detailAdvanceAmount");
const detailDueAmountInput = document.getElementById("detailDueAmount");

const packageAmountInput = document.getElementById("packageAmount");
const advanceAmountInput = document.getElementById("advanceAmount");
const dueAmountInput = document.getElementById("dueAmount");

const dashboardView = document.getElementById("dashboardView");
const pinLockView = document.getElementById("pinLockView");
const pinUnlockForm = document.getElementById("pinUnlockForm");
const studioPinInput = document.getElementById("studioPinInput");
const rememberPinCheckbox = document.getElementById("rememberPinCheckbox");
const pinErrorMsg = document.getElementById("pinErrorMsg");
const unlockPinBtn = document.getElementById("unlockPinBtn");
const lockRegisterBtn = document.getElementById("lockRegisterBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const addEventView = document.getElementById("addEventView");
const viewEventsView = document.getElementById("viewEventsView");
const openAddEventBtn = document.getElementById("openAddEvent");
const openViewEventsBtn = document.getElementById("openViewEvents");
const backToDashboardFromAddBtn = document.getElementById("backToDashboardFromAdd");
const backToDashboardFromViewBtn = document.getElementById("backToDashboardFromView");
const statTotalEvents = document.getElementById("statTotalEvents");
const statUpcomingEvents = document.getElementById("statUpcomingEvents");
const statDueEvents = document.getElementById("statDueEvents");

const sheetsConfig = window.SHEETS_CONFIG || {};
const hasValidSheetsConfig =
  typeof sheetsConfig.webAppUrl === "string" &&
  sheetsConfig.webAppUrl.trim() &&
  !sheetsConfig.webAppUrl.includes("YOUR_DEPLOYMENT_ID");

const supabaseConfig = window.SUPABASE_CONFIG || {};
const hasValidSupabaseConfig =
  typeof supabaseConfig.url === "string" &&
  typeof supabaseConfig.anonKey === "string" &&
  supabaseConfig.url.trim() &&
  supabaseConfig.anonKey.trim() &&
  !supabaseConfig.url.includes("YOUR_PROJECT_REF") &&
  !supabaseConfig.anonKey.includes("YOUR_SUPABASE_ANON_KEY");

const usingSheets = Boolean(hasValidSheetsConfig);

const supabaseClient = !usingSheets && hasValidSupabaseConfig && window.supabase
  ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: false },
    })
  : null;

const usingSupabase = Boolean(supabaseClient);
const usingRemote = usingSheets || usingSupabase;

let activeStudioPin = "";
let records = [];
let selectedRecordId = null;
let isDetailEditMode = false;
let currentDetailRecord = null;

function showView(view) {
  pinLockView.classList.add("hidden");
  dashboardView.classList.add("hidden");
  addEventView.classList.add("hidden");
  viewEventsView.classList.add("hidden");

  if (view === "pin") {
    pinLockView.classList.remove("hidden");
    return;
  }

  if (view === "add") {
    addEventView.classList.remove("hidden");
    return;
  }

  if (view === "view") {
    viewEventsView.classList.remove("hidden");
    return;
  }

  dashboardView.classList.remove("hidden");
}

function applyNavigationState(state = { view: "dashboard" }) {
  if (usingSheets && !activeStudioPin) {
    showView("pin");
    return;
  }

  const targetView = state?.view || "dashboard";

  if (targetView === "detail" && state.recordId) {
    selectedRecordId = state.recordId;
    isDetailEditMode = false;
    renderEventButtons(searchInput.value);
    renderSelectedRecord();
    showView("view");
    return;
  }

  if (targetView === "view") {
    selectedRecordId = null;
    isDetailEditMode = false;
    renderEventButtons(searchInput.value);
    renderSelectedRecord();
    showView("view");
    return;
  }

  if (targetView === "add") {
    showView("add");
    return;
  }

  selectedRecordId = null;
  isDetailEditMode = false;
  showView("dashboard");
}

function navigateTo(state, { replace = false } = {}) {
  applyNavigationState(state);
  if (!window.history || typeof window.history.pushState !== "function") {
    return;
  }

  if (replace) {
    window.history.replaceState(state, "");
  } else {
    window.history.pushState(state, "");
  }
}

function getStoredPin() {
  try {
    return sessionStorage.getItem(PIN_SESSION_KEY) || localStorage.getItem(PIN_LOCAL_KEY) || "";
  } catch {
    return "";
  }
}

function setStoredPin(pin, rememberOnDevice) {
  activeStudioPin = pin;
  try {
    sessionStorage.setItem(PIN_SESSION_KEY, pin);
    if (rememberOnDevice) {
      localStorage.setItem(PIN_LOCAL_KEY, pin);
    } else {
      localStorage.removeItem(PIN_LOCAL_KEY);
    }
  } catch {
    // Ignore storage restrictions.
  }
}

function clearStoredPin() {
  activeStudioPin = "";
  try {
    sessionStorage.removeItem(PIN_SESSION_KEY);
    localStorage.removeItem(PIN_LOCAL_KEY);
  } catch {
    // Ignore storage restrictions.
  }
}

function setPinError(message = "") {
  if (!message) {
    pinErrorMsg.textContent = "";
    pinErrorMsg.classList.add("hidden");
    return;
  }

  pinErrorMsg.textContent = message;
  pinErrorMsg.classList.remove("hidden");
}

function lockStudioView(errorMessage = "") {
  clearStoredPin();
  records = [];
  selectedRecordId = null;
  isDetailEditMode = false;
  currentDetailRecord = null;
  lockRegisterBtn.classList.add("hidden");
  updateDashboardStats();
  renderEventButtons();
  renderSelectedRecord();
  setPinError(errorMessage);
  studioPinInput.value = "";
  showView("pin");
  if (window.history && typeof window.history.replaceState === "function") {
    window.history.replaceState({ view: "pin" }, "");
  }
}

function parseMoney(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(parseMoney(value));
}

function computeDueFor(packageInput, advanceInput, dueInput) {
  const due = Math.max(parseMoney(packageInput.value) - parseMoney(advanceInput.value), 0);
  dueInput.value = due.toFixed(2);
}

function appendFunctionRow(container, name = "", date = "", location = "") {
  const fragment = functionRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".function-row");
  const nameInput = fragment.querySelector(".function-name");
  const dateInput = fragment.querySelector(".function-date");
  const locationInput = fragment.querySelector(".function-location");
  const removeBtn = fragment.querySelector(".function-remove");

  nameInput.value = name;
  dateInput.value = date;
  if (locationInput) {
    locationInput.value = location;
  }

  removeBtn.addEventListener("click", () => {
    row.remove();
  });

  container.appendChild(fragment);
}

function createFunctionRow(name = "", date = "", location = "") {
  appendFunctionRow(functionsContainer, name, date, location);
}

function createDetailFunctionRow(name = "", date = "", location = "") {
  appendFunctionRow(detailFunctionsContainer, name, date, location);
  setDetailEditMode(isDetailEditMode);
}

function resetForm() {
  customerForm.reset();
  functionsContainer.innerHTML = "";
  createFunctionRow();
  dueAmountInput.value = "0.00";
}

function confirmAction(message) {
  return window.confirm(message);
}

function notifyError(message, error) {
  // Keep UI simple for now while still surfacing API failures.
  console.error(error);
  window.alert(message);
}

function loadRecordsFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecordsToLocal(nextRecords) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
}

function asText(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function mapRowToRecord(row) {
  return {
    id: row.id,
    customerName: asText(row.customer_name),
    bookingStatus: asText(row.booking_status) || "pending",
    phoneNumber: asText(row.phone_number),
    eventType: asText(row.event_type),
    eventDate: asText(row.event_date || row.wedding_date),
    eventLocation: asText(row.event_location),
    preWeddingDate: asText(row.pre_wedding_date),
    receptionDate: asText(row.reception_date),
    extraFunctions: Array.isArray(row.extra_functions) ? row.extra_functions : [],
    brideSidePhotographer: asText(row.bride_side_photographer || row.photo_team),
    brideSideVideographer: asText(row.bride_side_videographer || row.video_team),
    groomSidePhotographer: asText(row.groom_side_photographer),
    groomSideVideographer: asText(row.groom_side_videographer),
    sideMode: asText(row.side_mode) || "combined",
    singleSidePhotographer: asText(row.single_side_photographer),
    singleSideVideographer: asText(row.single_side_videographer),
    teamLeadName: asText(row.team_lead_name),
    otherCrewMembers: asText(row.other_crew_members),
    workStatus: asText(row.work_status) || "pending",
    additionalRequirements: asText(row.additional_requirements),
    packageAmount: parseMoney(row.package_amount),
    advanceAmount: parseMoney(row.advance_amount),
    dueAmount: parseMoney(row.due_amount),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
  };
}

function mapRecordToRow(record, target = "supabase") {
  const row = {
    customer_name: record.customerName,
    booking_status: record.bookingStatus || "pending",
    phone_number: record.phoneNumber,
    event_type: record.eventType || null,
    event_location: record.eventLocation || "",
    extra_functions: record.extraFunctions,
    bride_side_photographer: record.brideSidePhotographer || null,
    bride_side_videographer: record.brideSideVideographer || null,
    groom_side_photographer: record.groomSidePhotographer || null,
    groom_side_videographer: record.groomSideVideographer || null,
    side_mode: record.sideMode || "combined",
    single_side_photographer: record.singleSidePhotographer || null,
    single_side_videographer: record.singleSideVideographer || null,
    team_lead_name: record.teamLeadName || null,
    other_crew_members: record.otherCrewMembers || null,
    work_status: record.workStatus || "pending",
    additional_requirements: record.additionalRequirements || null,
    package_amount: parseMoney(record.packageAmount),
    advance_amount: parseMoney(record.advanceAmount),
    due_amount: parseMoney(record.dueAmount),
  };

  if (target === "sheets") {
    row.event_date = record.eventDate || "";
  } else {
    row.wedding_date = record.eventDate || null;
    row.pre_wedding_date = record.preWeddingDate || null;
    row.reception_date = record.receptionDate || null;
  }

  return row;
}

async function callSheetsApi(payload) {
  const response = await fetch(sheetsConfig.webAppUrl.trim(), {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      ...payload,
      pin: activeStudioPin,
    }),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Google Sheets request failed (HTTP ${response.status}).`);
  }

  const result = await response.json();
  if (!result || result.ok !== true) {
    const error = new Error(result?.error || "Google Sheets request failed.");
    if (/invalid studio pin/i.test(error.message)) {
      error.isAuthError = true;
    }
    throw error;
  }

  return result;
}

async function fetchRecords() {
  if (usingSheets) {
    const result = await callSheetsApi({ action: "list" });
    return (result.records || []).map(mapRowToRecord);
  }

  if (!usingSupabase) {
    return loadRecordsFromLocal();
  }

  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(mapRowToRecord);
}

async function createRecord(record) {
  if (usingSheets) {
    const payload = mapRecordToRow(record, "sheets");
    const result = await callSheetsApi({ action: "create", record: payload });
    return mapRowToRecord(result.record);
  }

  if (!usingSupabase) {
    const localRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(localRecord);
    saveRecordsToLocal(records);
    return localRecord;
  }

  const payload = mapRecordToRow(record, "supabase");
  const { data, error } = await supabaseClient.from("events").insert(payload).select("*").single();
  if (error) {
    throw error;
  }

  return mapRowToRecord(data);
}

async function updateRecord(id, updates) {
  if (usingSheets) {
    const payload = mapRecordToRow(updates, "sheets");
    const result = await callSheetsApi({ action: "update", id, record: payload });
    return result.record ? mapRowToRecord(result.record) : null;
  }

  if (!usingSupabase) {
    const index = records.findIndex((record) => record.id === id);
    if (index < 0) {
      return null;
    }

    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveRecordsToLocal(records);
    return records[index];
  }

  const payload = mapRecordToRow(updates, "supabase");
  const { data, error } = await supabaseClient
    .from("events")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToRecord(data);
}

async function deleteRecordById(id) {
  if (usingSheets) {
    await callSheetsApi({ action: "delete", id });
    return;
  }

  if (!usingSupabase) {
    records = records.filter((record) => record.id !== id);
    saveRecordsToLocal(records);
    return;
  }

  const { error } = await supabaseClient.from("events").delete().eq("id", id);
  if (error) {
    throw error;
  }
}

function removeRecordInState(id) {
  records = records.filter((record) => record.id !== id);
  if (selectedRecordId === id) {
    selectedRecordId = null;
    isDetailEditMode = false;
  }
  updateDashboardStats();
  renderEventButtons(searchInput.value);
  renderSelectedRecord();
}

function getFunctionDateValue(fn) {
  if (!fn || typeof fn !== "object") {
    return "";
  }

  const dateValue = [fn.date, fn.functionDate, fn.eventDate].find((value) =>
    typeof value === "string" ? value.trim() : false,
  );

  return typeof dateValue === "string" ? dateValue.trim() : "";
}

function getFunctionNameValue(fn) {
  if (!fn || typeof fn !== "object") {
    return "Function";
  }

  const nameValue = [fn.name, fn.functionName, fn.title].find((value) =>
    typeof value === "string" ? value.trim() : false,
  );

  return typeof nameValue === "string" ? nameValue.trim() : "Function";
}

function getFunctionLocationValue(fn) {
  if (!fn || typeof fn !== "object") {
    return "";
  }

  const locationValue = [fn.location, fn.venue, fn.eventLocation].find((value) =>
    typeof value === "string" ? value.trim() : false,
  );

  return typeof locationValue === "string" ? locationValue.trim() : "";
}

function parseComparableDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

function getEventDateEntries(record) {
  const entries = [];

  if (record.eventDate) {
    entries.push({
      label: record.eventType ? record.eventType.trim() : "Event",
      rawDate: record.eventDate,
      dateObj: parseComparableDate(record.eventDate),
    });
  }

  if (record.preWeddingDate) {
    entries.push({
      label: "Pre-wedding",
      rawDate: record.preWeddingDate,
      dateObj: parseComparableDate(record.preWeddingDate),
    });
  }

  if (record.receptionDate) {
    entries.push({
      label: "Reception",
      rawDate: record.receptionDate,
      dateObj: parseComparableDate(record.receptionDate),
    });
  }

  const extraFunctions = Array.isArray(record.extraFunctions) ? record.extraFunctions : [];
  extraFunctions.forEach((fn) => {
    const dateValue = getFunctionDateValue(fn);
    if (!dateValue) {
      return;
    }

    entries.push({
      label: getFunctionNameValue(fn),
      rawDate: dateValue,
      dateObj: parseComparableDate(dateValue),
    });
  });

  entries.sort((a, b) => {
    if (a.dateObj && b.dateObj) {
      return a.dateObj - b.dateObj;
    }

    if (a.dateObj) {
      return -1;
    }

    if (b.dateObj) {
      return 1;
    }

    return a.label.localeCompare(b.label);
  });

  return entries;
}

function getPrimaryEventDate(record) {
  const entries = getEventDateEntries(record);
  return entries.length ? entries[0].rawDate : "";
}

function getEventDatesLabel(record) {
  const entries = getEventDateEntries(record);
  if (!entries.length) {
    return "-";
  }

  return entries.map((entry) => `${entry.label} - ${formatDate(entry.rawDate)}`).join(" | ");
}

function getUniqueFunctionLocations(record) {
  const extraFunctions = Array.isArray(record.extraFunctions) ? record.extraFunctions : [];
  const candidates = [record.eventLocation, ...extraFunctions.map(getFunctionLocationValue)]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  const seen = new Set();
  const unique = [];
  candidates.forEach((loc) => {
    const key = loc.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(loc);
    }
  });

  return unique;
}

function getEventLocationsLabel(record) {
  const unique = getUniqueFunctionLocations(record);
  return unique.length ? unique.join(" • ") : "-";
}

function normalizeStatus(value) {
  return String(value || "pending").trim().toLowerCase();
}

function getStatusClass(status) {
  if (status === "completed") {
    return "completed";
  }

  if (status === "in progress") {
    return "in-progress";
  }

  return "pending";
}

function updateDashboardStats() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcoming = records.filter((record) => {
    const date = getPrimaryEventDate(record);
    if (!date) {
      return false;
    }

    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= now;
  }).length;

  const duePending = records.filter((record) => parseMoney(record.dueAmount) > 0).length;

  statTotalEvents.textContent = String(records.length);
  statUpcomingEvents.textContent = String(upcoming);
  statDueEvents.textContent = String(duePending);
}

function getFilteredRecords(searchText = "") {
  const needle = searchText.trim().toLowerCase();
  const filtered = !needle
    ? records
    : records.filter((record) => {
        const extraLocations = Array.isArray(record.extraFunctions)
          ? record.extraFunctions.map((fn) => `${getFunctionNameValue(fn)} ${getFunctionLocationValue(fn)}`).join(" ")
          : "";
        const haystack = [
          record.customerName,
          record.phoneNumber,
          record.eventType,
          record.eventLocation,
          extraLocations,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      });

  return filtered.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderEventButtons(searchText = "") {
  const filtered = getFilteredRecords(searchText);

  eventButtonsContainer.innerHTML = "";
  emptyState.style.display = filtered.length ? "none" : "block";
  if (!records.length) {
    emptyState.textContent = "No customer records yet.";
  } else if (!filtered.length) {
    emptyState.textContent = "No events match your search.";
  }

  filtered.forEach((record) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "event-button";
    if (record.id === selectedRecordId) {
      button.classList.add("active");
    }

    const name = document.createElement("p");
    name.className = "event-button-name";
    name.textContent = record.customerName || "Unnamed";

    const date = document.createElement("p");
    date.className = "event-button-date";
    date.textContent = getEventDatesLabel(record);

    const location = document.createElement("p");
    location.className = "event-button-location";
    location.textContent = getEventLocationsLabel(record);

    const statusWrap = document.createElement("div");
    statusWrap.className = "event-status-row";

    const bookingStatus = normalizeStatus(record.bookingStatus);
    const bookingBadge = document.createElement("span");
    bookingBadge.className = `event-status booking ${getStatusClass(bookingStatus)}`;
    bookingBadge.textContent = `Booking: ${record.bookingStatus || "pending"}`;

    const workStatus = normalizeStatus(record.workStatus);
    const workBadge = document.createElement("span");
    workBadge.className = `event-status work ${getStatusClass(workStatus)}`;
    workBadge.textContent = `Work: ${record.workStatus || "pending"}`;

    statusWrap.append(bookingBadge, workBadge);

    button.append(name, date, location, statusWrap);
    button.addEventListener("click", () => {
      navigateTo({ view: "detail", recordId: record.id });
    });

    eventButtonsContainer.appendChild(button);
  });
}

function showEventsListMode() {
  eventsListView.classList.remove("hidden");
  eventDetailPane.classList.add("hidden");
}

function showEventDetailMode() {
  eventsListView.classList.add("hidden");
  eventDetailPane.classList.remove("hidden");
}

function renderSelectedRecord() {
  if (!selectedRecordId) {
    currentDetailRecord = null;
    detailEventTitle.textContent = "Event Details";
    eventDetailForm.classList.add("hidden");
    isDetailEditMode = false;
    showEventsListMode();
    return;
  }

  const record = records.find((item) => item.id === selectedRecordId);
  if (!record) {
    selectedRecordId = null;
    currentDetailRecord = null;
    detailEventTitle.textContent = "Event Details";
    eventDetailForm.classList.add("hidden");
    isDetailEditMode = false;
    showEventsListMode();
    return;
  }

  detailEventTitle.textContent = record.customerName?.trim() || "Event Details";

  detailCustomerNameInput.value = record.customerName || "";
  detailBookingStatusInput.value = record.bookingStatus || "pending";
  detailPhoneNumberInput.value = record.phoneNumber || "";
  detailEventTypeInput.value = record.eventType || "";
  detailEventDateInput.value = record.eventDate || "";
  detailEventLocationInput.value = record.eventLocation || "";
  detailBrideSidePhotographerInput.value = record.brideSidePhotographer || "";
  detailBrideSideVideographerInput.value = record.brideSideVideographer || "";
  detailGroomSidePhotographerInput.value = record.groomSidePhotographer || "";
  detailGroomSideVideographerInput.value = record.groomSideVideographer || "";
  detailSideModeInput.value = record.sideMode || "combined";
  detailSingleSidePhotographerInput.value = record.singleSidePhotographer || "";
  detailSingleSideVideographerInput.value = record.singleSideVideographer || "";
  detailTeamLeadNameInput.value = record.teamLeadName || "";
  detailOtherCrewMembersInput.value = record.otherCrewMembers || "";
  detailWorkStatusInput.value = record.workStatus || "pending";
  detailAdditionalRequirementsInput.value = record.additionalRequirements || "";
  detailPackageAmountInput.value = parseMoney(record.packageAmount).toFixed(2);
  detailAdvanceAmountInput.value = parseMoney(record.advanceAmount).toFixed(2);
  detailDueAmountInput.value = parseMoney(record.dueAmount).toFixed(2);
  currentDetailRecord = record;

  detailFunctionsContainer.innerHTML = "";
  const extraFunctions = Array.isArray(record.extraFunctions) ? record.extraFunctions : [];
  if (extraFunctions.length) {
    extraFunctions.forEach((fn) =>
      createDetailFunctionRow(getFunctionNameValue(fn), getFunctionDateValue(fn), getFunctionLocationValue(fn)),
    );
  }

  showEventDetailMode();
  eventDetailForm.classList.remove("hidden");
  updateSideModeUI("detail", detailSideModeInput.value);
  setDetailEditMode(isDetailEditMode);
}

function updateSideModeUI(scope, mode) {
  const isSingle = mode === "single";

  if (scope === "add") {
    combinedTeamFields.classList.toggle("hidden", isSingle);
    singleTeamFields.classList.toggle("hidden", !isSingle);
    return;
  }

  detailCombinedTeamFields.classList.toggle("hidden", isSingle);
  detailSingleTeamFields.classList.toggle("hidden", !isSingle);
}

function setDetailEditMode(enabled) {
  isDetailEditMode = enabled;

  if (enabled && !detailFunctionsContainer.querySelector(".function-row")) {
    createDetailFunctionRow();
  }

  eventDetailForm.querySelectorAll("input, textarea, select").forEach((element) => {
    element.disabled = !enabled;
  });

  detailDueAmountInput.disabled = true;
  detailAddFunctionBtn.disabled = !enabled;
  detailFunctionsContainer.querySelectorAll("button").forEach((button) => {
    button.disabled = !enabled;
  });

  detailEditBtn.classList.toggle("hidden", enabled);
  detailSaveBtn.classList.toggle("hidden", !enabled);
  detailCancelBtn.classList.toggle("hidden", !enabled);
  detailDeleteBtn.classList.toggle("hidden", !enabled);
  detailViewHint.textContent = enabled ? "Edit mode" : "View mode";

  updateDetailFieldVisibility(enabled);
}

function hasFieldContent(element) {
  if (!element) {
    return false;
  }

  if (element.tagName === "SELECT") {
    return true;
  }

  return String(element.value || "").trim() !== "";
}

function toggleFieldLabelVisibility(element, visible) {
  const label = element.closest("label");
  if (!label) {
    return;
  }

  label.classList.toggle("hidden", !visible);
}

function updateDetailFieldVisibility(editMode) {
  const primaryFields = [
    detailCustomerNameInput,
    detailBookingStatusInput,
    detailPhoneNumberInput,
    detailEventTypeInput,
    detailEventDateInput,
    detailEventLocationInput,
    detailSideModeInput,
    detailTeamLeadNameInput,
    detailOtherCrewMembersInput,
    detailAdditionalRequirementsInput,
    detailPackageAmountInput,
    detailAdvanceAmountInput,
    detailDueAmountInput,
    detailWorkStatusInput,
  ];

  primaryFields.forEach((field) => {
    toggleFieldLabelVisibility(field, editMode || hasFieldContent(field));
  });

  const combinedFields = [
    detailBrideSidePhotographerInput,
    detailBrideSideVideographerInput,
    detailGroomSidePhotographerInput,
    detailGroomSideVideographerInput,
  ];
  const singleFields = [detailSingleSidePhotographerInput, detailSingleSideVideographerInput];

  combinedFields.forEach((field) => {
    toggleFieldLabelVisibility(field, editMode || hasFieldContent(field));
  });

  singleFields.forEach((field) => {
    toggleFieldLabelVisibility(field, editMode || hasFieldContent(field));
  });

  const hasFunctions = collectFunctionsFrom(detailFunctionsContainer).length > 0;
  detailFunctionsPanel.classList.toggle("hidden", !editMode && !hasFunctions);

  const sideMode = (currentDetailRecord?.sideMode || detailSideModeInput.value || "combined").toLowerCase();
  if (!editMode) {
    detailCombinedTeamFields.classList.toggle("hidden", sideMode !== "combined");
    detailSingleTeamFields.classList.toggle("hidden", sideMode !== "single");
  }
}

function collectFunctionsFrom(container) {
  return [...container.querySelectorAll(".function-row")]
    .map((row) => ({
      name: row.querySelector(".function-name").value.trim(),
      date: row.querySelector(".function-date").value,
      location: row.querySelector(".function-location")?.value.trim() || "",
    }))
    .filter((fn) => fn.name || fn.date || fn.location);
}

function buildRecordFromAddForm() {
  return {
    customerName: document.getElementById("customerName").value.trim(),
    bookingStatus: document.getElementById("bookingStatus").value,
    phoneNumber: document.getElementById("phoneNumber").value.trim(),
    eventType: document.getElementById("eventType").value.trim(),
    eventDate: document.getElementById("eventDate").value,
    eventLocation: document.getElementById("eventLocation").value.trim(),
    extraFunctions: collectFunctionsFrom(functionsContainer),
    brideSidePhotographer: document.getElementById("brideSidePhotographer").value.trim(),
    brideSideVideographer: document.getElementById("brideSideVideographer").value.trim(),
    groomSidePhotographer: document.getElementById("groomSidePhotographer").value.trim(),
    groomSideVideographer: document.getElementById("groomSideVideographer").value.trim(),
    sideMode: sideModeInput.value,
    singleSidePhotographer: singleSidePhotographerInput.value.trim(),
    singleSideVideographer: singleSideVideographerInput.value.trim(),
    teamLeadName: document.getElementById("teamLeadName").value.trim(),
    otherCrewMembers: document.getElementById("otherCrewMembers").value.trim(),
    workStatus: document.getElementById("workStatus").value,
    additionalRequirements: document.getElementById("additionalRequirements").value.trim(),
    packageAmount: parseMoney(packageAmountInput.value),
    advanceAmount: parseMoney(advanceAmountInput.value),
    dueAmount: parseMoney(dueAmountInput.value),
  };
}

function buildRecordFromDetailForm(existingRecord) {
  return {
    ...existingRecord,
    customerName: detailCustomerNameInput.value.trim(),
    bookingStatus: detailBookingStatusInput.value,
    phoneNumber: detailPhoneNumberInput.value.trim(),
    eventType: detailEventTypeInput.value.trim(),
    eventDate: detailEventDateInput.value,
    eventLocation: detailEventLocationInput.value.trim(),
    extraFunctions: collectFunctionsFrom(detailFunctionsContainer),
    brideSidePhotographer: detailBrideSidePhotographerInput.value.trim(),
    brideSideVideographer: detailBrideSideVideographerInput.value.trim(),
    groomSidePhotographer: detailGroomSidePhotographerInput.value.trim(),
    groomSideVideographer: detailGroomSideVideographerInput.value.trim(),
    sideMode: detailSideModeInput.value,
    singleSidePhotographer: detailSingleSidePhotographerInput.value.trim(),
    singleSideVideographer: detailSingleSideVideographerInput.value.trim(),
    teamLeadName: detailTeamLeadNameInput.value.trim(),
    otherCrewMembers: detailOtherCrewMembersInput.value.trim(),
    workStatus: detailWorkStatusInput.value,
    additionalRequirements: detailAdditionalRequirementsInput.value.trim(),
    packageAmount: parseMoney(detailPackageAmountInput.value),
    advanceAmount: parseMoney(detailAdvanceAmountInput.value),
    dueAmount: parseMoney(detailDueAmountInput.value),
  };
}

packageAmountInput.addEventListener("input", () => computeDueFor(packageAmountInput, advanceAmountInput, dueAmountInput));
advanceAmountInput.addEventListener("input", () => computeDueFor(packageAmountInput, advanceAmountInput, dueAmountInput));
detailPackageAmountInput.addEventListener("input", () =>
  computeDueFor(detailPackageAmountInput, detailAdvanceAmountInput, detailDueAmountInput),
);
detailAdvanceAmountInput.addEventListener("input", () =>
  computeDueFor(detailPackageAmountInput, detailAdvanceAmountInput, detailDueAmountInput),
);

addFunctionBtn.addEventListener("click", () => createFunctionRow());
detailAddFunctionBtn.addEventListener("click", () => createDetailFunctionRow());
sideModeInput.addEventListener("change", () => updateSideModeUI("add", sideModeInput.value));
detailSideModeInput.addEventListener("change", () => updateSideModeUI("detail", detailSideModeInput.value));

resetBtn.addEventListener("click", resetForm);
openAddEventBtn.addEventListener("click", () => navigateTo({ view: "add" }));
openViewEventsBtn.addEventListener("click", () => {
  navigateTo({ view: "view", recordId: null });
});
backToDashboardFromAddBtn.addEventListener("click", () => {
  if (window.history.state && window.history.state.view === "add") {
    window.history.back();
    return;
  }
  navigateTo({ view: "dashboard" }, { replace: true });
});
backToDashboardFromViewBtn.addEventListener("click", () => {
  if (window.history.state && window.history.state.view === "view") {
    window.history.back();
    return;
  }
  navigateTo({ view: "dashboard" }, { replace: true });
});
backToEventsListBtn.addEventListener("click", () => {
  if (window.history.state && window.history.state.view === "detail") {
    window.history.back();
    return;
  }
  navigateTo({ view: "view", recordId: null }, { replace: true });
});

window.addEventListener("popstate", (event) => {
  if (usingSheets && !activeStudioPin) {
    showView("pin");
    if (window.history && typeof window.history.replaceState === "function") {
      window.history.replaceState({ view: "pin" }, "");
    }
    return;
  }

  applyNavigationState(event.state || { view: "dashboard" });
});

function escapeCsvCell(value) {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
}

function exportRecordsToCsv() {
  if (!records.length) {
    window.alert("No bookings available to export.");
    return;
  }

  const headers = [
    "Customer Name",
    "Booking Status",
    "Phone Number",
    "Event Type",
    "Event Date",
    "Location",
    "Extra Functions",
    "Coverage Type",
    "Team Lead",
    "Bride Side Photographer",
    "Bride Side Videographer",
    "Groom Side Photographer",
    "Groom Side Videographer",
    "Single Side Photographer",
    "Single Side Videographer",
    "Other Crew",
    "Requirements",
    "Package Amount",
    "Advance Received",
    "Due Amount",
    "Work Status",
    "Created At",
  ];

  const rows = records.map((record) => {
    const extraSummary = (Array.isArray(record.extraFunctions) ? record.extraFunctions : [])
      .map((fn) => {
        const name = getFunctionNameValue(fn);
        const date = getFunctionDateValue(fn);
        const loc = getFunctionLocationValue(fn);
        return [name, date, loc].filter(Boolean).join(" | ");
      })
      .join("; ");

    return [
      record.customerName,
      record.bookingStatus,
      record.phoneNumber,
      record.eventType,
      record.eventDate,
      record.eventLocation,
      extraSummary,
      record.sideMode,
      record.teamLeadName,
      record.brideSidePhotographer,
      record.brideSideVideographer,
      record.groomSidePhotographer,
      record.groomSideVideographer,
      record.singleSidePhotographer,
      record.singleSideVideographer,
      record.otherCrewMembers,
      record.additionalRequirements,
      record.packageAmount,
      record.advanceAmount,
      record.dueAmount,
      record.workStatus,
      record.createdAt,
    ]
      .map(escapeCsvCell)
      .join(",");
  });

  const csvContent = [headers.map(escapeCsvCell).join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `vivah-bookings-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

customerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const recordPayload = buildRecordFromAddForm();
    await createRecord(recordPayload);

    if (usingRemote) {
      records = await fetchRecords();
    }

    selectedRecordId = null;
    isDetailEditMode = false;
    updateDashboardStats();
    renderEventButtons(searchInput.value);
    renderSelectedRecord();
    resetForm();
    navigateTo({ view: "view", recordId: null }, { replace: true });
  } catch (error) {
    if (error && error.isAuthError) {
      lockStudioView(error.message);
      return;
    }
    notifyError("Unable to save event. Please check your connection and configuration.", error);
  }
});

eventDetailForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedRecordId) {
    return;
  }

  const shouldSave = confirmAction("Are you sure you want to save these changes?");
  if (!shouldSave) {
    return;
  }

  try {
    const existing = records.find((record) => record.id === selectedRecordId);
    if (!existing) {
      return;
    }

    const updates = buildRecordFromDetailForm(existing);
    const updatedRecord = await updateRecord(selectedRecordId, updates);

    if (usingRemote) {
      records = await fetchRecords();
    } else if (updatedRecord) {
      records = records.map((record) => (record.id === selectedRecordId ? updatedRecord : record));
    }

    isDetailEditMode = false;
    updateDashboardStats();
    renderEventButtons(searchInput.value);
    renderSelectedRecord();
  } catch (error) {
    if (error && error.isAuthError) {
      lockStudioView(error.message);
      return;
    }
    notifyError("Unable to update event. Please try again.", error);
  }
});

detailEditBtn.addEventListener("click", () => {
  if (!selectedRecordId) {
    return;
  }

  const shouldEdit = confirmAction("Do you want to edit this event details?");
  if (!shouldEdit) {
    return;
  }

  setDetailEditMode(true);
});

detailCancelBtn.addEventListener("click", () => {
  isDetailEditMode = false;
  renderSelectedRecord();
});

detailDeleteBtn.addEventListener("click", async () => {
  if (!selectedRecordId) {
    return;
  }

  const shouldDelete = confirmAction("Are you sure you want to delete this event?");
  if (!shouldDelete) {
    return;
  }

  try {
    await deleteRecordById(selectedRecordId);

    if (usingRemote) {
      records = await fetchRecords();
      selectedRecordId = null;
      isDetailEditMode = false;
      updateDashboardStats();
      renderEventButtons(searchInput.value);
      renderSelectedRecord();
    } else {
      removeRecordInState(selectedRecordId);
    }

    if (window.history.state && window.history.state.view === "detail") {
      window.history.replaceState({ view: "view", recordId: null }, "");
    }
  } catch (error) {
    if (error && error.isAuthError) {
      lockStudioView(error.message);
      return;
    }
    notifyError("Unable to delete event. Please try again.", error);
  }
});

searchInput.addEventListener("input", (event) => {
  renderEventButtons(event.target.value);
});

exportCsvBtn.addEventListener("click", exportRecordsToCsv);

lockRegisterBtn.addEventListener("click", () => {
  lockStudioView();
});

pinUnlockForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const enteredPin = studioPinInput.value.trim();
  if (!enteredPin) {
    setPinError("Please enter the Studio PIN.");
    return;
  }

  setPinError("");
  unlockPinBtn.disabled = true;
  unlockPinBtn.textContent = "Unlocking...";

  try {
    activeStudioPin = enteredPin;
    records = await fetchRecords();
    setStoredPin(enteredPin, rememberPinCheckbox.checked);
    studioPinInput.value = "";
    lockRegisterBtn.classList.remove("hidden");
    updateDashboardStats();
    renderEventButtons();
    renderSelectedRecord();
    navigateTo({ view: "dashboard" }, { replace: true });
  } catch (error) {
    clearStoredPin();
    setPinError(error?.message || "Unable to verify Studio PIN. Check your Google Sheets Web App URL.");
  } finally {
    unlockPinBtn.disabled = false;
    unlockPinBtn.textContent = "Unlock Register";
  }
});

async function initialize() {
  createFunctionRow();
  computeDueFor(packageAmountInput, advanceAmountInput, dueAmountInput);
  updateSideModeUI("add", sideModeInput.value);

  if (usingSheets) {
    const savedPin = getStoredPin();
    if (!savedPin) {
      lockStudioView();
      return;
    }

    try {
      activeStudioPin = savedPin;
      records = await fetchRecords();
      lockRegisterBtn.classList.remove("hidden");
    } catch (error) {
      lockStudioView(error?.message || "Unable to unlock with saved PIN. Please enter it again.");
      return;
    }
  } else if (!usingSupabase) {
    records = loadRecordsFromLocal();
    if (!hasValidSupabaseConfig) {
      console.warn("Google Sheets / Supabase not configured. Using local storage fallback.");
    }
  } else {
    try {
      records = await fetchRecords();
    } catch (error) {
      notifyError("Supabase connection failed. Falling back to local data for now.", error);
      records = loadRecordsFromLocal();
    }
  }

  updateDashboardStats();
  renderEventButtons();
  renderSelectedRecord();
  navigateTo({ view: "dashboard" }, { replace: true });
}

initialize();
