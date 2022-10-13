import React from 'react'
import Nav from './Nav'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { io } from "socket.io-client";

const Main = () => {
  // const [socket, setsocket] = React.useState()
  const navigate = useNavigate()
  const token = sessionStorage.getItem('token')
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  axios.interceptors.response.use(function (response) {
    if (response.status === 203) {
      navigate('/')
      sessionStorage.clear()
      return
    }
    return response;
  });


  var socket = '';

  if (sessionStorage.getItem("user") !== null) {
    socket = io("ws://localhost:4000")
    socket.on('connected', () => {
      console.log("Socket Connected");
      socket.emit("Join ID",JSON.parse(sessionStorage.getItem("user")),(response)=>{
        console.log(response);
      })
    })
  }

  const disconnectSocket = () => {
    if(socket){
      socket.disconnect()
    }
  }
  React.useEffect(() => {
    if (sessionStorage.getItem("user") == null) {
      navigate('/')
    } else {
      
    }
  })
  const element = <div><Nav disconnectSocket={disconnectSocket} />
    <Outlet /></div>


  return (
    <div>
      {sessionStorage.getItem('user') == null ? "Please Login First" : element}
    </div>
  )
}

export default Main