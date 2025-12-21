// ==========================================
// Expense Tracker Application
// Pure Vanilla JavaScript + LocalStorage
// ==========================================

// State Management
let currentUser = null;
let expenses = [];
let editingIndex = null;

// DOM Elements
const loginPage = document.getElementById("loginPage");
const homePage = document.getElementById("homePage");
const loginForm = document.getElementById("loginForm");
const expenseForm = document.getElementById("expenseForm");
const expenseModal = document.getElementById("expenseModal");
const confirmModal = document.getElementById("confirmModal");
const expenseTableBody = document.getElementById("expenseTableBody");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const deleteExpenseBtn = document.getElementById("deleteExpenseBtn");
const logoutBtn = document.getElementById("logoutBtn");
const closeModal = document.getElementById("closeModal");
const selectAllCheckbox = document.getElementById("selectAllCheckbox");
const confirmCancel = document.getElementById("confirmCancel");
const confirmDelete = document.getElementById("confirmDelete");

// ==========================================
// INITIALIZATION
// ==========================================

function initialize() {
  checkLoggedInUser();
  setupEventListeners();
  setDefaultDate();
}

function checkLoggedInUser() {
  const savedUser = localStorage.getItem("loggedInUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    loadExpenses();
    showHomePage();
  } else {
    showLoginPage();
  }
}

function setupEventListeners() {
  loginForm.addEventListener("submit", handleLogin);
  expenseForm.addEventListener("submit", handleAddExpense);
  addExpenseBtn.addEventListener("click", openAddModal);
  deleteExpenseBtn.addEventListener("click", openDeleteConfirmation);
  logoutBtn.addEventListener("click", handleLogout);
  closeModal.addEventListener("click", closeExpenseModal);
  confirmCancel.addEventListener("click", closeConfirmModal);
  confirmDelete.addEventListener("click", handleDeleteExpense);
  selectAllCheckbox.addEventListener("change", toggleSelectAll);
  expenseModal.addEventListener("click", closeExpenseModalOnOutsideClick);
  confirmModal.addEventListener("click", closeConfirmModalOnOutsideClick);
}

function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;
}

// ==========================================
// LOGIN FUNCTIONALITY
// ==========================================

function handleLogin(e) {
  e.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!firstName || !email) {
    alert("Please fill in all fields");
    return;
  }

  currentUser = { firstName, email };
  localStorage.setItem("loggedInUser", JSON.stringify(currentUser));

  // Initialize expenses for this user
  const expenseKey = `expenses_${email}`;
  if (!localStorage.getItem(expenseKey)) {
    localStorage.setItem(expenseKey, JSON.stringify([]));
  }

  loadExpenses();
  showHomePage();
  loginForm.reset();
}

function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("loggedInUser");
    currentUser = null;
    expenses = [];
    showLoginPage();
    expenseForm.reset();
    setDefaultDate();
  }
}

// ==========================================
// PAGE VISIBILITY
// ==========================================

function showLoginPage() {
  loginPage.style.display = "flex";
  homePage.style.display = "none";
  document.getElementById("firstName").focus();
}

function showHomePage() {
  loginPage.style.display = "none";
  homePage.style.display = "flex";
  updateNavbar();
  renderExpenseTable();
  updateSummary();
}

function updateNavbar() {
  document.getElementById("userName").textContent = currentUser.firstName;
  const initial = currentUser.firstName.charAt(0).toUpperCase();
  document.getElementById("userAvatar").textContent = initial;
}

// ==========================================
// EXPENSE DATA MANAGEMENT
// ==========================================

function loadExpenses() {
  const expenseKey = `expenses_${currentUser.email}`;
  const saved = localStorage.getItem(expenseKey);
  expenses = saved ? JSON.parse(saved) : [];
}

function saveExpenses() {
  const expenseKey = `expenses_${currentUser.email}`;
  localStorage.setItem(expenseKey, JSON.stringify(expenses));
}

