const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const items = require('./routes/items');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', index);
app.use('/api/items', items);


if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
}
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 200);
        res.json({
            message: err.message,
            error: err
        });
    });
}
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    // send error message
    res.status(err.status || 200).send({ message: err.message });
});

app.listen(3000, () => {
    console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;