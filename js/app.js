var ajax_url= krms_config.ApiUrl ;
var cuisine_url= krms_config.cuisineUrl ;
var dialog_title_default= krms_config.DialogDefaultTitle;
var search_address;
var ajax_request;
var cart=[];
var discount_applied=[];
var deal_cart =new Object();

var networkState;
var ftotal;
var easy_category_list='';
var map;
var drag_marker;
var map_track;
var track_order_interval;
var track_order_map_interval;
var drag_marker_bounce=1;
var start="0";
var limit="5";
var menustart="0";
var menulimit="10";
document.addEventListener("deviceready", onDeviceReady,  false);




function onDeviceReady() {
  //localStorage.clear();
// var permissions = cordova.plugins.permissions;
//
 	navigator.splashscreen.hide();
  window.plugins.uniqueDeviceID.get(success_id, fail_id);



// 	var list = [
//   permissions.ACCESS_COARSE_LOCATION
// ];
//
// permissions.hasPermission(list, callback, null);

// function error() {
//   console.warn('Camera or Accounts permission is not turned on');
// }
//
// function success( status ) {
//   if( !status.hasPermission ) {
//
//     permissions.requestPermissions(
//       list,
//       function(status) {
//         if( !status.hasPermission ) error();
//       },
//       error);
//   }
// }
function success_id(uuid)
{
  //  setStorage("device_id", uuid);
    // onsenAlert(uuid);
}

function fail_id(uuid)
{
  console.log("Error");
}
	if ( !empty(krms_config.pushNotificationSenderid)) {

	    var push = PushNotification.init({
	        "android": {
	            "senderID": krms_config.pushNotificationSenderid
	        },
	        "ios": {"alert": "true", "badge": "true", "sound": "true", "clearBadge": "true" },
	        "windows": {}
	    });

	    push.on('registration', function(data) {

	    	setStorage("device_id", data.registrationId );

	        var params="registrationId="+ data.registrationId;
	            params+="&device_platform="+device.platform;
		        params+="&client_token="+getStorage("client_token");
		        callAjax("registerMobile",params);
	    });

	    push.on('notification', function(data) {
	        //alert(JSON.stringify(data));
	        if ( data.additionalData.foreground ){
	        	//alert("when the app is active");

	        	playNotification();

	        	if ( data.additionalData.additionalData.push_type=="order"){
	        		showNotification( data.title,data.message );
	        	} else {
	        		showNotificationCampaign( data.title,data.message  );
	        	}
	        } else {
	        	//alert("when the app is not active");
	        	if ( data.additionalData.additionalData.push_type=="order"){
	        		showNotification( data.title,data.message );
	        	} else {
	        		showNotificationCampaign( data.title,data.message  );
	        	}
	        }
	        /*push.finish(function () {
	            alert('finish successfully called');
	        }); */
	    });

	    push.on('error', function(e) {
	        //onsenAlert("push error");
	    });

		push.finish(function () {
	        //alert('finish successfully called');
	    });

	}

	checkConnection(); // Based on the connection, it sets the menu limit for performance loading of menus
}

function checkConnection() {
    var networkState = navigator.connection.type;
   	console.log(networkState);
	if(networkState == Connection.WIFI)
		menulimit = 10;
	else if(networkState == Connection.CELL_4G)
		menulimit = 5;
	else
		menulimit = 3;
}

/*document.addEventListener("offline", onOffline, false);
function onOffline() {
    $(".home-page").hide();
    $(".no-connection").show();
}

document.addEventListener("online", onOnline, false);
function onOnline()
{
	$(".home-page").show();
    $(".no-connection").hide();
}*/

document.addEventListener("offline", noNetConnection, false);

function noNetConnection()
{
  loader.hide();
	onsenAlert( getTrans("Internet connection lost.","net_connection_lost") );
}


jQuery.fn.exists = function(){return this.length>0;}

function dump(data)
{
	console.log(data);
}

function setStorage(key,value)
{
	localStorage.setItem(key,value);
}

function getStorage(key)
{
	return localStorage.getItem(key);
}

function removeStorage(key)
{
	localStorage.removeItem(key);
}

function explode(sep,string)
{
	var res=string.split(sep);
	return res;
}

function urlencode(data)
{
	return encodeURIComponent(data);
}

$( document ).on( "keyup", ".numeric_only", function() {
  this.value = this.value.replace(/[^0-9\.]/g,'');

});

//ons.bootstrap();
ons.ready(function() {


	//dump('ready');


	//navigator.splashscreen.hide()
	$("#s").val( getStorage("search_address") );

	refreshConnection();

	if(isDebug()){
	   setStorage("device_id","device_555");
	}

	//setTimeout('getLanguageSettings()', 1100);
  getLanguageSettings();

	$( document ).on( "click", "#s", function() {
	   $("#s").val('');
	});

}); /*end ready*/

function refreshConnection()
{
	if ( !hasConnection() ){
		$(".home-page").hide();
		$(".no-connection").show();
	} else {
		$(".home-page").show();
		$(".no-connection").hide();
	}
}

function hasConnection()
{
	if(isDebug()){
		return true;
	}
	//networkState = navigator.network.connection.type;
	/*var networkState = navigator.connection.type;
	if ( networkState=="Connection.NONE" || networkState=="none"){
		return false;
	}*/
	return true;
}

function geoComplete()
{
	dump( "country_code_set=>" + getStorage("country_code_set"));

	if ( empty(getStorage("country_code_set")) ){
		if(empty(getStorage("mobile_country_code"))){
		  $("#s").geocomplete();
		} else {
		  $("#s").geocomplete({
		    country: getStorage("mobile_country_code")
	      });

	      setStorage("country_code_set", getStorage("mobile_country_code") );

		}
	} else {
		$("#s").geocomplete({
		   country: getStorage("country_code_set")
	    });
	}
}

function createElement(elementId,elementvalue)
{
 //	alert(elementId);
   var content = document.getElementById(elementId);
   content.innerHTML=elementvalue;

   ons.compile(content);
}

function searchMerchant()
{
	start ="0";
  var s = $('#s').val();

  var parish  = $.trim($('#parish').val());
  var cuisine = $.trim($('#cuisine').val());

  /*clear all storage*/
  //setStorage("search_address",s);
  setStorage("parish",parish);
  setStorage("cuisine",cuisine);
  removeStorage('merchant_id');
  removeStorage('shipping_address');
  removeStorage('merchant_id');
  removeStorage('transaction_type');
  removeStorage('merchant_logo');
  removeStorage('order_total');
  removeStorage('merchant_name');
  removeStorage('total_w_tax');
  removeStorage('currency_code');
  removeStorage('paymet_desc');
  removeStorage('order_id');
  removeStorage('order_total_raw');
  removeStorage('cart_sub_total_pretty');
  removeStorage('cart_currency_symbol');
  removeStorage('paypal_card_fee');
  removeStorage("discnt_prce");
  removeStorage('discnt_prce_pretty');
  removeStorage('voucher_amnt');
  removeStorage('total_amount_final');
  removeStorage('cart_sub_total');
  removeStorage('cart_delivery_charges');
  removeStorage('cart_packaging');
  removeStorage('cart_tax');
  removeStorage('map_address_result_formatted_address');
  removeStorage("customer_contact_number");
  removeStorage("final_total_amnt");
  discnt_params="";
  deal_params="";
  console.log(discnt_params);
  console.log(deal_params);
  //if(s!="")
  {
	  var options = {parish:parish,cuisine:cuisine,closeMenu:true,animation: 'slide'};
		menu.setMainPage('searchResults.html',options);
  } /*else{
  	 onsenAlert(   getTrans('Address is required','address_is_required')  );
  }*/
}

/*ons.ready(function() {
  kNavigator.on('prepush', function(event) {
  	 dump("prepush");
  });
});*/

document.addEventListener("pageinit", function(e) {
	dump("pageinit");
	dump("pagname => "+e.target.id);	 
	switch (e.target.id)
	{
		case "menucategory-page":
		case "page-merchantinfo":
		case "page-reviews":
		case "page-cart":
		case "page-receipt":
		case "page-change-address":
		case "page-order-options":

		case "page-track-order":
		case "page-map":
		case "tracking-page":
		  translatePage();
		  break;

		case "address-bymap":
		  translatePage();
		  $(".search_address_geo").attr("placeholder",  getTrans('Street Address,City,State','home_search_placeholder') );
		  break;

		case "page-enter-contact":
		  translatePage();
		  $(".contact_phone").attr("placeholder", getTrans("Mobile Phone","mobile_number") );
		  translateValidationForm();
		  break;

		case "page-booking":
		  translatePage();
		  $(".number_guest").attr("placeholder", getTrans("Number of Guests","number_of_guest") );
		  initIntelInputs();
		  break;

	   case "page-paymentoption":
	     translatePage();
	     $(".order_change").attr("placeholder", getTrans('Require change? Let us know ','order_change') );
		 break;

	  case "page-addressbook-details":
	    translatePage();
	    translateValidationForm();

	    $(".street").attr("placeholder",  getTrans("Street",'street') );
	    $(".city").attr("placeholder",  getTrans("City",'city') );
	    $(".state").attr("placeholder",  getTrans("State",'state') );
	    $(".zipcode").attr("placeholder",  getTrans("Post Code",'zipcode') );
	    $(".location_name").attr("placeholder",  getTrans("Location name",'location_name') );

	    break;

	   case "page-signup":
	     translatePage();
	     translateValidationForm();
	     $(".first_name").attr("placeholder",  getTrans("First Name",'first_name') );
	     $(".last_name").attr("placeholder",  getTrans('Last Name','last_name') );
	     $(".contact_phone").attr("placeholder",  getTrans('Mobile Phone','contact_phone') );
	     $(".email_address").attr("placeholder",  getTrans('Email address','email_address') );
	     $(".password").attr("placeholder",  getTrans('Password','password') );
	     $(".cpassword").attr("placeholder",  getTrans('Confirm Password','confirm_password') );

	     break;

	   case "page-checkoutsignup":
	     translatePage();
         translateValidationForm();

         $(".first_name").attr("placeholder",  getTrans("First Name",'first_name') );
	     $(".last_name").attr("placeholder",  getTrans('Last Name','last_name') );
	     $(".contact_phone").attr("placeholder",  getTrans('Mobile Phone','contact_phone') );
	     $(".email_address").attr("placeholder",  getTrans('Email address','email_address') );
	     $(".password").attr("placeholder",  getTrans('Password','password') );
	     $(".cpassword").attr("placeholder",  getTrans('Confirm Password','confirm_password') );
	     break;

	   case "page-shipping":
		 		if(!isLogin())
				{
					$("#guest").show();
          if(transaction_type="pickup")
          {
            $("#delivery_instruction").hide();
          }
					$("#addressbook").hide();
					$("#addrs_deflt").hide();
					$("#guest_checkout").val("2");
				}
	      $(".street").attr("placeholder", getTrans('Street','street') );
	      $(".city").attr("placeholder", getTrans('City','city') );
	      $(".state").attr("placeholder", getTrans('State','state') );
	      $(".zipcode").attr("placeholder", getTrans('Post Code','zipcode') );
	      $(".contact_phone").attr("placeholder", getTrans('Contact phone','contact_phone') );
	      $(".location_name").attr("placeholder", getTrans('Apartment suite, unit number, or company name','location_name2') );
	      $(".delivery_instruction").attr("placeholder", getTrans('Delivery Instructions','delivery_instruction') );

	      translatePage();
	      translateValidationForm();

	      //$('.zipcode').mask("00000-000", {placeholder: "_____-___"});

	      initIntelInputs();

	      var customer_contact_number=getStorage("customer_contact_number");
	      if(!empty(customer_contact_number)){
	      	  $(".contact_phone").val( customer_contact_number );
	      }

	      break;

		case "searchresult-page":
		$("#search-text").html('Take Away / Delivery');
		callAjax("search_take_away","&start="+start+"&limit="+limit+"&type=1&address="+ getStorage("search_address")+"&cuisine="+getStorage("cuisine")+"&parish="+getStorage("parish"));
		break;

		case "page-searchmap":
		callAjax("search_take_away_on_map","&start=0&limit=40&type=1&address=null&cuisine=&parish=");
		break;

		case "page-home":
    if(!isLogin())
    {
      console.log("IF");
      $("#welcome_msg").html("");
    }
		else if(isLogin())
		{
      console.log("IF else");
			$("#welcome_msg").html( "Welcome back, "+ getStorage("client_name_cookie") );
		}
    else{
      console.log("ELSE");
        $("#welcome_msg").html("");
    }
			geoComplete();

			search_address=getStorage("search_address");

			if (typeof search_address === "undefined" || search_address==null || search_address=="" ) {
			} else {
				setTimeout('$("#s").val(search_address)', 1000);
			}
			translatePage();

			$("#s").attr("placeholder",  getTrans('Street Address,City,State','home_search_placeholder') );

		break;

		case "page-filter-options":
		  callAjax('cuisineList','');
		  break;

		// Special function
		case "page-filter-option":
	 	//	alert("page-filter-option");
		  callAjax('cuisineLists','');
		  break;

		// special function

		case "page-filter-optn":
		//	alert("lets us check");
		  callAjax('cuisinLists','');
		  break;

		case "page-browse":
			callAjax("browseRestaurant","&start="+start+"&limit="+limit+"&type=1&address="+ getStorage("search_address")+"&cuisine="+getStorage("cuisine")+"&parish="+getStorage("parish"));
		  translatePage();
		  break;

		case "page-table-booking":
			callAjax('BrowseByBookTable','');
	//		callAjax("BrowseByBookTable","type="+type+"&address="+ getStorage("search_address") +"&services=" + services +
	//"&cuisine_type="+cuisine_type + "&restaurant_name="+ $(".restaurant_name").val() );
		  translatePage();
		  break;


		case "page-profile":
		  callAjax('getProfile',
		  "client_token="+getStorage("client_token")
		  );
		 // $("#page-profile .profile-pic-wrap").show();
		  translatePage();
		  translateValidationForm();

		  $(".first_name").attr("placeholder",  getTrans('First Name','first_name') );
		  $(".last_name").attr("placeholder",  getTrans('Last Name','last_name') );
		  $(".email_address").attr("placeholder",  getTrans("Email Address",'email_address') );
		  $(".password").attr("placeholder",  getTrans("Password",'password') );

		  break;

		case "page-orders":
		  callAjax('getOrderHistory',
		  "client_token="+getStorage("client_token")
		  );
		  translatePage();
		  break;

		case "page-history":
		  callAjax('getBookingHistory',
		  "client_token="+getStorage("client_token")+"&client_id="+getStorage("client_id")
		  );
		  translatePage();
		  break;

			case "page-terms":
			  callAjax('termsAndconditions',
			  "client_token="+getStorage("client_token")+"&client_id="+getStorage("client_id")
			  );
			  translatePage();
			  break;

		case "page-addressbook":
		  callAjax('getAddressBook',
		  "client_token="+getStorage("client_token")
		  );
		  translatePage();
		  break;

		case "page-dialog-addressbook":
		  callAjax('getAddressBookDialog',
		  "client_token="+getStorage("client_token")
		  );
		  break;

		case "page-login":

		  initFacebook();
		  translatePage();
		  translateValidationForm();

		  $(".email_address").attr("placeholder",  getTrans('Email address','email_address') );
		  $(".password").attr("placeholder",  getTrans('Password','password') );
		  break;

		case "page-prelogin":
    var nxt=getStorage("transaction_type");
    console.log(nxt);
    $("#next_mens").attr("onclick", "showLogin('"+nxt+"')");
		  initFacebook();
		  translatePage();
		  translateValidationForm();

		  $(".email_address").attr("placeholder",  getTrans('Email address','email_address') );
		  $(".password").attr("placeholder",  getTrans('Password','password') );

		  break;

		case "page-settings":
		  callAjax("getSettings",
		  "device_id="+getStorage("device_id")
		  );
		  translatePage();
		  break;

		case "page-locations":
		  callAjax('mobileCountryList',
		  "device_id="+getStorage("device_id")
		  );
		  break;

		case "page-languageoptions":
		  callAjax('getLanguageSelection','');
		  break;

		case "page-expirationmonth":
		  fillExpirationMonth();
		  break;

		case "page-expiration-year":
		  fillExpirationYear();
		  break;

		case "page-show-country":
		   fillCountryList();
		   break;


		case "page-pts":
		  dump('page-pts');
		   callAjax('getPTS',
		    "client_token="+getStorage("client_token")
		   );
		   translatePage();
		   break;

		case "page-atz-form":
		   translatePage();
	       translateValidationForm();

	       $(".cc_number").attr("placeholder",  getTrans("Credit Card Number",'cc_number') );
	       $(".cvv").attr("placeholder",  getTrans("CVV",'cvv') );
	       $(".x_first_name").attr("placeholder",  getTrans("First Name",'first_name') );
	       $(".x_last_name").attr("placeholder",  getTrans("Last Name",'last_name') );
	       $(".x_address").attr("placeholder",  getTrans("Address",'address') );
	       $(".x_city").attr("placeholder",  getTrans("City",'city') );
	       $(".x_state").attr("placeholder",  getTrans("State",'state') );
	       $(".x_zip").attr("placeholder",  getTrans("Post Code",'zipcode') );

		   break;

		case "page-cpy-form":
		   translatePage();
	       translateValidationForm();

	       $(".cc_number").attr("placeholder",  getTrans("Enter Card Number",'cc_number') );
	       $(".cvv").attr("placeholder",  getTrans("CVV",'cvv') );
	       $(".x_first_name").attr("placeholder",  getTrans("First Name",'first_name') );
	       $(".x_last_name").attr("placeholder",  getTrans("Last Name",'last_name') );
	       $(".x_address").attr("placeholder",  getTrans("Address",'address') );
	       $(".x_city").attr("placeholder",  getTrans("City",'city') );
	       $(".x_state").attr("placeholder",  getTrans("State",'state') );
	       $(".x_zip").attr("placeholder",  getTrans("Post Code",'zipcode') );

		   break;

		case "page-stripe-form":
		   translatePage();
	       translateValidationForm();

	       $(".cc_number").attr("placeholder",  getTrans("Credit Card Number",'cc_number') );
	       $(".cvv").attr("placeholder",  getTrans("CVV",'cvv') );

		   break;


		case "page-verify-account":
		  $(".code").attr("placeholder",  getTrans("Code",'code') );
		  $(".email_address").attr("placeholder",  getTrans("Email Address",'email_address') );
		  translatePage();
		  translateValidationForm();
		 break;

		case "page-address-selection":
           translatePage();
		   translateValidationForm();
		   $(".stree_1").attr("placeholder",  getTrans("Street",'street') );
	       $(".city_1").attr("placeholder",  getTrans("City",'city') );
	       $(".state_1").attr("placeholder",  getTrans("State",'state') );
	       $(".zipcode_1").attr("placeholder",  getTrans("Post Code",'zipcode') );
		  break;

		default:
		  break;
	}

}, false);

function searchResultCallBack(address)
{
	search_address=address;
}

function showFilterOptions(type)
{
	if (typeof navDialog === "undefined" || navDialog==null || navDialog=="" || typeof navDialog === 'object' ) {
		if(type==1)
		{
			// alert("one");
			if(typeof navDialog !== "undefined")
				navDialog.destroy();
			ons.createDialog('filterOptons.html').then(function(dialog) {
		        dialog.show();
		        translatePage();
		    });
		}
		if(type==2)
		{
			// alert("two");
			if(typeof navDialog !== "undefined")
				navDialog.destroy();
			ons.createDialog('tableBookingfilterOptons.html').then(function(dialog) {
		        dialog.show();
		        translatePage();
		    });
		}
		if(type==3)
		{
			//alert("three");
			if(typeof navDialog !== "undefined")
				navDialog.destroy();
			ons.createDialog('filterOpton.html').then(function(dialog) {
		        dialog.show();
		        translatePage();
		    });
		}

	} else {
		navDialog.show();

		//translatePage();
	}
}

function applyFilter(type)
{
	navDialog.hide();


	var services='';
	if (  $(".delivery_type").exists()){
		$.each( $(".delivery_type:checked") , function( key, val ) {
			services+= $(this).val() +",";
		});
	}

	dump("services=>"+services);
	var cuisine_type='';
	if (  $(".cuisine_type").exists()){
		$.each( $(".cuisine_type:checked") , function( key, val ) {
			cuisine_type+= $(this).val() +",";
		});
	}
	dump("cuisine_type=>"+cuisine_type);
	if(type==1)
	{
	callAjax("search","type="+type+"&address="+ getStorage("search_address") +"&services=" + services +
	"&cuisine_type="+cuisine_type + "&restaurant_name="+ $(".restaurant_name").val() );
    }
    if(type==2)
    {
    	callAjax("BrowseByBookTable","type="+type+"&address="+ getStorage("search_address") +"&services=" + services +
	"&cuisine_type="+cuisine_type + "&restaurant_name="+ $(".restaurant_name").val() );
    }
    if(type==3)
    {
    	callAjax("searchRestaurant","type="+type+"&address="+ getStorage("search_address") +"&services=" + services +
	"&cuisine_type="+cuisine_type + "&restaurant_name="+ $(".restaurant_name").val() );
    }

}

function onsenAlert(message,dialog_title)
{
	if (typeof dialog_title === "undefined" || dialog_title==null || dialog_title=="" ) {
		dialog_title=dialog_title_default;
	}
	ons.notification.alert({
      message: message,
      title:dialog_title
    });
}

function toast_new(message)
{
    ons.notification.toast({
      message: message,
      timeout: 2000
    });
}
function hideAllModal()
{
	setTimeout('loaderSearch.hide()', 1);
	setTimeout('loader.hide()', 1);
	setTimeout('loaderLang.hide()', 1);
}

