class PeerService {
  // constructor() {
  //     if (!this.peer){
  //         this.peer = new RTCPeerConnection({
  //             iceServers: [
  //                 {
  //                     urls: [
  //                         'stun:stun.l.google.com:19302',
  //                         'stun:global.stun.twilio.com:3478'
  //                     ]
  //                 }
  //             ]
  //         })
  //     }
  // }

  constructor() {
    this.createNewPeer();
  }

  createNewPeer() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });
  }

  resetPeer() {
    if (this.peer) {
      this.peer.close(); // Always close the previous connection
      this.peer = null;
    }
    this.createNewPeer(); // Reinitialize
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(
        new RTCSessionDescription(ans)
      );
      return ans;
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }
  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
}

const peer = new PeerService();
export default peer;