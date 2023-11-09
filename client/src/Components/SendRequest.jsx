import React, { useEffect, useState } from "react";
import axios from 'axios'
import Multiselect from 'multiselect-react-dropdown';
import { Modal, Button } from 'react-bootstrap';
import { read as xlsxRead, utils as xlsxUtils } from "xlsx";


const SendRequest = () => {


  const multselectref = React.createRef()

  const [tdata, settdata] = useState([]);
  const [updel, setupdel] = useState();
  const [alljobs, setalljobs] = useState([]);
  const [loading, setloading] = useState(false);
  const [btnloading, setbtnloading] = useState(false);
  const [tablefileter, settablefileter] = useState({

  });


  const [data, setdata] = useState({
    job: null,
    CandidateName: '',
    WebLink: ''
  });
  const [updateData, setUpdateData] = useState({
    SendRequestID: null,
    newdata: {
      job: null,
      CandidateName: '',
      WebLink: ''
    }
  });
  const user = JSON.parse(sessionStorage.getItem('user'))

  const fetchtdata = () => {
    axios.post('/getsendrequests', { user: user })
      .then((response) => {
        if (response.data.status == 200) {
          settdata(response.data.data)
        }
      }, (error) => {

      })
  }

  const fetchassignments = () => {
    axios.post('/getuserassignments', { user: user })
      .then((response) => {
        // document.getElementById('validationDefault01').loading = false
        if (response.data.status == 200) {
          setalljobs(response.data.data)
          setloading(false)
        }
      }, (error) => {

      })
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
    if (data.job == null) {
      alert("select JOb")
    } else {
      // console.log(data)
      setvalues(true)


      axios.post('/savesendrequest', { data: data, user: user })
        .then((reponse) => {
          if (reponse.data.status == 200) {
            alert('Success')

            document.getElementById('form').reset()
            // multselectref.current.resetSelectedValues()
            fetchtdata()
          } else if (reponse.data.status == 303) {
            alert('WebLink Already Exists')
          } else {
            alert('Failed due to unknown reasons')
          }
          setvalues(false)
        })
    }
  }

  const clearclick = () => {
    document.getElementById('form').reset()
    multselectref.current.resetSelectedValues();
  }


  useEffect(() => {
    fetchtdata()
    fetchassignments()
  }, [])

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
    setdata(ps => { return { ...ps, job: item[0] } })
  }
  const jobremove = (item) => {
    setdata(ps => { return { ...ps, job: item[0] } })
  }
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleUpdate = () => {
    console.log(updateData);
    if (updateData.newdata.job == null) {
      alert("select JOb")
    } else {
      axios.post('/updatesendrequest', { data: updateData, user: user })
        .then((reponse) => {
          if (reponse.data.status == 200) {
            alert('Success')
            // showmsg(msgs.smsg)
            handleClose()
            // multselectref.current.resetSelectedValues()
            fetchtdata()
          } else if (reponse.data.status == 303) {
            alert('cant edit already on next step')
          } else {
            alert('Failed due to unknown reasons')
          }
        })
    }
  }
  const handleShow = (item) => {
    setUpdateData(ps => { return { ...ps, SendRequestID: item.SendRequestID } });
    setShow(true);
  };
  const handleUploadExcel = async (file) => {
    let totalUploaded = 0;
    if (!file || !file.name || file.name.length < 4 || file.name.substr(file.name.length - 4) !== "xlsx") {
      alert("Not Excel File");
      return;
    }
    try {
      const buffer = await file.arrayBuffer(); // Convert the file to a buffer
      const workbook = xlsxRead(buffer, { type: 'array' }); // Parse the Excel data

      // Assuming the first sheet is the one you want to process
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert the worksheet data into a 2D vector (excluding empty rows)
      const data = xlsxUtils.sheet_to_json(worksheet, { header: 1 });
      const first3Columns = data.map((row) => row.slice(0, 3));
      const nonEmptyRows = first3Columns.filter((row) => row.some((cell) => cell.trim() !== ''));
      const completeRows = nonEmptyRows.filter(row => row.filter(cell => cell != null).length === 3);
      if (completeRows.length > 0) {
        await Promise.all(completeRows.slice(1).map(async (row) => {
          console.log("enter handle row", row);
          const job = alljobs.find(j => j.Title.trim() === row[0].trim());
          if (job === undefined) {
            console.log("couldnt find job", alljobs.find(j => j.Title === row[0]), row)
            return;
          }
          const jobUploadData = {
            job: job,
            CandidateName: row[1],
            WebLink: row[2]
          }
          const reponse = await axios.post('/savesendrequest', { data: jobUploadData, user: user });
          if (reponse.data.status === 200) {
            totalUploaded++;
          }
        }
        ));
      }
      alert("Success Uploaded: " + totalUploaded.toString());
      fetchtdata();
    } catch (error) {
      alert("Failed Parsing Excel Uploaded: " + totalUploaded.toString());
    }
  }
  return (
    <div>
      <div className="mx-auto my-5 container-fluid" >
        <form className="row g-3" onSubmit={submitform} id="form">
          <div className="col-md-4">
            <label htmlFor="validationDefault01" className="form-label">Job</label>
            <Multiselect loading={loading} ref={multselectref} options={alljobs} displayValue="Title" id="validationDefault01" selectionLimit={1} onSelect={jobselect} onRemove={jobremove} />
          </div>
          <div className="col-md-4">
            <label htmlFor="validationDefaultUsername" className="form-label">Candidate Name</label>
            <input type="text" className="form-control" id="validationDefault02" required onChange={e => { setdata(ps => { return { ...ps, CandidateName: e.target.value } }) }} />
          </div>
          <div className="col-md-4">
            <label htmlFor="validationDefaultUsername" className="form-label">WebLink</label>
            <input type="text" className="form-control" id="validationDefault02" required onChange={e => { setdata(ps => { return { ...ps, WebLink: e.target.value } }) }} />
          </div>
          <div className="col-12" >
            <button data-loading-text="Saving" className="btn btn-success" id="savebtn" type="submit">Send Request</button>
            <div style={{ float: "right" }}>
              <input id="file-upload" type="file" accept=".xlsx" onChange={e => handleUploadExcel(e.target.files[0])} />
            </div>
            <span id="spinner" style={{ display: 'none' }}><span className="spinner-border spinner-border-sm text-success mx-3" role="status" aria-hidden="true"></span><span className="text-success">Saving...</span></span>
          </div>
        </form>
        <div className="col-12 mt-3">
          <button className="btn btn-secondary" id="newbtn" onClick={clearclick}>Clear</button>
        </div>
        <div className="mt-5">
          <p className="h3 w-100 text-center">Requests Sent</p>
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
                  <th>Title</th>
                  <th>Weblink</th>
                  <th>Person</th>
                  <th>Company</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {tdata.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.CandidateName}</td>
                    <td>{item.Title}</td>
                    <td>{item.WebLink}</td>
                    <td>{item.Person}</td>
                    <td>{item.Company}</td>
                    <td><button className="btn btn-primary" onClick={() => handleShow(item)}>
                      Edit
                    </button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton style={{ background: '#e7e7e7' }}>
          <Modal.Title>Update Send Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label htmlFor="validationDefault01" className="form-label">Job</label>
          <Multiselect loading={loading} ref={multselectref} options={alljobs} displayValue="Title" id="validationDefault01" selectionLimit={1} onSelect={(item) => setUpdateData(ps => { return { ...ps, newdata: { ...ps.newdata, job: item[0] } } })} onRemove={(item) => setUpdateData(ps => { return { ...ps, newdata: { ...ps.newdata, job: item[0] } } })} />
          <label htmlFor="validationDefaultUsername" className="form-label">Candidate Name</label>
          <input type="text" className="form-control" id="validationDefault02" required onChange={e => { setUpdateData(ps => { return { ...ps, newdata: { ...ps.newdata, CandidateName: e.target.value } } }) }} />
          <label htmlFor="validationDefaultUsername" className="form-label">WebLink</label>
          <input type="text" className="form-control" id="validationDefault02" required onChange={e => { setUpdateData(ps => { return { ...ps, newdata: { ...ps.newdata, WebLink: e.target.value } } }) }} />
        </Modal.Body>
        <Modal.Footer style={{ background: '#e7e7e7' }}>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="success" onClick={handleUpdate}>
            Save changes
          </Button>
        </Modal.Footer>
      </Modal>

    </div>

  )
}

export default SendRequest
