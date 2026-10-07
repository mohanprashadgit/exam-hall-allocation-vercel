/**
 * app.js — Core Data Layer (localStorage) & Global Utilities
 * Grace College Exam Seating ERP
 *
 * Replaces core.php + MySQL with browser localStorage.
 * Provides: DB, Halls, Students, SeatAllocations CRUD, Utility functions
 */

// ═══════════════════════════════════════════════════════════════
// LOCAL STORAGE DATABASE LAYER
// ═══════════════════════════════════════════════════════════════
const DB = {
    get(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    },
    set(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    },
    remove(key) { localStorage.removeItem(key); }
};

// ═══════════════════════════════════════════════════════════════
// HALLS MODULE
// ═══════════════════════════════════════════════════════════════
const Halls = {
    KEY: 'erp_halls',
    VERSION_KEY: 'erp_halls_version',
    CURRENT_VERSION: 'v3_venue_structure_2026',

    getAll() {
        const curVer = localStorage.getItem(this.VERSION_KEY);
        let halls = DB.get(this.KEY);
        if (!halls || halls.length === 0 || curVer !== this.CURRENT_VERSION) {
            halls = this._migrateOrReset(halls);
            DB.set(this.KEY, halls);
            localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
        }
        return halls;
    },

    getNames() {
        return this.getAll().map(h => h.hall_no);
    },

    getGrouped() {
        const halls = this.getAll();
        const categoryOrder = [
            'Exam Halls',
            'Drawing Halls',
            'Reading Halls',
            'CSE Classrooms',
            'AI & DS Classrooms',
            'Other Venues'
        ];
        const groups = {};
        categoryOrder.forEach(cat => { groups[cat] = []; });

        halls.forEach(h => {
            const cat = h.category || 'Other Venues';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(h);
        });

        const result = {};
        categoryOrder.forEach(cat => {
            if (groups[cat] && (groups[cat].length > 0 || cat === 'Other Venues')) {
                result[cat] = groups[cat];
            }
        });
        return result;
    },

    add(hall_no, category) {
        const halls = this.getAll();
        const trimmed = (hall_no || '').trim();
        if (!trimmed) return { ok: false, error: 'Please enter a valid venue name.' };
        if (halls.some(h => h.hall_no.toLowerCase().trim() === trimmed.toLowerCase())) {
            return { ok: false, error: `Hall '${trimmed}' already exists.` };
        }

        let icon = '<i class="fa-solid fa-building"></i>', badge_label = 'VENUE', badge_bg = '#ede9fe', badge_color = '#4c1d95';
        if (category === 'Exam Halls')          { icon = '<i class="fa-solid fa-landmark"></i>'; badge_label = 'EXAM'; badge_bg = '#e8f0fe'; badge_color = '#3b5bdb'; }
        else if (category === 'Drawing Halls')  { icon = '<i class="fa-solid fa-palette"></i>'; badge_label = 'DRAW'; badge_bg = '#fef3c7'; badge_color = '#b45309'; }
        else if (category === 'Reading Halls')  { icon = '<i class="fa-solid fa-book-open"></i>'; badge_label = 'READ'; badge_bg = '#e6f4ea'; badge_color = '#2e7d32'; }
        else if (category === 'CSE Classrooms') { icon = '<i class="fa-solid fa-laptop-code"></i>'; badge_label = 'CSE'; badge_bg = '#ede9fe'; badge_color = '#6d28d9'; }
        else if (category === 'AI & DS Classrooms') { icon = '<i class="fa-solid fa-robot"></i>'; badge_label = 'AI&DS'; badge_bg = '#fce7f3'; badge_color = '#be185d'; }
        else if (category === 'Other Venues')   { icon = '<i class="fa-solid fa-building"></i>'; badge_label = 'OTHER'; badge_bg = '#ede9fe'; badge_color = '#4c1d95'; }

        const hall = { id: Date.now(), hall_no: trimmed, category, icon, badge_label, badge_bg, badge_color, created_at: new Date().toISOString() };
        halls.push(hall);
        DB.set(this.KEY, halls);
        return { ok: true, ...hall };
    },

    _defaults() {
        return [
            // 🏛️ Exam Halls
            { id: 1, hall_no: 'Exam Hall-1', category: 'Exam Halls', icon: '<i class="fa-solid fa-landmark"></i>', badge_label: 'EXAM', badge_bg: '#e8f0fe', badge_color: '#3b5bdb' },
            { id: 2, hall_no: 'Exam Hall-2', category: 'Exam Halls', icon: '<i class="fa-solid fa-landmark"></i>', badge_label: 'EXAM', badge_bg: '#e8f0fe', badge_color: '#3b5bdb' },

            // 🎨 Drawing Halls
            { id: 3, hall_no: 'Drawing Hall-1', category: 'Drawing Halls', icon: '<i class="fa-solid fa-palette"></i>', badge_label: 'DRAW', badge_bg: '#fef3c7', badge_color: '#b45309' },
            { id: 4, hall_no: 'Drawing Hall-2', category: 'Drawing Halls', icon: '<i class="fa-solid fa-palette"></i>', badge_label: 'DRAW', badge_bg: '#fef3c7', badge_color: '#b45309' },

            // 📚 Reading Halls
            { id: 5, hall_no: 'Reading Hall-1', category: 'Reading Halls', icon: '<i class="fa-solid fa-book-open"></i>', badge_label: 'READ', badge_bg: '#e6f4ea', badge_color: '#2e7d32' },
            { id: 6, hall_no: 'Reading Hall-2', category: 'Reading Halls', icon: '<i class="fa-solid fa-book-open"></i>', badge_label: 'READ', badge_bg: '#e6f4ea', badge_color: '#2e7d32' },
            { id: 7, hall_no: 'Reading Hall-3', category: 'Reading Halls', icon: '<i class="fa-solid fa-book-open"></i>', badge_label: 'READ', badge_bg: '#e6f4ea', badge_color: '#2e7d32' },

            // 🏫 CSE Classrooms
            { id: 8, hall_no: 'CSE 2nd Year Class', category: 'CSE Classrooms', icon: '<i class="fa-solid fa-laptop-code"></i>', badge_label: 'CSE', badge_bg: '#ede9fe', badge_color: '#6d28d9' },
            { id: 13, hall_no: 'CSE 3rd Year Class', category: 'CSE Classrooms', icon: '<i class="fa-solid fa-laptop-code"></i>', badge_label: 'CSE', badge_bg: '#ede9fe', badge_color: '#6d28d9' },
            { id: 9, hall_no: 'CSE 4th Year Class', category: 'CSE Classrooms', icon: '<i class="fa-solid fa-laptop-code"></i>', badge_label: 'CSE', badge_bg: '#ede9fe', badge_color: '#6d28d9' },

            // 🤖 AI & DS Classrooms
            { id: 10, hall_no: 'AI & DS 2nd Year Class', category: 'AI & DS Classrooms', icon: '<i class="fa-solid fa-robot"></i>', badge_label: 'AI&DS', badge_bg: '#fce7f3', badge_color: '#be185d' },
            { id: 11, hall_no: 'AI & DS 3rd Year Class', category: 'AI & DS Classrooms', icon: '<i class="fa-solid fa-robot"></i>', badge_label: 'AI&DS', badge_bg: '#fce7f3', badge_color: '#be185d' },
            { id: 12, hall_no: 'AI & DS 4th Year Class', category: 'AI & DS Classrooms', icon: '<i class="fa-solid fa-robot"></i>', badge_label: 'AI&DS', badge_bg: '#fce7f3', badge_color: '#be185d' },
        ];
    },

    _migrateOrReset(oldHalls) {
        const defaults = this._defaults();
        if (!oldHalls || !Array.isArray(oldHalls)) return defaults;

        // Remove obsolete halls: Exam Hall-3..5, Lab Hall-1..2, Seminar Hall, Conference Hall
        const removedHalls = new Set([
            'Exam Hall-3', 'Exam Hall-4', 'Exam Hall-5',
            'Lab Hall-1', 'Lab Hall-2', 'Seminar Hall', 'Conference Hall'
        ]);

        // Keep custom user-added halls that are not obsolete default halls
        const customHalls = oldHalls.filter(h =>
            !removedHalls.has(h.hall_no) &&
            !defaults.some(d => d.hall_no.toLowerCase().trim() === h.hall_no.toLowerCase().trim())
        );

        return [...defaults, ...customHalls];
    }
};

// ═══════════════════════════════════════════════════════════════
// STUDENTS MODULE
// ═══════════════════════════════════════════════════════════════
const Students = {
    KEY: 'erp_students',

    getAll(activeOnly = false) {
        let list = DB.get(this.KEY);
        if (!list || list.length === 0) {
            list = this._defaults();
            DB.set(this.KEY, list);
        }
        if (activeOnly) {
            return list.filter(s => {
                const st = (s.stu_status || '').toLowerCase().trim();
                return !st.includes('discontinu') && !st.includes('complete') && !st.includes('dropout') && !st.includes('transfer') && !st.includes('inactive');
            });
        }
        return list;
    },

    find(reg_no) {
        if (!reg_no) return null;
        const all = this.getAll();
        const rStr = String(reg_no).trim();
        let found = all.find(s => s.stu_regno === rStr);
        if (found) return found;
        if (rStr.length <= 3 && /^\d+$/.test(rStr)) {
            const padded = rStr.padStart(3, '0');
            found = all.find(s => s.stu_regno && s.stu_regno.endsWith(padded));
            if (found) return found;
        }
        if (rStr.length > 3) {
            found = all.find(s => s.stu_regno && s.stu_regno.endsWith(rStr));
            if (found) return found;
        }
        return null;
    },

    findBatch(reg_nos) {
        const all = this.getAll();
        const map = {};
        reg_nos.forEach(r => {
            if (!r) return;
            let s = all.find(st => st.stu_regno === r);
            if (!s && r.length < 12) {
                s = all.find(st => st.stu_regno && st.stu_regno.endsWith(r));
            }
            if (s) {
                map[r] = s;
            }
        });
        return map;
    },

    search(filters = {}) {
        let students = this.getAll();
        if (filters.name) {
            const q = filters.name.toLowerCase();
            students = students.filter(s => {
                const full = getStudentFullName(s).toLowerCase();
                return full.includes(q);
            });
        }
        if (filters.regno) {
            students = students.filter(s => (s.stu_regno || '').includes(filters.regno));
        }
        if (filters.dept) {
            const code = DEPT_TO_CODE[filters.dept];
            const deptUpper = filters.dept.toUpperCase();
            students = students.filter(s => {
                const d = (s.stu_dept || getStudentDept(s.stu_regno) || '').toUpperCase();
                if (d === deptUpper || d.startsWith(deptUpper)) return true;
                if (code && (s.stu_regno || '').substring(6, 9) === code) return true;
                return false;
            });
        }
        if (filters.status) {
            const filterSt = filters.status.toLowerCase().trim();
            students = students.filter(s => {
                const st = (s.stu_status || 'active').toLowerCase().trim();
                if (filterSt === 'active') return !st.includes('discontinu') && !st.includes('complete');
                if (filterSt.includes('discontinu')) return st.includes('discontinu');
                return st === filterSt;
            });
        }
        return students.sort((a, b) => (a.stu_regno || '').localeCompare(b.stu_regno || ''));
    },

    add(reg_no, fname, lname, dept, status = 'Active') {
        const students = DB.get(this.KEY) || this._defaults();
        if (students.some(s => s.stu_regno === reg_no)) return { ok: false, error: `Student ${reg_no} already exists!` };
        students.push({
            stu_id: 'stu_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            stu_regno: reg_no, stu_fname: fname, stu_lname: lname, stu_dept: dept, stu_status: status || 'Active'
        });
        DB.set(this.KEY, students);
        return { ok: true };
    },

    update(reg_no, fname, lname, dept, status) {
        const students = DB.get(this.KEY) || this._defaults();
        const idx = students.findIndex(s => s.stu_regno === reg_no);
        if (idx === -1) return { ok: false, error: 'Student not found.' };
        const prevStatus = students[idx].stu_status || 'Active';
        students[idx] = {
            ...students[idx],
            stu_fname: fname !== undefined ? fname : students[idx].stu_fname,
            stu_lname: lname !== undefined ? lname : students[idx].stu_lname,
            stu_dept: dept !== undefined ? dept : students[idx].stu_dept,
            stu_status: status !== undefined ? status : prevStatus
        };
        DB.set(this.KEY, students);
        return { ok: true };
    },

    setStatus(reg_no, status) {
        const students = DB.get(this.KEY) || this._defaults();
        const idx = students.findIndex(s => s.stu_regno === reg_no);
        if (idx === -1) return { ok: false, error: 'Student not found.' };
        students[idx].stu_status = status;
        DB.set(this.KEY, students);
        return { ok: true, status: students[idx].stu_status };
    },

    toggleStatus(reg_no) {
        const students = DB.get(this.KEY) || this._defaults();
        const idx = students.findIndex(s => s.stu_regno === reg_no);
        if (idx === -1) return { ok: false, error: 'Student not found.' };
        const curr = (students[idx].stu_status || 'Active').toLowerCase();
        const newStatus = curr.includes('discontinu') ? 'Active' : 'Discontinued';
        students[idx].stu_status = newStatus;
        DB.set(this.KEY, students);
        return { ok: true, status: newStatus };
    },

    count(activeOnly = false) { return this.getAll(activeOnly).length; },

    resetToDatabaseSeed() {
        const list = this._defaults();
        DB.set(this.KEY, list);
        localStorage.setItem(DB_SEED_VERSION_KEY, CURRENT_SEED_VERSION);
        return list;
    },

    _defaults() {
        return getComprehensiveDefaultStudents();
    }
};

