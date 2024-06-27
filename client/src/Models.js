'use strict';

const dayjs = require('dayjs');

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

module.exports = { Flight, Reservation };