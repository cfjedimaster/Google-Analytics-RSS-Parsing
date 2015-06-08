
var rssItems;
var $status;
var $stats;
var $rss;
var $propDropdown;

var myProperties;

function beginFeedLoad() {

    //http://stackoverflow.com/a/24980290/52160
    google.load('feeds', '1.0', {
        callback: initialize
    });

}

//Alright, at this point, we have Authed to Google AND loaded a feed API.
//Our next job is to get site properties so they can choose one.
function initialize() {
    $status = $("#status");
    $stats = $("#stats");
    $rss = $("#rssURL");

    $propDropdown = $("#propertyDropdown");
    
	$status.html("<i>Fetching information about your account.");

	analyticsModule.getProperties().then(function(props) {
        myProperties = props;
        $status.html("");
        var s = "";
        for(var i=0;i<props.length;i++) {
            s += "<option value='"+props[i].profile.id+"'>"+props[i].name+"</option>";
        }
        $propDropdown.html(s);
        $propDropdown.on("change", loadRSS);
        //load it immediately
        loadRSS();
        $("#formDiv").show();
		//console.dir(props);
        
        $("#checkButton").on("click", parseFeed);
	});

}

function parseFeed(e) {
    e.preventDefault();

    var rss = $rss.val();
    if(rss === '') return;
    storeRSS();
    $status.html("<p>Fetching RSS feed.</p>");
    
    var feed = new google.feeds.Feed(rss);
    feed.setNumEntries(10);
    feed.load(function(result) {
        rssItems = result.feed.entries;
        if (!result.error) {
            displayFeed();
        } else {
            $status.html("<p><strong>An error occurred: "+result.error.message+"</strong></p>")
        }
    });
}

// Ok, technically I display the feed *and* kick off the process to start getting stats
function displayFeed() {
    var prop = $propDropdown.val();
    var site;
    
    //fetch the site url, I could make this simpler
    for(var i=0;i<myProperties.length;i++) {
        if(myProperties[i].profile.id === prop) {
            site = myProperties[i].websiteUrl;
            break;
        }    
    }

    $status.html("<p>Getting analytics.</p>");
    $stats.html("");

    var s = "<table class='table table-striped table-bordered'><tr><th>URL</th><th>Page Views</th></tr>";
    
    var deferreds = [];
    for(var i=0;i<rssItems.length; i++) {
        s += "<tr><td>"+rssItems[i].title+"</td><td></td></tr>";
        var link = rssItems[i].link.replace(site,"");

        deferreds.push(analyticsModule.getStatsForPropertyURL(prop, link));
    }

    $.when.apply($, deferreds).done(function() {
       console.dir(arguments); 
        for(var i=0;i<arguments.length;i++) {
            $("table tr:nth-child("+(i+2)+") td:nth-child(2)").text(arguments[i]);
        }
        $status.html("");       
    });
    
    s += "</table>";
    $stats.html(s);
}	

/*
I'm a helper func that checks to see if you entered a RSS feed for this prop before
*/
function loadRSS() {
    var currentProp = $propDropdown.val();
    var key = "ga_rss_"+currentProp;
    //we don't care if it doesn't exist
    $rss.val(localStorage[key]);
}

/*
And I store the rss
*/
function storeRSS() {
    var currentProp = $propDropdown.val();
    var key = "ga_rss_"+currentProp;
    localStorage[key] = $rss.val();
}
