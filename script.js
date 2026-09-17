const SHEET_ID =
    "1K8o0knhyGZo9bBnPyep15IFMuW25kCupcA6jQVVA7Mg";


const SHEET_NAME =
    "Dashboard_Data";


const CSV_URL =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;


let allData = [];


/* LOAD DATA */

async function loadData() {

    try {

        const response =
            await fetch(CSV_URL);

        const csv =
            await response.text();

        allData =
            parseCSV(csv);

        populateFilters();

        updateDashboard(allData);

        displayTable(allData);

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to load Google Sheet data."
        );

    }

}


/* CSV PARSER */

function parseCSV(csv) {

    const rows = [];

    let row = [];

    let value = "";

    let insideQuotes = false;


    for (let i = 0; i < csv.length; i++) {

        const char = csv[i];

        const next = csv[i + 1];


        if (char === '"' && next === '"') {

            value += '"';

            i++;

        }

        else if (char === '"') {

            insideQuotes =
                !insideQuotes;

        }

        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(value);

            value = "";

        }

        else if (
            (char === "\n" ||
             char === "\r") &&
            !insideQuotes
        ) {

            if (value !== "" || row.length > 0) {

                row.push(value);

                rows.push(row);

            }

            row = [];

            value = "";

        }

        else {

            value += char;

        }

    }


    if (value !== "" || row.length > 0) {

        row.push(value);

        rows.push(row);

    }


    const headers = rows[0];

    return rows
        .slice(1)
        .map(row => {

            const obj = {};

            headers.forEach(
                (header, index) => {

                    obj[header.trim()] =
                        row[index]
                        ? row[index].trim()
                        : "";

                }
            );

            return obj;

        });

}


/* FILTER OPTIONS */

function populateFilters() {

    createOptions(
        "programFilter",
        "Program"
    );

    createOptions(
        "batchFilter",
        "Batch"
    );

    createOptions(
        "semesterFilter",
        "Current Sem"
    );

    createOptions(
        "examFilter",
        "Exam Attendance"
    );

    createOptions(
        "assignmentFilter",
        "Assignment Status"
    );

    createOptions(
        "reregFilter",
        "Re-Reg"
    );

}


/* CREATE FILTER OPTIONS */

function createOptions(
    elementId,
    field
) {

    const select =
        document.getElementById(elementId);


    const values =
        [
            ...new Set(
                allData
                    .map(row => row[field])
                    .filter(value => value)
            )
        ]
        .sort();


    values.forEach(value => {

        const option =
            document.createElement("option");

        option.value = value;

        option.textContent = value;

        select.appendChild(option);

    });

}


/* APPLY FILTERS */

function getFilteredData() {

    let data =
        [...allData];


    const program =
        document.getElementById(
            "programFilter"
        ).value;


    const batch =
        document.getElementById(
            "batchFilter"
        ).value;


    const semester =
        document.getElementById(
            "semesterFilter"
        ).value;


    const exam =
        document.getElementById(
            "examFilter"
        ).value;


    const assignment =
        document.getElementById(
            "assignmentFilter"
        ).value;


    const rereg =
        document.getElementById(
            "reregFilter"
        ).value;


    const search =
        document.getElementById(
            "searchInput"
        ).value
        .toLowerCase();


    if (program) {

        data =
            data.filter(
                row =>
                    row["Program"] === program
            );

    }


    if (batch) {

        data =
            data.filter(
                row =>
                    row["Batch"] === batch
            );

    }


    if (semester) {

        data =
            data.filter(
                row =>
                    row["Current Sem"] === semester
            );

    }


    if (exam) {

        data =
            data.filter(
                row =>
                    row["Exam Attendance"] === exam
            );

    }


    if (assignment) {

        data =
            data.filter(
                row =>
                    row["Assignment Status"] === assignment
            );

    }


    if (rereg) {

        data =
            data.filter(
                row =>
                    row["Re-Reg"] === rereg
            );

    }


    if (search) {

        data =
            data.filter(row =>

                String(
                    row["Roll No"]
                )
                .toLowerCase()
                .includes(search)

                ||

                String(
                    row["Name"]
                )
                .toLowerCase()
                .includes(search)

            );

    }


    return data;

}


/* UPDATE DASHBOARD */

function updateDashboard(data) {

    const total =
        data.length;


    const examAttended =
        data.filter(row =>
            row["Exam Attendance"] ===
            "Full Attended"
            ||
            row["Exam Attendance"] ===
            "Partially Attended"
        ).length;


    const assignmentSubmitted =
        data.filter(row =>
            row["Assignment Status"] ===
            "Submitted"
        ).length;


    const reregDone =
        data.filter(row =>
            row["Re-Reg"] ===
            "Done"
        ).length;


    const reregNotDone =
        data.filter(row =>
            row["Re-Reg"] ===
            "Not Done"
        ).length;


    const percentage =
        reregDone + reregNotDone > 0
            ? (
                reregDone /
                (reregDone + reregNotDone)
                * 100
            ).toFixed(2)
            : 0;


    document.getElementById(
        "totalLearners"
    ).textContent =
        total.toLocaleString();


    document.getElementById(
        "examAttended"
    ).textContent =
        examAttended.toLocaleString();


    document.getElementById(
        "assignmentSubmitted"
    ).textContent =
        assignmentSubmitted.toLocaleString();


    document.getElementById(
        "reregDone"
    ).textContent =
        reregDone.toLocaleString();


    document.getElementById(
        "reregNotDone"
    ).textContent =
        reregNotDone.toLocaleString();


    document.getElementById(
        "reregPercentage"
    ).textContent =
        percentage + "%";

}


/* TABLE */

function displayTable(data) {

    const table =
        document.getElementById(
            "learnerTable"
        );


    table.innerHTML = "";


    data.forEach(row => {

        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>
                ${escapeHTML(row["Roll No"])}
            </td>

            <td>
                ${escapeHTML(row["Name"])}
            </td>

            <td>
                ${escapeHTML(row["Program"])}
            </td>

            <td>
                ${escapeHTML(row["Batch"])}
            </td>

            <td>
                ${escapeHTML(row["Term Sem"])}
            </td>

            <td>
                ${escapeHTML(row["Exam Attendance"])}
            </td>

            <td>
                ${escapeHTML(row["Assignment Status"])}
            </td>

            <td>
                ${escapeHTML(row["Current Sem"])}
            </td>

            <td>
                ${escapeHTML(row["Re-Reg"])}
            </td>

        `;


        table.appendChild(tr);

    });

}


/* SECURITY */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* FILTER EVENTS */

[
    "programFilter",
    "batchFilter",
    "semesterFilter",
    "examFilter",
    "assignmentFilter",
    "reregFilter",
    "searchInput"
]
.forEach(id => {

    document.getElementById(id)
        .addEventListener(
            "input",
            () => {

                const filtered =
                    getFilteredData();

                updateDashboard(
                    filtered
                );

                displayTable(
                    filtered
                );

            }
        );

});


/* START */

loadData();