/*mycallajax*/
function callAjax(action,params)
{

	if ( !hasConnection() ){
		if ( action!="registerMobile"){
		    onsenAlert(  getTrans("CONNECTION LOST",'connection_lost') );
		}
		return;
	}

	dump("action=>"+action);

	/*add language use parameters*/
	params+="&lang_id="+getStorage("default_lang");
	if(!empty(krms_config.APIHasKey)){
		params+="&api_key="+krms_config.APIHasKey;
	}
	dump(ajax_url+"/"+action+"?"+params);

    ajax_request = $.ajax({
		url: ajax_url+"/"+action,
		data: params,
		type: 'post',
		async: false,
		dataType: 'jsonp',
		timeout: 6000,
		crossDomain: true,
	 beforeSend: function() {
		if(ajax_request != null) {
		   /*abort ajax*/
		   hideAllModal();
           ajax_request.abort();
		} else {
			/*show modal*/
			switch(action)
			{

				case "registerMobile":
				   break;
				case "search":
				   loaderSearch.show();
				   translatePage();
				   break;
			    case "getLanguageSettings":
			       //loaderLang.show();
			       break;
				default:
				   loader.show();
				   break;
			}
		}
	},
	complete: function(data) {
		ajax_request=null;
		hideAllModal();
	},
	success: function (data) {
		dump(data);
		if (data.code==1){
			switch (action)
			{
				case "search":
				displayRestaurantResults(data.details.data ,'restaurant-results',1);
				if(data.details.total > 1)
				{
				$(".result-msg").text(data.details.total+" "+getTrans("restaurant can deliver",'restaurant_found') );
				}
				else
				{
				$(".result-msg").text(data.details.total+" "+getTrans("restaurant can deliver",'restaurant_found') );
				}
				break;

				case "search_take_away":
					displayRestaurantResults(data.details.data ,'restaurant-results',1,data.details.total,'loadmore',data.code);
					if(data.details.total > 1)
					{
					$(".result-msg").text(data.details.total+" "+getTrans("restaurant can deliver",'restaurant_found') );
					}
					else{
						$(".result-msg").text(data.details.total+" "+getTrans("restaurant can deliver",'restaurant_found') );
					}

				break;

				case "search_take_away_on_map":
				displayRestaurantResultsOnMap(data.details.data);
				break;

				case "LoadAddOns":
				append_addons(data);
				break;

				case "MobileMenuNew":
				/*save merchant logo*/
				setStorage("merchant_logo",data.details.logo);
				dump(data.details.restaurant_name);
				setStorage("merchant_name",data.details.restaurant_name);

				setStorage("enabled_table_booking",data.details.enabled_table_booking);

				setStorage("merchant_latitude",data.details.coordinates.latitude);
				setStorage("merchant_longtitude",data.details.coordinates.longtitude);
				setStorage("merchant_address",data.details.address);

				menuCategoryResult(data.details);
				break;
        case "NextMenu":
          //menuCategoryResult(div,data.details);
        break;
				case "MobileLoadMore":
				/*save merchant logo*/
				//setStorage("merchant_logo",data.details.logo);
				//dump(data.details.restaurant_name);
				//setStorage("merchant_name",data.details.restaurant_name);

				//setStorage("enabled_table_booking",data.details.enabled_table_booking);

				//setStorage("merchant_latitude",data.details.coordinates.latitude);
				//setStorage("merchant_longtitude",data.details.coordinates.longtitude);
				//setStorage("merchant_address",data.details.address);
				// alert(data.details.toSource());
				menu_cat_load(data.details);
				break;

				case "cuisineList":
				cuisineResults(data.details);
				break;

				case "cuisineLists":
				cuisineResult(data.details);
				break;

				case "cuisinLists":
				cuisineReslts(data.details);
				break;

				case "getItemByCategory":
				easy_category_list='';
				displayItemByCategory(data.details);
				fillPopOverCategoryList(data.details.category_list);
				break;

				case "getItemDetails":
				displayItem(data.details);
				break;

				case "loadCart":
				$("#page-cart .wrapper").show();
				$(".checkout-footer").show();
				$("#page-cart .frm-cart").show();

				/*tips*/
				if ( data.details.enabled_tip==2){
					$(".tip_amount_wrap").show();
				} else {
					$(".tip_amount_wrap").hide();
				}

				displayCart(data.details);

				if (!empty(data.details.cart.discount)){
					setStorage("has_discount",1);
				} else {
					removeStorage("has_discount");
				}

				if (typeof addressDialog === "undefined" || addressDialog==null || addressDialog=="" ) {
				} else {
					if ( addressDialog.isShown()){
						addressDialog.hide();
					}
				}

				break;

				case "checkout":
				// alert(data.msg.address_book.toSource());
				    if ( data.details=="shipping"){
				    	var options = {
					      animation: 'slide',
					      onTransitionEnd: function() {
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-shipping');

					      	  /*if (data.msg.length>0){
					      	  	  $(".select-addressbook").css({"display":"block"});
					      	  } else $(".select-addressbook").hide();*/

					      	  if(!empty(data.msg.profile)){
					      	  	  $(".contact_phone").val( data.msg.profile.contact_phone ) ;
					      	  	  $(".location_name").val( data.msg.profile.location_name ) ;
					      	  }

					      	  if ( !empty( getStorage("map_address_result_formatted_address") )){
					      	  	    $(".delivery-address-text").html( getStorage("map_address_result_formatted_address") );
								    $(".street").val( getStorage("map_address_result_address") );
								    $(".city").val( getStorage("map_address_result_city") );
								    $(".state").val( getStorage("map_address_result_state") );
								    $(".zipcode").val( getStorage("map_address_result_zip") );
								    $(".formatted_address").val( getStorage("map_address_result_formatted_address") );

								    $(".google_lat").val( getStorage("google_lat") );
								    $(".google_lng").val( getStorage("google_lng") );
					      	  } else {
					      	  	  if(!empty(data.msg.address_book)){
					      	  	  	  $(".street").val( data.msg.address_book.street );
									  $(".city").val( data.msg.address_book.city );
									  $(".state").val( data.msg.address_book.state );
									  $(".zipcode").val( data.msg.address_book.zipcode );
                    $(".zipcode_1").val( data.msg.address_book.zipcode );
									  $(".location_name").val( data.msg.address_book.location_name );

                     $("#edit_div").hide();
					 $("#default_address_div").show();
					// alert(data.msg.address_book.toSource());
                     $("#address_def").val(data.msg.address_book.address);
                     $(".stree_1").val(data.msg.address_book.street);
                     $(".city_1").val(data.msg.address_book.city);
                     $(".state_1").val(data.msg.address_book.state);
                     $(".zipcode").val(data.msg.address_book.zipcode);
									  var complete_address = data.msg.address_book.street;
									  complete_address+=" "+ data.msg.address_book.city;
									  complete_address+=" "+ data.msg.address_book.state;
									  complete_address+=" "+ data.msg.address_book.zipcode;

									  $(".delivery-address-text").html( complete_address );
									  $(".formatted_address").val( complete_address );
					      	  	  }
					      	  }

					      } /*end transition*/
					    };
					    sNavigator.pushPage("shipping.html", options);

				    } else if ( data.details =="payment_method") {

					    var options = {
					      animation: 'slide',
					      onTransitionEnd: function() {
					      	  displayMerchantLogo2(
					      	     getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-paymentoption'
					      	  );
					      	  var params="merchant_id="+ getStorage("merchant_id");
					      	  params+="&client_token="+ getStorage("client_token");
					      	  params+="&transaction_type=" + $(".transaction_type:checked").val();
					      	  callAjax("getPaymentOptions",params);
					      }
					    };
					    sNavigator.pushPage("paymentOption.html", options);

				    } else if ( data.details =="enter_contact_number") {

				    	var options = {
					      animation: 'slide',
					      onTransitionEnd: function() {
					      	  initIntelInputs();
					      }
					    };
					    sNavigator.pushPage("enterContact.html", options);

				    }
            else if(data.details == "checkoutSignup")
            {
              if(isLogin())
              {
                var options = {
                  animation: 'slide',
                  onTransitionEnd: function() {
                      displayMerchantLogo2( getStorage("merchant_logo") ,
                         getStorage("order_total") ,
                         'page-shipping');

                      /*if (data.msg.length>0){
                          $(".select-addressbook").css({"display":"block"});
                      } else $(".select-addressbook").hide();*/

                      if(!empty(data.msg.profile)){
                          $(".contact_phone").val( data.msg.profile.contact_phone ) ;
                          $(".location_name").val( data.msg.profile.location_name ) ;
                      }

                      if ( !empty( getStorage("map_address_result_formatted_address") )){
                            $(".delivery-address-text").html( getStorage("map_address_result_formatted_address") );
                      $(".street").val( getStorage("map_address_result_address") );
                      $(".city").val( getStorage("map_address_result_city") );
                      $(".state").val( getStorage("map_address_result_state") );
                      $(".zipcode").val( getStorage("map_address_result_zip") );
                      $(".formatted_address").val( getStorage("map_address_result_formatted_address") );

                      $(".google_lat").val( getStorage("google_lat") );
                      $(".google_lng").val( getStorage("google_lng") );
                      } else {
                          if(!empty(data.msg.address_book)){
                              $(".street").val( data.msg.address_book.street );
                      $(".city").val( data.msg.address_book.city );
                      $(".state").val( data.msg.address_book.state );
                      $(".zipcode").val( data.msg.address_book.zipcode );
                      $(".zipcode_1").val( data.msg.address_book.zipcode );
                      $(".location_name").val( data.msg.address_book.location_name );

                       $("#edit_div").hide();
                       $("#default_address_div").show();
                       $("#address_def").val(data.msg.address_book.address);
                       $(".stree_1").val(data.msg.address_book.street);
                       $(".city_1").val(data.msg.address_book.city);
                       $(".state_1").val(data.msg.address_book.state);
                       $(".zipcode").val(data.msg.address_book.zipcode);
                      var complete_address = data.msg.address_book.street;
                      complete_address+=" "+ data.msg.address_book.city;
                      complete_address+=" "+ data.msg.address_book.state;
                      complete_address+=" "+ data.msg.address_book.zipcode;

                      $(".delivery-address-text").html( complete_address );
                      $(".formatted_address").val( complete_address );
                          }
                      }

                  } /*end transition*/
                };
                sNavigator.pushPage("shipping.html", options);
              }
              else{
                var options = {
                    animation: 'slide',
                    onTransitionEnd: function() {
                        dump( getStorage("merchant_logo") );
                        dump( getStorage("order_total") );
                        displayMerchantLogo2( getStorage("merchant_logo") ,
                           getStorage("order_total") ,
                           'page-checkoutsignup');

                        callAjax("getCustomFields",'');
                        initIntelInputs();
                    }
                  };
                  sNavigator.pushPage("checkoutSignup.html", options);
              }
            }
             else {
						var options = {
					      animation: 'slide',
					      onTransitionEnd: function() {
					      	  dump( getStorage("merchant_logo") );
					      	  dump( getStorage("order_total") );
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-checkoutsignup');

					      	  callAjax("getCustomFields",'');
					      	  initIntelInputs();
					      }
					    };
					    sNavigator.pushPage("checkoutSignup.html", options);
				    }
				break;

				case "signup":
				    setStorage("client_token", data.details.token ); // register token

				    setStorage("avatar",data.details.avatar);
                    setStorage("client_name_cookie",data.details.client_name_cookie);

					if (data.details.next_step=="shipping_address"){
						var options = {
					      animation: 'slide',
					      onTransitionEnd: function() {
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-shipping');

					      	     fillShippingAddress();
					      }
					    };
					    sNavigator.pushPage("shipping.html", options);

					} else if ( data.details.next_step =="return_home") {
						onsenAlert(data.msg);
						menu.setMainPage('select_dining.html', {closeMenu: true});

				   // mobile verification
				   } else if ( data.details.next_step =="mobile_verification") {

				   	    removeStorage('client_token');

						var options = {
					      animation: 'none',
					      onTransitionEnd: function() {
					      	   $(".mobile-verification-msg").show();
					      	   $(".email-verification-msg").hide();
					      	   $(".client_id").val( data.details.client_id);
					      	   $(".is_checkout").val( data.details.is_checkout);
					      	   $(".validation_type").val( data.details.next_step );
					      }
					    };
					    sNavigator.pushPage("SignupVerification.html", options);

					// email verification
					} else if ( data.details.next_step =="email_verification") {

				   	    removeStorage('client_token');

						var options = {
					      animation: 'none',
					      onTransitionEnd: function() {
					      	   $(".mobile-verification-msg").hide();
					      	   $(".email-verification-msg").show();
					      	   $(".client_id").val( data.details.client_id);
					      	   $(".is_checkout").val( data.details.is_checkout);
					      	   $(".validation_type").val( data.details.next_step );
					      }
					    };
					    sNavigator.pushPage("SignupVerification.html", options);

					} else {
						dump('payment_option');
						 var options = {
					      animation: 'slide',
					      onTransitionEnd: function() {
					      	  displayMerchantLogo2(
					      	     getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-paymentoption'
					      	  );
					      	  var params="merchant_id="+ getStorage("merchant_id");
					      	  callAjax("getPaymentOptions",params);
					      }
					    };
					    sNavigator.pushPage("paymentOption.html", options);
					}
				break;

				case "getPaymentOptions":
				/*	alert("Its triggering");
					alert(data.details.toSource()); */
             if(getStorage("has_disc_price"))
             {
               var fees_deli=getStorage("has_disc_price");
               $('<input>').attr({
                   type: 'hidden',
                   id: 'has_discount_applied',
                   name: 'has_discount_applied',
                   value: fees_deli
               }).appendTo('#frm-paymentoption');
             }
             // setStorage("merchant_logo",data.merchant_info.logo);
             // setStorage("order_total",data.cart.grand_total.amount_pretty);
             //
             // setStorage("order_total_raw",data.cart.grand_total.amount);
             // setStorage("cart_currency_symbol",data.currency_symbol);
             //
             // setStorage("cart_sub_total_pretty", data.cart.sub_total.amount );
             // setStorage("discnt_prce" ,data.cart.discount.display);
             // setStorage("discnt_prce_pretty" ,data.cart.discount.amount_pretty);
             $(".tot_prce").html(getStorage("order_total"));
             setStorage("final_total_amnt",getStorage("order_total"));
             $(".sub_tot_prce").html(getStorage("cart_sub_total_pretty"));
             if(getStorage("discnt_prce"))
             {
               $(".discunt_show").show();
               $(".discnt_name").html(getStorage("discnt_prce"));
               $(".discnt_price").html(getStorage("discnt_prce_pretty"));
             }
				     $(".frm-paymentoption").show();
			   	   $(".paypal_flag").val( data.details.paypal_flag );
			   	   $(".paypal_mode").val( data.details.paypal_credentials.mode );
			   	   $(".client_id_sandbox").val( data.details.paypal_credentials.client_id_sandbox );
			   	   $(".client_id_live").val( data.details.paypal_credentials.client_id_live );
			   	   $(".paypal_card_fee").val( data.details.paypal_credentials.card_fee );



			   	   $(".citypay_mode").val( data.details.citypay_credentials.mode);
			   	   $(".citypay_username").val( data.details.citypay_credentials.username );
			   	   $(".citypay_password").val( data.details.citypay_credentials.password );
			   	   $(".citypay_fee").val( data.details.citypay_credentials.card_fee );

			   	   setStorage("citypay_mode", data.details.citypay_credentials.mode );
			   	   setStorage("citypay_username", data.details.citypay_credentials.username );
			   	   setStorage("citypay_password", data.details.citypay_credentials.password );
			   	   setStorage("citypay_fee", data.details.citypay_credentials.card_fee );

			   	   setStorage("paypal_card_fee", data.details.paypal_credentials.card_fee );
             console.log(getStorage("total_amount_final"));
             if( parseInt(getStorage("total_amount_final")) < parseInt(data.details.minimum_order) || data.details.minimum_order == "0" || data.details.minimum_order == "")
             {
               console.log(getStorage("total_amount_final"));
               console.log(data.details.parish_delivery_fee);
               $(".tot_prce").html(prettyPrice(getStorage("order_total_raw")));
             if(data.details.parish_delivery_fee > 0)
             {
               $("#has_delivery_fee").show();
               $(".delivery_show").show();
               $("#fee_delvry").html(data.details.parish_delivery_fee);
               $(".del_price").html(prettyPrice(parseFloat(data.details.parish_delivery_fee)));
               var final_amnt=parseFloat(getStorage("order_total_raw")) + parseFloat(data.details.parish_delivery_fee);
               $(".tot_prce").html(prettyPrice(final_amnt));
               setStorage("order_total",final_amnt);
               setStorage("final_total_amnt",final_amnt);
               //$(".frm-paymentoption").html('<input type="hidden" value="'+data.details.parish_delivery_fee+'" name="extra_delivery_fee">');
               $('<input>').attr({
                   type: 'hidden',
                   id: 'extra_delivery_fee',
                   name: 'extra_delivery_fee',
                   value: data.details.parish_delivery_fee
               }).appendTo('#frm-paymentoption');
               setStorage("delivery_fee_applicable",data.details.parish_delivery_fee);
               $("#place_order_div").hide();
               $("#place_order_div_if_delivery").show();

             }
            }
			   	   if (data.details.voucher_enabled=="yes"){
               if(!isLogin())
               {
                 $(".voucher-wrap").hide();
               }
               else{
			   	   	   $(".voucher-wrap").show();
			   	   	   $(".voucher_code").attr("placeholder", getTrans("Enter your voucher",'enter_voucher_here') );
               }
			   	   } else {
			   	   	   $(".voucher-wrap").hide();
			   	   }

			   	   /*set stripe key*/
			   	   setStorage("stripe_publish_key", data.details.stripe_publish_key );
			   	   setStorage("stripe_publish_key", data.details.stripe_publish_key );

			   	   /*set razor pay*/
			   	   if (!empty(data.details.razorpay)){
			   	   	   setStorage("razor_key_id", data.details.razorpay.razor_key );
			   	       setStorage("razor_secret_key", data.details.razorpay.razor_secret );
			   	   }

			   	   /*pts*/
			   	   if ( getStorage("pts")==2){
			   	   	   dump('pts is enabled');
			   	   	   $(".redeem_points").attr("placeholder",data.details.pts.pts_label_input);
			   	   	   $(".pts_available_points").html(data.details.pts.balance);
			   	   } else {
			   	   	   $(".pts-apply-points-wrap").hide();
			   	   }

			   	   displayPaymentOptions(data);
				break;

				case "placeOrder":

				  setStorage("order_id",data.details.order_id);
          if(data.details.payment_details.client_login_details)
          {
          setStorage("client_token",data.details.payment_details.client_login_details.token);
				  setStorage("client_id",data.details.payment_details.client_login_details.client_id);
          setStorage("client_name_cookie",data.details.payment_details.client_login_details.client_name_cookie);

          }
				  // alert(data.details.toSource());
				  switch (data.details.next_step){

				  	   case "paypal_init":

				  	   setStorage("currency_code", data.details.payment_details.currency_code);
				  	   setStorage("paymet_desc", data.details.payment_details.paymet_desc);
				  	   setStorage("total_w_tax", data.details.payment_details.total_w_tax);

				  	   app_paypal.initPaymentUI();
				  	   break;

				  	   case "cpy_init":
				  	   setStorage("currency_code", data.details.payment_details.currency_code);
				  	   setStorage("paymet_desc", data.details.payment_details.paymet_desc);
				  	   setStorage("total_w_tax", data.details.payment_details.total_w_tax);
				  	   var options = {
						      animation: 'slide',
						      onTransitionEnd: function() {
						      	  $(".order_id").val( data.details.order_id );
						      	  $(".currency_code").val( data.details.payment_details.currency_code );
						      	  $(".paymet_desc").val( data.details.payment_details.paymet_desc );
						      	  $(".total_w_tax").val( data.details.payment_details.total_w_tax );
						      }
						  };

						 payCityPay(data.details.url_details);


				  	   break;

				  	   case "atz_init":
				  	      var options = {
						      animation: 'slide',
						      onTransitionEnd: function() {
						      	  $(".order_id").val( data.details.order_id );
						      	  $(".currency_code").val( data.details.payment_details.currency_code );
						      	  $(".paymet_desc").val( data.details.payment_details.paymet_desc );
						      	  $(".total_w_tax").val( data.details.payment_details.total_w_tax );
						      }
						  };
						  sNavigator.pushPage("atzPaymentForm.html", options);
				  	   break;


				  	   case "stp_init":
				  	      var options = {
						      animation: 'slide',
						      onTransitionEnd: function() {
						      	  $(".order_id").val( data.details.order_id );
						      	  $(".currency_code").val( data.details.payment_details.currency_code );
						      	  $(".paymet_desc").val( data.details.payment_details.paymet_desc );
						      	  $(".total_w_tax").val( data.details.payment_details.total_w_tax );
						      }
						  };
						  sNavigator.pushPage("stripePaymentForm.html", options);
				  	   break;

				  	   case "rzr_init":

				  	     var razor_key_id = getStorage("razor_key_id");

				  	     if(empty(razor_key_id)){
				  	     	onsenAlert( getTrans("Key id is empty","key_id_empty") );
				  	     	return;
				  	     }

				  	     var rzr_options = {
						  description: data.details.payment_details.paymet_desc ,
						  currency: data.details.payment_details.currency_code ,
						  key: razor_key_id ,
						  amount: data.details.payment_details.total_w_tax_times,
						  name: data.details.payment_details.merchant_name ,
						  prefill: {
						    email: data.details.payment_details.customer_email ,
						    contact: data.details.payment_details.customer_contact ,
						    name: data.details.payment_details.customer_name
						  },
						  theme: {
						    color: data.details.payment_details.color
						  }
						};

						dump(rzr_options);

						if(isDebug()){
						   rzr_successCallback('pay_debug_1234566');
						} else {
						   RazorpayCheckout.open(rzr_options, rzr_successCallback, rzr_cancelCallback);
						}

				  	   break;

				  	   default:
				  	   var options = {
					      animation: 'slide',
					      onTransitionEnd: function() {
					      	  /*displayMerchantLogo2( getStorage("merchant_logo") ,
					      	                      getStorage("order_total") ,
					      	                      'page-receipt');*/
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	                      data.details.payment_details.bill_total_pretty ,
					      	                      'page-receipt');
					      	  $(".receipt-msg").html(data.msg);
					      }
					    };
					    sNavigator.pushPage("receipt.html", options);

              removeStorage("has_disc_price");
              discnt_params="";
              deal_params="";
              $( "#frm-paymentoption #has_discount_applied" ).remove();
				  	   break;
				  }
				  break;
				case "paypalSuccessfullPayment":
				  
				case "PayAtz":
				case "Paycpy":
				case "PayStp":
				case "razorPaymentSuccessfull":

				       var amount_to_pay=data.details.amount_to_pay;
				       if(amount_to_pay==0){
				       	  amount_to_pay=getStorage("order_total");
				       }
					   var options = {
					      animation: 'slide',
					      onTransitionEnd: function() {
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	                       prettyPrice(amount_to_pay) ,
					      	                      'page-receipt');
					      	  $(".receipt-msg").html(data.msg);
					      }
					    };
					    sNavigator.pushPage("receipt.html", options);

              removeStorage("has_disc_price");
              $( "#frm-paymentoption #has_discount_applied" ).remove();
				   break;

				case "getMerchantInfo":						 
				   showMerchantInfo(data.details)
				   break;

				/*case "bookTable":
				  var options = {
				      animation: 'slide',
				      onTransitionEnd: function() {
				      	  displayMerchantLogo2(
				      	     getStorage("merchant_logo") ,
				      	     '' ,
				      	     'page-booking-ty'
				      	  );

				      	  $(".book-ty-msg").html(data.msg);
				      }
				    };
				    sNavigator.pushPage("bookingTY.html", options);
				    break;*/
				 case "bookATableNewconcept":
			    $('#frm-booking')[0].reset();
			    var options = {
				      animation: 'slide',
				      onTransitionEnd: function() {
				      	  displayMerchantLogo2(
				      	     getStorage("merchant_logo") ,
				      	     '' ,
				      	     'page-booking-ty'
				      	  );

				      	  $(".book-ty-msg").html(data.msg);
				      }
				    };
				    sNavigator.pushPage("bookingTY.html", options);
				    break;
				case "merchantReviews":

				   displayReviews(data.details);
				   break;

				case "addReview":
				   onsenAlert(data.msg);
				   sNavigator.popPage({cancelIfRunning: true});
				   loadMoreReviews();
				   break;


				case "browseRestaurant":
				// alert("browseRestaurant");
				   displayRestaurantResults( data.details.data ,'browse-results',2,data.details.total,'loadmore',data.code,'browse');
				   //$(".result-msg").text(data.details.total+" Restaurant found");
					 	if(data.details.total > 1){
				   		$(".result-msg").text(data.details.total+" "+ getTrans("restaurant can deliver",'restaurant_found')  );
				 		}
						else{
							$(".result-msg").text(data.details.total+" "+ getTrans("restaurant can deliver",'restaurant_found')  );
						}
				   break;

			   case "BrowseByBookTable":
			   	displayBookTableResults(data.details.data ,'restaurant-result',2);
				//$(".result-msg").text(data.details.total+" Restaurant found");
				if(data.details.total > 1){
					$(".result-msg").text(data.details.total+" "+ getTrans("restaurant for book a table",'restaurant_found')  );
				}
				else{
					$(".result-msg").text(data.details.total+" "+ getTrans("restaurant  for book a table",'restaurant_found')  );
				}
			   break;

				case "searchRestaurant":
			    	displayRestaurantResults(data.details.data ,'browse-results',3);
					if(data.details.total > 1){
						$(".result-msg").text(data.details.total+" "+ getTrans("restaurant can deliver",'restaurant_found')  );
					}
					else{
						$(".result-msg").text(data.details.total+" "+ getTrans("restaurant can deliver",'restaurant_found')  );
					}
			   break;

				case "getProfile":

				  $(".first_name").val( data.details.first_name );
				  $(".last_name").val( data.details.last_name );
				  $(".email_address").val( data.details.email_address );
				  $(".contact_phone").val( data.details.contact_phone );

				  $(".avatar").attr("src", data.details.avatar );

				  $("#hide_book_a_table input[name='booking_name']").val(data.details.first_name+" "+data.details.last_name);
				  $("#hide_book_a_table input[name='email']").val(data.details.email_address);
				  $("#hide_book_a_table input[name='mobile']").val(data.details.contact_phone);

				  dump('set avatar');
				  setStorage("avatar",data.details.avatar);

				  imageLoaded('.img_loaded');

				  initIntelInputs();

				  break;


				case "registerUsingFb":
				case "login":

				  setStorage("client_token",data.details.token);
				  setStorage("client_id",data.details.client_id);
				  setStorage("avatar",data.details.avatar);
          setStorage("client_name_cookie",data.details.client_name_cookie);
					toastMsg("Logged in successfully");
          //ons.notification.toast({message: 'Logged in successfully', timeout: 2000});
				  switch (data.details.next_steps)
				  {
            case "orders":
            menu.setMainPage('orders.html', {closeMenu: true});
            break;
            case "profile":
            menu.setMainPage('profile.html', {closeMenu: true});
            break;
            case "history":
            menu.setMainPage('history.html', {closeMenu: true});
            break;
            case "address_book":
            menu.setMainPage('addressBook.html', {closeMenu: true});
            break;

				  	 case "delivery":
					  	 var options = {
					      animation: 'slide',
					      onTransitionEnd: function() {
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-shipping');

						      	  /*if (data.details.has_addressbook==2){
						      	  	 $(".select-addressbook").css({"display":"block"});
						      	  } else {
						      	  	 $(".select-addressbook").hide();
						      	  }*/

                      if(data.details.default_address.address)
                      {
                        $("#default_address_div").show();
                        $("#edit_div").hide();
                        $("#address_def").val(data.details.default_address.address);
                        $(".stree_1").val(data.details.default_address.street);
                        $(".city_1").val(data.details.default_address.city);
                        $(".state_1").val(data.details.default_address.state);
                        $(".zipcode_1").val(data.details.default_address.zipcode);
                      }
                                 if(!empty(data.details.contact_phone)){
					      	  	     $(".contact_phone").val( data.details.contact_phone ) ;
					      	     }
					      	     if(!empty(data.details.location_name)){
					      	  	     $(".location_name").val( data.details.location_name ) ;
					      	     }

						      	 if ( !empty( getStorage("map_address_result_formatted_address") )){
					      	 $(".delivery-address-text").html( getStorage("map_address_result_formatted_address") );
					      	 $(".street").val( getStorage("map_address_result_address") );
									 $(".city").val( getStorage("map_address_result_city") );
									 $(".state").val( getStorage("map_address_result_state") );
									 $(".zipcode").val( getStorage("map_address_result_zip") );
									 $(".formatted_address").val( getStorage("map_address_result_formatted_address") );

									 $(".google_lat").val( getStorage("google_lat") );
									 $(".google_lng").val( getStorage("google_lng") );
					      	  	 } else {
					      	  	    if (data.details.has_addressbook==2){

					      	   $(".delivery-address-text").html( data.details.default_address.address );
					      	   $(".street").val (  data.details.default_address.street  );
									   $(".city").val( data.details.default_address.city  );
									   $(".state").val( data.details.default_address.state );
									   $(".zipcode").val(  data.details.default_address.zipcode );
                     $(".zipcode_1").val(  data.details.default_address.zipcode );
									   $(".formatted_address").val( data.details.default_address.address );
					      	      }
					      	  }
					      }
					     };
					     sNavigator.pushPage("shipping.html", options);
				  	 break;

				  	 case "pickup":

				  	   var options = {
					      animation: 'slide',
					      onTransitionEnd: function() {
					      	  displayMerchantLogo2(
					      	     getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-paymentoption'
					      	  );
					      	  var params="merchant_id="+ getStorage("merchant_id");
					      	  callAjax("getPaymentOptions",params);
					      }
					    };
					    sNavigator.pushPage("paymentOption.html", options);

				  	 break;

				  	 default:
				  	 menu.setMainPage('select_dining.html', {closeMenu: true});
				  	 break;
				  }
				  break;

				case "forgotPassword":
				  onsenAlert(data.msg);
				  dialogForgotPass.hide();
				  break;

				case "getOrderHistory":

				  displayOrderHistory(data.details);

				  break;

				case "getBookingHistory":
          //onsenAlert(data.msg);
				  displayBookingHistory(data.details);
				  break;

					case "termsAndconditions":
					  displayTerms(data.details);
					  break;

				case "ordersDetails":
				  displayOrderHistoryDetails(data.details);
				  break;

				case "getBookingDetails":
				  displayBookingHistoryDetails(data.details);
				  break;

				case "getAddressBook":
				  displayAddressBook(data.details);
				  break;

			    case "getAddressBookDetails":
			      fillAddressBook(data.details);
			      break;

			    case "saveAddressBook":
			      if (data.details=="add"){
			         sNavigator.popPage({cancelIfRunning: true});

			         callAjax('getAddressBook',
					  "client_token="+getStorage("client_token")
					  );
			      } else {
			      	  onsenAlert(data.msg);
			      }
			      break;

			    case "deleteAddressBook":
			         sNavigator.popPage({cancelIfRunning: true});
			         callAjax('getAddressBook',
					  "client_token="+getStorage("client_token")
					  );
			      break;

			    case "getAddressBookDialog":
			       displayAddressBookPopup(data.details);
			       break;

			    case "reOrder":
			       setStorage("merchant_id",data.details.merchant_id)
			       cart=data.details.cart;
			       showCart(data.details.order_id);
			       break;

			    /*case "registerUsingFb":
			       onsenAlert(data.msg);
			       setStorage("client_token",data.details.token);
			       menu.setMainPage('home.html', {closeMenu: true});
			       break;*/

			    case "registerMobile":
			    /*silent */
			    break;

			    case "reverseGeoCoding":
			       $("#s").val( data.details );
			       break;


			    case "getSettings":
			       if ( data.details.enabled_push==1){
			       	   enabled_push.setChecked(true);
			       } else {
			       	   enabled_push.setChecked(false);
			       }
			       $(".country_code_set").val( data.details.country_code_set);

			       var device_id=getStorage("device_id");
			       $(".device_id_val").html( device_id );
			       break;

			    case "mobileCountryList":
			       displayLocations(data.details);
			       break;

			    case "getLanguageSelection":
			       displayLanguageSelection(data.details);
			       break;

			    case "getLanguageSettings":
			       setStorage("translation",JSON.stringify(data.details.translation));

			       dump(data);
			       /*set settings to storage*/
			       setStorage("decimal_place",data.details.settings.decimal_place);
			       setStorage("currency_position",data.details.settings.currency_position);
			       setStorage("currency_set",data.details.settings.currency_set);
			       setStorage("thousand_separator",data.details.settings.thousand_separator);
			       setStorage("decimal_separator",data.details.settings.decimal_separator);
			       setStorage("show_addon_description",data.details.settings.show_addon_description);

			       var device_set_lang=getStorage("default_lang");
			       dump("device_set_lang=>"+device_set_lang);

			       if (empty(device_set_lang)){
			       	   dump('proceed');
				       if(!empty(data.details.settings.default_lang)){
				          setStorage("default_lang",data.details.settings.default_lang);
				       } else {
				       	  setStorage("default_lang","");
				       }
			       }

			       /*single food item*/
			       setStorage('single_add_item', data.details.settings.single_add_item );

			       /*pts*/
			       setStorage("pts",data.details.settings.pts);

			       /*facebook_flag*/
			       setStorage("facebook_flag",data.details.settings.facebook_flag);

			       /*avatar*/
			       setStorage("avatar",data.details.settings.avatar);
			       setStorage("client_name_cookie",data.details.settings.client_name_cookie);
			       setStorage("mobile_country_code",data.details.settings.mobile_country_code);

			       setStorage("from_icon",data.details.settings.map_icons.from_icon);
			       setStorage("destination_icon",data.details.settings.map_icons.destination_icon);

			       setStorage("mobile_save_cart_db",data.details.settings.mobile_save_cart_db);

			       translatePage();
			       break;

			   case "applyVoucher":
			       dump(data.details);
			       $(".voucher_amount").val( data.details.amount );
			       $(".voucher_type").val( data.details.voucher_type );

			       $(".apply-voucher").hide();
			       $(".remove-voucher").css({
			       	  "display":"block"
			       });

			       $(".voucher-header").html(data.details.less);
             console.log(getStorage("final_total_amnt"));
			       var new_total= prettyPrice(data.details.new_total);
			      // $(".total-amount").html( prettyPrice(new_total) );
             $(".voucher_show").show();
             $(".vouchr_price").html(prettyPrice(data.details.less_amount));
             setStorage("order_total",data.details.new_total);
             $(".tot_prce").html(prettyPrice(data.details.new_total));
             setStorage("final_total_amnt",data.details.new_total);
             setStorage("voucher_amnt",data.details.less_amount);
			       break;
        case "saveProfile":
        onsenAlert(data.msg);
           var options = {
         	  	  closeMenu:true,
         	      animation: 'slide',
         	      callback:setHomeCallback
         	   };
         	 menu.setMainPage('select_dining.html',options);
        break;
			    case "validateCLient":
			       setStorage("client_token", data.details.token ); // register token
                   onsenAlert(data.msg);

                   if ( data.details.is_checkout=="shipping_address"){
                   	   var options = {
					      animation: 'slide',
					      onTransitionEnd: function() {
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-shipping');

					      	     fillShippingAddress();

					      }
					    };
					    sNavigator.pushPage("shipping.html", options);

                   } else if ( data.details.is_checkout=="payment_option" )  {
						 var options = {
					      animation: 'slide',
					      onTransitionEnd: function() {
					      	  displayMerchantLogo2(
					      	     getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-paymentoption'
					      	  );
					      	  var params="merchant_id="+ getStorage("merchant_id");
					      	  callAjax("getPaymentOptions",params);
					      }
					    };
					    sNavigator.pushPage("paymentOption.html", options);

                   } else {
                      menu.setMainPage('select_dining.html', {closeMenu: true});
                   }
			       break;

			    /*pts*/
			    case "getPTS":
			       $(".available_points").html( data.details.available_points );
			       $(".expenses_points").html( data.details.total_expenses_points );
			       $(".expired_points").html( data.details.points_expiring );
			    break;

			    case "detailsPTS":
			      $(".pts_title").html(data.details.title);
			      displayPTSdetails(data.details.data);
			    break;


			    case "applyRedeemPoints":

			      $(".pts_redeem_points").val( data.details.pts_points_raw );
			      $(".pts_redeem_amount").val( data.details.pts_amount_raw );
			      $(".pts_points_label").html( data.details.pts_points +" ("+ data.details.pts_amount+")" );
			      $(".pts_pts").hide();
			      $(".pts_pts_cancel").css({"display":"block"});


			      var new_total= data.details.new_total;
			      dump('compute new total for pts');

			      $(".total-amount").html( prettyPrice(new_total) );

			    break;

			    case "addToCart":
			    //onsenAlert(  getTrans("Item added to cart",'item_added_to_cart') );
			    //toastMsg( getTrans("Food added to cart",'item_added_to_cart') );
			    break;


			    case "getCustomFields":
			      var custom_fields='';
			      $.each( data.details, function( key, val ) {
			      	 custom_fields+= customFields(key,val);
			      });
                  createElement("custom-fields-wrap",custom_fields);

                  if ( data.msg=="yes"){
                  	  $(".iagree-wrap").show();
                  } else $(".iagree-wrap").hide();

			    break;

			    case "verifyAccount":
			      setStorage("client_token", data.details.token ); // register token
			     // toastMsg( data.msg );
			      menu.setMainPage('select_dining.html', {closeMenu: true});
			    break;

			    case "coordinatesToAddress":

			       var your_location = new plugin.google.maps.LatLng(data.details.lat,data.details.lng);

			       var marker_title='';
			       marker_title+=data.details.result.formatted_address;
             setStorage("map_address_result_address_full",data.details.result.formatted_address);
			       setStorage("map_address_result_address",data.details.result.address);
			       setStorage("map_address_result_city",data.details.result.city);
			       setStorage("map_address_result_state",data.details.result.state);
			       setStorage("map_address_result_zip",data.details.result.zip);
			       setStorage("map_address_result_country",data.details.result.country);
			       setStorage("map_address_result_formatted_address",data.details.result.formatted_address);

			       setStorage("google_lat",data.details.lat);
			       setStorage("google_lng",data.details.lng);

			        map.addMarker({
					  'position': your_location ,
					  'title': marker_title,
					  'snippet': getTrans( "Hold on for 2 seconds and drag" ,'press_marker'),
					  'draggable': true
					}, function(marker) {

					   marker.showInfoWindow();
					   if(drag_marker_bounce==1){
					      marker.setAnimation(plugin.google.maps.Animation.BOUNCE);
					   }

					   drag_marker=marker;
					   drag_marker_bounce=2;

					   marker.on(plugin.google.maps.event.MARKER_DRAG_END, onMarkerDragEnd);
					  /*  function() {
							marker.getPosition(function(latLng) {
								 temp_result=explode(",", latLng.toUrlValue() );
								 /*alert(temp_result[0]);
								 alert(temp_result[1]);*/
							/*	 drag_marker=marker;
								 callAjax("dragMarker","lat=" + temp_result[0] + "&lng="+ temp_result[1] );
							});
					   }); */

					   function onMarkerDragEnd() {
						// the first argument `latLng` is marker.getPosition() value.

						// if you want to manipulate on the marker,
						// you can get marker instance through `this`
						var marker = this;
						var temp_result=marker.getPosition() ;
						drag_marker = marker;
						callAjax("dragMarker","lat=" + temp_result['lat'] + "&lng="+ temp_result['lng']);
					  }

					}); /*marker*/
			    break;

			    case "dragMarker":

			       setStorage("map_address_result_address",data.details.result.address);
			       setStorage("map_address_result_city",data.details.result.city);
			       setStorage("map_address_result_state",data.details.result.state);
			       setStorage("map_address_result_zip",data.details.result.zip);
			       setStorage("map_address_result_country",data.details.result.country);
			       setStorage("map_address_result_formatted_address",data.details.result.formatted_address);

			       setStorage("google_lat",data.details.lat);
			       setStorage("google_lng",data.details.lng);

			       drag_marker.setTitle( data.details.result.formatted_address );
			       drag_marker.showInfoWindow();
			    break;

			    case "trackOrderHistory":

			       $(".track-status-wrap").html('');

			       $(".time-left").html( data.details.time_left );
			       $(".remaining").html( data.details.remaining );

			       if ( data.details.history.length>0){
			       	  var html='<ul>';
			       	  $.each( data.details.history , function( key, val ) {
			       	  	  dump(val);
			       	  	  html+='<li>';
				       	  	  html+='<div class="s-c-g"></div>';
				       	  	  html+='<p>'+val.date_time+'</p>';
				       	  	  html+='<h3>'+val.status+'</h3>';
			       	  	  html+='</li>';
			       	  });
			       	  html+='</ul>';
			       	  $(".track-status-wrap").append( html );
			       }

			       if ( data.details.assign_driver==1){
			       	   $(".track_driver").show();

			       	   $(".driver_lat").val( data.details.coordinates.driver_lat );
			       	   $(".driver_lng").val( data.details.coordinates.driver_lng );

			       	   $(".task_lat").val( data.details.coordinates.task_lat );
			       	   $(".task_lng").val( data.details.coordinates.task_lng );

			       	   $(".driver_name").val( data.details.driver_info.driver_name );
			       	   $(".driver_email").val( data.details.driver_info.driver_email );
			       	   $(".driver_phone").val( data.details.driver_info.driver_phone );
			       	   $(".transport_type").val( data.details.driver_info.transport_type );
			       	   $(".licence_plate").val( data.details.driver_info.licence_plate );
			       	   $(".delivery_address").val( data.details.delivery_address );

			       	   $(".driver_icon").val( data.details.driver_icon );
			       	   $(".address_icon").val( data.details.address_icon );
			       	   $(".driver_avatar").val( data.details.driver_avatar );

			       }  else {
			       	   $(".track_driver").hide();

			       	   $(".driver_lat").val('');
			       	   $(".driver_lng").val('');

			       	   $(".task_lat").val('');
			       	   $(".task_lng").val('');

			       	   $(".driver_name").val( '' );
			       	   $(".driver_email").val( '' );
			       	   $(".driver_phone").val( '' );
			       	   $(".transport_type").val( '' );
			       	   $(".licence_plate").val( '' );
			       	   $(".delivery_address").val( '' );
			       	   $(".driver_avatar").val( '' );
			       }

			       stopTrackInterval();
		           track_order_interval = setInterval(function(){runTrackOrder()}, 7000);

			    break;


			    case "saveContactNumber":

                   var options = {
				      animation: 'slide',
				      onTransitionEnd: function() {
				      	  displayMerchantLogo2(
				      	     getStorage("merchant_logo") ,
				      	     getStorage("order_total") ,
				      	     'page-paymentoption'
				      	  );
				      	  var params="merchant_id="+ getStorage("merchant_id");
				      	  params+="&client_token="+ getStorage("client_token");
				      	  callAjax("getPaymentOptions",params);
				      }
				    };
				    sNavigator.pushPage("paymentOption.html", options);

			    break;

			    case "trackOrderMap":
			       reInitTrackMap(data.details);
			    break;

			    case "getMerchantCClist":
			       fillCCList(data.details);
			    break;

			    case "saveCreditCard":
			    case "deleteCreditCard":
			        sNavigator.popPage({cancelIfRunning: true});
			        var params="merchant_id=" +  getStorage("merchant_id") ;
			      	params+="&client_token="+getStorage("client_token");
				    callAjax("getMerchantCClist",params);
			    break;

			    case "loadCC":
			       $(".card_name").val( data.details.card_name);
			       $(".cc_number").val( data.details.credit_card_number);
			       $(".cvv").val( data.details.cvv);
			       $(".billing_address").val( data.details.billing_address);

			       $(".expiration_month").val( data.details.expiration_month);
			       $(".expiration_yr").val( data.details.expiration_yr);
			       $(".expiration_month_label").html( data.details.expiration_month );
			       $(".expiration_year").html( data.details.expiration_yr );

			       $(".cc_id").val( data.details.cc_id );

			       $(".delete-cc").show();

			    break;
          case "Clearcart":
					  sNavigator.popPage({cancelIfRunning: true});
					  break;
				default:
				//onsenAlert("Sorry but something went wrong during processing your request");
				  onsenAlert(data.msg);
				  break;
			}

			/* end ok conditions*/
		} else {
			/*failed condition*/

			dump('failed condition');
			switch(action)
			{
        case "saveProfile":
        onsenAlert(data.msg);
        break;
        case "checkout":
        //onsenAlert(data.msg);
        onsenAlert("Sorry, we are closed please check with merchant opening and closing hours.");
        break;
        case "MobileLoadMore":
        break;
				case "search":
				  //$(".result-msg").text("No Restaurants found");
				  $(".result-msg").text(data.msg);
				  createElement('restaurant-results','');
				  break;
        case "getBookingHistory":
        onsenAlert(data.msg);
        break;
				case "getItemByCategory":
				  onsenAlert(data.msg);
				  displayMerchantInfo(data.details);
				  //sNavigator.popPage({cancelIfRunning: true});	back button
				  break;

				case "loadCart":
          onsenAlert(data.msg);
          sNavigator.popPage({cancelIfRunning: true}); //back button
				  displayMerchantLogo(data.details,'page-cart');

				  $("#page-cart .wrapper").hide();
				  $("#page-cart .frm-cart").hide();
				  $(".checkout-footer").hide();
				  showCartNosOrder();
				  break;

					case "Clearcart":
					  sNavigator.popPage({cancelIfRunning: true});
					  break;

				case "getPaymentOptions":
				  if (data.details == 3){
				  	  onsenAlert("Address is not reachable");
				  	  sNavigator.popPage({cancelIfRunning: true});
				       }
           else{
					  $(".frm-paymentoption").hide();
					  onsenAlert(data.msg);
            sNavigator.popPage({cancelIfRunning: true});
				      }
				  break;

				case "browseRestaurant":
			      createElement('browse-results','');
			      $(".result-msg").text(data.msg);
			      break;

			    case "getProfile":
			      dump('show login form');
						console.log(getStorage("client_token"));
						if(data.msg == "not login")
						{
							onsenAlert("Sorry your session has Expired");
							logout("prof");
						}
						//onsenAlert("Sorry your session has been expired");
			      menu.setMainPage('prelogin.html', {closeMenu: true});
			      break;

			    case "getAddressBook":
			      //onsenAlert(data.msg);
			      createElement('address-book-list', '');
			      if (data.code==3){
			      	 menu.setMainPage('prelogin.html', {closeMenu: true});
			      }
			      break;

			    case "getOrderHistory":
			       if (data.code==3){
                onsenAlert(data.msg);
                removeStorage("client_name");
                removeStorage("client_token");
			           menu.setMainPage('prelogin.html', {closeMenu: true});
			       } else {
			       	  // toastMsg(data.msg);
			       }
			       break;

			    case "registerMobile":
			    case "getLanguageSettings":
			      /*silent */
			      break;


			    case "getSettings":
			       var device_id=getStorage("device_id");
			       $(".device_id_val").html( device_id );
			    break;


			    /*silent*/
			    case "addToCart":
			    case "getCustomFields":
			    break;

			    case "merchantReviews":
            onsenAlert("No reviews yet.");
          break;
			    case "saveContactNumber":
			    case "coordinatesToAddress":
			    case "trackOrderMap":
			       onsenAlert(data.msg);
			    break;

			    case "getMerchantCClist":
			       //toastMsg(data.msg);
			       $("#cc-list").html('');
			    break;

			    case "trackOrderHistory":
            onsenAlert("Yet not merchant had approved your order.");
            sNavigator.popPage({cancelIfRunning: true}); //back button
          break;
			    case "loadCC":
			    sNavigator.popPage({cancelIfRunning: true}); //back button
			    break;

				default:
				  onsenAlert(data.msg);
				  break;
			}
		}

	},
	error: function (request,error) {
		hideAllModal();
		if ( action=="getLanguageSettings" || action=="registerMobile"){

		} else {
			//onsenAlert( getTrans("Network error has occurred please try again!",'network_error') );
			//toastMsg( getTrans("Network error. Please try again!",'network_error') );
		}
	}
   });
}

function setHome()
{
	dump("setHome");
	start="0";
	limit="5";
	came="0";

	var options = {
	  	  closeMenu:true,
	      animation: 'slide',
	      callback:setHomeCallback
	   };
	 menu.setMainPage('select_dining.html',options);
}

function showEdit()
{
  $("#default_address_div").hide();
  $("#edit_div").show();
}

function backclear()
{
	menustart="0";
}
function setSubHome()
{
	//Check if the currency symbol and all other data like decimal, left alignment of Pound symbol are set or not.
	// Raj Kovi 18.10.17 to solve the null problem on the items display page
	var currency_symbol = getStorage("currency_set");
	if(currency_symbol == null) {
		getLanguageSettings();
	}

	dump("setHome");
	var options = {
	  	  closeMenu:true,
	      animation: 'slide',
	      callback:setHomeCallback
	   };
	var params="&client_token="+ getStorage("client_token");
	 menu.setMainPage('home.html',options);
}



function setHomeCallback()
{
	refreshConnection();
}

