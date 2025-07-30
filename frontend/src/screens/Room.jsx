
import React from 'react'
import { useSocket } from '../context/AppContext'
import { useEffect } from 'react'
import { useCallback } from 'react'
import { useState } from 'react'
import ReactPlayer from 'react-player'
import peer from '../service/peer.js'
import './style.css'
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,

} from 'react-icons/fa'
import{
  IoShare,
  IoCall,
} from 'react-icons/io5'
import { MdCallEnd } from "react-icons/md";
import { useNavigate } from 'react-router-dom'


const Room = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const navigate = useNavigate()
    //e
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    //e


    const handleUserJoined = useCallback(({ email, id }) => {
      console.log(`Email ${email} joined room`);
      setRemoteSocketId(id);
    }, []);

    const handleCallUser = useCallback(async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        
        video: true,
      });

      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
      setMyStream(stream);
    }, [remoteSocketId, socket]);

    const handleIncommingCall = useCallback(
      async ({ from, offer }) => {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);
        console.log(`Incoming Call`, from, offer);
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans });
      },
      [socket]
    );

    const sendStreams = useCallback(() => {
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    }, [myStream]);

    const handleCallAccepted = useCallback(
      ({ from, ans }) => {
        peer.setLocalDescription(ans);
        console.log("Call Accepted!");
        sendStreams();
      },
      [sendStreams]
    );

    const handleNegoNeeded = useCallback(async () => {
      const offer = await peer.getOffer();
      socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    useEffect(() => {
      peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
      return () => {
        peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
      };
    }, [handleNegoNeeded]);

    const handleNegoNeedIncomming = useCallback(
      async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit("peer:nego:done", { to: from, ans });
      },
      [socket]
    );

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
      await peer.setLocalDescription(ans);
    }, []);

    const handleCallEnded = ()=>{
      
      myStream?.getTracks().forEach((track) => track.stop());
      remoteStream?.getTracks().forEach((track) => track.stop());
      setMyStream(null);
      setRemoteStream(null);
      
      navigate("/");
      
    }

    useEffect(() => {
      peer.peer.addEventListener("track", async (ev) => {
        const remoteStream = ev.streams;
        console.log("GOT TRACKS!!");
        setRemoteStream(remoteStream[0]);
      });
    }, []);

    useEffect(() => {
      socket.on("user:joined", handleUserJoined);
      socket.on("incomming:call", handleIncommingCall);
      socket.on("call:accepted", handleCallAccepted);
      socket.on("peer:nego:needed", handleNegoNeedIncomming);
      socket.on("peer:nego:final", handleNegoNeedFinal);
      
      
      return () => {
        socket.off("user:joined", handleUserJoined);
        socket.off("incomming:call", handleIncommingCall);
        socket.off("call:accepted", handleCallAccepted);
        socket.off("peer:nego:needed", handleNegoNeedIncomming);
        socket.off("peer:nego:final", handleNegoNeedFinal);
        
      };
    }, [
      socket,
      handleUserJoined,
      handleIncommingCall,
      handleCallAccepted,
      handleNegoNeedIncomming,
      handleNegoNeedFinal,
    ]);

    useEffect(() => {
      return () => {
        peer.resetPeer(); // Close the old connection and reset the object
      };
    }, []);

    return (
      // <div className="h-screen w-screen flex flex-col bg-gray-900 text-white">
      //   <div className="p-4 bg-gray-800 flex justify-between items-center">
      //     <h1 className="text-2xl font-bold">Room Page</h1>
      //     <div className="space-x-4">
      //       {myStream && (
      //         <button
      //           onClick={sendStreams}
      //           className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition"
      //         >
      //           Send Stream
      //         </button>
      //       )}
      //       {/*  */}
      //       {myStream && (
      //         <>
      //           <button
      //             onClick={() => {
      //               const enabled = !audioEnabled;
      //               myStream
      //                 .getAudioTracks()
      //                 .forEach((track) => (track.enabled = enabled));
      //               setAudioEnabled(enabled);
      //             }}
      //             className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded transition"
      //           >
      //             {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
      //           </button>

      //           <button
      //             onClick={() => {
      //               const enabled = !videoEnabled;
      //               myStream
      //                 .getVideoTracks()
      //                 .forEach((track) => (track.enabled = enabled));
      //               setVideoEnabled(enabled);
      //             }}
      //             className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded transition"
      //           >
      //             {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
      //           </button>
      //         </>
      //       )}
      //       {myStream && !isScreenSharing && (
      //         <button
      //           onClick={async () => {
      //             try {
      //               const screenStream =
      //                 await navigator.mediaDevices.getDisplayMedia({
      //                   video: true,
      //                 });
      //               const screenTrack = screenStream.getVideoTracks()[0];

      //               const sender = peer.peer
      //                 .getSenders()
      //                 .find((s) => s.track.kind === "video");
      //               if (sender) {
      //                 sender.replaceTrack(screenTrack);
      //               }

      //               screenTrack.onended = () => {
      //                 const originalTrack = myStream.getVideoTracks()[0];
      //                 sender.replaceTrack(originalTrack);
      //                 setIsScreenSharing(false);
      //               };

      //               setIsScreenSharing(true);
      //             } catch (err) {
      //               console.error("Error sharing screen:", err);
      //             }
      //           }}
      //           className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
      //         >
      //           {<IoShare />}
      //         </button>
      //       )}
      //       {myStream && (
      //         <button
      //           onClick={() => {
      //             myStream.getTracks().forEach((track) => track.stop());
      //             remoteStream?.getTracks().forEach((track) => track.stop());
      //             setMyStream(null);
      //             setRemoteStream(null);
      //             navigate('/')
      //           }}
      //           className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
      //         >
      //           {<MdCallEnd/>}
      //         </button>
      //       )}

      //       {/*  */}

      //       {remoteSocketId && (
      //         <button
      //           onClick={handleCallUser}
      //           className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded transition"
      //         >
      //           {<IoCall />}
      //         </button>
      //       )}
      //     </div>
      //   </div>

      //   <div className="flex-1 flex overflow-hidden">
      //     {myStream && (
      //       <div className="flex-1 relative group border-r border-gray-700">
      //         <div className="absolute top-2 left-2 bg-black bg-opacity-50 px-2 py-1 text-xs rounded">
      //           My Stream
      //         </div>
      //         <ReactPlayer
      //           playing
      //           url={myStream}
      //           width="100%"
      //           height="100%"
      //           className="!h-full !w-full object-cover"
      //         />
      //       </div>
      //     )}

      //     {remoteStream && (
      //       <div className="flex-1 relative group">
      //         <div className="absolute top-2 left-2 bg-black bg-opacity-50 px-2 py-1 text-xs rounded">
      //           Remote Stream
      //         </div>
      //         <ReactPlayer
      //           playing
      //           url={remoteStream}
      //           width="100%"
      //           height="100%"
      //           className="!h-full !w-full object-cover"
      //         />
      //       </div>
      //     )}
      //   </div>
      // </div>
      <div className="h-[calc(100vh-80px)] w-screen flex flex-col bg-white text-black relative">
        {/* Remote stream takes full screen */}
        {remoteStream && (
          <div className="flex-1 relative">
            <div className='absolute inset-0'>
              <ReactPlayer
                playing
                url={remoteStream}
                width="100%"
                height="100%"
                className="!h-full !w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* My stream as a small circular preview in bottom-right */}
        {myStream && (
          <div className="absolute bottom-28 right-6 w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 shadow-lg z-20">
            <ReactPlayer
              playing
              url={myStream}
              width="100%"
              height="100%"
              className="object-cover !h-full !w-full"
            />
          </div>
        )}

        {/* Controls at bottom center */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-30">
          {myStream && (
            <>
              <button
                onClick={sendStreams}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition cursor-pointer"
              >
                Send Stream
              </button>

              {/* Toggle Audio */}
              <button
                onClick={() => {
                  const enabled = !audioEnabled;
                  myStream
                    .getAudioTracks()
                    .forEach((track) => (track.enabled = enabled));
                  setAudioEnabled(enabled);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-black p-3 rounded-full shadow cursor-pointer"
              >
                {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </button>

              {/* Toggle Video */}
              <button
                onClick={() => {
                  const enabled = !videoEnabled;
                  myStream
                    .getVideoTracks()
                    .forEach((track) => (track.enabled = enabled));
                  setVideoEnabled(enabled);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-black p-3 rounded-full shadow cursor-pointer"
              >
                {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
              </button>

              {/* Share Screen */}
              {!isScreenSharing && (
                <button
                  onClick={async () => {
                    try {
                      const screenStream =
                        await navigator.mediaDevices.getDisplayMedia({
                          video: true,
                        });
                      const screenTrack = screenStream.getVideoTracks()[0];
                      const sender = peer.peer
                        .getSenders()
                        .find((s) => s.track.kind === "video");
                      if (sender) sender.replaceTrack(screenTrack);
                      screenTrack.onended = () => {
                        const originalTrack = myStream.getVideoTracks()[0];
                        sender.replaceTrack(originalTrack);
                        setIsScreenSharing(false);
                      };
                      setIsScreenSharing(true);
                    } catch (err) {
                      console.error("Error sharing screen:", err);
                    }
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-black p-3 rounded-full shadow cursor-pointer"
                >
                  <IoShare />
                </button>
              )}

              {/* End Call */}
              <button
                onClick={() => handleCallEnded()}
                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow cursor-pointer"
              >
                <MdCallEnd />
              </button>
            </>
          )}

          {/* Call User Button */}
          {remoteSocketId && !myStream && (
            <button
              onClick={handleCallUser}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow cursor-pointer"
            >
              <IoCall />
            </button>
          )}
        </div>
      </div>
    );
}

export default Room
