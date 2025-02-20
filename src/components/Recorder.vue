<template>
    <div class="container">
      <h1>WebTransport Recorder</h1>
  
      <label for="url">WebTransport Server URL:</label>
      <input v-model="serverUrl" type="text" placeholder="Enter WebTransport URL" />
  
      <label for="hash">SHA-256 Base64 Hash (Optional):</label>
      <input v-model="base64Hash" type="text" placeholder="Enter Base64 Hash" />
  
      <div class="buttons">
        <button @click="startRecording('userMedia')" :disabled="isRecording">
          Start User Media
        </button>
        <button @click="startRecording('screenShare')" :disabled="isRecording">
          Start Screen Share
        </button>
        <button @click="stopRecording" :disabled="!isRecording">
          Stop & Download
        </button>
      </div>
  
      <video ref="previewVideo" autoplay playsinline></video>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { WTRecorder } from '@mastashake08/wt-recorder';
  
  export default {
    setup() {
      const serverUrl = ref('');
      const base64Hash = ref('');
      const isRecording = ref(false);
      const recorder = ref(null);
      const previewVideo = ref(null);
  
      /**
       * Converts a Base64-encoded SHA-256 digest to a Uint8Array
       * that is WebTransport-compatible.
       * @param {string} base64Digest - The Base64-encoded hash.
       * @returns {Uint8Array}
       */
      const convertBase64Digest = (base64Digest) => {
        try {
          const binaryString = atob(base64Digest);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes;
        } catch (error) {
          console.error('Invalid Base64 format:', error);
          return null;
        }
      };
  
      // Start Recording
      const startRecording = async (type) => {
        if (!serverUrl.value) {
          alert('Please enter a WebTransport server URL.');
          return;
        }
  
        let wtOptions = {};
        if (base64Hash.value) {
          const convertedHash = convertBase64Digest(base64Hash.value);
          if (convertedHash) {
            wtOptions.serverCertificateHashes = [{ algorithm: "sha-256", value: convertedHash }];
          }
        }
  
        try {
          let stream;
          if (type === 'userMedia') {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          } else if (type === 'screenShare') {
            stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          }
  
          previewVideo.value.srcObject = stream;
  
          recorder.value = new WTRecorder(serverUrl.value, stream, wtOptions);
          await recorder.value.start(500);
  
          isRecording.value = true;
        } catch (error) {
          console.error('Error starting recording:', error);
          alert('Failed to start recording.');
        }
      };
  
      // Stop Recording and Download
      const stopRecording = async () => {
        if (!recorder.value) return;
  
        await recorder.value.stop();
        const blob = recorder.value.getRecordedBlob();
  
        // Create Download Link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
  
        isRecording.value = false;
      };
  
      return {
        serverUrl,
        base64Hash,
        isRecording,
        startRecording,
        stopRecording,
        previewVideo,
      };
    },
  };
  </script>
  
  <style scoped>
  .container {
    text-align: center;
    margin: 2rem auto;
    width: 50%;
  }
  
  input {
    width: 100%;
    padding: 8px;
    margin: 10px 0;
  }
  
  .buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 10px 0;
  }
  
  button {
    padding: 10px;
    font-size: 16px;
    cursor: pointer;
  }
  
  video {
    width: 100%;
    max-width: 600px;
    margin-top: 20px;
    border: 1px solid #ddd;
  }
  </style>
  