function displayBookTableResults(data , target_id , display_type)
{

	var htm='';
	//var merchant_id = getStorage("merchant_id");
	//alert(Object.keys(data).length);
    $.each( data, function( key, val ) {
    	 //dump(val);
    	 var rest_logo = '';
    	 rest_logo = "'"+val.logo+"'";
		 	 var rest_name = "";
       rest_name = "'"+val.restaurant_name.replace(/'/g, '')+"'";
       console.log(rest_name);
    	 //rest_name = "'"+val.restaurant_name+"'";

    	 htm+='<ons-list-item modifier="tappable" class="list-item-container product list list__item ons-list-item-inner list__item--tappable" >';
    	 htm+='<ons-row class="row product-list ons-row-inner">';
    	     htm+='<ons-col class="col-image border col ons-col-inner">';
    	     if(display_type==2)
    	           	   {
    	       //   htm+='<div class="logo-wrap2" onclick="table_booking_optn('+val.merchant_id+','+rest_logo+','+rest_name+')"; >';

    	       htm+='<div class="logo-wrap2" onclick="loadRestaurantCategory('+val.merchant_id+');" >';       
    	      }else
    	      {
    	      	  htm+='<div class="logo-wrap2" onclick="table_booking_optn('+val.merchant_id+');" >';       
    	      }
			htm+='<div class="img_loaded" >';
				htm+='<img src="'+val.logo+'" />';
			htm+='</div>';

			htm+='</div>';


    	     htm+='</ons-col>';

    	     htm+='<ons-col class="col-description product-desc border col ons-col-inner">';
    	           htm+='<div>';

			if(display_type==2)	{
				htm+='<p class="restauran-title concat-text" onclick="table_booking_optn('+val.merchant_id+','+rest_logo+','+rest_name+')" >'+val.restaurant_name+'</p>';
			}
			else {
				htm+='<p class="restauran-title concat-text" onclick="table_booking_optn('+val.merchant_id+');" >'+val.restaurant_name+'</p>';
			}

    	    htm+='<p class="concat-textx type">'+val.cuisine+'</p>';
			var btn_txt = 'Book a Table';
			htm+='<div class="booking-btn" onclick="table_booking_optn('+val.merchant_id+','+rest_logo+','+rest_name+')" > '+btn_txt+' </div>';
			htm += '<div class="merchant-info-btn" onclick="loadMerchantInfo(' + val.merchant_id + ')" > Merchant Info </div>';

    	htm+='</div>';
    	htm+='</ons-col>';
    	htm+='</ons-row>';
    	htm+='</ons-list-item>';


    });

	createElement(target_id,htm);
	imageLoaded('.img_loaded');
}


var came=0;
function displayRestaurantResults(data , target_id , display_type,counttotal,loadmore,code,browse)
{
	var htm='';
	//alert(Object.keys(data).length);
    $.each( data, function( key, val ) {
    	 //dump(val);
    	 var rest_logo = '';
    	 rest_logo = "'"+val.logo+"'";
		 	 var rest_name = "";
    	 rest_name = "'"+val.restaurant_name+"'";

     

    	 htm+='<ons-list-item modifier="tappable" class="list-item-container product list list__item ons-list-item-inner list__item--tappable" >';
    	 htm+='<ons-row class="row product-list ons-row-inner">';
    	     htm+='<ons-col class="col-image border col ons-col-inner">';
    	     if(display_type==2)
    	           	   {
    	          htm+='<div class="logo-wrap2" onclick="loadRestaurantCategory('+val.merchant_id+')" >';
    	      }else
    	      {
    	      	  htm+='<div class="logo-wrap2" onclick="loadRestaurantCategory('+val.merchant_id+');" >';
    	      }
			htm+='<div class="img_loaded" >';
				htm+='<img src="'+val.logo+'" />';
			htm+='</div>';

			htm+='</div>';


    	     htm+='</ons-col>';

    	     htm+='<ons-col class="col-description product-desc border col ons-col-inner">';
    	           htm+='<div>';

    	           	   if(display_type==2)
    	           	   {
    	           	   		htm+='<p class="restauran-title concat-text" onclick="loadRestaurantCategory('+val.merchant_id+','+rest_logo+','+rest_name+')" >'+val.restaurant_name+'</p>';
    	           	   }
    	           	   else
    	           	   {
    	       				htm+='<p class="restauran-title concat-text" onclick="loadRestaurantCategory('+val.merchant_id+');" >'+val.restaurant_name+'</p>';
    	           	   }

	    	           htm+='<p class="concat-textx type">'+val.cuisine+'</p>';

					   		htm+='<span class="notification '+val.tag_raw+' ">'+val.is_open+'</span><br>';
					  if($.trim(val.is_open)=="pre-order")
					   {
					   		setStorage("merchant_is_open",val.is_open);
					   }

	    	           htm+='<div class="rating-stars" data-score="'+val.ratings.ratings+'"></div><br>';

	    	               	          dump(val.service);

					if (empty(val.services)) {

					}


    	          else if(!empty(val.service)){
									if(val.table_booking_option=='')
									{
									}
									else{
										htm+='<ul>';
					    	          	  $.each( val.services, function( key_service, val_services ) {
					    	           	   	  htm+='<li>'+val_services+' <i class="green-color ion-android-checkmark-circle"></i></li>';
					    	           	   });
										htm+='</ul>';
    	          }
							}
							if(val.table_booking_option=='')
							{
							}
							else{
    	          htm+='<p class="cod">'+val.payment_options.cod+'</p>';
							}


	    	           // if(!empty(val.distance)){
	    	           // 	   htm+='<p class="time-tag">'+val.distance+'</p>';
	    	           // }
                   //
	    	           if(val.service!=3){
	    	           	   if(!empty(val.delivery_estimation)){

	    	           	      htm+='<p>'+val.delivery_estimation+'Mins</p>';
	    	           	   }
	    	           	   // if(!empty(val.delivery_distance)){
	    	           	   //    htm+='<p>'+val.delivery_distance+'</p>';
	    	           	   // }
	    	           }


	    	           if ( val.offers.length>0){
	    	           	   $.each( val.offers, function( key_offer, val_offer ) {

	    	           	   });
	    	           }
									 //rest_name="'"+val.restaurant_name+"'";
									// console.log(rest_name);
									// var rest_names= rest_name.replace("'", '');
                      if(val.is_open == "Pre-Order" || val.is_open == "pre-order")
                      {
                        htm+='<div class="booking-btn" data="book" onclick="loadRestaurantCategory('+val.merchant_id+')" > Pre Order </div>';
                      }
                      else if(val.is_open == "Closed" || val.is_open == "closed")
                      {
                        htm+='<div class="booking-btn" data="book" onclick="loadRestaurantCategory('+val.merchant_id+')" > View Menu </div>';
                      }
                      else if(val.is_open == "Open" || val.is_open == "open")
                      {
                        htm+='<div class="booking-btn" data="book" onclick="loadRestaurantCategory('+val.merchant_id+')" >Order Now</div>';
                      }

						htm += '<div class="merchant-info-btn" onclick="loadMerchantInfo(' + val.merchant_id + ')" > Merchant Info </div>';

	    	        //    		if(display_type==3||display_type==1||display_type==2)
	    	        //    		{
	    	    		// 				htm+='<div class="booking-btn" data="book" onclick="loadRestaurantCategory('+val.merchant_id+')" > View Menu </div>';
	    	        //    		}
	    	        //    		else
	    	        //    		{
                //
		    	      //       	if(val.table_booking_option=='yes')
		    	      //       	{
		    	      //       		htm+='<div class="booking-btn" data="menu" onclick="loadRestaurantCategory('+val.merchant_id+')" > View Menu </div>';
						   	// 	}
						   	// 		else
		    	      //       	{
								// 				var btn_txt = 'Book a Table';
								// 				if($("#search-text").text() == "Take Away")  btn_txt = 'Take Away';
								// 				htm+='<div class="booking-btn" onclick="table_booking_optn('+val.merchant_id+','+rest_logo+','+rest_name+')" > '+btn_txt+' </div>';
						   	// 	}
					    	// }
    	           htm+='</div>';
    	     htm+='</ons-col>';
    	 htm+='</ons-row>';
    	 htm+='</ons-list-item>';


    });

		//if it is take away-Mubarak
		if(loadmore){

		if(start == 0)
		{
		createElement(target_id,htm);
		}
		else
		{
		 $("#"+target_id).append(htm);
		}

    initRating();

    imageLoaded('.img_loaded');
		//The limit gets incremented here.
		start=parseFloat(start)+5;
			// for getting the length
		var tots= 	Object.keys(data).length;
		came=parseInt(came)+parseInt(tots);
		if(browse)
		{
			if(came < counttotal){
			callAjax("browseRestaurant","&start="+start+"&limit="+limit+"&type=1&address="+ getStorage("search_address")+"&cuisine="+getStorage("cuisine")+"&parish="+getStorage("parish"));
			}
			else if(came == counttotal)
			{

			}
		}
		else {
			if(came < counttotal){
			callAjax("search_take_away","&start="+start+"&limit="+limit+"&type=1&address="+ getStorage("search_address")+"&cuisine="+getStorage("cuisine")+"&parish="+getStorage("parish"));
			}
			else if(came == counttotal)
			{

			}
		}



	}
	//this is for booktable
	else{
		createElement(target_id,htm);
		initRating();
		imageLoaded('.img_loaded');
	}
}

function initRating()
{
	$('.rating-stars').raty({
		readOnly: true,
		score: function() {
             return $(this).attr('data-score');
       },
		path: 'lib/raty/images'
    });
    translatePage();
}

function loadRestaurantCategory(mtid)
{
	menustart="0";
  var d = new Date();
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    var n = weekday[d.getDay()];
	var current_day = n.substring(0, 3);
	var current_day = current_day.toLowerCase();
	setStorage("c_day",current_day);
	$('#mob_current_timing').val(current_day);
  cart = [] ; /*clear cart variable*/
  removeStorage("tips_percentage");
  removeStorage("cc_id");

  dump('clear cart');
  var options = {
      animation: 'slide',
      onTransitionEnd: function() {      	   
      	  callAjax("MobileMenuNew","start="+menustart+"&end="+menulimit+"&merchant_id="+mtid + "&device_id=" + getStorage("device_id")+"&current_day="+current_day  );
      }
   };
   setStorage("merchant_id",mtid);

   	sNavigator.pushPage("menucategory.html", options);
}

function cuisineResults(data)
{
	var htm='';
	htm+='<ons-list>';
	htm+='<ons-list-header class="list-header trn" data-trn-key="services">Services</ons-list-header>';

	htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="1" >';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="delivery_n_pickup" >Delivery & Pickup</span>';
	  htm+='</label>';
	htm+='</ons-list-item>';

	htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="2">';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="delivery_only">Delivery Only</span>';
	  htm+='</label> ';
	htm+='</ons-list-item>';

	htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="3">';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="pickup_only">Pickup Only</span>';
	  htm+='</label>  	   ';
	htm+='</ons-list-item>	';

	htm+='<ons-list-header class="list-header trn" data-trn-key="cuisine">Cuisine</ons-list-header>';

	$.each( data, function( key, val ) {
		htm+='<ons-list-item modifier="tappable">';
		 htm+='<label class="checkbox checkbox--list-item">';
			htm+='<input type="checkbox" name="cuisine_type" class="cuisine_type" value="'+key+'">';
			htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+val;
		  htm+='</label>';
		htm+='</ons-list-item>';
	});

	htm+='</ons-list>';
	createElement('filter-option-lists',htm);

	$(".restaurant_name").attr("placeholder",  getTrans("Restaurant name",'enter_resto_name') );

	translatePage();
}


function cuisineReslts(data)
{
	var htm='';
	htm+='<ons-list>';
	htm+='<ons-list-header class="list-header trn" data-trn-key="services">Services</ons-list-header>';

	htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="1" >';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="delivery_n_pickup" >Delivery & Pickup</span>';
	  htm+='</label>';
	htm+='</ons-list-item>';

	htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="2">';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="delivery_only">Delivery Only</span>';
	  htm+='</label> ';
	htm+='</ons-list-item>';

	htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="3">';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="pickup_only">Pickup Only</span>';
	  htm+='</label>  	   ';
	htm+='</ons-list-item>	';

	htm+='<ons-list-header class="list-header trn" data-trn-key="cuisine">Cuisine</ons-list-header>';

	$.each( data, function( key, val ) {
		htm+='<ons-list-item modifier="tappable">';
		 htm+='<label class="checkbox checkbox--list-item">';
			htm+='<input type="checkbox" name="cuisine_type" class="cuisine_type" value="'+key+'">';
			htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+val;
		  htm+='</label>';
		htm+='</ons-list-item>';
	});

	htm+='</ons-list>';

	createElement('filter-options-lists',htm);

	$(".restaurant_name").attr("placeholder",  getTrans("Restaurant name",'enter_resto_name') );

	translatePage();
}

function cuisineResult(data)
{
	var htm='';
	htm+='<ons-list>';
/*
	htm+='<ons-list-header class="list-header trn" data-trn-key="services">Services</ons-list-header>';

	htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="1" >';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="delivery_n_pickup" >Delivery & Pickup</span>';
	  htm+='</label>';
	htm+='</ons-list-item>';

	htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="2">';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="delivery_only">Delivery Only</span>';
	  htm+='</label> ';
	htm+='</ons-list-item>';

	htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="3">';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="pickup_only">Pickup Only</span>';
	  htm+='</label>  	   ';
	htm+='</ons-list-item>	';     */

	htm+='<ons-list-header class="list-header trn" data-trn-key="cuisine">Cuisine</ons-list-header>';

	$.each( data, function( key, val ) {
		htm+='<ons-list-item modifier="tappable">';
		 htm+='<label class="checkbox checkbox--list-item">';
			htm+='<input type="checkbox" name="cuisine_type" class="cuisine_type" value="'+key+'">';
			htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+val;
		  htm+='</label>';
		htm+='</ons-list-item>';
	});

	htm+='</ons-list>';
	createElement('filter-options-list',htm);

	$(".restaurant_name").attr("placeholder",  getTrans("Restaurant name",'enter_resto_name') );

	translatePage();
}

ons.bootstrap();


function specialMenu()
{
	alert("Hi");
}

var menucame=0;
var menutotal;

function menuCategoryResult(data)
{
 
if (data.service!=4)
{
    menutotal = data.category_item_count;
	menutcame = Object.keys(data).length;	 
    if (menustart==0)
    {		
        $('#merchant_open_close_timing').val(data.selected_date);
        $("#menucategory-page .restauran-title").text(data.restaurant_name);
        $("#menucategory-page .rating-stars").attr("data-score", data.ratings.ratings);
        initRating();
		$("#menucategory-page .logo-wrap").html('<img src="' + data.logo + '" /> <button id="tbl-booking" class="white-btn" onclick="loadMerchantInfo('+data.merchant_id+')"> Merchant Info </button> ');
        var rest_name = "";
        rest_name = "'" + data.restaurant_name.replace(/'/g, '') + "'";
        if (data.enabled_table_booking == 2)
        {
            $("#menucategory-page .tbl-book").html('<button id="tbl-booking" class="white-btn" onclick="table_booking_optn(' + data.merchant_id + ',\'' + data.logo + '\',' + rest_name + ')" > Book a Table </button>');
            setStorage('merc_logo', data.logo);
            setStorage('res_name', data.restaurant_name);
        }
        setStorage("merc_stats", data.open);
        if (data.open)
        {
            $("#merchant_open").val(2);
        }
        else $("#merchant_open").val(1);

        if (data.merchant_close_store)
        {
            $("#close_store").val(2);
        }
        else $("#close_store").val(1);
        if (!data.menu_category)
        {
            onsenAlert(getTrans("Restaurant has not uploaded their menu", 'Restaurant has no menu'));
            return;
        }

        var htm = '';
        // htm+='<ons-list class="cate-list"> <ons-carousel swipeable style="margin-top: 5px; height: 70px;" overscrollable auto-scroll item-width="auto"> ';
        var all_cat_id = [];
        var count = 0;
        /*	$.each( data.menu_category, function( key, val ) {
            a.push(count);
            count += parseInt(1);
        });
        var s = a.join(', ');
        alert(s.toSource); */
		htm += '<ons-list><div class="swiper-container"><div class="swiper-wrapper">';		 
        var itemcount = [];
        var itemcounts;
        $.each(data.menu_category, function(key, val)
        {
            //console.log(val.cat_id);
            if (jQuery.inArray(val.total_count, itemcount) !== -1)
            {}
            else
            {

                itemcount.push(val.total_count); // Duplicates are being removed, have to check this
                itemcounts = val.total_count;
                //itemcount[val.cat_id]=val.total_count;
                //itemcount=array(val.cat_id => val.total_count );
            }

            //console.log("Category ID "+val.cat_id+" Name:"+val.category_name+" Items:"+itemcounts);
            all_cat_id.push(val.cat_id);
            var active_class = '';

            //  htm+='<ons-list-item modifier="tappable" class="row" onclick="loadmenu('+val.cat_id+','+val.merchant_id+');">'+val.category_name+'</ons-list-item>';
            //   htm+='<ons-list-item modifier="tappable" class="row" onclick="scroll_list('+val.cat_id+');">'+val.category_name+'</ons-list-item>';
            // alert(val.category_name);
            // htm += '<ons-carousel-item ng-repeat="i in ['+count+']"><a href="javascript:;" class="menu-type" onclick="scroll_list('+val.cat_id+');" >'+val.category_name+'</a></ons-carousel-item>';
            if (count == 0)
            {
                active_class = 'active';
                var id_menu = parseInt(val.cat_id);
                oncliks = "show_hide(" + id_menu + ",this)";
            }
            else
            {
                var id_menu = parseInt(val.cat_id);
                oncliks = "scroll_list( '" + id_menu + "' ,this)";
            }
            htm += '<div class="swiper-slide ' + active_class + '"  ><a href="javascript:;" data-scroll="scroll_div_' + val.cat_id + ' " id="scroll_list_' + val.cat_id + '" onclick="' + oncliks + '" > ' + val.category_name + '</a></div>';

            count = parseInt(count) + 1;
            //console.log("this is slider"+count);
        });
        var maincatcnt = count;
        //htm+='</ons-carousel></ons-list>';
        htm += '</div></div><div class="swiper-pagination"></div></ons-list>';
        htm += '<div id="swipe_img" style="display:none"><img style="position: fixed;margin: auto;top: 0;right: 0;bottom: 0;left: 0;width: 250px;height: 100px;z-index: 100;" src="css/images/gif.gif"></div>';

        //  htm+='<ons-carousel-cover>    <div class="cover-label">Swipe left or right</div>    </ons-carousel-cover>  ';
        /*
        		alert(htm);
        		return; */		 
        if (data.service==4)
        {			 
            $('#category-list').css('display', 'none');
            $('.image_gallery_head').css('display', 'block');
            $('#menu-list').css('display', 'none');
        }
        else
        {
			$('#menucategory-page').css('display','block'); 
            $('.image_gallery_head').css('display', 'none');
            $('#category-list').css('display', 'block');
            $('#menu-list').css('display', 'block');
			createElement('category-list', htm);
			
            var swiper = new Swiper('.swiper-container',
            {
                pagination: '.swiper-pagination',
                slidesPerView: 'auto',
                paginationClickable: true,
                spaceBetween: 15
            });
        }
    }
    var html = '';
    var all_cat = [];
    var item_cnt = [];
    var count = 0;
    var display_count = 1;
    var items = 0;
    var newcat = 0;
    var n = 0;

    if (menustart == 0)
    {

        html += '<ons-list class="restaurant-lists ng-scope list ons-list-inner">';

      	//  alert(data.item.toSource());
        $.each(data.item, function(key, val)
        {
            //console.log(Object.keys(data.item).length);
            var display_style = 'style = "display:none;"';
            if ($.inArray(val.category_id, all_cat) != -1)
            {}
            else
            {
                all_cat.push(val.category_id);
                item_cnt.push(val.total_count);
                if (count > 0)
                {
                    html += "</div>";
                }


                if (display_count == 1)
                {
                    display_style = 'style = "display:block;"';
                }
                //html += '<div id = "scroll_div_'+val.category_id+'"  '+display_style+'   data-anchor="scroll_div_'+val.category_id+'" class="scrolling-div" >  <div class="category-heading" >'+ val.category_name +'</div>';

                html += '<div id = "scroll_div_' + val.category_id + '"  ' + display_style + '   data-anchor="scroll_div_' + val.category_id + '" class="scrolling-div" > ';
                html += '<input type="hidden" value="0" id="hidden' + val.category_id + '"/>';
                count = parseInt(count) + 1;
                display_count = parseInt(display_count) + 1;
            }

            if (data.disabled_ordering == 2)
            {
                html += '<ons-list-item modifier="tappable" class="list-item-container" onclick="itemNotAvailable(2)" >';
            }
            else
            {
                if (val.not_available == 2)
                {
                    html += '<ons-list-item modifier="tappable" class="list-item-container" onclick="itemNotAvailable(1)" >';
                }
                else
                {
                    var single_add_item = getStorage("single_add_item");
                    //  dump("=>" + single_add_item);
                    if (val.single_item == 2 && single_add_item == 2)
                    {
                        item_auto_price = "0|";
                        item_auto_discount = "0";
                        if (val.prices.length > 0)
                        {
                            $.each(val.prices, function(key_price, price)
                            {
                                if (!empty(price.price_discount_pretty))
                                {
                                    item_auto_price = "'" + price.price + "|'";
                                    item_auto_discount = parseInt(price.price) - parseInt(price.price_discount)
                                }
                                else
                                {
                                    item_auto_price = "'" + price.price + "|'";
                                }
                            });
                        }
                        html += '<ons-list-item modifier="tappable" class="list-item-container list__item ons-list-item-inner list__item--tappable" onclick="autoAddToCart(' + val.item_id + ',' + item_auto_price + ',' + item_auto_discount + ');"  >';
                    }
                    else
                    {
                        html += '<ons-list-item modifier="tappable" class="list-item-container list__item ons-list-item-inner list__item--tappable" onclick="loadItemDetails(' + val.item_id + ',' + data.merchant_info.merchant_id + ',' + val.category_id + ');"  >';
                    }
                }
            }

            html += '<ons-row class="row ons-row-inner">';
            html += '<ons-col class="col-image food-img col ons-col-inner" width="35%">';
            html += '<div class="logo-wrap2" >';
            html += '<div class="img_loaded" >';
            html += '<img src="' + val.photo + '" />';
            html += '</div>';
            html += '</div>';
            html += '</ons-col>';
            html += '<ons-col class="col-description food-desc col ons-col-inner" width="65%">';
            html += '<p class="restauran-titles concat-text">' + val.item_name + '</p>';
            html += '<p class="concat-text">' + val.item_description + '</p>';


            if (val.prices.length > 0)
            {
                $.each(val.prices, function(key_price, price)
                {
                    //console.log("Inside");
                    var price_size = '';
                    if (price.size != 'standard')
                    {
                        price_size = price.size;
                    }
                    if (!empty(price.price_discount_pretty))
                    {
                        html += '<p class="p-small">' + price_size + ' <price class="discount">' + price.price_pretty + '</price>';
                        html += '<price>' + price.price_discount_pretty + '</price>';
                        html += '</p>';
                    }
                    else
                    {
                        html += '<p class="p-small">' + price_size + ' <price>' + price.price_pretty + '</price></p>';
                    }
                });
            }

            html += '<img height="20" src="' + val.category_img_url + '">';

            if (val.not_available == 2)
            {
                html += '<p>item not available</p>';
            }

            html += '</ons-col>';
            html += '</ons-row>';
            html += '</ons-list-item>';


            items++;
        });
        //console.log(item_cnt);
        html += '</ons-list>';
        createElement('menu-list', html);
        Array.prototype.associate = function(keys)
        {
            var result = {};

            this.forEach(function(el, i)
            {
                result[keys[i]] = el;
            });
            return result;
        };
        var itms = item_cnt.associate(all_cat);
        $.each(itms, function(key, val)
        {

            if (val > 10)
            {
                $("#scroll_div_" + key).append('<button id="if' + key + '" class="button green-btn button--large trn" onclick="loadmore(' + key + ',' + menulimit + ');" data-trn-key="book_now">Load More</button>');
            }
        });
    }
    else
    {
        var cid;
        var categoryid = [];
        var buts;
        $.each(data, function(key, val)
        {
            var html = '';
            cid = val.category_id;
            if (jQuery.inArray(val.category_id, categoryid) !== -1)
            {

            }
            else
            {
                categoryid.push(val.category_id);
            }
            var display_style = 'style = "display:none;"';
            if ($.inArray(val.category_id, all_cat) != -1)
            {}
            else
            {
                all_cat.push(val.category_id);
                item_cnt.push(val.total_count);
                if (count == 0)
                {
                    html += "</div>";
                }
                if (display_count == 1)
                {
                    display_style = 'style = "display:block;"';
                }

                count = parseInt(count) + 1;
                display_count = parseInt(display_count) + 1;
            }

            if (data.disabled_ordering == 2)
            {
                html += '<ons-list-item modifier="tappable" class="list-item-container" onclick="itemNotAvailable(2)" >';
            }
            else
            {
                if (val.not_available == 2)
                {
                    html += '<ons-list-item modifier="tappable" class="list-item-container" onclick="itemNotAvailable(1)" >';
                }
                else
                {
                    var single_add_item = getStorage("single_add_item");
                    // dump("=>" + single_add_item);
                    if (val.single_item == 2 && single_add_item == 2)
                    {
                        item_auto_price = "0|";
                        item_auto_discount = "0";
                        if (val.prices.length > 0)
                        {
                            $.each(val.prices, function(key_price, price)
                            {
                                if (!empty(price.price_discount_pretty))
                                {
                                    item_auto_price = "'" + price.price + "|'";
                                    item_auto_discount = parseInt(price.price) - parseInt(price.price_discount)
                                }
                                else
                                {
                                    item_auto_price = "'" + price.price + "|'";
                                }
                            });
                        }
                        html += '<ons-list-item modifier="tappable" class="list-item-container list__item ons-list-item-inner list__item--tappable" onclick="autoAddToCart(' + val.item_id + ',' + item_auto_price + ',' + item_auto_discount + ');"  data="else">';
                    }
                    else
                    {
                        html += '<ons-list-item modifier="tappable" class="list-item-container list__item ons-list-item-inner list__item--tappable" onclick="loadItemDetails(' + val.item_id + ',' + data.merchant_id + ',' + val.category_id + ');"  >';
                    }
                }
            }

            html += '<ons-row class="row ons-row-inner">';
            html += '<ons-col class="col-image food-img col ons-col-inner" width="35%">';
            html += '<div class="logo-wrap2" >';
            html += '<div class="img_loaded" >';
            html += '<img src="' + val.photo + '" />';
            html += '</div>';
            html += '</div>';
            html += '</ons-col>';
            html += '<ons-col class="col-description food-desc col ons-col-inner" width="65%">';
            html += '<p class="restauran-titles concat-text">' + val.item_name + '</p>';
            html += '<p class="concat-text">' + val.item_description + '</p>';

            if (val.prices.length > 0)
            {
                $.each(val.prices, function(key_price, price)
                {
                    var price_size = '';
                    if (price.size != 'standard')
                    {
                        price_size = price.size;
                    }
                    if (!empty(price.price_discount_pretty))
                    {
                        html += '<p class="p-small">' + price_size + ' <price class="discount">' + price.price_pretty + '</price>';
                        html += '<price>' + price.price_discount_pretty + '</price>';
                        html += '</p>';
                    }
                    else
                    {
                        html += '<p class="p-small">' + price_size + ' <price>' + price.price_pretty + '</price></p>';
                    }
                });
            }

            html += '<img height="20" src="' + val.category_img_url + '">';

            if (val.not_available == 2)
            {
                html += '<p>item not available</p>';
            }

            html += '</ons-col>';
            html += '</ons-row>';
            html += '</ons-list-item>';
            $("#scroll_div_" + cid).append(html);

        });
        console.log(item_cnt);

        Array.prototype.associate = function(keys)
        {
            var result = {};

            this.forEach(function(el, i)
            {
                result[keys[i]] = el;
            });
            return result;
        };
        var itms = item_cnt.associate(all_cat); // load more working fine dont alter anything. This is ddone by Khan
        $.each(itms, function(key, val)
        {
            console.log(val);
            if (menulimit == 10)
            {
                if (val > 10)
                {
                    $("#scroll_div_" + key).append('<button id="if' + key + '" class="button green-btn button--large trn" onclick="loadmore(' + key + ',' + menulimit + ');" data-trn-key="book_now">Load More</button>');
                }
            }
            else
            {
                if (val > 2)
                {
                    $("#scroll_div_" + key).append('<button id="if' + key + '" class="button green-btn button--large trn" onclick="loadmore(' + key + ',' + menulimit + ');" data-trn-key="book_now">Load More</button>');
                }
            }
        });
    }
    imageLoaded('.img_loaded');
    setTimeout(function()
    {
        $("#swipe_img").hide();
    }, 2000);
}
else
{

	$('.inHouse_tabbar').css('display','block');

    var image_url = ajax_url.replace("mobileapp/api", "") + 'upload/';

    $('#menu-list').css('display', 'none');
    var image_gallery = (JSON.parse(data.gallery));
    var count = 1;
    var image_html = '';
    $.each(image_gallery, function(index, value)
    {
        if (count <= 3)
        {
            image_html += '<a href="' + image_url + value + '" data-toggle="lightbox" data-gallery="hidden-images" class="col-4"><img src="' + image_url + value + '" class="img-fluid"></a>';
        }
        else
        {
            image_html += '<div data-toggle="lightbox" data-gallery="hidden-images" data-remote="' + image_url + value + '" data-title=""></div>';
        }
        count = parseInt(count) + 1;
    });

    $('.img_gall').html(image_html);

    


    var special_gallery = (JSON.parse(data.special_gallery));
    var special_gallery_count = 1;
    var special_gallery_image_html = '';
    $.each(special_gallery, function(index, value)
    {
        if (special_gallery_count <= 3)
        {
            special_gallery_image_html += '<a href="' + image_url + value + '" data-toggle="lightbox" data-gallery="hidden-images" class="col-4"><img src="' + image_url + value + '" class="img-fluid"></a>';
        }
        else
        {
            special_gallery_image_html += '<div data-toggle="lightbox" data-gallery="hidden-images" data-remote="' + image_url + value + '" data-title=""></div>';
        }
        special_gallery_count = parseInt(special_gallery_count) + 1;
    });

    $('.spl_img_gall').html(special_gallery_image_html);



}
}
  function menu_cat_load (data)
  {
    console.log(cart);
    var html ='';
  	var all_cat=[];
  	var item_cnt=[];
  	var count =0;
  	var display_count = 1;
  	var items=0;
  	var newcat=0;
  	var n = 0;

    if (menustart == 0) {
      console.log("Inside this");

        var idmenu;

  	    $.each(data, function(key, val) {
          idmenu=val.category_id
  				console.log(Object.keys(data).length);
  	        //var display_style = 'style = "display:none;"';
  	        if ($.inArray(val.category_id, all_cat) != -1) {}
  					else {

  	            all_cat.push(val.category_id);
  							item_cnt.push(val.total_count);
  							if (count > 0) {
  	                html += "</div>";
  	            }
  	            count = parseInt(count) + 1;
  	            display_count = parseInt(display_count) + 1;
  	        }

  	        if (data.disabled_ordering == 2) {
  	            html += '<ons-list-item modifier="tappable" class="list-item-container" onclick="itemNotAvailable(2)" >';
  	        } else {
  	            if (val.not_available == 2) {
  	                html += '<ons-list-item modifier="tappable" class="list-item-container" onclick="itemNotAvailable(1)" >';
  	            } else {
  	                var single_add_item = getStorage("single_add_item");
  	              //  dump("=>" + single_add_item);
  	                if (val.single_item == 2 && single_add_item == 2) {
  	                    item_auto_price = "0|";
  	                    item_auto_discount = "0";
  	                    if (val.prices.length > 0) {
  	                        $.each(val.prices, function(key_price, price) {
  	                            if (!empty(price.price_discount_pretty)) {
  	                                item_auto_price = "'" + price.price + "|'";
  	                                item_auto_discount = parseInt(price.price) - parseInt(price.price_discount)
  	                            } else {
  	                                item_auto_price = "'" + price.price + "|'";
  	                            }
  	                        });
  	                    }
  	                    html += '<ons-list-item modifier="tappable" class="list-item-container list__item ons-list-item-inner list__item--tappable" onclick="autoAddToCart(' + val.item_id + ',' + item_auto_price + ',' + item_auto_discount + ');"  >';
  	                } else {
  	                    html += '<ons-list-item modifier="tappable" class="list-item-container list__item ons-list-item-inner list__item--tappable" onclick="loadItemDetails(' + val.item_id + ',' + val.category_id + ');"  >';
  	                }
  	            }
  	        }

  	        html += '<ons-row class="row ons-row-inner">';
  	        html += '<ons-col class="col-image food-img col ons-col-inner" width="35%">';
  	        html += '<div class="logo-wrap2" >';
  	        html += '<div class="img_loaded" >';
  	        html += '<img src="' + val.photo + '" />';
  	        html += '</div>';
  	        html += '</div>';
  	        html += '</ons-col>';
  	        html += '<ons-col class="col-description food-desc col ons-col-inner" width="65%">';
  	        html += '<p class="restauran-titles concat-text">' + val.item_name + '</p>';
  	        html += '<p class="concat-text">' + val.item_description + '</p>';

  	        if (val.prices.length > 0) {
  	            $.each(val.prices, function(key_price, price) {
  	                var price_size = '';
  	                if (price.size != 'standard') {
  	                    price_size = price.size;
  	                }
  	                if (!empty(price.price_discount_pretty)) {
  	                    html += '<p class="p-small">' + price_size + ' <price class="discount">' + price.price_pretty + '</price>';
  	                    html += '<price>' + price.price_discount_pretty + '</price>';
  	                    html += '</p>';
  	                } else {
  	                    html += '<p class="p-small">' + price_size + ' <price>' + price.price_pretty + '</price></p>';
  	                }
  	            });
  	        }

  	        html += '<img height="20" src="' + val.category_img_url + '">';

  	        if (val.not_available == 2) {
  	            html += '<p>item not available</p>';
  	        }

  	        html += '</ons-col>';
  	        html += '</ons-row>';
  	        html += '</ons-list-item>';


  					items++;
  	    });
        $("#scroll_div_"+idmenu).append(html);

  			Array.prototype.associate = function (keys) {
  				var result = {};

  				this.forEach(function (el, i) {
  					result[keys[i]] = el;
  				});
  				return result;
  			};
  			var itms=item_cnt.associate(all_cat);
  			$.each(itms, function(key, val) {

  						if(val > 10)
  						{
  							$("#scroll_div_" + key ).append('<button id="if'+key+'" class="button green-btn button--large trn" onclick="loadmore('+key+','+menulimit+');" data-trn-key="book_now">Load More</button>');
  						}
  				});
  	} else {
  	    var cid;
  	    var categoryid = [];
  			var buts;
  	    $.each(data, function(key, val) {
  	        var html='';
  	        cid = val.category_id;
  	        if (jQuery.inArray(val.category_id, categoryid) !== -1) {

  	        } else {
  	            categoryid.push(val.category_id);
  	        }
  	        var display_style = 'style = "display:none;"';
  	        if ($.inArray(val.category_id, all_cat) != -1) {} else {
  	            all_cat.push(	val.category_id);
  							item_cnt.push(val.total_count);
  	            if (count == 0) {
  	                html += "</div>";
  	            	}
  	            if (display_count == 1) {
  	                display_style = 'style = "display:block;"';
  	            }

  	            count = parseInt(count) + 1;
  	            display_count = parseInt(display_count) + 1;
  	        }

  	        if (data.disabled_ordering == 2) {
  	            html += '<ons-list-item modifier="tappable" class="list-item-container" onclick="itemNotAvailable(2)" >';
  	        } else {
  	            if (val.not_available == 2) {
  	                html += '<ons-list-item modifier="tappable" class="list-item-container" onclick="itemNotAvailable(1)" >';
  	            } else {
  	                var single_add_item = getStorage("single_add_item");
  	               // dump("=>" + single_add_item);
  	                if (val.single_item == 2 && single_add_item == 2) {
  	                    item_auto_price = "0|";
  	                    item_auto_discount = "0";
  	                    if (val.prices.length > 0) {
  	                        $.each(val.prices, function(key_price, price) {
  	                            if (!empty(price.price_discount_pretty)) {
  	                                item_auto_price = "'" + price.price + "|'";
  	                                item_auto_discount = parseInt(price.price) - parseInt(price.price_discount)
  	                            } else {
  	                                item_auto_price = "'" + price.price + "|'";
  	                            }
  	                        });
  	                    }
  	                    html += '<ons-list-item modifier="tappable" class="list-item-container list__item ons-list-item-inner list__item--tappable" onclick="autoAddToCart(' + val.item_id + ',' + item_auto_price + ',' + item_auto_discount + ');"  data="else">';
  	                } else {
  	                    html += '<ons-list-item modifier="tappable" class="list-item-container list__item ons-list-item-inner list__item--tappable" onclick="loadItemDetails(' + val.item_id + ',' + data.merchant_id + ',' + val.category_id + ');"  >';
  	                }
  	            }
  	        }

  	        html += '<ons-row class="row ons-row-inner">';
  	        html += '<ons-col class="col-image food-img col ons-col-inner" width="35%">';
  	        html += '<div class="logo-wrap2" >';
  	        html += '<div class="img_loaded" >';
  	        html += '<img src="' + val.photo + '" />';
  	        html += '</div>';
  	        html += '</div>';
  	        html += '</ons-col>';
  	        html += '<ons-col class="col-description food-desc col ons-col-inner" width="65%">';
  	        html += '<p class="restauran-titles concat-text">' + val.item_name + '</p>';
  	        html += '<p class="concat-text">' + val.item_description + '</p>';

  	        if (val.prices.length > 0) {
  	            $.each(val.prices, function(key_price, price) {
  	                var price_size = '';
  	                if (price.size != 'standard') {
  	                    price_size = price.size;
  	                }
  	                if (!empty(price.price_discount_pretty)) {
  	                    html += '<p class="p-small">' + price_size + ' <price class="discount">' + price.price_pretty + '</price>';
  	                    html += '<price>' + price.price_discount_pretty + '</price>';
  	                    html += '</p>';
  	                } else {
  	                    html += '<p class="p-small">' + price_size + ' <price>' + price.price_pretty + '</price></p>';
  	                }
  	            });
  	        }

  	        html += '<img height="20" src="' + val.category_img_url + '">';

  	        if (val.not_available == 2) {
  	            html += '<p>item not available</p>';
  	        }

  	        html += '</ons-col>';
  	        html += '</ons-row>';
  	        html += '</ons-list-item>';
  	        $("#scroll_div_" + cid).append(html);

  	    });
  			console.log(item_cnt);
  			Array.prototype.associate = function (keys) {
  				var result = {};

  				this.forEach(function (el, i) {
  					result[keys[i]] = el;
  				});
  				return result;
  			};
  			var itms=item_cnt.associate(all_cat);// load more working fine dont alter anything. This is ddone by Khan
  			$.each(itms, function(key, val) {
          console.log(val);
          if(menulimit == 10)
          {
  						if(val > 10)
  						{
  							$("#scroll_div_" + key ).append('<button id="if'+key+'" class="button green-btn button--large trn" onclick="loadmore('+key+','+menulimit+');" data-trn-key="book_now">Load More</button>');
  						}
         }
         else{
           if(val > 2)
            {
              $("#scroll_div_" + key ).append('<button id="if'+key+'" class="button green-btn button--large trn" onclick="loadmore('+key+','+menulimit+');" data-trn-key="book_now">Load More</button>');
            }
         }
  			});
  	}
    imageLoaded('.img_loaded');
  }

	function loadmore(cid,mstart)
	{
		var catcnt=$("#hidden"+cid).val();
		catcnt=parseFloat(catcnt)+10;
		buts=catcnt;
		$("#hidden"+cid).val(catcnt);
		$("#if"+cid).remove();
		$("#else"+cid).remove();
		menustart = parseFloat(menustart) + 10;
		var mid = getStorage("merchant_id");
		var c_day = getStorage("c_day");
		callAjax("MobileLoadMore", "start=" + catcnt + "&end=" + menulimit + "&category_id="+cid+"&merchant_id=" + mid + "&device_id=" + getStorage("device_id") + "&current_day=" + c_day);
	}


function loadmenu(cat_id,mtid)
{

	/*if ( $("#close_store").val()==2 || $("#merchant_open").val()==1 ){
		onsenAlert( getTrans("This Restaurant Is Closed Now.  Please Check The Opening Times",'restaurant_close') );
		return;
	}*/

	var options = {
      animation: 'none',
      onTransitionEnd: function() {
      	  callAjax("getItemByCategory","cat_id="+cat_id+"&merchant_id="+mtid);
      	  showCartNosOrder();
      }
   };
   sNavigator.pushPage("menuItem.html", options);
}

function scroll_list(id,ele)
{
	$(".swiper-slide").removeClass("active");

	$(ele).parent().addClass('active');

	$('.scrolling-div').css('display','none');

	$('#scroll_div_'+id).css('display','block');
  // if($('#scroll_div_'+id).length > 0)
  // {
  // }
  // else{
  //   console.log("Not-ok");
      $(".restaurant-lists").append('<div id = "scroll_div_' + id+ '"  style="display:block"   data-anchor="scroll_div_' +id+ '" class="scrolling-div" ><input type="hidden" value="0" id="hidden'+id+'"/></div>');
  // }
  //$('#scroll_div_'+id).prop('onclick',null).off('click');

  $('#scroll_list_'+id).removeAttr( "onclick" );

  $('#scroll_div_'+id).scrollTop(0);
  removeHandler(id);

	  //   $('html, body').animate({
    //     scrollTop: $('#scroll_div_'+id).offset().top
    // }, 2000);
      //window.location.href="#scroll_div_"+id;
}

function removeHandler(id) {
  mtid=getStorage("merchant_id");
    menustart = 0;
    menulimit = 10;
    var d = new Date();
      var weekday = new Array(7);
      weekday[0] = "Sunday";
      weekday[1] = "Monday";
      weekday[2] = "Tuesday";
      weekday[3] = "Wednesday";
      weekday[4] = "Thursday";
      weekday[5] = "Friday";
      weekday[6] = "Saturday";

      var n = weekday[d.getDay()];
  	var current_day = n.substring(0, 3);
  	var current_day = current_day.toLowerCase();
  	setStorage("c_day",current_day);
  	$('#mob_current_timing').val(current_day);
    //cart = [] ; /*clear cart variable*/
    removeStorage("tips_percentage");
    removeStorage("cc_id");

    $('#scroll_list_'+id).removeAttr( "onclick" );
    $('#scroll_list_'+id).attr("onclick", "show_hide("+id+", this)");
    callAjax("MobileLoadMore","start=0&end=10&category_id="+id+"&merchant_id=" + mtid + "&device_id=" + getStorage("device_id") + "&current_day=" + current_day);
    //callAjax("MobileLoadMore","start=0&end=10&merchant_id="+mtid +"&category_id ="+id+"&device_id=" + getStorage("device_id")+"&current_day="+current_day  );
}

function show_hide(id,ele)
{
  $(".swiper-slide").removeClass("active");

  $(ele).parent().addClass('active');

  $('.scrolling-div').css('display','none');

  $('#scroll_div_'+id).css('display','block');
  $('#scroll_div_'+id).scrollTop(0);
//   $('html, body').animate({
//     scrollTop: $('#scroll_div_'+id).offset().top
// }, 2000);

  //window.location.href="#scroll_div_"+id;

}

function displayMerchantInfo(data)
{
	if (!empty(data)){		
		$("#page-menubycategoryitem #search-text").html(data.category_info.category_name);
		$("#page-menubycategoryitem .restauran-title").text(data.merchant_info.restaurant_name);
		$("#page-menubycategoryitem .rating-stars").attr("data-score",data.merchant_info.ratings.ratings);
		initRating();
		$("#page-menubycategoryitem .logo-wrap").html('<img src="' + data.merchant_info.logo + '" />');
	}
}

function displayMerchantLogo(data,page_id)
{	 
	if(!empty(data.merchant_info)){
		$("#"+ page_id +" .logo-wrap").html('<img src="'+data.merchant_info.logo+'" />')
	}
	if (!empty(data.cart_total)){
		$("#"+ page_id +" .total-amount").html(data.cart_total);
	}
}

function displayMerchantLogo2(logo,total,page_id)
{	 	 
	if(!empty(logo)){
	    $("#"+ page_id +" .logo-wrap").html('<img src="'+logo+'" />')
	}

	if (!empty(total)){
		$("#"+ page_id +" .total-amount").html(total);
	}

	var merchant_name=getStorage("merchant_name");
	if (!empty(merchant_name)){
		$("#"+ page_id +" .restauran-title").html(merchant_name);
	}
}

function displayItemByCategory(data)
{

	dump( "mobile_menu=>"+data.mobile_menu );

	$("#page-menubycategoryitem #search-text").html(data.category_info.category_name);
	$("#page-menubycategoryitem .restauran-title").text(data.merchant_info.restaurant_name);
	$("#page-menubycategoryitem .rating-stars").attr("data-score",data.merchant_info.ratings.ratings);
	initRating();	 
	$("#page-menubycategoryitem .logo-wrap").html('<img src="'+data.merchant_info.logo+'" /> ');

	var html='';
	html+='<ons-list class="restaurant-list ng-scope list ons-list-inner ">';
	$.each( data.item, function( key, val ) {

		 if (data.disabled_ordering==2){
		 html+='<ons-list-item modifier="tappable" class="list-item-container" onclick="itemNotAvailable(2)" >';
		 } else {
			 if (val.not_available==2){
			     html+='<ons-list-item modifier="tappable" class="list-item-container" onclick="itemNotAvailable(1)" >';
			 } else {
			 	  var single_add_item=getStorage("single_add_item");
			 	  dump("=>"+single_add_item);
			 	  if (val.single_item==2 && single_add_item==2){
			 	  	  item_auto_price="0|";
			 	  	  item_auto_discount="0";
			 	  	  if ( val.prices.length>0){
			 	  	  	  $.each( val.prices, function( key_price, price ) {
			 	  	  	  	   if (!empty(price.price_discount_pretty)){
			 	  	  	  	   	   //item_auto_price = "'"+price.price+"|'";
			 	  	  	  	   	   item_auto_price = price.price+"|";
			 	  	  	  	   	   item_auto_discount=parseInt(price.price)-parseInt(price.price_discount)
			 	  	  	  	   } else {
			 	  	  	  	   	   //item_auto_price=  "'"+price.price+"|'";
			 	  	  	  	   	   item_auto_price =  price.price+"|";
			 	  	  	  	   }
			 	  	  	  });
			 	  	  }
			 	  	  /*html+='<ons-list-item modifier="tappable" class="list-item-container" onclick="autoAddToCart('+val.item_id+','+item_auto_price+','+item_auto_discount+');"  >';*/

html+='<ons-list-item modifier="tappable" class="list-item-container"';
html+='onclick="autoAddToCart('+ "'"+val.item_id+"'," +  "'"+item_auto_price+"'," + "'"+item_auto_discount+"'"  +');"  >';

			 	  } else {
			          html+='<ons-list-item modifier="tappable" class="list-item-container" onclick="loadItemDetails('+val.item_id+','+data.merchant_info.merchant_id+','+data.category_info.cat_id+');"  >';
			 	  }
			 }
		 }

         html+='<ons-row class="row">';

         if ( data.mobile_menu==1){

         	html+='<ons-col class="col-image" width="65%">';
                html+='<p class="restauran-title concat-text">'+val.item_name+'</p>';
                html+='<p class="">'+val.item_description+'</p>';
             html+='</ons-col>';

             html+='<ons-col class="col-image text-right" width="35%">';
              if ( val.prices.length>0){
	                $.each( val.prices, function( key_price, price ) {
	                   if (!empty(price.price_discount_pretty)){
	                   	//   html+='<p class="p-small">'+price.size+' <price class="discount">'+price.price_pretty+'</price>';  commented on 01-03-2017
                   			html+='<p class="p-small"> <price class="discount">'+price.price_pretty+'</price>'; //insted of above line
	                   	   html+='<price>'+price.price_discount_pretty+'</price>';
	                   	   html+='</p>';
	                   } else {
	                   	//   html+='<p class="p-small">'+price.size+' <price>'+price.price_pretty+'</price></p>';  commented on 01-03-2017
	                   }	 html+='<p class="p-small"> <price>'+price.price_pretty+'</price></p>';                   //insted of above line
	                });
                }
             html+='</ons-col>';

         } else {

             html+='<ons-col class="col-image" width="35%">';
                html+='<div class="logo-wrap2" >';
                  html+='<div class="img_loaded" >';
                  html+='<img src="'+val.photo+'" />';
                  html+='</div>';
                html+='</div>';
             html+='</ons-col>';

                html+='<ons-col class="col-description" width="65%">';
                html+='<p class="restauran-title concat-text">'+val.item_name+'</p>';
                html+='<p class="concat-text">'+val.item_description+'</p>';

                if ( val.prices.length>0){
	                $.each( val.prices, function( key_price, price ) {
	                   if (!empty(price.price_discount_pretty)){
	                   	   // html+='<p class="p-small">'+price.size+' <price class="discount">'+price.price_pretty+'</price>'; //comm on 01-03-2017
	                   	   html+='<p class="p-small"> <price class="discount">'+price.price_pretty+'</price>'; //insted of above line
	                   	   html+='<price>'+price.price_discount_pretty+'</price>';
	                   	   html+='</p>';
	                   } else {
	                   	   // html+='<p class="p-small">'+price.size+' <price>'+price.price_pretty+'</price></p>'; commented on 01-03-2017
	                   	   html+='<p class="p-small"> <price>'+price.price_pretty+'</price></p>'; // instead of above line
	                   }
	                });
                }

                if (val.not_available==2){
                	html+='<p>item not available</p>';
                }

             html+='</ons-col>';
         }

         html+='</ons-row>';
        html+='</ons-list-item>';
    });
    html+='</ons-list>';
    createElement('menu-list',html);

    imageLoaded('.img_loaded');
}

function empty(data)
{
	if (typeof data === "undefined" || data==null || data=="" ) {
		return true;
	}
	return false;
}

function loadItemDetails(item_id,mtid,cat_id)
{
  if(getStorage("merc_stats") == "Closed")
  {
    onsenAlert( getTrans("Sorry, Restaurant is closed at the moment",'restaurant_close') );
    return;
  }
  //   if ( $("#close_store").val()==2 || $("#merchant_open").val()==1 ){
	// 	onsenAlert( getTrans("Closed. Please check the top right menu for information.",'restaurant_close') );
	// 	return;
	// }

	var options = {
      animation: 'slide',
      onTransitionEnd: function() {
      	  callAjax("getItemDetails","item_id="+item_id+"&merchant_id="+mtid+"&cat_id="+cat_id);
      }
   };
   sNavigator.pushPage("itemDisplay.html", options);
}

function displayItem(data)
{
	$("#page-itemdisplay .item-header").css({
		'background-image':'url('+data.photo+')'
	});

	$("#page-itemdisplay .title").text(data.item_name);
	$("#page-itemdisplay .description").text(data.item_description);


	if (!empty(data.category_info)){
		$("#page-itemdisplay #search-text").text(data.category_info.category_name);
	}

	var htm='';

	htm+='<input type="hidden" name="item_id" class="item_id" value="'+data.item_id+'">';
	htm+='<input type="hidden" name="currency_symbol" class="currency_symbol" value="'+data.currency_symbol+'">';
	htm+='<input type="hidden" name="discount" class="discount discount_amt" value="'+data.discount+'">';

	htm+='<input type="hidden" name="two_flavors" class="two_flavors" value="'+data.two_flavors+'">';

	if (data.two_flavors==2){
		data.has_price=1;
	}

	if ( data.has_price==2){
		htm+='<ons-list-header class="list-header trn" data-trn-key="price">Price</ons-list-header>';
		var x=0
		$.each( data.prices, function( key, val ) {
			if (data.discount>0){
				var discount_price='<price class="discount">'+val.pretty_price;
				discount_price+='</price>';
				discount_price+='<price>'+val.discounted_price_pretty+'</price>';
				if (x==0){
					htm+=privatePriceRowWithRadio2('price',
					val.price+'|'+val.size.replace("\"", "__") ,
					val.size,
					discount_price,
					'checked="checked"');
				} else {
					htm+=privatePriceRowWithRadio2('price',
					val.price+'|'+val.size.replace("\"", "__") ,
					val.size,
					discount_price);
				}
			} else {
				if (x==0){
					htm+=privatePriceRowWithRadio('price',
					val.price+'|'+val.size.replace("\"", "__") ,
					val.size,
					val.pretty_price
					);
				} else {
					htm+=privatePriceRowWithRadio('price',
					val.price+'|'+val.size.replace("\"", "__") ,
					val.size,
					val.pretty_price);
				}
			}
			x++;
		});
	}
  console.log(data.addon_item);
if(data.addon_item == false)
{
  htm+='<ons-list-header class="list-header" style="display:none">Click here to show Addons <button  class="button button--quiet get_addons"><ons-icon icon="fa-caret-square-o-down" class="icon-green ons-icon fa-caret-square-o-down fa fa-lg"></ons-icon></button> </ons-list-header>';
  htm+='<ons-list id="append_addons" style="display:none">   </ons-list>';
}
else{
  htm+='<ons-list-header class="list-header">Click here to show Addons <button  class="button button--quiet get_addons"><ons-icon icon="fa-caret-square-o-down" class="icon-green ons-icon fa-caret-square-o-down fa fa-lg"></ons-icon></button> </ons-list-header>';
  htm+='<ons-list id="append_addons" style="display:none">   </ons-list>';
}

	if (!empty(data.cooking_ref)){
		htm+='<ons-list-header class="list-header trn" data-trn-key="cooking_ref">Cooking Preference</ons-list-header>';
		$.each( data.cooking_ref, function( key, val ) {
			htm+=privateRowWithRadio('cooking_ref',val,val);
		});
	}

	if (!empty(data.ingredients)){
		htm+='<ons-list-header class="list-header trn" data-trn-key="ingredients">Ingredients</ons-list-header>';
		$.each( data.ingredients, function( key, val ) {
			htm+=privateRowWithCheckbox('ingredients','ingredients',val,val);
		});
	}

	var show_addon_description=getStorage("show_addon_description");

	/* if (!empty(data.addon_item)){
		$.each( data.addon_item, function( key, val ) {
			htm+='<ons-list-header class="list-header require_addon_'+val.subcat_id+' ">'+val.subcat_name+'</ons-list-header>';

			htm+='<input type="hidden" name="require_addon_'+val.subcat_id+'" class="require_addon" value="'+val.require_addons+'" data-id="'+val.subcat_id+'" data-name="'+val.subcat_name+'" >'

			if (!empty(val.sub_item)){
				$.each( val.sub_item, function( key2, val2 ) {
					  if (val.multi_option == "custom"){
	                     htm+=subItemRowWithCheckbox(
	                                 val.subcat_id,
	                                 'sub_item',
	                                 val2.sub_item_id+"|"+val2.price +"|"+val2.sub_item_name,
	                                 val2.sub_item_name,
	                                 val2.pretty_price ,
	                                 val.multi_option_val,
	                                 val2.item_description
	                                 );

					  } else if ( val.multi_option == "multiple") {
					  	 htm+=subItemRowWithCheckboxQty(
					  	             val.subcat_id,
					  	            'sub_item',
	                                 val2.sub_item_id+"|"+val2.price +"|"+val2.sub_item_name,
	                                 val2.sub_item_name,
	                                 val2.pretty_price );


	                     if(show_addon_description==1){
		                     if(!empty(val2.item_description)){
		                        htm+='<div class="addon_description small-font-dim">'+val2.item_description+'</div>';
		                     }
	                     }

					  } else {
                          htm+=subItemRowWithRadio(
                                   val.subcat_id,
                                   "sub_item",
                                   //val2.sub_item_id+"|"+val2.price + "|"+val2.sub_item_name  ,
                                   val2.sub_item_id+"|"+val2.price + "|"+val2.sub_item_name + "|" + val.two_flavor_position  ,
                                   val2.sub_item_name,
                                   val2.pretty_price,
                                   false,
                                   val2.item_description
                                   );
					  }
				});
			}
		});
	} */

	htm+=cartFooter(data.currency_code);

	createElement('item-info',htm);

	setCartValue()

	translatePage();

}



function append_addons(data)
{
    htm = '';
    if ((data.details)){
    var htm ='';
        $.each( data.details, function( key, val ) {
            htm+='<ons-list-header class="list-header require_addon_'+val.subcat_id+' ">'+val.subcat_name+'</ons-list-header>';

            htm+='<input type="hidden" name="require_addon_'+val.subcat_id+'" class="require_addon" value="'+val.require_addons+'" data-id="'+val.subcat_id+'" data-name="'+val.subcat_name+'" >'

            if (!empty(val.sub_item)){
                $.each( val.sub_item, function( key2, val2 ) {
                      if (val.multi_option == "custom"){
                         htm+=subItemRowWithCheckbox(
                                     val.subcat_id,
                                     'sub_item',
                                     val2.sub_item_id+"|"+val2.price +"|"+val2.sub_item_name,
                                     val2.sub_item_name,
                                     val2.pretty_price ,
                                     val.multi_option_val,
                                     val2.item_description
                                     );

                      } else if ( val.multi_option == "multiple") {
                         htm+=subItemRowWithCheckboxQty(
                                     val.subcat_id,
                                    'sub_item',
                                     val2.sub_item_id+"|"+val2.price +"|"+val2.sub_item_name,
                                     val2.sub_item_name,
                                     val2.pretty_price );


                      } else {
                          htm+=subItemRowWithRadio(
                                   val.subcat_id,
                                   "sub_item",
                                   //val2.sub_item_id+"|"+val2.price + "|"+val2.sub_item_name  ,
                                   val2.sub_item_id+"|"+val2.price + "|"+val2.sub_item_name + "|" + val.two_flavor_position  ,
                                   val2.sub_item_name,
                                   val2.pretty_price,
                                   false,
                                   val2.item_description
                                   );
                      }
                });
            }
        });
    }

    $('#append_addons').html(createElement('append_addons',htm));
    //$('#append_addons').css('display','block');

}




jQuery(document).ready(function() {

	/*jquery onclick*/

	$(document).on('click','.price',function()
	{
    $("#append_addons").hide();
		var item_id = $('.item_id').val();
		var size    = $(this).val().replace(/\s/g,'');
		//var size    = $(this).val().split('|');
		//size    	=  $.trim((size[1]));
		/* var url     = 'https://www.cuisine.je/store/GetaddOnPrice';
		 $.ajax({
                type:'POST',
                url : url ,
                data: {size:size,item_id:item_id},
                success:function(response)
                {
                    if($.trim(response)!='')
                    {
                        $('.food-addons').html('');
                        $('.food-addons').html(response);
                    }
                    else
                    {
                        $('.food-addons').html('');
                    }
                }
        }) */
        var params="item_id="+item_id;
		    params+="&size="+size+"&merchant_id="+ getStorage('merchant_id');
		callAjax("LoadAddOns",params);
		setCartValue();
	});

	$( document ).on( "click", ".get_addons", function() {
    $("#append_addons").show();
		// var item_id = $('.item_id').val();
		// var size    = $('input[name=price]:checked').val().replace(/\s/g,'');
    // if(size == "")
    // {
    //   onsenAlert("Please select an item");
    // }
		// var params="item_id="+item_id;
		//     params+="&size="+size+"&merchant_id="+ getStorage('merchant_id');
		// callAjax("LoadAddOns",params);

	});

	/*$( document ).on( "click", ".price", function() {
		setCartValue();
	});*/
	$( document ).on( "change", ".qty", function() {
		setCartValue();
	});

	$( document ).on( "change", ".sub_item", function() {
		setCartValue();
	});

	$( document ).on( "change", ".subitem-qty", function() {
		setCartValue();
	});

	$( document ).on( "click", ".edit-order", function() {
		editOrderInit();
	});

	$( document ).on( "click", ".cart-empty", function() {
		cartempty();
	});

	$( document ).on( "click", ".order-apply-changes", function() {
		applyCartChanges();
	});

	$( document ).on( "click", ".delete-item", function() {
		var id=$(this).data('id');
		var parent=$(this).parent().parent().parent();
		parent.remove();
		$(".subitem-row"+id).remove();
	});

	$( document ).on( "click", ".sub_item_custom", function() {
		 var this_obj=$(this);
		 var multi=$(this).data("multi");
		 if (empty(multi)){
		 	return;
		 }
		 var id=$(this).data("id");
		 var total_check=0;
		 $('.sub_item_custom:checked').each(function(){
		 	if ( $(this).data("id") == id){
		 		total_check++;
		 	}
		 });
		 if (multi<total_check){
		 	onsenAlert( getTrans('Please select only','sorry_but_you_can_select') + " "+multi+" "  +
		 	 getTrans('addon','addon') );
		 	this_obj.attr("checked",false);
		 	return;
		 }
	});

	$( document ).on( "click", ".transaction_type", function() {
		var transaction_type=$(this).val();

		if(transaction_type=="pickup"){
      $("#page-shipping #search-text").html("PickUp Information");
			$(".delivery_asap_wrap").hide();
		} else {
			$(".delivery_asap_wrap").show();
		}

		setStorage('transaction_type',transaction_type);

		  var cart_params=JSON.stringify(cart);
		  if (saveCartToDb()){
		      cart_params='';
		  }

		  var extra_params= "&delivery_date=" +  $(".delivery_date").val();
		  if ( !empty($(".delivery_time").val()) ){
			  extra_params+="&delivery_time="+$(".delivery_time").val();
		   }

      	  callAjax("loadCart","merchant_id="+ getStorage('merchant_id')+"&search_address=" +
      	  encodeURIComponent(getStorage("search_address")) + "&cart="+cart_params +"&transaction_type=" +
      	  getStorage("transaction_type") + extra_params + "&device_id="+ getStorage("device_id") );

	});

	$( document ).on( "click", ".payment_list", function() {
		dump( $(this).val() );
		var paypal_card_fee=$(".paypal_card_fee").val();
		switch( $(this).val() )
		{
			case "paypal":
			case "pyp":
			  if (paypal_card_fee>0){
				  var total_order_plus_fee=parseFloat(getStorage("order_total_raw")) + parseFloat(paypal_card_fee);
				  total_order_plus_fee= number_format(total_order_plus_fee,2);
				  $(".total-amount").html( getStorage("cart_currency_symbol")+" "+total_order_plus_fee);
			  }

			  $(".order-change-wrapper").hide();
			  $(".payon-delivery-wrapper").hide();
			  break;

			case "cod":
			if (paypal_card_fee>0){
				$(".total-amount").html( getStorage("order_total"));
			}
			$(".order-change-wrapper").show();
			$(".payon-delivery-wrapper").hide();
			break;

			case "pyr":
			if (paypal_card_fee>0){
				$(".total-amount").html( getStorage("order_total"));
			}
			$(".order-change-wrapper").hide();
			$(".payon-delivery-wrapper").show();
			break;

			case "ocr":

			var options = {
		      animation: 'slide',
		      onTransitionEnd: function() {
		      	  var params="merchant_id=" +  getStorage("merchant_id") ;
		      	  params+="&client_token="+getStorage("client_token");
			      callAjax("getMerchantCClist",params);
			      translatePage();
		      }
		    };
		    sNavigator.pushPage("cclist.html", options);

			break;

			default:
			if (paypal_card_fee>0){
				$(".total-amount").html( getStorage("order_total"));
			}
			$(".order-change-wrapper").hide();
			$(".payon-delivery-wrapper").hide();
			break;
		}
	});
 
	$( document ).on( "click", ".logo-wrap img", function() 
	{
		var page = sNavigator.getCurrentPage();
		dump("pagename=>"+page.name);
		if ( page.name=="merchantInfo.html"){
			return;
		}

		var options = {
	      animation: 'none',
	      onTransitionEnd: function() {
	      	  displayMerchantLogo2(
		      	     getStorage("merchant_logo") ,
		      	     '' ,
		      	     'page-merchantinfo'
		      );
		      callAjax("getMerchantInfo","merchant_id="+ getStorage('merchant_id'));
	      }
	    };

		var found=false;
		var _pages = sNavigator.getPages();
		dump( _pages.length );
		if ( _pages.length>0){
			$.each( _pages, function( key, val ) {
				if (!empty(val)){
					dump(val.name);
					if ( val.name=="merchantInfo.html"){
						dump('found');
						found=true;
						//sNavigator.resetToPage("merchantInfo.html",options);
						sNavigator.popPage();
					}
				}
			});
		}

		if (found){
			dump('exit');
			return;
		}

	    sNavigator.pushPage("merchantInfo.html", options);
	});

	

	$( document ).on( "click", ".setAddress", function() {
		var address=$(this).data("address");
		var address_split=address.split("|");
		//dump(address_split);
		if ( address_split.length>0){

			//Disable the lookdown from lookup postal code
			$(".lookupDropdown").hide();
      $("#address_def").val(address_split[0]+','+address_split[1]+','+ address_split[2]+','+address_split[3]);

			$(".street").val( address_split[0] );
			$(".city").val( address_split[1] );
			$(".state").val( address_split[2] );
			$(".zipcode").val( address_split[3] );
			//$(".location_name").val( address_split[4] );
			//Now set it to the other fields too

			$(".stree_1").val( address_split[0] );
			$(".city_1").val( address_split[1] );
			$(".state_1").val( address_split[2] );
			$(".zipcode_1").val( address_split[3] );
			//$(".location_name").val( address_split[4] );


			var number='';
			if (!empty(address_split[5])){
				number=address_split[5];
				//number=number.replace("+","");
			}

			$(".contact_phone").val( number );

			var complete_address = address_split[0];
			complete_address+=" "+ address_split[1];
			complete_address+=" "+ address_split[2];
			complete_address+=" "+ address_split[3];

			$(".delivery-address-text").val( complete_address );
			$(".google_lat").val( '' );
			$(".google_lng").val( '' );
			$(".formatted_address").val( '' );

			dialogAddressBook.hide();
			//$("#del-addrs").show();
			//sNavigator.popPage({cancelIfRunning: true}); //back button

		} else {
			onsenAlert(  getTrans("Error: Cannot save your address book",'cannot_set_address')  );
			dialogAddressBook.hide();
		}
	});

});

/*end ready*/


function loadMerchantInfo(merchant_id)
{

	var page = sNavigator.getCurrentPage();
	dump("pagename=>" + page.name);
	if (page.name == "merchantInfo.html") {
		return;
	}

	var options = {
		animation: 'none',
		onTransitionEnd: function () {
			displayMerchantLogo2(
				getStorage("merchant_logo"),
				'',
				'page-merchantinfo'
			);
			callAjax("getMerchantInfo", "merchant_id=" + merchant_id);
		}
	};

	var found = false;
	var _pages = sNavigator.getPages();
	dump(_pages.length);
	if (_pages.length > 0) {
		$.each(_pages, function (key, val) {
			if (!empty(val)) {
				dump(val.name);
				if (val.name == "merchantInfo.html") {
					dump('found');
					found = true;
					//sNavigator.resetToPage("merchantInfo.html",options);
					sNavigator.popPage();
				}
			}
		});
	}

	if (found) {
		dump('exit');
		return;
	}

	sNavigator.pushPage("merchantInfo.html", options);

}

function setCartValue()
{
	/*set the default total price based on selected price*/
	var selected_price=parseFloat($(".price:checked").val());
	var discount= parseFloat( $(".discount_amt").val() );
	if (isNaN(discount)){
		discount=0;
	}

	if (isNaN(selected_price)){
		selected_price=0;
	}

	dump("discount=>"+discount);
	dump("selected_price=>"+selected_price);
	var qty=parseFloat($(".qty").val());
	var total_value=qty* (selected_price-discount);

	//adon
	dump('addon totalx');
	var addon_total=0;

	var addon_prices = [];

	$('#page-itemdisplay .sub_item:checkbox:checked').each(function(){
        var addo_price=explode("|",$(this).val());
        if ( $(this).data("withqty")==2 ){
        	var p=$(this).parent().parent().parent();
        	var qtysub= parseFloat(p.find('.subitem-qty').val());

        	addon_total+=qtysub* parseFloat(addo_price[1]);
        	//addon_prices.push(addon_total);
        } else {
        	addon_total+=qty* parseFloat(addo_price[1]);
        	//addon_prices.push(addon_total);
        }
    });

    $('#page-itemdisplay .sub_item:radio:checked').each(function(){

        var addo_price=explode("|",$(this).val());

        dump(addo_price);
        dump(addo_price[1]);

        addon_total+=qty * parseFloat(addo_price[1]);
        addon_prices.push( parseFloat(addo_price[1]) );
    });

    total_value+=addon_total;

    dump("total_value =>"+total_value);
    if ( $(".two_flavors").val()==2 ){
    	dump("two_flavors");
    	dump(addon_prices);
    	total_value = Math.max.apply(Math,addon_prices);
    	dump('get the highest value => ' + total_value );
    	total_value = parseInt($("#page-itemdisplay .qty").val()) * total_value;
    }

    //$(".total_value").html(  $(".currency_symbol").val() +" "+ total_value);
    $(".total_value").html( prettyPrice(total_value)  );
}

function addCartQty(bolean)
{
	var qty=parseInt($("#page-itemdisplay .qty").val());
	if ( bolean==2){
		qty=qty+1;
	} else {
		qty=qty-1;
	}
	if ( qty>1){
	    $("#page-itemdisplay .qty").val(qty)
	    $(".subitem-qty").val(qty)
	} else {
		$("#page-itemdisplay .qty").val(1)
		$(".subitem-qty").val(1)
	}
	setCartValue();
}

function addToCart()
{
	var proceed=true;
  if($(".price:checked").length <=0 )
  {
    onsenAlert("Please select a item");
    return false;
  }

	/*check if sub item has required*/
	else if ( $(".require_addon").exists()){
		$(".small-red-text").remove();
		$('.require_addon').each(function () {
			if ( $(this).val()==2 ) {
				var required_addon_id=$(this).data("id");
	   	   	   	var required_addon_name=$(this).data("name");
	   	   	   	var required_addon_selected=$(".sub_item_name_"+required_addon_id+":checked").length;
	   	   	   	if ( required_addon_selected <=0){
	   	   	   		proceed=false;

	   	   	   		var err_msg="You must select at least one addon - "+ required_addon_name;

	   	   	   		$(".require_addon_"+required_addon_id).after(
					"<span class=\"small-red-text\">"+err_msg
					+'</span');
					onsenAlert(err_msg);
	   	   	   	}
			}
		});
	}

	dump("proceed=>"+proceed);
	if (!proceed){
		return;
	}

	var sub_item=[];
	var cooking_ref=[];
	var ingredients=[];
	var item_id='';
	var qty=0;
	var price=0;
	var order_notes='';
	var discount='';
	//dump('add to cart');
	//var params = $( "#page-itemdisplay .frm-foodorder").serialize();
	var params = $( "#page-itemdisplay .frm-foodorder").serializeArray();
	if (!empty(params)){
		$.each( params, function( key, val ) {
			/*item*/
			if (val.name=="item_id"){
				item_id=val.value;
			}
			if (val.name=="qty"){
				qty=val.value;
			}
			if (val.name=="price"){
				price=val.value;
			}
			/*sub item*/
			/*if ( val.name=="sub_item"){
				sub_item[sub_item.length]={"value":val.value};
			}*/
			/*cooking_ref*/
			if ( val.name=="cooking_ref"){
				cooking_ref[cooking_ref.length]={"value":val.value};
			}
			/*ingredients*/
			if ( val.name=="ingredients"){
				ingredients[ingredients.length]={"value":val.value};
			}
			if ( val.name=="order_notes"){
				order_notes=val.value;
			}
			if ( val.name=="discount"){
				discount=val.value;
			}
		});

		/*get sub item */

		if ( $(".two_flavors").val()==2 ){
			var sub_item_selected=$(".sub_item:checked").length;
			if ( sub_item_selected<2){
   	   	  	  onsenAlert(  getTrans("Please select price for left and right flavor",'two_flavor_required') );
   	   	      return;
   	   	   }

   	   	   var xx=0; var addon_price_array=[];
   	   	   $.each( $(".sub_item:checked") , function( key, val ) {
				/* var parent=$(this).parent().parent().parent();
				var sub_item_qty = parent.find(".subitem-qty").val(); */
				var sub_item_qty = $('.qty').val();
				// alert(sub_item_qty);
				if (empty(sub_item_qty)){
					sub_item_qty="itemqty";
				}
				var subcat_id=$(this).data("id");

				var addon_price=$(this).val();
				addon_price=addon_price.split("|");
				addon_price_array[xx]=addon_price[1];

				sub_item[sub_item.length] = {
					'subcat_id':subcat_id,
					'value':$(this).val(),
					'qty':sub_item_qty
				};

				xx++;
			});

			dump(addon_price_array);
			/*var largest = addon_price_array.reduce(function(x,y){
			       return (x > y) ? x : y;
			});*/
			largest = Math.max.apply(Math,addon_price_array);

			dump("largest price => "+largest);
			price=largest;

		} else {
			$.each( $(".sub_item:checked") , function( key, val ) 
			{
				/* var parent=$(this).parent().parent().parent();
				var sub_item_qty = parent.find(".subitem-qty").val(); commented by n  */ 
				var sub_item_qty = $('.qty').val();
				if (empty(sub_item_qty)){
					sub_item_qty="itemqty";
				}
				var subcat_id=$(this).data("id");
				sub_item[sub_item.length] = {
					'subcat_id':subcat_id,
					'value':$(this).val(),
					'qty':sub_item_qty
				};
			});
		}



		cart[cart.length]={
		  "item_id":item_id,
		  "qty":qty,
		  "price":price,
		  "sub_item":sub_item,
		  "cooking_ref":cooking_ref,
		  "ingredients":ingredients,
		  'order_notes': order_notes,
		  'discount':discount
		};

		var cart_value={
		  "item_id":item_id,
		  "qty":qty,
		  "price":price,
		  "sub_item":sub_item,
		  "cooking_ref":cooking_ref,
		  "ingredients":ingredients,
		  'order_notes': order_notes,
		  'discount':discount
		};
    console.log(cart_value);
		if( saveCartToDb() ){
		   callAjax("addToCart", "cart="+ JSON.stringify(cart_value) + "&device_id=" + getStorage("device_id") );
		   sNavigator.popPage({cancelIfRunning: true}); //back button
		} else {

			sNavigator.popPage({cancelIfRunning: true}); //back button
			//toastMsg(  getTrans("Food added to cart",'item_added_to_cart') );
		}

		showCartNosOrder();
	}
}

function showCart(order_id)
{
	dump('showCart');
	var cartnum=$(".cart-num").html();
	if(cartnum=="" || cartnum=="0"){
		sNavigator.pushPage("cartempty.html", options);
		//onsenAlert("Sorry no item found in cart.");
	}
  else if(order_id)
  {
    var options = {
        animation: 'none',
        onTransitionEnd: function() {

        	  var cart_params=JSON.stringify(cart);
        	  if (saveCartToDb()){
        	  	  var cart_params='';
        	  }

        	  if ( empty(getStorage("tips_percentage")) ){
        	  	   setStorage("tips_percentage",0);
        	  }

        	  callAjax("loadCart","merchant_id="+ getStorage('merchant_id')+"&search_address=" +
        	  encodeURIComponent(getStorage("search_address")) + "&order_id="+order_id+"&reorder=true&cart="+cart_params +"&transaction_type=" +
        	  getStorage("transaction_type") + "&device_id="+ getStorage("device_id") +"&tips_percentage=" + getStorage("tips_percentage") );
        }
     };
     sNavigator.pushPage("cart.html", options);
  }
	else{
	var options = {
      animation: 'none',
      onTransitionEnd: function() {

      	  var cart_params=JSON.stringify(cart);
      	  if (saveCartToDb()){
      	  	  var cart_params='';
      	  }

      	  if ( empty(getStorage("tips_percentage")) ){
      	  	   setStorage("tips_percentage",0);
      	  }

      	  callAjax("loadCart","merchant_id="+ getStorage('merchant_id')+"&search_address=" +
      	  encodeURIComponent(getStorage("search_address")) + "&cart="+cart_params +"&transaction_type=" +
      	  getStorage("transaction_type") + "&device_id="+ getStorage("device_id") +"&tips_percentage=" + getStorage("tips_percentage") );
      }
   };
   sNavigator.pushPage("cart.html", options);
	}
}

function showCartNosOrder()
{
	$(".cart-num, .carticon").removeClass('animate');
	dump('showCartNosOrder');
	dump(  cart.length );
	if ( cart.length>0 ){
		//$(".cart-num").show();
		$(".cart-num").css({ "display":"inline-block","position":"absolute","margin-left":"-10px" });
		$(".cart-num").text(cart.length);
    $("#flash_msg").show();
		setTimeout(function(){$(".cart-num, .carticon").addClass('animate');	},100);
	} else {
		$(".cart-num").hide();
    $("#flash_msg").hide();
	}
	//onsenAlert("Food Item Added to Cart");

	setTimeout(function(){$(".cart-num, .carticon").removeClass('animate');	},500);
	setTimeout(function(){$(".cart-num, .carticon").removeClass('animate');	},1000);
	setTimeout(function(){$("#flash_msg").hide();$(".cart-num, .carticon").addClass('animate');	},2000);
}


	function ConvertTimeformat(format, str)
{
	    var time = str;
	    var hours = Number(time.match(/^(\d+)/)[1]);
	    var minutes = Number(time.match(/:(\d+)/)[1]);
	    var AMPM = time.match(/\s(.*)$/)[1];

	    if (AMPM == "PM" && hours < 12)  hours = hours + 12;
	    if (AMPM == "PM" && hours == 12) hours = hours ;
	    if (AMPM == "PM" && hours > 12)  hours = hours - 12;

	    var sHours = hours.toString();
	    var sMinutes = minutes.toString();
	    if (hours < 10) sHours = "0" + sHours;
	    if (minutes < 10) sMinutes = "0" + sMinutes;
	    $('.delivery_time').val(sHours + ":" + sMinutes);

}

function decline_back()
{
sNavigator.popPage({cancelIfRunning: true}); //back button
}
	function check_date_time()
	{

			var merchant_timings = $.trim($('#merchant_open_close_timing').val());
	        if(merchant_timings!='')
	        {
	            var result            = merchant_timings.split(',');
	           // var current_time      = $.trim($('.delivery_time').val());
	           	// alert(current_time);

	          // var current_time    = "16:00";

	          	var jersey_date = moment().tz("Europe/Jersey").format('MM/DD/YYYY');
				var jersey_time = moment().tz("Europe/Jersey").format('hh:mm');

	            var d               = new Date();
	            var month           = d.getMonth()+1;
	            var day             = d.getDate();
	            var current_date    =
	                ((''+month).length<2 ? '0' : '') + month + '/' +
	                ((''+day).length<2 ? '0' : '') + day + '/' +
	                d.getFullYear();
	            var minutes = ('0' + d.getMinutes()).slice(-2);
	           // var current_time = d.getHours() + ":" + minutes;

	           // alert(current_date +" " + current_time);

				var current_date_time    = new Date(current_date +" " + current_time);

			   //	alert(jersey_date +" " + jersey_time);

                var jersey_date_time     = new Date(jersey_date +" " + jersey_time);
				var current_time =  jersey_time;
               //  alert(current_date_time+"   " +jersey_date_time);



	            if(result[0]!='')
	            {
	                var merchant_timings_1 = result[0].split('-');
	                /* alert(merchant_timings_1[0])  ;
	                alert(merchant_timings_1[1])  ; */
	            /*    alert(current_date +" " + current_time);
	                alert(current_date +" " + merchant_timings_1[0]); */


	                //  var current_date_time    = new Date(current_date +" " + current_time);  IST

	                 var jersey_date_time     = new Date(jersey_date +" " + jersey_time);

	                 var current_date_time    = jersey_date_time ;

	                var merchant_open   = new Date(current_date +" " + merchant_timings_1[0]);
	                var merchant_close  = new Date(current_date +" " + merchant_timings_1[1]);

	                // alert(current_date_time+"   "+merchant_open);
	                if(current_date_time<=merchant_open)
	                {
	                      var time = Date.parse(merchant_timings_1[0], "hh:mm tt");
	                      var newtime = time.addMinutes(45);
	                      var newHour = newtime.getHours();
	                      // alert(" newHour " + newHour);
	                      var newMins = newtime.getMinutes();
	                      var newTT = 'AM';
	                      if(newHour > 12)
	                      {
		                         newHour = newHour - 12;
		                         newTT = 'PM';
	                      }
		                  if(newHour == 12)
	                      {
		                         newHour = 12;
		                         newTT = 'PM';
		                  }

	                      if(newHour < 10){
	                         newHour ='0'+newHour;
	                      }

	                      if(newMins < 10){
	                         newMins ='0'+newMins;
	                      }
	                     //  alert(newHour+':'+newMins+' '+newTT);
	                     //$('#delivery_time').val(newHour+':'+newMins+' '+newTT);
	                     // alert(newHour+':'+newMins+' '+newTT);
	                    // $('.merchant_manual_changed_time').val(newHour+':'+newMins+' '+newTT);
	                      ConvertTimeformat("24",newHour+':'+newMins+' '+newTT);
	                      // $('.merchant_opening_time').val(merchant_timings_1[0]);
	                     return ;
	                }
	                else if((current_date_time>=merchant_open)&&(current_date_time<=merchant_close))
	                {
	          			  var temp_time = Date.parse(current_time, "hh:mm tt");
	                      var time      = Date.parse(current_time, "hh:mm tt");
	                      var temp_newtime = temp_time.addMinutes(45);
	                      if(temp_newtime>merchant_close)
	                      {
	                       var newtime = time.addMinutes(0);
	                      }
	                      else
	                      {
	                        var newtime = time.addMinutes(50);
	                      }
	                      // var newtime = time.addMinutes(0);
	                      var newHour = newtime.getHours();
	                      var newMins = newtime.getMinutes();
	                      var newTT = 'AM';
	                      if(newHour > 12)
	                      {
		                         newHour = newHour - 12;
		                         newTT = 'PM';
	                      }
		                  if(newHour == 12)
	                      {
		                         newHour = 12;
		                         newTT = 'PM';
		                  }

	                      if(newHour < 10){
	                         newHour ='0'+newHour;
	                      }

	                      if(newMins < 10){
	                         newMins ='0'+newMins;
	                      }
	                      // alert(newHour+':'+newMins+' '+newTT);       */
	                     ConvertTimeformat("24",newHour+':'+newMins+' '+newTT);
	                     return ;
	                }

	              }
	        if( result[1]!='' )
	        {


	                var merchant_timings_1 = result[1].split('-');
	                /* alert(merchant_timings_1[0])  ;
	                alert(merchant_timings_1[1])  ; */
	                var current_date_time    = new Date(current_date +" " + current_time);
	                var merchant_open   = new Date(current_date +" " + merchant_timings_1[0]);
	                var merchant_close  = new Date(current_date +" " + merchant_timings_1[1]);
	                if(current_date_time<merchant_open)
	                {
	                      var time = Date.parse(merchant_timings_1[0], "hh:mm tt");
	                      var newtime = time.addMinutes(45);
	                      var newHour = newtime.getHours();
	                      var newMins = newtime.getMinutes();
	                      var newTT = 'AM';
	                      if(newHour > 12)
	                      {
		                         newHour = newHour - 12;
		                         newTT = 'PM';
	                      }
		                  if(newHour == 12)
	                      {
		                         newHour = 12;
		                         newTT = 'PM';
		                  }

	                      if(newHour < 10){
	                         newHour ='0'+newHour;
	                      }

	                      if(newMins < 10){
	                         newMins ='0'+newMins;
	                      }

	                    ConvertTimeformat("24", newHour+':'+newMins+' '+newTT);
	                    // $('.merchant_opening_time').val(merchant_timings_1[0]);
	                     return ;
	                }
	                else if((current_date_time>=merchant_open)&&(current_date_time<=merchant_close))
	                {

	          			  var temp_time = Date.parse(current_time, "hh:mm tt");
	                      var time      = Date.parse(current_time, "hh:mm tt");
	                      var temp_newtime = temp_time.addMinutes(50);

	                      if(temp_newtime>merchant_close)
	                      {
	                       var newtime = time.addMinutes(0);
	                      }
	                      else
	                      {
	                        var newtime = time.addMinutes(45);
	                      }
	                      // var newtime = time.addMinutes(0);
	                      var newHour = newtime.getHours();
	                      var newMins = newtime.getMinutes();
	                      var newTT = 'AM';
	                      if(newHour > 12)
	                      {
		                         newHour = newHour - 12;
		                         newTT = 'PM';
	                      }
		                  if(newHour == 12)
	                      {
		                         newHour = 12;
		                         newTT = 'PM';
		                  }

	                      if(newHour < 10){
	                         newHour ='0'+newHour;
	                      }

	                      if(newMins < 10){
	                         newMins ='0'+newMins;
	                      }
	                      // alert(newHour+':'+newMins+' '+newTT);       */
	                     ConvertTimeformat("24",newHour+':'+newMins+' '+newTT);
	                     return ;
	                }


	        }
	        }


	}



  function displayCart(data)
  {
	removeStorage("discnt_prce");
	removeStorage("discnt_prce_pretty");  	 
      // display merchant logo
      // alert(data.toSource());
      var cd = new Date();
      // alert(cd);
      // var jersey_time = (moment().tz("Europe/Jersey").format('YYYY-MM-DD HH:mm:ss'));
      var jersey_time = moment().tz("Europe/Jersey").add('m', 45).format('hh:mm A');

      // var test = formatAMPM(cd);		11-08-2017

      //var ccurrent_year = d.getFullYear();
      //var twentyMinutesLater = new Date();

      /* cd.setMinutes(cd.getMinutes() + 45);
      h = cd.getHours() >= 12 ? 'PM' : 'AM';
      var minutes = ('0' + cd.getMinutes()).slice(-2);  11-08-2017 */

      // $(".delivery_time").val(cd.getHours()+":"+(parseInt(minutes)+1)+" "+h); 11-08-2017

      $(".delivery_time").val(jersey_time);
      initMobileScroller();

      //  alert($(".delivery_time").val());

      check_date_time();

      // display merchant logo
      // alert(data.toSource());
      displayMerchantLogo(data, 'page-cart');

      var htm = '';

      htm += '<input type="hidden" name="validation_msg" class="validation_msg" value="' + data.validation_msg + '">';
      htm += '<input type="hidden" name="required_time" class="required_time" value="' + data.required_time + '">';

      /*set storage merchant logo*/
      setStorage("merchant_logo", data.merchant_info.logo);
      setStorage("order_total", data.cart.grand_total.amount_pretty);


      setStorage("order_total_raw", data.cart.grand_total.amount);
      setStorage("cart_currency_symbol", data.currency_symbol);

      /*for pts computation refference*/
      setStorage("cart_sub_total", data.cart.sub_total.amount);
      setStorage("cart_sub_total_pretty", data.cart.sub_total.amount_pretty);
      if (!empty(data.cart.delivery_charges))
      {
          setStorage("cart_delivery_charges", data.cart.delivery_charges.amount);
      }
      if (!empty(data.cart.packaging))
      {
          setStorage("cart_packaging", data.cart.packaging.amount);
      }
      if (!empty(data.cart.tax))
      {
          //setStorage("cart_tax_amount", data.cart.tax.amount );
          setStorage("cart_tax", data.cart.tax.tax);
      }

      if (!empty(data.delivery_date))
      {
          $(".delivery_date").val(data.delivery_date);
      }


      if (!empty(data.delivery_time))
      {
          $(".delivery_time").val(data.delivery_time);
      }


      if (!empty(data.cart))
      {

          if (!empty(data.cart.grand_total.amount_pretty))
          {
              $(".total-amount").html(data.cart.grand_total.amount_pretty);
          }




          var xx = 1;

          var same_item = new Object();
          var itm_qtys;
          var arr = [];

          //alert(data.cart.cart.toSource());

          $.each(data.cart.cart, function(key, val)
          {          	 
              if (empty(val.sub_item))
              {
                  if (jQuery.inArray(val.item_id, arr) !== -1)
                  {
                      //same_item[val.item_id][];

                      same_item[val.item_id]['item_qty'] = parseFloat(same_item[val.item_id]['item_qty']) + parseFloat(val.qty);
                      //same_item[val.item_id]['item_price'] = parseFloat(same_item[val.item_id]['item_price']) + parseFloat(val.price);
                      same_item[val.item_id]['item_total_pretty'] = parseFloat(same_item[val.item_id]['item_total_pretty']) + parseFloat(val.total_pretty.replace(/[^0-9 .]/g, ''));
                  }
                  else if (val.item_id == val.item_id)
                  {
                      arr.push(val.item_id);
                      same_item[val.item_id] = {
                          'item_id': val.item_id,
                          'item_qty': val.qty,
                          'item_name': val.item_name,
                          'item_price': val.price,
                          'item_size': val.size,
                          'item_total_pretty': val.total_pretty.replace(/[^0-9 .]/g, ''),
                          'item_discounted_price': val.discounted_price,
                          'item_discount': val.discount,
                      };
                  }
              }

              if (!empty(val.sub_item))
              {
                  if (val.discount > 0)
                  {
                      htm += tplCartRowNoBorder(
                          val.item_id,
                          val.item_name,
                          val.price + '|' + val.size,
                          val.total_pretty,
                          val.qty,
                          'price',
                          val.size,
                          xx,
                          val.discounted_price,
                          val.discount
                      );

                  }
                  else
                  {
                      //htm+=tplCartRowNoBorder(same_item[val.item_id]['item_id'],same_item[val.item_id]['item_name'],same_item[val.item_id]['item_price']+'|'+same_item[val.item_id]['item_price'],same_item[val.item_id]['item_total_pretty'],same_item[val.item_id]['item_qty'],'price',same_item[val.item_id]['item_size'],xx,same_item[val.item_id]['item_price'],same_item[val.item_id]['item_discount']);
                      htm += tplCartRowNoBorder(
                          val.item_id,
                          val.item_name,
                          val.price + '|' + val.size,
                          val.total_pretty,
                          val.qty,
                          'price',
                          val.size,
                          xx,
                          val.price,
                          val.discount
                      );
                  }
              }


              if (!empty(val.order_notes))
              {
                  htm += tplCartRowHiddenFields(val.order_notes,
                      val.order_notes,
                      'order_notes',
                      xx,
                      'row-no-border');
              }

              if (!empty(val.cooking_ref))
              {
                  htm += tplCartRowHiddenFields(val.cooking_ref,
                      val.cooking_ref,
                      'cooking_ref',
                      xx,
                      'row-no-border');
              }

              if (!empty(val.ingredients))
              {
                  htm += '<ons-list-header class="subitem-row' + xx + '">Ingredients</ons-list-header>';
                  $.each(val.ingredients, function(key_ing, val_ing)
                  {
                      htm += tplCartRowHiddenFields(val_ing, val_ing, 'ingredients', xx, 'row-no-border');
                  });
              }

              /*if (!empty(val.sub_item)){
  			 	 var x=0
  				 $.each( val.sub_item , function( key_sub, val_sub ) {
  				 	 if (x==0){
  				 	     htm+='<ons-list-header>'+val_sub.category_name+'</ons-list-header>';
  				 	 }
  				 	 htm+=tplCartRowNoBorderSub(
  				 	        val_sub.sub_item_id,
  				 	        val_sub.sub_item_name,
  				 	        val_sub.price,
  				 	        val_sub.total_pretty,
  				 	        val_sub.qty ,
  				 	        'sub_item',
  				 	        xx
  				 	        );
  				 	 x++;
  				 });
  			 }*/

              /*sub item*/
              if (!empty(val.sub_item))
              {
                  var x = 0;
                  $.each(val.sub_item, function(key_sub, val_sub)
                  {
                      htm += '<ons-list-header class="subitem-row' + xx + '">' + key_sub + '</ons-list-header>';
                      $.each(val_sub, function(key_sub2, val_sub2)
                      {
                          dump(val_sub2);
                          if (val_sub2.qty == "itemqty")
                          {
                              subitem_qty = val.qty;
                          }
                          else
                          {
                              subitem_qty = val_sub2.qty;
                          }

                          htm += tplCartRowNoBorderSub(
                              val_sub2.subcat_id,
                              val_sub2.sub_item_id,
                              val_sub2.sub_item_name,
                              val_sub2.price,
                              val_sub2.total_pretty,
                              subitem_qty,
                              val_sub2.qty,
                              xx
                          );
                          x++;
                      });
                  });
              }
              if (!empty(val.sub_item))
              {
                  htm += '<ons-list-item class="grey-border-top line-separator"></ons-list-item>';
              }
              xx++
          });
		 	

          $.each(arr, function(key, val)
          {
              console.log(arr.length);
              htm += tplCartRowNoBorder(
                  same_item[val]['item_id'],
                  same_item[val]['item_name'],
                  same_item[val]['item_price'] + '|' + same_item[val]['item_size'],
                  getStorage("currency_set") + parseFloat(same_item[val]['item_total_pretty']).toFixed(2),
                  same_item[val]['item_qty'],
                  'price',
                  same_item[val]['item_size'],
                  xx,
                  same_item[val]['item_price'],
                  same_item[val]['item_discount']
              );
              htm += '<ons-list-item class="grey-border-top line-separator"></ons-list-item>';
              xx++;
          });
          console.log(JSON.stringify(same_item));
          console.log(arr);

          var cnts_deal = data.cart.deals_content;
          if (cnts_deal.length > 0)
          {
              //deal_cart=[];
              //  deal_cart = new Object();

              //  deal_cart=new object();
              var xxy = 1;
              //  alert(data.cart.deals_content.toSource());

              $.each(data.cart.deals_content, function(key, val)
              {
                  // alert(val.toSource());
                  var size_details = val.size;
                  var multi_size_free = 'false';
                  var item_size_check = new Array();
                  if (deal_cart[val.item_id])
                  {
                      /* alert("1");
                   	if(deal_cart[val.item_id].length>0)
	              	{
	              		alert("2");
	              		alert(deal_cart[val.item_id]['size_details']); */
	              	if (jQuery.inArray(val.size,item_size_check[val.item_id]) !== -1)
            		{		
                      deal_cart[val.item_id]['size_details'] = deal_cart[val.item_id]['size_details'] + "||" + val.size;
                      deal_cart[val.item_id]['price_details'] = deal_cart[val.item_id]['price_details'] + "||" + val.price;
                      deal_cart[val.item_id]['multi_size_free'] = 'true';
                      // }
                    }
                  }
                  else
                  {

                  	 item_size_check[val.item_id]= new Array();
                  	 item_size_check[val.item_id].push(val.size);
 
		
                  	//  item_size_check[val.item_id]=val.size;
                  	   
                      deal_cart[val.item_id] = {
                          'item_id': val.item_id,
                          'item_name': val.item_name,
                          'size_words': val.size,
                          "qty": val.qty,
                          'normal_price': val.price,
                          "discounted_price": val.discounted_price,
                          "size_details": size_details,
                          "multi_size_free": multi_size_free,
                          "price_details": val.price,
                          "free_type": "BOGO",
                      };
                  }



                  var deal_params = JSON.stringify(deal_cart);
                  if (val.discount > 0)
                  {

                      htm += tplCartRowNoBorderDeal(
                          val.item_id,
                          val.item_name,
                          val.price + '|' + val.size,
                          val.total_pretty,
                          val.qty,
                          'price',
                          val.size,
                          xxy,
                          val.discounted_price,
                          val.discount
                      );
                  }
                  else
                  {
                      htm += tplCartRowNoBorderDeal(
                          val.item_id,
                          val.item_name,
                          val.price + '|' + val.size,
                          val.total_pretty,
                          val.qty,
                          'price',
                          val.size,
                          xxy,
                          val.price,
                          val.discount
                      );
                  }



                  if (!empty(val.order_notes))
                  {
                      htm += tplCartRowHiddenFields(val.order_notes,
                          val.order_notes,
                          'order_notes',
                          xxy,
                          'row-no-border');
                  }

                  if (!empty(val.cooking_ref))
                  {
                      htm += tplCartRowHiddenFields(val.cooking_ref,
                          val.cooking_ref,
                          'cooking_ref',
                          xxy,
                          'row-no-border');
                  }

                  if (!empty(val.ingredients))
                  {
                      htm += '<ons-list-header class="subitem-row' + xxy + '">Ingredients</ons-list-header>';
                      $.each(val.ingredients, function(key_ing, val_ing)
                      {
                          htm += tplCartRowHiddenFields(val_ing, val_ing, 'ingredients', xxy, 'row-no-border');
                      });
                  }

                  /*if (!empty(val.sub_item)){
                    var x=0
                    $.each( val.sub_item , function( key_sub, val_sub ) {
                      if (x==0){
                          htm+='<ons-list-header>'+val_sub.category_name+'</ons-list-header>';
                      }
                      htm+=tplCartRowNoBorderSub(
                             val_sub.sub_item_id,
                             val_sub.sub_item_name,
                             val_sub.price,
                             val_sub.total_pretty,
                             val_sub.qty ,
                             'sub_item',
                             xx
                             );
                      x++;
                    });
                  }*/

                  /*sub item*/
                  if (!empty(val.sub_item))
                  {
                      var x = 0;
                      $.each(val.sub_item, function(key_sub, val_sub)
                      {
                          htm += '<ons-list-header class="subitem-row' + xxy + '">' + key_sub + '</ons-list-header>';
                          $.each(val_sub, function(key_sub2, val_sub2)
                          {
                              dump(val_sub2);
                              if (val_sub2.qty == "itemqty")
                              {
                                  subitem_qty = val.qty;
                              }
                              else
                              {
                                  subitem_qty = val_sub2.qty;
                              }

                              htm += tplCartRowNoBorderSubDeal(
                                  val_sub2.subcat_id,
                                  val_sub2.sub_item_id,
                                  val_sub2.sub_item_name,
                                  val_sub2.price,
                                  val_sub2.total_pretty,
                                  subitem_qty,
                                  val_sub2.qty,
                                  xxy
                              );
                              x++;
                          });
                      });
                  }

                  htm += '<ons-list-item class="grey-border-top line-separator"></ons-list-item>';
                  xxy++;
              });
          }
          if (!empty(data.free_item_list))
          {
              //deal_cart=[];
              //deal_cart = new Object();
              // alert(data.free_item_list.toSource());
              $.each(data.free_item_list, function(key, val)
              {
                  deal_cart[val.item_id] = {
                      'item_id': val.item_id,
                      'item_name': val.item_name,
                      'size_words': "",
                      "qty": val.qty,
                      'normal_price': val.normal_price,
                      "discounted_price": val.discounted_price,
                      "free_type": val.free_type,
                  };
                  var deal_params = JSON.stringify(deal_cart);
                  //console.log(deal_params);
                  htm += '<ons-list-item class="price-normal list__item ons-list-item-inner"><ons-row class="row ons-row-inner"><ons-col class="concat-text col ons-col-inner" width="70%" style="-moz-box-flex: 0; flex: 0 0 70%; max-width: 70%;"><p class="description item-name concat-text">' + val.item_name + '</p></ons-col><ons-col class="text-right col ons-col-inner"><price>' + val.normal_price + '</price></ons-col></ons-row></ons-list-item>';
                  htm += '<ons-list-item class="grey-border-top line-separator"></ons-list-item>';
              });
              htm += '<ons-list-item class="line-separator"></ons-list-item>';
          }

          if (!empty(data.cart.sub_total))
          {
              htm += tplCartRow(getTrans('Sub Total', 'sub_total'), data.cart.sub_total.amount_pretty, 'price-normal');
          }
          if (!empty(data.cart.discount))
          {

              var dicnt = data.cart.discount.display.replace(/[^0-9 .]/g, '');
              setStorage("discnt_prce", data.cart.discount.display);
              setStorage("discnt_prce_pretty", data.cart.discount.amount_pretty);
              discount_applied = [];
              console.log(dicnt);
              discount_applied[discount_applied.length] = {
                  'discount_percentage': dicnt,
                  'discount_price': data.cart.discount.amount,
                  'free_type': "discount",
              };

              var discnt_params = JSON.stringify(discount_applied);

              setStorage("has_disc_price", data.cart.discount.amount);

              console.log(data.cart.discount.amount);
              htm += tplCartRow(data.cart.discount.display, '(' + data.cart.discount.amount_pretty + ')', 'price-normal');
          }

          if (!empty(data.cart.delivery_charges))
          {
              htm += tplCartRow(getTrans('Delivery Fee', 'delivery_fee'), data.cart.delivery_charges.amount_pretty, 'price-normal');
          }
          if (!empty(data.cart.packaging))
          {
              htm += tplCartRow(getTrans('Packaging', 'packaging'), data.cart.packaging.amount_pretty, 'price-normal');
          }
          if (!empty(data.cart.tax))
          {
              htm += tplCartRow(data.cart.tax.tax_pretty, data.cart.tax.amount, 'price-normal');
          }

          if (!empty(data.cart.tips))
          {
              htm += tplCartRow(data.cart.tips.tips_percentage_pretty, data.cart.tips.tips_pretty, 'price-normal');
              $(".tip_amount").removeClass("trn");
              $(".tip_amount").html(data.cart.tips.tips_percentage_pretty);
          }
          else
          {
              $(".tip_amount").addClass("trn");
              $(".tip_amount").html(getTrans("Tip Amount", "tip_amount"));
          }

          if (!empty(data.cart.grand_total))
          {
              var deals_data = data.cart.deals_content;
              if (deals_data.length > 0)
              {
                  htm += tplCartRow('<b class="trn" data-trn-key="total">Total</b> (Deals applied)', data.cart.grand_total.amount_pretty);
                  setStorage("total_amount_final", data.cart.grand_total.amount);
              }
              else
              {
                  htm += tplCartRow('<b class="trn" data-trn-key="total">Total</b>', data.cart.grand_total.amount_pretty);
                  setStorage("total_amount_final", data.cart.grand_total.amount);
              }
          }

      }

      var transaction_type = getStorage("transaction_type");
      if (empty(transaction_type))
      {
          transaction_type = 'delivery';
      }
      dump("transaction_type=>" + transaction_type);
      setStorage('transaction_type', transaction_type);

      htm += '<ons-list-header class="trn" data-trn-key="delivery_options">Delivery Options</ons-list-header>';
      /*htm+=privateRowWithRadio('transaction_type','delivery','Delivery');
      htm+=privateRowWithRadio('transaction_type','pickup','Pickup');*/

      /*fixed transaction type*/

      dump("services =>" + data.merchant_info.service);

      switch (data.merchant_info.service)
      {
          case 2:
          case "2":
              htm += privateRowWithRadio('transaction_type', 'delivery', getTrans('Delivery', 'delivery'));
              break;

          case 3:
          case "3":
              transaction_type = 'pickup';
              setStorage('transaction_type', transaction_type);
              htm += privateRowWithRadio('transaction_type', 'pickup', getTrans('Pickup', 'pickup'));
              break;

          default:
              htm += privateRowWithRadio('transaction_type', 'delivery', getTrans('Delivery', 'delivery'));
              htm += privateRowWithRadio('transaction_type', 'pickup', getTrans('Pickup', 'pickup'));
              break;
      }

      createElement('cart-item', htm);

      //$('.transaction_type[value="' + transaction_type + '"]').prop('checked', true);
      $.each($(".transaction_type"), function()
      {
          if ($(this).val() == transaction_type)
          {
              $(this).attr("checked", true);
          }
      });

      if (transaction_type == "delivery")
      {
          $(".delivery_time").attr("placeholder", getTrans("Delivery Time", 'delivery_time'));
          $(".delivery_asap_wrap").show();
      }
      else
      {
          $(".delivery_time").attr("placeholder", getTrans("Pickup Time", 'pickup_time'));
          $(".delivery_asap_wrap").hide();
      }


      /*loyalty points*/
      if (data.has_pts == 2)
      {
          setStorage("earned_points", data.points);
          $(".pts_earn_label").show();
          $(".pts_earn_label").html(data.points_label);
      }
      else
      {
          $(".pts_earn_label").hide();
          removeStorage("earned_points");
      }

      initMobileScroller();
      translatePage();
  }

function formatAMPM(date) {
var hours = date.getHours();
var minutes = date.getMinutes();
 var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
// the hour '0' should be '12'
minutes = minutes < 10 ? '0'+minutes : minutes;
var strTime = hours + ':' + minutes + ' ' + ampm;
return strTime;
}

function editOrderInit()
{
	$("#page-cart .numeric_only").show();
	$(".order-apply-changes").show();
	$(".edit-order").hide();
	$(".qty-label").hide();
	$(".row-del-wrap").show();

	var x=1;
	$.each( $(".item-qty") , function( key, val ) 
	{		 
		$.each( $(".subitem-qty"+x) , function( key2, val2 ) {			  
			if ( $(this).data("qty")!="itemqty")
			{
				$(this).show();
			}
		});
		x++;
	});
}


function cartempty()
{
	cart = [] ;
  console.log(discnt_params);
  console.log(deal_params);
  discnt_params="";
  deal_params="";

	var cartnum=$("#menucategory-page .cart-num").html("0");
	callAjax("Clearcart","merchant_id="+ getStorage('merchant_id')+ "&clearcart=clear&device_id="+getStorage("device_id"));
	//sNavigator.popPage({cancelIfRunning: true});
}

function applyCartChanges()
{
	$("#page-cart .numeric_only").hide();
	$(".order-apply-changes").hide();
	$(".edit-order").show();
	$(".qty-label").show();
	$(".subitem-qty").hide();
	$(".row-del-wrap").hide();

	dump( "qty L=>"+ $(".item-qty").length );
  if (!empty( $(".item-qtys") )){
    if($(".item_id1").val() == $("#deals_app .item_id1").val())
    {
      var updated_qty=$(".item-qty").val();
      console.log($("#deals_app .item-qtys").val(updated_qty));
    }
  }
	if (!empty( $(".item-qty") )){
		cart=[];
		var x=1;
		$.each( $(".item-qty") , function( key, val ) 
		{
		      if($(".item-qty .deals"))
		      {
		            console.log("ok");
		      }
			var x=$(this).data("rowid");
			dump("rowid=>"+x);			 

			var sub_item=[];
			var ingredients=[];
			var cooking_ref=[];
			var order_notes='';
			var discount='';

			/*$.each( $(".subitem-qty"+x) , function( key2, val2 ) {
				sub_item[sub_item.length]={
				  'value': $(".sub_item_id"+x).val() + "|" + $(".sub_item_price"+x).val() +'|' + $(".sub_item_name"+x).val()
			    };
			});*/

			if ( $(".ingredients"+x).exists() ){
		    	ingredients[ingredients.length]={
		    		'value': $(".ingredients"+x).val()
		    	};
		    }

		    if ( $(".cooking_ref"+x).exists() ){
		    	cooking_ref[cooking_ref.length]={
		    		'value': $(".cooking_ref"+x).val()
		    	};
		    }

		    if ( $(".order_notes"+x).exists() ){
		    	/*order_notes[order_notes.length]={
		    		'value': $(".order_notes"+x).val()
		    	};*/
		    	order_notes=$(".order_notes"+x).val();
		    }

		    /*get sub item*/
		    $.each( $(".subitem-qty"+x) , function( key2, val2 ) 
		    {		    	 
		    	 subqty = $(this).data("qty");
		    	 if ( $(this).data("qty") != "itemqty"){
		    	 	subqty = $(this).val();
		    	 }
		    	 var parent=$(this).parent().parent();
		    	 var subcat_id=parent.find(".subcat_id").val();
		    	 var subcat_value= parent.find(".sub_item_id").val()+'|'+
		    	 parent.find(".sub_item_price").val()+'|'+parent.find(".sub_item_name").val();

		    	 sub_item[sub_item.length]={
		    	 	 'qty':subqty,
		    	 	 'subcat_id': subcat_id ,
		    	 	 'value': subcat_value
		    	 };
		    	  
		    });
			cart[cart.length]={
			   'item_id':$(".item_id"+x).val(),
			   'qty': $(this).val(),
			   'price': $(".price"+x).val(),
			   "sub_item":sub_item,
			   'cooking_ref': cooking_ref ,
			   "ingredients":ingredients,
			   "order_notes":order_notes,
			   "discount":$(".discount"+x).val(),
			};
			x++;
		});

		dump('updated cartx');
		dump(cart);		 
		// alert(cart.toSource());
		var cart_params=JSON.stringify(cart);
		// alert(cart_params);
		// return;
		var extra_params= "&delivery_date=" +  $(".delivery_date").val();
		if ( !empty($(".delivery_time").val()) ){
			extra_params+="&delivery_time="+$(".delivery_time").val();
		}

		if ( empty(getStorage("tips_percentage")) ){
	       setStorage("tips_percentage",0);
	    }


      	callAjax("loadCart","merchant_id="+ getStorage('merchant_id')+"&search_address=" +
      	  encodeURIComponent(getStorage("search_address")) + "&update_cart="+ encodeURIComponent(cart_params) +"&transaction_type=" +
      	  getStorage("transaction_type") + extra_params  + "&device_id="+ getStorage("device_id") +"&tips_percentage=" + getStorage("tips_percentage") );

	}
}

function checkOut()
{

	var validation_msg=$(".validation_msg").val();
	dump(validation_msg);
	dump(cart);
	if ( cart.length<1){
		onsenAlert( getTrans("Your cart is empty",'your_cart_is_empty') );
		return;
	}

	if ( validation_msg!="" ){
		dump('d2');
		onsenAlert(validation_msg);
		return;
	}

	//var tr_type=getStorage("transaction_type");
	var tr_type = $(".transaction_type:checked").val();
  setStorage("transaction_type" , tr_type);
  $("#page-shipping #search-text").html("");
  $("#page-shipping #delivery_instruction").hide();
	dump("tr_type=>"+tr_type);

	if ( tr_type =="pickup"){
		if ( $(".delivery_time").val()==""){
			onsenAlert(  getTrans("Please give the collection time",'pickup_time_is_required') );
			return;
		}
	}

	if ( $(".required_time").val()==2){
		if ( $(".delivery_time").val() ==""){
			if ( $(".delivery_asap:checked").length<=0){
				onsenAlert( tr_type+ " "+ getTrans('Time is required','time_is_required') );
				return;
			}
		}
	}

    var extra_params= "&delivery_date=" +  $(".delivery_date").val();
	if ( !empty($(".delivery_time").val()) ){
		extra_params+="&delivery_time="+$(".delivery_time").val();
	}

	extra_params+="&delivery_asap="+ $(".delivery_asap:checked").val();

	extra_params+="&client_token="+getStorage("client_token");
	 extra_params+="&merchant_is_open="+getStorage("merchant_is_open");
	//extra_params+="&transaction_type2=" + $(".transaction_type:checked").val();

    callAjax("checkout","merchant_id="+ getStorage('merchant_id')+"&search_address=" +
      	  encodeURIComponent(getStorage("search_address")) + "&transaction_type=" +
      	  getStorage("transaction_type") + extra_params );
}

function clientRegistration()
{
  if(isLogin())
  {
    onsenAlert("You are already logged in");
    sNavigator.popPage({cancelIfRunning: true}); //back button
  }
  else{
	var pswd = $("#pswd").val();
  var cfpswd = $("#cpswd").val();
	var fname = $("#fname").val();
	var lname = $("#lname").val();
	var email=$("#email").val();
	var mbno=$("#mbno").val();
	function isValidEmailAddress(email) {
		var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
		return pattern.test(email);
	};
	if($('#frm-checkoutsignup input[type="text"]').val() =='')
	{
		onsenAlert("All fields are mandatory");
    }
    else if(fname == ''){
  			onsenAlert("First Name is mandatory");
  	}
    else if(fname.length < 4 ){
        onsenAlert("First Name should be minimum 4 characters");
    }
    else if(lname == ''){
  			onsenAlert("Last Name is mandatory");
  	}
	else if(email == ''){
			onsenAlert("Email ID is mandatory");
	}
	else if( !isValidEmailAddress( email ) ) {
		onsenAlert("Invalid Email ID");
	}
	else if(pswd == "")
	{
		onsenAlert("Password field should not be empty.");
	}
  else if(cpswd == "")
	{
		onsenAlert("Password field should not be empty.");
	}
	else if(pswd.length < 8)
	{
		onsenAlert("Password must be 8 characters or more");
	}
  else if(cpswd.length < 8)
	{
		onsenAlert("Password must be 8 characters or more");
	}
  else if(pswd !== cfpswd)
  {
    onsenAlert("Password and confirm password does not match.");
  }
	else if(email=="")
	{
		onsenAlert("Email field should not be empty.");
	}
	else{
	$.validate({
	    form : '#frm-checkoutsignup',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {

	      if ($('.iagree-wrap').is(':visible')) {
		      var iagree = $(".iagree:checked").val();
		      if(empty(iagree)){
		      	 onsenAlert( getTrans("Please select and agree terms & conditions",'agree_terms') );
		      	 return;
		      }
	      }

	      // save mobile number
	      setStorage("customer_contact_number",  $(".contact_phone").val()  );

	      var params = $( "#frm-checkoutsignup").serialize();
	      params+="&transaction_type=" +  getStorage("transaction_type") ;
	      params+="&device_id="+ getStorage("device_id");
	      callAjax("signup",params);
	      return false;
	    }
	});
}
}
}

function clientShipping()
{
  if($(".guest_check").is(":checked"))  
  {
    var guest_pass=$("#guest_password_val").val();
    if(guest_pass == "")
    {
      onsenAlert("Password should not be empty");
      return false;
    }
    else if(guest_pass.length < 8)
    {
      onsenAlert("Password must be 8 characters or above");
  		return false;
    }
    else{
	$(".street").val( $(".stree_1").val()  );
	$(".city").val( $(".city_1").val()  );
	$(".state").val( $(".state_1").val()  );
	$(".zipcode").val( $(".zipcode_1").val()  );

	//if ( empty( $(".street").val() )){
	if (empty($(".city").val() )){

		onsenAlert(getTrans("Address is not complete.Try again",'delivery_address_required')  );
		// toastMsg( getTrans() );
		return;
	}

	$.validate({
	    form : '#frm-shipping',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	       var params = $( "#frm-shipping").serialize();
	       setStorage('shipping_address',params);
	       dump(params);
	       var options = {
		      animation: 'slide',
		      onTransitionEnd: function() {
		      	  displayMerchantLogo2(
		      	     getStorage("merchant_logo") ,
		      	     getStorage("order_total") ,
		      	     'page-paymentoption'
		      	  );
					var params="merchant_id="+ getStorage("merchant_id");				   	
		      	  params+="&street="+$(".street").val();
		      	  params+="&city="+$(".city").val();
		      	  params+="&state="+$(".state").val();
		      	  params+="&zipcode="+$(".zipcode").val();
		      	  params+="&location_name="+$(".location_name").val();
		      	  params+="&save_address="+$('.save_address:checked').val();
		      	  params+="&transaction_type=" +  getStorage("transaction_type") ;
		      	  params+="&client_token="+ getStorage('client_token');

		      	  callAjax("getPaymentOptions",params);
		      }
		    };
		    sNavigator.pushPage("paymentOption.html", options);
	       return false;
	    }
	});
}
}
else{
	 
$(".location_name").val($(".location_name").val());
$(".street").val( $(".stree_1").val()  );
$(".city").val( $(".city_1").val()  );
$(".state").val( $(".state_1").val()  );
$(".zipcode").val( $(".zipcode_1").val()  );

//if ( empty( $(".street").val() )){
if (empty($(".city").val() )){

onsenAlert(getTrans("Address is not complete.Try again",'delivery_address_required')  );
// toastMsg( getTrans() );
return;
}

$.validate({
  form : '#frm-shipping',
  borderColorOnError:"#FF0000",
  onError : function() {
  },
  onSuccess : function() {
	 var params = $( "#frm-shipping").serialize();
	  
     setStorage('shipping_address',params);
     dump(params);
     var options = {
      animation: 'slide',
      onTransitionEnd: function() {
          displayMerchantLogo2(
             getStorage("merchant_logo") ,
             getStorage("order_total") ,
             'page-paymentoption'
          );
          var params="merchant_id="+ getStorage("merchant_id");
          params+="&street="+$(".street").val();
          params+="&city="+$(".city").val();
          params+="&state="+$(".state").val();
          params+="&zipcode="+$(".zipcode").val();
          params+="&location_name="+$(".location_name").val();
          params+="&save_address="+$('.save_address:checked').val();
          params+="&transaction_type=" +  getStorage("transaction_type") ;
          params+="&client_token="+ getStorage('client_token');

          callAjax("getPaymentOptions",params);
      }
    };
    sNavigator.pushPage("paymentOption.html", options);
     return false;
  }
});
}
}
function displayPaymentOptions(data)
{
	var htm='';
	$.each( $(data.details.payment_list) , function( key, val ) {
		dump(val);
		htm+=tplPaymentList('payment_list', val.value, val.label, val.icon);
	});
	createElement('payment-list',htm);

	var htm='';
	if (data.details.pay_on_delivery_flag==1){
		$.each( $(data.details.pay_on_delivery_list) , function( key, val ) {
		    dump(val);
		    htm+=tplPaymentProvider('payment_provider_name', val.payment_name, val.payment_name, val.payment_logo);
	    });
	    createElement('payon-deliver-list',htm);
	}

}

function placeOrder()
{
  console.log(getStorage("final_total_amnt"));
  console.log($(".frm-paymentoption").serialize());
	if ( $('.payment_list:checked').length > 0){

		var selected_payment=$('.payment_list:checked').val();
		dump(selected_payment);
		if ( selected_payment=="pyr"){
			dump( $('.payment_provider_name:checked').length );
			if ( $('.payment_provider_name:checked').length <= 0){
				onsenAlert( getTrans("Please select a payment method",'please_select_payment_provider') );
				return;
			}
		}

		if ( selected_payment=="ocr"){
			if ( empty( getStorage("cc_id") )){
				onsenAlert( getTrans("Please select credit card",'please_select_cc') );
				return;
			}
		}


		var params = $( "#frm-paymentoption").serialize();
		var cart_params = JSON.stringify(cart);
		//alert(cart_params.toSource());
		if ( saveCartToDb() ){
			cart_params='';
		}

		var extra_params= "&delivery_date=" +  $(".delivery_date").val();
		if ( !empty($(".delivery_time").val()) ){
			extra_params+="&delivery_time="+$(".delivery_time").val();
		}

    var deal_params=JSON.stringify(deal_cart);
    console.log(deal_params);
    // alert(deal_params.toSource());
    // return ;
    var discnt_params=JSON.stringify(discount_applied);
		extra_params+="&delivery_asap="+ $(".delivery_asap:checked").val();
		extra_params+="&formatted_address="+ $(".formatted_address").val();
		extra_params+="&google_lat="+ $(".google_lat").val();
		extra_params+="&google_lng="+ $(".google_lng").val();
    extra_params+="&deals_params="+deal_params;
    extra_params+="&discount_details="+discnt_params;
		//extra_params+="&payment_method="+ $(".payment_list:checked").val();
		//extra_params+="&order_change="+ $(".order_change").val();
		extra_params+="&"+getStorage("shipping_address") ;
		extra_params+="&client_token="+ getStorage('client_token');
		extra_params+="&search_address="+ urlencode(getStorage('search_address'));
		/*pts*/
		extra_params+="&earned_points="+ getStorage('earned_points');
		extra_params+="&device_id="+ getStorage('device_id');
		extra_params+="&"+params;
    var f=getStorage("final_total_amnt").replace(/[^0-9 .]/g, '');
    extra_params+="&bill_total="+f;
		/* City pay details by navaneeth */

		extra_params+="&citypay_mode="+ getStorage('citypay_mode');
		extra_params+="&citypay_username="+ getStorage('citypay_username');
		extra_params+="&citypay_password="+ getStorage('citypay_password');
		extra_params+="&citypay_fee"+ getStorage('citypay_fee');

		/*tips*/
		if ( empty(getStorage("tips_percentage")) ){
	        setStorage("tips_percentage",0);
	    }
	    extra_params+="&tips_percentage="+ getStorage('tips_percentage');

	    if ( selected_payment=="ocr"){
	    	extra_params+="&cc_id="+ getStorage('cc_id');
	    }
console.log(cart_params);
console.log(extra_params);

      	callAjax("placeOrder","merchant_id="+ getStorage('merchant_id') +
      	  "&cart="+ urlencode(cart_params) +
      	  "&transaction_type=" +
      	  getStorage("transaction_type") + extra_params );

	} else {
		onsenAlert( getTrans("Please select a payment method",'please_select_payment_method') );
	}
}

/*sliding menu*/
ons.ready(function() {
  menu.on('preopen', function() {
       //console.log("Menu page is going to open");

       if (isLogin()){
       	   dump('logon ok');

       	   var pts = getStorage("pts");
           console.log(pts);
	       dump("pts=>"+pts);
	       if(pts!=2){
	       	  $(".menu-pts").hide();
	       } else {
	       	  $(".menu-pts").css({"display":"block"});
	       }

       	   $(".logout-menu").css({"display":"block"});

       	   var avatar=getStorage("avatar");
       	   dump("avatar=>"+avatar);
       	   if(!empty(avatar)){
       	   	   dump('fillavatar');
	       	   $(".profile-pic-wrap").show();
	       	   $(".avatar").attr("src", getStorage("avatar") );
	       	   $(".avatar-right").html( "Hi, "+ getStorage("client_name_cookie") );
	       	   $(".avatar-wrap-menu div").addClass("img_loaded");
       	   }
           else{
                 $("#welcome_msg").html("");
                 $(".logout-menu").hide();
                  $(".menu-pts").hide();
           }

       } else {
       	   dump('logon not');
       	   $(".logout-menu").hide();
       	   $(".profile-pic-wrap").hide();
           $("#welcome_msg").hide();
       	   $(".menu-pts").hide();
       }

       translatePage();

  });
  menu.on('postopen', function() {
      dump('menu is open');
      imageLoaded('.img_loaded');
  });
});



function initMobileScroller()
{


	if ( $('.date_booking').exists()){
		var now = new Date();
		var until = new Date(now.getFullYear(), now.getMonth() +3,now.getDate);

		$('.date_booking').mobiscroll().date({
			theme: 'android-holo',
      lang: 'en-UK',
			mode: "scroller",
			display: "modal",
			dateFormat : "dd.mm.yy",
			 min: now,
			 minWidth: 100,
			 max: until,
			onSelect: __datetimeOnSelectDelegate
		});
	}

  $('.delivery_time').mobiscroll().time({
         	theme: 'android-holo',
          lang: 'en-UK',
          mode: "scroller",
    			display: "modal",
          headerText: false,
          maxWidth: 90
     });
     $('.delivery_date').mobiscroll().date({
 			theme: 'android-holo',
      lang: 'en-UK',
 			mode: "scroller",
 			display: "modal",
 			dateFormat : "yy-mm-dd",
 			 min: now,
 			 minWidth: 100,
 			 max: until,
 		});


}
	function __datetimeOnSelectDelegate(textDate, inst)
	{
	  $("#diplay_timing_slots").empty();
      var booking_date = $(this).val();
      var merchant_id  = $("#frm-booking .hidden_merchant_id").val();
      var base_url     = ajax_url;
      //var url          = base_url+"/get_merchant_timings";
      var url          = ajax_url+"/get_merchant_timings";
      var html         = '';
      $.ajax({
		        url: url, // point to server-side PHP script
		        type: 'post',
		        data: {booking_date:booking_date,merchant_id:merchant_id},
		        // dataType: 'json',
				crossDomain:true,
		        success: function(php_script_response)
		        {
	          	  $('#table_booking_time').html('');
					if(php_script_response == '<option value="" disabled selected>Select a time slot </option>')
					{
						$('#booking_time').html('<option value="" disabled selected>No slots available for the chosen date</option>');
					}
		       		else{
						  $('#booking_time').html(php_script_response);
						  //$('#booking_time').html('<option value="" disabled selected>Error!! Invalid date</option>');
					}
		        }
		      });
}

function search_table_timing()
{
		if(getStorage("client_id") == null || getStorage("client_id") == "")
		{

		}
		else{
		callAjax('getProfile',"client_token="+getStorage("client_token"));
		}
		$('#diplay_timing_slots').html('');
	  var no_of_guests = $.trim($('#no_of_guests option:selected').val());
	  var date_booking = $('#date_booking').val();
	  var time_slot    = $.trim($('#booking_time option:selected').val());
	  if(time_slot=='')
	  {
		return ;
	  }
	  var base_url     = ajax_url;
	  var merchant_id  = $("#frm-booking .hidden_merchant_id").val();
	  var url  = ajax_url+"/check_seat_availability";
	  $('#timing_slots').html('');
	  $('#booking_details_div').css('display','none');
	  $.ajax({
			  type:'POST',
			  url : url ,
			  crossDomain:true,
			  data: {no_of_guests:no_of_guests,date_booking:date_booking,time_slot:time_slot,merchant_id:merchant_id},
			  dataType:'json',
			  success:function(response)
			  {
				  if($.trim(response)!='')
				  {
					$('#timing_slots').css('display','block');
					var timing_html = '';
					// alert(response.toSource);

					  $.each(response, function( key, value )
					  {
							  /*  alert(key);
								alert(value.toSource());                 */

								var disabled_type = '';

								var seats_available = value.seating_capacity+" seat available";
							   if(value.seating_capacity>1)
							   {
								  seats_available = value.seating_capacity+" seats available";
							   }

							   if(value.seating_capacity==0)
							   {
								   seats_available = "Not available";
								   disabled_type = 'disabled';
							   }

					  timing_html += '<div class="mobile_time_slots"> <ons-button class="ng-isolate-scope button effect-button slide-left" value="'+value.slot_starting+'" onclick="select_booking_time(\''+key+'\',\''+value.seating_capacity+'\',\''+no_of_guests+'\')" '+disabled_type+' >'+value.slot_starting+'</ons-button> <span class="available_seats_span">'+seats_available+'</span></div>' ;
					  // timing_html +='<div class="col-lg-2">  <input value="'+value.slot_starting+'" class="btn btn-primary btn-block" onclick="select_booking_time(\''+key+'\',\''+value.seating_capacity+'\',\''+no_of_guests+'\')" type="button" '+disabled_type+' >  <span class="available_seats_span">'+seats_available+'</span>  </div>';

					  });

					  $('#diplay_timing_slots').append(timing_html);
					/*   <div class="col-lg-2">
							 <input value="Search" class="btn btn-primary btn-block search_table_booking" type="button">
						</div> */

				  }
				  else  {
					//toastMsg( getTrans("Please select a valid slot","invalid_slot") );
				  }
			  }
	  })
}

function select_booking_time(timings,seat_available,no_of_guests)
{

//	  $('#top_end_table_booking').css('display','none');
$('.booking_error_message').html("");

var display_time =  timings.split('-');
var display_hours = '';
hours = 0;
if(display_time[0].length>0)
{
	display_hours =  display_time[0];
  hours = display_time[0].split(":");
  if(hours[0].length>0)
  {
	  hours = hours[0];
  }
}

var ampm = hours >= 12 ? 'pm' : 'am';

var no_of_guests = parseInt($("#no_of_guests option:selected").val());
seat_available = parseInt(seat_available);
if(no_of_guests>seat_available)
{
if(seat_available==0)
{
	onsenAlert("Oops ! We are fully booked");
}
else
{
	onsenAlert("Only "+seat_available+" seats left","invalid_seatings");
}
}
else
{
$('#top_end_table_booking').css('display','none');
$('#no_of_guests').prop('disabled', 'disabled');
$('.date_booking	').prop('disabled', 'disabled');
$('#booking_time').prop('disabled', 'disabled');
$('.search_table_timing').prop('disabled', 'disabled');

var booking_date = $('.date_booking').val();
var booking_time = $("#table_booking_time option:selected").text();
var user_time    = $("#table_booking_time option:selected").val();
var date_time    = booking_date+" "+display_hours+" "+ampm;

$('#user_selected_time').val(timings);
$('#booking_date_time').val(date_time);
$('#booking_dates').val(booking_date);
$('#txt_no_of_guests').val(no_of_guests);
//$('#booking_date_time').prop('disabled', 'disabled');
//$('#txt_no_of_guests').prop('disabled', 'disabled');
$('#booking_details_div').css('display','block');

$('#hide_book_a_table').css('display','block');

/* var client_first_name = getStorage("client_first_name");
// var client_last_name  = getStorage("client_last_name");
var client_email_address = getStorage("client_email_address");
// alert(" client_first_name " + client_first_name ) ;

if(client_first_name===null)
{
	 client_first_name = "";
}
if(client_email_address===null)
{
	 client_email_address = "";
}
$(".booking_name").val(client_first_name);
$(".email").val(client_email_address);
alert(client_first_name);
*/
}

}

function showMerchantInfo(data)
{	
	
    // alert(data.toSource());
	$(".logo-wrap").html('<img src="' + data.merchant_info.logo + '" /> <button id="tbl-booking" class="white-btn" onclick="loadRestaurantCategory(' + data.merchant_info.merchant_id +')"> Merchant Menu </button>');
	dump(data);
	// alert(data.enabled_table_booking);
	if(data.enabled_table_booking==1)
	{
		// alert("if");
		$('#book-table').hide();
	}
	else
	{
		// alert("else");
    var rest_name = "";
    rest_name = "'"+data.merchant_info.restaurant_name.replace(/'/g, '')+"'";


		$('#book-table').show();
		$("#book-table #info-book").attr('onclick','table_booking_optn('+getStorage('merchant_id')+',\''+getStorage('merchant_logo')+'\','+rest_name+');');
		//onclick="popUpTableBooking();"


	}

      // p += '<ons-list><div class="swiper-container"><div class="swiper-wrapper">';
	    // p += '<div class="swiper-slide  ><a href="javascript:;" data-scroll="scroll_div_" id="scroll_list_" > Sample</a></div><div class="swiper-slide  ><a href="javascript:;" data-scroll="scroll_div_" id="scroll_list_" > Sample</a></div>';
      // p += '</div></div><div class="swiper-pagination"></div></ons-list>';
      // createElement('merchant-payment-list', p );
	$("#page-merchantinfo h3").html(data.merchant_info.restaurant_name);
	$("#page-merchantinfo h5").html(data.merchant_info.cuisine);
	$("#page-merchantinfo address").html(data.merchant_info.address);
	$("#page-merchantinfo .rating-stars").attr("data-score",data.merchant_info.ratings.ratings);
	if (!empty(data.reviews)){
	   $(".total-reviews").html(data.reviews.total_review + " "+ getTrans("reviews",'reviews') );
	}
	$(".opening-hours").html(data.opening_hours);
  if (!empty(data.merchant_information)){
    var p='';
		p+='<ons-list-header class="center trn" data-trn-key="payment_methods">Merchant Information</ons-list-header>';
		   //p+=tplPaymentListStatic(val.value , val.label, val.icon);
       p+='<ons-list-item class="center list__item ons-list-item-inner">'+data.merchant_information+'</ons-list-item>';
		createElement('merchant-info', p );
  }
	if (!empty(data.payment_method)){
		var p='';
		p+='<ons-list-header class="center trn" data-trn-key="payment_methods">Payment Methods</ons-list-header>';
		 $.each( $(data.payment_method) , function( key, val ) {
		   p+=tplPaymentListStatic(val.value , val.label, val.icon);
		});
		createElement('merchant-payment-list', p );
	}

	if (data.promo.enabled == "2"){
		var p='';
    var amount;
		p+='<ons-list-header class="center trn" data-trn-key="voucher_code">Vouchers</ons-list-header>';
		 $.each( $(data.promo.voucher) , function( key, val ) {
       console.log(key);
       amount=val.amount;
       if (val.voucher_type == "fixed amount")
       {
         amount = getStorage("currency_set")  + parseFloat(amount)+ " Discount";
       }
       else
       {
         amount =  getStorage("currency_set")  + ((amount/100)*100 )+" % Discount";
       }
       console.log(amount);

		   //p+=tplPaymentListStatic("Voucher Code",val.voucher_name,amount);
       p+="<div class='concat-text col ons-col-inner'><p class='p list__item '><b>"+val.voucher_name+"</b></br><span>"+amount+"</span></p></div>";

		});
		createElement('merchant-voucher-list', p );
	}


	if (data.deals_list != null){
		var p='';
		p+='<ons-list-header class="center  trn" data-trn-key="voucher_code">Deals</ons-list-header>';
		 $.each( $(data.deals_list) , function( key, val ) {
		   p+="<div class='concat-text col ons-col-inner' style='white-space: normal;'><p class='p list__item '><b>"+val.title+"</b> - <span>"+val.description+"</span></p></div>";
		});
		createElement('merchant-deals-list', p );
	}



	/*if (!empty(data.reviews)){
		$(".latest-review").html( data.reviews.date_created +" - " + data.reviews.client_name);
	}*/

	/*if (!empty(data.maps)){
		$("#merchant-map").show();

		var locations={
		"name":data.merchant_info.restaurant_name,
		"lat":data.maps.merchant_latitude,
		"lng":data.maps.merchant_longtitude
		};
		initMerchantMap(locations);

	} else {
		$("#merchant-map").hide();
	}*/

	/*check if booking is enabled*/
	/*if ( data.enabled_table_booking==2){
		$("#book-table").show();
	} else $("#book-table").hide();*/


	//$("#book-table").hide();

	initRating();
}

function loadBookingForm()
{
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {

      	  displayMerchantLogo2(
      	     getStorage("merchant_logo") ,
      	     '' ,
      	     'page-booking'
      	  );

      	  initMobileScroller();

      	  /*translate booking form*/
      	  $(".number_guest").attr("placeholder", getTrans('Number of Guests','number_of_guest') );
      	  $(".date_booking").attr("placeholder", getTrans('Date of Booking','date_of_booking') );
      	  $(".booking_time").attr("placeholder", getTrans('Time of Booking','time_of_booking') );
      	  $(".booking_name").attr("placeholder", getTrans('Name','name') );
      	  $(".email").attr("placeholder", getTrans('Email Address','email_address') );
      	  $(".mobile").attr("placeholder", getTrans('Mobile Number','mobile_number') );
      	  $(".booking_notes").attr("placeholder", getTrans('Booking notes, if any','your_instructions') );
      	  $('.hidden_merchant_id').val(getStorage("merchant_id"));
      	  translateValidationForm();

      }
    };
    sNavigator.pushPage("bookingTY.html", options);
}

function table_booking_optn(merchant_id,logo,restaurant_name,hide)
{
	setStorage("merchant_logo",logo);
	setStorage("merchant_name",restaurant_name);
	setStorage('merchant_id',merchant_id);
	if(hide)
	{
		$("#merchnt-pop-menu").hide();
	}
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {

      	  displayMerchantLogo2(
      	     logo ,
      	     '' ,
      	     'page-booking'
      	  );
      	  $("#page-booking .restauran-title").html(restaurant_name);
      	  initMobileScroller();

      	  /*translate booking form*/
      	  $(".number_guest").attr("placeholder", getTrans('Number of Guests','number_of_guest') );
      	  $(".date_booking").attr("placeholder", getTrans('Date of Booking','date_of_booking') );
      	  $(".booking_time").attr("placeholder", getTrans('Time of Booking','time_of_booking') );
      	  $(".booking_name").attr("placeholder", getTrans('Name','name') );
      	  $(".email").attr("placeholder", getTrans('Email Address','email_address') );
      	  $(".mobile").attr("placeholder", getTrans('Mobile Number','mobile_number') );
      	  $(".booking_notes").attr("placeholder", getTrans('Booking notes, if any','your_instructions') );
      	  $('#page-booking .hidden_merchant_id').val(merchant_id);
      	  translateValidationForm();

      	  /*if(getStorage('client_id')=="" || getStorage('client_id')== null){
					}
		  else{
		  callAjax('getProfile',"client_token="+getStorage("client_token"));
		}*/
      }
    };
    sNavigator.pushPage("booking.html", options);
		console.log(getStorage('client_id'));
		console.log(getStorage('client_id'));
}



