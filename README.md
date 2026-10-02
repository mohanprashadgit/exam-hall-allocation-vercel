# Grace College Examination Seating ERP

> Centralized exam seating allocation, hall management, question paper distribution, and student directory for Grace College of Engineering — Centre 9503.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Production-green.svg)
![Deploy](https://img.shields.io/badge/deploy-Vercel%20%7C%20XAMPP-purple.svg)

---

## 🚀 Features

- **Seat Allocation** — Assign students to exam halls with a visual 5×5 seating grid (Left/Right sections). Live preview updates instantly as you type register numbers.
- **Hall Management** — View, filter, edit, and delete seating plans. Master report with question paper distribution matrix.
- **Student Directory** — Browse all active students with instant auto-filtering by name, register number, or department. Add new students on the fly.
- **Question Paper Report** — Pivot matrix showing paper count per hall per subject. Print-ready A4 landscape layout.
- **Duplicate & Conflict Detection** — Real-time checks prevent double-booking of halls or students.
- **Auto-Filtering** — All filter dropdowns apply instantly on selection — no "Search" button needed.
- **Offline / Browser Storage** — All data stored in `localStorage`. Works without any backend server.
- **Responsive Sidebar** — Collapsible sidebar navigation with mobile-friendly horizontal layout.

---

## 📁 Project Structure

```
exam_hall_allocation/
├── index.html          # Dashboard — KPI cards, quick actions
├── allocation.html     # Seat Allocation — visual grid planner with live preview
├── management.html     # Hall Management — list/view/edit/delete seating plans
├── students.html       # Student Directory — auto-filtered student list
├── reports.html        # Question Paper Distribution Matrix (print-ready)
├── app.js              # Core data layer (localStorage CRUD for halls, students, allocations)
├── nav.js              # Sidebar navigation component
├── vercel.json         # Vercel deployment configuration
├── README.md           # This file
└── (legacy PHP files)  # Old PHP/MySQL versions (not used in static deployment)
```

---

## 🛠️ Tech Stack

| Layer        | Technology                     |
|:-------------|:-------------------------------|
| Frontend     | HTML5, Vanilla JavaScript, CSS |
| UI Framework | Bootstrap 4/5                  |
| Icons        | Font Awesome 6                 |
| Fonts        | Inter, DM Sans (Google Fonts)  |
| Data Storage | `localStorage` (browser)       |
| Deployment   | Vercel (static) or XAMPP       |

---

## ⚡ Quick Start

### Option 1: Run Locally with XAMPP

1. Clone/copy the repo into your XAMPP `htdocs` directory:
   ```
   C:\xampp\htdocs\exam_hall_allocation\
   ```
2. Start Apache in XAMPP Control Panel.
3. Open in browser:
   ```
   http://localhost/exam_hall_allocation/index.html
   ```

### Option 2: Run Locally (No Server)

Just open `index.html` directly in your browser. All features work without a server since data is stored in `localStorage`.

### Option 3: Deploy to Vercel

See the **Deployment** section below.

---

## 🌐 Deploy to Vercel

### Prerequisites
- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (free tier works)

### Steps

1. **Push to GitHub** (see instructions below)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Click **"Import Git Repository"** and select your GitHub repo
4. Vercel auto-detects it as a static site — no build settings needed
5. Click **Deploy**
6. Your app will be live at `https://your-project.vercel.app`

---

## 📤 How to Push to GitHub

### First Time Setup

```bash
# 1. Open terminal in your project folder
cd C:\xampp\htdocs\exam_hall_allocation

# 2. Initialize git repository
git init

# 3. Add all files
git add .

# 4. Create first commit
git commit -m "Initial commit - Grace College Exam Seating ERP"

# 5. Create a new repository on GitHub (https://github.com/new)
#    Name it: exam_hall_allocation
#    Do NOT initialize with README (you already have one)

# 6. Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/exam_hall_allocation.git

# 7. Push to GitHub
git branch -M main
git push -u origin main
```

### Updating After Changes

```bash
# 1. Stage all changed files
git add .

# 2. Commit with a message describing what changed
git commit -m "Your description of changes"

# 3. Push to GitHub
git push
```

> **Note:** If deployed on Vercel, it will **auto-deploy** within ~30 seconds after every push to GitHub.

---

## 📊 Data Management

All data is stored in the browser's `localStorage` under these keys:

| Key                    | Content                                |
|:-----------------------|:---------------------------------------|
| `erp_halls`            | Exam hall definitions and categories   |
| `erp_students`         | Student records (name, dept, reg no)   |
| `erp_seat_allocations` | All seating plan allocations           |

- **Sample data** is auto-seeded on first load (150 students across 5 departments).
- Data persists across browser sessions.
- To reset all data: open browser DevTools → Console → run `localStorage.clear()` → reload page.

---

## 👥 Credits

**Developed by:**
B.Tech Artificial Intelligence & Data Science (2023 to 2027 batch):
- **R. Mohanprashad**
- **M. Harish Kumar**
- **A. Sherwin**

**Under the Guidance of:**
- **Mrs. N. Nancy Chitra Thilaga**, HOD of AI&DS
- **Mrs. S. Janani**, AP/AI&DS

Grace College of Engineering

---

## 📄 License

This project is for educational and institutional use at Grace College of Engineering.
