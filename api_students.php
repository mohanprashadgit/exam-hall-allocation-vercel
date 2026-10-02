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
$sql = "SELECT stu_id, stu_regno, stu_fname, stu_lname, stu_dept, stu_status 
        FROM erp_student 
        WHERE LOWER(stu_status) NOT LIKE '%discontinu%' 
          AND LOWER(stu_status) NOT LIKE '%complete%'
        ORDER BY stu_regno ASC";

$result = $conn->query($sql);
if (!$result) {
    // If erp_student table doesn't exist, try student or students view
    $sqlFallback = "SELECT stu_id, stu_regno, stu_fname, stu_lname, stu_dept, stu_status 
                    FROM students 
                    WHERE LOWER(stu_status) NOT LIKE '%discontinu%' 
                      AND LOWER(stu_status) NOT LIKE '%complete%'
                    ORDER BY stu_regno ASC";
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
    $students[] = [
        "stu_id"     => $row["stu_id"],
        "stu_regno"  => $row["stu_regno"],
        "stu_fname"  => $row["stu_fname"],
        "stu_lname"  => $row["stu_lname"],
        "stu_dept"   => $row["stu_dept"],
        "stu_status" => $row["stu_status"]
    ];
}

$conn->close();
echo json_encode(["success" => true, "count" => count($students), "data" => $students], JSON_UNESCAPED_UNICODE);
?>
