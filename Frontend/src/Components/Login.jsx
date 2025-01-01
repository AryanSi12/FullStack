import React, { useState } from "react";
//import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link,useNavigate  } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../Redux/userSlice";
import axios from 'axios'
function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {register , handleSubmit}=useForm()
    const handleSuccess = (response) => {
      console.log('Login Success:', response);
    };
  
    const handleFailure = (response) => {
      console.log('Login Failed:', response);
    };
  
    const manageLogin = async (data)=>{
        console.log(data);
        try{
          const response = await axios.post('http://localhost:7000/api/v1/users/login',data,{
            withCredentials : true,
          })
          console.log(response);
          dispatch(
            setUserDetails({
              userDetails: {
                id : response.data.data.user._id,
                fullname: response.data.data.user.fullname,
                username: response.data.data.user.username,
                email: response.data.data.user.email,
                avatar: response.data.data.user?.avatar || null, 
                coverImage: response.data.data.user?.coverImage || null,
              },
              token: response.data.data.user.token,
              refreshToken: response.data.data.user.refreshToken,
            })
          );
          
          
          navigate("/")
        }
        catch (error) {
          if (error.response) {
            // Server responded with a status code outside the 2xx range
            console.error("Error in registration:", error.response.data.message || error.response.data);
          } else {
            // Something else caused the error
            console.error("An error occurred during registration:", error.message);
          }
        }
      }
  return (
    <div className="min-h-screen flex items-stretch text-white">
      <div
        className="lg:flex w-1/2 hidden bg-gray-500 bg-no-repeat bg-cover relative items-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80")',
        }}
      >
        <div className="absolute bg-black opacity-60 inset-0 z-0"></div>
        <div className="w-full px-24 z-10">
          <h1 className="text-4xl font-bold">
          Welcome to Our Service
          </h1>
          <p className="text-2xl my-4">
          Join us and enjoy exclusive features.
          </p>
        </div>
      </div>
      <div
  className="lg:w-1/2 w-full flex items-center justify-center text-center md:px-16 px-0 relative"
  style={{ backgroundColor: "#161616" }}
>
  <div
    className="absolute lg:hidden inset-0 bg-gray-500 bg-no-repeat bg-cover"
    style={{
      backgroundImage:
        'url("https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80")',
    }}
  >
    <div className="absolute inset-0 bg-black opacity-60"></div>
  </div>
  <div className="relative w-full py-8 px-4 z-20">
    <h1 className="text-3xl font-bold text-white mb-4">
      LOG IN
    </h1>
    <p className="text-gray-300 mb-4">Don't have an account? <Link to="/signup" className="text-indigo-500 hover:text-indigo-700">
    Sign Up
  </Link></p>
    <div className="flex justify-center space-x-4 mb-4">
    <div className="flex justify-center space-x-4 mb-4">
    <GoogleOAuthProvider clientId="338609381858-le8eh97favfvec6qb5ajatffc140l7h5.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleFailure}
                render={(renderProps) => (
                  <button
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled}
                    className="bg-white text-black p-3 w-full h-12 flex items-center justify-center rounded-lg hover:bg-gray-200"
                  >
                    <i className="fab fa-google mr-2"></i> Sign in with Google
                  </button>
                )}
              />
              </GoogleOAuthProvider>
            </div>
              
    </div>
    <p className="text-gray-300 mb-4">or use your email account:</p>
    <form onSubmit={handleSubmit(manageLogin)} className="flex flex-col items-center space-y-6">
        <div className="relative w-full max-w-md">
        <input
        type="email"
        placeholder="Email"
        className="px-4 py-4 w-full bg-black text-gray-200 "
        {...register("email", {
            required: true,
            validate: {
              matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
              "Email address must be a valid address",
            }
          })}
        />
        </div>
        <div className="relative w-full max-w-md">
            <input
            type="password"
            placeholder="Password"
            className="px-4 py-4 w-full bg-black text-gray-200 "
            {...register("password", {
                required: true,
              })}
            />
            <div className="ml-72 mt-2">   
                <a href="#" className="text-gray-400 transform  text-sm hover:underline">Forgot your password?</a>
              </div>
        </div>
            <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-700 text-white rounded-full w-96 text-lg">
             Log In
            </button>
    </form>
  </div>
</div>
</div>
  );
}

export default Login;