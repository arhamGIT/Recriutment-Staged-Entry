import React from 'react'
import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from './assets/logo.png'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Nav = ({disconnectSocket}) => {

    const navigate = useNavigate()

    const user = JSON.parse(sessionStorage.getItem('user'))


    useEffect(() => {

        if (user.UserType == 'master') {

            document.getElementById('admin').style.display = "block"
            document.getElementById('createuser').style.display = "block"
            document.getElementById('userentries').style.display = "block"
            document.getElementById('reports').style.display = "block"
        }

        if (user.UserType == 'admin') {
            document.getElementById('admin').style.display = "block"
            // document.getElementById('createuser').style.display = "block"
            document.getElementById('userentries').style.display = "block"
            document.getElementById('reports').style.display = "block"
        }

        if (user.UserType == 'general') {
        }

    })


    const logout = () => {

        if (sessionStorage.getItem('user') == null) {
            navigate('/')
        } else {
            const lin = sessionStorage.getItem("lintime")
            const user = JSON.parse(sessionStorage.getItem("user"))
            const lout = Date.parse(new Date().toString())


            axios.post('/saveattendence', { lin: lin, lout: lout, user: user })
                .then((response) => {
                    if (response.data.status == 200) {
                        sessionStorage.removeItem("user")
                        sessionStorage.removeItem("lintime")
                        sessionStorage.removeItem("token")
                        disconnectSocket()
                        navigate('/')
                    }
                }, (err) => {
                    console.log(err)
                })

            sessionStorage.removeItem("user")
            navigate('/')
        }


    }

    const nameclick = () => {
        navigate('/main/editpass')
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/main">
                    <img src={logo} alt="" />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item dropdown" id='admin' style={{ display: 'none' }}>
                            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Admin Entries
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li><Link className="dropdown-item" to='createuser' id='createuser' style={{ display: 'none' }}>Create User</Link></li>
                                <li><Link className="dropdown-item" to='createclient'>Create Client</Link></li>
                                <li><Link className="dropdown-item" to='createjobs'>Create Job</Link></li>
                                <li><Link className="dropdown-item" to='assignjob'>Assign Job</Link></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                User Entries
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li><Link className="dropdown-item" to='sendrequest'>Send Request</Link></li>
                                <li><Link className="dropdown-item" to='recieveacceptance'>Recieve Acceptance</Link></li>
                                <li><Link className="dropdown-item" to='schedulecall'>Schedule Call</Link></li>
                                <li><Link className="dropdown-item" to='sendcda'>Send CDA</Link></li>
                                <li><Link className="dropdown-item" to='recievecda'>Recieve CDA</Link></li>
                                <li><Link className="dropdown-item" to='recievecv'>Recieve CV</Link></li>
                                <div id='userentries' style={{ display: 'none' }}>
                                    <li><Link className="dropdown-item" to='shortlistcv'>ShortList CV</Link></li>
                                    <li><Link className="dropdown-item" to='submitcv'>Submit CV</Link></li>
                                    <li><Link className="dropdown-item" to='acceptancebyclient'>Accepted By Client</Link></li>
                                    <li><Link className="dropdown-item" to='joboffered'>Job Offered</Link></li>
                                    <li><Link className="dropdown-item" to='jobaccepted'>Job Accepted</Link></li>
                                    <li><Link className="dropdown-item" to='jobclose'>Job Close</Link></li>
                                </div>
                            </ul>
                        </li>
                        <li className="nav-item dropdown" id='reports' style={{ display: 'none' }}>
                            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Reports
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li><Link className="dropdown-item" to='userlist'>Users</Link></li>
                                <li><Link className="dropdown-item" to='clientlist'>Clients</Link></li>
                                <li><Link className="dropdown-item" to='activejoblist'>Jobs</Link></li>
                                <li><Link className="dropdown-item" to='jobstatuslist'>Job Status</Link></li>
                                <li><Link className="dropdown-item" to='attendencelist'>Attendance List</Link></li>
                                <li><Link className="dropdown-item" to='loggedinusers'>Currently Working</Link></li>
                                <li><Link className="dropdown-item" to='searchcv'>Search CV's</Link></li>
                                <li><Link className="dropdown-item" to='userlog'>User Log</Link></li>
                                <li><Link className="dropdown-item" to='joblog'>Job Log</Link></li>
                            </ul>
                        </li>
                    </ul>
                    <div className="d-flex">
                        <button className="btn btn-outline-success me-2" type="submit" onClick={nameclick}>{user.UserName}</button>
                        <button className="btn btn-outline-danger" onClick={logout}>LogOut</button>
                    </div>
                </div>
            </div>
        </nav>)
}

export default Nav