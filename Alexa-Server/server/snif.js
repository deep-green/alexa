// simple request url logger

module.exports = (express, alexaAppServer) => {
    express.use('/', (req, res, next) => {
        if (req.connection.ssl) {
            console.warn('**** server: ssl request', req.url);
            next();
        } else {
            console.warn('**** server: non-ssl request', req.url);
            next();
        }
    });
};
