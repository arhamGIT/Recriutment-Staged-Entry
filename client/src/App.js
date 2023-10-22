import react from 'react'
import logo from './Components/assets/logo.png'
import { useState, useEffect } from "react";
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './Components/Login';
import Main from './Components/Main';
import Home from './Components/Home';
import CreateUser from './Components/CreateUser'
import CreateClient from './Components/CreateClient'
import CreateJobs from './Components/CreateJob'
import JobAssign from './Components/AssignJob'
import SendRequest from './Components/SendRequest'
import RecieveAcceptence from './Components/RecieveAcceptance'
import ScheduleCall from './Components/ScheduleCall'
import SendCDA from './Components/SendCDA'
import RecieveCDA from './Components/RecieveCDA'
import RecieveCV from './Components/RecieveCV'
import ShortListCV from './Components/ShortListCV'
import SubmitCV from './Components/SubmitCV'
import AcceptanceByClient from './Components/AcceptanceByClient'
import JobOffered from './Components/JobOffered'
import JobAccepted from './Components/JobAccepted'
import JobClose from './Components/JobClose'
import UsersList from './Components/Allusers'
import ClientList from './Components/AllClients'
import JobList from './Components/AllJobs'
import JobStatus from './Components/AllJobStatus'
import AttendenceSheet from './Components/AttendanceList'
import LoggedIn from './Components/CurrentlyWorking'
import SearchCV from './Components/SearchCV';
import UserLog from './Components/UserLog';
import JobLog from './Components/JobLog';
import 'bootstrap/dist/css/bootstrap.min.css';

import axios from 'axios'
import EditPassword from './Components/EditPassword';



function App() {

  useEffect(() => {
    const handleTabClose = event => {
      event.preventDefault();

      if (sessionStorage.getItem('user') == null) {

      } else {
        const lin = sessionStorage.getItem("lintime")
        const user = JSON.parse(sessionStorage.getItem("user"))
        const lout = Date.parse(new Date().toString())

        axios.post('/saveattendence', { lin: lin, lout: lout, user: user })
          .then((response) => {
            if (response.data.status == 200) {
              sessionStorage.removeItem("user")
              sessionStorage.removeItem("lintime")
            }
          }, (err) => {
            console.log(err)
          })
      }

      return (event.returnValue = 'Are you sure you want to exit?');
    };

    window.addEventListener('beforeunload', handleTabClose);

    return () => {
      // window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);


  // const logout = (e) => {
  //   e.preventDefault()

  //   if (sessionStorage.getItem('user') == null) {

  //   } else {
  //     const lin = sessionStorage.getItem("lintime")
  //     const user = JSON.parse(sessionStorage.getItem("user"))
  //     const lout = Date.parse(new Date().toString())

  //     axios.post('http://localhost:4000/saveattendence', { lin: lin, lout: lout, user: user })
  //       .then((response) => {
  //         if (response.data.status == 200) {
  //           sessionStorage.removeItem("user")
  //           sessionStorage.removeItem("lintime")
  //         }
  //       }, (err) => {
  //         console.log(err)
  //       })
  //   }

  // }

  // window.addEventListener("beforeunload", (e) => { logout(e) });

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='main' element={<Main />}>
          {/* <Redirect from="/" to="home" /> */}
          <Route index element={<Home />} />
          <Route path='createuser' element={<CreateUser />} />
          <Route path='createclient' element={<CreateClient />} />
          <Route path='createjobs' element={<CreateJobs />} />
          <Route path='assignjob' element={<JobAssign />} />
          <Route path='sendrequest' element={<SendRequest />} />
          <Route path='recieveacceptance' element={<RecieveAcceptence />} />
          <Route path='schedulecall' element={<ScheduleCall />} />
          <Route path='sendcda' element={<SendCDA />} />
          <Route path='recievecda' element={<RecieveCDA />} />
          <Route path='recievecv' element={<RecieveCV />} />
          <Route path='shortlistcv' element={<ShortListCV />} />
          <Route path='submitcv' element={<SubmitCV />} />
          <Route path='acceptancebyclient' element={<AcceptanceByClient />} />
          <Route path='joboffered' element={<JobOffered />} />
          <Route path='jobaccepted' element={<JobAccepted />} />
          <Route path='jobclose' element={<JobClose />} />
          <Route path='userlist' element={<UsersList />} />
          <Route path='clientlist' element={<ClientList />} />
          <Route path='activejoblist' element={<JobList />} />
          <Route path='jobstatuslist' element={<JobStatus />} />
          <Route path='attendencelist' element={<AttendenceSheet />} />
          <Route path='loggedinusers' element={<LoggedIn />} />
          <Route path='searchcv' element={<SearchCV />} />
          <Route path='userlog' element={<UserLog />} />
          <Route path='joblog' element={<JobLog />} />
          <Route path='editpass' element={<EditPassword />} />
        </Route>
      </Routes>
      <div className="btinfo">
        <h6>Powered By:</h6>
        <img src={logo} alt="ACDL Limited" />
      </div>
    </BrowserRouter>



  );
}

export default App;
