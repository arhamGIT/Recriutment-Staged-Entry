import React, { useState, useEffect } from 'react'
import Multiselect from 'multiselect-react-dropdown';
import axios from 'axios';

const AttendanceList = () => {

  const [allusers, setallusers] = useState([]);
  const [tdata, settdata] = useState([]);

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

  const fetchtdata = (user) => {
    axios.post('/getattendencesbyuser', { user: user })
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          settdata(response.data.data)
        }
      }, (error) => {

      })
  }

  const jobselect = (item) => {
    // setdata(ps => { return { ...ps, job:item[0] } })
    fetchtdata(item[0])
  }

  const jobremove = (item) => {
    // setdata(ps => { return { ...ps, job: item[0] } })
  }




  useEffect(() => {
    fetchusers()
  }, []);


  return (
    <div className='container-fluid'>
      <div className="mt-5">
        <p className="h3 w-100 text-center">Attendance List</p>
        <div className="cor-3">
          <Multiselect options={allusers} displayValue="UserName" id="validationDefault01" selectionLimit={1} onSelect={jobselect} onRemove={jobremove} />
        </div>
        {/* <p className="w-100 text-center">Click to update Record</p> */}
        <div className="table-responsive my-5 rounded-3" style={{ height: '300px', overflow: 'auto' }}>
          <table className="table table-secondary table-hover">
            <thead className="" style={{ position: 'sticky', top: 0 }}>
              <tr>
                <th>Login Time</th>
                <th>Logout Time</th>
                <th>Working Time</th>
              </tr>
            </thead>
            <tbody>
              {tdata.map((item, index) => (
                <tr key={index}>
                  <td>{new Date(parseInt(item.LoginTime)).toString()}</td>
                  <td>{new Date(parseInt(item.LogoutTime)).toString()}</td>
                  <td>{new Date(parseInt(item.LogoutTime) - parseInt(item.LoginTime)).toISOString().slice(11, 19)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AttendanceList