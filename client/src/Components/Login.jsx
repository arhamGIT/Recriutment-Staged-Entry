import React from 'react'
import './css/login.css'
import logo from './assets/logo.png'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


const Login = () => {


    const [formdata, setformdata] = useState({
        id: '',
        pass: ''
    });
    const [show, setshow] = useState(false);

    const navigate = useNavigate()

    
    
    const submitdata = (e) => {
        e.preventDefault()
        if (document.getElementById('id').value == '' || document.getElementById('pass').value == '') {
            alert('All Fields Are Required')
        }
        else {
            axios.post('/loginuser', { formdata: formdata })
                .then((response) => {
                    if (response.data.status === 200) {
                        sessionStorage.setItem("user", JSON.stringify(response.data.data))
                        sessionStorage.setItem("lintime", Date.parse(new Date().toString()))
                        sessionStorage.setItem("token",JSON.stringify(response.data.token))
                        navigate('/main')
                    } else if (response.data.status === 300) {
                        alert('Invalid Credential')
                    }else if(response.data.status == 303){
                        alert("Already Logged In, You have to logout first for id " + response.data.id)
                    }
                }, (err) => {
                    alert('Unknown Error')
                })
        }
    }


    const handlepassword = (e) => {
        e.preventDefault()
        setshow(!show)
    }

    return (
        <section className="h-100 gradient-form" style={{backgroundColor:'#eee'}}>
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-xl-10">
                        <div className="card rounded-3 text-black">
                            <div className="row g-0">
                                <div className="col-lg-6">
                                    <div className="card-body p-md-5 mx-md-4">

                                        <div className="text-center">
                                            <img src={logo}
                                                style={{width:'185px'}} alt="logo" />
                                                <h4 className="mt-1 mb-5 pb-1">We are The Recruiters</h4>
                                        </div>

                                        <form>
                                            <p>Please login to your account</p>

                                            <div className="form-outline mb-4">
                                                <input type="email" id="id" className="form-control"
                                                    onChange={e => { setformdata(ps => { return { ...ps, id: e.target.value } }) }} />
                                                <label className="form-label" >UserID</label>
                                            </div>

                                            <div className="form-outline mb-4">
                                                <input type={show ? 'text' : 'password'} id="pass" className="form-control" onChange={e => { setformdata(ps => { return { ...ps, pass: e.target.value } }) }} />
                                                <label className="form-label" >Password : </label>
                                                <button type='buttton' id='show' className='btn btn-outline-secondary mx-3' onClick={handlepassword} >{show ? 'Hide' : "Show"}</button>
                                            </div>

                                            <div className="text-center pt-1 mb-5 pb-1">
                                                <button className="btn btn-primary btn-block fa-lg gradient-custom-2 mb-3" type="button" onClick={submitdata}>Log
                                                    in</button>
                                            </div>

                                        </form>

                                    </div>
                                </div>
                                <div className="col-lg-6 d-flex align-items-center gradient-custom-2">
                                    <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                                        <h4 className="mb-4">We are more than just a company</h4>
                                        <p className="small mb-0">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                                            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Login