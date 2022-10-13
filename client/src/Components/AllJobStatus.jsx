import React, { useState, useEffect } from 'react'
import Multiselect from 'multiselect-react-dropdown';
import axios from 'axios';

const AllJobStatus = () => {

  const [alljobs, setalljobs] = useState([]);
  const [tdata, settdata] = useState([]);

  const fetchjobs = () => {
    axios.post('/getjobforshortlistcv')
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          setalljobs(response.data.data)
        }
      }, (error) => {

      })
  }

  const fetchtdata = (job) => {
    axios.post('/getjobstatuses', { job: job })
      .then((response) => {
        settdata(response.data)
        // console.log(response.data.data)
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
    fetchjobs()
  }, []);


  return (
    <div className='container-fluid'>
      <div className="mt-5">
        <p className="h3 w-100 text-center">Job Status</p>
        <div className="cor-3">
          <Multiselect options={alljobs} displayValue="Title" id="validationDefault01" selectionLimit={1} onSelect={jobselect} onRemove={jobremove} />
        </div>
        {/* <p className="w-100 text-center">Click to update Record</p> */}
        <div className="table-responsive my-5 rounded-3" style={{ height: '300px', overflow: 'auto' }}>
          <table className="table table-secondary table-hover">
            <thead style={{ position: 'sticky', top: 0 }}>
              <tr>
                <th>Users</th>
                <th>Sent Requests</th>
                <th>Recive Acceptences</th>
                <th>Schedule Calls</th>
                <th>Send CDA</th>
                <th>Recieve CDA</th>
                <th>Recieve CV</th>
                <th>Short List CV</th>
                <th>Submit CV</th>
                <th>Client Acceptances</th>
                <th>Job Offered</th>
                <th>Job Accepted</th>
              </tr>
            </thead>
            <tbody>
              {tdata.map((item, index) => (
                <tr key={index}>
                  <td>{item.user.UserName}</td>
                  <td>{item.alldata[0].length}</td>
                  <td>{item.alldata[1].length}</td>
                  <td>{item.alldata[2].length}</td>
                  <td>{item.alldata[3].length}</td>
                  <td>{item.alldata[4].length}</td>
                  <td>{item.alldata[5].length}</td>
                  <td>{item.alldata[6].length}</td>
                  <td>{item.alldata[7].length}</td>
                  <td>{item.alldata[8].length}</td>
                  <td>{item.alldata[9].length}</td>
                  <td>{item.alldata[10].length}</td>
                </tr>
              ))}
              <tr>
                <td>Total</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AllJobStatus