require('dotenv').config();
const express = require("express"); // nao precisa de caminho, pois esta dentro do node modules
const app = express();
const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        app.emit('pronto')
    })
    .catch(e => console.log(e));
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
mongoose.set('strictQuery', true);
const routes = require('./routes');
const path = require('path');
const helmet = require('helmet');
const csrf = require('csurf'); // token
// associacao via desestruturacao
const {middlewareGlobal, checkCsrfError, csrfMiddleware} = require('./src/middlewares/middleware');
// post = criar
// get = ler
// put = atualizar
app.use(helmet());
app.use(express.urlencoded({extended: true})); // trata para receber o que foi postado
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

const sessionOptions = session({
    secret: 'jjfjfkj7475m87198789jufiofiuf47544654588975898njnguihf()',
    store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
});
app.use(sessionOptions);
app.use(flash());

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

// nossos propios middlewares
app.use(csrf());
app.use(middlewareGlobal);
app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(routes);

// a conexao so vai acontecer se for emitido o sinal pronto
app.on('pronto', () => {
    app.listen(3000, () => {
        console.log('acessar http://localhost:3000');
        console.log('servidor executando na porta 3000');
    });
})

