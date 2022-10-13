import React from 'react'
import { useState } from 'react';
import axios from 'axios';

const EditPassword = () => {

    const [data, setdata] = useState({
        old: "",
        new: ""
    });
    const user = JSON.parse(sessionStorage.getItem('user'))

    const submitHandler = (e) => {
        e.preventDefault()

        if (data.new == "" || data.old == "") {
            alert("please entre both fields")
        } else {
            axios.post('/changePassword', { data, user })
                .then((response) => {
                    if (response.data.status == 401) {
                        alert("Invalid Old Password")
                    } else if (response.data.status == 200) {
                        alert("Updated Successfully")
                        document.getElementById('form').reset()
                        setdata({
                            old: "",
                            new: ""
                        })
                    }
                }).catch(err => alert("Unknown Error"))
        }
    }

    return (
        <div style={{ textAlign: 'center', width: '100%', height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <form id='form'>
                <div class="form-group mb-5">
                    <label for="exampleInputEmail1">Entre Old Password</label>
                    <input onChange={(e) => setdata(ps => { return { ...ps, old: e.target.value } })} type="text" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Old Password" />
                </div>
                <div class="form-group mb-5">
                    <label for="exampleInputPassword1">Entre Updated Password</label>
                    <input onChange={(e) => setdata(ps => { return { ...ps, new: e.target.value } })} type="text" class="form-control" id="exampleInputPassword1" placeholder="New Password" />
                </div>
                <button type="submit" class="btn btn-primary" onClick={submitHandler}>Submit</button>
            </form>
        </div>
    )
}

export default EditPassword