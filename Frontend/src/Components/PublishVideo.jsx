import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const PublishVideo = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // State for loading
  const navigate = useNavigate()
  const handlePublish = async (e) => {
    e.preventDefault();

    if (!title || !description || !videoFile || !thumbnail) {
      alert("Please fill out all fields!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", videoFile);
    formData.append("thumbnail", thumbnail);

    setIsLoading(true); // Set loading state to true

    try {
      const response = await axios.post(
        "http://localhost:7000/api/v1/videos/video",
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );
      navigate("/")
      alert("Video Publihed Successfully")
    } catch (error) {
      console.error("Error publishing video:", error);
      navigate("/")
      alert("Failed to publish video.");
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  if (isLoading) {
    // Loading screen while publishing
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="loader border-t-4 border-b-4 border-blue-500 w-16 h-16 rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-semibold">Publishing your video, please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-lg bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Publish Your Video (max img size : 10 Mb and Video Size : 100 Mb)</h1>
        <form onSubmit={handlePublish} className="space-y-4">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">
              Video Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring focus:ring-blue-500"
              placeholder="Enter video title"
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring focus:ring-blue-500"
              placeholder="Enter video description"
              rows="4"
            ></textarea>
          </div>

          {/* Video File Input */}
          <div>
            <label htmlFor="videoFile" className="block text-sm font-medium text-gray-300">
              Video File
            </label>
            <input
              type="file"
              id="videoFile"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="w-full mt-1 p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring focus:ring-blue-500"
            />
          </div>

          {/* Thumbnail Input */}
          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-300">
              Thumbnail
            </label>
            <input
              type="file"
              id="thumbnail"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="w-full mt-1 p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
          >
            Publish Video
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublishVideo;
