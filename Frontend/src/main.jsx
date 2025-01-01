import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import Hero from './Components/Hero.jsx'
import { createBrowserRouter } from 'react-router-dom'
import Login from './Components/Login.jsx'
import SignUp from './Components/Signup.jsx'
import VideoDetail from './Components/VideoDetail.jsx'
import AccountDetails from './Components/AccountDetails.jsx'
import PublishVideo from './Components/PublishVideo.jsx'
import MyVideos from './Components/MyVideos.jsx'
import SubscribedChannels from './Components/SubscribedChannels.jsx'
import { PersistGate } from 'redux-persist/integration/react';
import {store , persistor} from './Redux/userStore.jsx'

import MyAccount from './Components/MyAccount.jsx'
import LikedVideos from './Components/LikedVideos.jsx'
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children :[
      {
      path : "/",
      element : <Hero />
      },
      {
      path : "/login",
      element : <Login />
      },
      {
        path : "/signup",
        element : <SignUp />
      },
      {
        path : "/my-account/:username",
        element : <MyAccount />
      },
      {
        path : "/video/:id",
        element : <VideoDetail />
      },
      {
        path : "/account/:username",
        element : <AccountDetails />
      },
      {
        path : "/publish",
        element : <PublishVideo />
      },
      {
        path : "/my-videos",
        element : <MyVideos />
      },
      {
        path : "/subscribed_channels",
        element : <SubscribedChannels />
      },
      {
        path : "/liked-videos",
        element : <LikedVideos />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    <RouterProvider router={router}/>
  </PersistGate>
  </Provider>
  </StrictMode>,
)
