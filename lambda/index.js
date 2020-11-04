const Axios = require('axios');
const AWS = require('aws-sdk');
const ssmKey = 'ALEXA-CALENDAR-DATEINFO-PATH';

exports.handler = async (event) => {
    console.log("start!");

    // s3上の保存先を取得
    const ssm = new AWS.SSM();
    const request = { Name: ssmKey, WithDecryption: true };
    const ssmResponse = await ssm.getParameter(request).promise();
    const s3parentPath = ssmResponse.Parameter.Value;
    console.log(ssmKey + ' : ' + s3parentPath + '(SSMから取得)');

    // リクエスト実行(今年分 & 来年分)
    let currentYear = new Date().getFullYear();
    for (let year = currentYear; year <= currentYear + 1; year++) {
        try {
            // URL設定
            let url = `https://holidays-jp.github.io/api/v1/${year}/date.json`
            console.log("URL : " + url);
            // リクエスト実行
            const response = await Axios.get(url);
            console.log(`レスポンス: "${JSON.stringify(response.data)}"`);

            // // s3に配置
            // const s3 = new AWS.S3();
            // const response = await s3.getObject({ Bucket: bucket, Key: key }).promise();
            // publicHolidays = JSON.parse(response.Body.toString('utf-8'));
            // console.log(publicHolidaysKey + ' : ' + JSON.stringify(publicHolidays) + '(s3から取得)');




        } catch (error) {
            throw new Error(`http get error: ${error}`);
        }
    }


    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('finish'),
    };

    console.log("finish!");
    return response;
};
