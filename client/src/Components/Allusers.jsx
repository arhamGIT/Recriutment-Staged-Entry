import React,{useState, useEffect} from 'react'
import axios from 'axios';

const Allusers = () => {

  const [tdata, settdata] = useState([]);

  const fetchtdata = () => {
    axios.post('/getusers')
      .then((response) => {
        if (response.data.status == 200) {
          //  console.log(response.data.data)
          settdata(response.data.data)
        }
      }, (error) => {

      })
  }


  const handlesearch = (e) => {
    const searchTerm = e.target.value;
    // console.log(searchTerm)
    const result = tdata.filter((item) => item.UserName.toLowerCase().includes(searchTerm))
    if (searchTerm.length > 0) {
        settdata(result)
    } else {
        fetchtdata();
    }
}




  useEffect(() => {
    fetchtdata()
  }, []);


  return (
    <div className='container-fluid'>
      <div className="mt-5">
        <p className="h3 w-100 text-center">Users</p>
        <div className="cor-3">
          <input type="text" className="form-control w-25 mx-auto text-center" placeholder="Search User Name" onChange={e=>handlesearch(e)}/>
        </div>
        {/* <p className="w-100 text-center">Click to update Record</p> */}
        <div className="table-responsive my-5 rounded-3" style={{ height: '300px', overflow: 'auto'}}>
          <table className="table table-secondary table-hover">
            <thead className="" style={{position:'sticky', top:0}}>
              <tr>
                <th>User Name</th>
                <th>User Type</th>
                <th>Country</th>
                <th>State</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              {tdata.map((item, index) => (
                <tr key={index}>
                  <td>{item.UserName}</td>
                  <td>{item.UserType}</td>
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

export default Allusers