function addExpense(eventName, amount, type, date) {
  const expense = {
    id: Date.now(),
    eventName,
    amount: Number.parseFloat(amount),
    type,
    date,
  };
  expenses.push(expense);
  expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveExpenses();
}

function updateExpense(index, eventName, amount, type, date) {
  expenses[index] = {
    ...expenses[index],
    eventName,
    amount: Number.parseFloat(amount),
    type,
    date,
  };
  expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveExpenses();
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  saveExpenses();
}

// ==========================================
// MODAL FUNCTIONALITY
// ==========================================

function openAddModal() {
  editingIndex = null;
  document.getElementById("modalTitle").textContent = "Add Expense";
  expenseForm.reset();
  setDefaultDate();
  expenseModal.classList.add("active");
  document.getElementById("eventName").focus();
}

function openEditModal(index) {
  editingIndex = index;
  const expense = expenses[index];
  document.getElementById("modalTitle").textContent = "Edit Expense";
  document.getElementById("eventName").value = expense.eventName;
  document.getElementById("amount").value = expense.amount;
  document.getElementById("type").value = expense.type;
  document.getElementById("date").value = expense.date;
  expenseModal.classList.add("active");
  document.getElementById("eventName").focus();
}

function closeExpenseModal() {
  expenseModal.classList.remove("active");
  expenseForm.reset();
}

function closeExpenseModalOnOutsideClick(e) {
  if (e.target === expenseModal) {
    closeExpenseModal();
  }
}

function openDeleteConfirmation() {
  const checked = document.querySelectorAll("input[data-row]:checked");
  if (checked.length === 0) {
    alert("Please select rows to delete");
    return;
  }
  confirmModal.classList.add("active");
}

function closeConfirmModal() {
  confirmModal.classList.remove("active");
}

function closeConfirmModalOnOutsideClick(e) {
  if (e.target === confirmModal) {
    closeConfirmModal();
  }
}

// ==========================================
// FORM SUBMISSION
// ==========================================

function handleAddExpense(e) {
  e.preventDefault();

  const eventName = document.getElementById("eventName").value.trim();
  const amount = document.getElementById("amount").value;
  const type = document.getElementById("type").value;
  const date = document.getElementById("date").value;

  if (!eventName || !amount || !type || !date) {
    alert("Please fill in all fields");
    return;
  }

  if (editingIndex !== null) {
    updateExpense(editingIndex, eventName, amount, type, date);
  } else {
    addExpense(eventName, amount, type, date);
  }

  closeExpenseModal();
  renderExpenseTable();
  updateSummary();
}

// ==========================================
// TABLE RENDERING
// ==========================================

