import React, { useEffect, useState } from "react";
// import "./styles.css";
import { Country, State, City } from 'country-state-city';
// import SelectSearch from 'react-select-search';
// import "react-select-search/style.css";
import axios from 'axios'
import Multiselect from 'multiselect-react-dropdown';




const CreateJob = () => {

  const [tdata, settdata] = useState([]);
  const [updel, setupdel] = useState();
  const [clients, setclients] = useState([]);
  const jt = [
    { type: "Full-Time OnSite" },
    { type: "Part-Time OnSite" },
    { type: "Full-Time Remote" },
    { type: "Part-Time Remote" },
    { type: "Contract" }
  ]

  const [data, setdata] = useState({
    Title: '',
    Summary: '',
    Requirements: '',
    JobType: '',
    Location: [],
    Client: {},
    Salary:'',
    Bonus:'',
  });

  const [csc, setcsc] = useState({
    country: null,
    state: [],
    city: []
  });

  const [cscnames, setcscnames] = useState({
    country: '',
    state: '',
    city: ''
  });

  const oncountrychange = (e) => {
    if (e.target.value !== "") {
      if (e.target.value === "Europe") {
        setcscnames((ps) => {
          return { ...ps, country: e.target.value }
        })
      } else {
        setcsc((ps) => {
          return { ...ps, country: e.target.value, state: State.getStatesOfCountry(JSON.parse(e.target.value).isoCode) }
        })
        // console.log(csc.state)
        setcscnames((ps) => {
          return { ...ps, country: JSON.parse(e.target.value).name }
        })
      }
    }
  }

  const onstatechange = (e) => {
    if (e.target.value !== "") {
      setcsc((ps) => {
        return { ...ps, city: City.getCitiesOfState(JSON.parse(e.target.value).countryCode, JSON.parse(e.target.value).isoCode) }
      })
      setcscnames((ps) => {
        return { ...ps, state: JSON.parse(e.target.value).name }
      })
    }
  }

  const oncitychange = (e) => {
    if (e.target.value !== "") {
      setcscnames((ps) => {
        return { ...ps, city: JSON.parse(e.target.value).name }
      })
    }
  }

  const addlocation = () => {
    if (document.getElementById("validationDefault03").value == "") {
      alert("Country is required")
    } else {
      setdata(ps => { return { ...ps, Location: [...data.Location, cscnames] } })
      // console.log(data.Location)
      document.getElementById("validationDefault03").value = ""
      document.getElementById("validationDefault04").value = ""
      document.getElementById("validationDefault05").value = ""
      setcsc({
        country: null,
        state: [],
        city: []
      })
      setcscnames({
        country: '',
        state: '',
        city: ''
      })
    }
  }

  const removelocation = (item) => {
    setdata(ps => { return { ...ps, Location: data.Location.filter(it => it != item) } })
  }



  const user = JSON.parse(sessionStorage.getItem('user'))

  const fetchtdata = () => {
    axios.post('/getjobs', { user: user })
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          settdata(response.data.data)
        }
      }, (error) => {

      })
  }

  const fetchclients = () => {
    axios.post('/getclients', { user: user })
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          setclients(response.data.data)
        }
      }, (error) => {

      })
  }

  const setvalues = (v) => {
    document.getElementById('savebtn').disabled = v
    document.getElementById('updatebtn').disabled = v
    if (v) {
      document.getElementById('spinner').style.display = 'block'
    } else {
      document.getElementById('spinner').style.display = 'none'
    }
  }

  const submitform = (e) => {
    e.preventDefault()
    if (data.Location.length == 0) {
      alert("Please add atleast One Location")
    } else {
      setvalues(true)
      // console.log(data)
      axios.post('/savejob', { data: data, user: user })
        .then((reponse) => {
          if (reponse.data.status == 200) {
            alert('success')
            // showmsg(msgs.smsg)
            setdata({
              Title: '',
              Summary: '',
              Requirements: '',
              JobType: '',
              Location: [],
              Client: {}
            })
            document.getElementById('form').reset()
            fetchtdata()
          } else if (reponse.data.status == 303) {
            alert('Login ID Already Exists')
          } else {
            alert('Failed due to unknown reasons')
          }
          setvalues(false)
        })
    }
  }

  const clearclick = () => {
    document.getElementById('form').reset()
    data.Location = []
    // console.log(data)
  }

  const rowclick = (item) => {
    setupdel(item)
    setdata(item)
    setdata(ps => { return { ...ps, Location: JSON.parse(item.Location) } })
    document.getElementById('validationDefault01').value = item.Title
    document.getElementById('validationDefault06').value = item.Summary
    document.getElementById('validationDefault07').disabled = true
    document.getElementById('validationDefault08').value = item.Requirements
    document.getElementById('validationDefault09').value = item.Salary??""
    document.getElementById('validationDefault10').value = item.Bonus??""
    document.getElementById('updatebtn').style.display = 'inline-block'
    document.getElementById('savebtn').style.display = 'none'
    document.getElementById('newbtn').style.display = 'none'
    document.getElementById('cancelbtn').style.display = 'inline-block'

    document.documentElement.scrollTop = 0;
  }

  const cancelclick = () => {
    setdata({ Title: '', Summary: '', Requirements: '', JobType: '', Location: [], Client: {} })
    document.getElementById('form').reset()
    document.getElementById('validationDefault07').disabled = false
    document.getElementById('updatebtn').style.display = 'none'
    document.getElementById('savebtn').style.display = 'block'
    document.getElementById('newbtn').style.display = 'block'
    document.getElementById('cancelbtn').style.display = 'none'
  }

  const updaterecord = () => {
    setvalues(true)
    axios.post('/updatejobs', { updel: updel, formdata: data })
      .then((response) => {
        if (response.data.status == 200) {
          document.getElementById('form').reset()
          setdata({ Title: '', Summary: '', Requirements: '', JobType: '', Location: [], Client: {} })
          fetchtdata()
          cancelclick()
        } else {
          alert("error")
        }
        setvalues(false)
      }, (err) => {
        alert("lower error")
        setvalues(false)

      })
  }

  const clientchange = (e) => {
    if (e.target.value !== "") {
      setdata(ps => { return { ...ps, Client: JSON.parse(e.target.value) } })
    }
  }

  useEffect(() => {
    fetchtdata()
    fetchclients()
    // console.log(Country.getAllCountries())
  }, [])


  const typeselect = (item) => {
    // console.log(JSON.stringify(item));
    setdata(ps => { return { ...ps, JobType: JSON.stringify(item) } })
  }

  const typeremove = (item) => {
    // console.log(JSON.stringify(item));
    setdata(ps => { return { ...ps, JobType: JSON.stringify(item) } })
  }


  return (
    <div className="mx-auto my-5 container-fluid">
      <form className="row g-3" onSubmit={submitform} id="form">
        <div className="col-md-4">
          <label htmlFor="validationDefault01" className="form-label">Title</label>
          <input type="text" className="form-control" id="validationDefault01" required onChange={e => { setdata(ps => { return { ...ps, Title: e.target.value } }) }} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Client</label>
          <div className="input-group">
            {/* <span className="input-group-text" id="inputGroupPrepend2">@</span> */}
            <select className="form-select" required id="validationDefault07" onChange={e => { clientchange(e) }}>
              <option value="">Select Client ...</option>
              {
                clients.map((item, index) => (
                  <option value={JSON.stringify(item)} key={index}>{item.Person + " From " + item.Company}</option>
                ))
              }
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefault01" className="form-label">Job</label>
          <Multiselect options={jt} displayValue="type" id="validationDefault01" onSelect={typeselect} onRemove={typeremove} />
        </div>
        {/* <div className="col-md-4">
          <label htmlFor="validationDefault02" className="form-label">JobType</label>
          <select className="form-select" required id="validationDefault02" onChange={e => { setdata(ps => { return { ...ps, JobType: e.target.value } }) }}>
            <option >Choose JobType</option>
            <option value="FullTime OnSite">FullTime OnSite</option>
            <option value="ParTime OnSite">PartTime OnSite</option>
            <option value="FullTime Remote">FullTime Remote</option>
            <option value="PartTime Remote">PartTime Remote</option>
          </select>
        </div> */}
        <div className="col-12" style={{ display: 'flex', flexWrap: 'wrap' }}>{
          Array.isArray(data.Location) && data.Location.length > 0 ? (
            data.Location.map((item, index) => (
              <p className="btn btn-outline-success mx-1" key={index} >{item.city + "-" + item.state + "-" + item.country} <span onClick={() => { removelocation(item) }} className="btn btn-danger" style={{ marginLeft: 20 }} >x</span></p>
            ))
          )
            :
            (
              <></>
            )
        }</div>
        <div className="col-md-4">
          <label htmlFor="validationDefault04" className="form-label">Country</label>
          <select className="form-select" id="validationDefault03" onChange={(e) => { oncountrychange(e) }}>
            <option value="">Select Country ...</option>
            <option value="Europe">Europe</option>
            {
              Country.getAllCountries().map((item, index) => (
                <option value={JSON.stringify(item)} key={index}>{item.name}</option>
              ))
            }
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefault04" className="form-label">State</label>
          <select className="form-select" id="validationDefault04" onChange={(e) => { onstatechange(e) }}>
            <option value="">Select State ...</option>
            {
              csc.state.map((item, index) => (
                <option value={JSON.stringify(item)} key={index}>{item.name}</option>
              ))
            }
          </select>
        </div>
        <div className="col-md-2">
          <label htmlFor="validationDefault04" className="form-label">City</label>
          <select className="form-select" id="validationDefault05" onChange={(e) => { oncitychange(e) }}>
            <option value="">Select City ...</option>
            {
              csc.city.map((item, index) => (
                <option value={JSON.stringify(item)} key={index}>{item.name}</option>
              ))
            }
          </select>
        </div>
        <div className="col-md-1">
          <p className="btn btn-outline-success" onClick={addlocation}>Add Location</p>
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefault01" className="form-label">Salary</label>
          <input type="text" id="validationDefault09" className="form-control" required onChange={e => { setdata(ps => { return { ...ps, Salary: e.target.value } }) }} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefault01" className="form-label">Bonus</label>
          <input type="text" id="validationDefault10" className="form-control" required onChange={e => { setdata(ps => { return { ...ps, Bonus: e.target.value } }) }} />
        </div>
        <div className="col-12 d-flex">
          <div className="col-md-5 m-auto">
            <label htmlFor="validationDefault04" className="form-label">Summary</label>
            <textarea className="form-control" id="validationDefault06" rows="3" required onChange={e => { setdata(ps => { return { ...ps, Summary: e.target.value } }) }}></textarea>
          </div>
          <div className="col-md-5 m-auto">
            <label htmlFor="validationDefault04" className="form-label">Requirements</label>
            <textarea className="form-control" id="validationDefault08" rows="3" required onChange={e => { setdata(ps => { return { ...ps, Requirements: e.target.value } }) }}></textarea>
          </div>
        </div>
        <div className="col-12">
          <button className="btn btn-success" id="savebtn" type="submit">Add Job</button>
          <span id="spinner" style={{ display: 'none' }}><span className="spinner-border spinner-border-sm text-success mx-3" role="status" aria-hidden="true"></span><span className="text-success">Saving...</span></span>
        </div>
      </form>
      <div className="col-12 mt-3">
        <button className="btn btn-secondary" id="newbtn" onClick={clearclick}>Clear</button>
        <button className="btn btn-outline-success ms-3" id="updatebtn" style={{ display: 'none' }} onClick={updaterecord}>Update</button>
        <button className="btn btn-outline-secondary ms-3" id="cancelbtn" style={{ display: 'none' }} onClick={cancelclick}>Cancel</button>
      </div>
      <div className="mt-5">
        <p className="h3 w-100 text-center">Jobs</p>
        <p className="w-100 text-center">Click to update Record</p>
        <div className="table-responsive my-5 rounded-3" style={{ height: '300px', overflow: 'auto', scrollbarWidth: 'none' }}>
          <table className="table table-secondary table-hover" >
            <thead className="" style={{ position: 'sticky', top: 0 }}>
              <tr>
                <th>Sr</th>
                <th>Title</th>
                <th>Person</th>
                <th>Company</th>
                {/* <th>Status</th> */}
              </tr>
            </thead>
            <tbody>
              {tdata.map((item, index) => (
                <tr key={index} onClick={() => { rowclick(item) }}>
                  <td>{index+1}</td>
                  <td>{item.Title}</td>
                  <td>{item.Person}</td>
                  <td>{item.Company}</td>
                  {/* <td>{item.status = "active" ? "Active" : "Close"}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>

  )
}

export default CreateJob
