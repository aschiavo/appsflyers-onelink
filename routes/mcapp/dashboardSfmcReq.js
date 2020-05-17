/* eslint-disable max-len */
/* eslint-disable no-plusplus */
/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
const uuidv1 = require('uuid/v4');
const sfmcHelper = require('../sfmcHelper');

exports.loadDashboards = (req, resp) => {
    sfmcHelper.createSoapClient(req.body.refresh_token, (e, response) => {
        if (e) { return resp.status(500).end(e); }

        console.log(response);
        const requestObject = {
            RetrieveRequest: {
                ClientIDs: {
                    ClientID: req.body.enterpriseId,
                },
                ObjectType: `DataExtensionObject[${process.env.LinkDataExtension}]`,
                Properties: ['LinkID', 'LinkName', 'BaseURL', 'ContentsCount', 'Status','JSONParameters', 'Parameters', 'CustomParameters', 'FullURL', 'Created', 'Modified'],
                Filter: sfmcHelper.simpleFilter('Flag', 'equals', 1),
            },
        };

        sfmcHelper.retrieveRequest(response.client, requestObject)
            .then((body) => {
                const dashboardResponse = {
                    data: body,
                    refresh_token: response.refresh_token,
                    enterpriseId: req.body.enterpriseId,
                };
                console.log(dashboardResponse);
                return resp.status(200).send(dashboardResponse);
            }).catch((err) => resp.send(400, err));
    });
};

exports.getLinksCount = (req, resp) => {
    sfmcHelper.createSoapClient(req.body.refresh_token, (e, response) => {
        if (e) { return resp.status(500).end(e); }

        console.log(response);
        const requestObject = {
            RetrieveRequest: {
                ClientIDs: {
                    ClientID: req.body.enterpriseId,
                },
                ObjectType: `DataExtensionObject[${process.env.LinkDataExtension}]`,
                Properties: ['LinkID', 'LinkName', 'BaseURL', 'ContentsCount', 'Status', 'JSONParameters', 'Parameters', 'CustomParameters', 'FullURL', 'Created', 'Modified'],
                Filter: sfmcHelper.simpleFilter('Flag', 'equals', 1),
            },
        };

        sfmcHelper.retrieveRequest(response.client, requestObject)
            .then((body) => {
                console.log(body);
                const dashboardResponse = {
                    data: body,
                    refresh_token: response.refresh_token,
                    enterpriseId: req.body.enterpriseId
                };
                return resp.status(200).send(dashboardResponse);
            }).catch((err) => resp.send(400, err));
    });
};

exports.getLinkByID = (req, resp) => {
    sfmcHelper.createSoapClient(req.body.refresh_token, (e, response) => {
        if (e) { return resp.status(500).end(e); }

        const requestObject = {
            RetrieveRequest: {
                ClientIDs: {
                    ClientID: req.body.enterpriseId,
                },
                ObjectType: `DataExtensionObject[${process.env.LinkDataExtension}]`,
                Properties: ['LinkID', 'LinkName', 'BaseURL', 'ContentsCount', 'Status', 'JSONParameters', 'Parameters', 'CustomParameters', 'FullURL', 'Created', 'Modified'],
                Filter: sfmcHelper.simpleFilter('LinkID', 'equals', req.body.LinkID),
            },
        };

        sfmcHelper.retrieveRequest(response.client, requestObject)
            .then((body) => {
                console.log(body);
                const r1 = {
                    link: body,
                    refresh_token: response.refresh_token,
                    enterpriseId: req.body.enterpriseId,
                };
                resp.send(200, r1);
            }).catch((err) => resp.send(400, err));
    });
};

exports.UpsertLink = (req, resp) => {
    sfmcHelper.createSoapClient(req.body.refresh_token, (e, response) => {
        if (e) { return resp.status(500).end(e); }
        console.log("UpsertLink <br>");
        console.log(req.body);
        const Properties = [{
            Name: 'LinkName',
            Value: req.body.linkName,
        }, {
            Name: 'BaseURL',
            Value: req.body.baseUrl,
        }, {
            Name: 'ContentsCount',
            Value: req.body.contentsCount === undefined ? 0 : req.body.contentsCount,
        }, {
            Name: 'Status',
            Value: req.body.status,
        }, {
            Name: 'Flag',
            Value: 1,
        },
        {
            Name: 'JSONParameters',
            Value: JSON.stringify(req.body.JSONParameters),
        },
        {
            Name: 'Parameters',
            Value: req.body.Parameters,
        },
        {
            Name: 'CustomParameters',
            Value: req.body.CustomParameters,
        },
        {
            Name: 'FullURL',
            Value: req.body.baseUrl + req.body.Parameters + req.body.CustomParameters,
        },
        {
            Name: 'Created',
            Value: req.body.Created,
        },
        {
            Name: 'Modified',
            Value: req.body.Modified,
        },
        ];

        console.log(Properties);
        const UpdateRequest = sfmcHelper.UpdateRequestObject(process.env.LinkDataExtension, [{
            Name: 'LinkID',
            Value: req.body.LinkID === undefined ? uuidv1() : req.body.LinkID,
        }], Properties);

        console.log(UpdateRequest);
        sfmcHelper.upsertDataextensionRow(response.client, UpdateRequest)
            .then((body) => {
                if (body.StatusCode !== undefined) {
                    const r1 = {
                        refresh_token: response.refresh_token,
                        Status: body.StatusCode[0],
                    };
                    return resp.send(200, r1);
                }

                return resp.send(200, body);
            }).catch((err) => resp.send(400, err));
    });
};
