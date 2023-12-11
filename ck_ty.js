try {
    // Extract order details from Shopify variables
    // var ck_order_id = '{{ order.name }}'; // Combine order ID and name
    // ck_order_id = ck_order_id.replace("#", ""); // Remove '#' from the order ID
    // var ck_order_value = '{{ order.total_price | money_without_currency | remove: "," }}'; // Extract order total amount
    // var ck_discount_code = '{{ order.discounts[0].code }}'; // Extract discount code used, if any
    // var ck_secure_code = '';
    // var ck_product_name = '';

    let count = localStorage.getItem('ck_count') ? parseInt(localStorage.getItem('ck_count')) : 0
        if (!ck_order_id && count <= 2) {
            count += 1
            localStorage.setItem('ck_count', count)
            location.reload()
        } else {
            localStorage.removeItem('ck_count')
        }

    // Set the survival days for local storage data
    var ckSurvivalDays = 7;

    // Function to retrieve data from local storage with a specific prefix
    function getCKLocalData(prefix) {
        var keysAndValues = {};
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.startsWith(prefix)) {
                var value = localStorage.getItem(key);
                keysAndValues[key] = value;
            }
        }
        return keysAndValues;
    }

    // Function to retrieve data from cookies with a specific prefix
    function getCKCookieData(prefix) {
        var cookies = {};
        var cookieArray = document.cookie.split(';');
        for (var cookie of cookieArray) {
            var [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName.startsWith(prefix)) {
                cookies[cookieName] = cookieValue;
            }
        }
        return cookies;
    }

    // Function to delete data from local storage with a specific prefix
    function deleteCKLocalData(prefix) {
        Object.keys(localStorage)
            .forEach(function (key) {
                if (/^ck_/.test(key)) {
                    localStorage.removeItem(key);
                }
            });
    }

    // Function to send postback data
    function ckPostback(data) {
        if (data?.ck_clickid) {
            // Construct the postback URL
            var url = `https://offers-cashkaro.affise.com/postback?clickid=${data?.ck_clickid}&secure=${ck_secure_code}&action_id=${ck_order_id}&sum=${ck_order_value}&status=2&custom_field1=${ck_order_value}&custom_field2=${data?.ck_utm_campaign}&custom_field3=${ck_discount_code}&custom_field5=${ck_product_name}`;

            // Fetch the postback URL
            fetch(url)
                .then((response) => response.json())
                .then((data) => console.log(data));

            // Log UTM source and campaign
            console.log('CK UTM source: ' + data?.ck_utm_source + '\nCK UTM campaign: ' + data?.ck_utm_campaign);
        }
    }

    // Retrieve local storage data with a specific prefix
    var ckLocalData = getCKLocalData('ck_');

    // Check if local storage data is present and within the survival days
    if (ckLocalData?.ck_timestamp && (ckLocalData?.ck_utm_source === 'ck' || ckLocalData?.ck_utm_source.toLowerCase().includes('cashkaro') || ckLocalData?.ck_utm_source === 'PPIPL' || ckLocalData?.ck_utm_source === 'earnkaro' || ckLocalData?.ck_utm_source === 'deals101')) {
        var epochTimestamp = ckLocalData?.ck_timestamp;
        var date = new Date(epochTimestamp * 1000);
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        var hours = String(date.getHours()).padStart(2, '0');
        var minutes = String(date.getMinutes()).padStart(2, '0');
        var seconds = String(date.getSeconds()).padStart(2, '0');
        var formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        var providedDate = new Date(formattedDateTime);
        var currentDate = new Date();
        var timeDifference = currentDate - providedDate;
        var daysDifference = timeDifference / (1000 * 86400 * ckSurvivalDays);

        // Check if the difference is within the survival days
        if (daysDifference <= ckSurvivalDays) {
            // Check if tracking parameters are present
            if (!('ck_gclid' in ckLocalData) && !('ck_fbclid' in ckLocalData) && !('ck_igshid' in ckLocalData) && !('ck_gad_source' in ckLocalData)  && !('ck_msclkid' in ckLocalData)) {
                // Send postback data
                ckPostback(ckLocalData);
            }
        } else {
            // Delete local storage data if it's older than the survival days
            deleteCKLocalData('ck_');
            // console.log(`ck_timestamp greater than ${ckSurvivalDays} days.`);
        }
    } else {
        // Retrieve cookie data with a specific prefix
        var ckCookieData = getCKCookieData('ck_');
        var keysArray = Object.keys(ckCookieData);

        // Check if cookie data is present
        if (keysArray.length > 0) {
            // Check if UTM source is valid
            
            if (ckCookieData?.ck_utm_source === 'ck' || ckCookieData?.ck_utm_source === 'PPIPL' || ckCookieData?.ck_utm_source === 'deals101' || ckCookieData?.ck_utm_source === 'Cashkaro' || ckCookieData?.ck_utm_source === 'earnkaro' || ckCookieData?.ck_utm_source === 'CashKaro' || ckCookieData?.ck_utm_source.toLowerCase().includes('cashkaro'))  {
                // Check if tracking parameters are present
                if (!('ck_gclid' in ckCookieData) && !('ck_fbclid' in ckCookieData) && !('ck_igshid' in ckCookieData) && !('ck_gad_source' in ckCookieData) && !('ck_msclkid' in ckCookieData)) {
                    // Send postback data
                    ckPostback(ckCookieData);
                }
            }
        }
    }

} catch (error) {
    console.log('ck_thankyou_page_error :' , error)
}