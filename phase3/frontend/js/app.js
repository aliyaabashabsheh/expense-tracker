// Expense Tracker - frontend logic.
// The table is always built from what the server sends back, never by hand.

const API_URL = "http://localhost:3000/api/expenses";

const CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Other"];

// The Bootstrap colour for each category badge, and the chart colour.
const BADGE = {
  Food: "success",
  Transport: "info",
  Bills: "warning",
  Entertainment: "danger",
  Other: "secondary"
};

const CHART_COLOURS = ["#198754", "#0dcaf0", "#ffc107", "#dc3545", "#6c757d"];

// The whole list from the server. The filter, the search and the sort never
// change this, they only decide which rows are drawn, so the cards and the
// chart always count every expense.
let expenses = [];
let editingId = null;
let sortKey = "date";
let sortUp = true;
let chart = null;

const el = (id) => document.getElementById(id);

function showAlert(message, kind) {
  const box = document.createElement("div");
  box.className = "alert alert-" + kind;
  box.textContent = message;

  const close = document.createElement("button");
  close.type = "button";
  close.className = "btn-close";
  close.addEventListener("click", () => box.remove());
  box.appendChild(close);

  el("alerts").appendChild(box);
  setTimeout(() => box.remove(), 6000);
}

function showError(error) {
  // fetch throws this when it never reached the server, so the message the
  // browser gives us would not make sense to the person using the page.
  if (error.message === "Failed to fetch") {
    showAlert("Cannot reach the server. Start it with npm start in the backend folder.", "danger");
    return;
  }
  showAlert(error.message, "danger");
}

function readForm(titleId, amountId, categoryId, dateId) {
  const title = el(titleId).value.trim();
  const amount = Number(el(amountId).value);
  const category = el(categoryId).value;
  const date = el(dateId).value;

  if (title === "") {
    return { problem: "Write a title." };
  }
  if (!amount || amount <= 0) {
    return { problem: "The amount must be a number bigger than 0." };
  }
  if (CATEGORIES.indexOf(category) === -1) {
    return { problem: "Choose a category." };
  }
  if (date === "") {
    return { problem: "Choose a date." };
  }

  return { data: { title, amount, category, date } };
}

async function loadExpenses() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("The server could not read the expenses.");
  }
  return response.json();
}

async function addExpense(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message);
  }
  return body;
}

async function updateExpense(id, data) {
  const response = await fetch(API_URL + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message);
  }
  return body;
}

async function deleteExpense(id) {
  const response = await fetch(API_URL + "/" + id, { method: "DELETE" });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message);
  }
  return body;
}

// After every add, edit or delete we ask the server again, so the page only
// ever shows what is really in the database.
async function refresh() {
  el("loading").classList.remove("d-none");

  try {
    expenses = await loadExpenses();
  } catch (error) {
    expenses = [];
    showError(error);
  }

  showSummary();
  showChart();
  showTable();
  el("loading").classList.add("d-none");
}

function showSummary() {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const highest = expenses.reduce((max, item) => Math.max(max, item.amount), 0);

  el("total").textContent = total.toFixed(2);
  el("count").textContent = expenses.length;
  el("highest").textContent = highest.toFixed(2);
}

function showChart() {
  if (typeof Chart === "undefined") {
    return;
  }

  const totals = CATEGORIES.map((category) =>
    expenses
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0)
  );

  if (chart) {
    chart.data.datasets[0].data = totals;
    chart.update();
    return;
  }

  chart = new Chart(el("chart"), {
    type: "doughnut",
    data: {
      labels: CATEGORIES,
      datasets: [{ data: totals, backgroundColor: CHART_COLOURS }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } }
    }
  });
}

// What the table shows right now: the category filter, then the search, then
// the sort. In that order, so the three can be used together.
function visibleExpenses() {
  const chosen = el("filter").value;
  const word = el("search").value.trim().toLowerCase();

  let list = expenses;

  if (chosen !== "All") {
    list = list.filter((item) => item.category === chosen);
  }
  if (word !== "") {
    list = list.filter((item) => item.title.toLowerCase().indexOf(word) !== -1);
  }

  const direction = sortUp ? 1 : -1;

  return list.slice().sort((a, b) => {
    if (a[sortKey] < b[sortKey]) {
      return -1 * direction;
    }
    if (a[sortKey] > b[sortKey]) {
      return 1 * direction;
    }
    return 0;
  });
}

