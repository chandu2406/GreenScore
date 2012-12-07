Members:
- Ken Murphy  (kmmurphy)
- Lucas Ray   (ltray)
- Nick LaGrow (nlagrow)

BRIEF
  The main purpose of Greenscore is to help users find real estate that is
  environmentally friendly, or to show other user's that their own home is
  environmentally responsible. By creating a mobile app to easily find homes,
  update information on your own home, and compare a home to the neigborhood around
  it, we help users quickly and painlessly find affordable and environmental new
  homes.

WHY 'GREENSCORE'?
  We provide a 'Green Score' which is a score between 0 and 100 describing the
  relative environmental friendliness of a home. A low score indicates high energy usage, a 
  location that requires a lot of fuel for basic livability, and other generally poor 
  environmental practices. A high score indicates use of renewable energy
  sources (solar, wind), 
  a dedication to using appliances that consume less energy, and other good enviornmental 
  practices. We calculate this data using the Zillow API, the Walkscore API, and
  data from energy 
  usage surveys found on data.gov.

  There's a lot of data that goes into the greenscore, and one of our goals is
  to modularize the rest of the code so that it's really easy to change the
  heuristic used for calculating the score in the future.

USING GREENSCORE
  To search for an address, simply enter the address into the search bar on the
  main page. This will bring up a map containing markers for the address you
  searched for and some nearby addresses. For each of these addresses, we give
  an array of data including the price of the home, some normal metrics (# beds,
  #baths etc) and the greenscore. To further narrow search results, you can
  click on the "filter" overlay at the bottom of the map.

  To edit an address, you first need to log in and edit your profile. To do
  this, simply click the "log in" button at the top of the page. Follow the
  steps to register a new account, log in with your current account, or click
  "log in with facebook" to use your facebook account. Once you've done this,
  you can create your profile.

  To create your profile, click on the "profile" link at the top of the page.
  Here, you'll see your profile information displayed. Add an address to your
  profile to be able to update the information on our server to correct possible
  mistakes.

THINGS WE USED
  Node        used for the servers.
  Express     used for the servers.
  Passport    used for our local login and facebook login.
  Socket.io   searching for an address queries the socket server.
  SQL         for our databases.
  Zillow API  for filling in information we don't have from our users,
              namely the sales price of homes.
  Walkscore   for helping with the Greenscore heuristic.

HOSTING
  Our server and databases are hosted on kettle.ubiq.cs.cmu.edu.
