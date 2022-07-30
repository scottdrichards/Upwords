import React from 'react';
import './App.css';
import Create from './components/authentication/create';

import config from "./config";
console.log(config);

document.cookie = "userID=bill";

function App() {
  const {domain, port} = config;
  const apiEndpoint = `http://${domain}:${port}/api/`; 

  return (
    <Create apiurl={apiEndpoint} onCreate={()=>{
      alert("created!");
    }}/>
    // <Login setToken={(token:string)=>console.log(token)} apiurl={apiEndpoint}></Login>
  );
}

export default App;