function submitBooking()
{

	var merchant_id = $('.hidden_merchant_id').val();
	$.validate({
	    form : '#frm-booking',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
			if(getStorage("client_id")==null || getStorage("client_id")=="")
			{
				var params = $( "#frm-booking").serialize();
				params+="&merchant_id=" +  merchant_id +"&client_id=";
				callAjax("bookATableNewconcept",params);
				return false;
			}
			else
			{
				var params = $( "#frm-booking").serialize();
				params+="&merchant_id=" +  merchant_id +"&client_id="+getStorage("client_id");
				callAjax("bookATableNewconcept",params);
				return false;
			}
	    }
	});
}

function loadMoreReviews()
{
	var page = sNavigator.getCurrentPage();
	if ( page.name=="reviews.html"){
		var params="merchant_id=" +  getStorage("merchant_id") ;
	    callAjax("merchantReviews",params);
		return;
	}

	var options = {
      animation: 'slide',
      onTransitionEnd: function() {
      	  displayMerchantLogo2(
      	     getStorage("merchant_logo") ,
      	     '' ,
      	     'page-reviews'
      	  );
      	  var params="merchant_id=" +  getStorage("merchant_id") ;
	      callAjax("merchantReviews",params);
      }
    };
    sNavigator.pushPage("reviews.html", options);
}

