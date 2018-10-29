function UserMediaClass() {
  navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  )
}
UserMediaClass.prototype.getMedia = function(constraints) {
  let obj = constraints || { video: false, audio: true }
  return new Promise((resolve, reject) => {
    navigator.getUserMedia(obj, (stream) => {
      this.stream = stream
      resolve(stream)
      console.log('stream connected')
    }, (err) => {
      reject()
      console.error('stream not connected', err)
    })
  })
}

const UserMedia = new UserMediaClass()

export {
  UserMedia,
  UserMediaClass
}
