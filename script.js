// =====================================================
// MUJ RE-REGISTRATION DASHBOARD
// Google Sheets -> Vercel
// =====================================================

// ===============================
// GOOGLE SHEET CONFIGURATION
// ===============================

const SHEET_ID = "1K8o0knhyGZo9bBnPyep15IFMuW25kCupcA6jQVVA7Mg";

const SHEET_NAME = "Dashboard_Data";

const CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;


// ===============================
// GLOBAL DATA
// ===============================

let allData = [];
let filteredData = [];


// ===============================
// PAGE LOAD
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  loadData();

});


// ===============================
// LOAD GOOGLE SHEET DATA
// ===============================

async function loadData() {

  try {

    showLoading();

    const response = await fetch(CSV_URL + "&t=" + Date.now());

    if (!response.ok) {
      throw new Error("Unable to access Google Sheet.");
    }

    const csvText = await response.text();

    allData = parseCSV(csvText);

    console.log("Total records loaded:", allData.length);

    populateFilters();

    applyFilters();

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load dashboard data. Please check your Google Sheet settings and Sheet ID."
    );

  }

}


// ===============================
// CSV PARSER
// ===============================

function parseCSV(text) {

  const rows = [];

  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {

    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {

      value += '"';
      i++;

    } else if (char === '"') {

      insideQuotes = !insideQuotes;

    } else if (char === "," && !insideQuotes) {

      row.push(value.trim());
      value = "";

    } else if (
      (char === "\n" || char === "\r") &&
      !insideQuotes
    ) {

      if (char === "\r" && nextChar === "\n") {
        i++;
      }

      row.push(value.trim());
      value = "";

      if (row.some(cell => cell !== "")) {
        rows.push(row);
      }

      row = [];

    } else {

      value += char;

    }

  }

  if (value !== "" || row.length > 0) {

    row.push(value.trim());

    if (row.some(cell => cell !== "")) {
      rows.push(row);
    }

  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map(h =>
    h.trim().toLowerCase()
  );

  return rows.slice(1).map(row => {

    const obj = {};

    headers.forEach((header, index) => {

      obj[header] =
        row[index] !== undefined
          ? row[index].trim()
          : "";

    });

    return obj;

  });

}


// ===============================
// HELPER
// ===============================

function getValue(row, column) {

  return String(row[column] || "").trim();

}


// ===============================
// UNIQUE VALUES
// ===============================

function getUniqueValues(column) {

  return [
    ...new Set(
      allData
        .map(row => getValue(row, column))
        .filter(value => value !== "")
    )
  ].sort(
    (a, b) => a.localeCompare(b)
  );

}


// ===============================
// POPULATE FILTERS
// ===============================

function populateFilters() {

  populateSelect(
    "programFilter",
    "program"
  );

  populateSelect(
    "batchFilter",
    "batch"
  );

  populateSelect(
    "salesTypeFilter",
    "sales type"
  );

  populateSelect(
    "currentSemFilter",
    "current sem"
  );

  populateSelect(
    "attendanceFilter",
    "exam attendance"
  );

  populateSelect(
    "assignmentFilter",
    "assignment status"
  );

  populateSelect(
    "reregFilter",
    "re-reg"
  );

}


// ===============================
// POPULATE SELECT
// ===============================

function populateSelect(
  elementId,
  column
) {

  const select =
    document.getElementById(elementId);

  if (!select) {
    return;
  }

  const currentValue =
    select.value;

  select.innerHTML =
    '<option value="">All</option>';

  const values =
    getUniqueValues(column);

  values.forEach(value => {

    const option =
      document.createElement("option");

    option.value = value;
    option.textContent = value;

    select.appendChild(option);

  });

  if (
    values.includes(currentValue)
  ) {
    select.value =
      currentValue;
  }

}


// ===============================
// APPLY FILTERS
// ===============================

function applyFilters() {

  const program =
    getFilterValue("programFilter");

  const batch =
    getFilterValue("batchFilter");

  const salesType =
    getFilterValue("salesTypeFilter");

  const currentSem =
    getFilterValue("currentSemFilter");

  const attendance =
    getFilterValue("attendanceFilter");

  const assignment =
    getFilterValue("assignmentFilter");

  const rereg =
    getFilterValue("reregFilter");

  const search =
    getFilterValue("searchInput")
      .toLowerCase();


  filteredData =
    allData.filter(row => {

      const matchesProgram =
        !program ||
        getValue(row, "program") === program;


      const matchesBatch =
        !batch ||
        getValue(row, "batch") === batch;


      const matchesSalesType =
        !salesType ||
        getValue(row, "sales type") === salesType;


      const matchesCurrentSem =
        !currentSem ||
        getValue(row, "current sem") === currentSem;


      const matchesAttendance =
        !attendance ||
        getValue(row, "exam attendance") === attendance;


      const matchesAssignment =
        !assignment ||
        getValue(row, "assignment status") === assignment;


      const matchesRereg =
        !rereg ||
        getValue(row, "re-reg") === rereg;


      const rollNo =
        getValue(row, "roll no")
          .toLowerCase();

      const name =
        getValue(row, "name")
          .toLowerCase();


      const matchesSearch =
        !search ||
        rollNo.includes(search) ||
        name.includes(search);


      return (
        matchesProgram &&
        matchesBatch &&
        matchesSalesType &&
        matchesCurrentSem &&
        matchesAttendance &&
        matchesAssignment &&
        matchesRereg &&
        matchesSearch
      );

    });


  updateDashboard();

}


// ===============================
// FILTER VALUE
// ===============================

function getFilterValue(elementId) {

  const element =
    document.getElementById(elementId);

  if (!element) {
    return "";
  }

  return element.value.trim();

}


// ===============================
// UPDATE DASHBOARD
// ===============================

function updateDashboard() {

  updateKPIs();

  updateSalesTypeAnalysis();

  updateCombinationAnalysis();

  updateLearnerTable();

  updateRecordCount();

}


// ===============================
// KPI CALCULATIONS
// ===============================

function updateKPIs() {

  const total =
    filteredData.length;


  // Exam attended
  const examAttended =
    filteredData.filter(row => {

      const status =
        getValue(
          row,
          "exam attendance"
        ).toLowerCase();

      return (
        status === "full attended" ||
        status === "partially attended"
      );

    }).length;


  // Assignment submitted
  const assignmentSubmitted =
    filteredData.filter(row => {

      return (
        getValue(
          row,
          "assignment status"
        ).toLowerCase() === "submitted"
      );

    }).length;


  // Re-Reg Done
  const reregDone =
    filteredData.filter(row => {

      return (
        getValue(
          row,
          "re-reg"
        ).toLowerCase() === "done"
      );

    }).length;


  // Re-Reg Not Done
  const reregNotDone =
    filteredData.filter(row => {

      return (
        getValue(
          row,
          "re-reg"
        ).toLowerCase() === "not done"
      );

    }).length;


  // Re-Reg percentage
  const reregDenominator =
    reregDone + reregNotDone;


  const reregPercentage =
    reregDenominator > 0
      ? (
          reregDone /
          reregDenominator *
          100
        ).toFixed(1)
      : "0.0";


  setElement(
    "totalLearners",
    formatNumber(total)
  );

  setElement(
    "examAttended",
    formatNumber(examAttended)
  );

  setElement(
    "assignmentSubmitted",
    formatNumber(assignmentSubmitted)
  );

  setElement(
    "reregDone",
    formatNumber(reregDone)
  );

  setElement(
    "reregNotDone",
    formatNumber(reregNotDone)
  );

  setElement(
    "reregPercentage",
    reregPercentage + "%"
  );

}


// ===============================
// SALES TYPE ANALYSIS
// ===============================

function updateSalesTypeAnalysis() {

  const container =
    document.getElementById(
      "salesTypeAnalysis"
    );

  if (!container) {
    return;
  }


  const salesTypes =
    [
      ...new Set(
        filteredData
          .map(row =>
            getValue(
              row,
              "sales type"
            )
          )
          .filter(Boolean)
      )
    ].sort();


  if (salesTypes.length === 0) {

    container.innerHTML =
      "<p>No Sales Type data available.</p>";

    return;

  }


  let html = `

    <div class="analysis-table-wrapper">

      <table class="analysis-table">

        <thead>

          <tr>

            <th>Sales Type</th>

            <th>Total</th>

            <th>Exam Attended</th>

            <th>Assignment Submitted</th>

            <th>Re-Reg Done</th>

            <th>Re-Reg Not Done</th>

            <th>Re-Reg %</th>

          </tr>

        </thead>

        <tbody>

  `;


  salesTypes.forEach(type => {

    const data =
      filteredData.filter(row =>
        getValue(
          row,
          "sales type"
        ) === type
      );


    const total =
      data.length;


    const exam =
      data.filter(row => {

        const status =
          getValue(
            row,
            "exam attendance"
          ).toLowerCase();

        return (
          status === "full attended" ||
          status === "partially attended"
        );

      }).length;


    const assignment =
      data.filter(row =>
        getValue(
          row,
          "assignment status"
        ).toLowerCase() === "submitted"
      ).length;


    const done =
      data.filter(row =>
        getValue(
          row,
          "re-reg"
        ).toLowerCase() === "done"
      ).length;


    const notDone =
      data.filter(row =>
        getValue(
          row,
          "re-reg"
        ).toLowerCase() === "not done"
      ).length;


    const denominator =
      done + notDone;


    const percentage =
      denominator > 0
        ? (
            done /
            denominator *
            100
          ).toFixed(1)
        : "0.0";


    html += `

      <tr>

        <td>
          <strong>${escapeHTML(type)}</strong>
        </td>

        <td>${formatNumber(total)}</td>

        <td>${formatNumber(exam)}</td>

        <td>${formatNumber(assignment)}</td>

        <td>${formatNumber(done)}</td>

        <td>${formatNumber(notDone)}</td>

        <td>${percentage}%</td>

      </tr>

    `;

  });


  html += `

        </tbody>

      </table>

    </div>

  `;


  container.innerHTML =
    html;

}


// ===============================
// COMBINATION ANALYSIS
// ===============================

function updateCombinationAnalysis() {

  const container =
    document.getElementById(
      "combinationAnalysis"
    );

  if (!container) {
    return;
  }


  const total =
    filteredData.length;


  // Exam attended + Assignment submitted + Re-Reg Done
  const allCompleted =
    filteredData.filter(row => {

      const exam =
        getValue(
          row,
          "exam attendance"
        ).toLowerCase();

      const assignment =
        getValue(
          row,
          "assignment status"
        ).toLowerCase();

      const rereg =
        getValue(
          row,
          "re-reg"
        ).toLowerCase();


      return (
        (
          exam === "full attended" ||
          exam === "partially attended"
        ) &&
        assignment === "submitted" &&
        rereg === "done"
      );

    }).length;


  // Exam attended + Assignment submitted + Re-Reg Not Done
  const examAssignmentNotRereg =
    filteredData.filter(row => {

      const exam =
        getValue(
          row,
          "exam attendance"
        ).toLowerCase();

      const assignment =
        getValue(
          row,
          "assignment status"
        ).toLowerCase();

      const rereg =
        getValue(
          row,
          "re-reg"
        ).toLowerCase();


      return (
        (
          exam === "full attended" ||
          exam === "partially attended"
        ) &&
        assignment === "submitted" &&
        rereg === "not done"
      );

    }).length;


  // Exam attended + Assignment NOT submitted + Re-Reg Not Done
  const examNoAssignmentNotRereg =
    filteredData.filter(row => {

      const exam =
        getValue(
          row,
          "exam attendance"
        ).toLowerCase();

      const assignment =
        getValue(
          row,
          "assignment status"
        ).toLowerCase();

      const rereg =
        getValue(
          row,
          "re-reg"
        ).toLowerCase();


      return (
        (
          exam === "full attended" ||
          exam === "partially attended"
        ) &&
        assignment !== "submitted" &&
        rereg === "not done"
      );

    }).length;


  // Exam NOT attended + Assignment submitted + Re-Reg Not Done
  const noExamAssignmentNotRereg =
    filteredData.filter(row => {

      const exam =
        getValue(
          row,
          "exam attendance"
        ).toLowerCase();

      const assignment =
        getValue(
          row,
          "assignment status"
        ).toLowerCase();

      const rereg =
        getValue(
          row,
          "re-reg"
        ).toLowerCase();


      const examAttended =
        (
          exam === "full attended" ||
          exam === "partially attended"
        );


      return (
        !examAttended &&
        assignment === "submitted" &&
        rereg === "not done"
      );

    }).length;


  // Exam NOT attended + Assignment NOT submitted + Re-Reg Not Done
  const noneCompleted =
    filteredData.filter(row => {

      const exam =
        getValue(
          row,
          "exam attendance"
        ).toLowerCase();

      const assignment =
        getValue(
          row,
          "assignment status"
        ).toLowerCase();

      const rereg =
        getValue(
          row,
          "re-reg"
        ).toLowerCase();


      const examAttended =
        (
          exam === "full attended" ||
          exam === "partially attended"
        );


      return (
        !examAttended &&
        assignment !== "submitted" &&
        rereg === "not done"
      );

    }).length;


  container.innerHTML = `

    <div class="combination-grid">

      <div class="combination-card">

        <div class="combination-title">
          Exam + Assignment + Re-Reg
        </div>

        <div class="combination-value">
          ${formatNumber(allCompleted)}
        </div>

        <div class="combination-description">
          Exam attended, assignment submitted and re-reg done
        </div>

      </div>


      <div class="combination-card">

        <div class="combination-title">
          Exam + Assignment → Re-Reg Pending
        </div>

        <div class="combination-value">
          ${formatNumber(examAssignmentNotRereg)}
        </div>

        <div class="combination-description">
          Exam attended and assignment submitted, but re-reg not done
        </div>

      </div>


      <div class="combination-card">

        <div class="combination-title">
          Exam → Assignment Pending
        </div>

        <div class="combination-value">
          ${formatNumber(examNoAssignmentNotRereg)}
        </div>

        <div class="combination-description">
          Exam attended, assignment not submitted and re-reg not done
        </div>

      </div>


      <div class="combination-card">

        <div class="combination-title">
          Exam Pending → Assignment Done
        </div>

        <div class="combination-value">
          ${formatNumber(noExamAssignmentNotRereg)}
        </div>

        <div class="combination-description">
          Exam not attended, assignment submitted and re-reg not done
        </div>

      </div>


      <div class="combination-card">

        <div class="combination-title">
          All Pending
        </div>

        <div class="combination-value">
          ${formatNumber(noneCompleted)}
        </div>

        <div class="combination-description">
          Exam not attended, assignment not submitted and re-reg not done
        </div>

      </div>

    </div>

  `;

}


// ===============================
// LEARNER TABLE
// ===============================

function updateLearnerTable() {

  const tbody =
    document.getElementById(
      "learnerTableBody"
    );

  if (!tbody) {
    return;
  }


  tbody.innerHTML = "";


  filteredData.forEach(row => {

    const tr =
      document.createElement("tr");


    tr.innerHTML = `

      <td>
        ${escapeHTML(
          getValue(row, "roll no")
        )}
      </td>

      <td>
        ${escapeHTML(
          getValue(row, "name")
        )}
      </td>

      <td>
        ${escapeHTML(
          getValue(row, "program")
        )}
      </td>

      <td>
        ${escapeHTML(
          getValue(row, "batch")
        )}
      </td>

      <td>
        ${escapeHTML(
          getValue(row, "sales type")
        )}
      </td>

      <td>
        ${escapeHTML(
          getValue(row, "exam attendance")
        )}
      </td>

      <td>
        ${escapeHTML(
          getValue(row, "assignment status")
        )}
      </td>

      <td>
        ${escapeHTML(
          getValue(row, "current sem")
        )}
      </td>

      <td>
        ${escapeHTML(
          getValue(row, "re-reg")
        )}
      </td>

    `;


    tbody.appendChild(tr);

  });


}


// ===============================
// RECORD COUNT
// ===============================

function updateRecordCount() {

  const element =
    document.getElementById(
      "recordCount"
    );

  if (!element) {
    return;
  }

  element.textContent =
    `${filteredData.length} learners`;

}


// ===============================
// RESET FILTERS
// ===============================

function resetFilters() {

  const filterIds = [

    "programFilter",
    "batchFilter",
    "salesTypeFilter",
    "currentSemFilter",
    "attendanceFilter",
    "assignmentFilter",
    "reregFilter"

  ];


  filterIds.forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }

  });


  const search =
    document.getElementById(
      "searchInput"
    );

  if (search) {
    search.value = "";
  }


  applyFilters();

}