function displayReviews(data)
{
	var htm='';
	$.each( data, function( key, val ) {
		htm+=tplReviews(val.rating, val.client_name, val.review, val.date_created );
	});
	createElement('review-list-scroller',htm);
	initRating();
}

function showReviewForm()
{
	var options = {
      animation: 'none',
      onTransitionEnd: function() {
      	  displayMerchantLogo2(
      	     getStorage("merchant_logo") ,
      	     '' ,
      	     'page-addreviews'
      	  );

      	  translatePage();
      	  $(".rating").attr("placeholder", getTrans('Your rating 1 to 5','your_rating') );
          $(".review").attr("placeholder", getTrans('Your reviews','your_reviews') );
          translateValidationForm();

          $('.raty-stars').raty({
			   score:0,
			   readOnly: false,
			   path: 'lib/raty/images',
			   click: function (score, evt) {
			   	   $(".rating").val( score );
			   }
		  });

      }
    };
    sNavigator.pushPage("addReviews.html", options);
}

function addReview()
{
	$.validate({
	    form : '#frm-addreview',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	      var params = $( "#frm-addreview").serialize();
	      params+="&merchant_id=" +  getStorage("merchant_id") ;
	      params+="&client_token="+ getStorage("client_token");
	      callAjax("addReview",params);
	      return false;
	    }
	});
}



