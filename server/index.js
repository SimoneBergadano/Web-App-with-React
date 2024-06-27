'use strict';

// imports
const express = require('express');
const morgan = require('morgan');
const {check, validationResult} = require('express-validator');
const cors = require('cors');
const dao = require('./dao');
const userDao = require('./user_dao');
const dayjs = require('dayjs');

// Passport-related imports
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

// init
const app = express();
const port = 3001;

// set up middlewares
app.use(express.json());
app.use(morgan('dev'));
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
}
app.use(cors(corsOptions));

app.use(express.static('public'));

// Passport: set up local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await userDao.getUser(username, password);
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + email + name
  return cb(null, user);
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/* API Indovina chi */

// Questa API fornisce la lista degli animali del gioco (di lunghezza diversa a seconda della difficoltà)
app.get('/api/animals/:difficulty', 
[
  check('difficulty').notEmpty(),
  check('difficulty').isString(),
  check('difficulty').isIn(['facile', 'media', 'difficile']),
],
(req, res) => {
  setTimeout( async ()=>{

    try{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }

    let difficulty = req.params.difficulty;
    let N;
    if(difficulty==="facile")N=12;
    else if(difficulty==="media")N=24;
    else N=36;

    let animals = await dao.listAnimals();
    res.json(animals.slice(0, N));
    
  }catch{
    res.status(500).end();
  }
  }, 500);

});

// questa API fornisce la lista delle proprietà
app.get('/api/properties', (req, res) => {
  const properties = ["Mammifero", "Acquatico", "Cammina", "Carnivoro", "Vola"];
  res.json(properties);
});


// Questa API crea una nuova partita salvando le informazioni nel db e restituisce al client il match id identificativo univoco della partita
app.post('/api/matches/new',
[
  check('difficulty').notEmpty(),
  check('difficulty').isString(),
  check('difficulty').isIn(['facile', 'media', 'difficile']),
],
//isLoggedIn, l'API è accessibile anche per utenti non autenticati
 async (req, res) => {

  setTimeout(async ()=>{

    try{

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
      }

      let user_id;

      if(req.isAuthenticated()){
        console.log("è loggato l'utente con id: "+req.user.id);
        user_id=req.user.id;
      }else{
        console.log("L'utente non è loggato");
        user_id=-1; // -1 sta per giocatore non loggato
      }

      const difficulty = req.body.difficulty;
      //console.log(difficulty)

      let N;
      if(difficulty==="facile")N=12;
      else if(difficulty==="media")N=24;
      else N=36;

      let id_partita = await dao.get_new_id();
      let all_animals = await dao.listAnimals();

      // prendo i primi N elementi dal db
      const animals = all_animals.slice(0, N);

      // estraggo l'animale misterioso
      const numeroCasuale = Math.floor(Math.random() * animals.length);
      const oggetto_misterioso = animals[numeroCasuale].Nome;

    
      //salvo le informazioni nel db
      let data = dayjs().format("YYYY-MM-DD");
      dao.saveNewMatch(id_partita, user_id, difficulty, oggetto_misterioso, data);
      console.log("------------------------------------------------------------");
      console.log("Partita: "+id_partita+": L'oggetto misterioso è: "+oggetto_misterioso);
      console.log("------------------------------------------------------------");
      res.json({id: id_partita}).status(200).end();
    }catch{
      res.status(500).end();
    }

},1000);
  
});

// Questa API fornisce la risposta a una domanda su una caratteristica dell'animale misterioso incrementando il numero di richieste nel db
app.post('/api/askQuestion/:match_id',
//isLoggedIn, // anche gli utenti non autenticati possono giocare controllero' dopo se si tratta di un giocatore autenticato
[
  check('match_id').notEmpty(),
  check('match_id').isNumeric(),
  check('property').notEmpty(),
  check('property').isString(),
],
 async (req, res) => {

  setTimeout(async ()=>{

    try{

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
      }

      const match_id = req.params.match_id;
      const requested_property = req.body.property;

      // Verifico che chi fa la richiesta sia il legittimo proprietario della partita
      let user_id;
      if(req.isAuthenticated()){
        console.log("è loggato l'utente con id: "+req.user.id);
        user_id=req.user.id;
      }else{
        console.log("L'utente non è loggato");
        user_id=-1; // -1 sta per giocatore non loggato
      }
      let match_owner = await dao.getMatchOwner(match_id);
      if(user_id!==match_owner){
        return res.status(401).end();
      }

    
      await dao.increase_request(match_id);
      let property = await dao.getProperty(match_id, requested_property);
      return res.json(property).status(200).end();
    }catch{
      return res.status(500).end();
    }

  }, 1000);
  
});

// Questa API termina il gioco calcola il punteggio, lo salva nel db e infine lo comunica al client
// puo' essere chiamata una sola volta per ogni partita
app.post('/api/guessAnimal/:match_id',
//isLoggedIn, // anche gli utenti non autenticati possono giocare controllero' dopo se si tratta di un giocatore autenticato
[
  check('match_id').notEmpty(),
  check('match_id').isNumeric(),
  check('animal').notEmpty(),
  check('animal').isString(),
],
 async (req, res) => {

  setTimeout(async ()=>{

    try{

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
      }

      const match_id = req.params.match_id;
      let punteggio;

      // Verifico che chi fa la richiesta sia il legittimo proprietario della partita
      let user_id;
      if(req.isAuthenticated()){
        console.log("è loggato l'utente con id: "+req.user.id);
        user_id=req.user.id;
      }else{
        console.log("L'utente non è loggato");
        user_id=-1; // -1 sta per giocatore non loggato
      }
      let match_owner = await dao.getMatchOwner(match_id);
      if(user_id!==match_owner){
        return res.status(401).end();
      }

      // Verifico che la partita non sia già stata terminata
      let already_ended = await dao.checkMatchAlreadyEnded(match_id);
      if(already_ended){
        return res.status(400).json({error: "partita già terminata"}).end();
      }

    
      const client_animal = req.body.animal;
      let secret_animal = await dao.getSecretAnimal(match_id);
      console.log(secret_animal)
      console.log(client_animal)
      console.log(client_animal==secret_animal)

      if(client_animal==secret_animal){
        
        let difficulty = await dao.getDifficulty(match_id);
        console.log("difficoltà;")
        console.log(difficulty);
        let N;
        if(difficulty==="facile")N=12;
        else if(difficulty==="media")N=24;
        else N=36;
        let attempt = await dao.getAttempts_number(match_id);
        punteggio=N-attempt;
        if(punteggio<0) punteggio=0;
      }else{
        punteggio=0;
      }

      await dao.saveMatchPoints(match_id, punteggio);
      return res.json({animale: secret_animal, punteggio: punteggio}).status(200).end();
      
    }catch{
      return res.json({error: "internal server error"}).status(500).end();
    }

  }, 1000);
  
});

// Questa API fornisce lo storico delle partite di un dell'utente autenticato che fa richiesta
app.get('/api/history/', isLoggedIn, async (req, res) => {
  
  setTimeout( async ()=>{
    try{
      let history = await dao.getHistory(req.user.id);
      //console.log(history)
      return res.json(history).status(200).end();  
    }catch{
      return res.json({error: "internal server error"}).status(500).end();
    }

  }, 1000);
  
  
})


// API autenticazione

// POST /api/sessions
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).send(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        return res.status(201).json(req.user);
      });
  })(req, res, next);
});

/* If we aren't interested in sending error messages... */
/*app.post('/api/sessions', passport.authenticate('local'), (req, res) => {
  // req.user contains the authenticated user, we send all the user info back
  res.status(201).json(req.user);
});*/

// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

