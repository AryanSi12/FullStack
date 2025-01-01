import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";

const SubscribedChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userDetails } = useSelector((state) => state.user);
  
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7000/api/v1/users/getChannels/${userDetails.id}`,
          { withCredentials: true }
        );
        if (response.data.data.length > 0) setChannels(response.data.data);
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (channels.length === 0)
    return (
      <p className="text-gray-400 text-xl font-semibold min-h-screen flex items-center justify-center">
        No subscribed channels found
      </p>
    );

  return (
    <div className="flex flex-col items-center w-full h-auto bg-slate-950 p-5 min-h-screen">
      <div className="w-4/5 max-w-5xl bg-slate-900 text-white shadow-lg rounded-xl overflow-hidden">
        <div className="mt-8 px-6 pb-6">
          <h2 className="text-xl font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">
            Subscribed Channels
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <div
                key={channel._id}
                className="flex items-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all cursor-pointer"
                onClick={() => navigate(`/account/${channel.channelDetails.username}`)}
              >
                <img
                  src={channel.channelDetails.avatar || '/default-avatar.png'}
                  alt={channel.name}
                  className="w-16 h-16 object-cover rounded-full"
                />
                <div className="ml-4">
                  <h3 className="text-lg font-medium">
                    {channel.channelDetails.username}
                  </h3>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribedChannels;
