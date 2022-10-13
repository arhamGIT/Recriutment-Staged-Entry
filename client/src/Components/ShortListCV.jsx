import React, { useEffect, useState } from "react";
import axios from 'axios'
import Multiselect from 'multiselect-react-dropdown';



const ShortListCV = () => {



  const [tdata, settdata] = useState([]);
  const [requests, setrequests] = useState();
  const [alljobs, setalljobs] = useState([]);
  const jobref = React.createRef()
  const candidateref = React.createRef()
  const [fl, setfl] = useState(false);
  const [sl, setsl] = useState(false);
  // const [tablefileter, settablefileter] = useState({

  // });


  const [data, setdata] = useState({
    request: []
  });

  const user = JSON.parse(sessionStorage.getItem('user'))

  const fetchtdata = () => {
    axios.post('/getshortlistcv', { user: user })
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
    if (data.request.length == 0) {
      alert("Select candidate")
    } else {
      // console.log(data)
      setvalues(true)

      axios.post('/saveshortlistcv', { data: data, user: user })
        .then((reponse) => {
          if (reponse.data.status == 200) {
            alert('Success')
            // showmsg(msgs.smsg)
            document.getElementById('form').reset()
            jobref.current.resetSelectedValues()
            candidateref.current.resetSelectedValues()
            setrequests([])
            fetchtdata()
          } else if (reponse.data.status == 303) {
            // alert('Request Already exist')
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


  const fetchspecificrequests = (job) => {
    setsl(true)
    axios.post('/getjobspecificrecievecv', { job: job, user: user })
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
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Select Candidate</label>
          <Multiselect loading={sl} ref={candidateref} options={requests} displayValue="CandidateName" id="validationDefault02" onSelect={requestselect} onRemove={requestremove} />
        </div>
        <div className="col-12">
          <button className="btn btn-success" id="savebtn" type="submit">ShortList CV</button>
          <span id="spinner" style={{display:'none'}}><span className="spinner-border spinner-border-sm text-success mx-3" role="status" aria-hidden="true"></span><span className="text-success">Saving...</span></span>
        </div>
      </form>
      <div className="col-12 mt-3">
        <button className="btn btn-secondary" id="newbtn" onClick={clearclick}>Clear</button>
      </div>
      <div className="mt-5">
        <p className="h3 w-100 text-center">CV's ShortListed</p>
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
                <th>Job Title</th>
                <th>Person</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              {tdata.map((item, index) => (
                <tr key={index}>
                  <td>{index+1}</td>
                  <td>{item.CandidateName}</td>
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

export default ShortListCV