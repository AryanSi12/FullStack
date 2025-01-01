import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        const response = await axios.get("http://localhost:7000/api/v1/likes/get-liked-v", {
          withCredentials: true,
        });
        console.log(response);
        console.log(response.data.data);
        if(response.data.data.length > 0) setVideos(response.data.data);
      } catch (error) {
        console.error("Error fetching liked videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideos();
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen text-white">Loading...</div>;
  if (videos.length === 0) return <p className="text-gray-400 text-xl font-semibold min-h-screen flex items-center justify-center">
  No liked videos found 
</p>;

  return (
    <div className="flex flex-col items-center w-full h-auto bg-slate-950 p-5 min-h-screen">
      <div className="w-full max-w-7xl bg-slate-900 text-white shadow-2xl rounded-xl overflow-hidden">
        <div className="mt-8 px-8 pb-10">
          <h2 className="text-2xl font-bold text-gray-100 border-b border-gray-700 pb-3 mb-6 text-center">
            Liked Videos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="rounded-lg shadow-lg bg-slate-800 hover:bg-slate-700 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/video/${video.id}`)}
              > 
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-52 object-cover rounded-t-lg"
                  />
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-sm px-2 py-0.5 rounded">
                    {formatDuration(video.duration)}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold truncate mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-400">{video.owner?.username || "Unknown"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LikedVideos;
