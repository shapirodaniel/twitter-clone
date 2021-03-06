# SQL + Express Practice: Twitter Clone

## Getting started

Fork and clone this repo to your local machine and run `npm i` to get setup with all deps. Practice your git workflow skills by making small, frequent commits with descriptive naming: the [semantic git pattern](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716) is a great convention to follow!

## Overview

Let's build a twitter clone! We'll break the effort down into a few key parts:

## Database design

1. Design the schema or entity relation diagram (ERD)
2. Build the database setup and seed routines
3. Add database adapters to query our tables
4. Create a database test function to validate our adapters

## Express server

1. Build a simple express server with logging and a health endpoint (returning `{ healthy: true | false }`)
2. Add an `apiRouter` and a `usersRouter` to handle requests to `${base_url}/api/users`

## Bring it all together

1. Create a route `/api/testdb/:userId` that takes in a `userId` on the `req.params.userId` object and runs the database test function we wrote in **Database design** above on that particular relation
2. Write tests for each api route provided in `api.spec.js`, following the pattern established in the first test at `GET /api/users`

---

# Part One: Database Design

## Schema

To design our schema, let's think about what entities we'll need to capture the core elements of content distribution system like twitter. We've got a few key players that we'll want to describe:

- Users
- Tweets
- Hashtags

There are other relations that accompany these core entities, like:

- Followers, a type of User relation
- Likes, a type of User relation on a particular Tweet

Here's an example of how we could structure each of these relations:

![](/assets/twitter-clone-tables.png)

The complete ERD might look like this. Notice the use of different connectors, describing the 1:1, 1:many, and many:many relations! For more info on ERDs and the way that we use _cardinality_ to refer to belongingness amongst entities, check out this awesome resource: https://vertabelo.com/blog/cardinality-in-data-modeling/

![](/assets/twitter-clone-erd.png)

---

## Seed Routines

To build our database setup and seed routines, we'll need to execute a few SQL queries.

- First, build your tables with CREATE TABLE < name > statements. Remember, if a foreign key depends on another table's primary key value, the primary keyed table will need to be created first: else, there's no record to associate!

- Next, build your insert statements. These will INSERT INTO < name > ( ...fields ) VALUES ( ...comma-separated tuples ), ... . Use serial, auto-incrementing primary keys for ease of remembering which record refers to what entity!

- Now you can seed your database! You'll need to create a new database to store your relations with `createdb < db name >`, at which point you can `psql < db name >` and load your setup and seed routines (preferably written as separate `*.sql` files) with `\i < routine-name.sql >`

- Query your database by running `SELECT * ...` statements to verify that your database tables hold the data and relations you expect!

## Database Adapters

Let's create database adapters by leveraging the `pg` Client constructor to build a client interface and issue SQL commands against our seeded database. Each adapter will be written in JavaScript, and should have the following qualities and characteristics:

- our client issues asynchronous calls, so we'll need an `async/await` compatible function
- name the function according to the data it fetches, eg if we're looking for all users in our twitter clone, `getAllUsers()` is a good choice :D
- build useful adapters for as many relations as you like! there are at least 4 key relationships between users, tweets, hashtags, likes, and followers, and potentially many more. think like a database architect (a DBA): what sorts of information will the twitter system require, and how can you create adapters to facilitate that data exchange?
- place the client and all of your database adapters on the `module.exports` object so that we can consume them in our API / express app

## Validating the Adapters

Now that your database adapters are complete, let's test them! Write a function `testDB()` that validates each adapter by querying your seeded database. This will be an asynchronous function that will need to `await` each adapter call. For now, `console.log()` each value returned from your adapter calls in the body of the function, and provide a pair of helpful messages to bookend the body of the function, like `testing db!` and `testing complete`.

---

# Part Two: Express Server

Now that our database is seeded and queryable, let's build the Express server that will define the RESTful routes that will serve up our data!

- Create a bare express server instance, add body parsing middleware, and open the server handle with `server.listen()`, taking care to `await client.connect()` upon successful server startup. At this point, fire up the `test/api.spec.js` file and take a look at its `required` constants: there is a `handle` and a `PORT` value coming from the express server top-level `index.js`.

The `handle` allows us to target the open connection created by calling `server.listen()`. To define it in your express server and export it for use in the test suite, try something like this:

```javascript
const handle = server.listen(PORT, async () => {
  try {
    await client.connect();
    console.log('db client connected!');
  } catch (err) {
    console.error(err);
    await client.end();
    throw err;
  }

  console.log(`server listening on port ${PORT}`);
});

module.exports = { handle, PORT };
```

- Create a `/health` endpoint that returns `{healthy: true | false}` at the top level of your express app
- Create an `apiRouter` and a `usersRouter`, and hook them up accordingly. Remember, `server.use()` can host the app middleware, and `apiRouter.use()` can host the various subrouter middlewares we'll define for each entity in our RESTful route setup!

---

# Part Three: A Dynamic Test Route

Let's refactor our `testDB` function to accept a `userId` parameter, which we can feed to any database adapter that might require it. Here's a possible setup:

```javascript
async function testDB(userId) {
  try {
    console.log('testing db adapters!');

    const allUsers = await getAllUsers();
    console.log({ allUsers });

    const user = await getUserById(userId);
    console.log({ user });

    const userTweets = await getTweetsByUserId(userId);
    console.log({ userTweets });

    const tweetId = userTweets[0].id;

    const firstTweetHashtags = await getHashtagsByTweetId(tweetId);
    console.log({ firstTweetHashtags });

    const firstTweetLikes = await getLikesByTweetId(tweetId);
    console.log({ firstTweetLikes });

    const userFollowers = await getFollowersByUserId(userId);
    console.log({ userFollowers });

    return {
      allUsers,
      user,
      userTweets,
      firstTweetHashtags,
      firstTweetLikes,
      userFollowers,
    };
  } catch (err) {
    throw err;
  }
}
```

Now that your `testDB` function has been _parameterized_ to return dynamic output based on the supplied `userId`, let's create a RESTful route to supply that request parameter!

- Create a route `/testdb/:userId` and leverage the `req.params.userId` value to call `testDB(userId)` and `res.send()` the object returned from our database adapter tests

---

# Wrap-up

Congratulations, you have a fully-functioning twitter API! But there's a bit more to do: remember, untested code doesn't work, even if it does! Let's hone our test-driven development or TDD chops by writing unit tests to validate our API routes. A sample validation is supplied under `test/api.spec.js` which you can run with `npm run test:watch:api`. You'll expect this test to fail until your route for fetching all users returns the output `expect`-ed by the test specs.

Bonus: there are several additional validations and test setups included. By following each, you'll be able to refine your API and adapters. You may find that there's functionality you haven't written yet that you'll need to satisfy each of these test cases. Complete as many or as few as you like -- this is the perfect project to chip away at slowly over time, as your knowledge base grows!