// ===============================
// SEARCH EVENT
// ===============================

function setupEvents() {

  const filterIds = [

    "programFilter",
    "batchFilter",
    "salesTypeFilter",
    "currentSemFilter",
    "attendanceFilter",
    "assignmentFilter",
    "reregFilter"

  ];


  filterIds.forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {

      element.addEventListener(
        "change",
        applyFilters
      );

    }

  });


  const search =
    document.getElementById(
      "searchInput"
    );


  if (search) {

    search.addEventListener(
      "input",
      applyFilters
    );

  }


  const reset =
    document.getElementById(
      "resetFilters"
    );


  if (reset) {

    reset.addEventListener(
      "click",
      resetFilters
    );

  }

}


// ===============================
// RUN EVENTS AFTER PAGE LOAD
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  setupEvents
);


// ===============================
// UTILITY FUNCTIONS
// ===============================

function setElement(
  id,
  value
) {

  const element =
    document.getElementById(id);

  if (element) {
    element.textContent = value;
  }

}


function formatNumber(number) {

  return Number(number).toLocaleString(
    "en-IN"
  );

}


function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function showLoading() {

  const element =
    document.getElementById(
      "loading"
    );

  if (element) {
    element.style.display = "block";
  }

}


function showError(message) {

  const element =
    document.getElementById(
      "loading"
    );

  if (element) {

    element.style.display =
      "block";

    element.textContent =
      message;

  }

}
