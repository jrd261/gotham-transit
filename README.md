Gotham Transit Status
=====================

Summary
-------

I've always thought those table-side diner jukeboxes were interesting, so I used that as my design inspiration. In most situations building exactly to spec is critically important but I thought this was a great opportunity to take a few liberties on implementation.

The server retrieves and parses the MTA feed every five minutes and caches it. It delivers the data to the client asynchronously (I believe the page refreshes the data every five minutes as well).

A single search field does live filtering on all reported lines (by name and type). Instead of a full authentication system (why add so much friction for basic functionality?), favorites are persisted client side (local storage). Favorited lines appear first in the list. Clicking on a "status change" or "planned work" with bring up the MTA's formatted text.

I would have probably put in authentication with passport local strategy. My only twist is to always bcrypt/scrypt the password client side (this should be SOP). I've integrated custom, traditional, and federated auth into a handful of web apps. Given the lack of an SSL cert on this domain, lets call no authentication a "security feature". 

To show a little bit of database work, I built an endpoint to store and retrieve a user's favorites in an Amazon DynamoDB table (the front end doesn't use it). GET/POST a json list to/from "/favorites/:id". 


What's Next? 
------------
(Assuming this were a real product)

Aside from bug fixes and polish, first priority would be building in analytics and getting some intuition about how people use the app, i.e. what lines are popular, how many favorites do they have, what search terms are entered, etc.

Additionally, using that data and some common sense, the live search can be improved. B8 should match B1 - B81, but only line name/types are used. A more sophisticated algorithm for extracting search tokens is probably desirable.

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


Modeling Transit Status Changes
-------------------------------

First, lets quantify just how much data we are working with. We'll ignore the human readable text (it can just get tossed into a key-document store if we want to archive it). Lets say we want to sample every 5 minutes. Each line has 4 possible states (at least that I've seen), which can easily be represented by a 32 bit integer. With 50 lines, that's about 50 * 4 (bytes) * 12 * 24 * 365 = 21MB/yr.

BUT WAIT! THERE'S MORE!

If we want to get clever we can just record the initial state, and store timestamped differences. We can get a unix timestamp, line id, and state in a 64 bit integer, no problem. Pessimistically, lets say each line changes status 10 times a day. That's 50 * 10 * 8 (bytes) * 365 = 1.46MB/yr! Dust off the 386 and reformat the double sided 3.5" floppys. 

Bottom line: this is not a big data problem. Binning by DOW, time, location, etc, is going to take < second, even on a few years of data. 

In this case, where space is not really an issue, I would go with a solution that a team can build quickly (and get onto the next project), and provide an interface and format that a consumer (a data scientist perhaps) would intuitively understand. Keep it simple.

I'd recommend a traditional database table, indexed by date, that stores the status of each line. If the status text is put in some key document store, a key/url can be included in the table output as well.

I would offer a single endpoint that filters by a single date range or does a complete data dump. Depending on feedback from the consumers, a binary format or something as simple as CSV could be the optimal data encoding. 