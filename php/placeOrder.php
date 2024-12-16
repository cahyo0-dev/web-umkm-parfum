<?php
/*Install Midtrans PHP Library (https://github.com/Midtrans/midtrans-php)
composer require midtrans/midtrans-php
                              
Alternatively, if you are not using **Composer**, you can download midtrans-php library 
(https://github.com/Midtrans/midtrans-php/archive/master.zip), and then require 
the file manually.   

require_once dirname(__FILE__) . '/pathofproject/Midtrans.php'; */

require_once dirname(__FILE__) . '/midtrans-php-master/Midtrans.php';

//SAMPLE REQUEST START HERE

// Set your Merchant Server Key
\Midtrans\Config::$serverKey = 'SB-Mid-server-w3694RWd2l2dqtKnF-P91y7S';
// Set to Development/Sandbox Environment (default). Set to true for Production Environment (accept real transaction).
\Midtrans\Config::$isProduction = false;
// Set sanitization on (default)
\Midtrans\Config::$isSanitized = true;
// Set 3DS transaction for credit card to true
\Midtrans\Config::$is3ds = true;


// Validasi input
if (
    empty($_POST['total']) ||
    empty($_POST['items']) ||
    empty($_POST['name']) ||
    empty($_POST['email']) ||
    empty($_POST['phone'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Incomplete data provided.']);
    exit;
}

// Ambil data POST
$total = (float)$_POST['total'];
$item_details = json_decode($_POST['items'], true);

// Validasi total
$calculatedTotal = array_reduce($item_details, function ($sum, $item) {
    return $sum + ($item['price'] * $item['quantity']);
}, 0);
error_log('Total yang diterima dari frontend: ' . $total);
error_log('Total yang dihitung di backend: ' . $calculatedTotal);

if ($total > $calculatedTotal) {
    http_response_code(400);
    echo json_encode(['error' => 'Total mismatch']);
    exit;
}

// Format item_details untuk Midtrans
$formattedItems = [];
foreach ($item_details as $item) {
    $formattedItems[] = [
        'id' => $item['id'],
        'price' => $item['price'],
        'quantity' => $item['quantity'],
        'name' => $item['name']
    ];
}

// Payload transaksi
$params = [
    'transaction_details' => [
        'order_id' => rand(),
        'gross_amount' => $total, // Total harga setelah diskon
    ],
    'item_details' => $formattedItems,
    'customer_details' => [
        'first_name' => $_POST['name'],
        'email' => $_POST['email'],
        'phone' => $_POST['phone'],
    ],
];


// Kirim ke Midtrans
try {
    $snapToken = \Midtrans\Snap::getSnapToken($params);
    echo $snapToken;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
