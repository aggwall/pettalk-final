import React, { useRef, useState } from "react";
import axios from 'axios';
import './App.css';

function App() {
  // for OpenAI API key
  const [apiKey, setapiKey] = useState("");

  // for object detection
  const [image, setImage] = useState(null);
  const [semantic, setSemantic] = useState();
  const uploadedImage = useRef(null);
  const imageUploader = useRef(null);

  const handleImageUpload = e => {
    const [file] = e.target.files;
    if (file) {
      const reader = new FileReader();
      const { current } = uploadedImage;
      current.file = file;
      reader.onload = e => {
        current.src = e.target.result;
      };
      reader.readAsDataURL(file);
      const formData = new FormData()
      formData.append('file', e.target.files[0])
      setImage(formData)
    }
  };

  // for STT/Whisper
  const [recorder, setRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      setRecorder(mediaRecorder);

      mediaRecorder.addEventListener("dataavailable", (event) => {
        const formData = new FormData()
        formData.append('file', event.data)
        setAudioBlob(formData);
      });

      mediaRecorder.start();
    });
  };

  const stopRecording = async () => {
    recorder.stop();
  };


  const headers = {
    accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers'
  }

  return (
    <>
      <div className="relative bg-white">
        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
          <div className="px-6 pt-10 pb-24 sm:pb-32 lg:col-span-7 lg:px-0 lg:pt-1 lg:pb-56 xl:col-span-6">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <div className="hidden sm:mt-32 sm:flex lg:mt-16">
                <div className="relative rounded-full py-1 px-3 text-sm leading-6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                  Disclaimer: Conversation is purely fictional and for entertainment purposes.
                </div>
              </div>
              <h1 className="mt-24 text-3xl font-bold tracking-tight text-gray-900 sm:mt-10 sm:text-6xl">
                Meet PetTalk 🐕
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                PetTalk utilizes advanced natural language processing technology to understand and interpret your pet's vocalizations, allowing them to respond in a way that you will understand.
              </p>
              <div className="mt-10 mr-20 flex items-center gap-x-2">
                <input
                  value={apiKey}
                  onChange={(e) => setapiKey(e.target.value)}
                  type="password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Enter Open AI Key"
                />
              </div>
              <div className="flex mt-5 mr-20 items-center ">
              <p className="mt-2 block text-md font-semibold text-gray-900">Upload an image</p>
              </div>
              <div className="flex mt-5 mr-20 items-center ">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={imageUploader}
                  style={{
                    display: "none"
                  }}
                />
                <div
                  className="w-full h-64 rounded-md border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => imageUploader.current.click()}
                >
                  {uploadedImage && <img
                    ref={uploadedImage}
                    style={{
                      width: "60%",
                      height: "100%",
                    }}
                  />}
                </div>
              </div>
              <div className="mt-5 mr-20 flex items-center gap-x-2">
                <button
                  type="button"
                  onClick={async () => {
                    const ig = await fetch("https://aaditya-prasad--od-query.modal.run",
                      {
                        // mode: 'no-cors',
                        method: "POST",
                        headers: headers,
                        body: image
                      }
                    ).then((r) => r.json());
                    console.log("Semantic classification score: ", ig.pred);
                    setSemantic(ig.pred);
                  }}
                  className="w-full rounded-md bg-indigo-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Detect Object
                </button>
              </div>
              <div className="mt-5 mr-20 items-center gap-x-2 flex">
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-full rounded-md bg-indigo-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Start Recording
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-full rounded-md bg-indigo-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Stop Recording
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const data = await fetch("https://aaditya-prasad--stt-stt.modal.run",
                    {
                      method: "POST",
                      headers: headers,
                      body: audioBlob
                    }
                    ).then((r) => r.json());
                    console.log("Speech-to-text output: ", data.text);

                    const sendStr = (semantic.toString()).concat(data.text.text);
                    console.log(sendStr);
                    axios.post("https://aaditya-prasad--tt-tt.modal.run",
                      JSON.parse(JSON.stringify({ "text": sendStr })),
                      {
                        headers,
                        mode: 'no-cors'
                      })
                      .then(response => {
                        console.log("Text-to-speech output file: ", response.data);
                        const audio = new Audio(response.data.url);
                        // console.log("AUDIO", audio);
                        audio.play();
                      })
                      .catch(error => {
                        console.error(error);
                      });
                  }}
                  className="w-full rounded-md bg-indigo-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get Response
                </button>
              </div>
            </div>
          </div>
          <div className="relative lg:col-span-5 lg:-mr-8 xl:absolute xl:inset-0 xl:left-1/2 xl:mr-0">
            <img
              className="aspect-[3/2] w-full bg-gray-50 object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
              src="https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
              alt=""
            />
          </div>
        </div>
      </div>

      {/* <div className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >

        <div>
          <input
            value={apiKey}
            onChange={(e) => setapiKey(e.target.value)}
            className="apiKeyTextField"
            type="password"
            placeholder="OpenAI API key..."
          />
        </div>



        <div
          className="image OD"
          onClick={async () => {
            const ig = await fetch("https://aaditya-prasad--od-query.modal.run",
              {
                // mode: 'no-cors',
                method: "POST",
                headers: headers,
                body: image
              }
            ).then((r) => r.json());
            console.log(ig.pred);
            setSemantic(ig.pred);
          }}
        >
          <button type="button" className="OD button"> detect object </button>
        </div>

        <p> &nbsp;&nbsp; </p>
        <h4 style={{ justifyContent: "center", display: "flex" }}> Record the message you want to say to your pet! </h4>

        <div>
          <button onClick={startRecording}>Start Recording</button>
          <button onClick={stopRecording}>Stop Recording</button>
        </div>

        <div
          className="whisper_blob"
          onClick={async () => {
            const data = await fetch("https://aaditya-prasad--stt-stt.modal.run",
              {
                method: "POST",
                headers: headers,
                body: audioBlob
              }
            ).then((r) => r.json());
            console.log(data.text);
            setwhisperText(data.text);
          }}
        >
          <button type="button" className="generate whisper button"> get STT </button>
        </div>

        <div
          className="send whisper text"
          onClick={async () => {
            const sendStr = (semantic.toString()).concat(whisperText.text);
            console.log(sendStr);
            axios.post("https://aaditya-prasad--tt-tt.modal.run",
              JSON.parse(JSON.stringify({ "text": sendStr })),
              {
                headers,
                mode: 'no-cors'
              })
              .then(response => {
                console.log(response.data);
                setAudioURL(response.data.url);
              })
              .catch(error => {
                console.error(error);
              });
          }}
        >
          <button type="button" className="TTT button"> Get Response </button>
        </div>

        <div>
          <button onClick={handlePlayClick}>Play Audio</button>
        </div>

        <h4 className='disclaimer2'> Again, please remember that this is for entertainment purposes only!</h4>
      </div> */}
    </>
  );
}

export default App;