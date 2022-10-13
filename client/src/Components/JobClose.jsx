import React, { useEffect, useState } from "react";
import axios from 'axios'
import Multiselect from 'multiselect-react-dropdown';



const JobClose = () => {



  const [tdata, settdata] = useState([]);
  const [requests, setrequests] = useState();
  const [alljobs, setalljobs] = useState([]);
  const jobref = React.createRef()
  const [fl, setfl] = useState(false);


  const [data, setdata] = useState({
    job: []
  });

  const user = JSON.parse(sessionStorage.getItem('user'))

  const fetchtdata = () => {
    axios.post('/getallclosedjobs', { user: user })
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
    axios.post('/getjobforshortlistcv')
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          setalljobs(response.data.data)
          setfl(false)
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
    if (data.job.length == 0) {
      alert("Select Job")
    } else {
      // console.log(data.job[0])
      if (window.confirm("Are you sure that You Want to close this Job") == true) {
        // console.log(data.job[0])
        setvalues(true)


        axios.post('/closejob', { job: data.job[0], user: user })
          .then((reponse) => {
            if (reponse.data.status == 200) {
              alert('Success')
              jobref.current.resetSelectedValues()
              // showmsg(msgs.smsg)
              document.getElementById('form').reset()
              setalljobs([])
              fetchassignments()
              fetchtdata()
            } else if (reponse.data.status == 303) {
              // alert('Request Already exist')
            } else {
              alert('Failed due to unknown reasons')
            }
            setvalues(false)
          })
      } else {

      }
    }
  }

  const clearclick = () => {
    document.getElementById('form').reset()
    jobref.current.resetSelectedValues()
  }


  const handlesearch = (e) => {
    const searchTerm = e.target.value;
    // console.log(searchTerm)
    const result = tdata.filter((item) => item.Title.includes(searchTerm))
    if (searchTerm.length > 0) {
      settdata(result)
    } else {
      fetchtdata();
    }
  }

  const jobselect = (item) => {
    setdata(ps => { return { ...ps, job: item } })
  }
  const jobremove = (item) => {
    setdata(ps => { return { ...ps, job: item } })
  }

  useEffect(() => {
    fetchtdata()
    fetchassignments()
  }, [])

  return (
    <div className="mx-auto my-5 container-fluid" >
      <form className="row g-3" onSubmit={submitform} id="form">
        <div className="col-md-4">
          <label htmlFor="validationDefault01" className="form-label">Job</label>
          <Multiselect loading={fl} ref={jobref} options={alljobs} displayValue="Title" id="validationDefault01" selectionLimit={1} onSelect={jobselect} onRemove={jobremove} />
        </div>
        <div className="col-12">
          <button className="btn btn-success" id="savebtn" type="submit">Close Job</button>
          <span id="spinner" style={{display:'none'}}><span className="spinner-border spinner-border-sm text-success mx-3" role="status" aria-hidden="true"></span><span className="text-success">Closing...</span></span>
        </div>
      </form>
      <div className="col-12 mt-3">
        <button className="btn btn-secondary" id="newbtn" onClick={clearclick}>Clear</button>
      </div>
      <div className="mt-5">
        <p className="h3 w-100 text-center">All Closed Jobs</p>
        <div className="cor-3">
          <input type="text" className="form-control w-25 mx-auto text-center" placeholder="Search Candidate Name" onChange={e => handlesearch(e)} />
        </div>
        {/* <p className="w-100 text-center">Click to update Record</p> */}
        <div className="table-responsive my-5 rounded-3" style={{ height: '300px', overflow: 'auto' }}>
          <table className="table table-secondary table-hover">
            <thead className="" style={{ position: 'sticky', top: 0 }}>
              <tr>
                <th>Sr</th>
                <th>Job Title</th>
                <th>Person</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              {tdata.map((item, index) => (
                <tr key={index}>
                  <td>{index+1}</td>
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

export default JobClose