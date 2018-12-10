import { SendMessagesRequest } from 'aws-sdk/clients/pinpoint';
import bodyParser = require('body-parser');
import AWS = require('aws-sdk');

const express = require('express');
const hostname = '127.0.0.1';
const port = 3000;
const link = 'http://promo-portal-alb-1560658871.eu-west-1.elb.amazonaws.com/auth/login';

const app = express();
AWS.config.region = 'us-east-1';
AWS.config.update({
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:5b169af9-a481-41af-94c8-bed5d098a145'
    })
});

const pinpoint = new AWS.Pinpoint({apiVersion: '2016-12-01'});
const params: SendMessagesRequest = {
    ApplicationId: '2ace37a50e074bb6af81d660652dc661',
    MessageRequest: {
        Context: {},
        Addresses: {},
        MessageConfiguration: {
            EmailMessage: {
                SimpleEmail: {
                    Subject: {
                        Charset: 'UTF-8',
                        Data: 'Restore password'
                    },
                    TextPart: {}
                }
            }
        }
    }
};

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use((req: any, res: any, next: any) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header(
        "Access-Control-Request-Method",
        "*"
    );
    next();
});

app.post('/pum/v1/users/forgotPassword', (req: any, res: any, next: any) => {
    if (!req || !req.body || !req.body.emailAddress) {
        res.statusCode = 400;
        const e = new Error('Request body is empty');
        next(e);
        return;
    }
    const email = req.body.emailAddress;
    params.MessageRequest.Addresses = {[email]: {ChannelType: 'EMAIL'}};
    params.MessageRequest
        .MessageConfiguration
        .EmailMessage
        .SimpleEmail
        .TextPart = {
        Charset: 'UTF-8',
        Data: `To restore your password please follow the link: ${link}`
    };
    pinpoint.sendMessages(params, function (err: any, data: any) {
        if (err) next(err);
        else res.send(data);
    });
});


app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
