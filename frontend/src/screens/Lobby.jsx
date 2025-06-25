import React ,{useState} from 'react'
import { useCallback } from 'react';
import { useSocket } from '../context/AppContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Lobby = () => {
    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");
    const navigate = useNavigate()
    const socket = useSocket()


    const handleSubmitForm = useCallback((e)=>{
        e.preventDefault();
        socket.emit('room:join',{email,room})
    },[email,room, socket])

    const handleJoinRoom = useCallback((data) => {
        const {email, room} = data
        navigate(`/room/${room}`)
    },[navigate])

    useEffect(()=>{
        socket.on("room:join", handleJoinRoom);
        return () => {
            socket.off('room:join',handleJoinRoom)
        }
    },[socket,handleJoinRoom])
  return (
    <div className="flex flex-col items-center mt-10 ">
      <h1>Lobby</h1>
      <form
        action=""
        onSubmit={handleSubmitForm}
        className="flex flex-col items-center"
      >
        <div>
          <label htmlFor="email" className="ml-10">
            Email ID
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="m-5 border border-gray-800 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="room">Room Number</label>
          <input
            type="text"
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="m-5 border border-gray-800 rounded-md"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 cursor-pointer">
          Join
        </button>
      </form>
    </div>
  );
}

export default Lobby
