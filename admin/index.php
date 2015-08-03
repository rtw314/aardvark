<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Submitted Applications</title>
		<meta name="author" content="Ronald Waite">
		<meta name="description" content="Download submitted applications">
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
	</head>
	<body>
<?php
	//Get the initial results
	function generateRandomString($length = 10) {
	    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	    $charactersLength = strlen($characters);
	    $randomString = '';
	    for ($i = 0; $i < $length; $i++) {
	        $randomString .= $characters[rand(0, $charactersLength - 1)];
	    }
	    return $randomString;
	}

	$db = new SQLite3('../cox-trucking-application-form/storage/db/cox-trucking-application-form.dat');
	//Delete old Sessions
	//TODO
	
	if ($_SERVER['REQUEST_METHOD'] === 'POST') {
		//There is a ghost looking at me through my bathroom mirror.
		$usersQ = 'SELECT * FROM "admin_accounts" WHERE "username"="' . addslashes($_POST["username"]) . '"';
		$usersResult = $db->query($usersQ);
		if ($user = $usersResult->fetchArray(SQLITE3_ASSOC)) {
			$hash = base64_encode(hash('sha512', $_POST["password"] . $user["salt"]));
			if ($user["hashed_password"] == $hash) {
				do {
					$newSessionID = generateRandomString();
					$result = $db->query('SELECT * FROM "sessions" WHERE "id"="' . $newSessionID . '";');
				} while ($result->fetchArray(SQLITE3_ASSOC));
				$db->query('INSERT INTO "sessions" values ("' . $newSessionID . '",DATETIME());');
				setcookie("CoxSession", $newSessionID, time() + (86400), "/");
				$_COOKIE["CoxSession"] = $newSessionID;
			} else {
				$error = "Error: Username or password is incorrect";
			}
		} else {
			$error = "Error: Username or password is incorrect"; //"Error: Username \"" . $_POST["username"] . "\" doesn't exist";
		}
	}
	
	$cookieMatch = $db->query('SELECT * FROM "sessions" WHERE "id"="' . $_COOKIE["CoxSession"] . '";');
	if (!$cookieMatch->fetchArray(SQLITE3_ASSOC)) {
		?><pre style="color: #a00;"><?php echo $error;// . "\n" . $hash . "\n" . $user["hashed_password"]; ?></pre>
		<form method="post" style="width: 300px; margin-left: 50px;">
			<div class="form-group">
				<label for="username">Username</label>
				<input type="text" class="form-control" id="username" placeholder="Username" name="username">
			</div>
			<div class="form-group">
				<label for="password">Password</label>
				<input type="password" class="form-control" id="password" placeholder="Password" name="password">
			</div>
			<button type="submit" class="btn btn-default">Submit</button>
		</form><?php
		exit();
	}
	
	$sql = "SELECT \"last-name\", \"first-name\", \"submit-date\", \"_submitted_\" FROM \"cox-trucking-application-form\" ORDER BY \"_submitted_\" DESC;";
	$result = $db->query($sql);
	$rows = array(); 

    $i = 0; 

    while($res = $result->fetchArray(SQLITE3_ASSOC)){ 

        //if(!isset($res['user_id'])) continue; 
        $time = $res['_submitted_'];
        $date = substr($time, 0, 10);
		$time = substr(strstr($time, " "), 1);

        $rows[$i]['last-name'] = $res['last-name']; 
        $rows[$i]['first-name'] = $res['first-name']; 
        $rows[$i]['submit-date'] = $date;
        $rows[$i]['time'] = $time;

        $i++; 

    }
    //$rows = array_reverse($rows);
?>
<?php
if (isset($_GET['last'])) {
	//Include class to create PDF documents
	require ('./lib/fpdf.php');
	$last = $_GET['last'];
	$date = $_GET['date'];
	$time = $_GET['time'];
	
	//SELECT * FROM "cox-trucking-application-form" WHERE 'last-name'='w' AND '_submitted_'='2015-08-01 11:04:15'
	$downloadSql = "SELECT * FROM \"cox-trucking-application-form\" WHERE \"last-name\"=\"" . $last . "\" AND \"_submitted_\"=\"" . $date . " " . $time . "\"";
	$downloadResult = $db->query($downloadSql);
	$downloadRow = $downloadResult->fetchArray(SQLITE3_ASSOC);

	//Capture data
	$signature = $downloadRow["data_uri"];
	//$data_pieces = explode(",", $signature);
	$encoded_image = $signature;
	$decoded_image = base64_decode($encoded_image);
	file_put_contents("signature.png",$decoded_image);
	$first_name = $downloadRow["first-name"];
	$last_name = $downloadRow["last-name"];
	//$post_array = $downloadRow;

	//Create PDF
	$pdf = new FPDF('P','in','letter');
	$pdf->AddPage();
	$pdf->SetMargins(1, 1, 1);
	$pdf->SetAutoPageBreak(true, 1);
	$pdf->SetFont('Arial','BU',16);
	$pdf->Cell(0, 1, $first_name . " " . $last_name, 0, 1, "C");
	$pdf->SetFont('Times','',12);
		//Add form data to the PDF
	foreach ($downloadRow as $key => $value) {
		if ($key == "data_uri") {} elseif($value != "" && !(is_null($value))) {
			$pdf->MultiCell(0, 0.25, $key . ": " . $value, 0, "L");
		}
	}
	$pdf->Ln();
	$pdf->Image("signature.png");
	//$pdf2 = clone $pdf;
	//$pdf->Output("submitted-applications/" . $first_name . "_" . $last_name . ".pdf");
	$pdf->Output($first_name . "_" . $last_name . "_application.pdf", "D");
}

?>
		<h3>Submitted Applications</h3>
		<!--<pre><?php 
		/*if (isset($downloadRow)) {
			echo var_dump($downloadRow);
			echo "<br>" . var_dump($downloadSql);
		}*/
		?></pre>-->
		<table class="table table-bordered" style="width: 800px;">
			<tr>
				<th>Date Submitted</th>
				<th>Last Name</th>
				<th>First Name</th>
				<th>Download</th>
			</tr>
			<?php
				//Creates rows for each application in the database
				foreach ($rows as $row) {
					echo "<tr>\n<td>" . $row['submit-date'] . "</td>\n<td>"
						. $row['last-name'] . "</td>\n<td>" . $row['first-name']
						. "</td>\n<td><a href=\"index.php?last=" . $row['last-name']
						. "&date=" . $row['submit-date'] . "&time=" . $row['time']
						. "\">Download</a></td>\n</tr>\n";
				}
			?>
		</table>
			
	</body>
</html>