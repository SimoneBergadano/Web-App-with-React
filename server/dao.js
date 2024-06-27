"use strict"

/* Data Access Object (DAO) module for accessing Q&A */
/* Initial version taken from exercise 4 (week 03) */

const { Animale, Flight, Reservation, Partita }= require('./Models');

const { db } = require('./db');

// get animals
exports.listAnimals = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Animali';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      const animals = rows.map((a) => new Animale(a.Animale, 
                                                  a.Mammifero==="Si", a.Acquatico==="Si", 
                                                  a.Cammina==="Si", a.Carnivoro==="Si", 
                                                  a.Vola==="Si"));
      resolve(animals);
    });
  });
}

const increase_id = () => {
  return new Promise ((resolve, reject) => {

    const sql = "UPDATE Last_id SET last_id = last_id + 1;";

    db.run(sql, function(err) {
      if(err) reject(err);
      else resolve(this.lastID);
    });
  });
};

const getId = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Last_id;';
    db.get(sql, [], (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row);
    });
  });
}

exports.get_new_id = async ()=>{
  await increase_id();
  let tmp = await getId();
  return tmp.last_id;
}

// new match
exports.saveNewMatch = (id_partita, user_id, difficolta, oggetto_misterioso, data) => {
  return new Promise ((resolve, reject) => {

    const sql = 'INSERT INTO Partite(id_partita, user_id, difficolta, oggetto_misterioso, numero_richieste, punteggio_partita, data) VALUES (?, ?, ?, ?, 0, NULL, ?)';
    db.run(sql, [id_partita, user_id, difficolta, oggetto_misterioso, data], function(err) {
      if(err) reject(err);
      else{
        resolve(id_partita);
      };
    });
    
  });
};


exports.getProperty = (match_id, property) => {
  return new Promise((resolve, reject) => {
    const sql = 'select * from Animali as A, Partite as P where P.id_partita=? and A.Animale=P.oggetto_misterioso;';
    db.get(sql, [match_id], (err, row) => {
      if (err) {
        reject(err);
      }
      resolve({[property]: row[property]==="Si"});
    });
  });
}

exports.increase_request = (match_id) => {
  return new Promise ((resolve, reject) => {

    const sql = "UPDATE Partite SET numero_richieste = numero_richieste + 1 where id_partita=?;";

    db.run(sql, [match_id], function(err) {
      if(err) reject(err);
      else resolve(this.lastID);
    });
  });
};

exports.getSecretAnimal = (match_id) => {
  return new Promise((resolve, reject) => {
    const sql = 'select oggetto_misterioso from Partite  where id_partita=?;';
    db.get(sql, [match_id], (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row.oggetto_misterioso);
    });
  });
}

exports.getDifficulty = (match_id) => {
  return new Promise((resolve, reject) => {
    const sql = 'select difficolta from Partite where id_partita=?;';
    db.get(sql, [match_id], (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row.difficolta);
    });
  });
}

exports.getAttempts_number = (match_id) => {
  return new Promise((resolve, reject) => {
    const sql = 'select numero_richieste from Partite where id_partita=?;';
    db.get(sql, [match_id], (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row["numero_richieste"]);
    });
  });
}

exports.saveMatchPoints = (match_id, punteggio) => {
  return new Promise ((resolve, reject) => {

    const sql = "UPDATE Partite SET punteggio_partita=? where id_partita=?;";

    db.run(sql, [punteggio, match_id], function(err) {
      if(err) reject(err);
      else resolve(this.lastID);
    });
  });
};

exports.checkMatchAlreadyEnded = (match_id) => {
  return new Promise((resolve, reject) => {
    const sql = 'select punteggio_partita from Partite where id_partita=?;';
    db.get(sql, [match_id], (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row.punteggio_partita!==null);
    });
  });
}

exports.getMatchOwner = (match_id) => {
  return new Promise((resolve, reject) => {
    const sql = 'select user_id from Partite  where id_partita=?;';
    db.get(sql, [match_id], (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row.user_id);
    });
  });
}

exports.getHistory = (user_id) => {
  return new Promise((resolve, reject) => {
    const sql = 'select data, difficolta, oggetto_misterioso, punteggio_partita from Partite  where user_id=? and punteggio_partita is not null;';
    db.all(sql, [user_id], (err, rows) => {
      if (err) {
        reject(err);
      }
      const history = rows.map((r) => new Partita(r.data, r.difficolta, r.oggetto_misterioso, r.punteggio_partita));
      resolve(history);
    });
  });
}


