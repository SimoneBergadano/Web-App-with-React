'use strict';

const dayjs = require('dayjs');

function Animale(Nome, Mammifero, Acquatico, Cammina, Carnivoro, Vola) {
  this.Nome = Nome;
  this.Mammifero = Mammifero;
  this.Acquatico = Acquatico;
  this.Cammina = Cammina;
  this.Carnivoro = Carnivoro;
  this.Vola = Vola;
}

function Partita(data, difficolta, animale_misterioso, punteggio) {
  this.data = data;
  this.difficolta = difficolta;
  this.animale_misterioso = animale_misterioso;
  this.punteggio = punteggio;
}

// --------

function Flight(id, departure, arrival, date, airplane_type) {
  this.id = id;
  this.departure = departure;
  this.arrival = arrival;
  this.date = date;
  this.airplane_type = airplane_type;
}

function Reservation(flight_id, F, P, user_id) {
  this.flight_id = flight_id;
  this.F = F;
  this.P = P;
  this.user_id = user_id;
}

module.exports = { Animale, Flight, Reservation, Partita };