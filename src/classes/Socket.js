import io from 'socket.io-client'
import { UserMedia } from './UserMedia'

function IOClass(){}
IOClass.prototype.connect = function(options) {
  options = options || {}
  let requiredOptions = {
    reconnection: false
  }
  options = {
    ...requiredOptions,
    ...options
  }
  window.socket = io.connect('ws://localhost:7000', options)
  socket.on('connect', () => {
    console.log('connected')
    this.setupEvents()
  })
  socket.on('error', () => {
    console.log('failed to connect')
  })
}
IOClass.prototype.setupEvents = function() {
  socket.on('users', (data) => {
    stores.home.users.replace(data)
  })

  const rtcs = {}
  const offers = {}
  const answers = {}

  socket.on('set ice candidate', (data) => {
    let { candidate, connId } = data
    if (!rtcs[connId]) return;
    rtcs[connId].addIceCandidate(new RTCIceCandidate(candidate))
  })
  socket.on('create offer', (data) => {
    let { answer, connId } = data
    console.log('>>> Creating offer')
    let rtc = new RTCPeerConnection()
    rtc.onnegotiationneeded = () => {
      console.warn('onnegotiationneeded <<>>><><><><<><>')
      rtc.createOffer().then(offerSDP => {
        offer = { socketId: socket.id, sdp: offerSDP }
        return rtc.setLocalDescription(offerSDP)
      }).then(() => {
        socket.emit('offer negotiation', { offer, answer, connId })
      })
    }
    rtc.ontrack = (event) => {
      console.warn('>>>> ONTRACK 2', event.streams[0])
      let el = document.querySelector('.offer')
      el.srcObject = event.streams[0]
      setTimeout(() => {
        el.play()
      }, 1000)
    }
    rtc.onicecandidate = (event) => {
      let candidate = event && event.candidate
      if (!candidate) return;
      socket.emit('set ice candidate', {
        target: answer, candidate, connId
       })
    }
    let offer;
    UserMedia.getMedia().then((stream) => {
      for (let track of stream.getTracks()) {
        rtc.addTrack(track, stream)
      }
      return rtc.createOffer()
    }).then(offerSDP => {
      offer = { socketId: socket.id, sdp: offerSDP }
      return rtc.setLocalDescription(offerSDP)
    }).then(() => {
      rtcs[connId] = rtc
      socket.emit('offer created', { offer, answer, connId })
    })
  })
  // SET ANSWER
  socket.on('set answer', (data) => {
    let { answer, connId } = data
    console.log('set answer', connId)
    let rtc = rtcs[connId]
    UserMedia.getMedia().then((stream) => {
      for (let track of stream.getTracks()) {
        rtc.addTrack(track, stream)
      }
      return rtc.setRemoteDescription(new RTCSessionDescription(data.answer.sdp))
    })
    console.warn('set answer seems to be goody')
  })
  //CREATE ANSWER
  socket.on('create answer', (data) => {
    let { offer, answer, connId } = data
    console.log('>>> Creating answer')
    let rtc = new RTCPeerConnection()
    rtc.onicecandidate = (event) => {
      let candidate = event && event.candidate && event.candidate.candidate
      if (!candidate) return;
      socket.emit('set ice candidate', {
        target: answer, candidate, connId
       })
    }
    rtc.ontrack = (event) => {
      console.warn('>>>> ONTRACK', event.streams[0])
      let el = document.querySelector('.answer')
      el.srcObject = event.streams[0]
      el.onloadedmetadata = () => {
        el.play()
      }
    }
    UserMedia.getMedia().then((stream) => {
      for (let track of stream.getTracks()) {
        rtc.addTrack(track, stream)
      }
      return rtc.setRemoteDescription(new RTCSessionDescription(offer.sdp))
    }).then(() => {
      return rtc.createAnswer()
    }).then((answerSDP) => {
      answer.sdp = answerSDP
      return rtc.setLocalDescription(answerSDP)
    }).then(() => {
      rtcs[connId] = rtc
      socket.emit('answer created', { offer, answer, connId })
      socket.emit('peers connected', { connId, offer, answer })
      console.log('PEERS CONNECTED')
    })
  })

  socket.on('offer negotiation', data => {
    let { answer, offer, connId } = data
    let rtc = rtcs[connId]
    rtc.setRemoteDescription(new RTCSessionDescription(offer.sdp)).then(() => {
      return rtc.createAnswer()
    }).then(answerSDP => {
      answer.sdp = answerSDP
      return rtc.setLocalDescription(answerSDP)
    }).then(() => {
      socket.emit('answer negotiation', { answer, offer, connId })
    })
  })
  socket.on('answer negotiation', data => {
    let { offer, answer, connId } = data
    let rtc = rtcs[connId]
    rtc.setRemoteDescription(new RTCSessionDescription(answer.sdp))
  })
}

const IO = new IOClass()

export {
  IO,
  IOClass
}
