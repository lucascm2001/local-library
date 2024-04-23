const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const RateLimit = require('express-rate-limit');

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
});

const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');

const app = express();

mongoose.set('strictQuery', false);
const dev_db_url = 'mongodb+srv://lchavesmeyles:PqytxRgl3rqvFi4y@cluster0.c0faorz.mongodb.net/local_library?retryWrites=true&w=majority&appName=Cluster0';

const mongoDB = process.env.MONGODB_URL || dev_db_url;

async function main() {
  await mongoose.connect(mongoDB);
}

main().catch((err) => console.log(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(limiter);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'script-src': ["'self'", 'code.jquery.com', 'cdn.jsdelivr.net'],
    },
  }),
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// username: lchavesmeyles
// password: PqytxRgl3rqvFi4y

// mongodb+srv://lchavesmeyles:PqytxRgl3rqvFi4y@cluster0.c0faorz.mongodb.net/local_library?retryWrites=true&w=majority&appName=Cluster0
