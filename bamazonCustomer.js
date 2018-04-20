var mysql = require('mysql');
var prompt = require('prompt');
//var colors = require('colors/safe');
var Table = require('cli-table');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'Bamazon', 
});

var productPurchased = [];

connection.connect();

connection.query('SELECT ItemID, ProductName, Price FROM Products', function(err, result){
	if(err) console.log(err);
	var table = new Table({
		head: ['Item Id#', 'Product Name', 'Price'],
	});

	for(var i = 0; i < result.length; i++){
		table.push(
			[result[i].ItemID, result[i].ProductName, result[i].Price]
		);
	}
	console.log(table.toString());

	purchase();
});

var purchase = function(){

	var productInfo = {
		properties: {
			itemID:{('Please enter the ID of the product you would like to buy')},
			Quantity:{('How many units of the product would you like to buy?')}
		},
	};

	prompt.start();

	prompt.get(productInfo, function(err, res){

		var custPurchase = {
			itemID: res.itemID,
			Quantity: res.Quantity
		};
		
		
		productPurchased.push(custPurchase);

		
		connection.query('SELECT * FROM Products WHERE ItemID=?', productPurchased[0].itemID, function(err, res){
				if(err) console.log(err, 'Item ID does not exist');
				
				
				if(res[0].StockQuantity < productPurchased[0].Quantity){
					console.log('INSUFICIENT QUANTITY');
					connection.end();

				
				} else if(res[0].StockQuantity >= productPurchased[0].Quantity){

					console.log('');

					console.log(productPurchased[0].Quantity + ' items purchased');

					console.log(res[0].ProductName + ' ' + res[0].Price);

					var saleTotal = res[0].Price * productPurchased[0].Quantity;

					
					connection.query("UPDATE Departments SET TotalSales = ? WHERE DepartmentName = ?;", [saleTotal, res[0].DepartmentName], function(err, resultOne){
						if(err) console.log('error: ' + err);
						return resultOne;
					})

					console.log('Total: ' + saleTotal);

				
					newQuantity = res[0].StockQuantity - productPurchased[0].Quantity;
			
					
					connection.query("UPDATE Products SET StockQuantity = " + newQuantity +" WHERE ItemID = " + productPurchased[0].itemID, function(err, res){
						
						connection.end();
					})

				};

		})
	})

};
