/**
 * nav.js — Sidebar Navigation Component
 * Renders the same sidebar from core.php's renderMenu() as pure HTML/JS
 */

function renderMenu(activePage) {
    const isActive = (page) => activePage === page ? 'active' : '';

    const sidebarHTML = `
    <!-- FONTS + ICONS -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">

    <style>
    :root {
      --sb-w: 264px; --sb-mini-w: 74px; --sb-bg: #ffffff; --sb-border: #ede9fe;
      --v900: #1e0a5e; --v800: #2e1065; --v700: #4c1d95; --v600: #6d28d9; --v500: #7c3aed;
      --v400: #8b5cf6; --v300: #a78bfa; --v200: #c4b5fd; --v100: #ede9fe; --v50: #f5f3ff;
      --gold: #c9973a; --gold-lt: #f0c060;
      --gray-50: #f8fafc; --gray-100: #f1f5f9; --gray-200: #e2e8f0; --gray-400: #94a3b8;
      --gray-500: #64748b; --gray-700: #334155; --gray-900: #0f172a;
      --text-nav: #4b5563; --text-active: #ffffff;
      --transition: 0.28s cubic-bezier(.4,0,.2,1);
      --shadow-sidebar: 4px 0 32px rgba(109,40,217,.10), 1px 0 0 var(--sb-border);
      --shadow-item: 0 4px 16px rgba(109,40,217,.22);
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 0;
      padding-left: var(--sb-w); transition: padding-left var(--transition); background: var(--gray-50);
    }
    body.sb-mini { padding-left: var(--sb-mini-w); }
    .erp-sidebar {
      position: fixed; top: 0; left: 0; bottom: 0; width: var(--sb-w); background: var(--sb-bg);
      box-shadow: var(--shadow-sidebar); display: flex; flex-direction: column; z-index: 1050;
      transition: width var(--transition), transform var(--transition); overflow: hidden;
    }
    .erp-sidebar.mini { width: var(--sb-mini-w); }
    .sb-brand {
      display: flex; align-items: center; gap: 12px; padding: 20px 18px 16px;
      border-bottom: 1px solid var(--v100); flex-shrink: 0; min-height: 74px; position: relative;
      background: linear-gradient(135deg, var(--v700) 0%, var(--v500) 100%); overflow: hidden;
    }
    .sb-brand::before { content:''; position:absolute; top:-30px; right:-30px; width:100px; height:100px; background:rgba(255,255,255,0.07); border-radius:50%; pointer-events:none; }
    .sb-brand::after { content:''; position:absolute; bottom:-20px; left:40px; width:70px; height:70px; background:rgba(255,255,255,0.05); border-radius:50%; pointer-events:none; }
    .sb-logo-wrap {
      flex-shrink:0; width:38px; height:38px; background:rgba(255,255,255,0.18);
      border:1.5px solid rgba(255,255,255,0.30); border-radius:10px; display:flex;
      align-items:center; justify-content:center; backdrop-filter:blur(8px); overflow:hidden;
    }
    .sb-logo-wrap img { width:28px; height:28px; object-fit:contain; }
    .sb-brand-text { flex:1; min-width:0; opacity:1; transition: opacity var(--transition); overflow:hidden; }
    .sb-brand-name { display:block; font-size:0.82rem; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2; letter-spacing:-0.2px; }
    .sb-brand-sub { display:block; font-size:0.63rem; color:rgba(255,255,255,0.65); text-transform:uppercase; letter-spacing:0.9px; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sb-collapse-btn {
      position:absolute; right:-13px; top:50%; transform:translateY(-50%); width:26px; height:26px;
      background:var(--sb-bg); border:1.5px solid var(--v200); border-radius:50%;
      display:flex; align-items:center; justify-content:center; cursor:pointer;
      color:var(--v600); font-size:10px; z-index:10; box-shadow:0 2px 8px rgba(109,40,217,.20);
      transition: background .2s, color .2s, transform .2s;
    }
    .sb-collapse-btn:hover { background:var(--v600); color:#fff; border-color:var(--v600); }
    .erp-sidebar.mini .sb-collapse-btn { transform: translateY(-50%) rotate(180deg); right:-13px; }
    .sb-scroll { flex:1; overflow-y:auto; overflow-x:hidden; padding:10px 10px 20px; }
    .sb-scroll::-webkit-scrollbar { width:3px; }
    .sb-scroll::-webkit-scrollbar-thumb { background:var(--v200); border-radius:3px; }
    .sb-group-label { font-size:0.60rem; font-weight:700; text-transform:uppercase; letter-spacing:1.4px; color:var(--v400); padding:16px 10px 6px; white-space:nowrap; overflow:hidden; transition: opacity var(--transition); }
    .erp-sidebar.mini .sb-group-label { opacity:0; height:0; padding:0; }
    .sb-divider { height:1px; background:linear-gradient(90deg, var(--v100), transparent); margin:4px 6px 8px; }
    .sb-item {
      display:flex; align-items:center; gap:12px; padding:11px 12px; border-radius:12px; margin-bottom:2px;
      text-decoration:none; color:var(--text-nav); font-size:0.875rem; font-weight:500; position:relative;
      transition: background var(--transition), color var(--transition), box-shadow var(--transition), transform .15s;
      white-space:nowrap; overflow:hidden;
    }
    .sb-item:hover { background:var(--v50); color:var(--v600); text-decoration:none; transform:translateX(2px); }
    .sb-item.active {
      background:linear-gradient(135deg, var(--v700) 0%, var(--v500) 100%);
      color:var(--text-active); box-shadow:var(--shadow-item); font-weight:600; transform:none;
    }
    .sb-item.active .sb-icon { color:#fff; background:rgba(255,255,255,0.18); }
    .sb-item.active::after {
      content:''; position:absolute; left:0; top:20%; bottom:20%; width:3px;
      background:rgba(255,255,255,0.6); border-radius:0 3px 3px 0;
    }
    .sb-icon {
      flex-shrink:0; width:34px; height:34px; border-radius:9px; display:flex; align-items:center;
      justify-content:center; font-size:14px; background:var(--v50); color:var(--v600);
      transition: background var(--transition), color var(--transition);
    }
    .sb-item:hover .sb-icon { background:var(--v100); color:var(--v700); }
    .sb-label { flex:1; opacity:1; transition: opacity var(--transition); overflow:hidden; text-overflow:ellipsis; }
    .erp-sidebar.mini .sb-label { opacity:0; width:0; }
    .sb-tooltip {
      position:absolute; left:calc(var(--sb-mini-w) - 4px); top:50%; transform:translateY(-50%);
      background:var(--v800); color:#fff; font-size:0.75rem; font-weight:600; padding:6px 12px;
      border-radius:8px; white-space:nowrap; pointer-events:none; opacity:0; transition:opacity .18s;
      z-index:999; box-shadow:0 4px 14px rgba(0,0,0,.25);
    }
    .sb-tooltip::before { content:''; position:absolute; left:-5px; top:50%; transform:translateY(-50%); border:5px solid transparent; border-right-color:var(--v800); border-left:none; }
    .erp-sidebar.mini .sb-item:hover .sb-tooltip { opacity:1; }
    .sb-footer { flex-shrink:0; padding:12px 14px; border-top:1px solid var(--v100); background:var(--v50); opacity:1; transition:opacity var(--transition); }
    .erp-sidebar.mini .sb-footer { opacity:0; pointer-events:none; height:0; padding:0; overflow:hidden; }
    .sb-footer-inner { display:flex; align-items:center; gap:10px; }
    .sb-avatar { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg, var(--v600), var(--v400)); display:flex; align-items:center; justify-content:center; font-size:13px; color:#fff; font-weight:700; flex-shrink:0; border:2px solid var(--v200); }
    .sb-footer-name { font-size:0.80rem; font-weight:700; color:var(--gray-900); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sb-footer-role { font-size:0.65rem; color:var(--v500); text-transform:uppercase; letter-spacing:0.6px; font-weight:600; }

    .erp-credit-footer {
      position:fixed; bottom:0; left:var(--sb-w); right:0; z-index:900;
      background:linear-gradient(90deg, #130638 0%, #250954 50%, #3b0764 100%);
      color:rgba(255,255,255,0.92); font-family:'Inter',system-ui,sans-serif; font-size:0.72rem;
      padding:7px 18px; display:flex; align-items:center; justify-content:center; gap:8px 16px;
      flex-wrap:wrap; text-align:center; border-top:1px solid rgba(167,139,250,0.25);
      box-shadow:0 -3px 18px rgba(0,0,0,0.28); transition:left 0.28s cubic-bezier(.4,0,.2,1); line-height:1.45;
    }
    body.sb-mini .erp-credit-footer { left: var(--sb-mini-w); }
    .erp-credit-footer .cred-segment { display:inline-flex; align-items:center; gap:6px; flex-wrap:wrap; justify-content:center; }
    .erp-credit-footer .cred-tag { font-weight:700; color:#e9d5ff; letter-spacing:0.2px; display:inline-flex; align-items:center; gap:5px; }
    .erp-credit-footer .cred-tag i { color:#c084fc; font-size:0.75rem; }
    .erp-credit-footer .cred-tag-guide i { color:#38bdf8; font-size:0.75rem; }
    .erp-credit-footer .cred-batch { font-weight:600; color:#f1f5f9; }
    .erp-credit-footer .cred-students { display:inline-flex; align-items:center; gap:4px; flex-wrap:wrap; }
    .erp-credit-footer .cred-name { font-weight:700; color:#fde047; letter-spacing:0.1px; }
    .erp-credit-footer .cred-sep { opacity:0.35; color:#fff; font-weight:300; }
    .erp-credit-footer .cred-guides { display:inline-flex; align-items:center; gap:6px; flex-wrap:wrap; }
    .erp-credit-footer .cred-guide { font-weight:700; color:#67e8f9; letter-spacing:0.1px; }
    .erp-credit-footer .cred-role { font-weight:500; color:#cbd5e1; font-size:0.67rem; }
    .erp-credit-footer .cred-amp { opacity:0.65; color:#fff; font-weight:400; }
    .main-wrap, .container, .container-fluid, .dash-content, .page-wrap, .erp-shell { padding-bottom: 64px !important; }

    @media (max-width: 1024px) {
      body { padding-left: 0 !important; padding-top: 0 !important; display: flex; flex-direction: column; }
      .erp-sidebar {
        position: static !important; width: 100% !important; height: auto !important;
        flex-direction: column; box-shadow: 0 4px 15px rgba(109,40,217,.10);
        z-index: 1050; transform: none !important;
      }
      .sb-brand { min-height: 60px; padding: 12px 16px; }
      .sb-collapse-btn { display: none; }
      .sb-scroll { display: flex; flex-direction: row; overflow-x: auto; overflow-y: hidden; padding: 10px; gap: 10px; }
      .sb-group-label, .sb-divider { display: none; }
      .sb-item { margin-bottom: 0; flex-shrink: 0; }
      .erp-credit-footer { left: 0; font-size: 0.65rem; padding: 6px 10px; }
    }
    @media print {
      body { padding: 0 !important; margin: 0 !important; background: #fff !important; }
      .erp-sidebar, .erp-credit-footer, .no-print { display: none !important; }
      .main-wrap, .page-wrap, .container, .container-fluid, .dash-content, .erp-shell { padding: 0 !important; margin: 0 !important; max-width: 100% !important; padding-bottom: 0 !important; }
    }
    </style>

    <aside class="erp-sidebar" id="erpSidebar">
      <div class="sb-brand">
        <div class="sb-logo-wrap">
          <img src="https://res.cloudinary.com/de1tywvqm/image/upload/v1758813951/logo_eq52wb.png" alt="Grace Logo" onerror="this.style.display='none'">
        </div>
        <div class="sb-brand-text">
          <span class="sb-brand-name">Grace College ERP</span>
          <span class="sb-brand-sub">Exam Seating · Centre 9503</span>
        </div>
        <button class="sb-collapse-btn" id="sbCollapseBtn" title="Collapse sidebar">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
      </div>

      <div class="sb-scroll">
        <div class="sb-group-label">Main</div>
        <a href="index.html" class="sb-item ${isActive('index.html')}">
          <span class="sb-icon"><i class="fa-solid fa-house"></i></span>
          <span class="sb-label">Dashboard</span>
          <span class="sb-tooltip">Dashboard</span>
        </a>

        <div class="sb-divider"></div>
        <div class="sb-group-label">Seat Planning</div>
        <a href="allocation.html" class="sb-item ${isActive('allocation.html')}">
          <span class="sb-icon"><i class="fa-solid fa-chair"></i></span>
          <span class="sb-label">Seat Allocation</span>
          <span class="sb-tooltip">Seat Allocation</span>
        </a>
        <a href="management.html" class="sb-item ${isActive('management.html')}">
          <span class="sb-icon"><i class="fa-solid fa-building-columns"></i></span>
          <span class="sb-label">Hall Management</span>
          <span class="sb-tooltip">Hall Management</span>
        </a>

        <div class="sb-divider"></div>
        <div class="sb-group-label">Students</div>
        <a href="students.html" class="sb-item ${isActive('students.html')}">
          <span class="sb-icon"><i class="fa-solid fa-users"></i></span>
          <span class="sb-label">Manage Students</span>
          <span class="sb-tooltip">Manage Students</span>
        </a>

        <div class="sb-divider"></div>
        <div class="sb-group-label">Reports</div>
        <a href="reports.html" class="sb-item ${isActive('reports.html')}">
          <span class="sb-icon"><i class="fa-solid fa-file-lines"></i></span>
          <span class="sb-label">Question Paper Need</span>
          <span class="sb-tooltip">Question Paper Need</span>
        </a>
      </div>

      <div class="sb-footer">
        <div class="sb-footer-inner">
          <div class="sb-avatar"><i class="fa-solid fa-user-tie" style="font-size:14px;"></i></div>
          <div>
            <div class="sb-footer-name">Admin User</div>
            <div class="sb-footer-role">ERP Administrator</div>
          </div>
        </div>
      </div>
    </aside>

    <div class="erp-credit-footer" id="erpCreditFooter">
      <div class="cred-segment">
        <span class="cred-tag"><i class="fa-solid fa-code"></i> Developed by:</span>
        <span class="cred-batch">B.Tech Artificial Intelligence &amp; Data Science (2023–2027 Batch) &mdash;</span>
        <span class="cred-students">
          <span class="cred-name">R. Mohanprashad</span>,
          <span class="cred-name">M. Harish Kumar</span>,
          <span class="cred-name">A. Sherwin</span>
        </span>
      </div>
      <span class="cred-sep">|</span>
      <div class="cred-segment">
        <span class="cred-tag cred-tag-guide"><i class="fa-solid fa-chalkboard-user"></i> Under Guidance of:</span>
        <span class="cred-guides">
          <span class="cred-guide">Mrs. R. Janani <span class="cred-role">(AP / AI&amp;DS)</span></span>
        </span>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // Sidebar collapse logic
    const sidebar = document.getElementById('erpSidebar');
    const collapseBtn = document.getElementById('sbCollapseBtn');
    const MINI_KEY = 'erp_sidebar_mini';

    if (collapseBtn) {
        if (localStorage.getItem(MINI_KEY) === '1') {
            sidebar.classList.add('mini');
            document.body.classList.add('sb-mini');
        }
        collapseBtn.addEventListener('click', function () {
            const isMini = sidebar.classList.toggle('mini');
            document.body.classList.toggle('sb-mini', isMini);
            localStorage.setItem(MINI_KEY, isMini ? '1' : '0');
        });
    }
}
