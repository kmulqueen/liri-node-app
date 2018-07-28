// Taking care of requirements
require("dotenv").config();
var request = require("request");
var keys = require("./keys");
var fs = require("fs");
var reqSpotify = require("node-spotify-api")
var reqTwitter = require("twitter")

// Setting up Constructors
var client = new reqTwitter(keys.twitter);
var spotify = new reqSpotify(keys.spotify);

// Capturing users commands
var argOne = process.argv[2];
var argTwo = process.argv[3];
var nodeArgs = process.argv;

// Setting a blank string to store the users searches
var title = "";

// Performing the appropriate functions when the arguments are passed
switch (argOne) {
    case "my-tweets":
        tweetIt();
        break;
    case "spotify-this-song":
        spotifyIt();
        break;
    case "movie-this":
        movieIt();
        break;
    case "do-what-it-says":
        doIt();
        break;
    default:
        console.log("No Actions Taken.");
        break;
};

// Twitter function
function tweetIt() {
    console.log("========== MY TWEETS ==========");
    // Passing in the users screen name and the amount of tweets to display
    var params = {
        screen_name: keys.twitter,
        count: 20
    };
    // Accessing user information, and retrieving 20 tweets
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            console.log("======= 20 Most Recent Tweets =======");
            for (var i = 0; i < tweets.length; i++) {
                var post = tweets[i].text;
                var date = tweets[i].created_at;
                console.log("Tweet " + (i + 1) + "  =================== \nPost: " + post + "\nDate: " + date);
            }
        }
    });
};

// Spotify function
function spotifyIt() {
    console.log("========== SPOTIFY THIS SONG ==========");
    // Storing the users search in the title variable. We do this for multiple word searches
    for (var i = 3; i < nodeArgs.length; i++) {
        title = title + " " + nodeArgs[i];
    };
    console.log("Search: " + title);
    // If the search was empty, default to The Sign Ace of Base
    if (title === "") {
        title = "The%20Sign%20Ace%20of%20Base";
    } else if (title !== "") {
        titleSplit = title.split(" ");
        title = titleSplit.join("%20");
    };

    // Calling a search
    spotify.search({
            type: 'track',
            query: title,
            limit: 1
        })
        .then(function (response) {
            // Stored all useful properties
            var data = response.tracks.items[0];
            var albumData = data.album;
            var artist = albumData.artists[0].name;
            var song = data.name;
            var album = albumData.name;
            var preview = data.preview_url;
            console.log("Artist: " + artist + "\nSong: " + song + "\nAlbum: " + album + "\nPreview: " + preview);
        })
        .catch(function (err) {
            console.log(err);
        });
};

// Movie function
function movieIt() {
    console.log("========== MOVIE THIS ==========");
    // Setting the title equal to multiple word searches
    for (var i = 3; i < nodeArgs.length; i++) {
        title = title + " " + nodeArgs[i];
    };
    console.log("Search: " + title);
    // If the search was empty, default to Mr. Nobody
    if (title === "") {
        title = "mr+nobody";
    } else if (title !== "") {
        movieSplit = title.split(" ");
        title = movieSplit.join("+");
    };
    // Calling on the omdb API
    request("http://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=trilogy", function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // Creating variables for useful info.
            var info = JSON.parse(body);
            var movieTitle = info.Title;
            var rottenTomatoes = info.Ratings[1].Value;
            var imdbRating = info.imdbRating;
            var country = info.Country;
            var language = info.Language;
            var plot = info.Plot;
            var actors = info.Actors;
            console.log("Movie Title: " + movieTitle + "\nRotten Tomatoes Rating: " + rottenTomatoes + "\nIMDB Rating: " + imdbRating + "\nCountry: " + country + "\nLanguage: " + language + "\nPlot: " + plot + "\nActors: " + actors);
            // IF ROTTEN TOMATOES GETS ERROR .Value it's because Ratings[1] doesn't exist, Ratings might be an empty array.
        }
    });
};

// Do What It Says Function
function doIt() {
    console.log("========== DO WHAT IT SAYS ===========");
    // Read the random.txt file to do what it says
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        };
        // Creating a variable that removes the commas from the random.txt. Setting argOne to the action found at output[0] (spotify this song). Setting argTwo to the search found at output[1] (I want it that way). Setting title equal to argTwo
        var output = data.split(",");
        argOne = output[0];
        argTwo = output[1];
        title = argTwo;

        // Running the appropriate functions depending on what argOne is.
        switch (argOne) {
            case "my-tweets":
                tweetIt();
                break;
            case "spotify-this-song":
                spotifyIt();
                break;
            case "movie-this":
                movieIt();
                break;
        }
    });
};
