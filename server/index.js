const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const connection = require('./db')
const nodemailer = require('nodemailer')
const fileupload = require('express-fileupload')
const path = require('path')
const fs = require('fs')
const generateToken = require('./config/generateToken')
const { protect } = require('./middlewares/auth')
const webSocketServer = require('websocket').server;
const http = require('http')



const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(fileupload())
app.use(protect)

// declare react files in build as static
app.use(express.static(path.join(__dirname, "build")));

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "build/index.html"));
});



//login data

app.post('/loginuser', (req, res) => {
    const formdata = req.body.formdata
    const FETCH_QUERY = "SELECT * FROM users WHERE UserEmail = ? AND UserPass = ?"
    const LOG_QUERY = "SELECT * FROM loggedin WHERE userID = ?"
    const TOKEN_QUERY = "UPDATE users SET token = ? WHERE UserEmail=? AND UserPass=?"
    connection.query(FETCH_QUERY, [formdata.id, formdata.pass], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.length == 0) {
                res.send({ status: 300 })
            } else {
                // connection.query(LOG_QUERY, [response[0].UserID], (err1, response1) => {
                //     if (err1) console.log(err1)
                //     else {
                //         if (response1.length > 0) {
                //             // console.log(response1)
                //             res.send({ status: 303, id: response1[0].LoggedInID })
                //         } else {
                            const token = generateToken(response[0].UserID)
                            const LOGGEDIN_QUERY = `INSERT INTO loggedin(LoggedIn,LoginTime,userID,UserName) VALUES ('yes',?,?,?)`
                            connection.query(LOGGEDIN_QUERY, [Date.parse(new Date()), response[0].UserID, response[0].UserName], (err1, response1) => {
                                if (err1) console.log(err1)
                                else {
                                    connection.query(TOKEN_QUERY, [token, formdata.id, formdata.pass], (err2, response2) => {
                                        if (err2) console.log(err2);
                                        else {
                                            res.send({ status: 200, data: response[0], token: token })
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            // }
        // }
    })
// })

// will be implemented on demand

// app.post('/requestlogout', (req, res) => {
//     const LOGGEDIN_QUERY = `DELETE FROM loggedin WHERE userID = ?`
//     connection.query(LOGGEDIN_QUERY, [req.body.UserID], (err1, response1) => {
//         if (err1) console.log(err1)
//         else res.send({ status: 200 })
//     })
// })

app.post('/saveattendence', (req, res) => {
    const NEXT = `SELECT * FROM attendence WHERE LoginTime = ? AND UserID = ?`
    const SAVE_QUERY = "INSERT INTO attendence(LoginTime,LogoutTime,UserID,UserName) VALUES (?,?,?,?)"

    connection.query(NEXT, [req.body.lin, req.body.user.UserID], (err, response) => {

        if (err) console.log(err)
        else {
            if (response.length > 0) {
                res.send({ status: 303 })
            } else {
                connection.query(SAVE_QUERY, [req.body.lin, req.body.lout, req.body.user.UserID, req.body.user.UserName], (err, response) => {
                    if (err) console.log(err)
                    else {
                        const LOGGEDIN_QUERY = `DELETE FROM loggedin WHERE userID = ?`
                        connection.query(LOGGEDIN_QUERY, [req.body.user.UserID], (err1, response1) => {
                            if (err1) console.log(err1)
                            else res.send({ status: 200 })
                        })

                    }
                })
            }
        }

    })
})

//User Data

app.post('/getusers', (req, res) => {
    const FETCH_QUERY = "SELECT * FROM users ORDER BY UserID DESC"
    connection.query(FETCH_QUERY, (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/saveuser', (req, res) => {
    const datacoming = req.body.data;
    const CHECK_QUERY = `SELECT * FROM users WHERE UserEmail = ?`
    const SAVE_QUERY = `INSERT INTO users(UserName,UserEmail,UserPass,UserType,Country,State,City) VALUES (?,?,?,?,?,?,?)`

    connection.query(CHECK_QUERY, [datacoming.UserEmail], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.length > 0) {
                res.send({ status: 303 })
            } else {
                connection.query(SAVE_QUERY, [datacoming.UserName, datacoming.UserEmail, datacoming.UserPass, datacoming.UserType, datacoming.Country, datacoming.State, datacoming.City], (err, response) => {
                    if (err) console.log(err)
                    else {
                        res.send({ status: 200 })
                    }
                })
            }
        }
    })
})
app.post('/updateuser', (req, res) => {
    const updel = req.body.updel
    const formdata = req.body.formdata
    const UPDATE_QUERY = "UPDATE users SET UserName = ?, UserEmail = ?, UserType = ?, UserPass = ?, Country = ?, City = ?, State = ? WHERE UserID = ?"
    connection.query(UPDATE_QUERY, [formdata.UserName, formdata.UserEmail, formdata.UserType, formdata.UserPass, formdata.Country, formdata.City, formdata.State, formdata.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.affectedRows > 0) {
                res.send({ status: 200 })
            }
        }
    })
})

//Clients Data

app.post('/getclients', (req, res) => {
    const user = req.body.user;
    const FETCH_QUERY = `SELECT * FROM clients ORDER BY ClientID DESC`
    connection.query(FETCH_QUERY, (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/saveclient', (req, res) => {
    const user = req.body.user;
    const datacoming = req.body.data;
    const CHECK_QUERY = `SELECT * FROM clients WHERE ContactEmail = ?`
    const SAVE_QUERY = `INSERT INTO clients(Person,Company,ContactPhone,ContactEmail,Country,State,City,UserID) VALUES (?,?,?,?,?,?,?,?)`

    connection.query(CHECK_QUERY, [datacoming.ContactEmail], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.length > 0) {
                res.send({ status: 303 })
            } else {
                connection.query(SAVE_QUERY, [datacoming.Person, datacoming.Company, datacoming.ContactPhone, datacoming.ContactEmail, datacoming.Country, datacoming.State, datacoming.City, user.UserID], (err, response) => {
                    if (err) console.log(err)
                    else {
                        res.send({ status: 200 })
                    }
                })
            }
        }
    })
})
app.post('/updateclient', (req, res) => {
    const updel = req.body.updel
    const formdata = req.body.formdata
    const UPDATE_QUERY = "UPDATE clients SET Person = ?, Company = ?, ContactPhone = ?, ContactEmail = ?, Country = ?,State=?, City = ? WHERE ClientID = ?"
    connection.query(UPDATE_QUERY, [formdata.Person, formdata.Company, formdata.ContactPhone, formdata.ContactEmail, formdata.Country, formdata.State, formdata.City, formdata.ClientID], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.affectedRows > 0) {
                res.send({ status: 200 })
            }
        }
    })
})

//Job Data

