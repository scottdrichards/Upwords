import React from "react";

type CredentialProps = {
    onChange:(field:{[name:string]:string})=>void,
    onSubmit:()=>void,
    error?:string,
}

const CredentialTemplate = (props:CredentialProps)=>{
    const onChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const {name, value} = e.target;
        props.onChange({[name]:value});        
    };

    const onSubmit = (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        props.onSubmit();
    }

    return (
        <div className="credential-wrapper">
            <form onSubmit = {onSubmit}>
            <label>
                <p>Username</p>
                <input type="text" name="username" onChange={onChange}
                placeholder="Dumbledore@hogwarts.edu"/>
            </label>
            <label>
                <p>Password</p>
                <input type="password" name="password" onChange={onChange}
                placeholder="password"/>
            </label>
            <div>
                <button type="submit">Submit</button>
            </div>
            </form>            
        </div>
    )
}
export default CredentialTemplate;