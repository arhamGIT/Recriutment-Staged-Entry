import React, { useEffect, useState } from "react";
// import "./styles.css";
// import { Country, State, City } from 'country-state-city';
// import SelectSearch from 'react-select-search';
// import "react-select-search/style.css";
import axios from 'axios'
import { Country, State, City } from 'country-state-city';





const CreateClient = () => {

  const [tdata, settdata] = useState([]);
  const [updel, setupdel] = useState();

  const [data, setdata] = useState({
    Person: '',
    Company: '',
    ContactEmail: '',
    ContactPhone: '',
    Country: '',
    State: '',
    City: ''
  });

  const user = JSON.parse(sessionStorage.getItem('user'))

  const fetchtdata = () => {
    axios.post('/getclients', { user: user })
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          settdata(response.data.data)
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
    axios.post('/saveclient', { data: data, user: user })
      .then((reponse) => {
        if (reponse.data.status == 200) {
          alert('Client Added Successfully')
          // showmsg(msgs.smsg)
          document.getElementById('form').reset()
          fetchtdata()
        } else if (reponse.data.status == 303) {
          alert('Email Already Exists')
        } else {
          alert('Failed due to unknown reasons')
        }
        setvalues(false)
      })      
  }

  const clearclick = () => {
    document.getElementById('form').reset()
  }

  const rowclick = (item) => {
    setupdel(item)
    setdata(item)
    document.getElementById('validationDefault01').value = item.Person
    document.getElementById('validationDefault02').value = item.Company
    document.getElementById('validationDefault03').value = item.Country
    document.getElementById('validationDefault04').value = item.State
    document.getElementById('validationDefault05').value = item.City
    document.getElementById('validationDefault06').value = item.ContactPhone
    document.getElementById('validationDefault07').value = item.ContactEmail
    document.getElementById('updatebtn').style.display = 'inline-block'
    document.getElementById('savebtn').style.display = 'none'
    document.getElementById('newbtn').style.display = 'none'
    document.getElementById('cancelbtn').style.display = 'inline-block'

    document.documentElement.scrollTop = 0;
  }

  const cancelclick = () => {
    document.getElementById('form').reset()
    document.getElementById('updatebtn').style.display = 'none'
    document.getElementById('savebtn').style.display = 'block'
    document.getElementById('newbtn').style.display = 'block'
    document.getElementById('cancelbtn').style.display = 'none'
  }

  const updaterecord = () => {
    setvalues(true)
    axios.post('/updateclient', { updel: updel, formdata: data })
      .then((response) => {
        if (response.data.status == 200) {
          alert("Updated Successfully")
          document.getElementById('form').reset()
          fetchtdata()
          cancelclick()
        } else {
          alert("error")
        }
        setvalues(false)
      }, (err) => {
        alert("lower error")
      })
  }

  const [csc, setcsc] = useState({
    country: null,
    state: [],
    city: []
  });

  const oncountrychange = (e) => {
    if(e.target.value !== ""){
      setcsc((ps) => {
        return { ...ps, country: e.target.value, state: State.getStatesOfCountry(JSON.parse(e.target.value).isoCode) }
      })
      // console.log(csc.state)
      setdata((ps) => {
        return { ...ps, Country: JSON.parse(e.target.value).name }
      })
    }
  }

  const onstatechange = (e) => {
    if(e.target.value !== ""){
      setcsc((ps) => {
        return { ...ps, city: City.getCitiesOfState(JSON.parse(e.target.value).countryCode, JSON.parse(e.target.value).isoCode) }
      })
      setdata((ps) => {
        return { ...ps, State: JSON.parse(e.target.value).name }
      })
    }
  }

  const oncitychange = (e) => {
    if(e.target.value !== ""){
      setdata((ps) => {
        return { ...ps, City: JSON.parse(e.target.value).name }
      })
    }
    
  }

  useEffect(() => {
    fetchtdata()
  }, [])

  return (
    <div className="mx-auto my-5 container-fluid">
      <form className="row g-3" onSubmit={submitform} id="form">
        <div className="col-md-4">
          <label htmlFor="validationDefault01" className="form-label">Person</label>
          <input type="text" className="form-control" id="validationDefault01" required onChange={e => { setdata(ps => { return { ...ps, Person: e.target.value } }) }} />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">Email</label>
          <div className="input-group">
            <span className="input-group-text" id="inputGroupPrepend2">@</span>
            <input type="text" className="form-control" id="validationDefault07" aria-describedby="inputGroupPrepend2" required onChange={e => { setdata(ps => { return { ...ps, ContactEmail: e.target.value } }) }} />
          </div>
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefault02" className="form-label">Company</label>
          <input type="text" className="form-control" id="validationDefault02" required onChange={e => { setdata(ps => { return { ...ps, Company: e.target.value } }) }} />
        </div>
        <div className="col-12">
          <div className="col-md-3">
            <label htmlFor="validationDefault06" className="form-label">Phone</label>
            <input type='text' className="form-control" id="validationDefault06" required onChange={e => { setdata(ps => { return { ...ps, ContactPhone: e.target.value } }) }} />
          </div>
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefault04" className="form-label">Country</label>
          <select required className="form-select" id="validationDefault03" onChange={(e) => { oncountrychange(e) }}>
            <option value="">Select Country ...</option>
            {
              Country.getAllCountries().map((item, index) => (
                <option value={JSON.stringify(item)} key={index}>{item.name}</option>
              ))
            }
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefault04" className="form-label">State</label>
          <select required className="form-select" id="validationDefault04" onChange={(e) => { onstatechange(e) }}>
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
          <select required className="form-select" id="validationDefault05" onChange={(e) => { oncitychange(e) }}>
          <option value="">Select City ...</option>
            {
              csc.city.map((item, index) => (
                <option value={JSON.stringify(item)} key={index}>{item.name}</option>
              ))
            }
          </select>
        </div>
        <div className="col-12">
          <button className="btn btn-success" id="savebtn" type="submit">Add Client</button>
          <span id="spinner" style={{display:'none'}}><span className="spinner-border spinner-border-sm text-success mx-3" role="status" aria-hidden="true"></span><span className="text-success">Saving...</span></span>
        </div>
      </form>
      <div className="col-12 mt-3">
        <button className="btn btn-secondary" id="newbtn" onClick={clearclick}>Clear</button>
        <button className="btn btn-outline-success ms-3" id="updatebtn" style={{ display: 'none' }} onClick={updaterecord}>Update</button>
        <button className="btn btn-outline-secondary ms-3" id="cancelbtn" style={{ display: 'none' }} onClick={cancelclick}>Cancel</button>
      </div>
      <div className="mt-5">
        <p className="h3 w-100 text-center">Clients</p>
        <p className="w-100 text-center">Click to update Client</p>
        <div className="table-responsive my-5 rounded-3" style={{ height: '300px', overflow: 'auto', scrollbarWidth: 'none' }}>
          <table className="table table-secondary table-hover" >
            <thead className="" style={{ position: 'sticky', top: 0 }}>
              <tr>
                <th>Sr</th>
                <th>Person</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Country</th>
                <th>State</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              {tdata.map((item, index) => (
                <tr key={index} onClick={() => { rowclick(item) }}>
                  <td>{index+1}</td>
                  <td>{item.Person}</td>
                  <td>{item.Company}</td>
                  <td>{item.ContactEmail}</td>
                  <td>{item.ContactPhone}</td>
                  <td>{item.Country}</td>
                  <td>{item.State}</td>
                  <td>{item.City}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>

  )
}

export default CreateClient