function showTable() {
  const list = visibleExpenses();

  const rows = el("rows");
  rows.textContent = "";
  el("empty").classList.toggle("d-none", list.length !== 0);

  for (const item of list) {
    rows.appendChild(makeRow(item));
  }

  showSortMarks();
}

function showSortMarks() {
  for (const head of document.querySelectorAll("th[data-sort]")) {
    const mark = head.querySelector(".caret");
    mark.textContent = head.dataset.sort === sortKey ? (sortUp ? "▲" : "▼") : "";
  }
}

function makeRow(item) {
  const row = document.createElement("tr");

  const title = document.createElement("td");
  title.textContent = item.title;

  const amount = document.createElement("td");
  amount.textContent = item.amount.toFixed(2);

  const category = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = "badge text-bg-" + BADGE[item.category];
  badge.textContent = item.category;
  category.appendChild(badge);

  const date = document.createElement("td");
  date.textContent = item.date;

  const actions = document.createElement("td");
  actions.className = "text-end text-nowrap";

  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "btn btn-sm btn-outline-secondary me-2";
  edit.textContent = "Edit";
  edit.addEventListener("click", () => openEdit(item));

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "btn btn-sm btn-outline-danger";
  remove.textContent = "Delete";
  remove.addEventListener("click", () => onDelete(item));

  actions.appendChild(edit);
  actions.appendChild(remove);

  row.appendChild(title);
  row.appendChild(amount);
  row.appendChild(category);
  row.appendChild(date);
  row.appendChild(actions);

  return row;
}

el("addForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const result = readForm("addTitle", "addAmount", "addCategory", "addDate");

  if (result.problem) {
    showAlert(result.problem, "warning");
    return;
  }

  try {
    await addExpense(result.data);
    el("addForm").reset();
    showAlert("Expense added.", "success");
    await refresh();
  } catch (error) {
    showError(error);
  }
});

el("filter").addEventListener("change", showTable);
el("search").addEventListener("input", showTable);

for (const head of document.querySelectorAll("th[data-sort]")) {
  head.addEventListener("click", () => {
    if (sortKey === head.dataset.sort) {
      sortUp = !sortUp;
    } else {
      sortKey = head.dataset.sort;
      sortUp = true;
    }
    showTable();
  });
}

el("export").addEventListener("click", () => {
  const list = visibleExpenses();

  if (list.length === 0) {
    showAlert("There is nothing to export.", "warning");
    return;
  }

  const quote = (value) => '"' + String(value).replace(/"/g, '""') + '"';
  const lines = [quote("title") + "," + quote("amount") + "," + quote("category") + "," + quote("date")];

  for (const item of list) {
    lines.push(
      [item.title, item.amount.toFixed(2), item.category, item.date].map(quote).join(",")
    );
  }

  const file = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(file);
  link.download = "expenses.csv";
  link.click();

  URL.revokeObjectURL(link.href);
});

function openEdit(item) {
  editingId = item.id;
  el("editTitle").value = item.title;
  el("editAmount").value = item.amount;
  el("editCategory").value = item.category;
  el("editDate").value = item.date;

  editModal.show();
}

el("editSave").addEventListener("click", async () => {
  const result = readForm("editTitle", "editAmount", "editCategory", "editDate");

  if (result.problem) {
    showAlert(result.problem, "warning");
    return;
  }

  try {
    await updateExpense(editingId, result.data);
    editModal.hide();
    showAlert("Expense updated.", "success");
    await refresh();
  } catch (error) {
    showError(error);
  }
});

async function onDelete(item) {
  if (!confirm("Delete " + item.title + "?")) {
    return;
  }

  try {
    await deleteExpense(item.id);
    showAlert("Expense deleted.", "success");
    await refresh();
  } catch (error) {
    showError(error);
  }
}

const editModal = new bootstrap.Modal(document.getElementById("editModal"));

refresh();
