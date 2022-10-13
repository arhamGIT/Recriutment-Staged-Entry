import React, { useEffect, useState } from "react";
import axios from 'axios'
import Multiselect from 'multiselect-react-dropdown';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'
import download from 'js-file-download'




const RecieveCV = () => {



  const [tdata, settdata] = useState([]);
  const [requests, setrequests] = useState();
  const [alljobs, setalljobs] = useState([]);
  const jobref = React.createRef()
  const candidateref = React.createRef()
  const [fl, setfl] = useState(false);
  const [sl, setsl] = useState(false);
  const [sf, setsf] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [Name, setName] = useState("");

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }


  const [data, setdata] = useState({
    request: []
  });

  const [file, setfile] = useState();
  const [filename, setfilename] = useState("");


  const user = JSON.parse(sessionStorage.getItem('user'))

  const fetchtdata = () => {
    axios.post('/getrecievecv', { user: user })
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

  const handlefile = (e) => {
    setfile(e.target.files[0]);
    setfilename(e.target.files[0].name);
  }


  const setvalues = (v) => {
    document.getElementById('savebtn').disabled = v
    if (v) {
      document.getElementById('spinner').style.display = 'inline-block'
    } else {
      document.getElementById('spinner').style.display = 'none'
    }
  }


  const submitform = (e) => {
    e.preventDefault()
    if (data.request.length == 0) {
      alert("Select candidate")
    } else {
      setvalues(true)
      const formdata = new FormData()
      formdata.append("file", file)
      formdata.append("filename", filename)
      formdata.append("request", JSON.stringify(data.request[0]))
      formdata.append("user", JSON.stringify(user))

      axios.post('/saverecievecv', formdata)
        .then((reponse) => {
          if (reponse.data.status == 200) {
            alert('Success')
            jobref.current.resetSelectedValues()
            candidateref.current.resetSelectedValues()
            // showmsg(msgs.smsg)
            document.getElementById('form').reset()
            setrequests([])
            fetchtdata()
          } else if (reponse.data.status == 303) {
            alert('Candidate Already exist')
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
    axios.post('/getjobspecificrecievecda', { job: job, user: user })
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

  const downloadcv = (item) => {
    setName(item.CandidateName)
    const name = item.CVName.split("____")[1]
    // console.log(name);
    axios.post('/downloadcv', { path: item.CVName })
      .then((response) => {
        // console.log(response.data)
        // setsf(response.data.data)
        download(response.data,name)     
      })
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
          <Multiselect loading={sl} ref={candidateref} options={requests} displayValue="CandidateName" selectionLimit={1} id="validationDefault02" onSelect={requestselect} onRemove={requestremove} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">CV</label>
          <input type='file' className="form-control" id="validationDefault03" required onChange={handlefile} />
        </div>
        <div className="col-12">
          <button className="btn btn-success" id="savebtn" type="submit">Recieved</button>
          <span id="spinner" style={{ display: 'none' }}><span className="spinner-border spinner-border-sm text-success mx-3" role="status" aria-hidden="true"></span><span className="text-success">Saving...</span></span>
        </div>
      </form>
      <div className="col-12 mt-3">
        <button className="btn btn-secondary" id="newbtn" onClick={clearclick}>Clear</button>
      </div>
      <div className="mt-5">
        <p className="h3 w-100 text-center">CV's Recieved</p>
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
                <th>Download CV</th>
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
                  {/* data-bs-toggle="modal" data-bs-target="#exampleModal" */}
                  <td><button type="button" className="btn btn-success" onClick={() => { downloadcv(item) }} >View</button></td> 
                  {/* // data-bs-toggle="modal" data-bs-target="#exampleModal" */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* <!-- Modal --> */}
      {/* <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-fullscreen modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">{Name}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body d-flex" style={{ justifyContent: 'center' }}>
              {
                sf == null ? (
                  <p>Loading ... </p>
                ) : (
                  <Document file={sf} onLoadSuccess={onDocumentLoadSuccess} >
                    {
                      Array.apply(null, Array(numPages))
                        .map((x, i) => i + 1)
                        .map(page => <Page key={page} pageNumber={page} />)
                    }
                  </Document>
                )
              }
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div> */}



    </div>

  )
}

export default RecieveCV


