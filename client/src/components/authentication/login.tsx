import React from 'react';
export type LoginProps = {
  setToken:(token:string)=>void,
  apiurl:string
}
const Login = (props:LoginProps)=>{
    const loginUser = async (credentials:{username:string,password:string})=>{
        const data = await fetch(props.apiurl + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        return await data.json();        
    }

    const [formData, updateFormData] = React.useState({
        username: "",
        password: ""
      });
    
    const handleChange:(event: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
        updateFormData({
          ...formData,
          [e.target.name]: e.target.value.trim()
        });
      };

    const handleSubmit:(event: React.FormEvent<HTMLFormElement>) => void = e => {
        e.preventDefault();
        loginUser(formData)
          .then(res=>props.setToken(res.token))
          .catch(console.log);
    };

    return (
        <div className="login-wrapper">
        <h1>Please Log In</h1>
        <form onSubmit = {handleSubmit}>
          <label>
            <p>Username</p>
            <input type="text" onChange={handleChange}/>
          </label>
          <label>
            <p>Password</p>
            <input type="password" onChange={handleChange}/>
          </label>
          <div>
            <button type="submit">Submit</button>
          </div>
        </form>
        </div>
    )
}

export default Login;