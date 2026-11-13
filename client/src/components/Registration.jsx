import { Formik, Form, Field, ErrorMessage } from 'formik';
import {Button, Col, Container, FormGroup,Label,Row, Alert} from 'reactstrap';
 
import { RegistrationValidation } from '../validations/RegistrationValidation';
import regImg from '../assets/register.jpg';
import { useSelector,useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register,resetStatus } from '../features/UserSlice';
 
const Registration = () => {
    const {isLoading,isError,message}=useSelector((state)=>state.user);
    const dispatch=useDispatch();
    const navigate=useNavigate();

    const handleRegister=async(values,{resetForm})=>{
        dispatch(resetStatus());
        const result=await dispatch(register(values));
        if(register.fulfilled.match(result)){
            resetForm();
            navigate("/",{replace:true});
        }
    }
 
    return (
        <div className='registration-page'>
 
            <Container>
 
                <Row className='justify-content-center align-items-center min-vh-100'>
 
                    <Col xs='12' sm='10' md='6' lg='4'>
 
                        <div className='registration-box'>
 
                            <h2 className='text-center mb-2'>
                                Registration:
                            </h2>
 
                            <Formik
                                initialValues={{ uname:'',email:'',password:'',profile:'',cpassword:''}}
                                validationSchema={RegistrationValidation}
                                onSubmit={handleRegister}
                            >
 
                                <Form>
                                {isError && (<Alert color="danger">{message}</Alert>)}
                                    <FormGroup>
                                        <Label for="uname"> Name</Label>
                                        <Field name="uname" type="text" placeholder="Enter your name" className="form-control" />
                                        <ErrorMessage name="uname" component="p" style={{ color: 'red' }}/>
 
                                    </FormGroup>
 
                                    <FormGroup>
                                        <Label for="email">Email </Label>
                                        <Field name="email" type="email" placeholder="Enter your email" className="form-control"/>
                                        <ErrorMessage name="email" component="p" style={{ color: 'red' }}/>
                                    </FormGroup>
 
                                    <FormGroup>
                                        <Label for="password"> Password</Label>
                                        <Field  name="password" type="password" placeholder="Enter your password"  className="form-control"/>
                                        <ErrorMessage name="password" component="p" style={{ color: 'red' }}/>
 
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="cpassword">Confirm Password</Label>
                                        <Field name="cpassword" type="password" placeholder="Confirm your password" className="form-control"/>
                                        <ErrorMessage name="cpassword" component="p" style={{ color: 'red' }} />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="profile">Profile Picture URL</Label>
                                        <Field name="profile" type="text" placeholder="Profile Picture URL" className="form-control"/>
                                    </FormGroup>
 
                                    <Button color='warning' type='submit' className='w-100'> REGISTER</Button>
 
                                </Form>
                            </Formik>
                        </div>
                    </Col>
 
                    <Col xs='12' md='6' lg='5'>
                       <img src={regImg} alt="Registration" className="img-fluid"/>
                    </Col>
 
                </Row>
 
            </Container>
 
        </div>
    );
};
 
export default Registration;
 