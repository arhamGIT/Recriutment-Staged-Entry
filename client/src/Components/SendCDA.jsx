import React, { useEffect, useState } from "react";
import axios from 'axios'
import Multiselect from 'multiselect-react-dropdown';
import RejectModal from "./RejectModal";



const SendCDA = () => {


  const [updel, setupdel] = useState({});

  const [tdata, settdata] = useState([]);
  const [requests, setrequests] = useState();
  const [alljobs, setalljobs] = useState([]);
  const [allusers, setallusers] = useState([]);
  const [fl, setfl] = useState(false);
  const [sl, setsl] = useState(false);

  const jobref = React.createRef()
  const candidateref = React.createRef()


  const [data, setdata] = useState({
    request: [],
    LatestCompany: '',
    LatestJobTitle: '',
    SalaryExpectation: '',
    CandidateEmail: '',
    CandidatePhone: '',
    MailingAddress: '',
    CurrentSalary: '',
    CandidateExperience: [],
    CandidateSkills: [],
    Education: [],
    PersonalTraits: '',
    OtherCriterias: '',
  });

  const user = JSON.parse(sessionStorage.getItem('user'))


  const rowclick = (item) => {
    setupdel(item)
    document.getElementById('validationDefault03').value = item.LatestCompany;
    document.getElementById('validationDefault04').value = item.LatestJobTitle;
    document.getElementById('validationDefault05').value = item.CurrentSalary;
    document.getElementById('validationDefault06').value = item.CandidateEmail;
    document.getElementById('validationDefault07').value = item.CandidatePhone;
    document.getElementById('validationDefault08').value = item.MailingAddress;
    document.getElementById('validationDefault09').value = item.CurrentSalary;


    // document.getElementById('lower').style.display = 'none';
    // document.getElementById('validationDefault09').style.display = 'none';
    // document.getElementById('validationDefault09').style.display = 'none';
    // document.getElementById('validationDefault09').style.display = 'none';
    // document.getElementById('validationDefault09').style.display = 'none';





  }

  const cancelclick = () =>{

  }



  const fetchtdata = () => {
    axios.post('/getsendcda', { user: user })
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
    if (v) {
      document.getElementById('spinner').style.display = 'inline-block'
    } else {
      document.getElementById('spinner').style.display = 'none'
    }
  }

  const submitform = (e) => {
    e.preventDefault()
    if (data.request.length == 0) {
      alert("Fill All required Fields")
    } else {
      // console.log(data)
      setvalues(true)


      axios.post('/savesendcda', { data: data, user: user })
        .then((reponse) => {
          if (reponse.data.status == 200) {
            //reseting data
            setdata({
              request: [], LatestCompany: '', LatestJobTitle: '', SalaryExpectation: '', CandidateEmail: '',
              CandidatePhone: '', MailingAddress: '', CurrentSalary: '', CandidateExperience: [], CandidateSkills: [],
              Education: [], PersonalTraits: '', OtherCriterias: '',
            })
            setrequests([])
            alert('Success')
            jobref.current.resetSelectedValues()
            candidateref.current.resetSelectedValues()
            // showmsg(msgs.smsg)
            document.getElementById('form').reset()
            fetchtdata()
          } else if (reponse.data.status == 303) {
            alert('Already Sent')
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
    axios.post('/getjobspecificschedulcalls', { job: job, user: user })
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

  //for skill experience and education adds

  const [experience, setexperience] = useState({
    position: '',
    organization: '',
    tenure: ''
  });

  const [skill, setskill] = useState({
    Skill: '',
    Remarks: ''
  });

  const [education, seteducation] = useState({
    Degree: '',
    Institute: '',
    PassingYear: ''
  });


  const addexpreience = () => {
    if (experience.organization == "" || experience.position == "" || experience.tenure == "") {
      alert("Select All")
    } else {
      setdata(ps => { return { ...ps, CandidateExperience: [...data.CandidateExperience, experience] } })
      document.getElementById('validationDefault10').value = '';
      document.getElementById('validationDefault11').value = '';
      document.getElementById('validationDefault12').value = '';
      setexperience({
        position: '',
        organization: '',
        tenure: ''
      })
    }
  }

  const addskill = () => {
    if (skill.Skill == "") {
      alert("Select All")
    } else {
      setdata(ps => { return { ...ps, CandidateSkills: [...data.CandidateSkills, skill] } })
      document.getElementById('validationDefault13').value = '';
      document.getElementById('validationDefault14').value = '';
      setskill({
        Skill: '',
        Remarks: ''
      })
    }
  }

  const addeducation = () => {
    if (education.Degree == "" || education.Institute == "" || education.PassingYear == "") {
      alert("Select All")
    } else {
      if (education.PassingYear > 2023 || education.PassingYear < 1900) {
        alert("Invalid Year")
      } else {
        setdata(ps => { return { ...ps, Education: [...data.Education, education] } })
        document.getElementById('validationDefault15').value = '';
        document.getElementById('validationDefault16').value = '';
        document.getElementById('validationDefault17').value = '';
        seteducation({
          Degree: '',
          Institute: '',
          PassingYear: ''
        })
      }
    }
  }
 

  const updateClick = (e) => {
    e.preventDefault();
    axios.post('/updatesendcda', { data: updel })
      .then((response) => {
        if (response.data.status === 200) {
          alert("Successfull Updated")
          setupdel({})
        } else {
          alert("Failed to Update")
        }
      }, (error) => {
        console.log(error);
      })
  }


  useEffect(() => {
    fetchtdata()
    fetchassignments()
    fetchusers()
  }, [])

  return (
    <div className="mx-auto my-5 container-fluid" >
      <form className="row g-3" onSubmit={submitform} id="form">
        <div className="col-md-4">
          <label htmlFor="validationDefault01" className="form-label">Job <p style={{ color: 'red', display: 'inline' }}>*</p></label>
          <Multiselect loading={fl} ref={jobref} options={alljobs} displayValue="Title" id="validationDefault01" selectionLimit={1} onSelect={jobselect} onRemove={jobremove} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Select Candidate <p style={{ color: 'red', display: 'inline' }}>*</p></label>
          <Multiselect loading={sl} ref={candidateref} options={requests} displayValue="CandidateName" id="validationDefault02" selectionLimit={1} onSelect={requestselect} onRemove={requestremove} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Current/Last Company<p style={{ color: 'red', display: 'inline' }}>*</p></label>
          <input type='text' className="form-control" id="validationDefault03" onChange={e => { setdata(ps => { return { ...ps, LatestCompany: e.target.value } }) }} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Current/Last JobTitle<p style={{ color: 'red', display: 'inline' }}>*</p></label>
          <input type='text' className="form-control" id="validationDefault04" onChange={e => { setdata(ps => { return { ...ps, LatestJobTitle: e.target.value } }) }} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Current/Last Salary<p style={{ color: 'red', display: 'inline' }}>*</p></label>
          <input type='text' className="form-control" id="validationDefault05" onChange={e => { setdata(ps => { return { ...ps, CurrentSalary: e.target.value } }) }} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Candidate Email<p style={{ color: 'red', display: 'inline' }}>*</p></label>
          <input type='text' className="form-control" id="validationDefault06" onChange={e => { setdata(ps => { return { ...ps, CandidateEmail: e.target.value } }) }} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Contact Phone<p style={{ color: 'red', display: 'inline' }}>*</p></label>
          <input type='text' className="form-control" id="validationDefault06" onChange={e => { setdata(ps => { return { ...ps, CandidatePhone: e.target.value } }) }} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Mailing Address<p style={{ color: 'red', display: 'inline' }}>*</p></label>
          <input type='text' className="form-control" id="validationDefault07" onChange={e => { setdata(ps => { return { ...ps, MailingAddress: e.target.value } }) }} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Expected Salary<p style={{ color: 'red', display: 'inline' }}>*</p></label>
          <input type='text' className="form-control" id="validationDefault09" onChange={e => { setdata(ps => { return { ...ps, SalaryExpectation: e.target.value } }) }} />
        </div>


        
        <div className="col-12"><p><h4 className="text-center" style={{ color: 'GrayText' }}>Expreience<p style={{ color: 'red', display: 'inline' }}>*</p></h4></p></div>
        <div className="col-12" style={{ display: "flex", flexWrap: 'wrap' }}>
          {data.CandidateExperience.length > 0 ?
            (
              data.CandidateExperience.map((item, index) => <p key={index} className="btn btn-primary mx-1">{item.position + "," + item.organization + "," + item.tenure}</p>)
            )
            :
            (
              <></>
            )}
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Position</label>
          <input type='text' className="form-control" id="validationDefault10" onChange={e => { setexperience(ps => { return { ...ps, position: e.target.value } }) }} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Organization</label>
          <input type='text' className="form-control" id="validationDefault11" onChange={e => { setexperience(ps => { return { ...ps, organization: e.target.value } }) }} />
        </div>
        <div className="col-md-2">
          <label htmlFor="validationDefaultUsername" className="form-label">No. of Tenure</label>
          <input type='text' className="form-control" id="validationDefault12" onChange={e => { setexperience(ps => { return { ...ps, tenure: e.target.value } }) }} />
        </div>
        <div className="col-md-2 my-3"><p className="btn btn-outline-success btn-sm" onClick={addexpreience}>Add Experience</p></div>




        <div className="col-12"><p><h4 className="text-center" style={{ color: 'GrayText' }} >Skill Set<p style={{ color: 'red', display: 'inline' }}>*</p></h4></p></div>
        <div className="col-12" style={{ display: "flex", flexWrap: 'wrap' }}>
          {data.CandidateSkills.length > 0 ?
            (
              data.CandidateSkills.map((item, index) => <p key={index} className="btn btn-primary mx-1">{item.Skill}</p>)
            )
            :
            (
              <></>
            )}
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Skill</label>
          <input type='text' className="form-control" id="validationDefault13" onChange={e => { setskill(ps => { return { ...ps, Skill: e.target.value } }) }} />
        </div>
        <div className="col-md-6">
          <label htmlFor="validationDefaultUsername" className="form-label">Remarks</label>
          <input type='text' className="form-control" id="validationDefault14" onChange={e => { setskill(ps => { return { ...ps, Remarks: e.target.value } }) }} />
        </div>
        <div className="col-md-2 my-3"><p className="btn btn-outline-success btn-sm" onClick={addskill}>Add Skill</p></div>





        <div className="col-12"><p><h4 className="text-center" style={{ color: 'GrayText' }} >Education<p style={{ color: 'red', display: 'inline' }}>*</p></h4></p></div>
        <div className="col-12" style={{ display: "flex", flexWrap: 'wrap' }}>
          {data.Education.length > 0 ?
            (
              data.Education.map((item, index) => <p key={index} className="btn btn-primary mx-1">{item.Degree + "," + item.Institute + "," + item.PassingYear}</p>)
            )
            :
            (
              <></>
            )}
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Degree</label>
          <input type='text' className="form-control" id="validationDefault15" onChange={e => { seteducation(ps => { return { ...ps, Degree: e.target.value } }) }} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Institute</label>
          <input type='text' className="form-control" id="validationDefault16" onChange={e => { seteducation(ps => { return { ...ps, Institute: e.target.value } }) }} />
        </div>
        <div className="col-md-2">
          <label htmlFor="validationDefaultUsername" className="form-label">Passing Year</label>
          <input type="number" min="1900" max="2099" step="1" className="form-control" id="validationDefault17" onChange={e => { seteducation(ps => { return { ...ps, PassingYear: e.target.value } }) }} />
        </div>
        <div className="col-md-2 my-3"><p className="btn btn-outline-success btn-sm" onClick={addeducation}>Add Degree</p></div>





        <div className="col-md-12">
          <label htmlFor="validationDefaultUsername" className="form-label">Personal Traits</label>
          <input type='text' className="form-control" id="validationDefault18" onChange={e => { setdata(ps => { return { ...ps, PersonalTraits: e.target.value } }) }} />
        </div>

        <div className="col-md-12">
          <label htmlFor="validationDefaultUsername" className="form-label">Other Criteria's</label>
          <input type='text' className="form-control" id="validationDefault19" onChange={e => { setdata(ps => { return { ...ps, OtherCriterias: e.target.value } }) }} />
        </div>








        <div className="col-12">
          <button className="btn btn-success" id="savebtn" type="submit">Send CDA</button>
          <span id="spinner" style={{ display: 'none' }}><span className="spinner-border spinner-border-sm text-success mx-3" role="status" aria-hidden="true"></span><span className="text-success">Saving...</span></span>
        </div>
      </form>
      <div className="col-12 mt-3">
        <button className="btn btn-secondary" id="newbtn" onClick={clearclick}>Clear</button>
      </div>





      {/* //Table is here */}
      <div className="mt-5">
        <p className="h3 w-100 text-center">CDA's SENT</p>
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
                <th>Latest Company</th>
                <th>Latest Job</th>
                <th>Salary Expectation</th>
                <th>Candidate Email</th>
                <th>Job Title</th>
                <th>Person</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              {tdata.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.CandidateName}</td>
                  <td>{item.LatestCompany}</td>
                  <td>{item.LatestJobTitle}</td>
                  <td>{item.SalaryExpectation}</td>
                  <td>{item.CandidateEmail}</td>
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

export default SendCDA


