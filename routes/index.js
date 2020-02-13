/* eslint-disable max-len */
const sfmcHelper = require('./sfmcHelper');
const installAppExchange = require('./InstallAppExchange');


// eslint-disable-next-line consistent-return
exports.login = (req, res) => {
    try {
        if (req.query.code === undefined) {
            let stateParam = '&state=mcapp';
            if (req.query.state !== undefined) {
                stateParam = `&state=${req.query.state}`;
            }
            const redirectUri = `${process.env.baseAuth}/v2/authorize?response_type=code&client_id=trwp5iupkzh3nl75dyayeo2l&redirect_uri=https://appsflyers-poc-packages.herokuapp.com/login${stateParam}`;
            // res.redirect('https://mc8nghvf-gp9-nfl9jcsjjs7r214.auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id=g7j9nk7vj5o6dv1v9j34d9ei&redirect_uri=https://appsflyer-mc-app-dev.herokuapp.com/login&state=mystate');
            res.redirect(redirectUri);
        } else {
            console.log('Entro con el codigo de authenticacion');
            const tssd = req.query.tssd === undefined ? '' : req.query.tssd;
            console.log('Estado : ', req.query.state);
            const { state } = req.query;
            const request = {
                body: {
                    code: req.query.code,
                    tssd,
                },
            };

            console.log(req.query.code);

            if (state === 'mcapp') {
                sfmcHelper.authorize(request, (e, r) => {
                    if (e) {
                        res.status(400).end(e);
                        return;
                    }
                    const Request2 = {
                        body: {
                            refresh_token: r.refreshToken,
                            eid: r.bussinessUnitInfo.enterprise_id,
                        },

                    };
                    // eslint-disable-next-line consistent-return
                    sfmcHelper.getTokenRows(Request2, (error, response) => {
                        if (!error) {
                            // console.log(response.OverallStatus.indexOf("Error: Data extension does not exist"))
                            if (response.OverallStatus !== 'OK') {
                                installAppExchange.createDataExtensions(Request2)
                                    .then((resp) => {
                                        console.log(resp);
                                        const view = `/mcapp/home?eid=${resp.eid}&rt=${resp.refreshToken}`;
                                        return res.redirect(view);
                                    })
                                    .catch((err) => { console.log(err); });
                            } else {
                                // si ok y hay datos redirecciono al dashboard
                                let view = '';
                                if (response.length > 0) {
                                    view = `/dashboard/home?eid=${r.bussinessUnitInfo.enterprise_id}&rt=${r.refreshToken}`;
                                } else {
                                    // si no  hay datos redirecciono al home
                                    view = `/mcapp/home?eid=${r.bussinessUnitInfo.enterprise_id}&rt=${r.refreshToken}`;
                                }
                                return res.redirect(view);
                            }
                        }
                    });
                    console.log(r);
                });
            }

            if (state === 'image' || state === 'button') {
                let returnView = '';
                console.log(state);


                sfmcHelper.authorize(request, (e, r) => {
                    if (e) {
                        res.status(400).end(e);
                        return;
                    }

                    if (state === 'image') {
                        returnView = `/image/?rt=${r.refreshToken}&eid=${r.bussinessUnitInfo.enterprise_id}`;
                    } else {
                        returnView = `/button/?rt=${r.refreshToken}&eid=${r.bussinessUnitInfo.enterprise_id}`;
                    }

                    console.log('Authorized: ', r);
                    console.log('Redirect Uri: ', returnView);
                    res.redirect(returnView);
                });
            }
        }
    } catch (err) {
        return res.status(200).send(err);
    }
};


exports.logout = (req) => {
    req.session.token = '';
};
