import { Row, Col, Button, ButtonGroup} from 'react-bootstrap';
import { Link, useNavigate} from 'react-router-dom';
import API from '../API';
import { useEffect, useState} from 'react';
import Spinner from 'react-bootstrap/Spinner';

import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';



export default function MainMenu(props) {

  const [crazionePartita, setCrazionePartita] = useState(false);
  const [difficulty, setDifficulty] = useState("facile");

  const navigate = useNavigate();

  useEffect(()=> {
    props.setMessage(); // chiude evetuali messaggi quando entro nella home
  }, []);



  const nuova_partita = async ()=>{
    setCrazionePartita(true);
      try{
        let id_partita = await API.createNewMatch(difficulty);
        console.log("nuova partita creata");
        navigate("partita/"+difficulty+"/"+id_partita);
      }catch{
        props.setMessage({msg: "Errore server impossibile creare una partita", type: "danger"});
      }
      setCrazionePartita(false);
  };

  return (
    <div className="centra verticale">

      
      <div className="margine" >
      <ButtonGroup>
      <DropdownButton as={ButtonGroup} title={"Difficoltà: "+difficulty} id="bg-nested-dropdown" variant="outline-primary">
        <Dropdown.Item eventKey="facile" onClick={()=>setDifficulty("facile")} >Facile (12 oggetti)</Dropdown.Item>
        <Dropdown.Item eventKey="media" onClick={()=>setDifficulty("media")} >Media (24 oggetti)</Dropdown.Item>
        <Dropdown.Item eventKey="difficile" onClick={()=>setDifficulty("difficile")} >Difficile (36 oggetti)</Dropdown.Item>
      </DropdownButton>
      </ButtonGroup>
      </div>

      
      <div className="margine" >
        {!crazionePartita?

        <Button size="lg" onClick={nuova_partita}>Gioca</Button>
        :
        <Button size="lg">
          <Spinner
            as="span"
            animation="border"
            size="sm"
          />
          {" creazione partita..."}
        </Button>

      }
      </div>

      <div className="margine" >
        {props.loggedIn &&
          <Link to={`/storico-partite`}>
          <Button variant="success" >Storico partite</Button>
          </Link>
        }
      </div>
      

     
      
     </div>  
  );
}

