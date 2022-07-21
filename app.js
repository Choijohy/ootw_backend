// (1)듈 및 패키지 import 
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport =require('passport');
const passportConfig = require('./passport');



//process.env
dotenv.config();
passportConfig();

// authentication router 
const authRouter = require('./routes/auth');
const pageRouter = require('./routes/page');
const postRouter = require('./routes/post');
const { sequelize } = require('./models');

//(2) app 세팅: port, template engine, database(sequelize)
const app = express();
app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

//seqeulize -> promise(then/catch)
//force: true  - 재연결할 때마다, 테이블 삭제(drop)후 다시 생성(서버 다시 킬 때마다 변경사항 반영 가능 but, 데이터 날라감 )
sequelize.sync({ force:false}) 
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

//(3) 미들웨어
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img',express.static(path.join(__dirname,'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // 데이터타입 multipart/form-data - req.body 사용 가능 
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  name:'connect.sid',
}));

app.use(passport.initialize());
app.use(passport.session());

//(4) 라우팅
app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post',postRouter);

//404 처리 미들웨어
app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

//에러처리 미들웨어 (인자 4개 꼭 작성 -err/req/res/next)
app.use((err, req, res, next) => {
  // 템플릿 엔진에서 message 변수 사용 가능
  res.locals.message = err.message; 
  // 템플릿 엔진에서 error 변수 사용가능
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});


app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});