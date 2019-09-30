
//// all js code is enclosed inside an IIFE to allow js execution on DOM load
(function(){
		//// all variables need to be strictly defined
		"use strict";

		//// this will store information about exchange rates (is refreshed every minute)
		var ratesObj;

		//// this function gets currency conversion rates and stores them in the object ratesObj
		function getRates(){
				//// ApiKey is encoded and is fetched from function encodedApiKey() from ./keys.js
				var apiKey= window.atob(encodedApiKey());
				var url= "http://data.fixer.io/api/latest?access_key="+apiKey+"&symbols=CAD,USD,EUR";

				$.get(url, function(ans){
						if(ans && ans.success && ans.rates){
								//// success scenario
								ratesObj= ans;

								//// in case of error, see else condition below, we change #heading
								//// to show "Error!"
								$("#heading").text("Currency Converter");
						}

						else{
								//// error scenario
								if(ans && ans.error && ans.error.type){
										//// converting ans.error.type into string and removing any
										//// XSS
										$("#info").text("Error - "+String(ans.error.type.replace(/\&/g, "&#38;").replace(/\</g, "&#60;").replace(/\'/g, "&#39;").replace(/\"/g, "&#34;"))+"!");
								}

								else{
										$("#info").text("Error!");
								}
										
								$("#heading").text("Error!");
								$("#outer").addClass("unseen");
								$("#removeButton").text("Ok");
								$("#infoDiv").removeClass("unseen");
						}
				}).fail(function(res){
						$("#heading").text("Error!");
						$("#info").text("Network Error!");
						$("#outer").addClass("unseen");
						$("#removeButton").text("Ok");
						$("#infoDiv").removeClass("unseen");
				});
		}

		//// function getRates() is defined above
		getRates();
		//// we refresh currency exchange rates every minute
		setInterval(function(){
				getRates();
		}, 60*1000);

		//// First currency value changed
		$("#valOne").on("keyup", function(e){
				//// function convert() is defined below
				convert("One", "Two");
		});

		//// Second currency value changed
		$("#valTwo").on("keyup", function(e){
				//// function convert() is defined below
				convert("Two", "One");
		});

		//// First currency changed
		$("#optionOne").on("change", function(e){
				//// function convert() is defined below
				convert("One", "Two");
		});

		//// Second currency changed
		$("#optionTwo").on("change", function(e){
				//// function convert() is defined below
				convert("One", "Two");
		});

		//// link clicked for info on currency exchange rates
		$("#disclaimer").on("click", function(e){
				//// to prevent change in url of page
				e.preventDefault();

				var rate= ratesObj.rates[$("#optionTwo").val().toUpperCase()]/ratesObj.rates[$("#optionOne").val().toUpperCase()];

				if(rate && typeof(rate)==="number"){
						//// in case of error in rate value, see else condition below, we change
						//// #heading to show "Error!"
						$("#heading").text("Currency Converter");

						var currencyOne= $("#optionOne").val().toUpperCase();
						var currencyTwo= $("#optionTwo").val().toUpperCase();

						var htmlVal= "1 "+currencyOne+" = "+rate.toFixed(3)+" "+currencyTwo+"<br/>1 "+currencyTwo+" = "+(1/rate).toFixed(3)+" "+currencyOne;

						$("#info").html(htmlVal);
						$("#outer").addClass("unseen");
						$("#removeButton").text("Back");
						$("#infoDiv").removeClass("unseen");
				}

				else{
						$("#heading").text("Error!");
				}
		});

		//// to go back to currency converter widget after showing error or exchange rate info
		$("#removeButton").on("click", function(){
				$("#infoDiv").addClass("unseen");
				$("#outer").removeClass("unseen");
		});

		//// this function converts one currency to another
		function convert(base, other){
				if($("#val"+base).val() && $("#val"+base).val().trim()){
						//// removing any , or - from input number
						//// converting input number first into string and removing any XSS and then
						//// reconverting back into number
						var val= Number(String($("#val"+base).val()).trim().replace(/,|-/g, "").replace(/\&/g, "&#38;").replace(/\</g, "&#60;").replace(/\'/g, "&#39;").replace(/\"/g, "&#34;"));

						var rate, convertedVal, decimalPart, len;

						if(val || val===0){
								if($("#option"+base).val()===$("#option"+other).val()){
										//// both currencies are same
										convertedVal= val;
								}

								else{
										//// both currencies are different
										rate= ratesObj.rates[$("#option"+other).val().toUpperCase()]/ratesObj.rates[$("#option"+base).val().toUpperCase()];

										if(rate && typeof(rate)==="number"){
												//// in case of error in rate value, see else
												//// condition below, we change #heading to show
												//// "Error!"
												$("#heading").text("Currency Converter");

												decimalPart= getDecimalPart(val);
												if(decimalPart){
														//// decimal digits of both currencies
														//// should match minimum decimal digits
														//// are 2
														len= Math.max(2, decimalPart.toString().length - 2);
														convertedVal= (val*rate).toFixed(len); 
												}

												else{
														//// minimum decimal digits are 2
														convertedVal= (val*rate).toFixed(2);
												}
										}

										else{
												$("#heading").text("Error!");
										}
								}

								$("#val"+other).val(convertedVal).blur();
						}
				}

				else{
						$("#val"+other).val("").blur();
				}
		}

		//// this function returns decimal part if it exists
		function getDecimalPart(num){
				if(Number(num)%1){
						num= num.toString();
						var index= num.indexOf(".") + 1;

						return Number("0."+num.substring(index));
				}

				else{
						return null;
				}
		}
})();


