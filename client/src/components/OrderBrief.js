import React from 'react'
import { Modal, Button, Tooltip, OverlayTrigger } from 'react-bootstrap'; 
import { Badge, Card, notification,Divider,InputNumber,message, Rate, Input } from 'antd';
import { EyeOutlined, EditOutlined, CheckOutlined, CloseOutlined} from '@ant-design/icons';

import CountUp from './Countup.js';
import axios from '../commons/axios';
// import TextArea from 'antd/lib/input/TextArea';

const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful'];
const {TextArea} = Input;
const { Meta } = Card;

export default class   extends React.Component {

    constructor(props){
        super();
        this.state = {
            menu: [],
            order:[],
            modalVisible: false,
            editModalVisibale: false,
            modalBody: <> </>,
            diff: "",
            ratings: 0,
            comment: ""
        }
    }

    

    handleClose = () => this.setState({modalVisible: false});
    handleShow = () => this.setState({modalVisible: true});

    handleEditClose = () => this.setState({editModalVisible: false});
    handleEditShow = () => this.setState({editModalVisible: true});
    
    handleDeleteClose = () => this.setState({deleteModalVisible: false});
    handleDeleteShow = () => this.setState({deleteModalVisible: true});


    onChange = (index, event) => {
        let newArray = [...this.state.order];
        newArray[index] = event;
        this.setState({order: newArray});

    }


    
    tick(){
        let now = new Date().getTime()
        let upd = Date.parse(this.props.order.updatedAt)
        this.setState({diff: ((now - upd) / 60000)})
    }

    componentDidMount(){
        axios.get('/snack').then(response => {
            this.setState({menu: response.data.snacks})
        })
        this.timerID = setInterval(() => this.tick(), 1000); // updates this DOM every second
    }

    componentWillUnmount(){
        clearInterval(this.timerID); // tear down timer so that interval starts over
    }
    
    handleShowOrderDetail = () => {
        console.log(this.props.order)
    }

    ratingsChange = (value) => {
        console.log(value)
        this.setState({ratings: value});
    };

    commentChange = (value) => {
        this.setState({comment: value});
    }

    handleEditOrder = () => {
        console.log(this.state.diff)
        if(this.props.order.status ==="outstanding" && this.state.diff <= 10){
            this.setState({editModalVisible: true});
        }
        if(this.props.order.status ==="fulfilled"){
            notification.open({
                message:'Order is ready to be colleacted!',
                description:'You cannot make any changes to a fulfilled order, you can rate you experience after picked up',
                duration: 3
            });
        }else if(this.props.order.status=== 'outstanding' &&this.state.diff> 10){
            notification.open({
                message:'Order is being processed',
                description:'You can only update your order within 10 min after placing the order',
                duration: 3
            });
        }else if(this.props.order.status=== 'cancelled'){
            notification.open({
                message:'Order has been cancelled',
                description:'You can order later',
                duration: 3
            });
        }else{
            console.log(this.props.order)
            this.setState({editModalVisible: true});
        }
    }
    


