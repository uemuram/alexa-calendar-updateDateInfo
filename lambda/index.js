// const Axios = require('axios');

exports.handler = async (event) => {
    console.log("start!");

    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };

    console.log("finish!");
    return response;
};
