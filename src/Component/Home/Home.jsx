import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login page
    navigate("/login");
    toast.success("Logout Successfull")
  };
  return (
    <div className=" ">
      <div className="w-full    bg-white  ">
        {/* Header Section */}
        <div className="flex items-center justify-between bg-primary px-5 py-4 text-white mb-4  ">
          <h2 className="text-xl font-bold">Skanray Service</h2>
          <button
            onClick={() => setShowModal(true)}
            className="p-2  transition duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="currentColor"
              className="bi bi-box-arrow-right"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
              />
              <path
                fillRule="evenodd"
                d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
              />
            </svg>
          </button>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-80">
              <h3 className="text-xl font-semibold text-center">
                Are you sure you want to logout?
              </h3>
              <div className="mt-4 flex justify-around">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
        {/* User Info */}
        <div className="flex items-center gap-5 px-6 mb-6">
          <img
            src="https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?w=740"
            alt="User"
            className="w-20 h-20 rounded-lg "
          />
          <div>
            <p className="text-lg font-medium text-gray-700">
              Hello Murughesbabu
            </p>
            <p className="text-sm text-gray-500">Skanray Service Engineer</p>
            <p className="text-sm text-gray-500">Date: Aug 16 2024</p>
            {/* <p className="text-sm text-gray-500">Time: 04:15 PM</p> */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 px-4">
          <button
            onClick={() => navigate("/installation")}
            className="flex flex-col gap-4 items-center h-[100px] text-sm    justify-center px-4 text-orange-600 bg-gray-100 rounded-lg shadow hover:bg-orange-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="38"
              height="38"
              fill="currentColor"
              class="bi bi-person-fill-gear"
              viewBox="0 0 16 16"
            >
              <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4m9.886-3.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />
            </svg>
            Installation
          </button>

          <button
            onClick={() => navigate("/complaints")}
            className="flex flex-col gap-4 items-center  h-[100px] text-sm   justify-center px-4 text-orange-600 bg-gray-100 rounded-lg shadow hover:bg-orange-100"
          >
            <svg
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              fill="currentColor"
              y="0px"
              viewBox="0 0 122.88 114.18"
              width="38" // Set width as per your requirement
              height="38"
            >
              <g>
                <path d="M94.78,0.04c-1.89-0.2-3.57,0.29-5.06,1.48c-1.48,1.19-2.3,2.73-2.5,4.63l-1.57,14.89c-0.2,1.9,0.29,3.59,1.48,5.06 c1.19,1.47,2.73,2.3,4.63,2.5l5.62,0.59c-0.55,1.47-1.19,2.85-1.93,4.13c-0.73,1.3-1.88,2.49-3.4,3.58 c2.74-0.41,5.22-1.2,7.47-2.35c2.23-1.14,4.22-2.65,5.92-4.5l6.24,0.66c1.89,0.2,3.57-0.31,5.06-1.48c1.48-1.19,2.3-2.73,2.5-4.63 l1.57-14.89c0.2-1.89-0.29-3.57-1.48-5.06c-1.19-1.48-2.73-2.3-4.63-2.5L94.78,0.04L94.78,0.04L94.78,0.04z M40.19,56.95 c13.2-3.19,27.52-3.67,43.55,0c1.31,0.3,2.67,0.99,3.35,2.04c0.28,0.3,0.54,0.63,0.75,0.99l9.88,13.81l6.05-16.57 c0.58-1.65,1.33-2.73,2.36-3.23l0-0.02l6.75-5.05c0.72-0.54,1.75-0.39,2.29,0.33v0c0.54,0.72,0.39,1.75-0.33,2.29l-3.94,2.95 c0.35,0.14,0.71,0.29,1.07,0.46l4.31-2.82c0.58-0.38,1.37-0.22,1.75,0.37l0,0c0.38,0.58,0.22,1.37-0.36,1.75l-2.21,1.44h5.63 c0.99,0,1.8,0.81,1.8,1.8l0,0c0,0.99-0.81,1.8-1.8,1.8h-4.88c-0.1,0.64-0.6,1.47-0.8,2.04l-10.49,30.23l-0.01,0 c-0.47,1.32-1.39,2.5-2.69,3.26c-2.93,1.72-6.7,0.74-8.42-2.2L84.36,78.1l-4.65,25.56c-1.03,5.67-4.43,10.51-9.84,10.51H54.06 c-5.41,0-8.81-4.84-9.85-10.51l-4.88-26.81L29.09,92.62c-1.72,2.93-5.49,3.92-8.42,2.2c-1.31-0.77-2.22-1.94-2.69-3.26l-0.01,0 L7.48,61.33c-0.2-0.57-0.69-1.4-0.8-2.04H1.8c-0.99,0-1.8-0.81-1.8-1.8l0,0c0-0.99,0.81-1.8,1.8-1.8h5.63l-2.21-1.44 c-0.58-0.38-0.74-1.17-0.36-1.75l0,0c0.38-0.58,1.17-0.74,1.75-0.37l4.31,2.82c0.36-0.16,0.71-0.32,1.07-0.46l-3.94-2.95 C7.33,51,7.18,49.97,7.72,49.26v0c0.54-0.72,1.57-0.87,2.29-0.33l6.75,5.05l0,0.02c1.03,0.5,1.78,1.58,2.36,3.23l6.05,16.57 l9.88-13.81c1.03-1.75,3-2.81,5.05-3.01L40.19,56.95L40.19,56.95z M61.09,10.08c11.17,0,20.22,9.05,20.22,20.22 c0,11.17-9.05,20.22-20.22,20.22c-11.17,0-20.22-9.05-20.22-20.22C40.87,19.14,49.92,10.08,61.09,10.08L61.09,10.08z M100.8,19.72 l3.25,0.52l-0.46,2.87l-3.25-0.52L100.8,19.72L100.8,19.72z M104.3,18.67l-3.24-0.52c0.31-3.99-0.01-6.28,0.63-10.22 c0.23-1.45,1.6-2.44,3.05-2.2c1.45,0.24,2.44,1.6,2.21,3.05C106.3,12.71,105.26,14.79,104.3,18.67L104.3,18.67z" />
              </g>
            </svg>
            Complaints
          </button>

          <button
            onClick={() => navigate("/equipmentdetail")}
            className="flex flex-col  items-center h-[100px] text-sm  justify-center px-4 text-orange-600 bg-gray-100 rounded-lg shadow hover:bg-orange-100"
          >
            <div className="mt-7 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="29"
                height="29"
                fill="currentColor"
                class="bi bi-qr-code-scan"
                viewBox="0 0 16 16"
              >
                <path d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1v2.5a.5.5 0 0 1-1 0zm12 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1-.5-.5M.5 12a.5.5 0 0 1 .5.5V15h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H15v-2.5a.5.5 0 0 1 .5-.5M4 4h1v1H4z" />
                <path d="M7 2H2v5h5zM3 3h3v3H3zm2 8H4v1h1z" />
                <path d="M7 9H2v5h5zm-4 1h3v3H3zm8-6h1v1h-1z" />
                <path d="M9 2h5v5H9zm1 1v3h3V3zM8 8v2h1v1H8v1h2v-2h1v2h1v-1h2v-1h-3V8zm2 2H9V9h1zm4 2h-1v1h-2v1h3zm-4 2v-1H8v1z" />
                <path d="M12 9h2V8h-2z" />
              </svg>
            </div>
            <div className="mb-4">Check Equipment</div>
          </button>

          <button
            onClick={() => navigate("/checkstock")}
            className="flex flex-col gap-4 items-center h-[100px]  text-sm   justify-center px-4 text-orange-600 bg-gray-100 rounded-lg shadow hover:bg-orange-100"
          >
            <div>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 256 256"
                enable-background="new 0 0 256 256"
                fill="currentColor"
                width="35"
                height="35"
                className="text-orange-600" // Change the color here
              >
                <g>
                  <g>
                    <path
                      fill="currentColor"
                      d="M127.1,98.7h23.4V63.6h35.1V40.2h-35.1V5.1h-23.4v35.1H92v23.4h35.1V98.7z M80.2,204.1c-12.9,0-23.3,10.5-23.3,23.4s10.4,23.4,23.3,23.4c12.9,0,23.4-10.5,23.4-23.4S93.1,204.1,80.2,204.1L80.2,204.1L80.2,204.1z M197.3,204.1c-12.9,0-23.3,10.5-23.3,23.4s10.4,23.4,23.3,23.4c12.9,0,23.4-10.5,23.4-23.4S210.2,204.1,197.3,204.1L197.3,204.1z M82.2,166.1l0.4-1.4l10.5-19.1h87.2c8.8,0,16.5-4.8,20.5-12.1L246,51.5l-20.4-11.2h-0.1l-12.9,23.4l-32.3,58.5H98.1l-1.5-3.2L70.4,63.6L59.3,40.2l-11-23.4H10v23.4h23.4l42.1,88.9l-15.8,28.7c-1.9,3.3-2.9,7.2-2.9,11.2c0,12.9,10.5,23.4,23.4,23.4h140.5V169H85.2C83.6,169,82.2,167.7,82.2,166.1L82.2,166.1L82.2,166.1z"
                    />
                  </g>
                </g>
              </svg>
            </div>
            <div className="flex text-nowrap">Check Stock</div>
          </button>

          <button
            onClick={() => navigate("/ownstocks")}
            className="flex flex-col gap-4 items-center h-[100px]  text-sm    justify-center px-4 text-orange-600 bg-gray-100 rounded-lg shadow hover:bg-orange-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
              fill="currentColor"
              class="bi bi-database-fill-check"
              viewBox="0 0 16 16"
            >
              <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514M8 1c-1.573 0-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4s.875 1.755 1.904 2.223C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777C13.125 5.755 14 5.007 14 4s-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1" />
              <path d="M2 7v-.839c.457.432 1.004.751 1.49.972C4.722 7.693 6.318 8 8 8s3.278-.307 4.51-.867c.486-.22 1.033-.54 1.49-.972V7c0 .424-.155.802-.411 1.133a4.51 4.51 0 0 0-4.815 1.843A12 12 0 0 1 8 10c-1.573 0-3.022-.289-4.096-.777C2.875 8.755 2 8.007 2 7m6.257 3.998L8 11c-1.682 0-3.278-.307-4.51-.867-.486-.22-1.033-.54-1.49-.972V10c0 1.007.875 1.755 1.904 2.223C4.978 12.711 6.427 13 8 13h.027a4.55 4.55 0 0 1 .23-2.002m-.002 3L8 14c-1.682 0-3.278-.307-4.51-.867-.486-.22-1.033-.54-1.49-.972V13c0 1.007.875 1.755 1.904 2.223C4.978 15.711 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.5 4.5 0 0 1-1.3-1.905" />
            </svg>
            <div className="flex text-nowrap">Own Stock</div>
          </button>

          <button
            onClick={() => navigate("/customer")}
            className="flex flex-col gap-4 items-center h-[100px] text-sm    justify-center px-4 text-orange-600 bg-gray-100 rounded-lg shadow hover:bg-orange-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
              fill="currentColor"
              class="bi bi-people-fill"
              viewBox="0 0 16 16"
            >
              <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
            </svg>
            Customer
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
