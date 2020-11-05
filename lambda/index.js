const Axios = require('axios');
const AWS = require('aws-sdk');
const ssmKey = 'ALEXA-CALENDAR-DATEINFO-PATH';

exports.handler = async (event) => {
    console.log("start!");

    // s3上の保存先を取得
    const ssm = new AWS.SSM();
    const request = { Name: ssmKey, WithDecryption: true };
    const ssmResponse = await ssm.getParameter(request).promise();
    const dateInfoPath = ssmResponse.Parameter.Value;
    console.log(ssmKey + ' : ' + dateInfoPath + '(SSMから取得)');

    const match = dateInfoPath.match(/^s3:\/\/([^/]+)\/(.+)$/);
    const bucket = match[1];
    const key = match[2] + 'publicHolidays/';
    console.log("祝日保存バケット : " + bucket + ' , キー : ' + key);

    // s3クライアント準備
    const s3 = new AWS.S3();

    // リクエスト実行(今年分 & 来年分)
    let currentYear = new Date().getFullYear();
    let params = {};
    let url, holidaysResponse;
    for (let year = currentYear; year <= currentYear + 1; year++) {
        try {
            // URL設定
            url = `https://holidays-jp.github.io/api/v1/${year}/date.json`
            console.log("祝日取得URL : " + url);
            // リクエスト実行
            holidaysResponse = await Axios.get(url);
            console.log(`祝日取得レスポンス: ${JSON.stringify(holidaysResponse.data)}`);
        } catch (error) {
            throw new Error(`get holidayInfo error , url:${url} , error:${error}`);
        }

        try {
            // s3に配置
            params = {
                Bucket: bucket,
                Key: key + year + '.json',
                Body: JSON.stringify(holidaysResponse.data)
            };
            console.log(`s3配置先: s3://${bucket}${key}${year}.json`);
            const uploadResponse = await s3.putObject(params).promise();
            console.log(`s3配置レスポンス: ${JSON.stringify(uploadResponse)}`);
        } catch (error) {
            throw new Error(`put s3 error , param:${JSON.stringify(params)} , error:${error}`);
        }
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('finish'),
    };

    console.log("finish!");
    return response;
};
