<?php
$data_file	= file_get_contents('weapons.txt');
$log_file	= "log.txt";
$rows      	= explode("\n", $data_file);

if (count($rows) > 0) {

	$dbCon = mysqli_connect("DB_HOST", "DB_USER", "DB_PASSWORD", "DB_SCHEMA") or die("Error " . mysqli_error($dbCon));
	$insert = NULL;
	$entryDate = date("Y-m-d H:i:s");

	foreach($rows as $row => $data){

	    // Get row data
	    $row_data = explode(";", $data);

	    $info[$row]["Name"]			= $row_data[0];
	    $info[$row]["Quantity"]     = $row_data[1];
	    $info[$row]["Price"]  		= $row_data[2];

	    $info[$row]["Quantity"] 	= str_replace(",", "", $info[$row]["Quantity"]);
	    $info[$row]["Price"] 		= str_replace("$", "", $info[$row]["Price"]);

	    $query = "SELECT id FROM item WHERE name = '{$info[$row]["Name"]}';";
	    $result = $dbCon->query($query);

	    // If item doesn't exist in the database
	    if ($result->num_rows == 0) {
	    	$insert .= "INSERT INTO item (name) VALUES ('{$info[$row]["Name"]}'); ";
	    	$result = $dbCon->query($query);
	    }

	    while ($resultRow = mysqli_fetch_array($result)) {
    		$insert .= "INSERT INTO log (itemID, quantity, price, entryDate) VALUES ({$resultRow["id"]}, {$info[$row]["Quantity"]}, {$info[$row]["Price"]}, '$entryDate'); ";
    	}

	}

	$result = $dbCon->multi_query($insert);

	if ($result == 1) {

		if (is_writable($log_file)) {

	    if (!$handle = fopen($log_file, 'a')) {
	         echo "Cannot open file ($log_file)";
	         exit;
	    }

	    if (fwrite($handle, "Entries logged successfully at $entryDate \n") === FALSE) {
	        echo "Cannot write to file ($log_file)";
	        exit;
	    }

	    fclose($handle);

	} else {
	    echo "The file $log_file is not writable";
	}
		
	}
	
}

mysqli_close($dbCon);

?>