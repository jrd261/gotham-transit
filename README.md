Gotham Transit Status
=====================

Summary
-------

I've always thought those table-side diner jukeboxes were interesting, so I used that as my design inspiration.

The server retrieves and parses the MTA feed every five minutes and caches it. It delivers the data to the client asynchronously (I believe the page refreshes the data every five minutes as well).

A single search field does live filtering on all reported lines (by name and type). Instead of a full authentication system (why add so much friction for basic functionality?), favorites are persisted client side (local storage). Favorited lines appear first in the list.

I would have probably put in authentication with passport local strategy, but I always bcrypt/scrypt the password client side (this should be SOP). I've built out custom, traditional, and federated auth into plenty'o apps. Given the lack of an SSL cert on this domain, lets call no authentication a "security feature". 

I did build an endpoint to store and retrieve a user's favorites in an Amazon DynamoDB table (the front end doesn't use it). GET/POST a json list to/from "/favorites/:id". 

In most situations building exactly to spec is critically imporant but I thought this was a great opportunity to take a few liberties on implementation.


What's Next? 
------------
(Assuming this were a real product)

First priority would be building in analytics and getting some intuition about how people use the app, i.e. what lines are popular, how many favorites do they have, what search terms are entered, etc.

Additionally, using that data and some common sense, the live search can be improved. B8 should match B1 - B81, but only line name/types are used. A more sophisticated algorithm (or just hard coded tokens) can improve the UX.

Notes
-----

  * Angular is magic.


Getting it Running
------------------

```bash
npm install
bower install
gulp
cd build
node app.js

```

Serve the burgers at localhost:3000.
