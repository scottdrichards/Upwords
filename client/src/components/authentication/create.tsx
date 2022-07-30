import React from "react";
import CredentialTemplate from "./credentialTemplate";

export type CreateProps = {
    apiurl:string,
    onCreate: ()=>void
};

type CreateState = {
    userID?:string,
    password?:string,
    email?:string,
    error?:string
}

const Create = (props:CreateProps)=>{
    const [state, updateState] = React.useState<CreateState>({});
    const onSubmit = async()=>{
        const response = await fetch(`${props.apiurl}user/newUser`,{
            headers: {
                // 'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method:'POST',
            body:JSON.stringify(state)
          });
        
        if (!response.ok){
            const errorMessage = await response.text();
            updateState({...state,error:errorMessage});
            return;
        }

        props.onCreate();
    };
    return (<div>
        <CredentialTemplate
            onChange={(field)=>updateState({...state,...field})}
            onSubmit={onSubmit}
            error={"hi"}/>
    </div>)
};

export default Create;