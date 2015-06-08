var clientId = '818125206534-g1r0datdtu9serq2pf9cp5vkuih3h8pv.apps.googleusercontent.com';
var apiKey = 'AIzaSyCE7HZlkwHKn2PjjG9Kk4D7A1WZ20BGDV8';
var scopes = 'https://www.googleapis.com/auth/analytics.readonly';

// This function is called after the Client Library has finished loading
function handleClientLoad() {
	// 1. Set the API Key
	gapi.client.setApiKey(apiKey);
	
	// 2. Call the function that checks if the user is Authenticated. This is defined in the next section
	window.setTimeout(checkAuth,1);
}

function checkAuth() {
	// Call the Google Accounts Service to determine the current user's auth status.
	// Pass the response to the handleAuthResult callback function
	gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}

function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    // The user has authorized access
    // Load the Analytics Client. This function is defined in the next section.
    loadAnalyticsClient();
  } else {
    // User has not Authenticated and Authorized
    handleUnAuthorized();
  }
}

// Authorized user
function handleAuthorized() {
	$("#authorizeDiv").hide();
	//start getting shit
	beginFeedLoad();
}


// Unauthorized user
function handleUnAuthorized() {
	$("#authorizeDiv").show();

	var authorizeButton = document.getElementById('authorize-button');

	authorizeButton.style.visibility = '';
	// When the 'Authorize' button is clicked, call the handleAuthClick function
	authorizeButton.onclick = handleAuthClick;
}

function handleAuthClick(event) {
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
  return false;
}

function loadAnalyticsClient() {
	// Load the Analytics client and set handleAuthorized as the callback function
	gapi.client.load('analytics', 'v3', handleAuthorized);
}