app.post('/getjobs', (req, res) => {
    const user = req.body.user;
    const FETCH_QUERY = "SELECT * FROM jobs LEFT JOIN clients ON jobs.ClientID = clients.ClientID ORDER BY JobID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/savejob', (req, res) => {
    const user = req.body.user;
    const datacoming = req.body.data;
    const CHECK_QUERY = "SELECT * FROM jobs WHERE Title = ? AND ClientID = ?"
    const SAVE_QUERY = "INSERT INTO jobs(Title,Summary,Requirements,JobType,Location,ClientID,Salary,Bonus,Status,CreatedByID) VALUES (?,?,?,?,?,?,?,?,?,?)"

    connection.query(CHECK_QUERY, [datacoming.Title, datacoming.Client.ClientID], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.length > 0) {
                res.send({ status: 303 })
            } else {
                connection.query(SAVE_QUERY, [datacoming.Title, datacoming.Summary, datacoming.Requirements, datacoming.JobType, JSON.stringify(datacoming.Location), datacoming.Client.ClientID,datacoming.Salary,datacoming.Bonus, 'active', user.UserID], (err, response) => {
                    if (err) console.log(err)
                    else {
                        res.send({ status: 200 })
                    }
                })
            }
        }
    })
})
app.post('/updatejobs', (req, res) => {
    const updel = req.body.updel
    const formdata = req.body.formdata
    const UPDATE_QUERY = "UPDATE jobs SET Title = ?, Summary = ?, Requirements = ?,JobType = ?, Location = ?,Salary=?,Bonus=? WHERE JobID = ?"
    connection.query(UPDATE_QUERY, [formdata.Title, formdata.Summary, formdata.Requirements, formdata.JobType, JSON.stringify(formdata.Location),formdata.Salary,formdata.Bonus,formdata.JobID], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.affectedRows > 0) {
                res.send({ status: 200 })
            }
        }
    })
})

//Jobs Assignments
app.post('/getjobsforassignments', (req, res) => {
    const user = req.body.user;
    const FETCH_QUERY = "SELECT * FROM jobs WHERE CreatedByID = ? ORDER BY JobID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})

app.post('/getassignments', (req, res) => {
    const user = req.body.user;
    const FETCH_QUERY = "SELECT * FROM jobassignment LEFT JOIN clients ON jobassignment.ClientID = clients.ClientID LEFT JOIN users ON jobassignment.UserID = users.UserID LEFT JOIN jobs ON jobassignment.JobID = jobs.JobID WHERE jobassignment.CreatedByID = ? ORDER BY JobAssignmentID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/saveassignments', (req, res) => {
    const job = req.body.job;
    const users = req.body.allusers
    const user = req.body.user;

    for (let i = 0; i < users.length; i++) {
        const CHECK_QUERY = "SELECT * FROM jobassignment WHERE JobID = ? AND UserID = ?"
        connection.query(CHECK_QUERY, [job.JobID, users[i].UserID], (err, response) => {
            if (err) { console.log(err) }
            else {
                if (response.length > 0) {
                    if (i == users.length - 1) {
                        res.send({ status: 303 })
                    }
                } else {
                    const SAVE_QUERY = "INSERT INTO jobassignment(JobID,ClientID,UserID,CreatedByID) VALUES (?,?,?,?)"
                    connection.query(SAVE_QUERY, [job.JobID, job.ClientID, users[i].UserID, user.UserID], (err, response) => {
                        if (err) console.log(err)
                        else {
                            if (i == users.length - 1) {
                                res.send({ status: 200 })
                            }
                        }
                    })
                }
            }
        })
    }

})
app.post('/deleteassignment', (req, res) => {
    const updel = req.body.updel
    const DELETE_QUERY = "DELETE FROM jobassignment WHERE JobAssignmentID = '" + updel.JobAssignmentID + "'"
    connection.query(DELETE_QUERY, (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200 })
        }
    })
})

//SendReqiest

app.post('/getuserassignments', (req, res) => {
    const user = req.body.user
    const FETCH_QUERY = `SELECT * FROM jobassignment LEFT JOIN jobs ON jobassignment.JobID = jobs.JobID WHERE jobassignment.UserID = ? AND jobassignment.status = 'active'`
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})

app.post('/getsendrequests', (req, res) => {
    const user = req.body.user
    const FETCH_QUERY = "SELECT * FROM sendrequest LEFT JOIN clients ON sendrequest.ClientID = clients.ClientID LEFT JOIN jobs ON sendrequest.JobID = jobs.JobID WHERE sendrequest.CreatedByID = ? ORDER BY SendRequestID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/savesendrequest', (req, res) => {
    const user = req.body.user
    const datacoming = req.body.data;
    const CHECK_QUERY = `SELECT * FROM sendrequest WHERE WebLink = ? AND JobID = ?`
    const SAVE_QUERY = `INSERT INTO sendrequest(CandidateName,WebLink,JobAssignmentID,JobID,ClientID,CreatedByID) VALUES (?,?,?,?,?,?)`

    // const LOG_CHECK_QUERY = "SELECT * FROM logsendrequest WHERE WebLink = ? AND UserID = ?"

    // const LOG_REQUESTS = "INSERT INTO logsendrequest(CandidateName,WebLink,JobAssignmentID,JobID,UserID,UserName) VALUES (?,?,?,?,?,?)"

    // connection.query(LOG_CHECK_QUERY,[datacoming.WebLink,datacoming.job.UserID],(err, response5)=>{
    //     if(response5.length > 0){

    //     }else{
    //        connection.query(LOG_REQUESTS, [datacoming.CandidateName, datacoming.WebLink, datacoming.job.JobAssignmentID, datacoming.job.JobID, datacoming.job.UserID, datacoming.job.UserName], (err, response4) => {
    //             if (err) console.log(err)
    //         })
    //     }
    // }) 




    connection.query(CHECK_QUERY, [datacoming.WebLink, datacoming.job.JobID], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.length > 0) {
                res.send({ status: 303 })
            } else {
                connection.query(SAVE_QUERY, [datacoming.CandidateName, datacoming.WebLink, datacoming.job.JobAssignmentID, datacoming.job.JobID, datacoming.job.ClientID, user.UserID], (err, response) => {
                    if (err) console.log(err)
                    else {
                        res.send({ status: 200 })
                    }
                })
            }
        }
    })
})

app.post('/updatesendrequest', (req, res) => {
    const user = req.body.user
    const datacoming = req.body.data;
    console.log(datacoming);
    const CHECK_QUERY = `SELECT * FROM recieveacceptance WHERE SendRequestID = ?`
    const UPDATE_QUERY = `UPDATE sendrequest set CandidateName = ?, WebLink = ?, JobAssignmentID =?, JobID=? where SendRequestID=?`;
    
    connection.query(CHECK_QUERY, [datacoming.SendRequestID], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.length > 0) {
                res.send({ status: 303 })
            } else {
                connection.query(UPDATE_QUERY, [datacoming.newdata.CandidateName, datacoming.newdata.WebLink, datacoming.newdata.job.JobAssignmentID, datacoming.newdata.job.JobID, datacoming.SendRequestID], (err, response) => {
                    if (err) console.log(err)
                    else {
                        
                        res.send({ status: 200 })
                    }
                })
            }
        }
    })
})
// Recieve Acceptances

