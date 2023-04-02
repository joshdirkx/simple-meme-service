exports.handler = function (event, context, callback) {
  console.log(event);

  const eventBody = JSON.parse(event.body);
  const challengeAnswer = eventBody.challenge;

  const body = {
    statusCode: 200,
    body: JSON.stringify(
     challengeAnswer
    ),
  };

  return callback(null, body);
};
