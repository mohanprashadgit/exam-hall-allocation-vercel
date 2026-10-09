<?php
// db.php — Database Configuration for InfinityFree MySQL
$host = "sql308.infinityfree.com";
$username = "if0_41190104";
$password = "epass2026";
$dbname = "if0_41190104_epass";

$conn = @new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Database Connection Failed: " . $conn->connect_error]));
}
$conn->set_charset("utf8mb4");

/**
 * Fetch students prioritizing stu_regno over stu_id.
 * - Priority 1: stu_regno.
 * - If stu_regno is empty: fetch stu_id.
 * - If both are present: fetch only stu_regno.
 */
function getStudentsWithPriority($conn, $activeOnly = true) {
    $where = $activeOnly 
        ? "WHERE LOWER(stu_status) NOT LIKE '%discontinu%' AND LOWER(stu_status) NOT LIKE '%complete%'" 
        : "";

    $sql = "SELECT stu_id, stu_regno, stu_fname, stu_lname, stu_dept, stu_status 
            FROM erp_student 
            $where
            ORDER BY CASE 
                WHEN stu_regno IS NOT NULL AND TRIM(stu_regno) != '' THEN TRIM(stu_regno) 
                ELSE TRIM(stu_id) 
            END ASC";

    $result = $conn->query($sql);
    if (!$result) {
        $sqlFallback = "SELECT stu_id, stu_regno, stu_fname, stu_lname, stu_dept, stu_status 
                        FROM students 
                        $where
                        ORDER BY CASE 
                            WHEN stu_regno IS NOT NULL AND TRIM(stu_regno) != '' THEN TRIM(stu_regno) 
                            ELSE TRIM(stu_id) 
                        END ASC";
        $result = $conn->query($sqlFallback);
    }
    if (!$result) return false;

    $students = [];
    while ($row = $result->fetch_assoc()) {
        $hasRegno = isset($row["stu_regno"]) && trim($row["stu_regno"]) !== '';
        $hasId    = isset($row["stu_id"]) && trim($row["stu_id"]) !== '';

        $student = [
            "stu_fname"  => $row["stu_fname"],
            "stu_lname"  => $row["stu_lname"],
            "stu_dept"   => $row["stu_dept"],
            "stu_status" => $row["stu_status"]
        ];

        if ($hasRegno) {
            // First priority to stu_regno; fetch only stu_regno if both present
            $student["stu_regno"] = trim($row["stu_regno"]);
        } elseif ($hasId) {
            // If stu_regno is empty, fallback to stu_id
            $student["stu_id"]    = trim($row["stu_id"]);
            $student["stu_regno"] = trim($row["stu_id"]);
        }

        $students[] = $student;
    }
    return $students;
}
?>