    renderEditModalContent = ()=>{
        if(this.props.order.status ==="outstanding"){
            return(
                <>
                    <Modal.Header closeButton>
                        <Modal.Title>{"OrderId:" + this.props.order._id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.menu.map((snack, index) =>(
                            <Card cover={< img alt="example" src={snack.image} />}style={{marginBottom:"2vh"}}size={"small"} key={snack._id}>
                                <Meta
                                    title={snack.name + "    " + snack.price}
                                />
                                <Divider style={{borderWidth:5, borderColor: '#593e34' }} plain>
                                </Divider>
                                <Meta
                                    description={snack.detail}
                                />
                                <InputNumber key ={snack._id} min={0} defaultValue={0} style ={{marginLeft:"80%"}} onChange={e => this.onChange(index, e)} />
                                    
                            </Card>
                        ))}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="dark" onClick={() => this.onOrderSubmit()}>
                            Submit
                        </Button>
                    </Modal.Footer>
                </>
            )
        }else{
            return(
                <>
                    <Modal.Header closeButton>
                        <Modal.Title>{"OrderId:" + this.props.order._id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Vendor:{this.props.order.vendor.name}</p >
                        <p>Snacks:{this.props.order.snacks.map((snack)=> <li key={snack.name}>{snack.name} - qty: {snack.qty}</li>)}</p >
                        <Divider>Rate your experience</Divider>
                        <p>Ratings:</p ><Rate onChange={(e) => this.ratingsChange(e)}/>
                        <Divider></Divider>
                        <p>Comment</p ><TextArea rows={4} onChange={(e) => this.commentChange(e.target.value)}/>
                        {/* {this.state.ratings ? <span className="ant-rate-text">{desc[this.state.ratings - 1]}</span> : ''} */}

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="dark" onClick={() => this.onCommentSubmit()}>
                            Submit
                        </Button>
                    </Modal.Footer>
                </>

            )
        }
    }

    // handleDeleteClose = () => this.setState({deleteModalVisible: false});
    // handleDeleteShow = () => this.setState({deleteModalVisible: true});

    handleDeleteOrder = () => {
        console.log(this.state.diff)
        var statusToBeUpdated = ''
        if(this.props.order.status ==="outstanding" && this.state.diff <= 10){
            statusToBeUpdated = 'cancelled'
            axios.post('/order/'+this.props.order._id+'/update',{
                status: statusToBeUpdated
            }).then(response =>{
                if(response.data.success){
                    message.success("Order has been cancelled!")
                    this.setState({editModalVisible: false});
                    
                }else{
                    message.error("Order cancelled errored!")
                }
            })
        }else{
            console.log(this.props.order)
            notification.open({
                message:'Order cannot be cancelled!',
                description:'Sorry, the order is completed/ fullfiled, you cannot delete it!',
                duration: 3
            });
        }
    }


    renderActions = () => {
        if(window.location.pathname ==="/customer"){
            return (
                [
                    <EyeOutlined onClick = {() => this.handleShow()} />, 
                    <EditOutlined onClick = {() => this.handleEditOrder()}/>,
                    <CloseOutlined onClick = {() => this.handleDeleteOrder()}/>
                ]
            )
        }else if(window.location.pathname ==="/orders"){
            return(
            [
                    <EyeOutlined onClick = {()=> this.handleShow()} />,
                    <CheckOutlined onClick = {()=> this.onOrderMark()} />
            ]
            )
        }
    }

    onOrderMark =() =>{
        var statusToBeUpdated, discount
        var total = this.props.order.total
        if(this.props.order.status === "outstanding"){
            statusToBeUpdated = 'fulfilled'
            if(this.state.diff > 15){
                discount = true
                total = total * 0.8
            }else{
                discount = false
            }
            axios.post('/order/'+this.props.order._id+'/update',{
                total: total,
                discount: discount,
                status: statusToBeUpdated
            }).then(response =>{
                if(response.data.success){
                    message.success("Order has been fulfilled!")
                    this.setState({editModalVisible: false});
                }else{
                    message.error("Order fulfilled errored!")
                }
            })
        }else if(this.props.order.status === "fulfilled"){
            statusToBeUpdated = 'completed'
            axios.post('/order/'+this.props.order._id+'/update',{
                status: statusToBeUpdated
            }).then(response =>{
                if(response.data.success){
                    message.success("Order has been completed!")
                    this.setState({editModalVisible: false});
                }else{
                    message.error("Order completed errored!")
                }
            })
        }else{
            notification.open({
                message:"order is already completed",
                description:"comgratulations! you have completed this order",
                duration: 3
            });
        }
    }

    onOrderSubmit = () => {
            var submitOrder = []
            var total = 0


            for (var i = 0; i < this.state.order.length; i++){

                let update = total + this.state.menu[i].price * this.state.order[i]
                total = update

                if(Number.isFinite(this.state.order[i])){
                    submitOrder.push({
                        "name":this.state.menu[i].name,
                        "qty":this.state.order[i]
                    })
                }
            }
            axios.post('/order/'+this.props.order._id+'/update',{
                total: total
            }).then(response =>{
                if(response.data.success){
                    message.success("price is change")
                    this.setState({editModalVisible: false});
                }
            })

            if (submitOrder.length ===0){
                this.setState({editModalVisible: false});
                message.error("You need to enter more than one snack!")

            }else{
                axios.post('/order/'+this.props.order._id+'/update',{
                    // customer:this.props.order.customer._id,
                    // vendor: this.props.order.vendor._id, //will be changed in the future
                    snacks: submitOrder,
                    status:"outstanding"
                }).then(response =>{
                    if(response.data.success){
                        message.success("Order has been updated!")
                        this.setState({editModalVisible: false});
                    }else{
                        message.error("Order updating errored!")
                    }
                })
            }
            
    }

    // 可以加判断是否可以二次更改comment
    onCommentSubmit = () => {
        axios.post('/order/'+this.props.order._id+'/update',{
            // customer:this.props.order.customer._id,
            // vendor: this.props.order.vendor._id, //will be changed in the future
            comment: this.state.comment,
            rating: this.state.ratings
        }).then(response =>{
            if(response.data.success){
                message.success("Order has been commented!")
                this.setState({editModalVisible: false});
            }else{
                message.error("Order commenting errored!")
            }
        })
    }

    // onOrderDelete = () =>{
    //     var statusToBeUpdated, cancelYes
    //     if(this.props.order.status === "outstanding"){
    //         statusToBeUpdated = 'cancelled'
    //         if(this.state.diff < 10){
    //             cancelYes = true
    //         }
    //         axios.post('/order/'+this.props.order._id+'/update',{
    //             status: statusToBeUpdated
    //         }).then(response =>{
    //             if(response.data.success){
    //                 message.success("Order has been cancelled!")
    //                 this.setState({deleteModalVisible: false});
    //             }else{
    //                 message.error("Order cancelled errored!")
    //             }
    //         })
    //     }else{
    //         notification.open({
    //             message:"order cannot be cancelled",
    //             duration: 3
    //         });
    //     }
    // }






    render() {
        return (
            <>
                <Modal show={this.state.modalVisible} onHide={() => this.handleClose()}>
                    <Modal.Header closeButton>
                        <Modal.Title>{"OrderId: " + this.props.order._id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Vendor: {this.props.order.vendor._id}</p >
                        <p>Snacks: {this.props.order.snacks.map((snack) => <li key={snack.name}>{snack.name} - qty: {snack.qty}</li>)}</p >
                        {(this.props.order.discount) ? <p>Total: {this.props.order.total * 1.25} *0.8 = {this.props.order.total}</p > : <p>Total: {this.props.order.total}</p >}
                        {(this.props.order.rating) ? <><p>Rating: </p ><Rate disabled value = {this.props.order.rating} /></> : <></>}
                        {(this.props.order.comment) ? <><p>Comment: </p ><>{this.props.order.rating} </></> : <></>}
                    </Modal.Body>
                </Modal>

                <Modal show = {this.state.editModalVisible} onHide={()=> this.handleEditClose()}>

                    {this.renderEditModalContent()}

                </Modal>
                {this.props.order.discount ? 
                    <Badge.Ribbon text = "order has been discount">
                        <Card style = {{margin: "10px"}}
                            actions = {this.renderActions()}>
                            <Meta title = {this.props.order.vendor.name + ' - ' + this.props.order.status} />
                            {(this.props.order.status === "fulfilled") ? "Order is fulfilled"
                                :(this.props.order.status === "completed") ? "Order is completed"
                                    :<CountUp updatedAt={this.props.order.updatedAt} />}
                        </Card>
                </Badge.Ribbon> 
                :
                <Card style={{margin: "10px"}} 
                actions={this.renderActions()}>
                    <Meta  title={this.props.order.vendor._id + " - " + this.props.order.status}/>
                    {(this.props.order.status === "fulfilled") ? "Order is fulfilled"
                        : (this.props.order.status === "completed") ? "Order is completed"
                            : (this.props.order.status === "cancelled") ? "Order is cancelled"
                                :<CountUp updatedAt={this.props.order.updatedAt} />}

                </Card>}
            </>
        )
    }
}