function showFilterResto()
{
	if (typeof dialogBrowseResto === "undefined" || dialogBrowseResto==null || dialogBrowseResto=="" ) {
		ons.createDialog('filterBrowseResto.html').then(function(dialog) {
			$(".restaurant_name").val('');
	        dialog.show();

	        translatePage();
	        translateValidationForm();
	        $(".restaurant_name").attr("placeholder", getTrans('Enter Restaurant name','enter_resto_name')  );

	    });
	} else {
		$(".restaurant_name").val('');
		dialogBrowseResto.show();

		/*translatePage();
	    translateValidationForm();
	    $(".restaurant_name").attr("placeholder", getTrans('Enter Restaurant name','enter_resto_name')  );*/
	}
}

function submitFilterBrowse()
{
	$.validate({
	    form : '#frm-filterbrowse',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	      dialogBrowseResto.hide();
	      var params = $( "#frm-filterbrowse").serialize();
	      callAjax("browseRestaurant",params);
	      return false;
	    }
	});
}

function submitBrowseBooktable()
{
	menu.setMainPage('BrowseByBookTable.html', {closeMenu: true});

	   /*   var params = '';
	      callAjax("BrowseByBookTable",params);
	      return false; */
}

function showProfile()
{
	if (isLogin()){
		menu.setMainPage('profile.html', {closeMenu: true});
	} else {
    setStorage("transaction_type","profile");
		menu.setMainPage('prelogin.html', {closeMenu: true});
	}
}

function saveProfile()
{
	var propswd=$("#prfpswd").val();
	if(propswd == '')
	{
		onsenAlert("Password should not be empty");
		return false;
	}
	if(propswd.length < 8)
	{
		onsenAlert("Password must be 8 characters or above");
		return false;
	}
	else
	{
	$.validate({
	    form : '#frm-profile',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	      var params = $( "#frm-profile").serialize();
	      params+="&client_token="+ getStorage("client_token");
	      callAjax("saveProfile",params);
	      return false;
	    }
	});
}
}

function login()
{
	var email=$("#login_email").val();
	function isValidEmailAddress(email) {
		var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
		return pattern.test(email);
	};

	if(email=='')
	{
		onsenAlert("Email Id is mandatory");
	}
	else if( !isValidEmailAddress( email ) ) {
		onsenAlert("Invalid email format");
	}
	else{
	$.validate({
	    form : '#frm-login',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
		  var params = $( "#frm-login").serialize();
		  var split_params = params.split("&");
          params = '';
          for(var i=0;i<split_params.length;i++){
              var sub_params = split_params[i].split("=");
              if(sub_params[0] == "password")
              params += sub_params[0]+"="+window.btoa(sub_params[1])+"&";
              else
              params += split_params[i]+"&";
          }
	      params+="&device_id="+ getStorage("device_id");
	     callAjax("login",params);
	      return false;
	    }
	});
	}
}

$(document).on('keyup mouseup', '.item-qty', function () 
{
	var row_id =  $.trim($(this).data('rowid')); 	 
	var item_quantity  = $(this).val();
	if($.isNumeric(row_id))
	{
		if($('.subitem-qty'+row_id).length>0)
		{
			$('.subitem-qty'+row_id).val(item_quantity);
		}
	}
});




$(document).on('click', '.checkbox', function () {
  if($(".guest_check").is(":checked"))  {
    $("#guest_password").show();
  }
  else{
    $("#guest_password").hide();
  }
});

function guestcheckout()
{
  if(isLogin())
  {
    onsenAlert("You are already logged in");
    sNavigator.popPage({cancelIfRunning: true}); //back button
  }
  else{
    console.log(getStorage('transaction_type'));
  if(getStorage('transaction_type') == "pickup"){
    $("#page-shipping #search-text").html("");
    $("#delivery_instruction").hide();
  }
  $("#save_member").css("display","block");
	$("#addressbook").hide();
	$("#guest").show();
	$("#guest").css("display", "block");
	var options = {
		animation: 'slide',
		onTransitionEnd: function() {
				displayMerchantLogo2( getStorage("merchant_logo") ,
					 getStorage("order_total") ,
					 'page-shipping');
				}
	};
	sNavigator.pushPage("shipping.html", options);
}
}


$(document).on('keypress','.numbers',function(e){
     //if the letter is not digit then display error and don't type anything
     if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
		return false;
    }
   });



function logout(prof)
{
	if(prof)
	{
	removeStorage("client_token");
	removeStorage("client_id");
	}
	else{
		removeStorage("client_token");
		removeStorage("client_id");
	//onsenAlert( getTrans("Logged out",'you_are_now_logout') );
  toastMsg("Logged out");

	menu.setMainPage('select_dining.html', {closeMenu: true});
}
}



function isLogin()
{
	if (!empty(getStorage("client_token"))){
		return true;
	}
	return false;
}

function showLogin(next_steps)
{
  if(isLogin())
  {
    onsenAlert("You are already logged in");
    sNavigator.popPage({cancelIfRunning: true}); //back button
  }
  else{
    console.log(getStorage("transaction_type"));
   var options = {
      animation: 'slide',
      onTransitionEnd: function() {
      	  if ( !empty(next_steps)){
      	  	 $(".page-login-fb").show();
    	     $(".next_steps").val( getStorage("transaction_type") );
          } else {
          	 $(".page-login-fb").hide();
          	 $(".next_steps").val( '' );
          }
      }
    };
    sNavigator.pushPage("login.html", options);
  }
}

function showForgotPass()
{
	$(".email_address").val('');
	if (typeof dialogForgotPass === "undefined" || dialogForgotPass==null || dialogForgotPass=="" ) {
		ons.createDialog('forgotPassword.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	        translateValidationForm();
	        $(".email_address").attr("placeholder",  getTrans('Email Address','email_address') );
	    });
	} else {
		dialogForgotPass.show();
	}
}

function forgotPassword()
{
	var email=$("#frgt_email").val();
	function isValidEmailAddress(email) {
		var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
		return pattern.test(email);
	};
	if(email=="")
	{
		onsenAlert("Email Id is mandatory");
	}
	else if( !isValidEmailAddress( email ) ) {
		onsenAlert("Invalid Email ID");
	}
	$.validate({
	    form : '#frm-forgotpass',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	      var params = $( "#frm-forgotpass").serialize();
	      callAjax("forgotPassword",params);
	      return false;
	    }
	});
}

function showSignupForm()
{
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {
      	  callAjax("getCustomFields",'');
      	  initIntelInputs();
      }
    };
    sNavigator.pushPage("signup.html", options);
}

function signup()
{

	var pswd = $("#pswd").val();
  var cpswd = $("#cnfpswd").val();
	var fname = $("#fname").val();
	var lname = $("#lname").val();
	var email=$("#email").val();
	var mbno=$("#mbno").val();
	function isValidEmailAddress(email) {
		var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
		return pattern.test(email);
	};
	if($('#frm-signup input[type="text"]').val() =='')
	{
		onsenAlert("All fields are required");
    }
  else if(fname == "")
  {
    	onsenAlert("First Name is required");
  }
  else if(fname.length < 4 ){
      onsenAlert("First Name should be minimum 4 characters");
  }
  else if(lname == "")
  {
    	onsenAlert("Last Name is required");
  }
	else if(email == ''){
			onsenAlert("Email ID is required");
	}
	else if( !isValidEmailAddress( email ) ) {
		onsenAlert("Invalid Email format");
	}
	else if(pswd == "")
	{
		onsenAlert("Password should not be empty");
	}
  else if(cpswd == "")
	{
		onsenAlert("Confirm Password should not be empty");
	}
  else if(pswd.length < 8)
	{
		onsenAlert("Password length should be 8 or above");
	}
  else if(cpswd.length < 8)
  {
    onsenAlert("Confirm Password length should be 8 or above");
  }
  else if(pswd !== cpswd)
  {
    onsenAlert("Password and confirm password doesnot matches.");
  }
	else if(email=="")
	{
		onsenAlert("Email is empty. Try again");
	}
	else{
	$.validate({
	    form : '#frm-signup',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {

	      if ($('.iagree-wrap').is(':visible')) {
		      var iagree = $(".iagree:checked").val();
		      if(empty(iagree)){
		      	 onsenAlert( getTrans("Please agree and select terms & conditions",'agree_terms') );
		      	 return;
		      }
	      }

	      var params = $( "#frm-signup").serialize();
	      params+="&device_id="+ getStorage("device_id");
	      callAjax("signup",params);
	      return false;
	    }
	});
	}
}

function showOrders()
{

	if (isLogin()){
		menu.setMainPage('orders.html', {closeMenu: true});
	} else {
    setStorage("transaction_type","orders");
		menu.setMainPage('prelogin.html', {closeMenu: true});
	}
}

function showHistory()
{
	if (isLogin()){
		menu.setMainPage('history.html', {closeMenu: true});
	} else {
    setStorage("transaction_type","history");
		menu.setMainPage('prelogin.html', {closeMenu: true});
	}
}

function showTerms()
{
		menu.setMainPage('terms.html', {closeMenu: true});
		//var iabRef = cordova.InAppBrowser.open(cuisine_url+'/store/page/terms-amp-conditions', '_self', 'location=no','toolbar=yes');
}

function showAddressBook()
{
  if (isLogin()){
		menu.setMainPage('addressBook.html', {closeMenu: true});
	} else {
    setStorage("transaction_type","address_book");
		menu.setMainPage('prelogin.html', {closeMenu: true});
	}
}

function displayOrderHistory(data)
{
	var htm='<ons-list>';
	$.each( data, function( key, val ) {
	     //htm+='<ons-list-item modifier="tappable" class="list-item-container" onclick="showOrderDetails('+val.order_id+');" >';
	     htm+='<ons-list-item modifier="tappable" class="list-item-container" onclick="showOrderOptions('+val.order_id+');" >';
           htm+='<ons-row class="row">';
              htm+='<ons-col class="col-orders concat-text">';
                htm+=val.title;
              htm+='</ons-col>';
              htm+='<ons-col class="col-order-stats center" width="98px">';
                 htm+='<span class="notification concat-text '+val.status_raw+' ">'+val.status+'</span>';
              htm+='</ons-col>';
           htm+='</ons-row>';
         htm+='</ons-list-item>';
	});
	htm+='</ons-list>';
	createElement('recent-orders',htm);
}

//for displaying list
function displayBookingHistory(data)
{
	var htm='<ons-list>';
	$.each( data, function( key, val ) {
	     //htm+='<ons-list-item modifier="tappable" class="list-item-container" onclick="showOrderDetails('+val.order_id+');" >';
	     htm+='<ons-list-item modifier="tappable" class="list-item-container" onclick="showHistoryDetails('+val.booking_id+');" >';
           htm+='<ons-row class="row">';
              htm+='<ons-col class="col-orders concat-text">';
                htm+='#'+val.booking_id+'  '+ val.booking_name+'  '+val.date_booking;
              htm+='</ons-col>';
              htm+='<ons-col class="col-order-stats center" width="98px">';
                 htm+='<span class="notification concat-text '+val.status+' ">'+val.status+'</span>';
              htm+='</ons-col>';
           htm+='</ons-row>';
         htm+='</ons-list-item>';
	});
	htm+='</ons-list>';
	createElement('recent-history',htm);
}


//for terms and conditions
function displayTerms(data)
{
	var htm=data;

	/*var htm='<ons-list>';
	$.each( data, function( key, val ) {
	     //htm+='<ons-list-item modifier="tappable" class="list-item-container" onclick="showOrderDetails('+val.order_id+');" >';
	     htm+='<ons-list-item modifier="tappable" class="list-item-container" onclick="showHistoryDetails('+val.booking_id+');" >';
           htm+='<ons-row class="row">';
              htm+='<ons-col class="col-orders concat-text">';
                htm+='#'+val.booking_id+'  '+ val.booking_name+'  '+val.date_booking;
              htm+='</ons-col>';
              htm+='<ons-col class="col-order-stats center" width="98px">';
                 htm+='<span class="notification concat-text '+val.status+' ">'+val.status+'</span>';
              htm+='</ons-col>';
           htm+='</ons-row>';
         htm+='</ons-list-item>';
	});
	htm+='</ons-list>';*/
	createElement('recent-terms',htm);
}


function showOrderDetails(order_id)
{
    dump(order_id);
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {
      	var params="client_token="+ getStorage("client_token")+"&order_id="+order_id;
      	callAjax("ordersDetails",params);
      }
    };
    sNavigator.pushPage("ordersDetails.html", options);
}

function displayOrderHistoryDetails(data)
{
  var finl;
  var amnt_dis;
	//$("#page-orderdetails .title").html("Total : "+ data.total);
	//$("#page-orderdetails #search-text").html("Order Details #"+data.order_id);
	$("#page-orderdetails .title").html( getTrans('Total','total') + " : "+ data.total);
	$("#page-orderdetails #search-text").html( getTrans('Order detail','order_details') + " #"+data.order_id);


	var htm='<ons-list-header class="center trn" data-trn-key="items" >Items</ons-list-header>';
	if ( data.item.length>0){
		$.each( data.item, function( key, val ) 
		{
			var size = '';
			if($.trim(val.item_size)!='')
			{
				size = val.item_size;
			}
			  //htm+='<ons-list-item class="center">'+val.item_name+'('+ getStorage("currency_set") +  parseFloat(val.normal_price) + ')</ons-list-item> ';
         finl= val.normal_price.replace(/[^0-9 .]/g, '') * val.item_name.replace(/[^0-9 .]/g, '');
        console.log(finl);
        finl=finl.toFixed(2);
        finl=getStorage("currency_set") +finl;
        htm+='<ons-list-item class="row-no-border list__item ons-list-item-inner"><ons-row class="row ons-row-inner"><ons-col class="concat-text col ons-col-inner" width="60%" style="-moz-box-flex: 0; flex: 0 0 60%; max-width: 60%;"><p class="description item-name concat-text bold">'+val.item_name+size+'</p></ons-col><ons-col class="text-right col ons-col-inner"><price>'+ finl + '</price></ons-col></ons-row></ons-list-item>';
        htm+='<ons-list-item id="space" class="grey-border-top line-separator"></ons-list-item>';
		});
	} else {
		htm+='<ons-list-item class="center">';
		htm+='No item found';
		htm+='</ons-list-item>';
	}
if ( !empty(data.free_details)){
	// alert(data.free_details.toSource());
	$.each( data.free_details, function( key, val ) 
	{
		var size = '';
		if($.trim(val.size_details)!='')
		{
			size = ' ('+val.size_details+') ';
		}
			 // htm+='<ons-list-item class="center">'+val.item_name+'('+  val.free_type+')'+'</ons-list-item> ';
        htm+='<ons-list-item class="row-no-border list__item ons-list-item-inner"><ons-row class="row ons-row-inner"><ons-col class="concat-text col ons-col-inner" width="60%" style="-moz-box-flex: 0; flex: 0 0 60%; max-width: 60%;"><p class="description item-name concat-text bold">'+val.item_name+size+'('+val.free_type+')</p></ons-col><ons-col class="text-right col ons-col-inner"><price>Free</price></ons-col></ons-row></ons-list-item>';
        htm+='<ons-list-item id="space" class="grey-border-top line-separator"></ons-list-item>';
        //html+='<ons-list-item class="grey-border-top line-separator list__item ons-list-item-inner"></ons-list-item>';
	});
}
if ( !empty( data.discount_details )){
    $.each( data.discount_details, function( key, val ) {
			  //htm+='<ons-list-item class="center">Discount Applied('+parseFloat(val.discount_percentage)+' %)'+'</ons-list-item> ';
        amnt_dis=finl.replace(/[^0-9 .]/g, '') - val.discount_price;
        htm+='<ons-list-item class="row-no-border list__item ons-list-item-inner"><ons-row class="row ons-row-inner"><ons-col class="concat-text col ons-col-inner" width="60%" style="-moz-box-flex: 0; flex: 0 0 60%; max-width: 60%;"><p class="description item-name concat-text bold">Discount (-'+parseFloat(val.discount_percentage)+' % )</p></ons-col><ons-col class="text-right col ons-col-inner"><price> -'+ getStorage("currency_set") + val.discount_price.toFixed(2) +'</price></ons-col></ons-row></ons-list-item>';
        htm+='<ons-list-item id="space" class="grey-border-top line-separator"></ons-list-item>';
		});
}
if ( data.delivery_fee > 0){
        htm+='<ons-list-item class="row-no-border list__item ons-list-item-inner"><ons-row class="row ons-row-inner"><ons-col class="concat-text col ons-col-inner" width="60%" style="-moz-box-flex: 0; flex: 0 0 60%; max-width: 60%;"><p class="description item-name concat-text bold">Delivery</p></ons-col><ons-col class="text-right col ons-col-inner"><price> '+ getStorage("currency_set") + parseFloat(data.delivery_fee).toFixed(2) +'</price></ons-col></ons-row></ons-list-item>';
        htm+='<ons-list-item id="space" class="grey-border-top line-separator"></ons-list-item>';
}
if ( !empty( data.voucher_code)){
//    $.each( data.voucher_code, function( key, val ) {
var amunt;
if (data.voucher_type == "fixed amount")
{
  amunt = getStorage("currency_set") + data.voucher_amount+ " Discount";
}
else
{
  amunt =  ((data.voucher_amount/100)*100 )+" % Discount";
  var dsc_amt=finl.replace(/[^0-9 .]/g, '');
  amnt_dis=amnt_dis+7;// adding delivery fee
  console.log(amnt_dis * data.voucher_amount / 100);
  //console.log(100 - (data.voucher_amount * 100 / dsc_amt));
}
			  //htm+='<ons-list-item class="center">Voucher '+data.voucher_code +" Applied ("+ amunt +')</ons-list-item> ';
        htm+='<ons-list-item class="row-no-border list__item ons-list-item-inner"><ons-row class="row ons-row-inner"><ons-col class="concat-text col ons-col-inner" width="60%" style="-moz-box-flex: 0; flex: 0 0 60%; max-width: 60%;"><p class="description item-name concat-text bold">Less Voucher </p></ons-col><ons-col class="text-right col ons-col-inner"><price>'+amunt+' </price></ons-col></ons-row></ons-list-item>';
        htm+='<ons-list-item id="space" class="grey-border-top line-separator"></ons-list-item>';
		//});
}
if(!empty(data.order_from))
{
  var type;
  var trans_type_mb;
  if(data.order_from.payment_type == "cash" || data.order_from.payment_type == "cod")
  {
	 type="Cash on Delivery";
	 if(($.trim(data.order_from.trans_type).toLowerCase())=="pickup")
	 {
		type="Cash on Pickup";
	 }
  }
  else if(data.order_from.payment_type == "citypay")
  {
     type ="Citypay";
  }
  else if(data.order_from.payment_type == "payapl")
  {
    type="Paypal";
  }
  //htm+='<ons-list-item class="center">Payment Type '+type +'</ons-list-item> ';
  htm+='<ons-list-item  class="row-no-border list__item ons-list-item-inner"><ons-row class="row ons-row-inner"><ons-col class="concat-text col ons-col-inner" width="60%" style="-moz-box-flex: 0; flex: 0 0 60%; max-width: 60%;"><p class="description item-name concat-text bold">Payment Type</p></ons-col><ons-col class="text-right col ons-col-inner"><price>'+type+' </price></ons-col></ons-row></ons-list-item>';
    htm+='<ons-list-item id="space" class="grey-border-top line-separator"></ons-list-item>';
  if(data.order_from.trans_type=="delivery")
  {
    trans_type_mb="Delivery";
  }
  else{
    trans_type_mb="Pickup";
  }
  //htm+='<ons-list-item class="center">Delivery Type '+trans_type_mb +'</ons-list-item> ';
  htm+='<ons-list-item class="row-no-border list__item ons-list-item-inner"><ons-row class="row ons-row-inner"><ons-col class="concat-text col ons-col-inner" width="60%" style="-moz-box-flex: 0; flex: 0 0 60%; max-width: 60%;"><p class="description item-name concat-text bold">Delivery Option</p></ons-col><ons-col class="text-right col ons-col-inner"><price>'+trans_type_mb+' </price></ons-col></ons-row></ons-list-item>';
    htm+='<ons-list-item id="space" class="grey-border-top line-separator"></ons-list-item>';
}


	createElement('item-details', htm );

	var htm='<ons-list-header class="center trn" data-trn-key="status_history">Status History</ons-list-header>';
	if ( data.history_data.length>0){
		$.each( data.history_data, function( key, val ) {
			dump(val);
			htm+='<ons-list-item>';
	        htm+='<ons-row class="row">';
	           htm+='<ons-col class="" width="40%">';
	             htm+= val.date_created;
	           htm+='</ons-col>';
	           htm+='<ons-col class="padding-left5" width="30%">';
	             htm+=val.status;
	           htm+='</ons-col>';
	           htm+='<ons-col class="padding-left5"  width="25%">';
	             htm+=val.remarks;
	           htm+='</ons-col>';
	        htm+='</ons-row>';
	       htm+='</ons-list-item>';
		});
	} else {
		htm+='<ons-list-item class="center">';
		htm+='No history found';
		htm+='</ons-list-item>';
	}
	createElement('item-history', htm );

	//if ( data.order_from.request_from=="mobile_app"){
	var html='<button class="button green-btn button--large trn" onclick="reOrder('+data.order_id+');" data-trn-key="click_here_to_reorder" >';
	html+='Click here to Re-order';
	html+='<div class="search-btn"><ons-icon icon="ion-forward"></ons-icon></div>';
    html+='</button>';
    createElement('re-order-wrap', html );
	//}

   translatePage();
}


function displayBookingHistoryDetails(data)
{
	//$("#page-orderdetails .title").html("Total : "+ data.total);
	//$("#page-orderdetails #search-text").html("Order Details #"+data.order_id);
	$.each( data, function( key, val ) {
	$("#page-booking-history #search-text").html( getTrans('Table Reservation','booking_details') + " #"+val.booking_id);



	var html='';
	$("#booking_status").val( val.status);



	var html='<ons-list-header class="header list__header ons-list-header-inner">';
        html+='<ons-row class="row ons-row-inner">';
        html+='<span class="notification margin2 '+val.status+' ">'+val.status+'</span>';
        html+='</ons-row>';
     html+='</ons-list-header>';


	html+='<ons-list-header class="header list__header ons-list-header-inner">';
	html+='<ons-row class="row ons-row-inner">Details</ons-row>';
	html+='</ons-list-header>';

	html+='<ons-list-item class="list__item ons-list-item-inner">';
	html+='<ons-row class="row ons-row-inner">';
	html+='<ons-col class=" col ons-col-inner">Booked by</ons-col>';
	html+='<ons-col class="text-right col ons-col-inner">'+val.booking_name+'</ons-col>';
	html+='</ons-row>';
	html+='</ons-list-item>';

	html+='<ons-list-item class="list__item ons-list-item-inner">';
	html+='<ons-row class="row ons-row-inner">';
	html+='<ons-col class=" col ons-col-inner">Restaurant</ons-col>';
	html+='<ons-col class="text-right col ons-col-inner">'+val.restaurant_name+'</ons-col>';
	html+='</ons-row>';
	html+='</ons-list-item>';

	html+='<ons-list-item class="list__item ons-list-item-inner">';
	html+='<ons-row class="row ons-row-inner">';
	html+='<ons-col class=" col ons-col-inner">Guests</ons-col>';
	html+='<ons-col class="text-right col ons-col-inner">'+val.number_guest+'</ons-col>';
	html+='</ons-row>';
	html+='</ons-list-item>';

	html+='<ons-list-item class="list__item ons-list-item-inner">';
	html+='<ons-row class="row ons-row-inner">';
	html+='<ons-col class=" col ons-col-inner">Table booked for</ons-col>';
	html+='<ons-col class="text-right col ons-col-inner">'+val.date_booking+'</ons-col>';
	html+='</ons-row>';
	html+='</ons-list-item>';

  html+='<ons-list-item class="list__item ons-list-item-inner">';
	html+='<ons-row class="row ons-row-inner">';
	html+='<ons-col class=" col ons-col-inner">Notes</ons-col>';
	html+='<ons-col class="text-right col ons-col-inner">'+val.booking_notes+'</ons-col>';
	html+='</ons-row>';
	html+='</ons-list-item>';

	html+='<ons-list-item class="list__item ons-list-item-inner">';
	html+='<ons-row class="row ons-row-inner">';
	html+='<ons-col class=" col ons-col-inner">Booking Time</ons-col>';
	html+='<ons-col class="text-right col ons-col-inner">'+val.booking_time+'</ons-col>';
	html+='</ons-row>';
	html+='</ons-list-item>';

	 createElement('booking-details',html);
	 });
}




function reOrder(order_id)
{
	var params="client_token="+ getStorage("client_token")+"&order_id="+order_id;
     callAjax("reOrder",params);
}

function displayAddressBook(data)
{
	var htm='<ons-list>';
	if ( data.length>0){
	   $.each( data, function( key, val ) {
	     htm+='<ons-list-item modifier="tappable" onclick="modifyAddressBook('+val.id+');" >';
	         htm+='<ons-row class="row">';
	            htm+='<ons-col class="" width="70%">';
	            htm+='<p class="small-font-dim">'+val.address+'</p>';
	            htm+='</ons-col>';
	            htm+='<ons-col class="text-right" >';
	              if (val.as_default==2){
	                 htm+='<ons-icon icon="ion-ios-location-outline"></ons-icon>';
	              }
	            htm+='</ons-col>';
	         htm+='<ons-row>';
	     htm+='</ons-list-item>';
	   });
   }
   htm+='</ons-list>';

   createElement('address-book-list', htm );
}

function modifyAddressBook(id)
{
	dump(id);
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {
      	var params="client_token="+ getStorage("client_token")+"&id="+id;
      	callAjax("getAddressBookDetails",params);
      }
    };
    sNavigator.pushPage("addressBookDetails.html", options);
}

function fillAddressBook(data)
{
	$(".action").val('edit');
	$(".delete-addressbook").show();

	$(".id").val( data.id );
	$(".street").val( data.street );
	$(".city").val( data.city );
	$(".state").val( data.state );
	$(".zipcode").val( data.zipcode );
	$(".location_name").val( data.location_name );
	$(".country_code").val( data.country_code );
	if (data.as_default==2){
		$(".as_default").attr("checked","checked");
	} else $(".as_default").removeAttr("checked");
}

function saveAddressBook()
{
	$.validate({
	    form : '#frm-addressbook',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	      var params = $( "#frm-addressbook").serialize();
	      params+="&client_token="+ getStorage("client_token");
	      callAjax("saveAddressBook",params);
	      return false;
	    }
	});
}

