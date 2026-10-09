<?php
// api_students.php — Remote ERP Students API for erp_students table
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

$host = "sql308.infinityfree.com";
$username = "if0_41190104";
$password = "epass2026";
$dbname = "if0_41190104_epass";

$conn = @new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

$conn->set_charset("utf8mb4");

// Fetch active students only — Strictly exclude Discontinued & Completed
// Priority rule: stu_regno has first priority. If empty, fallback to stu_id. If both are present, fetch only stu_regno.
$sql = "SELECT stu_id, stu_regno, stu_fname, stu_lname, stu_dept, stu_status 
        FROM erp_student 
        WHERE LOWER(stu_status) NOT LIKE '%discontinu%' 
          AND LOWER(stu_status) NOT LIKE '%complete%'
        ORDER BY CASE 
            WHEN stu_regno IS NOT NULL AND TRIM(stu_regno) != '' THEN TRIM(stu_regno) 
            ELSE TRIM(stu_id) 
        END ASC";

$result = $conn->query($sql);
if (!$result) {
    // If erp_student table doesn't exist, try student or students view
    $sqlFallback = "SELECT stu_id, stu_regno, stu_fname, stu_lname, stu_dept, stu_status 
                    FROM students 
                    WHERE LOWER(stu_status) NOT LIKE '%discontinu%' 
                      AND LOWER(stu_status) NOT LIKE '%complete%'
                    ORDER BY CASE 
                        WHEN stu_regno IS NOT NULL AND TRIM(stu_regno) != '' THEN TRIM(stu_regno) 
                        ELSE TRIM(stu_id) 
                    END ASC";
    $result = $conn->query($sqlFallback);
}

if (!$result) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $conn->error]);
    $conn->close();
    exit();
}

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
        // Priority 1: stu_regno is present (or both are present) -> fetch only stu_regno
        $student["stu_regno"] = trim($row["stu_regno"]);
    } elseif ($hasId) {
        // stu_regno is empty -> fetch stu_id (and alias as stu_regno for application compatibility)
        $student["stu_id"]    = trim($row["stu_id"]);
        $student["stu_regno"] = trim($row["stu_id"]);
    }

    $students[] = $student;
}

$conn->close();
echo json_encode(["success" => true, "count" => count($students), "data" => $students], JSON_UNESCAPED_UNICODE);
?>
