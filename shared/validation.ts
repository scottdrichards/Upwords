export const validateUsername = (username:string)=>{
    if (username.length === 0) return "Username must have at least one character";
    return true;
}

export const validatePassword = (password:string)=>{
  if (password.length <= 3) return "Password must be greater than 3 characters";
    return true;
}