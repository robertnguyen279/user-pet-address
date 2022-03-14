const filterRequestBody = (validBodyKeys, requestBody) => {
  for (const key in requestBody) {
    if (!validBodyKeys.includes(key)) {
      throw new Error(`Invalid request body key: "${key}"`);
    }
  }

  return requestBody;
};

module.exports = filterRequestBody;
