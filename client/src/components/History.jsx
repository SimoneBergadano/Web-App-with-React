import {Button, Table, Spinner} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import API from '../API';


export default function History(props) {

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  const navigate = useNavigate();

  const loadData = async (id) => {
    setLoading(true);
    try{
      const h = await API.getHistory(props.userId);
      //console.log(h);
      setHistory(h);
    }catch{
      props.setMessage({msg: "è stato riscontrato un errore", type: "danger"});
    }
    setLoading(false);
  }

 

  useEffect(()=> {
      if(props.loggedIn==false){
        navigate("/");
        return;
      }
      loadData();
  }, []);


  if(loading==true) return(
    <div className="centra" >
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
  else return (
    <div className="verticale margine">
      <h1>Storico partite di {props.userName.toUpperCase()}</h1>
      <h2>Punteggio totale: {history.reduce((sum, m) => sum + m.punteggio, 0)}</h2>
      <br/>
      <HistoryTable history={history}/>
      <Link to={"/"}>
        <Button>Torna alla home</Button>
      </Link>
    </div>
    
  );
}

function HistoryTable(props) {
  
  const history = props.history;

  if (history.length === 0)
    return <p> Non è presente alcuna partita da mostrare </p>
  else
    return (
        <div className="historyTable">
            <Table striped>
              <tbody>
                <TablseHeader/>
                {
                  history.map((m, idx) =>
                    <TablseRow match={m} key={idx} n={idx}/>
                  )
                }
              </tbody>
            </Table>
          </div>
    );
}

function TablseHeader(props) {

  const match = props.match;

  return(
    <tr>
      <th>Partita</th>
      <th>Data</th>
      <th>Difficoltà</th>
      <th>Animale misterioso</th>
      <th>Punteggio</th>
    </tr>
  );
}

function TablseRow(props) {

  const match = props.match;

  return(
    <tr>
      <td>
        {props.n+1}
      </td>
      <td>
        {match.data}
      </td>
      <td>
        {match.difficolta}
      </td>
      <td>
        {match.animale_misterioso}
      </td>
      <td>
        {match.punteggio}
      </td>
    </tr>
  );
}


