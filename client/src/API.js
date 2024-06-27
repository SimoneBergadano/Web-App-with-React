//import {Flight, Reservation} from './Models';
const SERVER_URL = 'http://localhost:3001';


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

const getAnimals = async (difficulty) => {
    const response = await fetch(SERVER_URL + '/api/animals/'+difficulty);
    if(response.ok) {
      const animalsJson = await response.json();
      //console.log(animalsJson);
      return animalsJson.map((a) => new Animale(a.Nome, 
                                      a.Mammifero, a.Acquatico, 
                                      a.Cammina, a.Carnivoro, 
                                      a.Vola));
    }
    else
      throw new Error('Internal server error');
  }

const getProperties = async () => {
  const response = await fetch(SERVER_URL + '/api/properties');
  if(response.ok) {
    const properties = await response.json();
    return properties;
  }else
    throw new Error('Internal server error');
}

const createNewMatch = async (difficoltà) => {
  const response = await fetch(SERVER_URL + "/api/matches/new", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({difficulty: difficoltà}) 
    });
    if(response.ok) {
      const respJson = await response.json();
      return respJson.id;
    }else{
      throw new Error('Internal server error');
    }
}

const askQuestion = async (match_id, question) => {
  const response = await fetch(SERVER_URL + "/api/askQuestion/"+match_id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({property: question}) 
    });
    if(response.ok) {
      const respJson = await response.json();
      return respJson;
    }else{
      throw new Error('Internal server error');
    }
}

const guessAnimal = async (match_id, animal) => {
  const response = await fetch(SERVER_URL + "/api/guessAnimal/"+match_id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({animal: animal}) 
    });
    if(response.ok) {
      const respJson = await response.json();
      return respJson;
    }else{
      throw new Error('Internal server error');
    }
}

const getHistory = async () => {
  const response = await fetch(SERVER_URL + '/api/history', {credentials: 'include'});
  if(response.ok) {
    const history = await response.json();
    return history.map(a=>new Partita(a.data, a.difficolta, a.animale_misterioso, a.punteggio));
  }else
    throw new Error('Internal server error');
}

// API autenticazione

const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;  // an object with the error coming from the server
  }
};

const logOut = async() => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}

  


const API = {logIn, getUserInfo, logOut, getAnimals, getProperties, createNewMatch, askQuestion,  guessAnimal, getHistory};
export default API;

