const GOOGLE_CLIENT_ID = "REPLACE_ME_WITH_CLIENT_ID";

const authSection = document.getElementById("authSection");
const dashboard = document.getElementById("dashboard");
const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");
const totalBalanceEl = document.getElementById("totalBalance");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpensesEl = document.getElementById("totalExpenses");
const budgetOverviewEl = document.getElementById("budgetOverview");
const userProfileEl = document.getElementById("userProfile");
const userNameEl = document.getElementById("userName");
const userAvatarEl = document.getElementById("userAvatar");
const signOutBtn = document.getElementById("signOutBtn");
const googleSignInContainer = document.getElementById("googleSignIn");

let currentUser = null;
let transactions = [];

const budgetTargets = {
  Housing: 30,
  Transportation: 15,
  Groceries: 12,
  Entertainment: 10,
  Savings: 20,
  Miscellaneous: 13
};

function decodeJwtResponse(token) {
  if (!token) return null;
  const base64Url = token.split(".")[1];
  if (!base64Url) return null;
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

function initializeGoogleSignIn() {
  if (!window.google || !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes("REPLACE_ME")) {
    googleSignInContainer.innerHTML =
      "<p class='note'>Provide a valid Google OAuth client ID in <code>app.js</code> to enable sign-in.</p>";
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => {
      const profile = decodeJwtResponse(response.credential);
      if (profile) {
        handleLogin(profile);
      }
    },
    auto_select: false
  });

  google.accounts.id.renderButton(googleSignInContainer, {
    theme: "outline",
    size: "large",
    width: 280
  });

  google.accounts.id.prompt();
}

function storageKey() {
  return currentUser ? `wealthwise-transactions-${currentUser.email}` : "wealthwise-transactions";
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}

function renderTransactions() {
  if (!transactions.length) {
    transactionList.innerHTML = "<li class='empty'>No transactions yet.</li>";
  } else {
    transactionList.innerHTML = transactions
      .slice()
      .reverse()
      .map((transaction) => {
        return `
          <li>
            <div class="details">
              <span class="category">${transaction.category}</span>
              <span class="notes">${transaction.notes || "No notes"}</span>
            </div>
            <span class="amount ${transaction.type}">${
              transaction.type === "income" ? "+" : "-"
            }${formatCurrency(transaction.amount)}</span>
          </li>
        `;
      })
      .join("");
  }

  renderSummary();
  renderBudgetHealth();
  localStorage.setItem(storageKey(), JSON.stringify(transactions));
}

function renderSummary() {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;

  totalIncomeEl.textContent = formatCurrency(income);
  totalExpensesEl.textContent = formatCurrency(expenses);
  totalBalanceEl.textContent = formatCurrency(balance);
}

function renderBudgetHealth() {
  if (!transactions.length) {
    budgetOverviewEl.innerHTML = "<p>Log a few transactions to see how your spending aligns with your goals.</p>";
    return;
  }

  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {});

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, value) => sum + value, 0);

  if (!totalExpenses) {
    budgetOverviewEl.innerHTML = "<p>Add expenses to see how they stack up against your budget.</p>";
    return;
  }

  budgetOverviewEl.innerHTML = Object.entries(expensesByCategory)
    .map(([category, amount]) => {
      const allocation = budgetTargets[category] || 0;
      const percentage = totalExpenses ? Math.round((amount / totalExpenses) * 100) : 0;
      const progressWidth = Math.min(100, Math.round((percentage / (allocation || 100)) * 100));
      const status = allocation
        ? percentage > allocation
          ? "Over budget"
          : "On track"
        : "No target set";

      return `
        <div class="budget-line">
          <span>${category}</span>
          <span>${percentage}% of expenses</span>
        </div>
        <div class="budget-bar">
          <span style="width: ${progressWidth}%"></span>
        </div>
        <p class="note">Target: ${allocation || "—"}% • Status: ${status}</p>
      `;
    })
    .join("");
}

function handleLogin(profile) {
  currentUser = {
    name: profile.name,
    email: profile.email,
    picture: profile.picture
  };

  localStorage.setItem("wealthwise-profile", JSON.stringify(currentUser));
  google.accounts.id.disableAutoSelect();

  userNameEl.textContent = currentUser.name;
  if (currentUser.picture) {
    userAvatarEl.src = currentUser.picture;
    userAvatarEl.alt = `${currentUser.name}'s avatar`;
  }

  userProfileEl.classList.remove("hidden");
  authSection.classList.add("hidden");
  dashboard.classList.remove("hidden");

  const stored = localStorage.getItem(storageKey());
  transactions = stored ? JSON.parse(stored) : [];
  renderTransactions();
}

function handleSignOut() {
  google.accounts.id.disableAutoSelect();
  localStorage.removeItem("wealthwise-profile");
  currentUser = null;
  userProfileEl.classList.add("hidden");
  dashboard.classList.add("hidden");
  authSection.classList.remove("hidden");
  googleSignInContainer.innerHTML = "";
  initializeGoogleSignIn();
}

transactionForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const type = document.getElementById("transactionType").value;
  const category = document.getElementById("transactionCategory").value.trim() || "General";
  const amount = parseFloat(document.getElementById("transactionAmount").value);
  const notes = document.getElementById("transactionNotes").value.trim();

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount greater than zero.");
    return;
  }

  transactions.push({
    id: crypto.randomUUID(),
    type,
    category,
    amount,
    notes,
    createdAt: new Date().toISOString()
  });

  transactionForm.reset();
  renderTransactions();
});

signOutBtn?.addEventListener("click", handleSignOut);

document.addEventListener("DOMContentLoaded", () => {
  initializeGoogleSignIn();

  const storedProfile = localStorage.getItem("wealthwise-profile");
  if (storedProfile) {
    const profile = JSON.parse(storedProfile);
    if (profile.email) {
      handleLogin(profile);
    }
  }
});
