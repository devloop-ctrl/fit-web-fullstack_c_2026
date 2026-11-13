import {Alert, Button, Col, Container, FormGroup, Input, Label, Row, Spinner} from 'reactstrap';
import {Formik,Form,Field,ErrorMessage} from 'formik';
import { LoginValidation } from '../validations/LoginValidation';
import { login,resetStatus } from '../features/UserSlice';
import { useSelector,useDispatch } from 'react-redux';
import Home from './Home';
import { useNavigate, Link } from 'react-router-dom';

const Login =()=>{
    
    const {isLoading,isError,message}=useSelector((state)=>state.user);
    const dispatch=useDispatch();
    const navigate=useNavigate();

    const handleLogin=async(values,{resetForm})=>{
        dispatch(resetStatus());
        const result=await dispatch(login(values));
        if(login.fulfilled.match(result)){
            resetForm();
            navigate("/home",{replace:true});
        }
    }

    return(
        <div className='login-page'>
            <Container>
                <Row className='justify-content-center align-items-center min-vh-100'>
                    <Col xs="12" sm="10" md="6" lg="4">
                        <div className='login-box'>
                            <h2 className='text-center mb-2'>POST IT</h2>
                            <Formik
                                initialValues={{email:'',password:''}}
                                validationSchema={LoginValidation}
                                onSubmit={handleLogin}
                            >
                                {({isSubmitting})=>(
                                   <Form>
                                    {isError && (<Alert color="danger">{message}</Alert>)}
                                    <FormGroup>
                                        <Label for="email">Email Address</Label>
                                        <Field name="email" type="email" placeholder="Enter your email" className='form-control'/>
                                        <ErrorMessage name="email" component="p" style={{color:'red'}}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="password">Password</Label>
                                        <Field name="password" type="password" placeholder="Enter password" className='form-control'/>
                                        <ErrorMessage name="password" component="p" style={{color:'red'}}/>
                                    </FormGroup>
                                    <div className='d-flex justify-content-between align-items-center mb-4'>
                                        <FormGroup check className='mb-0'>
                                            <Input type="checkbox" className='form-control'/>
                                            <Label for="remeberme">Remember me</Label>
                                        </FormGroup>
                                        <a href="#" className='text-decoration-none' style={{ marginTop: "-10px" }}>Forgot Password</a>
                                    </div>
                                    <Button color="primary" type="submit" className='w-100' disabled={isLoading}>
                                        {isLoading?(<>
                                        <Spinner size="sm" className='me-2'>Authenticating...</Spinner>
                                        </>):("SIGN IN")}
                                    </Button>
                                </Form> 
                                )}
                                
                            </Formik>
                            <div className='text-center mt-4'>
                                <span className='text-muted'>Dont't have an account?</span>{" "}
                                <a href="/register" className='text-decoration-none fw-bold'>
                                   
                                        Sign Up
                                   
                                </a>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
export default Login;