app.post('/getjobspecificrequests', (req, res) => {
    const user = req.body.user
    const job = req.body.job
    const FETCH_QUERY = "SELECT * FROM sendrequest WHERE JobAssignmentID = ? AND CreatedByID = ? AND next != 'yes'"
    connection.query(FETCH_QUERY, [job.JobAssignmentID, user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})

app.post('/getrecieveacceptance', (req, res) => {
    const user = req.body.user
    const FETCH_QUERY = "SELECT * FROM recieveacceptance LEFT JOIN clients ON recieveacceptance.ClientID = clients.ClientID LEFT JOIN jobs ON recieveacceptance.JobID = jobs.JobID WHERE recieveacceptance.CreatedByID = ? ORDER BY RecieveAcceptanceID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/saverecieveacceptance', (req, res) => {
    const datacoming = req.body.data.request;
    const user = req.body.user
    for (let i = 0; i < datacoming.length; i++) {
        const CHECK_QUERY = `SELECT * FROM recieveacceptance WHERE SendRequestID = ?`
        const SAVE_QUERY = "INSERT INTO recieveacceptance(Accepted,SendRequestID,CandidateName,WebLink,JobAssignmentID,JobID,ClientID,CreatedByID) VALUES ('yes',?,?,?,?,?,?,?)"
        const NEXT_QUERY = `UPDATE sendrequest SET next = 'yes' WHERE SendRequestID = ?`

        // const LOG_ACCEPTANCE_QUERY = `INSERT INTO logrecieveacceptance(Accepted,SendRequestID,CandidateName,WebLink,JobAssignmentID,JobID,UserID,UserName) VALUES ('yes',?,?,?,?,?,?,?)`

        connection.query(CHECK_QUERY, [datacoming[i].SendRequestID], (err, response) => {
            if (err) console.log(err)
            else {
                if (response.length > 0) {
                    // res.send({status:303})
                } else {
                    connection.query(SAVE_QUERY, [datacoming[i].SendRequestID, datacoming[i].CandidateName, datacoming[i].WebLink, datacoming[i].JobAssignmentID, datacoming[i].JobID, datacoming[i].ClientID, user.UserID], (err1, response1) => {
                        if (err1) console.log(err1)
                        else {
                            connection.query(NEXT_QUERY, [datacoming[i].SendRequestID], (err2, response2) => {
                                if (err2) console.log(err2)
                                else {
                                    if (i == datacoming.length - 1) {
                                        res.send({ status: 200 })
                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    }

})


//Schedul Call Data

app.post('/getjobspecificacceptances', (req, res) => {
    const user = req.body.user
    const job = req.body.job
    const FETCH_QUERY = "SELECT * FROM recieveacceptance WHERE JobAssignmentID = ? AND CreatedByID = ? AND next != 'yes'"
    connection.query(FETCH_QUERY, [job.JobAssignmentID, user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})

app.post('/getschedulcalls', (req, res) => {
    const user = req.body.user
    const FETCH_QUERY = "SELECT * FROM schedulecall LEFT JOIN clients ON schedulecall.ClientID = clients.ClientID LEFT JOIN jobs ON schedulecall.JobID = jobs.JobID WHERE schedulecall.CreatedByID = ? ORDER BY ScheduleCallID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/saveschedulecall', (req, res) => {
    const users = req.body.data.mailusers
    const user = req.body.user
    const datacoming = req.body.data.request[0];
    const CHECK_QUERY = `SELECT * FROM schedulecall WHERE RecieveAcceptanceID = ?`
    const SAVE_QUERY = `INSERT INTO schedulecall(ScheduleDateAndTime,RecieveAcceptanceID,Accepted,SendRequestID,CandidateName,WebLink,JobAssignmentID,JobID,ClientID,CreatedByID) VALUES (?,?,?,?,?,?,?,?,?,?)`
    const NEXT_QUERY = `UPDATE recieveacceptance SET next = 'yes' WHERE RecieveAcceptanceID = ?`

    var maillist = []

    for (let i = 0; i < users.length; i++) {
        maillist.push(users[i].UserEmail)
    }



    connection.query(CHECK_QUERY, [datacoming.RecieveAcceptanceID], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.length > 0) {
                res.send({ status: 303 })
            } else {
                connection.query(SAVE_QUERY, [req.body.data.ScheduleDateAndTime, datacoming.RecieveAcceptanceID, datacoming.Accepted, datacoming.SendRequestID, datacoming.CandidateName, datacoming.WebLink, datacoming.JobAssignmentID, datacoming.JobID, datacoming.ClientID, user.UserID], (err, response) => {
                    if (err) console.log(err)
                    else {
                        connection.query(NEXT_QUERY, [datacoming.RecieveAcceptanceID], (err, response2) => {
                            if (err) console.log(err)
                            else {
                                res.send({ status: 200 })
                            }
                        })


                    }
                })
            }
        }
    })
})
app.post('/updateschedulecall', (req, res) => {
    const formdata = req.body.formdata
    const UPDATE_QUERY = "UPDATE schedulecall SET ScheduleDateAndTime = '" + formdata.ScheduleDateAndTime + "' WHERE ScheduleCallID = '" + formdata.ScheduleCallID + "'"

    connection.query(UPDATE_QUERY, (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200 })
        }
    })
})


//Send CDA data

app.post('/getjobspecificschedulcalls', (req, res) => {
    const user = req.body.user
    const job = req.body.job
    const FETCH_QUERY = "SELECT * FROM schedulecall WHERE JobAssignmentID = ? AND CreatedByID = ? AND next != 'yes'"
    connection.query(FETCH_QUERY, [job.JobAssignmentID, user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})

app.post('/getsendcda', (req, res) => {
    const user = req.body.user
    const FETCH_QUERY = "SELECT * FROM sendcda LEFT JOIN clients ON sendcda.ClientID = clients.ClientID LEFT JOIN jobs ON sendcda.JobID = jobs.JobID WHERE sendcda.CreatedByID = ? ORDER BY SendCDAID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/savesendcda', (req, res) => {
    const user = req.body.user
    const data = req.body.data
    const datacoming = req.body.data.request[0];
    const CHECK_QUERY = `SELECT * FROM sendcda WHERE ScheduleCallID = ?`
    const SAVE_QUERY = `INSERT INTO sendcda(CandidatePhone,MailingAddress,CurrentSalary,CandidateExperience,CandidateSkills,Education,PersonalTraits,OtherCriterias,LatestCompany,LatestJobTitle,SalaryExpectation,CandidateEmail,ScheduleCallID,ScheduleDateAndTime,RecieveAcceptanceID,Accepted,SendRequestID,CandidateName,WebLink,JobAssignmentID,JobID,ClientID,CreatedByID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const NEXT_QUERY = `UPDATE schedulecall SET next = 'yes' WHERE ScheduleCallID = ?`

    connection.query(CHECK_QUERY, [datacoming.ScheduleCallID], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.length > 0) {
                res.send({ status: 303 })
            } else {
                connection.query(SAVE_QUERY, [data.CandidatePhone, data.MailingAddress, data.CurrentSalary, JSON.stringify(data.CandidateExperience), JSON.stringify(data.CandidateSkills), JSON.stringify(data.Education), data.PersonalTraits, data.OtherCriterias, data.LatestCompany, data.LatestJobTitle, data.SalaryExpectation, data.CandidateEmail, datacoming.ScheduleCallID, datacoming.ScheduleDateAndTime, datacoming.RecieveAcceptanceID, datacoming.Accepted, datacoming.SendRequestID, datacoming.CandidateName, datacoming.WebLink, datacoming.JobAssignmentID, datacoming.JobID, datacoming.ClientID, user.UserID], (err, response) => {
                    if (err) console.log(err)
                    else {
                        connection.query(NEXT_QUERY, [datacoming.ScheduleCallID], (err, response2) => {
                            if (err) console.log(err)
                            else {
                                res.send({ status: 200 })
                            }
                        })


                    }
                })
            }
        }
    })
})
app.post('/updatesendcda', (req, res) => {
    // const updel = req.body.updel
    const formdata = req.body.data
    const UPDATE_QUERY = "UPDATE sendcda SET CandidatePhone=?,MailingAddress=?,CurrentSalary=?,CandidateExperience=?,CandidateSkills=?,Education=?,PersonalTraits=?,OtherCriterias=?,LatestCompany=?,LatestJobTitle=?,SalaryExpectation=?,CandidateEmail=? WHERE SendCDAID = ?"
    connection.query(UPDATE_QUERY, [formdata.CandidatePhone, formdata.MailingAddress, formdata.CurrentSalary, formdata.CandidateExperience, formdata.CandidateSkills, formdata.Education, formdata.PersonalTraits, formdata.OtherCriterias,formdata.LatestCompany,formdata.LatestJobTitle,formdata.SalaryExpectation,formdata.CandidateEmail], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.affectedRows > 0) {
                res.send({ status: 200 })
            }
        }
    })
})

//Reciev CDA Data

app.post('/getjobspecificsendcda', (req, res) => {
    const user = req.body.user
    const job = req.body.job
    const FETCH_QUERY = "SELECT * FROM sendcda WHERE JobAssignmentID = ? AND CreatedByID = ? AND next != 'yes'"
    connection.query(FETCH_QUERY, [job.JobAssignmentID, user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})

app.post('/getrecievecda', (req, res) => {
    const user = req.body.user
    const FETCH_QUERY = "SELECT * FROM recievecda LEFT JOIN clients ON recievecda.ClientID = clients.ClientID LEFT JOIN jobs ON recievecda.JobID = jobs.JobID WHERE recievecda.CreatedByID = ? ORDER BY RecieveCDAID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/saverecievecda', (req, res) => {
    const user = req.body.user
    const datacoming = req.body.data.request;
    const CHECK_QUERY = `SELECT * FROM recievecda WHERE SendCDAID = ?`
    const SAVE_QUERY = `INSERT INTO recievecda(CDARecieved,SendCDAID,LatestCompany,LatestJobTitle,SalaryExpectation,CandidateEmail,ScheduleCallID,ScheduleDateAndTime,RecieveAcceptanceID,Accepted,SendRequestID,CandidateName,WebLink,JobAssignmentID,JobID,ClientID,CreatedByID) VALUES ('yes',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const NEXT_QUERY = `UPDATE sendcda SET next = 'yes' WHERE SendCDAID = ?`

    for (let i = 0; i < datacoming.length; i++) {
        connection.query(CHECK_QUERY, [datacoming[i].SendCDAID], (err, response) => {
            if (err) console.log(err)
            else {
                if (response.length > 0) {
                    // res.send({ status: 303 })
                } else {
                    connection.query(SAVE_QUERY, [datacoming[i].SendCDAID, datacoming[i].LatestCompany, datacoming[i].LatestJobTitle, datacoming[i].SalaryExpectation, datacoming[i].CandidateEmail, datacoming[i].ScheduleCallID, datacoming[i].ScheduleDateAndTime, datacoming[i].RecieveAcceptanceID, datacoming[i].Accepted, datacoming[i].SendRequestID, datacoming[i].CandidateName, datacoming[i].WebLink, datacoming[i].JobAssignmentID, datacoming[i].JobID, datacoming[i].ClientID, user.UserID], (err, response) => {
                        if (err) console.log(err)
                        else {
                            connection.query(NEXT_QUERY, [datacoming[i].SendCDAID], (err, response2) => {
                                if (err) console.log(err)
                                else {
                                    if (i == datacoming.length - 1) {
                                        res.send({ status: 200 })
                                    }
                                }
                            })


                        }
                    })
                }
            }
        })
    }





})


//Reciev CV Data

app.post('/getjobspecificrecievecda', (req, res) => {
    const user = req.body.user
    const job = req.body.job
    const FETCH_QUERY = "SELECT * FROM recievecda LEFT JOIN clients ON recievecda.ClientID = clients.ClientID LEFT JOIN jobs ON recievecda.JobID = jobs.JobID WHERE JobAssignmentID = ? AND recievecda.CreatedByID = ? AND next != 'yes'"
    connection.query(FETCH_QUERY, [job.JobAssignmentID, user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})

app.post('/getrecievecv', (req, res) => {
    const user = req.body.user
    const FETCH_QUERY = "SELECT * FROM recievecv LEFT JOIN clients ON recievecv.ClientID = clients.ClientID LEFT JOIN jobs ON recievecv.JobID = jobs.JobID WHERE recievecv.CreatedByID = ? ORDER BY CVRecieveID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/saverecievecv', (req, res) => {
    const file = req.files.file
    const filename = req.body.filename
    const datacoming = JSON.parse(req.body.request)
    const user = JSON.parse(req.body.user)
    const filepath = '/files/____' + Date.now().toString() + "__" + datacoming.Company + "-" + datacoming.Title + "-" + datacoming.CandidateName + "__" + filename
    // console.log(filepath)
    const CHECK_QUERY = `SELECT * FROM recievecv WHERE RecieveCDAID = ?`
    const SAVE_QUERY = `INSERT INTO recievecv(CVName,RecieveCDAID,CDARecieved,SendCDAID,LatestCompany,LatestJobTitle,SalaryExpectation,CandidateEmail,ScheduleCallID,ScheduleDateAndTime,RecieveAcceptanceID,Accepted,SendRequestID,CandidateName,WebLink,JobAssignmentID,JobID,ClientID,CreatedByID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const NEXT_QUERY = `UPDATE recievecda SET next = 'yes' WHERE RecieveCDAID = ?`

    connection.query(CHECK_QUERY, [datacoming.RecieveCDAID], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.length > 0) {
                res.send({ status: 303 })
            } else {
                connection.query(SAVE_QUERY, [filepath, datacoming.RecieveCDAID, datacoming.CDARecieved, datacoming.SendCDAID, datacoming.LatestCompany, datacoming.LatestJobTitle, datacoming.SalaryExpectation, datacoming.CandidateEmail, datacoming.ScheduleCallID, datacoming.ScheduleDateAndTime, datacoming.RecieveAcceptanceID, datacoming.Accepted, datacoming.SendRequestID, datacoming.CandidateName, datacoming.WebLink, datacoming.JobAssignmentID, datacoming.JobID, datacoming.ClientID, user.UserID], (err, response) => {
                    if (err) console.log(err)
                    else {
                        connection.query(NEXT_QUERY, [datacoming.RecieveCDAID], (err, response2) => {
                            if (err) console.log(err)
                            else {
                                file.mv(__dirname + filepath, (err3) => {
                                    if (err) { console.log(err3) }
                                    else res.send({ status: 200 })
                                })
                            }
                        })


                    }
                })
            }
        }
    })
})
app.post('/downloadcv', (req, res) => {
    const path1 = req.body.path
    // console.log(path.resolve(__dirname+path1))
    // res.sendFile(path.resolve(__dirname + path1))
    // res.attachment(path.resolve(path1))
    // res.send()
    // var file = fs.createReadStream(path.resolve(__dirname+path1));
    // var stat = fs.statSync(path.resolve(__dirname+path1));
    // res.setHeader('Content-Length', stat.size);
    // res.setHeader('Content-Type', 'application/pdf');
    // file.pipe(res);
    // var data = fs.createReadStream(__dirname + path1);
    // res.contentType("application/pdf");
    // res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
    // data.pipe(res)

    // fs.readFile(path.resolve(__dirname + path1), function (err, data) {
    //     if (err) {
    //         console.log(err)
    //         return res.sendStatus(400)
    //     };
    //     res.send({ status: 200, data: data })
    // });

    // res.download(path.resolve(__dirname + path1),(err)=>console.log(err))
    const filePath = path.resolve(__dirname + path1);
    const fileContent = fs.readFileSync(filePath);
    const base64Content = Buffer.from(fileContent).toString('base64');
    res.send({data:base64Content,path:path1});
    // var filestream = fs.createReadStream(filePath);
    // filestream.pipe(res);

    // response.set('Content-disposition', 'attachment; filename=' + fileName);
})


//ShortList CV Data

app.post('/getjobforshortlistcv', (req, res) => {
    const FETCH_QUERY = "SELECT * FROM jobs LEFT JOIN clients ON jobs.ClientID = clients.ClientID WHERE jobs.status = 'active'"
    connection.query(FETCH_QUERY, (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })
})
app.post('/getjobspecificrecievecv', (req, res) => {
    const user = req.body.user
    const job = req.body.job
    const FETCH_QUERY = "SELECT * FROM recievecv WHERE JobID = ? AND next != 'yes'"
    connection.query(FETCH_QUERY, [job.JobID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})

app.post('/getshortlistcv', (req, res) => {
    const user = req.body.user
    const FETCH_QUERY = "SELECT * FROM shortlistcv LEFT JOIN clients ON shortlistcv.ClientID = clients.ClientID LEFT JOIN jobs ON shortlistcv.JobID = jobs.JobID WHERE shortlistcv.CreatedByID = ? ORDER BY CVShortListID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/saveshortlistcv', (req, res) => {
    const user = req.body.user
    const datacoming = req.body.data.request;

    const CHECK_QUERY = `SELECT * FROM shortlistcv WHERE CVRecieveID = ?`
    const SAVE_QUERY = `INSERT INTO shortlistcv(CvShortListed,CVRecieveID,CVName,RecieveCDAID,CDARecieved,SendCDAID,LatestCompany,LatestJobTitle,SalaryExpectation,CandidateEmail,ScheduleCallID,ScheduleDateAndTime,RecieveAcceptanceID,Accepted,SendRequestID,CandidateName,WebLink,JobAssignmentID,JobID,ClientID,CreatedByID) VALUES ('yes',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const NEXT_QUERY = `UPDATE recievecv SET next = 'yes' WHERE CVRecieveID = ?`

    for (let i = 0; i < datacoming.length; i++) {
        connection.query(CHECK_QUERY, [datacoming[i].CVRecieveID], (err, response) => {
            if (err) console.log(err)
            else {
                if (response.length > 0) {

                } else {
                    connection.query(SAVE_QUERY, [datacoming[i].CVRecieveID, datacoming[i].CVName, datacoming[i].RecieveCDAID, datacoming[i].CDARecieved, datacoming[i].SendCDAID, datacoming[i].LatestCompany, datacoming[i].LatestJobTitle, datacoming[i].SalaryExpectation, datacoming[i].CandidateEmail, datacoming[i].ScheduleCallID, datacoming[i].ScheduleDateAndTime, datacoming[i].RecieveAcceptanceID, datacoming[i].Accepted, datacoming[i].SendRequestID, datacoming[i].CandidateName, datacoming[i].WebLink, datacoming[i].JobAssignmentID, datacoming[i].JobID, datacoming[i].ClientID, user.UserID], (err, response) => {
                        if (err) console.log(err)
                        else {
                            connection.query(NEXT_QUERY, [datacoming[i].CVRecieveID], (err, response2) => {
                                if (err) console.log(err)
                                else {
                                    if (i == datacoming.length - 1) {
                                        res.send({ status: 200 })
                                    }
                                }
                            })


                        }
                    })
                }
            }
        })
    }







})


//Submit CV Data

app.post('/getjobspecificshortlistcv', (req, res) => {
    const user = req.body.user
    const job = req.body.job
    const FETCH_QUERY = "SELECT * FROM shortlistcv WHERE JobID = ? AND next != 'yes'"
    connection.query(FETCH_QUERY, [job.JobID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})

app.post('/getsubmitcv', (req, res) => {
    const user = req.body.user
    const FETCH_QUERY = "SELECT * FROM submitcv LEFT JOIN clients ON submitcv.ClientID = clients.ClientID LEFT JOIN jobs ON submitcv.JobID = jobs.JobID WHERE submitcv.CreatedByID = ? ORDER BY SubmitCVID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/savesubmitcv', (req, res) => {
    const user = req.body.user
    const datacoming = req.body.data.request;

    const CHECK_QUERY = `SELECT * FROM submitcv WHERE CVShortListID = ?`
    const SAVE_QUERY = `INSERT INTO submitcv(Submitted,CVShortListID,CvShortListed,CVRecieveID,CVName,RecieveCDAID,CDARecieved,SendCDAID,LatestCompany,LatestJobTitle,SalaryExpectation,CandidateEmail,ScheduleCallID,ScheduleDateAndTime,RecieveAcceptanceID,Accepted,SendRequestID,CandidateName,WebLink,JobAssignmentID,JobID,ClientID,CreatedByID) VALUES ('yes',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const NEXT_QUERY = `UPDATE shortlistcv SET next = 'yes' WHERE CVShortListID = ?`

    for (let i = 0; i < datacoming.length; i++) {
        connection.query(CHECK_QUERY, [datacoming[i].CVShortListID], (err, response) => {
            if (err) console.log(err)
            else {
                if (response.length > 0) {

                } else {
                    connection.query(SAVE_QUERY, [datacoming[i].CVShortListID, datacoming[i].CvShortListed, datacoming[i].CVRecieveID, datacoming[i].CVName, datacoming[i].RecieveCDAID, datacoming[i].CDARecieved, datacoming[i].SendCDAID, datacoming[i].LatestCompany, datacoming[i].LatestJobTitle, datacoming[i].SalaryExpectation, datacoming[i].CandidateEmail, datacoming[i].ScheduleCallID, datacoming[i].ScheduleDateAndTime, datacoming[i].RecieveAcceptanceID, datacoming[i].Accepted, datacoming[i].SendRequestID, datacoming[i].CandidateName, datacoming[i].WebLink, datacoming[i].JobAssignmentID, datacoming[i].JobID, datacoming[i].ClientID, user.UserID], (err, response) => {
                        if (err) console.log(err)
                        else {
                            connection.query(NEXT_QUERY, [datacoming[i].CVShortListID], (err, response2) => {
                                if (err) console.log(err)
                                else {
                                    if (i == datacoming.length - 1) {
                                        res.send({ status: 200 })
                                    }
                                }
                            })


                        }
                    })
                }
            }
        })
    }

})



//AcceptanceByClient Data


app.post('/getjobspecificsubmitcv', (req, res) => {
    const user = req.body.user
    const job = req.body.job
    const FETCH_QUERY = "SELECT * FROM submitcv WHERE JobID = ? AND next != 'yes'"
    connection.query(FETCH_QUERY, [job.JobID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/getacceptancesbyclient', (req, res) => {
    const user = req.body.user
    const FETCH_QUERY = "SELECT * FROM acceptencebyclient LEFT JOIN clients ON acceptencebyclient.ClientID = clients.ClientID LEFT JOIN jobs ON acceptencebyclient.JobID = jobs.JobID WHERE acceptencebyclient.CreatedByID = ? ORDER BY AcceptenceByClientID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/saveacceptancesbyclient', (req, res) => {
    const user = req.body.user
    const datacoming = req.body.data.request;

    const CHECK_QUERY = `SELECT * FROM acceptencebyclient WHERE SubmitCVID = ?`
    const SAVE_QUERY = `INSERT INTO acceptencebyclient(InterviewDate,SubmitCVID,Submitted,CVShortListID,CvShortListed,CVRecieveID,CVName,RecieveCDAID,CDARecieved,SendCDAID,LatestCompany,LatestJobTitle,SalaryExpectation,CandidateEmail,ScheduleCallID,ScheduleDateAndTime,RecieveAcceptanceID,Accepted,SendRequestID,CandidateName,WebLink,JobAssignmentID,JobID,ClientID,CreatedByID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const NEXT_QUERY = `UPDATE submitcv SET next = 'yes' WHERE SubmitCVID = ?`


    connection.query(CHECK_QUERY, [datacoming.SubmitCVID], (err, response) => {
        if (err) console.log(err)
        else {
            if (response.length > 0) {
                res.send({ status: 303 })
            } else {
                connection.query(SAVE_QUERY, [req.body.data.InterviewDate, datacoming.SubmitCVID, datacoming.Submitted, datacoming.CVShortListID, datacoming.CvShortListed, datacoming.CVRecieveID, datacoming.CVName, datacoming.RecieveCDAID, datacoming.CDARecieved, datacoming.SendCDAID, datacoming.LatestCompany, datacoming.LatestJobTitle, datacoming.SalaryExpectation, datacoming.CandidateEmail, datacoming.ScheduleCallID, datacoming.ScheduleDateAndTime, datacoming.RecieveAcceptanceID, datacoming.Accepted, datacoming.SendRequestID, datacoming.CandidateName, datacoming.WebLink, datacoming.JobAssignmentID, datacoming.JobID, datacoming.ClientID, user.UserID], (err, response) => {
                    if (err) console.log(err)
                    else {
                        connection.query(NEXT_QUERY, [datacoming.SubmitCVID], (err, response2) => {
                            if (err) console.log(err)
                            else {
                                res.send({ status: 200 })
                            }
                        })


                    }
                })
            }
        }
    })


})
app.post('/updateacceptancebyclient', (req, res) => {
    const formdata = req.body.formdata
    const UPDATE_QUERY = "UPDATE acceptencebyclient SET InterviewDate = '" + formdata.InterviewDate + "' WHERE AcceptenceByClientID = '" + formdata.AcceptenceByClientID + "'"

    connection.query(UPDATE_QUERY, (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200 })
        }
    })
})




//JobOffered Data


app.post('/getjobspecificacceptancesbyclient', (req, res) => {
    const user = req.body.user
    const job = req.body.job
    const FETCH_QUERY = "SELECT * FROM acceptencebyclient WHERE JobID = ? AND next != 'yes'"
    connection.query(FETCH_QUERY, [job.JobID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/getjoboffered', (req, res) => {
    const user = req.body.user
    const FETCH_QUERY = "SELECT * FROM joboffered LEFT JOIN clients ON joboffered.ClientID = clients.ClientID LEFT JOIN jobs ON joboffered.JobID = jobs.JobID WHERE joboffered.CreatedByID = ? ORDER BY JobOfferedID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/savesavejoboffered', (req, res) => {
    const user = req.body.user
    const datacoming = req.body.data.request;

    const CHECK_QUERY = `SELECT * FROM joboffered WHERE AcceptenceByClientID = ?`
    const SAVE_QUERY = `INSERT INTO joboffered(JobOffered,AcceptenceByClientID,InterviewDate,SubmitCVID,Submitted,CVShortListID,CvShortListed,CVRecieveID,CVName,RecieveCDAID,CDARecieved,SendCDAID,LatestCompany,LatestJobTitle,SalaryExpectation,CandidateEmail,ScheduleCallID,ScheduleDateAndTime,RecieveAcceptanceID,Accepted,SendRequestID,CandidateName,WebLink,JobAssignmentID,JobID,ClientID,CreatedByID) VALUES ('yes',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const NEXT_QUERY = `UPDATE acceptencebyclient SET next = 'yes' WHERE AcceptenceByClientID = ?`

    for (let i = 0; i < datacoming.length; i++) {
        connection.query(CHECK_QUERY, [datacoming[i].AcceptenceByClientID], (err, response) => {
            if (err) console.log(err)
            else {
                if (response.length > 0) {
                    //    res.send({status:303})
                } else {
                    connection.query(SAVE_QUERY, [datacoming[i].AcceptenceByClientID, datacoming[i].InterviewDate, datacoming[i].SubmitCVID, datacoming[i].Submitted, datacoming[i].CVShortListID, datacoming[i].CvShortListed, datacoming[i].CVRecieveID, datacoming[i].CVName, datacoming[i].RecieveCDAID, datacoming[i].CDARecieved, datacoming[i].SendCDAID, datacoming[i].LatestCompany, datacoming[i].LatestJobTitle, datacoming[i].SalaryExpectation, datacoming[i].CandidateEmail, datacoming[i].ScheduleCallID, datacoming[i].ScheduleDateAndTime, datacoming[i].RecieveAcceptanceID, datacoming[i].Accepted, datacoming[i].SendRequestID, datacoming[i].CandidateName, datacoming[i].WebLink, datacoming[i].JobAssignmentID, datacoming[i].JobID, datacoming[i].ClientID, user.UserID], (err, response) => {
                        if (err) console.log(err)
                        else {
                            connection.query(NEXT_QUERY, [datacoming[i].AcceptenceByClientID], (err, response2) => {
                                if (err) console.log(err)
                                else {
                                    if (i == datacoming.length - 1) {
                                        res.send({ status: 200 })
                                    }
                                }
                            })


                        }
                    })
                }
            }
        })
    }




})



//JobAccepted Data

app.post('/getjobspecificjoboffered', (req, res) => {
    const user = req.body.user
    const job = req.body.job
    const FETCH_QUERY = "SELECT * FROM joboffered WHERE JobID = ? AND next != 'yes'"
    connection.query(FETCH_QUERY, [job.JobID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/getjobaccepted', (req, res) => {
    const user = req.body.user
    const FETCH_QUERY = "SELECT * FROM jobaccepted LEFT JOIN clients ON jobaccepted.ClientID = clients.ClientID LEFT JOIN jobs ON jobaccepted.JobID = jobs.JobID WHERE jobaccepted.CreatedByID = ? ORDER BY JobAcceptedID DESC"
    connection.query(FETCH_QUERY, [user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })

})
app.post('/savejobaccepted', (req, res) => {
    const user = req.body.user
    const datacoming = req.body.data.request;

    const CHECK_QUERY = `SELECT * FROM jobaccepted WHERE JobOfferedID = ?`
    const SAVE_QUERY = `INSERT INTO jobaccepted(JobAccepted,JobOfferedID,JobOffered,AcceptenceByClientID,InterviewDate,SubmitCVID,Submitted,CVShortListID,CvShortListed,CVRecieveID,CVName,RecieveCDAID,CDARecieved,SendCDAID,LatestCompany,LatestJobTitle,SalaryExpectation,CandidateEmail,ScheduleCallID,ScheduleDateAndTime,RecieveAcceptanceID,Accepted,SendRequestID,CandidateName,WebLink,JobAssignmentID,JobID,ClientID,CreatedByID) VALUES ('yes',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const NEXT_QUERY = `UPDATE joboffered SET next = 'yes' WHERE JobOfferedID = ?`

    for (let i = 0; i < datacoming.length; i++) {
        connection.query(CHECK_QUERY, [datacoming[i].JobOfferedID], (err, response) => {
            if (err) console.log(err)
            else {
                if (response.length > 0) {
                    //    res.send({status:303})
                } else {
                    connection.query(SAVE_QUERY, [datacoming[i].JobOfferedID, datacoming[i].JobOffered, datacoming[i].AcceptenceByClientID, datacoming[i].InterviewDate, datacoming[i].SubmitCVID, datacoming[i].Submitted, datacoming[i].CVShortListID, datacoming[i].CvShortListed, datacoming[i].CVRecieveID, datacoming[i].CVName, datacoming[i].RecieveCDAID, datacoming[i].CDARecieved, datacoming[i].SendCDAID, datacoming[i].LatestCompany, datacoming[i].LatestJobTitle, datacoming[i].SalaryExpectation, datacoming[i].CandidateEmail, datacoming[i].ScheduleCallID, datacoming[i].ScheduleDateAndTime, datacoming[i].RecieveAcceptanceID, datacoming[i].Accepted, datacoming[i].SendRequestID, datacoming[i].CandidateName, datacoming[i].WebLink, datacoming[i].JobAssignmentID, datacoming[i].JobID, datacoming[i].ClientID, user.UserID], (err, response) => {
                        if (err) console.log(err)
                        else {
                            connection.query(NEXT_QUERY, [datacoming[i].JobOfferedID], (err, response2) => {
                                if (err) console.log(err)
                                else {
                                    if (i == datacoming.length - 1) {
                                        res.send({ status: 200 })
                                    }
                                }
                            })


                        }
                    })
                }
            }
        })
    }




})


//Reports

app.post('/getreportsclients', (req, res) => {
    const FETCH_QUERY = "SELECT * FROM clients ORDER BY ClientID DESC"
    connection.query(FETCH_QUERY, (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })
})


//Attendence Data

app.post('/getattendencesbyuser', (req, res) => {
    const GET_QUERY = "SELECT * FROM attendence WHERE UserID = ? ORDER BY AttendenceID DESC";
    connection.query(GET_QUERY, [req.body.user.UserID], (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })
})



app.post('/getloggedin', (req, res) => {
    const GET_LOGGEDIN = `SELECT * FROM loggedin ORDER BY LoggedInID DESC`
    connection.query(GET_LOGGEDIN, (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })
})


// Job Close
app.post('/getjobsforclosing', (req, res) => {
    const GET_QUERY = `SELECT * FROM jobs WHERE status = 'active'`
    connection.query(GET_QUERY, (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })
})

app.post('/closejob', (req, res) => {
    const id = req.body.job.JobID
    const remarks = req.body.remarks
    console.log(id,remarks)
    const JOB_ADD_COLUMN_REMARKS =`ALTER TABLE jobs ADD remarks VARCHAR(255)`
    const JOB_QUERY = `UPDATE jobs SET status = '', remarks = ? WHERE JobID = ?`
    const JOB_ASSIGNMENT_QUERY = `UPDATE jobassignment SET status = '' WHERE JobID = ?`
    const check_column = "SELECT * FROM information_schema.COLUMNS WHERE TABLE_NAME = 'jobs' AND COLUMN_NAME = 'remarks'";
    connection.query(check_column, (err, result) => {
        if (err) console.log(err);
        if (result.length > 0) {
        } else {
        console.log("Column does not exist creating");
        connection.query(JOB_ADD_COLUMN_REMARKS, (err, response) => {
            if (err) console.log(err)
            else console.log(response)
        })
        }
    });
    
    connection.query(JOB_QUERY, [remarks,id], (err, response) => {
        if (err) console.log(err)
        else {
            connection.query(JOB_ASSIGNMENT_QUERY, [id], (err, response) => {
                if (err) console.log(err)
                else {
                    res.send({ status: 200 })
                }
            })
        }
    })
})

app.post('/getallclosedjobs', (req, res) => {
    const GET_QUERY = `SELECT * FROM jobs LEFT JOIN clients ON jobs.ClientID = clients.ClientID WHERE status != 'active'`
    connection.query(GET_QUERY, (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })
})

//Searchjobs Data

app.post('/sjobs', (req, res) => {
    const GET_QUERY = `SELECT * FROM jobs LEFT JOIN clients ON jobs.ClientID = clients.ClientID`
    connection.query(GET_QUERY, (err, response) => {
        if (err) console.log(err)
        else {
            res.send({ status: 200, data: response })
        }
    })
})

app.post('/searchcv', (req, res) => {
    var FETCH_QUERY;
    const data = req.body.data
    if (data.status == "") data.status = "recievecv"

    if (data.job == null) {
        FETCH_QUERY = `SELECT * FROM ` + data.status + ` WHERE CandidateName LIKE concat('%', ?, '%') AND LatestCompany LIKE concat('%', ?, '%')`
        connection.query(FETCH_QUERY, [data.CandidateName, data.LatestCompany], (err, response) => {
            if (err) console.log(err)
            else {
                res.send({ status: 200, data: response })
            }
        })
    } else {
        FETCH_QUERY = `SELECT * FROM ` + data.status + ` WHERE CandidateName LIKE concat('%', ?, '%') AND LatestCompany LIKE concat('%', ?, '%') AND JobID = ?`
        connection.query(FETCH_QUERY, [data.CandidateName, data.LatestCompany, data.job], (err, response) => {
            if (err) console.log(err)
            else {
                res.send({ status: 200, data: response })
            }
        })
    }


})

app.post('/changePassword', (req, res) => {
    const user = req.body.user
    const data = req.body.data

    const GET_USER_QUERY = 'SELECT * FROM users WHERE UserID = ?'
    const UPDATE_QUERY = `UPDATE users SET UserPass = ? WHERE UserID = ?`

    connection.query(GET_USER_QUERY, [user.UserID], (err, response) => {
        if (err) return console.log(err);
        if (response[0].UserPass === data.old) {
            connection.query(UPDATE_QUERY, [data.new, user.UserID], (err1, response1) => {
                if (err1) return console.log(err1);
                else {
                    res.send({ status: 200 })
                }
            })
        } else {
            res.send({ status: 401 })
        }
    })

})

//Reports Data

app.post('/getjobstatuses', (req, res) => {

    const job = req.body.job;
    var data = []
    // console.log(job)
    const USERS_QUERY = "SELECT * FROM users ORDER BY UserID DESC"
    connection.query(USERS_QUERY, (err, response1) => {
        if (err) console.log(err)
        else {
            for (let i = 0; i < response1.length; i++) {
                const GET_DATA_QUERY = `SELECT * FROM sendrequest WHERE JobID ='` + job.JobID + `' AND CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM recieveacceptance WHERE JobID ='`+ job.JobID + `' AND CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM schedulecall WHERE JobID ='`+ job.JobID + `' AND CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM sendcda WHERE JobID ='`+ job.JobID + `' AND CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM recievecda WHERE JobID ='`+ job.JobID + `' AND CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM recievecv WHERE JobID ='`+ job.JobID + `' AND CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM shortlistcv WHERE JobID ='`+ job.JobID + `' AND CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM submitcv WHERE JobID ='`+ job.JobID + `' AND CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM acceptencebyclient WHERE JobID ='`+ job.JobID + `' AND CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM joboffered WHERE JobID ='`+ job.JobID + `' AND CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM jobaccepted WHERE JobID ='`+ job.JobID + `' AND CreatedByID ='` + response1[i].UserID + `';
                `


                connection.query(GET_DATA_QUERY, (err, response2) => {

                    if (err) console.log(err)
                    else {
                        // console.log(response2[0])
                        data.push({ user: response1[i], alldata: response2 })
                        // console.log(response1[i].UserName +":"+response2.length)
                        // console.log(data)
                        if (i == response1.length - 1) {
                            // console.log(data)
                            res.send(data)
                        }
                    }

                })


            }
        }
    })

})

app.post('/getjoblogs', (req, res) => {

    var data = []
    const USERS_QUERY = "SELECT * FROM jobs"
    connection.query(USERS_QUERY, (err, response1) => {
        if (err) console.log(err)
        else {
            for (let i = 0; i < response1.length; i++) {
                const GET_DATA_QUERY = `SELECT * FROM sendrequest WHERE JobID ='` + response1[i].JobID + `';
                SELECT * FROM recieveacceptance WHERE JobID ='`+ response1[i].JobID + `';
                SELECT * FROM schedulecall WHERE JobID ='`+ response1[i].JobID + `';
                SELECT * FROM sendcda WHERE JobID ='`+ response1[i].JobID + `';
                SELECT * FROM recievecda WHERE JobID ='`+ response1[i].JobID + `';
                SELECT * FROM recievecv WHERE JobID ='`+ response1[i].JobID + `';
                SELECT * FROM shortlistcv WHERE JobID ='`+ response1[i].JobID + `';
                SELECT * FROM submitcv WHERE JobID ='`+ response1[i].JobID + `';
                SELECT * FROM acceptencebyclient WHERE JobID ='`+ response1[i].JobID + `';
                SELECT * FROM joboffered WHERE JobID ='`+ response1[i].JobID + `';
                SELECT * FROM jobaccepted WHERE JobID ='`+ response1[i].JobID + `';
                `


                connection.query(GET_DATA_QUERY, (err, response2) => {

                    if (err) console.log(err)
                    else {
                        // console.log(response2[0])
                        data.push({ job: response1[i], alldata: response2 })
                        // console.log(response1[i].UserName +":"+response2.length)
                        // console.log(data)
                        if (i == response1.length - 1) {
                            // console.log(data)
                            res.send(data)
                        }
                    }

                })


            }
        }
    })

})

app.post('/getuserlog', (req, res) => {

    var data = []
    // console.log(job)
    const USERS_QUERY = "SELECT * FROM users ORDER BY UserID DESC"
    connection.query(USERS_QUERY, (err, response1) => {
        if (err) console.log(err)
        else {
            for (let i = 0; i < response1.length; i++) {
                const GET_DATA_QUERY = `SELECT * FROM sendrequest WHERE  CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM recieveacceptance WHERE CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM schedulecall WHERE CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM sendcda WHERE CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM recievecda WHERE CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM recievecv WHERE CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM shortlistcv WHERE CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM submitcv WHERE CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM acceptencebyclient WHERE CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM joboffered WHERE CreatedByID ='` + response1[i].UserID + `';
                SELECT * FROM jobaccepted WHERE CreatedByID ='` + response1[i].UserID + `';
                `


                connection.query(GET_DATA_QUERY, (err, response2) => {

                    if (err) console.log(err)
                    else {
                        // console.log(response2[0])
                        data.push({ user: response1[i], alldata: response2 })
                        // console.log(response1[i].UserName +":"+response2.length)
                        // console.log(data)
                        if (i == response1.length - 1) {
                            // console.log(data)
                            res.send(data)
                        }
                    }

                })


            }
        }
    })

})


const server = app.listen(4000,()=>console.log("running on local host 4000"))
const io = require('socket.io')(server,{
    pingTimeout:60000,
    cors:{
        // origin:"http://localhost:3000"
    }
})
io.on("connection", (socket) => {
    // console.log("Connected to " + socket);
    socket.emit('connected')
    socket.on('Join ID',(arg,callback)=>{
        // console.log(arg);
        callback("Joined SuccessFully")
    })
    socket.on('disconnect', function () {
        console.log('disconnect client event....');  
     });
});
