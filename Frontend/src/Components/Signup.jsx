import React, { useState, useEffect } from "react";
import { Link , useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { setUserDetails } from "../Redux/userSlice";
import axios from 'axios'
function SignUp() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { userDetails, isLoggedIn } = useSelector((state) => state.user);
  console.log(userDetails);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isCaptchaReady, setIsCaptchaReady] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);  
  const [avatar, setAvatar] = useState(null); // State to hold avatar image
  const [coverImage, setCoverImage] = useState(null); // State to hold cover image
  
  // Initialize react-hook-form
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const manageLogin = async (data) => {
    try {
      console.log("Form data submitted:", data);
  
      // Ensure reCAPTCHA token is present
      if (!captchaToken) {
        console.error("Please complete the reCAPTCHA challenge.");
        return;
      }
  
      // Prepare form data for backend
      const formData = new FormData();
      formData.append("fullname", data.fullName);
      formData.append("username", data.userName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      if (avatar) formData.append("avatar", avatar); // Avatar file
      if (coverImage) formData.append("coverImage", coverImage); // Cover image file
      formData.append("captchaToken", captchaToken);
  
      // API call to register user
      const response = await axios.post(
        'http://localhost:7000/api/v1/users/register',
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Required for FormData
          },
        },
      );
  
      // Access response data
      const responseData = response.data; 
      console.log("User registered successfully:", responseData);
  
      // Update Redux store with user details and tokens
      dispatch(
        setUserDetails({
          userDetails: {
            id : responseData.data._id,
            fullname: data.fullName,
            username: data.userName,
            email: data.email,
            avatar: responseData.data?.avatar || null, 
            coverImage: responseData.data?.coverImage || null,
          },
          token: responseData.data.token,
          refreshToken: responseData.data.refreshToken,
        })
      );
      console.log(responseData.data.token);
      const loginData={
        username : data.userName,
        password : data.password
      }
      const responselogin = await axios.post('http://localhost:7000/api/v1/users/login',loginData,{
        withCredentials : true,
      })
      navigate("/")
    } catch (error) {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        console.error("Error in registration:", error.response.data.message || error.response.data);
      } else {
        // Something else caused the error
        console.error("An error occurred during registration:", error.message);
      }
    }
  };
  
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordConfirmVisibility = () => {
    setShowPasswordConfirm(!showPasswordConfirm);
  };

  const onChange = (token) => {
    console.log("reCAPTCHA token:", token);
    setCaptchaToken(token);
  };

  useEffect(() => {
    const handleLoad = () => {
      setIsCaptchaReady(true);
    };

    window.onload = handleLoad;
    return () => {
      window.onload = null;
    };
  }, []);

  const validatePasswordMatch = (value) => {
    const password = watch('password');
    return value === password || 'Passwords do not match';
  };

  return (
    <section className="min-h-screen overflow-hidden">
      <div className="h-screen w-full flex items-stretch text-white">
        <div
          className="lg:flex w-1/2 hidden bg-gray-500 bg-no-repeat bg-cover relative items-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80")',
          }}
        >
          <div className="absolute bg-black opacity-60 inset-0 z-0"></div>
          <div className="w-full px-24 z-10 text-left">
            <h1 className="text-4xl font-bold">Welcome to Our Service</h1>
            <p className="text-2xl my-4">Join us and enjoy exclusive features.</p>
          </div>
        </div>

        {/*right section*/}
        <div
          className="lg:w-1/2 w-full flex items-center justify-center text-center px-4 lg:px-16"
          style={{ backgroundColor: "#161616" }}
        >
          <div className="w-full py-6 z-20">
            <h1 className="my-6 text-3xl font-bold">Sign Up</h1>
            <p className="text-center text-md text-white-600 mt-2">Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline" title="Sign In">Sign in here</Link></p>
            
            <p className="text-gray-100">or use your email account:</p>

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit(manageLogin)} className="sm:w-2/3 w-full px-4 lg:px-0 mx-auto">
              <div className="pb-2 pt-4">
                {/* Full Name */}
                <input
                  type="text"
                  placeholder="Full Name"
                  className="px-4 py-2 block mb-3 w-full p-4 text-mb rounded-lg bg-black"
                  {...register("fullName", 
                    { required: "Full name is required"
                  })}
                />
                {errors.fullName && <p className="text-red-500">{errors.fullName.message}</p>}

                {/*Username */}
                  <input
                  type="text"
                  placeholder="User Name"
                  className="px-4 py-2 block mb-3 w-full p-4 text-mb rounded-lg bg-black"
                  {...register("userName", 
                    { required: "User name is required"
                  })}
                />
                {errors.userName && <p className="text-red-500">{errors.userName.message}</p>}

                {/* Email */}
                <input
                  type="email"
                  placeholder="Email"
                  className="px-4 py-2 block mb-3 w-full p-4 text-mb rounded-lg bg-black"
                  {...register("email", {
                    required: "Email is required",
                    pattern:{
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}

                {/* Password */}
                <div className="relative mb-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="px-4 py-2 block mb-3 w-full p-4 text-mb rounded-lg bg-black"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters long",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-4"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="relative mb-3">
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="px-4 py-2 block mb-3 w-full p-4 text-mb rounded-lg bg-black"
                    {...register("confirmPassword", {
                      required: "Confirm password is required",
                      validate: validatePasswordMatch,
                    })}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordConfirmVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-4"
                  >
                    {showPasswordConfirm ? "Hide" : "Show"}
                  </button>
                  {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                {/* Avatar Upload */}
                <div className="mb-3">
                  <label className="block text-gray-300 mb-1" htmlFor="avatar">Avatar Image</label>
                  <input
                    type="file"
                    id="avatar"
                    className="block w-full p-4 bg-black text-white rounded-lg"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files[0])}
                  />
                  {avatar && <p className="text-gray-400 text-sm">{avatar.name}</p>}
                </div>

                {/* Cover Image Upload */}
                <div className="mb-3">
                  <label className="block text-gray-300 mb-1" htmlFor="coverImage">Cover Image</label>
                  <input
                    type="file"
                    id="coverImage"
                    className="block w-full p-4 bg-black text-white rounded-lg"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files[0])}
                  />
                  {coverImage && <p className="text-gray-400 text-sm">{coverImage.name}</p>}
                </div>

                {/* reCAPTCHA */}
                <div className="pb-4 pt-3 flex items-center justify-center">
                  <ReCAPTCHA sitekey="6LfZ2lIqAAAAACwrrNDbFJ9VFyzV2jQ8Z604HZEj" onChange={onChange} />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-500 rounded-lg text-lg hover:bg-blue-600 transition-all duration-300"
                  //disabled={!isCaptchaReady || !captchaToken}
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SignUp;