function newAddressBook()
{
	$(".delete-addressbook").hide();
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {
      	$(".id").val('');
      	$(".action").val('add');
      }
    };
    sNavigator.pushPage("addressBookDetails.html", options);
}

function deleteAddressBook()
{
	ons.notification.confirm({
	  message: getTrans('Remove this address ?','delete_this_records') ,
	  title: dialog_title_default,
	  buttonLabels: ['Yes', 'No'],
	  animation: 'default', // or 'none'
	  primaryButtonIndex: 1,
	  cancelable: true,
	  callback: function(index) {
	  	dump(index);
	    if ( index==0){
	    	var id=$(".id").val();
	        var params="&client_token="+ getStorage("client_token")+"&id="+id;
	        callAjax("deleteAddressBook",params);
	    }
	  }
	});
}


function popUpAddressBook()
{
	//$(".manual-address-input").hide();
	//$("#del-addrs").hide();
	if (typeof dialogAddressBook === "undefined" || dialogAddressBook==null || dialogAddressBook=="" ) {
		ons.createDialog('dialogAddressBook.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });
	} else {
		dialogAddressBook.show();
		//translatePage();
	}
}


function displayAddressBookPopup(data)
{
	var htm='<ons-list>';
	if ( data.length>0){
	   $.each( data, function( key, val ) {
	   	 var complete_address=val.street+"|";
	   	 complete_address+=val.city+"|";
	   	 complete_address+=val.state+"|";
	   	 complete_address+=val.zipcode+"|";
	   	 complete_address+=val.location_name+"|";
	   	 complete_address+=val.contact_phone+"|";

	     htm+='<ons-list-item modifier="tappable" class="setAddress" data-address="'+complete_address+'" >';
	         htm+='<ons-row class="row">';
	            htm+='<ons-col class="" width="80%">';
	            htm+='<p class="small-font-dim">'+val.address+'</p>';
	            htm+='</ons-col>';
	            htm+='<ons-col class="text-right" >';
	              if (val.as_default==2){
	                 htm+='<ons-icon icon="ion-ios-location-outline"></ons-icon>';
	              }
	            htm+='</ons-col>';
	         htm+='<ons-row>';
	     htm+='</ons-list-item>';
	   });
   }
   htm+='</ons-list>';

   createElement('addressbook-popup', htm );
}

function initFacebook()
{
   dump('initFacebook');
   if ( !empty(krms_config.facebookAppId)){
   	   var facebook_flag = getStorage("facebook_flag");
   	   if (facebook_flag==2){
	   	   $(".fb-loginbutton").show();
	       openFB.init({appId: krms_config.facebookAppId });
   	   } else {
   	   	   $(".fb-loginbutton").hide();
   	   }
   } else {
   	   $(".fb-loginbutton").hide();
   }

   /*$.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
    FB.init({
      appId: '191654534503876',
      version: 'v2.3' // or v2.0, v2.1, v2.2, v2.3
    });
  });*/
}

function myFacebookLogin()
{
	/*FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			 dump('already login');
		 	 getFbInfo();
		} else {
			FB.login(function(response){
			 	dump(response);
			 	if ( response.status=="connected"){
			 	  getFbInfo();
			 	} else {
			 		onsenAlert("Login failed.");
			 	}
			 }, {scope: 'public_profile,email'});
		}
	});	*/
	openFB.login(
    function(response) {
        if(response.status === 'connected') {
            //alert('Facebook login succeeded, got access token: ' + response.authResponse.token);
            getFbInfo();
        } else {
            alert('Facebook login failed: ' + response.error);
        }
    }, {scope: 'public_profile,email'});
}

function getFbInfo()
{
	openFB.api({
		path: '/me',
		params: {
			fields:"email,first_name,last_name"
		},
		success: function(data) {
		    dump(data);
		    var params="&email="+ data.email;
	        params+="&first_name="+data.first_name;
	        params+="&last_name="+data.last_name;
	        params+="&fbid="+data.id;
	        params+="&device_id="+ getStorage("device_id");

	        if ( $(".next_steps").exists()){
	           params+="&next_steps="+ $(".next_steps").val();
	        }
		    callAjax("registerUsingFb",params);

    },
    error: fbErrorHandler});

	/*FB.api('/me?fields=email,name', function(response) {
        dump(response);
        var params="&email="+ response.email;
        params+="&name="+response.name;
        params+="&fbid="+response.id;

        if ( $(".next_steps").exists()){
           params+="&next_steps="+ $(".next_steps").val();
        }
	    callAjax("registerUsingFb",params);
    });*/
}

function fbErrorHandler(error) {
    alert("ERROR=> "+error.message);
}


function FBlogout()
{
	/*FB.logout(function(response) {
       dump(response);
   });*/
	openFB.logout(
	function() {
	   onsenAlert( 'Logout successful' );
	},
	fbErrorHandler);
}

function paypalSuccessfullPayment(response)
{
	var params="response="+response;
	params+="&order_id="+ getStorage("order_id");
	params+="&client_token="+ getStorage("client_token");
	callAjax("paypalSuccessfullPayment",params);
}

function citypaySuccessfullPayment(response)
{
	var params="response="+response;
	params+="&order_id="+ getStorage("order_id");
	params+="&client_token="+ getStorage("client_token");
	callAjax("citypaySuccessfullPayment",params);
}

function showNotification(title,message)
{

	if (typeof pushDialog === "undefined" || pushDialog==null || pushDialog=="" ) {
		ons.createDialog('pushNotification.html').then(function(dialog) {
			$(".push-title").html(title);
	        $(".push-message").html(message);
	        dialog.show();
	    });
	} else {
		$(".push-title").html(title);
	    $(".push-message").html(message);
		pushDialog.show();
	}
}

function showOrders2()
{
	pushDialog.hide();
	if (isLogin()){
		menu.setMainPage('orders.html', {closeMenu: true});
	} else {
		menu.setMainPage('prelogin.html', {closeMenu: true});
	}
}
/*
function initMerchantMap(data)
{
	dump(data);
	if ( !empty(data)){
		var map = new GoogleMap();
	    map.initialize('merchant-map', data.lat, data.lng , 15);
	} else {
		$("#merchant-map").hide();
	}
}
*/
/*
function getCurrentLocation()
{
	/*alert( device.platform );
	alert( device.version );

	if ( device.platform=="Android"){
		if ( device.version >= 6){
			//alert('andoroid 6x');
		}
	}

	if (isDebug()){
		onRequestSuccess();
		return;
	}

	if ( device.platform=="iOS"){
		getCurrentLocationOld();
	} else {

		var can_request=true;
		cordova.plugins.locationAccuracy.canRequest(function(canRequest){
		 	 if(!canRequest){
		 	 	can_request=false;
		 	 	var _message=getTrans('Your device has no access to location Would you like to switch to the Location Settings page and do this manually?','location_off')
			   	   ons.notification.confirm({
					  message: _message,
					  title: dialog_title_default ,
					  buttonLabels: ['Yes', 'No'],
					  animation: 'none',
					  primaryButtonIndex: 1,
					  cancelable: true,
					  callback: function(index) {
					     if ( index==0 || index=="0"){
					     	cordova.plugins.diagnostic.switchToLocationSettings();
					     }
					  }
				 });
		 	 }
		});

		if(!can_request){
			return;
		}

	   cordova.plugins.locationAccuracy.request(
	    onRequestSuccess, onRequestFailure, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
	}
}
 */



function getCurrentLocation()
{
	//alert( device.platform );
	if ( device.platform=="iOS"){
		getCurrentLocationOld();
	} else {
	   cordova.plugins.locationAccuracy.request(
	    onRequestSuccess, onRequestFailure, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
	}
}








function onRequestSuccess()
{
	loader.show();
	//  {enableHighAccuracy:false,maximumAge:Infinity, timeout:60000}

	// new line  by navaneeth 08-03-2017
	// navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError, { timeout:20000, maximumAge: 60000 , enableHighAccuracy: true } );


	// commented by navaneeth 08-03-2017
	 navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError,
	 { timeout: 10000 , enableHighAccuracy: getLocationAccuracy() } );

	/*navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError,
	 { timeout:10000 , enableHighAccuracy: false } );	*/

}

function onRequestFailure(error){
	//alert("Accuracy request failed: error code="+error.code+"; error message="+error.message);
    if(error.code == 4){
    	//toastMsg( getTrans("You chose not to turn on location accuracy",'turn_off_location') );
    	getCurrentLocation();
    } else {
    	//toastMsg( error.message );
      onsenAlert(error.message);
    }
}

function getCurrentLocationOld()
{
   CheckGPS.check(function win(){
    //GPS is enabled!
     loader.show();
	 navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError,
	 { timeout:10000 , enableHighAccuracy: getLocationAccuracy() } );
   },
   function fail(){
      //GPS is disabled!
      var m_1= getTrans('Your GPS is disabled, we need it to improve accuracy on the map','your_gps');
      var m_2= getTrans('Use GPS for location.','use_gps_for_location');
      var m_3= getTrans('Improve location accuracy','improve_location_accuracy');
      var b_1= getTrans('Cancel','cancel');
      var b_2= getTrans('Later','later');
      var b_3= getTrans('Go','go');

      cordova.dialogGPS( m_1 ,//message
	    m_2,//description
	    function(buttonIndex){//callback
	      switch(buttonIndex) {
	        case 0: break;//cancel
	        case 1: break;//neutro option
	        case 2: break;//user go to configuration
	      }
	    },
	      m_3+"?",//title
	      [b_1, b_2, b_3]
	    );//buttons
   });
}


function geolocationSuccess(position)
{
	dump(position);
	var params="lat="+position.coords.latitude;
	params+="&lng="+position.coords.longitude;
	callAjax("reverseGeoCoding",params);
}

function geolocationError(error)
{
	hideAllModal();
	/*onsenAlert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');*/
	//toastMsg( error.message );
}

function saveSettings()
{
	setStorage("country_code_set", $(".country_code_set").val() );

	var params = $( "#frm-settings").serialize();
	params+="&client_token="+getStorage("client_token");
	params+="&device_id="+getStorage("device_id");
	callAjax("saveSettings",params);
}

function showLocationPopUp()
{
	if (typeof locationDialog === "undefined" || locationDialog==null || locationDialog=="" ) {
		ons.createDialog('locationOptions.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });
	} else {
		locationDialog.show();
		//translatePage();
	}
}

function displayLocations(data)
{
	var htm='';
	htm+='<ons-list>';
	htm+='<ons-list-header class="list-header trn" data-trn-key="country">Country</ons-list-header>';
	$.each( data.list, function( key, val ) {
		ischecked='';
		if ( key==data.selected){
			ischecked='checked="checked"';
		}
		htm+='<ons-list-item modifier="tappable" onclick="setCountry('+"'"+key+"'"+');">';
		 htm+='<label class="radio-button checkbox--list-item">';
			htm+='<input type="radio" name="country_code" class="country_code" value="'+key+'" '+ischecked+' >';
			htm+='<div class="radio-button__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+val;
		  htm+='</label>';
		htm+='</ons-list-item>';
	});
	htm+='</ons-list>';
	createElement('location-options-list',htm);
	translatePage();
}

function setCountry(country_code)
{
	$(".country_code_set").val(country_code);
	setStorage("country_code_set",country_code);
}

function addressPopup()
{
	if (typeof addressDialog === "undefined" || addressDialog==null || addressDialog=="" ) {
		ons.createDialog('addressPopup.html').then(function(dialog) {
	        dialog.show({"callback":geoCompleteChangeAddress});
	        translatePage();
	        translateValidationForm();
	        $(".new_s").attr("placeholder",  getTrans('Enter your address','enter_your_address') );
	    });
	} else {
		addressDialog.show( {"callback":geoCompleteChangeAddress} );
	}

}

function changeAddress()
{
	$.validate({
	    form : '#frm-adddresspopup',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	        dump('change address');

	        sNavigator.popPage({cancelIfRunning: true}); //back button

	        setStorage("search_address", $(".new_s").val() );
			var cart_params=JSON.stringify(cart);
			if (saveCartToDb()){
			    cart_params='';
			}
		    callAjax("loadCart","merchant_id="+ getStorage('merchant_id')+"&search_address=" +
		    encodeURIComponent($(".new_s").val()) + "&cart="+cart_params +"&transaction_type=" +
		    getStorage("transaction_type") + "&device_id="+ getStorage("device_id") );
	        return false;
	    }
	});
}

function geoCompleteChangeAddress()
{
	dump( "country_code_set=>" + getStorage("country_code_set"));
	if ( empty(getStorage("country_code_set")) ){
		$("#new_s").geocomplete();
	} else {
		$("#new_s").geocomplete({
		   country: getStorage("country_code_set")
	    });
	}
	$(".pac-container").css( {"z-index":99999} );
}

function showNotificationCampaign(title,message)
{

	if (typeof pushcampaignDialog === "undefined" || pushcampaignDialog==null || pushcampaignDialog=="" ) {
		ons.createDialog('pushNotificationCampaign.html').then(function(dialog) {
			$("#page-notificationcampaign .push-title").html(title);
	        $("#page-notificationcampaign .push-message").html(message);
	        dialog.show();
	    });
	} else {
		$("#page-notificationcampaign .push-title").html(title);
	    $("#page-notificationcampaign .push-message").html(message);
		pushcampaignDialog.show();
	}
}

function itemNotAvailable(options)
{
	switch (options)
	{
		case 1:
	//	toastMsg( getTrans("Item not available",'item_not_available') );
		break;

		case 2:
		//toastMsg( getTrans("Ordering is disabled",'ordering_disabled') );
		return;

		break;
	}
}

function number_format(number, decimals, dec_point, thousands_sep)
{
  number = (number + '')
    .replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return s.join(dec);
}

var translator;
var dictionary;

function getLanguageSettings()
{
	if ( !hasConnection() ){
		return;
	}
	var params="&client_token="+getStorage("client_token");
	callAjax("getLanguageSettings",params);
}

function translatePage()
{
	dump("TranslatePage");
	//if (getStorage("translation")!="undefined"){
	if (typeof getStorage("translation") === "undefined" || getStorage("translation")==null || getStorage("translation")=="" ) {
		return;
	} else {
		dictionary =  JSON.parse( getStorage("translation") );
	}
	if (!empty(dictionary)){
		//dump(dictionary);
		var default_lang=getStorage("default_lang");
		//dump(default_lang);
		if (default_lang!="undefined" && default_lang!=""){
			dump("INIT TRANSLATE");
			translator = $('body').translate({lang: default_lang, t: dictionary});
		}
	}
}

function getTrans(words,words_key)
{
	var temp_dictionary='';
	/*dump(words);
	dump(words_key);	*/
	if (getStorage("translation")!="undefined"){
	   temp_dictionary =  JSON.parse( getStorage("translation") );
	}
	if (!empty(temp_dictionary)){
		//dump(temp_dictionary);
		var default_lang=getStorage("default_lang");
		//dump(default_lang);
		if (default_lang!="undefined" && default_lang!=""){
			//dump("OK");
			if ( array_key_exists(words_key,temp_dictionary) ){
				//dump('found=>' + words_key +"=>"+ temp_dictionary[words_key][default_lang]);
				return temp_dictionary[words_key][default_lang];
			}
		}
	}
	return words;
}

function array_key_exists(key, search) {
  if (!search || (search.constructor !== Array && search.constructor !== Object)) {
    return false;
  }
  return key in search;
}

function translateValidationForm()
{
	$.each( $(".has_validation") , function() {
		var validation_type = $(this).data("validation");

		switch (validation_type)
		{
			case "number":
			$(this).attr("data-validation-error-msg",getTrans("The input is not a number",'validation_numeric') );
			break;

			case "required":
			$(this).attr("data-validation-error-msg",getTrans("This information is required!",'validaton_mandatory') );
			break;

			case "email":
			$(this).attr("data-validation-error-msg",getTrans("Invalid email format!",'validation_email') );
			break;
		}

	});
}

function showLanguageList()
{
	if (typeof languageOptions === "undefined" || languageOptions==null || languageOptions=="" ) {
		ons.createDialog('languageOptions.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });
	} else {
		languageOptions.show();
	}
}

function displayLanguageSelection(data)
{
	var selected = getStorage("default_lang");
	dump("selected=>"+selected);
	var htm='';
	htm+='<ons-list>';
	htm+='<ons-list-header class="list-header trn" data-trn-key="language">Language</ons-list-header>';
	$.each( data, function( key, val ) {
		dump(val.lang_id);
		ischecked='';
		if ( val.lang_id==selected){
			ischecked='checked="checked"';
		}
		htm+='<ons-list-item modifier="tappable" onclick="setLanguage('+"'"+val.lang_id+"'"+');">';
		 htm+='<label class="radio-button checkbox--list-item">';
			htm+='<input type="radio" name="country_code" class="country_code" value="'+val.lang_id+'" '+ischecked+' >';
			htm+='<div class="radio-button__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+val.language_code;
		  htm+='</label>';
		htm+='</ons-list-item>';
	});
	htm+='</ons-list>';
	createElement('language-options-list',htm);
	translatePage();
}

function setLanguage(lang_id)
{
	//removeStorage("translation");
	dump( getStorage("translation") );
	if (typeof getStorage("translation") === "undefined" || getStorage("translation")==null || getStorage("translation")=="" ) {
	   languageOptions.hide();
       ons.notification.confirm({
		  message: 'Language file has not been loaded, would you like to reload?',
		  title: dialog_title_default ,
		  buttonLabels: ['Yes', 'No'],
		  animation: 'none',
		  primaryButtonIndex: 1,
		  cancelable: true,
		  callback: function(index) {
		     if ( index==0 || index=="0"){
		     	getLanguageSettings();
		     }
		  }
		});
		return;
	}

	if ( getStorage("translation").length<=5 ){
		onsenAlert("Translation file is not yet ready.");
		return;
	}

	if ( !empty(lang_id) ){
	   setStorage("default_lang",lang_id);
	   if ( !empty(translator)){
	       translator.lang(lang_id);
	   } else {
	   	   translator = $('body').translate({lang: lang_id, t: dictionary});
	   }
	}
}

function applyVoucher()
{

	// if ( checkIfhasOfferDiscount() ){
	// 	return false;
	// }
  console.log(getStorage("order_total"));
	voucher_code = $(".voucher_code").val();
	if ( voucher_code!="" ){
    var amnts=getStorage("order_total").replace(/[^0-9 .]/g, '');
    console.log(amnts);
		var params="voucher_code="+ voucher_code;
		params+="&client_token="+getStorage("client_token");
		params+="&merchant_id="+ getStorage("merchant_id");

		params+="&cart_sub_total="+ getStorage("cart_sub_total");
		params+="&cart_delivery_charges="+ getStorage("cart_delivery_charges");
		params+="&cart_packaging="+ getStorage("cart_packaging");
		params+="&cart_tax="+ getStorage("cart_tax");
		params+="&pts_redeem_amount="+ $(".pts_redeem_amount").val();
    params+="&total="+amnts;


		if ( empty(getStorage("tips_percentage")) ){
	       setStorage("tips_percentage",0);
	    }
	    params+="&tips_percentage=" + getStorage("tips_percentage");

        callAjax("applyVoucher",params);
	} else {
		onsenAlert(  getTrans('Invalid voucher code','invalid_voucher_code') );
	}
}

function removeVoucher()
{
console.log("remove");
	 $(".voucher_amount").val( '' );
    $(".voucher_type").val( '' );
    $(".voucher_code").val('');
    $(".voucher_show").hide();
    $(".apply-voucher").show();
    $(".remove-voucher").hide();
    console.log(getStorage("order_total"));
    console.log(getStorage("voucher_amnt"));
    var amny=parseFloat(getStorage("order_total")) + parseFloat(getStorage("voucher_amnt"));
    $(".tot_prce").html(prettyPrice(amny));
    console.log(amny);
    setStorage("order_total",amny);
    setStorage("final_total_amnt",amny);
    $(".voucher-header").html( getTrans("Voucher",'voucher') );
    $(".total-amount").html( prettyPrice(getStorage("order_total_raw")) );
}

function deviceBackReceipt()
{
	return false;
}

function prettyPrice( price )
{
	dump(price);

	var decimal_place = getStorage("decimal_place");
	var currency_position= getStorage("currency_position");
	var currency_symbol = getStorage("currency_set");
	var thousand_separator = getStorage("thousand_separator");
	var decimal_separator = getStorage("decimal_separator");

	dump("decimal_place=>"+decimal_place);
	dump("currency_symbol=>"+currency_symbol);
	dump("thousand_separator=>"+thousand_separator);
	dump("decimal_separator=>"+decimal_separator);
	dump("currency_position=>"+currency_position);


	price = number_format(price,decimal_place, decimal_separator ,  thousand_separator ) ;
	if ( currency_position =="left"){
		return currency_symbol+" "+price;
	} else {
		return price+" "+currency_symbol;
	}
}

function showExpirationMonth()
{
	if (typeof ExpirationMonthDialog === "undefined" || ExpirationMonthDialog==null || ExpirationMonthDialog=="" ) {
		ons.createDialog('ExpirationMonth.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });
	} else {
		ExpirationMonthDialog.show();
		//translatePage();
	}
}

function fillExpirationMonth()
{
	var htm='';
	htm+='<ons-list>';
	htm+='<ons-list-header class="list-header trn" data-trn-key="expiration_month">Expiration Month</ons-list-header>';
	for (i = 1; i < 13; i++) {
		if (i<=9){
			i="0"+i;
		}
		htm+='<ons-list-item modifier="tappable" onclick="setExpirationMonth('+"'"+i+"'"+');">';
		 htm+='<label class="radio-button checkbox--list-item">';
			htm+='<input type="radio" name="expiration_m" class="expiration_m" value="'+i+'"  >';
			htm+='<div class="radio-button__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+i;
		  htm+='</label>';
		htm+='</ons-list-item>';
	}
	htm+='</ons-list>';
	createElement('expiration-options-list',htm);
	translatePage();
}

function setExpirationMonth(month)
{
	$(".expiration_month").val( month );
	$(".expiration_month_label").html( month );
	ExpirationMonthDialog.hide();
}

function showExpirationYear()
{
	if (typeof showExpirationYearDialog === "undefined" || showExpirationYearDialog==null || showExpirationYearDialog=="" ) {
		ons.createDialog('showExpirationYearDialog.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });
	} else {
		showExpirationYearDialog.show();
	}
}

function fillExpirationYear()
{
	var d = new Date();
    var current_year = d.getFullYear();

	var htm='';
	htm+='<ons-list>';
	htm+='<ons-list-header class="list-header trn" data-trn-key="expiration_year">Expiration Year</ons-list-header>';
	for (i = 0; i < 15; i++) {

		years = parseInt(current_year)+i;

		htm+='<ons-list-item modifier="tappable" onclick="setExpirationYear('+"'"+years+"'"+');">';
		 htm+='<label class="radio-button checkbox--list-item">';
			htm+='<input type="radio" name="expiration_m" class="expiration_m" value="'+years+'"  >';
			htm+='<div class="radio-button__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+years;
		  htm+='</label>';
		htm+='</ons-list-item>';
	}
	htm+='</ons-list>';
	createElement('expiration-year-options-list',htm);
	translatePage();
}

function setExpirationYear(year_value)
{
	dump(year_value);
	$(".expiration_yr").val( year_value );
	$(".expiration_year").html( year_value );
	showExpirationYearDialog.hide();
}

function showCountry()
{
	if (typeof showCountryDialog === "undefined" || showCountryDialog==null || showCountryDialog=="" ) {
		ons.createDialog('showCountryDialog.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });
	} else {
		showCountryDialog.show();
	}
}

function fillCountryList()
{
	var htm='';
	htm+='<ons-list>';
	htm+='<ons-list-header class="list-header trn" data-trn-key="expiration_year">Country List</ons-list-header>';
	$.each( country_json_list , function( key, val ) {
		if(val.code=="GB")
		{
			htm+='<ons-list-item modifier="tappable" onclick="setCardCountry('+"'"+val.code+"'"+');">';
			 htm+='<label class="radio-button checkbox--list-item">';
				htm+='<input type="radio" name="expiration_m" class="expiration_m" value="'+val.code+'"  >';
				htm+='<div class="radio-button__checkmark checkbox--list-item__checkmark"></div>';
				htm+=' '+val.name;
			  htm+='</label>';
			htm+='</ons-list-item>';
	    }
	});
	htm+='</ons-list>';
	createElement('country-options-list',htm);
}

function setCardCountry(country_code)
{
	$(".x_country").val( country_code );
	$(".country_label").html( country_code );
	showCountryDialog.hide();
}

function atzPayNow()
{
    $.validate({
	    form : '#frm-atz',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	       var params = $( "#frm-atz").serialize();
	       params+="&client_token="+getStorage("client_token");
	       params+="&merchant_id="+ getStorage("merchant_id");
	       /*pts*/
	       params+="&earned_points="+ getStorage('earned_points');
	       callAjax("PayAtz",params);
	       return false;
	    }
	});
}
$(document).ready(function(){
    $(".inputTextBox").keypress(function(event){
        var inputValue = event.charCode;
        if(!(inputValue >= 65 && inputValue <= 120) && (inputValue != 32 && inputValue != 0)){
            event.preventDefault();
        }
    });
});
function cpyPayNow()
{
	var cnumbr=$(".cc_number").val();
	var cvnumber=$(".cvv").val();
	if(cnumbr=="")
	{
			onsenAlert("Credit number is required!");
	}
	else if(cnumbr.length < 11 )
	{
			onsenAlert("Credit number must not be less than 12 characteristics length!");
	}
	else if(cvnumber=="")
	{
			onsenAlert("CVV number is required!");
	}
	else if(cvnumber.length < 2)
	{
			onsenAlert("CVV number must not be less than 3 characteristics length!");
	}
    else{
	$.validate({
	    form : '#frm-cpy',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	       var params = $( "#frm-cpy").serialize();
	       params+="&client_token="+getStorage("client_token");
	       params+="&merchant_id="+ getStorage("merchant_id");
	       /*pts*/
	       params+="&earned_points="+ getStorage('earned_points');
	       callAjax("Paycpy",params);
	       return false;
	    }
	});
	}
}


function stripePayNow()
{
	var stripe_publish_key = getStorage('stripe_publish_key');
	dump(stripe_publish_key);
	 $.validate({
	    form : '#frm-stp',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {

	       loader.show();

	       var cards = $(".cc_number").val();
	       var cvv = $(".cvv").val();
	       var expiration_month = $(".expiration_month").val();
	       var expiration_yr = $(".expiration_yr").val();

	       Stripe.setPublishableKey(stripe_publish_key);
	       Stripe.card.createToken({
			  number: cards ,
			  cvc: cvv,
			  exp_month: expiration_month ,
			  exp_year: expiration_yr
		   }, stripeResponseHandler);

	       return false;
	    }
	});
}

function stripeResponseHandler(status, response)
{
	dump('stripe response');
	dump(status);
	dump(response);
	if (response.error) {
		hideAllModal();
	 	onsenAlert( response.error.message );
	} else {
		$(".stripe_token").val( response.id );

	    var params = $( "#frm-stp").serialize();
        params+="&client_token="+getStorage("client_token");
        params+="&merchant_id="+ getStorage("merchant_id");
        callAjax("PayStp",params);
	}
}

var arrs=[];
var carts =new Object();

function autoAddToCart(item_id,price,discount)
{
    if(getStorage("merc_stats") == "Closed")
    {
      onsenAlert( getTrans("Sorry, Merchant is closed",'restaurant_close') );
  		return;
    }



	//dump(item_id);
	//dump(price);
    cart[cart.length]={
	  "item_id":item_id,
	  "qty":1,
	  "price":price,
	  "sub_item":[],
	  "cooking_ref":[],
	  "ingredients":[],
	  'order_notes': '',
	  'discount':discount
	};
	//dump(cart);
	var cart_value={
	  "item_id":item_id,
	  "qty":1,
	  "price":price,
	  "sub_item":[],
	  "cooking_ref":[],
	  "ingredients":[],
	  'order_notes': '',
	  'discount':discount
	};
  dump(cart_value);
	if(saveCartToDb()){
		callAjax("addToCart", "cart="+ JSON.stringify(cart_value) + "&device_id=" + getStorage("device_id") );
	} else {
	    //sNavigator.popPage({cancelIfRunning: true}); //back button
	    onsenAlert(  getTrans("Food added to cart",'item_added_to_cart') );
	}
	showCartNosOrder();
}

function validateCLient()
{
	$.validate({
	    form : '#frm-signup-validation',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	       var params = $( "#frm-signup-validation").serialize();
	       callAjax("validateCLient",params);
	       return false;
	    }
	});
}

function detailsPTS(pts_type)
{
	dump(pts_type);
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {
      	   callAjax('detailsPTS',
		    "client_token="+getStorage("client_token")+"&pts_type="+pts_type
		   );
      }
    };
    sNavigator.pushPage("detailsPTS.html", options);
}

function displayPTSdetails(data)
{
	if (data.length>0){
		var htm='<ons-list class="list-dim-text">';
		$.each( data, function( key, val ) {
		     htm+='<ons-list-item  class="list-item-container" >';
	           htm+='<ons-row class="row">';
	              htm+='<ons-col width="100px" >';
	                htm+=val.date_created;
	              htm+='</ons-col>';
	              htm+='<ons-col >';
	                 htm+=val.label;
	              htm+='</ons-col>';
	              htm+='<ons-col width="20px" >';
	                 htm+=val.points;
	              htm+='</ons-col>';
	           htm+='</ons-row>';
	         htm+='</ons-list-item>';
		});
		htm+='</ons-list>';
		createElement('scroller-pts-details',htm);
	}
}




function applyRedeem()
{

	if ( checkIfhasOfferDiscount() ){
		return false;
	}

	/*pts*/
	redeem_points = $(".redeem_points").val();
	if ( redeem_points!="" ){
		var params="redeem_points="+ redeem_points;
		params+="&client_token="+getStorage("client_token");
		params+="&merchant_id="+ getStorage("merchant_id");
		params+="&voucher_amount="+ $(".voucher_amount").val();
		params+="&subtotal_order="+ getStorage("cart_sub_total");

		params+="&cart_sub_total="+ getStorage("cart_sub_total");
		params+="&cart_delivery_charges="+ getStorage("cart_delivery_charges");
		params+="&cart_packaging="+ getStorage("cart_packaging");
		//params+="&cart_tax_amount="+ getStorage("cart_tax_amount");
		params+="&cart_tax="+ getStorage("cart_tax");

		if ( empty(getStorage("tips_percentage")) ){
	       setStorage("tips_percentage",0);
	    }
	    params+="&tips_percentage=" + getStorage("tips_percentage");

        callAjax("applyRedeemPoints",params);
	} else {
		onsenAlert(  getTrans('Invalid redeem points','invalid_redeem_points') );
	}
}

function cancelRedeem()
{
	$(".pts_redeem_points").val( '' );
    $(".pts_redeem_amount").val( '' );
    $(".pts_pts").show();
    $(".pts_pts_cancel").hide();
    $(".total-amount").html( prettyPrice(getStorage("order_total_raw")) );
}

function backtoHome()
{
	$(".country-list").hide();
	var options = {
  	  closeMenu:true,
      animation: 'slide'
   };
   menu.setMainPage('select_dining.html',options);
}

function hidepop()
{
	$(".country-list").hide();
	var options = {
  	  closeMenu:true,
      animation: 'slide'
   };
  sNavigator.popPage({cancelIfRunning: true});
}

function exitKApp()
{
	ons.notification.confirm({
	  message: getTrans('Do you want to exit?','close_app') ,
	  title: dialog_title_default ,
	  buttonLabels: [ getTrans('Yes','yes') ,  getTrans('No','no') ],
	  animation: 'default', // or 'none'
	  primaryButtonIndex: 1,
	  cancelable: true,
	  callback: function(index) {
	  	   //alert(index);
	  	   // -1: Cancel
           // 0-: Button index from the left
	  	   if (index==0){
				if (navigator.app) {
				   navigator.app.exitApp();
				} else if (navigator.device) {
				   navigator.device.exitApp();
				} else {
				   window.close();
				}
	  	   }
	  }
	});
}

function imageLoaded(div_id)
{
	$(div_id).imagesLoaded()
	  .always( function( instance ) {
	   // console.log('all images loaded');
	  })
	  .done( function( instance ) {
	   // console.log('all images successfully loaded');
	  })
	  .fail( function() {
	  //  console.log('all images loaded, at least one is broken');
	  })
	  .progress( function( instance, image ) {
	    var result = image.isLoaded ? 'loaded' : 'broken';
	    //image.img.parentNode.className = image.isLoaded ? '' : 'is-broken';
		image.img.parentNode.className = image.isLoaded ? '' : '';
	  //  console.log( 'image is ' + result + ' for ' + image.img.src );
	});
}

$( document ).on( "keyup", ".limit_char", function() {
	  var limit=$(this).data("maxl");
	  limit=parseInt(limit);
	  limitText(this,limit);
});

function limitText(field, maxChar){
    var ref = $(field),
        val = ref.val();
    if ( val.length >= maxChar ){
        ref.val(function() {
            //console.log(val.substr(0, maxChar))
            return val.substr(0, maxChar);
        });
    }
}

function toastMsg( message )
{
	if (isDebug()){
		onsenAlert( message );
		return ;
	}
	console.log(window);
    return;
    window.plugins.toast.showWithOptions(
    {
      message: message ,
      duration: "short",
      position: "bottom",
      addPixelsY: -40
    },
    //  toastOnSuccess,
    //  toastOnError
    function(args) {

    },
    function(error) {
      onsenAlert( message );
    }
    );
    console.log(window);
    return;
    window.plugins.toast.showWithOptions(
      {
        message: message ,
        duration: "short",
        position: "bottom",
        addPixelsY: -40
      },
      function(args) {

      },
      function(error) {
      	onsenAlert( message );
      }
    );
}

function isDebug()
{
	//on/off
	//return true;
	return false;
}

var rzr_successCallback = function(payment_id) {
  //alert('payment_id: ' + payment_id)
    var params="payment_id="+payment_id;
	params+="&order_id="+ getStorage("order_id");
	params+="&client_token="+ getStorage("client_token");
	callAjax("razorPaymentSuccessfull",params);
}

var rzr_cancelCallback = function(error) {
  onsenAlert(error.description + ' (Error '+error.code+')')
}


function showEasyCategory(element)
{

	if (typeof myPopover === "undefined" || myPopover==null || myPopover=="" ) {
		ons.createPopover('popover.html').then(function(popover) {
		   popover.show(element,{
		   	 animation:"none"
		   });
		   createElement("category-pop-over-list", easy_category_list );
	    });
	} else {
		myPopover.show(element);
		myPopover.on("postshow", function(e) {
			createElement("category-pop-over-list", easy_category_list );
		});
	}

}


function fillPopOverCategoryList(data)
{
	var html='<ons-list>';
	if( data.length>0){
	   $.each( data, function( key, val ) {
	   	  html+='<ons-list-item modifier="tappable" onclick="loadmenu2('+
             val.category_id+','+val.merchant_id+');"  >'+val.category_name+'</ons-list-item>';
	   });
	}
	html+='</ons-list>';
	dump(html);
	easy_category_list=html;
}

function loadmenu2(cat_id,mtid)
{
	callAjax("getItemByCategory","cat_id="+cat_id+"&merchant_id="+mtid);
	myPopover.hide();
}