function renderExpenseTable() {
  expenseTableBody.innerHTML = "";

  expenses.forEach((expense, index) => {
    const row = document.createElement("tr");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.row = index;
    checkbox.addEventListener("change", updateSelectAllCheckbox);

    const serialTd = document.createElement("td");
    serialTd.textContent = index + 1;

    const eventNameInput = document.createElement("input");
    eventNameInput.type = "text";
    eventNameInput.value = expense.eventName;
    eventNameInput.addEventListener("blur", () => {
      updateExpense(
        index,
        eventNameInput.value,
        expense.amount,
        expense.type,
        expense.date
      );
      renderExpenseTable();
      updateSummary();
    });

    const amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.step = "0.01";
    amountInput.value = expense.amount;
    amountInput.addEventListener("blur", () => {
      updateExpense(
        index,
        expense.eventName,
        amountInput.value,
        expense.type,
        expense.date
      );
      renderExpenseTable();
      updateSummary();
    });

    const typeSelect = document.createElement("select");
    typeSelect.innerHTML = `
            <option value="income">💲 Income</option>
            <option value="expense">⛔ Expense</option>
        `;
    typeSelect.value = expense.type;
    typeSelect.addEventListener("change", () => {
      updateExpense(
        index,
        expense.eventName,
        expense.amount,
        typeSelect.value,
        expense.date
      );
      renderExpenseTable();
      updateSummary();
    });

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = expense.date;
    dateInput.addEventListener("change", () => {
      updateExpense(
        index,
        expense.eventName,
        expense.amount,
        expense.type,
        dateInput.value
      );
      renderExpenseTable();
      updateSummary();
    });

    const runningTotal = calculateRunningTotal(index);

    const typeIcon = document.createElement("span");
    if (expense.type === "income") {
      typeIcon.className = "type-income icon-income";
      typeIcon.textContent = "💲";
    } else {
      typeIcon.className = "type-expense icon-expense";
      typeIcon.textContent = "⛔";
    }

    const checkboxTd = document.createElement("td");
    checkboxTd.appendChild(checkbox);

    row.appendChild(checkboxTd);
    row.appendChild(serialTd);

    const eventNameTd = document.createElement("td");
    eventNameTd.appendChild(eventNameInput);
    row.appendChild(eventNameTd);

    const amountTd = document.createElement("td");
    amountTd.appendChild(amountInput);
    row.appendChild(amountTd);

    const typeTd = document.createElement("td");
    typeTd.appendChild(typeSelect);
    row.appendChild(typeTd);

    const dateTd = document.createElement("td");
    dateTd.appendChild(dateInput);
    row.appendChild(dateTd);

    const runningTotalTd = document.createElement("td");
    runningTotalTd.textContent = `₹${runningTotal.toFixed(2)}`;
    row.appendChild(runningTotalTd);

    expenseTableBody.appendChild(row);
  });
}

// ==========================================
// CALCULATIONS
// ==========================================

function calculateRunningTotal(upToIndex) {
  let total = 0;
  const targetDate = expenses[upToIndex].date;

  for (let i = 0; i <= upToIndex; i++) {
    if (new Date(expenses[i].date) <= new Date(targetDate)) {
      if (expenses[i].type === "income") {
        total += expenses[i].amount;
      } else {
        total -= expenses[i].amount;
      }
    }
  }

  return total;
}

function updateSummary() {
  let totalIncome = 0;
  let totalExpense = 0;

  expenses.forEach((expense) => {
    if (expense.type === "income") {
      totalIncome += expense.amount;
    } else {
      totalExpense += expense.amount;
    }
  });

  const balance = totalIncome - totalExpense;

  document.getElementById("totalIncome").textContent = `₹${totalIncome.toFixed(
    2
  )}`;
  document.getElementById(
    "totalExpense"
  ).textContent = `₹${totalExpense.toFixed(2)}`;
  document.getElementById("grandTotal").textContent = `₹${balance.toFixed(2)}`;
}

// ==========================================
// CHECKBOX FUNCTIONALITY
// ==========================================

function toggleSelectAll(e) {
  const checkboxes = document.querySelectorAll("input[data-row]");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = e.target.checked;
  });
}

function updateSelectAllCheckbox() {
  const checkboxes = document.querySelectorAll("input[data-row]");
  const checked = document.querySelectorAll("input[data-row]:checked");
  selectAllCheckbox.checked =
    checkboxes.length > 0 && checkboxes.length === checked.length;
}

// ==========================================
// EVENT LISTENERS FOR DELETE
// ==========================================

function handleDeleteExpense() {
  const checked = Array.from(
    document.querySelectorAll("input[data-row]:checked")
  );
  const indices = checked
    .map((cb) => Number.parseInt(cb.dataset.row))
    .sort((a, b) => b - a);

  indices.forEach((index) => {
    deleteExpense(index);
  });

  closeConfirmModal();
  selectAllCheckbox.checked = false;
  renderExpenseTable();
  updateSummary();
}

// ==========================================
// START APPLICATION
// ==========================================

document.addEventListener("DOMContentLoaded", initialize);
