import {Col, Container,  Row} from 'reactstrap';
import { useEffect } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import User from './User';
import SharePost from './SharePost';
import Posts from './Posts';
import ActiveUsers from './ActiveUsers';
import Footer from './Footer';

const Home=()=>{
    const email=useSelector((state)=>state.user.user.email);
    const navigate=useNavigate();

    useEffect(()=>{
        if(!email)
            navigate("/");
    },[email,navigate])

    return(
        <>
            <div className='app-shell'>
                <Header/>
                <Container fluid className='dashboard-body home-container'>
                    <Row className='g-4'>
                        <Col className='sidebar-left' lg='3' md='4'>
                            <User/>
                        </Col>
                        <Col lg='6' md='8'>
                            <div className='feed-section'>
                                <SharePost/>
                                <Posts/>
                            </div>
                        </Col>
                        <Col lg='3' className='sidebar-right d-none d-lg-block'>
                            <ActiveUsers/>
                        </Col>
                    </Row>
                </Container>
                <Footer/>
            </div>
        </>
    )
}
export default Home;