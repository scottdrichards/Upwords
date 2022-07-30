// /api/user endpoint

// /newUser
export interface NewUser{
  'userID':string,
  'email':string,
  'password':string
}

// /login
export interface Login{
  'type':'get'
  'userID':string,
  'password':string
}
