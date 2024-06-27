// npm install bootstrap
// npm install bootstrap-icons
// npm install react-bootstrap
// npm install dayjs
// npm install react-router-dom

import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Alert } from 'react-bootstrap';

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import API from './API';
import NavHeader from './components/NavbarComponents';
import { LoginForm } from './components/AuthComponents';
import NotFound from './components/NotFoundComponent';

import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import History from './components/History';

import './App.css'

function App() {

  const [message, setMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(undefined);

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({msg: `Welcome, ${user.name}!`, type: 'success'});
      setUserName(user.name);
      setUserId(user.id);
    }catch(err) {
      setMessage({msg: err, type: 'danger'});
    }
  };

  const handleLogout = async () => {
    //await API.logOut();
    setLoggedIn(false);
    setUserName('');
    // clean up everything
    setMessage('');
  };

  return (
    <BrowserRouter>
        <Routes>
          
          <Route element={
            <>
              <NavHeader loggedIn={loggedIn} handleLogout={handleLogout} userName={userName} />
              <Container fluid className="mt-3">
                {message && <Row>
                  <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
                </Row> }
                <Outlet/>
              </Container>
            </>} >
            <Route index 
              element={ <MainMenu loggedIn={loggedIn} setMessage={setMessage} /> } />
            <Route path='partita/:difficulty/:id' 
              element={<GameScreen loggedIn={loggedIn} setMessage={setMessage}/> } />
            <Route path='/storico-partite' 
              element={<History loggedIn={loggedIn} setMessage={setMessage} userId={userId} userName={userName}/> } /> 
            <Route path='/login' element={
              loggedIn ? <Navigate replace to='/' /> : <LoginForm login={handleLogin} />
            
            } />

            <Route path='*' element={ <NotFound/> } />
            
          </Route>
        </Routes>
    </BrowserRouter>
  )
}

export default App