// ═══════════════════════════════════════════════════════════════
// SEAT ALLOCATIONS MODULE
// ═══════════════════════════════════════════════════════════════
const SeatAllocations = {
    KEY: 'erp_seat_allocations',

    getAll() { return DB.get(this.KEY) || []; },

    /**
     * Get grouped plans (unique hall+date+type+session+time combos)
     */
    getPlans(filters = {}) {
        let allocs = this.getAll();

        if (filters.exam_date) allocs = allocs.filter(a => a.exam_date === filters.exam_date);
        if (filters.exam_type) allocs = allocs.filter(a => a.exam_type === filters.exam_type);
        if (filters.session) allocs = allocs.filter(a => a.session === filters.session);
        if (filters.hall_no) allocs = allocs.filter(a => a.hall_no === filters.hall_no);
        if (filters.exam_month) allocs = allocs.filter(a => (a.exam_month || '') === filters.exam_month);

        const planMap = {};
        allocs.forEach(a => {
            const isUniv = (a.exam_type || 'University') === 'University';
            const key = isUniv
                ? `${a.hall_no}|${a.exam_date}|${a.exam_type}|${a.session}|${a.exam_month || ''}`
                : `${a.hall_no}|${a.exam_date}|${a.exam_type}|${a.start_date||''}|${a.end_date||''}`;
            if (!planMap[key]) {
                planMap[key] = {
                    hall_no: a.hall_no, exam_date: a.exam_date, exam_type: a.exam_type,
                    session: a.session, from_time: a.from_time || '', to_time: a.to_time || '',
                    start_date: a.start_date || '', end_date: a.end_date || '',
                    exam_month: a.exam_month || '',
                    left_count: 0, right_count: 0
                };
            }
            if (a.section === 'LEFT' && a.reg_no) planMap[key].left_count++;
            if (a.section === 'RIGHT' && a.reg_no) planMap[key].right_count++;
        });

        return Object.values(planMap).sort((a, b) => {
            if (a.exam_date !== b.exam_date) return b.exam_date.localeCompare(a.exam_date);
            return a.hall_no.localeCompare(b.hall_no);
        });
    },

    /**
     * Get seat details for a specific plan
     */
    getSeats(hall_no, exam_date, exam_type, session, from_time, to_time, start_date, end_date, exam_month) {
        const targetType = exam_type || 'University';
        return this.getAll().filter(a => {
            if (a.hall_no !== hall_no || a.exam_date !== exam_date) return false;
            const aType = a.exam_type || 'University';
            if (aType !== targetType) return false;
            if (targetType === 'University') {
                if ((a.session || '') !== (session || '')) return false;
                if (exam_month && (a.exam_month || '') !== exam_month) return false;
                return true;
            } else {
                if (session && a.session && a.session !== session) return false;
                if (start_date && a.start_date && a.start_date !== start_date) return false;
                if (end_date && a.end_date && a.end_date !== end_date) return false;
                return true;
            }
        });
    },

    /**
     * Check if a specific hall is already allocated for the given date, session/time, and exam type
     */
    isHallAllocated(hall_no, exam_date, exam_type, session, from_time, to_time, origPlan = null, to_date = '') {
        if (!hall_no || !exam_date) return false;
        const normHall = String(hall_no).trim().toLowerCase();
        const allocs = this.getAll().filter(a => {
            if (origPlan && this._matchesPlan(a, origPlan)) return false;
            return true;
        });

        const targetType = exam_type || 'University';
        if (targetType === 'University') {
            const targetSess = String(session || 'FN').trim().toUpperCase();
            const normDate = String(exam_date).trim();
            return allocs.some(a => {
                if (!a.hall_no || String(a.hall_no).trim().toLowerCase() !== normHall) return false;
                if (!a.exam_date || String(a.exam_date).trim() !== normDate) return false;
                const aType = a.exam_type || 'University';
                if (aType !== 'University') return false;
                const aSess = String(a.session || 'FN').trim().toUpperCase();
                return aSess === targetSess;
            });
        } else {
            // Internal Exam
            return allocs.some(a => {
                if (!a.hall_no || String(a.hall_no).trim().toLowerCase() !== normHall) return false;
                const aType = a.exam_type || 'University';
                if (aType !== 'Internal') return false;
                const aStart = a.start_date || a.exam_date;
                const aEnd = a.end_date || a.exam_date;
                const myStart = String(exam_date).trim();
                const myEnd = String(to_date || exam_date).trim();
                const inRange = (myStart <= aEnd && myEnd >= aStart);
                if (!inRange) return false;
                if (from_time && to_time && a.from_time && a.to_time) {
                    return timeOverlap(from_time, to_time, a.from_time, a.to_time);
                }
                return true;
            });
        }
    },

    /**
     * Get set of all hall names already allocated for given parameters
     */
    getAllocatedHalls(exam_date, exam_type, session, from_time, to_time, origPlan = null, to_date = '') {
        const halls = Halls.getNames();
        const set = new Set();
        halls.forEach(h => {
            if (this.isHallAllocated(h, exam_date, exam_type, session, from_time, to_time, origPlan, to_date)) {
                set.add(h);
            }
        });
        return set;
    },

    /**
     * Save a plan (rejects duplicate hall allocation; delete old if editing, insert new seats)
     */
    savePlan(seats, origPlan = null) {
        if (!seats || seats.length === 0) return { ok: false, error: 'No seats to save.' };
        const first = seats[0];

        // Backend validation: reject duplicate hall allocation
        const isDup = this.isHallAllocated(
            first.hall_no, first.exam_date, first.exam_type, first.session,
            first.from_time, first.to_time, origPlan, first.end_date
        );
        if (isDup) {
            const isUniv = (first.exam_type || 'University') === 'University';
            const dateStr = formatDateDDMMYYYY(first.exam_date);
            const sessStr = isUniv ? (first.session ? ` ${first.session}` : '') : (first.start_date && first.end_date ? ` (${formatDateDDMMYYYY(first.start_date)} to ${formatDateDDMMYYYY(first.end_date)})` : '');
            return {
                ok: false,
                error: `⚠️ Already Allocated: ${first.hall_no} is already allocated for ${dateStr}${sessStr}. Please select another hall.`
            };
        }

        let allocs = this.getAll();

        // Remove old plan if editing
        if (origPlan) {
            allocs = allocs.filter(a => !this._matchesPlan(a, origPlan));
        }

        allocs.push(...seats);
        DB.set(this.KEY, allocs);
        return { ok: true, saved: seats.length };
    },

    /**
     * Delete a plan
     */
    deletePlan(plan) {
        let allocs = this.getAll();
        allocs = allocs.filter(a => !this._matchesPlan(a, plan));
        DB.set(this.KEY, allocs);
        return { ok: true };
    },

    /**
     * Check for duplicate/conflicts
     */
    checkConflicts(hall_no, exam_date, exam_type, session, from_time, to_time, left_nos, right_nos, origPlan, end_date = '') {
        const conflicts = [];
        const allocs = this.getAll().filter(a => {
            if (origPlan && this._matchesPlan(a, origPlan)) return false;
            return true;
        });

        // Hall conflict check
        if (hall_no && exam_date) {
            if (this.isHallAllocated(hall_no, exam_date, exam_type, session, from_time, to_time, origPlan, end_date)) {
                const isUniv = (exam_type || 'University') === 'University';
                const dateDisplay = formatDateDDMMYYYY(exam_date);
                const sessDisplay = isUniv ? (session ? ` ${session}` : '') : (end_date ? ` (${dateDisplay} to ${formatDateDDMMYYYY(end_date)})` : '');
                conflicts.push(`⚠️ Already Allocated: Hall <strong>${escapeHtml(hall_no)}</strong> is already allocated for <strong>${dateDisplay}${sessDisplay}</strong>. Please select another hall.`);
            }
        }

        // Student duplicate check
        const all_nos = [...new Set([...left_nos, ...right_nos])];
        const combined = [...left_nos, ...right_nos];
        const seenInInput = {};
        combined.forEach(r => {
            if (seenInInput[r]) conflicts.push(`Student <strong>${r}</strong> is entered multiple times in this allocation.`);
            else seenInInput[r] = true;
        });

        if (all_nos.length > 0 && exam_date) {
            all_nos.forEach(reg => {
                const existing = allocs.filter(a => a.reg_no === reg && a.exam_date === exam_date);
                existing.forEach(a => {
                    if (exam_type === 'University' && a.session === session) {
                        conflicts.push(`Student <strong>${reg}</strong> is already allocated in <strong>${a.hall_no}</strong> for <strong>${formatDate(exam_date)}</strong> (${session} session).`);
                    } else if (exam_type === 'Internal' && from_time && to_time && a.from_time && a.to_time) {
                        if (timeOverlap(from_time, to_time, a.from_time, a.to_time)) {
                            conflicts.push(`Student <strong>${reg}</strong> is already allocated in <strong>${a.hall_no}</strong> for overlapping time (${a.from_time} – ${a.to_time}) on <strong>${formatDate(exam_date)}</strong>.`);
                        }
                    }
                });
            });
        }

        return [...new Set(conflicts)];
    },

    getDistinctDates() {
        const dates = new Set();
        this.getAll().forEach(a => dates.add(a.exam_date));
        return [...dates].sort().reverse();
    },

    _matchesPlan(a, plan) {
        if (!a || !plan) return false;
        if (a.hall_no !== plan.hall_no || a.exam_date !== plan.exam_date) return false;
        const aType = a.exam_type || 'University';
        const pType = plan.exam_type || 'University';
        if (aType !== pType) return false;
        if (pType === 'University') {
            if ((a.session || '') !== (plan.session || '')) return false;
            if (plan.exam_month && a.exam_month && plan.exam_month !== a.exam_month) return false;
            return true;
        } else {
            if (plan.session && a.session && a.session !== plan.session) return false;
            if (plan.start_date && a.start_date && a.start_date !== plan.start_date) return false;
            if (plan.end_date && a.end_date && a.end_date !== plan.end_date) return false;
            return true;
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const DEPT_TO_CODE = {
    'AI&DS': '243', 'CSE': '104', 'EEE': '105', 'ECE': '106', 'MECH': '114',
    'CIVIL': '103', 'MBA': '631', 'M.E. Computer Engineering': '405',
    'M.E. Applied Electronic Engineering': '401', 'M.E. Power System and Engineering': '411'
};

const CODE_TO_DEPT = {};
Object.entries(DEPT_TO_CODE).forEach(([k, v]) => CODE_TO_DEPT[v] = k);

function getStudentDept(regno) {
    if (!regno || regno.length < 9) return '';
    const code = regno.substring(6, 9);
    return CODE_TO_DEPT[code] || '';
}

function getStudentFullName(stu) {
    if (!stu) return '';
    if (stu.full_name) return stu.full_name.trim();
    if (stu.name) return stu.name.trim();
    if (stu.stu_name) return stu.stu_name.trim();
    const fn = (stu.stu_fname || '').trim();
    const ln = (stu.stu_lname || '').trim();
    const combined = (fn + ' ' + ln).trim();
    if (combined) return combined;
    return 'Student ' + (stu.stu_regno || '').slice(-3);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${String(d.getDate()).padStart(2,'0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

function formatDateDDMMYYYY(dateStr) {
    if (!dateStr) return '';
    const trimmed = String(dateStr).trim();
    const parts = trimmed.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const d = new Date(trimmed.includes('T') ? trimmed : trimmed + 'T00:00:00');
    if (isNaN(d.getTime())) return trimmed;
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function formatDateDMY(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return `${String(d.getDate()).padStart(2,'0')} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getFullYear()}`;
}

function timeToMinutes(t) {
    if (!t) return null;
    const parts = t.match(/(\d+):(\d+)/);
    if (!parts) return null;
    return parseInt(parts[1]) * 60 + parseInt(parts[2]);
}

function timeOverlap(fromA, toA, fromB, toB) {
    const sA = timeToMinutes(fromA), eA = timeToMinutes(toA);
    const sB = timeToMinutes(fromB), eB = timeToMinutes(toB);
    if (sA === null || eA === null || sB === null || eB === null) return false;
    return sA < eB && eA > sB;
}

function expandRegRange(raw, limit = 999) {
    if (!raw || !raw.trim()) return [];
    const results = [];
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);

    for (const part of parts) {
        if (results.length >= limit) break;
        if (part.includes('-')) {
            const [startStr, endStr] = part.split('-', 2).map(s => s.trim());
            if (/^\d+$/.test(startStr) && /^\d+$/.test(endStr)) {
                const len = startStr.length;
                const start = parseInt(startStr);
                let end;
                if (endStr.length < len) {
                    const prefix = startStr.substring(0, len - endStr.length);
                    end = parseInt(prefix + endStr);
                } else {
                    end = parseInt(endStr);
                }
                if (start <= end) {
                    for (let n = start; n <= end && results.length < limit; n++) {
                        results.push(String(n).padStart(len, '0'));
                    }
                }
            }
        } else if (/^\d+$/.test(part)) {
            results.push(part);
        }
    }
    return [...new Set(results)];
}

function compressRegNumbers(regNos) {
    if (!regNos || regNos.length === 0) return '';
    const sorted = [...new Set(regNos.map(r => r.trim()).filter(Boolean))].sort();
    if (sorted.length === 0) return '';

    const groups = [];
    let start = sorted[0], prev = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
        const curr = sorted[i];
        if (parseInt(curr) - parseInt(prev) === 1) {
            prev = curr;
        } else {
            groups.push(start === prev ? start : `${start}-${prev}`);
            start = curr;
            prev = curr;
        }
    }
    groups.push(start === prev ? start : `${start}-${prev}`);
    return groups.join(', ');
}

function formatSessionDisplay(plan) {
    if ((plan.exam_type || '').toLowerCase() === 'internal') {
        if (plan.start_date && plan.end_date) {
            return `${formatDateDMY(plan.start_date)} \u2013 ${formatDateDMY(plan.end_date)}`;
        }
        if (plan.session && !plan.session.includes(':') && !plan.session.toLowerCase().includes('m')) {
            return plan.session;
        }
        return 'Internal Exam';
    }
    const sess = (plan.session || 'FN').toUpperCase();
    if (sess === 'AN') return 'AN (02:00 PM \u2013 05:00 PM)';
    return 'FN (10:00 AM \u2013 01:00 PM)';
}

function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ═══════════════════════════════════════════════════════════════
// SEAT LAYOUT UTILITIES
// ═══════════════════════════════════════════════════════════════
const LAYOUT_OPTIONS = {
    '1': { label: 'Option 1 (A1–E5)', rows: [1,2,3,4,5] },
    '2': { label: 'Option 2 (A6–E10)', rows: [6,7,8,9,10] },
    '3': { label: 'Option 3 (A11–E15)', rows: [11,12,13,14,15] },
    '4': { label: 'Option 4 (A16–E20)', rows: [16,17,18,19,20] },
};
const COLS = ['A','B','C','D','E'];

function getSeatSets(layoutId) {
    const rows = LAYOUT_OPTIONS[layoutId || '1']?.rows || [1,2,3,4,5];
    const odd = [], even = [];
    // Left: A1, C1, E1, B2, D2, A3, C3, E3, B4, D4, A5, C5, E5
    // Right: B1, D1, A2, C2, E2, B3, D3, A4, C4, E4, B5, D5
    rows.forEach((r, ri) => {
        COLS.forEach((c, ci) => {
            if ((ci % 2) === (ri % 2)) odd.push(c + r);
            else even.push(c + r);
        });
    });
    return { rows, odd, even, all: [...new Set([...odd, ...even])].sort() };
}

// ═══════════════════════════════════════════════════════════════
// DATABASE SEEDER (ALL 928 DATABASE_SEED.SQL RECORDS INCL. DISCONTINUED)
// ═══════════════════════════════════════════════════════════════
const DB_SEED_VERSION_KEY = 'erp_seed_version';
const CURRENT_SEED_VERSION = 'v4_seed_928_with_discontinued';

function getComprehensiveDefaultStudents() {
    // Exactly 928 college records from database_seed.sql (925 Active, 3 Discontinued)
    const rawData = [
        ['stu_seed_0001', '950322243001', 'Alex', 'Matthew', 'AI&DS', 'Active'],
        ['stu_seed_0002', '950322243002', 'Balamurugan', 'M', 'AI&DS', 'Active'],
        ['stu_seed_0003', '950322243003', 'Daniel', 'Raja M', 'AI&DS', 'Active'],
        ['stu_seed_0004', '950322243004', 'DEEPIKA', 'G', 'AI&DS', 'Discontinued'],
        ['stu_seed_0005', '950322243005', 'FELIX', 'SILVAN J', 'AI&DS', 'Active'],
        ['stu_seed_0006', '950322243006', 'GURUROHITH', 'J', 'AI&DS', 'Active'],
        ['stu_seed_0007', '950322243009', 'HARISH', 'BABU S', 'AI&DS', 'Active'],
        ['stu_seed_0008', '950322243010', 'HARISH', 'MAHARAJAN M', 'AI&DS', 'Active'],
        ['stu_seed_0009', '950322243011', 'HINDUJA', 'M', 'AI&DS', 'Active'],
        ['stu_seed_0010', '950322243012', 'JEFFRIN', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0011', '950322243013', 'JETSON', 'ALLTO A', 'AI&DS', 'Discontinued'],
        ['stu_seed_0012', '950322243014', 'JOHN', 'ALLSON M', 'AI&DS', 'Active'],
        ['stu_seed_0013', '950322243015', 'MUTHUSELVI', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0014', '950322243016', 'MUTHU', 'VIVEK S L', 'AI&DS', 'Active'],
        ['stu_seed_0015', '950322243017', 'NARMATHA', 'SRI S', 'AI&DS', 'Active'],
        ['stu_seed_0016', '950322243018', 'OSHAN', 'ABDUL HAQUE', 'AI&DS', 'Active'],
        ['stu_seed_0017', '950322243020', 'RENUGA', 'SREE S', 'AI&DS', 'Active'],
        ['stu_seed_0018', '950322243021', 'ROGER', 'SAMUEL J', 'AI&DS', 'Active'],
        ['stu_seed_0019', '950322243022', 'RUBY', 'ESTHER Y', 'AI&DS', 'Active'],
        ['stu_seed_0020', '950322243023', 'SAM', 'DAVI R S', 'AI&DS', 'Active'],
        ['stu_seed_0021', '950322243024', 'SARVESH', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0022', '950322243025', 'SIVAKUMAR', 'A', 'AI&DS', 'Active'],
        ['stu_seed_0023', '950322243026', 'SRI', 'DEVI BALAGAN M', 'AI&DS', 'Active'],
        ['stu_seed_0024', '950322243027', 'SRIMURUGAN', 'A', 'AI&DS', 'Active'],
        ['stu_seed_0025', '950322243028', 'SWARNA', 'T', 'AI&DS', 'Active'],
        ['stu_seed_0026', '950322243301', 'ATHITHYAN', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0027', '950322243302', 'Dinesh', 'Kumar', 'AI&DS', 'Active'],
        ['stu_seed_0028', '950322243303', 'Peer', 'Mohideen', 'AI&DS', 'Active'],
        ['stu_seed_0029', '950322243304', 'Sathish', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0030', '950323243001', 'AASHIK', 'RAYEN P', 'AI&DS', 'Active'],
        ['stu_seed_0031', '950323243002', 'ANA', 'BALAN B', 'AI&DS', 'Active'],
        ['stu_seed_0032', '950323243003', 'ANTONY', 'D', 'AI&DS', 'Active'],
        ['stu_seed_0033', '950323243004', 'ARIHARASUTHAN', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0034', '950323243005', 'ASMITHA', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0035', '950323243006', 'BLINDA', 'DOMNIC GOLDA I', 'AI&DS', 'Active'],
        ['stu_seed_0036', '950323243008', 'FATHIMA', 'BEEVI R', 'AI&DS', 'Active'],
        ['stu_seed_0037', '950323243009', 'FRANCIS', 'STARWIN M', 'AI&DS', 'Active'],
        ['stu_seed_0038', '950323243010', 'GRASON', 'MAHILRAJ S', 'AI&DS', 'Active'],
        ['stu_seed_0039', '950323243011', 'HARISH', 'KUMAR M', 'AI&DS', 'Active'],
        ['stu_seed_0040', '950323243012', 'KIRUBA', 'SHERLIN A', 'AI&DS', 'Active'],
        ['stu_seed_0041', '950323243013', 'MATHESH', 'R', 'AI&DS', 'Active'],
        ['stu_seed_0042', '950323243014', 'MOHANPRASHAD', 'R', 'AI&DS', 'Active'],
        ['stu_seed_0043', '950323243015', 'MUPPUDATHI', 'MARIAMMAL M', 'AI&DS', 'Active'],
        ['stu_seed_0044', '950323243016', 'MUTHU', 'MARIAPPAN R', 'AI&DS', 'Active'],
        ['stu_seed_0045', '950323243017', 'NIRANJANA', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0046', '950323243019', 'PANDILAKSHMI', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0047', '950323243020', 'PATTUKANI', 'L', 'AI&DS', 'Active'],
        ['stu_seed_0048', '950323243021', 'PAULDURAI', 'N', 'AI&DS', 'Active'],
        ['stu_seed_0049', '950323243022', 'RAMA', 'THULASI P', 'AI&DS', 'Active'],
        ['stu_seed_0050', '950323243023', 'SAM', 'EDISON JOSHUA R', 'AI&DS', 'Active'],
        ['stu_seed_0051', '950323243024', 'SHERWIN', 'A', 'AI&DS', 'Active'],
        ['stu_seed_0052', '950323243025', 'SIVA', 'PRAKASH V', 'AI&DS', 'Active'],
        ['stu_seed_0053', '950323243026', 'YESWANTH', 'KUMAR R', 'AI&DS', 'Active'],
        ['stu_seed_0054', '950323243301', 'Paulson', 'Abdul Haque', 'AI&DS', 'Active'],
        ['stu_seed_0055', '950323243501', 'RAVI', 'KUMAR', 'AI&DS', 'Active'],
        ['stu_seed_0056', '950324243001', 'AARTHI', 'A', 'AI&DS', 'Active'],
        ['stu_seed_0057', '950324243002', 'ABILESHWARAN', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0058', '950324243003', 'ANNE', 'VIRGINIA W', 'AI&DS', 'Active'],
        ['stu_seed_0059', '950324243004', 'ANTHONY', 'ASHWIN A', 'AI&DS', 'Active'],
        ['stu_seed_0060', '950324243005', 'ANTONY', 'JASTIN ROHAN A', 'AI&DS', 'Active'],
        ['stu_seed_0061', '950324243006', 'ASHMI', 'R', 'AI&DS', 'Active'],
        ['stu_seed_0062', '950324243007', 'BALA', 'MURUGAN M', 'AI&DS', 'Active'],
        ['stu_seed_0063', '950324243008', 'BALASUNDAR', 'M', 'AI&DS', 'Active'],
        ['stu_seed_0064', '950324243009', 'BENITA', 'SWEETLIN G', 'AI&DS', 'Active'],
        ['stu_seed_0065', '950324243010', 'BERNISH', 'KIRUBHA A G', 'AI&DS', 'Active'],
        ['stu_seed_0066', '950324243011', 'BLESSY', 'ANNA RUBA R', 'AI&DS', 'Active'],
        ['stu_seed_0067', '950324243012', 'BREYIN', 'SOLOMON D', 'AI&DS', 'Active'],
        ['stu_seed_0068', '950324243013', 'DIVYA', 'DHARSHINI M', 'AI&DS', 'Active'],
        ['stu_seed_0069', '950324243014', 'DURKA', 'DEVI S', 'AI&DS', 'Active'],
        ['stu_seed_0070', '950324243015', 'GNANA', 'SUSETTA M', 'AI&DS', 'Active'],
        ['stu_seed_0071', '950324243016', 'GUHAN', 'U', 'AI&DS', 'Active'],
        ['stu_seed_0072', '950324243017', 'IYAPPAN', 'M', 'AI&DS', 'Active'],
        ['stu_seed_0073', '950324243018', 'JAGATHEESWARI', 'M', 'AI&DS', 'Active'],
        ['stu_seed_0074', '950324243019', 'JEMIMAH', 'ROSELIN E', 'AI&DS', 'Active'],
        ['stu_seed_0075', '950324243020', 'JENO', 'PRIYA J', 'AI&DS', 'Active'],
        ['stu_seed_0076', '950324243021', 'JESSICA', 'CAROLINE R', 'AI&DS', 'Active'],
        ['stu_seed_0077', '950324243022', 'JEYASAKTHI', 'B', 'AI&DS', 'Active'],
        ['stu_seed_0078', '950324243023', 'KARUNYA', 'K', 'AI&DS', 'Active'],
        ['stu_seed_0079', '950324243024', 'KAVIYA', 'AMALA SAJANA A', 'AI&DS', 'Active'],
        ['stu_seed_0080', '950324243025', 'KEERTHIKA', 'P', 'AI&DS', 'Active'],
        ['stu_seed_0081', '950324243026', 'MEERA', 'HUSAIN A', 'AI&DS', 'Active'],
        ['stu_seed_0082', '950324243027', 'MUKUL', 'RAKESH A', 'AI&DS', 'Active'],
        ['stu_seed_0083', '950324243028', 'MUTHUMARI', 'P', 'AI&DS', 'Active'],
        ['stu_seed_0084', '950324243029', 'NITHYA', 'J', 'AI&DS', 'Active'],
        ['stu_seed_0085', '950324243030', 'PAVITHRAN', 'R', 'AI&DS', 'Active'],
        ['stu_seed_0086', '950324243031', 'PON', 'POORANI P', 'AI&DS', 'Active'],
        ['stu_seed_0087', '950324243032', 'PRAVEEN', '', 'AI&DS', 'Active'],
        ['stu_seed_0088', '950324243033', 'REJOE', 'GNANA BELLSON R', 'AI&DS', 'Active'],
        ['stu_seed_0089', '950324243034', 'RITHEESWARAN', 'T', 'AI&DS', 'Active'],
        ['stu_seed_0090', '950324243035', 'RUTH', 'JANCY K', 'AI&DS', 'Active'],
        ['stu_seed_0091', '950324243036', 'SAHIL', 'KUMAR', 'AI&DS', 'Active'],
        ['stu_seed_0092', '950324243037', 'SAMSON', 'DEVA ASIR M', 'AI&DS', 'Active'],
        ['stu_seed_0093', '950324243038', 'SANKAR', 'GANESH N', 'AI&DS', 'Active'],
        ['stu_seed_0094', '950324243039', 'SANTHOSH', 'A', 'AI&DS', 'Active'],
        ['stu_seed_0095', '950324243040', 'SANTRIA', 'DCOLA M', 'AI&DS', 'Active'],
        ['stu_seed_0096', '950324243041', 'SARANYA', 'JENITA B', 'AI&DS', 'Active'],
        ['stu_seed_0097', '950324243042', 'SHARUKAN', 'M', 'AI&DS', 'Active'],
        ['stu_seed_0098', '950324243043', 'SOWMIYA', 'A', 'AI&DS', 'Active'],
        ['stu_seed_0099', '950324243044', 'SUDHARSON', 'A R', 'AI&DS', 'Active'],
        ['stu_seed_0100', '950324243045', 'SWEETY', 'F', 'AI&DS', 'Active'],
        ['stu_seed_0101', '950324243046', 'THOWFIKA', 'K', 'AI&DS', 'Active'],
        ['stu_seed_0102', '950324243301', 'KATHIRVEL', 'M', 'AI&DS', 'Active'],
        ['stu_seed_0103', '950324243302', 'MUNIASAMY', 'PRAVEEN M', 'AI&DS', 'Active'],
        ['stu_seed_0104', '950324243303', 'NIKASH', '', 'AI&DS', 'Active'],
        ['stu_seed_0105', '950325243001', 'ADHI', 'DURAI I', 'AI&DS', 'Active'],
        ['stu_seed_0106', '950325243002', 'AKASH', 'A', 'AI&DS', 'Active'],
        ['stu_seed_0107', '950325243003', 'AKASH', 'RAJ A', 'AI&DS', 'Active'],
        ['stu_seed_0108', '950325243004', 'ANBUDURAI', 'A', 'AI&DS', 'Active'],
        ['stu_seed_0109', '950325243005', 'ANUSHIYA', 'M', 'AI&DS', 'Active'],
        ['stu_seed_0110', '950325243006', 'ANUSHIYA', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0111', '950325243007', 'ARYA', 'M', 'AI&DS', 'Active'],
        ['stu_seed_0112', '950325243008', 'ASINTHIYA', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0113', '950325243009', 'AUGUSTIN', 'JEROME G', 'AI&DS', 'Active'],
        ['stu_seed_0114', '950325243010', 'BABY', 'ANUSHREE U', 'AI&DS', 'Active'],
        ['stu_seed_0115', '950325243011', 'BAVANA', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0116', '950325243012', 'DHARANI', 'CHITHRA S', 'AI&DS', 'Active'],
        ['stu_seed_0117', '950325243013', 'DHARSHINI', 'V', 'AI&DS', 'Active'],
        ['stu_seed_0118', '950325243014', 'GEERTHANA', 'L', 'AI&DS', 'Active'],
        ['stu_seed_0119', '950325243015', 'GNANA', 'SEEMA G', 'AI&DS', 'Active'],
        ['stu_seed_0120', '950325243016', 'GOMATHI', 'P', 'AI&DS', 'Active'],
        ['stu_seed_0121', '950325243017', 'HARIHARAN', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0122', '950325243018', 'HARISH', 'K', 'AI&DS', 'Active'],
        ['stu_seed_0123', '950325243019', 'JACK', 'J', 'AI&DS', 'Active'],
        ['stu_seed_0124', '950325243020', 'JAITHOON', 'AASIA M S', 'AI&DS', 'Active'],
        ['stu_seed_0125', '950325243021', 'JANANI', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0126', '950325243022', 'JEFFRIN', 'FATHIMA B', 'AI&DS', 'Active'],
        ['stu_seed_0127', '950325243023', 'JEFLIN', 'S J', 'AI&DS', 'Active'],
        ['stu_seed_0128', '950325243024', 'JEHISH', 'K', 'AI&DS', 'Active'],
        ['stu_seed_0129', '950325243025', 'JENIFER', 'A', 'AI&DS', 'Active'],
        ['stu_seed_0130', '950325243026', 'JENIFER', 'JOSELYN J', 'AI&DS', 'Active'],
        ['stu_seed_0131', '950325243027', 'JENNIFER', 'V', 'AI&DS', 'Active'],
        ['stu_seed_0132', '950325243028', 'JESTIN', 'FRANKLIN S', 'AI&DS', 'Active'],
        ['stu_seed_0133', '950325243029', 'JOHANNIE', 'RINAH J', 'AI&DS', 'Active'],
        ['stu_seed_0134', '950325243030', 'JOSHLIN', 'MEKI P', 'AI&DS', 'Active'],
        ['stu_seed_0135', '950325243031', 'KARISHNI', 'T', 'AI&DS', 'Active'],
        ['stu_seed_0136', '950325243032', 'KARTHIKEYAN', 'T', 'AI&DS', 'Active'],
        ['stu_seed_0137', '950325243033', 'KATHIRVEL', 'N', 'AI&DS', 'Active'],
        ['stu_seed_0138', '950325243034', 'KEVIN', 'MATTHEW C', 'AI&DS', 'Active'],
        ['stu_seed_0139', '950325243035', 'MARIA', 'GLADWIN A', 'AI&DS', 'Active'],
        ['stu_seed_0140', '950325243036', 'MARIA', 'JEROLD ROSHAN J', 'AI&DS', 'Active'],
        ['stu_seed_0141', '950325243037', 'MARISH', 'M', 'AI&DS', 'Active'],
        ['stu_seed_0142', '950325243038', 'MATHESH', 'I', 'AI&DS', 'Active'],
        ['stu_seed_0143', '950325243039', 'NICE', 'REENA R', 'AI&DS', 'Active'],
        ['stu_seed_0144', '950325243040', 'RAMANAN', 'R', 'AI&DS', 'Active'],
        ['stu_seed_0145', '950325243041', 'SAMUEL', 'MARTIN A', 'AI&DS', 'Active'],
        ['stu_seed_0146', '950325243042', 'SARAVANA', 'KUMAR A', 'AI&DS', 'Active'],
        ['stu_seed_0147', '950325243043', 'SIVITHA', 'DEVI P', 'AI&DS', 'Active'],
        ['stu_seed_0148', '950325243044', 'SNEGA', 'S', 'AI&DS', 'Active'],
        ['stu_seed_0149', '950325243045', 'SUYAMBU', 'RAJA K', 'AI&DS', 'Active'],
        ['stu_seed_0150', '950325243046', 'THARUNYA', 'K', 'AI&DS', 'Active'],
        ['stu_seed_0151', '950325243047', 'THULASIMANI', 'G', 'AI&DS', 'Active'],
        ['stu_seed_0152', '950325243048', 'UDHAYA', 'KRISHNAN S', 'AI&DS', 'Active'],
        ['stu_seed_0153', '950325243049', 'VENKATESH', 'G', 'AI&DS', 'Active'],
        ['stu_seed_0154', '950325243050', 'WILLSON', 'N', 'AI&DS', 'Active'],
        ['stu_seed_0155', '950321103003', 'Pavithra', 'P', 'CIVIL', 'Active'],
        ['stu_seed_0156', '950321103004', 'Rahul', 'Babin N', 'CIVIL', 'Active'],
        ['stu_seed_0157', '950321103005', 'Sompow', 'Thanmei', 'CIVIL', 'Active'],
        ['stu_seed_0158', '950321103006', 'Subash', 'A', 'CIVIL', 'Active'],
        ['stu_seed_0159', '950321103007', 'Thirumanikani', 'K', 'CIVIL', 'Active'],
        ['stu_seed_0160', '950321103301', 'Joshua', 'Alex A', 'CIVIL', 'Active'],
        ['stu_seed_0161', '950322103001', 'Bharath', 'Kumar S', 'CIVIL', 'Active'],
        ['stu_seed_0162', '950322103003', 'Sankara', 'Narayanan S', 'CIVIL', 'Active'],
        ['stu_seed_0163', '950322103004', 'Subash', 'Chandra Bose K', 'CIVIL', 'Active'],
        ['stu_seed_0164', '950323103001', 'MARIA', 'JENCY S', 'CIVIL', 'Active'],
        ['stu_seed_0165', '950323103002', 'NISHA', 'T', 'CIVIL', 'Active'],
        ['stu_seed_0166', '950323103003', 'SRIRAM', '', 'CIVIL', 'Active'],
        ['stu_seed_0167', '950323103301', 'Athi', 'Rahul', 'CIVIL', 'Active'],
        ['stu_seed_0168', '950323103302', 'Dinesh', 'Kumar M', 'CIVIL', 'Active'],
        ['stu_seed_0169', '950324103001', 'GIDEON', 'STUDD JEBAKUMAR A', 'CIVIL', 'Active'],
        ['stu_seed_0170', '950324103002', 'IMMANUEL', 'BHAGYARAJ P', 'CIVIL', 'Active'],
        ['stu_seed_0171', '950324103003', 'KAVI', 'PRAKASH B', 'CIVIL', 'Active'],
        ['stu_seed_0172', '950324103004', 'LORTHU', 'PRASANTH M', 'CIVIL', 'Active'],
        ['stu_seed_0173', '950324103005', 'MARIA', 'ABISHEK A', 'CIVIL', 'Active'],
        ['stu_seed_0174', '950324103006', 'MUTHUKUMARAN', 'S', 'CIVIL', 'Active'],
        ['stu_seed_0175', '950324103007', 'MUTHU', 'MARI K', 'CIVIL', 'Active'],
        ['stu_seed_0176', '950324103008', 'VISHALINI', 'B', 'CIVIL', 'Active'],
        ['stu_seed_0177', '950324103301', 'MOHAMMED', 'AADHIL R', 'CIVIL', 'Active'],
        ['stu_seed_0178', '950325103001', 'AKSHAYA', 'P', 'CIVIL', 'Active'],
        ['stu_seed_0179', '950325103002', 'ANTONY', 'ASVANTH A', 'CIVIL', 'Active'],
        ['stu_seed_0180', '950325103003', 'KAVIYA', 'T', 'CIVIL', 'Active'],
        ['stu_seed_0181', '950325103004', 'NITHISH', 'JOHNSON C', 'CIVIL', 'Active'],
        ['stu_seed_0182', '950325103005', 'RAGINI', 'S', 'CIVIL', 'Active'],
        ['stu_seed_0183', '950325103006', 'SANTHOSH', 'S', 'CIVIL', 'Active'],
        ['stu_seed_0184', '950325103007', 'SARANYA', 'P', 'CIVIL', 'Active'],
        ['stu_seed_0185', '950325103008', 'RAGINI', '', 'CIVIL', 'Active'],
        ['stu_seed_0186', '950325103009', 'SREEANNAPOORANIDEVI', 'A', 'CIVIL', 'Active'],
        ['stu_seed_0187', '950321104001', 'Aathi', 'Durai M', 'CSE', 'Active'],
        ['stu_seed_0188', '950321104002', 'Abhishek', 'A Stephen', 'CSE', 'Active'],
        ['stu_seed_0189', '950321104003', 'Abijeba', 'S', 'CSE', 'Active'],
        ['stu_seed_0190', '950321104004', 'Akwin', 'K', 'CSE', 'Active'],
        ['stu_seed_0191', '950321104005', 'Alwin', '', 'CSE', 'Active'],
        ['stu_seed_0192', '950321104006', 'Anantha', 'Jothi M', 'CSE', 'Active'],
        ['stu_seed_0193', '950321104007', 'Anantha', 'Kumaran N', 'CSE', 'Active'],
        ['stu_seed_0194', '950321104009', 'Anitha', 'R', 'CSE', 'Active'],
        ['stu_seed_0195', '950321104010', 'Anush', 'M', 'CSE', 'Active'],
        ['stu_seed_0196', '950321104011', 'Aravind', 'M', 'CSE', 'Active'],
        ['stu_seed_0197', '950321104012', 'Arul', 'Rino Fernando P', 'CSE', 'Active'],
        ['stu_seed_0198', '950321104013', 'Asika', 'Begum M', 'CSE', 'Active'],
        ['stu_seed_0199', '950321104014', 'Chinnakannu', 'N', 'CSE', 'Active'],
        ['stu_seed_0200', '950321104015', 'Denni', 'Thomas', 'CSE', 'Active'],
        ['stu_seed_0201', '950321104016', 'Dhanalakshmi', 'R', 'CSE', 'Active'],
        ['stu_seed_0202', '950321104017', 'Febi', 'F William', 'CSE', 'Active'],
        ['stu_seed_0203', '950321104018', 'Iyswari', 'A', 'CSE', 'Active'],
        ['stu_seed_0204', '950321104019', 'Jenisha', 'Esther Glory K', 'CSE', 'Active'],
        ['stu_seed_0205', '950321104020', 'Jesika', 'Nuala Shenitta A', 'CSE', 'Active'],
        ['stu_seed_0206', '950321104021', 'Jeyalakshmi', 'P', 'CSE', 'Active'],
        ['stu_seed_0207', '950321104022', 'Jeya', 'Suriya M', 'CSE', 'Active'],
        ['stu_seed_0208', '950321104023', 'Joel', 'B Mathew', 'CSE', 'Active'],
        ['stu_seed_0209', '950321104025', 'Keerthana', 'S', 'CSE', 'Active'],
        ['stu_seed_0210', '950321104026', 'Madhana', 'Gopal M', 'CSE', 'Active'],
        ['stu_seed_0211', '950321104027', 'Mahalakshmi', 'M', 'CSE', 'Active'],
        ['stu_seed_0212', '950321104028', 'Mark', 'S Thomas', 'CSE', 'Active'],
        ['stu_seed_0213', '950321104029', 'Maxwel', 'Samraj Y', 'CSE', 'Active'],
        ['stu_seed_0214', '950321104030', 'Michael', 'Sudarsan J', 'CSE', 'Active'],
        ['stu_seed_0215', '950321104031', 'Muthu', 'Tamilarasan V', 'CSE', 'Active'],
        ['stu_seed_0216', '950321104032', 'Nandigama', 'Prashanth Kumar', 'CSE', 'Active'],
        ['stu_seed_0217', '950321104034', 'Oswin', 'R', 'CSE', 'Active'],
        ['stu_seed_0218', '950321104035', 'Pathra', 'I', 'CSE', 'Active'],
        ['stu_seed_0219', '950321104036', 'Periyakaruppu', 'G', 'CSE', 'Active'],
        ['stu_seed_0220', '950321104037', 'Pradeep', 'M', 'CSE', 'Active'],
        ['stu_seed_0221', '950321104039', 'Ranjith', 'R', 'CSE', 'Active'],
        ['stu_seed_0222', '950321104040', 'Raushan', 'Kumar', 'CSE', 'Active'],
        ['stu_seed_0223', '950321104041', 'Ronald', 'Das', 'CSE', 'Active'],
        ['stu_seed_0224', '950321104043', 'Santhosh', 'E', 'CSE', 'Active'],
        ['stu_seed_0225', '950321104044', 'Shankara', 'Durga V', 'CSE', 'Active'],
        ['stu_seed_0226', '950321104045', 'Sharon', 'Sajeev', 'CSE', 'Active'],
        ['stu_seed_0227', '950321104046', 'Sharumitha', 'A', 'CSE', 'Active'],
        ['stu_seed_0228', '950321104047', 'Sivaram', 'S', 'CSE', 'Active'],
        ['stu_seed_0229', '950321104048', 'Siva', 'Suriya Bala S', 'CSE', 'Active'],
        ['stu_seed_0230', '950321104049', 'Subetha', 'J', 'CSE', 'Active'],
        ['stu_seed_0231', '950321104050', 'Sudalaimani', 'R', 'CSE', 'Active'],
        ['stu_seed_0232', '950321104051', 'Suresh', 'Kumar S', 'CSE', 'Active'],
        ['stu_seed_0233', '950321104052', 'Sushant', 'Baghel', 'CSE', 'Active'],
        ['stu_seed_0234', '950321104053', 'Vennila', 'S', 'CSE', 'Active'],
        ['stu_seed_0235', '950321104054', 'Vinitha', 'A', 'CSE', 'Active'],
        ['stu_seed_0236', '950321104055', 'Vinoth', 'Ram Prakash E', 'CSE', 'Active'],
        ['stu_seed_0237', '950321104301', 'Kranti', 'Kumari', 'CSE', 'Active'],
        ['stu_seed_0238', '950321104304', 'Shanmuga', 'Kumar M', 'CSE', 'Active'],
        ['stu_seed_0239', '950322104001', 'ABDUL', 'RAHIM S', 'CSE', 'Active'],
        ['stu_seed_0240', '950322104002', 'ABISHEK', 'V', 'CSE', 'Active'],
        ['stu_seed_0241', '950322104003', 'ABRAHAM', 'RAJASINGH P', 'CSE', 'Active'],
        ['stu_seed_0242', '950322104004', 'ABU', 'FAJAL', 'CSE', 'Discontinued'],
        ['stu_seed_0243', '950322104005', 'AJIN', 'STEPHEN A', 'CSE', 'Active'],
        ['stu_seed_0244', '950322104006', 'AKASH', 'A', 'CSE', 'Active'],
        ['stu_seed_0245', '950322104007', 'AKASH', 'KUMAR', 'CSE', 'Active'],
        ['stu_seed_0246', '950322104008', 'AKSHAYA', 'J', 'CSE', 'Active'],
        ['stu_seed_0247', '950322104009', 'AMBIHA', 'V', 'CSE', 'Active'],
        ['stu_seed_0248', '950322104010', 'ANANTHA', 'KUMAR G', 'CSE', 'Active'],
        ['stu_seed_0249', '950322104011', 'ANANTHA', 'SARAVANAN B', 'CSE', 'Active'],
        ['stu_seed_0250', '950322104012', 'ANBU', 'D', 'CSE', 'Active'],
        ['stu_seed_0251', '950322104013', 'ANITHA', 'A', 'CSE', 'Active'],
        ['stu_seed_0252', '950322104014', 'ANITHA', 'M', 'CSE', 'Active'],
        ['stu_seed_0253', '950322104015', 'ANTONY', 'JEBA AASHIKA A', 'CSE', 'Active'],
        ['stu_seed_0254', '950322104016', 'ANUSHYA', 'J', 'CSE', 'Active'],
        ['stu_seed_0255', '950322104017', 'ARAVINDH', 'R', 'CSE', 'Active'],
        ['stu_seed_0256', '950322104018', 'ARTHI', 'T', 'CSE', 'Active'],
        ['stu_seed_0257', '950322104019', 'ARUL', 'JAYARAJ A', 'CSE', 'Active'],
        ['stu_seed_0258', '950322104020', 'ARUN', 'SAINI', 'CSE', 'Active'],
        ['stu_seed_0259', '950322104021', 'BUDDHA', 'YAZHINI M', 'CSE', 'Active'],
        ['stu_seed_0260', '950322104022', 'CHANDRESH', 'KUMAR PAPPU BIND', 'CSE', 'Active'],
        ['stu_seed_0261', '950322104023', 'DEEPAK', 'KUMAR BIND', 'CSE', 'Active'],
        ['stu_seed_0262', '950322104024', 'DEEPARANI', 'S', 'CSE', 'Active'],
        ['stu_seed_0263', '950322104026', 'ESAKKI', 'PANDI RAJA M', 'CSE', 'Active'],
        ['stu_seed_0264', '950322104027', 'GIPSON', 'XAVIER JEBAS A', 'CSE', 'Active'],
        ['stu_seed_0265', '950322104028', 'GOPIKA', 'J', 'CSE', 'Active'],
        ['stu_seed_0266', '950322104029', 'GOWTHAM', 'S', 'CSE', 'Active'],
        ['stu_seed_0267', '950322104030', 'GURAPNOOR', 'SHARON CHITHAMBER', 'CSE', 'Active'],
        ['stu_seed_0268', '950322104031', 'HARINI', 'G', 'CSE', 'Active'],
        ['stu_seed_0269', '950322104032', 'INDHU', 'MATHI K', 'CSE', 'Active'],
        ['stu_seed_0270', '950322104033', 'JEBASTIN', 'SAMUEL S', 'CSE', 'Active'],
        ['stu_seed_0271', '950322104034', 'JEMIMAH', 'ARPUTHAM J', 'CSE', 'Active'],
        ['stu_seed_0272', '950322104035', 'JERIL', 'P', 'CSE', 'Active'],
        ['stu_seed_0273', '950322104036', 'JERLIN', 'J', 'CSE', 'Active'],
        ['stu_seed_0274', '950322104037', 'JEYA', 'BHARATHI K', 'CSE', 'Active'],
        ['stu_seed_0275', '950322104038', 'JOHN', 'JAHAZIEL A', 'CSE', 'Active'],
        ['stu_seed_0276', '950322104040', 'JOHNSUTHAKAR', 'M', 'CSE', 'Active'],
        ['stu_seed_0277', '950322104041', 'JOYSLIN', 'A', 'CSE', 'Active'],
        ['stu_seed_0278', '950322104042', 'KALAIVANI', 'S', 'CSE', 'Active'],
        ['stu_seed_0279', '950322104043', 'KAMATCHI', 'NATHAN K', 'CSE', 'Active'],
        ['stu_seed_0280', '950322104044', 'KARTHICK', 'K', 'CSE', 'Active'],
        ['stu_seed_0281', '950322104045', 'KIRUTHIK', 'ASWANTH L', 'CSE', 'Active'],
        ['stu_seed_0282', '950322104046', 'KRISHNAN', 'K', 'CSE', 'Active'],
        ['stu_seed_0283', '950322104047', 'LOHA', 'LAKSHMI K', 'CSE', 'Active'],
        ['stu_seed_0284', '950322104048', 'MADESH', 'T', 'CSE', 'Active'],
        ['stu_seed_0285', '950322104049', 'MALAR', 'S', 'CSE', 'Active'],
        ['stu_seed_0286', '950322104050', 'MANIKANDAN', 'S', 'CSE', 'Active'],
        ['stu_seed_0287', '950322104051', 'MANIKANDA', 'PRABHU M', 'CSE', 'Active'],
        ['stu_seed_0288', '950322104052', 'MANIMEGALA', 'J', 'CSE', 'Active'],
        ['stu_seed_0289', '950322104053', 'MARIA', 'ANTONY SHERVIN R', 'CSE', 'Active'],
        ['stu_seed_0290', '950322104054', 'MATHEW', 'JERON KIRUBAI S', 'CSE', 'Active'],
        ['stu_seed_0291', '950322104056', 'MUKESHKANNAN', 'S', 'CSE', 'Active'],
        ['stu_seed_0292', '950322104057', 'MURUGESAN', 'S', 'CSE', 'Active'],
        ['stu_seed_0293', '950322104058', 'MUTHU', 'BENISHIYA R', 'CSE', 'Active'],
        ['stu_seed_0294', '950322104059', 'MUTHU', 'GAYATHRI M', 'CSE', 'Active'],
        ['stu_seed_0295', '950322104060', 'MUTHU', 'RAMANATHAN R', 'CSE', 'Active'],
        ['stu_seed_0296', '950322104061', 'MUTHU', 'ROSHINI M', 'CSE', 'Active'],
        ['stu_seed_0297', '950322104062', 'MUTHU', 'SELVAN A', 'CSE', 'Active'],
        ['stu_seed_0298', '950322104063', 'MUTHU', 'SELVI M', 'CSE', 'Active'],
        ['stu_seed_0299', '950322104064', 'NAGA', 'NARMATHA P', 'CSE', 'Active'],
        ['stu_seed_0300', '950322104065', 'NAVEEN', 'SAMRAJ H', 'CSE', 'Active'],
        ['stu_seed_0301', '950322104066', 'NAVEEN', 'V', 'CSE', 'Active'],
        ['stu_seed_0302', '950322104067', 'NERTHI', 'EBENEZER P', 'CSE', 'Active'],
        ['stu_seed_0303', '950322104070', 'PRITIRANI', 'LIMMA R', 'CSE', 'Active'],
        ['stu_seed_0304', '950322104071', 'PRIYA', 'DHARSHINI K', 'CSE', 'Active'],
        ['stu_seed_0305', '950322104072', 'PRIYADHARSHINI', 'R', 'CSE', 'Active'],
        ['stu_seed_0306', '950322104073', 'QUINCY', 'CLINTA J', 'CSE', 'Active'],
        ['stu_seed_0307', '950322104074', 'RAJALAKSHMI', 'A', 'CSE', 'Active'],
        ['stu_seed_0308', '950322104075', 'RAJA', 'PRIYA A', 'CSE', 'Active'],
        ['stu_seed_0309', '950322104076', 'RAMASELVI', 'M', 'CSE', 'Active'],
        ['stu_seed_0310', '950322104077', 'RANISH', 'T', 'CSE', 'Active'],
        ['stu_seed_0311', '950322104078', 'REVATHI', 'SELVAM N', 'CSE', 'Active'],
        ['stu_seed_0312', '950322104079', 'ROSA', 'MYSTICA M', 'CSE', 'Active'],
        ['stu_seed_0313', '950322104081', 'SAHAYA', 'SHINY VAZ A', 'CSE', 'Active'],
        ['stu_seed_0314', '950322104082', 'SAKTHI', 'SARAVANAN K', 'CSE', 'Active'],
        ['stu_seed_0315', '950322104083', 'SANGEETHA', 'PRABHA I', 'CSE', 'Active'],
        ['stu_seed_0316', '950322104084', 'SANTHIYA', 'M', 'CSE', 'Active'],
        ['stu_seed_0317', '950322104085', 'SELVA', 'BHARATH P', 'CSE', 'Active'],
        ['stu_seed_0318', '950322104086', 'SHALINI', 'A', 'CSE', 'Active'],
        ['stu_seed_0319', '950322104087', 'SHRI', 'SARANYA R', 'CSE', 'Active'],
        ['stu_seed_0320', '950322104088', 'SIMIYON', 'J', 'CSE', 'Active'],
        ['stu_seed_0321', '950322104089', 'SIRAJUDEEN', 'T', 'CSE', 'Active'],
        ['stu_seed_0322', '950322104090', 'SIVAKAMI', 'A', 'CSE', 'Active'],
        ['stu_seed_0323', '950322104091', 'SNOWFA', 'P RAYER J', 'CSE', 'Active'],
        ['stu_seed_0324', '950322104093', 'SRIMATHI', 'S', 'CSE', 'Active'],
        ['stu_seed_0325', '950322104094', 'SRIVAISHNAVI', 'M', 'CSE', 'Active'],
        ['stu_seed_0326', '950322104095', 'STANLY', 'GENO S', 'CSE', 'Active'],
        ['stu_seed_0327', '950322104096', 'SUBA', 'MALARVIZHI M', 'CSE', 'Active'],
        ['stu_seed_0328', '950322104098', 'SUSANNA', 'KUMARI', 'CSE', 'Active'],
        ['stu_seed_0329', '950322104099', 'TAMILMOZHI', 'S', 'CSE', 'Active'],
        ['stu_seed_0330', '950322104100', 'UTHAYAKUMAR', 'M', 'CSE', 'Active'],
        ['stu_seed_0331', '950322104101', 'VASANTHAN', 'B', 'CSE', 'Active'],
        ['stu_seed_0332', '950322104103', 'VISHAL', 'KUMAR', 'CSE', 'Active'],
        ['stu_seed_0333', '950322104301', 'PRAVEEN', 'M', 'CSE', 'Active'],
        ['stu_seed_0334', '950322104302', 'VASANTHAN', 'E', 'CSE', 'Active'],
        ['stu_seed_0335', '950322104701', 'JOSHUA', 'DAVIDSON J', 'CSE', 'Active'],
        ['stu_seed_0336', '950323104001', 'ABHISHEK', 'JOY', 'CSE', 'Active'],
        ['stu_seed_0337', '950323104002', 'ABISHEK', 'JEYARAJ J', 'CSE', 'Active'],
        ['stu_seed_0338', '950323104003', 'AJAY', 'S', 'CSE', 'Active'],
        ['stu_seed_0339', '950323104004', 'AMIRTHA', 'CHITHRA M', 'CSE', 'Active'],
        ['stu_seed_0340', '950323104005', 'ANDREW', 'ROHAN B', 'CSE', 'Active'],
        ['stu_seed_0341', '950323104006', 'ANNIE', 'CHRISTINA S', 'CSE', 'Active'],
        ['stu_seed_0342', '950323104007', 'ARUL', 'JOTHI M', 'CSE', 'Active'],
        ['stu_seed_0343', '950323104008', 'ARUNJUNAI', 'HARI PRASATH A', 'CSE', 'Active'],
        ['stu_seed_0344', '950323104009', 'BHAHAMPRIYAL', 'MUTHUMA', 'CSE', 'Active'],
        ['stu_seed_0345', '950323104010', 'CHANDRA', 'SHAHITHYA V', 'CSE', 'Active'],
        ['stu_seed_0346', '950323104011', 'CHANDRU', 'M', 'CSE', 'Active'],
        ['stu_seed_0347', '950323104012', 'DANI', 'PRAKASH I', 'CSE', 'Active'],
        ['stu_seed_0348', '950323104013', 'DEEPAK', 'KUMAR', 'CSE', 'Active'],
        ['stu_seed_0349', '950323104014', 'DENIAL', 'J', 'CSE', 'Active'],
        ['stu_seed_0350', '950323104015', 'DHANALAKSHMI', 'M', 'CSE', 'Active'],
        ['stu_seed_0351', '950323104016', 'DHANUSSHA', 'HARINI S', 'CSE', 'Active'],
        ['stu_seed_0352', '950323104017', 'DIVYA', 'S', 'CSE', 'Active'],
        ['stu_seed_0353', '950323104018', 'DURGA', 'DEVI M', 'CSE', 'Active'],
        ['stu_seed_0354', '950323104019', 'EDISON', 'JEYASINGH T', 'CSE', 'Active'],
        ['stu_seed_0355', '950323104020', 'ESSAKIYAPPAN', 'K', 'CSE', 'Active'],
        ['stu_seed_0356', '950323104021', 'FATHIMA', 'EPSIBA G', 'CSE', 'Active'],
        ['stu_seed_0357', '950323104022', 'FEMINA', 'J', 'CSE', 'Active'],
        ['stu_seed_0358', '950323104023', 'GODWIN', 'J', 'CSE', 'Active'],
        ['stu_seed_0359', '950323104024', 'GOLDA', 'PRAISY R', 'CSE', 'Active'],
        ['stu_seed_0360', '950323104025', 'HARIDEVAN', 'P', 'CSE', 'Active'],
        ['stu_seed_0361', '950323104026', 'HARIHARAN', 'G', 'CSE', 'Active'],
        ['stu_seed_0362', '950323104027', 'HEMIMAH', 'MATHRIN M', 'CSE', 'Active'],
        ['stu_seed_0363', '950323104028', 'ILAVARASAN', 'M', 'CSE', 'Active'],
        ['stu_seed_0364', '950323104029', 'IMMANUEL', 'A', 'CSE', 'Active'],
        ['stu_seed_0365', '950323104030', 'JASMINE', 'RUBAVATHY D', 'CSE', 'Active'],
        ['stu_seed_0366', '950323104031', 'JAYARAM', 'N', 'CSE', 'Active'],
        ['stu_seed_0367', '950323104033', 'JONATH', 'LAZAR G', 'CSE', 'Active'],
        ['stu_seed_0368', '950323104034', 'JOSEPHINE', 'JEBAMALAR J', 'CSE', 'Active'],
        ['stu_seed_0369', '950323104035', 'KAVIRAJ', 'V', 'CSE', 'Active'],
        ['stu_seed_0370', '950323104036', 'LINGA', 'MOORTHI S', 'CSE', 'Active'],
        ['stu_seed_0371', '950323104037', 'LINGA', 'SUGUMAR S', 'CSE', 'Active'],
        ['stu_seed_0372', '950323104038', 'MADANA', 'SUTHAN N', 'CSE', 'Active'],
        ['stu_seed_0373', '950323104039', 'MADHUMITHA', 'S', 'CSE', 'Active'],
        ['stu_seed_0374', '950323104040', 'MAHARAJA', 'M', 'CSE', 'Active'],
        ['stu_seed_0375', '950323104041', 'MANJULA', 'A', 'CSE', 'Active'],
        ['stu_seed_0376', '950323104042', 'MARIA', 'AGNES JOEL B', 'CSE', 'Active'],
        ['stu_seed_0377', '950323104043', 'MARY', 'V', 'CSE', 'Active'],
        ['stu_seed_0378', '950323104044', 'MAYA', 'PERUMAL M', 'CSE', 'Active'],
        ['stu_seed_0379', '950323104045', 'MILLINDA', 'J', 'CSE', 'Active'],
        ['stu_seed_0380', '950323104046', 'MOHAMED', 'AFZHALKHAN I', 'CSE', 'Active'],
        ['stu_seed_0381', '950323104047', 'MOHIT', 'KUMAR', 'CSE', 'Active'],
        ['stu_seed_0382', '950323104048', 'MONIKA', 'L', 'CSE', 'Active'],
        ['stu_seed_0383', '950323104049', 'MOSES', 'VISWIN PRINCE J', 'CSE', 'Active'],
        ['stu_seed_0384', '950323104050', 'MUTH', 'SABIKA T', 'CSE', 'Active'],
        ['stu_seed_0385', '950323104052', 'MUTHUSELVI', 'S', 'CSE', 'Active'],
        ['stu_seed_0386', '950323104053', 'MUTHU', 'VEL G', 'CSE', 'Active'],
        ['stu_seed_0387', '950323104054', 'NAGARASI', 'S', 'CSE', 'Active'],
        ['stu_seed_0388', '950323104055', 'NALINI', 'S', 'CSE', 'Active'],
        ['stu_seed_0389', '950323104056', 'NARASIMA', 'RAJA J', 'CSE', 'Active'],
        ['stu_seed_0390', '950323104057', 'NISHA', 'R', 'CSE', 'Active'],
        ['stu_seed_0391', '950323104058', 'PEVINA', 'K', 'CSE', 'Active'],
        ['stu_seed_0392', '950323104059', 'PRINCY', 'SHEKKINAH P', 'CSE', 'Active'],
        ['stu_seed_0393', '950323104060', 'RAJUL', 'R', 'CSE', 'Active'],
        ['stu_seed_0394', '950323104061', 'RAMYA', 'MADHUMATHI K', 'CSE', 'Active'],
        ['stu_seed_0395', '950323104062', 'RENNY', 'DANIEL RAJ D', 'CSE', 'Active'],
        ['stu_seed_0396', '950323104063', 'SAHAYA', 'MERLIN A', 'CSE', 'Active'],
        ['stu_seed_0397', '950323104064', 'SAM', 'BENONI AKSON I', 'CSE', 'Active'],
        ['stu_seed_0398', '950323104065', 'SARLIN', 'S', 'CSE', 'Active'],
        ['stu_seed_0399', '950323104066', 'SELVI', 'P', 'CSE', 'Active'],
        ['stu_seed_0400', '950323104067', 'SELVI', 'ESWARI C', 'CSE', 'Active'],
        ['stu_seed_0401', '950323104068', 'SHEELA', 'M', 'CSE', 'Active'],
        ['stu_seed_0402', '950323104069', 'SHEKINAH', 'BLESSY E', 'CSE', 'Active'],
        ['stu_seed_0403', '950323104070', 'STEPHEN', 'JEBADURAI J', 'CSE', 'Active'],
        ['stu_seed_0404', '950323104071', 'SUPRIYA', 'V', 'CSE', 'Active'],
        ['stu_seed_0405', '950323104072', 'SURESH', 'K', 'CSE', 'Active'],
        ['stu_seed_0406', '950323104073', 'SWEETLINE', 'GOLDA T', 'CSE', 'Active'],
        ['stu_seed_0407', '950323104074', 'THIRUMALAI', 'KARTHICK S', 'CSE', 'Active'],
        ['stu_seed_0408', '950323104301', 'ARUN', 'KAMAL M', 'CSE', 'Active'],
        ['stu_seed_0409', '950323104302', 'IMMANUEL', 'SHINE VEDHA S', 'CSE', 'Active'],
        ['stu_seed_0410', '950323104501', 'RUBIKA', 'U', 'CSE', 'Active'],
        ['stu_seed_0411', '950323104701', 'Raichal', 'Rubavathy R.S.', 'CSE', 'Active'],
        ['stu_seed_0412', '950324104001', 'ADIKESAVAN', 'M', 'CSE', 'Active'],
        ['stu_seed_0413', '950324104002', 'AKSHAYA', 'G', 'CSE', 'Active'],
        ['stu_seed_0414', '950324104003', 'AKSHAYA', 'SREE V', 'CSE', 'Active'],
        ['stu_seed_0415', '950324104004', 'ARAVIND', 'KUMAR G', 'CSE', 'Active'],
        ['stu_seed_0416', '950324104005', 'ARUMUGAJEGATHISAN', 'K', 'CSE', 'Active'],
        ['stu_seed_0417', '950324104006', 'ASWINI', 'S', 'CSE', 'Active'],
        ['stu_seed_0418', '950324104007', 'AYYALU', 'SAMY M', 'CSE', 'Active'],
        ['stu_seed_0419', '950324104008', 'DANIEL', 'S', 'CSE', 'Active'],
        ['stu_seed_0420', '950324104009', 'DEVA', 'SHARJIN D', 'CSE', 'Active'],
        ['stu_seed_0421', '950324104010', 'HARIHARAN', 'S', 'CSE', 'Active'],
        ['stu_seed_0422', '950324104011', 'HARIHARN', 'T G', 'CSE', 'Active'],
        ['stu_seed_0423', '950324104012', 'HAYDEN', 'SAMUEL J', 'CSE', 'Active'],
        ['stu_seed_0424', '950324104013', 'JENCY', 'M', 'CSE', 'Active'],
        ['stu_seed_0425', '950324104014', 'JERINA', 'A', 'CSE', 'Active'],
        ['stu_seed_0426', '950324104015', 'JESVINA', 'S', 'CSE', 'Active'],
        ['stu_seed_0427', '950324104016', 'JOTHI', 'DHIVIYA J', 'CSE', 'Active'],
        ['stu_seed_0428', '950324104017', 'KANAGA', 'ESWARI M', 'CSE', 'Active'],
        ['stu_seed_0429', '950324104018', 'KANNIYAMMAL', 'S', 'CSE', 'Active'],
        ['stu_seed_0430', '950324104019', 'KARPAGARAJA', 'V', 'CSE', 'Active'],
        ['stu_seed_0431', '950324104020', 'KARTHEESWARA', 'PERUMAL K', 'CSE', 'Active'],
        ['stu_seed_0432', '950324104021', 'KAVITHA', 'J', 'CSE', 'Active'],
        ['stu_seed_0433', '950324104022', 'KOKILA', 'M', 'CSE', 'Active'],
        ['stu_seed_0434', '950324104023', 'LINGA', 'AISHWARYA I D', 'CSE', 'Active'],
        ['stu_seed_0435', '950324104024', 'MAHARASI', 'P', 'CSE', 'Active'],
        ['stu_seed_0436', '950324104025', 'MAHESWARAN', 'C', 'CSE', 'Active'],
        ['stu_seed_0437', '950324104026', 'MAKASH', 'SHRI P V', 'CSE', 'Active'],
        ['stu_seed_0438', '950324104027', 'MANJU', 'KUMARI', 'CSE', 'Active'],
        ['stu_seed_0439', '950324104028', 'MARISARAVANAN', 'G', 'CSE', 'Active'],
        ['stu_seed_0440', '950324104029', 'MERCY', 'MENAKA J', 'CSE', 'Active'],
        ['stu_seed_0441', '950324104030', 'MOHAN', 'PRASHANTH M', 'CSE', 'Active'],
        ['stu_seed_0442', '950324104031', 'PON', 'ASWIN S', 'CSE', 'Active'],
        ['stu_seed_0443', '950324104032', 'PONDIVYA', 'P', 'CSE', 'Active'],
        ['stu_seed_0444', '950324104033', 'PONMALAR', 'K', 'CSE', 'Active'],
        ['stu_seed_0445', '950324104034', 'PRAISY', 'TECHINAH P', 'CSE', 'Active'],
        ['stu_seed_0446', '950324104035', 'PRATHIKSHA', 'T', 'CSE', 'Active'],
        ['stu_seed_0447', '950324104036', 'RAMANAAKRISHNAN', 'R', 'CSE', 'Active'],
        ['stu_seed_0448', '950324104037', 'RAVISANKAR', 'M', 'CSE', 'Active'],
        ['stu_seed_0449', '950324104038', 'REFAY', 'DARCOS R', 'CSE', 'Active'],
        ['stu_seed_0450', '950324104039', 'RESHMI', 'L', 'CSE', 'Active'],
        ['stu_seed_0451', '950324104040', 'SAMSU', 'NIHANA J', 'CSE', 'Active'],
        ['stu_seed_0452', '950324104041', 'SANTHOSH', 'S', 'CSE', 'Active'],
        ['stu_seed_0453', '950324104042', 'SANTHOSH', 'KUMAR S', 'CSE', 'Active'],
        ['stu_seed_0454', '950324104043', 'SARAVANAN', 'M', 'CSE', 'Active'],
        ['stu_seed_0455', '950324104044', 'SELVI', 'SREE M', 'CSE', 'Active'],
        ['stu_seed_0456', '950324104045', 'SIBIN', 'RENISH L', 'CSE', 'Active'],
        ['stu_seed_0457', '950324104046', 'SILVIA', 'GRACE J', 'CSE', 'Active'],
        ['stu_seed_0458', '950324104047', 'SRIYA', 'M', 'CSE', 'Active'],
        ['stu_seed_0459', '950324104048', 'SUBALAKSHMI', 'P', 'CSE', 'Active'],
        ['stu_seed_0460', '950324104049', 'SUDHAKAR', 'B', 'CSE', 'Active'],
        ['stu_seed_0461', '950324104050', 'SUJITHAA', 'DEVI P', 'CSE', 'Active'],
        ['stu_seed_0462', '950324104051', 'SUJITHA', 'RAJESWARI G', 'CSE', 'Active'],
        ['stu_seed_0463', '950324104052', 'SURYA', 'PRASATH S', 'CSE', 'Active'],
        ['stu_seed_0464', '950324104053', 'THULASI', 'K', 'CSE', 'Active'],
        ['stu_seed_0465', '950324104054', 'VALARMATHI', 'M', 'CSE', 'Active'],
        ['stu_seed_0466', '950324104055', 'VELSELVAM', 'R', 'CSE', 'Active'],
        ['stu_seed_0467', '950324104301', 'SANGEETHA', 'S', 'CSE', 'Active'],
        ['stu_seed_0468', '950324104701', 'DINESH', 'M', 'CSE', 'Active'],
        ['stu_seed_0469', '950324104702', 'FRENITA', 'JACINTH J', 'CSE', 'Active'],
        ['stu_seed_0470', '950324104703', 'FRENIZA', 'BERYL J', 'CSE', 'Active'],
        ['stu_seed_0471', '950324104902', 'THIO', 'HARISH T', 'CSE', 'Active'],
        ['stu_seed_0472', '950324405001', 'CHALCEDONY', 'J', 'CSE', 'Active'],
        ['stu_seed_0473', '950324405002', 'JEBAMALAR', 'P', 'CSE', 'Active'],
        ['stu_seed_0474', '950324405003', 'KANAGAVALLI', 'P', 'CSE', 'Active'],
        ['stu_seed_0475', '950324405005', 'VAIJAYANTHIMALA', 'M', 'CSE', 'Active'],
        ['stu_seed_0476', '950325104001', 'ABI', 'B', 'CSE', 'Active'],
        ['stu_seed_0477', '950325104002', 'ABINAYA', 'S', 'CSE', 'Active'],
        ['stu_seed_0478', '950325104003', 'ABISHEK', 'A', 'CSE', 'Active'],
        ['stu_seed_0479', '950325104004', 'ABISHEK', 'PRINCE S', 'CSE', 'Active'],
        ['stu_seed_0480', '950325104005', 'AKASH', 'G', 'CSE', 'Active'],
        ['stu_seed_0481', '950325104006', 'ANGEL', 'G', 'CSE', 'Active'],
        ['stu_seed_0482', '950325104007', 'ANNIE', 'MARY M', 'CSE', 'Active'],
        ['stu_seed_0483', '950325104008', 'ANTON', 'JAMES M', 'CSE', 'Active'],
        ['stu_seed_0484', '950325104009', 'ANTONY', 'BENIEL RAJ A', 'CSE', 'Active'],
        ['stu_seed_0485', '950325104010', 'APEKSHA', 'ANIL GAVIT', 'CSE', 'Active'],
        ['stu_seed_0486', '950325104011', 'AROCKIA', 'MERCY GOPIKA A', 'CSE', 'Active'],
        ['stu_seed_0487', '950325104012', 'ARULMANI', 'A', 'CSE', 'Active'],
        ['stu_seed_0488', '950325104013', 'BALA', 'SUNDARAM H', 'CSE', 'Active'],
        ['stu_seed_0489', '950325104014', 'BRIGITHMARY', 'S', 'CSE', 'Active'],
        ['stu_seed_0490', '950325104015', 'DEEPA', 'A', 'CSE', 'Active'],
        ['stu_seed_0491', '950325104016', 'DEEPIKA', 'S', 'CSE', 'Active'],
        ['stu_seed_0492', '950325104017', 'DIVYA', 'S', 'CSE', 'Active'],
        ['stu_seed_0493', '950325104018', 'ISHWARYA', 'LAKSHMI V', 'CSE', 'Active'],
        ['stu_seed_0494', '950325104019', 'JAIRO', 'JACOB J', 'CSE', 'Active'],
        ['stu_seed_0495', '950325104020', 'JANANI', 'G', 'CSE', 'Active'],
        ['stu_seed_0496', '950325104021', 'JEBAKUMAR', 'R', 'CSE', 'Active'],
        ['stu_seed_0497', '950325104022', 'JESU', 'MARIA ARON R', 'CSE', 'Active'],
        ['stu_seed_0498', '950325104023', 'JEYASREE', 'S', 'CSE', 'Active'],
        ['stu_seed_0499', '950325104024', 'JOHN', 'JEFFRIN G', 'CSE', 'Active'],
        ['stu_seed_0500', '950325104025', 'JOSHAN', 'SELVABALAN D', 'CSE', 'Active'],
        ['stu_seed_0501', '950325104026', 'JOSUVA', 'P', 'CSE', 'Active'],
        ['stu_seed_0502', '950325104027', 'KALIGANGA', 'M', 'CSE', 'Active'],
        ['stu_seed_0503', '950325104028', 'KANI', 'M', 'CSE', 'Active'],
        ['stu_seed_0504', '950325104029', 'KARTHIKA', 'M', 'CSE', 'Active'],
        ['stu_seed_0505', '950325104030', 'KAVIPRIYA', 'E', 'CSE', 'Active'],
        ['stu_seed_0506', '950325104031', 'LEEMA', 'CHRISTY A', 'CSE', 'Active'],
        ['stu_seed_0507', '950325104032', 'MANOJ', 'KUMAR G', 'CSE', 'Active'],
        ['stu_seed_0508', '950325104033', 'MARIA', 'VENNILA P', 'CSE', 'Active'],
        ['stu_seed_0509', '950325104034', 'MATHESH', 'E', 'CSE', 'Active'],
        ['stu_seed_0510', '950325104035', 'MAXIMAS', 'A', 'CSE', 'Active'],
        ['stu_seed_0511', '950325104036', 'MOHAN', 'RAJ L', 'CSE', 'Active'],
        ['stu_seed_0512', '950325104037', 'MONIKA', 'M', 'CSE', 'Active'],
        ['stu_seed_0513', '950325104038', 'NAGUL', 'UDHAYA SIVAN V S', 'CSE', 'Active'],
        ['stu_seed_0514', '950325104039', 'PATRIC', 'JOSHUA M', 'CSE', 'Active'],
        ['stu_seed_0515', '950325104040', 'PONFRANCIS', 'G', 'CSE', 'Active'],
        ['stu_seed_0516', '950325104041', 'PRATHICKSHA', 'B', 'CSE', 'Active'],
        ['stu_seed_0517', '950325104042', 'PRIYADHARSHINI', 'M', 'CSE', 'Active'],
        ['stu_seed_0518', '950325104043', 'RAJAN', 'L', 'CSE', 'Active'],
        ['stu_seed_0519', '950325104044', 'RANJANI', 'R', 'CSE', 'Active'],
        ['stu_seed_0520', '950325104045', 'ROHITH', 'B', 'CSE', 'Active'],
        ['stu_seed_0521', '950325104046', 'ROSELIN', 'SWEETY J', 'CSE', 'Active'],
        ['stu_seed_0522', '950325104047', 'RUBAN', 'S', 'CSE', 'Active'],
        ['stu_seed_0523', '950325104048', 'SANTHI', 'T', 'CSE', 'Active'],
        ['stu_seed_0524', '950325104049', 'SANTHIYA', 'S', 'CSE', 'Active'],
        ['stu_seed_0525', '950325104050', 'SANTHOSH', 'B', 'CSE', 'Active'],
        ['stu_seed_0526', '950325104051', 'SANTHOSH', 'C', 'CSE', 'Active'],
        ['stu_seed_0527', '950325104052', 'SARAVANAN', 'I', 'CSE', 'Active'],
        ['stu_seed_0528', '950325104053', 'SATHISHKUMAR', 'S', 'CSE', 'Active'],
        ['stu_seed_0529', '950325104054', 'SELVARANI', 'D', 'CSE', 'Active'],
        ['stu_seed_0530', '950325104055', 'SHANMUGA', 'SUNDARI R', 'CSE', 'Active'],
        ['stu_seed_0531', '950325104056', 'SHANMUGI', 'V', 'CSE', 'Active'],
        ['stu_seed_0532', '950325104057', 'SHINY', 'T', 'CSE', 'Active'],
        ['stu_seed_0533', '950325104058', 'SOLAIRAJ', 'E', 'CSE', 'Active'],
        ['stu_seed_0534', '950325104059', 'SUJITHA', 'J', 'CSE', 'Active'],
        ['stu_seed_0535', '121', 'Alaaudeen', '', 'CSE A', 'Active'],
        ['stu_seed_0536', '9894859691', 'Gowtham', '', 'CSE A', 'Active'],
        ['stu_seed_0537', '950320106001', 'Abena', 'V', 'ECE', 'Active'],
        ['stu_seed_0538', '950320106002', 'Abiseha', 'M', 'ECE', 'Active'],
        ['stu_seed_0539', '950320106003', 'Abisha', 'S', 'ECE', 'Active'],
        ['stu_seed_0540', '950320106005', 'Abithatherasa', 'A', 'ECE', 'Active'],
        ['stu_seed_0541', '950320106006', 'Adlin', 'Jothika TK', 'ECE', 'Active'],
        ['stu_seed_0542', '950320106007', 'Ajithkumar', 's', 'ECE', 'Active'],
        ['stu_seed_0543', '950320106008', 'Amala', 'prathisha S', 'ECE', 'Active'],
        ['stu_seed_0544', '950320106009', 'ANTO', 'ROHAN P', 'ECE', 'Active'],
        ['stu_seed_0545', '950320106010', 'Bala', 'Jana J', 'ECE', 'Active'],
        ['stu_seed_0546', '950320106011', 'Durga', 'Devi M', 'ECE', 'Active'],
        ['stu_seed_0547', '950320106012', 'Esther', 'Sony V', 'ECE', 'Active'],
        ['stu_seed_0548', '950320106013', 'Gandhiraj', 'K', 'ECE', 'Active'],
        ['stu_seed_0549', '950320106014', 'Harini', 'Lakshmi C', 'ECE', 'Active'],
        ['stu_seed_0550', '950320106015', 'Jebrin', 'Shini J', 'ECE', 'Active'],
        ['stu_seed_0551', '950320106016', 'Jenifer', 'Jasmine E', 'ECE', 'Active'],
        ['stu_seed_0552', '950320106017', 'Jeyanthi', 'R', 'ECE', 'Active'],
        ['stu_seed_0553', '950320106018', 'KUMARAVEL', 'M', 'ECE', 'Active'],
        ['stu_seed_0554', '950320106019', 'MEJACKSON', 'S', 'ECE', 'Active'],
        ['stu_seed_0555', '950320106021', 'MUTHUVIJAY', 'C', 'ECE', 'Active'],
        ['stu_seed_0556', '950320106024', 'Rajeshmuthu', 'T', 'ECE', 'Active'],
        ['stu_seed_0557', '950320106025', 'Rose', 'Angel C', 'ECE', 'Active'],
        ['stu_seed_0558', '950320106026', 'Soundararaj', 'P', 'ECE', 'Active'],
        ['stu_seed_0559', '950320106027', 'Sreeja', 'U', 'ECE', 'Active'],
        ['stu_seed_0560', '950320106028', 'SrinivasaVignesh', 'M', 'ECE', 'Active'],
        ['stu_seed_0561', '950320106029', 'Sriram', 'N', 'ECE', 'Active'],
        ['stu_seed_0562', '950320106030', 'Sruthiga', 'K', 'ECE', 'Active'],
        ['stu_seed_0563', '950320106031', 'Stanesleebiju', 'B', 'ECE', 'Active'],
        ['stu_seed_0564', '950320106032', 'Thirupathiraja', 'K', 'ECE', 'Active'],
        ['stu_seed_0565', '950320106033', 'vivek', 'H', 'ECE', 'Active'],
        ['stu_seed_0566', '950320106301', 'Anbhananthan', 'B', 'ECE', 'Active'],
        ['stu_seed_0567', '950320106303', 'Manju', 'R', 'ECE', 'Active'],
        ['stu_seed_0568', '950320106306', 'Pooja', 'Shree B', 'ECE', 'Active'],
        ['stu_seed_0569', '950321106001', 'Aasha', 'M', 'ECE', 'Active'],
        ['stu_seed_0570', '950321106002', 'Abhinaya', 'S', 'ECE', 'Active'],
        ['stu_seed_0571', '950321106003', 'Aman', 'Kumar', 'ECE', 'Active'],
        ['stu_seed_0572', '950321106004', 'Amira', 'Mabel Samathanam A A', 'ECE', 'Active'],
        ['stu_seed_0573', '950321106005', 'Antony', 'Selva Jebansha A', 'ECE', 'Active'],
        ['stu_seed_0574', '950321106007', 'Balasundar', 'R', 'ECE', 'Active'],
        ['stu_seed_0575', '950321106008', 'Dinesh', 'J', 'ECE', 'Active'],
        ['stu_seed_0576', '950321106009', 'Godjin', 'Damy S S', 'ECE', 'Active'],
        ['stu_seed_0577', '950321106011', 'Hari', 'S', 'ECE', 'Active'],
        ['stu_seed_0578', '950321106012', 'Jerin', 'P Jose', 'ECE', 'Active'],
        ['stu_seed_0579', '950321106013', 'Jeron', 'R', 'ECE', 'Active'],
        ['stu_seed_0580', '950321106014', 'Jeyapriya', 'M', 'ECE', 'Active'],
        ['stu_seed_0581', '950321106015', 'Karthiga', 'S', 'ECE', 'Active'],
        ['stu_seed_0582', '950321106016', 'Leela', 'Devi V', 'ECE', 'Active'],
        ['stu_seed_0583', '950321106017', 'Manoj', 'P', 'ECE', 'Active'],
        ['stu_seed_0584', '950321106018', 'Mari', 'Devi P', 'ECE', 'Active'],
        ['stu_seed_0585', '950321106020', 'Nicolas', 'Marandi', 'ECE', 'Active'],
        ['stu_seed_0586', '950321106021', 'Paraloga', 'Santhiya Jo M', 'ECE', 'Active'],
        ['stu_seed_0587', '950321106022', 'Prami', 'Jenitta R', 'ECE', 'Active'],
        ['stu_seed_0588', '950321106023', 'Pranav', 'A', 'ECE', 'Active'],
        ['stu_seed_0589', '950321106025', 'Santhiya', 'Jessica B', 'ECE', 'Active'],
        ['stu_seed_0590', '950321106026', 'Sasdika', 'E', 'ECE', 'Active'],
        ['stu_seed_0591', '950321106027', 'Shinose', 'S', 'ECE', 'Active'],
        ['stu_seed_0592', '950321106028', 'Shunmugasundari', 'M', 'ECE', 'Active'],
        ['stu_seed_0593', '950321106029', 'Srimahavignesh', 'C', 'ECE', 'Active'],
        ['stu_seed_0594', '950321106030', 'Tannu', '', 'ECE', 'Active'],
        ['stu_seed_0595', '950321106031', 'Thanga', 'mariappan M', 'ECE', 'Active'],
        ['stu_seed_0596', '950321106032', 'Uthaya', 'Ganesh M', 'ECE', 'Active'],
        ['stu_seed_0597', '950321106301', 'Aravinth', 'B', 'ECE', 'Active'],
        ['stu_seed_0598', '950322106001', 'ARUNA', 'C', 'ECE', 'Active'],
        ['stu_seed_0599', '950322106002', 'BALA', 'MURUGESHWARI P', 'ECE', 'Active'],
        ['stu_seed_0600', '950322106003', 'BHARKAVI', 'M', 'ECE', 'Active'],
        ['stu_seed_0601', '950322106004', 'BOOMIKA', 'MARI S', 'ECE', 'Active'],
        ['stu_seed_0602', '950322106005', 'DANIEL', 'L', 'ECE', 'Active'],
        ['stu_seed_0603', '950322106006', 'HARINI', 'S', 'ECE', 'Active'],
        ['stu_seed_0604', '950322106007', 'JERSON', 'ABRAHAM S', 'ECE', 'Active'],
        ['stu_seed_0605', '950322106008', 'JOEL', 'RAJ G', 'ECE', 'Active'],
        ['stu_seed_0606', '950322106009', 'MOHAMMED', 'ZAHEER K', 'ECE', 'Active'],
        ['stu_seed_0607', '950322106010', 'NANCY', 'MARIYA A', 'ECE', 'Active'],
        ['stu_seed_0608', '950322106011', 'PARTHIBAN', 'N', 'ECE', 'Active'],
        ['stu_seed_0609', '950322106012', 'SAKTHI', 'RAJA V', 'ECE', 'Active'],
        ['stu_seed_0610', '950322106013', 'SARMILA', 'P', 'ECE', 'Active'],
        ['stu_seed_0611', '950322106014', 'SATHYABAMA', 'R', 'ECE', 'Active'],
        ['stu_seed_0612', '950322106015', 'SIVANANTHINI', 'S', 'ECE', 'Active'],
        ['stu_seed_0613', '950322106016', 'SURESH', 'S', 'ECE', 'Active'],
        ['stu_seed_0614', '950322106018', 'VIJAYAN', 'S', 'ECE', 'Active'],
        ['stu_seed_0615', '950322106302', 'THAMBI', 'RAJ S', 'ECE', 'Active'],
        ['stu_seed_0616', '950322106501', 'GOWRI', 'SANKAR M', 'ECE', 'Active'],
        ['stu_seed_0617', '950323106001', 'AJITHA', 'M', 'ECE', 'Active'],
        ['stu_seed_0618', '950323106002', 'ANU', 'JEYASRI P', 'ECE', 'Active'],
        ['stu_seed_0619', '950323106003', 'ASHWANTH', '', 'ECE', 'Active'],
        ['stu_seed_0620', '950323106004', 'ASVATHI', 'A', 'ECE', 'Active'],
        ['stu_seed_0621', '950323106005', 'ATHISHA', 'D', 'ECE', 'Active'],
        ['stu_seed_0622', '950323106006', 'CHRISTAN', 'MARK KENNEDY', 'ECE', 'Active'],
        ['stu_seed_0623', '950323106007', 'DEVA', 'DHARSHINI R', 'ECE', 'Active'],
        ['stu_seed_0624', '950323106008', 'DIVYA', 'M', 'ECE', 'Active'],
        ['stu_seed_0625', '950323106009', 'IMMANUEL', 'PRAVIN D', 'ECE', 'Active'],
        ['stu_seed_0626', '950323106010', 'JEYA', 'SHREE G', 'ECE', 'Active'],
        ['stu_seed_0627', '950323106011', 'KESHIYA', 'P', 'ECE', 'Active'],
        ['stu_seed_0628', '950323106012', 'KOSALRAMAN', 'S', 'ECE', 'Active'],
        ['stu_seed_0629', '950323106013', 'NIRANCHANA', 'DEVI G', 'ECE', 'Active'],
        ['stu_seed_0630', '950323106014', 'PARTHEBAN', 'P', 'ECE', 'Active'],
        ['stu_seed_0631', '950323106015', 'PETCHI', 'THANGAM G', 'ECE', 'Active'],
        ['stu_seed_0632', '950323106016', 'SANTHIYA', 'MARY A', 'ECE', 'Active'],
        ['stu_seed_0633', '950323106017', 'SELVA', 'G', 'ECE', 'Active'],
        ['stu_seed_0634', '950323106018', 'SELVA', 'RAGHAVI P', 'ECE', 'Active'],
        ['stu_seed_0635', '950323106019', 'SIVALINGAM', 'T', 'ECE', 'Active'],
        ['stu_seed_0636', '950323106020', 'SUMITHA', 'RANI M', 'ECE', 'Active'],
        ['stu_seed_0637', '950324106001', 'ANGELIN', 'RACHEL E', 'ECE', 'Active'],
        ['stu_seed_0638', '950324106002', 'ARPUTHARAJ', 'G', 'ECE', 'Active'],
        ['stu_seed_0639', '950324106003', 'ASHISHRAM', 'S', 'ECE', 'Active'],
        ['stu_seed_0640', '950324106004', 'BEAULAH', 'P', 'ECE', 'Active'],
        ['stu_seed_0641', '950324106005', 'DIVYABHARATHI', '', 'ECE', 'Active'],
        ['stu_seed_0642', '950324106006', 'EBENEZER', 'D', 'ECE', 'Active'],
        ['stu_seed_0643', '950324106007', 'ELAKKIYAN', 'P', 'ECE', 'Active'],
        ['stu_seed_0644', '950324106009', 'INFANT', 'JOEL M', 'ECE', 'Active'],
        ['stu_seed_0645', '950324106010', 'ISRAEL', 'M', 'ECE', 'Active'],
        ['stu_seed_0646', '950324106011', 'JEBA', 'GNANA PRABHU P', 'ECE', 'Active'],
        ['stu_seed_0647', '950324106012', 'JENEE', 'J', 'ECE', 'Active'],
        ['stu_seed_0648', '950324106013', 'Jeyarahul', '', 'ECE', 'Active'],
        ['stu_seed_0649', '950324106014', 'KARPHAGA', 'KARTHIGA M', 'ECE', 'Active'],
        ['stu_seed_0650', '950324106015', 'KIRAN', 'KUMAR S', 'ECE', 'Active'],
        ['stu_seed_0651', '950324106016', 'LATHIKASREE', 'S', 'ECE', 'Active'],
        ['stu_seed_0652', '950324106017', 'MUTHUKARTHIKEYAN', 'J', 'ECE', 'Active'],
        ['stu_seed_0653', '950324106018', 'MUTHU', 'RAJA KUMAR C', 'ECE', 'Active'],
        ['stu_seed_0654', '950324106019', 'MUTHUSUBASH', 'S', 'ECE', 'Active'],
        ['stu_seed_0655', '950324106020', 'NAVENEETHAN', 'S', 'ECE', 'Active'],
        ['stu_seed_0656', '950324106021', 'NIRESH', 'T', 'ECE', 'Active'],
        ['stu_seed_0657', '950324106022', 'RASIGA', 'S', 'ECE', 'Active'],
        ['stu_seed_0658', '950324106023', 'REJEESH', 'R', 'ECE', 'Active'],
        ['stu_seed_0659', '950324106024', 'ROHITH', 'P', 'ECE', 'Active'],
        ['stu_seed_0660', '950324106025', 'SANTHANA', 'KUMAR S', 'ECE', 'Active'],
        ['stu_seed_0661', '950324106026', 'SATHYA', 'SEELAN M', 'ECE', 'Active'],
        ['stu_seed_0662', '950324106027', 'SELVAM', 'I', 'ECE', 'Active'],
        ['stu_seed_0663', '950324106028', 'SIVASAKTHI', 'R', 'ECE', 'Active'],
        ['stu_seed_0664', '950324106029', 'SRI', 'ISHWARYA S', 'ECE', 'Active'],
        ['stu_seed_0665', '950325106001', 'AAKASH', 'S', 'ECE', 'Active'],
        ['stu_seed_0666', '950325106002', 'AKILA', 'K', 'ECE', 'Active'],
        ['stu_seed_0667', '950325106003', 'ALL', 'STAR KING S', 'ECE', 'Active'],
        ['stu_seed_0668', '950325106004', 'AYYAR', 'RAJA T', 'ECE', 'Active'],
        ['stu_seed_0669', '950325106005', 'BALA', 'KARTHHESAN G', 'ECE', 'Active'],
        ['stu_seed_0670', '950325106006', 'DEVA', 'DHANUSHIYA J', 'ECE', 'Active'],
        ['stu_seed_0671', '950325106007', 'DHAKSHYANI', 'G', 'ECE', 'Active'],
        ['stu_seed_0672', '950325106008', 'HARIHARAN', 'I', 'ECE', 'Active'],
        ['stu_seed_0673', '950325106009', 'JASMINE', 'G', 'ECE', 'Active'],
        ['stu_seed_0674', '950325106010', 'JAYAK', 'KUMAR S', 'ECE', 'Active'],
        ['stu_seed_0675', '950325106011', 'JEBASTIN', 'J', 'ECE', 'Active'],
        ['stu_seed_0676', '950325106012', 'JESSWIN', 'D', 'ECE', 'Active'],
        ['stu_seed_0677', '950325106013', 'JOSHUA', 'SAMRAJ J', 'ECE', 'Active'],
        ['stu_seed_0678', '950325106014', 'JOYSELIN', 'PRAISY J', 'ECE', 'Active'],
        ['stu_seed_0679', '950325106015', 'KARTHIKA', 'M', 'ECE', 'Active'],
        ['stu_seed_0680', '950325106016', 'KEERTHIKA', 'M', 'ECE', 'Active'],
        ['stu_seed_0681', '950325106017', 'MAHESHA', 'M', 'ECE', 'Active'],
        ['stu_seed_0682', '950325106018', 'MELCHI', 'ZEDEK D', 'ECE', 'Active'],
        ['stu_seed_0683', '950325106019', 'MERCY', 'R', 'ECE', 'Active'],
        ['stu_seed_0684', '950325106020', 'MUTHU', 'VIJAYAN M', 'ECE', 'Active'],
        ['stu_seed_0685', '950325106021', 'NASIFA', 'FATHIMA N', 'ECE', 'Active'],
        ['stu_seed_0686', '950325106022', 'NAVASUTHAN', 'S', 'ECE', 'Active'],
        ['stu_seed_0687', '950325106023', 'NIKILA', 'SIVA SORNA N', 'ECE', 'Active'],
        ['stu_seed_0688', '950325106024', 'PERIYA', 'KARUPPASAMY G', 'ECE', 'Active'],
        ['stu_seed_0689', '950325106025', 'PRIYA', 'DHARSHINI C', 'ECE', 'Active'],
        ['stu_seed_0690', '950325106026', 'SAHANA', 'GAYATHRI S', 'ECE', 'Active'],
        ['stu_seed_0691', '950325106027', 'SIVAPRIYA', 'G', 'ECE', 'Active'],
        ['stu_seed_0692', '950325106028', 'TERRY', 'SHEBANA E', 'ECE', 'Active'],
        ['stu_seed_0693', '950325106029', 'VENUSHA', 'P', 'ECE', 'Active'],
        ['stu_seed_0694', '950325106030', 'VINOTH', 'K', 'ECE', 'Active'],
        ['stu_seed_0695', '950320105011', 'NAVEEN', 'RAJ S', 'EEE', 'Active'],
        ['stu_seed_0696', '950320105307', 'JERIN', 'P', 'EEE', 'Active'],
        ['stu_seed_0697', '950320105310', 'NAVEENKUMAR', 'S', 'EEE', 'Active'],
        ['stu_seed_0698', '950321105004', 'ELSHADAI', 'DE SILVA R', 'EEE', 'Active'],
        ['stu_seed_0699', '950321105008', 'MURUGADHARANI', 'K', 'EEE', 'Active'],
        ['stu_seed_0700', '950321105009', 'SANJAY', 'KUMAR', 'EEE', 'Active'],
        ['stu_seed_0701', '950321105301', 'JEFFERSON', 'J', 'EEE', 'Active'],
        ['stu_seed_0702', '950321105302', 'JOEL', 'JOSUVA J', 'EEE', 'Active'],
        ['stu_seed_0703', '950322105001', 'ARUL', 'RAJA A', 'EEE', 'Active'],
        ['stu_seed_0704', '950322105002', 'ARUN', 'KUMAR M', 'EEE', 'Active'],
        ['stu_seed_0705', '950322105003', 'ARUN', 'NEVIS P', 'EEE', 'Active'],
        ['stu_seed_0706', '950322105004', 'BASKAR', 'P', 'EEE', 'Active'],
        ['stu_seed_0707', '950322105005', 'EBENEZER', 'PAL S', 'EEE', 'Active'],
        ['stu_seed_0708', '950322105006', 'EINSTEIN', 'JEBAKUMAR S', 'EEE', 'Active'],
        ['stu_seed_0709', '950322105007', 'JASMINE', 'BEAULAH A', 'EEE', 'Active'],
        ['stu_seed_0710', '950322105008', 'JEFFRAY', 'JABEZ D', 'EEE', 'Active'],
        ['stu_seed_0711', '950322105010', 'KERSOME', 'C', 'EEE', 'Active'],
        ['stu_seed_0712', '950322105011', 'MURUGAVALLI', 'K', 'EEE', 'Active'],
        ['stu_seed_0713', '950322105012', 'MUTHU', 'MARI C', 'EEE', 'Active'],
        ['stu_seed_0714', '950322105013', 'NAVEEN', 'KUMAR S', 'EEE', 'Active'],
        ['stu_seed_0715', '950322105015', 'PRAVIN', 'AZARIA E', 'EEE', 'Active'],
        ['stu_seed_0716', '950322105016', 'VARUN', 'SATHISH R', 'EEE', 'Active'],
        ['stu_seed_0717', '950322105017', 'VARUN', 'SATHISH R', 'EEE', 'Active'],
        ['stu_seed_0718', '950322105302', 'MUTHU', 'RAMAN', 'EEE', 'Active'],
        ['stu_seed_0719', '950323105001', 'ABISHEK', 'C', 'EEE', 'Active'],
        ['stu_seed_0720', '950323105002', 'ANTONY', 'SACHIN A', 'EEE', 'Active'],
        ['stu_seed_0721', '950323105003', 'KARTHIKEYAN', 'K', 'EEE', 'Active'],
        ['stu_seed_0722', '950323105004', 'KRISHNA', 'KUMAR V', 'EEE', 'Active'],
        ['stu_seed_0723', '950323105006', 'VIGNESH', 'RAJA P', 'EEE', 'Active'],
        ['stu_seed_0724', '950323105301', 'RAMA', 'DEVI', 'EEE', 'Active'],
        ['stu_seed_0725', '950323105901', 'ARPUTHA', 'JEEVA', 'EEE', 'Active'],
        ['stu_seed_0726', '950324105001', 'ARUN', 'KUMAR R', 'EEE', 'Active'],
        ['stu_seed_0727', '950324105002', 'BALAKAMAL', 'G', 'EEE', 'Active'],
        ['stu_seed_0728', '950324105003', 'KISHORE', 'M', 'EEE', 'Active'],
        ['stu_seed_0729', '950324105004', 'MARI', 'SANMUGAM A', 'EEE', 'Active'],
        ['stu_seed_0730', '950324105005', 'NELSON', 'IMMANUEL D', 'EEE', 'Active'],
        ['stu_seed_0731', '950324105006', 'NIRMAL', 'V', 'EEE', 'Active'],
        ['stu_seed_0732', '950324105007', 'PRIYA', 'SHALINI R', 'EEE', 'Active'],
        ['stu_seed_0733', '950324105009', 'UMAYA', 'BALAN M', 'EEE', 'Active'],
        ['stu_seed_0734', '950324105302', 'PRADEEP', 'M', 'EEE', 'Active'],
        ['stu_seed_0735', '950324105303', 'SIBI', 'M', 'EEE', 'Active'],
        ['stu_seed_0736', '950325105001', 'ALAN', 'B', 'EEE', 'Active'],
        ['stu_seed_0737', '950325105002', 'ATHI', 'TAMILARASAN M', 'EEE', 'Active'],
        ['stu_seed_0738', '950325105003', 'BALA', 'SUYAMBU M', 'EEE', 'Active'],
        ['stu_seed_0739', '950325105004', 'DICKSON', 'DANIEL N', 'EEE', 'Active'],
        ['stu_seed_0740', '950325105005', 'GOWTHAM', 'V', 'EEE', 'Active'],
        ['stu_seed_0741', '950325105006', 'GOWTHAM', 'RAJ M', 'EEE', 'Active'],
        ['stu_seed_0742', '950325105007', 'ISANTH', 'MARK A', 'EEE', 'Active'],
        ['stu_seed_0743', '950325105008', 'JOE', 'SHARON A', 'EEE', 'Active'],
        ['stu_seed_0744', '950325105009', 'KARUPPAIYA', 'N', 'EEE', 'Active'],
        ['stu_seed_0745', '950325105010', 'MADHAVAN', 'RAJ R', 'EEE', 'Active'],
        ['stu_seed_0746', '950325105011', 'MANIKANDAN', 'M', 'EEE', 'Active'],
        ['stu_seed_0747', '950325105012', 'MARI', 'SELVAM M', 'EEE', 'Active'],
        ['stu_seed_0748', '950325105013', 'MARISHWARAN', 'U', 'EEE', 'Active'],
        ['stu_seed_0749', '950325105014', 'MICHAEL', 'BEVAN M', 'EEE', 'Active'],
        ['stu_seed_0750', '950325105015', 'MUTHUMARI', 'G', 'EEE', 'Active'],
        ['stu_seed_0751', '950325105016', 'NICHOLAS', 'JANGID G', 'EEE', 'Active'],
        ['stu_seed_0752', '950325105017', 'PONSEETHALAKSHMI', 'S', 'EEE', 'Active'],
        ['stu_seed_0753', '950325105018', 'RAGLAND', 'K', 'EEE', 'Active'],
        ['stu_seed_0754', '950325105019', 'RAJA', 'MARIMUTHU S', 'EEE', 'Active'],
        ['stu_seed_0755', '950325105020', 'RAMKUMAR', 'P', 'EEE', 'Active'],
        ['stu_seed_0756', '950325105021', 'RAVEENA', 'M', 'EEE', 'Active'],
        ['stu_seed_0757', '950325105022', 'ROBIN', 'R', 'EEE', 'Active'],
        ['stu_seed_0758', '950325105023', 'ROSHINI', 'ELEZABETH S', 'EEE', 'Active'],
        ['stu_seed_0759', '950325105024', 'SHEBA', 'T', 'EEE', 'Active'],
        ['stu_seed_0760', '950325105025', 'SIVA', 'SANKARI M', 'EEE', 'Active'],
        ['stu_seed_0761', '950325105026', 'SYED', 'RIZWAN M', 'EEE', 'Active'],
        ['stu_seed_0762', '950325105027', 'UDAYA', 'SUDHAN M', 'EEE', 'Active'],
        ['stu_seed_0763', '950325105028', 'VIGNESHWARAN', 'M', 'EEE', 'Active'],
        ['stu_seed_0764', '950325105029', 'CHARLES', 'JEBAKUMAR P', 'EEE', 'Active'],
        ['stu_seed_0765', '950324411004', 'MURUGIAH', 'S', 'M.E (PS)', 'Active'],
        ['stu_seed_0766', '95032441501', 'Melcy', 'pushpham m', 'M.E (PS)', 'Active'],
        ['stu_seed_0767', '950324411501', 'Melcy', 'pushpham m', 'M.E(PS)', 'Active'],
        ['stu_seed_0768', '950322631001', 'Aakash', 'R', 'MBA', 'Active'],
        ['stu_seed_0769', '950322631002', 'Balamurugan', 'M', 'MBA', 'Active'],
        ['stu_seed_0770', '950322631003', 'Daniel', 'Ebinezer D', 'MBA', 'Active'],
        ['stu_seed_0771', '950322631004', 'David', 'Livingstone J', 'MBA', 'Active'],
        ['stu_seed_0772', '950322631006', 'Maria', 'Judis Jeffrin S', 'MBA', 'Active'],
        ['stu_seed_0773', '950322631007', 'Marimuthu', 'N', 'MBA', 'Active'],
        ['stu_seed_0774', '950322631008', 'Marimuthu', 'T', 'MBA', 'Active'],
        ['stu_seed_0775', '950322631009', 'Muthumalini', 'V', 'MBA', 'Active'],
        ['stu_seed_0776', '950322631010', 'Nandhini', 'J', 'MBA', 'Active'],
        ['stu_seed_0777', '950322631011', 'Pandimeena', 'M', 'MBA', 'Active'],
        ['stu_seed_0778', '950322631012', 'Pavithra', 'R', 'MBA', 'Active'],
        ['stu_seed_0779', '950322631013', 'Sakthivel', 'S', 'MBA', 'Active'],
        ['stu_seed_0780', '950322631014', 'Sathish', 'M', 'MBA', 'Active'],
        ['stu_seed_0781', '950322631015', 'Sthevan', 'J', 'MBA', 'Active'],
        ['stu_seed_0782', '950322631016', 'Vidhya', 'T', 'MBA', 'Active'],
        ['stu_seed_0783', '950323631001', 'AARTHI.', 'G', 'MBA', 'Active'],
        ['stu_seed_0784', '950323631002', 'ABISHEK.', 'R', 'MBA', 'Active'],
        ['stu_seed_0785', '950323631003', 'ABISHEKA.', 'K', 'MBA', 'Active'],
        ['stu_seed_0786', '950323631004', 'AJAY', 'KUMARAN. S', 'MBA', 'Active'],
        ['stu_seed_0787', '950323631005', 'AMALRAJ.', 'J', 'MBA', 'Active'],
        ['stu_seed_0788', '950323631006', 'AMIRTHA.', 'S', 'MBA', 'Active'],
        ['stu_seed_0789', '950323631007', 'ANTONY', 'JEROFIN. D', 'MBA', 'Active'],
        ['stu_seed_0790', '950323631008', 'ARAVINDH.', 'P', 'MBA', 'Active'],
        ['stu_seed_0791', '950323631009', 'ARUNACHALA', 'BHARATH. A', 'MBA', 'Active'],
        ['stu_seed_0792', '950323631010', 'BALAGANAPATHY.', 'S', 'MBA', 'Active'],
        ['stu_seed_0793', '950323631011', 'BHARATHI.', 'T', 'MBA', 'Active'],
        ['stu_seed_0794', '950323631012', 'BRYSILDURAI.', 'R', 'MBA', 'Active'],
        ['stu_seed_0795', '950323631013', 'JENIFER.', 'B', 'MBA', 'Active'],
        ['stu_seed_0796', '950323631014', 'JOHN', 'RAENIAS. A', 'MBA', 'Active'],
        ['stu_seed_0797', '950323631015', 'KANCHANA', 'DEVI. G', 'MBA', 'Active'],
        ['stu_seed_0798', '950323631016', 'KANISHKAR.', 'N', 'MBA', 'Active'],
        ['stu_seed_0799', '950323631017', 'MABIN', 'SIMSOUN. M', 'MBA', 'Active'],
        ['stu_seed_0800', '950323631018', 'MAHALAKSHMI.', 'A', 'MBA', 'Active'],
        ['stu_seed_0801', '950323631019', 'MATHAVAN.', 'P', 'MBA', 'Active'],
        ['stu_seed_0802', '950323631020', 'MURUGAMMAL.', 'V', 'MBA', 'Active'],
        ['stu_seed_0803', '950323631021', 'PRADEEP', 'RAJ. I', 'MBA', 'Active'],
        ['stu_seed_0804', '950323631022', 'ROSELIN', 'SOOSANNA. S', 'MBA', 'Active'],
        ['stu_seed_0805', '950323631023', 'SANTHOSH.', 'A', 'MBA', 'Active'],
        ['stu_seed_0806', '950323631024', 'SASIKALA.', 'P', 'MBA', 'Active'],
        ['stu_seed_0807', '950323631025', 'SELVA', 'KUMAR. S', 'MBA', 'Active'],
        ['stu_seed_0808', '950323631026', 'SHIVA', 'SANKAR. B', 'MBA', 'Active'],
        ['stu_seed_0809', '950323631027', 'SWETHY.', 'S', 'MBA', 'Active'],
        ['stu_seed_0810', '950323631028', 'VENESHA.', 'K', 'MBA', 'Active'],
        ['stu_seed_0811', '950323631029', 'VIJAY', 'SELVAN. Y', 'MBA', 'Active'],
        ['stu_seed_0812', '950323631030', 'VINCENT', 'AHASH. S', 'MBA', 'Active'],
        ['stu_seed_0813', '950324631001', 'ANUSHYA', 'S', 'MBA', 'Active'],
        ['stu_seed_0814', '950324631002', 'AROCKIA', 'ABISHA S', 'MBA', 'Active'],
        ['stu_seed_0815', '950324631003', 'CROSSWIN', 'K', 'MBA', 'Active'],
        ['stu_seed_0816', '950324631004', 'GIRISH', 'THILAK S', 'MBA', 'Active'],
        ['stu_seed_0817', '950324631005', 'INFANT', 'JANOWIN S', 'MBA', 'Active'],
        ['stu_seed_0818', '950324631006', 'ISAAC', 'JEBASINGH Y', 'MBA', 'Active'],
        ['stu_seed_0819', '950324631007', 'JOSEPH', 'RAJA A', 'MBA', 'Active'],
        ['stu_seed_0820', '950324631008', 'KALAI', 'SELVI', 'MBA', 'Active'],
        ['stu_seed_0821', '950324631009', 'KARTHIKEYAN', 'M', 'MBA', 'Active'],
        ['stu_seed_0822', '950324631010', 'KATHIR', 'THIRU SELVAM M', 'MBA', 'Active'],
        ['stu_seed_0823', '950324631011', 'LOGESH', 'D', 'MBA', 'Active'],
        ['stu_seed_0824', '950324631012', 'MARU', 'MITHA I', 'MBA', 'Active'],
        ['stu_seed_0825', '950324631013', 'MARY', 'DIVINI J', 'MBA', 'Active'],
        ['stu_seed_0826', '950324631014', 'MERARI', 'JOHN T', 'MBA', 'Active'],
        ['stu_seed_0827', '950324631015', 'PACKIA', 'LAKSHMI K', 'MBA', 'Active'],
        ['stu_seed_0828', '950324631016', 'PON', 'BALA', 'MBA', 'Active'],
        ['stu_seed_0829', '950324631017', 'PONRAJ', 'C', 'MBA', 'Active'],
        ['stu_seed_0830', '950324631018', 'POORNIMA', 'P', 'MBA', 'Active'],
        ['stu_seed_0831', '950324631019', 'RAJ', 'PRAVEEN A', 'MBA', 'Active'],
        ['stu_seed_0832', '950324631020', 'RUBASRI', 'M', 'MBA', 'Active'],
        ['stu_seed_0833', '950324631021', 'SAKTHI', 'RANJITHA P', 'MBA', 'Active'],
        ['stu_seed_0834', '950324631022', 'SAM', 'JEBAKUMAR R', 'MBA', 'Active'],
        ['stu_seed_0835', '950324631023', 'SANTHANA', 'JOTHI LEENA', 'MBA', 'Active'],
        ['stu_seed_0836', '950324631024', 'SANTHANA', 'THRISHA S', 'MBA', 'Active'],
        ['stu_seed_0837', '950324631025', 'SUBRAMANIYAN', 'A', 'MBA', 'Active'],
        ['stu_seed_0838', '950324631026', 'SURYA', 'R', 'MBA', 'Active'],
        ['stu_seed_0839', '950324631027', 'THANGARATHNA', 'A', 'MBA', 'Active'],
        ['stu_seed_0840', '950324631028', 'TRISHA', '', 'MBA', 'Active'],
        ['stu_seed_0841', '950324631029', 'VIGNESH', 'M', 'MBA', 'Active'],
        ['stu_seed_0842', '950324631030', 'VISHAL', 'I', 'MBA', 'Active'],
        ['stu_seed_0843', '950325631001', 'ABIRAMI', 'R', 'MBA', 'Active'],
        ['stu_seed_0844', '950325631002', 'ARAVINTH', 'KUMAR K', 'MBA', 'Active'],
        ['stu_seed_0845', '950325631003', 'ARUL', 'MELSIHA A', 'MBA', 'Active'],
        ['stu_seed_0846', '950325631004', 'BENITTA', 'R', 'MBA', 'Active'],
        ['stu_seed_0847', '950325631005', 'BLESSY', 'ESTHER S', 'MBA', 'Active'],
        ['stu_seed_0848', '950325631006', 'CLEMENCE', 'ESRAH A', 'MBA', 'Active'],
        ['stu_seed_0849', '950325631007', 'DAVID', 'PHINEHAS A', 'MBA', 'Active'],
        ['stu_seed_0850', '950325631008', 'HARINI', 'M', 'MBA', 'Active'],
        ['stu_seed_0851', '950325631009', 'JENITAMARY', 'M', 'MBA', 'Active'],
        ['stu_seed_0852', '950325631010', 'JERIN', 'EBANEZER M', 'MBA', 'Active'],
        ['stu_seed_0853', '950325631011', 'Jerrick', 'Roshan R', 'MBA', 'Active'],
        ['stu_seed_0854', '950325631012', 'LAKSHMANAN', 'R', 'MBA', 'Active'],
        ['stu_seed_0855', '950325631013', 'MAHALAKSHMI', 'N', 'MBA', 'Active'],
        ['stu_seed_0856', '950325631014', 'MARI', 'USHA M', 'MBA', 'Active'],
        ['stu_seed_0857', '950325631015', 'MUTHU', 'HARSHINI A', 'MBA', 'Active'],
        ['stu_seed_0858', '950325631016', 'PREMKUMAR', 'A', 'MBA', 'Active'],
        ['stu_seed_0859', '950325631017', 'RAJESWARI', 'S', 'MBA', 'Active'],
        ['stu_seed_0860', '950325631018', 'RUCHITHA', 'K', 'MBA', 'Active'],
        ['stu_seed_0861', '950325631019', 'SATHYA', 'PRIYA R', 'MBA', 'Active'],
        ['stu_seed_0862', '950325631020', 'SHEEBA', 'R', 'MBA', 'Active'],
        ['stu_seed_0863', '950325631021', 'SOFIA', 'RAJ R K', 'MBA', 'Active'],
        ['stu_seed_0864', '950325631022', 'SURESH', 'S', 'MBA', 'Active'],
        ['stu_seed_0865', '950325631023', 'TAMIL', 'SELVA BHARATHI M', 'MBA', 'Active'],
        ['stu_seed_0866', '950325631024', 'THANGA', 'GANESH KUMAR T', 'MBA', 'Active'],
        ['stu_seed_0867', '950325631025', 'VINOTH', 'KUMARAN S', 'MBA', 'Active'],
        ['stu_seed_0868', '950325631026', 'YOGESHWARAN', 'S', 'MBA', 'Active'],
        ['stu_seed_0869', '9503114018', 'ATCHAYA', 'K', 'MECH', 'Active'],
        ['stu_seed_0870', '950320114011', 'Mathan', 'M', 'Mech', 'Active'],
        ['stu_seed_0871', '950320114318', 'Nadar', 'Harish Kishore Govindaraj', 'Mech', 'Active'],
        ['stu_seed_0872', '950321114004', 'Guna', 'A', 'MECH', 'Active'],
        ['stu_seed_0873', '950321114005', 'Luke', 'Rongmei', 'MECH', 'Active'],
        ['stu_seed_0874', '950321114006', 'Manoj', 'Singh Rawat', 'MECH', 'Active'],
        ['stu_seed_0875', '950321114009', 'Pon', 'Sankar raja M', 'MECH', 'Active'],
        ['stu_seed_0876', '950321114010', 'Pravin', 'immanuvel S', 'MECH', 'Active'],
        ['stu_seed_0877', '950321114011', 'Sri', 'rajaraman P', 'MECH', 'Active'],
        ['stu_seed_0878', '950321114013', 'Thangapandi', 'A', 'MECH', 'Active'],
        ['stu_seed_0879', '950321114014', 'Vignesh', 'V', 'MECH', 'Active'],
        ['stu_seed_0880', '950321114015', 'Vigneshwaran', 'S', 'MECH', 'Active'],
        ['stu_seed_0881', '950321114301', 'Sri', 'Vasudevan S', 'MECH', 'Active'],
        ['stu_seed_0882', '950322114001', 'HARIHARAN', 'R', 'MECH', 'Active'],
        ['stu_seed_0883', '950322114002', 'HIRALAL', 'BESRA L', 'MECH', 'Active'],
        ['stu_seed_0884', '950322114003', 'JESU', 'AATHIS AR', 'MECH', 'Active'],
        ['stu_seed_0885', '950322114004', 'JOESWA', 'A', 'MECH', 'Active'],
        ['stu_seed_0886', '950322114005', 'MARIDEEPAN', 'M', 'MECH', 'Active'],
        ['stu_seed_0887', '950322114006', 'MUTHU', 'MATHAN A', 'MECH', 'Active'],
        ['stu_seed_0888', '950322114007', 'SANJEEV', 'A', 'MECH', 'Active'],
        ['stu_seed_0889', '950322114008', 'SARAVANA', 'P ERUMAL M', 'MECH', 'Active'],
        ['stu_seed_0890', '950322114009', 'SENTHIL', 'KUMAR K.K', 'MECH', 'Active'],
        ['stu_seed_0891', '950322114302', 'PRAVEEN', 'RAJ S', 'MECH', 'Active'],
        ['stu_seed_0892', '950323114001', 'ABISHEK', 'M', 'MECH', 'Active'],
        ['stu_seed_0893', '950323114003', 'BHARATH', 'RAM B', 'MECH', 'Active'],
        ['stu_seed_0894', '950323114004', 'KASHIF', 'A', 'MECH', 'Active'],
        ['stu_seed_0895', '950323114005', 'LAKSHMANAN', 'M', 'MECH', 'Active'],
        ['stu_seed_0896', '950323114006', 'MARI', 'MUTHU K', 'MECH', 'Active'],
        ['stu_seed_0897', '950323114007', 'LOGESH', 'RAJ M', 'MECH', 'Active'],
        ['stu_seed_0898', '950323114008', 'ULAGU', 'RAJA A', 'MECH', 'Active'],
        ['stu_seed_0899', '950323114301', 'Leewa', 'Shamma EJ', 'MECH', 'Active'],
        ['stu_seed_0900', '950324114001', 'ALWIN', 'YOHESH A', 'MECH', 'Active'],
        ['stu_seed_0901', '950324114002', 'CHANDRAN', 'M', 'MECH', 'Active'],
        ['stu_seed_0902', '950324114003', 'FRANKLIN', 'GODSON B', 'MECH', 'Active'],
        ['stu_seed_0903', '950324114004', 'HARI', 'ATHI BHARATH M', 'MECH', 'Active'],
        ['stu_seed_0904', '950324114005', 'KAMALESH', 'A', 'MECH', 'Active'],
        ['stu_seed_0905', '950324114006', 'KAVIMADHAVAN', 'T', 'MECH', 'Active'],
        ['stu_seed_0906', '950324114007', 'RAJACHANDRU', 'S', 'MECH', 'Active'],
        ['stu_seed_0907', '950324114008', 'SIVAKUMAR', 'A', 'MECH', 'Active'],
        ['stu_seed_0908', '950324114009', 'SRINATH', 'D', 'MECH', 'Active'],
        ['stu_seed_0909', '950324114010', 'VIGNESH', 'M', 'MECH', 'Active'],
        ['stu_seed_0910', '950324114301', 'AROCKIA', 'JEBASTIN M', 'MECH', 'Active'],
        ['stu_seed_0911', '950324114302', 'GUNA', 'ABISHEIK M', 'MECH', 'Active'],
        ['stu_seed_0912', '950325114001', 'ABISHECK', 'S', 'MECH', 'Active'],
        ['stu_seed_0913', '950325114002', 'Antony', 'Jeniston', 'MECH', 'Active'],
        ['stu_seed_0914', '950325114003', 'ASWIN', 'CHINNADURAI S A', 'MECH', 'Active'],
        ['stu_seed_0915', '950325114004', 'ATCHAYA', 'K', 'MECH', 'Active'],
        ['stu_seed_0916', '950325114005', 'BALARAMAKRISHNAN', 'R', 'MECH', 'Active'],
        ['stu_seed_0917', '950325114006', 'BALA', 'SUBRAMANI G', 'MECH', 'Active'],
        ['stu_seed_0918', '950325114007', 'DHANAPAUL', 'C', 'MECH', 'Active'],
        ['stu_seed_0919', '950325114008', 'FRANCIS', 'LEAN J', 'MECH', 'Active'],
        ['stu_seed_0920', '950325114009', 'GODWIN', 'A', 'MECH', 'Active'],
        ['stu_seed_0921', '950325114010', 'GUNASEKAR', 'P', 'MECH', 'Active'],
        ['stu_seed_0922', '950325114011', 'JOSHUA', 'SAMUEL J', 'MECH', 'Active'],
        ['stu_seed_0923', '950325114012', 'KAVIN', 'UL KALIFA A', 'MECH', 'Active'],
        ['stu_seed_0924', '950325114013', 'KOHITHSHARMA', 'M', 'MECH', 'Active'],
        ['stu_seed_0925', '950325114014', 'MUTHU', 'GANESH A', 'MECH', 'Active'],
        ['stu_seed_0926', '950325114015', 'PON', 'MARISH P', 'MECH', 'Active'],
        ['stu_seed_0927', '950325114016', 'SANJAY', 'KUMAR M', 'MECH', 'Active'],
        ['stu_seed_0928', '950325114017', 'VINAYAGA', 'SHANMUGAVEL S', 'MECH', 'Active']
    ];

    return rawData.map(([id, reg, fn, ln, dept, status]) => ({
        stu_id: id,
        stu_regno: reg,
        stu_fname: fn,
        stu_lname: ln,
        stu_dept: dept,
        stu_status: status || 'Active'
    }));
}

function seedSampleData(force = false) {
    const currentVer = localStorage.getItem(DB_SEED_VERSION_KEY);
    let list = DB.get(Students.KEY);
    // Replace if empty, forced, or old version (ensures discontinued records are properly seeded)
    if (force || !list || list.length === 0 || currentVer !== CURRENT_SEED_VERSION) {
        list = getComprehensiveDefaultStudents();
        DB.set(Students.KEY, list);
        localStorage.setItem(DB_SEED_VERSION_KEY, CURRENT_SEED_VERSION);
    }
}

// Auto-seed on load
seedSampleData();
