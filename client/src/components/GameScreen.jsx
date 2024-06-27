import { Row, Col, Button, Spinner, ButtonGroup, Form} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../API';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PlaceHolder from '../assets/placeholder.png'

import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';



export default function GameScreen(props) {

  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [Animals, setAnimals] = useState([]);
  const [choices, setChoices] = useState([]);
  const [PartitaTerminata, setPartitaTerminata] = useState(false);

  // callback che gestisce la fine del gioco
  // l'animale scelto viene inviato al server che risponde
  // con l'animale misterioso e il punteggio ottenuto che ha salvato nel db
  const checkAnswer= async (chosen_animal)=>{

    setPartitaTerminata(true);// fa sparire la griglia e le scelte
    //console.log(chosen_animal);
    props.setMessage({msg: "", type: ""});//faccio sparire eventuali messaggi
    setLoading(true);

    try{
      let res = await API.guessAnimal(params.id, chosen_animal);
      if(res.animale===chosen_animal){
        props.setMessage({msg: "Complimenti hai indovinato l'animale misterioso ("+chosen_animal+") hai ottenuto un punteggio di "+res.punteggio, type: "success"});
      }else{
        props.setMessage({msg: "Ci dispiace, hai selezionato "+chosen_animal+" ma l'animale misterioso era "+res.animale+" punteggio: "+res.punteggio, type: "danger"});
      }
    }catch{
      props.setMessage({msg: "è stato riscontrato un errore", type: "danger"});
    }
    setLoading(false);
  };

  // la callback che gestisce la scelta delle proprietà si trova nell'elemento choice


  // Carica le informazioni sugli animali e sulle proprietà dal server
  const loadData = async (id) => {
    setLoading(true);
    try{
      const animals = await API.getAnimals(params.difficulty);
      setAnimals(animals);
      const properties = await API.getProperties();
      setChoices(properties);
    }catch{
      props.setMessage({msg: "è stato riscontrato un errore", type: "danger"});
    }
    setLoading(false);
  }

 

  useEffect(()=> {
      loadData(params.id);
      //console.log(Animals)
  }, []);


  if(loading==true) return(
    <div className="centra" >
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
  else if(PartitaTerminata)return(<div className="centra verticale">
              <h2>Partita terminata</h2>
              <Link to={"/"}>
                  <Button>Torna alla home</Button>
              </Link>
  </div>);
  else return (
    <>
      
      <h1 className="centra">Scegli un animale o seleziona una proprietà</h1>

      {/* {Animals.map((a, idx)=><p key={idx}>{a.Nome}</p>)} */}

      <Choices choices={choices} setAnimals={setAnimals} 
                match_id={params.id} setMessage={props.setMessage}
      />

      <br/>

      <Grid animals={Animals} checkAnswer={checkAnswer}/>


      
      
    </>
  );
}


function Grid(props){

  return(<div className="responsive">

      {
      props.animals.map((a, idx) =>
        <Card name={a.Nome} key={idx} checkAnswer={props.checkAnswer}/>)
      }
  
  </div>);

}



function Card(props){

  return(
    <div className="verticale card">
      <img
        alt={"Immagine "+props.name}
        src={"http://localhost:3001/images/"+props.name+".JPG"}
        width="150" height="150"
        />
      <Button variant="primary" onClick={()=>props.checkAnswer(props.name)}>{props.name}</Button>
    </div>
  );
  
}

function Choices(props){

  return(
    <div className="responsive">
      {
      props.choices.map((c) =>
            <Choice property={c} key={c} setAnimals={props.setAnimals} 
            match_id={props.match_id} setMessage={props.setMessage}
            />
        )
      }  
    </div>
  );
  
}

function Choice(props){

  const [value, setValue] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [loadingCloice, setLoadingChoice] = useState(false);

  // filtra la lista degli animali
  const filterAnimals = (value)=>{
    //console.log(props.c+": "+value);
    props.setAnimals(
      animals=>animals.filter(a=>a[props.property]===value)
    );
  }

  const askQuestion = async (value)=>{

    setLoadingChoice(true);
    try{
      let response = await API.askQuestion(props.match_id, props.property);
      if(response[props.property]===value){
        props.setMessage({msg: "La scelta effettuata in merito alla caratteristica "+props.property+" è corretta", type: "success"});
      }else{
        value=!value;
        props.setMessage({msg: "La scelta effettuata in merito alla caratteristica "+props.property+" è errata", type: "danger"});
      }
      filterAnimals(value);
      setValue(value?1:2);
      setDisabled(true);
    }catch{
      props.setMessage({msg: "è stato riscontrato un errore", type: "danger"});
    }
    setLoadingChoice(false);

  };


  return(

      <div className="choice centra">
      {loadingCloice && <Spinner animation="border" variant="primary" />}
      <ButtonGroup>
      <DropdownButton as={ButtonGroup} title={props.property+((value===0)?"?":value===1?": Si":": No")} 
        id="bg-nested-dropdown" 
        disabled={disabled || loadingCloice}
        variant={value===0?"outline-primary":value===1?"success":"danger"}>
        <Dropdown.Item eventKey="1" onClick={()=>{ askQuestion(true); }} >Si</Dropdown.Item>
        <Dropdown.Item eventKey="2" onClick={()=>{ askQuestion(false); }} >No</Dropdown.Item>
      </DropdownButton>
      </ButtonGroup>
      </div>
    
  );
  
}
