import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Multiselect from 'multiselect-react-dropdown';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'



const SearchCV = () => {

  const [tdata, settdata] = useState(null);
  const [data, setdata] = useState({
    CandidateName: "",
    LatestCompany: "",
    status: "",
    job: null
  });

  const [sf, setsf] = useState(null);


  const [jobs, setjobs] = useState([]);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [Name, setName] = useState("");

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }





  const handlesearch = () => {
    if (data.CandidateName == "" && data.LatestCompany == "" && data.status == "" && data.job == null) {
      alert("Select Atleast One feild to Search")
    } else {
      axios.post('/searchcv',{data:data})
        .then((response) => {
          if (response.data.status == 200) {
            //  console.log(response.data.data)
            settdata(response.data.data)
          }
        }, (error) => {

        })
    }
  }

  const fetchjobs = () => {
    axios.post('/sjobs')
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          setjobs(response.data.data)
        }
      }, (error) => {

      })
  }

  const jobselect = (item) => {
    setdata(ps => { return { ...ps, job: item[0].JobID } })
  }
  const jobremove = (item) => {
    setdata(ps => { return { ...ps, job: null } })
  }

  const downloadcv = (item) => {
    setName(item.CandidateName)
    const name = item.CVName.split("____")[1]
    axios.post('/downloadcv', { path: item.CVName })
      .then((response) => {
        // console.log(response.data)
        setsf(response.data.data)
      }, (error) => {

      })
  }

  useEffect(() => {
    fetchjobs()
  }, []);


  return (
    <div className='container-fluid'>
      <div className="mt-5">
        <p className="h3 w-100 text-center">Search CV's</p>
        <div className="col-12 d-flex my-3" style={{ justifyContent: 'space-around' }}>
          <div className="col-md-2">
            <label htmlFor="validationDefault01" className="form-label">Candidate Name</label>
            <input type="text" className="form-control" id="validationDefault01" onChange={e => { setdata(ps => { return { ...ps, CandidateName: e.target.value } }) }} />
          </div>
          <div className="col-md-2">
            <label htmlFor="validationDefault01" className="form-label">Last Company</label>
            <input type="text" className="form-control" id="validationDefault02" onChange={e => { setdata(ps => { return { ...ps, LatestCompany: e.target.value } }) }} />
          </div>
          <div className="col-md-2">
            <label htmlFor="validationDefault03" id='validationDefault03' className="form-label">Select Status</label>
            <select name="" id="" className="form-control" onChange={e => { setdata(ps => { return { ...ps, status: e.target.value } }) }}>
              <option value="">Status</option>
              <option value="recievecv">CV Recieved</option>
              <option value="shortlistcv">Short Listed</option>
              <option value="submitcv">Submitted to Clients</option>
              <option value="acceptencebyclient">Accepted By Client</option>
              <option value="joboffered">Job Offered</option>
              <option value="jobaccepted">Job Accepted</option>
            </select>
          </div>
          <div className="col-md-2">
            <label htmlFor="validationDefault01" className="form-label">Select Job</label>
            <Multiselect options={jobs} displayValue="Title" id="validationDefault04" selectionLimit={1} onSelect={jobselect} onRemove={jobremove} />
          </div>
          <div className='col-md-2 d-flex' style={{ alignItems: 'end', justifyContent: 'center' }} >
            <button className='btn btn-outline-success' onClick={handlesearch}>Search</button>
          </div>
        </div>
        <div className="table-responsive my-5 rounded-3" style={{ height: '300px', overflow: 'auto' }}>
          {
            tdata == null ? <></> : (
              <table className="table table-secondary table-hover">
                <thead className="" style={{ position: 'sticky', top: 0 }}>
                  <tr>
                    <th>Sr.</th>
                    <th>Candidate Name</th>
                    <th>Latest Company</th>
                    <th>Last Job Title</th>
                    <th>CV's</th>
                  </tr>
                </thead>
                <tbody>
                  {tdata.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.CandidateName}</td>
                      <td>{item.LatestCompany}</td>
                      <td>{item.LatestJobTitle}</td>
                      <td><button type="button" className="btn btn-success" onClick={() => { downloadcv(item) }} data-bs-toggle="modal" data-bs-target="#exampleModal">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>

      {/* <!-- Modal --> */}
      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
      </div> 



    </div>
  )
}

export default SearchCV