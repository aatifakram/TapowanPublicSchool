/**
 * ============================================================
 *  TAPOWAN PUBLIC SCHOOL — FINANCE & INVESTMENT MODULE
 *  Drop this file AFTER app.js in index.html
 *  Adds:
 *   • Dashboard "School Balance" card (all roles)
 *   • "Finance" nav section with sub-views (Admin only sees
 *     total-balance, day-wise filters, charts)
 *   • "Investments" module — track where school money is invested
 * ============================================================
 */

(function () {
  "use strict";

  /* ─── CONSTANTS ─────────────────────────────────────────── */
  const MODULE_KEY = "schoolFinance";
  const INVEST_KEY = "schoolInvestments";
  const EXPENSE_KEY = "schoolExpenses";
  const INCOME_KEY = "schoolIncome";

  /* ─── SEED DEMO DATA IF EMPTY ───────────────────────────── */
  function seedDemoData() {
    const store = serverStore || {};

    // Seed investments
    if (!store[INVEST_KEY] || store[INVEST_KEY].length === 0) {
      store[INVEST_KEY] = [
        { id: 1, title: "Fixed Deposit – SBI", category: "Fixed Deposit", amount: 500000, expectedReturn: 7.1, startDate: "2024-04-01", maturityDate: "2025-04-01", status: "Active", notes: "Annual FD for infrastructure reserve", bank: "State Bank of India" },
        { id: 2, title: "School Bus Purchase Fund", category: "Infrastructure", amount: 200000, expectedReturn: 0, startDate: "2024-06-01", maturityDate: "", status: "Active", notes: "Reserved for new school bus", bank: "Internal Reserve" },
        { id: 3, title: "Smart Classroom Equipment", category: "Technology", amount: 150000, expectedReturn: 0, startDate: "2024-07-15", maturityDate: "", status: "Completed", notes: "Purchased 5 smart boards", bank: "Internal Reserve" },
        { id: 4, title: "Recurring Deposit – PNB", category: "Recurring Deposit", amount: 120000, expectedReturn: 6.8, startDate: "2024-08-01", maturityDate: "2025-08-01", status: "Active", notes: "Monthly ₹10,000 RD", bank: "Punjab National Bank" },
        { id: 5, title: "Library Book Fund", category: "Education", amount: 80000, expectedReturn: 0, startDate: "2024-09-01", maturityDate: "", status: "Active", notes: "New book procurement for 2024-25", bank: "Internal Reserve" },
      ];
    }

    // Seed income records
    if (!store[INCOME_KEY] || store[INCOME_KEY].length === 0) {
      const months = ["2024-04", "2024-05", "2024-06", "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03"];
      const incomes = [];
      let id = 1;
      months.forEach(m => {
        incomes.push({ id: id++, date: `${m}-05`, source: "Fee Collection", amount: Math.floor(180000 + Math.random() * 40000), category: "Fees", description: "Monthly fee collection", mode: "Mixed" });
        if (Math.random() > 0.4) incomes.push({ id: id++, date: `${m}-10`, source: "Transport Fee", amount: Math.floor(30000 + Math.random() * 10000), category: "Transport", description: "Bus route fees", mode: "UPI" });
        if (Math.random() > 0.6) incomes.push({ id: id++, date: `${m}-15`, source: "Hostel Fee", amount: Math.floor(20000 + Math.random() * 5000), category: "Hostel", description: "Hostel accommodation charges", mode: "Bank Transfer" });
        if (Math.random() > 0.7) incomes.push({ id: id++, date: `${m}-20`, source: "Exam Fee", amount: Math.floor(10000 + Math.random() * 8000), category: "Exams", description: "Examination fee", mode: "Cash" });
      });
      store[INCOME_KEY] = incomes;
    }

    // Seed expense records
    if (!store[EXPENSE_KEY] || store[EXPENSE_KEY].length === 0) {
      const months = ["2024-04", "2024-05", "2024-06", "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03"];
      const expenses = [];
      let id = 1;
      months.forEach(m => {
        expenses.push({ id: id++, date: `${m}-07`, head: "Staff Salary", amount: Math.floor(140000 + Math.random() * 20000), category: "Payroll", description: "Monthly salary disbursement", mode: "Bank Transfer" });
        expenses.push({ id: id++, date: `${m}-12`, head: "Electricity Bill", amount: Math.floor(8000 + Math.random() * 4000), category: "Utilities", description: "Electricity charges", mode: "Online" });
        if (Math.random() > 0.4) expenses.push({ id: id++, date: `${m}-18`, head: "Stationery & Supplies", amount: Math.floor(5000 + Math.random() * 3000), category: "Supplies", description: "Office and classroom supplies", mode: "Cash" });
        if (Math.random() > 0.5) expenses.push({ id: id++, date: `${m}-22`, head: "Maintenance & Repair", amount: Math.floor(6000 + Math.random() * 6000), category: "Maintenance", description: "Building and equipment maintenance", mode: "Cash" });
      });
      store[EXPENSE_KEY] = expenses;
    }

    serverStore = store;
  }

  /* ─── HELPERS ───────────────────────────────────────────── */
  function fmt(n) {
    return "₹ " + (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  }
  function fmtK(n) {
    const v = Number(n) || 0;
    if (v >= 1e7) return "₹" + (v / 1e7).toFixed(2) + "Cr";
    if (v >= 1e5) return "₹" + (v / 1e5).toFixed(2) + "L";
    if (v >= 1e3) return "₹" + (v / 1e3).toFixed(1) + "K";
    return "₹" + v;
  }
  function isAdmin() {
    try {
      const badge = document.getElementById("activeUserBadge")?.textContent || "";
      return badge.toLowerCase().includes("admin") || badge.toLowerCase().includes("administrator") || badge.toLowerCase().includes("principal");
    } catch { return true; }
  }
  function todayStr() { return new Date().toISOString().slice(0, 10); }
  function getStore() { return serverStore || {}; }

  /* ─── FINANCIAL CALCULATIONS ────────────────────────────── */
  function calcFinancials(dateFrom, dateTo) {
    const store = getStore();
    const incomes = (store[INCOME_KEY] || []).filter(r => (!dateFrom || r.date >= dateFrom) && (!dateTo || r.date <= dateTo));
    const expenses = (store[EXPENSE_KEY] || []).filter(r => (!dateFrom || r.date >= dateFrom) && (!dateTo || r.date <= dateTo));
    const feePaid = (store.fees || []).filter(r => (!dateFrom || (r.paymentDate || "") >= dateFrom) && (!dateTo || (r.paymentDate || "") <= dateTo));
    const feeIncome = feePaid.reduce((s, r) => s + (Number(r.paidAmount) || 0), 0);
    const otherIncome = incomes.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const totalIncome = feeIncome + otherIncome;
    const totalExpense = expenses.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const invested = (store[INVEST_KEY] || []).filter(r => r.status === "Active").reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const payroll = (store.payroll || []).reduce((s, r) => s + (Number(r.netPay) || 0), 0);
    return { totalIncome, totalExpense, feeIncome, otherIncome, invested, payroll, balance: totalIncome - totalExpense };
  }

  function getDayWise(dateFrom, dateTo) {
    const store = getStore();
    const days = {};
    const addDay = (date, income, expense) => {
      if (!date) return;
      if (!days[date]) days[date] = { income: 0, expense: 0 };
      days[date].income += income;
      days[date].expense += expense;
    };
    (store[INCOME_KEY] || []).forEach(r => { if ((!dateFrom || r.date >= dateFrom) && (!dateTo || r.date <= dateTo)) addDay(r.date, Number(r.amount) || 0, 0); });
    (store.fees || []).forEach(r => { const d = r.paymentDate; if (d && (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo)) addDay(d, Number(r.paidAmount) || 0, 0); });
    (store[EXPENSE_KEY] || []).forEach(r => { if ((!dateFrom || r.date >= dateFrom) && (!dateTo || r.date <= dateTo)) addDay(r.date, 0, Number(r.amount) || 0); });
    return Object.entries(days).sort((a, b) => a[0].localeCompare(b[0])).map(([date, v]) => ({ date, ...v, balance: v.income - v.expense }));
  }

  /* ─── DASHBOARD BALANCE CARD INJECTION ─────────────────── */
  function injectDashboardCard() {
    const grid = document.getElementById("statsCards");
    if (!grid) return;

    // Remove old injected card
    document.querySelectorAll(".finance-injected-card").forEach(el => el.remove());

    const { totalIncome, totalExpense, balance, invested } = calcFinancials(null, null);

    // Total balance card
    const card = document.createElement("div");
    card.className = "stat-card finance-injected-card";
    card.style.cssText = `
      background: linear-gradient(135deg, #0f4c75 0%, #1b6ca8 50%, #118ab2 100%);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    `;
    card.innerHTML = `
      <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;background:rgba(255,255,255,0.05);border-radius:50%;"></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:1.4rem;">🏦</span>
        <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;opacity:0.8;">School Balance</span>
      </div>
      <div style="font-size:1.6rem;font-weight:800;margin:4px 0;">${fmtK(balance)}</div>
      <div style="font-size:0.7rem;opacity:0.75;margin-bottom:6px;">Total Income: ${fmtK(totalIncome)} &nbsp;|&nbsp; Expenses: ${fmtK(totalExpense)}</div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span style="background:rgba(255,255,255,0.15);border-radius:20px;padding:2px 10px;font-size:0.68rem;font-weight:700;">💼 Invested: ${fmtK(invested)}</span>
        ${isAdmin() ? `<span style="background:#fbbf24;color:#1a1a1a;border-radius:20px;padding:2px 10px;font-size:0.68rem;font-weight:700;">Admin View</span>` : ""}
      </div>
    `;
    card.title = "Click to open Finance Module";
    card.addEventListener("click", () => { openFinanceModule(); });
    grid.prepend(card);
  }

  /* ─── MAIN FINANCE MODULE MODAL ────────────────────────── */
  let financeModal = null;
  let financeState = {
    view: "overview",    // overview | daywise | investments | income | expenses | addInvest | addIncome | addExpense
    dateFrom: new Date(new Date().getFullYear(), 3, 1).toISOString().slice(0, 10), // April 1 current year
    dateTo: todayStr(),
    dayFilter: "thisMonth",
    investTab: "active",
  };

  function openFinanceModule() {
    if (!financeModal) createFinanceModal();
    financeModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    renderFinanceContent();
  }

  function closeFinanceModule() {
    if (financeModal) financeModal.style.display = "none";
    document.body.style.overflow = "";
  }

  function createFinanceModal() {
    financeModal = document.createElement("div");
    financeModal.id = "financeModuleModal";
    financeModal.style.cssText = `
      position:fixed;inset:0;z-index:9999;display:none;align-items:stretch;justify-content:flex-end;
      background:rgba(10,15,30,0.7);backdrop-filter:blur(4px);
    `;
    financeModal.innerHTML = `
      <div id="financePanel" style="
        width:min(96vw,1100px);height:100vh;background:#0f172a;overflow-y:auto;
        box-shadow:-12px 0 60px rgba(0,0,0,0.5);
        display:flex;flex-direction:column;
      ">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0f4c75,#1b6ca8);padding:20px 28px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div>
            <div style="color:rgba(255,255,255,0.7);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px;">Tapowan Public School</div>
            <div style="color:#fff;font-size:1.4rem;font-weight:800;letter-spacing:-0.01em;">💰 Finance & Investment Centre</div>
          </div>
          <button id="financeCloseBtn" style="background:rgba(255,255,255,0.12);border:none;color:#fff;width:36px;height:36px;border-radius:50%;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
        </div>
        <!-- Nav tabs -->
        <div id="financeNavTabs" style="background:#0d1b2e;padding:0 28px;display:flex;gap:4px;border-bottom:1px solid rgba(255,255,255,0.07);flex-shrink:0;overflow-x:auto;"></div>
        <!-- Content -->
        <div id="financeContent" style="flex:1;padding:24px 28px;overflow-y:auto;"></div>
      </div>
    `;
    document.body.appendChild(financeModal);

    financeModal.addEventListener("click", e => { if (e.target === financeModal) closeFinanceModule(); });
    financeModal.querySelector("#financeCloseBtn").addEventListener("click", closeFinanceModule);

    // Build tabs
    const tabs = [
      { key: "overview", icon: "📊", label: "Overview" },
      { key: "daywise", icon: "📅", label: "Day-wise" },
      { key: "investments", icon: "💼", label: "Investments" },
      { key: "income", icon: "⬆️", label: "Income" },
      { key: "expenses", icon: "⬇️", label: "Expenses" },
    ];
    if (!isAdmin()) {
      // Non-admins: remove admin-only tabs
      tabs.splice(1, 4);
    }
    const navTabs = financeModal.querySelector("#financeNavTabs");
    tabs.forEach(t => {
      const btn = document.createElement("button");
      btn.dataset.tab = t.key;
      btn.style.cssText = `
        background:none;border:none;color:rgba(255,255,255,0.55);cursor:pointer;
        padding:14px 18px;font-size:0.82rem;font-weight:600;white-space:nowrap;
        border-bottom:2px solid transparent;transition:all .2s;
      `;
      btn.innerHTML = `${t.icon} ${t.label}`;
      btn.addEventListener("click", () => {
        financeState.view = t.key;
        renderFinanceContent();
      });
      navTabs.appendChild(btn);
    });
  }

  function renderFinanceContent() {
    if (!financeModal) return;
    const tabs = financeModal.querySelectorAll("#financeNavTabs button");
    tabs.forEach(b => {
      const active = b.dataset.tab === financeState.view;
      b.style.color = active ? "#38bdf8" : "rgba(255,255,255,0.55)";
      b.style.borderBottomColor = active ? "#38bdf8" : "transparent";
    });

    const content = financeModal.querySelector("#financeContent");
    switch (financeState.view) {
      case "overview": content.innerHTML = renderOverviewHTML(); break;
      case "daywise": content.innerHTML = renderDayWiseHTML(); break;
      case "investments": content.innerHTML = renderInvestmentsHTML(); break;
      case "income": content.innerHTML = renderIncomeHTML(); break;
      case "expenses": content.innerHTML = renderExpensesHTML(); break;
      default: content.innerHTML = renderOverviewHTML();
    }
    bindContentEvents(content);
  }

  /* ─── OVERVIEW TAB ──────────────────────────────────────── */
  function renderOverviewHTML() {
    const { totalIncome, totalExpense, balance, invested, feeIncome, otherIncome, payroll } = calcFinancials(financeState.dateFrom, financeState.dateTo);
    const store = getStore();
    const investments = store[INVEST_KEY] || [];
    const activeInvest = investments.filter(i => i.status === "Active");
    const expectedReturns = activeInvest.reduce((s, i) => s + (i.amount * i.expectedReturn / 100), 0);
    const pctExpense = totalIncome > 0 ? Math.min(100, (totalExpense / totalIncome * 100)).toFixed(1) : 0;
    const pctInvested = (totalIncome + invested) > 0 ? (invested / (totalIncome + invested) * 100).toFixed(1) : 0;

    const adminSection = isAdmin() ? `
      <!-- Admin-only: Balance Summary -->
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;margin-bottom:20px;">
        <div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;">
          🔐 Admin — Full Balance Breakdown
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;">
          ${adminMetric("Fee Income", feeIncome, "#4ade80")}
          ${adminMetric("Other Income", otherIncome, "#38bdf8")}
          ${adminMetric("Total Expenses", totalExpense, "#f87171")}
          ${adminMetric("Payroll Paid", payroll, "#fb923c")}
          ${adminMetric("Active Investments", invested, "#a78bfa")}
          ${adminMetric("Expected Returns/yr", expectedReturns, "#fbbf24")}
        </div>
      </div>
    ` : "";

    return `
      <!-- Date range filter -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;flex-wrap:wrap;align-items:center;gap:12px;">
        <span style="color:rgba(255,255,255,0.6);font-size:0.8rem;font-weight:600;">📅 Period:</span>
        ${quickFilterBtn("thisMonth", "This Month")}
        ${quickFilterBtn("thisQuarter", "This Quarter")}
        ${quickFilterBtn("thisYear", "This Year")}
        ${quickFilterBtn("allTime", "All Time")}
        <span style="color:rgba(255,255,255,0.4);margin:0 4px;">|</span>
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">From <input type="date" id="fi_from" value="${financeState.dateFrom}" style="${inputStyle}" /></label>
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">To <input type="date" id="fi_to" value="${financeState.dateTo}" style="${inputStyle}" /></label>
        <button id="fi_applyRange" style="${btnStyle("blue")}">Apply</button>
      </div>

      <!-- KPI cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:22px;">
        ${kpiCard("Total Income", totalIncome, "⬆️", "#4ade80", `Fee: ${fmtK(feeIncome)} + Other: ${fmtK(otherIncome)}`)}
        ${kpiCard("Total Expenses", totalExpense, "⬇️", "#f87171", `${pctExpense}% of income`)}
        ${kpiCard("Net Balance", balance, "💰", balance >= 0 ? "#38bdf8" : "#f87171", balance >= 0 ? "Surplus" : "Deficit")}
        ${kpiCard("Invested (Active)", invested, "💼", "#a78bfa", `${pctInvested}% of funds`)}
      </div>

      ${adminSection}

      <!-- Investment snapshot -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <div style="${panelStyle}">
          <div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:14px;">📈 Investment Categories</div>
          ${investCategoryBars(store[INVEST_KEY] || [])}
        </div>
        <div style="${panelStyle}">
          <div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:14px;">🏦 Recent Transactions</div>
          ${recentTxnList(store)}
        </div>
      </div>

      <!-- Balance bar -->
      <div style="${panelStyle}">
        <div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:12px;">📊 Income vs Expense vs Invested</div>
        ${balanceBar(totalIncome, totalExpense, invested)}
      </div>
    `;
  }

  const panelStyle = `background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px;`;
  const inputStyle = `background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:7px;color:#fff;padding:5px 10px;font-size:0.8rem;margin-left:4px;`;

  function btnStyle(color = "blue") {
    const colors = { blue: "#3b82f6", green: "#22c55e", red: "#ef4444", amber: "#f59e0b" };
    return `background:${colors[color] || colors.blue};color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:0.78rem;font-weight:700;cursor:pointer;`;
  }

  function quickFilterBtn(key, label) {
    const active = financeState.dayFilter === key;
    return `<button data-qf="${key}" style="background:${active ? "#3b82f6" : "rgba(255,255,255,0.08)"};color:${active ? "#fff" : "rgba(255,255,255,0.6)"};border:none;border-radius:8px;padding:5px 12px;font-size:0.75rem;font-weight:600;cursor:pointer;">${label}</button>`;
  }

  function kpiCard(title, value, icon, color, sub) {
    return `
      <div style="background:rgba(255,255,255,0.04);border:1px solid ${color}30;border-radius:14px;padding:18px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-10px;right:-10px;width:60px;height:60px;background:${color}18;border-radius:50%;"></div>
        <div style="font-size:1.4rem;margin-bottom:8px;">${icon}</div>
        <div style="font-size:1.5rem;font-weight:800;color:${color};margin-bottom:4px;">${fmtK(value)}</div>
        <div style="font-size:0.82rem;font-weight:700;color:rgba(255,255,255,0.8);">${title}</div>
        <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);margin-top:3px;">${sub}</div>
      </div>
    `;
  }

  function adminMetric(label, value, color) {
    return `
      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 14px;">
        <div style="font-size:1.1rem;font-weight:800;color:${color};">${fmtK(value)}</div>
        <div style="font-size:0.72rem;color:rgba(255,255,255,0.5);margin-top:2px;">${label}</div>
      </div>
    `;
  }

  function investCategoryBars(investments) {
    const cats = {};
    investments.filter(i => i.status === "Active").forEach(i => {
      cats[i.category] = (cats[i.category] || 0) + Number(i.amount);
    });
    const total = Object.values(cats).reduce((s, v) => s + v, 0) || 1;
    const colors = ["#38bdf8", "#a78bfa", "#4ade80", "#fb923c", "#f472b6", "#fbbf24"];
    return Object.entries(cats).map(([cat, amt], i) => `
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:rgba(255,255,255,0.8);font-size:0.78rem;">${cat}</span>
          <span style="color:${colors[i % colors.length]};font-size:0.78rem;font-weight:700;">${fmtK(amt)}</span>
        </div>
        <div style="background:rgba(255,255,255,0.08);border-radius:4px;height:6px;overflow:hidden;">
          <div style="background:${colors[i % colors.length]};width:${(amt / total * 100).toFixed(1)}%;height:100%;border-radius:4px;transition:width .6s;"></div>
        </div>
      </div>
    `).join("") || `<div style="color:rgba(255,255,255,0.3);font-size:0.82rem;">No active investments</div>`;
  }

  function recentTxnList(store) {
    const txns = [];
    (store[INCOME_KEY] || []).slice(-5).forEach(r => txns.push({ date: r.date, label: r.source, amount: r.amount, type: "in" }));
    (store[EXPENSE_KEY] || []).slice(-5).forEach(r => txns.push({ date: r.date, label: r.head, amount: r.amount, type: "out" }));
    txns.sort((a, b) => b.date.localeCompare(a.date));
    return txns.slice(0, 8).map(t => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <div>
          <div style="color:rgba(255,255,255,0.85);font-size:0.78rem;">${t.label}</div>
          <div style="color:rgba(255,255,255,0.35);font-size:0.68rem;">${t.date}</div>
        </div>
        <span style="font-size:0.82rem;font-weight:700;color:${t.type === "in" ? "#4ade80" : "#f87171"};">${t.type === "in" ? "+" : "−"}${fmtK(t.amount)}</span>
      </div>
    `).join("") || `<div style="color:rgba(255,255,255,0.3);font-size:0.82rem;">No transactions yet</div>`;
  }

  function balanceBar(income, expense, invested) {
    const total = Math.max(income, expense + invested, 1);
    const ip = (income / total * 100).toFixed(1);
    const ep = (expense / total * 100).toFixed(1);
    const vp = (invested / total * 100).toFixed(1);
    return `
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
        <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:8px;height:18px;overflow:hidden;display:flex;">
          <div style="background:#4ade80;width:${ip}%;transition:width .6s;" title="Income"></div>
        </div>
        <span style="color:#4ade80;font-size:0.72rem;width:60px;text-align:right;">${fmtK(income)}</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
        <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:8px;height:18px;overflow:hidden;">
          <div style="background:#f87171;width:${ep}%;transition:width .6s;height:100%;"></div>
        </div>
        <span style="color:#f87171;font-size:0.72rem;width:60px;text-align:right;">${fmtK(expense)}</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:8px;height:18px;overflow:hidden;">
          <div style="background:#a78bfa;width:${vp}%;transition:width .6s;height:100%;"></div>
        </div>
        <span style="color:#a78bfa;font-size:0.72rem;width:60px;text-align:right;">${fmtK(invested)}</span>
      </div>
      <div style="display:flex;gap:16px;margin-top:10px;">
        <span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;color:rgba(255,255,255,0.5);"><span style="width:10px;height:10px;background:#4ade80;border-radius:2px;display:inline-block;"></span>Income</span>
        <span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;color:rgba(255,255,255,0.5);"><span style="width:10px;height:10px;background:#f87171;border-radius:2px;display:inline-block;"></span>Expenses</span>
        <span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;color:rgba(255,255,255,0.5);"><span style="width:10px;height:10px;background:#a78bfa;border-radius:2px;display:inline-block;"></span>Invested</span>
      </div>
    `;
  }

  /* ─── DAY-WISE TAB ──────────────────────────────────────── */
  function renderDayWiseHTML() {
    const rows = getDayWise(financeState.dateFrom, financeState.dateTo);
    const totalInc = rows.reduce((s, r) => s + r.income, 0);
    const totalExp = rows.reduce((s, r) => s + r.expense, 0);
    const maxVal = Math.max(...rows.map(r => Math.max(r.income, r.expense)), 1);

    const chartRows = rows.slice(-30).map(r => {
      const incH = Math.round(r.income / maxVal * 100);
      const expH = Math.round(r.expense / maxVal * 100);
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;min-width:18px;cursor:pointer;" title="${r.date}: Inc ${fmt(r.income)}, Exp ${fmt(r.expense)}">
          <div style="display:flex;gap:1px;align-items:flex-end;height:80px;">
            <div style="width:6px;background:#4ade80;border-radius:2px 2px 0 0;height:${incH}%;min-height:${r.income > 0 ? 2 : 0}px;transition:height .4s;"></div>
            <div style="width:6px;background:#f87171;border-radius:2px 2px 0 0;height:${expH}%;min-height:${r.expense > 0 ? 2 : 0}px;transition:height .4s;"></div>
          </div>
          <div style="font-size:0.55rem;color:rgba(255,255,255,0.3);transform:rotate(-45deg);white-space:nowrap;">${r.date.slice(5)}</div>
        </div>
      `;
    }).join("");

    const tableRows = rows.slice().reverse().map((r, i) => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:10px 12px;color:rgba(255,255,255,0.7);font-size:0.8rem;">${r.date}</td>
        <td style="padding:10px 12px;color:#4ade80;font-size:0.8rem;font-weight:700;">${r.income > 0 ? fmt(r.income) : "—"}</td>
        <td style="padding:10px 12px;color:#f87171;font-size:0.8rem;font-weight:700;">${r.expense > 0 ? fmt(r.expense) : "—"}</td>
        <td style="padding:10px 12px;font-size:0.8rem;font-weight:700;color:${r.balance >= 0 ? "#38bdf8" : "#f87171"};">${fmt(r.balance)}</td>
      </tr>
    `).join("");

    return `
      <!-- Filter row -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;flex-wrap:wrap;align-items:center;gap:12px;">
        <span style="color:rgba(255,255,255,0.6);font-size:0.8rem;font-weight:600;">📅 Filter:</span>
        ${quickFilterBtn("today", "Today")}
        ${quickFilterBtn("thisWeek", "This Week")}
        ${quickFilterBtn("thisMonth", "This Month")}
        ${quickFilterBtn("thisQuarter", "This Quarter")}
        ${quickFilterBtn("thisYear", "This Year")}
        <span style="color:rgba(255,255,255,0.4);">|</span>
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">From <input type="date" id="fi_from" value="${financeState.dateFrom}" style="${inputStyle}" /></label>
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">To <input type="date" id="fi_to" value="${financeState.dateTo}" style="${inputStyle}" /></label>
        <button id="fi_applyRange" style="${btnStyle("blue")}">Apply</button>
        <button id="fi_exportDW" style="${btnStyle("green")}">⬇ Export CSV</button>
      </div>

      <!-- Summary row -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
        <div style="${panelStyle}text-align:center;">
          <div style="font-size:1.3rem;font-weight:800;color:#4ade80;">${fmtK(totalInc)}</div>
          <div style="font-size:0.75rem;color:rgba(255,255,255,0.5);">Total Income</div>
        </div>
        <div style="${panelStyle}text-align:center;">
          <div style="font-size:1.3rem;font-weight:800;color:#f87171;">${fmtK(totalExp)}</div>
          <div style="font-size:0.75rem;color:rgba(255,255,255,0.5);">Total Expense</div>
        </div>
        <div style="${panelStyle}text-align:center;">
          <div style="font-size:1.3rem;font-weight:800;color:${totalInc - totalExp >= 0 ? '#38bdf8' : '#f87171'};">${fmtK(totalInc - totalExp)}</div>
          <div style="font-size:0.75rem;color:rgba(255,255,255,0.5);">Net Balance</div>
        </div>
      </div>

      <!-- Chart -->
      <div style="${panelStyle}margin-bottom:20px;">
        <div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:14px;">Daily Income vs Expense (last 30 days)</div>
        <div style="display:flex;align-items:flex-end;gap:1px;overflow-x:auto;padding-bottom:8px;">
          ${chartRows || '<div style="color:rgba(255,255,255,0.3);">No data in this range</div>'}
        </div>
        <div style="display:flex;gap:16px;margin-top:8px;">
          <span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;color:rgba(255,255,255,0.5);"><span style="width:8px;height:8px;background:#4ade80;border-radius:2px;display:inline-block;"></span>Income</span>
          <span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;color:rgba(255,255,255,0.5);"><span style="width:8px;height:8px;background:#f87171;border-radius:2px;display:inline-block;"></span>Expense</span>
        </div>
      </div>

      <!-- Table -->
      <div style="${panelStyle}">
        <div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:14px;">Day-wise Ledger — ${rows.length} days</div>
        ${rows.length === 0 ? `<div style="color:rgba(255,255,255,0.3);padding:20px;text-align:center;">No transactions in this period</div>` : `
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                <th style="padding:10px 12px;text-align:left;font-size:0.72rem;color:rgba(255,255,255,0.4);font-weight:600;">DATE</th>
                <th style="padding:10px 12px;text-align:left;font-size:0.72rem;color:#4ade80;font-weight:600;">INCOME</th>
                <th style="padding:10px 12px;text-align:left;font-size:0.72rem;color:#f87171;font-weight:600;">EXPENSE</th>
                <th style="padding:10px 12px;text-align:left;font-size:0.72rem;color:#38bdf8;font-weight:600;">BALANCE</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
            <tfoot>
              <tr style="border-top:2px solid rgba(255,255,255,0.15);">
                <td style="padding:10px 12px;font-size:0.8rem;font-weight:700;color:rgba(255,255,255,0.6);">TOTAL (${rows.length} days)</td>
                <td style="padding:10px 12px;color:#4ade80;font-size:0.85rem;font-weight:800;">${fmt(totalInc)}</td>
                <td style="padding:10px 12px;color:#f87171;font-size:0.85rem;font-weight:800;">${fmt(totalExp)}</td>
                <td style="padding:10px 12px;color:${totalInc - totalExp >= 0 ? '#38bdf8' : '#f87171'};font-size:0.85rem;font-weight:800;">${fmt(totalInc - totalExp)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`}
      </div>
    `;
  }

  /* ─── INVESTMENTS TAB ───────────────────────────────────── */
  function renderInvestmentsHTML() {
    const store = getStore();
    const investments = store[INVEST_KEY] || [];
    const active = investments.filter(i => i.status === "Active");
    const completed = investments.filter(i => i.status !== "Active");
    const totalActive = active.reduce((s, i) => s + Number(i.amount), 0);
    const totalReturns = active.reduce((s, i) => s + (Number(i.amount) * Number(i.expectedReturn) / 100), 0);

    const tabItems = financeState.investTab === "active" ? active : completed;

    const cards = tabItems.map(inv => `
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:18px;position:relative;">
        <div style="position:absolute;top:14px;right:14px;">
          <span style="background:${inv.status === "Active" ? "#166534" : "#7c3aed"};color:${inv.status === "Active" ? "#4ade80" : "#e9d5ff"};padding:3px 10px;border-radius:20px;font-size:0.68rem;font-weight:700;">${inv.status}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(167,139,250,0.2);display:flex;align-items:center;justify-content:center;font-size:1.2rem;">
            ${inv.category === "Fixed Deposit" ? "🏦" : inv.category === "Recurring Deposit" ? "🔄" : inv.category === "Infrastructure" ? "🏗️" : inv.category === "Technology" ? "💻" : "📚"}
          </div>
          <div>
            <div style="font-size:0.9rem;font-weight:700;color:#fff;">${inv.title}</div>
            <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);">${inv.category} · ${inv.bank || ""}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;">
            <div style="font-size:1rem;font-weight:800;color:#a78bfa;">${fmt(inv.amount)}</div>
            <div style="font-size:0.68rem;color:rgba(255,255,255,0.4);">Amount Invested</div>
          </div>
          ${inv.expectedReturn > 0 ? `
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;">
            <div style="font-size:1rem;font-weight:800;color:#4ade80;">${inv.expectedReturn}% p.a.</div>
            <div style="font-size:0.68rem;color:rgba(255,255,255,0.4);">Expected Return</div>
          </div>` : `
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;">
            <div style="font-size:1rem;font-weight:800;color:#fb923c;">Capital Use</div>
            <div style="font-size:0.68rem;color:rgba(255,255,255,0.4);">Purpose-based</div>
          </div>`}
        </div>
        ${inv.startDate ? `<div style="font-size:0.72rem;color:rgba(255,255,255,0.4);margin-bottom:4px;">📅 ${inv.startDate}${inv.maturityDate ? ` → ${inv.maturityDate}` : ""}</div>` : ""}
        ${inv.notes ? `<div style="font-size:0.75rem;color:rgba(255,255,255,0.55);background:rgba(255,255,255,0.05);border-radius:7px;padding:8px 10px;margin-top:8px;">${inv.notes}</div>` : ""}
        ${isAdmin() ? `
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button data-invest-delete="${inv.id}" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.2);border-radius:7px;padding:5px 12px;font-size:0.72rem;cursor:pointer;">Delete</button>
          <button data-invest-toggle="${inv.id}" style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);border:none;border-radius:7px;padding:5px 12px;font-size:0.72rem;cursor:pointer;">${inv.status === "Active" ? "Mark Complete" : "Reactivate"}</button>
        </div>` : ""}
      </div>
    `).join("");

    const addForm = isAdmin() ? `
      <!-- Add Investment Form -->
      <div style="${panelStyle}margin-bottom:20px;">
        <div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:16px;">➕ Add New Investment</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
          <div>
            <label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Title *</label>
            <input id="inv_title" placeholder="e.g. SBI Fixed Deposit" style="${fieldStyle}" />
          </div>
          <div>
            <label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Category *</label>
            <select id="inv_category" style="${fieldStyle}">
              <option>Fixed Deposit</option>
              <option>Recurring Deposit</option>
              <option>Infrastructure</option>
              <option>Technology</option>
              <option>Education</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Amount (₹) *</label>
            <input id="inv_amount" type="number" placeholder="500000" style="${fieldStyle}" />
          </div>
          <div>
            <label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Expected Return (%/yr)</label>
            <input id="inv_return" type="number" placeholder="7.5" style="${fieldStyle}" />
          </div>
          <div>
            <label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Bank / Source</label>
            <input id="inv_bank" placeholder="State Bank of India" style="${fieldStyle}" />
          </div>
          <div>
            <label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Start Date</label>
            <input id="inv_start" type="date" value="${todayStr()}" style="${fieldStyle}" />
          </div>
          <div>
            <label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Maturity Date</label>
            <input id="inv_maturity" type="date" style="${fieldStyle}" />
          </div>
          <div>
            <label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Notes</label>
            <input id="inv_notes" placeholder="Purpose / remarks" style="${fieldStyle}" />
          </div>
        </div>
        <div style="margin-top:14px;">
          <button id="inv_save" style="${btnStyle("blue")}">💾 Save Investment</button>
        </div>
      </div>
    ` : "";

    return `
      <!-- Summary -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px;">
        ${kpiCard("Total Active Invested", totalActive, "💼", "#a78bfa", `${active.length} active investments`)}
        ${kpiCard("Expected Annual Returns", totalReturns, "📈", "#4ade80", "From FD & RD instruments")}
        ${kpiCard("Completed Investments", completed.length, "✅", "#38bdf8", `${completed.reduce((s, i) => s + Number(i.amount), 0).toLocaleString("en-IN")} total value`)}
      </div>

      ${addForm}

      <!-- Tabs -->
      <div style="display:flex;gap:4px;margin-bottom:16px;">
        <button data-invest-tab="active" style="background:${financeState.investTab === "active" ? "#3b82f6" : "rgba(255,255,255,0.08)"};color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:0.8rem;font-weight:600;cursor:pointer;">Active (${active.length})</button>
        <button data-invest-tab="completed" style="background:${financeState.investTab === "completed" ? "#3b82f6" : "rgba(255,255,255,0.08)"};color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:0.8rem;font-weight:600;cursor:pointer;">Completed (${completed.length})</button>
      </div>

      <!-- Cards grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;">
        ${cards || `<div style="color:rgba(255,255,255,0.3);padding:30px;text-align:center;grid-column:1/-1;">No ${financeState.investTab} investments found. Add one above!</div>`}
      </div>
    `;
  }

  const fieldStyle = `width:100%;box-sizing:border-box;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#fff;padding:8px 12px;font-size:0.82rem;outline:none;`;

  /* ─── INCOME TAB ────────────────────────────────────────── */
  function renderIncomeHTML() {
    const store = getStore();
    let list = (store[INCOME_KEY] || []).filter(r => (!financeState.dateFrom || r.date >= financeState.dateFrom) && (!financeState.dateTo || r.date <= financeState.dateTo));
    list = list.slice().sort((a, b) => b.date.localeCompare(a.date));
    const total = list.reduce((s, r) => s + Number(r.amount), 0);

    const rows = list.map(r => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:10px 12px;color:rgba(255,255,255,0.7);font-size:0.78rem;">${r.date}</td>
        <td style="padding:10px 12px;color:rgba(255,255,255,0.85);font-size:0.78rem;">${r.source || ""}</td>
        <td style="padding:10px 12px;font-size:0.75rem;"><span style="background:rgba(56,189,248,0.15);color:#38bdf8;padding:2px 8px;border-radius:20px;">${r.category || "Other"}</span></td>
        <td style="padding:10px 12px;color:#4ade80;font-size:0.82rem;font-weight:700;">${fmt(r.amount)}</td>
        <td style="padding:10px 12px;color:rgba(255,255,255,0.4);font-size:0.75rem;">${r.mode || ""}</td>
        ${isAdmin() ? `<td style="padding:6px 12px;"><button data-income-delete="${r.id}" style="background:rgba(239,68,68,0.1);color:#f87171;border:none;border-radius:6px;padding:4px 10px;font-size:0.7rem;cursor:pointer;">Del</button></td>` : "<td></td>"}
      </tr>
    `).join("");

    const addForm = isAdmin() ? `
      <div style="${panelStyle}margin-bottom:20px;">
        <div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:16px;">➕ Add Income Record</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Date *</label><input id="inc_date" type="date" value="${todayStr()}" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Source *</label><input id="inc_source" placeholder="Fee Collection / Donation..." style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Category</label>
            <select id="inc_category" style="${fieldStyle}"><option>Fees</option><option>Transport</option><option>Hostel</option><option>Exams</option><option>Donation</option><option>Grant</option><option>Other</option></select>
          </div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Amount (₹) *</label><input id="inc_amount" type="number" placeholder="50000" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Mode</label>
            <select id="inc_mode" style="${fieldStyle}"><option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Cheque</option><option>Mixed</option></select>
          </div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Description</label><input id="inc_desc" placeholder="Brief note" style="${fieldStyle}" /></div>
        </div>
        <div style="margin-top:14px;"><button id="inc_save" style="${btnStyle("green")}">💾 Save Income</button></div>
      </div>
    ` : "";

    return `
      <!-- Filter -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;flex-wrap:wrap;align-items:center;gap:12px;">
        <span style="color:rgba(255,255,255,0.6);font-size:0.8rem;font-weight:600;">📅 Filter:</span>
        ${quickFilterBtn("thisMonth", "This Month")}
        ${quickFilterBtn("thisQuarter", "This Quarter")}
        ${quickFilterBtn("thisYear", "This Year")}
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">From <input type="date" id="fi_from" value="${financeState.dateFrom}" style="${inputStyle}" /></label>
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">To <input type="date" id="fi_to" value="${financeState.dateTo}" style="${inputStyle}" /></label>
        <button id="fi_applyRange" style="${btnStyle("blue")}">Apply</button>
        <button id="fi_exportInc" style="${btnStyle("green")}">⬇ Export CSV</button>
      </div>
      <div style="margin-bottom:16px;">
        <span style="background:rgba(74,222,128,0.15);color:#4ade80;border-radius:8px;padding:8px 16px;font-size:0.9rem;font-weight:800;">${fmt(total)} total from ${list.length} records</span>
      </div>
      ${addForm}
      <div style="${panelStyle}">
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">DATE</th>
                <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">SOURCE</th>
                <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">CATEGORY</th>
                <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:#4ade80;">AMOUNT</th>
                <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">MODE</th>
                <th></th>
              </tr>
            </thead>
            <tbody>${rows || `<tr><td colspan="6" style="padding:30px;text-align:center;color:rgba(255,255,255,0.3);">No income records in this period</td></tr>`}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ─── EXPENSES TAB ──────────────────────────────────────── */
  function renderExpensesHTML() {
    const store = getStore();
    let list = (store[EXPENSE_KEY] || []).filter(r => (!financeState.dateFrom || r.date >= financeState.dateFrom) && (!financeState.dateTo || r.date <= financeState.dateTo));
    list = list.slice().sort((a, b) => b.date.localeCompare(a.date));
    const total = list.reduce((s, r) => s + Number(r.amount), 0);

    const catTotals = {};
    list.forEach(r => { catTotals[r.category || "Other"] = (catTotals[r.category || "Other"] || 0) + Number(r.amount); });
    const catMax = Math.max(...Object.values(catTotals), 1);
    const colors = ["#f87171", "#fb923c", "#fbbf24", "#a78bfa", "#38bdf8", "#4ade80", "#f472b6"];
    const catBars = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, amt], i) => `
      <div style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
          <span style="color:rgba(255,255,255,0.75);font-size:0.78rem;">${cat}</span>
          <span style="color:${colors[i % colors.length]};font-size:0.78rem;font-weight:700;">${fmtK(amt)}</span>
        </div>
        <div style="background:rgba(255,255,255,0.08);border-radius:4px;height:6px;">
          <div style="background:${colors[i % colors.length]};width:${(amt / catMax * 100).toFixed(1)}%;height:100%;border-radius:4px;"></div>
        </div>
      </div>
    `).join("");

    const rows = list.map(r => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:10px 12px;color:rgba(255,255,255,0.7);font-size:0.78rem;">${r.date}</td>
        <td style="padding:10px 12px;color:rgba(255,255,255,0.85);font-size:0.78rem;">${r.head || ""}</td>
        <td style="padding:10px 12px;font-size:0.75rem;"><span style="background:rgba(248,113,113,0.15);color:#f87171;padding:2px 8px;border-radius:20px;">${r.category || "Other"}</span></td>
        <td style="padding:10px 12px;color:#f87171;font-size:0.82rem;font-weight:700;">${fmt(r.amount)}</td>
        <td style="padding:10px 12px;color:rgba(255,255,255,0.4);font-size:0.75rem;">${r.mode || ""}</td>
        ${isAdmin() ? `<td style="padding:6px 12px;"><button data-exp-delete="${r.id}" style="background:rgba(239,68,68,0.1);color:#f87171;border:none;border-radius:6px;padding:4px 10px;font-size:0.7rem;cursor:pointer;">Del</button></td>` : "<td></td>"}
      </tr>
    `).join("");

    const addForm = isAdmin() ? `
      <div style="${panelStyle}margin-bottom:20px;">
        <div style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;margin-bottom:16px;">➕ Add Expense Record</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Date *</label><input id="exp_date" type="date" value="${todayStr()}" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Head *</label><input id="exp_head" placeholder="Salary / Maintenance..." style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Category</label>
            <select id="exp_category" style="${fieldStyle}"><option>Payroll</option><option>Utilities</option><option>Supplies</option><option>Maintenance</option><option>Infrastructure</option><option>Transport</option><option>Other</option></select>
          </div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Amount (₹) *</label><input id="exp_amount" type="number" placeholder="25000" style="${fieldStyle}" /></div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Mode</label>
            <select id="exp_mode" style="${fieldStyle}"><option>Cash</option><option>Bank Transfer</option><option>UPI</option><option>Cheque</option><option>Online</option></select>
          </div>
          <div><label style="color:rgba(255,255,255,0.5);font-size:0.72rem;display:block;margin-bottom:4px;">Description</label><input id="exp_desc" placeholder="Brief note" style="${fieldStyle}" /></div>
        </div>
        <div style="margin-top:14px;"><button id="exp_save" style="${btnStyle("red")}">💾 Save Expense</button></div>
      </div>
    ` : "";

    return `
      <!-- Filter -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;flex-wrap:wrap;align-items:center;gap:12px;">
        <span style="color:rgba(255,255,255,0.6);font-size:0.8rem;font-weight:600;">📅 Filter:</span>
        ${quickFilterBtn("thisMonth", "This Month")}
        ${quickFilterBtn("thisQuarter", "This Quarter")}
        ${quickFilterBtn("thisYear", "This Year")}
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">From <input type="date" id="fi_from" value="${financeState.dateFrom}" style="${inputStyle}" /></label>
        <label style="color:rgba(255,255,255,0.6);font-size:0.75rem;">To <input type="date" id="fi_to" value="${financeState.dateTo}" style="${inputStyle}" /></label>
        <button id="fi_applyRange" style="${btnStyle("blue")}">Apply</button>
        <button id="fi_exportExp" style="${btnStyle("amber")}">⬇ Export CSV</button>
      </div>

      <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:20px;">
        <div style="margin-bottom:0;"><span style="background:rgba(248,113,113,0.15);color:#f87171;border-radius:8px;padding:8px 16px;font-size:0.9rem;font-weight:800;">${fmt(total)} total from ${list.length} records</span></div>
        <div style="${panelStyle}padding:14px;">
          <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:10px;">By Category</div>
          ${catBars || '<div style="color:rgba(255,255,255,0.3);font-size:0.8rem;">No data</div>'}
        </div>
      </div>

      ${addForm}

      <div style="${panelStyle}">
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">DATE</th>
                <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">HEAD</th>
                <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">CATEGORY</th>
                <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:#f87171;">AMOUNT</th>
                <th style="padding:10px 12px;text-align:left;font-size:0.7rem;color:rgba(255,255,255,0.4);">MODE</th>
                <th></th>
              </tr>
            </thead>
            <tbody>${rows || `<tr><td colspan="6" style="padding:30px;text-align:center;color:rgba(255,255,255,0.3);">No expense records in this period</td></tr>`}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ─── BIND EVENTS ───────────────────────────────────────── */
  function applyQuickFilter(key) {
    financeState.dayFilter = key;
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    if (key === "today") { financeState.dateFrom = financeState.dateTo = todayStr(); }
    else if (key === "thisWeek") { const s = new Date(now); s.setDate(d - s.getDay()); financeState.dateFrom = s.toISOString().slice(0, 10); financeState.dateTo = todayStr(); }
    else if (key === "thisMonth") { financeState.dateFrom = `${y}-${String(m + 1).padStart(2, "0")}-01`; financeState.dateTo = todayStr(); }
    else if (key === "thisQuarter") { const qm = Math.floor(m / 3) * 3; financeState.dateFrom = `${y}-${String(qm + 1).padStart(2, "0")}-01`; financeState.dateTo = todayStr(); }
    else if (key === "thisYear") { financeState.dateFrom = `${y}-04-01`; financeState.dateTo = todayStr(); }
    else if (key === "allTime") { financeState.dateFrom = "2020-01-01"; financeState.dateTo = todayStr(); }
  }

  function exportCSV(rows, filename) {
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(","), ...rows.map(r => keys.map(k => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function bindContentEvents(content) {
    // Quick filters
    content.querySelectorAll("[data-qf]").forEach(btn => {
      btn.addEventListener("click", () => {
        applyQuickFilter(btn.dataset.qf);
        renderFinanceContent();
      });
    });

    // Date range apply
    const applyBtn = content.querySelector("#fi_applyRange");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        financeState.dateFrom = content.querySelector("#fi_from")?.value || financeState.dateFrom;
        financeState.dateTo = content.querySelector("#fi_to")?.value || financeState.dateTo;
        financeState.dayFilter = "custom";
        renderFinanceContent();
      });
    }

    // Export CSV – day-wise
    content.querySelector("#fi_exportDW")?.addEventListener("click", () => {
      exportCSV(getDayWise(financeState.dateFrom, financeState.dateTo), `daywise-${financeState.dateFrom}-to-${financeState.dateTo}.csv`);
    });
    // Export income
    content.querySelector("#fi_exportInc")?.addEventListener("click", () => {
      const list = (getStore()[INCOME_KEY] || []).filter(r => r.date >= financeState.dateFrom && r.date <= financeState.dateTo);
      exportCSV(list, `income-${financeState.dateFrom}-to-${financeState.dateTo}.csv`);
    });
    // Export expense
    content.querySelector("#fi_exportExp")?.addEventListener("click", () => {
      const list = (getStore()[EXPENSE_KEY] || []).filter(r => r.date >= financeState.dateFrom && r.date <= financeState.dateTo);
      exportCSV(list, `expenses-${financeState.dateFrom}-to-${financeState.dateTo}.csv`);
    });

    // Investment tab switch
    content.querySelectorAll("[data-invest-tab]").forEach(btn => {
      btn.addEventListener("click", () => { financeState.investTab = btn.dataset.investTab; renderFinanceContent(); });
    });

    // Delete investment
    content.querySelectorAll("[data-invest-delete]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.investDelete);
        serverStore[INVEST_KEY] = (serverStore[INVEST_KEY] || []).filter(i => i.id !== id);
        renderFinanceContent();
        injectDashboardCard();
      });
    });

    // Toggle investment status
    content.querySelectorAll("[data-invest-toggle]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.investToggle);
        const inv = (serverStore[INVEST_KEY] || []).find(i => i.id === id);
        if (inv) inv.status = inv.status === "Active" ? "Completed" : "Active";
        renderFinanceContent();
        injectDashboardCard();
      });
    });

    // Save investment
    content.querySelector("#inv_save")?.addEventListener("click", () => {
      const title = content.querySelector("#inv_title")?.value?.trim();
      const amount = Number(content.querySelector("#inv_amount")?.value);
      if (!title || !amount) return alert("Title and Amount are required.");
      if (!serverStore[INVEST_KEY]) serverStore[INVEST_KEY] = [];
      const newId = Math.max(0, ...(serverStore[INVEST_KEY].map(i => i.id))) + 1;
      serverStore[INVEST_KEY].push({
        id: newId,
        title,
        category: content.querySelector("#inv_category")?.value,
        amount,
        expectedReturn: Number(content.querySelector("#inv_return")?.value) || 0,
        bank: content.querySelector("#inv_bank")?.value || "",
        startDate: content.querySelector("#inv_start")?.value || todayStr(),
        maturityDate: content.querySelector("#inv_maturity")?.value || "",
        notes: content.querySelector("#inv_notes")?.value || "",
        status: "Active",
      });
      renderFinanceContent();
      injectDashboardCard();
    });

    // Delete income
    content.querySelectorAll("[data-income-delete]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.incomeDelete);
        serverStore[INCOME_KEY] = (serverStore[INCOME_KEY] || []).filter(r => r.id !== id);
        renderFinanceContent();
        injectDashboardCard();
      });
    });

    // Save income
    content.querySelector("#inc_save")?.addEventListener("click", () => {
      const source = content.querySelector("#inc_source")?.value?.trim();
      const amount = Number(content.querySelector("#inc_amount")?.value);
      if (!source || !amount) return alert("Source and Amount are required.");
      if (!serverStore[INCOME_KEY]) serverStore[INCOME_KEY] = [];
      const newId = Math.max(0, ...(serverStore[INCOME_KEY].map(r => r.id))) + 1;
      serverStore[INCOME_KEY].push({
        id: newId,
        date: content.querySelector("#inc_date")?.value || todayStr(),
        source,
        category: content.querySelector("#inc_category")?.value,
        amount,
        mode: content.querySelector("#inc_mode")?.value,
        description: content.querySelector("#inc_desc")?.value || "",
      });
      renderFinanceContent();
      injectDashboardCard();
    });

    // Delete expense
    content.querySelectorAll("[data-exp-delete]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.expDelete);
        serverStore[EXPENSE_KEY] = (serverStore[EXPENSE_KEY] || []).filter(r => r.id !== id);
        renderFinanceContent();
        injectDashboardCard();
      });
    });

    // Save expense
    content.querySelector("#exp_save")?.addEventListener("click", () => {
      const head = content.querySelector("#exp_head")?.value?.trim();
      const amount = Number(content.querySelector("#exp_amount")?.value);
      if (!head || !amount) return alert("Head and Amount are required.");
      if (!serverStore[EXPENSE_KEY]) serverStore[EXPENSE_KEY] = [];
      const newId = Math.max(0, ...(serverStore[EXPENSE_KEY].map(r => r.id))) + 1;
      serverStore[EXPENSE_KEY].push({
        id: newId,
        date: content.querySelector("#exp_date")?.value || todayStr(),
        head,
        category: content.querySelector("#exp_category")?.value,
        amount,
        mode: content.querySelector("#exp_mode")?.value,
        description: content.querySelector("#exp_desc")?.value || "",
      });
      renderFinanceContent();
      injectDashboardCard();
    });
  }

  /* ─── INJECT "Finance" NAV ITEM ─────────────────────────── */
  function injectFinanceNavItem() {
    const nav = document.getElementById("moduleNav");
    if (!nav) return;
    if (nav.querySelector("[data-module='financeModule']")) return; // already added

    // Add a divider + Finance button
    const divider = document.createElement("div");
    divider.className = "nav-group-label";
    divider.textContent = "Finance";
    divider.style.cssText = "padding:8px 16px;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.3);margin-top:6px;";

    const btn = document.createElement("button");
    btn.dataset.module = "financeModule";
    btn.style.cssText = "display:flex;align-items:center;gap:10px;width:100%;padding:10px 16px;background:none;border:none;color:rgba(255,255,255,0.75);cursor:pointer;font-size:0.85rem;border-radius:8px;text-align:left;";
    btn.innerHTML = `<span style="font-size:1.1rem;">💰</span><span>Finance & Investment</span>`;
    btn.addEventListener("click", () => openFinanceModule());

    nav.appendChild(divider);
    nav.appendChild(btn);
  }

  /* ─── PATCH renderAll & renderStatCardsEnhanced ─────────── */
  const _origRenderAll = typeof renderAll === "function" ? renderAll : null;
  window.renderAll = function () {
    if (_origRenderAll) _origRenderAll();
    setTimeout(() => {
      injectDashboardCard();
      injectFinanceNavItem();
    }, 80);
  };

  // Also patch stat card render to inject balance card
  const _origRSCE = typeof renderStatCardsEnhanced === "function" ? renderStatCardsEnhanced : null;
  window.renderStatCardsEnhanced = function (store) {
    if (_origRSCE) _origRSCE(store);
    setTimeout(injectDashboardCard, 80);
  };

  /* ─── INIT ──────────────────────────────────────────────── */
  function init() {
    seedDemoData();
    // Inject on first load after a short delay (wait for existing app to render)
    setTimeout(() => {
      injectDashboardCard();
      injectFinanceNavItem();
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
