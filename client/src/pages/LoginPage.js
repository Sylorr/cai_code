import {useState, useEffect  } from 'react';
import {Jumbotron, Button, OverlayTrigger,Tooltip, Modal, Form,Navbar, Nav} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import axios from '../commons/axios.js';
import { message, Typography ,Layout, Menu, } from 'antd';
import Header from '../components/header.js';
import '../pages/main.css';

function App(props) { 
    const [customer, setCustomer] = useState();
    
    const[lat,setLat] = useState('');
    const[lng,setLng] = useState('');
    const[vendors,setVendors] = useState([]);
    const[modal,setModal] = useState([]);
    const [show, setShow] = useState(false);
    const [userName, setName] = useState('');
    const [password, setPassword] = useState('');
    const handleClose = () => setShow(false);

    useEffect(() =>{
      if(props.location.state){
        setCustomer(props.location.state.customer)
      }else{
        setCustomer(null)
      }
      navigator.geolocation.getCurrentPosition(function (position){
        setLat(position.coords.latitude)
        setLng(position.coords.longitude)
      });
      axios.get('/vendor?lat='+lat+'&lng='+lng).then(response =>{
        setVendors(response.data.vendors)
      })
    },[lat,lng])
  
    const renderTooltip = (props) => (
      <Tooltip id = 'button-tooltip' {...props}>
        feature still in progess
      </Tooltip>
    );

    const handleShow = (e) => {
      if (e.target.outerText === "Customer"){
        setModal('customer')
      }else{
        setModal('vendor')
      }
      setShow(true)
    };

    const onSkip = () =>{
      props.history.push('/customer',{
        position:[lat, lng],
        vendors: vendors

      });
    }

    const onVendorLogin = () => {
      axios.post("/vendor/login", {userName: userName, password: password}).then(response => {
        console.log(userName)
        if(response.data.success){
          //传递本页信息到下一页
          message.success("Logged in successfully!!")
          props.history.push('/vendor', {
            vendor : response.data.vendor, 
            position: [lat,lng],
            vendors: []
          });
        }else{
          message.error(response.data.error)
        }
      }).catch(error =>{
        setShow(false);
        console.log(error.response.data.error)
        message.error(error.response.data.error)
        })
    }
    
    const vendorModal = (
      <>
        <Modal.Header closeButton>
            <Modal.Title>Vendor Login</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formBasic">
                <Form.Label>Vendor Name</Form.Label>
                <Form.Control type="text" placeholder="Enter user name"
                  onChange={e => setName(e.target.value)} />
                <Form.Text className="text-muted">
                  We promise that never sharing your details with others = )
                </Form.Text>  
              </Form.Group>
              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password"
                  onChange={e => setPassword(e.target.value)} /> 
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-dark" onClick={handleClose}>
              Close
            </Button>
            <Button variant="dark" onClick={onVendorLogin}>
              Login
            </Button>
          </Modal.Footer>
      </>
    )
    
    return (
      <div>
        <Header customer = {customer}/>
        <div id="appMain" >
          <Modal show={show} onHide={handleClose} style={{ marginTop: '2vh' }} >
            {(modal === "vendor")? vendorModal:vendorModal}
          </Modal>
          <Jumbotron style = {{background: "white" }}>
            <div class="row"> 
              <div id="column1">
                <img alt="" src="https://assets.website-files.com/5e51c674258ffe10d286d30a/5e535d808becbf7162555033_peep-102.svg" 
                width={'100%'}/>
              </div>
              <div id="column2">
                <h1> Welcome to Le Sillage!</h1>
                <p> We run a fleet of food trucks that work as popup cafes 
                offering high-quality coffee and delicious snacks.</p>
                <br />
              <Button variant = "outline-dark" style = {{marginLeft: "0", marginRight:"1vw", marginBottom:"1vh"}}onClick = {onSkip}>Customer</Button>
              <br />
              <Button variant = "dark" style = {{marginLeft: "0"}} onClick = {handleShow}>Vendor</Button>
              </div>
            </div>
          </Jumbotron>
        </div>
      </div>
    )
} 

export default App;