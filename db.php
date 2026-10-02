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
?>
