import { Link } from 'react-router-dom';
import {Button} from 'react-bootstrap';


export default function NotFound() {

  return (
    <>
      <p className="lead">Il percorso inserito non esiste</p>
      <Link to={"/"}>
        <Button>Torna alla home</Button>
      </Link>
    </>
    
  );
}