import React from 'react'
import { useState, useEffect } from 'react'

const RejectModal = (status) => {

    const [rdata, setrdata] = useState({
        request:[],
        remarks:''
    });


    // const fetchassignments = () => {
    //     setfl(true)
    //     axios.post('/getuserassignments', { user: user })
    //       .then((response) => {
    //         if (response.data.status == 200) {
    //           //  console.log(response.data.data)
    //           setalljobs(response.data.data)
    //           setfl(false)
    //         }
    //       }, (error) => {
    
    //       })
    //   }
    
    
    //   const fetchusers = () => {
    //     axios.post('/getusers')
    //       .then((response) => {
    //         if (response.data.status == 200) {
    //           //  console.log(response.data.data)
    //           setallusers(response.data.data)
    //         }
    //       }, (error) => {
    
    //       })
    //   }
    
    //   const setvalues = (v) => {
    //     document.getElementById('savebtn').disabled = v
    //     if (v) {
    //       document.getElementById('spinner').style.display = 'inline-block'
    //     } else {
    //       document.getElementById('spinner').style.display = 'none'
    //     }
    //   }
    
    //   const submitform = (e) => {
    //     e.preventDefault()
    //     if (data.request.length == 0 || data.CandidateExperience.length == 0 || data.CandidateSkills.length == 0 || data.Education.length == 0) {
    //       alert("Fill All required Fields")
    //     } else {
    //       // console.log(data)
    //       setvalues(true)
    
    
    //       axios.post('/savesendcda', { data: data, user: user })
    //         .then((reponse) => {
    //           if (reponse.data.status == 200) {
    //             //reseting data
    //             setdata({
    //               request: [], Company: '', LatestJobTitle: '', SalaryExpectation: '', CandidateEmail: '',
    //               CandidatePhone: '', MailingAddress: '', CurrentSalary: '', CandidateExperience: [], CandidateSkills: [],
    //               Education: [], PersonalTraits: '', OtherCriterias: '',
    //             })
    //             setrequests([])
    //             alert('Success')
    //             jobref.current.resetSelectedValues()
    //             candidateref.current.resetSelectedValues()
    //             // showmsg(msgs.smsg)
    //             document.getElementById('form').reset()
    //             fetchtdata()
    //           } else if (reponse.data.status == 303) {
    //             alert('Already Sent')
    //           } else {
    //             alert('Failed due to unknown reasons')
    //           }
    //           setvalues(false)
    //         })
    //     }
    //   }




  return (
    <>
    {/* <!-- Button trigger modal --> */}
<button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
  Reject
</button>

{/* <!-- Modal --> */}
<div className="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div className="modal-dialog" role="document">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div className="modal-body">
        ...
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" className="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>
      
    </>
  )
}

export default RejectModal