import React, { useEffect, useState } from "react";
import axios from 'axios'
import Multiselect from 'multiselect-react-dropdown';



const ScheduleCall = () => {



  const [tdata, settdata] = useState([]);
  const [requests, setrequests] = useState();
  const [alljobs, setalljobs] = useState([]);
  const [allusers, setallusers] = useState([]);
  const jobref = React.createRef()
  const candidateref = React.createRef()

  const [fl, setfl] = useState(false);
  const [sl, setsl] = useState(false);
  const [btnloading, setbtnloading] = useState(false);

  const [data, setdata] = useState({
    request: [],
    mailusers: [],
    ScheduleDateAndTime: ''
  });

  const user = JSON.parse(sessionStorage.getItem('user'))

  const fetchtdata = () => {
    axios.post('/getschedulcalls', { user: user })
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          settdata(response.data.data)
        }
      }, (error) => {

      })
  }

  const fetchassignments = () => {
    setfl(true)
    axios.post('/getuserassignments', { user: user })
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          setalljobs(response.data.data)
          setfl(false)
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

  const setvalues = (v) => {
    document.getElementById('savebtn').disabled = v
    if(v){
      document.getElementById('spinner').style.display = 'inline-block'
    }else{
      document.getElementById('spinner').style.display = 'none'
    }
  }

  const submitform = (e) => {


    e.preventDefault()
    if (data.request.length == 0) {
      alert("Select Accepatance and Users")
    } else {
      setvalues(true)


      axios.post('/saveschedulecall', { data: data, user: user })
        .then((reponse) => {
          if (reponse.data.status == 200) {
            alert('Success')
            jobref.current.resetSelectedValues()
            candidateref.current.resetSelectedValues()
            document.getElementById('form').reset()
            setrequests([])
            fetchtdata()
          } else if (reponse.data.status == 303) {
            alert('Already Scheduled By '+reponse.data.name)
            document.getElementById('savebtn').disabled = false
          } else {
            alert('Failed due to unknown reasons')
            setbtnloading(false)
            document.getElementById('savebtn').disabled = false
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


  const fetchspecificrequests = (job) => {
    setsl(true)
    axios.post('/getjobspecificacceptances', { job: job, user: user })
      .then((response) => {
        if (response.data.status == 200) {
          setrequests(response.data.data)
          setsl(false)
        }
      }, (error) => {

      })
  }


  const handlesearch = (e) => {
    const searchTerm = e.target.value;
    // console.log(searchTerm)
    const result = tdata.filter((item) => item.CandidateName.includes(searchTerm))
    if (searchTerm.length > 0) {
      settdata(result)
    } else {
      fetchtdata();
    }
  }

  const jobselect = (item) => {
    // setdata(ps => { return { ...ps, job:item[0] } })
    fetchspecificrequests(item[0])
  }
  const jobremove = (item) => {
    // setdata(ps => { return { ...ps, job: item[0] } })
  }
  const requestselect = (item) => {
    setdata(ps => { return { ...ps, request: item } })
  }
  const requestremove = (item) => {
    setdata(ps => { return { ...ps, request: item } })
  }


  const rowclick = (item) => {
    setdata(item)
    document.getElementById('first').style.display = 'none'
    document.getElementById('second').style.display = 'none'
    document.getElementById('validationDefault03').value = item.ScheduleDateAndTime
    document.getElementById('savebtn').style.display = 'none'
    document.getElementById('newbtn').style.display = 'none'
    document.getElementById('updatebtn').style.display = 'inline'
    document.getElementById('cancelbtn').style.display = 'inline'
    document.documentElement.scrollTop = 0;
  }

  const cancelclick = (item) => {
    document.getElementById('first').style.display = 'block'
    document.getElementById('second').style.display = 'block'
    document.getElementById('form').reset()
    // document.getElementById('validationDefault03').value = item.ScheduleDateAndTime
    document.getElementById('savebtn').style.display = 'block'
    document.getElementById('newbtn').style.display = 'block'
    document.getElementById('updatebtn').style.display = 'none'
    document.getElementById('cancelbtn').style.display = 'none'
    setdata({
      request: [],
      mailusers: [],
      ScheduleDateAndTime: ''
    })
  }

  const updateclick = () => {
    setvalues(true)
    axios.post('/updateschedulecall', { formdata: data })
      .then((response) => {
        if (response.data.status == 200) {
          alert("Updated Successfully")
          document.getElementById('form').reset()
          fetchtdata()
          cancelclick()
          setdata({
            request: [],
            mailusers: [],
            ScheduleDateAndTime: ''
          })
        } else {
          alert("error")
        }
        setvalues(false)
      }, (err) => {
        alert("lower error")
        setvalues(false)
      })
  }



  useEffect(() => {
    fetchtdata()
    fetchassignments()
    fetchusers()
  }, [])

  return (
    <div className="mx-auto my-5 container-fluid" >
      <form className="row g-3" id="form">
        <div className="col-md-4" id="first">
          <label htmlFor="validationDefault01" className="form-label">Job</label>
          <Multiselect loading={fl} ref={jobref} options={alljobs} displayValue="Title" id="validationDefault01" selectionLimit={1} onSelect={jobselect} onRemove={jobremove} />
        </div>
        <div className="col-md-4" id="second">
          <label htmlFor="validationDefaultUsername" className="form-label">Select Candidate</label>
          <Multiselect loading={sl} ref={candidateref} options={requests} displayValue="CandidateName" id="validationDefault02" selectionLimit={1} onSelect={requestselect} onRemove={requestremove} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Schedule Call</label>
          <input type='datetime-local' className="form-control" id="validationDefault03" required onChange={e => { setdata(ps => { return { ...ps, ScheduleDateAndTime: e.target.value } }) }} />
        </div>
        {/* <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Select Users to Mail</label>
          <Multiselect options={allusers} displayValue="UserName" id="validationDefault04" onSelect={usersselect} onRemove={usersremove} />
        </div> */}
        <div className="col-12">
          <button className="btn btn-success" id="savebtn" type="button" onClick={(e) => { submitform(e) }}>{<span>Schedule Call</span>}</button>
          <span id="spinner" style={{display:'none'}}><span className="spinner-border spinner-border-sm text-success mx-3" role="status" aria-hidden="true"></span><span className="text-success">Saving...</span></span>
        </div>
      </form>
      <div className="col-12 mt-3">
        <button className="btn btn-secondary" id="newbtn" onClick={clearclick}>Clear</button>
        <button className="btn btn-primary mx-2" id="updatebtn" style={{ display: 'none' }} onClick={updateclick}>Update</button>
        <button className="btn btn-secondary" id="cancelbtn" style={{ display: 'none' }} onClick={cancelclick}>Cancel</button>
      </div>
      <div className="mt-5">
        <p className="h3 w-100 text-center">Calls Scheduled</p>
        <p className="w-100 text-center">Click any Row to Re-Schedule</p>
        <div className="cor-3">
          <input type="text" className="form-control w-25 mx-auto text-center" placeholder="Search Candidate Name" onChange={e => handlesearch(e)} />
        </div>
        {/* <p className="w-100 text-center">Click to update Record</p> */}
        <div className="table-responsive my-5 rounded-3" style={{ height: '300px', overflow: 'auto' }}>
          <table className="table table-secondary table-hover">
            <thead className="" style={{ position: 'sticky', top: 0 }}>
              <tr>
                <th>Sr</th>
                <th>Candidate Name</th>
                <th>Scheduled TimeAndDate</th>
                <th>Job Title</th>
                <th>Person</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              {tdata.map((item, index) => (
                <tr key={index} onClick={() => { rowclick(item) }}>
                  <td>{index+1}</td>
                  <td>{item.CandidateName}</td>
                  <td>{item.ScheduleDateAndTime}</td>
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

export default ScheduleCall


