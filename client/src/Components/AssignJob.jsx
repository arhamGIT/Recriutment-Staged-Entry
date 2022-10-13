import React, { useEffect, useState } from "react";
// import "./styles.css";
// import { Country, State, City } from 'country-state-city';
// import SelectSearch from 'react-select-search';
// import "react-select-search/style.css";
import axios from 'axios'
import Multiselect from 'multiselect-react-dropdown';





const AssignJob = () => {



  const [tdata, settdata] = useState([]);
  const [updel, setupdel] = useState();
  const [allusers, setallusers] = useState([]);
  const [alljobs, setalljobs] = useState([]);
  const jobref = React.createRef()
  const candidateref = React.createRef()


  const [data, setdata] = useState({
    Job: [],
    users: []
  });

  const user = JSON.parse(sessionStorage.getItem('user'))

  const fetchtdata = () => {
    axios.post('/getassignments', { user: user })
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          settdata(response.data.data)
        }
      }, (error) => {

      })
  }

  const fetchusers = () => {
    axios.post('/getusers')
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          setallusers(response.data.data)
        }
      }, (error) => {

      })
  }

  const fetchjobs = () => {
    axios.post('/getjobforshortlistcv', { user: user })
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          setalljobs(response.data.data)
        }
      }, (error) => {

      })
  }

  const setvalues = (v) => {
    document.getElementById('savebtn').disabled = v
    document.getElementById('updatebtn').disabled = v
    if(v){
      document.getElementById('spinner').style.display = 'block'
    }else{
      document.getElementById('spinner').style.display = 'none'
    }
  }

  const submitform = (e) => {
    setvalues(true)
    e.preventDefault()
    // console.log(data)
    if(data.Job.length == 0 || data.users.length == 0){
       alert("Please Select Job And Users")
       setvalues(false)
    }else{

      axios.post('/saveassignments', { job: data.Job[0], allusers: data.users, user: user })
      .then((reponse) => {
        if (reponse.data.status == 200) {
          alert('success')
          // showmsg(msgs.smsg)
          jobref.current.resetSelectedValues()
          candidateref.current.resetSelectedValues()
          document.getElementById('form').reset()
          fetchtdata()
        } else if (reponse.data.status == 303) {
          alert('Exists')
        } else {
          alert('Failed due to unknown reasons')
        }
        setvalues(false)
      })

    }
    
  }

  const clearclick = () => {
    document.getElementById('form').reset()
    jobref.current.resetSelectedValues()
    candidateref.current.resetSelectedValues()
  }

  const rowclick = (item) => {
    setupdel(item)
    setdata(item)
    document.getElementById('job').style.display = 'none'
    document.getElementById('user').style.display = 'none'
    document.getElementById('updatebtn').style.display = 'inline-block'
    document.getElementById('savebtn').style.display = 'none'
    document.getElementById('newbtn').style.display = 'none'
    document.getElementById('cancelbtn').style.display = 'inline-block'

    document.documentElement.scrollTop = 0;
  }

  const cancelclick = () => {
    document.getElementById('form').reset()
    document.getElementById('job').style.display = 'inline-block'
    document.getElementById('user').style.display = 'inline-block'
    document.getElementById('updatebtn').style.display = 'none'
    document.getElementById('savebtn').style.display = 'block'
    document.getElementById('newbtn').style.display = 'block'
    document.getElementById('cancelbtn').style.display = 'none'
  }

  const updaterecord = () => {
    axios.post('/deleteassignment', { updel: updel, formdata: data })
      .then((response) => {
        if (response.data.status == 200) {
          document.getElementById('form').reset()
          fetchtdata()
          cancelclick()
        } else {
          alert("error")
        }
      }, (err) => {
        alert("lower error")
      })
  }

  useEffect(() => {
    fetchtdata()
    fetchjobs()
    fetchusers()
  }, [])

  const jobselect = (item) => {
    setdata(ps => { return { ...ps, Job: item } })
  }
  const jobremove = (item) => {
    setdata(ps => { return { ...ps, job: item } })
  }
  const userselect = (item) => {
    setdata(ps => { return { ...ps, users: item } })
  }
  const userremove = (item) => {
    setdata(ps => { return { ...ps, users: item } })
  }

  return (
    <div className="mx-auto my-5 container-fluid">
      <form className="row g-3" onSubmit={submitform} id="form">
        <div className="col-md-4" id="job">
          <label htmlFor="validationDefault01" className="form-label">Job</label>
          <Multiselect ref={jobref} options={alljobs} displayValue="Title" id="validationDefault01" selectionLimit={1} onSelect={jobselect} onRemove={jobremove} />
        </div>
        <div className="col-md-4" id="user">
          <label htmlFor="validationDefaultUsername" className="form-label">Users</label>
          <Multiselect ref={candidateref} options={allusers} displayValue="UserName" id="validationDefault02" onSelect={userselect} onRemove={userremove} />
        </div>
        <div className="col-12">
          <button className="btn btn-success" id="savebtn" type="submit">Assign Job</button>
          <span id="spinner" style={{display:'none'}}><span className="spinner-border spinner-border-sm text-success mx-3" role="status" aria-hidden="true"></span><span className="text-success">Saving...</span></span>
        </div>
      </form>
      <div className="col-12 mt-3">
        <button className="btn btn-secondary" id="newbtn" onClick={clearclick}>Clear</button>
        <button className="btn btn-outline-danger ms-3" id="updatebtn" style={{ display: 'none' }} onClick={updaterecord}>Delete</button>
        <button className="btn btn-outline-secondary ms-3" id="cancelbtn" style={{ display: 'none' }} onClick={cancelclick}>Cancel</button>
      </div>
      <div className="mt-5">
        <p className="h3 w-100 text-center">Assignments</p>
        {/* <p className="w-100 text-center">Click to update Record</p> */}
        <div className="table-responsive my-5 rounded-3" style={{ height: '300px', overflow: 'auto', scrollbarWidth: 'none' }}>
          <table className="table table-secondary table-hover" >
            <thead className="" style={{ position: 'sticky', top: 0 }}>
              <tr>
                <th>Sr</th>
                <th>UserName</th>
                <th>Title</th>
                <th>Person</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              {tdata.map((item, index) => (
                <tr key={index} onClick={() => { rowclick(item) }}>
                  <td>{index+1}</td>
                  <td>{item.UserName}</td>
                  <td>{item.Title}</td>
                  <td>{item.Person}</td>
                  <td>{item.Company}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>

  )
}

export default AssignJob
