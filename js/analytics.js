var analyticsModule = (function () {
	
	//support one account for now
	var accountId;
	var googleAccounts;
	var googleProperties;

	var def;

	function startProperties() {
		def = $.Deferred();

		var gAccounts = window.localStorage.getItem('googleAccounts');
		if(gAccounts) { 
			console.log('loaded from cache');
			googleAccounts = JSON.parse(gAccounts);
			accountId = googleAccounts[0].id;
			getProperties();
		} else {
			gapi.client.analytics.management.accounts.list().execute(handleAccounts);
		}
		
		return def;
	}

	function handleAccounts(results) {
		if (!results.code) {
			if (results && results.items && results.items.length) {
		
				console.log('handleAccounts',results.items);
				// Get the first Google Analytics account
				//var firstAccountId = results.items[0].id;
		
				//store
				window.localStorage.setItem('googleAccounts', JSON.stringify(results.items));
				accountId = results.items[0].id;
				return getProperties();
		
			} else {
				console.log('No accounts found for this user.');
			}
		} else {
			console.log('There was an error querying accounts: ' + results.message);
		}
	}
	
	function getProperties() {
		console.log('Querying Properties.');
		
		var props = window.localStorage.getItem('googleProperties');
		if(props) {
			googleProperties = JSON.parse(props);
			def.resolve(googleProperties);
		} else {
			gapi.client.analytics.management.webproperties.list({'accountId': accountId}).execute(handleWebproperties);
		}
		
	}
	
	function handleWebproperties(results) {
		if (!results.code) {
			if (results && results.items && results.items.length) {
		
				//console.log('web props', results.items);
				
				//filter out properties with no profileCount
				var props = [];
				for(var i=0, len=results.items.length; i<len; i++) {
					if(results.items[i].profileCount >= 1) props.push(results.items[i]);
				}
				
				//Now we get our profiles and update our main props object
				//Again, assuming 1
				console.log("getting profiles for our props");
				gapi.client.analytics.management.profiles.list({
					'accountId': accountId,
					'webPropertyId': '~all'
				}).execute(function(res) {
					console.log('ok back getting profiles');
					//in theory same order, but we'll be anal
					for(var i=0, len=res.items.length;i<len; i++) {
						var profile = res.items[i];
						for(var x=0, plen=props.length; x<plen; x++) {
							if(profile.webPropertyId === props[x].id) {
								props[x].profile = profile;
								break;
							}
						}
					}
	
					googleProperties = props;
		
					//store
					window.localStorage.setItem('googleProperties', JSON.stringify(props));
					
					def.resolve(props);

				});
				
				
			} else {
				console.log('No web properties found for this user.');
			}
		} else {
			console.log('There was an error querying webproperties: ' + results.message);
		}
	}

	function getStatsForPropertyURL(propId, url) {
		var adef = $.Deferred();
		
		
		gapi.client.analytics.data.ga.get({
		'ids': 'ga:' + propId,
		'start-date': '2005-01-01',
		'end-date': 'today',
		'metrics': 'ga:pageviews',
		'filters':'ga:pagePath=='+encodeURI(url),
		'dimensions1':'ga:date'
		}).execute(function(results) {
			console.dir(results);
			adef.resolve(results.totalsForAllResults["ga:pageviews"]);
		});
		
		return adef;
	}
	
	return {
		getProperties:startProperties,
		getStatsForPropertyURL:getStatsForPropertyURL
	};
	
}());