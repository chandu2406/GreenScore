# GreenScore

## Current members:
- Ken Murphy  (kmmurphy)
- Lucas Ray   (ltray)
- Nick LaGrow (nlagrow)

## Brief
  The main purpose of Greenscore is to help users find real estate that is
  environmentally friendly, or to show other user's that their own home is
  environmentally responsible. By creating a mobile app to easily find homes,
  update information on your own home, and compare a home to the neigborhood
  around it, we help users quickly and painlessly find affordable and
  environmental new homes.

## Why 'GreenScore'?
  We provide a 'Green Score' which is a score between 0 and 100 describing the
  relative environmental friendliness of a home. A low score indicates high
  energy usage, a location that requires a lot of fuel for basic livability,
  and other generally poor environmental practices. A high score indicates use
  of renewable energy sources (solar, wind), a dedication to using appliances
  that consume less energy, and other good enviornmental practices. We
  calculate this data using the Zillow API, the Walkscore API, and data from
  energy usage surveys found on data.gov.

  There's a lot of data that goes into the greenscore, and one of our goals is
  to modularize the rest of the code so that the heuristic used for calculating
  the score can be easily updated.

## Using GreenScore
  To search for an address, simply enter the address into the search bar on the
  main page. This will bring up a map containing markers for the address you
  searched for and some nearby addresses. For each of these addresses, we give
  an array of data including the price of the home, some normal metrics (# beds,
  # baths, etc.) and the greenscore. To further narrow search results, you can
  click on the "filter" overlay at the bottom of the map to filter your search.

  To edit an address, you first need to log in and edit your profile. To do
  this, simply click the "log in" button at the top of the page. Follow the
  steps to register a new account, log in with your current account, or click
  "log in with facebook" to use your facebook account. Once you've done this,
  you can update your profile.

  To modify your profile, click on the "profile" link at the top of the page.
  Here, you'll see your profile information displayed. Add an address to your
  profile to be able to update the information on our server to correct possible
  mistakes and provide additional metadata.

## Technologies used
  Node            used for the servers.
  Express         used for the servers.
  Passport        used for our local login and facebook login.
  Socket.io       searching for an address queries the socket server.
  SQL             for our databases.
  Zillow API      for filling in information we don't have from our users,
                  namely the sales price of homes.
  Walkscore       for helping with the Greenscore heuristic.
  jQuery          used for many things.
  coffeescript    used primarily for server implementation.
  scss            used to construct our css.
  q               used to resolve serverside synchrony issues.

## Hosting
  Our server and databases are both hosted on `kettle.ubiq.cs.cmu.edu`. The code
  uses two ports - one to listen to HTTP requests and one to listen to socket
  server requests. Currently, we use `15237` for HTTP requests and `3000` for
  socket server requests. These values can be changed in `main.coffee`.
