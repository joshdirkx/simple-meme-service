exports.handler = async (event) => {
  console.log(event);

  const body = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  };

  return callback(null, body);
};