function showMenu(element)
{
	if (typeof merhantPopOverMenu === "undefined" || merhantPopOverMenu==null || merhantPopOverMenu=="" ) {
		ons.createPopover('merchantmenu.html').then(function(popover) {
		   popover.show(element,{
		   	 animation:"none"
		   });

		   enabled_table_booking = getStorage('enabled_table_booking');
		    if(enabled_table_booking==2){
		    	$(".book_table_menu").show();
          var rest_name = "";
          rest_name = "'"+getStorage('res_name').replace(/'/g, '')+"'";
				$("#merchnt-pop-menu #bookid-mer").attr('onclick','table_booking_optn('+getStorage('merchant_id')+',\''+getStorage('merc_logo')+'\','+rest_name+',\'hide\');');
		    } else $(".book_table_menu").hide();

		    translatePage();

	    });
	} else {
		merhantPopOverMenu.show(element);

		merhantPopOverMenu.on("preshow", function(e) {
			enabled_table_booking = getStorage('enabled_table_booking');
		    if(enabled_table_booking==2){
		    	$(".book_table_menu").show();
          var rest_name = "";
          rest_name = "'"+getStorage('res_name').replace(/'/g, '')+"'";
				$("#merchnt-pop-menu #bookid-mer").attr('onclick','table_booking_optn('+getStorage('merchant_id')+',\''+getStorage('merc_logo')+'\','+rest_name+',\'hide\');');
		    } else $(".book_table_menu").hide();
		});

		translatePage();
	}
}

function loadPageMerchantInfo()
{
	var options = {
      animation: 'none',
      onTransitionEnd: function() {
      	  displayMerchantLogo2(
	      	     getStorage("merchant_logo") ,
	      	     '' ,
	      	     'page-merchantinfo'
	      );
	      callAjax("getMerchantInfo","merchant_id="+ getStorage('merchant_id'));
      }
    };
    sNavigator.pushPage("merchantInfo.html", options);
    merhantPopOverMenu.hide();
}

function loadBookingForm1()
{
	merhantPopOverMenu.hide();
	loadBookingForm();
}

function loadMoreReviews1()
{
	merhantPopOverMenu.hide();
	loadMoreReviews();
}

function payCityPay(fireurl) {
	var iabRef = null;
	function iabLoadStart(event) {
		//  alert(event.type + ' - ' + event.url);    }
		var successurl;
    var cancelUrl=getStorage("cancelUrl");
    //setStorage("cancelUrl", "http://dev.cuisine.je/PaymentOption/");// for dev
    setStorage("cancelUrl", "https://www.cuisine.je/PaymentOption/");// for live
    if(event.url == cancelUrl)
    {
      	iabRef.close();
    }
	}
		function iabLoadStop(event) {

		setStorage("successurl","https://www.cuisine.je/store/paymentProcessing/id/"+getStorage('order_id')+"/citypay_success/true");//for live
    //setStorage("successurl","http://dev.cuisine.je/store/paymentProcessing/id/"+getStorage('order_id')+"/citypay_success/true");// for dev

		successurl= getStorage("successurl");
    cancelUrl=getStorage("cancelUrl");
		console.log(event.url);
		console.log(successurl);
		if (event.url == successurl) {
				iabRef.close();
			}
    else if(event.url == cancelUrl)
    {
      	iabRef.close();
    }
		}
		function iabLoadError(event) {
			 //  alert(event.type + ' - ' + event.message);
		}
		function iabClose(event) {
			console.log(successurl);
			console.log("close event");
			console.log(event.url);
			if(event.url == successurl) {
			console.log("Equals");
		var options = {
			animation: 'slide',onTransitionEnd: function() {
				displayMerchantLogo2(getStorage("merchant_logo") ,getStorage("final_total_amnt") ,'page-booking-ty');
		 $(".book-ty-msg").html(data.msg);
		 }
		};
		sNavigator.pushPage("bookingTY.html", options);
		}else{
		console.log("Not set");
    onsenAlert("Payment cancelled");
		}
	  //  alert(event.url);
			// iabRef.removeEventListener('loadstart', iabLoadStart);
			   //   iabRef.removeEventListener('loadstop', iabLoadStop);
					  // iabRef.removeEventListener('loaderror', iabLoadError);
							//iabRef.removeEventListener('exit', iabClose);
	}
	iabRef = cordova.InAppBrowser.open(fireurl, '_blank', 'location=no','toolbar=no','clearcache=yes','zoom=no','EnableViewPortScale=no');
	iabRef.addEventListener('loadstart', iabLoadStart);
	iabRef.addEventListener('loadstop', iabLoadStop);
	// iabRef.removeEventListener('loaderror', iabLoadError);
	iabRef.addEventListener('exit', iabClose);
}


function searchMerchantMap() {
	var options = {
      animation: 'none',
      onTransitionEnd: function() {

      }
	};
	//menu.setMainPage("searchMap.html",options);
	//sNavigator.pushPage("searchMap.html", options);
	menu.setMainPage('searchMap.html',options);
}

function loadRestuarantCategoryfromMap(mtId) {
	//var options = {parish:"",cuisine:"",closeMenu:true,animation: 'slide',onTransitionEnd: function() {
		loadRestaurantCategory(mtId);
	//}};

	//Its not working.. Issue with sNavigator not loaded .. Need help on this from Mubarak or Vijay
	//sNavigator.pushPage('menucategory.html',options);

}

function displayRestaurantResultsOnMap(data) {
	//Get all the restaurants info and parse the lat and long
	//var JERSEY = new plugin.google.maps.LatLng(49.217231, -2.140589 ); //Center of JERSEY

	//$('#searchmap_canvas_div').css('height', $(window).height() - $('#searchmap_canvas_div').offset().top);
	var mapNew = new google.maps.Map(document.getElementById('searchmap_canvas_div'), {
		zoom: 13,
		center: {lat: 49.217231, lng: -2.140589}
	  });
	  var i=1;
	  $.each(data, function( key, val ) {
		if(val.latitude) {
			pLat = parseFloat(val.latitude);
			pLong = parseFloat(val.longitude);
		//	dump("types: " + (typeof pLat) + ", " + (typeof pLong));
			var point = new google.maps.LatLng(pLat,pLong);
		//	var entry = {'position': point,'title': val.restaurant_name,'icon': {'url': 'https://www.cuisine.je/assets/images/menu-icon.png' }};
		var htm='';
		if(!empty(val.service)){ // For delivery and pick up
			htm+='<ul style="list-style: none;">';
				$.each( val.services, function( key_service, val_services ) {
						htm+='<li >'+val_services+' <i class="green-color ion-android-checkmark-circle"></i></li>';
				  });
			htm+='</ul>';
		  }
		var contentString = '<h3 class="text-center">'+val.restaurant_name+'</h3><p>'+val.cuisine+'</p><p>'+ val.address+'</p> <div style="display:flex"> <img src='+val.logo+' height="60" width="60" >'+htm+'</div><p onclick="loadRestuarantCategoryfromMap('+val.merchant_id+')">Click here for the menu</p>';

		// var contentString = '<div id="iw-container">' +
    //                 '<div class="iw-title">'+val.restaurant_name+'</div>' +
    //                 '<div class="iw-content">' +
    //                   '<div class="iw-subTitle">'+val.cuisine+'</div>' +
    //                   '<img src="'+val.logo+'" alt="" height="115" width="83">' +
    //                   	htm+
    //                   //'<div class="iw-subTitle">Contacts</div>' +
    //                   '<p>'+ val.address+'<br>'+
    //                 '</div>' +
		// 			'<p onclick="loadRestuarantCategoryfromMap('+val.merchant_id+')">Click here for the menu</p>'
    //                 '<div class="iw-bottom-gradient"></div>' +
    //               '</div>';
		//to do : to also show the book a table option in the info window
		var infowindow = new google.maps.InfoWindow({
			content: contentString
		  });

			setTimeout(function() {
				var marker = new google.maps.Marker({
				  position: point ,//{lat: val.latitude, lng: val.longitude},
				  title: val.restaurant_name,
				  icon: {url: cuisine_url+'/assets/images/menu-icon.png' },
				  map: mapNew,
				  animation: google.maps.Animation.DROP,
				  merchant_id:val.merchant_id //set the merchant id so when we click on it we can take them to the restaurant menu
				});
				google.maps.event.addListener(infowindow, 'domready', function() {
          //
					// var iwOuter = $('.gm-style-iw');
					// var iwBackground = iwOuter.prev();
					// iwBackground.children(':nth-child(2)').css({'display' : 'none'});
					// iwBackground.children(':nth-child(4)').css({'display' : 'none'});
					// iwOuter.parent().parent().css({left: '115px'});
					// iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 76px !important;'});
					// iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 76px !important;'});
					// iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});
					// var iwCloseBtn = iwOuter.next();
					// iwCloseBtn.css({opacity: '1', right: '38px', top: '3px', border: '7px solid #DD2C33', 'border-radius': '13px', 'box-shadow': '0 0 5px #DD2C33'});
					// if($('.iw-content').height() < 140){
					// 	$('.iw-bottom-gradient').css({display: 'none'});
					// }
					// iwCloseBtn.mouseout(function(){
					// 	$(this).css({opacity: '1'});
					// });
				});
				marker.addListener('click', function() {
					infowindow.open(mapNew, marker);
				});
				google.maps.event.addListener(mapNew, 'click', function() {
					infowindow.close();
				});
			}, i*200);

		}
		i++;
	});

}



function addMarkers(data, callback) {
  var markers = [];
  function onMarkerAdded(marker) {
    markers.push(marker);
    if (markers.length === data.length) {
      callback(markers);
    }
  }
  data.forEach(function(markerOptions) {
    map.addMarker(markerOptions, onMarkerAdded);
  });
}


function getLocationAccuracy()
{
	var networkState = navigator.connection.type;
	switch (networkState)
	{
		case "Connection.WIFI":
		case "wifi":
		return false;
		break;

		default:
		return true;
		break;
	}
}

function loadMap()
{

	//merhantPopOverMenu.hide();

	var options = {
      animation: 'none',
      onTransitionEnd: function() {
      	  checkGPS();
      }
    };
    sNavigator.pushPage("map.html", options);
}

function checkGPS()
{
	 if (isDebug()){
	 	viewTaskMapInit();
		return ;
	 }

	 if (device.platform =="iOS"){
	 	viewTaskMapInit();
	 	 return;
	 }


 	var can_request=true;
	cordova.plugins.locationAccuracy.canRequest(function(canRequest){
	 	 if(!canRequest){
	 	 	can_request=false;
	 	 	var _message=getTrans('Your device has no access to location. Would you like to switch to the Location Settings page and do this manually?','location_off')
		   	   ons.notification.confirm({
				  message: _message,
				  title: dialog_title_default ,
				  buttonLabels: ['Yes', 'No'],
				  animation: 'none',
				  primaryButtonIndex: 1,
				  cancelable: true,
				  callback: function(index) {
				     if ( index==0 || index=="0"){
				     	cordova.plugins.diagnostic.switchToLocationSettings();
				     }
				  }
			 });
	 	 }
	});

	if(!can_request){
		return;
	}


     cordova.plugins.locationAccuracy.request( onRequestSuccessMap,
	 onRequestFailureMap, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
}

function onRequestSuccessMap(success){
    //alert("Successfully requested accuracy: "+success.message);
    viewTaskMapInit();
}

function onRequestFailureMap(error){
    //alert("Accuracy request failed: error code="+error.code+"; error message="+error.message);
    if(error.code == 4){
    	onsenAlert( getTrans("You have choosen not to turn on location accuracy",'turn_off_location') );
    	checkGPS();
    } else {
    	onsenAlert( error.message );
    }
}






function viewTaskMapInit()
{

	//loader.show();

	merchant_latitude = getStorage("merchant_latitude");
	merchant_longtitude = getStorage("merchant_longtitude");

	//dump(  merchant_latitude );
	//dump( merchant_longtitude );

	google_lat = new plugin.google.maps.LatLng( merchant_latitude , merchant_longtitude );
	//alert("Merchant"+google_lat);
	setTimeout(function(){
        var div = document.getElementById("map_canvas_div");
        $('#map_canvas_div').css('height', $(window).height() - $('#map_canvas_div').offset().top);
			//$("#map_canvas_div .mlat").val(merchant_latitude);
			//$("#map_canvas_div .mlng").val(merchant_longtitude);
        map = plugin.google.maps.Map.getMap(div, {
	     'camera': {
	      'latLng': google_lat,
	      'zoom': 14
	     }
	    });
        //map.setBackgroundColor('white');

        map.on(plugin.google.maps.event.MAP_READY, onMapInit);

    }, 500); // and timeout for clear transitions
}


//https://github.com/mapsplugin/cordova-plugin-googlemaps-doc/blob/master/v2.0.0/class/Map/README.md
//some methods like setCenter, setZoom have changed to , setCameraTarget, setCameraZoom in version 2.0. Old version is 1.4. raj 23.10.17
function onMapInit()  {

	merchant_latitude = getStorage("merchant_latitude");
	merchant_longtitude = getStorage("merchant_longtitude");
	delivery_address = getStorage("merchant_address");


	var GOOGLE = new plugin.google.maps.LatLng( merchant_latitude , merchant_longtitude);
	map.clear();
	map.off();
	map.setCameraTarget(GOOGLE);
	map.setCameraZoom(14);

    map.addMarker({
	  'position': new plugin.google.maps.LatLng( merchant_latitude , merchant_longtitude ),
	  'title': delivery_address ,
	  'snippet': getTrans( "Destination" ,'destination'),
	  'icon': {
	    'url': getStorage("destination_icon")
	   }
     }, function(marker) {

     	marker.showInfoWindow();

     	navigator.geolocation.getCurrentPosition( function(position) {

			 var your_location = new plugin.google.maps.LatLng(position.coords.latitude , position.coords.longitude);
			 var destination = new plugin.google.maps.LatLng( merchant_latitude , merchant_longtitude );

	    	  map.addPolyline({
			    points: [
			      destination,
			      your_location
			    ],
			    'color' : '#AA00FF',
			    'width': 10,
			    'geodesic': true
			   }, function(polyline) {

			   	  map.animateCamera({
					  'target': your_location,
					  'zoom': 17,
					  'tilt': 30
					}, function() {

					   var data = [
				          {
				            'title': getTrans('I am here','you_are_here'),
				            'position': your_location ,
				            'icon': {
							    'url': getStorage("from_icon")
							  }
				          }
				       ];

				       hideAllModal();

					   addMarkers(data, function(markers) {
					    markers[markers.length - 1].showInfoWindow();
					   });

				   });

			   });
	    	 // end position success

	      }, function(error){
	      	 hideAllModal();
	    	 onsenAlert( error.message );
	    	 // end position error
	      },
          { timeout: 10000, enableHighAccuracy : getLocationAccuracy() }
        );

     });
}

function addMarkers(data, callback) {
  var markers = [];
  function onMarkerAdded(marker) {
    markers.push(marker);
    if (markers.length === data.length) {
      callback(markers);
    }
  }
  data.forEach(function(markerOptions) {
    map.addMarker(markerOptions, onMarkerAdded);
  });
}


function getLocationAccuracy()
{
	var networkState = navigator.connection.type;
	switch (networkState)
	{
		case "Connection.WIFI":
		case "wifi":
		return false;
		break;

		default:
		return true;
		break;
	}
}

function viewTaskDirection()
{
	merchant_latitude = getStorage("merchant_latitude");
	merchant_longtitude = getStorage("merchant_longtitude");

	navigator.geolocation.getCurrentPosition( function(position) {

         //var your_location = new plugin.google.maps.LatLng(parseFloat(position.coords.latitude) ,parseFloat(position.coords.longitude));
		 var your_location=(position.coords.latitude+","+position.coords.longitude);

         //var yourLocation = new plugin.google.maps.LatLng(34.039413 , -118.25480649999997);

         //var destination_location = new plugin.google.maps.LatLng(parseFloat(merchant_latitude) ,parseFloat( merchant_longtitude));
         var destination_location=(merchant_latitude+","+merchant_longtitude);
		//from the new plugin for launching the navigation
		launchnavigator.navigate(destination_location, {
			start: your_location
		});

    	 // end position success
      }, function(error){
    	 onsenAlert( error.message );
    	 // end position error
      },
      { timeout: 10000, enableHighAccuracy : getLocationAccuracy() }
    );

}

function initIntelInputs()
{
	 var mobile_country_code=getStorage("mobile_country_code");
	 dump(mobile_country_code);
	 if(!empty(mobile_country_code)){
	 	 $(".mobile_inputs").intlTelInput({
		    autoPlaceholder: false,
		    defaultCountry: mobile_country_code,
		    autoHideDialCode:true,
		    nationalMode:false,
		    autoFormat:false,
		    utilsScript: "lib/intel/lib/libphonenumber/build/utils.js"
		 });
	 } else {
		 $(".mobile_inputs").intlTelInput({
		    autoPlaceholder: false,
		    autoHideDialCode:true,
		    nationalMode:false,
		    autoFormat:false,
		    utilsScript: "lib/intel/lib/libphonenumber/build/utils.js"
		 });
	 }
}

function showVerifyAccountPage()
{
	 var options = {
	      animation: 'slide',
	      onTransitionEnd: function() {
	      }
	  };
	  sNavigator.pushPage("verify-account.html", options);
}

function verifyAccount()
{
	$.validate({
	    form : '#frm-verify-account',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	      var params = $( "#frm-verify-account").serialize();
	      callAjax("verifyAccount",params);
	      return false;
	    }
	});
}

function checkIfhasOfferDiscount()
{
	var has_discount = getStorage("has_discount");
	if(!empty(has_discount)){
		if(has_discount==1){
		   onsenAlert(  getTrans('Discount is already applied','discount_offer') );
		   return true;
		}
	}
	return false;
}

function showPageAdressSelection()
{
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {
      }
   };
   sNavigator.pushPage("address-selection.html", options);
}

function showManualAddressInput()
{
	//$("#del-addrs").hide();
	//$(".manual-address-input").toggle();

}

$(document).on('click', '#lookupButton', function () {
    var pin = $("#lookupInput").val();
    if (pin == '') {
      alert("Please enter a valid Jersey post code, starts with JE....");
    }
    else {

      $("lookupButton").html("Please Wait...");
      var url = "https://api.getaddress.io/find/" + pin + "?api-key=iew8IndDYEuCA4ef5_5oRw11062";
      $.ajax({
          url: url,
          dataType: 'json',
          success: function( data ) {
          if(data == '')
          {
              $("#lookupDropdown").hide();
          }
          else
            {
              $("#lookupDropdown").show();
              $("#lookupDropdown").empty();
              $("#lookupDropdown").append("<option value='' disabled selected>Pickup from this list</option>")
              $.each(data.addresses, function (key, value) {
				  var val = value;
				  value = value.replace(/'/g, "");

                val = val.replace(/,/g, "");
                $("#lookupDropdown").append("<option value='" + value + "'>" + val + "</option>")
              });
            }
              $("lookupButton").html("lookup");
          },
          error: function( data ) {
            onsenAlert( "Invalid Postcode" );
          }
      });

    }
  });

  $(document).on('change', '#lookupDropdown', function () {
    var chngeval = this.value;
    chngeval = chngeval.split(',');

	$("#location_name").val(chngeval[0]);
	if($(".location_name").length>0)
	{
		$(".location_name").val(chngeval[0]);
	}
	
	$(".stree_1").val(chngeval[1]);
	$(".city_1").val(chngeval[4] + "," + chngeval[5]);
	$(".state_1").val(chngeval[4]);	

   /*  $(".stree_1").val(chngeval[0]+chngeval[1]+chngeval[2]+chngeval[3]);
    $(".city_1").val(chngeval[4] + "," + chngeval[5]);
    $(".state_1").val(chngeval[4] ); */
  });

function setManualAddress()
{
	$.validate({
	    form : '#frm-manual-address',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	       $(".street").val( $(".stree_1").val()  );
	       $(".city").val( $(".city_1").val()  );
	       $(".state").val( $(".state_1").val()  );
	       $(".zipcode").val( $(".zipcode_1").val()  );

	       var complete_address = $(".street").val();
	       complete_address+=" "+ $(".city").val();
	       complete_address+=" "+ $(".state").val();
	       complete_address+=" "+ $(".zipcode").val();

           $(".google_lat").val( '' );
		   $(".google_lng").val( '' );
		   $(".formatted_address").val( '' );

	       $(".delivery-address-text").val( complete_address );
		//	$(".manual-address-input").toggle();
		//	$("#del-addrs").show();
	       //sNavigator.popPage({cancelIfRunning: true});
	       return false;
	    }
	});
}

function showMapAddress(map_address_action)
{
	//$("#del-addrs").hide();
	setStorage("map_address_action",map_address_action)

	var options = {
      animation: 'none',
      onTransitionEnd: function() {
      	 checkGPS_AddressMap();
      }
    };
    sNavigator.pushPage("address-bymap.html", options);
}


function checkGPS_AddressMap()
{
	//puta

	$('#map_canvas_address').css('height', $(window).height() - $('#map_canvas_address').offset().top);

	if ( $(".search_address_geo").exists() ){

		dump('checkGPS_AddressMap');
		$('.map_search_field_wrap').css('height',"auto");

		$( document ).on( "click", "#search_address_geo", function() {
		   $('.map_search_field_wrap').css('height', $(window).height() - $('.map_search_field_wrap').offset().top);
		   $(".search_address_geo").val('');
		});

		var country_code_set=getStorage("country_code_set");
		if ( empty(getStorage("country_code_set")) ){
			country_code_set='';
		}
		$(".search_address_geo").geocomplete({
		   country: country_code_set
	    }).bind("geocode:result", function(event, result){

	    	 dump(result);

	    	 $('.map_search_field_wrap').css('height',"auto");

	    	 var address = "", city="", state="" ;
			 var zip = "", formatted_address="", s_lat='', s_lng='';

			 formatted_address=result.formatted_address;

	    	 $.each(result.address_components, function(){
	            switch(this.types[0]){
	                case "postal_code":
	                    zip = this.short_name;
	                    break;
	                case "street_address":
	                    address = this.short_name;
	                    break;
	                case "administrative_area_level_1":
	                    state = this.short_name;
	                    break;
	                case "locality":
	                    city = this.short_name;
	                    break;
	            }
	        });

	        dump("formatted_address=>"+formatted_address);
	        dump("address=>"+address);
	        dump("city=>"+city);
	        dump("state=>"+state);
	        dump("zip=>"+zip);

	         s_lat = result.geometry.location.lat();
	         s_lng = result.geometry.location.lng();

	         if(!isDebug()){
		         var geo_loc = new plugin.google.maps.LatLng( s_lat , s_lng );

		         map.getCameraPosition(function(camera) {

					map.setCameraTarget(geo_loc);
					map.setCameraZoom(camera.zoom);
			         drag_marker.setPosition(geo_loc);
			         drag_marker.setTitle( formatted_address );
		             drag_marker.showInfoWindow();

		         });
	         }

	         var map_address_action=getStorage("map_address_action");
	         dump(map_address_action);

	         setStorage("map_address_result_address", address );
			 setStorage("map_address_result_city", city );
			 setStorage("map_address_result_state",state);
			 setStorage("map_address_result_zip",zip);
			 setStorage("map_address_result_formatted_address",formatted_address);

			 setStorage("google_lat", result.geometry.location.lat() );
			 setStorage("google_lng", result.geometry.location.lng() );

	    });
	} /*end search geo*/

	if(isDebug()){
		return;
	}

	if ( device.platform =="iOS"){
	 	 MapInit_addressMap();
	 	 return;
	}


	var can_request=true;
	cordova.plugins.locationAccuracy.canRequest(function(canRequest){
	 	 if(!canRequest){
	 	 	can_request=false;
	 	 	var _message=getTrans('Your device has no access to location. Would you like to switch to the Location Settings page and do this manually?','location_off')
		   	   ons.notification.confirm({
				  message: _message,
				  title: dialog_title_default ,
				  buttonLabels: ['Yes', 'No'],
				  animation: 'none',
				  primaryButtonIndex: 1,
				  cancelable: true,
				  callback: function(index) {
				     if ( index==0 || index=="0"){
				     	cordova.plugins.diagnostic.switchToLocationSettings();
				     }
				  }
			 });
	 	 }
	});

	if(!can_request){
		return;
	}


	cordova.plugins.locationAccuracy.request( function(success){

		MapInit_addressMap();

	} ,  function(error){

		if(error.code == 4){
	    	checkGPS_AddressMap();
	    } else {
	    	onsenAlert( error.message );
	    }

	} , cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
}

function MapInit_addressMap()
{

	 loader.show();

	 drag_marker_bounce=1;

     navigator.geolocation.getCurrentPosition( function(position) {

	 var your_location = new plugin.google.maps.LatLng( position.coords.latitude , position.coords.longitude );

		setTimeout(function(){

	        var div = document.getElementById("map_canvas_address");
	        $('#map_canvas_address').css('height', $(window).height() - $('#map_canvas_address').offset().top);
	       // $('#map_canvas_address').css('height', '200px');

	        map = plugin.google.maps.Map.getMap(div, {
			         'camera': {
			         'latLng': your_location,
			         'zoom': 17
			        }
			      });

		       // map.setBackgroundColor('white');

			   map.addEventListener(plugin.google.maps.event.MAP_READY, function onMapInit(map) {

				map.clear();
				map.off();
				map.setCameraTarget(your_location);
				map.setCameraZoom(17);

		        	callAjax("coordinatesToAddress","lat=" + position.coords.latitude + "&lng="+ position.coords.longitude );


		        	map.addEventListener(plugin.google.maps.event.MAP_CLICK, function onMapClick(latLng) {
	                     //alert("Map was long clicked.\n" + latLng.toUrlValue());
	                     var lat_lng= latLng.toUrlValue();
	                     lat_lng=explode(",",lat_lng);
	                     /*alert(lat_lng[0]);
	                     alert(lat_lng[1]);*/
		            });/* even listner*/

		            map.addEventListener(plugin.google.maps.event.CAMERA_CHANGE, function onMapCamera(position) {
	                    //alert(JSON.stringify(position));
	                    /*alert( position.target.lat );
	                    alert( position.target.lng );*/

	                    //drag_marker.remove();

	                    var new_location = new plugin.google.maps.LatLng( position.target.lat , position.target.lng );
	                    /*map.addMarker({
						  'position': new_location
						}, function(marker) {
							drag_marker=marker;
	                    });*/
	                    //alert(position.target.lat);

	                    if(drag_marker_bounce==2){
		                    //toastMsg('CAMERA CHANGE =>' + position.target.lat );
		                    drag_marker.setPosition(new_location);
		                    drag_marker.hideInfoWindow();

		                    $(".change_cemara_action").val("getAddress");
		                    $(".change_cemara_lat").val(  position.target.lat );
		                    $(".change_cemara_lng").val( position.target.lng );

		                    $(".use-location").html( getTrans("Get Address",'get_address') );
	                    }

	                    /*if(drag_marker_bounce==2){
	                       callAjax("coordinatesToAddress","lat=" + position.target.lat + "&lng="+ position.target.lng );
	                    }*/

		            });/* even listner*/

		       });/* even listner*/


	    }, 1000); // and timeout for clear transitions


	  }, function(error){
	  	 hideAllModal();
    	 onsenAlert( error.message );
      },
      { timeout: 10000, enableHighAccuracy : getLocationAccuracy() }
    );
}

function useThisLocation()
{

	var data_action=$(".change_cemara_action").val();
	//toastMsg(data_action);
	if ( data_action=="getAddress"){
		var lat = $(".change_cemara_lat").val();
		var lng = $(".change_cemara_lng").val();
		//toastMsg( lat + "=>"+ lng );
		$(".change_cemara_action").val('');
		$(".use-location").html( getTrans("Use this address",'use_this_address') );
		callAjax("dragMarker","lat=" + lat + "&lng="+ lng );
		return;
	}

	var map_address_action=getStorage("map_address_action");
	//alert(map_address_action);
	dump(map_address_action);

	switch (map_address_action){
		case "mapaddress":
        $(".address").val(getStorage("map_address_result_address_full"));
	     $(".street").val( getStorage("map_address_result_address") );
			$(".city").val( getStorage("map_address_result_city") );
			$(".state").val( getStorage("map_address_result_state") );
			$(".zipcode").val( getStorage("map_address_result_zip") );

			//Fill these too
			$(".stree_1").val( getStorage("map_address_result_address") );
			$(".city_1").val( getStorage("map_address_result_city") );
			$(".state_1").val( getStorage("map_address_result_state") );
			$(".zipcode_1").val( getStorage("map_address_result_zip") );

			$(".google_lat").val( getStorage("google_lat") );
			$(".google_lng").val( getStorage("google_lng") );
			$(".formatted_address").val( getStorage("map_address_result_formatted_address") );

			$(".delivery-address-text").val( getStorage("map_address_result_formatted_address") );
			//$("#del-addrs").show();
		    //sNavigator.popPage({cancelIfRunning: true}); //back button
		    sNavigator.popPage({cancelIfRunning: true}); //back button
		//	return false;
		break;

		case "changeaddress":

		   sNavigator.popPage({cancelIfRunning: true}); //back button
		   setStorage("search_address", getStorage("map_address_result_formatted_address") );

		   var cart_params=JSON.stringify(cart);
		   if (saveCartToDb()){
		      var cart_params='';
		   }

		   callAjax("loadCart","merchant_id="+ getStorage('merchant_id')+"&search_address=" +
		   encodeURIComponent( getStorage("search_address") ) + "&cart="+cart_params +"&transaction_type=" +
		   getStorage("transaction_type") + "&device_id="+ getStorage("device_id") );

		   sNavigator.popPage({cancelIfRunning: true}); //back button
		  // sNavigator.popPage({cancelIfRunning: true}); //back button
		   //return false;
		break;

		default:
		  sNavigator.popPage({cancelIfRunning: true}); //back button
		break;
	}
}

function showChangeAddressPage(object)
{
   var options = {
      animation: 'slide',
      onTransitionEnd: function() {
      }
   };
   sNavigator.pushPage("change-address.html", options);
}

function showOrderOptions(order_id)
{
	dump(order_id);
	var options = {
      animation: 'none',
      onTransitionEnd: function() {
      	  $(".order_option_order_id").val( order_id );
      }
   };
   sNavigator.pushPage("order-options.html", options);
}

function showHistoryDetails(booking_id)
{
	dump(booking_id);
	var options = {
      animation: 'none',
      onTransitionEnd: function() {
		var params="client_token="+ getStorage("client_token")+"&booking_id="+booking_id+"&client_id="+getStorage("client_id");
      	callAjax("getBookingDetails",params);

      	  $(".booking_id").val( booking_id );
      }
   };
   sNavigator.pushPage("booking_history.html", options);
}



function showOrderDetails2()
{
	showOrderDetails( $(".order_option_order_id").val() );
}

function reOrder2()
{
	reOrder( $(".order_option_order_id").val() );
}

function showTrackPage()
{
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {

      	  //$('.track-status-wrap').css('height', $(window).height() - $('.track-status-wrap').offset().top - 80  );

      	  var params='order_id=' + $(".order_option_order_id").val();
      	  params+="&client_token="+getStorage("client_token");
		  callAjax("trackOrderHistory",params);

		  stopTrackInterval();
		  //track_order_interval = setInterval(function(){runTrackOrder()}, 7000);

      }
   };
   sNavigator.pushPage("track-order.html", options);
}

function showTrackingPage()
{
	var options = {
      animation: 'none',
      onTransitionEnd: function() {

      	  $(".driver_avatar").attr("src", $(".driver_avatar").val() );
      	  $("._driver_name").html( $(".driver_name").val() );
      	  $(".call_driver").attr("href","tel:"+ $(".driver_phone").val() );

      	  MapInit_Track();

      	  /*stopTrackMapInterval();
      	  track_order_map_interval = setInterval(function(){runTrackMap()}, 7000);*/
      }
   };
   sNavigator.pushPage("tracking-page.html", options);
}

function MapInit_Track()
{
	if(isDebug()){
		return ;
	}

	var driver_lat=$(".driver_lat").val();
	var driver_lng=$(".driver_lng").val();

	var task_lat=$(".task_lat").val();
	var task_lng=$(".task_lng").val();


	var driver_location = new plugin.google.maps.LatLng( driver_lat , driver_lng );
	var destination = new plugin.google.maps.LatLng( task_lat , task_lng );

	setTimeout(function(){

        var div = document.getElementById("map_canvas_track");
        $('#map_canvas_track').css('height', $(window).height() - $('#map_canvas_track').offset().top);

	         map = plugin.google.maps.Map.getMap(div, {
		         'camera': {
		         'latLng': driver_location,
		         'zoom': 17
		        }
		      });

	       // map.setBackgroundColor('white');

	        map.addEventListener(plugin.google.maps.event.MAP_READY, function onMapInit2(map) {

	        	map.clear();
	        	map.off();
	        	map.setCameraTarget(driver_location);
	        	map.setCameraZoom(17);

	        	 map.addMarker({
				  'position': driver_location ,
				  'title': $(".driver_name").val(),
				  'snippet': getTrans( "Driver Name" ,'driver_name'),
				  'icon': {
				    'url': $(".driver_icon").val()
				  }
			     }, function(marker) {

	        	       marker.showInfoWindow();

	        	        map.addPolyline({
						    points: [
						      driver_location,
						      destination
						    ],
						    'color' : '#AA00FF',
						    'width': 10,
						    'geodesic': true
						   }, function(polyline) {

						   	  map.animateCamera({
								  'target': destination,
								  'zoom': 17,
								  'tilt': 30
								}, function() {

								   var data = [
							          {
							            'title': $(".delivery_address").val() ,
							            'position': destination ,
							            'snippet': getTrans( "Delivery Address" ,'delivery_address'),
							            'icon': {
									       'url': $(".address_icon").val()
									    }
							          }
							       ];

								   addMarkers(data, function(markers) {
								      markers[markers.length - 1].showInfoWindow();
								      markers[markers.length - 1].setAnimation(plugin.google.maps.Animation.BOUNCE);
								   });

							   });

						 });
				    	 // end addPolyline

				    	 stopTrackMapInterval();
      	                 track_order_map_interval = setInterval(function(){runTrackMap()}, 10000);

			     });  /*end marker*/

	       });/* even listner*/

	    }, 500); // and timeout for clear transitions
}


function submitContactForm()
{
	$.validate({
	    form : '#frm-enter-contact',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	      var params = $( "#frm-enter-contact").serialize();
	      params+="&client_token="+ getStorage('client_token');
	      callAjax("saveContactNumber",params);
	      return false;
	    }
	});
}

function playNotification()
{
	 var sound_url= "file:///android_asset/www/audio/fb-alert.mp3";
	 dump(sound_url);
	 if(!empty(sound_url)){
        playAudio(sound_url);
	 }
}

var my_media;

function playAudio(url) {
    // Play the audio file at url
    my_media = new Media(url,
        // success callback
        function () {
            dump("playAudio():Audio Success");
            my_media.stop();
            my_media.release();
        },
        // error callback
        function (err) {
            dump("playAudio():Audio Error: " + err);
        }
    );
    // Play audio
    my_media.play();
}

function stopNotification()
{
	my_media.stop();
    my_media.release();
}

function saveCartToDb()
{
	var mobile_save_cart_db= getStorage("mobile_save_cart_db");
	if(mobile_save_cart_db==1){
		return true;
	}
	return false;
}

function runTrackOrder()
{
	if ($('#page-track-order').is(':visible')) {
	   dump("runTrackOrder");
	   var params='order_id=' + $(".order_option_order_id").val();
       params+="&client_token="+getStorage("client_token");
       callAjax("trackOrderHistory",params);
	} else {
		dump("stop runTrackOrder");
		stopTrackInterval();
	}
}

function reRunTrackOrder(){
   stopTrackInterval();
   track_order_interval = setInterval(function(){runTrackOrder()}, 7000);
}

function reRunTrackOrder2()
{
	sNavigator.popPage({cancelIfRunning: true}); //back button
	stopTrackInterval();
    track_order_interval = setInterval(function(){runTrackOrder()}, 7000);
}

function stopTrackInterval() {
    clearInterval(track_order_interval);
}

function stopTrackMapInterval() {
    clearInterval(track_order_map_interval);
}

function runTrackMap()
{
	if ($('#tracking-page').is(':visible')) {
	   dump("runTrackMap");
	   stopTrackMapInterval();
	   var params='order_id=' + $(".order_option_order_id").val();
       params+="&client_token="+getStorage("client_token");
       callAjax("trackOrderMap",params);
	} else {
		dump("stop runTrackMap");
		stopTrackMapInterval();
	}
}

function reInitTrackMap(data)
{
	dump('reInitTrackMap');
	dump(data);
    var driver_lat = data.driver_lat;
	var driver_lng = data.driver_lng;

	var task_lat = data.task_lat;
	var task_lng = data.task_lng;

	if(isDebug()){
		dump("driver location=>" + driver_lat + ":"+ driver_lng);
		dump("task location=>" + task_lat + ":"+ task_lng);
		return;
	}

	var driver_location = new plugin.google.maps.LatLng( driver_lat , driver_lng );
	var destination = new plugin.google.maps.LatLng( task_lat , task_lng );

	map.getCameraPosition(function(camera) {
	  var data = ["Current camera position:\n",
	      "latitude:" + camera.target.lat,
	      "longitude:" + camera.target.lng,
	      "zoom:" + camera.zoom,
	      "tilt:" + camera.tilt,
	      "bearing:" + camera.bearing].join("\n");

	      //toastMsg(data);

	    var camera_location = new plugin.google.maps.LatLng( camera.target.lat , camera.target.lng );

		map.clear();
		map.off();
		map.setCameraTarget(camera_location);
		map.setCameraZoom(camera.zoom);

	    var data = [
		 {
	        'title': $(".driver_name").val(),
	        'position': driver_location ,
	        'snippet': getTrans( "Driver Name" ,'driver_name'),
	        'icon': {
		       'url': $(".driver_icon").val()
		    }
	      },{
	        'title': $(".delivery_address").val() ,
	        'position': destination ,
	        'snippet': getTrans( "Delivery Address" ,'delivery_address'),
	        'icon': {
		       'url': $(".address_icon").val()
		    }
	      }
	    ];

	    addMarkers(data, function(markers) {

	    	map.addPolyline({
			points: [
			  driver_location,
			  destination
			],
			'color' : '#AA00FF',
			'width': 10,
			'geodesic': true
			}, function(polyline) {

			});

	    });

	    stopTrackMapInterval();
		track_order_map_interval = setInterval(function(){runTrackMap()}, 9000);

	});
}

function showTip()
{
	if (typeof tipsDialog === "undefined" || tipsDialog==null || tipsDialog=="" ) {
		ons.createDialog('tipsDialog.html').then(function(dialog) {
			dialog.show();
	        translatePage();
	    });
	} else {
		tipsDialog.show();
	}
}

function setTips(tips)
{
	removeStorage("remove_tips");
	setStorage("tips_percentage",tips);
	$(".tip_amount").html( getTrans("Tips",'tips') + " "+ tips+"%" );
	tipsDialog.hide();
	reloadCart();
}

function removeTips()
{
	removeStorage("tips_percentage");
	setStorage("remove_tips",1);
	tipsDialog.hide();
	reloadCart();
}

function reloadCart()
{
	var cart_params=JSON.stringify(cart);
	if (saveCartToDb()){
	  	  var cart_params='';
	}

    if ( empty(getStorage("tips_percentage")) ){
	   setStorage("tips_percentage",0);
	}

	var params='';
	params="merchant_id="+ getStorage('merchant_id')+"&search_address=" +
	  encodeURIComponent(getStorage("search_address")) + "&cart="+cart_params +"&transaction_type=" +
	  getStorage("transaction_type") + "&device_id="+ getStorage("device_id") +"&tips_percentage=" + getStorage("tips_percentage");


	if (!empty( getStorage("remove_tips") )){
		params+="&remove_tips="+getStorage("remove_tips");
	}

	callAjax("loadCart",params);
}

function fillCCList(data)
{
	var html='';
	if (data.length>0){
	  $.each( data, function( key, val ) {
	  	  html+='<ons-list-item modifier="tappable" onclick="setCC('+val.cc_id+');" >';
	  	  html+=val.credit_card_number;
	  	  html+='</ons-list-item>';
	  });
	  createElement("cc-list", html );
	}
}

function setCC(cc_id)
{
	/*dump(cc_id);
	setStorage("cc_id",cc_id);
	sNavigator.popPage({cancelIfRunning: true});*/

	ons.notification.confirm({
	  message: getTrans('Choose action','choose_action'),
	  title: '',
	  buttonLabels: [ getTrans('Use this card','use_this_card') , getTrans('Edit this card','edit_this_card')  ],
	  animation: 'default', // or 'none'
	  primaryButtonIndex: 1,
	  cancelable: true,
	  callback: function(index) {
	  	  dump(index);
	      switch (index)
	      {
	      	 case 0:
	      	 setStorage("cc_id",cc_id);
	         sNavigator.popPage({cancelIfRunning: true});
	      	 break;

	      	 case 1:
	      	  var options = {
			      animation: 'slide',
			      onTransitionEnd: function() {
			      	  translatePage();
				      translateValidationForm();
				      var params="&client_token="+ getStorage("client_token");
				      params+="&cc_id="+cc_id;
				      callAjax("loadCC",params);
			      }
			   };
			   sNavigator.pushPage("ccform.html", options);
	      	 break;
	      }
	  }
   });

}

function showCCForm()
{
    var options = {
      animation: 'slide',
      onTransitionEnd: function() {
      	  translatePage();
	      translateValidationForm();
	      $(".delete-cc").hide();

	      $(".cc_number").attr("placeholder",  getTrans("Enter Card Number",'cc_number') );
	      $(".cvv").attr("placeholder",  getTrans("CVV",'cvv') );
	      $(".card_name").attr("placeholder",  getTrans("Card name",'card_name') );
	      $(".billing_address").attr("placeholder",  getTrans("Billing Address",'billing_address') );

      }
   };
   sNavigator.pushPage("ccform.html", options);
}

function saveCC()
{
	$.validate({
	    form : '#frm-cc',
	    borderColorOnError:"#FF0000",
	    onError : function() {
	    },
	    onSuccess : function() {
	      var params = $( "#frm-cc").serialize();
	      params+="&client_token="+ getStorage("client_token");
	      callAjax("saveCreditCard",params);
	      return false;
	    }
	});
}

function deleteCC()
{
	ons.notification.confirm({
	  message: getTrans('Remove ?','delete_this_records') ,
	  title: dialog_title_default,
	  buttonLabels: ['Yes', 'No'],
	  animation: 'default', // or 'none'
	  primaryButtonIndex: 1,
	  cancelable: true,
	  callback: function(index) {
	    if ( index==0){
	    	var params='';
	        params+="&client_token="+ getStorage("client_token");
	        params+="&cc_id="+ $(".cc_id").val() ;
	        callAjax("deleteCreditCard",params);
	    }
	  }
	});
}

function fillShippingAddress()
{
	if ( !empty( getStorage("map_address_result_formatted_address") )){
  	     $(".delivery-address-text").html( getStorage("map_address_result_formatted_address") );
  	     $(".street").val( getStorage("map_address_result_address") );
		 $(".city").val( getStorage("map_address_result_city") );
		 $(".state").val( getStorage("map_address_result_state") );
		 $(".zipcode").val( getStorage("map_address_result_zip") );
		 $(".formatted_address").val( getStorage("map_address_result_formatted_address") );

		 $(".google_lat").val( getStorage("google_lat") );
		 $(".google_lng").val( getStorage("google_lng") );
  	 }
}
