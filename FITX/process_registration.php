<?php
// Database connection details
$servername = "your_server_name";
$username = "your_username";
$password = "your_password";
$dbname = "your_database_name";

// Create connection
$conn = new mysqli($servername, $username, $password, $login_db);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Process form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve user details from the form
    $fullName = $_POST["fullName"];
    $goal = $_POST["goal"];
    $reason = $_POST["reason"];
    $dob = $_POST["dob"];
    $activityLevel = $_POST["activityLevel"];
    $gender = $_POST["gender"];
    $feet = $_POST["feet"];
    $inches = $_POST["inches"];
    $currentWeight = $_POST["currentWeight"];
    $goalWeight = $_POST["goalWeight"];
    $weeklyGoal = $_POST["weeklyGoal"];

    // SQL query to insert data into the database
    $sql = "INSERT INTO user_details (full_name, goal, reason, dob, activity_level, gender, feet, inches, current_weight, goal_weight, weekly_goal)
            VALUES ('$fullName', '$goal', '$reason', '$dob', '$activityLevel', '$gender', '$feet', '$inches', '$currentWeight', '$goalWeight', '$weeklyGoal')";

    if ($conn->query($sql) === TRUE) {
        echo "New record created successfully";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}

// Close the database connection
$conn->close();
?>
