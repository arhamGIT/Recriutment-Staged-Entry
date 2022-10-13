import React,{useState, useEffect} from 'react'
import axios from 'axios';

const CurrentlyWorking = () => {

  const [tdata, settdata] = useState([]);

  const fetchtdata = () => {
    axios.post('/getloggedin')
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          settdata(response.data.data)
        }
      }, (error) => {

      })
  }




  useEffect(() => {
    fetchtdata()
  }, []);


  return (
    <div className='container-fluid'>
      <div className="mt-5">
        <p className="h3 w-100 text-center">Logged In Users</p>
        <div className="table-responsive my-5 rounded-3" style={{ height: '300px', overflow: 'auto'}}>
          <table className="table table-secondary table-hover">
            <thead className="" style={{position:'sticky', top:0}}>
              <tr>
                <th>User Name</th>
                <th>LogIn Time</th>
              </tr>
            </thead>
            <tbody>
              {tdata.map((item, index) => (
                <tr key={index}>
                  <td>{item.UserName}</td>
                  <td>{new Date(parseInt(item.LoginTime)).toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CurrentlyWorking