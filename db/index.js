const {
  client,
  getAllUsers,
  getUserById,
  getTweetsByUserId,
  getHashtagsByTweetId,
  getLikesByTweetId,
  getFollowersByUserId,
} = require('./adapters');

async function testDB() {
  try {
    console.log('testing db adapters!');

    const users = await getAllUsers();
    console.log({ users });

    const albert = await getUserById(1);
    console.log({ albert });

    const albertTweets = await getTweetsByUserId(1);
    console.log({ albertTweets });

    const albertTweetHashtags = await getHashtagsByTweetId(1);
    console.log({ albertTweetHashtags });

    const albertTweetLikes = await getLikesByTweetId(1);
    console.log({ albertTweetLikes });

    const albertFollowers = await getFollowersByUserId(1);
    console.log({ albertFollowers });

    console.log('end db adapater tests');
  } catch (err) {
    console.error(err);
  }
}

console.log('testing db!');
testDB();